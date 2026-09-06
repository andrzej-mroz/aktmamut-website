# Carpathian Prominence Lab / AKT Mamut --- Prominence

## Dokumentacja projektu V1

**Status:** pierwsza dokumentacja architektury\
**Data:** 2026-08-15\
**Zakres:** lokalny silnik wyznaczania grzbietów Peak → Saddle,
przechowywanie wyników, budowa kanonicznej sieci grzbietowej oraz
późniejsza publikacja.

------------------------------------------------------------------------

## 1. Cel projektu

Celem modułu **Prominence** jest automatyczne wyznaczanie topograficznie
poprawnej ścieżki grzbietowej pomiędzy parą **Peak --- Saddle** dla
szczytów Karpat.

Podstawowa zasada:

> Grzbiet Peak → Saddle powinien przebiegać po sieci działów wodnych i
> nie powinien przecinać rzeki.

System rozwijamy przede wszystkim **lokalnie w AKT Mamut**. Internet
jest na tym etapie warstwą publikacyjną. Architektura nie może jednak
zamykać możliwości późniejszego uruchomienia silnika jako usługi
internetowej/API.

------------------------------------------------------------------------

## 2. Ustalenia z prototypowania

### 2.1. MERIT `l0_basins` jako szkielet grzbietów

Granice `l0_basins` tworzą bardzo dobry szkielet kandydatów na przebieg
grzbietu. Surowa geometria MERIT jest ząbkowana, ale topologicznie
dobrze odwzorowuje działy wodne.

**MERIT traktujemy jako źródło topologii, a nie finalną geometrię
kartograficzną.**

### 2.2. River cuts

Do sieci granic basinów dołączamy warstwę rzek. Jeżeli rzeka przecina
granicę basinów, miejsce przecięcia jest traktowane jako **twarda
blokada**.

Nie stosujemy jedynie kary kosztowej. Graf jest fizycznie rozcinany w
pobliżu rzeki.

> Ridge route nie może przejść przez river barrier.

### 2.3. DEM 30 m

DEM nie wyznacza bezpośrednio geometrii grzbietu. Geometria kandydatów
pochodzi z MERIT.

DEM służy do **scoringu krawędzi grafu** --- preferowania przebiegu po
wyżej położonych fragmentach sieci.

Docelowym źródłem jest jeden duży raster `CarpathiansDEM.tif`. Nie
tworzymy ręcznie osobnych TIFF-ów dla każdego szczytu. Rasterio
odczytuje tylko potrzebne próbki/fragmenty.

------------------------------------------------------------------------

## 3. Test Omu

Omu był pierwszym przypadkiem testowym.

``` text
Peak + Saddle
      ↓
lokalne l0_basins
      ↓
granice basinów
      ↓
river cuts
      ↓
graf
      ↓
A* routing
      ↓
raw ridge
```

Test potwierdził, że metoda potrafi odnaleźć poprawny grzbiet.

------------------------------------------------------------------------

## 4. Test Moldoveanu → Dukla

Drugi test był celowo ekstremalny.

``` text
Peak:   Moldoveanu 45.5995641, 24.7361706
Saddle: 49.4175, 21.6964
Straight distance: ~482 km
```

Wykorzystane dane:

``` text
basins22.db
basins23.db
rivers22.db
rivers23.db
CarpathiansDEM.tif
```

Korytarze do 130 km nie dawały ciągłej ścieżki. Przy **140 km**
otrzymano `PATH FOUND`, raw route około **1435 km**.

Powodem konieczności szerokiego corridoru jest duży łuk głównego
grzbietu Karpat. Rejon Howerli znajduje się około 124 km od prostej
Peak--Saddle.

Porównanie z ręcznie wykonanym wcześniej głównym grzbietem Karpat
pokazało bardzo wysoką zgodność przebiegu. To jest kluczowy test
potwierdzający sens metody.

------------------------------------------------------------------------

## 5. Exact endpoints

Routing odbywa się pomiędzy najbliższymi węzłami grafu MERIT, ale
finalna geometria powinna rozpoczynać się i kończyć dokładnie we
współrzędnych Peak i Saddle.

``` text
Peak exact → Peak snap → MERIT ridge route → Saddle snap → Saddle exact
```

Krótkie odcinki exact → snap muszą być walidowane względem river
barrier.

Do diagnostyki przechowujemy:

``` text
peak_snap_m
saddle_snap_m
peak_exact_ok
saddle_exact_ok
```

------------------------------------------------------------------------

## 6. Historia smoothingu

Smoothing nie jest źródłem prawdy. Jest **warstwą
prezentacyjną/publikacyjną** generowaną z poprawnej trasy raw.

### V0.3

