import type {
  BeliefRules,
  MeasurementPointConfig,
} from "../../types/projectConfig";

interface ThresholdGuideProps {
  beliefRules: BeliefRules | null;
  selectedPoint: MeasurementPointConfig | null;
}

function formatThreshold(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function ThresholdGuide({
  beliefRules,
  selectedPoint,
}: ThresholdGuideProps) {
  const doseRateUnit = selectedPoint?.doseRateUnit ?? "uSv/h";
  const contaminationUnit = selectedPoint?.contaminationUnit ?? "cpm";

  if (!beliefRules) {
    return null;
  }

  return (
    <div className="threshold-guide">
      <div className="threshold-row threshold-low">
        <strong>Low</strong>
        <span>
          dose rate &lt;= {formatThreshold(beliefRules.doseRate.lowMax)}{" "}
          {doseRateUnit} and contamination &lt;= {" "}
          {formatThreshold(beliefRules.contamination.lowMax)}{" "}
          {contaminationUnit}
        </span>
      </div>
      <div className="threshold-row threshold-medium">
        <strong>Medium</strong>
        <span>
          dose rate &gt; {formatThreshold(beliefRules.doseRate.lowMax)} to{" "}
          {formatThreshold(beliefRules.doseRate.mediumMax)} {doseRateUnit} or
          contamination &gt; {formatThreshold(
            beliefRules.contamination.lowMax,
          )}{" "}
          to {formatThreshold(beliefRules.contamination.mediumMax)}{" "}
          {contaminationUnit}
        </span>
      </div>
      <div className="threshold-row threshold-high">
        <strong>High</strong>
        <span>
          dose rate &gt; {formatThreshold(beliefRules.doseRate.mediumMax)}{" "}
          {doseRateUnit} or contamination &gt;{" "}
          {formatThreshold(beliefRules.contamination.mediumMax)}{" "}
          {contaminationUnit}
        </span>
      </div>
    </div>
  );
}
