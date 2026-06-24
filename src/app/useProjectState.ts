import { useCallback, useMemo, useState } from "react";
import { createProjectConfigRepository } from "../config/loadProjectConfig";
import {
  createAuditEvent,
  createManualOverrideLog,
  createModelAnnotationSelectionLog,
  createReadingUpdateLog,
  createSelectionLog,
} from "../domain/audit/auditLogService";
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
  const [selectedModelAnnotationId, setSelectedModelAnnotationId] = useState<
    string | null
  >(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    createAuditEvent("Application started. Waiting for user selection."),
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExistingDemo = useCallback(async () => {
    const repository = createProjectConfigRepository();

    setIsLoading(true);
    setError(null);

    try {
      const loadedConfig = await repository.loadProjectConfig();

      setConfig(normalizeProjectConfig(loadedConfig));
      setSelectedPointId(null);
      setSelectedModelAnnotationId(null);
      setAuditEvents([
        createAuditEvent("Existing demonstration project loaded."),
      ]);
    } catch (loadError: unknown) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Unknown project config load error.";
      console.error(message);
      setError(message);
      throw loadError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearProject = useCallback(() => {
    setConfig(null);
    setSelectedPointId(null);
    setSelectedModelAnnotationId(null);
    setAuditEvents([
      createAuditEvent("Application started. Waiting for user selection."),
    ]);
    setError(null);
    setIsLoading(false);
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

  const selectedModelAnnotation = useMemo(() => {
    if (!config || !selectedModelAnnotationId) {
      return null;
    }

    return (
      config.modelAnnotations?.find(
        (annotation) => annotation.id === selectedModelAnnotationId,
      ) ?? null
    );
  }, [config, selectedModelAnnotationId]);

  const selectedModelAsset = useMemo(() => {
    if (!config || !selectedModelAnnotation) {
      return null;
    }

    return (
      config.modelAssets?.find(
        (asset) => asset.assetId === selectedModelAnnotation.modelAssetId,
      ) ?? null
    );
  }, [config, selectedModelAnnotation]);

  const selectedLinkedMeasurementPoint = useMemo(() => {
    if (!config || !selectedModelAnnotation?.measurementPointId) {
      return null;
    }

    return (
      config.measurementPoints.find(
        (point) => point.id === selectedModelAnnotation.measurementPointId,
      ) ?? null
    );
  }, [config, selectedModelAnnotation]);

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
      setSelectedModelAnnotationId(null);
      prependAuditEvent(createSelectionLog(point));
    },
    [config, prependAuditEvent],
  );

  const selectModelAnnotation = useCallback(
    (annotationId: string) => {
      if (!config) {
        return;
      }

      const annotation = config.modelAnnotations?.find(
        (candidate) => candidate.id === annotationId,
      );

      if (!annotation) {
        return;
      }

      const linkedPoint = annotation.measurementPointId
        ? config.measurementPoints.find(
            (point) => point.id === annotation.measurementPointId,
          ) ?? null
        : null;

      setSelectedPointId(null);
      setSelectedModelAnnotationId(annotationId);
      prependAuditEvent(createModelAnnotationSelectionLog(annotation, linkedPoint));
    },
    [config, prependAuditEvent],
  );

  const clearSelection = useCallback(() => {
    setSelectedPointId(null);
    setSelectedModelAnnotationId(null);
  }, []);

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
  };
}
