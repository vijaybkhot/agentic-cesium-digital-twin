import * as Cesium from "cesium";
import type {
  LocalModelPosition,
  ModelAssetConfig,
} from "../types/projectConfig";

export function createModelAssetPosition(
  asset: ModelAssetConfig,
): Cesium.Cartesian3 {
  return Cesium.Cartesian3.fromDegrees(
    asset.spatialAnchor.lon,
    asset.spatialAnchor.lat,
    asset.spatialAnchor.height,
  );
}

export function createModelAssetOrientation(
  asset: ModelAssetConfig,
  position = createModelAssetPosition(asset),
): Cesium.Quaternion {
  return Cesium.Transforms.headingPitchRollQuaternion(
    position,
    Cesium.HeadingPitchRoll.fromDegrees(
      asset.orientation.heading,
      asset.orientation.pitch,
      asset.orientation.roll,
    ),
  );
}

export function modelLocalPositionToWorld(
  asset: ModelAssetConfig,
  localPosition: LocalModelPosition,
): Cesium.Cartesian3 {
  const anchor = createModelAssetPosition(asset);
  const localToWorld = Cesium.Transforms.headingPitchRollToFixedFrame(
    anchor,
    Cesium.HeadingPitchRoll.fromDegrees(
      asset.orientation.heading,
      asset.orientation.pitch,
      asset.orientation.roll,
    ),
  );
  const scaledLocalPosition = new Cesium.Cartesian3(
    localPosition.x * asset.scale,
    localPosition.y * asset.scale,
    localPosition.z * asset.scale,
  );

  return Cesium.Matrix4.multiplyByPoint(
    localToWorld,
    scaledLocalPosition,
    new Cesium.Cartesian3(),
  );
}
