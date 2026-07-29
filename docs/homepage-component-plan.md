# Homepage Component Plan

## Objective

Rebuild the legacy homepage as static, maintainable Astro composition while preserving its wording, identity, information hierarchy, and working destinations. The live migration-status homepage remains unchanged except for status reporting until Sprint 8.

## Proposed component tree

```text
src/pages/index.astro
└── BaseLayout
    ├── SiteHeader
    ├── main slot
    │   ├── HomeHero
    │   ├── ProjectStatementSection
    │   ├── ProjectModulesSection
    │   ├── FeaturedDirectionsSection
    │   └── AboutProjectSection
    └── SiteFooter
```

`BaseLayout` already owns the document, skip link, header, `<main>`, and footer. Homepage components must not recreate those responsibilities.

No component skeletons are created in Sprint 7. The planned boundaries are clear, but unused placeholder components would add maintenance without validating the final composition.

## Component responsibilities

| Component | Responsibility | Expected props | Content source | Reusable | Scoped styles | Browser JavaScript | Routes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `HomeHero.astro` | Render the hero identity, one H1, two paragraphs, video, and primary actions | `actions: readonly HomepageLink[]`, `video` metadata | Static legacy wording plus `homepageHeroActions` and `homepageHeroVideo` | Homepage-specific | Yes; layout, overlay, video crop, actions, responsive type | Small component-local controller only for pause/resume and reduced motion | Compatibility routes from action data |
| `ProjectStatementSection.astro` | Present the concise project definition immediately after the hero | No data props unless future localization requires them | Static legacy wording | Homepage-specific | Yes; editorial measure and spacing | None | None |
| `ProjectModulesSection.astro` | Render live and planned module cards with correct interactive semantics | `modules: readonly HomepageModule[]` | `homepageModules` | The card pattern may later serve a project index | Yes; grid, cards, status treatment | None | Live destinations use compatibility routes; planned modules have no link |
| `FeaturedDirectionsSection.astro` | Render three deeper editorial entry points without fake thumbnail imagery | `features: readonly HomepageFeature[]` | `homepageFeatures` | Homepage-specific | Yes; responsive editorial cards | None | Compatibility routes |
| `AboutProjectSection.astro` | Render About copy and project metrics | `metrics: readonly HomepageMetric[]` | Static legacy wording plus `homepageMetrics` | Homepage-specific | Yes; copy/metric grid | None | None |
| `SiteFooter.astro` | Continue providing the shared footer; use centralized routes when legacy links are added | Existing API unless a separate small update is required | `routes.ts` and shared site content | Site-wide | Existing scoped styles | None | Centralized routes |

The module and featured cards stay inside their section components initially. A separate card component should be extracted only if a second real consumer appears or the interactive/non-interactive branching becomes difficult to maintain.

## Content and route data flow

```text
src/data/routes.ts
├── current working routes
└── future Astro destinations

src/data/navigation.ts
└── primary navigation built from current routes

src/data/homepage.ts
├── hero actions
├── module cards
├── featured directions
├── project metrics
└── hero video metadata

src/pages/index.astro
└── passes typed arrays into homepage components
```

This prevents the same compatibility paths from being repeated in navigation and homepage data while keeping the model small.

## Static content versus data

The following copy should stay close to its semantic component because it is unique and ordered:

- hero kicker, brand, H1, and two paragraphs;
- project statement;
- section headings and introductions;
- About paragraphs.

The following content is naturally repeated and belongs in typed data:

- hero actions;
- live and planned modules;
- featured directions;
- project metrics;
- current and future route destinations.

No data is imported from generated legacy files.

## Styling ownership

- Components use existing Astro design tokens where they can represent the legacy identity faithfully.
- Layout-specific hero, grid, and card rules remain scoped to their owning components.
- Shared container behavior remains global.
- No legacy stylesheet is copied wholesale.
- The legacy 32 px favicon is not enlarged as section artwork.
- Tablet layouts should consider two columns before stacking to one.

