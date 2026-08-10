import type {
  UrbanCoordinate,
  UrbanResourceSite,
  UrbanResponseRoute,
} from "../../types/urbanResilience";
import { isUrbanResourceType, isUrbanRouteStatus } from "./urbanResilienceContract";

export interface UrbanResponseContext {
  routes: UrbanResponseRoute[];
  resources: UrbanResourceSite[];
}

interface GeoJsonFeature {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

function toCoordinate([lon, lat]: [number, number]): UrbanCoordinate {
  return { lat, lon, height: 0 };
}

function parseRoute(feature: GeoJsonFeature): UrbanResponseRoute | null {
  const { properties, geometry } = feature;

  if (geometry.type !== "LineString") {
    return null;
  }

  const status = properties.status;
  const id = properties.id;
  const name = properties.name;
  const description = properties.description;

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof description !== "string" ||
    !isUrbanRouteStatus(status)
  ) {
    return null;
  }

  const positions = (geometry.coordinates as [number, number][]).map(toCoordinate);

  if (positions.length < 2) {
    return null;
  }

  return { id, name, status, positions, description };
}

function parseResource(feature: GeoJsonFeature): UrbanResourceSite | null {
  const { properties, geometry } = feature;

  if (geometry.type !== "Point") {
    return null;
  }

  const id = properties.id;
  const name = properties.name;
  const description = properties.description;
  const resourceType = properties.resource_type;

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof description !== "string" ||
    !isUrbanResourceType(resourceType)
  ) {
    return null;
  }

  return {
    id,
    name,
    resourceType,
    location: toCoordinate(geometry.coordinates as [number, number]),
    description,
  };
}

export function parseUrbanResponseContext(value: unknown): UrbanResponseContext {
  const geoJson = value as GeoJsonFeatureCollection;
  const routes: UrbanResponseRoute[] = [];
  const resources: UrbanResourceSite[] = [];

  if (geoJson?.type !== "FeatureCollection" || !Array.isArray(geoJson.features)) {
    return { routes, resources };
  }

  for (const feature of geoJson.features) {
    if (feature.properties?.feature_kind === "route") {
      const route = parseRoute(feature);
      if (route) {
        routes.push(route);
      }
    } else if (feature.properties?.feature_kind === "resource") {
      const resource = parseResource(feature);
      if (resource) {
        resources.push(resource);
      }
    }
  }

  return { routes, resources };
}
