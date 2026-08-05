import * as Cesium from "cesium";
import type {
  DisasterCameraTarget,
  DisasterCoordinate,
  DisasterResilienceScenario,
} from "../types/disasterResilience";

export const DISASTER_CAMERA_DURATION_SECONDS = 1;
export const DISASTER_OVERALL_CAMERA_RANGE_M = 900;
export const DISASTER_FLOOD_CAMERA_RANGE_M = 360;
export const DISASTER_PROPERTY_CAMERA_RANGE_M = 95;

const DISASTER_OVERALL_CAMERA_PITCH = Cesium.Math.toRadians(-58);
const DISASTER_FLOOD_CAMERA_PITCH = Cesium.Math.toRadians(-52);
const DISASTER_PROPERTY_CAMERA_PITCH = Cesium.Math.toRadians(-42);

function pointFromCoordinate(
  coordinate: DisasterCoordinate,
  fallbackHeightM = 0,
): Cesium.Cartesian3 {
  return Cesium.Cartesian3.fromDegrees(
    coordinate.lon,
    coordinate.lat,
    coordinate.height ?? fallbackHeightM,
  );
}

function getPropertyFootprintPoints(
  propertyEntities: ReadonlyMap<string, Cesium.Entity>,
): Cesium.Cartesian3[] {
  const time = Cesium.JulianDate.now();

  return [...propertyEntities.values()].flatMap((entity) => {
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
    offset: new Cesium.HeadingPitchRange(0, pitch, range),
    duration: DISASTER_CAMERA_DURATION_SECONDS,
  });
  return true;
}

export function flyToDisasterScenarioTarget(
  viewer: Cesium.Viewer,
  scenario: DisasterResilienceScenario,
  target: DisasterCameraTarget,
  propertyEntities: ReadonlyMap<string, Cesium.Entity>,
  selectedPropertyId: string | null,
): boolean {
  if (target === "selected-property") {
    return flyToPoints(
      viewer,
      getSelectedPropertyPoints(propertyEntities, selectedPropertyId),
      DISASTER_PROPERTY_CAMERA_PITCH,
      DISASTER_PROPERTY_CAMERA_RANGE_M,
    );
  }

  const floodPoints = scenario.floodLayer.boundary.map((coordinate) =>
    pointFromCoordinate(coordinate),
  );

  if (target === "flood") {
    return flyToPoints(
      viewer,
      floodPoints,
      DISASTER_FLOOD_CAMERA_PITCH,
      DISASTER_FLOOD_CAMERA_RANGE_M,
    );
  }

  const overallPoints = [
    ...floodPoints,
    ...scenario.route.positions.map((coordinate) =>
      pointFromCoordinate(coordinate),
    ),
    pointFromCoordinate(scenario.shelter.location),
    ...getPropertyFootprintPoints(propertyEntities),
  ];

  return flyToPoints(
    viewer,
    overallPoints,
    DISASTER_OVERALL_CAMERA_PITCH,
    DISASTER_OVERALL_CAMERA_RANGE_M,
  );
}
