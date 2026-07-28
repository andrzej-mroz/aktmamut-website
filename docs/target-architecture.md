# Target Architecture

## Purpose

This document defines the long-term architecture for AKTMamut.eu before the Astro application is introduced.

The migration changes the website presentation layer while preserving the existing Python data-generation pipeline as a separate system boundary.

## System flow

```text
Google Sheets / GPX
          │
          ▼
Python generators
          │
          ▼
JSON / GeoJSON
          │
          ▼
Astro
          │
          ▼
Leaflet
          │
          ▼
Static website
          │
          ▼
GitHub
          │
          ▼
Netlify
```

The flow is one-directional. Source data is transformed into stable JSON and GeoJSON contracts before it reaches the presentation layer.

Astro generates the static website. Leaflet is included only on pages that require interactive maps and operates in the browser against the generated geographic data.

## Architectural responsibilities

### Python

Python owns the data pipeline.

It:

- imports data from Google Sheets, GPX files, and other approved sources;
- validates source data;
- generates JSON;
- generates GeoJSON;
- performs preprocessing and data normalization;
- exposes generated files as the contract consumed by the website.

Python never generates HTML.

The generators do not own page layout, routing, metadata, SEO, navigation, or visual presentation.

### Astro

Astro owns the presentation layer and static site generation.

It is responsible for:

- layouts;
- pages;
- routing;
- metadata;
- SEO;
- Markdown;
- Content Collections;
- static generation;
- composition of generated JSON and GeoJSON into public website experiences.

Astro does not replace the data-import and geographic preprocessing responsibilities of Python.

### Leaflet

Leaflet owns interactive maps only.

It is used where browser interaction is necessary, including map rendering, layers, markers, popups, and map controls.

Leaflet does not own page routing, editorial content, metadata, SEO, or site-wide layout.

Pages without interactive maps should not depend on Leaflet.

### GitHub

GitHub stores and versions the website source, documentation, configuration, and small deployable data files required by the public website.

The full local Python data factory and its source datasets remain outside the repository at the current migration stage.

### Netlify

Netlify owns deployment only.

It publishes the generated static website and applies approved hosting configuration. It does not import source data, preprocess GPX files, generate application content, or replace the Python pipeline.

## Data boundary

JSON and GeoJSON form the boundary between data processing and presentation.

The Python pipeline produces validated deployable data. Astro consumes those outputs without taking ownership of their source acquisition or preprocessing logic.

This boundary allows the data pipeline and website presentation layer to evolve independently through explicit architectural decisions.

## Migration rule

> Replace the presentation layer only.

The Python pipeline remains unchanged unless there is a separate architectural decision documenting the reason, scope, risks, and migration path for that change.

Framework migration must not silently move Python responsibilities into Astro, client-side JavaScript, Netlify, or another deployment service.

## Legacy reference implementation

`website/old-site/` is the frozen reference implementation during migration.

It is used to verify:

- public behavior;
- page content;
- map behavior;
- generated data compatibility;
- route continuity;
- visual and functional parity.

The legacy implementation remains separate from the future Astro source under `src/`.

## Temporary legacy compatibility layer

Until individual routes are migrated, `scripts/sync-legacy.mjs` copies the frozen legacy website from `website/old-site/` to the generated `public/legacy/` directory. Astro development and production build commands run this synchronization automatically.

The generated directory is ignored by Git. It is a deployment compatibility layer, not a second source of truth. The authoritative legacy files remain in `website/old-site/`, and any compatibility issue caused by legacy absolute paths must be addressed through a separate, explicit decision rather than by editing the generated copy.

## Target outcome

The completed architecture will provide:

- a Python-owned data pipeline;
- explicit JSON and GeoJSON contracts;
- an Astro-owned static presentation layer;
- Leaflet limited to interactive maps;
- versioned source in GitHub;
- static deployment through Netlify.
