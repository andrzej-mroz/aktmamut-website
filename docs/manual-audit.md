# Legacy Manual Audit

## Scope

This audit records the frozen Manual implementation and the decisions used to migrate it to a native Astro route backed by Markdown.

Authoritative source:

`website/old-site/manual/index.html`

Audit date: 2026-07-29.

## Source files inspected

| Source | Role |
| --- | --- |
| `website/old-site/manual/index.html` | Complete document, content, metadata, inline styles, favicon and external font reference |
| `website/old-site/assets/img/M32.webp` | Legacy favicon referenced by the Manual |
| `src/layouts/BaseLayout.astro` | Shared Astro document, metadata, landmarks, Header and Footer |
| `src/styles/global.css` | Existing design tokens, focus treatment, container and global defaults |
| `src/data/routes.ts` | Active compatibility and future route definitions |
| `src/data/navigation.ts` | Production primary navigation |
| `astro.config.mjs` | Static output and Markdown rendering configuration |

The Manual directory contains only `index.html`. It has no separate CSS, JavaScript, images, iframe, embedded application, generated data, or page-specific asset.

## Implementation summary

- Language: Polish (`lang="pl"`), correctly matching the visible content.
- Document title: `AKT MAMUT – Manual`.
- Visible title: `🧭 AKT MAMUT – Manual: EXPEDITIONS + CHALLENGES`.
- Metadata: charset and viewport only; no meta description.
- Styling: one inline `<style>` block.
- Typography: external Google Fonts for Oswald and Roboto Mono.
- Favicon: `/assets/img/M32.webp`, incorrectly declared as `image/png`.
- Browser JavaScript: none.
- Body links: none.
- IDs and same-page anchors: none.
- Images: none.
- Tables: none semantically; the CONFIG table is plain text inside `<pre>`.

## Content inventory

The legacy document contains one H1 and twelve H2 sections.

| Order | Legacy heading | Content |
| ---: | --- | --- |
| 1 | Struktura projektu | Project directory tree and the `data` versus `site` responsibility rule |
| 2 | Krok 1 – Locus Map | Recording, naming, elevation update, GPX export and local path |
| 3 | Krok 2 – GPX Track Editor | GPX filtering, cleanup, saving and local path |
| 4 | Krok 3 – Wikiloc | Upload/download workflow and final GPX path |
| 5 | Krok 4 – Google Sheets: AKT Mamut Expeditions | Spreadsheet fields required for an expedition |
| 6 | Krok 5 – Pipeline EXPEDITIONS | Command, eight processing stages, output files, locations and two-stage map loading |
| 7 | Krok 6 – Test lokalny strony | Local server command, localhost URL and absolute-path warning |
| 8 | Krok 7 – Publikacja EXPEDITIONS | Source Control workflow and production URL |
| 9 | Krok 8 – CHALLENGES: dane i konfiguracja | CONFIG structure, example rows, column meanings and configuration rule |
| 10 | Krok 9 – Pipeline CHALLENGES | Generator command, five processing stages, output files and inactive-challenge note |
| 11 | Krok 10 – Podgląd CHALLENGES | Region query parameters and production examples |
| 12 | Szybkie komendy | Installation, Expeditions, Challenges and local-preview commands |

Supporting content:

- introductory workflow sentence;
- six unordered lists with 28 list items;
- nineteen preformatted blocks;
- thirty-one inline code elements;
- eight bold fragments;
- instruction version `2026-03-10`.

## Heading hierarchy

### Legacy

1. H1 — `AKT MAMUT – Manual: EXPEDITIONS + CHALLENGES`
2. Twelve sibling H2 sections in workflow order

The heading depth is logically valid. Emojis are visual decoration and do not convey unique information.

### Migrated

1. H1 — `Manual: EXPEDITIONS + CHALLENGES`
2. Twelve sibling H2 sections in the same order

`AKT MAMUT` moves to an eyebrow above the H1. Decorative heading emojis are removed. This prevents repeated brand text in the heading while preserving every substantive label.

