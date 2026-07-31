"""
Generator statycznych plików JSON dla map challenges.
"""

from __future__ import annotations

import json
from datetime import datetime

from io import StringIO
from pathlib import Path
from typing import Any

import pandas as pd
import requests

# ============================================================
# ŚCIEŻKI
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

SITE_CHALLENGES_DIR = PROJECT_ROOT / "public" / "challenges" / "data"

SITE_CHALLENGES_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# GOOGLE SHEETS
# ============================================================

SHEET_ID = "1SNj2bRlcneGGBdqA3_btM3rZ8-oPy-U6fcouOylQibk"
CONFIG_SHEET_NAME = "CONFIG"


# ============================================================
# LOGI
# ============================================================


def log(msg: str) -> None:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] {msg}")


def log_ok(msg: str) -> None:
    log(f"✅ {msg}")


def log_warn(msg: str) -> None:
    log(f"⚠️ {msg}")


def log_section(title: str) -> None:
    line = "━" * 70
    print()
    print(line)
    print(f"⚙️  {title}")
    print(line)


# ============================================================
# POMOCNICZE
# ============================================================


def fetch_sheet_csv(tab_name: str) -> pd.DataFrame:
    url = (
        f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq"
        f"?tqx=out:csv&sheet={tab_name}"
    )

    response = requests.get(url, timeout=60)
    response.raise_for_status()

    df = pd.read_csv(StringIO(response.text), dtype=str).fillna("")
    df.columns = [str(c).strip() for c in df.columns]
    return df


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def to_int_or_none(value: Any) -> int | None:
    value = clean_text(value)
    if not value:
        return None

    try:
        return int(float(value.replace(",", ".")))
    except Exception:
        return None


def to_float_or_none(value: Any) -> float | None:
    value = clean_text(value)
    if not value:
        return None

    try:
        return float(value.replace(",", "."))
    except Exception:
        return None


def build_status_from_date(date_value: Any) -> str:
    return "done" if clean_text(date_value) else "todo"


def write_json_if_changed(path: Path, data: list[dict[str, Any]]) -> bool:
    new_content = json.dumps(data, ensure_ascii=False, indent=2)

    if path.exists():
        old_content = path.read_text(encoding="utf-8")
        if old_content == new_content:
            return False

    path.write_text(new_content, encoding="utf-8")
    return True


# ============================================================
# CONFIG
# ============================================================


def load_challenges_config() -> list[dict[str, Any]]:
    """
    Oczekiwane kolumny w CONFIG:
    key | sheet | name | icon | active | order
    """
    log_section("Ładowanie konfiguracji challenges z CONFIG")

    df = fetch_sheet_csv(CONFIG_SHEET_NAME)

    required_columns = {"key", "sheet"}
    missing = required_columns - set(df.columns)

    if missing:
        raise ValueError(
            f"Brak wymaganych kolumn w CONFIG: {sorted(missing)}. "
            f"Znalezione kolumny: {list(df.columns)}"
        )

    config: list[dict[str, Any]] = []

    for _, row in df.iterrows():
        key = clean_text(row.get("key", ""))
        sheet = clean_text(row.get("sheet", ""))
        name = clean_text(row.get("name", "")) or key
        icon = clean_text(row.get("icon", ""))
        active = clean_text(row.get("active", "1"))
        order = to_int_or_none(row.get("order", ""))

        if not key and not sheet:
            continue

        if not key or not sheet:
            log_warn(f"Pomijam niepełny wiersz CONFIG: key='{key}', sheet='{sheet}'")
            continue

        config.append(
            {
                "key": key,
                "sheet": sheet,
                "name": name,
                "icon": icon,
                "active": active != "0",
                "order": order if order is not None else 9999,
            }
        )

    if not config:
        raise ValueError("Zakładka CONFIG nie zawiera żadnych poprawnych wpisów")

    config.sort(key=lambda x: (x["order"], x["key"]))

    log_ok(f"Wczytano {len(config)} wpisów z CONFIG")
    log(f"Klucze: {[x['key'] for x in config]}")

    return config


