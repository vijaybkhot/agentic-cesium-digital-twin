import { useEffect, useRef, useState } from "react";
import esriConfig from "@arcgis/core/config.js";
import type Graphic from "@arcgis/core/Graphic.js";
import Map from "@arcgis/core/Map.js";
import Basemap from "@arcgis/core/Basemap.js";
import Ground from "@arcgis/core/Ground.js";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js";
import OpenStreetMapLayer from "@arcgis/core/layers/OpenStreetMapLayer.js";
import BasemapStyle from "@arcgis/core/support/BasemapStyle.js";
import SceneView from "@arcgis/core/views/SceneView.js";

const PROPERTY_DATA_URL =
  "/data/urban-resilience/grand_isle_port_fourchon_properties.geojson";
const FLOOD_ZONE_DATA_URL =
  "/data/urban-resilience/grand_isle_port_fourchon_flood_zones.geojson";
const LA1_FEMA_DATA_URL =
  "/data/urban-resilience/experiments/la1_fema_intersections.geojson";

const RISK_COLORS = {
  Low: "#22c55e",
  Moderate: "#f59e0b",
  High: "#ef4444",
  Unknown: "#64748b",
} as const;

interface SelectedBuilding {
  propertyId: string;
  addressLabel: string;
  osmWayId: string;
  occupancyType: string;
  floodZoneCode: string;
  riskLevel: string;
  buildingHeightM: string;
  dataSource: string;
  confidenceNote: string;
}

interface SelectedRoadSegment {
  segmentId: string;
  osmWayId: string;
  name: string;
  roadReference: string;
  highwayType: string;
  coverageStatus: string;
  mappedOverlap: string;
  relationshipReason: string;
  interpretation: string;
  osmSource: string;
  femaSource: string;
}

interface BuildingCounts {
  total: number;
  grandIsle: number;
  portFourchon: number;
}

interface RemovableHandle {
  remove(): void;
}

interface HighlightableLayerView {
  highlight(target: Graphic): RemovableHandle;
}

function displayValue(value: unknown, fallback = "Not available"): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return fallback;
}

function selectedBuildingFromGraphic(graphic: Graphic): SelectedBuilding {
  const attributes = graphic.attributes as Record<string, unknown>;

  return {
    propertyId: displayValue(attributes.property_id),
    addressLabel: displayValue(attributes.address_label),
    osmWayId: displayValue(attributes.osm_way_id),
    occupancyType: displayValue(attributes.occupancy_type),
    floodZoneCode: displayValue(attributes.flood_zone_code),
    riskLevel: displayValue(attributes.risk_level, "Unknown"),
    buildingHeightM: displayValue(attributes.building_height_m),
    dataSource: displayValue(attributes.data_source),
    confidenceNote: displayValue(attributes.confidence_note),
  };
}

function selectedRoadFromGraphic(graphic: Graphic): SelectedRoadSegment {
  const attributes = graphic.attributes as Record<string, unknown>;
  const relationshipReason = displayValue(attributes.fema_relationship_reason);
  const mappedOverlap = relationshipReason.startsWith(
    "The road centerline intersects mapped FEMA zone(s):",
  )
    ? "Yes"
    : relationshipReason.startsWith("No intersection was found")
      ? "No"
      : "Unknown";

  return {
    segmentId: displayValue(attributes.id),
    osmWayId: displayValue(attributes.osm_way_id),
    name: displayValue(attributes.name, "LA Highway 1"),
    roadReference: displayValue(attributes.ref),
    highwayType: displayValue(attributes.highway_type),
    coverageStatus: displayValue(attributes.fema_coverage_status),
    mappedOverlap,
    relationshipReason,
    interpretation: displayValue(attributes.interpretation),
    osmSource: displayValue(attributes.osm_source),
    femaSource: displayValue(attributes.fema_source),
  };
}

function extrudedRiskSymbol(color: string) {
  return {
    type: "polygon-3d" as const,
    symbolLayers: [
      {
        type: "extrude" as const,
        size: 5,
        material: { color },
        edges: {
          type: "solid" as const,
          color: [255, 255, 255, 0.72],
          size: 0.7,
        },
        castShadows: true,
      },
    ],
  };
}

