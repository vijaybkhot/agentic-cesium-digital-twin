import type { UrbanGroundElevationLookupStatus } from "../../domain/urbanResilience/loadUrbanGroundElevationSample";
import type { UrbanGroundElevationAttributes } from "../../types/urbanResilience";

interface UrbanGroundElevationDetailsProps {
  lookupStatus: UrbanGroundElevationLookupStatus;
  record?: UrbanGroundElevationAttributes;
}

function formatRepresentativePointMethod(method: string): string {
  switch (method) {
    case "source-point":
      return "Original OSM point coordinate";
    case "area-centroid-inside":
      return "Area-weighted centroid verified inside footprint";
    case "point-on-surface-fallback":
      return "Point-on-surface fallback verified inside footprint";
    default:
      return method;
  }
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not returned";
  }

  const date = new Date(`${value}T00:00:00Z`);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date);
}

export function UrbanGroundElevationDetails({
  lookupStatus,
  record,
}: UrbanGroundElevationDetailsProps) {
  if (lookupStatus === "loading") {
    return (
      <div className="urban-ground-elevation-details" role="status">
        <h3>Ground-elevation experiment</h3>
        <p className="urban-resilience-demo-empty-state">
          Loading the local USGS 3DEP elevation sample…
        </p>
      </div>
    );
  }

  if (lookupStatus === "unavailable") {
    return (
      <div className="urban-ground-elevation-details" role="status">
        <h3>Ground-elevation experiment</h3>
        <p className="urban-resilience-demo-empty-state">
          The local ground-elevation sample is unavailable.
        </p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="urban-ground-elevation-details">
        <h3>Ground-elevation experiment</h3>
        <p className="urban-resilience-demo-empty-state">
          This entity was not included in the 16-record elevation sample.
        </p>
      </div>
    );
  }

  if (
    record.elevation_status === "unavailable" ||
    record.ground_elevation_m === null
  ) {
    return (
      <div className="urban-ground-elevation-details" role="status">
        <h3>Ground-elevation experiment</h3>
        <p className="urban-resilience-demo-empty-state">
          Ground elevation: Unavailable. {record.unavailable_reason}
        </p>
        <p className="urban-ground-elevation-limitation" role="note">
          Missing elevation is represented as unavailable, never as zero.
        </p>
      </div>
    );
  }

  return (
    <div className="urban-ground-elevation-details">
      <h3>Ground-elevation experiment</h3>
      <dl className="urban-property-dashboard-details">
        <div>
          <dt>Estimated/interpolated ground elevation</dt>
          <dd>{record.ground_elevation_m.toFixed(2)} m</dd>
        </div>
        <div>
          <dt>Representative coordinate</dt>
          <dd>
            {record.query_latitude.toFixed(6)}, {record.query_longitude.toFixed(6)}
          </dd>
        </div>
        <div>
          <dt>Representative-point method</dt>
          <dd>{formatRepresentativePointMethod(record.representative_point_method)}</dd>
        </div>
        <div>
          <dt>Elevation source</dt>
          <dd>{record.elevation_source}</dd>
        </div>
        <div>
          <dt>Source acquisition date</dt>
          <dd>{formatDate(record.source_acquisition_date)}</dd>
        </div>
        <div>
          <dt>Service-reported resolution</dt>
          <dd>
            {record.service_reported_resolution ?? "Not returned"} — raw EPQS metadata
          </dd>
        </div>
        <div>
          <dt>USGS raster ID</dt>
          <dd>{record.elevation_raster_id ?? "Not returned"}</dd>
        </div>
      </dl>
      <p className="urban-ground-elevation-limitation" role="note">
        {record.interpretation_note}
      </p>
    </div>
  );
}
