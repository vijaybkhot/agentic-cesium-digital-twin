export type DisasterRiskLevel = "Low" | "Moderate" | "High";

export type DisasterCameraTarget =
  | "overall"
  | "flood"
  | "selected-property";

export type DisasterRouteStatus =
  | "open"
  | "at-risk"
  | "not-recommended";

export type DisasterTwinEventSource =
  | "Weather Twin"
  | "Flood Model Twin"
  | "Property Twin"
  | "Response Twin"
  | "AI Assistant";

export interface DisasterCoordinate {
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lon: number;
  /** Optional height in meters. */
  height?: number;
}

export interface DisasterPropertyAttributes {
  property_id: string;
  address_label: string;
  occupancy_type: string;
  evacuation_zone: string;
  nearest_shelter: string;
  estimated_flood_depth_ft: number;
  risk_level: DisasterRiskLevel;
  recommended_action: string;
  data_source: string;
  confidence_note: string;
  building_height_m: number;
}

export interface DisasterFloodLayer {
  id: string;
  label: string;
  boundary: DisasterCoordinate[];
  displayExtentMinDepthFt: number;
  representativeDepthFt: number;
  visualHeightScaleMultiplier: number;
  confidenceNote: string;
}

export interface DisasterRiskDepthThresholds {
  moderateMinDepthFt: number;
  highMinDepthFt: number;
}

export interface DisasterShelter {
  id: string;
  name: string;
  location: DisasterCoordinate;
  description: string;
}

export interface DisasterResponseRoute {
  id: string;
  name: string;
  status: DisasterRouteStatus;
  positions: DisasterCoordinate[];
  description: string;
}

export interface DisasterTwinEvent {
  id: string;
  source: DisasterTwinEventSource;
  message: string;
  timestamp: string;
}

export interface SelectedDisasterProperty {
  propertyId: string;
}

export interface DisasterResilienceScenario {
  id: string;
  name: string;
  description: string;
  center: DisasterCoordinate;
  propertyDataUrl: string;
  riskDepthThresholds: DisasterRiskDepthThresholds;
  floodLayer: DisasterFloodLayer;
  shelter: DisasterShelter;
  route: DisasterResponseRoute;
  events: DisasterTwinEvent[];
  disclaimer: string;
}
