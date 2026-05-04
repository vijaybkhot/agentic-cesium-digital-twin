# 001 Use Existing Cesium POC As Viewer Shell

## Context

The project already had a working Cesium scene with a facility, boundary, measurement points, and decision-support UI.

## Decision

Keep the existing visible behavior and refactor it into a modular viewer shell.

## Why

The current POC proves the core interaction model. Preserving it lowers migration risk and keeps the next iteration focused on architecture rather than new features.

## Alternatives Considered

- Rebuild the scene from scratch.
- Replace Cesium with another map or 3D viewer.

## Consequences

The UI remains familiar, while the implementation is now easier to extend.
