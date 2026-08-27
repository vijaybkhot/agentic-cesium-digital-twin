import { representativePointForGeometry } from "./geoJsonRepresentativePoint.mjs";

export const SAMPLED_GRAND_ISLE_BUILDINGS = [
  { propertyId: "GI-0064", osmWayId: 1066811684 },
  { propertyId: "GI-0084", osmWayId: 1066811956 },
  { propertyId: "GI-0276", osmWayId: 1066812429 },
  { propertyId: "GI-0266", osmWayId: 1066812418 },
  { propertyId: "GI-0133", osmWayId: 1066812248 },
  { propertyId: "GI-0221", osmWayId: 1066812373 },
  { propertyId: "GI-0191", osmWayId: 1066812343 },
  { propertyId: "GI-0207", osmWayId: 1066812359 },
  { propertyId: "GI-0301", osmWayId: 1066812454 },
  { propertyId: "GI-0181", osmWayId: 1066812322 },
  { propertyId: "GI-0127", osmWayId: 1066812242 },
  { propertyId: "GI-0025", osmWayId: 431047271 },
];

export const EXPECTED_GRAND_ISLE_FACILITIES = [
  { facilityId: "osm-node-367132153", osmElementType: "node", osmId: 367132153 },
  { facilityId: "osm-node-367133144", osmElementType: "node", osmId: 367133144 },
  { facilityId: "osm-way-924797034", osmElementType: "way", osmId: 924797034 },
  { facilityId: "osm-way-924801527", osmElementType: "way", osmId: 924801527 },
];

function requireFeature(features, predicate, description) {
  const feature = features.find(predicate);

  if (!feature) {
    throw new Error(`Unable to find elevation sample entity: ${description}.`);
  }

  return feature;
}

function sampleBuildingEntities(propertyGeoJson) {
  const features = Array.isArray(propertyGeoJson?.features)
    ? propertyGeoJson.features
    : [];

  return SAMPLED_GRAND_ISLE_BUILDINGS.map(({ propertyId, osmWayId }) => {
    const feature = requireFeature(
      features,
      (candidate) => candidate.properties?.property_id === propertyId,
      propertyId,
    );

    if (feature.properties?.osm_way_id !== osmWayId) {
      throw new Error(
        `${propertyId}: expected OSM way ${osmWayId}, received ${feature.properties?.osm_way_id}.`,
      );
    }

    const representativePoint = representativePointForGeometry(feature.geometry);

    return {
      entityKey: `property:${propertyId}`,
      entityKind: "building",
      entityId: propertyId,
      displayLabel: feature.properties.address_label,
      propertyId,
      facilityId: null,
      osmElementType: "way",
      osmId: osmWayId,
      sourceGeometry: feature.geometry,
      representativePoint,
    };
  });
}

function sampleFacilityEntities(facilityGeoJson) {
  const features = Array.isArray(facilityGeoJson?.features)
    ? facilityGeoJson.features
    : [];

  if (features.length !== EXPECTED_GRAND_ISLE_FACILITIES.length) {
    throw new Error(
      `Expected ${EXPECTED_GRAND_ISLE_FACILITIES.length} facility records, received ${features.length}.`,
    );
  }

  return EXPECTED_GRAND_ISLE_FACILITIES.map(
    ({ facilityId, osmElementType, osmId }) => {
      const feature = requireFeature(
        features,
        (candidate) => candidate.properties?.facility_id === facilityId,
        facilityId,
      );

      if (
        feature.properties?.osm_element_type !== osmElementType ||
        feature.properties?.osm_id !== osmId
      ) {
        throw new Error(`${facilityId}: OSM identity changed from the reviewed source.`);
      }

      const representativePoint = representativePointForGeometry(feature.geometry);

      return {
        entityKey: `facility:${facilityId}`,
        entityKind: "community-public-safety-facility",
        entityId: facilityId,
        displayLabel: feature.properties.name,
        propertyId: null,
        facilityId,
        osmElementType,
        osmId,
        sourceGeometry: feature.geometry,
        representativePoint,
      };
    },
  );
}

export function collectUrbanElevationSampleEntities(
  propertyGeoJson,
  facilityGeoJson,
) {
  return [
    ...sampleBuildingEntities(propertyGeoJson),
    ...sampleFacilityEntities(facilityGeoJson),
  ];
}
