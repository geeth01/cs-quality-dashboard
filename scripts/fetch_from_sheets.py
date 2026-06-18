"""
Fetches unit test and E2E test data from Google Sheets and writes them
to public/data/ as CSVs for the dashboard.

Required env vars:
  GOOGLE_SERVICE_ACCOUNT_KEY  — full JSON of the service account key file
  SHEET_ID                    — Google Sheets ID
                                (19wGO-hPK3xY14YvJarkIGEizn8MKLgscTthOH-KKJD4)

Run locally:
  export GOOGLE_SERVICE_ACCOUNT_KEY=$(cat path/to/key.json)
  export SHEET_ID=19wGO-hPK3xY14YvJarkIGEizn8MKLgscTthOH-KKJD4
  python scripts/fetch_from_sheets.py
"""

import csv
import json
import os
import sys
from pathlib import Path

import gspread
from google.oauth2.service_account import Credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
]

DATA_DIR = Path(__file__).parent.parent / "public" / "data"


def connect() -> gspread.Spreadsheet:
    key_raw = os.environ.get("GOOGLE_SERVICE_ACCOUNT_KEY")
    sheet_id = os.environ.get("SHEET_ID")
    if not key_raw:
        sys.exit("ERROR: GOOGLE_SERVICE_ACCOUNT_KEY env var is not set.")
    if not sheet_id:
        sys.exit("ERROR: SHEET_ID env var is not set.")
    creds = Credentials.from_service_account_info(json.loads(key_raw), scopes=SCOPES)
    gc = gspread.authorize(creds)
    return gc.open_by_key(sheet_id)


def find_unit_test_sheet(spreadsheet: gspread.Spreadsheet) -> gspread.Worksheet | None:
    """The unit test sheet has COVERAGE_% columns."""
    for ws in spreadsheet.worksheets():
        headers = ws.row_values(1)
        if any("COVERAGE_%" in h for h in headers):
            return ws
    return None


def find_e2e_sheet(spreadsheet: gspread.Spreadsheet) -> gspread.Worksheet | None:
    """The E2E sheet has PRODUCT + TEST_COUNT columns but no COVERAGE_%."""
    for ws in spreadsheet.worksheets():
        headers = ws.row_values(1)
        has_product = "PRODUCT" in headers
        has_test_count = any("TEST_COUNT" in h for h in headers)
        has_coverage = any("COVERAGE_%" in h for h in headers)
        if has_product and has_test_count and not has_coverage:
            return ws
    return None


def write_csv(ws: gspread.Worksheet, dest: Path) -> int:
    """Writes the worksheet to a CSV file. Returns row count written."""
    all_values = ws.get_all_values()
    if not all_values:
        print(f"  ⚠️  Sheet '{ws.title}' is empty, skipping.")
        return 0

    # Strip trailing empty columns from header row
    headers = all_values[0]
    while headers and not headers[-1].strip():
        headers.pop()
    ncols = len(headers)

    rows_written = 0
    with open(dest, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for row in all_values[1:]:
            # Pad or trim to match header count
            padded = (row + [""] * ncols)[:ncols]
            # Skip completely empty rows
            if any(cell.strip() for cell in padded):
                writer.writerow(padded)
                rows_written += 1

    return rows_written


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    print("🔌 Connecting to Google Sheets…")
    spreadsheet = connect()
    print(f"✅ Opened: {spreadsheet.title}")
    sheets = spreadsheet.worksheets()
    print(f"   Tabs found: {[ws.title for ws in sheets]}")

    # --- Unit test data ---
    unit_ws = find_unit_test_sheet(spreadsheet)
    if unit_ws:
        dest = DATA_DIR / "cs_unit_test.csv"
        n = write_csv(unit_ws, dest)
        print(f"✅ Unit tests  → {dest.name}  ({n} service rows, tab: '{unit_ws.title}')")
    else:
        print("⚠️  No unit test sheet found (expected COVERAGE_% columns).")

    # --- E2E test data ---
    e2e_ws = find_e2e_sheet(spreadsheet)
    if e2e_ws:
        dest = DATA_DIR / "cs_e2e_test.csv"
        n = write_csv(e2e_ws, dest)
        print(f"✅ E2E tests   → {dest.name}  ({n} product rows, tab: '{e2e_ws.title}')")
    else:
        print("⚠️  No E2E sheet found (expected PRODUCT + TEST_COUNT columns, no COVERAGE_%).")

    if not unit_ws and not e2e_ws:
        sys.exit(1)

    print("\nDone. Refresh the dashboard to see updated data.")


if __name__ == "__main__":
    main()