function createBuildingLayer(): GeoJSONLayer {
  return new GeoJSONLayer({
    url: PROPERTY_DATA_URL,
    title: "Grand Isle OSM buildings with FEMA-derived classification",
    copyright: "OpenStreetMap contributors (ODbL); FEMA NFHL",
    fields: [
      { name: "property_id", alias: "Property identifier", type: "string" },
      { name: "address_label", alias: "Property label", type: "string" },
      { name: "occupancy_type", alias: "Occupancy type", type: "string" },
      { name: "flood_zone_code", alias: "FEMA zone", type: "string" },
      { name: "risk_level", alias: "Derived classification", type: "string" },
      { name: "recommended_action", alias: "Recommended action", type: "string" },
      { name: "data_source", alias: "Data source", type: "string" },
      { name: "confidence_note", alias: "Confidence note", type: "string" },
      { name: "building_height_m", alias: "Building height (m)", type: "double" },
      { name: "osm_way_id", alias: "OSM way ID", type: "double" },
    ],
    outFields: ["*"],
    popupEnabled: false,
    elevationInfo: { mode: "on-the-ground" },
    renderer: {
      type: "unique-value",
      field: "risk_level",
      defaultLabel: "Unclassified",
      defaultSymbol: extrudedRiskSymbol(RISK_COLORS.Unknown),
      uniqueValueInfos: Object.entries(RISK_COLORS).map(([value, color]) => ({
        value,
        label: value === "Unknown" ? "FEMA coverage unavailable" : `${value} risk`,
        symbol: extrudedRiskSymbol(color),
      })),
      visualVariables: [
        {
          type: "size",
          field: "building_height_m",
          valueUnit: "meters",
        },
      ],
    },
  });
}

function roadSymbol(color: string, style: "solid" | "short-dot" = "solid") {
  return {
    type: "simple-line" as const,
    color,
    width: style === "solid" ? 4 : 3,
    style,
  };
}

function createLa1FemaLayer(): GeoJSONLayer {
  return new GeoJSONLayer({
    url: LA1_FEMA_DATA_URL,
    title: "Experimental LA-1 FEMA relationships",
    copyright: "OpenStreetMap contributors (ODbL); FEMA NFHL",
    fields: [
      { name: "id", alias: "Segment identifier", type: "string" },
      { name: "osm_way_id", alias: "OSM way ID", type: "double" },
      { name: "name", alias: "Road name", type: "string" },
      { name: "ref", alias: "Road reference", type: "string" },
      { name: "highway_type", alias: "OSM highway type", type: "string" },
      { name: "fema_coverage_status", alias: "FEMA coverage status", type: "string" },
      {
        name: "fema_relationship_reason",
        alias: "FEMA relationship reason",
        type: "string",
      },
      { name: "interpretation", alias: "Interpretation", type: "string" },
      { name: "osm_source", alias: "OSM source", type: "string" },
      { name: "fema_source", alias: "FEMA source", type: "string" },
    ],
    outFields: ["*"],
    popupEnabled: false,
    elevationInfo: { mode: "on-the-ground", offset: 1, unit: "meters" },
    renderer: {
      type: "unique-value",
      valueExpression: `When(
        Find("The road centerline intersects mapped FEMA zone(s):", $feature.fema_relationship_reason) == 0,
        "overlap",
        Find("No intersection was found", $feature.fema_relationship_reason) == 0,
        "no-overlap",
        "unknown"
      )`,
      defaultLabel: "FEMA relationship unknown",
      defaultSymbol: roadSymbol("#94a3b8", "short-dot"),
      uniqueValueInfos: [
        {
          value: "overlap",
          label: "Intersects mapped FEMA hazard",
          symbol: roadSymbol("#52758f"),
        },
        {
          value: "no-overlap",
          label: "Evaluated with no mapped intersection",
          symbol: roadSymbol("#64748b"),
        },
      ],
    },
  });
}

