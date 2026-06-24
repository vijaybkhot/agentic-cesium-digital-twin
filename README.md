# Agent-Assisted Cesium Digital Twin POC

This repository contains an early Cesium-based proof of concept for an interactive geospatial viewer and decision-support interface for digital twin research. The current application presents a mock decommissioning or controlled-facility site in a 3D/map scene, supports inspection and editing of mock measurement points, and demonstrates how belief-state updates and audit logging could support a future research workflow.

## Current Purpose

This version demonstrates the Cesium visualization and interaction layer. It is not yet the full agent-assisted intake, image assessment, or reconstruction pipeline. The immediate goal is to validate a reusable geospatial viewer pattern that can later render structured project configuration data produced or updated by an agent-assisted workflow.

## Demo Features

- Cesium globe scene centered on a mock facility area
- Simple facility building
- Controlled-area boundary
- Three measurement/sensor points
- Color-coded belief states: Low, Medium, High
- Draggable side panel for inspecting selected points
- Editable mock readings for dose rate, contamination, and last reading time
- Automatic belief-state recalculation from thresholds
- Manual belief override buttons
- Recommendation text based on current belief state
- Audit log of selections, updates, and overrides
- Browser-only image intake panel with rule-based mock reconstruction readiness feedback
- Config-driven GLB model asset rendering
- Clickable model-local inspection annotations
- Browser-only project setup and mock COLMAP reconstruction workflow
- Reconstruction handoff contract examples for future pipeline integration

## Why This Matters

Cesium provides the geospatial visualization layer for viewing facility context, spatial measurements, and, in later versions, reconstructed or imported 3D assets. The mock belief-state and audit-log workflow represents a small decision-support loop: a user selects a point, reviews readings, changes values or assumptions, and the interface records what changed.

This viewer can later be connected to agent-generated project configurations, image intake, and reconstruction outputs. The key design direction is to avoid asking an LLM to generate Cesium code directly. Instead, a future agent should generate or update a structured `project_config.json`, while the Cesium viewer remains reusable and renders whatever valid project configuration it receives.

## Proposed Future Architecture

```text
User Inputs / Images
  -> Agent Intake Layer
  -> Project Config JSON
  -> Cesium Viewer Adapter
  -> Interactive Geospatial Twin
```

```text
Images
  -> Image Sufficiency Check
  -> Reconstruction Pipeline
  -> GLB / 3D Tiles
  -> Cesium Visualization
```

## Current Technical Stack

- Vite
- React
- TypeScript
- CesiumJS
- Frontend-only prototype

The current repository uses a React/TypeScript structure. It also includes an early static mock configuration path through `public/project_config.json`, loaded by the frontend at runtime.

## How To Run Locally

Use Node.js `22.12.0` or newer. If you use `nvm`, run:

