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
│   ├── audit-statistics-data.mjs
│   ├── sync-legacy.mjs
│   ├── validate-legacy.mjs
│   └── validate-statistics-contract.mjs
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
├── public/
│   ├── assets/
│   └── legacy/                  # generated, ignored
├── docs/
│   ├── architecture-review.md
│   ├── homepage-audit.md
│   ├── homepage-component-plan.md
│   ├── manual-audit.md
│   ├── migration-strategy.md
│   ├── statistics-audit.md
│   ├── statistics-data-contract.md
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

Audit the complete legacy Statistics dataset:

```powershell
npm.cmd run audit:statistics
```

Validate whether the legacy source can produce the proposed Statistics contract:

```powershell
npm.cmd run validate:statistics-contract
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

`npm run dev` and `npm run build` execute synchronization and legacy validation automatically before Astro starts. The preparatory Statistics audit and contract validation are intentionally separate commands and do not block normal development yet.

`public/legacy/` is generated from `website/old-site/`, rewritten only for temporary path compatibility, and intentionally ignored by Git.

On Windows systems that block the PowerShell npm wrapper, use `npm.cmd` with the same arguments.

## Current website

The production homepage is rendered by Astro from `src/pages/index.astro`, focused components in `src/components/home/`, and typed content in `src/data/homepage.ts`.

The production Manual is available at `/manual/`. Its source is `src/content/manual/index.md` in the `manual` Content Collection. `src/pages/manual/index.astro` resolves the collection entry and renders it through `src/layouts/ContentLayout.astro`; Markdown-specific presentation is isolated in `src/styles/content.css`.

Statistics remains available through `/legacy/statistics/index.html`. Sprint 10 defines its proposed normalized TypeScript contract and validates the existing source but does not create a native Astro Statistics page.

`website/old-site/` contains the frozen legacy implementation. It remains the migration baseline for routes that have not yet moved to Astro.

During migration, unmigrated navigation destinations are served from the generated `/legacy/` compatibility path. The authoritative legacy source remains only in `website/old-site/`.

## Statistics contract

The Statistics audit found that the legacy browser downloads the complete 13.7 MB Expeditions GeoJSON but consumes only `nr`, `date`, `name`, and `got`.

The selected future architecture is a dedicated normalized `statistics.json` generated and validated by Python, then loaded statically by Astro. `src/data/statistics.types.ts` defines the proposed presentation contract. The audit and validator are read-only prototypes; they do not modify source data or generate a production artifact.

See:

- [Statistics Audit](docs/statistics-audit.md)
- [Statistics Data Contract](docs/statistics-data-contract.md)

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
- `docs/statistics-audit.md` records the complete legacy Statistics runtime, data inventory, calculations, semantics, responsiveness, and migration classification.
- `docs/statistics-data-contract.md` defines the selected data architecture, version 1 contract, ownership boundaries, and Sprint 11 scope.
- `docs/decisions/` contains Architecture Decision Records.

## Repository status

Sprint 10 defines and validates the proposed Statistics data boundary while keeping the live Statistics page on the unchanged legacy route. The Python pipeline, GeoJSON, Leaflet modules, homepage, Manual, and Netlify deployment remain unchanged.
