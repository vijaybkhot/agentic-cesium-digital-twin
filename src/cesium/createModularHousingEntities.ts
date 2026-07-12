import * as Cesium from "cesium";
import type {
  InstallationZone,
  ModularCameraTarget,
  ModularCoordinate,
  ModularEntityKind,
  ModularHousingScenario,
  ModularUnit,
  ProductionStation,
} from "../types/modularHousing";
import { formatModularSlug } from "../domain/modularHousing/formatModularHousingLabels";

const modularColors = {
  factory: Cesium.Color.fromCssColorString("#2563eb"),
  site: Cesium.Color.fromCssColorString("#16a34a"),
  route: Cesium.Color.fromCssColorString("#f97316"),
  routeCheckpoint: Cesium.Color.fromCssColorString("#fb923c"),
  moduleFactory: Cesium.Color.fromCssColorString("#06b6d4"),
  moduleTransit: Cesium.Color.fromCssColorString("#facc15"),
  moduleSite: Cesium.Color.fromCssColorString("#22c55e"),
  station: Cesium.Color.fromCssColorString("#7c3aed"),
  stationDelayed: Cesium.Color.fromCssColorString("#ef4444"),
  zoneReady: Cesium.Color.fromCssColorString("#84cc16"),
  zoneWaiting: Cesium.Color.fromCssColorString("#f59e0b"),
  selected: Cesium.Color.YELLOW,
};

function pointFromCoordinate(coordinate: ModularCoordinate): Cesium.Cartesian3 {
  return Cesium.Cartesian3.fromDegrees(
    coordinate.lon,
    coordinate.lat,
    coordinate.height ?? 0,
  );
}

function offsetCoordinate(
  coordinate: ModularCoordinate,
  eastMeters: number,
  northMeters: number,
): ModularCoordinate {
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLon =
    metersPerDegreeLat * Math.cos(Cesium.Math.toRadians(coordinate.lat));

  return {
    lat: coordinate.lat + northMeters / metersPerDegreeLat,
    lon: coordinate.lon + eastMeters / metersPerDegreeLon,
    height: coordinate.height ?? 0,
  };
}

function getModuleCoordinate(
  scenario: ModularHousingScenario,
  module: ModularUnit,
  moduleIndex: number,
): ModularCoordinate {
  if (module.currentLocation === "in-transit") {
    const midpoint =
      scenario.route.checkpoints.find((checkpoint) =>
        checkpoint.id.includes("midpoint"),
      ) ?? scenario.route.checkpoints[0];
    const column = moduleIndex % 2 === 0 ? -1 : 1;
    const row = Math.floor(moduleIndex / 2);

    return offsetCoordinate(
      midpoint.location,
      120 * column,
      -120 + row * 140,
    );
  }

  if (module.currentLocation === "construction-site" && module.assignedZoneId) {
    const zone = scenario.installationZones.find(
      (candidate) => candidate.id === module.assignedZoneId,
    );

    if (zone) {
      return offsetCoordinate(zone.location, 45, -45);
    }
  }

  return offsetCoordinate(
    scenario.factorySite.location,
    -120 + moduleIndex * 120,
    -120,
  );
}

function getModulesByLocation(
  scenario: ModularHousingScenario,
  currentLocation: ModularUnit["currentLocation"],
): ModularUnit[] {
  return scenario.modules.filter(
    (module) => module.currentLocation === currentLocation,
  );
}

function getFocusCoordinates(
  scenario: ModularHousingScenario,
  target: ModularCameraTarget,
): ModularCoordinate[] {
  if (target === "factory") {
    return [
      scenario.factorySite.location,
      ...scenario.productionStations.map((station) => station.location),
      ...getModulesByLocation(scenario, "factory").map((module, index) =>
        getModuleCoordinate(scenario, module, index),
      ),
    ];
  }

  if (target === "site") {
    return [
      scenario.constructionSite.location,
      ...scenario.installationZones.map((zone) => zone.location),
      ...getModulesByLocation(scenario, "construction-site").map(
        (module, index) => getModuleCoordinate(scenario, module, index),
      ),
    ];
  }

  return [
    scenario.factorySite.location,
    ...scenario.route.checkpoints.map((checkpoint) => checkpoint.location),
    scenario.constructionSite.location,
  ];
}

