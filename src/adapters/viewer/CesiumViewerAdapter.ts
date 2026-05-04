import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";
import type { ViewerAdapter } from "../../ports/ViewerAdapter";
import type {
  MeasurementPointConfig,
  ProjectConfig,
} from "../../types/projectConfig";
import { flyToProject as flyViewerToProject } from "../../cesium/cameraControls";
import { createCesiumViewer } from "../../cesium/createCesiumViewer";
import { createFacilityBoundary } from "../../cesium/createFacilityBoundary";
import { createFacilityBuilding } from "../../cesium/createFacilityBuilding";
import {
  createMeasurementPointEntity,
  updateMeasurementPointEntity,
} from "../../cesium/createMeasurementPointEntities";

type MeasurementPointSelectionHandler = (pointId: string) => void;

export class CesiumViewerAdapter implements ViewerAdapter {
  private viewer: Cesium.Viewer | null = null;
  private clickHandler: Cesium.ScreenSpaceEventHandler | null = null;
  private readonly pointEntities = new Map<string, Cesium.Entity>();

  constructor(
    private readonly onMeasurementPointSelected: MeasurementPointSelectionHandler,
  ) {}

  initialize(container: HTMLElement, config: ProjectConfig): void {
    window.CESIUM_BASE_URL = CESIUM_BASE_URL;
    this.destroy();
    this.viewer = createCesiumViewer(container);
    this.renderProject(config);
    this.flyToProject(config);
    this.attachSelectionHandler();
  }

  renderProject(config: ProjectConfig): void {
    if (!this.viewer) {
      return;
    }

    this.viewer.entities.removeAll();
    this.pointEntities.clear();

    createFacilityBuilding(this.viewer, config.facility);
    createFacilityBoundary(this.viewer, config.facility);

    config.measurementPoints.forEach((point) => {
      const entity = createMeasurementPointEntity(this.viewer!, point);
      this.pointEntities.set(point.id, entity);
    });
  }

  updateMeasurementPoint(point: MeasurementPointConfig): void {
    const entity = this.pointEntities.get(point.id);

    if (!entity) {
      return;
    }

    updateMeasurementPointEntity(entity, point);
  }

  flyToProject(config: ProjectConfig): void {
    if (this.viewer) {
      flyViewerToProject(this.viewer, config);
    }
  }

  destroy(): void {
    if (this.clickHandler && !this.clickHandler.isDestroyed()) {
      this.clickHandler.destroy();
    }

    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.destroy();
    }

    this.clickHandler = null;
    this.viewer = null;
    this.pointEntities.clear();
  }

  private attachSelectionHandler(): void {
    if (!this.viewer) {
      return;
    }

    this.clickHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas,
    );

    this.clickHandler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      if (!this.viewer) {
        return;
      }

      const pickedObject = this.viewer.scene.pick(event.position);

      if (!Cesium.defined(pickedObject) || !Cesium.defined(pickedObject.id)) {
        return;
      }

      const entity = pickedObject.id as Cesium.Entity;
      const entityType = entity.properties?.entityType?.getValue();
      const pointId = entity.properties?.pointId?.getValue();

      if (entityType === "measurementPoint" && typeof pointId === "string") {
        this.onMeasurementPointSelected(pointId);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
}
