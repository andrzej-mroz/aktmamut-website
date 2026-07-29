# AKT Mamut Website Migration

## Purpose

This repository is the migration workspace for AKTMamut.eu.

The project is moving from a manually maintained static website to an Astro-based static architecture while preserving the existing public site, data-generation workflows, URLs, and interactive map behavior throughout the transition.

## Current phase

### SPRINT 10 — Statistics Audit and Data Contract

Status: **Completed**

The legacy Statistics module and its complete 524-feature Expeditions GeoJSON source have been audited. The audit identifies the runtime sequence, four source properties actually consumed by Statistics, browser-side calculations, table behavior, accessibility limitations, responsive behavior, and coupling to the map-oriented GeoJSON.

The proposed target contract is defined in `src/data/statistics.types.ts`. Deterministic, read-only Node scripts audit the complete source dataset and verify that all current records can be normalized without missing fields, invalid values, or duplicate identifiers.

The selected long-term architecture is a dedicated `statistics.json` generated and validated by Python, then consumed statically by Astro. This sprint defines that boundary only: no Python generator, Astro Statistics page, Leaflet migration, or runtime routing change has been implemented.

Statistics remains live at `/legacy/statistics/index.html` and remains marked as unmigrated. The frozen legacy source, GeoJSON, Python pipeline, Leaflet implementation, Manual, homepage, and Netlify configuration are unchanged.

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
│   └── statistics-data-contract.md
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

## Out of scope for Sprint 10

- Creating an Astro `/statistics/` page.
- Changing the live Statistics route or migrated navigation state.
- Writing the production Python Statistics generator.
- Generating or committing `statistics.json`.
- Modifying Expeditions GeoJSON or other geographic data.
- Migrating Leaflet or changing map logic.
- Adding charting or frontend dependencies.
- Configuring Netlify.
- Publishing or deploying the Astro website.
