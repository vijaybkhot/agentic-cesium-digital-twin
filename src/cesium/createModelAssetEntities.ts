import * as Cesium from "cesium";
import type { ModelAssetConfig } from "../types/projectConfig";

function buildModelDescription(asset: ModelAssetConfig): string {
  return `
    <strong>${asset.assetId}</strong><br />
    Type: ${asset.assetType}<br />
    Source: ${asset.sourcePipeline}<br />
    Status: ${asset.status}<br />
    Scale: ${asset.scale}
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
    id: asset.assetId,
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
