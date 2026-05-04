import * as Cesium from "cesium";

export function createCesiumViewer(container: HTMLElement): Cesium.Viewer {
  const viewer = new Cesium.Viewer(container, {
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    infoBox: false,
    selectionIndicator: false,
  });

  viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
  viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
  viewer.scene.screenSpaceCameraController.inertiaZoom = 0;

  return viewer;
}
