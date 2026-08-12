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
- Model annotations linked to existing sensor/measurement data
- Browser-only project setup and mock COLMAP reconstruction workflow
- Separate modular housing proposal-demo mode with typed mock scenario data
- Cesium-native modular factory, route, station, zone, and module rendering
- Reconstruction handoff contract examples for future pipeline integration
- PLY/point-cloud output awareness with conversion guidance for Cesium rendering
- Urban resilience demo mode using real OpenStreetMap building footprints and
  real FEMA flood-zone data for Grand Isle and Port Fourchon, Louisiana, with
  a real LA Highway 1 response corridor and regional staging references

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
  -> PLY / GLB / 3D Tiles
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

Select `Open modular housing demo` to view the proposal-support modular housing
scenario shell. This mode uses typed mock data for factory, logistics, site,
module, event, and recommendation concepts. It renders lightweight Cesium-native
factory, route, station, zone, and module entities without new binary assets.
The current shell is not connected to real AI, robotics, factory, logistics, or
construction-site systems.

Select `Open urban resilience demo` to view a property-centered coastal
disaster risk and response scenario for Grand Isle and Port Fourchon,
Louisiana, built from real open data (OpenStreetMap building footprints and
FEMA National Flood Hazard Layer flood-zone classifications). See
[Urban Resilience Demo](#urban-resilience-demo-grand-isle--port-fourchon-louisiana)
below for how to regenerate the underlying dataset. This is a research
classification, not an official flood determination or evacuation order.

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

## Urban Resilience Demo (Grand Isle & Port Fourchon, Louisiana)

The urban resilience demo renders real building footprints and real FEMA
flood-zone classifications, generated offline (not fetched live from the
browser) into a committed static GeoJSON dataset under
`public/data/urban-resilience/`. To regenerate that dataset from current
upstream sources:

```bash
npm run fetch:urban-resilience-data   # OpenStreetMap Overpass + FEMA NFHL -> scripts/.cache/
npm run build:urban-resilience-data   # join/classify -> public/data/urban-resilience/*.geojson
npm run validate:urban-resilience-data
```

Property `risk_level` is a FEMA-zone-based classification (VE/V -> High;
other SFHA zones -> Moderate; mapped outside the SFHA -> Low; and missing or
undetermined FEMA coverage -> Unknown), not a computed hydraulic model. See
`docs/decisions/006-urban-resilience-real-data-guardrails.md` for the full
data-sourcing and safety-framing rationale.

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
- Model-linked sensors that reuse existing measurement editing controls
- Browser-only mock COLMAP workflow from project setup to model display
- Modular housing proposal-demo mode foundation with typed mock scenario data
- POC 4A reconstruction handoff contract for discussion with the reconstruction pipeline owner
- POC 4B notes documenting Ehsan's current JPG-to-PLY reconstruction pipeline
- POC 4C PLY output awareness and local sample test guidance
- POC 4D local PLY-to-GLB conversion spike documentation and script
- POC 4H browser-only GPS/EXIF readiness and site-distance checks for image intake
- Urban resilience demo mode using real OpenStreetMap building footprints and
  real FEMA National Flood Hazard Layer flood-zone classifications for Grand
  Isle and Port Fourchon, Louisiana, with a real LA Highway 1 response
  corridor and regional staging references

In progress / planned:

- More complete and validated config-driven `project_config.json`
- Agent-assisted project configuration
- Deeper image intake audit beyond metadata checks
- Real reconstruction pipeline integration
- Conversion tests from real pipeline PLY output to GLB or 3D Tiles
- Backend services

Future contract examples:

- `docs/poc-1-config-driven-viewer.md`
- `docs/poc-2a-image-intake.md`
- `docs/poc-4a-reconstruction-handoff-contract.md`
- `docs/poc-4b-ehsan-reconstruction-pipeline.md`
- `docs/poc-4c-ply-output-awareness.md`
- `docs/poc-4d-ply-conversion-spike.md`
- `docs/poc-4h-image-gps-exif-readiness.md`
- `docs/examples/reconstruction_request.example.json`
- `docs/examples/reconstruction_output.example.json`
- `docs/examples/reconstruction_output_ply.example.json`
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
- POC 4E: Link model annotations to existing sensor measurements
- POC 3D: Browser-only mock COLMAP reconstruction workflow
- POC 4A: Reconstruction handoff contract and examples
- POC 4B: Document Ehsan's current JPG-to-PLY pipeline
- POC 4C: Recognize PLY/point-cloud output as pipeline-native data
- POC 4D: Convert local PLY samples to GLB for a Cesium viewer spike
- POC 4H: Add browser-only GPS/EXIF advisory checks to image intake
- POC 3: 3D reconstruction integration
- POC 4: Research extensions such as uncertainty, multi-digital-twin interaction, and decision support

The current codebase includes the POC 1 viewer, POC 2A image readiness review,
POC 3A/3B model rendering and annotations, and the POC 3D mock reconstruction
workflow. POC 4E links model annotations to existing measurement data. POC 4A
documents the proposed real reconstruction handoff, and POC 4B records Ehsan's
current JPG-to-PLY pipeline shape. POC 4C recognizes PLY/point-cloud output as
pipeline-native data but still requires conversion to GLB or 3D Tiles before
Cesium rendering. POC 4D adds a local Blender-based PLY-to-GLB conversion spike
for testing small sample assets. POC 4H adds browser-only GPS/EXIF readiness
checks and a simple image-GPS-to-site warning to image intake. A real
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
- Raw PLY files are not rendered directly; they require conversion first
- Local PLY-to-GLB conversion requires Blender and is not part of the browser app
- Image intake readiness is rule-based and local-only
- No persisted state yet
- Not a production decommissioning system
- Urban resilience property risk levels are a FEMA zone-based classification,
  not a certified flood study, computed hydraulic model, or official
  determination; response routes/resources are illustrative, not live or
  official emergency data

## Repository Structure

The project is being organized into a cleaner viewer architecture:

```text
public/
  project_config.json        Static mock project configuration
  data/urban-resilience/     Generated real building/flood-zone/response GeoJSON
                              (see npm run build:urban-resilience-data)

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
  poc-4b-ehsan-reconstruction-pipeline.md    POC 4B real pipeline notes
  poc-4c-ply-output-awareness.md             POC 4C PLY output awareness notes
  poc-4d-ply-conversion-spike.md             POC 4D local conversion spike notes
  poc-4e-model-linked-sensors.md          POC 4E model-linked sensor notes
  poc-4h-image-gps-exif-readiness.md      POC 4H GPS/EXIF intake notes
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
