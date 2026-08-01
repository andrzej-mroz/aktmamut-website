# Challenges — instrukcja utrzymania

## 1. Cel

Moduł Challenges prezentuje:

- listę wszystkich aktywnych wyzwań,
- liczbę szczytów w każdym wyzwaniu,
- liczbę ukończonych szczytów,
- procent realizacji,
- mapę wybranego challenge’u,
- zielone markery `done`,
- bordowe markery `todo`,
- informacje o szczycie w tooltipie i popupie.

```markdown
Frontend działa w Astro.

Dane produkcyjne są generowane bezpośrednio do katalogu `public/`.

Aktualna wersja korzysta z plików w:
```

Aktualna wersja korzysta z plików w:

```text
public/challenges/data/
public/assets/challenges/
src/pages/challenges/
src/components/challenges/
```

---

## 2. Struktura nowego modułu

```text
src/
├── components/
│   └── challenges/
│       ├── ChallengesList.astro
│       └── ChallengeMap.astro
│
└── pages/
    └── challenges/
        ├── index.astro
        └── [key].astro

public/
├── assets/
│   └── challenges/
│       ├── pl.svg
│       ├── ro.svg
│       ├── sk.svg
│       └── ...
│
└── challenges/
    └── data/
        ├── challenges-index.json
        ├── challenges-pl.json
        ├── challenges-ro.json
        ├── challenges-sk.json
        └── ...
```

Adresy stron:

```text
/challenges
/challenges/pl
/challenges/ro
/challenges/sk
```

Klucz challenge’u jest używany jednocześnie:

- w adresie strony,
- w `challenges-index.json`,
- w nazwie pliku z danymi.

Przykład:

```text
key: ro
adres: /challenges/ro
plik: challenges-ro.json
```

---

## 3. Źródło danych

Dane Challenges są utrzymywane w Google Sheets.

Arkusz zawiera:

- zakładkę `CONFIG`,
- osobne zakładki dla poszczególnych challenge’y.

Typowe kolumny danych challenge’u:

```text
NR
PEAK
REGION
SUBREGION
HEIGHT
EXPEDITION
DATE
LAT
LON
```

Generator może dodatkowo utworzyć pole:

```text
status
```

Obsługiwane wartości:

```text
done
todo
```

---

## 4. Format pojedynczego szczytu

Przykładowy rekord:

```json
{
  "number": 21,
  "peak": "Ocolasul Mare\nRO Ocolaşul Mare - Wielki Okolaszul",
  "region": "Karpaty Wschodnie\nZłota Bystrzyca",
  "subregion": "Ciahlau\nRO Masivul Ceahlău",
  "height": 1907,
  "expedition": "2517",
  "date": "45827",
  "lat": 46.9547,
  "lon": 25.9453,
  "status": "done"
}
```

Znaczenie pól:

| Pole         | Znaczenie                                   |
| ------------ | ------------------------------------------- |
| `number`     | numer szczytu w challenge’u                 |
| `peak`       | nazwa szczytu, opcjonalnie w kilku językach |
| `region`     | główny region górski                        |
| `subregion`  | pasmo lub podregion                         |
| `height`     | wysokość w metrach                          |
| `expedition` | numer ekspedycji AKT Mamut                  |
| `date`       | data wejścia albo numer daty Excela         |
| `lat`        | szerokość geograficzna                      |
| `lon`        | długość geograficzna                        |
| `status`     | `done` albo `todo`                          |

---

## 5. Status `done` i `todo`

Frontend rozpoznaje szczyt jako ukończony, gdy:

```text
status = done
```

albo, przy braku pola `status`, gdy pole `date` nie jest puste.

Szczyt nieukończony:

```text
status = todo
```

Najbezpieczniej zawsze generować jawne pole:

```json
"status": "done"
```

lub:

```json
"status": "todo"
```

Kolory na mapie:

```text
done — zielony
todo — bordowy
```

---

## 6. Daty

Pole `date` może zawierać:

```text
45827
```

czyli numer daty Excela, albo gotowy tekst:

```text
2025-06-19
19.06.2025
```

Frontend:

- przelicza wartości liczbowe z formatu Excela,
- pozostawia poprawną datę tekstową bez zmian,
- dla pustej wartości pokazuje `—`.

Nie trzeba ręcznie przeliczać numerów Excela w plikach JSON.

---

## 7. Dodanie nowego szczytu do istniejącego challenge’u

### Krok 1 — edycja Google Sheets

Otwórz zakładkę odpowiadającą challenge’owi, np.:

