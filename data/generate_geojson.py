from __future__ import annotations

"""
generate_geojson.py
===================

Cel pliku
---------
Ten skrypt buduje finalny plik `expeditions.geojson` dla mapy AKT Mamut.

Architektura działania
----------------------
1. Łączy się z Google Sheets i pobiera dane z arkusza `AKT Mamut Expeditions`, zakładka `ALL`.
2. Dla każdej trasy buduje pojedynczy plik RAW GeoJSON w folderze `geojson/RAW`.
3. Łączy wszystkie pliki RAW do jednego finalnego pliku `expeditions.geojson`.
4. Kopiuje finalny plik do repozytorium strony `aktmamut.eu`.

Dlaczego RAW -> FINAL?
----------------------
To podejście daje kilka ważnych korzyści:
- nie trzeba przeliczać wszystkich tras od zera przy każdym uruchomieniu,
- łatwiej znaleźć błędną trasę,
- łatwiej debugować i porównywać dane,
- łatwiej bezpiecznie zapisywać wynikowy plik.

Wymagane biblioteki
-------------------
Zainstaluj raz w środowisku Python:
    pip install pandas gspread oauth2client gpxpy

Uwagi o danych z arkusza
------------------------
W tym projekcie:
- kolumna `Trail GPX` zawiera link do Wikiloc,
- kolumna `GPX` zawiera nazwę lokalnego pliku `.gpx`.

To bardzo ważne, bo lokalny plik GPX jest czytany z dysku właśnie na podstawie
kolumny `GPX`, a nie `Trail GPX`.
"""

from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
import json
import re
import shutil
import sys
import time
import filecmp
from typing import Any

import gpxpy
import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials

# =========================================================
# KONFIGURACJA PROJEKTU
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

print("BASE_DIR:", BASE_DIR)

# ============================================================
# FOLDERY DANYCH
# ============================================================

GPX_DIR = BASE_DIR / "gpx"
GEOJSON_DIR = BASE_DIR / "geojson"
RAW_DIR = GEOJSON_DIR / "RAW"
CREDS_PATH = BASE_DIR / "creds" / "credentials.json"

FINAL_FILE = GEOJSON_DIR / "expeditions.geojson"
TMP_FILE = GEOJSON_DIR / "expeditions.tmp.geojson"
MARKERS_FILE = GEOJSON_DIR / "markers.json"
MARKERS_TMP_FILE = GEOJSON_DIR / "markers.tmp.json"

BACKUP_DIR = BASE_DIR / "backups"
BACKUP_DIR.mkdir(exist_ok=True)

# ============================================================
# REPO STRONY
# ============================================================

PROJECT_ROOT = BASE_DIR.parent

SITE_REPO_DIR = PROJECT_ROOT / "public" / "expeditions"
SITE_GEOJSON_FILE = SITE_REPO_DIR / "expeditions.geojson"
SITE_MARKERS_FILE = SITE_REPO_DIR / "markers.json"

# ============================================================
# KONTROLNY PRINT
# ============================================================

print("BASE_DIR          =", BASE_DIR)
print("GPX_DIR           =", GPX_DIR)
print("GEOJSON_DIR       =", GEOJSON_DIR)
print("RAW_DIR           =", RAW_DIR)
print("CREDS_PATH        =", CREDS_PATH)
print("FINAL_FILE        =", FINAL_FILE)
print("MARKERS_FILE      =", MARKERS_FILE)
print("SITE_REPO_DIR     =", SITE_REPO_DIR)
print("SITE_GEOJSON_FILE =", SITE_GEOJSON_FILE)
print("SITE_MARKERS_FILE =", SITE_MARKERS_FILE)

GOOGLE_SHEET_NAME = "AKT Mamut Expeditions"
SHEET_TAB_NAME = "ALL"

# Na jedno pełne przebudowanie ustaw True.
# Potem możesz wrócić na False.
REBUILD_EXISTING_RAW = True

# Jeśli finalny GeoJSON miałby mieć mniej niż tyle tras, zapis zostanie przerwany.
MIN_EXPECTED_FEATURES = 1

