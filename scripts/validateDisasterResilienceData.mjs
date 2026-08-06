import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const geoJsonPath = "public/examples/disaster_resilience_properties.geojson";
const scenarioPath =
  "src/domain/disasterResilience/mockDisasterResilienceScenario.ts";

const requiredPropertyFields = [
  "property_id",
  "address_label",
  "occupancy_type",
  "evacuation_zone",
  "nearest_shelter",
  "estimated_flood_depth_ft",
  "risk_level",
  "recommended_action",
  "data_source",
  "confidence_note",
  "building_height_m",
];
const supportedRiskLevels = new Set(["Low", "Moderate", "High"]);
const mockLanguagePattern = /\b(?:fictional|mock|synthetic)\b/i;

function polygonBounds(ring) {
  const longitudes = ring.map(([longitude]) => longitude);
  const latitudes = ring.map(([, latitude]) => latitude);

  return {
    minLongitude: Math.min(...longitudes),
    maxLongitude: Math.max(...longitudes),
    minLatitude: Math.min(...latitudes),
    maxLatitude: Math.max(...latitudes),
  };
}

function boundsOverlap(first, second) {
  return (
    first.minLongitude < second.maxLongitude &&
    first.maxLongitude > second.minLongitude &&
    first.minLatitude < second.maxLatitude &&
    first.maxLatitude > second.minLatitude
  );
}

function parseCoordinates(source) {
  return [...source.matchAll(/lat:\s*(-?\d+(?:\.\d+)?),\s*lon:\s*(-?\d+(?:\.\d+)?)/g)].map(
    ([, latitude, longitude]) => ({
      latitude: Number(latitude),
      longitude: Number(longitude),
    }),
  );
}

function sourceSection(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);

  assert.notEqual(start, -1, `Missing scenario marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing scenario marker: ${endMarker}`);
  return source.slice(start, end);
}

function parseNumberField(source, fieldName) {
  const match = source.match(
    new RegExp(`${fieldName}:\\s*(-?\\d+(?:\\.\\d+)?)`),
  );

  assert.ok(match, `Missing numeric scenario field: ${fieldName}`);
  return Number(match[1]);
}

const [geoJsonSource, scenarioSource] = await Promise.all([
  readFile(geoJsonPath, "utf8"),
  readFile(scenarioPath, "utf8"),
]);
const geoJson = JSON.parse(geoJsonSource);
const riskThresholdSource = sourceSection(
  scenarioSource,
  "riskDepthThresholds: {",
  "floodLayer: {",
);
const floodLayerSource = sourceSection(
  scenarioSource,
  "floodLayer: {",
  "shelter: {",
);
const moderateMinDepthFt = parseNumberField(
  riskThresholdSource,
  "moderateMinDepthFt",
);
const highMinDepthFt = parseNumberField(
  riskThresholdSource,
  "highMinDepthFt",
);
const displayExtentMinDepthFt = parseNumberField(
  floodLayerSource,
  "displayExtentMinDepthFt",
);

assert.ok(moderateMinDepthFt >= 0);
assert.ok(highMinDepthFt > moderateMinDepthFt);
assert.ok(displayExtentMinDepthFt >= 0);

assert.equal(geoJson.type, "FeatureCollection");
assert.ok(
  geoJson.features.length >= 5 && geoJson.features.length <= 8,
  "Expected 5–8 property features",
);

const propertyIds = new Set();
const propertyBounds = [];
const depthsByRisk = { Low: [], Moderate: [], High: [] };