```bash
nvm use
```

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173/
```

The app starts with the POC 3D project setup workflow. Create a project by
typing a site location or selecting one on the globe, review local images, and
run the mock reconstruction. The GLB appears only when the simulated job
completes.

Select `Open existing demo` to load `public/project_config.json` and use the
facility, measurement, belief-state, image intake, GLB, and annotation features
from the earlier POCs.

Build the project:

```bash
npm run build
```

Preview a production build:

```bash
npm run preview
```

Cesium static assets are handled through `vite.config.js` using `vite-plugin-static-copy`. The config copies Cesium `ThirdParty`, `Workers`, `Assets`, and `Widgets` files from `node_modules/cesium/Build/Cesium` into the Vite-served static asset path.

During local development, `public/project_config.json` is loaded only when
`Open existing demo` is selected. To test config changes, edit values such as
`projectName`, facility coordinates, boundary coordinates, measurement point
readings, or belief thresholds, refresh the browser, and open the existing demo.

## Current Project Status

Status: Early POC / research prototype

Completed:

- Cesium viewer
- Mock facility
- Mock measurement points
- Belief state UI
- Editable readings
- Audit log
- Early static mock `project_config.json` loading
- Initial React/TypeScript ports-and-adapters structure
- Browser-only image intake and rule-based readiness assessment
- Local GLB model asset rendering from config
- Model-local inspection annotations using standardized ENU coordinates
- Browser-only mock COLMAP workflow from project setup to model display
- POC 4A reconstruction handoff contract for discussion with the reconstruction pipeline owner

In progress / planned:

- More complete and validated config-driven `project_config.json`
- Agent-assisted project configuration
- Image intake audit and EXIF/GPS inspection
- Real reconstruction pipeline integration
- Support for GLB / 3D Tiles output
- Backend services

Future contract examples:

- `docs/poc-1-config-driven-viewer.md`
- `docs/poc-2a-image-intake.md`
- `docs/poc-4a-reconstruction-handoff-contract.md`
- `docs/examples/reconstruction_request.example.json`
- `docs/examples/reconstruction_output.example.json`
- `docs/examples/project_config.future.example.json`
- `docs/ai-intake-assistant-scope.md`
- `docs/reconstruction-pipeline-handshake.md`

These describe planned agent intake and reconstruction integration contracts.
They are discussion artifacts only; they are not implemented runtime features.

## Roadmap

- POC 0: Cesium decision-support viewer, current baseline
- POC 1: Config-driven Cesium viewer
- POC 2: Image intake and audit agent
- POC 2A: Browser-only image intake and mock readiness assessment
- POC 3A: Render local GLB model assets from config
- POC 3B: Attach inspection annotations to model assets
- POC 3D: Browser-only mock COLMAP reconstruction workflow
- POC 4A: Reconstruction handoff contract and examples
- POC 3: 3D reconstruction integration
- POC 4: Research extensions such as uncertainty, multi-digital-twin interaction, and decision support

The current codebase includes the POC 1 viewer, POC 2A image readiness review,
POC 3A/3B model rendering and annotations, and the POC 3D mock reconstruction
workflow. POC 4A documents the proposed real reconstruction handoff, but a real
reconstruction service is not connected.

## Research Direction

This project may support research around:

- Agent-assisted digital twin generation
- Structured project configuration for digital twins
- Image intake sufficiency assessment
- 3D reconstruction-to-Cesium workflows
- Digital twin decision support
- Future interaction among multiple digital twins

These are intended research directions, not claims about completed system capabilities.

## Known Limitations

- Frontend-only
- Data is mock, hardcoded, or only partially config-driven
- No backend yet
- No database yet
- No authentication
- No real sensor integration
- No real image upload yet
- No real LLM agent yet
- No real 3D reconstruction pipeline yet
- Mock reconstruction uses browser timers and a bundled sample GLB
- Image intake readiness is rule-based and local-only
- No persisted state yet
- Not a production decommissioning system

## Repository Structure

The project is being organized into a cleaner viewer architecture:

```text
public/
  project_config.json        Static mock project configuration

src/
  app/                       Application state and shell composition
  adapters/                  Implementations for project config, mock agent, and viewer ports
  cesium/                    Cesium viewer creation and entity helpers
  components/                React UI components
  config/                    Project config loading and validation
  domain/                    Belief, audit, and project mapping logic
  domain/imageIntake/        Browser-only image inspection and readiness rules
  ports/                     Interfaces for external providers and viewer adapters
  types/                     Shared TypeScript types
  styles/                    Global styles

docs/
  architecture.md            Architecture notes
  poc-1-config-driven-viewer.md           POC 1 run and test notes
  poc-2a-image-intake.md                  POC 2A run and test notes
  poc-3a-glb-model-assets.md              POC 3A GLB model asset notes
  poc-3b-model-local-annotations.md       POC 3B model annotation notes
  poc-3d-mock-colmap-workflow.md          POC 3D run and test notes
  poc-4a-reconstruction-handoff-contract.md  POC 4A pipeline handoff contract
  ai-intake-assistant-scope.md            AI intake assistant scope notes
  reconstruction-pipeline-handshake.md    Reconstruction pipeline integration notes
  project-config-schema.md   Project configuration schema notes
  examples/                  Future draft config examples
  decisions/                 Lightweight design decision records
```

Some structure is still evolving as the prototype moves from a hardcoded viewer toward a more complete config-driven system.

## Advisor / Context Note

This prototype is part of an exploratory research direction under discussion with Professor Yong-Cheol Lee at LSU, focused on rapid digital twin generation, Cesium-based visualization, and agent-assisted workflows.

## Feedback Requested

I would appreciate feedback on:

- Whether Cesium should remain the primary visualization layer
- Whether the `project_config.json` abstraction is suitable for agent-generated digital twin views
- How this viewer can connect with the current rapid digital twin / NeRF / image-to-3D workflow
- Which part of this direction has the strongest research contribution potential