# Jeśli istnieje poprzedni finalny GeoJSON, nowy wynik nie powinien mieć
# podejrzanie dużego spadku liczby tras względem poprzedniej wersji.
MIN_FEATURES_RATIO_VS_EXISTING = 0.8


# =========================================================
# PROSTE LOGOWANIE NA EKRAN
# =========================================================


def timestamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def log(message: str) -> None:
    print(f"[{timestamp()}] {message}")


def log_section(title: str) -> None:
    """
    Wyświetla czytelny nagłówek sekcji pipeline.
    """
    width = 70
    title = f"⚙️  {title}"
    line = "━" * width

    print()
    print(line)
    print(title)
    print(line)


def log_ok(message: str) -> None:
    print(f"[{timestamp()}] ✅ {message}")


def log_warn(message: str) -> None:
    print(f"[{timestamp()}] ⚠️  {message}")


def log_error(message: str) -> None:
    print(f"[{timestamp()}] ❌ {message}")


# =========================================================
# FUNKCJE POMOCNICZE
# =========================================================


def backup_sheet_to_csv_if_changed(df: pd.DataFrame) -> None:
    """
    Tworzy backup Google Sheets do CSV tylko wtedy,
    gdy zawartość arkusza zmieniła się względem ostatniego backupu.
    """
    stamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

    tmp_file = BACKUP_DIR / "_latest_tmp.csv"
    backup_file = BACKUP_DIR / f"AKT_Mamut_Expeditions_{stamp}.csv"

    df.to_csv(tmp_file, index=False, encoding="utf-8-sig", sep=";")

    existing_backups = sorted(BACKUP_DIR.glob("AKT_Mamut_Expeditions_*.csv"))

    if existing_backups:
        latest_backup = existing_backups[-1]

        if filecmp.cmp(tmp_file, latest_backup, shallow=False):
            tmp_file.unlink()
            log("🔁 Backup CSV bez zmian – pomijam zapis nowego pliku")
            return

    tmp_file.replace(backup_file)
    log_ok(f"Backup CSV zapisany: {backup_file}")


def audit_gpx_vs_sheet(df: pd.DataFrame, gpx_dir: Path) -> None:
    """
    Porównuje pliki GPX w folderze z wartościami kolumny 'GPX' w Google Sheets.
    """
    sheet_gpx = set()
    for value in df.get("GPX", []):
        value = clean_text(value)
        if value:
            sheet_gpx.add(value)

    folder_gpx = set(path.name for path in gpx_dir.glob("*.gpx"))

    only_in_folder = sorted(folder_gpx - sheet_gpx)
    only_in_sheet = sorted(sheet_gpx - folder_gpx)

    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("🧭 AUDYT GPX: FOLDER vs GOOGLE SHEETS")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"GPX w folderze          : {len(folder_gpx)}")
    print(f"GPX w arkuszu           : {len(sheet_gpx)}")
    print(f"Tylko w folderze        : {len(only_in_folder)}")
    print(f"Tylko w arkuszu         : {len(only_in_sheet)}")

    if not only_in_folder and not only_in_sheet:
        log_ok("Folder GPX i Google Sheets są zgodne")
        return

    if only_in_folder:
        log("⚠️ Pliki GPX obecne w folderze, ale nieobecne w Google Sheets:")
        for name in only_in_folder[:20]:
            print(f"   • {name}")
        if len(only_in_folder) > 20:
            print(f"   ... i jeszcze {len(only_in_folder) - 20} kolejnych")

    if only_in_sheet:
        log("⚠️ Wpisy GPX obecne w Google Sheets, ale brakujące w folderze:")
        for name in only_in_sheet[:20]:
            print(f"   • {name}")
        if len(only_in_sheet) > 20:
            print(f"   ... i jeszcze {len(only_in_sheet) - 20} kolejnych")


