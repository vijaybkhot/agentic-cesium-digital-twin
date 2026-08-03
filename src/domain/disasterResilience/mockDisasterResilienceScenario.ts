import type { DisasterResilienceScenario } from "../../types/disasterResilience";
import {
  DISASTER_DEMO_DISCLAIMER,
  MOCK_FLOOD_LAYER_LABEL,
} from "./disasterResilienceContract";

export const mockDisasterResilienceScenario: DisasterResilienceScenario = {
  id: "property-specific-disaster-resilience-demo",
  name: "Mock Neighborhood Flood Scenario",
  description:
    "Local research scenario showing how fictional flood-depth information could be translated into property-specific decision-support context.",
  center: {
    lat: 30.45162,
    lon: -91.15471,
    height: 0,
  },
  propertyDataUrl: "/examples/disaster_resilience_properties.geojson",
  floodLayer: {
    id: "mock-neighborhood-flood-layer",
    label: MOCK_FLOOD_LAYER_LABEL,
    boundary: [
      { lat: 30.45208, lon: -91.15545, height: 0 },
      { lat: 30.45208, lon: -91.15395, height: 0 },
      { lat: 30.45105, lon: -91.15395, height: 0 },
      { lat: 30.45105, lon: -91.15545, height: 0 },
    ],
    representativeDepthFt: 2.4,
    visualHeightScaleMultiplier: 3,
    confidenceNote:
      "Synthetic boundary and representative depth for visualization only; not real HEC-RAS output.",
  },
  shelter: {
    id: "cypress-community-safe-point",
    name: "Cypress Community Safe Point (fictional)",
    location: {
      lat: 30.45245,
      lon: -91.15378,
      height: 0,
    },
    description:
      "Fictional demonstration marker only. It is not a real shelter or emergency destination.",
  },
  route: {
    id: "mock-neighborhood-response-route",
    name: "Mock neighborhood response route",
    status: "at-risk",
    positions: [
      { lat: 30.45127, lon: -91.1553, height: 0 },
      { lat: 30.45162, lon: -91.1549, height: 0 },
      { lat: 30.45202, lon: -91.15438, height: 0 },
      { lat: 30.45245, lon: -91.15378, height: 0 },
    ],
    description:
      "Illustrative response path for the research demo. It is not an evacuation route or real guidance.",
  },
  events: [
    {
      id: "event-weather-001",
      source: "Weather Twin",
      message:
        "Synthetic rainfall scenario selected for the local research demonstration.",
      timestamp: "2025-06-01T14:00:00Z",
    },
    {
      id: "event-flood-001",
      source: "Flood Model Twin",
      message:
        "Mock neighborhood flood boundary and illustrative depth values prepared.",
      timestamp: "2025-06-01T14:01:00Z",
    },
    {
      id: "event-property-001",
      source: "Property Twin",
      message:
        "Fictional property attributes associated with the mock flood scenario.",
      timestamp: "2025-06-01T14:02:00Z",
    },
    {
      id: "event-response-001",
      source: "Response Twin",
      message:
        "Mock shelter marker and at-risk response route added for discussion.",
      timestamp: "2025-06-01T14:03:00Z",
    },
    {
      id: "event-ai-001",
      source: "AI Assistant",
      message:
        "Mock decision-support summary prepared; no real emergency recommendation was generated.",
      timestamp: "2025-06-01T14:04:00Z",
    },
  ],
  disclaimer: DISASTER_DEMO_DISCLAIMER,
};
