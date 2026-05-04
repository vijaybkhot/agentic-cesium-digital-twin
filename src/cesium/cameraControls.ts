import * as Cesium from "cesium";
import type { ProjectConfig } from "../types/projectConfig";

export function flyToProject(viewer: Cesium.Viewer, config: ProjectConfig): void {
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      config.scene.center.lon,
      config.scene.center.lat,
      config.scene.camera.range,
    ),
    orientation: {
      heading: config.scene.camera.heading,
      pitch: config.scene.camera.pitch,
      roll: 0,
    },
  });
}