## Lists, tables, code and emphasis

| Legacy representation | Migration decision |
| --- | --- |
| Six `<ul>` elements | Preserve as Markdown unordered lists |
| Numbered pipeline stages written inside `<pre>` | Adapt to semantic ordered lists |
| CONFIG rows written as a pipe-formatted `<pre>` block | Adapt to a semantic Markdown table with headers |
| Commands, paths, URLs and the project tree in `<pre>` | Preserve as fenced code blocks |
| Inline `<code>` | Preserve as Markdown inline code |
| `<b>` | Preserve as Markdown strong emphasis |
| `.good` and `.note` visual boxes | Adapt to semantic blockquotes with textual labels where present |

No content is converted into operational data. JSON, GeoJSON and Python remain outside the collection.

## Links and destinations

The legacy article contains no `<a>` elements.

| Text or resource | Classification | Decision |
| --- | --- | --- |
| `/assets/img/M32.webp` | Legacy asset reference | Remove from article; shared `BaseLayout` owns favicons |
| Google Fonts stylesheet | External resource | Remove; use existing system typography |
| `wikiloc.com` | Instructional hostname in inline code | Preserve as code, not invent a new external-link policy |
| `http://localhost:8000` | Local development address | Preserve as code |
| `https://aktmamut.eu` | Production address | Preserve as code |
| Challenge example URLs | Instructional examples | Preserve as code |
| Header Expeditions | Legacy compatibility route | `/legacy/expeditions/index.html` |
| Header Challenges | Legacy compatibility route | `/legacy/challenges/list.html` |
| Header Statistics | Legacy compatibility route | `/legacy/statistics/index.html` |
| Header Manual | Native Astro route | `/manual/` |
| Frozen Manual reference | Transitional legacy route | `/legacy/manual/index.html` |

The Markdown body deliberately contains no new links. The shared Header supplies current project navigation. There are no empty links, `javascript:` URLs, new-tab targets, legacy source paths or `/legacy/legacy/` destinations.

## Anchor plan

The legacy page has no IDs and therefore no existing deep-link contract.

The migrated Manual introduces explicit, stable anchors:

| Section | New anchor |
| --- | --- |
| Struktura projektu | `#struktura-projektu` |
| Krok 1 – Locus Map | `#krok-1-locus-map` |
| Krok 2 – GPX Track Editor | `#krok-2-gpx-track-editor` |
| Krok 3 – Wikiloc | `#krok-3-wikiloc` |
| Krok 4 – Google Sheets | `#krok-4-google-sheets-expeditions` |
| Krok 5 – Pipeline EXPEDITIONS | `#krok-5-pipeline-expeditions` |
| Krok 6 – Test lokalny | `#krok-6-test-lokalny` |
| Krok 7 – Publikacja EXPEDITIONS | `#krok-7-publikacja-expeditions` |
| Krok 8 – CHALLENGES configuration | `#krok-8-challenges-konfiguracja` |
| Krok 9 – Pipeline CHALLENGES | `#krok-9-pipeline-challenges` |
| Krok 10 – Podgląd CHALLENGES | `#krok-10-podglad-challenges` |
| Szybkie komendy | `#szybkie-komendy` |

No compatibility anchors are required because the legacy document exposes none.

## Assets

| Asset | Purpose | Decision |
| --- | --- | --- |
| `M32.webp` | Legacy favicon | Remove from Manual implementation; shared Astro favicon remains authoritative |
| Google Fonts: Oswald and Roboto Mono | Legacy typography | Remove; no external font dependency |

No Manual-specific image or downloadable asset needs to be copied.

## JavaScript behavior

The legacy Manual contains no browser-side JavaScript.

The migrated Manual also requires none:

- Markdown is rendered at build time;
- navigation is static;
- anchors are native;
- tables and code use CSS-only responsive overflow.

## Accessibility findings

