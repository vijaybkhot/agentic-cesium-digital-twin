import { useEffect, useMemo, useState } from "react";
import { formatReadingTimestamp, getCurrentReadingTimestamp, normalizeReadingTimestamp } from "../../app/appState";
import { getRecommendationForPoint } from "../../domain/belief/recommendationService";
import type { BeliefState } from "../../types/belief";
import type {
  BeliefRules,
  MeasurementPointConfig,
  ModelAnnotationConfig,
  ModelAssetConfig,
  ProjectConfig,
} from "../../types/projectConfig";
import { AuditLog } from "../AuditLog/AuditLog";
import type { AuditEvent } from "../../types/audit";
import { ThresholdGuide } from "./ThresholdGuide";

interface SidePanelProps {
  project: ProjectConfig | null;
  selectedPoint: MeasurementPointConfig | null;
  selectedModelAnnotation: ModelAnnotationConfig | null;
  selectedModelAsset: ModelAssetConfig | null;
  beliefRules: BeliefRules | null;
  auditEvents: AuditEvent[];
  isVisible: boolean;
  onHide: () => void;
  onClearSelection: () => void;
  onResetPosition: () => void;
  onApplyMeasurementUpdate: (
    pointId: string,
    update: { doseRate: number; contamination: number; lastReading: string },
  ) => void;
  onApplyManualOverride: (pointId: string, belief: BeliefState) => void;
  panelRef: React.RefObject<HTMLElement | null>;
  onPanelPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
}

const beliefStates: BeliefState[] = ["Low", "Medium", "High"];

