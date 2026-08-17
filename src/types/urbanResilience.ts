export type UrbanRiskLevel = "Low" | "Moderate" | "High" | "Unknown";

export type UrbanCameraTarget = "overall" | "flood" | "selected-property";

export type UrbanRouteStatus = "open" | "at-risk" | "not-recommended";

export type UrbanResourceType = "staging-reference";

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

export interface UrbanResilienceScenario {
  id: string;
  name: string;
  description: string;
  center: UrbanCoordinate;
  propertyDataUrl: string;
  floodZoneDataUrl: string;
  responseDataUrl: string;
  routes: UrbanResponseRoute[];
  resources: UrbanResourceSite[];
  events: UrbanTwinEvent[];
  disclaimer: string;
}
