import type {
  ImageIntakeSummary,
  ReconstructionReadinessResult,
} from "../../types/imageIntake";

function formatStatus(status: ReconstructionReadinessResult["status"]): string {
  if (status === "ready_for_initial_test") {
    return "ready for an initial reconstruction test";
  }

  if (status === "needs_review") {
    return "possibly enough for a rough reconstruction test, but review is recommended before relying on the result";
  }

  return "not ready for reconstruction";
}

function formatList(title: string, values: string[]): string {
  if (values.length === 0) {
    return `${title}\n- None flagged`;
  }

  return `${title}\n${values.map((value) => `- ${value}`).join("\n")}`;
}

export function formatImageIntakeAssistantMessage(review: {
  summary: ImageIntakeSummary;
  readiness: ReconstructionReadinessResult;
}): string {
  const imageLabel = review.summary.imageCount === 1 ? "image" : "images";

  return [
    "Image Intake Review:",
    `I found ${review.summary.imageCount} usable ${imageLabel}. The image set is ${formatStatus(
      review.readiness.status,
    )}.`,
    formatList("Reasons:", review.readiness.reasons),
    formatList("Missing inputs:", review.readiness.missingInputs),
    formatList("Recommended next actions:", review.readiness.recommendedActions),
  ].join("\n\n");
}
