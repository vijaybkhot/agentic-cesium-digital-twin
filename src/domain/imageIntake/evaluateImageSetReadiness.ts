import type {
  ImageIntakeSummary,
  InspectedImage,
  ProjectSiteLocation,
  ReconstructionReadinessResult,
} from "../../types/imageIntake";

const minimumImageCount = 20;
const preferredImageCount = 40;
const siteGpsDistanceWarningMeters = 1000;

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]): number {
  return values.length > 0 ? sum(values) / values.length : 0;
}

function countGpsStatus(
  images: InspectedImage[],
  status: InspectedImage["gps"]["status"],
): number {
  return images.filter((image) => image.gps.status === status).length;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function calculateDistanceMeters(
  firstPoint: ProjectSiteLocation,
  secondPoint: ProjectSiteLocation,
): number {
  const earthRadiusMeters = 6_371_000;
  const latitudeDifference = toRadians(secondPoint.lat - firstPoint.lat);
  const longitudeDifference = toRadians(secondPoint.lon - firstPoint.lon);
  const firstLatitude = toRadians(firstPoint.lat);
  const secondLatitude = toRadians(secondPoint.lat);
  const haversineValue =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    earthRadiusMeters *
    2 *
    Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue))
  );
}

function formatDistance(distanceMeters: number): string {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
}

function getImagesWithGps(images: InspectedImage[]): InspectedImage[] {
  return images.filter(
    (image) =>
      image.gps.status === "present" &&
      Number.isFinite(image.gps.latitude) &&
      Number.isFinite(image.gps.longitude),
  );
}

function createSummary(
  images: InspectedImage[],
  unsupportedFileCount: number,
  failedImageCount: number,
  siteLocation?: ProjectSiteLocation,
): ImageIntakeSummary {
  const gpsPresentCount = countGpsStatus(images, "present");
  const gpsMissingCount = countGpsStatus(images, "missing");
  const gpsUnknownCount = countGpsStatus(images, "unknown");
  const imagesWithGps = getImagesWithGps(images);
  const averageGpsLatitude =
    imagesWithGps.length > 0
      ? average(imagesWithGps.map((image) => image.gps.latitude!))
      : undefined;
  const averageGpsLongitude =
    imagesWithGps.length > 0
      ? average(imagesWithGps.map((image) => image.gps.longitude!))
      : undefined;
  const averageGpsDistanceFromSiteMeters =
    siteLocation &&
    averageGpsLatitude !== undefined &&
    averageGpsLongitude !== undefined
      ? calculateDistanceMeters(siteLocation, {
          lat: averageGpsLatitude,
          lon: averageGpsLongitude,
        })
      : undefined;

  return {
    imageCount: images.length,
    totalSizeBytes: sum(images.map((image) => image.fileSizeBytes)),
    averageWidth: average(images.map((image) => image.width)),
    averageHeight: average(images.map((image) => image.height)),
    averageMegapixels: average(images.map((image) => image.megapixels)),
    lowResolutionCount: images.filter((image) => image.isLowResolution).length,
    supportedImageCount: images.length + failedImageCount,
    unsupportedFileCount,
    failedImageCount,
    gpsPresentCount,
    gpsMissingCount,
    gpsUnknownCount,
    gpsCoveragePercent:
      images.length > 0 ? (gpsPresentCount / images.length) * 100 : 0,
    averageGpsLatitude,
    averageGpsLongitude,
    averageGpsDistanceFromSiteMeters,
  };
}

export function evaluateImageSetReadiness(args: {
  images: InspectedImage[];
  unsupportedFileCount: number;
  failedImageCount?: number;
  hasManualLocation?: boolean;
  siteLocation?: ProjectSiteLocation;
}): {
  summary: ImageIntakeSummary;
  readiness: ReconstructionReadinessResult;
} {
  const summary = createSummary(
    args.images,
    args.unsupportedFileCount,
    args.failedImageCount ?? 0,
    args.siteLocation,
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

  if (summary.imageCount > 0 && summary.gpsPresentCount === 0) {
    reasons.push("No usable images had readable GPS metadata.");
    recommendedActions.push(
      "Keep the site location filled in, and use phone or drone images with location services enabled when possible.",
    );
  } else if (
    summary.gpsPresentCount > 0 &&
    summary.gpsPresentCount < summary.imageCount
  ) {
    reasons.push(
      `Readable GPS metadata was found in ${summary.gpsPresentCount} of ${summary.imageCount} usable images.`,
    );
    recommendedActions.push(
      "Prefer image sets where most photos include GPS metadata, especially for real reconstruction placement.",
    );
  }

  if (
    summary.averageGpsDistanceFromSiteMeters !== undefined &&
    summary.averageGpsDistanceFromSiteMeters > siteGpsDistanceWarningMeters
  ) {
    reasons.push(
      `The average image GPS location is about ${formatDistance(
        summary.averageGpsDistanceFromSiteMeters,
      )} from the selected project site.`,
    );
    recommendedActions.push(
      "Confirm that the selected site location matches the photos before starting real reconstruction.",
    );
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
