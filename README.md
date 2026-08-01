# AKT Mamut Website

Source repository for **AKTMamut.eu** — a static website documenting mountain expeditions, geographic challenges and statistics, with a primary focus on the Carpathians.

## Architecture

```text
Google Sheets / GPX
          │
          ▼
Python generators
          │
          ▼
JSON / GeoJSON
          │
          ▼
Astro
          │
          ▼
Leaflet
          │
          ▼
Static website
          │
          ▼
Netlify
```

Responsibilities are intentionally separated:

- Python imports, validates and generates data.
- Astro renders pages and content.
- Leaflet provides interactive maps.
- Netlify publishes the static build.

## Technology

- Astro
- TypeScript
- HTML and CSS
- Python
- JSON and GeoJSON
- Leaflet
- GitHub
- Netlify

## Repository structure

```text
AKT-Mamut-Website/
├── data/       Python generators and local data factory
├── docs/       Architecture and maintenance documentation
├── public/     Static assets and generated JSON / GeoJSON
├── scripts/    Data validation and audit tools
├── src/        Astro application
├── AGENTS.md
├── PROJECT.md
├── README.md
└── package.json
```

## Main routes

```text
/
├── expeditions/
├── challenges/
├── statistics/
└── manual/
```

## Development

Install dependencies:

```powershell
npm install
```

Start the local development server:

```powershell
npm run dev
```

Create a production build:

```powershell
npm run build
```

Preview the production build:

```powershell
npm run preview
```

## Data validation

Audit the Expeditions dataset used by Statistics:

```powershell
npm run audit:statistics
```

Validate the Statistics data contract:

```powershell
npm run validate:statistics-contract
```

## Project principles

- Keep Python as the data-generation layer.
- Keep Astro responsible for presentation.
- Use Leaflet for interactive maps.
- Prefer static generation.
- Keep production routes stable.
- Do not commit credentials or local source data.
- Review and test changes before committing.
