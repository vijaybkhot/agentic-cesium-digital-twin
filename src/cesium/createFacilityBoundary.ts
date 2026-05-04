import * as Cesium from "cesium";
import type { FacilityConfig } from "../types/projectConfig";

export function createFacilityBoundary(
  viewer: Cesium.Viewer,
  facility: FacilityConfig,
): Cesium.Entity {
  const degrees = facility.boundary.flatMap((coordinate) => [
    coordinate.lon,
    coordinate.lat,
  ]);

  return viewer.entities.add({
    name: "Controlled Area",
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(degrees),
      material: Cesium.Color.CORNFLOWERBLUE.withAlpha(0.2),
      outline: true,
      outlineColor: Cesium.Color.CORNFLOWERBLUE,
    },
    description: "Mock controlled boundary for the decommissioning work zone.",
  });
}
