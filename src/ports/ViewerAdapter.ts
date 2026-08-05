import type { MeasurementPointConfig, ProjectConfig } from "../types/projectConfig";
import type {
  ModularCameraTarget,
  ModularEntityKind,
  ModularHousingScenario,
} from "../types/modularHousing";
import type {
  DisasterPropertyAttributes,
  DisasterResilienceScenario,
} from "../types/disasterResilience";

export type ViewerSelection =
  | { type: "measurementPoint"; id: string }
  | { type: "modelAnnotation"; id: string }
  | { type: "modularEntity"; id: string; kind: ModularEntityKind }
  | {
      type: "disasterProperty";
      id: string;
      attributes: DisasterPropertyAttributes;
    }
  | { type: "globeLocation"; lat: number; lon: number };

export interface ViewerSelectedEntityIds {
  measurementPointId?: string | null;
  modelAnnotationId?: string | null;
  modularEntityId?: string | null;
  disasterPropertyId?: string | null;
}

export interface ViewerAdapter {
  initialize(container: HTMLElement, config: ProjectConfig): void | Promise<void>;
  renderProject(config: ProjectConfig): void;
  renderModularScenario(scenario: ModularHousingScenario | null): void;
  renderDisasterScenario(
    scenario: DisasterResilienceScenario | null,
  ): Promise<void>;
  updateMeasurementPoint(point: MeasurementPointConfig): void;
  flyToProject(config: ProjectConfig): void;
  flyToModelAsset(assetId: string): void;
  flyToModularTarget(
    scenario: ModularHousingScenario,
    target: ModularCameraTarget,
  ): void;
  setLocationPickMode(enabled: boolean): void;
  setSelectedEntityIds(selection: ViewerSelectedEntityIds): void;
  destroy(): void;
}
