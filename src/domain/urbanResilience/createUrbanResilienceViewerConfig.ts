import type { UrbanResilienceScenario } from "../../types/urbanResilience";
import type { ProjectConfig } from "../../types/projectConfig";

export function createUrbanResilienceViewerConfig(
  scenario: UrbanResilienceScenario,
): ProjectConfig {
  return {
    schemaVersion: "urban-resilience-demo-shell-v1",
    projectId: scenario.id,
    projectName: "Grand Isle & Port Fourchon Coastal Resilience Module",
    description: scenario.description,
    scene: {
      center: {
        lat: scenario.center.lat,
        lon: scenario.center.lon,
        height: 12000,
      },
      camera: {
        heading: 0,
        pitch: -Math.PI / 2,
        range: 12000,
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
