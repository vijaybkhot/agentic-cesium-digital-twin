export type UrbanRiskLevel = "Low" | "Moderate" | "High" | "Unknown";

export type UrbanCameraTarget = "overall" | "flood" | "selected-property";

export type UrbanRouteStatus = "open" | "at-risk" | "not-recommended";

export type UrbanResourceType = "staging-reference";

export type UrbanFemaCoverageStatus =
  | "available"
  | "partial"
  | "unavailable"
  | "not-queried";

export type UrbanFacilityCategory = "public-safety" | "community";

export type UrbanFacilityType = "fire_station" | "police" | "townhall" | "school";

export type UrbanGroundElevationStatus = "available" | "unavailable";

export type UrbanGroundElevationEntityKind =
  | "building"
  | "community-public-safety-facility";

export interface UrbanCoordinate {
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lon: number;
  /** Optional height in meters. */
  height?: number;
}

export interface UrbanPropertyAttributes {
  property_id: string;
  address_label: string;
  occupancy_type: string;
  flood_zone_code: string;
  sfha: boolean | null;
  risk_level: UrbanRiskLevel;
  recommended_action: string;
  data_source: string;
  confidence_note: string;
  building_height_m: number;
  osm_way_id: number;
}

export interface UrbanFloodZoneAttributes {
  id: string;
  flood_zone_code: string;
  zone_subtype: string | null;
  sfha: boolean | null;
  risk_level: UrbanRiskLevel;
  static_bfe_ft: number | null;
}

export interface UrbanResponseRoute {
  id: string;
  name: string;
  status: UrbanRouteStatus;
  positions: UrbanCoordinate[];
  description: string;
}

export interface UrbanResourceSite {
  id: string;
  name: string;
  resourceType: UrbanResourceType;
  location: UrbanCoordinate;
  description: string;
}

export interface UrbanTwinEvent {
  id: string;
  source: string;
  message: string;
  timestamp: string;
}

export interface SelectedUrbanProperty {
  propertyId: string;
  attributes: UrbanPropertyAttributes;
}

export interface UrbanLa1FemaSegmentAttributes {
  id: string;
  feature_kind: "experimental-la1-fema-segment";
  osm_way_id: number;
  name: string;
  ref: string;
  highway_type: string;
  study_areas: string[];
  fema_source_queries: string[];
  fema_coverage_status: UrbanFemaCoverageStatus;
  intersects_mapped_flood_hazard: boolean | null;
  fema_zones: string[];
  fema_relationship_reason: string;
  interpretation: string;
  osm_source: string;
  fema_source: string;
  processing_method: string;
}

export interface SelectedUrbanLa1FemaSegment {
  segmentId: string;
  attributes: UrbanLa1FemaSegmentAttributes;
}

export interface UrbanFacilityAttributes {
  facility_id: string;
  feature_kind: "community-public-safety-facility";
  facility_category: UrbanFacilityCategory;
  facility_type: UrbanFacilityType;
  facility_type_label: string;
  name: string;
  address_label: string;
  osm_element_type: "node" | "way";
  osm_id: number;
  osm_classification_key: "amenity";
  osm_classification_value: UrbanFacilityType;
  osm_tags_json: string;
  study_area: string;
  fema_coverage_status: UrbanFemaCoverageStatus;
  intersects_mapped_flood_hazard: boolean | null;
  fema_zones: string[];
  fema_relationship_reason: string;
  interpretation: string;
  osm_source: string;
  fema_source: string;
  processing_method: string;
}

export interface SelectedUrbanFacility {
  facilityId: string;
  attributes: UrbanFacilityAttributes;
}

export interface UrbanGroundElevationAttributes {
  entity_key: string;
  entity_kind: UrbanGroundElevationEntityKind;
  entity_id: string;
  display_label: string;
  property_id: string | null;
  facility_id: string | null;
  osm_element_type: "node" | "way";
  osm_id: number;
  query_longitude: number;
  query_latitude: number;
  representative_point_method: string;
  elevation_status: UrbanGroundElevationStatus;
  ground_elevation_m: number | null;
  elevation_units: "meters";
  elevation_source: string;
  source_dataset: string;
  elevation_service_endpoint: string;
  elevation_service_version: string;
  query_wkid: number;
  elevation_raster_id: number | null;
  service_reported_resolution: number | null;
  resolution_note: string;
  source_acquisition_date: string | null;
  source_acquisition_date_raw: string | null;
  retrieved_at: string | null;
  horizontal_reference_note: string;
  vertical_reference_note: string;
  accuracy_note: string;
  interpretation_note: string;
  unavailable_reason: string | null;
}

export interface UrbanResilienceScenario {
  id: string;
  name: string;
  description: string;
  center: UrbanCoordinate;
  propertyDataUrl: string;
  floodZoneDataUrl: string;
  responseDataUrl: string;
  experimentalLa1FemaDataUrl: string;
  experimentalFacilityDataUrl: string;
  experimentalGroundElevationDataUrl: string;
  routes: UrbanResponseRoute[];
  resources: UrbanResourceSite[];
  events: UrbanTwinEvent[];
  disclaimer: string;
}
