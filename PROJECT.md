# AKT Mamut Website Migration

## Purpose

This repository is the migration workspace for AKTMamut.eu.

The project will move from a manually maintained static website to an Astro-based static architecture while preserving the existing public site, data-generation workflows, URLs, and interactive map behavior throughout the transition.

## Current phase

### SPRINT 4 — Global Layout and Design Foundation

Status: **Completed**

`BaseLayout.astro` is the shared HTML document layout and owns global metadata, the site shell, and the page slot.

Global design tokens and reusable structural classes are defined in `src/styles/global.css`.

`SiteHeader.astro` and `SiteFooter.astro` are temporary migration components. They establish semantic and responsive site structure without copying the legacy implementation.

No legacy page has been migrated. Leaflet and all map functionality remain unchanged. The Python data-generation pipeline remains unchanged. Netlify has not yet been configured for the Astro project.

## Target repository structure

```text
AKT-Mamut-Website/
├── src/
│   ├── components/
│   │   ├── SiteHeader.astro
│   │   └── SiteFooter.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── public/
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
- `public/` contains static assets served directly without build-time processing.
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

## Out of scope for Sprint 4

- Migrating legacy pages or navigation.
- Adding Leaflet or map code.
- Modifying the Python data pipeline.
- Adding frontend frameworks, CSS frameworks, or browser JavaScript.
- Configuring Netlify for Astro.
- Publishing or deploying the Astro website.

