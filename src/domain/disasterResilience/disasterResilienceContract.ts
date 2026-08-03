import type { DisasterRiskLevel } from "../../types/disasterResilience";

export const DISASTER_DEMO_DISCLAIMER =
  "Demonstration only. Not for real emergency use.";

export const MOCK_FLOOD_LAYER_LABEL =
  "Mock HEC-RAS-style flood-depth layer.";

export const DISASTER_RISK_LEVELS = [
  "Low",
  "Moderate",
  "High",
] as const satisfies readonly DisasterRiskLevel[];

export function isDisasterRiskLevel(
  value: unknown,
): value is DisasterRiskLevel {
  return (
    typeof value === "string" &&
    DISASTER_RISK_LEVELS.some((riskLevel) => riskLevel === value)
  );
}
