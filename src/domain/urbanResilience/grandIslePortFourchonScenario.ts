import type { UrbanResilienceScenario } from "../../types/urbanResilience";
import { URBAN_RESILIENCE_DISCLAIMER } from "./urbanResilienceContract";

export const grandIslePortFourchonScenario: UrbanResilienceScenario = {
  id: "grand-isle-port-fourchon-urban-resilience",
  name: "Grand Isle & Port Fourchon Coastal Resilience",
  description:
    "Real building footprints (OpenStreetMap) and FEMA National Flood Hazard " +
    "Layer flood-zone classifications for Grand Isle and Port Fourchon, " +
    "Louisiana -- a barrier-island town and port facility area connected to " +
    "the mainland by a single road, LA Highway 1. Research prototype for " +
    "property-centered coastal flood/hurricane risk and response-scenario analysis.",
  center: {
    lat: 29.18,
    lon: -90.088,
    height: 0,
  },
  propertyDataUrl: "/data/urban-resilience/grand_isle_port_fourchon_properties.geojson",
  floodZoneDataUrl: "/data/urban-resilience/grand_isle_port_fourchon_flood_zones.geojson",
  responseDataUrl: "/data/urban-resilience/grand_isle_port_fourchon_response.geojson",
  experimentalLa1FemaDataUrl:
    "/data/urban-resilience/experiments/la1_fema_intersections.geojson",
  routes: [],
  resources: [],
  events: [
    {
      id: "event-provenance-osm",
      source: "Data Provenance",
      message:
        "Building footprints sourced from OpenStreetMap (ODbL) for the Grand " +
        "Isle town core and the Port Fourchon port facility area.",
      timestamp: "2026-08-10T16:30:00Z",
    },
    {
      id: "event-provenance-fema",
      source: "Data Provenance",
      message:
        "Flood zone polygons sourced from the FEMA National Flood Hazard " +
        "Layer (NFHL) public ArcGIS REST service. Port Fourchon has a known " +
        "coverage gap in this layer; affected properties are flagged as a " +
        "data gap rather than classified as low risk.",
      timestamp: "2026-08-10T16:31:00Z",
    },
    {
      id: "event-classification",
      source: "Risk Classification",
      message:
        "Each property's risk level is a zone-based proxy: FEMA Zone V/VE " +
        "(coastal high-hazard, wave action) maps to High; other Special " +
        "Flood Hazard Area zones map to Moderate; mapped areas outside the " +
        "SFHA map to Low; and missing or undetermined FEMA coverage maps to " +
        "Unknown rather than implying a low-risk finding.",
      timestamp: "2026-08-10T16:32:00Z",
    },
    {
      id: "event-response",
      source: "Response Context",
      message:
        "Response routes follow real LA Highway 1 road geometry (OpenStreetMap) " +
        "from Grand Isle and from Port Fourchon toward the mainland. Regional " +
        "staging references mark approximate inland town centers along the " +
        "corridor; they are not official shelters.",
      timestamp: "2026-08-10T16:33:00Z",
    },
  ],
  disclaimer: URBAN_RESILIENCE_DISCLAIMER,
};
