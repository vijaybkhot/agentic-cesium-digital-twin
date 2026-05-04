export interface ImageInspectionResult {
  imageCount: number;
  warnings: string[];
  recommendedNextStep: string;
}

export interface ReconstructionJob {
  jobId: string;
  projectId: string;
  status: ReconstructionStatus;
}

export type ReconstructionStatus =
  | "Queued"
  | "Running"
  | "Completed"
  | "Failed";
