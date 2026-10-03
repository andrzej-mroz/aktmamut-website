@'

# AKT MAMUT WEBSITE — kontekst techniczny projektu

Wersja: 1.0
Data aktualizacji: 2026-10-03

## 1. Cel dokumentu

Ten plik jest aktualnym źródłem kontekstu technicznego projektu AKT MAMUT WEBSITE.

Ma umożliwiać kontynuowanie pracy w nowych rozmowach bez ponownego odtwarzania architektury, struktury projektu i wcześniejszych decyzji.

Nie jest pełnym dziennikiem wszystkich prób i zmian.

Jeżeli informacja nie jest potwierdzona, należy ją oznaczyć jako DO UZUPEŁNIENIA zamiast ją zgadywać.

Nie przechowywać tutaj haseł, tokenów, kluczy API ani innych sekretów.

## 2. Projekt

Nazwa projektu:

AKT MAMUT WEBSITE

Publiczny adres:

https://aktmamut.eu

Projekt jest główną witryną AKT Mamut.

Songbook nie jest już częścią tego projektu.

## 3. Repozytorium i lokalizacja

Lokalna ścieżka na PC:

C:\github\aktmamut-website

Główna gałąź Git:

main

Repozytorium GitHub:

andrzej-mroz/aktmamut-website

Projekt jest niezależny od:

C:\github\songbook

oraz:

C:\github\dom-michalowice

## 4. Przyjęta architektura

Przyjęta zasada:

- główna witryna aktmamut.eu ma własne repozytorium,
- niezależne aplikacje mają osobne repozytoria,
- niezależne aplikacje mogą mieć własne subdomeny aktmamut.eu,
- niezależna aplikacja ma własny deployment.

Aktualne przykłady:

aktmamut.eu

- repo: aktmamut-website

songbook.aktmamut.eu

- repo: songbook

dom.aktmamut.eu

- repo: dom-michalowice

## 5. Technologia

Framework:

Astro

Aktualna zależność w package.json:

astro ^7.3.1

Node:

> =22.12.0

Projekt jest aplikacją statyczną.

Konfiguracja Astro:

astro.config.mjs

Istotne ustawienie:

output: static

Markdown ma wyłączony syntaxHighlight.

## 6. Główna struktura src

src/

- components/
- content/
- data/
- layouts/
- pages/
- styles/
- content.config.ts

## 7. Komponenty

### Challenges

src/components/challenges/

Pliki:

- ChallengeMap.astro
- ChallengesList.astro

### Desktop

src/components/desktop/

Pliki:

- DesktopHeader.astro
- DesktopHome.astro

### Expeditions

src/components/expeditions/

Pliki:

- ExpeditionsMap.astro

### Home

src/components/home/

Pliki:

- AboutProjectSection.astro
- FeaturedDirectionsSection.astro
- HomeHero.astro
- ProjectModulesSection.astro
- ProjectStatementSection.astro

### Mobile

src/components/mobile/

Pliki:

- MobileHeader.astro
- MobileHome.astro

### Statistics

src/components/statistics/

Pliki:

- StatisticsTable.astro

### Wspólne

src/components/SiteFooter.astro

## 8. Content

Katalog:

src/content/manual/

Plik:

src/content/manual/index.md

Konfiguracja content:

src/content.config.ts

## 9. Dane aplikacji

Katalog:

src/data/

Pliki:

- homepage.ts
- navigation.ts
- routes.ts
- statistics.types.ts

## 10. Layouty

Katalog:

src/layouts/

Pliki:

- BaseLayout.astro
- ContentLayout.astro

## 11. Strony

Główna strona:

src/pages/index.astro

### Challenges

src/pages/challenges/index.astro

Dynamiczna strona:

src/pages/challenges/[key].astro

### Expeditions

src/pages/expeditions/index.astro

### Manual

src/pages/manual/index.astro

### Statistics

src/pages/statistics/index.astro

## 12. Style

Katalog:

src/styles/

Pliki:

- content.css
- global.css

## 13. Songbook

Songbook był wcześniej częścią projektu aktmamut-website.

Znajdował się między innymi w:

data/songbook/

src/lib/songbook/

src/pages/songbook/

src/scripts/songbook.js

src/styles/songbook.css

2026-10-03 Songbook został wydzielony do osobnego projektu:

C:\github\songbook

Repozytorium:

andrzej-mroz/songbook

Publiczny adres:

https://songbook.aktmamut.eu

Po potwierdzeniu działania samodzielnego Songbooka jego stare pliki zostały usunięte z aktmamut-website.

Nie utrzymujemy starego adresu:

aktmamut.eu/songbook

Nie utrzymujemy przekierowania.

## 14. Development

Standardowy tryb:

npm run dev

Build:

npm run build

Preview:

npm run preview

Aktualne skrypty package.json obejmują:

- audit:statistics
- validate:statistics-contract
- dev
- start
- build
- preview
- astro

## 15. Statystyki

Projekt posiada osobne skrypty:

scripts/audit-statistics-data.mjs

scripts/validate-statistics-contract.mjs

Odpowiadają im komendy:

npm run audit:statistics

npm run validate:statistics-contract

Szczegółowa logika danych statystycznych wymaga sprawdzenia w plikach projektu przed dalszym dokumentowaniem.

## 16. Deployment

Hosting:

Netlify

Publiczny adres:

https://aktmamut.eu

Projekt jest wersjonowany w Git i wdrażany z repozytorium GitHub.

Szczegóły bieżącej konfiguracji Netlify powinny być uzupełniane wyłącznie po potwierdzeniu w panelu lub konfiguracji projektu.

## 17. DNS i domena

Domena:

aktmamut.eu

DNS domeny jest obsługiwany przez Netlify DNS.

Subdomeny takie jak:

songbook.aktmamut.eu

oraz:

dom.aktmamut.eu

mogą być przypisywane do niezależnych projektów Netlify.

AZ.pl pozostaje związane z domeną jako rejestrator.

## 18. Zasady pracy

Przy zmianach:

1. ustalić aktualny stan,
2. wykonać jedną logiczną zmianę,
3. przetestować lokalnie,
4. dopiero potem commit i push,
5. sprawdzić deployment produkcyjny.

Nie zgadywać:

- nazw plików,
- nazw komponentów,
- routingu,
- zależności,
- konfiguracji Netlify,
- danych statystycznych,
- wcześniejszych ustaleń.

Po większych zmianach aktualizować ten dokument.

## 19. Stan bieżący — 2026-10-03

Potwierdzone jako działające:

- osobne repozytorium aktmamut-website,
- główna witryna aktmamut.eu,
- Astro,
- struktura komponentów desktop/mobile,
- strona główna,
- Challenges,
- Expeditions,
- Manual,
- Statistics,
- Netlify,
- GitHub,
- niezależność od Songbooka,
- niezależność od DOM MICHAŁOWICE.

## 20. Otwarte tematy

- dalszy rozwój głównej witryny,
- rozwój Challenges,
- rozwój Expeditions,
- rozwój Statistics,
- dalsze porządkowanie danych i contentu,
- okresowa aktualizacja Astro i zależności,
- aktualizacja tego dokumentu po większych zmianach.
  '@ | Set-Content .\CONTEXT.md -Encoding utf8