def validate_consistency(df: pd.DataFrame, raw_dir: Path, combined: dict) -> None:
    """
    Sprawdza podstawową spójność pipeline.
    """
    sheet_count = len(df)
    raw_count = len(list(raw_dir.glob("*.geojson")))
    final_count = len(combined.get("features", []))

    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("📊 RAPORT SPÓJNOŚCI DANYCH")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"Arkusz Google Sheets : {sheet_count}")
    print(f"Pliki RAW GeoJSON    : {raw_count}")
    print(f"Finalny GeoJSON      : {final_count}")

    if sheet_count == raw_count == final_count:
        log_ok("Spójność danych OK – wszystkie liczby są zgodne")
    else:
        if sheet_count != raw_count:
            log(f"⚠️ Niezgodność: arkusz ({sheet_count}) != RAW ({raw_count})")
        if raw_count != final_count:
            log(f"⚠️ Niezgodność: RAW ({raw_count}) != finalny GeoJSON ({final_count})")
        if sheet_count != final_count:
            log(
                f"⚠️ Niezgodność: arkusz ({sheet_count}) != finalny GeoJSON ({final_count})"
            )


def ensure_directories() -> None:
    """Tworzy wymagane foldery, jeśli jeszcze nie istnieją."""
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    GEOJSON_DIR.mkdir(parents=True, exist_ok=True)
    SITE_REPO_DIR.mkdir(parents=True, exist_ok=True)

    log_ok(f"Folder RAW gotowy: {RAW_DIR}")
    log_ok(f"Folder GEOJSON gotowy: {GEOJSON_DIR}")
    log_ok(f"Folder repo strony gotowy: {SITE_REPO_DIR}")


def clean_text(value: Any) -> str:
    """Zwraca bezpieczny tekst bez zbędnych spacji."""
    if value is None:
        return ""
    return str(value).strip()


def normalize_number_text(value: Any) -> str:
    """
    Normalizuje zapis liczby:
    - usuwa spacje
    - zamienia przecinek na kropkę
    """
    text = clean_text(value)
    text = text.replace(" ", "").replace(",", ".")
    return text


def round_decimal(value: float, places: int) -> float:
    """
    Zaokrągla przewidywalnie (half up), np. 1.005 -> 1.01
    """
    quant = "1." + ("0" * places)
    return float(Decimal(str(value)).quantize(Decimal(quant), rounding=ROUND_HALF_UP))


def to_float_or_none(value: Any, places: int | None = None) -> float | None:
    """
    Zamienia wartość na float.
    Jeśli places podane -> zaokrągla do tylu miejsc.
    """
    text = normalize_number_text(value)
    if text == "":
        return None

    number = float(text)

    if places is not None:
        number = round_decimal(number, places)

    return number


def to_int_or_none(value: Any) -> int | None:
    """
    Zamienia wartość na int.
    Obsługuje też tekst typu '936' lub '936.0' lub '936,0'.
    """
    text = normalize_number_text(value)
    if text == "":
        return None

    return int(round(float(text)))


def to_bool_or_none(value: Any) -> bool | None:
    """
    Obsługuje typowe warianty:
    1, 0, true, false, tak, nie, yes, no
    """
    text = clean_text(value).lower()

    if text in {"1", "true", "tak", "yes", "y"}:
        return True
    if text in {"0", "false", "nie", "no", "n"}:
        return False
    if text == "":
        return None

    raise ValueError(f"Nie można zamienić na bool: {value!r}")


def time_to_minutes_or_none(value: Any) -> int | None:
    """
    Zamienia czas 'H:MM' lub 'HH:MM' na minuty.
    Przykład:
    '8:04' -> 484
    """
    text = clean_text(value)
    if text == "":
        return None

    if ":" not in text:
        raise ValueError(
            f"Nieprawidłowy format czasu, oczekiwano H:MM lub HH:MM: {text!r}"
        )

    hours_str, minutes_str = text.split(":", 1)
    hours = int(hours_str)
    minutes = int(minutes_str)

    if minutes < 0 or minutes >= 60:
        raise ValueError(f"Nieprawidłowe minuty w czasie: {text!r}")

    return hours * 60 + minutes


def slugify_filename(value: str) -> str:
    """Buduje bezpieczną nazwę pliku z dowolnego tekstu."""
    value = clean_text(value)
    value = value.replace(" ", "_")
    value = re.sub(r"[^\w\-]", "_", value)
    value = re.sub(r"_+", "_", value)
    return value.strip("_")


# =========================================================
# GOOGLE SHEETS
# =========================================================


