import type { UrbanFacilityAttributes } from "../../types/urbanResilience";
import {
  isUrbanFacilityCategory,
  isUrbanFacilityType,
  isUrbanFemaCoverageStatus,
} from "./urbanResilienceContract";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseUrbanFacilityAttributes(
  value: unknown,
): UrbanFacilityAttributes | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const attributes = value as Record<string, unknown>;
  const requiredStrings = [
    "facility_id",
    "facility_type_label",
    "name",
    "address_label",
    "osm_tags_json",
    "study_area",
    "fema_relationship_reason",
    "interpretation",
    "osm_source",
    "fema_source",
    "processing_method",
  ] as const;

  if (
    attributes.feature_kind !== "community-public-safety-facility" ||
    !isUrbanFacilityCategory(attributes.facility_category) ||
    !isUrbanFacilityType(attributes.facility_type) ||
    !isUrbanFacilityType(attributes.osm_classification_value) ||
    attributes.osm_classification_key !== "amenity" ||
    !(attributes.osm_element_type === "node" || attributes.osm_element_type === "way") ||
    !Number.isFinite(attributes.osm_id) ||
    !isUrbanFemaCoverageStatus(attributes.fema_coverage_status) ||
    !(
      typeof attributes.intersects_mapped_flood_hazard === "boolean" ||
      attributes.intersects_mapped_flood_hazard === null
    ) ||
    !isStringArray(attributes.fema_zones) ||
    !requiredStrings.every(
      (field) =>
        typeof attributes[field] === "string" &&
        attributes[field].trim().length > 0,
    )
  ) {
    return null;
  }

  return attributes as unknown as UrbanFacilityAttributes;
}
