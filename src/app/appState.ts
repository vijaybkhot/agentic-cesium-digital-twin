import type { AuditEvent } from "../types/audit";
import type { MeasurementPointConfig, ProjectConfig } from "../types/projectConfig";

export interface ProjectState {
  config: ProjectConfig | null;
  selectedPointId: string | null;
  auditEvents: AuditEvent[];
  isLoading: boolean;
  error: string | null;
}

export interface MeasurementUpdate {
  doseRate: number;
  contamination: number;
  lastReading: string;
}

export function getCurrentReadingTimestamp(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;

  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function normalizeReadingTimestamp(value: string): string {
  if (!value) {
    return getCurrentReadingTimestamp();
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${getCurrentReadingTimestamp().slice(0, 10)}T${value}`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  return getCurrentReadingTimestamp();
}

export function formatReadingTimestamp(value: string): string {
  const normalizedValue = normalizeReadingTimestamp(value);
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return normalizedValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function replaceMeasurementPoint(
  config: ProjectConfig,
  nextPoint: MeasurementPointConfig,
): ProjectConfig {
  return {
    ...config,
    measurementPoints: config.measurementPoints.map((point) =>
      point.id === nextPoint.id ? nextPoint : point,
    ),
  };
}
