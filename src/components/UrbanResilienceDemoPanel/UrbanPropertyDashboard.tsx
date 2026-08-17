import { isUrbanRiskLevel } from "../../domain/urbanResilience/urbanResilienceContract";
import type { SelectedUrbanProperty } from "../../types/urbanResilience";

interface UrbanPropertyDashboardProps {
  scenarioName: string;
  disclaimer: string;
  selectedProperty: SelectedUrbanProperty | null;
}

function displayText(value: unknown): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "Not available";
}

export function UrbanPropertyDashboard({
  scenarioName,
  disclaimer,
  selectedProperty,
}: UrbanPropertyDashboardProps) {
  if (!selectedProperty) {
    return (
      <section
        className="urban-resilience-demo-section urban-property-dashboard"
        aria-labelledby="urban-property-dashboard-title"
      >
        <h2 id="urban-property-dashboard-title">Property dashboard</h2>
        <p className="urban-resilience-demo-empty-state" role="status">
          Click a building to view its real-footprint, FEMA-zone-based risk classification.
        </p>
      </section>
    );
  }

  const { attributes } = selectedProperty;
  const riskLevel = isUrbanRiskLevel(attributes.risk_level) ? attributes.risk_level : null;
  const riskClassName = riskLevel
    ? `urban-property-risk-${riskLevel.toLowerCase()}`
    : "urban-property-risk-unknown";

  return (
    <section
      className="urban-resilience-demo-section urban-property-dashboard"
      aria-labelledby="urban-property-dashboard-title"
    >
      <h2 id="urban-property-dashboard-title">Property dashboard</h2>
      <div className="urban-property-dashboard-heading" role="status">
        <span>Selected property</span>
        <strong>{displayText(attributes.address_label)}</strong>
        <small>{displayText(selectedProperty.propertyId)}</small>
      </div>

      <p className={`urban-property-risk ${riskClassName}`}>
        <span aria-hidden="true" />
        Risk level: <strong>{riskLevel ?? "Unclassified"}</strong>
      </p>

      <dl className="urban-property-dashboard-details">
        <div>
          <dt>Scenario</dt>
          <dd>{displayText(scenarioName)}</dd>
        </div>
        <div>
          <dt>FEMA flood zone</dt>
          <dd>{displayText(attributes.flood_zone_code)}</dd>
        </div>
        <div>
          <dt>Special Flood Hazard Area</dt>
          <dd>
            {attributes.sfha === null
              ? "Not available — FEMA coverage gap"
              : attributes.sfha
                ? "Yes"
                : "No"}
          </dd>
        </div>
        <div>
          <dt>Occupancy type</dt>
          <dd>{displayText(attributes.occupancy_type)}</dd>
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

      <p className="urban-property-dashboard-disclaimer" role="note">
        {disclaimer}
      </p>
    </section>
  );
}
