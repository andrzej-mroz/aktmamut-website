# AKT Mamut Website

Repository foundation for the incremental migration of AKTMamut.eu.

## Repository structure

```text
AKT-Mamut-Website/
├── PROJECT.md
├── README.md
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

Google Sheets and GPX source data are processed by the existing Python generators into JSON and GeoJSON. The future Astro application will consume those generated files, build the static website, and use Leaflet only for interactive maps. GitHub versions the deployable project, while Netlify is responsible only for deployment.

The governing migration rule is: **Replace the presentation layer only.**

See [Target Architecture](docs/target-architecture.md) for system boundaries and long-term responsibilities.

## Current website

`website/old-site/` contains the frozen legacy implementation. It is the migration baseline and must remain behaviorally unchanged until replacement pages have been validated.

The legacy site continues to contain its existing HTML, CSS, JavaScript, generated JSON and GeoJSON, media, Netlify configuration, and supporting files.

## Future Astro website

`src/` is reserved for the future Astro application source. `public/` is reserved for static assets served directly.

Astro has not been initialized or installed yet.

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

- `PROJECT.md` defines project scope and migration principles.
- `docs/architecture-review.md` records the current-state assessment.
- `docs/migration-strategy.md` describes the incremental migration sequence.
- `docs/target-architecture.md` defines the long-term system boundaries and responsibilities.
- `docs/decisions/` contains Architecture Decision Records.

## Repository status

The repository structure is aligned with the future Astro root, but Astro has not been initialized. The legacy website remains frozen under `website/old-site/`.

