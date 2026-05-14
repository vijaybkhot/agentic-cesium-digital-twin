# Proposed Handshake with Reconstruction Pipeline

## Purpose

This defines how the Cesium/config side can connect with Ihsan's NeRF/COLMAP/image-to-3D pipeline without tightly coupling the systems. The goal is a small shared contract: the intake side prepares project data and consumes model asset references; the reconstruction side produces model assets and metadata.

## Responsibilities

### Cesium / Agent Intake Side

- collect user inputs
- collect uploaded images in future
- inspect metadata
- create project ID
- generate or update `project_config.json`
- consume model asset references

### Reconstruction Pipeline Side

- receive image set or project folder
- run reconstruction
- generate model asset
- provide output path/URL and metadata

## Shared Output Contract

```json
{
  "projectId": "mock-dnd-facility",
  "jobId": "recon-job-001",
  "status": "completed",
  "asset": {
    "assetType": "3d-tiles",
    "assetUrl": "/tilesets/mock-dnd-facility/tileset.json",
    "sourcePipeline": "ihsan-reconstruction-pipeline",
    "createdAt": "2026-05-20"
  },
  "spatialAnchor": {
    "lat": 40.03883,
    "lon": -75.59777,
    "height": 0
  },
  "orientation": {
    "heading": 0,
    "pitch": 0,
    "roll": 0
  },
  "scale": 1,
  "quality": {
    "status": "unknown",
    "notes": "Placeholder until reconstruction quality metrics are available."
  }
}
```

## GLB vs 3D Tiles

GLB may be enough for small/simple models. It is straightforward to load and useful for early experiments.

3D Tiles should be the long-term target for larger geospatial scenes in Cesium. It supports tiled, geospatially anchored, scalable visualization better than a single monolithic model.

The architecture should support both through `modelAssets` in config.

## Open Questions

- What format does Ihsan's current pipeline output?
- Does the output have scale/orientation/location metadata?
- Can output be converted to GLB or 3D Tiles?
- Should Cesium load assets directly from local storage first or from cloud storage later?
