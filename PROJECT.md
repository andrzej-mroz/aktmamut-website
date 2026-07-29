# AKT Mamut Website Migration

## Purpose

This repository is the migration workspace for AKTMamut.eu.

The project will move from a manually maintained static website to an Astro-based static architecture while preserving the existing public site, data-generation workflows, URLs, and interactive map behavior throughout the transition.

## Current phase

### SPRINT 7 — Legacy Homepage Audit and Content Model

Status: **Completed**

The frozen legacy homepage has been audited without changing its implementation. Its content hierarchy, routes, assets, JavaScript behavior, metadata, accessibility risks, and responsive behavior are recorded in `docs/homepage-audit.md`.

The next Astro homepage is specified in `docs/homepage-component-plan.md`. Reusable editorial data now lives in `src/data/homepage.ts`, and route ownership is centralized in `src/data/routes.ts`. The production Astro homepage remains the migration status page; no legacy homepage section or Leaflet behavior has been migrated yet.

The approved legacy hero video is copied byte-for-byte to `public/assets/home/hero.mp4` so Sprint 8 can use a stable public path without coupling the Astro application to the frozen source tree.

The Python data-generation pipeline, legacy pages, map code, and Netlify configuration remain unchanged.

## Target repository structure

```text
AKT-Mamut-Website/
├── src/
│   ├── components/
│   │   ├── SiteHeader.astro
│   │   └── SiteFooter.astro
│   ├── data/
│   │   ├── homepage.ts
│   │   ├── navigation.ts
│   │   └── routes.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── scripts/
│   ├── lib/
│   │   └── legacy-paths.mjs
│   ├── sync-legacy.mjs
│   └── validate-legacy.mjs
├── public/
│   ├── assets/
│   │   ├── brand/
│   │   │   └── M256.webp
│   │   └── home/
│   │       └── hero.mp4
│   └── legacy/                  # generated, ignored
├── data/
├── docs/
│   ├── homepage-audit.md
│   └── homepage-component-plan.md
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
- `src/data/routes.ts` owns current compatibility destinations and future canonical routes.
- `src/data/homepage.ts` contains typed editorial homepage data, not presentation markup.
- `public/assets/` contains approved static assets required directly by Astro pages.
- `public/legacy/` is generated, path-adjusted for temporary compatibility, ignored by Git, and never authoritative.
- `data/` contains the local Python data-generation pipeline. Its full contents remain outside Git, while Python remains responsible for producing the JSON and GeoJSON consumed by the website.
- `docs/` records architecture, migration strategy, audits, component plans, and engineering decisions.
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

## Out of scope for Sprint 7

- Implementing the audited homepage in Astro.
- Creating homepage component skeletons.
- Migrating or redesigning legacy routes.
- Migrating Leaflet or changing map logic.
- Modifying the Python data pipeline.
- Adding frontend dependencies.
- Configuring Netlify.
- Publishing or deploying the Astro website.
