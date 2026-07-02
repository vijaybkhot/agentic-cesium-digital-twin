import type {
  ModelAssetConfig,
  SpatialAnchor,
} from "./projectConfig";

export type ReconstructionStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed";

export type ReconstructionRequestedAssetType = ModelAssetConfig["assetType"];

export interface ReconstructionRequestedOutput {
  assetType: ReconstructionRequestedAssetType;
  preferredFallbacks?: ReconstructionRequestedAssetType[];
}

export interface ReconstructionRequest {
  projectId: string;
  files: File[];
  siteAnchor: SpatialAnchor;
  requestedOutput: ReconstructionRequestedOutput;
}

export interface ReconstructionJob {
  jobId: string;
  projectId: string;
  status: ReconstructionStatus;
}

export interface ReconstructionOutput {
  jobId: string;
  projectId: string;
  asset: ModelAssetConfig;
}
