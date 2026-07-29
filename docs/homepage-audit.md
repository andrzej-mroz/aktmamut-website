# Legacy Homepage Audit

## Scope and baseline

This audit describes the frozen homepage in `website/old-site/` as the reference for a maintainable Astro migration. It records meaning, content, assets, routes, runtime behavior, accessibility risks, and responsive behavior without changing the legacy source or replacing the live Astro migration-status homepage.

Audit date: 2026-07-29.

## Implementation inventory

| File | Role | Migration relevance |
| --- | --- | --- |
| `website/old-site/index.html` | Complete homepage markup, metadata, visible content, footer, asset and script references | Primary source of truth |
| `website/old-site/assets/css/home.css` | Active homepage layout, hero, cards, grids, motion, and responsive rules | Translate selectively into scoped Astro styles |
| `website/old-site/assets/css/shared.css` | Active tokens, container, header, footer, and responsive header rules | Visual reference; the Astro design foundation already replaces it |
| `website/old-site/assets/css/version-label.css` | Fixed build-version badge | Do not migrate |
| `website/old-site/assets/js/header.js` | Fetches and injects the shared header and navigation | Already replaced by static Astro rendering |
| `website/old-site/assets/js/app-version.js` | Publishes a cache/version string on `window` | Do not migrate to the homepage |
| `website/old-site/assets/js/version-label.js` | Inserts the visible version badge | Do not migrate |
| `website/old-site/assets/components/header.html` | Legacy brand/header fragment | Already represented by `SiteHeader.astro` |
| `website/old-site/styles.css` | Older combined stylesheet containing header, homepage, footer, and commented alternatives | Not linked by the current homepage; retain only as historical evidence |

There are no homepage iframes, sliders, counters, map embeds, or section-level content fetches. The `<video>` element uses native browser playback. The header and version badge are the only DOM content inserted by JavaScript.

## Top-to-bottom section inventory

| Section | Purpose and content | Heading hierarchy | Assets | Links | JavaScript | Responsive behavior | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Shared header | Brand mark, `AKT MAMUT` wordmark, primary navigation | No heading | `M256.webp`, Google Fonts | Home, Expeditions, Challenges, Statistics | Required only by legacy runtime injection | One row on wide screens; wrapping enabled below 820 px; brand scales below 768/640 px | **Adapt** — keep the existing Astro `SiteHeader`; do not migrate injection |
| Hero | Establishes identity, history, primary message, two primary actions | One `h1`: “The Carpathian World” | `video.mp4`; text overlays | Expeditions, Challenges | No script; native autoplay/muted/loop video | Minimum available viewport height; video uses `object-fit: cover`; actions wrap and stack on mobile | **Preserve + Adapt** — preserve all wording and identity; add accessible motion control and reduced-motion behavior |
| Project statement | Concise explanation of the project as a growing Carpathian archive | `h2`: “Built from routes, peaks and mountain knowledge.” | None | None | None | Fixed editorial width; padding reduces indirectly through available width | **Preserve** |
| Explore the project | Hub of three live and three planned modules | `h2` plus six `h3` card titles | Unicode emoji | Expeditions, Challenges, Statistics | None | Three columns above 980 px, one column at or below 980 px | **Preserve + Adapt** — retain wording and planned/live distinction; render from typed data |
| Featured directions | Secondary editorial descriptions of Expeditions, Challenges, and Statistics | `h2` plus three `h3` titles | Repeated `M32.webp` decorative background | Expeditions, Challenges, Statistics | None | Three columns above 980 px, one column below | **Adapt** — retain editorial copy; remove the enlarged favicon placeholder and use honest decorative treatment until real photography exists |
| About the project | Defines personal project scope and its evidence base | `h2`: “About the project” | None | None | None | Two columns above 980 px, stacked below | **Preserve** |
| Project metrics | Four hard-coded summary values | No headings; values use `strong` | None | None | None | Two columns normally; one column below 640 px | **Adapt** — render as a semantic list from typed data and verify values when content changes |
| Footer | Copyright/inception mark and repeated module links | No heading | None | Expeditions, Challenges, Statistics | None | Flex row with wrapping | **Adapt** — use the shared Astro footer and centralized routes |
| Version label | Fixed `v20260621210643` development/build indicator | None | None | None | Inserted by `version-label.js` | Repositioned and reduced below 640 px | **Remove** — internal implementation detail, not public content |

