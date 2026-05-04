import * as Cesium from "cesium";
import type { MeasurementPointConfig } from "../types/projectConfig";
import { beliefColors } from "./cesiumStyles";

export function formatDoseRate(point: MeasurementPointConfig): string {
  return `${point.doseRate.toFixed(2)} ${point.doseRateUnit}`;
}

export function formatContamination(point: MeasurementPointConfig): string {
  return `${point.contamination} ${point.contaminationUnit}`;
}

export function buildPointLabel(point: MeasurementPointConfig): string {
  return `${point.id} (${point.belief})\n${formatDoseRate(point)}`;
}

export function buildPointDescription(point: MeasurementPointConfig): string {
  return `
    <strong>${point.name}</strong><br />
    Belief state: ${point.belief}<br />
    Dose rate: ${formatDoseRate(point)}<br />
    Contamination: ${formatContamination(point)}<br />
    Last reading: ${point.lastReading}
  `;
}

export function createMeasurementPointEntity(
  viewer: Cesium.Viewer,
  point: MeasurementPointConfig,
): Cesium.Entity {
  return viewer.entities.add({
    id: point.id,
    name: point.name,
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.height),
    point: {
      pixelSize: 14,
      color: beliefColors[point.belief],
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    label: {
      text: buildPointLabel(point),
      font: "14px sans-serif",
      pixelOffset: new Cesium.Cartesian2(0, -24),
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    description: buildPointDescription(point),
    properties: {
      entityType: "measurementPoint",
      pointId: point.id,
    },
  });
}

export function updateMeasurementPointEntity(
  entity: Cesium.Entity,
  point: MeasurementPointConfig,
): void {
  if (entity.point) {
    entity.point.color = new Cesium.ConstantProperty(beliefColors[point.belief]);
  }

  if (entity.label) {
    entity.label.text = new Cesium.ConstantProperty(buildPointLabel(point));
  }

  entity.description = new Cesium.ConstantProperty(buildPointDescription(point));
}
