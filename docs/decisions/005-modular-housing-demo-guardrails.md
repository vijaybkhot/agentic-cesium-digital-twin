# 005: Modular Housing Demo Guardrails

## Status

Accepted for the proposal-support research spike.

## Context

The repository already supports a Cesium workflow for image intake, mock
reconstruction, model placement, sensor/measurement inspection, and an existing
controlled-facility demo. The modular housing work is a separate proposal demo
for a distributed digital twin concept across factory fabrication, logistics,
and construction-site installation.

The modular demo must not break or rename the existing POC flows. It also must
not imply that the app has real factory, robotics, logistics, AI, IoT, or
backend integration.

## Decision

The modular housing demo will be added as a separate application mode, not as a
replacement for the existing workflow or existing controlled-facility demo. The
app mode boundary should support these modes:

- `workflow`: new project setup, image intake, and mock reconstruction.
- `existing-demo`: current config-driven controlled-facility demo.
- `modular-demo`: modular housing proposal demo.

For the first spike, modular demo state will live in typed TypeScript mock
scenario data instead of extending `ProjectConfig` or replacing
`public/project_config.json`. This keeps the initial scenario easy to iterate
on and avoids forcing modular housing concepts into the decommissioning-oriented
measurement model.

The modular demo will introduce modular-specific domain concepts such as
factory site, construction site, logistics route, production stations,
installation zones, shipment events, and module units. It will not reuse
radiological measurement, dose rate, contamination, or belief-state fields for
modular housing statuses.

Cesium rendering should be extended with modular-specific entity creation and
selection handling. Existing measurement point and model annotation selection
must keep working in the existing demo. Modular entity selection should use
separate entity properties and typed selection values so stale selections do
not leak across app modes.

Initial modular visuals should use lightweight Cesium-native entities such as
points, labels, polygons, polylines, boxes, or simple primitives. The first
proposal demo should not require new committed binary model assets, hosted
tilesets, terrain setup, or external services.

Switching between modes must clear or ignore stale mode-specific selections.
The existing image-intake/reconstruction workflow and existing
controlled-facility demo must remain accessible after modular demo work starts.

## Mock-Only Boundaries

The modular demo is proposal-support visualization only. It may show mock
updates and mock recommendations, but it must not claim or imply:

- real backend synchronization
- real AI optimization
- real robotics integration
- live IoT or sensor integration
- live factory, logistics, or construction-site communication
- production database or knowledge graph implementation

Documentation and UI copy should label modular insights and events as mock
proposal-demo content when needed.

## Consequences

This keeps the implementation safe for a two-day research spike and preserves
the existing POC. The first implementation PRs can focus on adding a modular
mode, mock data, Cesium entities, panel interaction, and event-feed behavior
without changing the reconstruction provider or the existing
`project_config.json` contract.

A future version may move stabilized modular scenario data into a JSON config
or a broader project schema, but that should happen after the demo behavior is
validated.
