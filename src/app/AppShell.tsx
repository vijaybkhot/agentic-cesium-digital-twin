import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CesiumScene } from "../components/CesiumScene/CesiumScene";
import { DisasterResilienceDemoPanel } from "../components/DisasterResilienceDemoPanel/DisasterResilienceDemoPanel";
import { ImageIntakePanel } from "../components/ImageIntakePanel/ImageIntakePanel";
import { ModularHousingDemoPanel } from "../components/ModularHousingDemoPanel/ModularHousingDemoPanel";
import { ReconstructionWorkflowPanel } from "../components/ReconstructionWorkflowPanel/ReconstructionWorkflowPanel";
import { SidePanel } from "../components/SidePanel/SidePanel";
import { StatusPanel } from "../components/StatusPanel/StatusPanel";
import { Toolbar } from "../components/Toolbar/Toolbar";
import { createDisasterResilienceViewerConfig } from "../domain/disasterResilience/createDisasterResilienceViewerConfig";
import { mockDisasterResilienceScenario } from "../domain/disasterResilience/mockDisasterResilienceScenario";
import { applyModularStatusAction } from "../domain/modularHousing/applyModularStatusAction";
import { createModularHousingViewerConfig } from "../domain/modularHousing/createModularHousingViewerConfig";
import { mockModularHousingScenario } from "../domain/modularHousing/mockModularHousingScenario";
import type {
  ModularCameraTarget,
  ModularStatusActionId,
  SelectedModularEntity,
} from "../types/modularHousing";
import type { SelectedDisasterProperty } from "../types/disasterResilience";
import { useProjectState } from "./useProjectState";
import { useReconstructionWorkflow } from "./useReconstructionWorkflow";

