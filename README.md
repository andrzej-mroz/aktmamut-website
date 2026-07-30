# AKT Mamut Website

Repository for the incremental migration of **AKTMamut.eu** from a manually maintained static website to a modern Astro-based architecture.

The migration preserves the existing public website, the Python data-generation pipeline, interactive Leaflet maps and public URLs while progressively replacing only the presentation layer.

---

# Project Overview

AKT Mamut is a long-term project documenting mountain expeditions, challenges and geographic knowledge, with a primary focus on the Carpathians.

The website combines:

- editorial content,
- expedition data,
- interactive maps,
- statistics,
- technical documentation.

The project is intentionally built as a **static website** with a separate data-generation pipeline.

---

# Technology Stack

## Presentation

- Astro
- TypeScript
- HTML
- CSS

## Data pipeline

- Python
- Google Sheets
- GPX
- JSON
- GeoJSON

## Maps

- Leaflet

## Hosting

- GitHub
- Netlify

---

# High-Level Architecture

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
Static Website
          │
          ▼
GitHub
          │
          ▼
Netlify
```

The governing architectural rule is simple:

> **Replace the presentation layer only.**

Python remains responsible for importing, validating and generating data.

Astro is responsible only for rendering the website.

---

# Repository Structure

```text
AKT-Mamut-Website/
│
├── src/                Astro application
├── public/             Static public assets
├── website/old-site/   Frozen legacy implementation
├── scripts/            Migration and validation tools
├── docs/               Architecture documentation
├── data/               Local Python data factory (not tracked)
│
├── README.md
├── PROJECT.md
├── AGENTS.md
└── package.json
```

---

# Development Workflow

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

# Project Principles

The migration follows several core principles.

- Preserve public behaviour before improving it.
- Migrate incrementally.
- Keep Python as the data-generation layer.
- Keep Leaflet as the map engine until a separate decision changes it.
- Prefer static rendering whenever possible.
- Add browser JavaScript only when interaction requires it.
- Keep architecture simple and explicit.

---

# Documentation

The repository intentionally keeps documentation compact.

| File                   | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `README.md`            | Project overview and getting started                 |
| `PROJECT.md`           | Roadmap, sprint history and current status           |
| `docs/architecture.md` | Complete technical architecture and design decisions |
| `AGENTS.md`            | Guidelines for AI-assisted development               |

---

# Current Status

The repository already contains:

- Astro application foundation
- shared layouts
- shared navigation
- legacy compatibility layer
- Manual migrated to Astro Content Collections
- desktop and Field UI foundations
- typography restored from the legacy implementation

Interactive maps, Statistics and remaining legacy pages will migrate incrementally.

---

# License

This repository contains the source code for the AKT Mamut website migration.

Data sources, generated geographic datasets and local Python workflows are maintained separately from the public website repository.
