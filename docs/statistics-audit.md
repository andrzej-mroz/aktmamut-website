# Statistics Audit

## Scope

This audit covers the legacy Statistics implementation without changing its source, route, data, Python pipeline, or Leaflet modules.

Files inspected:

- `website/old-site/statistics/index.html`
- `website/old-site/statistics/statistics.js`
- `website/old-site/assets/css/statistics.css`
- `website/old-site/assets/css/statistics-scroll.css` — related historical variant, not loaded by the page
- `website/old-site/assets/css/shared.css`
- `website/old-site/assets/js/header.js`
- `website/old-site/assets/js/app-version.js`
- `website/old-site/assets/components/header.html`
- `website/old-site/assets/img/M32.webp`
- `website/old-site/assets/img/M256.webp`
- `website/old-site/expeditions/expeditions.geojson`

The complete GeoJSON dataset was examined with `scripts/audit-statistics-data.mjs`, not by sampling records manually.

## Current page and runtime sequence

The live migration route remains `/legacy/statistics/index.html`.

1. Static HTML renders a Polish page titled `AKT MAMUT – Statistics`.
2. The initial table container displays `Data input...`.
3. External Roboto Mono, Popper, Tippy CSS, and Tippy JavaScript are requested.
4. `statistics.js` waits for `DOMContentLoaded`.
5. The browser fetches `/expeditions/expeditions.geojson` (rewritten to `/legacy/expeditions/expeditions.geojson` by the compatibility layer).
6. The browser derives years, 36 ten-day periods per year, cumulative GOT totals, tooltip records, labels, rounding, and color bands.
7. JavaScript creates the complete table and initializes 169 Tippy tooltip markers.
8. `header.js` fetches shared header HTML and injects the legacy navigation.
9. A failed GeoJSON fetch replaces the loading message with `Błąd wczytywania danych.` and writes the error to the console.

There is no sorting or filtering control. Years are displayed in ascending order from the minimum to maximum source year. Records inside tooltip details retain source order.

## Data source

| Attribute | Audit result |
| --- | --- |
| Path | `website/old-site/expeditions/expeditions.geojson` |
| File size | 13,719,394 bytes |
| Top-level type | `FeatureCollection` |
| Feature count | 524 |
| Geometry | 524 × `LineString` |
| Date range | `2015-05-01`–`2026-06-20` |
| Years represented | 12 |
| Statistics-required fields | `nr`, `date`, `name`, `got` |
| Missing required values | 0 |
| Invalid required values | 0 |
| Duplicate `nr` identifiers | 0 |

Statistics is tightly coupled to the Expeditions map artifact despite using no geometry and only four of its 22 properties.

## Complete property inventory

Every property occurs in all 524 features and has zero missing and zero null values. Empty strings occur only in optional media URLs: 86 `photo_album_url` values and 284 `photo_stamp_url` values. These are existing, unused source conventions rather than Statistics contract defects.

| Property | Runtime types | Unique | Range or representative values | Used by Statistics |
| --- | --- | ---: | --- | --- |
| `accomodation` | string | 121 | `Szczerbowiec Private House` | No |
| `ascent_m` | integer | 428 | 14–1,677 m | No |
| `country` | string | 29 | `UA`, `ES`, `SK` | No |
| `date` | string | 450 | `2015-05-01`–`2026-06-20` | Yes |
| `distance_km` | integer/number | 471 | 1.55–35.21 km | No |
| `duration_min` | integer | 350 | 24–1,653 min | No |
| `duration_text` | string | 350 | `8:04`, `9:12`, `4:58` | No |
| `exp_counter` | string | 155 | `001`, `002`, `003` | No |
| `got` | integer/number | 467 | 0–50.15 GOT | Yes |
| `got_total` | integer/number | 499 | 0–1,025.81 GOT | No |
| `gpx` | string | 524 | GPX filename | No |
| `gpx_url` | string | 524 | Wikiloc URL | No |
| `lat` | number | 523 | 28.5692–62.3411775 | No |
| `lon` | number | 523 | -17.9006–26.6072022 | No |
| `mountains` | string | 222 | `Połonina Równa`, `La Palma` | No |
| `name` | string | 507 | `Ostra Hora`, `Pikuj`, `Los Tilos` | Yes |
| `nr` | string | 524 | `1501`, `1502`, `1503` | Yes |
| `only_mountain` | boolean | 2 | `true`, `false` | No |
| `participants` | string | 43 | comma-separated initials | No |
| `photo_album_url` | string | 439 | Google Photos URL; 86 empty strings | No |
| `photo_stamp_url` | string | 241 | Google Drive URL; 284 empty strings | No |
| `trail_counter` | string | 524 | `001`, `002`, `003` | No |

The source field is spelled `accomodation`. This is an existing source-schema issue but is irrelevant to Statistics and must not be silently renamed in this sprint.

## Fields consumed by Statistics

### Source fields

