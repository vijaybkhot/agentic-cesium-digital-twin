# Devlog

## 2026-04-30

- Migrated the frontend from plain Vite JavaScript to React + TypeScript.
- Moved hardcoded project data into `public/project_config.json`.
- Added ports for agent providers, config repositories, reconstruction providers, and viewer adapters.
- Moved belief calculation, recommendations, audit log creation, and project normalization into domain modules.
- Isolated Cesium code in `src/cesium` and `src/adapters/viewer`.
- Preserved the original POC behavior: facility, boundary, three measurement points, side panel, belief updates, recommendations, and audit log.
