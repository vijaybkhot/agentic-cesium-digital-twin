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
  createViewerAdapter = createDefaultViewerAdapter,
}: CesiumSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<ViewerAdapter | null>(null);
  const selectionHandlerRef = useRef(onEntitySelected);

  useEffect(() => {
    selectionHandlerRef.current = onEntitySelected;
  }, [onEntitySelected]);

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

  return <div ref={containerRef} className="cesium-container" />;
}
