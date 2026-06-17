import * as Cesium from "cesium";

function createBaseLayer(): Cesium.ImageryLayer {
  const ionAccessToken = import.meta.env.VITE_CESIUM_ION_ACCESS_TOKEN;

  if (ionAccessToken) {
    Cesium.Ion.defaultAccessToken = ionAccessToken;
    return Cesium.ImageryLayer.fromWorldImagery({});
  }

  return Cesium.ImageryLayer.fromProviderAsync(
    Cesium.TileMapServiceImageryProvider.fromUrl(
      Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
    ),
  );
}

export function createCesiumViewer(container: HTMLElement): Cesium.Viewer {
  const viewer = new Cesium.Viewer(container, {
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    baseLayer: createBaseLayer(),
    geocoder: false,
    infoBox: false,
    selectionIndicator: false,
  });

  viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
  viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
  viewer.scene.screenSpaceCameraController.inertiaZoom = 0;

  return viewer;
}