Douglas--Peucker + Chaikin. Bezpieczne, ale ząbkowy charakter MERIT
pozostawał widoczny.

### V0.4

Mocniejsze wygładzanie krzywą. Narożniki stały się łagodniejsze, ale
rytm geometrii MERIT nadal był widoczny.

### V0.5 / V0.5b

Wprowadzono:

``` text
raw route → regularny resampling → B-spline
```

To zaczęło faktycznie usuwać ząbki wynikające z geometrii źródłowej.

### V0.6b --- wariant zaakceptowany

``` text
resample_m               = 220
spline_s                  = 45000
second_pass_s             = 22000
spline_step_m             = 10
max_smooth_deviation_m    = 280
```

Dodatkowe warunki: brak przecięcia river barrier, zachowanie dokładnych
Peak/Saddle i niezależne zachowanie raw route.

> **RAW TOPOLOGY FIRST --- SMOOTHING LAST**

V0.6b jest aktualnym wariantem do przyszłej publikacji, ale nie jest
źródłem topologii.

------------------------------------------------------------------------

## 7. Problem tysięcy nakładających się tras

Dla całych Karpat będą istnieć tysiące tras Peak → Saddle, a wiele z
nich będzie korzystać z tych samych fragmentów głównych grzbietów.

Nie należy więc docelowo przechowywać systemu wyłącznie jako tysiące
pełnych LINESTRING-ów.

Docelowo tworzymy **kanoniczną sieć grzbietową**.

------------------------------------------------------------------------

## 8. Kanoniczna sieć grzbietowa

Sieć składa się z `ridge_nodes` i `ridge_edges`. Każdy unikalny fragment
grzbietu powinien występować tylko raz.

Jeżeli kolejna trasa dołącza do środka istniejącego edge, edge zostaje
podzielony. Stary edge otrzymuje `active = 0`, a nowe mogą przechowywać
`parent_edge_id`.

------------------------------------------------------------------------

## 9. Trasa jako lista `edge_id`

Konkretna trasa może być zapisana jako uporządkowana lista krawędzi:

``` text
route_id = 125

seq   edge_id
1     8812
2     8813
3     8840
4     9101
```

Jeżeli wiele szczytów korzysta z `edge 9101`, jego geometria nadal
istnieje tylko raz.

Tabela `route_edges` łączy logiczną trasę z kanoniczną siecią.

------------------------------------------------------------------------

## 10. Podział istniejącego edge

Jeżeli kilka tras używa `edge 100`, a zostanie on podzielony na
`edge 101` i `edge 102`, referencje starych tras są aktualizowane z
`100` na `101, 102`.

Dzięki temu późniejsza rozbudowa sieci nie zmienia znaczenia wcześniej
obliczonych tras.

------------------------------------------------------------------------

## 11. Strategia V1: batch network build

Na pierwszym etapie nie aktualizujemy kanonicznej sieci po każdej
trasie.

``` text
1. calculate raw routes
2. store raw routes
3. BUILD RIDGE NETWORK
4. node / split
5. deduplicate
6. create ridge_nodes
7. create ridge_edges
8. create route_edges
9. optionally render 6b
```

Można najpierw policzyć 100, 500 lub 1000 tras i okresowo przebudowywać
sieć. Później możliwy jest incremental update.

------------------------------------------------------------------------

## 12. Lokalna architektura katalogów

``` text
AKT-Mamut/
│
├─ app/
├─ modules/
│  └─ prominence/
│     ├─ routing/
│     ├─ network/
│     ├─ smoothing/
│     └─ db/
│
├─ data/
│  └─ prominence/
│     ├─ sources/
│     │  ├─ merit/
│     │  │  ├─ basins22.db
│     │  │  ├─ rivers22.db
│     │  │  ├─ basins23.db
│     │  │  └─ rivers23.db
│     │  └─ dem/
│     │     └─ CarpathiansDEM.tif
│     ├─ cache/
│     │  ├─ merit/
│     │  ├─ graphs/
│     │  └─ tmp/
│     ├─ db/
│     │  └─ prominence.gpkg
│     ├─ runs/
│     │  └─ logs/
│     └─ exports/
│        ├─ raw/
│        ├─ smooth_6b/
│        └─ web/
│
└─ config/
   └─ prominence.yaml
```

### Zasady katalogów

-   `sources/` --- oryginalne dane, **read-only**.
-   `cache/` --- dane odtwarzalne; można usunąć i odbudować.
-   `db/prominence.gpkg` --- główna baza robocza.
-   `runs/` --- logi i diagnostyka.
-   `exports/` --- produkty pochodne/publikacyjne.

------------------------------------------------------------------------

## 13. Dlaczego GeoPackage

Główny lokalny magazyn: `prominence.gpkg`.

