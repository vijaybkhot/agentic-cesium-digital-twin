import type { ModelAssetConfig } from "../types/projectConfig";

export type ModelAssetViewerSupportStatus =
  | "renderable"
  | "conversion-required"
  | "future-supported"
  | "not-rendered";

export interface ModelAssetViewerSupport {
  status: ModelAssetViewerSupportStatus;
  label: string;
  message: string;
  canRenderInCurrentCesiumViewer: boolean;
}

export function getModelAssetViewerSupport(
  asset: ModelAssetConfig,
): ModelAssetViewerSupport {
  const assetUrl = asset.assetUrl.toLowerCase();
  const isPlyPointCloud =
    asset.assetType === "point-cloud" || assetUrl.endsWith(".ply");

  if (asset.status !== "ready") {
    return {
      status: "not-rendered",
      label: "Not rendered",
      message:
        "This asset is recognized in the config, but it is not ready for display yet.",
      canRenderInCurrentCesiumViewer: false,
    };
  }

  if (asset.assetType === "glb") {
    return {
      status: "renderable",
      label: "Rendered in Cesium",
      message:
        "GLB is the currently supported model format for direct Cesium rendering in this POC.",
      canRenderInCurrentCesiumViewer: true,
    };
  }

  if (isPlyPointCloud) {
    return {
      status: "conversion-required",
      label: "Conversion required",
      message:
        "PLY point cloud output is recognized as pipeline-native data, but conversion to GLB or 3D Tiles is required before Cesium rendering.",
      canRenderInCurrentCesiumViewer: false,
    };
  }

  if (asset.assetType === "3d-tiles") {
    return {
      status: "future-supported",
      label: "Future Cesium path",
      message:
        "3D Tiles is the planned Cesium path for large geospatial model or point-cloud outputs, but tileset rendering is not implemented in this POC.",
      canRenderInCurrentCesiumViewer: false,
    };
  }

  return {
    status: "conversion-required",
    label: "Conversion required",
    message:
      "This pipeline-native asset is recognized, but it must be converted to a viewer-ready format before Cesium can display it.",
    canRenderInCurrentCesiumViewer: false,
  };
}
