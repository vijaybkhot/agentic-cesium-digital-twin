import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  lineStringIntersectsBbox,
  lineStringIntersectsGeometry,
  lineStringWithinBbox,
} from "./lib/linePolygonIntersection.mjs";

const CACHE_DIR = new URL(".cache/urban-resilience/", import.meta.url);
const OUTPUT_DIR = new URL(
  "../public/data/urban-resilience/experiments/",
  import.meta.url,
);

// Keep these research windows aligned with fetchUrbanResilienceSourceData.mjs.
// They are query extents, not official community or facility boundaries.
const STUDY_AREAS = [
  {
    id: "grand-isle",
    name: "Grand Isle query window",
    bbox: [29.225, -89.99, 29.245, -89.955],
    femaCacheFile: "grand-isle-flood-zones.json",
  },
  {
    id: "port-fourchon",
    name: "Port Fourchon query window",
    bbox: [29.09, -90.22, 29.17, -90.14],
    femaCacheFile: "port-fourchon-flood-zones.json",
  },
];

const OSM_SOURCE = "OpenStreetMap Overpass API LA 1 way geometry (ODbL)";
const FEMA_SOURCE = "FEMA National Flood Hazard Layer MapServer layer 28";
const PROCESSING_METHOD =
  "Original OSM way LineString tested against FEMA NFHL Polygon/MultiPolygon geometry; no road-safety or passability analysis.";

async function readCachedJson(fileName) {
  try {
    return JSON.parse(await readFile(new URL(fileName, CACHE_DIR), "utf8"));
  } catch (error) {
    throw new Error(
      `Unable to read ${fileName}. Run npm run fetch:urban-resilience-data first.`,
      { cause: error },
    );
  }
}

function readWayCoordinates(way) {
  return (
    way.geometry
      ?.filter((point) => Number.isFinite(point?.lon) && Number.isFinite(point?.lat))
      .map((point) => [point.lon, point.lat]) ?? []
  );
}

function normalizeZoneCode(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim().toUpperCase()
    : "Unknown";
}

function createUnknownRelationship(coverageStatus, reason) {
  return {
    femaCoverageStatus: coverageStatus,
    intersectsMappedFloodHazard: null,
    femaZones: [],
    reason,
    interpretation:
      `FEMA relationship: Unknown. ${reason} No conclusion about current flooding, ` +
      "closure, passability, or safe travel conditions can be made.",
  };
}

function evaluateFemaRelationship(coordinates, studyAreas, applicableAreas) {
  const matchingAreas = studyAreas
    .map((area) => ({
      area,
      features: area.femaFeatures.filter((feature) =>
        lineStringIntersectsGeometry(coordinates, feature.geometry),
      ),
    }))
    .filter((match) => match.features.length > 0);
  const matchingFeatures = matchingAreas.flatMap((match) => match.features);
  const femaZones = [
    ...new Set(
      matchingFeatures.map((feature) => normalizeZoneCode(feature.properties?.FLD_ZONE)),
    ),
  ].sort();
  const sourceAreas = [
    ...new Map(
      [...applicableAreas, ...matchingAreas.map((match) => match.area)].map(
        (area) => [area.id, area],
      ),
    ).values(),
  ];

  if (matchingFeatures.length > 0) {
    const fullyCovered = applicableAreas.some(
      (area) => area.femaFeatures.length > 0 && lineStringWithinBbox(coordinates, area.bbox),
    );

    return {
      femaCoverageStatus: fullyCovered ? "available" : "partial",
      intersectsMappedFloodHazard: true,
      femaZones,
      sourceAreas,
      reason:
        `The road centerline intersects mapped FEMA zone(s): ${femaZones.join(", ")} ` +
        `in polygon geometry returned by ${matchingAreas
          .map((match) => match.area.name)
          .join(", ")}.` +
        (fullyCovered
          ? ""
          : " The complete OSM way is not contained within that query window, so FEMA coverage is partial."),
      interpretation:
        "This indicates intersection with mapped FEMA flood-hazard information. " +
        "It does not indicate current flooding, closure, passability, or safe travel conditions.",
    };
  }

  if (applicableAreas.length === 0) {
    return {
      ...createUnknownRelationship(
        "not-queried",
        "This OSM way lies outside the current Grand Isle and Port Fourchon FEMA query windows.",
      ),
      sourceAreas,
    };
  }

  const fullyCoveredArea = applicableAreas.find(
    (area) => area.femaFeatures.length > 0 && lineStringWithinBbox(coordinates, area.bbox),
  );

  if (fullyCoveredArea) {
    return {
      femaCoverageStatus: "available",
      intersectsMappedFloodHazard: false,
      femaZones: [],
      sourceAreas,
      reason: `No intersection was found in the FEMA features returned for the ${fullyCoveredArea.name}.`,
      interpretation:
        "No mapped FEMA flood-hazard intersection was found in the applicable query result. " +
        "This does not establish an absence of flood hazard or safe travel conditions.",
    };
  }

  if (applicableAreas.every((area) => area.femaFeatures.length === 0)) {
    return {
      ...createUnknownRelationship(
        "unavailable",
        "FEMA NFHL features were not available from the current study-area query.",
      ),
      sourceAreas,
    };
  }

  return {
    ...createUnknownRelationship(
      "partial",
      "Only part of this OSM way falls within a query window with available FEMA features.",
    ),
    sourceAreas,
  };
}