def load_sheet_to_df() -> pd.DataFrame:
    """
    Łączy się z Google Sheets i zwraca dane arkusza jako DataFrame.
    """
    log_section("KROK 1/5 - Wczytywanie danych z Google Sheets")

    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive",
    ]

    if not CREDS_PATH.exists():
        raise FileNotFoundError(f"Nie znaleziono pliku credentials.json: {CREDS_PATH}")

    creds = ServiceAccountCredentials.from_json_keyfile_name(str(CREDS_PATH), scope)
    client = gspread.authorize(creds)

    worksheet = client.open(GOOGLE_SHEET_NAME).worksheet(SHEET_TAB_NAME)
    data = worksheet.get_all_values()

    if not data:
        raise ValueError("Arkusz Google Sheets jest pusty.")

    header = [str(col).strip() for col in data[0]]
    data_rows = data[1:]

    df = pd.DataFrame(data_rows, columns=header)
    df = df.fillna("")

    log_ok(f"Arkusz: {GOOGLE_SHEET_NAME}")
    log_ok(f"Zakładka: {SHEET_TAB_NAME}")
    log_ok(f"Liczba kolumn: {len(header)}")
    log_ok(f"Liczba wierszy: {len(df)}")
    log(f"Kolumny: {header}")

    return df


# =========================================================
# GPX / GEOJSON
# =========================================================


def raw_filename_for_row(row: pd.Series) -> Path:
    """
    Buduje nazwę pliku RAW dla jednej trasy.
    """
    gpx_name = clean_text(row.get("GPX", ""))
    trail_nr = clean_text(row.get("Trail Nr", ""))

    if gpx_name:
        stem = Path(gpx_name).stem
        return RAW_DIR / f"{slugify_filename(stem)}.geojson"

    if trail_nr:
        return RAW_DIR / f"{slugify_filename(trail_nr)}.geojson"

    raise ValueError("Nie można zbudować nazwy RAW: brak 'GPX' i brak 'Trail Nr'.")


def get_gpx_path_for_row(row: pd.Series) -> Path:
    """
    Zwraca ścieżkę do lokalnego pliku GPX.

    WAŻNE:
    - 'Trail GPX' = link do Wikiloc,
    - 'GPX' = nazwa lokalnego pliku GPX.
    """
    gpx_name = clean_text(row.get("GPX", ""))

    if not gpx_name:
        raise ValueError("Brak wartości w kolumnie 'GPX'.")

    gpx_path = GPX_DIR / gpx_name

    if not gpx_path.exists():
        raise FileNotFoundError(f"Nie znaleziono pliku GPX: {gpx_path}")

    return gpx_path


def extract_linestring_coordinates_from_gpx(gpx_path: Path) -> list[list[float]]:
    """
    Odczytuje plik GPX i zwraca listę współrzędnych w formacie GeoJSON:
        [[lon, lat], [lon, lat], ...]
    """
    with open(gpx_path, "r", encoding="utf-8") as f:
        gpx = gpxpy.parse(f)

    coords: list[list[float]] = []

    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                coords.append([point.longitude, point.latitude])

    if len(coords) < 2:
        raise ValueError(f"Za mało punktów w GPX do zbudowania LineString: {gpx_path}")

    return coords


def build_properties_from_row(row: pd.Series) -> dict[str, Any]:
    """
    Buduje `properties` dla jednej trasy.

    Docelowe typy:
    - distance_km: float(2)
    - ascent_m: int
    - duration_min: int
    - duration_text: str
    - got: float(2)
    - got_total: float(2)
    - lat/lon: float(8)
    - only_mountain: bool
    - trail_counter/exp_counter/nr: str
    """
    duration_text = clean_text(row.get("Time", ""))
    duration_min = time_to_minutes_or_none(duration_text)

    return {
        "nr": clean_text(row.get("Trail Nr", "")),
        "date": clean_text(row.get("Date", "")),
        "name": clean_text(row.get("Trail name", "")),
        "mountains": clean_text(row.get("Mountains", "")),
        "country": clean_text(row.get("Country", "")),
        "gpx": clean_text(row.get("GPX", "")),
        "gpx_url": clean_text(row.get("Trail GPX", "")),
        "photo_album_url": clean_text(row.get("Trail Photo Album", "")),
        "photo_stamp_url": clean_text(row.get("Trail Photo Stamp", "")),
        "distance_km": to_float_or_none(row.get("Distance", ""), places=2),
        "ascent_m": to_int_or_none(row.get("Up", "")),
        "duration_min": duration_min,
        "duration_text": duration_text,
        "got": to_float_or_none(row.get("GOT", ""), places=2),
        "got_total": to_float_or_none(row.get("Total", ""), places=2),
        "accomodation": clean_text(row.get("Accomodation", "")),
        "trail_counter": clean_text(row.get("Trail counter", "")),
        "exp_counter": clean_text(row.get("Exp. counter", "")),
        "lat": to_float_or_none(row.get("LAT", ""), places=8),
        "lon": to_float_or_none(row.get("LON", ""), places=8),
        "only_mountain": to_bool_or_none(row.get("Only Mountain", "")),
        "participants": clean_text(row.get("Tour Participants", "")),
    }


