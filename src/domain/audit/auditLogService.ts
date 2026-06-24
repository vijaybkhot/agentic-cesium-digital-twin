import type { AuditEvent } from "../../types/audit";
import type { BeliefState } from "../../types/belief";
import type {
  MeasurementPointConfig,
  ModelAnnotationConfig,
} from "../../types/projectConfig";

function createId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createAuditEvent(message: string): AuditEvent {
  return {
    id: createId(),
    message,
    timestamp: new Date().toISOString(),
  };
}

export function createSelectionLog(point: MeasurementPointConfig): AuditEvent {
  return createAuditEvent(
    `Selected ${point.id} (${point.name}) with belief ${point.belief}.`,
  );
}

export function createModelAnnotationSelectionLog(
  annotation: ModelAnnotationConfig,
  linkedPoint?: MeasurementPointConfig | null,
): AuditEvent {
  if (linkedPoint) {
    return createAuditEvent(
      `Selected model annotation ${annotation.id} (${annotation.label}) linked to ${linkedPoint.id} (${linkedPoint.name}) with belief ${linkedPoint.belief}.`,
    );
  }

  return createAuditEvent(
    `Selected model annotation ${annotation.id} (${annotation.label}) on ${annotation.modelAssetId}.`,
  );
}

export function createReadingUpdateLog(
  pointId: string,
  previousDoseRate: number,
  nextDoseRate: number,
  previousContamination: number,
  nextContamination: number,
  previousBelief: BeliefState,
  nextBelief: BeliefState,
): AuditEvent {
  return createAuditEvent(
    `Updated ${pointId} readings: dose rate ${previousDoseRate.toFixed(
      2,
    )} to ${nextDoseRate.toFixed(
      2,
    )} uSv/h, contamination ${previousContamination} to ${nextContamination} cpm, belief ${previousBelief} to ${nextBelief}.`,
  );
}

export function createManualOverrideLog(
  pointId: string,
  previousBelief: BeliefState,
  nextBelief: BeliefState,
): AuditEvent {
  if (previousBelief === nextBelief) {
    return createAuditEvent(
      `${pointId} already has belief ${nextBelief}. No update was needed.`,
    );
  }

  return createAuditEvent(
    `Updated ${pointId} belief from ${previousBelief} to ${nextBelief}.`,
  );
}
