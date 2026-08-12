import { mkdir, readFile, writeFile } from "node:fs/promises";

const CACHE_DIR = new URL(".cache/urban-resilience/", import.meta.url);
const OUTPUT_DIR = new URL("../public/data/urban-resilience/", import.meta.url);

const DATA_SOURCE_LABEL =
  "OpenStreetMap building footprint + FEMA National Flood Hazard Layer (zone-based classification)";

const RISK_CONFIDENCE_NOTE =
  "Research-prototype classification derived from the public FEMA flood zone " +
  "code for this location. It is a zone-based proxy, not a computed hydraulic " +
  "or storm-surge model, and is not an official flood determination. Consult " +
  "FEMA's Flood Map Service Center (msc.fema.gov) or your local floodplain " +
  "administrator for official information.";

const DATA_GAP_CONFIDENCE_NOTE =
  "No FEMA NFHL flood zone polygon was found intersecting this footprint in " +
  "the queried data. This reflects a known coverage gap in the digitized " +
  "flood hazard layer for this location (common in leveed/industrial coastal " +
  "areas), not a confirmed low-risk determination.";

const RECOMMENDED_ACTION_BY_RISK = {
  High: "Research-tier classification: coastal high-hazard (wave action) or " +
    "otherwise high flood-zone exposure. Treat as a prompt to review official " +
    "FEMA flood maps and local hurricane evacuation guidance for this parish.",
  Moderate: "Research-tier classification: within a FEMA Special Flood Hazard " +
    "Area (1% annual chance flood zone). Treat as a prompt to review official " +
    "FEMA flood maps and household hurricane preparedness guidance.",
  Low: "Research-tier classification: outside the mapped FEMA Special Flood " +
    "Hazard Area. Still consult official sources before making decisions.",
  Unknown: "FEMA NFHL coverage was unavailable or undetermined for this " +
    "location. No risk tier is assigned; consult official FEMA and local " +
    "floodplain-management sources before making decisions.",
};

const OCCUPANCY_LABELS = {
  house: "Residential (single-family)",
  detached: "Residential (single-family)",
  residential: "Residential",
  apartments: "Residential (multi-unit)",
  terrace: "Residential (multi-unit)",
  commercial: "Commercial",
  retail: "Commercial (retail)",
  industrial: "Industrial",
  warehouse: "Industrial (warehouse)",
  garage: "Accessory structure (garage)",
  garages: "Accessory structure (garage)",
  shed: "Accessory structure (shed)",
  hangar: "Aviation / hangar structure",
  service: "Service structure",
  hut: "Small utility structure",
  yes: "Unclassified structure (OSM building=yes)",
};

function readGeometryPoints(way) {
  return way.geometry?.filter((point) => point && Number.isFinite(point.lat) && Number.isFinite(point.lon)) ?? [];
}

function wayToRing(way) {
  const points = readGeometryPoints(way);

  if (points.length < 3) {
    return null;
  }

  const ring = points.map((point) => [point.lon, point.lat]);
  const [firstLon, firstLat] = ring[0];
  const [lastLon, lastLat] = ring.at(-1);

  if (firstLon !== lastLon || firstLat !== lastLat) {
    ring.push([firstLon, firstLat]);
  }

  return ring;
}

function ringCentroid(ring) {
  const points = ring.slice(0, -1);
  const total = points.reduce(
    (sum, [lon, lat]) => ({ lon: sum.lon + lon, lat: sum.lat + lat }),
    { lon: 0, lat: 0 },
  );

  return { lon: total.lon / points.length, lat: total.lat / points.length };
}

// Standard ray-casting point-in-polygon test against a closed [lon, lat] ring.
function pointInRing(lon, lat, ring) {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

// Checks only the exterior ring of each polygon (holes are ignored -- an
// accepted simplification for this rural/coastal flood-zone dataset).
function pointInGeoJsonGeometry(lon, lat, geometry) {
  if (!geometry) {
    return false;
  }

  if (geometry.type === "Polygon") {
    return pointInRing(lon, lat, geometry.coordinates[0]);
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) => pointInRing(lon, lat, polygon[0]));
  }

  return false;
}

function classifyFemaZone(zoneCode) {
  const zone = (zoneCode ?? "").trim().toUpperCase();

  if (zone === "V" || zone === "VE") {
    return { riskLevel: "High", sfha: true };
  }

  if (["A", "AE", "AH", "AO", "AR", "A99"].includes(zone)) {
    return { riskLevel: "Moderate", sfha: true };
  }

  if (zone === "D") {
    return { riskLevel: "Unknown", sfha: null, undetermined: true };
  }

  return { riskLevel: "Low", sfha: false };
}

function findFloodZoneForPoint(lon, lat, floodZoneFeatures) {
  return floodZoneFeatures.find((feature) =>
    pointInGeoJsonGeometry(lon, lat, feature.geometry),
  );
}