| Field | Source | Source type | Required | Meaning | Example | Legacy formatting | Legacy fallback | Direct display | Calculation | Target type and validation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `nr` | `Feature.properties.nr` | string | Target: yes | Stable Expedition identifier | `1501` | unchanged | `???` | Tooltip | Record association | `id: string`; trimmed, non-empty, unique |
| `date` | `Feature.properties.date` | string | Yes | Expedition calendar date | `2015-05-01` | unchanged | invalid record skipped | Tooltip | Year, month, day and period | `date: string`; real calendar date matching `YYYY-MM-DD` |
| `name` | `Feature.properties.name` | string | Target: yes | Expedition name | `Ostra Hora` | unchanged | empty string | Tooltip | No | `name: string`; trimmed and non-empty |
| `got` | `Feature.properties.got` | number | Yes | GOT points for one Expedition | `25.42` | cumulative cell rounded to integer; tooltip uses two decimals | falsy value parsed as `0` | Cell total and tooltip | Period and cumulative totals | `gotPoints: number`; finite and non-negative |

All four fields are complete and valid in the current 524 records. Legacy fallbacks therefore hide no current source defect and should not be retained in the normalized contract.

### Derived fields

| Derived value | Legacy calculation | Use | Proposed owner |
| --- | --- | --- | --- |
| `year` | First date component parsed as integer | Year columns | Python |
| `month` | Second date component minus one | Period index | Python |
| `day` | Third date component parsed as integer | Period segment | Python |
| `segment` | Days 1–10, 11–20, or 21–month end | 36 rows per year | Python |
| `periodIndex` | `month * 3 + segment` | Deterministic ordering | Python |
| `periodGotPoints` | Sum of `got` in a period | Input to cumulative total | Python |
| `cumulativeGotPoints` | Running yearly sum over 36 periods | Main cell value | Python |
| `period record IDs` | Records grouped by year/month/segment | Detail disclosure | Python |
| `current-period boundary` | Browser clock determines future cells | Blank future periods | Python at generation time |
| `year range` | Contiguous minimum-to-maximum year array | Columns | Python |

### Presentation-only values

| Value | Legacy behavior | Proposed owner |
| --- | --- | --- |
| Month label | English three-letter abbreviation | Astro presentation |
| Segment label | `10`, `20`, `30`; `30` actually means day 21 through month end | Astro with explicit explanation |
| Main cell number | `Math.round` cumulative total | Astro formatting |
| Tooltip GOT | Two fixed decimal places | Astro formatting |
| Color band | Eight thresholds from 0 through 1,000+ | Astro presentation, never sole meaning |
| Marker | `✳` indicates detail records | Replace with accessible native disclosure |
| Column width | First column 88/72 px; remaining width divided by year count | Astro/CSS |

## Browser-side calculations

The legacy browser currently performs all of the following:

1. extracts and parses years from dates;
2. finds minimum and maximum years;
3. creates a contiguous year range;
4. initializes 36 periods for every year;
5. parses GOT values with `parseFloat`;
6. parses year, month, and day components;
7. validates basic month/day ranges;
8. assigns records to a ten-day segment;
9. sums GOT by period;
10. builds detail records;
11. uses the browser date to identify future periods in the current year;
12. calculates cumulative totals within each year;
13. rounds cumulative totals to whole numbers;
14. assigns color thresholds;
15. formats detail GOT values to two decimals;
16. calculates column widths from year count.

There are no distance totals, elevation totals, duration calculations, percentages, ratios, ranking, filtering, or user-controlled sorting.

Stable domain work—validation, grouping, totals, cumulative values, current-period boundaries, and deterministic ordering—should move to Python. Astro should only format labels and values and render static semantic HTML. The browser should perform no custom calculation.

## Current totals

| Year | Records | GOT total |
| ---: | ---: | ---: |
| 2015 | 28 | 816.33 |
| 2016 | 47 | 1,008.71 |
| 2017 | 59 | 1,019.34 |
| 2018 | 51 | 1,007.41 |
| 2019 | 55 | 1,025.81 |
| 2020 | 16 | 364.32 |
| 2021 | 42 | 1,019.29 |
| 2022 | 30 | 522.30 |
| 2023 | 58 | 1,001.33 |
| 2024 | 52 | 1,009.15 |
| 2025 | 54 | 1,001.68 |
| 2026 | 32 | 553.56 |
| **Total** | **524** | **10,349.23** |

Source order is chronologically non-decreasing. The audit found no out-of-order date transition. The existing `got_total` values also match cumulative yearly `got` values, but Statistics calculates totals independently and never consumes `got_total`.

## Table semantics and accessibility

Current table:

