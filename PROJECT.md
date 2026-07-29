# AKT Mamut Website Migration

## Purpose

This repository is the migration workspace for AKTMamut.eu.

The project is moving from a manually maintained static website to an Astro-based static architecture while preserving the existing public site, data-generation workflows, URLs, and interactive map behavior throughout the transition.

## Current phase

### SPRINT 9 — Migrate the Manual to Astro Markdown

Status: **Completed**

The production Manual is now a native Astro route at `/manual/`. Its authoritative content is stored as Markdown in the `manual` Content Collection, rendered through the shared `ContentLayout.astro`, and styled by the scoped editorial rules in `src/styles/content.css`.

The migration preserves all substantive legacy Manual content while improving document semantics: one H1, twelve H2 sections with stable anchors, native lists, a semantic configuration table, readable code blocks, and accessible responsive behavior. The primary navigation now points directly to `/manual/`.

The original Manual remains unchanged at `website/old-site/manual/index.html` and continues to be available in the generated compatibility site at `/legacy/manual/index.html`.

Expeditions, Challenges, and Statistics remain compatibility routes below `/legacy/`. Leaflet and all map behavior remain in the frozen legacy implementation. The Python data-generation pipeline and Netlify configuration remain unchanged.

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
│   │   └── routes.ts
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
│   ├── sync-legacy.mjs
│   └── validate-legacy.mjs
├── public/
│   ├── assets/
│   └── legacy/                  # generated, ignored
├── data/
├── docs/
│   ├── homepage-audit.md
│   ├── homepage-component-plan.md
│   └── manual-audit.md
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
- `src/content.config.ts` defines collection loaders and metadata validation.
- `src/layouts/ContentLayout.astro` owns the shared editorial document frame, while `src/styles/content.css` styles rendered Markdown content.
- `src/data/routes.ts` owns current compatibility destinations and canonical Astro routes.
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

## Out of scope for Sprint 9

- Migrating Expeditions, Challenges, or Statistics to Astro.
- Migrating Leaflet or changing map logic.
- Modifying the Python data pipeline.
- Adding frontend dependencies or external fonts.
- Changing the legacy Manual source.
- Configuring Netlify.
- Publishing or deploying the Astro website.
