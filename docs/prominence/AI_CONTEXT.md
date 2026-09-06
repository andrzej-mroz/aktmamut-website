# Prominence --- AI Context

> **INSTRUKCJA DLA AI:** przed projektowaniem lub zmianą kodu Prominence
> przeczytaj ten plik i `DECISIONS.md`. Nie odkrywaj ponownie zapisanych
> decyzji. Jeśli kod jest z nimi sprzeczny, najpierw wskaż sprzeczność.

## Cel

Automatyczne wyznaczanie ścieżki grzbietowej `Peak → Saddle` dla Karpat.
Projekt jest częścią AKT Mamut. V1 działa lokalnie; internet jest
głównie warstwą publikacyjną.

## Źródła

-   MERIT `l0_basins` --- źródło topologii ridge.
-   MERIT rivers --- hard barriers; graf jest rozcinany.
-   `CarpathiansDEM.tif` 30 m --- scoring wysokości, nie geometria
    ridge.

## Pipeline

``` text
Peak + Saddle
→ corridor
→ local l0_basins
→ boundaries
→ river cuts
→ graph
→ DEM scoring
→ A*
→ raw route
→ exact endpoint anchoring
→ storage
→ optional smoothing 6b
```

## Exact endpoints

Routing używa snapniętych węzłów MERIT, ale finalna geometria ma
dochodzić do dokładnych Peak/Saddle, jeśli connector exact→snap nie
przecina river barrier.

Diagnostyka: `peak_snap_m`, `saddle_snap_m`, `peak_exact_ok`,
`saddle_exact_ok`.

## Smoothing 6b

Smoothing jest tylko produktem publikacyjnym.

``` text
resample_m = 220
spline_s = 45000
second_pass_s = 22000
spline_step_m = 10
max_deviation_m = 280
```

Historia: V0.3 Douglas--Peucker/Chaikin → V0.4 mocniejsze krzywe →
V0.5/5b resampling+B-spline → V0.6b zaakceptowany wariant.

## Testy

**Omu:** PASS.

**Moldoveanu → Dukla:** Peak `45.5995641, 24.7361706`; Saddle
`49.4175, 21.6964`; straight \~482.2 km. Bazy 22+23, DEM Carpathians.
Corridor 130 km bez trasy; 140 km PATH FOUND; raw \~1435.18 km. Bardzo
wysoka zgodność z ręcznie wykonanym głównym ridge Karpat.

## Docelowy model

Nie przechowywać docelowo tysięcy niezależnych pełnych LINESTRING-ów.

``` text
ridge_nodes
ridge_edges
routes
route_edges
```

Każdy wspólny fragment ridge istnieje raz. `route_raw` pozostaje w V1
dla audytu i rebuildów.

## Strategia V1

``` text
calculate raw routes
→ store route_raw
→ BUILD RIDGE NETWORK
→ noding / split / deduplicate
→ ridge_nodes / ridge_edges
→ route_edges
```

Najpierw batch; incremental update później.

## Dysk

``` text
AKT-Mamut/
  docs/prominence/
  modules/prominence/
  data/prominence/
    sources/
    cache/
    db/prominence.gpkg
    runs/
    exports/
```

`sources` read-only; `cache` odtwarzalny; `prominence.gpkg` główna baza;
`exports` produkty pochodne.

## Następny krok

1.  Struktura `data/prominence/`.
2.  `prominence.gpkg`.
3.  Schema V1.
4.  Adaptacja `ridge_generic`.
5.  Zapis `route_raw`.
6.  Batch test.
7.  `BUILD RIDGE NETWORK`.

## Nie robić

-   Nie traktować smoothingu jako topologii.
-   Nie pozwalać ridge przekraczać river barrier.
-   Nie kopiować DEM/MERIT do `prominence.gpkg`.
-   Nie zaszywać absolutnych `C:\...` w kodzie.
-   Nie budować modelu docelowego jako tysięcy niezależnych
    LINESTRING-ów.
-   Nie generować obrazków, gdy zadanie dotyczy kodu/obliczeń/trasy i
    użytkownik o obraz nie prosi.
-   Nie zmieniać 6b bez jawnego wersjonowania.
