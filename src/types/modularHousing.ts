export interface ModularCoordinate {
  lat: number;
  lon: number;
  height?: number;
}

export type ModularSiteRole = "factory" | "construction-site";

export interface ModularSite {
  id: string;
  name: string;
  role: ModularSiteRole;
  location: ModularCoordinate;
  description: string;
  status: string;
}

export type LogisticsRouteStatus = "planned" | "ready" | "active" | "delivered";

export interface LogisticsCheckpoint {
  id: string;
  label: string;
  location: ModularCoordinate;
  status: string;
}

export interface LogisticsRoute {
  id: string;
  name: string;
  fromSiteId: string;
  toSiteId: string;
  status: LogisticsRouteStatus;
  estimatedDistanceMiles: number;
  checkpoints: LogisticsCheckpoint[];
}

export type ModuleType =
  | "bathroom-pod"
  | "bedroom-module"
  | "kitchen-living-module"
  | "mep-module";

export type ModuleCurrentLocation =
  | "factory"
  | "in-transit"
  | "construction-site";

export type ModuleProductionStatus =
  | "queued"
  | "fabricating"
  | "robotic-cell-delay"
  | "fabrication-complete";

export type ModuleInstallationStatus =
  | "not-ready"
  | "scheduled"
  | "delivered"
  | "installed"
  | "inspection-pending"
  | "complete";

export type ModuleQualityStatus =
  | "not-started"
  | "qc-pending"
  | "qc-passed"
  | "rework-needed";

export type DigitalTwinAssociation =
  | "factory-twin"
  | "logistics-twin"
  | "construction-site-twin"
  | "shared-module-twin";

export interface ModularUnit {
  id: string;
  type: ModuleType;
  label: string;
  currentLocation: ModuleCurrentLocation;
  productionStatus: ModuleProductionStatus;
  installationStatus: ModuleInstallationStatus;
  qualityStatus: ModuleQualityStatus;
  digitalTwinAssociation: DigitalTwinAssociation;
  assignedZoneId?: string;
  description: string;
}

export type ProductionStationStatus =
  | "idle"
  | "active"
  | "delayed"
  | "quality-check";

export interface ProductionStation {
  id: string;
  name: string;
  stationType: string;
  status: ProductionStationStatus;
  siteId: string;
  moduleIds: string[];
}

export type InstallationZoneStatus =
  | "foundation-ready"
  | "awaiting-module"
  | "module-delivered"
  | "module-installed"
  | "inspection-pending";

export interface InstallationZone {
  id: string;
  name: string;
  status: InstallationZoneStatus;
  siteId: string;
  location: ModularCoordinate;
  assignedModuleIds: string[];
}

export type ModularTwinEventSource =
  | "Factory Twin"
  | "Logistics Twin"
  | "Site Twin"
  | "AI Agent";

export interface ModularTwinEvent {
  id: string;
  source: ModularTwinEventSource;
  message: string;
  timestamp: string;
  relatedModuleId?: string;
}

export type RecommendationPriority = "high" | "medium" | "low";

export interface ModularAiRecommendation {
  id: string;
  priority: RecommendationPriority;
  message: string;
  rationale: string;
  relatedModuleId?: string;
}

export interface ModularHousingScenario {
  id: string;
  name: string;
  description: string;
  factorySite: ModularSite;
  constructionSite: ModularSite;
  route: LogisticsRoute;
  modules: ModularUnit[];
  productionStations: ProductionStation[];
  installationZones: InstallationZone[];
  events: ModularTwinEvent[];
  recommendations: ModularAiRecommendation[];
}
