# AKT Mamut Website Migration

## Purpose

This repository is the migration workspace for AKTMamut.eu.

The project will move from a manually maintained static website to an Astro-based static architecture while preserving the existing public site, data-generation workflows, URLs, and interactive map behavior throughout the transition.

## Current phase

Sprint 1 establishes the repository foundation only.

No website code has been migrated, redesigned, or modified in this phase.

## Architectural boundaries

- `website/old-site/` contains the current production website unchanged.
- `website/astro/` is reserved for the future Astro application.
- `data/` contains the existing local data factory, generators, GPX files, generated datasets, backups, and local working data.
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

## Out of scope for Sprint 1

- Creating the Astro project.
- Modifying the current website.
- Redesigning pages.
- Changing Netlify configuration.
- Refactoring data generators.
- Publishing or deploying changes.

