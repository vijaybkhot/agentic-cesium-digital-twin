# Devlog

## 2026-06-24

- Added POC 4E model-linked sensors for existing demo annotations.
- Linked milk-truck annotation points to existing measurement points.
- Reused current measurement editing, belief recalculation, manual override, recommendation, and audit log behavior for linked model annotations.
- Highlighted the selected measurement point or model annotation in the Cesium scene.
- Added linked sensor readings to model annotation labels.
- Kept this version limited to existing measurement points; no generic sensor-type engine was added.
- Added POC 4A reconstruction handoff contract documentation.
- Added example reconstruction request, status, output, and error JSON payloads.
- Documented questions for Ehsan about input format, output format, scale, orientation, location, and job status.
- Clarified that future LLM use should be a screening/explanation layer, not part of this POC.
- No backend, upload, real COLMAP process, cloud storage, or LLM integration was added.

## 2026-06-18

- Added browser-only project setup with typed or globe-picked site coordinates.
- Added an in-memory draft project config with a temporary site marker.
- Added a mock COLMAP provider with queued, running, and completed job states.
- Added readiness-gated reconstruction and model display after completion.
- Preserved the full static config demo behind `Open existing demo`.
- No backend, upload, database, real COLMAP process, or LLM was added.
- Added model-local inspection annotations using standardized ENU meter coordinates.
- Added three clickable milk-truck inspection points for roof, front, and side.
- Added read-only annotation details and annotation selection audit logging.
- Preserved camera position during selection and clarified panel movement/selection controls.
- Enabled normal depth testing so model annotations behave as anchored 3D points.
- Documented the coordinate normalization expected from future reconstruction providers.

## 2026-05-14

- Added POC 3A GLB model asset rendering from `project_config.json`.
- Added a Cesium Milk Truck sample model as a mock reconstruction placeholder.
- Documented local GLB model asset testing and current limits.
- Added future project config example.
- Documented AI intake assistant scope.
- Documented proposed handshake with reconstruction pipeline.
- Added optional future config types for image intake, agent assessment, and model assets.
- No real backend, LLM, upload, or reconstruction implemented yet.
- Added browser-only image intake panel.
- Added image metadata inspection for count, size, dimensions, and resolution.
- Added rule-based mock reconstruction readiness assessment.
- Added concise local run/test notes for POC 1 and POC 2A.
- No backend, LLM, cloud upload, EXIF extraction, or reconstruction pipeline implemented yet.

## 2026-04-30

- Migrated the frontend from plain Vite JavaScript to React + TypeScript.
- Moved hardcoded project data into `public/project_config.json`.
- Added ports for agent providers, config repositories, reconstruction providers, and viewer adapters.
- Moved belief calculation, recommendations, audit log creation, and project normalization into domain modules.
- Isolated Cesium code in `src/cesium` and `src/adapters/viewer`.
- Preserved the original POC behavior: facility, boundary, three measurement points, side panel, belief updates, recommendations, and audit log.
