import * as Cesium from "cesium";
import { isDisasterRiskLevel } from "../domain/disasterResilience/disasterResilienceContract";
import type { DisasterRiskLevel } from "../types/disasterResilience";

export const DISASTER_PROPERTY_MATERIAL_ALPHA = 0.82;
export const DEFAULT_DISASTER_BUILDING_HEIGHT_M = 6;
export const DISASTER_PROPERTY_LABEL_MAX_DISTANCE_M = 800;
export const SELECTED_DISASTER_PROPERTY_MATERIAL_ALPHA = 1;

export const selectedDisasterPropertyOutlineColor =
  Cesium.Color.fromCssColorString("#fef08a");

export const disasterRiskColors: Readonly<
  Record<DisasterRiskLevel, Cesium.Color>
> = {
  Low: Cesium.Color.fromCssColorString("#22c55e"),
  Moderate: Cesium.Color.fromCssColorString("#f59e0b"),
  High: Cesium.Color.fromCssColorString("#ef4444"),
};

export const unknownDisasterRiskColor = Cesium.Color.fromCssColorString(
  "#64748b",
);

export interface DisasterPropertyVisualStyle {
  color: Cesium.Color;
  label: string;
  riskLevel: DisasterRiskLevel | null;
}

export function getDisasterPropertyVisualStyle(
  value: unknown,
): DisasterPropertyVisualStyle {
  if (isDisasterRiskLevel(value)) {
    return {
      color: disasterRiskColors[value],
      label: `${value} risk`,
      riskLevel: value,
    };
  }

  return {
    color: unknownDisasterRiskColor,
    label: "Unclassified risk",
    riskLevel: null,
  };
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function asBuildingHeight(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_DISASTER_BUILDING_HEIGHT_M;
}

function setEntityMetadata(
  properties: Cesium.PropertyBag,
  name: string,
  value: string,
): void {
  if (!properties.propertyNames.includes(name)) {
    properties.addProperty(name);
  }

  properties[name] = new Cesium.ConstantProperty(value);
}

function polygonRoofPosition(
  entity: Cesium.Entity,
  time: Cesium.JulianDate,
  buildingHeightM: number,
): Cesium.Cartesian3 | null {
  const hierarchy = entity.polygon?.hierarchy?.getValue(time) as
    | Cesium.PolygonHierarchy
    | undefined;
  const positions = hierarchy?.positions;

  if (!positions || positions.length === 0) {
    return null;
  }

  const cartographics = positions.map((position) =>
    Cesium.Cartographic.fromCartesian(position),
  );
  const longitude =
    cartographics.reduce((sum, position) => sum + position.longitude, 0) /
    cartographics.length;
  const latitude =
    cartographics.reduce((sum, position) => sum + position.latitude, 0) /
    cartographics.length;

  return Cesium.Cartesian3.fromRadians(
    longitude,
    latitude,
    buildingHeightM + 1.5,
  );
}

function stylePropertyEntity(
  entity: Cesium.Entity,
  time: Cesium.JulianDate,
): { propertyId: string; entity: Cesium.Entity } | null {
  if (!entity.polygon || !entity.properties) {
    return null;
  }

  const values = entity.properties.getValue(time) as Record<string, unknown>;
  const propertyId = asNonEmptyString(values.property_id) ?? entity.id;
  const addressLabel =
    asNonEmptyString(values.address_label) ?? propertyId ?? "Fictional property";
  const buildingHeightM = asBuildingHeight(values.building_height_m);
  const riskStyle = getDisasterPropertyVisualStyle(values.risk_level);

  entity.name = addressLabel;
  entity.polygon.height = new Cesium.ConstantProperty(0);
  entity.polygon.heightReference = new Cesium.ConstantProperty(
    Cesium.HeightReference.NONE,
  );
  entity.polygon.extrudedHeight = new Cesium.ConstantProperty(buildingHeightM);
  entity.polygon.extrudedHeightReference = new Cesium.ConstantProperty(
    Cesium.HeightReference.NONE,
  );
  entity.polygon.perPositionHeight = new Cesium.ConstantProperty(false);
  entity.polygon.material = new Cesium.ColorMaterialProperty(
    riskStyle.color.withAlpha(DISASTER_PROPERTY_MATERIAL_ALPHA),
  );
  entity.polygon.outline = new Cesium.ConstantProperty(true);
  entity.polygon.outlineColor = new Cesium.ConstantProperty(Cesium.Color.WHITE);
  entity.polygon.closeTop = new Cesium.ConstantProperty(true);
  entity.polygon.closeBottom = new Cesium.ConstantProperty(true);

  const roofPosition = polygonRoofPosition(entity, time, buildingHeightM);

  if (roofPosition) {
    entity.position = new Cesium.ConstantPositionProperty(roofPosition);
    entity.label = new Cesium.LabelGraphics({
      text: `${addressLabel}\n${riskStyle.label}`,
      font: "bold 13px sans-serif",
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -8),
      heightReference: Cesium.HeightReference.NONE,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        0,
        DISASTER_PROPERTY_LABEL_MAX_DISTANCE_M,
      ),
    });
  }

  setEntityMetadata(entity.properties, "entityType", "disasterProperty");
  setEntityMetadata(entity.properties, "disasterPropertyId", propertyId);

  return { propertyId, entity };
}

export function applyDisasterPropertyVisualState(
  entity: Cesium.Entity,
  isSelected: boolean,
  time = Cesium.JulianDate.now(),
): void {
  if (!entity.polygon || !entity.properties) {
    return;
  }

  const values = entity.properties.getValue(time) as Record<string, unknown>;
  const propertyId = asNonEmptyString(values.property_id) ?? entity.id;
  const addressLabel =
    asNonEmptyString(values.address_label) ?? propertyId ?? "Fictional property";
  const riskStyle = getDisasterPropertyVisualStyle(values.risk_level);

  entity.polygon.material = new Cesium.ColorMaterialProperty(
    riskStyle.color.withAlpha(
      isSelected
        ? SELECTED_DISASTER_PROPERTY_MATERIAL_ALPHA
        : DISASTER_PROPERTY_MATERIAL_ALPHA,
    ),
  );
  entity.polygon.outlineColor = new Cesium.ConstantProperty(
    isSelected ? selectedDisasterPropertyOutlineColor : Cesium.Color.WHITE,
  );

  if (!entity.label) {
    return;
  }

  entity.label.text = new Cesium.ConstantProperty(
    `${isSelected ? "Selected\n" : ""}${addressLabel}\n${riskStyle.label}`,
  );
  entity.label.fillColor = new Cesium.ConstantProperty(
    isSelected ? selectedDisasterPropertyOutlineColor : Cesium.Color.WHITE,
  );
  entity.label.scale = new Cesium.ConstantProperty(isSelected ? 1.15 : 1);
  entity.label.showBackground = new Cesium.ConstantProperty(isSelected);
  entity.label.backgroundColor = new Cesium.ConstantProperty(
    Cesium.Color.BLACK.withAlpha(0.72),
  );
}

export function styleDisasterPropertyDataSource(
  dataSource: Cesium.GeoJsonDataSource,
  time = Cesium.JulianDate.now(),
): Map<string, Cesium.Entity> {
  const propertyEntities = new Map<string, Cesium.Entity>();

  dataSource.entities.values.forEach((entity) => {
    const styledProperty = stylePropertyEntity(entity, time);

    if (styledProperty) {
      propertyEntities.set(styledProperty.propertyId, styledProperty.entity);
    }
  });

  return propertyEntities;
}
