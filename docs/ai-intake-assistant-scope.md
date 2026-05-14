# AI Intake Assistant Scope

## Purpose

The first AI assistant should not fully control reconstruction. Its first role is intake, validation, missing-input detection, and configuration generation. It should help turn a user conversation, site details, and future image metadata into structured project information that the Cesium viewer can render.

The assistant should produce or update configuration, not rewrite Cesium code.

## Inputs

- project name
- project type / use case
- site location or map pin
- uploaded image set
- optional GPS/EXIF metadata
- desired output type
- optional measurement points / annotations

## Readiness Checks

Readiness should be staged so the early system is useful before any real AI or reconstruction is connected.

- Stage 0: rule-based checks, no AI
- Stage 1: template/mock assistant explains missing inputs
- Stage 2: LLM helps with conversation and config generation
- Stage 3: multimodal LLM or CV checks image quality/coverage
- Stage 4: reconstruction pipeline feedback confirms technical quality

Simple examples:

- `imageCount < 20` => needs more images
- no GPS and no manual location => ask for location
- low resolution images => ask for better images
- enough images + location => ready for initial reconstruction test

## Outputs

The assistant should return structured outputs that are easy for the app and future backend to consume:

- missing-input checklist
- image intake summary
- reconstruction readiness status
- draft `project_config.json`
- next recommended action

Example readiness output:

```json
{
  "agentProvider": "mock-agent",
  "reconstructionReadiness": "needs_more_input",
  "reason": "Only 18 images were provided, and no GPS metadata or manual site location was supplied.",
  "recommendedNextAction": "Upload more images from multiple angles and provide an approximate site latitude and longitude."
}
```

## First Version Recommendation

The first version should use normal code/rules for metadata checks and only use an LLM later for conversation and structured config generation.

## Future LLM / Multimodal Extension

Later versions can test OpenAI, Gemini, Azure OpenAI, local models, or custom models behind the same `AgentProvider` interface. The viewer should keep consuming structured config regardless of which provider generated or reviewed it.

## Handshake with Reconstruction Pipeline

- The AI intake assistant collects project data/images and prepares draft config.
- The reconstruction pipeline runs the reconstruction workflow.
- Shared output should include asset type, asset URL/path, model origin/spatial anchor, scale/orientation, status, and optional quality/confidence.
- The final asset reference is written into `project_config.json`.
- Cesium viewer loads the asset from the config without new viewer code.
