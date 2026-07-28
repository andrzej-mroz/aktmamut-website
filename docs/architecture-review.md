# Architecture Review — AKTMamut.eu

## Executive summary

AKTMamut.eu is a hand-built static website supported by a local Python data-generation pipeline. The public site has no frontend framework, package manager, bundler, or server-side application. HTML, CSS, JavaScript, JSON, and GeoJSON are published directly through Netlify.

The architecture remains understandable at its current size, but three areas limit maintainability and performance:

1. Shared page structure and metadata are duplicated or injected at runtime.
2. Large geographic datasets are downloaded and processed in the browser.
3. Editorial content, generated data, and presentation logic are coupled through scripts that modify production HTML.

An Astro migration would provide a significant benefit for layouts, content management, static routes, SEO, asset handling, and long-term maintainability. It would not by itself resolve the large GeoJSON payload or map performance.

Recommended migration complexity: **Medium**, provided migration is incremental and the existing Leaflet maps and Python generators are initially preserved.

## 1. Technology stack

### Frontend

- Manually maintained HTML.
- Handcrafted CSS with shared custom properties and page-specific styles.
- Vanilla browser JavaScript.
- Static JSON and GeoJSON.
- No frontend framework or component compiler.
- No npm package manifest or bundler.

### Browser dependencies

Dependencies are loaded primarily from CDNs and include:

- Leaflet and Leaflet plugins.
- Bootstrap.
- jQuery.
- Font Awesome and glyphicons.
- Tippy.js and Popper.
- Google Fonts.

Versions are configured independently in page markup rather than through a central dependency manifest.

### Data generation

The local Python pipeline uses pandas, gpxpy, requests, gspread, and Google authentication libraries. It reads Google Sheets and GPX sources, creates backups, generates JSON and GeoJSON, and copies deployable outputs into the static site.

### Deployment

Netlify publishes the static site directory directly. There is no frontend build on the hosting platform. Security and caching headers are configured in `netlify.toml`.

The project uses a custom timestamp-based query-string mechanism for cache invalidation because asset filenames are not fingerprinted.

## 2. Project structure

### Strengths

- Clear top-level distinction between the data factory and public website.
- Recognizable domain areas for expeditions, challenges, statistics, manuals, and the application shell.
- Documented data-generation workflow.
- Static deployment with few operational dependencies.
- Validation and safe-write behavior in the Python generators.

### Limitations

- Shared navigation is fetched and injected in the browser.
- Document structure and metadata are repeated across pages.
- Some pages combine HTML, CSS, and substantial JavaScript.
- A data generator directly rewrites a homepage fragment.
- Historical asset copies remain beside active files.
- The experimental application embeds other site pages through iframes.
- Stable asset filenames depend on manual cache-version updates.

Maintainability is moderate at the current size but will decline as page count, content, and data volume grow.

## 3. Content model

Editorial content is stored directly in HTML. Operational content is distributed across Google Sheets, GPX, CSV backups, JSON, GeoJSON, and JavaScript configuration.

Markdown is a strong fit for manuals, guides, descriptive pages, module introductions, and longer editorial content. It is not appropriate for route geometry or other large structured datasets.

Astro Content Collections would fit:

- manuals and guides;
- page metadata;
- challenge and expedition descriptions;
- navigation and module definitions;
- static detail pages.

Large GPX-derived datasets should remain generated JSON or GeoJSON governed by explicit schemas.

## 4. Performance

Local HTML, CSS, and JavaScript are relatively small. The dominant payloads are:

- homepage video: approximately 10.1 MB;
- expedition GeoJSON: approximately 13.7 MB;
- markers JSON: approximately 0.4 MB;
- external libraries, fonts, and map tiles.

The statistics page downloads and processes the full expedition dataset in the browser. This work is suitable for precomputation.

Static generation could remove most JavaScript from editorial pages. Leaflet maps would still require client-side execution.

The largest map opportunity is data partitioning: deliver a lightweight initial index and load detailed geometry only when needed.

## 5. SEO

Positive foundations:

- primary pages have title elements;
- `robots.txt` permits crawling;
- a sitemap exists and is declared in `robots.txt`.

Gaps:

- no consistent meta descriptions;
- no canonical URLs;
- no Open Graph or social metadata;
- no structured data;
- incomplete sitemap coverage;
- navigation absent from initial HTML because it is injected at runtime;
- map pages expose limited crawlable content;
- query-based challenge states cannot easily receive unique metadata;
- language declarations and visible content are not always aligned.

## 6. Migration suitability

Migration to Astro offers a **significant benefit** through:

- reusable layouts;
- statically rendered navigation;
- centralized metadata;
- Markdown and Content Collections;
- schema validation;
- static detail routes;
- asset fingerprinting;
- less JavaScript on editorial pages;
- continued static Netlify deployment.

The benefit is moderate for interactive maps because Astro does not replace Leaflet or solve geographic data size automatically.

## 7. Migration complexity

Overall complexity is **Medium** for an incremental migration.

Complexity is reduced by the small page count, static hosting, reusable existing CSS, and ability to retain current map scripts and Python outputs.

Complexity is increased by interactive maps, large datasets, query-based routes, inline page logic, client-injected navigation, and generators coupled to HTML.

A simultaneous redesign and data-platform rewrite would increase complexity to High and is not recommended.

## 8. Recommendation

Proceed incrementally:

1. Establish the Astro shell and deployment baseline.
2. Migrate static pages, layouts, metadata, and manuals.
3. Separate generated data from page rendering.
4. Migrate maps while preserving Leaflet behavior.
5. Optimize geographic delivery and precompute statistics after parity is established.
