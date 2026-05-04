import { useEffect, useRef } from "react";
import { CesiumViewerAdapter } from "../../adapters/viewer/CesiumViewerAdapter";
import type { ViewerAdapter } from "../../ports/ViewerAdapter";
import type { ProjectConfig } from "../../types/projectConfig";

interface CesiumSceneProps {
  config: ProjectConfig;
  onMeasurementPointSelected: (pointId: string) => void;
  createViewerAdapter?: (
    onMeasurementPointSelected: (pointId: string) => void,
  ) => ViewerAdapter;
}

export function CesiumScene({
  config,
  onMeasurementPointSelected,
  createViewerAdapter = (selectionHandler) =>
    new CesiumViewerAdapter(selectionHandler),
}: CesiumSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<ViewerAdapter | null>(null);
  const selectionHandlerRef = useRef(onMeasurementPointSelected);

  useEffect(() => {
    selectionHandlerRef.current = onMeasurementPointSelected;
  }, [onMeasurementPointSelected]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const adapter = createViewerAdapter((pointId) =>
      selectionHandlerRef.current(pointId),
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
