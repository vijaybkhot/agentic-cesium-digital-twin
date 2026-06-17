import type {
  ImageIntakeSummary,
  InspectedImage,
  ReconstructionReadinessResult,
} from "../../types/imageIntake";

const minimumImageCount = 20;
const preferredImageCount = 40;

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]): number {
  return values.length > 0 ? sum(values) / values.length : 0;
}

function createSummary(
  images: InspectedImage[],
  unsupportedFileCount: number,
  failedImageCount: number,
): ImageIntakeSummary {
  return {
    imageCount: images.length,
    totalSizeBytes: sum(images.map((image) => image.fileSizeBytes)),
    averageWidth: average(images.map((image) => image.width)),
    averageHeight: average(images.map((image) => image.height)),
    averageMegapixels: average(images.map((image) => image.megapixels)),
    lowResolutionCount: images.filter((image) => image.isLowResolution).length,
    supportedImageCount: images.length,
    unsupportedFileCount,
    failedImageCount,
  };
}

export function evaluateImageSetReadiness(args: {
  images: InspectedImage[];
  unsupportedFileCount: number;
  failedImageCount?: number;
  hasManualLocation?: boolean;
}): {
  summary: ImageIntakeSummary;
  readiness: ReconstructionReadinessResult;
} {
  const summary = createSummary(
    args.images,
    args.unsupportedFileCount,
    args.failedImageCount ?? 0,
  );
  const reasons: string[] = [];
  const missingInputs: string[] = [];
  const recommendedActions: string[] = [];
  const lowResolutionRatio =
    summary.imageCount > 0
      ? summary.lowResolutionCount / summary.imageCount
      : 0;
  let status: ReconstructionReadinessResult["status"] =
    "ready_for_initial_test";

  // Final reconstruction quality should be confirmed by the reconstruction pipeline itself.
  if (summary.imageCount === 0) {
    status = "not_ready";
    reasons.push("No usable images were selected.");
    missingInputs.push("uploaded image set");
    recommendedActions.push("Select multiple site images from your computer.");
  } else if (summary.imageCount < minimumImageCount) {
    const additionalImagesNeeded = minimumImageCount - summary.imageCount;

    status = "not_ready";
    reasons.push(
      `Only ${summary.imageCount} usable image${
        summary.imageCount === 1 ? " was" : "s were"
      } selected. Add at least ${additionalImagesNeeded} more image${
        additionalImagesNeeded === 1 ? "" : "s"
      } to reach the initial ${minimumImageCount}-image guideline.`,
    );
    missingInputs.push(
      `${additionalImagesNeeded} more image${
        additionalImagesNeeded === 1 ? "" : "s"
      } from multiple angles`,
    );
    recommendedActions.push(
      `Upload at least ${additionalImagesNeeded} more image${
        additionalImagesNeeded === 1 ? "" : "s"
      } from multiple angles.`,
    );
  } else if (summary.imageCount < preferredImageCount) {
    const additionalImagesForPreferred =
      preferredImageCount - summary.imageCount;

    status = "needs_review";
    reasons.push(
      `The image count meets the initial ${minimumImageCount}-image guideline, so a rough reconstruction test may be possible, but review is recommended before relying on the result.`,
    );
    recommendedActions.push(
      `Add ${additionalImagesForPreferred} more image${
        additionalImagesForPreferred === 1 ? "" : "s"
      } if available to reach the stronger ${preferredImageCount}-image target, especially from different angles, corners, and hidden areas.`,
    );
  }

  if (summary.lowResolutionCount > 0) {
    reasons.push(
      "Some images are below the initial resolution guideline of 1280x720.",
    );
    recommendedActions.push("Use higher resolution images where possible.");
  }

  if (lowResolutionRatio > 0.5 && status === "ready_for_initial_test") {
    status = "needs_review";
  }

  if (lowResolutionRatio > 0.5) {
    reasons.push("More than half of the usable images are low resolution.");
  }

  if (!args.hasManualLocation) {
    if (status === "ready_for_initial_test") {
      status = "needs_review";
    }

    missingInputs.push("site location or spatial anchor");
    recommendedActions.push(
      "Provide approximate site latitude and longitude or select a map anchor.",
    );
  }

  if (summary.unsupportedFileCount > 0) {
    reasons.push("Some selected files were not supported image types.");
  }

  if (summary.failedImageCount > 0) {
    reasons.push(
      "Some supported image files could not be read by the browser.",
    );
    recommendedActions.push(
      "Try converting unreadable images to JPEG, PNG, or WebP before retrying.",
    );
  }

  if (status === "ready_for_initial_test") {
    reasons.push(
      "The image count and basic resolution checks are acceptable for a first reconstruction trial.",
    );
    recommendedActions.push(
      "Proceed to initial reconstruction test when a pipeline is connected.",
    );
  }

  return {
    summary,
    readiness: {
      status,
      reasons,
      missingInputs,
      recommendedActions,
    },
  };
}
