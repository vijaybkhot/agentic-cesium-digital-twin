import type { DisasterResilienceScenario } from "../../types/disasterResilience";
import "./DisasterResilienceDemoPanel.css";

interface DisasterResilienceDemoPanelProps {
  scenario: DisasterResilienceScenario;
  onNewProject: () => void;
  onOpenExistingDemo: () => void;
  onOpenModularDemo: () => void;
}

function formatCoordinate(value: number): string {
  return value.toFixed(5);
}

export function DisasterResilienceDemoPanel({
  scenario,
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
        <h2>Current prototype scope</h2>
        <p className="disaster-resilience-demo-empty-state">
          Fictional risk-styled property structures are shown using synthetic
          local data. Mock flood, shelter, and route layers will be added in
          later Cesium implementation tickets.
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
