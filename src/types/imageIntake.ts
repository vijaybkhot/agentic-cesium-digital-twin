export type ImageReadinessStatus =
  | "not_ready"
  | "needs_review"
  | "ready_for_initial_test";

export type ImageGpsStatus = "present" | "missing" | "unknown";

export interface ImageGpsMetadata {
  status: ImageGpsStatus;
  latitude?: number;
  longitude?: number;
}

export interface ProjectSiteLocation {
  lat: number;
  lon: number;
}

export interface InspectedImage {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  megapixels: number;
  isLowResolution: boolean;
  gps: ImageGpsMetadata;
}

export interface ImageIntakeSummary {
  imageCount: number;
  totalSizeBytes: number;
  averageWidth: number;
  averageHeight: number;
  averageMegapixels: number;
  lowResolutionCount: number;
  supportedImageCount: number;
  unsupportedFileCount: number;
  failedImageCount: number;
  gpsPresentCount: number;
  gpsMissingCount: number;
  gpsUnknownCount: number;
  gpsCoveragePercent: number;
  averageGpsLatitude?: number;
  averageGpsLongitude?: number;
  averageGpsDistanceFromSiteMeters?: number;
}

export interface ReconstructionReadinessResult {
  status: ImageReadinessStatus;
  reasons: string[];
  missingInputs: string[];
  recommendedActions: string[];
}

export interface ImageIntakeReview {
  images: InspectedImage[];
  summary: ImageIntakeSummary;
  readiness: ReconstructionReadinessResult;
  assistantMessage: string;
}
