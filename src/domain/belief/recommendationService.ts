import type { BeliefState } from "../../types/belief";
import type { MeasurementPointConfig } from "../../types/projectConfig";

const beliefRecommendations: Record<BeliefState, string> = {
  Low: "Continue routine monitoring. No immediate intervention is recommended.",
  Medium:
    "Flag for analyst review and schedule a follow-up measurement on the next shift.",
  High: "Escalate for supervisor review and prioritize field verification of this area.",
};

export function getRecommendationForBelief(belief: BeliefState): string {
  return beliefRecommendations[belief];
}

export function getRecommendationForPoint(point: MeasurementPointConfig): string {
  const measurementContext = `Current readings: ${point.doseRate.toFixed(2)} ${
    point.doseRateUnit
  } dose rate, ${point.contamination} ${
    point.contaminationUnit
  } contamination.`;

  return `${getRecommendationForBelief(point.belief)} ${measurementContext}`;
}
