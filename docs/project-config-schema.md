# Project Config Schema

The app loads `public/project_config.json`.

## Top-Level Fields

- `projectId`: Stable machine-readable project identifier.
- `projectName`: Human-readable project name.
- `description`: Short project description.
- `scene`: Scene center and camera settings.
- `facility`: Facility building and boundary.
- `modelAssets`: Optional reconstructed or placeholder model assets rendered by the Cesium viewer.
- `beliefRules`: Thresholds used to calculate Low / Medium / High belief states.
- `measurementPoints`: Sensor or measurement points rendered in Cesium.
- `annotations`: Future annotation list.

## Measurement Point

Each measurement point includes:

- `id`
- `name`
- `lat`
- `lon`
- `height`
- `sensorType`
- `doseRate`
- `doseRateUnit`
- `contamination`
- `contaminationUnit`
- `lastReading`
- `belief`

`belief` must be one of:

```text
Low
Medium
High
```

## Belief Rules

The current rule is intentionally simple:

- High if dose rate is greater than `doseRate.mediumMax` or contamination is greater than `contamination.mediumMax`.
- Medium if dose rate is greater than `doseRate.lowMax` or contamination is greater than `contamination.lowMax`.
- Low otherwise.

The default config preserves the original thresholds:

- Low: dose rate below `0.25 uSv/h` and contamination below `50 cpm`
- Medium: dose rate `0.25` to `0.99 uSv/h` or contamination `50` to `149 cpm`
- High: dose rate `1.00+ uSv/h` or contamination `150+ cpm`

On app load, the viewer normalizes each measurement point belief from the
configured readings and `beliefRules`. In other words, the measurement values are
authoritative for the initial live state. If you edit only a point's `belief` in
JSON but leave the readings unchanged, the calculated belief will win after
refresh.

## Model Assets

`modelAssets` is optional. In POC 3A, the viewer renders local GLB assets with
`assetType: "glb"` and `status: "ready"`.

Each rendered GLB model asset includes:

- `assetId`: Stable model identifier.
- `assetType`: Currently `glb` for rendered local GLB assets.
- `assetUrl`: Public URL for the model, such as `/models/CesiumMilkTruck.glb`.
- `sourcePipeline`: Name of the mock or future reconstruction source.
- `status`: Use `ready` for assets that should render.
- `spatialAnchor`: Latitude, longitude, and height for placement.
- `scale`: Model scale multiplier.
- `orientation`: Heading, pitch, and roll in degrees.

GLB is the first supported model format because it is simple to test. 3D Tiles
remains the preferred future target for larger geospatial reconstructions.

## Trying Config Changes Locally

Edit:

```text
public/project_config.json
```

Then refresh the browser tab running the Vite app. The app fetches the config at
startup, so a normal browser refresh is the simplest way to reload the latest
JSON.

## Future Draft Fields

The current runtime config is still `public/project_config.json`. The current
viewer does not require or fully render the future fields below.

A draft discussion example lives at:

```text
docs/examples/project_config.future.example.json
```

Planned optional fields:

- `schemaVersion`: Draft schema identifier, such as `0.2-draft`, so future tools can understand which config shape they are reading.
- `imageIntake`: Future metadata about uploaded images, GPS/EXIF availability, minimum image count checks, coverage status, and missing inputs.
- `agentAssessment`: Future assistant output summarizing reconstruction readiness, reasoning, and the next recommended action.
- `modelAssets`: Reconstruction or asset handoff references. POC 3A renders ready GLB assets; other asset types remain planned.

These fields are intentionally optional in TypeScript and are not required by
runtime validation yet. They are meant to support discussion and future provider
integration without breaking the current Cesium viewer.