GeoPackage jest oparty na SQLite, więc daje jednocześnie zwykłe tabele
SQL, geometrie GIS, indeksy przestrzenne, łatwy dostęp z Pythona,
natywne otwieranie w QGIS i jeden przenośny plik.

Na etapie V1 nie ma potrzeby uruchamiania osobnego serwera bazodanowego.

------------------------------------------------------------------------

## 14. Schemat bazy V1

### `peaks`

``` sql
CREATE TABLE peaks (
    peak_id INTEGER PRIMARY KEY,
    name TEXT,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    elevation_m REAL,
    source_id TEXT,
    active INTEGER DEFAULT 1
);
```

Geometria: `POINT / EPSG:4326`.

### `saddles`

``` sql
CREATE TABLE saddles (
    saddle_id INTEGER PRIMARY KEY,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    elevation_m REAL,
    active INTEGER DEFAULT 1
);
```

Geometria: `POINT / EPSG:4326`.

### `routes`

``` sql
CREATE TABLE routes (
    route_id INTEGER PRIMARY KEY,
    peak_id INTEGER NOT NULL,
    saddle_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    algorithm_version TEXT,
    corridor_km REAL,
    straight_distance_m REAL,
    raw_distance_m REAL,
    peak_snap_m REAL,
    saddle_snap_m REAL,
    peak_exact_ok INTEGER,
    saddle_exact_ok INTEGER,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (peak_id) REFERENCES peaks(peak_id),
    FOREIGN KEY (saddle_id) REFERENCES saddles(saddle_id)
);
```

### `ridge_nodes`

``` sql
CREATE TABLE ridge_nodes (
    node_id INTEGER PRIMARY KEY,
    node_type TEXT,
    elevation_m REAL,
    created_at TEXT,
    active INTEGER DEFAULT 1
);
```

Geometria: `POINT`.

Przykładowe `node_type`: `junction`, `peak`, `saddle`, `river_cut`,
`split`.

### `ridge_edges`

``` sql
CREATE TABLE ridge_edges (
    edge_id INTEGER PRIMARY KEY,
    from_node INTEGER NOT NULL,
    to_node INTEGER NOT NULL,
    parent_edge_id INTEGER,
    length_m REAL,
    min_elev_m REAL,
    mean_elev_m REAL,
    max_elev_m REAL,
    merit_basin TEXT,
    source TEXT DEFAULT 'MERIT',
    active INTEGER DEFAULT 1,
    created_at TEXT,
    FOREIGN KEY (from_node) REFERENCES ridge_nodes(node_id),
    FOREIGN KEY (to_node) REFERENCES ridge_nodes(node_id),
    FOREIGN KEY (parent_edge_id) REFERENCES ridge_edges(edge_id)
);
```

Geometria: `LINESTRING`.

### `route_edges`

``` sql
CREATE TABLE route_edges (
    route_id INTEGER NOT NULL,
    seq INTEGER NOT NULL,
    edge_id INTEGER NOT NULL,
    direction INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (route_id, seq),
    FOREIGN KEY (route_id) REFERENCES routes(route_id),
    FOREIGN KEY (edge_id) REFERENCES ridge_edges(edge_id)
);
```

`direction` pozwala używać tej samej krawędzi w obu kierunkach.

### `route_runs`

``` sql
CREATE TABLE route_runs (
    run_id INTEGER PRIMARY KEY,
    route_id INTEGER NOT NULL,
    algorithm_version TEXT,
    parameters_json TEXT,
    corridor_km REAL,
    basins_count INTEGER,
    rivers_count INTEGER,
    graph_nodes INTEGER,
    graph_edges INTEGER,
    duration_s REAL,
    status TEXT,
    error_message TEXT,
    created_at TEXT,
    FOREIGN KEY (route_id) REFERENCES routes(route_id)
);
```

### `route_raw`

Na etapie V1 zachowujemy pełne surowe geometrie tras.

``` sql
CREATE TABLE route_raw (
    route_id INTEGER PRIMARY KEY,
    algorithm_version TEXT,
    corridor_km REAL,
    created_at TEXT,
    FOREIGN KEY (route_id) REFERENCES routes(route_id)
);
```

Geometria: `LINESTRING`.

`route_raw` pełni funkcję audytową, diagnostyczną i jest źródłem do
przebudowy kanonicznej sieci.

### `route_publish`

Cache geometrii publikacyjnych:

``` sql
CREATE TABLE route_publish (
    route_id INTEGER NOT NULL,
    style_version TEXT NOT NULL,
    created_at TEXT,
    PRIMARY KEY (route_id, style_version)
);
```

Geometria: `LINESTRING`.

Przykład: `style_version = 6b`.

