import type {
  DigitalTwinAssociation,
  ModularAiRecommendation,
  ModularCameraTarget,
  ModularHousingScenario,
  ModularTwinEvent,
  ModularUnit,
  SelectedModularEntity,
} from "../../types/modularHousing";
import { formatModularSlug } from "../../domain/modularHousing/formatModularHousingLabels";
import {
  getSelectedModularEntityDetails,
  type SelectedModularEntityDetails,
} from "../../domain/modularHousing/getSelectedModularEntityDetails";
import "./ModularHousingDemoPanel.css";

interface ModularHousingDemoPanelProps {
  scenario: ModularHousingScenario;
  selectedModularEntity?: SelectedModularEntity | null;
  onFocusTarget: (target: ModularCameraTarget) => void;
  onNewProject: () => void;
  onOpenExistingDemo: () => void;
}

function formatCoordinate(location: { lat: number; lon: number }): string {
  return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`;
}

function formatTwinAssociation(value: DigitalTwinAssociation): string {
  return formatModularSlug(value);
}

export function ModularHousingDemoPanel({
  scenario,
  selectedModularEntity = null,
  onFocusTarget,
  onNewProject,
  onOpenExistingDemo,
}: ModularHousingDemoPanelProps) {
  const selectedDetails = getSelectedModularEntityDetails(
    scenario,
    selectedModularEntity,
  );
  const selectedModuleId =
    selectedModularEntity?.kind === "module" ? selectedModularEntity.id : null;

  return (
    <aside className="modular-demo-panel">
      <div className="modular-demo-heading">
        <div>
          <p className="panel-kicker">Proposal Demo</p>
          <h1>{scenario.name}</h1>
        </div>
      </div>

      <p className="modular-demo-copy">
        Mock modular housing scenario for showing how factory fabrication,
        logistics, and construction-site installation could be coordinated in a
        geospatial digital twin view. No real AI, robotics, backend, or live
        physical-system integration is connected.
      </p>

      <div className="modular-demo-actions">
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
      </div>

      <section className="modular-demo-section">
        <h2>Map View</h2>
        <div className="modular-demo-actions modular-demo-actions-compact">
          <button
            className="panel-button"
            type="button"
            onClick={() => onFocusTarget("system")}
          >
            System view
          </button>
          <button
            className="panel-button"
            type="button"
            onClick={() => onFocusTarget("factory")}
          >
            Factory view
          </button>
          <button
            className="panel-button"
            type="button"
            onClick={() => onFocusTarget("site")}
          >
            Site view
          </button>
        </div>
      </section>

      <section className="modular-demo-section">
        <h2>Selected Digital Twin Item</h2>
        <SelectedEntityDetails details={selectedDetails} />
      </section>

      <section className="modular-demo-section">
        <h2>Map Legend</h2>
        <ul className="modular-demo-legend">
          <LegendItem colorClass="factory" label="Factory site" />
          <LegendItem colorClass="site" label="Construction site" />
          <LegendItem colorClass="route" label="Active route" />
          <LegendItem colorClass="module-factory" label="Module at factory" />
          <LegendItem colorClass="module-transit" label="Module in transit" />
          <LegendItem colorClass="zone" label="Installation zone" />
          <LegendItem colorClass="station" label="Production station" />
        </ul>
      </section>

      <section className="modular-demo-section">
        <h2>Digital Twin Sites</h2>
        <dl className="modular-demo-details">
          <div>
            <dt>Factory</dt>
            <dd>
              <strong>{scenario.factorySite.name}</strong>
              <span>{formatCoordinate(scenario.factorySite.location)}</span>
              <span>{formatModularSlug(scenario.factorySite.status)}</span>
            </dd>
          </div>
          <div>
            <dt>Site</dt>
            <dd>
              <strong>{scenario.constructionSite.name}</strong>
              <span>{formatCoordinate(scenario.constructionSite.location)}</span>
              <span>{formatModularSlug(scenario.constructionSite.status)}</span>
            </dd>
          </div>
          <div>
            <dt>Route</dt>
            <dd>
              <strong>{scenario.route.name}</strong>
              <span>
                {formatModularSlug(scenario.route.status)} -{" "}
                {scenario.route.estimatedDistanceMiles.toFixed(1)} mi
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="modular-demo-section">
        <h2>Module Units</h2>
        <div className="module-list">
          {scenario.modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              isSelected={module.id === selectedModuleId}
            />
          ))}
        </div>
      </section>

      <section className="modular-demo-section">
        <h2>Mock Twin Events</h2>
        <ul className="modular-demo-list">
          {scenario.events.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </ul>
      </section>

      <section className="modular-demo-section">
        <h2>Mock AI Recommendations</h2>
        <ul className="modular-demo-list">
          {scenario.recommendations.map((recommendation) => (
            <RecommendationItem
              key={recommendation.id}
              recommendation={recommendation}
            />
          ))}
        </ul>
      </section>
    </aside>
  );
}

function SelectedEntityDetails({
  details,
}: {
  details: SelectedModularEntityDetails | null;
}) {
  if (!details) {
    return (
      <p className="modular-demo-empty-state">
        No map item selected yet. Factory site, construction site, route, route
        checkpoint, module, production station, and installation zone details
        appear here.
      </p>
    );
  }

  return (
    <article className="selected-entity-card">
      <div className="selected-entity-heading">
        <span>{details.kindLabel}</span>
        <strong>{details.title}</strong>
      </div>
      {details.status && (
        <p className="selected-entity-status">{details.status}</p>
      )}
      {details.description && (
        <p className="selected-entity-description">{details.description}</p>
      )}
      <dl className="selected-entity-details">
        {details.rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function LegendItem({
  colorClass,
  label,
}: {
  colorClass: string;
  label: string;
}) {
  return (
    <li>
      <span
        aria-hidden="true"
        className={`modular-demo-swatch is-${colorClass}`}
      />
      <span>{label}</span>
    </li>
  );
}

function ModuleCard({
  module,
  isSelected,
}: {
  module: ModularUnit;
  isSelected: boolean;
}) {
  return (
    <article
      className={`module-card ${isSelected ? "is-selected" : ""}`}
      aria-current={isSelected ? "true" : undefined}
    >
      <div className="module-card-heading">
        <strong>{module.id}</strong>
        <span>{formatModularSlug(module.type)}</span>
      </div>
      <dl>
        <div>
          <dt>Location</dt>
          <dd>{formatModularSlug(module.currentLocation)}</dd>
        </div>
        <div>
          <dt>Production</dt>
          <dd>{formatModularSlug(module.productionStatus)}</dd>
        </div>
        <div>
          <dt>Install</dt>
          <dd>{formatModularSlug(module.installationStatus)}</dd>
        </div>
        <div>
          <dt>Quality</dt>
          <dd>{formatModularSlug(module.qualityStatus)}</dd>
        </div>
        <div>
          <dt>Twin</dt>
          <dd>{formatTwinAssociation(module.digitalTwinAssociation)}</dd>
        </div>
      </dl>
    </article>
  );
}

function EventItem({ event }: { event: ModularTwinEvent }) {
  return (
    <li>
      <span className="modular-demo-meta">
        {event.timestamp} - {event.source}
      </span>
      <span>{event.message}</span>
    </li>
  );
}

function RecommendationItem({
  recommendation,
}: {
  recommendation: ModularAiRecommendation;
}) {
  return (
    <li>
      <span className="modular-demo-meta">
        {formatModularSlug(recommendation.priority)} priority
      </span>
      <span>{recommendation.message}</span>
      <small>{recommendation.rationale}</small>
    </li>
  );
}
