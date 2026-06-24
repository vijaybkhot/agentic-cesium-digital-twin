import { useEffect, useRef } from "react";
import { CesiumViewerAdapter } from "../../adapters/viewer/CesiumViewerAdapter";
import type {
  ViewerAdapter,
  ViewerSelection,
} from "../../ports/ViewerAdapter";
import type { ProjectConfig } from "../../types/projectConfig";

interface CesiumSceneProps {
  config: ProjectConfig;
  onEntitySelected: (selection: ViewerSelection) => void;
  locationPickEnabled?: boolean;
  focusProjectVersion?: number;
  focusModelAssetId?: string | null;
  focusModelVersion?: number;
  createViewerAdapter?: (
    onEntitySelected: (selection: ViewerSelection) => void,
  ) => ViewerAdapter;
}

function createDefaultViewerAdapter(
  selectionHandler: (selection: ViewerSelection) => void,
): ViewerAdapter {
  return new CesiumViewerAdapter(selectionHandler);
}

export function CesiumScene({
  config,
  onEntitySelected,
  locationPickEnabled = false,
  focusProjectVersion = 0,
  focusModelAssetId = null,
  focusModelVersion = 0,
  createViewerAdapter = createDefaultViewerAdapter,
}: CesiumSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<ViewerAdapter | null>(null);
  const selectionHandlerRef = useRef(onEntitySelected);
  const configRef = useRef(config);

  useEffect(() => {
    selectionHandlerRef.current = onEntitySelected;
  }, [onEntitySelected]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const adapter = createViewerAdapter((selection) =>
      selectionHandlerRef.current(selection),
    );
    adapter.initialize(containerRef.current, config);
    adapterRef.current = adapter;

    return () => {
      adapter.destroy();
      adapterRef.current = null;
    };
  }, [config.projectId, createViewerAdapter]);

  useEffect(() => {
    config.measurementPoints.forEach((point) => {
      adapterRef.current?.updateMeasurementPoint(point);
    });
  }, [config.measurementPoints]);

  useEffect(() => {
    adapterRef.current?.renderProject(config);
  }, [
    config.facility,
    config.siteMarker,
    config.modelAssets,
    config.modelAnnotations,
  ]);

  useEffect(() => {
    adapterRef.current?.setLocationPickMode(locationPickEnabled);
  }, [locationPickEnabled]);

  useEffect(() => {
    if (focusProjectVersion > 0) {
      adapterRef.current?.flyToProject(configRef.current);
    }
  }, [focusProjectVersion]);

  useEffect(() => {
    if (focusModelAssetId && focusModelVersion > 0) {
      adapterRef.current?.flyToModelAsset(focusModelAssetId);
    }
  }, [focusModelAssetId, focusModelVersion]);

  return <div ref={containerRef} className="cesium-container" />;
}
