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

export interface ProjectConfig {
  projectId: string;
  projectName: string;
  description: string;
  scene: SceneConfig;
  facility: FacilityConfig;
  beliefRules: BeliefRules;
  measurementPoints: MeasurementPointConfig[];
  annotations: AnnotationConfig[];
}
