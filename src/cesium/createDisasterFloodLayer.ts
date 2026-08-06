import * as Cesium from "cesium";
import { disasterResilienceVisualColors } from "../theme/disasterResilienceVisualTokens";
import type { DisasterFloodLayer } from "../types/disasterResilience";

export const FEET_TO_METERS = 0.3048;
export const DISASTER_FLOOD_BASE_HEIGHT_M = 0.15;
export const DISASTER_FLOOD_MATERIAL_ALPHA = 0.26;
export const DISASTER_FLOOD_LABEL_MAX_DISTANCE_M = 2_000;

export const disasterFloodColor =
  Cesium.Color.fromCssColorString(disasterResilienceVisualColors.flood);
export const disasterFloodOutlineColor =
  Cesium.Color.fromCssColorString(disasterResilienceVisualColors.floodOutline);

export function getDisasterFloodVisualDepthM(
  floodLayer: DisasterFloodLayer,
): number {
  return (
    floodLayer.representativeDepthFt *
    FEET_TO_METERS *
    floodLayer.visualHeightScaleMultiplier
  );
}

function getFloodLabelCoordinate(floodLayer: DisasterFloodLayer): {
  lat: number;
  lon: number;
} {
  const longitudeTotal = floodLayer.boundary.reduce(
    (total, coordinate) => total + coordinate.lon,
    0,
  );

  return {
    lat: Math.min(...floodLayer.boundary.map((coordinate) => coordinate.lat)),
    lon: longitudeTotal / floodLayer.boundary.length,
  };
}

export function createDisasterFloodLayer(
  viewer: Cesium.Viewer,
  floodLayer: DisasterFloodLayer,
): Cesium.Entity {
  if (floodLayer.boundary.length < 3) {
    throw new Error("Disaster flood boundary requires at least three points.");
  }

  const visualDepthM = getDisasterFloodVisualDepthM(floodLayer);

  if (!Number.isFinite(visualDepthM) || visualDepthM <= 0) {
    throw new Error("Disaster flood visual depth must be positive.");
  }

  const topHeightM = DISASTER_FLOOD_BASE_HEIGHT_M + visualDepthM;
  const labelCoordinate = getFloodLabelCoordinate(floodLayer);
  const hierarchy = floodLayer.boundary.map((coordinate) =>
    Cesium.Cartesian3.fromDegrees(coordinate.lon, coordinate.lat),
  );

  return viewer.entities.add({
    id: `disaster-flood:${floodLayer.id}`,
    name: floodLayer.label,
    position: Cesium.Cartesian3.fromDegrees(
      labelCoordinate.lon,
      labelCoordinate.lat,
      topHeightM + 0.75,
    ),
    polygon: {
      hierarchy,
      height: DISASTER_FLOOD_BASE_HEIGHT_M,
      heightReference: Cesium.HeightReference.NONE,
      extrudedHeight: topHeightM,
      extrudedHeightReference: Cesium.HeightReference.NONE,
      perPositionHeight: false,
      material: disasterFloodColor.withAlpha(
        DISASTER_FLOOD_MATERIAL_ALPHA,
      ),
      outline: true,
      outlineColor: disasterFloodOutlineColor,
      closeTop: true,
      closeBottom: true,
    },
    label: {
      text: floodLayer.label,
      font: "bold 14px sans-serif",
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.fromCssColorString("#075985"),
      outlineWidth: 4,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
      heightReference: Cesium.HeightReference.NONE,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        0,
        DISASTER_FLOOD_LABEL_MAX_DISTANCE_M,
      ),
    },
    properties: {
      entityType: "disasterFloodLayer",
      disasterFloodLayerId: floodLayer.id,
      representativeDepthFt: floodLayer.representativeDepthFt,
      visualDepthM,
    },
  });
}
