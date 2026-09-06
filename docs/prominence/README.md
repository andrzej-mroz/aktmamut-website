# Prominence

Moduł AKT Mamut do wyznaczania grzbietów **Peak → Saddle** dla Karpat.

## Start po powrocie do projektu

**Dla człowieka:** ten plik + pełna Dokumentacja V1.

**Dla ChatGPT / AI:** przed zmianą kodu przeczytaj: 1. `AI_CONTEXT.md`
2. `DECISIONS.md` 3. `TEST_CASES.md` 4. `CHANGELOG.md`

## Status

-   MERIT `l0_basins` = topologia ridge.
-   Rivers = twarde bariery.
-   DEM 30 m = scoring wysokościowy.
-   A\* routing działa.
-   Exact Peak/Saddle endpoints dodane.
-   Omu: test OK.
-   Moldoveanu → Dukla: test OK przy corridor 140 km.
-   Smoothing 6b: zaakceptowany do publikacji.
-   Następny etap: `prominence.gpkg`, `route_raw`, potem kanoniczna sieć
    `ridge_nodes + ridge_edges`.

> **RAW TOPOLOGY FIRST --- SMOOTHING LAST**