function moduleColor(module: ModularUnit): Cesium.Color {
  if (module.currentLocation === "in-transit") {
    return modularColors.moduleTransit;
  }

  if (module.currentLocation === "construction-site") {
    return modularColors.moduleSite;
  }

  return modularColors.moduleFactory;
}

function stationColor(station: ProductionStation): Cesium.Color {
  if (station.status === "delayed") {
    return modularColors.stationDelayed;
  }

  return modularColors.station;
}

function zoneColor(zone: InstallationZone): Cesium.Color {
  if (zone.status === "foundation-ready" || zone.status === "module-installed") {
    return modularColors.zoneReady;
  }

  return modularColors.zoneWaiting;
}

function addEntityMetadata(
  kind: ModularEntityKind,
  id: string,
  visualState?: {
    pixelSize?: number;
    outlineColor?: Cesium.Color;
    outlineWidth?: number;
    polylineWidth?: number;
  },
): {
  entityType: string;
  modularKind: ModularEntityKind;
  modularId: string;
  basePixelSize?: number;
  baseOutlineColor?: Cesium.Color;
  baseOutlineWidth?: number;
  basePolylineWidth?: number;
} {
  return {
    entityType: "modularEntity",
    modularKind: kind,
    modularId: id,
    basePixelSize: visualState?.pixelSize,
    baseOutlineColor: visualState?.outlineColor,
    baseOutlineWidth: visualState?.outlineWidth,
    basePolylineWidth: visualState?.polylineWidth,
  };
}