function createFloodZoneLayer(): GeoJSONLayer {
  return new GeoJSONLayer({
    url: FLOOD_ZONE_DATA_URL,
    title: "FEMA NFHL flood-zone polygons",
    copyright: "FEMA National Flood Hazard Layer",
    fields: [
      { name: "id", alias: "Flood-zone identifier", type: "string" },
      { name: "flood_zone_code", alias: "FEMA zone", type: "string" },
      { name: "risk_level", alias: "Derived classification", type: "string" },
      { name: "static_bfe_ft", alias: "Static base flood elevation (ft)", type: "double" },
    ],
    outFields: ["*"],
    popupEnabled: false,
    elevationInfo: { mode: "on-the-ground", offset: 0.2, unit: "meters" },
    renderer: {
      type: "simple",
      symbol: {
        type: "polygon-3d",
        symbolLayers: [
          {
            type: "fill",
            material: { color: [185, 28, 28, 0.2] },
            outline: { color: [127, 29, 29, 0.82], size: 1.2 },
          },
        ],
      },
    },
  });
}

function createMap(apiKey: string | undefined): Map {
  const basemap = apiKey
    ? new Basemap({
        title: "ArcGIS imagery",
        style: new BasemapStyle({ id: "arcgis/imagery", apiKey }),
      })
    : new Basemap({
        title: "OpenStreetMap fallback",
        baseLayers: [new OpenStreetMapLayer()],
      });

  const ground = apiKey
    ? "world-elevation"
    : new Ground({ surfaceColor: "#d7e2d2" });

  return new Map({ basemap, ground });
}

