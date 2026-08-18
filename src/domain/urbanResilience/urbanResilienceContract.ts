import type {
  UrbanFemaCoverageStatus,
  UrbanFacilityCategory,
  UrbanFacilityType,
  UrbanResourceType,
  UrbanRiskLevel,
  UrbanRouteStatus,
} from "../../types/urbanResilience";

export const URBAN_RESILIENCE_DISCLAIMER =
  "Research prototype. Property risk levels are a zone-based classification " +
  "derived from public FEMA National Flood Hazard Layer data and OpenStreetMap " +
  "building footprints. This is not an official flood determination, insurance " +
  "requirement, evacuation order, or real shelter list. For official " +
  "information consult FEMA's Flood Map Service Center (msc.fema.gov), your " +
  "local floodplain administrator, and official Louisiana / parish emergency " +
  "management guidance.";

export const URBAN_RISK_LEVELS = [
  "Low",
  "Moderate",
  "High",
  "Unknown",
] as const satisfies readonly UrbanRiskLevel[];

export const URBAN_ROUTE_STATUSES = [
  "open",
  "at-risk",
  "not-recommended",
] as const satisfies readonly UrbanRouteStatus[];

export const URBAN_RESOURCE_TYPES = [
  "staging-reference",
] as const satisfies readonly UrbanResourceType[];

export const URBAN_FEMA_COVERAGE_STATUSES = [
  "available",
  "partial",
  "unavailable",
  "not-queried",
] as const satisfies readonly UrbanFemaCoverageStatus[];

export const URBAN_FACILITY_CATEGORIES = [
  "public-safety",
  "community",
] as const satisfies readonly UrbanFacilityCategory[];

export const URBAN_FACILITY_TYPES = [
  "fire_station",
  "police",
  "townhall",
  "school",
] as const satisfies readonly UrbanFacilityType[];

export function isUrbanRiskLevel(value: unknown): value is UrbanRiskLevel {
  return typeof value === "string" && URBAN_RISK_LEVELS.some((level) => level === value);
}

export function isUrbanRouteStatus(value: unknown): value is UrbanRouteStatus {
  return typeof value === "string" && URBAN_ROUTE_STATUSES.some((status) => status === value);
}

export function isUrbanResourceType(value: unknown): value is UrbanResourceType {
  return typeof value === "string" && URBAN_RESOURCE_TYPES.some((type) => type === value);
}

export function isUrbanFemaCoverageStatus(
  value: unknown,
): value is UrbanFemaCoverageStatus {
  return (
    typeof value === "string" &&
    URBAN_FEMA_COVERAGE_STATUSES.some((status) => status === value)
  );
}

export function isUrbanFacilityCategory(
  value: unknown,
): value is UrbanFacilityCategory {
  return (
    typeof value === "string" &&
    URBAN_FACILITY_CATEGORIES.some((category) => category === value)
  );
}

export function isUrbanFacilityType(value: unknown): value is UrbanFacilityType {
  return (
    typeof value === "string" &&
    URBAN_FACILITY_TYPES.some((facilityType) => facilityType === value)
  );
}
