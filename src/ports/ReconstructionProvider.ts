import type {
  ReconstructionJob,
  ReconstructionOutput,
  ReconstructionRequest,
  ReconstructionStatus,
} from "../types/reconstruction";

export interface ReconstructionProvider {
  startReconstruction(request: ReconstructionRequest): Promise<ReconstructionJob>;
  getReconstructionStatus(jobId: string): Promise<ReconstructionStatus>;
  getReconstructionOutput(jobId: string): Promise<ReconstructionOutput>;
}
