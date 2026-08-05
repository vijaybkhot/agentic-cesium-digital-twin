import type { DisasterPropertyAttributes } from "../../types/disasterResilience";
import { isDisasterRiskLevel } from "./disasterResilienceContract";

const REQUIRED_TEXT_FIELDS = [
  "property_id",
  "address_label",
  "occupancy_type",
  "evacuation_zone",
  "nearest_shelter",
  "recommended_action",
  "data_source",
  "confidence_note",
] as const satisfies readonly (keyof DisasterPropertyAttributes)[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseDisasterPropertyAttributes(
  value: unknown,
): DisasterPropertyAttributes | null {
  if (!isRecord(value)) {
    return null;
  }

  if (REQUIRED_TEXT_FIELDS.some((field) => !isNonEmptyString(value[field]))) {
    return null;
  }

  if (
    !Number.isFinite(value.estimated_flood_depth_ft) ||
    (value.estimated_flood_depth_ft as number) < 0 ||
    !Number.isFinite(value.building_height_m) ||
    (value.building_height_m as number) <= 0 ||
    !isDisasterRiskLevel(value.risk_level)
  ) {
    return null;
  }

  return {
    property_id: (value.property_id as string).trim(),
    address_label: (value.address_label as string).trim(),
    occupancy_type: (value.occupancy_type as string).trim(),
    evacuation_zone: (value.evacuation_zone as string).trim(),
    nearest_shelter: (value.nearest_shelter as string).trim(),
    estimated_flood_depth_ft: value.estimated_flood_depth_ft as number,
    risk_level: value.risk_level,
    recommended_action: (value.recommended_action as string).trim(),
    data_source: (value.data_source as string).trim(),
    confidence_note: (value.confidence_note as string).trim(),
    building_height_m: value.building_height_m as number,
  };
}
