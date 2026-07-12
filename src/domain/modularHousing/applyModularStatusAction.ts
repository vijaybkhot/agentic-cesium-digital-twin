import type {
  InstallationZone,
  LogisticsCheckpoint,
  ModularAiRecommendation,
  ModularHousingScenario,
  ModularStatusAction,
  ModularStatusActionId,
  ModularTwinEvent,
  ModularUnit,
  SelectedModularEntity,
} from "../../types/modularHousing";

function formatMockTimestamp(eventCount: number, eventIndex: number): string {
  const totalMinutes = 8 * 60 + 40 + Math.max(0, eventCount - 4) + eventIndex;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function createEvents(
  scenario: ModularHousingScenario,
  actionId: ModularStatusActionId,
  module: ModularUnit,
  events: Array<Omit<ModularTwinEvent, "id" | "timestamp">>,
): ModularTwinEvent[] {
  return events.map((event, index) => ({
    ...event,
    id: `event-${actionId}-${module.id.toLowerCase()}-${scenario.events.length + index + 1}`,
    timestamp: formatMockTimestamp(scenario.events.length, index),
    relatedModuleId: module.id,
  }));
}

function upsertRecommendation(
  recommendations: ModularAiRecommendation[],
  recommendation: ModularAiRecommendation,
): ModularAiRecommendation[] {
  return [
    recommendation,
    ...recommendations.filter((candidate) => candidate.id !== recommendation.id),
  ];
}

function updateModule(
  scenario: ModularHousingScenario,
  moduleId: string,
  update: (module: ModularUnit) => ModularUnit,
): ModularUnit[] {
  return scenario.modules.map((module) =>
    module.id === moduleId ? update(module) : module,
  );
}

function updateCheckpoints(
  checkpoints: LogisticsCheckpoint[],
  update: (checkpoint: LogisticsCheckpoint) => LogisticsCheckpoint,
): LogisticsCheckpoint[] {
  return checkpoints.map(update);
}

function updateInstallationZones(
  zones: InstallationZone[],
  zoneId: string | undefined,
  update: (zone: InstallationZone) => InstallationZone,
): InstallationZone[] {
  if (!zoneId) {
    return zones;
  }

  return zones.map((zone) => (zone.id === zoneId ? update(zone) : zone));
}

function canCompleteFabricationAndQc(module: ModularUnit): boolean {
  return (
    module.id === "MOD-BATH-001" &&
    module.productionStatus === "fabricating" &&
    module.qualityStatus === "qc-pending"
  );
}

function canAssignAndDispatch(module: ModularUnit): boolean {
  return (
    module.currentLocation === "factory" &&
    module.productionStatus === "fabrication-complete" &&
    module.qualityStatus === "qc-passed"
  );
}

function canMarkDelivered(module: ModularUnit): boolean {
  return module.currentLocation === "in-transit";
}

function canMarkInstalled(module: ModularUnit): boolean {
  return (
    module.currentLocation === "construction-site" &&
    module.installationStatus === "delivered"
  );
}

export function getAvailableModularStatusActions(
  scenario: ModularHousingScenario,
  selectedEntity: SelectedModularEntity | null,
): ModularStatusAction[] {
  if (!selectedEntity || selectedEntity.kind !== "module") {
    return [];
  }

  const module = scenario.modules.find(
    (candidate) => candidate.id === selectedEntity.id,
  );

  if (!module) {
    return [];
  }

  const actions: ModularStatusAction[] = [];

  if (canCompleteFabricationAndQc(module)) {
    actions.push({
      id: "complete-fabrication-qc",
      moduleId: module.id,
      label: "Complete fabrication and QC",
      description:
        "Mock factory twin marks fabrication and quality checks complete.",
    });
  }

  if (canAssignAndDispatch(module)) {
    actions.push({
      id: "assign-dispatch-shipment",
      moduleId: module.id,
      label: "Assign and dispatch shipment",
      description: "Mock logistics twin moves this module onto the delivery route.",
    });
  }

  if (canMarkDelivered(module)) {
    actions.push({
      id: "mark-delivered-to-site",
      moduleId: module.id,
      label: "Mark delivered to site",
      description: "Mock site twin receives the module at its assigned zone.",
    });
  }

  if (canMarkInstalled(module)) {
    actions.push({
      id: "mark-installed",
      moduleId: module.id,
      label: "Mark installed",
      description: "Mock site twin records installation progress for the module.",
    });
  }

  return actions;
}

export function applyModularStatusAction(
  scenario: ModularHousingScenario,
  actionId: ModularStatusActionId,
  moduleId: string,
): ModularHousingScenario {
  const module = scenario.modules.find((candidate) => candidate.id === moduleId);

  if (!module) {
    return scenario;
  }

  if (
    actionId === "complete-fabrication-qc" &&
    canCompleteFabricationAndQc(module)
  ) {
    const events = createEvents(scenario, actionId, module, [
      {
        source: "Factory Twin",
        message: `${module.id} completed mock fabrication and QC review at the factory.`,
      },
      {
        source: "AI Agent",
        message: `Mock delivery sequence updated: ${module.id} can now be considered after higher-priority ready modules.`,
      },
    ]);

    return {
      ...scenario,
      modules: updateModule(scenario, module.id, (candidate) => ({
        ...candidate,
        productionStatus: "fabrication-complete",
        qualityStatus: "qc-passed",
        installationStatus: "scheduled",
        digitalTwinAssociation: "shared-module-twin",
      })),
      events: [...scenario.events, ...events],
      recommendations: upsertRecommendation(scenario.recommendations, {
        id: "rec-bathroom-ready",
        priority: "medium",
        message: `Mock sequence can now consider ${module.id} for a later shipment.`,
        rationale:
          "The bathroom pod has completed the local mock fabrication and QC path, but the bedroom module remains the preferred first shipment for Zone 1.",
        relatedModuleId: module.id,
      }),
    };
  }

  if (actionId === "assign-dispatch-shipment" && canAssignAndDispatch(module)) {
    const events = createEvents(scenario, actionId, module, [
      {
        source: "Factory Twin",
        message: `${module.id} released from the factory-side mock twin for shipment.`,
      },
      {
        source: "Logistics Twin",
        message: `Mock shipment assigned for ${module.id} on the factory-to-site route.`,
      },
      {
        source: "Site Twin",
        message: `Construction-site mock twin is expecting ${module.id} at ${
          module.assignedZoneId ?? "its assigned zone"
        }.`,
      },
      {
        source: "AI Agent",
        message: `Mock delivery sequence updated after dispatching ${module.id}.`,
      },
    ]);

    return {
      ...scenario,
      route: {
        ...scenario.route,
        status: "active",
        checkpoints: updateCheckpoints(
          scenario.route.checkpoints,
          (checkpoint) => {
            if (checkpoint.id.includes("factory-gate")) {
              return { ...checkpoint, status: "pickup-complete" };
            }

            if (checkpoint.id.includes("midpoint")) {
              return { ...checkpoint, status: "in-transit-checkpoint" };
            }

            if (checkpoint.id.includes("site-gate")) {
              return { ...checkpoint, status: "awaiting-delivery" };
            }

            return checkpoint;
          },
        ),
      },
      modules: updateModule(scenario, module.id, (candidate) => ({
        ...candidate,
        currentLocation: "in-transit",
        installationStatus: "scheduled",
        digitalTwinAssociation: "logistics-twin",
      })),
      events: [...scenario.events, ...events],
      recommendations: upsertRecommendation(scenario.recommendations, {
        id: "rec-active-dispatch",
        priority: "high",
        message: `Track ${module.id} through the active mock delivery route before dispatching delayed modules.`,
        rationale:
          "The module has passed QC and is now represented by the logistics twin, while delayed factory modules remain off the route.",
        relatedModuleId: module.id,
      }),
    };
  }

  if (actionId === "mark-delivered-to-site" && canMarkDelivered(module)) {
    const events = createEvents(scenario, actionId, module, [
      {
        source: "Logistics Twin",
        message: `${module.id} marked delivered in the mock logistics workflow.`,
      },
      {
        source: "Site Twin",
        message: `Site twin received ${module.id} for ${module.assignedZoneId ?? "its assigned zone"}.`,
      },
      {
        source: "AI Agent",
        message: `Mock delivery sequence updated after site delivery of ${module.id}.`,
      },
    ]);

    return {
      ...scenario,
      modules: updateModule(scenario, module.id, (candidate) => ({
        ...candidate,
        currentLocation: "construction-site",
        installationStatus: "delivered",
        digitalTwinAssociation: "construction-site-twin",
      })),
      installationZones: updateInstallationZones(
        scenario.installationZones,
        module.assignedZoneId,
        (zone) => ({ ...zone, status: "module-delivered" }),
      ),
      route: {
        ...scenario.route,
        checkpoints: updateCheckpoints(scenario.route.checkpoints, (checkpoint) =>
          checkpoint.id.includes("site-gate")
            ? { ...checkpoint, status: "delivered" }
            : checkpoint,
        ),
      },
      events: [...scenario.events, ...events],
      recommendations: upsertRecommendation(scenario.recommendations, {
        id: "rec-site-installation-ready",
        priority: "high",
        message: `Prepare installation crew for ${module.id} at the assigned zone.`,
        rationale:
          "The module is now represented by the site twin, so the next mock step is installation rather than route planning.",
        relatedModuleId: module.id,
      }),
    };
  }

  if (actionId === "mark-installed" && canMarkInstalled(module)) {
    const events = createEvents(scenario, actionId, module, [
      {
        source: "Site Twin",
        message: `${module.id} marked installed in the mock construction-site twin.`,
      },
      {
        source: "AI Agent",
        message: `Mock sequence updated: ${module.id} can move toward inspection tracking.`,
      },
    ]);

    return {
      ...scenario,
      modules: updateModule(scenario, module.id, (candidate) => ({
        ...candidate,
        installationStatus: "installed",
      })),
      installationZones: updateInstallationZones(
        scenario.installationZones,
        module.assignedZoneId,
        (zone) => ({ ...zone, status: "module-installed" }),
      ),
      events: [...scenario.events, ...events],
      recommendations: upsertRecommendation(scenario.recommendations, {
        id: "rec-installation-followup",
        priority: "medium",
        message: `Prepare mock inspection follow-up for ${module.id}.`,
        rationale:
          "The module has reached the installed state in the local proposal-demo workflow.",
        relatedModuleId: module.id,
      }),
    };
  }

  return scenario;
}
