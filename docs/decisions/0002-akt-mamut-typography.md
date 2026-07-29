# ADR 0002 — Preserve AKT Mamut legacy typography

- Status: Accepted
- Date: 2026-07-29

## Context

AKT Mamut and CS3C are separate products with separate visual systems.

The AKT Mamut legacy site uses Inter for body and interface text, Oswald for brand and heading typography, and Roboto Mono for dense technical and numeric content. Oswald is also used inside fixed 24 px Expeditions map markers, where its compact proportional digits allow four-digit identifiers to remain readable.

The first Astro pages temporarily used system fonts and Arial Narrow/Aptos Narrow approximations. Those families did not preserve the exact visual character or numeric geometry used by the legacy map and geographic interfaces.

No verified local font binaries currently exist in the repository.

## Decision

AKT Mamut preserves its original legacy typography:

- Inter for body and interface content;
- Oswald for the brand, headings and future map markers;
- Roboto Mono for Manual prose, code and future Statistics interfaces.

The native Astro application loads these families once through `BaseLayout.astro` using the existing remote Google Fonts model. Semantic font-family tokens are owned by AKT Mamut's `global.css`.

CS3C keeps its independent modern typography. Typography tokens must not be shared between the two projects unless an explicit mapping decision is made.

No font files are downloaded or redistributed in this decision. Local hosting is deferred until verified assets and license documentation are available.

## Rationale

Typography is both a visual identity and a functional dependency.

At 10 px, the four-digit marker label `1501` measures approximately 17.5 px in Oswald, compared with approximately 21.6 px in the previous system font. Preserving Oswald keeps marker sizing predictable without reducing readability or changing the 24 px marker geometry.

Inter retains the established body and interface density. Roboto Mono preserves the technical character and predictable numeric alignment required by the Manual and Statistics.

## Consequences

### Positive

- AKT Mamut visual continuity is restored.
- Marker sizing and compact label behavior remain predictable.
- Homepage headings and brand text match the legacy character.
- Manual typography again follows the legacy Oswald/Roboto Mono division.
- Future Astro map components have a documented font requirement.
- Numeric metrics can use tabular Inter without changing map-marker digits.
- Font loading and fallbacks are centralized.

### Trade-offs

- Native Astro pages retain an external Google Fonts dependency.
- Visitors connect to a third-party font provider.
- Fallback typography can temporarily differ while fonts load.
- Local hosting requires a later asset and licensing decision.

## Constraints

- CS3C components must not be copied together with typography assumptions.
- Future map markers must use the documented Oswald geometry unless a separate ADR changes it.
- `font-variant-numeric: tabular-nums` must not be applied globally.
- Code and dense numeric tables must retain a true monospace stack.
- Font packages and unverified binaries must not be introduced implicitly.

## Alternatives considered

### Keep the Astro system-font approximation

Rejected because it breaks visual continuity and changes the width of compact marker-style numeric labels.

### Use one font for every role

Rejected because the legacy implementation intentionally separates body, heading/marker and monospace responsibilities.

### Download and self-host fonts now

Deferred because the repository contains no verified font assets or local license records, and this sprint does not authorize downloading or redistributing binaries.

### Reuse CS3C typography

Rejected because AKT Mamut and CS3C have separate product identities and functional typography requirements.