for (const feature of geoJson.features) {
  assert.equal(feature.type, "Feature");
  assert.equal(feature.geometry?.type, "Polygon");

  for (const field of requiredPropertyFields) {
    assert.ok(
      Object.hasOwn(feature.properties, field),
      `${feature.properties.property_id ?? "Unknown property"} is missing ${field}`,
    );
  }

  const properties = feature.properties;
  assert.ok(!propertyIds.has(properties.property_id), "Property IDs must be unique");
  propertyIds.add(properties.property_id);
  assert.match(properties.address_label, /\bDemo\b/i);
  assert.match(properties.occupancy_type, /\bFictional\b/i);
  assert.match(properties.nearest_shelter, /\bFictional\b/i);
  assert.match(properties.data_source, mockLanguagePattern);
  assert.match(properties.confidence_note, mockLanguagePattern);
  assert.match(properties.recommended_action, mockLanguagePattern);
  assert.doesNotMatch(
    properties.recommended_action,
    /\b(?:inspect|compare|review) (?:the|this) (?:demo|dashboard|property summary|route status|mock flood boundary)/i,
    `${properties.property_id} contains circular demo instructions`,
  );
  assert.ok(supportedRiskLevels.has(properties.risk_level));
  assert.ok(
    Number.isFinite(properties.estimated_flood_depth_ft) &&
      properties.estimated_flood_depth_ft >= 0,
  );
  const expectedRiskLevel =
    properties.estimated_flood_depth_ft >= highMinDepthFt
      ? "High"
      : properties.estimated_flood_depth_ft >= moderateMinDepthFt
        ? "Moderate"
        : "Low";
  assert.equal(
    properties.risk_level,
    expectedRiskLevel,
    `${properties.property_id} risk must match its synthetic depth threshold`,
  );
  assert.ok(
    Number.isFinite(properties.building_height_m) &&
      properties.building_height_m > 0,
  );
  depthsByRisk[properties.risk_level].push(properties.estimated_flood_depth_ft);

  const ring = feature.geometry.coordinates?.[0];
  assert.ok(Array.isArray(ring) && ring.length >= 4, "Polygon ring is incomplete");
  assert.deepEqual(ring[0], ring.at(-1), "Polygon ring must be closed");

  for (const coordinate of ring) {
    assert.ok(Array.isArray(coordinate) && coordinate.length >= 2);
    const [longitude, latitude] = coordinate;
    assert.ok(Number.isFinite(longitude) && longitude >= -180 && longitude <= 180);
    assert.ok(Number.isFinite(latitude) && latitude >= -90 && latitude <= 90);
  }

  propertyBounds.push({
    propertyId: properties.property_id,
    estimatedFloodDepthFt: properties.estimated_flood_depth_ft,
    ...polygonBounds(ring),
  });
}

for (let firstIndex = 0; firstIndex < propertyBounds.length; firstIndex += 1) {
  for (
    let secondIndex = firstIndex + 1;
    secondIndex < propertyBounds.length;
    secondIndex += 1
  ) {
    assert.ok(
      !boundsOverlap(propertyBounds[firstIndex], propertyBounds[secondIndex]),
      `${propertyBounds[firstIndex].propertyId} overlaps ${propertyBounds[secondIndex].propertyId}`,
    );
  }
}

assert.ok(
  Math.max(...depthsByRisk.Low) < Math.min(...depthsByRisk.Moderate) &&
    Math.max(...depthsByRisk.Moderate) < Math.min(...depthsByRisk.High),
  "Risk levels must increase with the mock flood depths",
);

