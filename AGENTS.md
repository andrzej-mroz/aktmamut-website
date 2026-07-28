# AKT Mamut — instrukcje dla Codex

## Struktura projektu

Ten lokalny projekt ma dwa główne katalogi:

- `data/` — fabryka AKT Mamut: dane robocze, skrypty Python, GPX, GeoJSON, backupy i credentials lokalne.
- `site/` — strona publikowana jako aktmamut.eu przez GitHub/Netlify.

## Najważniejsza zasada

Codex ma działać ostrożnie i małymi krokami.

Najpierw analizuj, potem proponuj zmianę. Nie przebudowuj całego projektu naraz.

## Czego nie wolno bez wyraźnej zgody

- Nie usuwaj plików z `data/`.
- Nie usuwaj GPX, GeoJSON, backupów, zdjęć ani plików HTML.
- Nie zmieniaj struktury katalogów.
- Nie zmieniaj konfiguracji Netlify.
- Nie dodawaj sekretów do repozytorium.
- Nie commituj plików `.env`, kluczy API, tokenów ani plików z `data/creds/`.
- Nie wykonuj automatycznego `git push`.
- Nie publikuj produkcji samodzielnie.
- Nie przebudowuj całej strony naraz.

## Obecny sposób pracy

Praca odbywa się lokalnie w VS Code.

Typowy przepływ:

1. edycja skryptów i danych lokalnie,
2. uruchamianie skryptów Python,
3. generowanie plików wynikowych do `site/`,
4. ręczne sprawdzenie strony,
5. synchronizacja z GitHub,
6. publikacja przez Netlify.

## Rola Codex

Codex ma pomagać w:

- tworzeniu i poprawianiu skryptów Python,
- porządkowaniu pojedynczych plików,
- wykrywaniu błędów,
- refaktoryzacji małych fragmentów,
- dodawaniu prostych testów,
- przygotowywaniu zmian do ręcznego sprawdzenia.

## Styl zmian

Każda zmiana powinna mieć:

- krótki opis, co zostało zmienione,
- listę dotkniętych plików,
- instrukcję, jak sprawdzić wynik lokalnie.

Preferuj małe zmiany zamiast dużych przebudów.
