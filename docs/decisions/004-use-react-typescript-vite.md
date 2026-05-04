# 004 Use React TypeScript Vite

## Context

The original POC used direct DOM manipulation from `src/main.js`.

## Decision

Migrate to React + TypeScript while staying on Vite.

## Why

React makes UI state and components easier to maintain. TypeScript strengthens the provider, config, and reconstruction boundaries. Vite remains simple for a frontend-only POC.

## Alternatives Considered

- Stay with plain JavaScript.
- Move to Next.js immediately.
- Add a larger state management library.

## Consequences

The project has clearer long-term structure without adding backend, routing, or framework complexity that is not needed yet.
