import type { ReconstructionProvider } from "../../ports/ReconstructionProvider";
import type {
  ReconstructionJob,
  ReconstructionOutput,
  ReconstructionRequest,
  ReconstructionStatus,
} from "../../types/reconstruction";

interface MockJobRecord {
  request: ReconstructionRequest;
  startedAt: number;
}

const runningDelayMs = 1000;
const completedDelayMs = 3000;

export class MockColmapReconstructionProvider
  implements ReconstructionProvider
{
  private readonly jobs = new Map<string, MockJobRecord>();

  async startReconstruction(
    request: ReconstructionRequest,
  ): Promise<ReconstructionJob> {
    const jobId = `mock-colmap-${Date.now()}`;

    this.jobs.set(jobId, {
      request,
      startedAt: Date.now(),
    });

    return {
      jobId,
      projectId: request.projectId,
      status: "queued",
    };
  }

  async getReconstructionStatus(
    jobId: string,
  ): Promise<ReconstructionStatus> {
    const job = this.requireJob(jobId);
    const elapsedMs = Date.now() - job.startedAt;

    if (elapsedMs >= completedDelayMs) {
      return "completed";
    }

    if (elapsedMs >= runningDelayMs) {
      return "running";
    }

    return "queued";
  }

  async getReconstructionOutput(
    jobId: string,
  ): Promise<ReconstructionOutput> {
    const job = this.requireJob(jobId);
    const status = await this.getReconstructionStatus(jobId);

    if (status !== "completed") {
      throw new Error(`Reconstruction job ${jobId} is not completed.`);
    }

    return {
      jobId,
      projectId: job.request.projectId,
      asset: {
        assetId: `${job.request.projectId}-mock-colmap-model`,
        assetType: "glb",
        assetUrl: "/models/CesiumMilkTruck.glb",
        sourcePipeline: "mock-colmap",
        status: "ready",
        spatialAnchor: job.request.siteAnchor,
        scale: 2,
        orientation: {
          heading: 90,
          pitch: 0,
          roll: 0,
        },
        coordinateFrame: {
          convention: "local-enu",
          unit: "meters",
          origin: "spatialAnchor",
        },
        quality: {
          status: "unknown",
          notes:
            "Mock COLMAP output used to validate reconstruction handoff.",
        },
      },
    };
  }

  private requireJob(jobId: string): MockJobRecord {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error(`Unknown reconstruction job: ${jobId}`);
    }

    return job;
  }
}