def build_feature_from_row(row: pd.Series) -> dict[str, Any]:
    """
    Buduje jeden obiekt GeoJSON typu Feature dla pojedynczej trasy.
    """
    gpx_path = get_gpx_path_for_row(row)
    coords = extract_linestring_coordinates_from_gpx(gpx_path)
    props = build_properties_from_row(row)

    feature: dict[str, Any] = {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": coords,
        },
        "properties": props,
    }
    return feature


# =========================================================
# GENEROWANIE RAW
# =========================================================


def generate_raw_files(df: pd.DataFrame) -> tuple[int, int, list[tuple[str, str]]]:
    """
    Generuje pliki RAW GeoJSON dla tras.
    """
    log_section("KROK 2/5 - Generowanie plików RAW GeoJSON")
    start = time.time()

    generated = 0
    skipped = 0
    errors: list[tuple[str, str]] = []

    total = len(df)
    for idx, (_, row) in enumerate(df.iterrows(), start=1):
        try:
            raw_file = raw_filename_for_row(row)

            if raw_file.exists() and not REBUILD_EXISTING_RAW:
                skipped += 1
                if idx % 100 == 0 or idx == total:
                    log(
                        f"Postęp RAW: {idx}/{total} | wygenerowano={generated}, pominięto={skipped}, błędy={len(errors)}"
                    )
                continue

            feature = build_feature_from_row(row)

            with open(raw_file, "w", encoding="utf-8") as f:
                json.dump(feature, f, ensure_ascii=False, separators=(",", ":"))

            generated += 1

            if idx % 25 == 0 or idx == total:
                log(
                    f"Postęp RAW: {idx}/{total} | wygenerowano={generated}, pominięto={skipped}, błędy={len(errors)}"
                )

        except Exception as e:  # noqa: BLE001
            row_id = clean_text(row.get("Trail Nr", "?"))
            errors.append((row_id, str(e)))
            log_error(f"Błąd dla Trail Nr {row_id}: {e}")

    elapsed = round(time.time() - start, 2)
    log_ok(f"Generowanie RAW zakończone w {elapsed} s")
    log_ok(f"Wygenerowano: {generated}")
    log_ok(f"Pominięto: {skipped}")
    log_ok(f"Błędy: {len(errors)}")

    return generated, skipped, errors


# =========================================================
# ASSEMBLER FINALNEGO PLIKU
# =========================================================


def assemble_final_geojson() -> dict[str, Any]:
    """
    Czyta wszystkie pliki RAW i składa je do jednego FeatureCollection.
    """
    log_section("KROK 3/5 - Składanie finalnego expeditions.geojson")
    start = time.time()

    features: list[dict[str, Any]] = []
    raw_files = sorted(RAW_DIR.glob("*.geojson"))

    log(f"Liczba plików RAW do odczytu: {len(raw_files)}")

    for file_path in raw_files:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if data.get("type") == "FeatureCollection":
            features.extend(data.get("features", []))
        elif data.get("type") == "Feature":
            features.append(data)
        else:
            log_warn(f"Pomijam plik o nieznanym typie GeoJSON: {file_path.name}")

    combined: dict[str, Any] = {
        "type": "FeatureCollection",
        "features": features,
    }

    elapsed = round(time.time() - start, 2)
    log_ok(f"Assembler zakończony w {elapsed} s")
    log_ok(f"Liczba tras w finalnym GeoJSON: {len(features)}")

    return combined


