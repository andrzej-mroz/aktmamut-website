# AKT Mamut Website Migration

## Purpose

This repository is the migration workspace for AKTMamut.eu.

The project will move from a manually maintained static website to an Astro-based static architecture while preserving the existing public site, data-generation workflows, URLs, and interactive map behavior throughout the transition.

## Current phase

Sprint 2 aligns the repository with the standard Astro project layout before Astro is installed.

No website code has been migrated, redesigned, or modified in this phase.

## Target repository structure

```text
AKT-Mamut-Website/
├── src/
├── public/
├── data/
├── docs/
├── assets/
├── website/
│   └── old-site/
├── README.md
├── PROJECT.md
└── .gitignore
```

## Architectural boundaries

- `website/old-site/` is the frozen legacy implementation and permanent reference during migration.
- `src/` will become the Astro application source directory.
- `public/` will contain static assets served directly without build-time processing.
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

## Out of scope for Sprint 2

- Initializing or installing Astro.
- Creating Astro configuration or package files.
- Modifying the legacy website.
- Redesigning pages.
- Changing Netlify configuration.
- Refactoring data generators.
- Publishing or deploying changes.

