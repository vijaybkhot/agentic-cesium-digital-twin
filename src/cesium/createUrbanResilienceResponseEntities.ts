import * as Cesium from "cesium";
import { formatUrbanRouteStatus } from "../domain/urbanResilience/formatUrbanRouteStatus";
import { urbanResilienceVisualColors } from "../theme/urbanResilienceVisualTokens";
import type { UrbanResourceSite, UrbanResponseRoute } from "../types/urbanResilience";

export const URBAN_ROUTE_HEIGHT_M = 4;
export const URBAN_ROUTE_WIDTH_PX = 6;
export const URBAN_RESPONSE_LABEL_MAX_DISTANCE_M = 8_000;

export const urbanResourceColor = Cesium.Color.fromCssColorString(
  urbanResilienceVisualColors.resource,
);
export const urbanRouteColor = Cesium.Color.fromCssColorString(urbanResilienceVisualColors.route);

export interface UrbanResponseEntities {
  resourceEntities: Cesium.Entity[];
  routeEntities: Cesium.Entity[];
}

function routeLabelPosition(route: UrbanResponseRoute): Cesium.Cartesian3 {
  const midpoint = route.positions[Math.floor(route.positions.length / 2)];

  return Cesium.Cartesian3.fromDegrees(midpoint.lon, midpoint.lat, URBAN_ROUTE_HEIGHT_M + 2);
}

function createResourceEntity(viewer: Cesium.Viewer, resource: UrbanResourceSite): Cesium.Entity {
  return viewer.entities.add({
    id: `urban-resource:${resource.id}`,
    name: resource.name,
    position: Cesium.Cartesian3.fromDegrees(resource.location.lon, resource.location.lat, 5),
    point: {
      pixelSize: 16,
      color: urbanResourceColor,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: resource.name,
      font: "bold 13px sans-serif",
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: urbanResourceColor,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 4,
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      pixelOffset: new Cesium.Cartesian2(14, 0),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        0,
        URBAN_RESPONSE_LABEL_MAX_DISTANCE_M,
      ),
    },
    properties: {
      entityType: "urbanResource",
      urbanResourceId: resource.id,
    },
  });
}

function createRouteEntity(viewer: Cesium.Viewer, route: UrbanResponseRoute): Cesium.Entity {
  const routeStatusLabel = formatUrbanRouteStatus(route.status);

  return viewer.entities.add({
    id: `urban-route:${route.id}`,
    name: route.name,
    position: routeLabelPosition(route),
    polyline: {
      positions: route.positions.map((coordinate) =>
        Cesium.Cartesian3.fromDegrees(coordinate.lon, coordinate.lat, URBAN_ROUTE_HEIGHT_M),
      ),
      width: URBAN_ROUTE_WIDTH_PX,
      clampToGround: false,
      material: new Cesium.PolylineOutlineMaterialProperty({
        color: urbanRouteColor,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      }),
    },
    label: {
      text: `${route.name}\nStatus: ${routeStatusLabel}`,
      font: "bold 12px sans-serif",
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: urbanRouteColor,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 4,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        0,
        URBAN_RESPONSE_LABEL_MAX_DISTANCE_M,
      ),
    },
    properties: {
      entityType: "urbanResponseRoute",
      urbanRouteId: route.id,
      urbanRouteStatus: route.status,
    },
  });
}

export function createUrbanResilienceResponseEntities(
  viewer: Cesium.Viewer,
  resources: UrbanResourceSite[],
  routes: UrbanResponseRoute[],
): UrbanResponseEntities {
  return {
    resourceEntities: resources.map((resource) => createResourceEntity(viewer, resource)),
    routeEntities: routes
      .filter((route) => route.positions.length >= 2)
      .map((route) => createRouteEntity(viewer, route)),
  };
}
