import type { MeasurementPointConfig, ProjectConfig } from "../types/projectConfig";

export type ViewerSelection =
  | { type: "measurementPoint"; id: string }
  | { type: "modelAnnotation"; id: string }
  | { type: "globeLocation"; lat: number; lon: number };

export interface ViewerAdapter {
  initialize(container: HTMLElement, config: ProjectConfig): void | Promise<void>;
  renderProject(config: ProjectConfig): void;
  updateMeasurementPoint(point: MeasurementPointConfig): void;
  flyToProject(config: ProjectConfig): void;
  flyToModelAsset(assetId: string): void;
  setLocationPickMode(enabled: boolean): void;
  destroy(): void;
}
