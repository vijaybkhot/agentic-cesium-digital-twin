# Modular Demo Regression Checklist

This checklist verifies that the modular housing proposal demo remains isolated
from the existing Cesium POC workflows.

## Automated Checks

- [ ] Confirm the working tree is clean before testing:
  `git status --short --branch`
- [ ] Confirm documentation and code diffs have no whitespace errors:
  `git diff --check`
- [ ] Confirm the app builds:
  `npm run build`
- [ ] Confirm this checklist remains discoverable:
  `rg "Regression|workflow|existing demo|modular demo|image intake" docs/modular-demo-regression-checklist.md`

## Local Smoke Test

- [ ] Start the dev server:
  `npm run dev -- --host 127.0.0.1 --port 5174`
- [ ] Confirm the app shell serves at `http://127.0.0.1:5174/`.
- [ ] Confirm the static existing-demo config serves at
  `http://127.0.0.1:5174/project_config.json`.

## Workflow And Image Intake

- [ ] App starts in the new-project workflow mode.
- [ ] Typed project name, description, latitude, and longitude inputs still
  accept edits.
- [ ] `View typed location` recenters the Cesium scene on the typed location.
- [ ] `Create project` advances to the image intake step.
- [ ] Image selection updates the browser-only image intake summary.
- [ ] GPS/EXIF readiness messaging still appears without blocking the current
  browser-only workflow.

## Browser-Only Reconstruction

- [ ] `Start mock reconstruction` starts the browser-only reconstruction job.
- [ ] The reconstruction job progresses through queued/running states.
- [ ] Completion returns the sample model asset and displays it in Cesium.
- [ ] `New project` clears the workflow state.

## Existing Controlled-Facility Demo

- [ ] `Open existing demo` loads `public/project_config.json`.
- [ ] Facility box, facility boundary, measurement points, model asset, and
  model annotations render in Cesium.
- [ ] Selecting measurement points opens the existing POC side panel details.
- [ ] Editing measurement readings recalculates belief state.
- [ ] Manual belief override updates the panel and audit log.
- [ ] Selecting model annotations opens annotation details.
- [ ] Linked model annotation details still show the associated measurement
  point when configured.

## Modular Demo

- [ ] `Open modular housing demo` opens the modular proposal demo independently.
- [ ] Factory site, construction site, route, route checkpoints, module markers,
  production stations, and installation zones render in Cesium.
- [ ] Selecting each modular entity type updates `Selected Digital Twin Item`.
- [ ] The initial event feed and AI recommendations render without developer
  tools or console output.
- [ ] Selecting `MOD-BED-002` shows the `Assign and dispatch shipment` action.
- [ ] Dispatching `MOD-BED-002` moves it from factory to an in-transit marker.
- [ ] In-transit module markers remain readable and selectable when more than
  one module is on the route.
- [ ] Dispatching `MOD-BED-002` appends Factory Twin, Logistics Twin, Site Twin,
  and AI Agent events.
- [ ] `Mark delivered to site` moves the selected module to its assigned site
  zone and updates the event feed.
- [ ] `Mark installed` updates the selected module installation state and the
  assigned zone state.
- [ ] Selecting `MOD-BATH-001` shows `Complete fabrication and QC`.
- [ ] Completing `MOD-BATH-001` updates production, quality, events, and
  recommendations.

## Mode Switching And State Isolation

- [ ] Modular demo -> workflow clears the modular panel and selection.
- [ ] Workflow -> modular demo resets the modular runtime scenario to its
  initial proposal-demo state.
- [ ] Modular demo -> existing demo does not show stale modular selection.
- [ ] Existing demo -> modular demo does not preserve measurement-point or model
  annotation selection.
- [ ] Existing POC measurement/model updates do not modify modular scenario data.
- [ ] Modular status actions do not modify `ProjectConfig` or existing POC
  measurement/model annotation data.

## Residual Risks

- Browser-only tests are manual until automated UI tests are added.
- Cesium camera/entity behavior should be spot-checked on the target machine
  because WebGL rendering and browser performance can vary by environment.
- Large Cesium/Vite bundle warnings remain known build warnings and are not
  specific to the modular demo regression pass.
