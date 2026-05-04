import type { BeliefState } from "../../types/belief";
import type { BeliefRules } from "../../types/projectConfig";

export function calculateBeliefState(
  doseRate: number,
  contamination: number,
  beliefRules: BeliefRules,
): BeliefState {
  if (
    doseRate > beliefRules.doseRate.mediumMax ||
    contamination > beliefRules.contamination.mediumMax
  ) {
    return "High";
  }

  if (
    doseRate > beliefRules.doseRate.lowMax ||
    contamination > beliefRules.contamination.lowMax
  ) {
    return "Medium";
  }

  return "Low";
}
