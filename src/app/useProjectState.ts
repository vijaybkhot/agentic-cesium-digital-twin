import { useCallback, useEffect, useMemo, useState } from "react";
import { createProjectConfigRepository } from "../config/loadProjectConfig";
import { createAuditEvent, createManualOverrideLog, createReadingUpdateLog, createSelectionLog } from "../domain/audit/auditLogService";
import { calculateBeliefState } from "../domain/belief/beliefCalculator";
import { normalizeProjectConfig } from "../domain/project/projectMapper";
import type { BeliefState } from "../types/belief";
import type { AuditEvent } from "../types/audit";
import type { MeasurementPointConfig, ProjectConfig } from "../types/projectConfig";
import {
  normalizeReadingTimestamp,
  replaceMeasurementPoint,
  type MeasurementUpdate,
} from "./appState";

export function useProjectState() {
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    createAuditEvent("Application started. Waiting for user selection."),
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const repository = createProjectConfigRepository();

    repository
      .loadProjectConfig()
      .then((loadedConfig) => {
        setConfig(normalizeProjectConfig(loadedConfig));
        setError(null);
      })
      .catch((loadError: unknown) => {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unknown project config load error.";
        console.error(message);
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const selectedPoint = useMemo(() => {
    if (!config || !selectedPointId) {
      return null;
    }

    return (
      config.measurementPoints.find((point) => point.id === selectedPointId) ??
      null
    );
  }, [config, selectedPointId]);

  const prependAuditEvent = useCallback((event: AuditEvent) => {
    setAuditEvents((currentEvents) => [event, ...currentEvents]);
  }, []);

  const selectPoint = useCallback(
    (pointId: string) => {
      if (!config) {
        return;
      }

      const point = config.measurementPoints.find(
        (candidate) => candidate.id === pointId,
      );

      if (!point) {
        return;
      }

      setSelectedPointId(pointId);
      prependAuditEvent(createSelectionLog(point));
    },
    [config, prependAuditEvent],
  );

  const updatePoint = useCallback((nextPoint: MeasurementPointConfig) => {
    setConfig((currentConfig) =>
      currentConfig ? replaceMeasurementPoint(currentConfig, nextPoint) : null,
    );
  }, []);

  const applyMeasurementUpdate = useCallback(
    (pointId: string, update: MeasurementUpdate) => {
      if (!config) {
        return;
      }

      const point = config.measurementPoints.find(
        (candidate) => candidate.id === pointId,
      );

      if (!point) {
        return;
      }

      const nextBelief = calculateBeliefState(
        update.doseRate,
        update.contamination,
        config.beliefRules,
      );
      const nextPoint: MeasurementPointConfig = {
        ...point,
        doseRate: update.doseRate,
        contamination: update.contamination,
        lastReading: normalizeReadingTimestamp(update.lastReading),
        belief: nextBelief,
      };

      updatePoint(nextPoint);
      prependAuditEvent(
        createReadingUpdateLog(
          point.id,
          point.doseRate,
          nextPoint.doseRate,
          point.contamination,
          nextPoint.contamination,
          point.belief,
          nextPoint.belief,
        ),
      );
    },
    [config, prependAuditEvent, updatePoint],
  );

  const applyManualOverride = useCallback(
    (pointId: string, nextBelief: BeliefState) => {
      if (!config) {
        return;
      }

      const point = config.measurementPoints.find(
        (candidate) => candidate.id === pointId,
      );

      if (!point) {
        return;
      }

      updatePoint({ ...point, belief: nextBelief });
      prependAuditEvent(createManualOverrideLog(point.id, point.belief, nextBelief));
    },
    [config, prependAuditEvent, updatePoint],
  );

  return {
    config,
    selectedPoint,
    selectedPointId,
    auditEvents,
    isLoading,
    error,
    selectPoint,
    applyMeasurementUpdate,
    applyManualOverride,
  };
}
