import type { UrbanGroundElevationAttributes } from "../../types/urbanResilience";

export type UrbanGroundElevationLookupStatus =
  | "loading"
  | "ready"
  | "unavailable";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableFiniteNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

export function parseUrbanGroundElevationAttributes(
  value: unknown,
): UrbanGroundElevationAttributes | null {
  if (!isRecord(value)) {
    return null;
  }

  const requiredStrings = [
    "entity_key",
    "entity_id",
    "display_label",
    "representative_point_method",
    "elevation_source",
    "source_dataset",
    "elevation_service_endpoint",
    "elevation_service_version",
    "resolution_note",
    "horizontal_reference_note",
    "vertical_reference_note",
    "accuracy_note",
    "interpretation_note",
  ] as const;
  const entityKindValid =
    value.entity_kind === "building" ||
    value.entity_kind === "community-public-safety-facility";
  const statusValid =
    value.elevation_status === "available" ||
    value.elevation_status === "unavailable";
  const identityValid =
    isNullableString(value.property_id) &&
    isNullableString(value.facility_id) &&
    (value.osm_element_type === "node" || value.osm_element_type === "way") &&
    typeof value.osm_id === "number" &&
    Number.isInteger(value.osm_id);
  const queryValid =
    typeof value.query_longitude === "number" &&
    Number.isFinite(value.query_longitude) &&
    typeof value.query_latitude === "number" &&
    Number.isFinite(value.query_latitude) &&
    value.query_wkid === 4326;
  const sourceMetadataValid =
    isNullableFiniteNumber(value.elevation_raster_id) &&
    isNullableFiniteNumber(value.service_reported_resolution) &&
    isNullableString(value.source_acquisition_date) &&
    isNullableString(value.source_acquisition_date_raw) &&
    isNullableString(value.retrieved_at) &&
    isNullableString(value.unavailable_reason);
  const availableElevationMetadataValid =
    typeof value.ground_elevation_m === "number" &&
    Number.isFinite(value.ground_elevation_m) &&
    typeof value.elevation_raster_id === "number" &&
    Number.isInteger(value.elevation_raster_id) &&
    typeof value.service_reported_resolution === "number" &&
    Number.isFinite(value.service_reported_resolution) &&
    value.service_reported_resolution > 0;

  if (
    requiredStrings.some((field) => !isNonEmptyString(value[field])) ||
    !entityKindValid ||
    !statusValid ||
    !identityValid ||
    !queryValid ||
    !sourceMetadataValid ||
    value.elevation_units !== "meters" ||
    !isNullableFiniteNumber(value.ground_elevation_m)
  ) {
    return null;
  }

  if (
    (value.elevation_status === "available" &&
      !availableElevationMetadataValid) ||
    (value.elevation_status === "unavailable" &&
      (value.ground_elevation_m !== null || !isNonEmptyString(value.unavailable_reason)))
  ) {
    return null;
  }

  return value as unknown as UrbanGroundElevationAttributes;
}

export async function loadUrbanGroundElevationSample(
  dataUrl: string,
  signal?: AbortSignal,
): Promise<Map<string, UrbanGroundElevationAttributes>> {
  const response = await fetch(dataUrl, { signal });

  if (!response.ok) {
    throw new Error(`Ground-elevation sample request failed with HTTP ${response.status}.`);
  }

  const geoJson: unknown = await response.json();

  if (
    !isRecord(geoJson) ||
    geoJson.type !== "FeatureCollection" ||
    !Array.isArray(geoJson.features)
  ) {
    throw new Error("Ground-elevation sample is not a GeoJSON FeatureCollection.");
  }

  const records = new Map<string, UrbanGroundElevationAttributes>();

  geoJson.features.forEach((feature, index) => {
    const attributes = isRecord(feature)
      ? parseUrbanGroundElevationAttributes(feature.properties)
      : null;

    if (!attributes) {
      throw new Error(`Ground-elevation feature ${index + 1} is invalid.`);
    }

    if (records.has(attributes.entity_key)) {
      throw new Error(`Duplicate ground-elevation entity key: ${attributes.entity_key}.`);
    }

    records.set(attributes.entity_key, attributes);
  });

  return records;
}
