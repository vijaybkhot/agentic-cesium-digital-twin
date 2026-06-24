import type { ProjectConfig } from "../../types/projectConfig";

export const defaultProjectLocation = {
  lat: 40.03883,
  lon: -75.59777,
};

export function createProjectId(projectName: string): string {
  const normalizedName = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalizedName || "untitled-project";
}

export function createDraftProjectConfig(args: {
  projectName: string;
  description: string;
  lat: number;
  lon: number;
  includeSiteMarker?: boolean;
}): ProjectConfig {
  const projectId = createProjectId(args.projectName);

  return {
    projectId,
    projectName: args.projectName.trim(),
    description: args.description.trim() || "Mock reconstruction project",
    scene: {
      center: {
        lat: args.lat,
        lon: args.lon,
        height: 1500,
      },
      camera: {
        heading: 0,
        pitch: -Math.PI / 2,
        range: 1500,
      },
    },
    siteMarker:
      args.includeSiteMarker === false
        ? undefined
        : {
            lat: args.lat,
            lon: args.lon,
            height: 0,
            label: args.projectName.trim() || "Selected project site",
          },
    beliefRules: {
      doseRate: {
        lowMax: 0.24,
        mediumMax: 0.99,
      },
      contamination: {
        lowMax: 49,
        mediumMax: 149,
      },
    },
    modelAssets: [],
    modelAnnotations: [],
    measurementPoints: [],
    annotations: [],
  };
}