assert.doesNotMatch(geoJsonSource, /https?:\/\//i);
assert.doesNotMatch(scenarioSource, /https?:\/\//i);
assert.match(
  scenarioSource,
  /propertyDataUrl:\s*"\/examples\/disaster_resilience_properties\.geojson"/,
);
assert.match(scenarioSource, /disclaimer:\s*DISASTER_DEMO_DISCLAIMER/);
assert.match(scenarioSource, /label:\s*MOCK_FLOOD_LAYER_LABEL/);

const requiredEventSources = [
  "Weather Twin",
  "Flood Model Twin",
  "Property Twin",
  "Response Twin",
  "AI Assistant",
];

for (const eventSource of requiredEventSources) {
  assert.match(scenarioSource, new RegExp(`source: "${eventSource}"`));
}

const eventSection = sourceSection(scenarioSource, "events: [", "disclaimer:");
const eventRecords = [
  ...eventSection.matchAll(
    /id:\s*"([^"]+)"[\s\S]*?source:\s*"([^"]+)"[\s\S]*?message:\s*"([^"]+)"[\s\S]*?timestamp:\s*"([^"]+)"/g,
  ),
].map(([, id, source, message, timestamp]) => ({
  id,
  source,
  message,
  timestamp,
}));

assert.equal(eventRecords.length, requiredEventSources.length);
assert.deepEqual(
  eventRecords.map(({ source }) => source),
  requiredEventSources,
  "Twin events must retain their deterministic source order",
);
assert.equal(
  new Set(eventRecords.map(({ id }) => id)).size,
  eventRecords.length,
  "Twin event IDs must be unique",
);
assert.equal(
  new Set(eventRecords.map(({ timestamp }) => timestamp)).size,
  eventRecords.length,
  "Twin event timestamps must be unique",
);

const eventTimes = eventRecords.map(({ timestamp }) => Date.parse(timestamp));
assert.ok(eventTimes.every(Number.isFinite), "Twin event timestamps must be valid");
assert.deepEqual(
  eventTimes,
  [...eventTimes].sort((first, second) => first - second),
  "Twin events must be chronological",
);

for (const event of eventRecords) {
  assert.match(event.message, mockLanguagePattern);
  assert.doesNotMatch(event.message, /\b(?:live|real-time|forecast|prediction)\b/i);
}

const aiEvent = eventRecords.find(({ source }) => source === "AI Assistant");
assert.ok(aiEvent, "AI Assistant event is required");
assert.match(aiEvent.message, /\bmock\b/i);

const floodCoordinates = parseCoordinates(
  sourceSection(scenarioSource, "boundary: [", "representativeDepthFt:"),
);
const shelterCoordinates = parseCoordinates(
  sourceSection(scenarioSource, "shelter: {", "route: {"),
);
const routeCoordinates = parseCoordinates(
  sourceSection(scenarioSource, "positions: [", "description:"),
);

assert.ok(floodCoordinates.length >= 3, "Flood boundary needs at least three positions");
assert.equal(shelterCoordinates.length, 1, "Scenario needs one shelter location");
assert.ok(routeCoordinates.length >= 2, "Response route needs at least two positions");

const floodBounds = polygonBounds(
  floodCoordinates.map(({ longitude, latitude }) => [longitude, latitude]),
);

const expectedInsideFloodBoundary = [
  "PROP-002",
  "PROP-003",
  "PROP-005",
  "PROP-006",
];
const expectedOutsideFloodBoundary = ["PROP-001", "PROP-004"];
const insideFloodBoundary = [];
const outsideFloodBoundary = [];

for (const property of propertyBounds) {
  const fullyInside =
    property.minLongitude >= floodBounds.minLongitude &&
    property.maxLongitude <= floodBounds.maxLongitude &&
    property.minLatitude >= floodBounds.minLatitude &&
    property.maxLatitude <= floodBounds.maxLatitude;
  const expectedInside =
    property.estimatedFloodDepthFt >= displayExtentMinDepthFt;

  assert.equal(
    fullyInside,
    expectedInside,
    `${property.propertyId} boundary coverage must match the mock display threshold`,
  );

  if (fullyInside) {
    insideFloodBoundary.push(property.propertyId);
    continue;
  }

  assert.ok(
    !boundsOverlap(property, floodBounds),
    `${property.propertyId} must not partially cross the mock flood boundary`,
  );
  outsideFloodBoundary.push(property.propertyId);
}

assert.deepEqual(
  insideFloodBoundary.sort(),
  expectedInsideFloodBoundary,
  "Expected the Moderate/High properties inside the mock flood boundary",
);
assert.deepEqual(
  outsideFloodBoundary.sort(),
  expectedOutsideFloodBoundary,
  "Expected the Low properties outside the mock flood boundary",
);

assert.deepEqual(
  routeCoordinates.at(-1),
  shelterCoordinates[0],
  "The mock response route must end at the fictional shelter",
);

console.log(
  `Validated ${geoJson.features.length} fictional properties (${insideFloodBoundary.length} inside and ${outsideFloodBoundary.length} outside the mock flood boundary), ${floodCoordinates.length} flood-boundary positions, ${routeCoordinates.length} route positions, one shelter, and five twin event sources.`,
);
