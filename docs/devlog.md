# Devlog

## 2026-07-11

- Added a cross-mode modular demo regression checklist covering workflow,
  image intake, reconstruction, existing controlled-facility demo, model
  annotations, modular interactions, and mode-switch state isolation.
- Added local demo modular status actions for selected module units.
- Updated the modular event feed to show demo Factory Twin, Logistics Twin,
  Site Twin, and AI Agent coordination after status actions.
- Kept modular status actions local-only with no backend, real AI, robotics,
  IoT, live telemetry, or optimization integration.
- Added a read-only modular digital twin detail panel for selected Cesium
  factory, site, route, module, station, and installation-zone entities.
- Kept modular entity details demo-only; status update controls and causal
  event-feed actions remain deferred to the next modular demo pass.
- Rendered the modular housing demo scenario in Cesium with native factory,
  site, route, module, production station, and installation zone entities.
- Added a modular housing proposal-demo mode foundation with typed demo
  scenario data for factory, logistics, site, modules, events, and demo
  recommendations.
- Added modular housing demo architecture guardrails before implementation.
- Documented that the first modular demo should be a separate app mode with
  typed demo scenario data, modular-specific Cesium entities, and explicit
  demo-only AI/robotics/logistics boundaries.

## 2026-07-08

- Added POC 4H browser-only GPS/EXIF readiness checks to image intake.
- Added GPS metadata status for usable images: present, missing, or unknown.
- Added GPS coverage counts to the image intake summary and mock assistant message.
- Added an advisory warning when average image GPS appears far from the selected project site.
- Kept GPS advisory only; missing GPS does not block mock reconstruction.
- No backend upload, image storage, LLM review, COLMAP execution, or real reconstruction pre-check was added.

## 2026-07-02

- Added POC 4D local PLY-to-GLB conversion spike documentation.
- Added a Blender command-line script for converting local PLY samples to GLB.
- Kept raw PLY samples and generated local GLB files ignored by default.
- Clarified that 3D Tiles remains the likely future path for large point clouds.

## 2026-07-01

- Added POC 4C PLY output awareness without adding raw PLY rendering.
- Added a viewer-support helper that distinguishes rendered GLB assets from PLY/point-cloud assets that require conversion.
- Added a PLY reconstruction output example and local sample test guidance.
- Ignored local `public/models/*.ply` files so downloaded test point clouds are not committed accidentally.
- Added POC 4B documentation for Ehsan's current reconstruction pipeline.
- Recorded JPG/JPEG image input, GPS metadata importance, PLY point cloud output, and COLMAP feature matching as the key feasibility signal.
- Clarified that this pass does not add backend upload, PLY rendering, EXIF/GPS parsing, or real reconstruction execution.

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
