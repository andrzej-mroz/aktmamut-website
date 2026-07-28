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
├── src/
├── public/
├── docs/
│   ├── architecture-review.md
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

On Windows systems that block the PowerShell npm wrapper, use `npm.cmd` with the same arguments.

## Current website

`website/old-site/` contains the frozen legacy implementation. It is the migration baseline and must remain behaviorally unchanged until replacement pages have been validated.

The legacy site continues to contain its existing HTML, CSS, JavaScript, generated JSON and GeoJSON, media, Netlify configuration, and supporting files.

## Astro foundation

Astro is initialized in the repository root and uses static output.

`src/` contains the Astro application source. `public/` contains static assets served directly. The current Astro homepage is only a foundation check; no legacy page has been migrated.

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
- `docs/decisions/` contains Architecture Decision Records.

## Repository status

Sprint 3 establishes the Astro foundation only. The legacy website, Leaflet maps, Python pipeline, and Netlify deployment remain unchanged.

