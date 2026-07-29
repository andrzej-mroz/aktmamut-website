# AKT Mamut Website Migration

## Purpose

This repository is the migration workspace for AKTMamut.eu.

The project is moving from a manually maintained static website to an Astro-based static architecture while preserving the existing public site, data-generation workflows, URLs, and interactive map behavior throughout the transition.

## Current phase

### SPRINT 11 — Restore AKT Mamut Legacy Typography

Status: **Completed**

The original AKT Mamut typography has been restored across the native Astro shell, homepage and Manual. The audited system uses Inter for body and interface text, Oswald for brand and headings, and Roboto Mono for technical content.

Typography is treated as a functional design dependency. The legacy Expeditions map places four-digit numeric identifiers inside fixed 24 px markers, and Oswald's compact proportional digits preserve that established geometry. The numeric-width audit and implementation mapping are recorded in `docs/typography-audit.md`; ADR 0002 preserves the decision and explicitly separates AKT Mamut typography from the CS3C design system.

Native pages load only the required Inter, Oswald and Roboto Mono weights through the shared `BaseLayout.astro`. Semantic font tokens and robust system fallbacks are centralized in `src/styles/global.css`.

No map component or Statistics page was migrated. The frozen legacy source, Python pipeline, GeoJSON, Leaflet implementation, dependencies and Netlify configuration are unchanged.

## Target repository structure

```text
AKT-Mamut-Website/
├── src/
│   ├── components/
│   │   ├── home/
│   │   ├── SiteHeader.astro
│   │   └── SiteFooter.astro
│   ├── content/
│   │   └── manual/
│   │       └── index.md
│   ├── content.config.ts
│   ├── data/
│   │   ├── homepage.ts
│   │   ├── navigation.ts
│   │   ├── routes.ts
│   │   └── statistics.types.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ContentLayout.astro
│   ├── pages/
│   │   ├── manual/
│   │   │   └── index.astro
│   │   └── index.astro
│   └── styles/
│       ├── content.css
│       └── global.css
├── scripts/
│   ├── lib/
│   │   └── legacy-paths.mjs
│   ├── audit-statistics-data.mjs
│   ├── sync-legacy.mjs
│   ├── validate-legacy.mjs
│   └── validate-statistics-contract.mjs
├── public/
│   ├── assets/
│   └── legacy/                  # generated, ignored
├── data/
├── docs/
│   ├── homepage-audit.md
│   ├── homepage-component-plan.md
│   ├── manual-audit.md
│   ├── statistics-audit.md
│   ├── statistics-data-contract.md
│   ├── typography-audit.md
│   └── decisions/
│       ├── 0001-astro-migration.md
│       └── 0002-akt-mamut-typography.md
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
- `src/content/` contains authored Markdown managed through Astro Content Collections.
- `src/data/statistics.types.ts` defines only the proposed normalized Statistics contract and does not power the live page.
- `scripts/audit-statistics-data.mjs` and `scripts/validate-statistics-contract.mjs` inspect the legacy GeoJSON without modifying it.
- `src/data/routes.ts` owns current compatibility destinations and canonical future routes.
- `public/assets/` contains approved static assets required directly by Astro pages.
- `public/legacy/` is generated, path-adjusted for temporary compatibility, ignored by Git, and never authoritative.
- `data/` contains the local Python data-generation pipeline. Its full contents remain outside Git, while Python remains responsible for producing the JSON and GeoJSON consumed by the website.
- `docs/` records architecture, migration strategy, audits, contracts, component plans, and engineering decisions.
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

## Out of scope for Sprint 11

- Migrating map-marker or Leaflet components.
- Creating an Astro `/statistics/` page.
- Changing the Python data-generation pipeline.
- Modifying Expeditions GeoJSON or other geographic data.
- Downloading, redistributing or committing font binaries.
- Adding font packages or frontend dependencies.
- Reusing CS3C typography or design-system assumptions.
- Redesigning page content, spacing or color.
- Configuring Netlify or deploying the website.