export function ArcgisUrbanResilienceExperiment() {
  const sceneContainerRef = useRef<HTMLDivElement>(null);
  const floodZoneLayerRef = useRef<GeoJSONLayer | null>(null);
  const la1FemaLayerRef = useRef<GeoJSONLayer | null>(null);
  const [floodZoneVisible, setFloodZoneVisible] = useState(true);
  const [la1FemaVisible, setLa1FemaVisible] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<SelectedBuilding | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<SelectedRoadSegment | null>(null);
  const [buildingCounts, setBuildingCounts] = useState<BuildingCounts | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_ARCGIS_API_KEY?.trim();
  const hasApiKey = Boolean(apiKey);

  useEffect(() => {
    const container = sceneContainerRef.current;

    if (!container) {
      return;
    }

    if (apiKey) {
      esriConfig.apiKey = apiKey;
    }

    let disposed = false;
    let highlightHandle: RemovableHandle | null = null;
    const buildingLayer = createBuildingLayer();
    const floodZoneLayer = createFloodZoneLayer();
    const la1FemaLayer = createLa1FemaLayer();
    floodZoneLayer.visible = floodZoneVisible;
    la1FemaLayer.visible = la1FemaVisible;
    floodZoneLayerRef.current = floodZoneLayer;
    la1FemaLayerRef.current = la1FemaLayer;

    const map = createMap(apiKey);
    map.addMany([floodZoneLayer, buildingLayer, la1FemaLayer]);

    const view = new SceneView({
      container,
      map,
      qualityProfile: "high",
      viewingMode: "local",
      camera: {
        position: {
          longitude: -89.9873,
          latitude: 29.214,
          z: 2400,
        },
        heading: 0,
        tilt: 55,
      },
      environment: {
        atmosphereEnabled: true,
        starsEnabled: false,
        lighting: {
          directShadowsEnabled: true,
        },
      },
    });

    const clickHandle = view.on("click", async (event) => {
      try {
        const hit = await view.hitTest(event, { include: [buildingLayer, la1FemaLayer] });
        const buildingHit = hit.results.find(
          (result) => result.type === "graphic" && result.graphic.layer === buildingLayer,
        );
        const roadHit = hit.results.find(
          (result) => result.type === "graphic" && result.graphic.layer === la1FemaLayer,
        );

        highlightHandle?.remove();
        highlightHandle = null;

        if (roadHit?.type === "graphic") {
          const layerView = (await view.whenLayerView(
            la1FemaLayer,
          )) as unknown as HighlightableLayerView;
          highlightHandle = layerView.highlight(roadHit.graphic);

          if (!disposed) {
            setSelectedBuilding(null);
            setSelectedRoad(selectedRoadFromGraphic(roadHit.graphic));
          }
          return;
        }

        if (!buildingHit || buildingHit.type !== "graphic") {
          if (!disposed) {
            setSelectedBuilding(null);
            setSelectedRoad(null);
          }
          return;
        }

        const layerView = (await view.whenLayerView(
          buildingLayer,
        )) as unknown as HighlightableLayerView;
        highlightHandle = layerView.highlight(buildingHit.graphic);

        if (!disposed) {
          setSelectedRoad(null);
          setSelectedBuilding(selectedBuildingFromGraphic(buildingHit.graphic));
        }
      } catch (error) {
        if (!disposed) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to inspect the selected building.",
          );
        }
      }
    });

    void buildingLayer
      .load()
      .then(async () => {
        const grandIsleQuery = buildingLayer.createQuery();
        grandIsleQuery.where = "property_id LIKE 'GI-%'";
        const portFourchonQuery = buildingLayer.createQuery();
        portFourchonQuery.where = "property_id LIKE 'PF-%'";
        const [total, grandIsle, portFourchon, extentResult] = await Promise.all([
          buildingLayer.queryFeatureCount(),
          buildingLayer.queryFeatureCount(grandIsleQuery),
          buildingLayer.queryFeatureCount(portFourchonQuery),
          buildingLayer.queryExtent(),
        ]);

        if (disposed) {
          return;
        }

        setBuildingCounts({ total, grandIsle, portFourchon });

        if (extentResult.extent) {
          await view.when();

          if (disposed) {
            return;
          }

          await view.goTo(
            {
              target: extentResult.extent.expand(1.2),
              heading: 0,
              tilt: 55,
            },
            { animate: false },
          );
        }
      })
      .catch((error: unknown) => {
        if (!disposed) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load the local building GeoJSON.",
          );
        }
      });

    void floodZoneLayer.load().catch((error: unknown) => {
      if (!disposed) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to load the local FEMA GeoJSON.",
        );
      }
    });

    void la1FemaLayer.load().catch((error: unknown) => {
      if (!disposed) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to load the local LA-1 GeoJSON.",
        );
      }
    });

    void view.when().catch((error: unknown) => {
      if (!disposed) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to initialize the ArcGIS SceneView.",
        );
      }
    });

    return () => {
      disposed = true;
      clickHandle.remove();
      highlightHandle?.remove();
      floodZoneLayerRef.current = null;
      la1FemaLayerRef.current = null;
      view.destroy();
      map.removeAll();
      buildingLayer.destroy();
      floodZoneLayer.destroy();
      la1FemaLayer.destroy();
      esriConfig.apiKey = null;
    };
  }, [apiKey, hasApiKey]);

  useEffect(() => {
    if (floodZoneLayerRef.current) {
      floodZoneLayerRef.current.visible = floodZoneVisible;
    }
  }, [floodZoneVisible]);

  useEffect(() => {
    if (la1FemaLayerRef.current) {
      la1FemaLayerRef.current.visible = la1FemaVisible;
    }
  }, [la1FemaVisible]);

  return (
    <main className="arcgis-experiment-shell">
      <div ref={sceneContainerRef} className="arcgis-scene-container" aria-label="ArcGIS 3D scene" />

      <aside className="arcgis-experiment-panel" aria-labelledby="arcgis-experiment-title">
        <p className="arcgis-experiment-kicker">Visualization portability experiment</p>
        <h1 id="arcgis-experiment-title">ArcGIS 3D Urban Resilience Viewer</h1>
        <p>
          This isolated React SceneView consumes the same locally generated OSM/FEMA
          GeoJSON as the Cesium urban-resilience demo. It does not recompute risk.
        </p>

        <div className="arcgis-experiment-status" role="status">
          <strong>
            {buildingCounts === null
              ? "Loading Grand Isle and Port Fourchon structures…"
              : `${buildingCounts.total} structures loaded`}
          </strong>
          {buildingCounts ? (
            <span>
              {buildingCounts.grandIsle} Grand Isle High-risk records; {buildingCounts.portFourchon}{" "}
              Port Fourchon records with Unknown classification.
            </span>
          ) : null}
          <span>
            {hasApiKey
              ? "ArcGIS API key detected: satellite basemap and World Elevation requested."
              : "No ArcGIS API key detected: OpenStreetMap and flat-ground fallback active."}
          </span>
        </div>

        {loadError ? <p className="arcgis-experiment-error">Scene warning: {loadError}</p> : null}

        <label className="arcgis-layer-toggle">
          <input
            type="checkbox"
            checked={floodZoneVisible}
            onChange={(event) => setFloodZoneVisible(event.target.checked)}
          />
          Show existing FEMA flood-zone polygons
        </label>

        <label className="arcgis-layer-toggle">
          <input
            type="checkbox"
            checked={la1FemaVisible}
            onChange={(event) => setLa1FemaVisible(event.target.checked)}
          />
          Show existing experimental LA-1/FEMA relationships
        </label>

        <section className="arcgis-experiment-section" aria-labelledby="arcgis-road-legend-title">
          <h2 id="arcgis-road-legend-title">LA-1 FEMA relationship</h2>
          <ul className="arcgis-road-legend">
            <li><span className="arcgis-road-overlap" aria-hidden="true" />Mapped FEMA intersection</li>
            <li><span className="arcgis-road-no-overlap" aria-hidden="true" />Evaluated with no mapped intersection</li>
            <li><span className="arcgis-road-unknown" aria-hidden="true" />Unknown or not queried</li>
          </ul>
          <small>This reuses PR #66 output; ArcGIS performs no intersection analysis.</small>
        </section>

        <section className="arcgis-experiment-section" aria-labelledby="arcgis-legend-title">
          <h2 id="arcgis-legend-title">Existing derived classification</h2>
          <ul className="arcgis-risk-legend">
            {Object.entries(RISK_COLORS).map(([risk, color]) => (
              <li key={risk}>
                <span style={{ backgroundColor: color }} aria-hidden="true" />
                {risk}
              </li>
            ))}
          </ul>
          <small>Colors use the existing upstream `risk_level` attribute.</small>
        </section>

        <section className="arcgis-experiment-section" aria-labelledby="arcgis-road-selection-title">
          <h2 id="arcgis-road-selection-title">Selected LA-1 segment</h2>
          {selectedRoad ? (
            <dl className="arcgis-building-details">
              <dt>Segment identifier</dt><dd>{selectedRoad.segmentId}</dd>
              <dt>OSM way ID</dt><dd>{selectedRoad.osmWayId}</dd>
              <dt>Road</dt><dd>{selectedRoad.name}</dd>
              <dt>Reference</dt><dd>{selectedRoad.roadReference}</dd>
              <dt>OSM highway type</dt><dd>{selectedRoad.highwayType}</dd>
              <dt>FEMA coverage</dt><dd>{selectedRoad.coverageStatus}</dd>
              <dt>Mapped overlap</dt><dd>{selectedRoad.mappedOverlap}</dd>
              <dt>Relationship reason</dt><dd>{selectedRoad.relationshipReason}</dd>
              <dt>OSM source</dt><dd>{selectedRoad.osmSource}</dd>
              <dt>FEMA source</dt><dd>{selectedRoad.femaSource}</dd>
              <dt>Interpretation</dt><dd>{selectedRoad.interpretation}</dd>
            </dl>
          ) : (
            <p>Click a rendered LA-1 segment to inspect its existing FEMA relationship.</p>
          )}
        </section>

        <section className="arcgis-experiment-section" aria-labelledby="arcgis-selection-title">
          <h2 id="arcgis-selection-title">Selected building</h2>
          {selectedBuilding ? (
            <dl className="arcgis-building-details">
              <dt>Property identifier</dt>
              <dd>{selectedBuilding.propertyId}</dd>
              <dt>Label</dt>
              <dd>{selectedBuilding.addressLabel}</dd>
              <dt>OSM way ID</dt>
              <dd>{selectedBuilding.osmWayId}</dd>
              <dt>Occupancy</dt>
              <dd>{selectedBuilding.occupancyType}</dd>
              <dt>FEMA zone</dt>
              <dd>{selectedBuilding.floodZoneCode}</dd>
              <dt>Derived classification</dt>
              <dd>{selectedBuilding.riskLevel}</dd>
              <dt>Extrusion height</dt>
              <dd>{selectedBuilding.buildingHeightM} m</dd>
              <dt>Source</dt>
              <dd>{selectedBuilding.dataSource}</dd>
              <dt>Confidence note</dt>
              <dd>{selectedBuilding.confidenceNote}</dd>
            </dl>
          ) : (
            <p>Click an extruded building footprint to inspect its existing attributes.</p>
          )}
        </section>

        <p className="arcgis-experiment-disclaimer">
          Research visualization only. Not an official FEMA determination, live hazard
          feed, prediction, evacuation order, or emergency guidance.
        </p>

        <a className="arcgis-back-link" href="/">
          Return to the existing Cesium application
        </a>
      </aside>
    </main>
  );
}
