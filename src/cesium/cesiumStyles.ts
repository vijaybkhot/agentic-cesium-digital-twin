import * as Cesium from "cesium";
import type { BeliefState } from "../types/belief";

export const beliefColors: Record<BeliefState, Cesium.Color> = {
  Low: Cesium.Color.LIMEGREEN,
  Medium: Cesium.Color.GOLD,
  High: Cesium.Color.ORANGERED,
};
