import * as Cesium from "cesium";
import type { FacilityConfig } from "../types/projectConfig";

export function createFacilityBuilding(
  viewer: Cesium.Viewer,
  facility: FacilityConfig,
): Cesium.Entity {
  const building = facility.building;

  return viewer.entities.add({
    name: "Mock Facility Core",
    position: Cesium.Cartesian3.fromDegrees(
      building.lon,
      building.lat,
      building.height,
    ),
    box: {
      dimensions: new Cesium.Cartesian3(
        building.dimensions.length,
        building.dimensions.width,
        building.dimensions.height,
      ),
      material: Cesium.Color.SLATEGRAY.withAlpha(0.9),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
    },
    description: "Simple facility building used as the main site landmark.",
  });
}