def write_challenges_index_json(challenges: list[dict[str, Any]]) -> None:
    data = []

    for item in challenges:
        if not item["active"]:
            continue

        data.append(
            {
                "key": item["key"],
                "name": item["name"],
                "icon": item["icon"],
            }
        )

    path = SITE_CHALLENGES_DIR / "challenges-index.json"
    content = json.dumps(data, ensure_ascii=False, indent=2)

    if path.exists():
        old_content = path.read_text(encoding="utf-8")
        if old_content == content:
            log("🔁 Brak zmian w challenges-index.json")
            return

    path.write_text(content, encoding="utf-8")
    log_ok(f"Zaktualizowano plik: {path}")


# ============================================================
# JSON REGIONÓW
# ============================================================


def build_record(row: pd.Series) -> dict[str, Any]:
    return {
        "number": to_int_or_none(row.get("NR", "")),
        "peak": clean_text(row.get("PEAK", "")),
        "region": clean_text(row.get("REGION", "")),
        "subregion": clean_text(row.get("SUBREGION", "")),
        "height": to_int_or_none(row.get("HEIGHT", "")),
        "expedition": clean_text(row.get("EXPEDITION", "")),
        "date": clean_text(row.get("DATE", "")),
        "lat": to_float_or_none(row.get("LAT", "")),
        "lon": to_float_or_none(row.get("LON", "")),
        "status": build_status_from_date(row.get("DATE", "")),
    }


def build_json_data(df: pd.DataFrame) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []

    for _, row in df.iterrows():
        if all(clean_text(v) == "" for v in row.tolist()):
            continue
        records.append(build_record(row))

    return records


def output_path_for_key(key: str) -> Path:
    return SITE_CHALLENGES_DIR / f"challenges-{key}.json"


def process_one_challenge(key: str, tab_name: str) -> tuple[int, bool]:
    log_section(f"Challenge: {key}  |  Zakładka: {tab_name}")

    df = fetch_sheet_csv(tab_name)
    log_ok(f"Pobrano {len(df)} wierszy z Google Sheets")

    records = build_json_data(df)
    log_ok(f"Zbudowano {len(records)} rekordów JSON")

    output_file = output_path_for_key(key)
    changed = write_json_if_changed(output_file, records)

    if changed:
        log_ok(f"Zaktualizowano plik: {output_file}")
    else:
        log("🔁 Brak zmian – pomijam nadpisanie pliku")

    return len(records), changed


# ============================================================
# MAIN
# ============================================================


def main() -> None:
    print("BASE_DIR             =", BASE_DIR)
    print("SITE_CHALLENGES_DIR  =", SITE_CHALLENGES_DIR)

    log_section("START generate_challenges.py")

    total_regions = 0
    changed_regions = 0
    unchanged_regions = 0
    total_records = 0
    errors: list[str] = []

    challenges = load_challenges_config()

    for item in challenges:
        key = item["key"]
        tab_name = item["sheet"]

        if not item["active"]:
            log(f"⏭️ Pomijam nieaktywny challenge: {key}")
            continue

        total_regions += 1

        try:
            count, changed = process_one_challenge(key, tab_name)
            total_records += count

            if changed:
                changed_regions += 1
            else:
                unchanged_regions += 1

        except Exception as e:
            msg = f"{key}: {e}"
            errors.append(msg)
            log_warn(msg)

    try:
        write_challenges_index_json(challenges)
    except Exception as e:
        errors.append(f"challenges-index.json: {e}")
        log_warn(f"challenges-index.json: {e}")

    log_section("PODSUMOWANIE")
    log(f"Liczba aktywnych challenge : {total_regions}")
    log(f"Zmienione pliki JSON       : {changed_regions}")
    log(f"Bez zmian JSON             : {unchanged_regions}")
    log(f"Łączna liczba rekordów     : {total_records}")
    log(f"Katalog wynikowy           : {SITE_CHALLENGES_DIR}")

    if errors:
        log_warn(f"Liczba błędów: {len(errors)}")
        for err in errors:
            print(f"   • {err}")
    else:
        log_ok("Brak błędów")


if __name__ == "__main__":
    main()
