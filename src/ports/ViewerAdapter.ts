import type { MeasurementPointConfig, ProjectConfig } from "../types/projectConfig";

export interface ViewerAdapter {
  initialize(container: HTMLElement, config: ProjectConfig): void | Promise<void>;
  renderProject(config: ProjectConfig): void;
  updateMeasurementPoint(point: MeasurementPointConfig): void;
  flyToProject(config: ProjectConfig): void;
  destroy(): void;
}
