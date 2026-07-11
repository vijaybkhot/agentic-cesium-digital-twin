import type { ModularHousingScenario } from "../../types/modularHousing";
import type { ProjectConfig } from "../../types/projectConfig";

function getMidpoint(
  first: { lat: number; lon: number },
  second: { lat: number; lon: number },
): { lat: number; lon: number } {
  return {
    lat: (first.lat + second.lat) / 2,
    lon: (first.lon + second.lon) / 2,
  };
}

export function createModularHousingViewerConfig(
  scenario: ModularHousingScenario,
): ProjectConfig {
  const center = getMidpoint(
    scenario.factorySite.location,
    scenario.constructionSite.location,
  );

  return {
    schemaVersion: "modular-demo-shell-v1",
    projectId: scenario.id,
    projectName: scenario.name,
    description: scenario.description,
    scene: {
      center: {
        ...center,
        height: 120000,
      },
      camera: {
        heading: 0,
        pitch: -Math.PI / 2,
        range: 120000,
      },
    },
    beliefRules: {
      doseRate: {
        lowMax: 0,
        mediumMax: 0,
      },
      contamination: {
        lowMax: 0,
        mediumMax: 0,
      },
    },
    modelAssets: [],
    modelAnnotations: [],
    measurementPoints: [],
    annotations: [],
  };
}
