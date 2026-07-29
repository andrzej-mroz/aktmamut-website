# AKT Mamut Typography Audit

## Scope

This audit identifies the actual legacy typography and defines how it should be restored across native Astro pages without modifying the frozen legacy implementation.

Files inspected:

- `website/old-site/index.html`
- `website/old-site/styles.css`
- `website/old-site/assets/css/shared.css`
- `website/old-site/assets/css/home.css`
- `website/old-site/assets/css/statistics.css`
- `website/old-site/assets/css/statistics-scroll.css`
- `website/old-site/assets/css/challenges.css`
- `website/old-site/assets/components/header.html`
- `website/old-site/expeditions/index.html`
- `website/old-site/expeditions/expeditions.css`
- `website/old-site/expeditions/expeditions.js`
- `website/old-site/expeditions/markers.js`
- `website/old-site/expeditions/markers.json`
- `website/old-site/challenges/index.html`
- `website/old-site/challenges/list.html`
- `website/old-site/challenges/manual.html`
- `website/old-site/manual/index.html`
- all native Astro layouts, shared components, homepage components, and stylesheets

The repository contains no `.woff`, `.woff2`, `.ttf`, `.otf`, or `.eot` font files.

## Identified typography system

AKT Mamut does not use one font everywhere. Its legacy system has three functional layers.

| Role | Legacy family | Primary use |
| --- | --- | --- |
| Body | `Inter, Arial, sans-serif` | paragraphs, navigation, buttons, general interface |
| Heading and brand | `Oswald, sans-serif` | brand text, Hero, section titles, compact headings |
| Map marker | `Oswald, sans-serif` | 24 px marker labels, tooltips and map popups |
| Monospace | `"Roboto Mono", monospace` | Statistics table and legacy Manual |
| Code fallback in Challenges | `Consolas, "Courier New", monospace` | code samples |

The dominant brand face is Oswald. Inter remains the primary reading and interface face. Roboto Mono is a separate functional face for dense numeric and technical content.

## Font sources

The legacy site loads fonts remotely from Google Fonts.

Observed requests include:

- Oswald 400, 500 and 600;
- Inter 400, 500, 600 and 700;
- Roboto Mono regular;
- a Challenges route requesting Oswald 400 and 700.

No `@font-face` is defined locally. No legally documented local font artifact is present in the repository.