## Client-side behavior

All content and navigation render as static HTML.

The hero video is the only behavior that can justify browser JavaScript:

- expose a visible pause/resume control;
- pause automatically when `prefers-reduced-motion: reduce` matches;
- keep all meaningful content independent of video playback;
- avoid a framework or hydration library;
- use one small component-local script.

Header injection, version labels, counters, sliders, maps, and client-side content loading are excluded.

## Asset plan

- Use the existing stable brand asset at `/assets/brand/M256.webp` through `SiteHeader`.
- Use the byte-identical hero asset at `/assets/home/hero.mp4`.
- Do not copy `M32.webp` for featured cards.
- Do not copy map, challenge, statistics, Python-generated, or unused assets.
- Real featured photography remains deferred.

## Accessibility contract

- Exactly one H1.
- Hero and all sections live inside `<main>`.
- Page language matches the retained English content.
- Internal links open in the same tab.
- Planned modules remain non-interactive.
- Emoji are decorative.
- Focus remains visible.
- Motion has a pause mechanism and reduced-motion behavior.
- Video never contains the only copy of meaningful information.
- Contrast is verified over representative video frames.
- Section headings remain sequential H2/H3.
- Metrics use list semantics.

## SPRINT 8 — Astro Homepage Migration

### Components to create

- `src/components/home/HomeHero.astro`
- `src/components/home/ProjectStatementSection.astro`
- `src/components/home/ProjectModulesSection.astro`
- `src/components/home/FeaturedDirectionsSection.astro`
- `src/components/home/AboutProjectSection.astro`

Update `SiteFooter.astro` only if necessary to preserve the relevant legacy footer links through `routes.ts`.

### Data to use

- `homepageHeroActions`
- `homepageHeroVideo`
- `homepageModules`
- `homepageFeatures`
- `homepageMetrics`
- `routes` and `futureRoutes`

### Assets

- Use `/assets/home/hero.mp4`, copied byte-identically in Sprint 7.
- Reuse the existing brand asset through `SiteHeader`.
- Copy no placeholder thumbnails or map assets.

### Text to preserve

Preserve the exact visible hero, statement, module, featured-direction, About, and metric wording recorded in `docs/homepage-audit.md`. Any editorial rewrite requires a separate explicit content decision.

### Accessibility corrections

- Put the hero inside main.
- Keep one H1 and sequential headings.
- Use the correct page language.
- Remove internal `target="_blank"`.
- Add video pause/resume and reduced-motion handling.
- Retain visible focus.
- Hide decorative emoji and video from duplicate announcement.
- Use semantic lists for modules and metrics.
- Ensure planned modules are not presented as links.
- Verify contrast against the hero overlay.

### Temporary links

- Expeditions → `/legacy/expeditions/index.html`
- Challenges → `/legacy/challenges/list.html`
- Statistics → `/legacy/statistics/index.html`
- Home → `/`

Future route values remain recorded but are not created in Sprint 8.

### Explicit exclusions

- Leaflet and map migration.
- New destination pages.
- Runtime header injection.
- Version badge or global build-version script.
- Counters, sliders, iframe embeds, analytics, and broad JavaScript.
- New dependencies, fonts, image conversion, or video optimization.
- Real featured photography.
- Netlify configuration.

### Acceptance criteria

- The migration-status homepage is replaced only in Sprint 8.
- All five planned homepage components render through `BaseLayout`.
- Exactly one H1 is present.
- All legacy wording is preserved.
- Current compatibility routes resolve.
- Planned modules are clearly non-interactive.
- Homepage works without JavaScript except the isolated video control.
- Disabling JavaScript does not hide content or navigation.
- Reduced-motion users do not receive continuous motion.
- No horizontal overflow at 1440, 1024, 768, or 390 px widths.
- Legacy compatibility pages, maps, and Python pipeline remain unchanged.
- Build and legacy validation succeed.
