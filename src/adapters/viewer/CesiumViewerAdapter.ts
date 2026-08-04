import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";
import type {
  ViewerAdapter,
  ViewerSelectedEntityIds,
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
import {
  applyModelAnnotationVisualState,
  createModelAnnotationEntity,
} from "../../cesium/createModelAnnotationEntities";
import { createModelAssetEntity } from "../../cesium/createModelAssetEntities";
import {
  applyModularEntityVisualState,
  createModularHousingEntities,
  flyToModularScenarioTarget,
} from "../../cesium/createModularHousingEntities";
import { createSiteMarker } from "../../cesium/createSiteMarker";
import { styleDisasterPropertyDataSource } from "../../cesium/styleDisasterPropertyDataSource";
import {
  applyMeasurementPointVisualState,
  createMeasurementPointEntity,
  updateMeasurementPointEntity,
} from "../../cesium/createMeasurementPointEntities";
import type {
  ModularCameraTarget,
  ModularEntityKind,
  ModularHousingScenario,
} from "../../types/modularHousing";
import type { DisasterResilienceScenario } from "../../types/disasterResilience";

type SelectionHandler = (selection: ViewerSelection) => void;

export class CesiumViewerAdapter implements ViewerAdapter {
  private viewer: Cesium.Viewer | null = null;
  private clickHandler: Cesium.ScreenSpaceEventHandler | null = null;
  private locationPickMode = false;
  private readonly pointEntities = new Map<string, Cesium.Entity>();
  private readonly modelAssetEntities = new Map<string, Cesium.Entity>();
  private readonly modelAnnotationEntities = new Map<string, Cesium.Entity>();
  private readonly modularEntities = new Map<string, Cesium.Entity>();
  private readonly disasterDataSources = new Set<Cesium.DataSource>();
  private readonly disasterEntities = new Set<Cesium.Entity>();
  private readonly disasterPropertyEntities = new Map<string, Cesium.Entity>();
  private readonly measurementPoints = new Map<string, MeasurementPointConfig>();
  private disasterLoadVersion = 0;
  private selectedEntityIds: ViewerSelectedEntityIds = {};

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
    this.modularEntities.clear();
    this.measurementPoints.clear();

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
    const measurementPointsById = new Map(
      config.measurementPoints.map((point) => [point.id, point]),
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
        annotation.measurementPointId
          ? measurementPointsById.get(annotation.measurementPointId)
          : undefined,
      );
      this.modelAnnotationEntities.set(annotation.id, entity);
    });

    config.measurementPoints.forEach((point) => {
      const entity = createMeasurementPointEntity(this.viewer!, point);
      this.measurementPoints.set(point.id, point);
      this.pointEntities.set(point.id, entity);
    });

    this.applySelectionStyles();
  }

  renderModularScenario(scenario: ModularHousingScenario | null): void {
    if (!this.viewer) {
      return;
    }

    this.modularEntities.forEach((entity) => {
      this.viewer?.entities.remove(entity);
    });
    this.modularEntities.clear();

    if (!scenario) {
      return;
    }

    createModularHousingEntities(this.viewer, scenario).forEach(
      (entity, entityId) => {
        this.modularEntities.set(entityId, entity);
      },
    );
    this.applySelectionStyles();
  }

  async renderDisasterScenario(
    scenario: DisasterResilienceScenario | null,
  ): Promise<void> {
    const loadVersion = this.disasterLoadVersion + 1;
    this.disasterLoadVersion = loadVersion;
    const viewer = this.viewer;

    this.clearDisasterLayers();

    if (!scenario || !viewer || viewer.isDestroyed()) {
      return;
    }

    let dataSource: Cesium.GeoJsonDataSource | null = null;

    try {
      dataSource = await Cesium.GeoJsonDataSource.load(
        scenario.propertyDataUrl,
      );
      dataSource.show = false;
      dataSource.name = `disaster-properties:${scenario.id}`;

      if (!this.isCurrentDisasterLoad(loadVersion, viewer)) {
        dataSource.entities.removeAll();
        return;
      }

      const propertyEntities = styleDisasterPropertyDataSource(dataSource);

      if (!this.isCurrentDisasterLoad(loadVersion, viewer)) {
        dataSource.entities.removeAll();
        return;
      }

      await viewer.dataSources.add(dataSource);

      if (!this.isCurrentDisasterLoad(loadVersion, viewer)) {
        if (!viewer.isDestroyed() && viewer.dataSources.contains(dataSource)) {
          viewer.dataSources.remove(dataSource, true);
        }
        return;
      }

      this.disasterDataSources.add(dataSource);
      propertyEntities.forEach((entity, propertyId) => {
        this.disasterPropertyEntities.set(propertyId, entity);
      });
      dataSource.show = true;
    } catch (loadError: unknown) {
      if (dataSource && !viewer.isDestroyed()) {
        if (viewer.dataSources.contains(dataSource)) {
          viewer.dataSources.remove(dataSource, true);
        } else {
          dataSource.entities.removeAll();
        }
      }

      if (this.isCurrentDisasterLoad(loadVersion, viewer)) {
        console.warn("Unable to load disaster property GeoJSON.", loadError);
      }
    }
  }

  updateMeasurementPoint(point: MeasurementPointConfig): void {
    const entity = this.pointEntities.get(point.id);

    if (!entity) {
      return;
    }

    this.measurementPoints.set(point.id, point);
    updateMeasurementPointEntity(entity, point);
    this.applySelectionStyles();
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

  flyToModularTarget(
    scenario: ModularHousingScenario,
    target: ModularCameraTarget,
  ): void {
    if (this.viewer) {
      flyToModularScenarioTarget(this.viewer, scenario, target);
    }
  }

  setLocationPickMode(enabled: boolean): void {
    this.locationPickMode = enabled;
  }

  setSelectedEntityIds(selection: ViewerSelectedEntityIds): void {
    this.selectedEntityIds = selection;
    this.applySelectionStyles();
  }

  destroy(): void {
    this.disasterLoadVersion += 1;
    this.clearDisasterLayers();

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
    this.modularEntities.clear();
    this.disasterDataSources.clear();
    this.disasterEntities.clear();
    this.disasterPropertyEntities.clear();
    this.measurementPoints.clear();
  }

  private isCurrentDisasterLoad(
    loadVersion: number,
    viewer: Cesium.Viewer,
  ): boolean {
    return (
      loadVersion === this.disasterLoadVersion &&
      this.viewer === viewer &&
      !viewer.isDestroyed()
    );
  }

  private clearDisasterLayers(): void {
    const viewer = this.viewer;

    if (viewer && !viewer.isDestroyed()) {
      this.disasterDataSources.forEach((dataSource) => {
        if (viewer.dataSources.contains(dataSource)) {
          viewer.dataSources.remove(dataSource, true);
        }
      });
      this.disasterEntities.forEach((entity) => {
        viewer.entities.remove(entity);
      });
    }

    this.disasterDataSources.clear();
    this.disasterEntities.clear();
    this.disasterPropertyEntities.clear();
  }

  private applySelectionStyles(): void {
    this.pointEntities.forEach((entity, pointId) => {
      const point = this.measurementPoints.get(pointId);

      if (!point) {
        return;
      }

      applyMeasurementPointVisualState(
        entity,
        point,
        this.selectedEntityIds.measurementPointId === pointId,
      );
    });

    this.modelAnnotationEntities.forEach((entity, annotationId) => {
      applyModelAnnotationVisualState(
        entity,
        this.selectedEntityIds.modelAnnotationId === annotationId,
      );
    });

    this.modularEntities.forEach((entity, entityId) => {
      const modularId =
        (entity.properties?.modularId?.getValue() as string | undefined) ??
        entityId;

      applyModularEntityVisualState(
        entity,
        this.selectedEntityIds.modularEntityId === modularId,
      );
    });
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
      const modularId = entity.properties?.modularId?.getValue();
      const modularKind = entity.properties?.modularKind?.getValue() as
        | ModularEntityKind
        | undefined;

      if (entityType === "measurementPoint" && typeof pointId === "string") {
        this.onEntitySelected({ type: "measurementPoint", id: pointId });
      }

      if (
        entityType === "modelAnnotation" &&
        typeof annotationId === "string"
      ) {
        this.onEntitySelected({ type: "modelAnnotation", id: annotationId });
      }

      if (
        entityType === "modularEntity" &&
        typeof modularId === "string" &&
        typeof modularKind === "string"
      ) {
        this.onEntitySelected({
          type: "modularEntity",
          id: modularId,
          kind: modularKind,
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
}