No visible content section is removed merely because of its age. Removal is limited to the development version badge and the misleading repeated 32 px placeholder artwork.

## Content hierarchy

### Existing hierarchy

- Site identity: logo and `AKT MAMUT` wordmark in the header, repeated as a hero eyebrow.
- Primary message: `h1` “The Carpathian World”.
- Introductory content: two hero paragraphs and the project statement.
- Calls to action: Expeditions and Challenges in the hero.
- Expedition, challenge, and statistical content: live module cards and featured-direction cards.
- Manual content: not present and not linked from the homepage.
- Supporting imagery: full-screen hero video; repeated favicon background on featured cards.
- Secondary information: About copy and four project metrics.
- Footer: inception/copyright mark and repeated module links.

### Heading outline

The legacy outline contains one `h1`, four `h2` headings, and nine `h3` card headings. Heading levels are sequential and should be preserved:

1. `h1` — The Carpathian World
2. `h2` — Built from routes, peaks and mountain knowledge.
3. `h2` — Explore the project
   - six `h3` module titles
4. `h2` — Featured directions
   - three `h3` featured titles
5. `h2` — About the project

### Proposed semantic corrections

- Move the hero inside the page `<main>`; it currently appears before `<main>`.
- Keep the site name as brand text, not an extra page heading.
- Represent project metrics as a list or description list rather than headings.
- Keep planned modules non-interactive until destinations exist.
- Treat module emoji as decorative (`aria-hidden="true"`) because adjacent headings provide the meaning.
- Preserve the hero brand repetition as a restrained eyebrow, not a second heading.

The live-module and featured-direction cards repeat destinations, but their roles differ: the module grid describes the system, while featured directions provide deeper editorial framing. Preserve both in Sprint 8, then evaluate consolidation only through a later content decision.

No meaningful text exists only inside an image. The brand mark contains an “M”, but the visible wordmark is adjacent. The hero video contains no required text.

## Asset inventory

| Classification | Source | Type and dimensions | Approximate size | Purpose | Required decision | Proposed Astro destination | Alternative text | Copy unchanged |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Brand | `website/old-site/assets/img/M256.webp` | WebP, 256 × 256 | 11,410 B / 11.1 KiB | Header mark | Required, already stable | `public/assets/brand/M256.webp` | Mark should be decorative inside the labelled brand link | Already copied in Sprint 5 |
| Hero | `website/old-site/assets/video/video.mp4` | H.264 MP4, 1920 × 1080, 14.3143 s | 10,143,264 B / 9.67 MiB | Full-bleed hero motion | Preserve with accessibility and performance safeguards | `public/assets/home/hero.mp4` | No text alternative; treat as decorative and preserve all message in HTML | Yes, byte-identical copy approved |
| Icon / favicon | `website/old-site/assets/img/M32.webp` | WebP, 32 × 32 | 754 B | Legacy favicon | Not needed by Astro homepage | Existing Astro favicon remains authoritative | Not applicable | No |
| Decorative | `website/old-site/assets/img/M32.webp` | WebP, 32 × 32 enlarged into 16:10 panels | 754 B | Placeholder background for all featured cards | Remove this usage; it conveys no unique information and is severely upscaled | None | Not applicable | No |
| Icon | Inline Unicode emoji | Text glyphs | Not applicable | Distinguishes module cards | Preserve as decorative symbols | Stored in `src/data/homepage.ts` | Hide from assistive technology | No file |
| External | Google Fonts: Oswald and Inter | Remote CSS/font resources | Network-dependent | Legacy typography | Do not add as a homepage asset in Sprint 7; existing Astro typography remains the baseline | None | Not applicable | No |

### Asset copy decision

Only the approved hero video is copied in this sprint. It is directly required by the planned hero, independent of Python and map data, and safe to preserve unchanged. It is not integrated into the live homepage yet. Source and destination SHA-256 must match.

