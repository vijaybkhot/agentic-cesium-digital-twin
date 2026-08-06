import * as Cesium from "cesium";
import { hasCesiumIonAccessToken } from "../config/cesiumIon";

export const DISASTER_OSM_BUILDINGS_ALPHA = 0.55;

export async function createOptionalOsmBuildings(): Promise<
  Cesium.Cesium3DTileset | null
> {
  if (!hasCesiumIonAccessToken()) {
    return null;
  }

  return Cesium.createOsmBuildingsAsync({
    enableShowOutline: false,
    showOutline: false,
    style: new Cesium.Cesium3DTileStyle({
      color: `color('white', ${DISASTER_OSM_BUILDINGS_ALPHA})`,
    }),
  });
}
