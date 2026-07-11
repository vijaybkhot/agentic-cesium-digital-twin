import type {
  DigitalTwinAssociation,
  ModularAiRecommendation,
  ModularHousingScenario,
  ModularTwinEvent,
  ModularUnit,
} from "../../types/modularHousing";
import "./ModularHousingDemoPanel.css";

interface ModularHousingDemoPanelProps {
  scenario: ModularHousingScenario;
  onNewProject: () => void;
  onOpenExistingDemo: () => void;
}

function formatCoordinate(location: { lat: number; lon: number }): string {
  return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`;
}

function formatSlug(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTwinAssociation(value: DigitalTwinAssociation): string {
  return formatSlug(value);
}

export function ModularHousingDemoPanel({
  scenario,
  onNewProject,
  onOpenExistingDemo,
}: ModularHousingDemoPanelProps) {
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
        <h2>Digital Twin Sites</h2>
        <dl className="modular-demo-details">
          <div>
            <dt>Factory</dt>
            <dd>
              <strong>{scenario.factorySite.name}</strong>
              <span>{formatCoordinate(scenario.factorySite.location)}</span>
              <span>{scenario.factorySite.status}</span>
            </dd>
          </div>
          <div>
            <dt>Site</dt>
            <dd>
              <strong>{scenario.constructionSite.name}</strong>
              <span>{formatCoordinate(scenario.constructionSite.location)}</span>
              <span>{scenario.constructionSite.status}</span>
            </dd>
          </div>
          <div>
            <dt>Route</dt>
            <dd>
              <strong>{scenario.route.name}</strong>
              <span>
                {formatSlug(scenario.route.status)} -{" "}
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
            <ModuleCard key={module.id} module={module} />
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

function ModuleCard({ module }: { module: ModularUnit }) {
  return (
    <article className="module-card">
      <div className="module-card-heading">
        <strong>{module.id}</strong>
        <span>{formatSlug(module.type)}</span>
      </div>
      <dl>
        <div>
          <dt>Location</dt>
          <dd>{formatSlug(module.currentLocation)}</dd>
        </div>
        <div>
          <dt>Production</dt>
          <dd>{formatSlug(module.productionStatus)}</dd>
        </div>
        <div>
          <dt>Install</dt>
          <dd>{formatSlug(module.installationStatus)}</dd>
        </div>
        <div>
          <dt>Quality</dt>
          <dd>{formatSlug(module.qualityStatus)}</dd>
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
        {formatSlug(recommendation.priority)} priority
      </span>
      <span>{recommendation.message}</span>
      <small>{recommendation.rationale}</small>
    </li>
  );
}
