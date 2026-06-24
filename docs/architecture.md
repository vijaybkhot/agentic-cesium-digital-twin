# Architecture

## Overview

The viewer is config-driven. A `ProjectConfig` describes the scene center,
camera, optional site marker and facility, belief rules, measurement points,
model assets, and annotations. The React app passes either a static demo config
or an in-memory workflow config through the same Cesium adapter.

## Application Modes

- New-project workflow: starts with a globe and setup panel, then adds a site
  marker and finally a returned model asset.
- Existing demo: loads `public/project_config.json` and preserves the facility,
  measurement, image intake, belief-state, model, and annotation features.

The mock reconstruction provider follows the same port intended for a future
backend provider. Its timers and sample GLB can be replaced without changing
Cesium rendering.

## Why Config-Driven

Future agents should generate structured project configuration, not rewrite Cesium rendering code. This keeps the agent boundary stable and makes the renderer deterministic.

## Ports And Adapters

The app defines small interfaces in `src/ports`:

- `AgentProvider`
- `ProjectConfigRepository`
- `ReconstructionProvider`
- `ViewerAdapter`

Adapters implement these interfaces:

- `StaticJsonProjectConfigRepository` loads `/project_config.json`.
- `MockAgentProvider` prepares the future agent boundary without calling a real model.
- `CesiumViewerAdapter` owns the Cesium viewer instance.
- `MockColmapReconstructionProvider` simulates queued, running, and completed
  reconstruction states and returns a typed model asset.

## Cesium Isolation

Only `src/cesium` and `src/adapters/viewer` import from `cesium`. Domain services and React components use project types and callbacks instead of raw Cesium APIs.

## Why The Agent Generates Config

The future agent can translate conversation, images, survey notes, or backend data into a stable JSON shape. The viewer can then render, validate, and update state without coupling to any one model provider.

## Why Vite + React + TypeScript

Vite keeps this POC lightweight and fast. React makes the side panel and state flow easier to maintain than direct DOM mutation. TypeScript gives useful boundaries for config, providers, reconstruction jobs, and viewer adapters.

Next.js is not needed yet because this project has no server-rendered pages, routing, authentication, backend API, or deployment-specific full-stack requirements.
