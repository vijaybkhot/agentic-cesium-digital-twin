import { calculateBeliefState } from "../belief/beliefCalculator";
import type { ProjectConfig } from "../../types/projectConfig";

export function normalizeProjectConfig(config: ProjectConfig): ProjectConfig {
  return {
    ...config,
    // The live decision state starts from measurements. The config belief is
    // accepted as input shape, then normalized so thresholds remain authoritative.
    measurementPoints: config.measurementPoints.map((point) => ({
      ...point,
      belief: calculateBeliefState(
        point.doseRate,
        point.contamination,
        config.beliefRules,
      ),
    })),
  };
}