function estimateBuildingHeightM(tags) {
  const heightTag = Number.parseFloat(tags?.height ?? "");

  if (Number.isFinite(heightTag) && heightTag > 0) {
    return heightTag;
  }

  const levelsTag = Number.parseFloat(tags?.["building:levels"] ?? "");

  if (Number.isFinite(levelsTag) && levelsTag > 0) {
    return levelsTag * 3 + 1;
  }

  return 5;
}

function occupancyTypeLabel(tags) {
  const buildingValue = tags?.building?.toLowerCase();

  return OCCUPANCY_LABELS[buildingValue] ?? "Unclassified structure (OSM building tag)";
}

function addressLabel(tags, centroid) {
  const houseNumber = tags?.["addr:housenumber"];
  const street = tags?.["addr:street"];

  if (houseNumber && street) {
    return `${houseNumber} ${street}`;
  }

  if (street) {
    return `Structure on ${street}`;
  }

  return `Structure near ${centroid.lat.toFixed(4)}, ${centroid.lon.toFixed(4)}`;
}

function buildPropertyFeatures(buildingElements, floodZoneFeatures, idPrefix) {
  const features = [];
  let sequence = 0;

  for (const way of buildingElements) {
    const ring = wayToRing(way);

    if (!ring) {
      continue;
    }

    sequence += 1;
    const propertyId = `${idPrefix}-${String(sequence).padStart(4, "0")}`;
    const centroid = ringCentroid(ring);
    const matchedZone = findFloodZoneForPoint(centroid.lon, centroid.lat, floodZoneFeatures);
    const zoneCode = matchedZone?.properties?.FLD_ZONE ?? null;
    const classification = matchedZone
      ? classifyFemaZone(zoneCode)
      : { riskLevel: "Unknown", sfha: null, dataGap: true };

    features.push({
      type: "Feature",
      properties: {
        property_id: propertyId,
        address_label: addressLabel(way.tags, centroid),
        occupancy_type: occupancyTypeLabel(way.tags),
        flood_zone_code: zoneCode ?? "Unmapped",
        sfha: classification.sfha,
        risk_level: classification.riskLevel,
        recommended_action: RECOMMENDED_ACTION_BY_RISK[classification.riskLevel],
        data_source: DATA_SOURCE_LABEL,
        confidence_note: classification.dataGap
          ? DATA_GAP_CONFIDENCE_NOTE
          : classification.undetermined
            ? "FEMA zone is classified 'D' (undetermined study). Treat as a data gap, not a confirmed low-risk determination."
            : RISK_CONFIDENCE_NOTE,
        building_height_m: estimateBuildingHeightM(way.tags),
        osm_way_id: way.id,
      },
      geometry: {
        type: "Polygon",
        coordinates: [ring],
      },
    });
  }

  return features;
}

function buildFloodZoneFeatures(floodZoneFeatureSets) {
  let sequence = 0;

  return floodZoneFeatureSets.flat().map((feature) => {
    sequence += 1;
    const classification = classifyFemaZone(feature.properties?.FLD_ZONE);

    return {
      type: "Feature",
      properties: {
        id: `flood-zone-${sequence}`,
        flood_zone_code: feature.properties?.FLD_ZONE ?? "Unknown",
        zone_subtype: feature.properties?.ZONE_SUBTY ?? null,
        sfha: classification.sfha,
        risk_level: classification.riskLevel,
        static_bfe_ft: feature.properties?.STATIC_BFE ?? null,
      },
      geometry: feature.geometry,
    };
  });
}

function distanceSquared(a, b) {
  const dLat = a.lat - b.lat;
  const dLon = a.lon - b.lon;

  return dLat * dLat + dLon * dLon;
}

function nearestPoint(anchor, candidatePoints) {
  let best = candidatePoints[0];
  let bestDistance = distanceSquared(anchor, best);

  for (const point of candidatePoints) {
    const distance = distanceSquared(anchor, point);

    if (distance < bestDistance) {
      bestDistance = distance;
      best = point;
    }
  }

  return best;
}

function buildSnappedRoute(anchors, routePoints) {
  return anchors.map((anchor) => {
    const snapped = nearestPoint(anchor, routePoints);
    return { lat: snapped.lat, lon: snapped.lon, height: 0 };
  });
}

