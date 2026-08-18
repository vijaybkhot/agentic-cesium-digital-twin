import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  pointIntersectsGeometry,
  polygonIntersectsGeometry,
} from "./lib/linePolygonIntersection.mjs";

const CACHE_DIR = new URL(".cache/urban-resilience/", import.meta.url);
const OUTPUT_FILE = new URL(
  "../public/data/urban-resilience/experiments/community_public_safety_facilities.geojson",
  import.meta.url,
);
const EXPECTED_FACILITIES = new Map([
  ["osm-node-367132153", { name: "Grand Isle Fire Department", type: "fire_station", geometry: "Point" }],
  ["osm-node-367133144", { name: "Grand Isle Police Department", type: "police", geometry: "Point" }],
  ["osm-way-924797034", { name: "Town of Grand Isle", type: "townhall", geometry: "Polygon" }],
  ["osm-way-924801527", { name: "Grand Isle High School", type: "school", geometry: "Polygon" }],
]);
const VALID_TYPES = new Set(["fire_station", "police", "townhall", "school"]);
const VALID_CATEGORIES = new Set(["public-safety", "community"]);
const VALID_COVERAGE = new Set(["available", "partial", "unavailable", "not-queried"]);
const PROHIBITED_FIELDS = [
  "operational_status",
  "availability",
  "vulnerability_score",
  "criticality_score",
  "safety_status",
  "emergency_recommendation",
  "recommended_action",
];

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

function geometryIntersectsFema(geometry, femaGeometry) {
  return geometry.type === "Point"
    ? pointIntersectsGeometry(geometry.coordinates, femaGeometry)
    : polygonIntersectsGeometry(geometry.coordinates, femaGeometry);
}

function assertCoordinates(geometry, facilityId) {
  const positions = [];

  function collect(value) {
    if (Array.isArray(value) && value.length >= 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])) {
      positions.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(collect);
    }
  }

  collect(geometry.coordinates);
  assert.ok(positions.length > 0, `${facilityId}: missing coordinates`);
  positions.forEach(([lon, lat]) => {
    assert.ok(lon >= -90.005 && lon <= -89.955, `${facilityId}: longitude outside facility window`);
    assert.ok(lat >= 29.225 && lat <= 29.245, `${facilityId}: latitude outside facility window`);
  });
}

async function main() {
  const [geoJson, grandIsleRaw, portFourchonRaw, grandIsleFema] = await Promise.all([
    readJson(OUTPUT_FILE),
    readJson(new URL("grand-isle-facilities.json", CACHE_DIR)),
    readJson(new URL("port-fourchon-facilities.json", CACHE_DIR)),
    readJson(new URL("grand-isle-facility-flood-zones.json", CACHE_DIR)),
  ]);

  assert.equal(geoJson.type, "FeatureCollection");
  assert.equal(geoJson.features.length, 4, "Expected the four reviewed Grand Isle records");
  assert.equal(portFourchonRaw.elements.length, 0, "Port Fourchon must remain an honest zero-result case");
  assert.match(geoJson.metadata.limitation, /does not prove/i);

  const rawByIdentity = new Map(
    grandIsleRaw.elements.map((element) => [`osm-${element.type}-${element.id}`, element]),
  );
  const seenIds = new Set();

  for (const feature of geoJson.features) {
    const properties = feature.properties;
    const expected = EXPECTED_FACILITIES.get(properties.facility_id);
    const rawElement = rawByIdentity.get(properties.facility_id);

    assert.ok(expected, `${properties.facility_id}: unexpected facility identity`);
    assert.ok(rawElement, `${properties.facility_id}: not found in cached OSM source`);
    assert.ok(!seenIds.has(properties.facility_id), `${properties.facility_id}: duplicate ID`);
    seenIds.add(properties.facility_id);
    assert.equal(feature.geometry.type, expected.geometry);
    assert.equal(properties.osm_element_type, rawElement.type);
    assert.equal(properties.osm_id, rawElement.id);
    assert.equal(properties.facility_type, expected.type);
    assert.equal(properties.name, expected.name);
    assert.equal(properties.osm_classification_key, "amenity");
    assert.equal(properties.osm_classification_value, rawElement.tags.amenity);
    assert.ok(VALID_TYPES.has(properties.facility_type));
    assert.ok(VALID_CATEGORIES.has(properties.facility_category));
    assert.ok(VALID_COVERAGE.has(properties.fema_coverage_status));
    assert.deepEqual(JSON.parse(properties.osm_tags_json), rawElement.tags);
    assert.match(properties.osm_source, /OpenStreetMap.*ODbL/i);
    assert.match(properties.fema_source, /FEMA National Flood Hazard Layer/i);
    assert.match(properties.processing_method, /no operational, safety, or availability analysis/i);
    assertCoordinates(feature.geometry, properties.facility_id);

    PROHIBITED_FIELDS.forEach((field) => {
      assert.ok(!Object.hasOwn(properties, field), `${properties.facility_id}: prohibited field ${field}`);
    });

    const actualIntersection = grandIsleFema.features.some((femaFeature) =>
      geometryIntersectsFema(feature.geometry, femaFeature.geometry),
    );
    assert.equal(
      properties.intersects_mapped_flood_hazard,
      actualIntersection,
      `${properties.facility_id}: FEMA relationship differs from source geometry`,
    );

    if (properties.intersects_mapped_flood_hazard === true) {
      assert.ok(properties.fema_zones.length > 0);
      assert.match(properties.interpretation, /geographic relationship only/i);
    } else if (properties.intersects_mapped_flood_hazard === false) {
      assert.equal(properties.fema_coverage_status, "available");
      assert.match(properties.interpretation, /Evaluated with no mapped intersection/i);
    } else {
      assert.match(properties.interpretation, /Unknown/i);
    }
  }

  const townHallTags = JSON.parse(
    geoJson.features.find((feature) => feature.properties.facility_type === "townhall").properties.osm_tags_json,
  );
  assert.equal(townHallTags.old_name, "United States Coast Guard Station No. 79");
  const school = geoJson.features.find((feature) => feature.properties.facility_type === "school");
  assert.equal(school.properties.osm_classification_value, "school");
  assert.ok(!/evacuation shelter/i.test(JSON.stringify(school.properties)));

  assert.deepEqual(
    new Set(seenIds),
    new Set(EXPECTED_FACILITIES.keys()),
    "All four reviewed OSM identities must be present",
  );

  console.log("Validated 4 community/public-safety facilities and conservative FEMA relationships.");
  console.log("Validated Port Fourchon as zero OSM facility results without inferring absence.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
