import * as Cesium from "cesium";
import { formatDisasterRouteStatus } from "../domain/disasterResilience/formatDisasterRouteStatus";
import { disasterResilienceVisualColors } from "../theme/disasterResilienceVisualTokens";
import type {
  DisasterResponseRoute,
  DisasterShelter,
} from "../types/disasterResilience";

export const DISASTER_RESPONSE_ROUTE_HEIGHT_M = 4;
export const DISASTER_RESPONSE_ROUTE_WIDTH_PX = 7;
export const DISASTER_RESPONSE_LABEL_MAX_DISTANCE_M = 1_500;

export const disasterShelterColor =
  Cesium.Color.fromCssColorString(disasterResilienceVisualColors.shelter);
export const disasterRouteColor =
  Cesium.Color.fromCssColorString(disasterResilienceVisualColors.route);

export interface DisasterResponseEntities {
  shelterEntity: Cesium.Entity;
  routeEntity: Cesium.Entity;
}

function routeLabelPosition(
  route: DisasterResponseRoute,
): Cesium.Cartesian3 {
  const midpoint = route.positions[Math.floor(route.positions.length / 2)];

  return Cesium.Cartesian3.fromDegrees(
    midpoint.lon,
    midpoint.lat,
    DISASTER_RESPONSE_ROUTE_HEIGHT_M + 2,
  );
}

export function createDisasterResponseEntities(
  viewer: Cesium.Viewer,
  shelter: DisasterShelter,
  route: DisasterResponseRoute,
): DisasterResponseEntities {
  if (route.positions.length < 2) {
    throw new Error("Disaster response route requires at least two positions.");
  }

  const routeStatusLabel = formatDisasterRouteStatus(route.status);
  const shelterEntity = viewer.entities.add({
    id: `disaster-shelter:${shelter.id}`,
    name: shelter.name,
    position: Cesium.Cartesian3.fromDegrees(
      shelter.location.lon,
      shelter.location.lat,
      5,
    ),
    point: {
      pixelSize: 18,
      color: disasterShelterColor,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 4,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: shelter.name,
      font: "bold 14px sans-serif",
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: disasterShelterColor,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 4,
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      pixelOffset: new Cesium.Cartesian2(16, 0),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        0,
        DISASTER_RESPONSE_LABEL_MAX_DISTANCE_M,
      ),
    },
    properties: {
      entityType: "disasterShelter",
      disasterShelterId: shelter.id,
    },
  });

  const routeEntity = viewer.entities.add({
    id: `disaster-route:${route.id}`,
    name: route.name,
    position: routeLabelPosition(route),
    polyline: {
      positions: route.positions.map((coordinate) =>
        Cesium.Cartesian3.fromDegrees(
          coordinate.lon,
          coordinate.lat,
          DISASTER_RESPONSE_ROUTE_HEIGHT_M,
        ),
      ),
      width: DISASTER_RESPONSE_ROUTE_WIDTH_PX,
      clampToGround: false,
      material: new Cesium.PolylineOutlineMaterialProperty({
        color: disasterRouteColor,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      }),
    },
    label: {
      text: `Mock route status: ${routeStatusLabel}`,
      font: "bold 13px sans-serif",
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: disasterRouteColor,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 4,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        0,
        DISASTER_RESPONSE_LABEL_MAX_DISTANCE_M,
      ),
    },
    properties: {
      entityType: "disasterResponseRoute",
      disasterRouteId: route.id,
      disasterRouteStatus: route.status,
    },
  });

  return { shelterEntity, routeEntity };
}
