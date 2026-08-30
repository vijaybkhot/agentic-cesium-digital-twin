# Agent-Assisted Cesium Digital Twin Research Prototype

This repository contains an early research prototype for config-driven
geospatial digital-twin visualization and decision-support experiments. It
combines a React/TypeScript application, CesiumJS rendering, viewer-independent
domain contracts, offline public-data processing scripts, and an isolated
ArcGIS portability experiment.

The project is a **research prototype**, not a production digital-twin system.
It does not currently include a real LLM agent, a connected COLMAP
reconstruction backend, live sensors, operational emergency data, or persisted
project state. The repository is publicly accessible and is being prepared for
an approved open-source release; see
[Open-source release preparation](#open-source-release-preparation).

## Research purpose

The prototype explores a reusable boundary between source data, offline
processing, structured digital-twin state, and visualization clients. The
viewer should consume validated configuration or GeoJSON rather than asking an
LLM or browser session to generate viewer code or recompute scientific spatial
relationships.

The current research questions include:

- Can one viewer architecture support controlled-facility, construction,
  disaster-resilience, and urban-resilience scenarios without mixing their
  domain contracts?
- Can agent or reconstruction providers be replaced behind typed interfaces
  without rewriting the Cesium renderer?
- Can the same processed public-data artifacts be consumed by both CesiumJS and
  ArcGIS clients?
- How should uncertainty, incomplete data coverage, provenance, and
  non-operational safety language be represented in a digital-twin interface?

## Implementation status

| Component | Status | Current behavior |
| --- | --- | --- |
| CesiumJS viewer | Implemented prototype | Renders config-driven assets and isolated scenario-specific entities through a viewer adapter. |
| Project and image intake | Browser-only prototype | Inspects selected local image metadata and applies deterministic readiness rules without uploading the files. |
| Reconstruction workflow | Mock | Simulates queued, running, and completed states, then returns a bundled sample GLB. |
| Real COLMAP reconstruction | External and not integrated | Handoff contracts and expected JPG/PLY inputs and outputs are documented, but no backend is connected. |
| Agent layer | Interface and mock implementation | A provider boundary exists; no real LLM provider is called. |
| Model visualization | Implemented prototype | Displays configured GLB assets, local annotations, and measurement links. Raw PLY is not rendered directly. |
| Urban public-data processing | Implemented research workflow | Offline Node scripts process OpenStreetMap, FEMA NFHL, and USGS 3DEP source data into committed local GeoJSON. |
| ArcGIS viewer | Isolated portability experiment | Loads selected processed urban GeoJSON without recomputing project relationships. |
| Backend, authentication, database, and persistence | Not implemented | These remain future integration work. |
| Live sensors and operational emergency feeds | Not implemented | The current application must not be used for operational decisions. |

## Demonstration modes

The main application keeps five modes isolated in `src/app/AppShell.tsx`.

### 1. New-project and image-intake workflow

A browser-only workflow for entering a project location, selecting local
images, reviewing deterministic metadata checks, and running a mock
reconstruction lifecycle. Selected images remain local to the browser. The
completed mock job displays the bundled Cesium Milk Truck GLB; it does not run
COLMAP or photogrammetry.

### 2. Existing controlled-facility demo

A mock facility scene with a controlled-area boundary, measurement points,
Low/Medium/High belief states, editable readings, manual overrides,
recommendations, audit history, a sample model, and model-linked annotations.
The mode loads `public/project_config.json` only when explicitly opened.

### 3. Modular housing demo

A separate proposal-oriented mock scenario containing a factory, modular
units, a logistics route, staging and construction areas, status actions,
camera controls, and an event feed. It is not connected to real factories,
robotics, logistics systems, or construction operations.

### 4. Property-specific disaster-resilience demo

A fully fictional Baton Rouge-area scenario with six synthetic properties, a
mock HEC-RAS-style flood-depth volume, a fictional shelter, a mock route,
camera presets, a resident-facing dashboard, and a multi-twin event feed.

The six property footprints are synthetic and are deliberately not aligned
with real parcels, roads, buildings, or private addresses. The flood layer is
not HEC-RAS output, current flooding, a forecast, or emergency guidance.

> **Demonstration only. Not for real emergency use.**

### 5. Urban-resilience demo

A real-public-data research scenario for Grand Isle, Port Fourchon, and parts
of the Louisiana Highway 1 corridor. It uses processed OpenStreetMap building,
road, and facility geometry; FEMA National Flood Hazard Layer polygons; and a
small USGS 3DEP ground-elevation sample.

The mode includes optional LA-1/FEMA, community/public-safety facility, and
ground-elevation experiments. These report mapped spatial relationships and
data-coverage status only. They do not report current flooding, road
passability, facility operation, structural vulnerability, or evacuation
suitability.

### ArcGIS portability experiment

The separate page at
`/experiments/arcgis-urban-resilience/` tests whether selected processed urban
GeoJSON can be rendered in an ArcGIS SceneView. It is a portability experiment,
not a replacement application and not an independent scientific-processing
pipeline.

## Architecture

The primary data path is:

```text
Public or project source data
        |
        v
Offline acquisition and processing
        |
        v
Validated local JSON / GeoJSON / model references
        |
        v
Viewer-independent types and domain contracts
        |
        +-----------------------+
        |                       |
        v                       v
   CesiumJS viewer       ArcGIS experiment
```

The intended future reconstruction path is:

```text
Images
  -> deterministic intake checks
  -> future reconstruction provider
  -> PLY or other pipeline-native output
  -> GLB or 3D Tiles conversion
  -> geospatial placement and visualization
```

Only the intake checks, mock provider lifecycle, sample-GLB handoff, and a
local Blender conversion spike are represented in this repository today. A
real reconstruction service is not connected.

The code uses small ports for the external boundaries:

- `AgentProvider`
- `ProjectConfigRepository`
- `ReconstructionProvider`
- `ViewerAdapter`

Cesium-specific imports remain concentrated under `src/cesium` and the Cesium
viewer adapter. See [Architecture](docs/architecture.md), the
[project-config schema](docs/project-config-schema.md), and the
[reconstruction handshake](docs/reconstruction-pipeline-handshake.md).

## Technical stack

- React 19
- TypeScript
- Vite
- CesiumJS
- ArcGIS Maps SDK for JavaScript for one isolated experiment
- Local JSON and GeoJSON
- Offline Node.js acquisition, processing, and validation scripts

## Quick start

### Prerequisites

- Git
- Node.js `22.12.0` or newer
- npm, included with Node.js
- A browser with WebGL support

The repository pins `22.12.0` in `.nvmrc`. On macOS or Linux with `nvm`, run:

```bash
nvm use
```

NVM for Windows does not automatically use `.nvmrc`; select the version
explicitly in an Administrator PowerShell session when changing versions:

```powershell
nvm use 22.12.0
```

Ordinary `node`, `npm`, build, and development commands do not require an
Administrator terminal.

### Install and run

```powershell
git clone https://github.com/vijaybkhot/agentic-cesium-digital-twin.git
cd agentic-cesium-digital-twin
npm ci
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173/
```

The isolated ArcGIS experiment is normally available at:

```text
http://localhost:5173/experiments/arcgis-urban-resilience/
```

Build and preview the production bundle:

```powershell
npm run build
npm run preview
```

Cesium static workers, widgets, assets, and third-party files are copied from
the installed Cesium package by `vite-plugin-static-copy`.

## Optional environment configuration

The base Cesium application can run without a private token by using Cesium's
bundled Natural Earth imagery. Copy `.env.example` to `.env.local` only when
optional services are needed:

```powershell
Copy-Item .env.example .env.local
```

macOS and Linux equivalent:

```bash
cp .env.example .env.local
```

Available variables are:

```dotenv
VITE_CESIUM_ION_ACCESS_TOKEN=
VITE_ENABLE_URBAN_OSM_BUILDINGS=false
VITE_ARCGIS_API_KEY=
```

- `VITE_CESIUM_ION_ACCESS_TOKEN` enables optional Cesium ion imagery and
  contextual OSM Buildings.
- `VITE_ENABLE_URBAN_OSM_BUILDINGS` is off by default because the urban demo
  already renders selectable, risk-classified local OSM-derived footprints.
- `VITE_ARCGIS_API_KEY` enables optional basemap and elevation services in the
  isolated ArcGIS experiment.

Restrict keys to the required services and approved HTTP referrers. Never
commit `.env.local`, API keys, Cesium ion tokens, or ArcGIS credentials.

## Validation

The current complete local validation sequence is:

```powershell
npm run validate:urban-resilience-elevation-sample
npm run validate:urban-resilience-data
npm run validate:urban-resilience-facility-data
npm run validate:urban-resilience-la1-fema-experiment
npm run validate:disaster-data
npm run build
```

These commands validate committed local artifacts and build the application;
they do not fetch new OSM, FEMA, or USGS responses. A future release ticket
tracks consolidating them into one CI command.

## Public-data processing

The browser consumes committed, processed GeoJSON under
`public/data/urban-resilience/`. Source acquisition is deliberately separated
from browser visualization.

### Base urban dataset

```powershell
npm run fetch:urban-resilience-data
npm run build:urban-resilience-data
npm run validate:urban-resilience-data
```

### LA-1/FEMA relationship experiment

```powershell
npm run build:urban-resilience-la1-fema-experiment
npm run validate:urban-resilience-la1-fema-experiment
```

### Community/public-safety facility experiment

```powershell
npm run fetch:urban-resilience-facility-data
npm run build:urban-resilience-facility-data
npm run validate:urban-resilience-facility-data
```

### USGS 3DEP ground-elevation sample

```powershell
npm run fetch:urban-resilience-elevation-sample
npm run build:urban-resilience-elevation-sample
npm run validate:urban-resilience-elevation-sample
```

The `fetch:*` commands require network access and write raw service responses
under ignored `scripts/.cache/`. Generated, validated GeoJSON under
`public/data/` is committed so viewers do not need to contact scientific data
services at browser runtime. Upstream services and source data can change, so a
regenerated dataset must be reviewed rather than treated as a mechanical
replacement.

## Data sources and interpretation boundaries

| Source | Project use | Important limitation |
| --- | --- | --- |
| OpenStreetMap / Overpass | Building footprints, road ways, and mapped community/public-safety facilities | OSM may be incomplete. Building footprints are not legal parcels, and absence from OSM does not prove real-world absence. |
| FEMA National Flood Hazard Layer | Mapped flood-hazard polygons used in zone-based research relationships | FEMA polygons are not current floodwater, forecast depth, road condition, evacuation guidance, or a project-generated hydraulic model. |
| USGS 3DEP | Estimated/interpolated ground elevation at representative sample coordinates | The value is not building height, floor elevation, flood depth, FEMA Base Flood Elevation, or a site-specific survey. |
| Fictional local data | Property-specific disaster-resilience demonstration | Synthetic geometry and mock values must not be associated with real residents or operational decisions. |
| Cesium ion and ArcGIS services | Optional visual context | Visual context is not project-derived scientific evidence and can be unavailable when credentials are absent. |

Detailed source, licensing, asset, and service attribution is centralized in
[Third-Party Notices](THIRD_PARTY_NOTICES.md).

The urban property classification is a zone-based research classification:

- FEMA V/VE zones map to `High`.
- Other mapped Special Flood Hazard Area zones map to `Moderate`.
- A supported mapped-outside-SFHA result maps to `Low`.
- Missing, incomplete, unavailable, or undetermined coverage maps to `Unknown`.

`Unknown` must never be converted to `Low`. A mapped non-intersection must not
be described as no flood risk. See the
[urban-resilience real-data guardrails](docs/decisions/006-urban-resilience-real-data-guardrails.md).

## Safety and scientific limitations

### Prototype limitations

- Frontend-only application
- No backend API, authentication, database, or persisted state
- No live sensor, facility-operation, traffic, or emergency feed
- No production security or availability guarantees

### Agent and reconstruction limitations

- No real LLM agent or model-provider integration
- No connected image-upload or COLMAP reconstruction service
- Mock reconstruction uses browser timers and a bundled sample GLB
- Raw PLY requires conversion before the current Cesium viewer can display it
- The Blender PLY-to-GLB tool is a local conversion spike, not a browser feature

### Disaster and urban-resilience limitations

- Not an official FEMA flood determination or insurance requirement
- Not current flooding, forecast inundation, or storm-surge depth
- Not road closure, passability, safe-travel, or evacuation guidance
- Not an authoritative shelter or community-facility inventory
- Not facility availability, operational status, criticality, or vulnerability
- Not building-floor elevation or structural elevation
- Not a substitute for a certified flood study, hydraulic model, survey, or
  emergency-management system

Spatial overlap describes a geographic relationship only. It must not be
converted into an unsupported statement about current hazard or operational
condition.

## Contributing, conduct, and security

Contributions are welcome when they preserve the repository's research,
provenance, privacy, and scientific-interpretation boundaries. Before opening
an issue or pull request, review the following policies:

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

Security vulnerabilities, exposed credentials, and sensitive-data concerns
must not be posted in public issues. Use the private reporting process in the
Security Policy.

## Repository structure

```text
src/
  adapters/       Implementations of viewer, config, reconstruction, and agent ports
  app/            Application state and mode orchestration
  cesium/         Cesium-specific rendering and scene helpers
  components/     React panels and controls
  domain/         Viewer-independent scenario and parsing logic
  experiments/    ArcGIS portability experiment source
  ports/          Interfaces for external providers and viewers
  types/          Shared TypeScript contracts

scripts/          Offline acquisition, processing, geometry, and validation scripts
public/data/      Committed generated JSON and GeoJSON consumed by viewers
public/models/    Approved viewer-ready sample model assets
experiments/      Alternate experiment HTML entry points
docs/             Architecture, decisions, contracts, evidence, and research notes
```

## Roadmap

Near-term work focuses on open-source release readiness, reproducibility,
scientific test coverage, and clearer contributor boundaries. Longer-term
research directions include:

- Real reconstruction-provider integration
- Stable PLY-to-GLB or PLY-to-3D-Tiles processing
- Agent-assisted structured project configuration
- More rigorous building/FEMA spatial-association comparisons
- Broader verified FEMA coverage along selected LA-1 study corridors
- Portable scenario and data contracts for additional viewers
- Secure, auditable interaction among multiple digital twins

See the [project roadmap](ROADMAP.md) and the
[Open-Source Ecosystem Readiness tracker](https://github.com/vijaybkhot/agentic-cesium-digital-twin/issues/89).

## Open-source release preparation

Project-authored source code and documentation are provided under the
[Apache License 2.0](LICENSE). Third-party software, data, services, and model
assets retain their respective terms, as documented in
[Third-Party Notices](THIRD_PARTY_NOTICES.md).

The license and neutral contributor attribution do not claim Louisiana State
University ownership, sponsorship, certification, or endorsement. The
repository currently remains under the maintainer's GitHub account and may be
transferred later if the contributors and any applicable institution establish
a different stewardship arrangement.

Release-readiness work is tracked in GitHub:

- [#72 — Confirm ownership and add the approved license](https://github.com/vijaybkhot/agentic-cesium-digital-twin/issues/72)
- [#74 — Centralize data provenance and third-party attribution](https://github.com/vijaybkhot/agentic-cesium-digital-twin/issues/74)
- [#75 — Add contributor, conduct, and security policies](https://github.com/vijaybkhot/agentic-cesium-digital-twin/issues/75)
- [#76 — Add one-command validation and pull-request CI](https://github.com/vijaybkhot/agentic-cesium-digital-twin/issues/76)
- [#89 — Open-Source Ecosystem Readiness tracker](https://github.com/vijaybkhot/agentic-cesium-digital-twin/issues/89)

Current licensing, attribution, and community documents:

- [Apache License 2.0](LICENSE)
- [Project notice](NOTICE)
- [Third-Party Notices](THIRD_PARTY_NOTICES.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

The policies provide the current contribution workflow and private reporting
channels without promising production support or institutional response.

## Research context

This prototype supports an exploratory research direction discussed with
Professor Yong-Cheol Lee at Louisiana State University concerning rapid
digital-twin generation, geospatial visualization, urban resilience, and
agent-assisted workflows. References to future collaboration or ecosystem
growth describe research directions, not completed integrations or adoption
commitments.
