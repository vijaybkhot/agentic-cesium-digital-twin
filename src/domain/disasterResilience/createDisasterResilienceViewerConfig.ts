import type { DisasterResilienceScenario } from "../../types/disasterResilience";
import type { ProjectConfig } from "../../types/projectConfig";

export function createDisasterResilienceViewerConfig(
  scenario: DisasterResilienceScenario,
): ProjectConfig {
  return {
    schemaVersion: "disaster-resilience-demo-shell-v1",
    projectId: scenario.id,
    projectName: "Property-Specific Disaster Resilience Module",
    description: scenario.description,
    scene: {
      center: {
        lat: scenario.center.lat,
        lon: scenario.center.lon,
        height: 1200,
      },
      camera: {
        heading: 0,
        pitch: -Math.PI / 2,
        range: 1200,
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
