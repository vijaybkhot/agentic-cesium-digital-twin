import type {
  DisasterResilienceScenario,
  SelectedDisasterProperty,
} from "../../types/disasterResilience";
import "./DisasterResilienceDemoPanel.css";

interface DisasterResilienceDemoPanelProps {
  scenario: DisasterResilienceScenario;
  selectedProperty: SelectedDisasterProperty | null;
  onNewProject: () => void;
  onOpenExistingDemo: () => void;
  onOpenModularDemo: () => void;
}

function formatCoordinate(value: number): string {
  return value.toFixed(5);
}

function formatDepth(value: number): string {
  return value.toFixed(1);
}

export function DisasterResilienceDemoPanel({
  scenario,
  selectedProperty,
  onNewProject,
  onOpenExistingDemo,
  onOpenModularDemo,
}: DisasterResilienceDemoPanelProps) {
  return (
    <aside className="disaster-resilience-demo-panel">
      <div className="disaster-resilience-demo-heading">
        <p className="panel-kicker">Research / Proposal Demo</p>
        <h1>Property-Specific Disaster Resilience Module</h1>
      </div>

      <p className="disaster-resilience-disclaimer" role="note">
        {scenario.disclaimer}
      </p>

      <section className="disaster-resilience-demo-section">
        <h2>Scenario</h2>
        <dl className="disaster-resilience-demo-details">
          <div>
            <dt>Name</dt>
            <dd>{scenario.name}</dd>
          </div>
          <div>
            <dt>Area</dt>
            <dd>Fictional Baton Rouge-area research neighborhood</dd>
          </div>
          <div>
            <dt>Center</dt>
            <dd>
              {formatCoordinate(scenario.center.lat)}, {" "}
              {formatCoordinate(scenario.center.lon)}
            </dd>
          </div>
        </dl>
        <p className="disaster-resilience-demo-copy">
          {scenario.description}
        </p>
      </section>

      <section className="disaster-resilience-demo-section">
        <h2>Property selection</h2>
        {selectedProperty ? (
          <p className="disaster-resilience-selection-status" role="status">
            <span>Selected property</span>
            <strong>{selectedProperty.propertyId}</strong>
          </p>
        ) : (
          <p className="disaster-resilience-demo-empty-state" role="status">
            Click a fictional property roof or wall to select it.
          </p>
        )}
        <p className="disaster-resilience-selection-note">
          Detailed property information will be added in the next dashboard
          ticket.
        </p>
      </section>

      <section className="disaster-resilience-demo-section">
        <h2>Mock flood visualization</h2>
        <p className="disaster-resilience-flood-label">
          <span
            className="disaster-resilience-flood-swatch"
            aria-hidden="true"
          />
          {scenario.floodLayer.label}
        </p>
        <dl className="disaster-resilience-demo-details">
          <div>
            <dt>Extent</dt>
            <dd>
              Mock depths ≥
              {formatDepth(scenario.floodLayer.displayExtentMinDepthFt)} ft
            </dd>
          </div>
          <div>
            <dt>Depth</dt>
            <dd>
              {formatDepth(scenario.floodLayer.representativeDepthFt)} ft mock
              representative depth
            </dd>
          </div>
          <div>
            <dt>Display</dt>
            <dd>
              {scenario.floodLayer.visualHeightScaleMultiplier}× illustrative
              vertical exaggeration
            </dd>
          </div>
        </dl>
        <p className="disaster-resilience-flood-note" role="note">
          {scenario.floodLayer.confidenceNote}
        </p>
        <p className="disaster-resilience-flood-explanation">
          The blue volume uses one representative depth and a 3× visual
          extrusion. It does not show the water depth at each property.
        </p>
        <div
          className="disaster-resilience-risk-legend"
          aria-label="Mock property risk thresholds"
        >
          <div className="disaster-resilience-risk-legend-title">
            <strong>Mock property risk thresholds</strong>
            <span>Synthetic depth only; not a validated risk model.</span>
          </div>
          <p>
            <span className="risk-swatch risk-swatch-low" aria-hidden="true" />
            <strong>Low</strong>
            <span>
              &lt;{" "}
              {formatDepth(
                scenario.riskDepthThresholds.moderateMinDepthFt,
              )} ft
            </span>
          </p>
          <p>
            <span
              className="risk-swatch risk-swatch-moderate"
              aria-hidden="true"
            />
            <strong>Moderate</strong>
            <span>
              {formatDepth(
                scenario.riskDepthThresholds.moderateMinDepthFt,
              )} to &lt;{" "}
              {formatDepth(scenario.riskDepthThresholds.highMinDepthFt)} ft
            </span>
          </p>
          <p>
            <span className="risk-swatch risk-swatch-high" aria-hidden="true" />
            <strong>High</strong>
            <span>
              ≥ {formatDepth(scenario.riskDepthThresholds.highMinDepthFt)} ft
            </span>
          </p>
        </div>
        <p className="disaster-resilience-risk-explanation">
          Property colors use each fictional property&apos;s separate synthetic
          depth. Their diagonal arrangement has no spatial or hydrologic
          meaning.
        </p>
      </section>

      <section className="disaster-resilience-demo-section">
        <h2>Current prototype scope</h2>
        <p className="disaster-resilience-demo-empty-state">
          Fictional risk-styled property structures and a mock flood-depth
          layer are shown using synthetic local data. Mock shelter and route
          layers will be added in later Cesium implementation tickets.
        </p>
        <p className="disaster-resilience-alignment-note" role="note">
          Synthetic demonstration footprints. Not aligned with real parcels,
          buildings, roads, or addresses.
        </p>
      </section>

      <div className="disaster-resilience-demo-actions">
        <button className="panel-button" type="button" onClick={onNewProject}>
          New project workflow
        </button>
        <button
          className="panel-button"
          type="button"
          onClick={onOpenExistingDemo}
        >
          Open existing demo
        </button>
        <button
          className="panel-button"
          type="button"
          onClick={onOpenModularDemo}
        >
          Open modular housing demo
        </button>
      </div>
    </aside>
  );
}
