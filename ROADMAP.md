# Roadmap

## POC 0: Existing Cesium Decision-Support Viewer

- Single-file Vite + CesiumJS frontend POC.
- Hardcoded facility, boundary, measurement points, belief logic, and side panel behavior.

## POC 1: Config-Driven React/TypeScript Cesium Viewer

- React + TypeScript migration.
- Project rendered from `public/project_config.json`.
- Cesium-specific rendering isolated behind an adapter.
- Domain logic separated from rendering.
- Mock agent interface added for future provider swaps.

## POC 2: Image Intake and Audit Agent

- Add frontend image intake workflow.
- Add backend API boundary.
- Add agent-assisted completeness checks for image sets and project metadata.
- Keep provider implementations behind `AgentProvider`.

## POC 3: Reconstruction Integration

- POC 3A: Render a local GLB model asset from `project_config.json`.
- POC 3B: Add model-local inspection annotations using standardized ENU coordinates.
- Add reconstruction job orchestration.
- Implement a real `ReconstructionProvider`.
- Visualize reconstruction outputs as tilesets/models in Cesium.
- Track reconstruction state and provenance in the project audit trail.
