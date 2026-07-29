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
├── public/
│   ├── assets/
│   └── legacy/                  # generated, ignored
├── docs/
│   ├── architecture-review.md
│   ├── homepage-audit.md
│   ├── homepage-component-plan.md
│   ├── manual-audit.md
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

The production Manual is available at `/manual/`. Its source is `src/content/manual/index.md` in the `manual` Content Collection. `src/pages/manual/index.astro` resolves the collection entry and renders it through `src/layouts/ContentLayout.astro`; Markdown-specific presentation is isolated in `src/styles/content.css`.

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

## Astro content

Astro Content Collections provide validated frontmatter and a stable source model for editorial pages. The Manual collection currently validates title, description, language, update date, legacy source path, and an optional eyebrow.

The shared content layout supplies document metadata, semantic structure, controlled measure, and the global site shell. The content stylesheet is scoped to rendered editorial content and covers headings, paragraphs, lists, blockquotes, code blocks, tables, links, and media without affecting the rest of the application.

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
- `docs/manual-audit.md` records the Manual source inventory, content model, semantic adaptations, anchors, accessibility findings, and migration decisions.
- `docs/decisions/` contains Architecture Decision Records.

## Repository status

Sprint 9 migrates the Manual to Markdown and a native `/manual/` Astro route. Expeditions, Challenges, Statistics, and Leaflet maps remain available through the unchanged legacy compatibility layer; the Python pipeline and Netlify deployment remain unchanged.
