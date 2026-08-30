import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { lineStringIntersectsGeometry } from "./lib/linePolygonIntersection.mjs";

const OUTPUT_FILE = new URL(
  "../public/data/urban-resilience/experiments/la1_fema_intersections.geojson",
  import.meta.url,
);
const FLOOD_ZONE_FILE = new URL(
  "../public/data/urban-resilience/grand_isle_port_fourchon_flood_zones.geojson",
  import.meta.url,
);
const VALID_COVERAGE_STATUSES = new Set([
  "available",
  "partial",
  "unavailable",
  "not-queried",
]);
const PROHIBITED_DECISION_FIELDS = new Set([
  "status",
  "risk_level",
  "road_status",
  "flooded",
  "closed",
  "safe",
  "passable",
  "evacuation_status",
  "recommended_action",
]);

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

function validateGeometryUtility() {
  const polygon = {
    type: "Polygon",
    coordinates: [
      [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
      [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]],
    ],
  };

  assert.equal(lineStringIntersectsGeometry([[-1, 5], [2, 5]], polygon), true);
  assert.equal(lineStringIntersectsGeometry([[2, 2], [3, 3]], polygon), true);
  assert.equal(lineStringIntersectsGeometry([[-2, -2], [-1, -1]], polygon), false);
  assert.equal(lineStringIntersectsGeometry([[4.5, 4.5], [5.5, 5.5]], polygon), false);
  assert.equal(
    lineStringIntersectsGeometry([[-1, 5], [11, 5]], {
      type: "MultiPolygon",
      coordinates: [polygon.coordinates],
    }),
    true,
  );
}

function assertValidCoordinates(coordinates, id) {
  assert.ok(Array.isArray(coordinates) && coordinates.length >= 2, `${id}: incomplete LineString`);

  for (const coordinate of coordinates) {
    assert.ok(
      Array.isArray(coordinate) &&
        coordinate.length >= 2 &&
        Number.isFinite(coordinate[0]) &&
        Number.isFinite(coordinate[1]),
      `${id}: invalid coordinate`,
    );
  }
}

async function main() {
  validateGeometryUtility();

  const [geoJson, floodZones] = await Promise.all([
    readJson(OUTPUT_FILE),
    readJson(FLOOD_ZONE_FILE),
  ]);

  assert.equal(geoJson.type, "FeatureCollection");
  assert.equal(geoJson.features.length, 48, "Expected 48 committed OSM LA-1 ways");
  assert.equal(floodZones.type, "FeatureCollection");
  assert.ok(floodZones.features.length > 0, "Expected committed FEMA polygon evidence");

  const seenWayIds = new Set();

  for (const feature of geoJson.features) {
    const properties = feature.properties;
    const id = properties.id;

    assert.equal(feature.type, "Feature");
    assert.equal(feature.geometry.type, "LineString", `${id}: geometry must be LineString`);
    assertValidCoordinates(feature.geometry.coordinates, id);
    assert.equal(properties.feature_kind, "experimental-la1-fema-segment");
    assert.ok(Number.isFinite(properties.osm_way_id), `${id}: missing OSM way ID`);
    assert.equal(id, `experimental-la1-osm-way-${properties.osm_way_id}`);
    assert.ok(!seenWayIds.has(properties.osm_way_id), `${id}: duplicate OSM way ID`);
    seenWayIds.add(properties.osm_way_id);

    assert.ok(typeof properties.name === "string" && properties.name.length > 0);
    assert.equal(properties.ref, "LA 1");
    assert.ok(
      typeof properties.highway_type === "string" && properties.highway_type.length > 0,
      `${id}: missing OSM highway type`,
    );

    assert.ok(VALID_COVERAGE_STATUSES.has(properties.fema_coverage_status));
    assert.ok(Array.isArray(properties.study_areas));
    assert.ok(Array.isArray(properties.fema_source_queries));
    assert.ok(Array.isArray(properties.fema_zones));
    assert.ok(
      typeof properties.fema_relationship_reason === "string" &&
        properties.fema_relationship_reason.length > 0,
      `${id}: missing FEMA relationship reason`,
    );
    assert.match(properties.osm_source, /OpenStreetMap/i);
    assert.match(properties.fema_source, /FEMA National Flood Hazard Layer/i);
    assert.match(properties.processing_method, /LineString.*Polygon/i);
    assert.match(
      properties.interpretation,
      /(does not indicate|does not establish|No conclusion)/i,
      `${id}: interpretation must state its decision limitation`,
    );

    for (const prohibitedField of PROHIBITED_DECISION_FIELDS) {
      assert.ok(
        !Object.hasOwn(properties, prohibitedField),
        `${id}: prohibited decision field ${prohibitedField}`,
      );
    }

    if (properties.intersects_mapped_flood_hazard === true) {
      assert.ok(properties.fema_zones.length > 0, `${id}: mapped intersection needs FEMA zones`);
      assert.ok(
        properties.fema_source_queries.length > 0,
        `${id}: mapped intersection needs a FEMA source query`,
      );
    } else if (properties.intersects_mapped_flood_hazard === false) {
      assert.equal(properties.fema_coverage_status, "available");
      assert.equal(properties.fema_zones.length, 0);
    } else {
      assert.equal(properties.intersects_mapped_flood_hazard, null);
      assert.equal(properties.fema_zones.length, 0);
    }


    const directMatches = (floodZones.features ?? []).filter((femaFeature) =>
      lineStringIntersectsGeometry(feature.geometry.coordinates, femaFeature.geometry),
    );

    if (directMatches.length > 0) {
      const directlyMatchedZones = [
        ...new Set(
          directMatches.map((match) =>
            typeof match.properties?.flood_zone_code === "string"
              ? match.properties.flood_zone_code.trim().toUpperCase()
              : "Unknown",
          ),
        ),
      ].sort();
      assert.equal(
        properties.intersects_mapped_flood_hazard,
        true,
        `${id}: direct intersection with returned FEMA geometry must be retained`,
      );
      assert.deepEqual(
        properties.fema_zones,
        directlyMatchedZones,
        `${id}: FEMA zones must match all directly intersected returned geometry`,
      );
    }
  }

  const portFourchonFeatures = geoJson.features.filter((feature) =>
    feature.properties.study_areas.includes("Port Fourchon query window"),
  );
  assert.ok(portFourchonFeatures.length > 0, "Expected LA-1 ways in the Port Fourchon query window");

  for (const feature of portFourchonFeatures) {
    assert.equal(feature.properties.fema_coverage_status, "unavailable");
    assert.equal(feature.properties.intersects_mapped_flood_hazard, null);
    assert.match(feature.properties.interpretation, /Unknown/i);
  }

  assert.ok(
    geoJson.features.some((feature) => feature.properties.intersects_mapped_flood_hazard === true),
    "Expected at least one mapped FEMA intersection in the available Grand Isle data",
  );
  assert.ok(
    geoJson.features.some(
      (feature) =>
        feature.properties.intersects_mapped_flood_hazard === true &&
        feature.properties.study_areas.length === 0 &&
        feature.properties.fema_source_queries.length > 0,
    ),
    "Expected positive returned-polygon evidence outside an original FEMA query window",
  );
  assert.ok(
    geoJson.features.some((feature) => feature.properties.fema_coverage_status === "not-queried"),
    "Expected the larger LA-1 corridor outside the FEMA query windows to remain not-queried",
  );

  console.log(
    `Validated ${geoJson.features.length} original OSM LA-1 ways with conservative FEMA relationships.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
