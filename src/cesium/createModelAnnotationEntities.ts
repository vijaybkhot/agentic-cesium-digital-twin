import * as Cesium from "cesium";
import type {
  MeasurementPointConfig,
  ModelAnnotationConfig,
  ModelAssetConfig,
} from "../types/projectConfig";
import { formatDoseRate } from "./createMeasurementPointEntities";
import { modelLocalPositionToWorld } from "./modelAssetTransforms";

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildAnnotationDescription(
  annotation: ModelAnnotationConfig,
  linkedPoint?: MeasurementPointConfig,
): string {
  const { x, y, z } = annotation.localPosition;
  const linkedSensorDescription = linkedPoint
    ? `Linked sensor: ${escapeHtml(linkedPoint.id)} (${escapeHtml(linkedPoint.name)})<br />
    Belief state: ${escapeHtml(linkedPoint.belief)}<br />
    Dose rate: ${escapeHtml(formatDoseRate(linkedPoint))}<br />`
    : "";

  return `
    <strong>${escapeHtml(annotation.label)}</strong><br />
    Model: ${escapeHtml(annotation.modelAssetId)}<br />
    Local ENU position: (${escapeHtml(x)}, ${escapeHtml(y)}, ${escapeHtml(z)}) m<br />
    ${linkedSensorDescription}
    ${escapeHtml(annotation.description ?? "")}
  `;
}

function buildAnnotationLabel(
  annotation: ModelAnnotationConfig,
  linkedPoint?: MeasurementPointConfig,
): string {
  if (!linkedPoint) {
    return annotation.label;
  }

  return `${annotation.label}\n${linkedPoint.id} (${linkedPoint.belief})\n${formatDoseRate(linkedPoint)}`;
}

export function applyModelAnnotationVisualState(
  entity: Cesium.Entity,
  isSelected: boolean,
): void {
  if (entity.point) {
    entity.point.pixelSize = new Cesium.ConstantProperty(isSelected ? 21 : 13);
    entity.point.color = new Cesium.ConstantProperty(
      isSelected ? Cesium.Color.YELLOW : Cesium.Color.CYAN,
    );
    entity.point.outlineColor = new Cesium.ConstantProperty(Cesium.Color.BLACK);
    entity.point.outlineWidth = new Cesium.ConstantProperty(isSelected ? 4 : 2);
  }

  if (entity.label) {
    entity.label.fillColor = new Cesium.ConstantProperty(
      isSelected ? Cesium.Color.YELLOW : Cesium.Color.WHITE,
    );
  }
}

export function createModelAnnotationEntity(
  viewer: Cesium.Viewer,
  annotation: ModelAnnotationConfig,
  asset: ModelAssetConfig,
  linkedPoint?: MeasurementPointConfig,
): Cesium.Entity {
  return viewer.entities.add({
    id: `modelAnnotation:${annotation.id}`,
    name: annotation.label,
    position: modelLocalPositionToWorld(asset, annotation.localPosition),
    point: {
      pixelSize: 13,
      color: Cesium.Color.CYAN,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    label: {
      text: buildAnnotationLabel(annotation, linkedPoint),
      font: "13px sans-serif",
      pixelOffset: new Cesium.Cartesian2(0, -26),
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    description: buildAnnotationDescription(annotation, linkedPoint),
    properties: {
      entityType: "modelAnnotation",
      annotationId: annotation.id,
      modelAssetId: annotation.modelAssetId,
    },
  });
}
