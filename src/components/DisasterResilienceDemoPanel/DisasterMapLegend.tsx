import type { CSSProperties } from "react";
import { disasterResilienceVisualColors } from "../../theme/disasterResilienceVisualTokens";
import type { DisasterRiskDepthThresholds } from "../../types/disasterResilience";

interface DisasterMapLegendProps {
  riskDepthThresholds: DisasterRiskDepthThresholds;
}

function swatchStyle(color: string): CSSProperties {
  return { "--disaster-legend-color": color } as CSSProperties;
}

function formatDepth(value: number): string {
  return value.toFixed(1);
}

export function DisasterMapLegend({
  riskDepthThresholds,
}: DisasterMapLegendProps) {
  return (
    <section
      className="disaster-resilience-demo-section disaster-map-legend"
      aria-labelledby="disaster-map-legend-title"
    >
      <h2 id="disaster-map-legend-title">Map legend</h2>
      <p className="disaster-map-legend-note">
        Symbols describe synthetic demonstration layers only.
      </p>
      <ul className="disaster-map-legend-list">
        <li>
          <span
            className="disaster-map-legend-symbol disaster-map-legend-property"
            style={swatchStyle(disasterResilienceVisualColors.riskLow)}
            aria-hidden="true"
          />
          <span>
            <strong>Low-risk property</strong>
            <small>
              Mock depth &lt; {formatDepth(riskDepthThresholds.moderateMinDepthFt)} ft
            </small>
          </span>
        </li>
        <li>
          <span
            className="disaster-map-legend-symbol disaster-map-legend-property"
            style={swatchStyle(disasterResilienceVisualColors.riskModerate)}
            aria-hidden="true"
          />
          <span>
            <strong>Moderate-risk property</strong>
            <small>
              {formatDepth(riskDepthThresholds.moderateMinDepthFt)} to &lt;{" "}
              {formatDepth(riskDepthThresholds.highMinDepthFt)} ft
            </small>
          </span>
        </li>
        <li>
          <span
            className="disaster-map-legend-symbol disaster-map-legend-property"
            style={swatchStyle(disasterResilienceVisualColors.riskHigh)}
            aria-hidden="true"
          />
          <span>
            <strong>High-risk property</strong>
            <small>
              Mock depth ≥ {formatDepth(riskDepthThresholds.highMinDepthFt)} ft
            </small>
          </span>
        </li>
        <li>
          <span
            className="disaster-map-legend-symbol disaster-map-legend-selected"
            style={swatchStyle(
              disasterResilienceVisualColors.selectedPropertyOutline,
            )}
            aria-hidden="true"
          />
          <span>
            <strong>Selected property</strong>
            <small>Yellow outline and label</small>
          </span>
        </li>
        <li>
          <span
            className="disaster-map-legend-symbol disaster-map-legend-flood"
            style={swatchStyle(disasterResilienceVisualColors.flood)}
            aria-hidden="true"
          />
          <span>
            <strong>Mock flood-depth layer</strong>
            <small>Translucent illustrative volume</small>
          </span>
        </li>
        <li>
          <span
            className="disaster-map-legend-symbol disaster-map-legend-shelter"
            style={swatchStyle(disasterResilienceVisualColors.shelter)}
            aria-hidden="true"
          />
          <span>
            <strong>Fictional safe point</strong>
            <small>Not a real shelter</small>
          </span>
        </li>
        <li>
          <span
            className="disaster-map-legend-symbol disaster-map-legend-route"
            style={swatchStyle(disasterResilienceVisualColors.route)}
            aria-hidden="true"
          />
          <span>
            <strong>Mock response route</strong>
            <small>Non-operational illustrative path</small>
          </span>
        </li>
      </ul>
    </section>
  );
}