type ApplicationMode =
  | "workflow"
  | "existing-demo"
  | "modular-demo"
  | "disaster-demo";

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
    selectedPointId,
    selectedModelAnnotation,
    selectedModelAnnotationId,
    selectedModelAsset,
    selectedLinkedMeasurementPoint,
    auditEvents,
    isLoading,
    error,
    selectPoint,
    selectModelAnnotation,
    clearSelection,
    applyMeasurementUpdate,
    applyManualOverride,
    loadExistingDemo,
    clearProject,
  } = useProjectState();
  const workflow = useReconstructionWorkflow();
  const panelRef = useRef<HTMLElement | null>(null);
  const navigationVersionRef = useRef(0);
  const dragStateRef = useRef<DragState>({
    active: false,
    offsetX: 0,
    offsetY: 0,
  });
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [mode, setMode] = useState<ApplicationMode>("workflow");
  const [selectedModularEntity, setSelectedModularEntity] =
    useState<SelectedModularEntity | null>(null);
  const [selectedDisasterProperty, setSelectedDisasterProperty] =
    useState<SelectedDisasterProperty | null>(null);
  const [modularScenario, setModularScenario] = useState(
    mockModularHousingScenario,
  );
  const [disasterScenario, setDisasterScenario] = useState(
    mockDisasterResilienceScenario,
  );
  const [modularFocusRequest, setModularFocusRequest] = useState<{
    target: ModularCameraTarget;
    version: number;
  } | null>(null);
  const modularViewerConfig = useMemo(
    () => createModularHousingViewerConfig(modularScenario),
    [modularScenario],
  );
  const disasterViewerConfig = useMemo(
    () => createDisasterResilienceViewerConfig(disasterScenario),
    [disasterScenario],
  );
  const existingDemoProjectLocation =
    config &&
    Number.isFinite(config.scene.center.lat) &&
    Number.isFinite(config.scene.center.lon)
      ? {
          lat: config.scene.center.lat,
          lon: config.scene.center.lon,
        }
      : undefined;

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

  const openExistingDemo = useCallback(async () => {
    const navigationVersion = navigationVersionRef.current + 1;
    navigationVersionRef.current = navigationVersion;

    try {
      await loadExistingDemo();

      if (navigationVersion !== navigationVersionRef.current) {
        return;
      }

      setSelectedModularEntity(null);
      setSelectedDisasterProperty(null);
      setModularFocusRequest(null);
      setMode("existing-demo");
      setIsPanelVisible(true);
    } catch {
      // The visible status panel displays the repository error.
    }
  }, [loadExistingDemo]);

  const startNewProject = useCallback(() => {
    navigationVersionRef.current += 1;
    clearProject();
    workflow.resetWorkflow();
    setSelectedModularEntity(null);
    setSelectedDisasterProperty(null);
    setModularFocusRequest(null);
    setMode("workflow");
    setIsPanelVisible(true);
  }, [clearProject, workflow.resetWorkflow]);

  const openModularDemo = useCallback(() => {
    navigationVersionRef.current += 1;
    clearProject();
    workflow.resetWorkflow();
    setModularScenario(mockModularHousingScenario);
    setSelectedModularEntity(null);
    setSelectedDisasterProperty(null);
    setModularFocusRequest((currentRequest) => ({
      target: "system",
      version: (currentRequest?.version ?? 0) + 1,
    }));
    setMode("modular-demo");
    setIsPanelVisible(true);
  }, [clearProject, workflow.resetWorkflow]);

  const openDisasterDemo = useCallback(() => {
    navigationVersionRef.current += 1;
    clearProject();
    workflow.resetWorkflow();
    setModularScenario(mockModularHousingScenario);
    setSelectedModularEntity(null);
    setSelectedDisasterProperty(null);
    setModularFocusRequest(null);
    setDisasterScenario(mockDisasterResilienceScenario);
    setMode("disaster-demo");
    setIsPanelVisible(true);
  }, [clearProject, workflow.resetWorkflow]);

  const focusModularTarget = useCallback((target: ModularCameraTarget) => {
    setModularFocusRequest((currentRequest) => ({
      target,
      version: (currentRequest?.version ?? 0) + 1,
    }));
  }, []);

  const applyModularAction = useCallback(
    (actionId: ModularStatusActionId, moduleId: string) => {
      setModularScenario((currentScenario) =>
        applyModularStatusAction(currentScenario, actionId, moduleId),
      );
      setSelectedModularEntity({ id: moduleId, kind: "module" });
    },
    [],
  );

  const activeConfig =
    mode === "existing-demo"
      ? config
      : mode === "modular-demo"
        ? modularViewerConfig
        : mode === "disaster-demo"
          ? disasterViewerConfig
          : workflow.config;

  return (
    <div className="app-shell">
      {activeConfig && (
        <CesiumScene
          config={activeConfig}
          locationPickEnabled={
            mode === "workflow" && workflow.locationPickEnabled
          }
          focusProjectVersion={
            mode === "workflow" ? workflow.focusProjectVersion : 0
          }
          focusModelAssetId={
            mode === "workflow"
              ? workflow.config.modelAssets?.[0]?.assetId ?? null
              : null
          }
          focusModelVersion={
            mode === "workflow" ? workflow.focusModelVersion : 0
          }
          selectedMeasurementPointId={
            mode === "existing-demo" ? selectedPointId : null
          }
          selectedModelAnnotationId={
            mode === "existing-demo" ? selectedModelAnnotationId : null
          }
          selectedModularEntityId={
            mode === "modular-demo" ? selectedModularEntity?.id ?? null : null
          }
          selectedDisasterPropertyId={
            mode === "disaster-demo"
              ? selectedDisasterProperty?.propertyId ?? null
              : null
          }
          modularScenario={
            mode === "modular-demo" ? modularScenario : null
          }
          disasterScenario={
            mode === "disaster-demo" ? disasterScenario : null
          }
          modularFocusTarget={
            mode === "modular-demo" ? modularFocusRequest?.target ?? null : null
          }
          modularFocusVersion={
            mode === "modular-demo" ? modularFocusRequest?.version ?? 0 : 0
          }
          onEntitySelected={(selection) => {
            if (
              mode === "workflow" &&
              selection.type === "globeLocation"
            ) {
              workflow.setPickedLocation(selection.lat, selection.lon);
              return;
            }

            if (mode === "modular-demo") {
              if (selection.type === "modularEntity") {
                setSelectedModularEntity({
                  id: selection.id,
                  kind: selection.kind,
                });
                setIsPanelVisible(true);
              }
              return;
            }

            if (mode === "disaster-demo") {
              if (selection.type === "disasterProperty") {
                setSelectedDisasterProperty({
                  propertyId: selection.id,
                  attributes: selection.attributes,
                });
                setIsPanelVisible(true);
              }
              return;
            }

            if (mode !== "existing-demo") {
              return;
            }

            setIsPanelVisible(true);

            if (selection.type === "measurementPoint") {
              selectPoint(selection.id);
            } else if (selection.type === "modelAnnotation") {
              selectModelAnnotation(selection.id);
            }
          }}
        />
      )}
      <Toolbar config={activeConfig} />
      <StatusPanel isLoading={isLoading} error={error} />
      {mode === "workflow" ? (
        <ReconstructionWorkflowPanel
          step={workflow.step}
          projectName={workflow.projectName}
          description={workflow.description}
          latitude={workflow.latitude}
          longitude={workflow.longitude}
          config={workflow.config}
          review={workflow.review}
          job={workflow.job}
          error={workflow.error}
          locationPickEnabled={workflow.locationPickEnabled}
          hasValidLocation={workflow.hasValidLocation}
          canStartReconstruction={workflow.canStartReconstruction}
          imageIntakeVersion={workflow.imageIntakeVersion}
          onProjectNameChange={workflow.setProjectName}
          onDescriptionChange={workflow.setDescription}
          onLatitudeChange={workflow.setLatitude}
          onLongitudeChange={workflow.setLongitude}
          onStartLocationPick={workflow.startLocationPick}
          onCancelLocationPick={workflow.cancelLocationPick}
          onViewTypedLocation={workflow.viewTypedLocation}
          onCreateProject={workflow.createProject}
          onImageSelectionChange={workflow.handleImageSelection}
          onStartReconstruction={() => void workflow.startReconstruction()}
          onResetWorkflow={workflow.resetWorkflow}
          onOpenExistingDemo={() => void openExistingDemo()}
          onOpenModularDemo={openModularDemo}
          onOpenDisasterDemo={openDisasterDemo}
        />
      ) : mode === "modular-demo" ? (
        <ModularHousingDemoPanel
          scenario={modularScenario}
          selectedModularEntity={selectedModularEntity}
          onFocusTarget={focusModularTarget}
          onApplyModularAction={applyModularAction}
          onNewProject={startNewProject}
          onOpenExistingDemo={() => void openExistingDemo()}
          onOpenDisasterDemo={openDisasterDemo}
        />
      ) : mode === "disaster-demo" ? (
        <DisasterResilienceDemoPanel
          scenario={disasterScenario}
          selectedProperty={selectedDisasterProperty}
          onNewProject={startNewProject}
          onOpenExistingDemo={() => void openExistingDemo()}
          onOpenModularDemo={openModularDemo}
        />
      ) : (
        <>
          <ImageIntakePanel
            hasProjectLocation={Boolean(existingDemoProjectLocation)}
            projectLocation={existingDemoProjectLocation}
          />
          <button
            className={`floating-button ${
              isPanelVisible ? "" : "is-visible"
            }`}
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
            selectedLinkedMeasurementPoint={selectedLinkedMeasurementPoint}
            beliefRules={config?.beliefRules ?? null}
            auditEvents={auditEvents}
            isVisible={isPanelVisible}
            onHide={() => setIsPanelVisible(false)}
            onNewProject={startNewProject}
            onOpenModularDemo={openModularDemo}
            onOpenDisasterDemo={openDisasterDemo}
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
        </>
      )}
    </div>
  );
}
