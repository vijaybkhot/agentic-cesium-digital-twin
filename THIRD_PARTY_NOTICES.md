# Third-Party Notices and Data Attribution

This document identifies third-party software, services, data, and model assets
used by the Urban Digital Twin Interoperability research prototype. A project
license applies only to material for which the project contributors or another
authorized rights holder can grant that license. It does not replace the terms
that apply to the third-party materials described below.

Source attribution describes provenance; it does not imply that OpenStreetMap,
FEMA, USGS, Cesium, Esri, Khronos, or any other provider endorses this project
or its research interpretations.

## Public data and generated research artifacts

The browser reads committed GeoJSON produced by offline Node scripts. Raw
responses are kept under the ignored `scripts/.cache/` directory and are not
distributed by the repository.

### OpenStreetMap and Overpass API

OpenStreetMap data is © OpenStreetMap contributors and is available under the
[Open Data Commons Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/).
See the official [OpenStreetMap copyright and attribution page](https://www.openstreetmap.org/copyright).
The [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) is used to
retrieve selected OpenStreetMap features; it is the query interface, not a
separate owner of the underlying map data.

OpenStreetMap-derived geometry appears in:

| Distributed artifact | OpenStreetMap-derived content | Processing path |
| --- | --- | --- |
| `public/data/urban-resilience/grand_isle_port_fourchon_properties.geojson` | Building ways and tags in the Grand Isle and Port Fourchon study windows | `fetchUrbanResilienceSourceData.mjs` → `buildUrbanResiliencePropertyData.mjs` |
| `public/data/urban-resilience/grand_isle_port_fourchon_response.geojson` | LA Highway 1 way coordinates used by the illustrative response corridor | `fetchUrbanResilienceSourceData.mjs` → `buildUrbanResiliencePropertyData.mjs` |
| `public/data/urban-resilience/experiments/la1_fema_intersections.geojson` | Original LA-1 way LineStrings and road tags | `fetchUrbanResilienceSourceData.mjs` → `buildUrbanResilienceLa1FemaExperiment.mjs` |
| `public/data/urban-resilience/experiments/community_public_safety_facilities.geojson` | Reviewed facility nodes, ways, identities, and tags | `fetchUrbanResilienceFacilitySourceData.mjs` → `buildUrbanResilienceFacilityExperiment.mjs` |
| `public/data/urban-resilience/experiments/grand_isle_ground_elevation_sample.geojson` | OSM identities and representative coordinates retained for the sampled entities | Existing property/facility artifacts → elevation sample scripts |

The generated artifacts include project-created identifiers, processing
metadata, research classifications, or relationships in addition to the source
geometry. OpenStreetMap coverage can be incomplete. Building footprints are
not legal parcel boundaries, and the absence of a mapped feature does not prove
that the feature is absent in the real world.

### FEMA National Flood Hazard Layer

Flood-zone geometry and attributes come from the Federal Emergency Management
Agency's [National Flood Hazard Layer (NFHL)](https://www.fema.gov/flood-maps/national-flood-hazard-layer),
queried through the public NFHL ArcGIS REST service at:

```text
https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query
```

FEMA-derived information appears in:

| Distributed artifact | FEMA-derived content | Project processing |
| --- | --- | --- |
| `public/data/urban-resilience/grand_isle_port_fourchon_flood_zones.geojson` | Selected NFHL polygon geometry and zone attributes | Normalization and research display fields |
| `public/data/urban-resilience/grand_isle_port_fourchon_properties.geojson` | Zone associated with each sampled building location | Zone-based Low/Moderate/High/Unknown research classification |
| `public/data/urban-resilience/experiments/la1_fema_intersections.geojson` | Mapped relationship between available NFHL polygons and original LA-1 ways | Conservative overlap/coverage status |
| `public/data/urban-resilience/experiments/community_public_safety_facilities.geojson` | Mapped relationship between available NFHL polygons and facility geometry | Conservative overlap/coverage status |

These project-derived relationships are not official FEMA determinations. NFHL
polygons do not represent current floodwater, forecast inundation, road
conditions, evacuation guidance, or a project-generated hydraulic model. This
notice records FEMA as the source without asserting that FEMA data is covered
by the project's software license.

### USGS 3D Elevation Program

The file
`public/data/urban-resilience/experiments/grand_isle_ground_elevation_sample.geojson`
contains a 16-entity research sample retrieved through the U.S. Geological
Survey [3D Elevation Program (3DEP)](https://www.usgs.gov/3d-elevation-program)
[Elevation Point Query Service](https://epqs.nationalmap.gov/v1/json).

The acquisition and processing path is:

```text
fetchUrbanResilienceElevationSample.mjs
  → ignored raw EPQS cache
  → buildUrbanResilienceElevationSample.mjs
  → validateUrbanResilienceElevationSample.mjs
  → committed local GeoJSON
```

Values are estimated/interpolated ground elevations at representative
coordinates. They are not flood depths, building heights, floor or
finished-floor elevations, structural elevations, FEMA Base Flood Elevations,
site surveys, vulnerability assessments, safety findings, or current/future
inundation. This notice records USGS provenance without assigning a project
software license to the source measurements.

### Project-created fictional and contextual data

`public/examples/disaster_resilience_properties.geojson` contains fictional
property geometry and mock attributes created for the disaster-resilience
demonstration. It is not OpenStreetMap parcel data, private-address data,
validated HEC-RAS output, or live emergency information.

`public/data/urban-resilience/grand_isle_port_fourchon_response.geojson` also
contains project-created staging-reference features and illustrative route
status text. These references are not official shelters, emergency resources,
or live road conditions.

## Bundled model asset

### Cesium Milk Truck

`public/models/CesiumMilkTruck.glb` is distributed as a mock reconstruction
placeholder. It comes from the Khronos Group glTF Sample Assets collection and
is credited there as:

```text
© 2017 Cesium — Creative Commons Attribution 4.0 International
Cesium for Everything
```

- [Cesium Milk Truck source entry](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CesiumMilkTruck)
- [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)

The model is a testing asset, not a reconstruction generated by this project.
The model may include Cesium name or logo elements subject to their respective
trademark treatment.

Local Stanford Bunny test files described in the PLY conversion notes are
ignored and are **not** distributed by this repository:

```text
public/models/bun_zipper.ply
public/models/local-bun-zipper.glb
```

## Direct software dependencies

Installed dependencies retain their upstream copyright and license notices.
The table below summarizes their role; it does not replace the license files
distributed with the packages or their authoritative upstream terms.

| Software | Role in this repository | Upstream license or terms |
| --- | --- | --- |
| [CesiumJS](https://github.com/CesiumGS/cesium) | Primary 3D geospatial viewer | Apache-2.0; see the installed Cesium package notices |
| [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest/) | Isolated visualization-portability experiment | Esri product-specific terms and the Esri Master License Agreement; it is not relicensed by this project |
| [React](https://github.com/facebook/react) and React DOM | User-interface framework and browser renderer | MIT |
| [exifr](https://github.com/MikeKovarik/exifr) | Browser-side image metadata inspection | MIT |
| [Vite](https://github.com/vitejs/vite) | Development server and production build tooling | MIT |
| [TypeScript](https://github.com/microsoft/TypeScript) | Static type checking | Apache-2.0 |
| [vite-plugin-static-copy](https://github.com/sapphi-red/vite-plugin-static-copy) | Copies Cesium runtime assets into the Vite build | MIT |

The ArcGIS experiment retains the SDK's default on-map attribution display.
See Esri's [ArcGIS Maps SDK licensing and attribution guidance](https://developers.arcgis.com/javascript/latest/licensing/).

## Optional external imagery, terrain, and 3D context

The following services are optional and remain governed by their providers'
current terms:

- Cesium ion, Cesium World Imagery, and Cesium OSM Buildings;
- ArcGIS basemap styles and ArcGIS World Elevation;
- OpenStreetMap fallback basemap content used by the ArcGIS experiment.

Cesium and ArcGIS display their provider/data credits in their on-map
attribution controls when the corresponding services are active. Users supply
their own restricted credentials through ignored local environment files. No
Cesium ion token or ArcGIS API key is distributed with this repository.

External imagery, terrain, and 3D buildings provide visual context only. They
are not project-derived hazard evidence, property records, elevation samples,
or emergency information.

## Names, marks, and no endorsement

Third-party names, logos, and marks remain the property of their respective
owners. References to OpenStreetMap, FEMA, USGS, Cesium, Esri/ArcGIS, Khronos,
React, Vite, and other providers identify sources or interoperable software and
do not imply sponsorship, certification, or endorsement of this research
prototype.
