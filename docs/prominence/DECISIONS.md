# Prominence --- Decisions

## D-001 --- MERIT = topologia

**Accepted.** `l0_basins` są szkieletem ridge.

## D-002 --- Rivers = hard barrier

**Accepted.** River cuts fizycznie rozcinają graf.

## D-003 --- DEM = scoring

**Accepted.** DEM 30 m nie tworzy geometrii ridge.

## D-004 --- Raw topology first

**Accepted.** `route_raw` jest źródłem prawdy; smoothing jest pochodny.

## D-005 --- Smoothing 6b

**Accepted for publication.** `resample=220`, `spline_s=45000`,
`second_pass_s=22000`, `step=10`, `max_deviation=280`.

## D-006 --- Exact endpoints

**Accepted.** Finalna geometria dochodzi do dokładnych Peak/Saddle,
jeśli connector nie łamie river barrier.

## D-007 --- GeoPackage V1

**Accepted.** `data/prominence/db/prominence.gpkg`. Na V1 bez PostGIS.

## D-008 --- Sources poza GPKG

**Accepted.** `basinsXX.db`, `riversXX.db`, DEM pozostają w `sources/`.

## D-009 --- Kanoniczna sieć

**Accepted.** `ridge_nodes + ridge_edges`; trasy przez `route_edges`.

## D-010 --- Batch network build

**Accepted.** Najpierw `route_raw`, potem okresowy BUILD RIDGE NETWORK.
Incremental później.

## D-011 --- Lokalnie → publikacja internetowa

**Accepted for V1.** Obliczenia i źródło prawdy lokalnie; internet
publikuje produkty.

## D-012 --- Pliki jako pamięć projektu

**Accepted.** `AI_CONTEXT.md` + `DECISIONS.md` są szybkim kontekstem dla
AI.
