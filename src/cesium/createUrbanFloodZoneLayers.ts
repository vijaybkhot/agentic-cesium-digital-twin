import * as Cesium from "cesium";
import { isUrbanRiskLevel } from "../domain/urbanResilience/urbanResilienceContract";
import { urbanResilienceVisualColors } from "../theme/urbanResilienceVisualTokens";
import { unknownUrbanRiskColor, urbanRiskColors } from "./styleUrbanPropertyDataSource";

export const URBAN_FLOOD_ZONE_MATERIAL_ALPHA = 0.22;
export const URBAN_FLOOD_ZONE_OUTLINE_COLOR = Cesium.Color.fromCssColorString(
  urbanResilienceVisualColors.floodZoneOutline,
);

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

// FEMA NFHL flood-zone polygons are draped color overlays keyed by the same
// zone-based risk classification used for properties -- not extruded volumes,
// since per-zone depth (STATIC_BFE_ft) is not reliably present for every zone.
export function styleUrbanFloodZoneDataSource(
  dataSource: Cesium.GeoJsonDataSource,
  time = Cesium.JulianDate.now(),
): Map<string, Cesium.Entity> {
  const zoneEntities = new Map<string, Cesium.Entity>();

  dataSource.entities.values.forEach((entity) => {
    if (!entity.polygon || !entity.properties) {
      return;
    }

    const values = entity.properties.getValue(time) as Record<string, unknown>;
    const zoneId = asNonEmptyString(values.id) ?? entity.id;
    const zoneCode = asNonEmptyString(values.flood_zone_code) ?? "Unknown";
    const riskLevel = values.risk_level;
    const color = isUrbanRiskLevel(riskLevel) ? urbanRiskColors[riskLevel] : unknownUrbanRiskColor;

    entity.name = `FEMA Flood Zone ${zoneCode}`;
    entity.polygon.heightReference = new Cesium.ConstantProperty(Cesium.HeightReference.CLAMP_TO_GROUND);
    entity.polygon.material = new Cesium.ColorMaterialProperty(
      color.withAlpha(URBAN_FLOOD_ZONE_MATERIAL_ALPHA),
    );
    entity.polygon.outline = new Cesium.ConstantProperty(true);
    entity.polygon.outlineColor = new Cesium.ConstantProperty(URBAN_FLOOD_ZONE_OUTLINE_COLOR);

    if (!entity.properties.propertyNames.includes("entityType")) {
      entity.properties.addProperty("entityType");
    }

    entity.properties.entityType = new Cesium.ConstantProperty("urbanFloodZone");

    zoneEntities.set(zoneId, entity);
  });

  return zoneEntities;
}