async function readCachedJson(fileName) {
  const raw = await readFile(new URL(fileName, CACHE_DIR), "utf8");
  return JSON.parse(raw);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const [
    grandIsleBuildings,
    portFourchonBuildings,
    la1Route,
    grandIsleFlood,
    portFourchonFlood,
  ] = await Promise.all([
    readCachedJson("grand-isle-buildings.json"),
    readCachedJson("port-fourchon-buildings.json"),
    readCachedJson("la1-route.json"),
    readCachedJson("grand-isle-flood-zones.json"),
    readCachedJson("port-fourchon-flood-zones.json"),
  ]);

  const floodZoneFeatures = [...grandIsleFlood.features, ...portFourchonFlood.features];

  const propertyFeatures = [
    ...buildPropertyFeatures(grandIsleBuildings.elements, floodZoneFeatures, "GI"),
    ...buildPropertyFeatures(portFourchonBuildings.elements, floodZoneFeatures, "PF"),
  ];

  const propertiesGeoJson = { type: "FeatureCollection", features: propertyFeatures };
  await writeFile(
    new URL("grand_isle_port_fourchon_properties.geojson", OUTPUT_DIR),
    JSON.stringify(propertiesGeoJson),
  );

  const floodZonesGeoJson = {
    type: "FeatureCollection",
    features: buildFloodZoneFeatures([grandIsleFlood.features, portFourchonFlood.features]),
  };
  await writeFile(
    new URL("grand_isle_port_fourchon_flood_zones.geojson", OUTPUT_DIR),
    JSON.stringify(floodZonesGeoJson),
  );

  const routePoints = la1Route.elements.flatMap((way) => readGeometryPoints(way));

  // Real-world reference anchors (approximate town centers), south to north.
  // The final route snaps each anchor to the nearest actual LA-1 road point
  // fetched from OpenStreetMap -- a real-geometry-anchored simplification,
  // not full turn-by-turn routing.
  const grandIsleAnchor = { lat: 29.2372, lon: -89.9873 };
  const portFourchonAnchor = { lat: 29.1232, lon: -90.1892 };
  const leevilleJunctionAnchor = { lat: 29.2497, lon: -90.2036 };
  const goldenMeadowAnchor = { lat: 29.3808, lon: -90.2662 };
  const gallianoAnchor = { lat: 29.4427, lon: -90.2988 };
  const laroseAnchor = { lat: 29.5661, lon: -90.3757 };

  const grandIsleRoute = buildSnappedRoute(
    [grandIsleAnchor, leevilleJunctionAnchor, goldenMeadowAnchor, gallianoAnchor, laroseAnchor],
    routePoints,
  );
  const portFourchonRoute = buildSnappedRoute(
    [portFourchonAnchor, leevilleJunctionAnchor, goldenMeadowAnchor, gallianoAnchor, laroseAnchor],
    routePoints,
  );

  const responseGeoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: "route-grand-isle-la1",
          name: "Grand Isle to mainland via LA Highway 1",
          feature_kind: "route",
          status: "at-risk",
          description:
            "Real LA-1 road geometry (OpenStreetMap) connecting Grand Isle to " +
            "the mainland at Golden Meadow / Galliano / Larose. Status is an " +
            "illustrative research judgment based on this corridor's well-" +
            "documented storm-surge/overtopping history, not live road-condition data.",
        },
        geometry: {
          type: "LineString",
          coordinates: grandIsleRoute.map((point) => [point.lon, point.lat]),
        },
      },
      {
        type: "Feature",
        properties: {
          id: "route-port-fourchon-la1",
          name: "Port Fourchon to mainland via LA Highway 1",
          feature_kind: "route",
          status: "at-risk",
          description:
            "Real LA-1 road geometry (OpenStreetMap) connecting the Port " +
            "Fourchon facility area to the mainland at Golden Meadow / " +
            "Galliano / Larose. Status is an illustrative research judgment, " +
            "not live road-condition data.",
        },
        geometry: {
          type: "LineString",
          coordinates: portFourchonRoute.map((point) => [point.lon, point.lat]),
        },
      },
      {
        type: "Feature",
        properties: {
          id: "resource-golden-meadow",
          name: "Golden Meadow, LA (regional staging reference)",
          feature_kind: "resource",
          resource_type: "staging-reference",
          description:
            "Approximate town-center reference point along the LA-1 corridor. " +
            "Not an official shelter or emergency destination.",
        },
        geometry: { type: "Point", coordinates: [goldenMeadowAnchor.lon, goldenMeadowAnchor.lat] },
      },
      {
        type: "Feature",
        properties: {
          id: "resource-galliano",
          name: "Galliano, LA (regional staging reference)",
          feature_kind: "resource",
          resource_type: "staging-reference",
          description:
            "Approximate town-center reference point along the LA-1 corridor. " +
            "Not an official shelter or emergency destination.",
        },
        geometry: { type: "Point", coordinates: [gallianoAnchor.lon, gallianoAnchor.lat] },
      },
      {
        type: "Feature",
        properties: {
          id: "resource-larose",
          name: "Larose, LA (regional staging reference)",
          feature_kind: "resource",
          resource_type: "staging-reference",
          description:
            "Approximate town-center reference point along the LA-1 corridor. " +
            "Not an official shelter or emergency destination.",
        },
        geometry: { type: "Point", coordinates: [laroseAnchor.lon, laroseAnchor.lat] },
      },
    ],
  };
  await writeFile(
    new URL("grand_isle_port_fourchon_response.geojson", OUTPUT_DIR),
    JSON.stringify(responseGeoJson),
  );

  const riskCounts = propertyFeatures.reduce((counts, feature) => {
    const level = feature.properties.risk_level;
    counts[level] = (counts[level] ?? 0) + 1;
    return counts;
  }, {});

  console.log(
    `Built ${propertyFeatures.length} properties (${JSON.stringify(riskCounts)}), ` +
      `${floodZonesGeoJson.features.length} flood zone polygons, ` +
      `2 response routes, 3 response resources.`,
  );
  console.log(`Output written to ${OUTPUT_DIR.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