No map assets, generated data, unused legacy images, external fonts, or placeholder thumbnails are copied.

## Link inventory

The fully composed legacy homepage contains 15 internal links: four in the injected header and eleven links with `target="_blank"` in the page body and footer.

| Destination | Locations | Legacy destination | Working compatibility destination | Future Astro destination | Current classification |
| --- | --- | --- | --- | --- | --- |
| Home | Header brand and Home navigation | `/index.html` | `/legacy/index.html` | `/` | Astro route already migrated |
| Expeditions | Header, hero, module card, featured card, footer | `/expeditions` | `/legacy/expeditions/index.html` | `/expeditions/` | Functioning compatibility route |
| Challenges | Header, hero, module card, featured card, footer | `/challenges/list.html` | `/legacy/challenges/list.html` | `/challenges/` | Functioning compatibility route |
| Statistics | Header, module card, featured card, footer | `/statistics` | `/legacy/statistics/index.html` | `/statistics/` | Functioning compatibility route |
| Manual | Not linked from homepage | Not applicable | `/legacy/manual/index.html` | `/manual/` | Functioning compatibility route, out of homepage navigation |
| Modules anchor | Section exposes `id="modules"` but no link targets it | `#modules` is unused | Not applicable | Retain an ID only if a real in-page link needs it | Unused anchor target |

There are no external anchor links and no missing destinations. The Google Fonts stylesheet is an external resource, not a user-facing link.

### Link corrections for migration

- Internal links should not open new tabs; remove all eleven `target="_blank"` attributes.
- Use centralized current compatibility routes from `src/data/routes.ts`.
- Record future Astro routes in the content model without creating them in Sprint 7.
- Keep planned modules non-clickable until real routes exist.

## JavaScript and dynamic behavior

| Behavior | Legacy implementation | Classification | Astro migration decision |
| --- | --- | --- | --- |
| Header injection | `header.js` fetches a fragment, uses `innerHTML`, then inserts navigation | Provided by Astro static rendering | Do not migrate; `SiteHeader.astro` already owns it |
| Build version value | `app-version.js` writes `window.APP_VERSION` | Obsolete for homepage runtime | Do not migrate |
| Visible version badge | `version-label.js` appends a fixed badge | Obsolete | Do not migrate |
| Hero video playback | Native autoplay, muted, loop, playsinline | Required only if motion is retained | Isolate in `HomeHero`; provide pause/resume and respect reduced motion |
| Hero zoom | Infinite CSS keyframe animation | Optional | Preserve only with `prefers-reduced-motion` handling |
| Smooth scrolling | Global CSS `scroll-behavior: smooth` | Optional | Do not add unless a real anchor interaction requires it; respect reduced motion |
| Module/feature navigation | Native links | Required | Render as static Astro HTML |
| Metrics | Hard-coded HTML | Provided by Astro static rendering | Render from typed data; no counter script |
| Maps, sliders, counters, content loading, iframes | Not present on homepage | Not applicable | Do not introduce |

The future Astro homepage needs no general client-side framework. The only justified browser script is a small component-local controller if the background video retains autoplay and needs an accessible pause/resume control.

## Metadata audit

- Document language is `pl`, while almost all homepage content is English.
- Title is only `AKT MAMUT`.
- Charset and viewport are present.
- No meta description is present.
- No canonical, Open Graph, or structured data is present.
- The favicon declares `type="image/png"` while the file is WebP.

Sprint 8 should set a language matching the retained content, use `BaseLayout` metadata, and keep favicon handling centralized. Broader social and structured metadata remain separate decisions.

## Accessibility risks

