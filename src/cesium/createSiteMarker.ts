import * as Cesium from "cesium";
import type { SiteMarkerConfig } from "../types/projectConfig";

export function createSiteMarker(
  viewer: Cesium.Viewer,
  marker: SiteMarkerConfig,
): Cesium.Entity {
  return viewer.entities.add({
    id: "projectSiteMarker",
    name: marker.label,
    position: Cesium.Cartesian3.fromDegrees(
      marker.lon,
      marker.lat,
      marker.height,
    ),
    point: {
      pixelSize: 16,
      color: Cesium.Color.DEEPSKYBLUE,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
    },
    label: {
      text: marker.label,
      font: "14px sans-serif",
      pixelOffset: new Cesium.Cartesian2(0, -26),
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    properties: {
      entityType: "siteMarker",
    },
  });
}
