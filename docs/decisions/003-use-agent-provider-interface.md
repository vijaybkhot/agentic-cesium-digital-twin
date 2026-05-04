# 003 Use Agent Provider Interface

## Context

The project may later use OpenAI, Azure OpenAI, Ollama, or a custom model provider.

## Decision

Define an `AgentProvider` interface now and add only a mock implementation.

## Why

The interface clarifies the boundary without committing to a provider or SDK too early.

## Alternatives Considered

- Add a real OpenAI or Azure SDK now.
- Hardcode a mock function in React components.

## Consequences

Provider implementations can be swapped later. The current POC stays frontend-only and dependency-light.
