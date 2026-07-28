# AKT Mamut Website

Repository foundation for the incremental migration of AKTMamut.eu.

## Repository structure

```text
AKT-Mamut-Website/
├── PROJECT.md
├── README.md
├── docs/
│   ├── architecture-review.md
│   ├── migration-strategy.md
│   └── decisions/
│       └── 0001-astro-migration.md
├── website/
│   ├── old-site/
│   └── astro/
├── assets/
└── data/
```

Additional preserved project files may remain at the repository root where moving them would change their role or behavior.

## Current website

`website/old-site/` contains the existing static website. It is the migration baseline and must remain behaviorally unchanged until replacement pages have been validated.

The legacy site continues to contain its existing HTML, CSS, JavaScript, generated JSON and GeoJSON, media, Netlify configuration, and supporting files.

## Future Astro website

`website/astro/` is reserved for a future sprint. Astro has not been initialized in this repository foundation sprint.

## Data factory

`data/` contains the existing Python-based data workflow. It includes local source data and generated outputs used by the website.

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
- `docs/decisions/` contains Architecture Decision Records.

## Repository status

Sprint 1 prepares the repository for its first commit. It does not create that commit and does not publish or deploy the website.

