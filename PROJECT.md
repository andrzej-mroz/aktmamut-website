# AKT Mamut Website

## Vision

AKT Mamut is a long-term digital platform dedicated to mountain expeditions, geographic exploration and outdoor knowledge, with a primary focus on the Carpathians.

The platform combines:

- expedition records,
- geographic challenges,
- interactive maps,
- statistics,
- editorial content,
- technical documentation.

The website is designed as a static platform with a separate data-generation pipeline.

## Architecture

Responsibilities are intentionally separated:

### Python

- imports source data,
- validates records,
- generates JSON and GeoJSON,
- prepares data for publication.

### Astro

- renders pages,
- manages layouts and routing,
- presents editorial and geographic content,
- produces the static website build.

### Leaflet

- provides interactive maps,
- displays expeditions and challenge locations,
- handles map interaction in the browser.

### Netlify

- publishes the generated static website.

## Current Status

The Astro website is the production implementation.

Available routes:

```text
/
├── expeditions/
├── challenges/
├── statistics/
└── manual/
```

Implemented modules:

- Homepage
- Expeditions
- Challenges
- Statistics
- Manual
- Shared navigation
- Desktop presentation
- Mobile and Field UI
- Leaflet maps
- Python data generators
- Statistics dataset validation
- Netlify deployment

The production build currently generates 21 static pages.

## Data Pipeline

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
```

Generated production data is stored under:

```text
public/expeditions/
public/challenges/data/
```

Local source data, credentials and intermediate processing files remain outside Git.

## Repository Structure

```text
AKT-Mamut-Website/
├── data/       Python generators and local data factory
├── docs/       Architecture and maintenance documentation
├── public/     Static assets and generated JSON / GeoJSON
├── scripts/    Validation and audit tools
├── src/        Astro application
├── AGENTS.md
├── PROJECT.md
├── README.md
└── package.json
```

## Development Principles

- Keep Python responsible for data generation.
- Keep Astro responsible for presentation.
- Use Leaflet for interactive maps.
- Prefer static generation over runtime processing.
- Preserve stable public routes.
- Keep architecture simple and explicit.
- Avoid unnecessary dependencies.
- Test production builds before committing.
- Do not commit credentials or local source data.
- Do not rewrite repository history without explicit approval.

## Validation

Statistics dataset audit:

```powershell
npm run audit:statistics
```

Statistics contract validation:

```powershell
npm run validate:statistics-contract
```

Production build:

```powershell
npm run build
```

## Current Priorities

- Maintain reliable data-generation workflows.
- Improve documentation for Expeditions and Challenges.
- Improve mobile and Field UI presentation.
- Review accessibility.
- Optimize map and asset performance.
- Evaluate offline support when it provides practical value.
