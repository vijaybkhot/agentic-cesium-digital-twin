import * as Cesium from "cesium";
import type {
  UrbanCameraTarget,
  UrbanCoordinate,
  UrbanResilienceScenario,
} from "../types/urbanResilience";

export const URBAN_CAMERA_DURATION_SECONDS = 1.2;
export const URBAN_OVERALL_CAMERA_RANGE_M = 32_000;
export const URBAN_FLOOD_CAMERA_RANGE_M = 6_000;
export const URBAN_PROPERTY_CAMERA_RANGE_M = 120;

const URBAN_OVERALL_CAMERA_PITCH = Cesium.Math.toRadians(-62);
const URBAN_FLOOD_CAMERA_PITCH = Cesium.Math.toRadians(-55);
const URBAN_PROPERTY_CAMERA_PITCH = Cesium.Math.toRadians(-42);

function pointFromCoordinate(coordinate: UrbanCoordinate, fallbackHeightM = 0): Cesium.Cartesian3 {
  return Cesium.Cartesian3.fromDegrees(coordinate.lon, coordinate.lat, coordinate.height ?? fallbackHeightM);
}

function getEntityFootprintPoints(entities: ReadonlyMap<string, Cesium.Entity>): Cesium.Cartesian3[] {
  const time = Cesium.JulianDate.now();

  return [...entities.values()].flatMap((entity) => {
    const hierarchy = entity.polygon?.hierarchy?.getValue(time) as
      | Cesium.PolygonHierarchy
      | undefined;

    return hierarchy?.positions ?? [];
  });
}

function getSelectedPropertyPoints(
  propertyEntities: ReadonlyMap<string, Cesium.Entity>,
  selectedPropertyId: string | null,
): Cesium.Cartesian3[] {
  if (!selectedPropertyId) {
    return [];
  }

  const entity = propertyEntities.get(selectedPropertyId);
  const time = Cesium.JulianDate.now();
  const hierarchy = entity?.polygon?.hierarchy?.getValue(time) as
    | Cesium.PolygonHierarchy
    | undefined;

  return hierarchy?.positions ?? [];
}

function flyToPoints(
  viewer: Cesium.Viewer,
  points: Cesium.Cartesian3[],
  pitch: number,
  range: number,
): boolean {
  if (viewer.isDestroyed() || points.length === 0) {
    return false;
  }

  const boundingSphere = Cesium.BoundingSphere.fromPoints(points);

  viewer.camera.flyToBoundingSphere(boundingSphere, {
    offset: new Cesium.HeadingPitchRange(0, pitch, Math.max(range, boundingSphere.radius * 1.3)),
    duration: URBAN_CAMERA_DURATION_SECONDS,
  });
  return true;
}

export function flyToUrbanResilienceScenarioTarget(
  viewer: Cesium.Viewer,
  scenario: UrbanResilienceScenario,
  target: UrbanCameraTarget,
  propertyEntities: ReadonlyMap<string, Cesium.Entity>,
  floodZoneEntities: ReadonlyMap<string, Cesium.Entity>,
  selectedPropertyId: string | null,
): boolean {
  if (target === "selected-property") {
    return flyToPoints(
      viewer,
      getSelectedPropertyPoints(propertyEntities, selectedPropertyId),
      URBAN_PROPERTY_CAMERA_PITCH,
      URBAN_PROPERTY_CAMERA_RANGE_M,
    );
  }

  const floodPoints = getEntityFootprintPoints(floodZoneEntities);

  if (target === "flood") {
    return flyToPoints(viewer, floodPoints, URBAN_FLOOD_CAMERA_PITCH, URBAN_FLOOD_CAMERA_RANGE_M);
  }

  const overallPoints = [
    ...floodPoints,
    ...scenario.routes.flatMap((route) => route.positions.map((coordinate) => pointFromCoordinate(coordinate))),
    ...scenario.resources.map((resource) => pointFromCoordinate(resource.location)),
    ...getEntityFootprintPoints(propertyEntities),
  ];

  return flyToPoints(viewer, overallPoints, URBAN_OVERALL_CAMERA_PITCH, URBAN_OVERALL_CAMERA_RANGE_M);
}