- has a `<table>`, `<thead>`, and `<tbody>`;
- has 36 body rows and 13 columns: one period column plus 12 year columns;
- has no `<caption>`;
- leaves the first column header empty;
- uses 13 `<th>` elements but no `scope`;
- has no accessible table name;
- right-aligns numeric cells and left-aligns period labels;
- expresses value bands through background color but also retains numeric text;
- uses 169 non-focusable `<span>` tooltip markers;
- exposes details only on pointer hover;
- has no keyboard-operable alternative for tooltip details;
- does not announce loading or errors with a live region;
- uses an English loading message on a Polish page;
- contains inline tooltip-table styles and depends on Popper/Tippy.

Target table:

- descriptive `<caption>`;
- row and column headers with `scope`;
- explicit statement that values are cumulative GOT points;
- first header named, for example, `Okres`;
- native, keyboard-accessible detail disclosure;
- loading removed by static generation;
- meaningful static empty state when no records exist;
- local responsive overflow, not page-level overflow;
- visible scroll affordance and instructions;
- sticky header/period column if it remains robust;
- color treated as supplemental information only.

## Responsive audit

| Viewport | Table width | Local overflow | Page overflow | Font | Row height | Header/navigation |
| --- | ---: | --- | --- | ---: | ---: | --- |
| 1440×900 | 1,349 px | No | No | 14 px | 31 px | 77 px header; four links |
| 1024×768 | 960 px | Yes, slight | No | 14 px | 31 px | 77 px header; four links |
| 768×1024 | 960 px | Yes | No | 14 px | 31 px | 65 px header; four links |
| 390×844 | 720 px | Yes | No | 12 px | 26 px | 79 px header; four links |

The active stylesheet provides local horizontal scrolling through `.table-card`. There are no sticky headers or columns. The unused `statistics-scroll.css` contains a previous sticky implementation but is not loaded and should not be treated as production behavior.

At mobile width, only roughly four year columns are visible at once. The user receives no strong scroll affordance, the 169 hover-only detail markers are inaccessible, and the note explaining them appears only after the long table.

Recommended future mobile presentation: a compact summary followed by the same locally scrollable detailed table, with a sticky period column and accessible native details. A reduced column set would hide historical comparisons, while 524 stacked cards would be excessively long.

## Formatting rules

- Dates: source and tooltip use `YYYY-MM-DD`.
- GOT source values: JSON numbers.
- Main cells: cumulative values rounded to whole GOT points.
- Tooltip detail: two decimals using `toFixed(2)`.
- Periods: English month abbreviations plus `10`, `20`, or `30`.
- Empty future periods: empty cell.
- Zero cumulative totals: displayed as `0`.
- Numeric alignment: right.
- Color thresholds: 0, 100, 200, 400, 600, 800, 1,000, above 1,000.
- Coordinates, distance, elevation, duration, and percentages are not displayed.

The target should store numbers without display formatting, preserve GOT as the unit, use `YYYY-MM-DD`, and make the third segment meaning explicit. Polish number formatting may be applied by Astro, but no locale switcher is required.

## Loading and error states

- Initial: literal `Data input...`.
- Success: container content is replaced by the generated table.
- Failure: `Błąd wczytywania danych.` plus `console.error`.
- No empty-dataset state beyond a table generated from the current year.

Static generation should eliminate the loading state. Build-time validation should fail before deployment for contract-breaking data. A deliberately rendered empty state should cover a valid zero-record dataset.

## Behavior classification

### Preserve

- Polish page purpose and GOT terminology.
- Year columns in ascending order.
- 36 ten-day rows per year.
- Cumulative yearly values.
- Detail records associated with populated periods.
- Whole-number summary cells and two-decimal details.
- Local horizontal table overflow.
- Current legacy route during this sprint.

### Adapt

- Add caption, named first header, `scope`, explicit units, and accessible details.
- Clarify that the third segment covers day 21 through month end.
- Replace hover-only Tippy content with native keyboard-operable disclosure.
- Add a summary before the detailed table.
- Improve mobile scroll affordance and consider sticky headers.
- Use consistent Polish presentation formatting.
- Replace browser loading/error behavior with build-time validation and a static empty state.

### Move to build time

- Field validation and normalization.
- Date parsing.
- Period grouping.
- Period and cumulative totals.
- Year summaries.
- Record ordering.
- Future-period null assignment.
- Dedicated Statistics JSON generation.

### Remove

- Direct browser fetch of the 13.7 MB GeoJSON.
- Popper and Tippy dependencies.
- Browser-side table construction and calculations.
- Inline tooltip styles.
- English loading message.
- JavaScript header injection on the future Astro route.
- Unused `statistics-scroll.css` behavior unless deliberately reimplemented.

### Defer

- Migration of the live `/statistics/` page.
- Python generator implementation.
- Netlify redirects.
- Leaflet and Expeditions migration.
- Any optional client-side sorting or filtering.

## Coupling conclusion

Direct GeoJSON consumption is technically possible but inappropriate long term. Statistics transfers all map geometry and 18 unused properties, duplicates stable domain calculations in the browser, and couples a tabular report to a map-oriented schema. A dedicated, normalized Statistics JSON generated by Python is supported by the audit and is the selected target.
