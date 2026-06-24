import type { BeliefState } from "./belief";

export interface Coordinate {
  lat: number;
  lon: number;
  height?: number;
}

export interface SceneConfig {
  center: Coordinate & { height: number };
  camera: {
    heading: number;
    pitch: number;
    range: number;
  };
}

export interface FacilityBuildingConfig {
  lat: number;
  lon: number;
  height: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

export interface FacilityConfig {
  name: string;
  building: FacilityBuildingConfig;
  boundary: Coordinate[];
}

export interface SiteMarkerConfig {
  lat: number;
  lon: number;
  height: number;
  label: string;
}

export interface BeliefRules {
  doseRate: {
    lowMax: number;
    mediumMax: number;
  };
  contamination: {
    lowMax: number;
    mediumMax: number;
  };
}

export interface MeasurementPointConfig {
  id: string;
  name: string;
  lat: number;
  lon: number;
  height: number;
  sensorType: string;
  doseRate: number;
  doseRateUnit: string;
  contamination: number;
  contaminationUnit: string;
  lastReading: string;
  belief: BeliefState;
}

export interface AnnotationConfig {
  id: string;
  label: string;
  lat: number;
  lon: number;
  height?: number;
  description?: string;
}

export interface ImageIntakeConfig {
  status: "draft_not_implemented" | "not_started" | "in_review" | "ready";
  imageCount: number;
  hasGpsMetadata: boolean;
  hasMinimumImageCount: boolean;
  hasSufficientResolution: boolean | null;
  coverageStatus: "unknown" | "insufficient" | "partial" | "sufficient";
  missingInputs: string[];
}

export interface AgentAssessmentConfig {
  agentProvider: string;
  reconstructionReadiness:
    | "not_ready"
    | "needs_more_input"
    | "ready_for_test"
    | "ready";
  reason: string;
  recommendedNextAction: string;
}

export interface SpatialAnchor {
  lat: number;
  lon: number;
  height: number;
}

export interface ModelOrientation {
  /** Heading angle in degrees. */
  heading: number;
  /** Pitch angle in degrees. */
  pitch: number;
  /** Roll angle in degrees. */
  roll: number;
}

export interface ModelCoordinateFrame {
  convention: "local-enu";
  unit: "meters";
  origin: "spatialAnchor";
}

export interface ModelAssetConfig {
  assetId: string;
  assetType: "glb" | "3d-tiles" | "point-cloud" | "mesh";
  assetUrl: string;
  sourcePipeline: string;
  status: "placeholder" | "processing" | "ready" | "failed";
  spatialAnchor: SpatialAnchor;
  scale: number;
  orientation: ModelOrientation;
  coordinateFrame?: ModelCoordinateFrame;
  quality?: {
    status: "unknown" | "low" | "medium" | "high";
    /** Confidence score from 0 to 1, where 1 is highest confidence. */
    confidence?: number;
    notes?: string;
  };
}

export interface LocalModelPosition {
  /** East/right offset from the asset origin, before asset scale is applied. */
  x: number;
  /** North/forward offset from the asset origin, before asset scale is applied. */
  y: number;
  /** Up offset from the asset origin, before asset scale is applied. */
  z: number;
}

export interface ModelAnnotationConfig {
  id: string;
  modelAssetId: string;
  measurementPointId?: string;
  label: string;
  description?: string;
  localPosition: LocalModelPosition;
}

export interface ProjectConfig {
  schemaVersion?: string;
  projectId: string;
  projectName: string;
  description: string;
  scene: SceneConfig;
  facility?: FacilityConfig;
  siteMarker?: SiteMarkerConfig;
  imageIntake?: ImageIntakeConfig;
  agentAssessment?: AgentAssessmentConfig;
  modelAssets?: ModelAssetConfig[];
  modelAnnotations?: ModelAnnotationConfig[];
  beliefRules: BeliefRules;
  measurementPoints: MeasurementPointConfig[];
  annotations: AnnotationConfig[];
}
