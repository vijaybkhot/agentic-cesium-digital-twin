import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MockColmapReconstructionProvider } from "../adapters/reconstruction/MockColmapReconstructionProvider";
import {
  createDraftProjectConfig,
  defaultProjectLocation,
} from "../domain/project/createDraftProjectConfig";
import type { ImageIntakeReview } from "../types/imageIntake";
import type { ProjectConfig } from "../types/projectConfig";
import type { ReconstructionJob } from "../types/reconstruction";

export type ReconstructionWorkflowStep =
  | "setup"
  | "intake"
  | "reconstructing"
  | "completed";

function parseCoordinate(
  value: string,
  minimum: number,
  maximum: number,
): number | null {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

function createSetupPreviewConfig(): ProjectConfig {
  return createDraftProjectConfig({
    projectName: "New Digital Twin Project",
    description: "Choose a site and prepare a mock reconstruction.",
    lat: defaultProjectLocation.lat,
    lon: defaultProjectLocation.lon,
    includeSiteMarker: false,
  });
}

export function useReconstructionWorkflow() {
  const providerRef = useRef(new MockColmapReconstructionProvider());
  const workflowVersionRef = useRef(0);
  const [step, setStep] = useState<ReconstructionWorkflowStep>("setup");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [config, setConfig] = useState<ProjectConfig>(createSetupPreviewConfig);
  const [files, setFiles] = useState<File[]>([]);
  const [review, setReview] = useState<ImageIntakeReview | null>(null);
  const [job, setJob] = useState<ReconstructionJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationPickEnabled, setLocationPickEnabled] = useState(false);
  const [focusProjectVersion, setFocusProjectVersion] = useState(0);
  const [focusModelVersion, setFocusModelVersion] = useState(0);
  const [imageIntakeVersion, setImageIntakeVersion] = useState(0);

  const validLatitude = useMemo(
    () => parseCoordinate(latitude, -90, 90),
    [latitude],
  );
  const validLongitude = useMemo(
    () => parseCoordinate(longitude, -180, 180),
    [longitude],
  );
  const hasValidLocation =
    validLatitude !== null && validLongitude !== null;

  useEffect(() => {
    if (
      step !== "setup" ||
      validLatitude === null ||
      validLongitude === null
    ) {
      return;
    }

    setConfig((currentConfig) => ({
      ...currentConfig,
      scene: {
        ...currentConfig.scene,
        center: {
          ...currentConfig.scene.center,
          lat: validLatitude,
          lon: validLongitude,
        },
      },
      siteMarker: {
        lat: validLatitude,
        lon: validLongitude,
        height: 0,
        label: projectName.trim() || "Selected project site",
      },
    }));
  }, [
    projectName,
    step,
    validLatitude,
    validLongitude,
  ]);

  useEffect(() => {
    if (!locationPickEnabled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLocationPickEnabled(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [locationPickEnabled]);

  useEffect(() => {
    if (step !== "reconstructing" || !job) {
      return;
    }

    const workflowVersion = workflowVersionRef.current;
    let stopped = false;

    async function pollStatus() {
      try {
        const status =
          await providerRef.current.getReconstructionStatus(job!.jobId);

        if (stopped || workflowVersion !== workflowVersionRef.current) {
          return;
        }

        setJob((currentJob) =>
          currentJob ? { ...currentJob, status } : currentJob,
        );

        if (status === "completed") {
          const output =
            await providerRef.current.getReconstructionOutput(job!.jobId);

          if (stopped || workflowVersion !== workflowVersionRef.current) {
            return;
          }

          setConfig((currentConfig) => ({
            ...currentConfig,
            siteMarker: undefined,
            modelAssets: [output.asset],
          }));
          setStep("completed");
          setFocusModelVersion((version) => version + 1);
        }
      } catch (nextError) {
        if (stopped || workflowVersion !== workflowVersionRef.current) {
          return;
        }

        setError(
          nextError instanceof Error
            ? nextError.message
            : "Mock reconstruction failed.",
        );
        setJob((currentJob) =>
          currentJob ? { ...currentJob, status: "failed" } : currentJob,
        );
      }
    }

    void pollStatus();
    const intervalId = window.setInterval(() => {
      void pollStatus();
    }, 500);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
    };
  }, [job?.jobId, step]);

  const setPickedLocation = useCallback((lat: number, lon: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lon.toFixed(6));
    setLocationPickEnabled(false);
    setError(null);
  }, []);

  const createProject = useCallback(() => {
    const trimmedName = projectName.trim();

    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    if (validLatitude === null) {
      setError("Latitude must be a number from -90 to 90.");
      return;
    }

    if (validLongitude === null) {
      setError("Longitude must be a number from -180 to 180.");
      return;
    }

    setConfig(
      createDraftProjectConfig({
        projectName: trimmedName,
        description,
        lat: validLatitude,
        lon: validLongitude,
      }),
    );
    setStep("intake");
    setLocationPickEnabled(false);
    setError(null);
    setFocusProjectVersion((version) => version + 1);
  }, [
    description,
    projectName,
    validLatitude,
    validLongitude,
  ]);

  const handleImageSelection = useCallback(
    (nextFiles: File[], nextReview: ImageIntakeReview | null) => {
      setFiles(nextFiles);
      setReview(nextReview);
      setError(null);
    },
    [],
  );

  const canStartReconstruction =
    review?.readiness.status === "needs_review" ||
    review?.readiness.status === "ready_for_initial_test";

  const startReconstruction = useCallback(async () => {
    if (!canStartReconstruction || !config.siteMarker) {
      return;
    }

    const workflowVersion = workflowVersionRef.current;

    setError(null);
    setStep("reconstructing");

    try {
      const nextJob = await providerRef.current.startReconstruction({
        projectId: config.projectId,
        files,
        siteAnchor: {
          lat: config.siteMarker.lat,
          lon: config.siteMarker.lon,
          height: 0,
        },
        requestedOutput: "glb",
      });

      if (workflowVersion === workflowVersionRef.current) {
        setJob(nextJob);
      }
    } catch (nextError) {
      if (workflowVersion !== workflowVersionRef.current) {
        return;
      }

      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not start mock reconstruction.",
      );
      setStep("intake");
    }
  }, [canStartReconstruction, config, files]);

  const resetWorkflow = useCallback(() => {
    workflowVersionRef.current += 1;
    providerRef.current = new MockColmapReconstructionProvider();
    setStep("setup");
    setProjectName("");
    setDescription("");
    setLatitude("");
    setLongitude("");
    setConfig(createSetupPreviewConfig());
    setFiles([]);
    setReview(null);
    setJob(null);
    setError(null);
    setLocationPickEnabled(false);
    setFocusProjectVersion(0);
    setFocusModelVersion(0);
    setImageIntakeVersion((version) => version + 1);
  }, []);

  return {
    step,
    projectName,
    description,
    latitude,
    longitude,
    config,
    files,
    review,
    job,
    error,
    locationPickEnabled,
    focusProjectVersion,
    focusModelVersion,
    imageIntakeVersion,
    hasValidLocation,
    canStartReconstruction,
    setProjectName,
    setDescription,
    setLatitude,
    setLongitude,
    setPickedLocation,
    createProject,
    handleImageSelection,
    startReconstruction,
    resetWorkflow,
    startLocationPick: () => {
      setLocationPickEnabled(true);
      setError(null);
    },
    cancelLocationPick: () => setLocationPickEnabled(false),
    viewTypedLocation: () => {
      if (hasValidLocation) {
        setFocusProjectVersion((version) => version + 1);
        setError(null);
      } else {
        setError("Enter valid latitude and longitude first.");
      }
    },
  };
}
