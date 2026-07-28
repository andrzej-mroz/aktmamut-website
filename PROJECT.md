# AKT Mamut Website Migration

## Purpose

This repository is the migration workspace for AKTMamut.eu.

The project will move from a manually maintained static website to an Astro-based static architecture while preserving the existing public site, data-generation workflows, URLs, and interactive map behavior throughout the transition.

## Current phase

### SPRINT 6 — Legacy Compatibility Layer

Status: **Completed**

`website/old-site/` remains the frozen and authoritative legacy implementation. The synchronization process copies it to the generated `public/legacy/` directory and rewrites supported root-relative local paths only in that generated copy.

Compatibility rewriting covers HTML, CSS, JavaScript, and JSON. A dedicated validator checks required files, unresolved root-relative paths, duplicate `/legacy/legacy/` prefixes, source immutability, exact generated text transformations, and byte identity for every non-text file.

The compatibility layer is temporary and will disappear progressively as legacy routes are migrated to Astro.

No legacy homepage content has been migrated. Leaflet and map logic remain unchanged. The Python data-generation pipeline remains unchanged. Netlify has not yet been configured for the Astro project.

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
│   ├── lib/
│   │   └── legacy-paths.mjs
│   ├── sync-legacy.mjs
│   └── validate-legacy.mjs
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
- `public/legacy/` is generated, path-adjusted for temporary compatibility, ignored by Git, and never authoritative.
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

## Out of scope for Sprint 6

- Migrating or redesigning legacy pages.
- Migrating Leaflet or changing map logic.
- Modifying the Python data pipeline.
- Adding frontend dependencies.
- Configuring Netlify.
- Publishing or deploying the Astro website.