Google Fonts documents that its repository contains the font files and per-family license metadata, but this sprint does not download or redistribute any binary asset. See the [official Google Fonts repository](https://github.com/google/fonts).

## Actual legacy usage

### Oswald

- brand: 400;
- Hero brand: 400;
- Hero H1 and section headings: 500;
- Expeditions topbar: 500;
- map markers: implicit 400;
- map tooltip and popup text: implicit 400;
- legacy requests also make 600 available;
- one older Challenges page uses 700.

### Inter

- body: 400;
- navigation: 600;
- calls to action and labels: commonly 700;
- legacy requests make 500 available for intermediate interface emphasis.

### Roboto Mono

- Statistics table: regular body values;
- Statistics header and first-column cells request 700 through CSS, although the legacy page loads only the default remote face;
- legacy Manual body and code: regular;
- strong text is synthesized by the browser in the legacy Manual.

## Legacy fallback stacks

- Body/interface: `Inter, Arial, sans-serif`.
- Heading/marker: `Oswald, sans-serif`.
- Legacy Manual: `"Roboto Mono", monospace`.
- Challenges code: `Consolas, "Courier New", monospace`.

The Astro implementation extends the heading and code fallbacks without replacing the original primary families:

- heading: `"Oswald", "Arial Narrow", Arial, sans-serif`;
- code: `"Roboto Mono", Consolas, "Courier New", monospace`.

## Previous Astro typography

Before this sprint:

- the global body used `system-ui`, `-apple-system`, BlinkMacSystemFont and Segoe UI;
- the Header brand used Arial Narrow/Aptos Narrow;
- the Hero brand and H1 used Arial Narrow/Aptos Narrow;
- most headings inherited the system font;
- Manual prose inherited the system font;
- code used SFMono-Regular/Consolas/Liberation Mono;
- custom weights 650 and 750 did not correspond to the original requested font weights.

This approximated a modern condensed appearance but did not restore AKT Mamut's actual identity or marker geometry.

## Map-marker requirements

The complete `markers.json` dataset contains 524 labels.

| Constraint | Legacy value |
| --- | --- |
| Font family | Oswald |
| Font size | 10 px |
| Font weight | implicit 400 |
| Line height | browser normal, flex-centered |
| Marker diameter | 24 px |
| Border | 1 px |
| Label count | 524 |
| Minimum label length | 4 digits |
| Maximum label length | 4 digits |
| Typical label | `1501` |
| Tooltip font | Oswald, 12 px |
| Numeric alignment | centered with flex |
| Tabular numerals | not requested |

The label and the marker share the same fixed box across both `markers.js` and `expeditions.js`.

## Numeric-width audit

Measurements were performed in browser-rendered Google Fonts at 10 px.

| Sample | Oswald 400 | Inter 400 | Inter tabular | System UI | Roboto Mono |
| --- | ---: | ---: | ---: | ---: | ---: |
| `47` | 8.521 px | 12.125 px | 12.979 px | 10.781 px | 12.010 px |
| `147` | 12.302 px | 16.188 px | 19.469 px | 16.177 px | 18.010 px |
| `1501` | 17.500 px | 20.385 px | 25.938 px | 21.563 px | 24.010 px |
| `25.42` | 21.031 px | 27.208 px | 28.625 px | 23.740 px | 30.010 px |

Oswald uses proportional digits in the loaded face:

- `1`: 3.781 px;
- `4`: 4.833 px;
- `7`: 3.865 px;
- `0`: 5.177 px.

Applying `font-variant-numeric: tabular-nums` did not change Oswald's measured digit widths. It should therefore not be applied to map markers. The original proportional Oswald digits are compact enough to keep four-digit labels comfortably inside the 24 px marker.

Inter supports tabular numerals: every digit measured 6.490 px when `tabular-nums` was enabled. Tabular Inter is appropriate for homepage metrics, where stable alignment matters and marker width does not.

Roboto Mono digits are naturally fixed at 6.010 px. It remains appropriate for Statistics and code.

## Current Astro implementation

The shared tokens are defined in `src/styles/global.css`:

```css
--font-family-body: "Inter", Arial, sans-serif;
--font-family-heading: "Oswald", "Arial Narrow", Arial, sans-serif;
--font-family-interface: "Inter", Arial, sans-serif;
--font-family-code: "Roboto Mono", Consolas, "Courier New", monospace;
```

The tokens are consumed as follows:

- body: `--font-family-body`;
- headings and brand: `--font-family-heading`;
- navigation, buttons and metrics: `--font-family-interface`;
- Manual prose and code: `--font-family-code`;
- future map markers should consume the same Oswald stack as `--font-family-heading`.

A separate map-marker token is deferred until an Astro marker component exists. This avoids introducing an unused token while retaining a documented requirement.

## Font-loading decision

### Option A — remote fonts

Selected for this sprint.

Advantages:

- matches the existing legacy loading model;
- restores the original families immediately;
- requires no new dependency or binary asset;
- keeps licensing and provenance with the existing provider.

Costs:

- external network request;
- third-party connection and associated privacy consideration;
- initial rendering may use fallbacks;
- availability depends on the font provider.

### Option B — local font assets

Deferred because:

- no local font binary exists;
- no local asset provenance is documented in the repository;
- the sprint forbids automatic font downloads and unverified binaries;
- a self-hosting decision should include explicit license and asset documentation.

## Centralized loading

`src/layouts/BaseLayout.astro` is the only native Astro font-loading location.

It provides:

- preconnect to `fonts.googleapis.com`;
- cross-origin preconnect to `fonts.gstatic.com`;
- one stylesheet request;
- `display=swap`;
- Inter 400, 600 and 700;
- Oswald 400 and 500;
- Roboto Mono 400 and 700.

No italic variants or unused native-page weights are requested.

If the remote font fails, content remains available through Arial, Arial Narrow, Consolas, Courier New and generic family fallbacks.

## Manual behavior

The legacy Manual uses Roboto Mono for the complete body and Oswald for headings. The migrated Manual now restores the same division:

- article title and H2/H3: Oswald 500;
- paragraphs, lists and tables: Roboto Mono 400;
- strong and table header text: Roboto Mono 700;
- inline code and code blocks: Roboto Mono with existing background, border and sizing distinctions.

## Legacy comparison

Browser comparison confirmed the intended family identity:

- legacy and Astro body/interface text resolve to Inter;
- legacy and Astro brand and heading text resolve to Oswald;
- legacy and Astro Manual prose resolve to Roboto Mono;
- navigation retains Inter 600;
- the AKT Mamut brand retains Oswald 400;
- primary headings use Oswald 500 on the native pages.

Pixel parity is intentionally not the goal. The native homepage retains its responsive `clamp()` scale, larger editorial Hero, semantic section structure and card layout. The migrated Manual retains its controlled reading measure, responsive title scale, improved heading hierarchy, table wrapper and locally scrollable code blocks. These are presentation-layer improvements from earlier migration sprints; Sprint 11 changes the family and supported weight mapping without reverting those layouts.

## Classification

### Preserve

- Oswald as the brand, heading and marker face.
- Inter as the body and interface face.
- Roboto Mono for Manual, code and future Statistics.
- Original marker size and proportional digit behavior.
- Oswald 400/500 and Inter 400/600/700 weight intent.

### Normalize

- Centralize one remote font request in `BaseLayout`.
- Replace 650/750 with real 500/600/700 weights.
- Use semantic typography tokens.
- Use Inter tabular numerals only for homepage metrics.
- Use documented fallbacks.
- Load Roboto Mono 700 where native content actually uses bold.

### Remove

- system font as the primary Astro family.
- Arial Narrow/Aptos Narrow as the primary brand and Hero face.
- duplicated literal font stacks in components.
- unsupported custom weights 650 and 750.
- per-page native Astro font imports.

### Defer

- local font hosting;
- binary font assets;
- a dedicated map-marker typography token;
- Astro map and Statistics components;
- changes to legacy font requests.

## Privacy and performance

The selected strategy makes one CSS request to Google Fonts and downloads only faces used by each page. Browser font loading remains lazy: Roboto Mono files are not fetched on the homepage when no element uses them.

`display=swap` keeps text visible during loading. The two preconnect hints reduce connection setup time but disclose the visitor's connection to the external provider. A later local-hosting ADR can remove that third-party dependency after verified font assets and license records are added.
