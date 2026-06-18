"""
Fetches unit test and E2E test data from Google Sheets and writes them
to public/data/ as CSVs for the dashboard.

Data sources:
  Unit tests  → SHEET_ID     (19wGO-hPK3xY14YvJarkIGEizn8MKLgscTthOH-KKJD4)
                Tab with COVERAGE_% columns = one row per service per month
  E2E tests   → E2E_SHEET_ID (1rMUn-tPQpQwmj4qbdrOTWipu_sjRU0BCap11tPPFjrM)
                Tab gid=904912687: finds the "Products" summary table (column H area)
                Headers like "2-Feb", "6-Mar" → mapped to TEST_COUNT_Feb_YYYY columns

Required env vars:
  GOOGLE_SERVICE_ACCOUNT_KEY  — full JSON content of the service account key
  SHEET_ID                    — unit test sheet ID
  E2E_SHEET_ID                — E2E/sanity sheet ID

Run locally:
  export GOOGLE_SERVICE_ACCOUNT_KEY=$(cat path/to/key.json)
  export SHEET_ID=19wGO-hPK3xY14YvJarkIGEizn8MKLgscTthOH-KKJD4
  export E2E_SHEET_ID=1rMUn-tPQpQwmj4qbdrOTWipu_sjRU0BCap11tPPFjrM
  python scripts/fetch_from_sheets.py
"""

import csv
import json
import os
import re
import sys
from datetime import date
from pathlib import Path

import gspread
from google.oauth2.service_account import Credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
]

DATA_DIR = Path(__file__).parent.parent / "public" / "data"

# Normalise product names from the E2E sheet to match the dashboard's existing labels
PRODUCT_NAME_MAP = {
    "visual experience": "VE",
}

MONTH_ABBREV_TO_NUM = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

MONTH_NUM_TO_ABBREV = {v: k.capitalize() for k, v in MONTH_ABBREV_TO_NUM.items()}


# ─────────────────────────────────────────────
# Auth helpers
# ─────────────────────────────────────────────

def _gc() -> gspread.Client:
    key_raw = os.environ.get("GOOGLE_SERVICE_ACCOUNT_KEY")
    if not key_raw:
        sys.exit("ERROR: GOOGLE_SERVICE_ACCOUNT_KEY env var is not set.")
    creds = Credentials.from_service_account_info(json.loads(key_raw), scopes=SCOPES)
    return gspread.authorize(creds)


def open_sheet(gc: gspread.Client, env_var: str) -> gspread.Spreadsheet:
    sheet_id = os.environ.get(env_var)
    if not sheet_id:
        sys.exit(f"ERROR: {env_var} env var is not set.")
    return gc.open_by_key(sheet_id)


# ─────────────────────────────────────────────
# Unit test helpers (unchanged logic)
# ─────────────────────────────────────────────

def find_unit_test_sheet(spreadsheet: gspread.Spreadsheet) -> gspread.Worksheet | None:
    for ws in spreadsheet.worksheets():
        if any("COVERAGE_%" in h for h in ws.row_values(1)):
            return ws
    return None


