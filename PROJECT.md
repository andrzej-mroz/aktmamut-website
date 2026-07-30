# AKT Mamut Website

## Vision

AKT Mamut is a long-term digital platform dedicated to mountain expeditions, geographic exploration and outdoor knowledge, with a primary focus on the Carpathians.

The project combines editorial content, interactive maps, structured geographic data and expedition statistics into a single static website.

The long-term objective is to create a maintainable architecture where:

- Python owns data generation.
- Astro owns presentation.
- Leaflet owns interactive maps.
- Static generation is preferred over runtime processing.

---

# Current Status

Current phase:

> Incremental migration from the legacy website to Astro.

Completed foundations include:

- Astro project
- shared layouts
- shared navigation
- typography restoration
- legacy compatibility layer
- Manual migrated to Astro Content Collections
- Desktop UI foundation
- Field UI foundation

Interactive maps and Statistics remain in the legacy implementation until dedicated migration sprints.

---

# Project Principles

The project follows several permanent principles.

## Preserve before replacing

The existing public website remains the reference implementation until the corresponding Astro page reaches functional parity.

---

## Incremental migration

Large rewrites are intentionally avoided.

Every sprint should produce a reviewable improvement while keeping the project deployable.

---

## Separation of responsibilities

Python

- imports source data
- validates data
- generates JSON / GeoJSON

Astro

- layouts
- pages
- metadata
- routing
- editorial content

Leaflet

- interactive maps only

---

## Desktop and Field UI

Desktop and mobile are not intended to become identical interfaces.

Desktop supports:

- planning
- exploration
- reading
- analysis

Field UI supports:

- expeditions
- quick navigation
- outdoor usage
- one-handed interaction

Both experiences share the same data model.

---

# Repository Roadmap

## Foundation

- [x] Repository created
- [x] Astro initialized
- [x] Global layout
- [x] Navigation
- [x] Legacy compatibility layer

---

## Content

- [x] Manual
- [x] Homepage architecture
- [ ] Remaining static pages

---

## Maps

- [ ] Expeditions
- [ ] Challenges
- [ ] Statistics
- [ ] Shared map components

---

## Data

- [ ] Statistics JSON generator
- [ ] Additional data contracts
- [ ] Validation improvements

---

## UX

- [x] Desktop foundation
- [x] Field UI foundation
- [ ] Shared design system
- [ ] Accessibility review

---

# Completed Milestones

## Sprint 1

Repository foundation

---

## Sprint 2

Astro initialization

---

## Sprint 3

Global layout

---

## Sprint 4

Navigation

---

## Sprint 5

Legacy compatibility

---

## Sprint 6

Homepage architecture

---

## Sprint 7

Manual migration

---

## Sprint 8

Homepage migration

---

## Sprint 9

Desktop / Field UI split

---

## Sprint 10

Statistics architecture

---

## Sprint 11

Typography restoration

---

## Sprint 12

Desktop and Field UI refinement

---

## Sprint 13

Documentation refactoring

---

# Backlog

Future work includes:

- Expeditions migration
- Challenges migration
- Statistics migration
- Map performance optimisation
- Image optimisation
- Search
- Offline support
- Progressive Web App evaluation

Items move into the roadmap only when implementation begins.

---

# Future Vision

The final architecture should consist of four clearly separated layers.

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
Leaflet Interactive Maps
```

The public website should remain fully static wherever possible while providing rich interactive geographic experiences only where they genuinely add value.

---

# Next Sprint

To be updated at the beginning of each sprint.

Current objective:

> Continue the incremental migration while preserving architectural simplicity and maintaining production parity with the legacy website.
