import type { ModularHousingScenario } from "../../types/modularHousing";

export const mockModularHousingScenario: ModularHousingScenario = {
  id: "modular-housing-demo",
  name: "Modular Housing Production Digital Twin",
  description:
    "Proposal-demo scenario for factory fabrication, module logistics, and construction-site installation.",
  factorySite: {
    id: "factory-baton-rouge",
    name: "Baton Rouge Modular Fabrication Facility",
    role: "factory",
    location: {
      lat: 30.4583,
      lon: -91.1761,
      height: 0,
    },
    footprint: {
      widthMeters: 560,
      depthMeters: 360,
      rotationDegrees: 18,
    },
    description:
      "Factory-side digital twin for modular unit fabrication and robotics status.",
    status: "production-shift-active",
  },
  constructionSite: {
    id: "site-affordable-housing",
    name: "Affordable Housing Installation Site",
    role: "construction-site",
    location: {
      lat: 30.5316,
      lon: -91.0982,
      height: 0,
    },
    footprint: {
      widthMeters: 460,
      depthMeters: 340,
      rotationDegrees: -22,
    },
    description:
      "Construction-site digital twin for foundation readiness, module placement, and inspection status.",
    status: "foundation-zone-1-ready",
  },
  route: {
    id: "route-factory-to-site",
    name: "Factory-to-site delivery route",
    fromSiteId: "factory-baton-rouge",
    toSiteId: "site-affordable-housing",
    status: "active",
    estimatedDistanceMiles: 9.2,
    checkpoints: [
      {
        id: "checkpoint-factory-gate",
        label: "Factory gate",
        location: {
          lat: 30.4604,
          lon: -91.1734,
          height: 0,
        },
        status: "pickup-complete",
      },
      {
        id: "checkpoint-route-midpoint",
        label: "Route midpoint",
        location: {
          lat: 30.4961,
          lon: -91.1358,
          height: 0,
        },
        status: "in-transit-checkpoint",
      },
      {
        id: "checkpoint-site-gate",
        label: "Site gate",
        location: {
          lat: 30.5299,
          lon: -91.1001,
          height: 0,
        },
        status: "awaiting-delivery",
      },
    ],
  },
  modules: [
    {
      id: "MOD-BATH-001",
      type: "bathroom-pod",
      label: "Bathroom pod",
      currentLocation: "factory",
      productionStatus: "fabricating",
      installationStatus: "not-ready",
      qualityStatus: "qc-pending",
      digitalTwinAssociation: "factory-twin",
      assignedZoneId: "zone-1",
      description:
        "Factory-built bathroom pod awaiting final robotic cell and quality checks.",
    },
    {
      id: "MOD-BED-002",
      type: "bedroom-module",
      label: "Bedroom module",
      currentLocation: "factory",
      productionStatus: "fabrication-complete",
      installationStatus: "scheduled",
      qualityStatus: "qc-passed",
      digitalTwinAssociation: "shared-module-twin",
      assignedZoneId: "zone-1",
      description:
        "Bedroom module ready to be assigned to the first delivery sequence.",
    },
    {
      id: "MOD-KIT-003",
      type: "kitchen-living-module",
      label: "Kitchen/living module",
      currentLocation: "factory",
      productionStatus: "robotic-cell-delay",
      installationStatus: "not-ready",
      qualityStatus: "not-started",
      digitalTwinAssociation: "factory-twin",
      assignedZoneId: "zone-2",
      description:
        "Kitchen/living module delayed at a simulated robotic fabrication station.",
    },
    {
      id: "MOD-MEP-004",
      type: "mep-module",
      label: "MEP module",
      currentLocation: "in-transit",
      productionStatus: "fabrication-complete",
      installationStatus: "scheduled",
      qualityStatus: "qc-passed",
      digitalTwinAssociation: "logistics-twin",
      assignedZoneId: "zone-3",
      description:
        "MEP module represented as a demo shipment moving between factory and site.",
    },
  ],
  productionStations: [
    {
      id: "station-1",
      name: "Robotic wall framing cell",
      stationType: "Robotic fabrication",
      status: "available",
      siteId: "factory-baton-rouge",
      location: {
        lat: 30.4588,
        lon: -91.1767,
        height: 0,
      },
      footprint: {
        widthMeters: 112,
        depthMeters: 72,
        rotationDegrees: 18,
      },
      moduleIds: [],
    },
    {
      id: "station-2",
      name: "Bathroom pod assembly cell",
      stationType: "Robotic assembly",
      status: "quality-check",
      siteId: "factory-baton-rouge",
      location: {
        lat: 30.4583,
        lon: -91.1755,
        height: 0,
      },
      footprint: {
        widthMeters: 104,
        depthMeters: 68,
        rotationDegrees: 18,
      },
      moduleIds: ["MOD-BATH-001"],
    },
    {
      id: "station-3",
      name: "Kitchen/living fit-out cell",
      stationType: "Robotic fit-out",
      status: "delayed",
      siteId: "factory-baton-rouge",
      location: {
        lat: 30.4577,
        lon: -91.1763,
        height: 0,
      },
      footprint: {
        widthMeters: 128,
        depthMeters: 76,
        rotationDegrees: 18,
      },
      moduleIds: ["MOD-KIT-003"],
    },
  ],
  installationZones: [
    {
      id: "zone-1",
      name: "Foundation Zone 1",
      status: "foundation-ready",
      siteId: "site-affordable-housing",
      location: {
        lat: 30.532,
        lon: -91.0977,
        height: 0,
      },
      footprint: {
        widthMeters: 108,
        depthMeters: 54,
        rotationDegrees: -22,
      },
      assignedModuleIds: ["MOD-BATH-001", "MOD-BED-002"],
    },
    {
      id: "zone-2",
      name: "Foundation Zone 2",
      status: "awaiting-module",
      siteId: "site-affordable-housing",
      location: {
        lat: 30.5315,
        lon: -91.0983,
        height: 0,
      },
      footprint: {
        widthMeters: 132,
        depthMeters: 62,
        rotationDegrees: -22,
      },
      assignedModuleIds: ["MOD-KIT-003"],
    },
    {
      id: "zone-3",
      name: "MEP service corridor",
      status: "awaiting-module",
      siteId: "site-affordable-housing",
      location: {
        lat: 30.5312,
        lon: -91.0988,
        height: 0,
      },
      footprint: {
        widthMeters: 118,
        depthMeters: 38,
        rotationDegrees: -22,
      },
      assignedModuleIds: ["MOD-MEP-004"],
    },
  ],
  events: [
    {
      id: "event-001",
      source: "Site Twin",
      timestamp: "08:15",
      message: "Foundation Zone 1 marked ready for modular installation.",
    },
    {
      id: "event-002",
      source: "Factory Twin",
      timestamp: "08:22",
      message: "Bedroom module MOD-BED-002 completed fabrication and passed QC.",
      relatedModuleId: "MOD-BED-002",
    },
    {
      id: "event-003",
      source: "Logistics Twin",
      timestamp: "08:31",
      message: "MEP module MOD-MEP-004 assigned to the delivery route.",
      relatedModuleId: "MOD-MEP-004",
    },
    {
      id: "event-004",
      source: "AI Agent",
      timestamp: "08:35",
      message:
        "Recommendation generated: ship MOD-BED-002 before MOD-KIT-003 because Zone 1 is ready and the kitchen/living module is delayed.",
      relatedModuleId: "MOD-BED-002",
    },
  ],
  recommendations: [
    {
      id: "rec-001",
      priority: "high",
      message:
        "Optimize delivery sequence by shipping MOD-BED-002 before MOD-KIT-003.",
      rationale:
        "Zone 1 is ready, MOD-BED-002 passed QC, and MOD-KIT-003 has a simulated robotic cell delay.",
      relatedModuleId: "MOD-BED-002",
    },
    {
      id: "rec-002",
      priority: "medium",
      message:
        "Resolve Station 3 delay before committing the kitchen/living module to the delivery route.",
      rationale:
        "The kitchen/living module is still tied to a delayed robotic fit-out cell.",
      relatedModuleId: "MOD-KIT-003",
    },
    {
      id: "rec-003",
      priority: "medium",
      message:
        "Keep bathroom pod MOD-BATH-001 at the factory until quality check is complete.",
      rationale:
        "Quality status is still QC pending.",
      relatedModuleId: "MOD-BATH-001",
    },
  ],
};
