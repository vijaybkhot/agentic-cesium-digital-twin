import { useCallback, useEffect, useRef, useState } from "react";
import { CesiumScene } from "../components/CesiumScene/CesiumScene";
import { ImageIntakePanel } from "../components/ImageIntakePanel/ImageIntakePanel";
import { SidePanel } from "../components/SidePanel/SidePanel";
import { StatusPanel } from "../components/StatusPanel/StatusPanel";
import { Toolbar } from "../components/Toolbar/Toolbar";
import { useProjectState } from "./useProjectState";

interface DragState {
  active: boolean;
  offsetX: number;
  offsetY: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function AppShell() {
  const {
    config,
    selectedPoint,
    selectedModelAnnotation,
    selectedModelAsset,
    auditEvents,
    isLoading,
    error,
    selectPoint,
    selectModelAnnotation,
    clearSelection,
    applyMeasurementUpdate,
    applyManualOverride,
  } = useProjectState();
  const panelRef = useRef<HTMLElement | null>(null);
  const dragStateRef = useRef<DragState>({
    active: false,
    offsetX: 0,
    offsetY: 0,
  });
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  const placePanel = useCallback((left: number, top: number) => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const padding = 16;
    const maxLeft = Math.max(padding, window.innerWidth - panel.offsetWidth - padding);
    const maxTop = Math.max(padding, window.innerHeight - panel.offsetHeight - padding);

    panel.style.left = `${clamp(left, padding, maxLeft)}px`;
    panel.style.top = `${clamp(top, padding, maxTop)}px`;
  }, []);

  const resetPanelPosition = useCallback(() => {
    placePanel(16, 16);
    panelRef.current?.scrollTo({ top: 0 });
  }, [placePanel]);

  useEffect(() => {
    resetPanelPosition();
  }, [config?.projectId, resetPanelPosition]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const dragState = dragStateRef.current;

      if (!dragState.active) {
        return;
      }

      placePanel(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
    }

    function stopDragging() {
      dragStateRef.current.active = false;
      panelRef.current?.classList.remove("is-dragging");
    }

    function handleWindowResize() {
      if (!isPanelVisible || !panelRef.current) {
        return;
      }

      const panelBounds = panelRef.current.getBoundingClientRect();
      placePanel(panelBounds.left, panelBounds.top);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [isPanelVisible, placePanel]);

  function handlePanelPointerDown(event: React.PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const panelBounds = panel.getBoundingClientRect();
    dragStateRef.current = {
      active: true,
      offsetX: event.clientX - panelBounds.left,
      offsetY: event.clientY - panelBounds.top,
    };
    panel.classList.add("is-dragging");
    event.preventDefault();
  }

  return (
    <div className="app-shell">
      {config && (
        <CesiumScene
          config={config}
          onEntitySelected={(selection) => {
            setIsPanelVisible(true);

            if (selection.type === "measurementPoint") {
              selectPoint(selection.id);
            } else {
              selectModelAnnotation(selection.id);
            }
          }}
        />
      )}
      <Toolbar config={config} />
      <StatusPanel isLoading={isLoading} error={error} />
      <ImageIntakePanel
        hasProjectLocation={
          Number.isFinite(config?.scene.center.lat) &&
          Number.isFinite(config?.scene.center.lon)
        }
      />
      <button
        className={`floating-button ${isPanelVisible ? "" : "is-visible"}`}
        type="button"
        onClick={() => setIsPanelVisible(true)}
      >
        Show panel
      </button>
      <SidePanel
        project={config}
        selectedPoint={selectedPoint}
        selectedModelAnnotation={selectedModelAnnotation}
        selectedModelAsset={selectedModelAsset}
        beliefRules={config?.beliefRules ?? null}
        auditEvents={auditEvents}
        isVisible={isPanelVisible}
        onHide={() => setIsPanelVisible(false)}
        onClearSelection={clearSelection}
        onResetPosition={() => {
          setIsPanelVisible(true);
          resetPanelPosition();
        }}
        onApplyMeasurementUpdate={applyMeasurementUpdate}
        onApplyManualOverride={applyManualOverride}
        panelRef={panelRef}
        onPanelPointerDown={handlePanelPointerDown}
      />
    </div>
  );
}
