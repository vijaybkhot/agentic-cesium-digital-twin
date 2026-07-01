import type {
  ModelAssetConfig,
  SpatialAnchor,
} from "./projectConfig";

export type ReconstructionStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed";

export interface ReconstructionRequest {
  projectId: string;
  files: File[];
  siteAnchor: SpatialAnchor;
  requestedOutput: "glb" | "point-cloud" | "3d-tiles" | "mesh";
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
