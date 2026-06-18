import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";
import type {
  ViewerAdapter,
  ViewerSelection,
} from "../../ports/ViewerAdapter";
import type {
  MeasurementPointConfig,
  ProjectConfig,
} from "../../types/projectConfig";
import { flyToProject as flyViewerToProject } from "../../cesium/cameraControls";
import { createCesiumViewer } from "../../cesium/createCesiumViewer";
import { createFacilityBoundary } from "../../cesium/createFacilityBoundary";
import { createFacilityBuilding } from "../../cesium/createFacilityBuilding";
import { createModelAnnotationEntity } from "../../cesium/createModelAnnotationEntities";
import { createModelAssetEntity } from "../../cesium/createModelAssetEntities";
import { createSiteMarker } from "../../cesium/createSiteMarker";
import {
  createMeasurementPointEntity,
  updateMeasurementPointEntity,
} from "../../cesium/createMeasurementPointEntities";

type SelectionHandler = (selection: ViewerSelection) => void;

export class CesiumViewerAdapter implements ViewerAdapter {
  private viewer: Cesium.Viewer | null = null;
  private clickHandler: Cesium.ScreenSpaceEventHandler | null = null;
  private locationPickMode = false;
  private readonly pointEntities = new Map<string, Cesium.Entity>();
  private readonly modelAssetEntities = new Map<string, Cesium.Entity>();
  private readonly modelAnnotationEntities = new Map<string, Cesium.Entity>();

  constructor(
    private readonly onEntitySelected: SelectionHandler,
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
    this.modelAssetEntities.clear();
    this.modelAnnotationEntities.clear();

    if (config.facility) {
      createFacilityBuilding(this.viewer, config.facility);
      createFacilityBoundary(this.viewer, config.facility);
    }

    if (config.siteMarker) {
      createSiteMarker(this.viewer, config.siteMarker);
    }

    const modelAssetsById = new Map(
      config.modelAssets?.map((asset) => [asset.assetId, asset]) ?? [],
    );

    modelAssetsById.forEach((asset) => {
      const entity = createModelAssetEntity(this.viewer!, asset);

      if (entity) {
        this.modelAssetEntities.set(asset.assetId, entity);
      }
    });

    config.modelAnnotations?.forEach((annotation) => {
      const asset = modelAssetsById.get(annotation.modelAssetId);

      if (!asset || asset.assetType !== "glb" || asset.status !== "ready") {
        return;
      }

      const entity = createModelAnnotationEntity(
        this.viewer!,
        annotation,
        asset,
      );
      this.modelAnnotationEntities.set(annotation.id, entity);
    });

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

  flyToModelAsset(assetId: string): void {
    const entity = this.modelAssetEntities.get(assetId);

    if (this.viewer && entity) {
      void this.viewer.flyTo(entity, {
        duration: 1,
      });
    }
  }

  setLocationPickMode(enabled: boolean): void {
    this.locationPickMode = enabled;
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
    this.locationPickMode = false;
    this.pointEntities.clear();
    this.modelAssetEntities.clear();
    this.modelAnnotationEntities.clear();
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

      if (this.locationPickMode) {
        const ray = this.viewer.camera.getPickRay(event.position);
        const worldPosition = ray
          ? this.viewer.scene.globe.pick(ray, this.viewer.scene)
          : undefined;

        if (!worldPosition) {
          return;
        }

        const cartographic = Cesium.Cartographic.fromCartesian(worldPosition);

        this.locationPickMode = false;
        this.onEntitySelected({
          type: "globeLocation",
          lat: Cesium.Math.toDegrees(cartographic.latitude),
          lon: Cesium.Math.toDegrees(cartographic.longitude),
        });
        return;
      }

      const pickedObject = this.viewer.scene.pick(event.position);

      if (!Cesium.defined(pickedObject) || !Cesium.defined(pickedObject.id)) {
        return;
      }

      const entity = pickedObject.id as Cesium.Entity;
      const entityType = entity.properties?.entityType?.getValue();
      const pointId = entity.properties?.pointId?.getValue();
      const annotationId = entity.properties?.annotationId?.getValue();

      if (entityType === "measurementPoint" && typeof pointId === "string") {
        this.onEntitySelected({ type: "measurementPoint", id: pointId });
      }

      if (
        entityType === "modelAnnotation" &&
        typeof annotationId === "string"
      ) {
        this.onEntitySelected({ type: "modelAnnotation", id: annotationId });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
}
