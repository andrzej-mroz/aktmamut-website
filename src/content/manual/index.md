---
title: "Manual: EXPEDITIONS + CHALLENGES"
description: "Aktualny workflow AKT MAMUT dla Expeditions i Challenges, obejmujący dane, generowanie, test lokalny i publikację."
lang: "pl"
updated: 2026-03-10
eyebrow: "AKT MAMUT"
---

Aktualna wersja workflow po przejściu na strukturę `data` + `site`.

<h2 id="struktura-projektu">Struktura projektu</h2>

```text
AKT-MAMUT
├─ data
│   ├─ backups
│   ├─ creds
│   ├─ gpx
│   ├─ geojson
│   │   └─ RAW
│   ├─ generate_geojson.py
│   └─ generate_challenges.py
│
└─ site
    ├─ assets
    ├─ challenges
    │   ├─ index.html
    │   └─ data
    ├─ expeditions
    │   ├─ index.html
    │   ├─ expeditions.js
    │   ├─ markers.js
    │   ├─ expeditions.geojson
    │   └─ markers.json
    ├─ manual
    ├─ pages
    └─ statistics
```

> **Zasada:** `data` = generowanie i dane wejściowe, `site` = publikacja i lokalny podgląd / Netlify.

<h2 id="krok-1-locus-map">Krok 1 – Locus Map</h2>

- Zarejestruj trasę.
- Edytuj trasę: `Moja biblioteka → <TRAIL NAME>`
- Nazwij zgodnie ze standardem, np.: `2025-06-18 07:26 Nemira Mare`
- Aktualizuj wysokość: `Narzędzia → Aktualizacja wysokości`
- Wyeksportuj GPX.

```text
OneDrive/AKT-MAMUT/data/locus
```

<h2 id="krok-2-gpx-track-editor">Krok 2 – GPX Track Editor</h2>

- Otwórz plik GPX.
- Standaryzacja punktów: `Filter → By value → Min distance = 10 m`
- Usunięcie nieścisłości: `Filter → Local inconsistencies`
- Usuń zbędne punkty: `Filter → Delete filtered points`
- Zapisz plik.

```text
OneDrive/AKT-MAMUT/data/locus
```

<h2 id="krok-3-wikiloc">Krok 3 – Wikiloc</h2>

- Otwórz `wikiloc.com`
- Zaloguj się.
- Załaduj plik GPX.
- Otwórz szczegóły trasy.
- Pobierz plik GPX (oryginalny).

```text
OneDrive/AKT-MAMUT/data/gpx
```

<h2 id="krok-4-google-sheets-expeditions">Krok 4 – Google Sheets: AKT Mamut Expeditions</h2>

- Otwórz arkusz `AKT Mamut Expeditions`.
- Dodaj nowy wiersz.
- **Trail GPX** = link do trasy Wikiloc
- **Distance** = długość śladu
- **Up** = suma przewyższeń
- **Time** = czas
- **GPX** = nazwa pliku z katalogu `data/gpx`

<h2 id="krok-5-pipeline-expeditions">Krok 5 – Pipeline EXPEDITIONS</h2>

Uruchom:

```text
update_map.bat
```

Pipeline wykonuje:

1. Pobranie danych z Google Sheets
2. Backup arkusza do CSV (tylko gdy arkusz się zmienił)
3. Audyt GPX vs Google Sheets
4. Generowanie brakujących RAW GeoJSON
5. Scalanie do expeditions.geojson
6. Generowanie markers.json
7. Kopiowanie plików do site/expeditions
8. git add w repo site

Powstają dwa pliki dla mapy:

- `expeditions.geojson` – pełne trasy (kółka + ogonki)
- `markers.json` – lekkie dane do szybkiego startu mapy

Lokalizacje:

```text
data/geojson/expeditions.geojson
data/geojson/markers.json

site/expeditions/expeditions.geojson
site/expeditions/markers.json
```

> Mapa działa w dwóch etapach:
>
> 1. `markers.js` + `markers.json` → szybkie kółka
> 2. `expeditions.js` + `expeditions.geojson` → pełne trasy z ogonkami

<h2 id="krok-6-test-lokalny">Krok 6 – Test lokalny strony</h2>

Serwer lokalny uruchamiaj zawsze z katalogu `site`:

```shell
cd OneDrive/AKT-MAMUT/site
python -m http.server 8000
```

Otwórz:

```text
http://localhost:8000
```

> **Uwaga:** nie uruchamiaj lokalnego podglądu z katalogu `AKT-MAMUT`, bo ścieżki absolutne typu `/assets/...` przestaną działać.

<h2 id="krok-7-publikacja-expeditions">Krok 7 – Publikacja EXPEDITIONS</h2>

W VS Code:

```text
Source Control
Commit
Push
```

Netlify automatycznie zaktualizuje stronę:

```text
https://aktmamut.eu
```

<h2 id="krok-8-challenges-konfiguracja">Krok 8 – CHALLENGES: dane i konfiguracja</h2>

Challenges są generowane z Google Sheets. Zakładka `CONFIG` zawiera tabelę:

| key | sheet | name                     | active |
| --- | ----- | ------------------------ | -----: |
| ro  | RO    | Romanian Peak Challenge  |      1 |
| sk  | SK    | Slovakian Peak Challenge |      1 |
| hu  | HU    | Hungarian Peak Challenge |      1 |
| cz  | CZ    | Czech Peak Challenge     |      1 |
| …   | …     | …                        |      … |

Znaczenie kolumn:

- `key` – identyfikator mapy w URL, np. `ro`, `sk`
- `sheet` – nazwa zakładki Google Sheets z danymi
- `name` – nazwa challenge
- `active` – `1` = włączony, `0` = pomijany

> Dzięki `CONFIG` nie trzeba już edytować kodu przy zmianie nazwy zakładki lub wyłączaniu challenge.

<h2 id="krok-9-pipeline-challenges">Krok 9 – Pipeline CHALLENGES</h2>

Uruchom:

```shell
python data/generate_challenges.py
```

Skrypt:

1. Pobiera CONFIG
2. Wybiera tylko challenge z active = 1
3. Pobiera odpowiednie zakładki Google Sheets
4. Buduje pliki challenges-\*.json
5. Nadpisuje tylko te pliki, które faktycznie się zmieniły

Pliki wynikowe:

```text
site/challenges/data/challenges-ro.json
site/challenges/data/challenges-sk.json
site/challenges/data/challenges-hu.json
site/challenges/data/challenges-cz.json
...
```

> Challenge z `active = 0` są pomijane. Przykład: `raba`.

<h2 id="krok-10-podglad-challenges">Krok 10 – Podgląd CHALLENGES</h2>

Mapy challenges otwierasz przez parametr `region`:

```text
/challenges/index.html?region=ro
/challenges/index.html?region=sk
/challenges/index.html?region=hu
/challenges/index.html?region=cz
```

Przykłady:

```text
https://aktmamut.eu/challenges/index.html?region=ro
https://aktmamut.eu/challenges/index.html?region=sk
```

<h2 id="szybkie-komendy">Szybkie komendy</h2>

```shell
# instalacja bibliotek
python -m pip install -r requirements.txt

# expeditions
cd data
update_map.bat

# challenges
python generate_challenges.py

# lokalny podgląd strony:
cd ../site
python -m http.server 8000
```

Wersja instrukcji: **2026-03-10**
