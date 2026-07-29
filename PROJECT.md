# AKT Mamut Website Migration

## Purpose

This repository is the migration workspace for AKTMamut.eu.

The project will move from a manually maintained static website to an Astro-based static architecture while preserving the existing public site, data-generation workflows, URLs, and interactive map behavior throughout the transition.

## Current phase

### SPRINT 8 — Astro Homepage Migration

Status: **Completed**

The production homepage is now rendered by Astro through five focused homepage components composed by `src/pages/index.astro`. Repeated editorial content is supplied by the typed model in `src/data/homepage.ts`, and every working destination is supplied through the centralized compatibility routes.

The migration preserves the legacy homepage wording, section order, video-based identity, module inventory, featured directions, About copy, and metrics. Semantic landmarks, heading structure, link behavior, responsive grids, planned-module semantics, focus visibility, video controls, and reduced-motion handling have been corrected.

The Hero uses the local, approved asset at `public/assets/home/hero.mp4`. The only homepage browser-side JavaScript controls background-video playback and respects the user's reduced-motion preference.

Expeditions, Challenges, Statistics, and Manual remain compatibility routes below `/legacy/`. Leaflet and all map behavior remain in the frozen legacy implementation. The Python data-generation pipeline and Netlify configuration remain unchanged.

## Target repository structure

```text
AKT-Mamut-Website/
├── src/
│   ├── components/
│   │   ├── home/
│   │   │   ├── AboutProjectSection.astro
│   │   │   ├── FeaturedDirectionsSection.astro
│   │   │   ├── HomeHero.astro
│   │   │   ├── ProjectModulesSection.astro
│   │   │   └── ProjectStatementSection.astro
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
- `src/components/home/` owns homepage-specific semantic sections and scoped styles.
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

## Out of scope for Sprint 8

- Migrating Expeditions, Challenges, Statistics, or Manual to Astro.
- Migrating Leaflet or changing map logic.
- Modifying the Python data pipeline.
- Adding frontend dependencies or external fonts.
- Adding new homepage claims, modules, metrics, or destination links.
- Configuring Netlify.
- Publishing or deploying the Astro website.