function buildExperimentalFeature(way, studyAreas) {
  const coordinates = readWayCoordinates(way);
  const applicableAreas = studyAreas.filter((area) =>
    lineStringIntersectsBbox(coordinates, area.bbox),
  );
  const relationship = evaluateFemaRelationship(
    coordinates,
    studyAreas,
    applicableAreas,
  );

  return {
    type: "Feature",
    properties: {
      id: `experimental-la1-osm-way-${way.id}`,
      feature_kind: "experimental-la1-fema-segment",
      osm_way_id: way.id,
      name: way.tags?.name ?? "LA Highway 1",
      ref: way.tags?.ref ?? "LA 1",
      highway_type: way.tags?.highway ?? "unknown",
      study_areas: applicableAreas.map((area) => area.name),
      fema_source_queries: relationship.sourceAreas.map((area) => area.name),
      fema_coverage_status: relationship.femaCoverageStatus,
      intersects_mapped_flood_hazard: relationship.intersectsMappedFloodHazard,
      fema_zones: relationship.femaZones,
      fema_relationship_reason: relationship.reason,
      interpretation: relationship.interpretation,
      osm_source: OSM_SOURCE,
      fema_source: FEMA_SOURCE,
      processing_method: PROCESSING_METHOD,
    },
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
}

async function main() {
  const [la1Route, ...femaResponses] = await Promise.all([
    readCachedJson("la1-route.json"),
    ...STUDY_AREAS.map((area) => readCachedJson(area.femaCacheFile)),
  ]);
  const studyAreas = STUDY_AREAS.map((area, index) => ({
    ...area,
    femaFeatures: Array.isArray(femaResponses[index]?.features)
      ? femaResponses[index].features
      : [],
  }));
  const usableWays = (la1Route.elements ?? []).filter(
    (way) => readWayCoordinates(way).length >= 2,
  );
  const geoJson = {
    type: "FeatureCollection",
    name: "Experimental original OSM LA-1 ways with FEMA NFHL relationships",
    features: usableWays.map((way) => buildExperimentalFeature(way, studyAreas)),
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(
    new URL("la1_fema_intersections.geojson", OUTPUT_DIR),
    `${JSON.stringify(geoJson, null, 2)}\n`,
  );

  const counts = geoJson.features.reduce((result, feature) => {
    const key = feature.properties.fema_coverage_status;
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});
  const intersections = geoJson.features.filter(
    (feature) => feature.properties.intersects_mapped_flood_hazard === true,
  ).length;

  console.log(`Built ${geoJson.features.length} original OSM LA-1 way features.`);
  console.log(`Mapped FEMA intersections: ${intersections}`);
  console.log("FEMA coverage statuses:", counts);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
