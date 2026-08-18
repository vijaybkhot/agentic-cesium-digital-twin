import type {
  UrbanCameraTarget,
  UrbanResilienceScenario,
  SelectedUrbanProperty,
  SelectedUrbanLa1FemaSegment,
  SelectedUrbanFacility,
} from "../../types/urbanResilience";
import { UrbanLa1FemaExperimentPanel } from "./UrbanLa1FemaExperimentPanel";
import { UrbanFacilityExperimentPanel } from "./UrbanFacilityExperimentPanel";
import { UrbanMapLegend } from "./UrbanMapLegend";
import { UrbanPropertyDashboard } from "./UrbanPropertyDashboard";
import { UrbanResponseContextList } from "./UrbanResponseContextList";
import { UrbanTwinEventFeed } from "./UrbanTwinEventFeed";
import "./UrbanResilienceDemoPanel.css";

interface UrbanResilienceDemoPanelProps {
  scenario: UrbanResilienceScenario;
  selectedProperty: SelectedUrbanProperty | null;
  selectedLa1FemaSegment: SelectedUrbanLa1FemaSegment | null;
  selectedFacility: SelectedUrbanFacility | null;
  la1FemaExperimentEnabled: boolean;
  facilityExperimentEnabled: boolean;
  ionTokenConfigured: boolean;
  osmBuildingsEnabled: boolean;
  onFocusTarget: (target: UrbanCameraTarget) => void;
  onLa1FemaExperimentEnabledChange: (enabled: boolean) => void;
  onFacilityExperimentEnabledChange: (enabled: boolean) => void;
  onNewProject: () => void;
  onOpenExistingDemo: () => void;
  onOpenModularDemo: () => void;
  onOpenDisasterDemo: () => void;
}

function formatCoordinate(value: number): string {
  return value.toFixed(5);
}

export function UrbanResilienceDemoPanel({
  scenario,
  selectedProperty,
  selectedLa1FemaSegment,
  selectedFacility,
  la1FemaExperimentEnabled,
  facilityExperimentEnabled,
  ionTokenConfigured,
  osmBuildingsEnabled,
  onFocusTarget,
  onLa1FemaExperimentEnabledChange,
  onFacilityExperimentEnabledChange,
  onNewProject,
  onOpenExistingDemo,
  onOpenModularDemo,
  onOpenDisasterDemo,
}: UrbanResilienceDemoPanelProps) {
  return (
    <aside className="urban-resilience-demo-panel">
      <div className="urban-resilience-demo-heading">
        <p className="panel-kicker">Research Prototype / Real Data</p>
        <h1>{scenario.name}</h1>
      </div>

      <p className="urban-resilience-disclaimer" role="note">
        {scenario.disclaimer}
      </p>

      <section className="urban-resilience-demo-section">
        <h2>Camera views</h2>
        <div className="urban-camera-controls" aria-label="Urban resilience camera views">
          <button className="panel-button" type="button" onClick={() => onFocusTarget("overall")}>
            Overall view
          </button>
          <button className="panel-button" type="button" onClick={() => onFocusTarget("flood")}>
            Flood zone view
          </button>
          <button
            className="panel-button"
            type="button"
            disabled={!selectedProperty}
            title={selectedProperty ? "Focus the selected property" : "Select a property first"}
            onClick={() => onFocusTarget("selected-property")}
          >
            Selected property view
          </button>
        </div>
      </section>

      <section className="urban-resilience-demo-section">
        <h2>Scenario</h2>
        <dl className="urban-resilience-demo-details">
          <div>
            <dt>Name</dt>
            <dd>{scenario.name}</dd>
          </div>
          <div>
            <dt>Area</dt>
            <dd>Grand Isle &amp; Port Fourchon, Louisiana</dd>
          </div>
          <div>
            <dt>Center</dt>
            <dd>
              {formatCoordinate(scenario.center.lat)}, {formatCoordinate(scenario.center.lon)}
            </dd>
          </div>
        </dl>
        <p className="urban-resilience-demo-copy">{scenario.description}</p>
      </section>

      <UrbanPropertyDashboard
        scenarioName={scenario.name}
        disclaimer={scenario.disclaimer}
        selectedProperty={selectedProperty}
      />

      <UrbanLa1FemaExperimentPanel
        enabled={la1FemaExperimentEnabled}
        selectedSegment={selectedLa1FemaSegment}
        onEnabledChange={onLa1FemaExperimentEnabledChange}
      />

      <UrbanFacilityExperimentPanel
        enabled={facilityExperimentEnabled}
        selectedFacility={selectedFacility}
        onEnabledChange={onFacilityExperimentEnabledChange}
      />

      <UrbanResponseContextList routes={scenario.routes} resources={scenario.resources} />

      <UrbanMapLegend />

      <UrbanTwinEventFeed events={scenario.events} />

      <section className="urban-resilience-demo-section">
        <h2>3D context</h2>
        <p
          className={`urban-osm-context-status ${
            !osmBuildingsEnabled
              ? "urban-osm-context-status-local"
              : ionTokenConfigured
              ? "urban-osm-context-status-configured"
              : "urban-osm-context-status-unavailable"
          }`}
          role="status"
        >
          {!osmBuildingsEnabled
            ? "Additional 3D context: Off"
            : ionTokenConfigured
              ? "Additional 3D context: On"
              : "Additional 3D context is unavailable"}
        </p>
        <p className="urban-osm-context-copy">
          Colored buildings show the FEMA-zone classification. Optional
          surrounding buildings provide visual context only.
        </p>
      </section>

      <section className="urban-resilience-demo-section">
        <h2>Current prototype scope</h2>
        <p className="urban-resilience-demo-empty-state">
          Real OpenStreetMap building footprints and real FEMA National Flood
          Hazard Layer zone polygons for Grand Isle and Port Fourchon,
          Louisiana, colored by a zone-based risk classification. Response
          routes follow real LA Highway 1 road geometry; staging references
          mark approximate inland town centers along the corridor.
        </p>
        <p className="urban-resilience-alignment-note" role="note">
          This is a research classification, not an official flood
          determination, insurance requirement, or evacuation order.
        </p>
      </section>

      <div className="urban-resilience-demo-actions">
        <button className="panel-button" type="button" onClick={onNewProject}>
          New project workflow
        </button>
        <button className="panel-button" type="button" onClick={onOpenExistingDemo}>
          Open existing demo
        </button>
        <button className="panel-button" type="button" onClick={onOpenModularDemo}>
          Open modular housing demo
        </button>
        <button className="panel-button" type="button" onClick={onOpenDisasterDemo}>
          Open disaster resilience demo
        </button>
      </div>
    </aside>
  );
}
