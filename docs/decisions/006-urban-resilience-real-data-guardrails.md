# 006: Urban Resilience Real-Data Guardrails

## Status

Accepted for the Grand Isle & Port Fourchon coastal resilience spike.

## Context

The repository already supports a fictional, guardrailed property-level
disaster-resilience demo (`disaster-demo` mode; see the mock-only boundaries
in the demo itself and `scripts/validateDisasterResilienceData.mjs`, which
requires every property/event/label to carry fictional/mock/synthetic
language and rejects any URL).

A new research direction calls for a property-centered disaster risk and
response-scenario module for a **real** place: Grand Isle and Port Fourchon,
Louisiana -- a barrier-island town and port facility area connected to the
mainland by a single road, LA Highway 1. This is a real, currently-inhabited,
hurricane-exposed community, so the guardrails here are different in kind
from the fictional demo's: instead of enforcing "this is fake," they enforce
"this is real data, honestly sourced and clearly not an operational hazard
or emergency system."

## Decision

The urban resilience work is added as a fourth, separate application mode
(`urban-resilience-demo`), following the same non-interference pattern as
`docs/decisions/005-modular-housing-demo-guardrails.md`: it does not replace
or modify the existing `workflow`, `existing-demo`, `modular-demo`, or
`disaster-demo` modes, and switching modes clears stale mode-specific
selections.

**Data sourcing.** Property and hazard data are real, not hand-authored:

- Building footprints come from OpenStreetMap (Overpass API), fetched by
  `scripts/fetchUrbanResilienceSourceData.mjs` and joined/classified by
  `scripts/buildUrbanResiliencePropertyData.mjs` into a committed static
  GeoJSON file under `public/data/urban-resilience/`, following the existing
  static-GeoJSON-loaded-at-runtime convention (`propertyDataUrl`).
- Flood zone polygons come from the FEMA National Flood Hazard Layer public
  ArcGIS REST service (`hazards.fema.gov/arcgis/rest/services/public/NFHL`).
- The LA Highway 1 response-route geometry comes from OpenStreetMap
  (`ref=LA 1` ways), snapped to real known waypoints (Grand Isle, Port
  Fourchon, and the inland towns of Golden Meadow, Galliano, and Larose).
- All fetching happens offline via Node scripts, not live from the browser
  at runtime -- consistent with the project's browser-only, no-backend
  prototype shape, and avoiding a runtime dependency on third-party API
  availability/rate limits.

**Risk classification.** Property `risk_level` is a documented, standard
zone-based proxy, not a fabricated number: FEMA Zone V/VE (coastal
high-hazard, wave action) maps to `High`; other Special Flood Hazard Area
zones (A/AE/AH/AO/AR/A99) map to `Moderate`; areas outside the mapped SFHA,
or where the digitized NFHL has a coverage gap (a known real condition
found in the Port Fourchon area during data collection), map to `Low` with
an explicit confidence note flagging the coverage gap rather than implying
a confirmed low-risk determination.

**Safety framing.** Every property, route, and resource carries a
disclaimer distinguishing this research classification from an official
flood determination, insurance requirement, evacuation order, or real
shelter list (`URBAN_RESILIENCE_DISCLAIMER` in
`src/domain/urbanResilience/urbanResilienceContract.ts`). Regional response
"resources" are explicitly labeled staging references (approximate town
centers along the LA-1 corridor), not official shelters, since no verified
live shelter-location data source was integrated. Response-route status is
labeled as an illustrative research judgment, not live road-condition data.

**Architecture reuse.** The module follows `docs/architecture.md`'s
constraint that only `src/cesium` and the viewer adapter import from
`cesium`: rendering helpers such as `styleDisasterPropertyDataSource.ts`'s
pattern were adapted (not literally reused, to keep `entityType` tags and
click-selection routing isolated per mode) into
`styleUrbanPropertyDataSource.ts`, `createUrbanFloodZoneLayers.ts`, and
`createUrbanResilienceResponseEntities.ts`. `ViewerAdapter` gained parallel
`renderUrbanResilienceScenario`/`flyToUrbanResilienceTarget` methods and a
`urbanProperty` variant on the `ViewerSelection` union, mirroring the
existing `disasterProperty` triad.

## Mock/Research-Only Boundaries

This module is a research prototype only. It must not claim or imply:

- an official FEMA flood determination or insurance requirement
- a real, current, or official evacuation order or route status
- a real or complete emergency shelter list
- live sensor, weather, or road-condition monitoring
- backend persistence, authentication, or production deployment

The panel disclaimer, per-property confidence notes, and response-context
copy must consistently carry this framing. Documentation and UI copy should
distinguish "real data, research classification" from "official guidance."

## Consequences

Real data means the demo can produce a genuinely informative result (for
example, that FEMA maps nearly all of Grand Isle's surveyed structures as
Zone VE, and that Port Fourchon has a real digitized-flood-zone coverage
gap) rather than an illustrative-only synthetic scenario. It also means the
data pipeline has external dependencies (Overpass, FEMA ArcGIS) that can
change or become unavailable; the fetch/build scripts are re-runnable and
the output is committed as a static asset so the app itself has no runtime
dependency on those services.

A future version may add a second hazard layer (e.g., NOAA SLOSH storm
surge or Louisiana GOHSEP evacuation-zone data) once a reliable, scriptable
public endpoint is confirmed, and may replace the staging-reference
resources with verified shelter data if a suitable open source is found.
