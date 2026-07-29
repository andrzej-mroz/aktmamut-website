# AKT Mamut Website

Repository for the incremental migration of AKTMamut.eu to Astro.

## Repository structure

```text
AKT-Mamut-Website/
├── PROJECT.md
├── README.md
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
├── scripts/
│   ├── lib/
│   │   └── legacy-paths.mjs
│   ├── sync-legacy.mjs
│   └── validate-legacy.mjs
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
├── public/
│   ├── assets/
│   │   ├── brand/
│   │   │   └── M256.webp
│   │   └── home/
│   │       └── hero.mp4
│   └── legacy/                  # generated, ignored
├── docs/
│   ├── architecture-review.md
│   ├── homepage-audit.md
│   ├── homepage-component-plan.md
│   ├── migration-strategy.md
│   ├── target-architecture.md
│   └── decisions/
│       └── 0001-astro-migration.md
├── website/
│   └── old-site/
├── assets/
└── data/
```

Additional preserved project files may remain at the repository root where moving them would change their role or behavior.

## Architecture overview

Google Sheets and GPX source data are processed by the existing Python generators into JSON and GeoJSON. Astro consumes those generated files and builds the static website, while Leaflet is reserved only for interactive maps. GitHub versions the deployable project, and Netlify will be responsible only for deployment.

The governing migration rule is: **Replace the presentation layer only.**

See [Target Architecture](docs/target-architecture.md) for system boundaries and long-term responsibilities.

## Local development

Install dependencies:

```powershell
npm install
```

Generate the temporary legacy compatibility site:

```powershell
npm.cmd run sync:legacy
```

Validate the generated compatibility site:

```powershell
npm.cmd run validate:legacy
```

Start the development server:

```powershell
npm run dev
```

Create the production build:

```powershell
npm run build
```

Preview the production build:

```powershell
npm run preview
```

`npm run dev` and `npm run build` execute synchronization and validation automatically before Astro starts. `public/legacy/` is generated from `website/old-site/`, rewritten only for temporary path compatibility, and intentionally ignored by Git.

On Windows systems that block the PowerShell npm wrapper, use `npm.cmd` with the same arguments.

## Current website

`website/old-site/` contains the frozen legacy implementation. It is the migration baseline and must remain behaviorally unchanged until replacement pages have been validated.

The legacy site continues to contain its existing HTML, CSS, JavaScript, generated JSON and GeoJSON, media, Netlify configuration, and supporting files.

During migration, unmigrated navigation destinations are served from the generated `/legacy/` compatibility path. The authoritative legacy source remains only in `website/old-site/`.

## Legacy compatibility

During synchronization, supported root-relative paths in generated HTML, CSS, JavaScript, and JSON are prefixed with `/legacy/`. Exact directory routes are converted to their real `index.html` files so they work consistently in Astro development and production preview.

The validator confirms:

- representative pages and assets exist;
- generated files match the source structure;
- root-relative local paths have been resolved;
- `/legacy/legacy/` was not produced;
- text differs only through approved path rewriting;
- all non-text files remain byte-identical;
- the authoritative legacy source remains equal to its synchronization manifest.

This compatibility layer is temporary and will be removed route by route as Astro migration progresses.

## Astro foundation

Astro is initialized in the repository root and uses static output.

`src/layouts/BaseLayout.astro` provides the shared document structure. `src/styles/global.css` defines the global design tokens and reusable container and section classes. The production-oriented Astro header is rendered statically and reads route configuration shared through `src/data/routes.ts`.

The legacy homepage audit and the planned Astro component architecture are documented, and its reusable editorial content has a typed model in `src/data/homepage.ts`. The Astro homepage remains a migration status page; no audited homepage section has been implemented yet.

## Data factory

`data/` contains the existing local Python-based data workflow. It remains responsible for importing, validating, preprocessing, and generating the JSON and GeoJSON consumed by the website.

The full local data factory is intentionally excluded from Git. Only `data/README.md` is tracked.

Local credentials are intentionally excluded from Git. Never stage or commit:

- `data/creds/`
- `.env` files
- private keys
- service-account credentials
- access tokens

## Documentation

- `PROJECT.md` defines project scope and migration status.
- `docs/architecture-review.md` records the current-state assessment.
- `docs/migration-strategy.md` describes the incremental migration sequence.
- `docs/target-architecture.md` defines the long-term system boundaries and responsibilities.
- `docs/homepage-audit.md` records the legacy homepage content, behavior, risks, and migration decisions.
- `docs/homepage-component-plan.md` defines the Astro component and data-flow plan for Sprint 8.
- `docs/decisions/` contains Architecture Decision Records.

## Repository status

Sprint 7 completes the legacy homepage audit and content model while leaving the production Astro homepage as a migration status page. The legacy compatibility layer remains active, and the actual homepage, Leaflet maps, Python pipeline, and Netlify deployment remain unchanged.