`route_publish` nie jest źródłem prawdy i może być zawsze wygenerowane
ponownie.

------------------------------------------------------------------------

## 15. Co znajduje się w bazie, a co poza nią

  Dane                             Lokalizacja
  -------------------------------- ----------------------------------
  `basinsXX.db`                    `data/prominence/sources/merit/`
  `riversXX.db`                    `data/prominence/sources/merit/`
  `CarpathiansDEM.tif`             `data/prominence/sources/dem/`
  lokalne cache                    `data/prominence/cache/`
  peaks / saddles                  `prominence.gpkg`
  raw routes                       `prominence.gpkg`
  ridge nodes / edges              `prominence.gpkg`
  route → edge relations           `prominence.gpkg`
  cache 6b                         `prominence.gpkg` lub `exports/`
  pliki publikowane w internecie   `exports/web/`

DEM i oryginalne bazy MERIT nie są kopiowane do `prominence.gpkg`.

------------------------------------------------------------------------

## 16. Konfiguracja

Kod nie powinien zawierać zaszytych absolutnych ścieżek Windows.

``` yaml
prominence:
  database: data/prominence/db/prominence.gpkg

  merit_dir: data/prominence/sources/merit
  dem: data/prominence/sources/dem/CarpathiansDEM.tif

  cache_dir: data/prominence/cache
  export_dir: data/prominence/exports

  routing:
    river_block_m: 45

  smoothing:
    publish_version: 6b
    resample_m: 220
    spline_s: 45000
    second_pass_s: 22000
    spline_step_m: 10
    max_deviation_m: 280
```

------------------------------------------------------------------------

## 17. Lokalnie vs internet

### V1

``` text
AKT Mamut → Python → MERIT + DEM → prominence.gpkg
```

Internet otrzymuje jedynie gotowe produkty publikacyjne.

### Możliwa przyszłość

Architektura pozwala później przejść np. z GeoPackage/SQLite do PostGIS
i opakować Python routing przez FastAPI.

Frontend mógłby wysyłać `peak_id + saddle_id`, a backend zwracać raw
ridge, 6b ridge i metadata.

------------------------------------------------------------------------

## 18. Zasady projektu V1

1.  MERIT jest źródłem topologii.
2.  DEM jest źródłem scoringu wysokościowego, nie geometrii ridge.
3.  Rzeki są twardymi barierami.
4.  Raw route jest ważniejszy niż wygląd finalnej linii.
5.  Smoothing jest produktem pochodnym.
6.  V0.6b jest aktualnym standardem publikacyjnym.
7.  Dokładne Peak/Saddle powinny być końcami finalnej geometrii.
8.  Raw routes zachowujemy dla audytu i rebuildów.
9.  Docelową reprezentacją jest wspólna sieć `nodes + edges`.
10. Trasy są relacjami do wspólnych edge'ów.
11. Cache można usunąć i odbudować.
12. Sources są read-only.
13. Publikacja internetowa nie jest źródłem prawdy.
14. Kod nie może zależeć od sztywnych absolutnych ścieżek Windows.
15. Algorytm i parametry każdego runu muszą być wersjonowane.

------------------------------------------------------------------------

## 19. Workflow V1

``` text
PEAK + SADDLE
      ↓
wybór lokalnych danych MERIT
      ↓
l0_basins
      ↓
ridge candidate network
      ↓
river cuts
      ↓
DEM scoring
      ↓
A* routing
      ↓
exact endpoint anchoring
      ↓
route_raw
      ↓
prominence.gpkg
```

Okresowo:

``` text
route_raw × N
      ↓
BUILD RIDGE NETWORK
      ↓
noding → splitting → deduplication
      ↓
ridge_nodes + ridge_edges
      ↓
route_edges
```

Publikacja:

``` text
route_edges
      ↓
reconstruct raw geometry
      ↓
smoothing 6b
      ↓
route_publish
      ↓
web export
```

------------------------------------------------------------------------

## 20. Następny etap

1.  Utworzyć strukturę `data/prominence/`.
2.  Utworzyć `prominence.gpkg`.
3.  Zaimplementować schemat bazy V1.
4.  Przenieść `ridge_generic` do `modules/prominence/routing/`.
5.  Zapisywać pierwsze `route_raw`.
6.  Wykonać batch test na kilku--kilkunastu Peak → Saddle.
7.  Następnie zaimplementować `BUILD RIDGE NETWORK`.

------------------------------------------------------------------------

## Decyzja architektoniczna V1

> **Lokalnie przechowujemy oryginalne źródła, raw routes oraz kanoniczną
> topologię grzbietów. Internet jest warstwą publikacyjną. Geometria 6b
> jest produktem końcowym, który zawsze można odtworzyć z danych
> źródłowych.**
