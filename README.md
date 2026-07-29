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

The production homepage is rendered by Astro from `src/pages/index.astro`, focused components in `src/components/home/`, and typed content in `src/data/homepage.ts`.

`website/old-site/` contains the frozen legacy implementation. It remains the migration baseline for routes that have not yet moved to Astro.

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

## Astro homepage

`src/layouts/BaseLayout.astro` provides the shared document structure, production Header, main landmark, and Footer. `src/styles/global.css` defines the global design tokens and reusable container and section classes.

The homepage preserves the approved legacy wording and section hierarchy while using responsive, semantic Astro components. Repeated modules, featured directions, actions, metrics, video metadata, and routes come from typed centralized data.

The local Hero video includes a visible pause/resume control. That control and reduced-motion handling are the homepage's only browser-side JavaScript.

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
- `docs/homepage-component-plan.md` defines the implemented Astro homepage composition and its original Sprint 8 scope.
- `docs/decisions/` contains Architecture Decision Records.

## Repository status

Sprint 8 replaces the temporary migration-status page with the production Astro homepage. Destination pages and Leaflet maps remain available through the unchanged legacy compatibility layer; the Python pipeline and Netlify deployment remain unchanged.