| Finding | Classification | Required migration response |
| --- | --- | --- |
| Hero is outside `<main>` | Must fix during migration | Place all homepage content, including hero, in the `BaseLayout` main slot |
| `lang="pl"` conflicts with English content | Must fix during migration | Use the correct page language or translate the content |
| Header requires JavaScript before it exists | Already fixed | Continue using static `SiteHeader.astro` |
| Navigation lacks an explicit accessible label and list structure | Already fixed in Astro header | Do not copy legacy markup |
| Logo alt duplicates the labelled brand link and visible wordmark | Must fix during migration | Use an empty alt for the decorative mark inside the named brand link |
| Autoplaying video and infinite zoom have no pause control or reduced-motion handling | Must fix during migration | Add a visible pause/resume control and disable motion for reduced-motion users |
| Video has no poster or explicit dimensions in markup | Should fix later / during implementation if possible | Set dimensions and stable fallback background; decide separately whether a poster is needed |
| Focus states are not explicitly designed; CSS defines hover only | Must fix during migration | Preserve the Astro global focus ring on every link and video control |
| Eleven internal links open new tabs without warning | Must fix during migration | Remove `target="_blank"` |
| Planned-module meta text uses low-contrast `#9ca3af` on white | Must fix during migration | Use an existing accessible muted token and verify contrast |
| Hero contrast depends on changing video imagery | Must fix during migration | Retain a sufficiently strong overlay and test representative frames |
| Emoji may be announced redundantly | Must fix during migration | Mark decorative symbols as hidden from assistive technology |
| No skip link in legacy homepage | Already fixed by `BaseLayout` | Preserve it |
| Duplicate IDs | Not applicable | Browser audit found none |
| Empty links | Not applicable | None found |
| Clickable non-interactive elements | Not applicable | Planned cards are correctly non-clickable |
| Iframe titles | Not applicable | Homepage contains no iframe |
| Text embedded only in images | Not applicable | None found |

## Responsive audit

The generated `/legacy/index.html` was inspected in a browser with all compatibility rewrites active.

| Requested viewport | Observed layout | Hero/header | Risks and migration response |
| --- | --- | --- | --- |
| 1440 × 900 | Module and featured grids: 3 columns; About: 2 columns; metrics: 2 columns | Header 77 px; hero 824 px; H1 70.4 px; actions in one row | Preserve generous hero and readable line length; no overflow |
| 1024 × 768 | Still 3-column module/featured grids because the content viewport remains above the 980 px breakpoint; About and metrics remain 2 columns | Header 77 px; hero 692 px; H1 51.2 px | Three cards become relatively narrow and navigation has little right margin; consider an intermediate 2-column breakpoint |
| 768 × 1024 | Modules, featured, and About stack to one column; metrics remain 2 columns | Header 65 px; hero 960 px; actions one row | Page grows to about 5925 px; a 2-column tablet grid would reduce excessive length |
| 390 × 844 | All sections and metrics stack; hero actions stack; navigation remains fully visible | Header 79 px; hero 780 px; H1 about 42.9 px; actions 110 px high | Hero extends about 15 px beyond the first viewport because CSS subtracts a 64 px token while the wrapped header is 79 px; use layout flow rather than a mismatched fixed token |

Across all four sizes:

- no horizontal overflow was observed;
- no content was hidden;
- video retained `object-fit: cover`;
- all navigation links remained visible;
- browser console produced no errors.

### Responsive behaviors to preserve

- Full-width hero with controlled text measure.
- Responsive type scaling.
- Wrapping or stacking actions.
- Single-column mobile content.
- No horizontal overflow.
- Video crop through `object-fit: cover`.

### Responsive behaviors to correct

- Add an intermediate two-column layout for cards on tablets where appropriate.
- Derive hero size from normal layout flow and actual header composition.
- Preserve comfortable touch targets; legacy navigation text is only about 17 px high on mobile.
- Reduce the very long single-column page rhythm with deliberate spacing and grouping.
- Respect reduced motion and avoid continuous zoom where users opt out.

## Final classification

- **Preserve:** wording, single H1, statement, module inventory, featured editorial copy, About copy, metrics, identity, working destinations.
- **Adapt:** semantic landmarks, centralized routes, card rendering, metrics semantics, shared footer, accessible motion, focus, contrast, responsive grid progression.
- **Defer:** future module destinations, real featured photography, map-page migrations, final poster/optimization decision for the hero video.
- **Remove:** runtime header injection, runtime version label, obsolete homepage version global, unlinked legacy `styles.css` from the migrated bundle, and repeated enlarged `M32.webp` featured placeholders.