export function SidePanel({
  project,
  selectedPoint,
  selectedModelAnnotation,
  selectedModelAsset,
  beliefRules,
  auditEvents,
  isVisible,
  onHide,
  onClearSelection,
  onResetPosition,
  onApplyMeasurementUpdate,
  onApplyManualOverride,
  panelRef,
  onPanelPointerDown,
}: SidePanelProps) {
  const [doseRate, setDoseRate] = useState("");
  const [contamination, setContamination] = useState("");
  const [lastReading, setLastReading] = useState(getCurrentReadingTimestamp());

  useEffect(() => {
    if (!selectedPoint) {
      setDoseRate("");
      setContamination("");
      setLastReading(getCurrentReadingTimestamp());
      return;
    }

    setDoseRate(selectedPoint.doseRate.toFixed(2));
    setContamination(String(selectedPoint.contamination));
    setLastReading(normalizeReadingTimestamp(selectedPoint.lastReading));
  }, [selectedPoint]);

  const recommendation = useMemo(() => {
    if (!selectedPoint) {
      return "Select a point to see the next recommended action.";
    }

    return getRecommendationForPoint(selectedPoint);
  }, [selectedPoint]);

  function applyMeasurementUpdate() {
    if (!selectedPoint) {
      return;
    }

    const nextDoseRate = Number(doseRate);
    const nextContamination = Number(contamination);

    if (Number.isNaN(nextDoseRate) || Number.isNaN(nextContamination)) {
      return;
    }

    onApplyMeasurementUpdate(selectedPoint.id, {
      doseRate: nextDoseRate,
      contamination: nextContamination,
      lastReading,
    });
  }

  return (
    <aside ref={panelRef} className={`info-panel ${isVisible ? "" : "is-hidden"}`}>
      <div className="panel-header" onPointerDown={onPanelPointerDown}>
        <div>
          <p className="panel-kicker">Digital Twin POC</p>
          <h1>Decision Loop Demo</h1>
        </div>
        <div className="panel-controls">
          <button className="panel-button" type="button" onClick={onResetPosition}>
            Move to top-left
          </button>
          <button className="panel-button" type="button" onClick={onClearSelection}>
            Clear selection
          </button>
          <button className="panel-button" type="button" onClick={onHide}>
            Hide
          </button>
        </div>
      </div>

      <p className="panel-intro">
        Click a measurement point or model annotation to inspect it. Drag this
        panel by the header if it covers the scene.
      </p>

      <section className="panel-section">
        <h2>Project</h2>
        <p><strong>ID:</strong> {project?.projectId ?? "-"}</p>
        <p><strong>Name:</strong> {project?.projectName ?? "-"}</p>
        <p><strong>Description:</strong> {project?.description ?? "-"}</p>
      </section>

      {selectedModelAnnotation ? (
        <section className="panel-section">
          <h2>Model Annotation</h2>
          <p><strong>ID:</strong> {selectedModelAnnotation.id}</p>
          <p><strong>Label:</strong> {selectedModelAnnotation.label}</p>
          <p><strong>Model:</strong> {selectedModelAnnotation.modelAssetId}</p>
          <p>
            <strong>Description:</strong>{" "}
            {selectedModelAnnotation.description ?? "-"}
          </p>
          <p><strong>Coordinate frame:</strong> Local ENU meters</p>
          <p>
            <strong>Local position:</strong>{" "}
            x={selectedModelAnnotation.localPosition.x},{" "}
            y={selectedModelAnnotation.localPosition.y},{" "}
            z={selectedModelAnnotation.localPosition.z}
          </p>
          <p>
            <strong>Asset scale:</strong> {selectedModelAsset?.scale ?? "-"}
          </p>
        </section>
      ) : (
        <>
          <section className="panel-section">
            <h2>Selected Point</h2>
            <p><strong>ID:</strong> {selectedPoint?.id ?? "None"}</p>
            <p><strong>Name:</strong> {selectedPoint?.name ?? "Nothing selected yet"}</p>
            <p><strong>Belief:</strong> {selectedPoint?.belief ?? "-"}</p>
            <p><strong>Sensor Type:</strong> {selectedPoint?.sensorType ?? "-"}</p>
            <p>
              <strong>Dose Rate:</strong>{" "}
              {selectedPoint
                ? `${selectedPoint.doseRate.toFixed(2)} ${selectedPoint.doseRateUnit}`
                : "-"}
            </p>
            <p>
              <strong>Contamination:</strong>{" "}
              {selectedPoint
                ? `${selectedPoint.contamination} ${selectedPoint.contaminationUnit}`
                : "-"}
            </p>
            <p>
              <strong>Last Reading:</strong>{" "}
              {selectedPoint ? formatReadingTimestamp(selectedPoint.lastReading) : "-"}
            </p>
          </section>

          <section className="panel-section">
            <h2>Recommendation</h2>
            <p>{recommendation}</p>
          </section>

          <section className="panel-section">
            <h2>Measurement Update</h2>
            <p className="panel-helper">
              Edit the mock readings below. The belief state will be recalculated automatically.
            </p>
            <label className="field-label" htmlFor="doseRateInput">Dose rate (uSv/h)</label>
            <input
              id="doseRateInput"
              className="panel-input"
              type="number"
              min="0"
              step="0.01"
              disabled={!selectedPoint}
              value={doseRate}
              onChange={(event) => setDoseRate(event.target.value)}
            />

            <label className="field-label" htmlFor="contaminationInput">Contamination (cpm)</label>
            <input
              id="contaminationInput"
              className="panel-input"
              type="number"
              min="0"
              step="1"
              disabled={!selectedPoint}
              value={contamination}
              onChange={(event) => setContamination(event.target.value)}
            />

            <label className="field-label" htmlFor="lastReadingInput">Last reading date and time</label>
            <input
              id="lastReadingInput"
              className="panel-input"
              type="datetime-local"
              step="60"
              disabled={!selectedPoint}
              value={lastReading}
              onChange={(event) => setLastReading(event.target.value)}
            />

            <button
              className="panel-button panel-action"
              type="button"
              disabled={!selectedPoint}
              onClick={applyMeasurementUpdate}
            >
              Apply readings
            </button>

            <ThresholdGuide beliefRules={beliefRules} selectedPoint={selectedPoint} />
          </section>

          <section className="panel-section">
            <h2>Manual Belief Override</h2>
            <div className="belief-controls">
              {beliefStates.map((belief) => (
                <button
                  key={belief}
                  className={`belief-button ${
                    selectedPoint?.belief === belief ? "is-active" : ""
                  }`}
                  type="button"
                  disabled={!selectedPoint}
                  onClick={() =>
                    selectedPoint && onApplyManualOverride(selectedPoint.id, belief)
                  }
                >
                  {belief}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="panel-section">
        <h2>Audit Log</h2>
        <AuditLog events={auditEvents} />
      </section>
    </aside>
  );
}