function createSiteEntity(
  viewer: Cesium.Viewer,
  kind: "factory-site" | "construction-site",
  id: string,
  name: string,
  coordinate: ModularCoordinate,
  color: Cesium.Color,
  description: string,
): Cesium.Entity {
  return viewer.entities.add({
    id: `modular:${kind}:${id}`,
    name,
    position: pointFromCoordinate(coordinate),
    point: {
      pixelSize: 18,
      color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
    },
    ellipse: {
      semiMajorAxis: 320,
      semiMinorAxis: 220,
      material: color.withAlpha(0.16),
      outline: true,
      outlineColor: color,
    },
    label: {
      text: name,
      font: "14px sans-serif",
      pixelOffset: new Cesium.Cartesian2(0, -30),
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    description,
    properties: addEntityMetadata(kind, id, {
      pixelSize: 18,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
    }),
  });
}

function createRouteEntity(
  viewer: Cesium.Viewer,
  scenario: ModularHousingScenario,
): Cesium.Entity {
  const routeCoordinates = [
    scenario.factorySite.location,
    ...scenario.route.checkpoints.map((checkpoint) => checkpoint.location),
    scenario.constructionSite.location,
  ];

  return viewer.entities.add({
    id: `modular:logistics-route:${scenario.route.id}`,
    name: scenario.route.name,
    polyline: {
      positions: routeCoordinates.map(pointFromCoordinate),
      width: 5,
      material: modularColors.route,
      clampToGround: true,
    },
    description: `
      <strong>${scenario.route.name}</strong><br />
      Status: ${formatModularSlug(scenario.route.status)}<br />
      Distance: ${scenario.route.estimatedDistanceMiles.toFixed(1)} mi
    `,
    properties: addEntityMetadata("logistics-route", scenario.route.id, {
      polylineWidth: 5,
    }),
  });
}

function createCheckpointEntity(
  viewer: Cesium.Viewer,
  checkpoint: ModularHousingScenario["route"]["checkpoints"][number],
): Cesium.Entity {
  return viewer.entities.add({
    id: `modular:route-checkpoint:${checkpoint.id}`,
    name: checkpoint.label,
    position: pointFromCoordinate(checkpoint.location),
    point: {
      pixelSize: 10,
      color: modularColors.routeCheckpoint,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    label: {
      text: checkpoint.label,
      font: "12px sans-serif",
      pixelOffset: new Cesium.Cartesian2(0, 18),
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    description: `
      <strong>${checkpoint.label}</strong><br />
      Status: ${formatModularSlug(checkpoint.status)}
    `,
    properties: addEntityMetadata("route-checkpoint", checkpoint.id, {
      pixelSize: 10,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    }),
  });
}

function createModuleEntity(
  viewer: Cesium.Viewer,
  scenario: ModularHousingScenario,
  module: ModularUnit,
  moduleIndex: number,
): Cesium.Entity {
  const coordinate = getModuleCoordinate(scenario, module, moduleIndex);
  const color = moduleColor(module);

  return viewer.entities.add({
    id: `modular:module:${module.id}`,
    name: module.label,
    position: pointFromCoordinate(coordinate),
    point: {
      pixelSize: 15,
      color,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    label: {
      text: `${module.id}\n${formatModularSlug(module.currentLocation)}`,
      font: "12px sans-serif",
      pixelOffset: new Cesium.Cartesian2(0, -30),
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    description: `
      <strong>${module.label}</strong><br />
      Module ID: ${module.id}<br />
      Location: ${formatModularSlug(module.currentLocation)}<br />
      Production: ${formatModularSlug(module.productionStatus)}<br />
      Install: ${formatModularSlug(module.installationStatus)}<br />
      Quality: ${formatModularSlug(module.qualityStatus)}
    `,
    properties: addEntityMetadata("module", module.id, {
      pixelSize: 15,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    }),
  });
}

function createStationEntity(
  viewer: Cesium.Viewer,
  station: ProductionStation,
): Cesium.Entity {
  const color = stationColor(station);

  return viewer.entities.add({
    id: `modular:production-station:${station.id}`,
    name: station.name,
    position: pointFromCoordinate(station.location),
    point: {
      pixelSize: 13,
      color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: `${station.name}\n${formatModularSlug(station.status)}`,
      font: "12px sans-serif",
      pixelOffset: new Cesium.Cartesian2(0, 24),
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    description: `
      <strong>${station.name}</strong><br />
      Type: ${station.stationType}<br />
      Status: ${formatModularSlug(station.status)}<br />
      Modules: ${station.moduleIds.join(", ") || "None assigned"}
    `,
    properties: addEntityMetadata("production-station", station.id, {
      pixelSize: 13,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    }),
  });
}

function createInstallationZoneEntity(
  viewer: Cesium.Viewer,
  zone: InstallationZone,
): Cesium.Entity {
  const color = zoneColor(zone);

  return viewer.entities.add({
    id: `modular:installation-zone:${zone.id}`,
    name: zone.name,
    position: pointFromCoordinate(zone.location),
    point: {
      pixelSize: 12,
      color,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    ellipse: {
      semiMajorAxis: 90,
      semiMinorAxis: 65,
      material: color.withAlpha(0.2),
      outline: true,
      outlineColor: color,
    },
    label: {
      text: `${zone.name}\n${formatModularSlug(zone.status)}`,
      font: "12px sans-serif",
      pixelOffset: new Cesium.Cartesian2(0, -28),
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    description: `
      <strong>${zone.name}</strong><br />
      Status: ${formatModularSlug(zone.status)}<br />
      Assigned modules: ${zone.assignedModuleIds.join(", ")}
    `,
    properties: addEntityMetadata("installation-zone", zone.id, {
      pixelSize: 12,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    }),
  });
}

export function createModularHousingEntities(
  viewer: Cesium.Viewer,
  scenario: ModularHousingScenario,
): Map<string, Cesium.Entity> {
  const entities = new Map<string, Cesium.Entity>();

  const factoryEntity = createSiteEntity(
    viewer,
    "factory-site",
    scenario.factorySite.id,
    scenario.factorySite.name,
    scenario.factorySite.location,
    modularColors.factory,
    scenario.factorySite.description,
  );
  entities.set(scenario.factorySite.id, factoryEntity);

  const siteEntity = createSiteEntity(
    viewer,
    "construction-site",
    scenario.constructionSite.id,
    scenario.constructionSite.name,
    scenario.constructionSite.location,
    modularColors.site,
    scenario.constructionSite.description,
  );
  entities.set(scenario.constructionSite.id, siteEntity);

  const routeEntity = createRouteEntity(viewer, scenario);
  entities.set(scenario.route.id, routeEntity);

  scenario.route.checkpoints.forEach((checkpoint) => {
    entities.set(checkpoint.id, createCheckpointEntity(viewer, checkpoint));
  });

  scenario.installationZones.forEach((zone) => {
    entities.set(zone.id, createInstallationZoneEntity(viewer, zone));
  });

  scenario.productionStations.forEach((station) => {
    entities.set(station.id, createStationEntity(viewer, station));
  });

  const moduleLocationIndexes = new Map<ModularUnit["currentLocation"], number>();

  scenario.modules.forEach((module) => {
    const locationIndex = moduleLocationIndexes.get(module.currentLocation) ?? 0;
    moduleLocationIndexes.set(module.currentLocation, locationIndex + 1);
    entities.set(
      module.id,
      createModuleEntity(viewer, scenario, module, locationIndex),
    );
  });

  return entities;
}

export function applyModularEntityVisualState(
  entity: Cesium.Entity,
  isSelected: boolean,
): void {
  if (entity.point) {
    const baseSize = entity.properties?.basePixelSize?.getValue() as
      | number
      | undefined;
    const baseOutlineColor = entity.properties?.baseOutlineColor?.getValue() as
      | Cesium.Color
      | undefined;
    const baseOutlineWidth = entity.properties?.baseOutlineWidth?.getValue() as
      | number
      | undefined;

    entity.point.pixelSize = new Cesium.ConstantProperty(
      isSelected ? (baseSize ?? 12) + 7 : baseSize ?? 12,
    );
    entity.point.outlineColor = new Cesium.ConstantProperty(
      isSelected
        ? modularColors.selected
        : baseOutlineColor ?? Cesium.Color.BLACK,
    );
    entity.point.outlineWidth = new Cesium.ConstantProperty(
      isSelected ? 4 : baseOutlineWidth ?? 2,
    );
  }

  if (entity.polyline) {
    const basePolylineWidth = entity.properties?.basePolylineWidth?.getValue() as
      | number
      | undefined;
    entity.polyline.width = new Cesium.ConstantProperty(
      isSelected ? (basePolylineWidth ?? 5) + 3 : basePolylineWidth ?? 5,
    );
  }

  if (entity.label) {
    entity.label.fillColor = new Cesium.ConstantProperty(
      isSelected ? modularColors.selected : Cesium.Color.WHITE,
    );
  }
}

export function flyToModularScenarioTarget(
  viewer: Cesium.Viewer,
  scenario: ModularHousingScenario,
  target: ModularCameraTarget,
): void {
  const focusPoints = getFocusCoordinates(scenario, target).map(
    pointFromCoordinate,
  );
  const range = target === "system" ? 30000 : 2400;
  const boundingSphere = Cesium.BoundingSphere.fromPoints(focusPoints);

  viewer.camera.flyToBoundingSphere(boundingSphere, {
    offset: new Cesium.HeadingPitchRange(
      0,
      -Cesium.Math.PI_OVER_TWO,
      range,
    ),
    duration: 1,
  });
}
