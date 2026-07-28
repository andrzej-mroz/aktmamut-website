# AKT Mamut Astro Migration Strategy

## Objective

Migrate AKTMamut.eu to an Astro-based static architecture without interrupting the current website, changing public behavior prematurely, or coupling framework migration to a complete map and data rewrite.

## Guiding constraints

- The current site remains the reference implementation until replacement routes are verified.
- Existing URLs must be preserved or redirected explicitly.
- Python remains the data-generation layer during the initial migration.
- Leaflet remains the map engine during the initial map migration.
- Editorial content and operational geographic data use separate models.
- Each phase must be independently reviewable and reversible.

## Phase 1 — Repository and architecture

- Establish one migration repository.
- Preserve the current site under `website/old-site/`.
- Reserve `website/astro/` for the new static application.
- Record architecture decisions and data boundaries.
- Inventory public routes, query states, dependencies, and deployment behavior.

Exit condition: the current site is preserved unchanged and the repository is ready for an Astro foundation sprint.

## Phase 2 — Shared shell and static pages

- Establish the document layout and shared site shell.
- Migrate the homepage and manuals.
- Render navigation statically.
- Centralize metadata, canonical policy, robots, and sitemap behavior.
- Preserve existing styling initially unless a separate design decision authorizes change.

Exit condition: low-risk content pages have functional and visual parity.

## Phase 3 — Content and data contracts

- Move suitable editorial content to Markdown or Content Collections.
- Define schemas for challenge, expedition, and page metadata.
- Make Python generators produce data rather than modify HTML.
- Introduce stable identifiers and static detail routes where appropriate.

Exit condition: content generation and page rendering are cleanly separated.

## Phase 4 — Maps and statistics

- Migrate Leaflet initialization as an isolated client-side capability.
- Preserve existing map behavior before optimization.
- Precompute statistics.
- Evaluate splitting initial marker data from detailed route geometry.
- Reduce page-specific and overlapping external dependencies.

Exit condition: interactive routes meet behavior, accessibility, and performance baselines.

## Phase 5 — Remaining interfaces and cutover

- Decide the future of the iframe-based application shell.
- Complete remaining route migrations.
- Validate redirects, metadata, sitemap coverage, and structured data.
- Test responsive layouts and map behavior.
- Deploy through a preview environment with a rollback plan.
- Retire legacy runtime composition and cache-version tooling only after parity is confirmed.

Exit condition: Astro is the primary public architecture and the legacy site is retained only as an archive or rollback reference.

## Success measures

- No unintended URL regressions.
- No loss of generated data.
- Static pages require no unnecessary client JavaScript.
- Navigation and metadata are present in initial HTML.
- Map behavior remains equivalent or improves.
- Initial geographic payload decreases over time.
- Credentials and local working data remain outside version control.

