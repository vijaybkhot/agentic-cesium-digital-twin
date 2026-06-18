import * as Cesium from "cesium";
import type {
  ModelAnnotationConfig,
  ModelAssetConfig,
} from "../types/projectConfig";
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
): string {
  const { x, y, z } = annotation.localPosition;

  return `
    <strong>${escapeHtml(annotation.label)}</strong><br />
    Model: ${escapeHtml(annotation.modelAssetId)}<br />
    Local ENU position: (${escapeHtml(x)}, ${escapeHtml(y)}, ${escapeHtml(z)}) m<br />
    ${escapeHtml(annotation.description ?? "")}
  `;
}

export function createModelAnnotationEntity(
  viewer: Cesium.Viewer,
  annotation: ModelAnnotationConfig,
  asset: ModelAssetConfig,
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
      text: annotation.label,
      font: "13px sans-serif",
      pixelOffset: new Cesium.Cartesian2(0, -22),
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    description: buildAnnotationDescription(annotation),
    properties: {
      entityType: "modelAnnotation",
      annotationId: annotation.id,
      modelAssetId: annotation.modelAssetId,
    },
  });
}