def write_csv(ws: gspread.Worksheet, dest: Path) -> int:
    all_values = ws.get_all_values()
    if not all_values:
        return 0
    headers = list(all_values[0])
    while headers and not headers[-1].strip():
        headers.pop()
    ncols = len(headers)
    rows_written = 0
    with open(dest, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for row in all_values[1:]:
            padded = (row + [""] * ncols)[:ncols]
            if any(cell.strip() for cell in padded):
                writer.writerow(padded)
                rows_written += 1
    return rows_written


# ─────────────────────────────────────────────
# E2E / Products table helpers
# ─────────────────────────────────────────────

def _infer_year(month_num: int) -> int:
    """Best-guess year for a bare month number using today's date."""
    today = date.today()
    # If this month is already past (or current) in the current year, use this year.
    # Otherwise it must be from last year.
    if month_num <= today.month:
        return today.year
    return today.year - 1


def parse_day_month_header(raw: str) -> tuple[str, int] | None:
    """
    Parse column headers like '2-Feb', '06-Mar', '8-Jun' into (MonthAbbrev, year).
    Returns None if the cell doesn't look like a date header.
    """
    raw = raw.strip()
    # Patterns: "2-Feb", "06-Mar", "3 Apr" (with space), just "Feb"
    m = re.match(r"^\d{1,2}[-\s]([A-Za-z]{3})$", raw)
    if not m:
        # Could also be bare month e.g. "Feb" but we require the day prefix
        return None
    month_str = m.group(1).capitalize()  # "Feb"
    month_lower = month_str.lower()
    if month_lower not in MONTH_ABBREV_TO_NUM:
        return None
    month_num = MONTH_ABBREV_TO_NUM[month_lower]
    return month_str, _infer_year(month_num)


def find_products_table(spreadsheet: gspread.Spreadsheet):
    """
    Scan all worksheets for the Products summary table.
    Returns (worksheet, header_row_idx, products_col_idx, all_values) or
    (None, None, None, None).

    The table looks like:
      | Products | 2-Feb | 6-Mar | 3-Apr | 8-May | 8-Jun |
      | CMS      | 11865 | 12084 | ...                    |
    """
    for ws in spreadsheet.worksheets():
        all_values = ws.get_all_values()
        for row_idx, row in enumerate(all_values):
            for col_idx, cell in enumerate(row):
                if cell.strip().lower() != "products":
                    continue
                # Check that the cells to the right look like day-month headers
                rest = row[col_idx + 1:]
                parsed = [parse_day_month_header(c) for c in rest if c.strip()]
                parsed = [p for p in parsed if p is not None]
                if len(parsed) >= 1:
                    print(f"   Found Products table in '{ws.title}' "
                          f"at row {row_idx + 1}, col {col_idx + 1}")
                    return ws, row_idx, col_idx, all_values
    return None, None, None, None


def build_e2e_csv(all_values, header_row_idx: int, products_col_idx: int) -> tuple[list, list]:
    """
    Extract the Products table from a raw grid and return (fieldnames, rows)
    in the standard CSV format:
      PRODUCT, TEST_COUNT_Feb_2025, TEST_COUNT_Mar_2025, …, TEST_COUNT_Jun_2026
    """
    header_row = all_values[header_row_idx]
    # Parse date columns to the right of "Products"
    month_cols = []  # list of (raw_col_idx, csv_col_name)
    for col_idx in range(products_col_idx + 1, len(header_row)):
        cell = header_row[col_idx].strip()
        if not cell:
            break  # stop at first empty header cell
        parsed = parse_day_month_header(cell)
        if parsed:
            month_abbrev, year = parsed
            csv_col = f"TEST_COUNT_{month_abbrev}_{year}"
            month_cols.append((col_idx, csv_col))

    if not month_cols:
        return [], []

    fieldnames = ["PRODUCT"] + [col for _, col in month_cols]
    rows = []

    for row in all_values[header_row_idx + 1:]:
        if not row or col_idx >= len(row):
            continue
        product_name = row[products_col_idx].strip()
        if not product_name:
            break  # end of table

        # Normalise product name
        normalised = PRODUCT_NAME_MAP.get(product_name.lower(), product_name)

        record = {"PRODUCT": normalised}
        for raw_idx, csv_col in month_cols:
            raw_val = row[raw_idx].strip() if raw_idx < len(row) else ""
            # "-" means no data yet → store empty
            record[csv_col] = "" if raw_val in ("-", "–", "—", "") else raw_val

        rows.append(record)

    return fieldnames, rows


def write_e2e_csv(fieldnames: list, rows: list, dest: Path) -> int:
    with open(dest, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return len(rows)


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    gc = _gc()

    # ── Unit tests ──────────────────────────────
    print("\n🔌 Unit test sheet…")
    unit_spreadsheet = open_sheet(gc, "SHEET_ID")
    print(f"   Opened: {unit_spreadsheet.title}")
    unit_ws = find_unit_test_sheet(unit_spreadsheet)
    if unit_ws:
        dest = DATA_DIR / "cs_unit_test.csv"
        n = write_csv(unit_ws, dest)
        print(f"✅ Unit tests → {dest.name}  ({n} service rows, tab: '{unit_ws.title}')")
    else:
        print("⚠️  No unit test sheet found (expected COVERAGE_% columns).")

    # ── E2E tests (Products table) ───────────────
    print("\n🔌 E2E sheet…")
    e2e_spreadsheet = open_sheet(gc, "E2E_SHEET_ID")
    print(f"   Opened: {e2e_spreadsheet.title}")
    print(f"   Tabs: {[ws.title for ws in e2e_spreadsheet.worksheets()]}")

    ws, header_row_idx, products_col_idx, all_values = find_products_table(e2e_spreadsheet)
    if ws:
        fieldnames, rows = build_e2e_csv(all_values, header_row_idx, products_col_idx)
        if rows:
            dest = DATA_DIR / "cs_e2e_test.csv"
            n = write_e2e_csv(fieldnames, rows, dest)
            print(f"✅ E2E tests  → {dest.name}  ({n} product rows)")
            print(f"   Columns: {fieldnames}")
        else:
            print("⚠️  Products table found but no data rows parsed.")
    else:
        print("⚠️  Products table not found in any worksheet.")

    if not unit_ws and not ws:
        sys.exit(1)

    print("\nDone.")


if __name__ == "__main__":
    main()
