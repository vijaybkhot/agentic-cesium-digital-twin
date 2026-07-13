import type {
  ModularCoordinate,
  ModularHousingScenario,
  SelectedModularEntity,
} from "../../types/modularHousing";
import { formatModularSlug } from "./formatModularHousingLabels";

export interface SelectedModularEntityDetailRow {
  label: string;
  value: string;
}

export interface SelectedModularEntityDetails {
  title: string;
  kindLabel: string;
  status?: string;
  description?: string;
  rows: SelectedModularEntityDetailRow[];
}

function formatCoordinate(location: ModularCoordinate): string {
  return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`;
}

function formatList(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "None assigned";
}

export function getSelectedModularEntityDetails(
  scenario: ModularHousingScenario,
  selectedEntity: SelectedModularEntity | null,
): SelectedModularEntityDetails | null {
  if (!selectedEntity) {
    return null;
  }

  if (
    selectedEntity.kind === "factory-site" &&
    selectedEntity.id === scenario.factorySite.id
  ) {
    const site = scenario.factorySite;

    return {
      title: site.name,
      kindLabel: "Factory Site",
      status: formatModularSlug(site.status),
      description: site.description,
      rows: [
        { label: "Role", value: formatModularSlug(site.role) },
        { label: "Coordinates", value: formatCoordinate(site.location) },
        { label: "Status", value: formatModularSlug(site.status) },
      ],
    };
  }

  if (
    selectedEntity.kind === "construction-site" &&
    selectedEntity.id === scenario.constructionSite.id
  ) {
    const site = scenario.constructionSite;

    return {
      title: site.name,
      kindLabel: "Construction Site",
      status: formatModularSlug(site.status),
      description: site.description,
      rows: [
        { label: "Role", value: formatModularSlug(site.role) },
        { label: "Coordinates", value: formatCoordinate(site.location) },
        { label: "Status", value: formatModularSlug(site.status) },
      ],
    };
  }

  if (
    selectedEntity.kind === "logistics-route" &&
    selectedEntity.id === scenario.route.id
  ) {
    return {
      title: scenario.route.name,
      kindLabel: "Logistics Route",
      status: formatModularSlug(scenario.route.status),
      rows: [
        { label: "Status", value: formatModularSlug(scenario.route.status) },
        { label: "From", value: scenario.factorySite.name },
        { label: "To", value: scenario.constructionSite.name },
        {
          label: "Distance",
          value: `${scenario.route.estimatedDistanceMiles.toFixed(1)} mi`,
        },
        {
          label: "Checkpoints",
          value: String(scenario.route.checkpoints.length),
        },
      ],
    };
  }

  if (selectedEntity.kind === "route-checkpoint") {
    const checkpoint = scenario.route.checkpoints.find(
      (candidate) => candidate.id === selectedEntity.id,
    );

    if (!checkpoint) {
      return null;
    }

    return {
      title: checkpoint.label,
      kindLabel: "Route Checkpoint",
      status: formatModularSlug(checkpoint.status),
      rows: [
        { label: "Status", value: formatModularSlug(checkpoint.status) },
        { label: "Coordinates", value: formatCoordinate(checkpoint.location) },
      ],
    };
  }

  if (selectedEntity.kind === "module") {
    const module = scenario.modules.find(
      (candidate) => candidate.id === selectedEntity.id,
    );
    const assignedZone = module?.assignedZoneId
      ? scenario.installationZones.find(
          (zone) => zone.id === module.assignedZoneId,
        )
      : undefined;

    if (!module) {
      return null;
    }

    return {
      title: module.label,
      kindLabel: "Module Unit",
      status: formatModularSlug(module.productionStatus),
      description: module.description,
      rows: [
        { label: "ID", value: module.id },
        { label: "Type", value: formatModularSlug(module.type) },
        { label: "Location", value: formatModularSlug(module.currentLocation) },
        {
          label: "Production",
          value: formatModularSlug(module.productionStatus),
        },
        { label: "Install", value: formatModularSlug(module.installationStatus) },
        { label: "Quality", value: formatModularSlug(module.qualityStatus) },
        {
          label: "Twin",
          value: formatModularSlug(module.digitalTwinAssociation),
        },
        {
          label: "Assigned Zone",
          value: assignedZone?.name ?? module.assignedZoneId ?? "Not assigned",
        },
      ],
    };
  }

  if (selectedEntity.kind === "production-station") {
    const station = scenario.productionStations.find(
      (candidate) => candidate.id === selectedEntity.id,
    );

    if (!station) {
      return null;
    }

    return {
      title: station.name,
      kindLabel: "Production Station",
      status: formatModularSlug(station.status),
      rows: [
        { label: "Type", value: station.stationType },
        { label: "Status", value: formatModularSlug(station.status) },
        { label: "Modules", value: formatList(station.moduleIds) },
        {
          label: "Footprint",
          value: `${station.footprint.widthMeters}m x ${station.footprint.depthMeters}m`,
        },
      ],
    };
  }

  if (selectedEntity.kind === "installation-zone") {
    const zone = scenario.installationZones.find(
      (candidate) => candidate.id === selectedEntity.id,
    );

    if (!zone) {
      return null;
    }

    return {
      title: zone.name,
      kindLabel: "Installation Zone",
      status: formatModularSlug(zone.status),
      rows: [
        { label: "Status", value: formatModularSlug(zone.status) },
        { label: "Modules", value: formatList(zone.assignedModuleIds) },
        { label: "Coordinates", value: formatCoordinate(zone.location) },
      ],
    };
  }

  return null;
}
