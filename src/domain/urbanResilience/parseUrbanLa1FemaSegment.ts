import type { UrbanLa1FemaSegmentAttributes } from "../../types/urbanResilience";
import { isUrbanFemaCoverageStatus } from "./urbanResilienceContract";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseUrbanLa1FemaSegmentAttributes(
  value: unknown,
): UrbanLa1FemaSegmentAttributes | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const attributes = value as Record<string, unknown>;
  const requiredStrings = [
    "id",
    "name",
    "ref",
    "highway_type",
    "fema_relationship_reason",
    "interpretation",
    "osm_source",
    "fema_source",
    "processing_method",
  ] as const;

  if (
    attributes.feature_kind !== "experimental-la1-fema-segment" ||
    !Number.isFinite(attributes.osm_way_id) ||
    !requiredStrings.every(
      (field) =>
        typeof attributes[field] === "string" &&
        attributes[field].trim().length > 0,
    ) ||
    !isStringArray(attributes.study_areas) ||
    !isStringArray(attributes.fema_source_queries) ||
    !isStringArray(attributes.fema_zones) ||
    !isUrbanFemaCoverageStatus(attributes.fema_coverage_status) ||
    !(
      typeof attributes.intersects_mapped_flood_hazard === "boolean" ||
      attributes.intersects_mapped_flood_hazard === null
    )
  ) {
    return null;
  }

  return attributes as unknown as UrbanLa1FemaSegmentAttributes;
}
