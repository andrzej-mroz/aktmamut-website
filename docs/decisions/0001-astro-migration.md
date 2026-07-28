# ADR 0001 — Adopt Astro for the AKT Mamut website migration

- Status: Accepted
- Date: 2026-07-28

## Context

AKTMamut.eu is currently a manually maintained static website with vanilla JavaScript, Leaflet maps, and a local Python data-generation pipeline.

The present architecture is operational, but shared layouts, metadata, content, cache invalidation, and route generation require repeated manual work. Large geographic datasets and statistics are also processed in the browser.

The website is predominantly static, while only selected map and filtering experiences require client-side JavaScript.

## Decision

Adopt Astro as the target static-site architecture.

The migration will be incremental:

- retain the current website as the reference implementation;
- retain Python as the initial data-generation layer;
- retain Leaflet as the initial interactive map engine;
- migrate static shells and editorial content before maps;
- use static rendering by default;
- add client-side JavaScript only where interaction requires it.

## Rationale

Astro matches the project because it provides reusable layouts, static route generation, structured content, centralized metadata, and selective client-side interactivity while continuing to support static Netlify deployment.

This decision avoids coupling the site migration to an immediate rewrite of working map and data logic.

## Consequences

### Positive

- Shared navigation and layouts can be rendered statically.
- Metadata and sitemap behavior can be centralized.
- Editorial content can move to Markdown and schema-validated collections.
- Page-level JavaScript can be reduced.
- Existing data assets and vanilla JavaScript can be integrated incrementally.

### Trade-offs

- The repository temporarily contains both legacy and Astro sites.
- Behavior parity must be tested across two architectures.
- Astro does not automatically reduce GeoJSON size or map-processing cost.
- Deployment and URL ownership must be managed carefully during cutover.

## Alternatives considered

### Continue with manual static HTML

Rejected as the long-term target because page structure, metadata, navigation, and content would continue to scale through duplication and runtime composition.

### Adopt a client-heavy single-page application

Rejected because most pages are static and do not benefit from shipping an application runtime.

### Rewrite maps and data generation before migrating pages

Rejected because it combines multiple high-risk changes and delays improvements to the static content architecture.

