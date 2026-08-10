import type { UrbanPropertyAttributes } from "../../types/urbanResilience";
import { isUrbanRiskLevel } from "./urbanResilienceContract";

const REQUIRED_TEXT_FIELDS = [
  "property_id",
  "address_label",
  "occupancy_type",
  "flood_zone_code",
  "recommended_action",
  "data_source",
  "confidence_note",
] as const satisfies readonly (keyof UrbanPropertyAttributes)[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseUrbanPropertyAttributes(value: unknown): UrbanPropertyAttributes | null {
  if (!isRecord(value)) {
    return null;
  }

  if (REQUIRED_TEXT_FIELDS.some((field) => !isNonEmptyString(value[field]))) {
    return null;
  }

  if (
    typeof value.sfha !== "boolean" ||
    !Number.isFinite(value.building_height_m) ||
    (value.building_height_m as number) <= 0 ||
    !Number.isFinite(value.osm_way_id) ||
    !isUrbanRiskLevel(value.risk_level)
  ) {
    return null;
  }

  return {
    property_id: (value.property_id as string).trim(),
    address_label: (value.address_label as string).trim(),
    occupancy_type: (value.occupancy_type as string).trim(),
    flood_zone_code: (value.flood_zone_code as string).trim(),
    sfha: value.sfha,
    risk_level: value.risk_level,
    recommended_action: (value.recommended_action as string).trim(),
    data_source: (value.data_source as string).trim(),
    confidence_note: (value.confidence_note as string).trim(),
    building_height_m: value.building_height_m as number,
    osm_way_id: value.osm_way_id as number,
  };
}