| Finding | Classification | Migration response |
| --- | --- | --- |
| No semantic header, main or footer landmarks | Adapt | Use `BaseLayout` |
| Content sections are generic `.step` divs | Adapt | Render semantic headings and article flow |
| CONFIG data is visually table-like but not a table | Adapt | Use a Markdown table with header cells |
| Pipeline stages are visually numbered text | Adapt | Use ordered lists |
| Notes are generic divs | Adapt | Use semantic blockquotes |
| No skip link | Adapt | Reuse the shared skip link |
| No meta description | Adapt | Add validated description frontmatter |
| External fonts | Remove | Use existing system font stack |
| Favicon MIME mismatch | Remove | Use shared Astro favicon declarations |
| Decorative emojis announced as heading text | Remove | Remove decorative heading emojis |
| Empty links, duplicate IDs, image alt issues, iframe titles | Not applicable | None exist |

## Responsive behavior

The legacy page has no media queries.

Existing behavior:

- `body` uses a maximum width of 980 px;
- content contracts fluidly below that width;
- preformatted content wraps because of `white-space: pre-wrap`;
- H1 remains fixed at 34 px;
- no structured table exists;
- page spacing is fixed rather than fluid.

Migration corrections:

- constrain prose to 50 rem for reading;
- use fluid page and heading spacing;
- allow code blocks and tables to scroll locally;
- wrap long links and inline code safely;
- preserve normal document height;
- use no fixed-height content areas;
- keep page-level horizontal overflow at zero.
- disable syntax highlighting because the Manual contains operational text and
  shell snippets that use the shared neutral code treatment; this also avoids
  generated inline theme colors overriding accessible prose contrast.

## Content classification

### Preserve

- all substantive Polish text;
- all twelve sections and their order;
- every instruction and example;
- project tree;
- paths, commands and URLs;
- warnings and rules;
- terminology and emphasis;
- version date `2026-03-10`.

### Adapt

- brand/title composition;
- numbered processes into ordered lists;
- CONFIG content into a semantic table;
- visual notes into blockquotes;
- visual cards into normal article sections;
- explicit stable section IDs;
- metadata and shared landmarks;
- responsive prose treatment.

### Remove

- inline legacy CSS;
- Google Fonts;
- legacy favicon declaration;
- decorative heading emojis;
- `.step`, `.good`, `.note`, `.small` and `.footer` layout wrappers.

### Defer

- canonical metadata and deployment redirect;
- Open Graph, JSON-LD and other shared SEO metadata;
- updating legacy workflow instructions to the new repository architecture;
- migration of Expeditions, Challenges, Statistics and Leaflet.

The legacy instructions are preserved as historical operational content. Correcting outdated workflow facts would require a separate content decision.

## Markdown architecture decision

The Manual uses an Astro Content Collection:

```text
src/content/manual/index.md
src/content.config.ts
src/pages/manual/index.astro
```

Reasons:

- manuals and guides are expected to grow beyond one document;
- frontmatter receives build-time schema validation;
- metadata is typed when queried;
- Markdown stays separate from routing and presentation;
- `ContentLayout.astro` can serve future editorial pages;
- Astro 7.1.4 supports the Content Layer API through `glob()`, `getEntry()` and `render()`.

A broad CMS abstraction is not introduced.

## Content schema

| Field | Type | Purpose |
| --- | --- | --- |
| `title` | string | Visible H1 and document title input |
| `description` | string | Meta description |
| `lang` | string, minimum length 2 | Document language |
| `updated` | coerced Date | Established instruction version date |
| `legacyPath` | string | Transitional frozen reference path |
| `eyebrow` | optional string | Brand context separated from the H1 |

The schema contains no styling, route-generation, operational or geographic data.

## Canonical and compatibility status

- Canonical current application route: `/manual/`
- Frozen transitional comparison route: `/legacy/manual/index.html`
- No redirect is introduced in the generated legacy copy.
- A deployment-level redirect can be considered with later Netlify configuration.