def build_markers_from_combined(combined: dict) -> list[dict]:
    """
    Buduje lekką listę rekordów na podstawie finalnego GeoJSON.
    """
    allowed_keys = [
        "nr",
        "date",
        "name",
        "mountains",
        "country",
        "distance_km",
        "ascent_m",
        "duration_min",
        "duration_text",
        "got",
        "got_total",
        "lat",
        "lon",
        "participants",
        "only_mountain",
        "gpx",
        "gpx_url",
        "photo_album_url",
        "photo_stamp_url",
        "accomodation",
        "trail_counter",
        "exp_counter",
    ]

    markers: list[dict] = []

    for feature in combined.get("features", []):
        original_props = feature.get("properties", {}) or {}

        props = {
            key: original_props.get(key)
            for key in allowed_keys
            if key in original_props
        }

        markers.append(props)

    return markers


def save_final_geojson(combined: dict[str, Any]) -> bool:
    """
    Bezpiecznie zapisuje finalny GeoJSON.
    """
    log_section("KROK 4/5 - Bezpieczny zapis finalnego pliku")

    feature_count = len(combined.get("features", []))
    if feature_count < MIN_EXPECTED_FEATURES:
        raise ValueError(
            f"Finalny GeoJSON ma tylko {feature_count} tras. "
            f"To mniej niż MIN_EXPECTED_FEATURES={MIN_EXPECTED_FEATURES}. Przerywam zapis."
        )

    if FINAL_FILE.exists():
        try:
            with open(FINAL_FILE, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except Exception as e:  # noqa: BLE001
            log_error(
                "Nie można odczytać poprzedniego pliku expeditions.geojson "
                f"do kontroli bezpieczeństwa: {e}. Przerywam zapis."
            )
            return False

        existing_feature_count = len(existing_data.get("features", []))
        min_allowed_features = int(
            existing_feature_count * MIN_FEATURES_RATIO_VS_EXISTING
        )

        if feature_count < min_allowed_features:
            log_error(
                "Podejrzanie mała liczba tras w finalnym GeoJSON: "
                f"nowy wynik ma {feature_count} tras, poprzedni plik miał "
                f"{existing_feature_count} tras. To mniej niż "
                f"{MIN_FEATURES_RATIO_VS_EXISTING:.0%} poprzedniej liczby. "
                "Przerywam zapis, żeby nie nadpisać poprawnego pliku "
                "niepełnymi danymi."
            )
            return False

    with open(TMP_FILE, "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, separators=(",", ":"))

    if FINAL_FILE.exists() and filecmp.cmp(TMP_FILE, FINAL_FILE, shallow=False):
        log("🔁 GeoJSON bez zmian – pomijam aktualizację FINAL_FILE")
        TMP_FILE.unlink()
        return False

    TMP_FILE.replace(FINAL_FILE)

    size_kb = round(FINAL_FILE.stat().st_size / 1024, 2)
    log_ok(f"GeoJSON zaktualizowany: {FINAL_FILE}")
    log_ok(f"Rozmiar pliku: {size_kb} KB")
    return True


def save_markers_json(markers: list[dict]) -> bool:
    """
    Bezpiecznie zapisuje markers.json.
    """
    log_section("KROK 4B/5 - Bezpieczny zapis markers.json")

    with open(MARKERS_TMP_FILE, "w", encoding="utf-8") as f:
        json.dump(markers, f, ensure_ascii=False, indent=2)

    if MARKERS_FILE.exists() and filecmp.cmp(
        MARKERS_TMP_FILE, MARKERS_FILE, shallow=False
    ):
        log("🔁 Markers bez zmian – pomijam aktualizację markers.json")
        MARKERS_TMP_FILE.unlink()
        return False

    MARKERS_TMP_FILE.replace(MARKERS_FILE)

    size_kb = round(MARKERS_FILE.stat().st_size / 1024, 2)
    log_ok(f"Markers zaktualizowane: {MARKERS_FILE}")
    log_ok(f"Rozmiar pliku: {size_kb} KB")
    return True


# =========================================================
# KOPIOWANIE DO REPO STRONY
# =========================================================


def copy_to_site_repo(geojson_changed: bool, markers_changed: bool) -> None:
    """
    Kopiuje pliki do repo strony tylko wtedy, gdy faktycznie się zmieniły.
    """
    log_section("KROK 5/5 - Kopiowanie plików do repo strony")

    if not geojson_changed and not markers_changed:
        log("🔁 Brak zmian – pomijam kopiowanie do repo strony")
        return

    if geojson_changed:
        if not FINAL_FILE.exists():
            raise FileNotFoundError(
                f"Brak finalnego GeoJSON do skopiowania: {FINAL_FILE}"
            )

        shutil.copy2(FINAL_FILE, SITE_GEOJSON_FILE)
        log_ok(f"Skopiowano GeoJSON do repo strony: {SITE_GEOJSON_FILE}")

    if markers_changed:
        if not MARKERS_FILE.exists():
            raise FileNotFoundError(f"Brak markers.json do skopiowania: {MARKERS_FILE}")

        shutil.copy2(MARKERS_FILE, SITE_MARKERS_FILE)
        log_ok(f"Skopiowano markers.json do repo strony: {SITE_MARKERS_FILE}")


# =========================================================
# RAPORT KOŃCOWY
# =========================================================


def print_error_report(errors: list[tuple[str, str]]) -> None:
    """Wyświetla raport błędów, jeśli jakieś wystąpiły."""
    if not errors:
        log_ok("Brak błędów podczas generowania RAW.")
        return

    log_section("RAPORT BŁĘDÓW")
    for row_id, error_text in errors:
        print(f"- Trail Nr {row_id}: {error_text}")


def print_summary(
    df: pd.DataFrame,
    generated: int,
    skipped: int,
    errors: list[tuple[str, str]],
    geojson_changed: bool,
    markers_changed: bool,
) -> None:
    """Wyświetla końcowe podsumowanie całego uruchomienia skryptu."""
    log_section("PODSUMOWANIE KOŃCOWE")
    log(f"Liczba wierszy w arkuszu: {len(df)}")
    log(f"Liczba plików RAW: {len(list(RAW_DIR.glob('*.geojson')))}")
    log(f"Wygenerowano nowych RAW: {generated}")
    log(f"Pominięto istniejące RAW: {skipped}")
    log(f"Liczba błędów: {len(errors)}")
    log(f"Finalny plik: {FINAL_FILE}")

    if geojson_changed:
        log(f"GeoJSON skopiowany do strony: {SITE_GEOJSON_FILE}")
    else:
        log("GeoJSON bez zmian - kopiowanie do strony pominięto")

    if markers_changed:
        log(f"Markers skopiowane do strony: {SITE_MARKERS_FILE}")
    else:
        log("Markers bez zmian - kopiowanie do strony pominięto")


# =========================================================
# MAIN
# =========================================================


def main() -> int:
    """
    Główna funkcja uruchamiająca cały pipeline.
    """
    start_all = time.time()

    try:
        log_section("🚀 START generate_geojson.py")
        ensure_directories()

        df = load_sheet_to_df()
        backup_sheet_to_csv_if_changed(df)
        audit_gpx_vs_sheet(df, GPX_DIR)
        generated, skipped, errors = generate_raw_files(df)

        combined = assemble_final_geojson()

        geojson_changed = save_final_geojson(combined)

        markers = build_markers_from_combined(combined)
        markers_changed = save_markers_json(markers)

        copy_to_site_repo(geojson_changed, markers_changed)

        validate_consistency(df, RAW_DIR, combined)

        print_error_report(errors)
        print_summary(df, generated, skipped, errors, geojson_changed, markers_changed)

        total_elapsed = round(time.time() - start_all, 2)
        log_ok(f"Cały pipeline zakończony sukcesem w {total_elapsed} s")
        return 0

    except Exception as e:  # noqa: BLE001
        total_elapsed = round(time.time() - start_all, 2)
        log_error(f"Pipeline przerwany po {total_elapsed} s")
        log_error(str(e))
        return 1


if __name__ == "__main__":
    sys.exit(main())
