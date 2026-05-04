# 002 Use Project Config JSON

## Context

Future agents should be able to generate project setup without editing Cesium source files.

## Decision

Use `public/project_config.json` as the first project configuration source.

## Why

JSON is easy for humans, scripts, backends, and model providers to produce. It creates a stable contract between future agents and the viewer.

## Alternatives Considered

- Keep hardcoded TypeScript data.
- Load directly from a backend immediately.
- Store project data in a database now.

## Consequences

The viewer can evolve independently from future config-generation workflows. Runtime validation is needed because JSON is external input.
