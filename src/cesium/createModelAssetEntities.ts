import * as Cesium from "cesium";
import type { ModelAssetConfig } from "../types/projectConfig";

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildModelDescription(asset: ModelAssetConfig): string {
  return `
    <strong>${escapeHtml(asset.assetId)}</strong><br />
    Type: ${escapeHtml(asset.assetType)}<br />
    Source: ${escapeHtml(asset.sourcePipeline)}<br />
    Status: ${escapeHtml(asset.status)}<br />
    Scale: ${escapeHtml(asset.scale)}
  `;
}

export function createModelAssetEntity(
  viewer: Cesium.Viewer,
  asset: ModelAssetConfig,
): Cesium.Entity | null {
  if (asset.assetType !== "glb" || asset.status !== "ready") {
    return null;
  }

  const position = Cesium.Cartesian3.fromDegrees(
    asset.spatialAnchor.lon,
    asset.spatialAnchor.lat,
    asset.spatialAnchor.height,
  );
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    Cesium.HeadingPitchRoll.fromDegrees(
      asset.orientation.heading,
      asset.orientation.pitch,
      asset.orientation.roll,
    ),
  );

  return viewer.entities.add({
    id: `modelAsset:${asset.assetId}`,
    name: asset.assetId,
    position,
    orientation,
    model: {
      uri: asset.assetUrl,
      scale: asset.scale,
      minimumPixelSize: 64,
    },
    description: buildModelDescription(asset),
    properties: {
      entityType: "modelAsset",
      assetId: asset.assetId,
    },
  });
}
