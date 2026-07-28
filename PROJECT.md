# AKT Mamut Website Migration

## Purpose

This repository is the migration workspace for AKTMamut.eu.

The project will move from a manually maintained static website to an Astro-based static architecture while preserving the existing public site, data-generation workflows, URLs, and interactive map behavior throughout the transition.

## Current phase

### SPRINT 5 — Legacy Header and Navigation Migration

Status: **Completed**

The production-oriented header is now rendered statically by Astro. Its typed navigation configuration is centralized in `src/data/navigation.ts`, and `BaseLayout.astro` supplies the current route for accessible active-page state.

Routes that have not yet been migrated point to the preserved legacy website under `/legacy/`. `website/old-site/` remains the frozen and authoritative legacy implementation. `scripts/sync-legacy.mjs` generates `public/legacy/` before development and production builds, and the generated directory is ignored by Git.

No legacy homepage content has been migrated. Leaflet and all map functionality remain unchanged. The Python data-generation pipeline remains unchanged. Netlify has not yet been configured for the Astro project.

## Target repository structure

```text
AKT-Mamut-Website/
├── src/
│   ├── components/
│   │   ├── SiteHeader.astro
│   │   └── SiteFooter.astro
│   ├── data/
│   │   └── navigation.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── scripts/
│   └── sync-legacy.mjs
├── public/
│   ├── assets/
│   │   └── brand/
│   │       └── M256.webp
│   └── legacy/                  # generated, ignored
├── data/
├── docs/
├── assets/
├── website/
│   └── old-site/
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
├── PROJECT.md
└── .gitignore
```

## Architectural boundaries

- `website/old-site/` is the frozen legacy implementation and permanent reference during migration.
- `src/` is the Astro application source directory.
- `public/` contains static assets served directly without build-time processing. `public/legacy/` is a generated compatibility copy and is not tracked.
- `data/` contains the local Python data-generation pipeline. Its full contents remain outside Git, while Python remains responsible for producing the JSON and GeoJSON consumed by the website.
- `docs/` records architecture, migration strategy, and engineering decisions.
- `assets/` is reserved for shared migration and brand assets.

## Migration principles

1. Preserve public behavior before improving it.
2. Keep the existing site available until replacement routes are verified.
3. Separate editorial content, generated data, and interactive presentation.
4. Keep Python as the data-generation layer unless a later decision explicitly changes that boundary.
5. Migrate static pages before interactive maps.
6. Avoid changing URLs without redirects and a documented SEO decision.
7. Do not commit credentials, private keys, tokens, or files from `data/creds/`.
8. Use small, reviewable migration increments.

## Out of scope for Sprint 5

- Migrating the legacy homepage or destination pages.
- Migrating Leaflet or map code.
- Modifying the Python data pipeline.
- Adding frontend frameworks, CSS frameworks, or browser JavaScript.
- Configuring Netlify for Astro.
- Publishing or deploying the Astro website.
