import type {
  ImageInspectionResult,
  ReconstructionJob,
  ReconstructionStatus,
} from "../types/reconstruction";

export interface ReconstructionProvider {
  inspectImageSet(files: File[]): Promise<ImageInspectionResult>;
  startReconstruction(
    projectId: string,
    files: File[],
  ): Promise<ReconstructionJob>;
  getReconstructionStatus(jobId: string): Promise<ReconstructionStatus>;
  getReconstructionOutput(jobId: string): Promise<unknown>;
}
