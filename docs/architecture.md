# AKT Mamut Website Architecture

Version: 1.0

This document describes the architecture of the AKT Mamut Website.

It explains **why** the project is built the way it is, **how** the individual layers cooperate and **which architectural decisions are considered permanent**.

It is the primary technical documentation for the repository.

---

# Vision

The long-term objective is to build a maintainable, high-performance static website for documenting mountain expeditions, geographic knowledge and outdoor activities.

The website combines:

- editorial content,
- expedition reports,
- geographic datasets,
- interactive maps,
- statistics,
- technical documentation.

The project favours simplicity over novelty and explicit architecture over hidden complexity.

---

# Product Philosophy

The website consists of two complementary user experiences.

## Desktop UI

Desktop is designed for preparation.

Typical activities include:

- reading
- planning expeditions
- exploring maps
- analysing statistics
- studying routes

Desktop favours information density and larger navigation structures.

---

## Field UI

Field UI is designed for outdoor usage.

Typical activities include:

- navigation
- quick route lookup
- checking summit information
- reviewing GPX tracks
- expedition support

Field UI is intentionally **not** a responsive copy of the desktop website.

Instead, it is an application-like interface sharing the same data model.

---

# System Architecture

The project consists of four clearly separated layers.

```text
Sources
      │
      ▼
Python Data Factory
      │
      ▼
JSON / GeoJSON Contracts
      │
      ▼
Astro Website
      │
      ▼
Leaflet
      │
      ▼
Static Deployment
```

Each layer has exactly one responsibility.

---

# Data Pipeline

## Sources

Typical sources include:

- Google Sheets
- GPX
- manually curated data
- geographic datasets

---

## Python

Python owns the complete data pipeline.

Responsibilities:

- import
- validation
- enrichment
- calculations
- statistics generation
- JSON generation
- GeoJSON generation

Python never generates HTML.

---

## Data Contracts

Astro never consumes raw source files.

Instead it consumes generated contracts.

Typical formats:

- JSON
- GeoJSON

This keeps presentation independent from data generation.

---

# Presentation Layer

Presentation is implemented using Astro.

Responsibilities include:

- layouts
- routing
- pages
- metadata
- SEO
- rendering

Business logic should remain outside Astro whenever possible.

---

# Interactive Maps

Leaflet remains the interactive map engine.

Responsibilities include:

- rendering maps
- markers
- layers
- overlays
- user interaction

Map calculations should be performed before deployment whenever possible.

The browser should render data, not generate it.

---

# Static Deployment

Deployment is intentionally simple.

GitHub

↓

Netlify

No server-side processing is required.

---

# Repository Structure

```text
src/
    Astro application

public/
    Static assets

website/old-site/
    Frozen legacy implementation

docs/
    Project documentation

scripts/
    Helper scripts

data/
    Local Python data factory (ignored by Git)
```

---

# UI Architecture

The user interface is organised into reusable components.

The project distinguishes between:

- layouts
- shared components
- desktop components
- Field UI components

Desktop and Field UI evolve independently while sharing the same data.

---

# Typography

Typography is intentionally preserved from the legacy website.

Primary fonts:

- Inter
- Oswald
- Roboto Mono

Future redesigns should preserve readability before aesthetics.

---

# Content

Editorial content is migrated to Astro Content Collections.

Benefits include:

- Markdown authoring
- type safety
- build-time validation
- reusable layouts

---

# Statistics

Statistics are generated during the Python stage.

The browser should receive only the information required for presentation.

Future improvements should reduce:

- browser calculations
- downloaded data size
- duplicated logic

---

# Performance Principles

Prefer:

- static generation
- build-time processing
- generated JSON
- reusable components
- lazy loading where appropriate

Avoid:

- unnecessary JavaScript
- duplicated calculations
- runtime data transformations

---

# Migration Strategy

Migration is incremental.

The legacy implementation remains the functional reference until an Astro page reaches feature parity.

Large rewrites are intentionally avoided.

Every sprint should produce a deployable repository.

---

# Architectural Decisions

The following decisions are considered stable.

## Astro

Astro is the presentation framework.

---

## Python

Python owns data generation.

---

## Leaflet

Leaflet remains the mapping engine.

---

## Static Site

The public website remains fully static.

---

## Desktop / Field UI

Desktop and Field UI are separate user experiences sharing the same data model.

---

## Progressive Migration

Replace one page at a time.

Never redesign the whole project in a single step.

---

# Future Architecture

Future work includes:

- shared design system
- reusable map components
- optimised statistics contracts
- improved search
- Progressive Web App evaluation
- image optimisation

These improvements should extend the architecture rather than replace it.

---

# Guiding Principle

The architecture should become simpler over time.

Every completed sprint should leave the project:

- easier to understand,
- easier to maintain,
- easier to extend,
- better documented.

The ultimate goal is not merely to build a website, but to build a codebase that remains approachable for both humans and AI assistants for many years.
