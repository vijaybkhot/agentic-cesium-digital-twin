import { isDisasterRiskLevel } from "../../domain/disasterResilience/disasterResilienceContract";
import type { SelectedDisasterProperty } from "../../types/disasterResilience";

interface DisasterPropertyDashboardProps {
  scenarioName: string;
  disclaimer: string;
  selectedProperty: SelectedDisasterProperty | null;
}

function displayText(value: unknown): string {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : "Not available";
}

function formatDepthFt(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? `${value.toFixed(1)} ft`
    : "Not available";
}

export function DisasterPropertyDashboard({
  scenarioName,
  disclaimer,
  selectedProperty,
}: DisasterPropertyDashboardProps) {
  if (!selectedProperty) {
    return (
      <section
        className="disaster-resilience-demo-section disaster-property-dashboard"
        aria-labelledby="disaster-property-dashboard-title"
      >
        <h2 id="disaster-property-dashboard-title">Property dashboard</h2>
        <p className="disaster-resilience-demo-empty-state" role="status">
          Click a fictional property roof or wall to view its mock
          property-specific disaster information.
        </p>
      </section>
    );
  }

  const { attributes } = selectedProperty;
  const riskLevel = isDisasterRiskLevel(attributes.risk_level)
    ? attributes.risk_level
    : null;
  const riskClassName = riskLevel
    ? `disaster-property-risk-${riskLevel.toLowerCase()}`
    : "disaster-property-risk-unknown";

  return (
    <section
      className="disaster-resilience-demo-section disaster-property-dashboard"
      aria-labelledby="disaster-property-dashboard-title"
    >
      <h2 id="disaster-property-dashboard-title">Property dashboard</h2>
      <div className="disaster-property-dashboard-heading" role="status">
        <span>Selected property</span>
        <strong>{displayText(attributes.address_label)}</strong>
        <small>{displayText(selectedProperty.propertyId)}</small>
      </div>

      <p className={`disaster-property-risk ${riskClassName}`}>
        <span aria-hidden="true" />
        Risk level: <strong>{riskLevel ?? "Unclassified"}</strong>
      </p>

      <dl className="disaster-property-dashboard-details">
        <div>
          <dt>Scenario name</dt>
          <dd>{displayText(scenarioName)}</dd>
        </div>
        <div>
          <dt>Estimated flood depth</dt>
          <dd>{formatDepthFt(attributes.estimated_flood_depth_ft)}</dd>
        </div>
        <div>
          <dt>Occupancy type</dt>
          <dd>{displayText(attributes.occupancy_type)}</dd>
        </div>
        <div>
          <dt>Evacuation zone</dt>
          <dd>{displayText(attributes.evacuation_zone)}</dd>
        </div>
        <div>
          <dt>Nearest shelter</dt>
          <dd>{displayText(attributes.nearest_shelter)}</dd>
        </div>
        <div>
          <dt>Recommended action</dt>
          <dd>{displayText(attributes.recommended_action)}</dd>
        </div>
        <div>
          <dt>Data source</dt>
          <dd>{displayText(attributes.data_source)}</dd>
        </div>
        <div>
          <dt>Confidence note</dt>
          <dd>{displayText(attributes.confidence_note)}</dd>
        </div>
      </dl>

      <p className="disaster-property-dashboard-disclaimer" role="note">
        {disclaimer}
      </p>
    </section>
  );
}
