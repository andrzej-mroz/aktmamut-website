# AGENTS

AI Development Guide for the AKT Mamut Website

This document defines how AI assistants should work within this repository.

The goal is not only to generate code, but to help preserve the long-term architecture of the project.

---

# Project Philosophy

AKT Mamut is a long-term engineering project.

Every change should improve the project without making the architecture more complicated.

When several solutions are possible, prefer the one that is:

- simpler,
- easier to maintain,
- easier to understand,
- more explicit,
- easier to review.

Small, incremental improvements are preferred over large rewrites.

---

# Architectural Principles

The project is built around four independent responsibilities.

## Python

Python owns data generation.

Python is responsible for:

- importing source data,
- validation,
- preprocessing,
- JSON generation,
- GeoJSON generation.

Python never generates HTML.

---

## Astro

Astro owns presentation.

Astro is responsible for:

- layouts,
- pages,
- routing,
- metadata,
- editorial content,
- static rendering.

Astro should not duplicate Python responsibilities.

---

## Leaflet

Leaflet owns interactive maps.

Interactive behaviour belongs here.

Leaflet should not become responsible for page layout or editorial content.

---

## Netlify

Netlify deploys the website.

Deployment services must not become data-processing platforms.

---

# Repository Rules

The repository contains two independent worlds.

## Website

The repository contains the public website.

Everything inside `src/` belongs to Astro.

---

## Data Factory

The local Python data factory remains outside Git.

Never redesign the Python workflow unless explicitly requested.

---

# Coding Principles

Prefer:

- readable code,
- explicit names,
- small functions,
- isolated components,
- deterministic behaviour.

Avoid:

- unnecessary abstraction,
- speculative architecture,
- hidden side effects,
- duplicated logic,
- framework complexity.

---

# UI Philosophy

Desktop and Field UI intentionally have different goals.

Desktop is designed for:

- exploration,
- planning,
- analysis,
- reading.

Field UI is designed for:

- expeditions,
- outdoor usage,
- quick interaction,
- one-handed operation.

Do not force both interfaces to become visually identical.

---

# Documentation Rules

The documentation has four responsibilities.

README.md

Project overview.

PROJECT.md

Roadmap and current status.

docs/architecture.md

Technical architecture.

AGENTS.md

Development principles.

Avoid creating new standalone documentation unless it introduces genuinely new knowledge.

Whenever possible, extend the existing documents instead.

---

# Git Rules

Never:

- commit credentials,
- commit secrets,
- commit generated local data,
- commit files from `data/`,
- rewrite repository history,
- perform automatic pushes.

Commits should remain small and reviewable.

---

# Forbidden Changes

Do not perform the following without explicit approval:

- redesign the whole website,
- replace the Python pipeline,
- replace Leaflet,
- restructure the repository,
- remove production pages or datasets,
- change deployment,
- introduce large frameworks,
- introduce unnecessary dependencies.

---

# Preferred Workflow

When solving a task:

1. Understand the problem.
2. Inspect the existing architecture.
3. Propose the smallest reasonable solution.
4. Explain the reasoning.
5. Implement only the agreed change.

Architecture should always evolve deliberately.

---

# Decision Making

When multiple implementations are possible:

1. Preserve existing behaviour.
2. Minimize complexity.
3. Prefer static generation.
4. Reduce runtime JavaScript.
5. Keep responsibilities separated.
6. Leave the project easier to understand than before.

---

# Long-Term Goal

The finished repository should remain understandable after many years.

Every change should move the project closer to:

- a simple architecture,
- explicit ownership,
- maintainable code,
- minimal dependencies,
- excellent documentation.

The project should be pleasant for both humans and AI assistants to maintain.
