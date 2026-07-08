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

function formatGpsSummary(summary: ImageIntakeSummary): string {
  if (summary.imageCount === 0) {
    return "No GPS metadata was inspected because no usable images were found.";
  }

  const gpsCoverageSummary = `GPS metadata was found in ${
    summary.gpsPresentCount
  } of ${summary.imageCount} usable images (${summary.gpsCoveragePercent.toFixed(
    0,
  )}% coverage).`;

  if (summary.averageGpsDistanceFromSiteMeters === undefined) {
    return gpsCoverageSummary;
  }

  const distance =
    summary.averageGpsDistanceFromSiteMeters >= 1000
      ? `${(summary.averageGpsDistanceFromSiteMeters / 1000).toFixed(1)} km`
      : `${Math.round(summary.averageGpsDistanceFromSiteMeters)} m`;

  return `${gpsCoverageSummary} The average image GPS location is about ${distance} from the selected project site.`;
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
    formatGpsSummary(review.summary),
    formatList("Reasons:", review.readiness.reasons),
    formatList("Missing inputs:", review.readiness.missingInputs),
    formatList("Recommended next actions:", review.readiness.recommendedActions),
  ].join("\n\n");
}