```text
RO
PL
SK
```

Dodaj nowy wiersz i uzupełnij co najmniej:

```text
NR
PEAK
HEIGHT
LAT
LON
```

Dla niezdobytego szczytu pozostaw puste:

```text
EXPEDITION
DATE
```

Dla zdobytego szczytu uzupełnij:

```text
EXPEDITION
DATE
```

### Krok 2 — uruchomienie generatora

Dotychczasowy generator:

```text
data/generate_challenges.py
```

Uruchomienie:

```powershell
python .\data\generate_challenges.py
```

Generator powinien zaktualizować odpowiedni plik:

```text
challenges-<key>.json
```

Przykład:

```text
challenges-ro.json
```

### Krok 3 — kontrola danych wyjściowych

Nowy frontend czyta pliki z:

```text
public/challenges/data/
```

Generator zapisuje dane bezpośrednio do:

````text
public/challenges/data/

### Krok 4 — kontrola

Uruchom:

```powershell
npm run dev
````

Sprawdź:

```text
http://localhost:4321/challenges
```

oraz odpowiednią mapę, np.:

```text
http://localhost:4321/challenges/ro
```

Zweryfikuj:

- liczbę wszystkich szczytów,
- liczbę ukończonych,
- procent postępu,
- numer markera,
- kolor markera,
- nazwę szczytu,
- wysokość,
- datę,
- współrzędne.

---

## 8. Dodanie nowego challenge’u

### Krok 1 — utworzenie zakładki w Google Sheets

Utwórz nową zakładkę zawierającą dane szczytów.

Zachowaj kolumny:

```text
NR
PEAK
REGION
SUBREGION
HEIGHT
EXPEDITION
DATE
LAT
LON
```

### Krok 2 — dodanie pozycji do `CONFIG`

Dodaj nowy wiersz w zakładce `CONFIG`.

Przykładowe pola:

| Pole     | Przykład                |
| -------- | ----------------------- |
| `key`    | `tatry`                 |
| `sheet`  | `TATRY`                 |
| `name`   | `Korona Tatr`           |
| `icon`   | `/assets/img/tatry.svg` |
| `active` | `1`                     |
| `order`  | `17`                    |

Zasady dla `key`:

- używaj małych liter,
- bez spacji,
- bez polskich znaków,
- klucz musi być unikalny,
- klucz jest częścią adresu URL i nazwy pliku.

Przykład:

```text
key: tatry
```

utworzy:

```text
/challenges/tatry
challenges-tatry.json
```

### Krok 3 — uruchomienie generatora

```powershell
python .\data\generate_challenges.py
```

Powinny powstać lub zostać zaktualizowane:

```text
challenges-index.json
challenges-tatry.json
```

### Krok 4 — dodanie ikony

Skopiuj ikonę do:

```text
public/assets/challenges/
```

Przykład:

```text
public/assets/challenges/tatry.svg
```

W `challenges-index.json` może pozostać stara ścieżka:

```json
"icon": "/assets/img/tatry.svg"
```

Komponent `ChallengesList.astro` pobiera nazwę pliku i używa nowego katalogu:

```text
/assets/challenges/tatry.svg
```

Obsługiwane formaty:

```text
.svg
.png
.webp
.jpg
.jpeg
```

### Krok 5 — sprawdzenie indeksu

Nowa pozycja w `challenges-index.json`:

```json
{
  "key": "tatry",
  "name": "Korona Tatr",
  "icon": "/assets/img/tatry.svg"
}
```

### Krok 6 — build

Dynamiczna strona `[key].astro` generuje osobną statyczną stronę dla każdego wpisu znajdującego się w:

```text
challenges-index.json
```

Dlatego po dodaniu challenge’u uruchom:

```powershell
npm run build
```

Wynik powinien zawierać stronę:

```text
/challenges/tatry
```

---

## 9. Lista challenge’y

Strona:

```text
/challenges
```

jest generowana przez:

```text
src/pages/challenges/index.astro
src/components/challenges/ChallengesList.astro
```

Dla każdego challenge’u frontend liczy:

```text
total = liczba wszystkich rekordów
done = liczba rekordów ukończonych
percent = done / total × 100
```

Kolejność kart wynika z kolejności wpisów w:

```text
public/challenges/data/challenges-index.json
```

Aby zmienić kolejność, zmień kolejność wpisów w indeksie lub pole `order` w Google Sheets, jeżeli generator je obsługuje.

---

## 10. Mapa pojedynczego challenge’u

Mapa działa pod adresem:

```text
/challenges/<key>
```

Przykłady:

```text
/challenges/pl
/challenges/ro
/challenges/sk
```

Pliki odpowiedzialne za mapę:

```text
src/pages/challenges/[key].astro
src/components/challenges/ChallengeMap.astro
```

Mapa automatycznie:

- pobiera właściwy plik JSON,
- tworzy markery,
- dopasowuje widok do wszystkich punktów,
- pokazuje status i postęp,
- przelicza numery dat Excela,
- generuje tooltip,
- generuje popup,
- udostępnia warstwy mapowe.

---

## 11. Typowe problemy

### Challenge nie pojawia się na liście

Sprawdź:

```text
public/challenges/data/challenges-index.json
```

Pozycja musi mieć:

```json
{
  "key": "...",
  "name": "...",
  "icon": "..."
}
```

### Strona `/challenges/<key>` nie istnieje

Sprawdź:

- czy `key` znajduje się w `challenges-index.json`,
- czy wykonano `npm run build`,
- czy nazwa klucza nie zawiera spacji lub wielkich liter.

### Mapa pokazuje „Map unavailable”

Sprawdź, czy istnieje:

```text
public/challenges/data/challenges-<key>.json
```

Przykład:

```text
public/challenges/data/challenges-ro.json
```

### Marker nie pojawia się na mapie

Sprawdź pola:

```text
lat
lon
```

Muszą być liczbami zapisanymi z kropką dziesiętną:

```json
"lat": 45.7972,
"lon": 26.4174
```

### Marker ma niewłaściwy kolor

Sprawdź:

```json
"status": "done"
```

lub:

```json
"status": "todo"
```

### Nie wyświetla się ikona

Sprawdź, czy plik istnieje w:

```text
public/assets/challenges/
```

Nazwa pliku musi być zgodna z nazwą używaną w indeksie.

---

## 12. Test przed publikacją

### Test listy

Otwórz:

```text
/challenges
```

Sprawdź:

- wszystkie karty,
- ikony,
- liczby Peaks,
- liczby Completed,
- procenty,
- paski postępu,
- linki Open challenge.

### Test map

Sprawdź co najmniej:

```text
/challenges/pl
/challenges/ro
/challenges/sk
```

Zweryfikuj:

- przesuwanie mapy,
- zoom kółkiem,
- tooltip,
- popup,
- daty,
- kolory markerów,
- przełącznik warstw,
- działanie na telefonie.

### Kontrola techniczna

```powershell
npm run build
git diff --check
git status
```

---

## 13. Publikacja

Dodaj zmienione dane:

```powershell
git add -- public/challenges/data
git add -- public/assets/challenges
```

Jeżeli zmieniany był także frontend:

```powershell
git add -- src/pages/challenges
git add -- src/components/challenges
```

Commit przykładowej aktualizacji danych:

```powershell
git commit -m "Update challenges data"
```

Push:

```powershell
git push origin main
```

Netlify powinno automatycznie zbudować i opublikować nową wersję.

---

## 14. Checklista — aktualizacja istniejącego challenge’u

```text
[ ] Dane zmienione w Google Sheets
[ ] Generator Python uruchomiony
[ ] challenges-<key>.json zaktualizowany
[ ] Plik skopiowany do public/challenges/data
[ ] Liczba Peaks jest poprawna
[ ] Liczba Completed jest poprawna
[ ] Mapa działa
[ ] Tooltip działa
[ ] Popup działa
[ ] Daty są poprawne
[ ] npm run build zakończony bez błędów
[ ] Zmiany zapisane w Git
[ ] Netlify opublikowało nową wersję
```

---

## 15. Checklista — nowy challenge

```text
[ ] Nowa zakładka utworzona w Google Sheets
[ ] Kolumny danych są kompletne
[ ] Nowy wpis dodany do CONFIG
[ ] key jest unikalny i zapisany małymi literami
[ ] Generator Python uruchomiony
[ ] challenges-index.json zaktualizowany
[ ] challenges-<key>.json utworzony
[ ] JSON-y skopiowane do public/challenges/data
[ ] Ikona skopiowana do public/assets/challenges
[ ] Karta pojawia się na /challenges
[ ] Adres /challenges/<key> działa
[ ] Mapa pokazuje wszystkie szczyty
[ ] Statusy done/todo są poprawne
[ ] npm run build zakończony bez błędów
[ ] Zmiany zapisane w Git
[ ] Netlify opublikowało nową wersję
```
