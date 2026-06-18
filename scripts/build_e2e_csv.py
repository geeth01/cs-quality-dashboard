"""
Build cs_e2e_test.csv directly from sorted_tests_*.csv snapshot files.

Reads all sorted_tests_YYYY-MM-DD.csv files from SORTED_TESTS_DIR,
picks the LAST snapshot of each month, aggregates test counts per product
using SUITE_TO_PRODUCT, and writes public/data/cs_e2e_test.csv.

Run (from cs-quality-dashboard root):
  python scripts/build_e2e_csv.py

Override source directory:
  SORTED_TESTS_DIR=/custom/path python scripts/build_e2e_csv.py

After running, commit and push:
  git add public/data/cs_e2e_test.csv && git push
"""

import csv
import glob
import os
import re
from collections import defaultdict
from pathlib import Path

# ─── Config ────────────────────────────────────────────────────────────────

DEFAULT_SORTED_TESTS_DIR = (
    Path.home() / "sanity-reports" / "cs-automation" / ".venv"
)

DATA_DIR = Path(__file__).parent.parent / "public" / "data"

MONTH_NUM_TO_ABBREV = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
    7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
}

# ─── Suite → Product mapping ───────────────────────────────────────────────
# Each sanity suite is assigned to exactly one product.
# CMS is the catch-all; only suites below are routed elsewhere.
# Adjust this mapping if the Products table in the Google Sheet differs.

SUITE_TO_PRODUCT: dict[str, str] = {
    # ── Visual Experience ──────────────────────────────────────────────────
    "Visual Builder E2E - UI":                     "VE",
    "Timeline Preview Sanity - UI":                "VE",
    "Live Preview Sanity - UI":                    "VE",
    "Global Dashboard Sanity - UI":                "VE",
    "Global Dashboard Sanity - Parameterized - UI": "VE",
    "Platform Discovery Sanity - UI":              "VE",

    # ── CSI ────────────────────────────────────────────────────────────────
    "CSI AI Assistant - E2E":                      "CSI",
    "CSI Brand Kit - E2E":                         "CSI",

    # ── Platform ───────────────────────────────────────────────────────────
    "Orgadmin Sanity - UI":                        "Platform",
    "OrgAdminSanity - UI":                         "Platform",
    "Auth background jobs events - UI":            "Platform",
    "Webhook Test Suite - UI":                     "Platform",
    "Webhooks - UI":                               "Platform",
    "OneClickTrial - UI":                          "Platform",
    "Top Level Navigation Smoke Test - UI":        "Platform",
    "Notifications Sanity - UI":                   "Platform",
    "Rest Preview Service - API":                  "Platform",
    "GraphQL Preview Service - API":               "Platform",
    "Analytics V1 V2 parity":                      "Platform",
    "RBAC Sanity - UI":                            "Platform",
    "Org Compare API":                             "Platform",
    "Auth Tokens Sanity Test":                     "Platform",

    # ── DAM ────────────────────────────────────────────────────────────────
    "AssetManagement20 - API":                     "DAM",
    "Asset Managment Test - UI":                   "DAM",   # note: typo in source
    "Asset Management2.0 Test - UI":               "DAM",
    "AssetPicker Full Sanity - UI":                "DAM",
    "CMA-Assets-DAM - API":                        "DAM",

    # ── Marketplace ────────────────────────────────────────────────────────
    "Marketplace Sanity - UI":                     "Marketplace",
    "CLI-Marketplace Sanity":                      "Marketplace",
    "CLI-Marketplace Apps Basic Sanity":           "Marketplace",
    "SDK-Marketplace Sanity":                      "Marketplace",
    "DEV11, CLI-Apps Sanity":                      "Marketplace",

    # ── Personalise ────────────────────────────────────────────────────────
    "CLI-Personalize Sanity":                      "Personalise",
    "CLI-Personalize Basic Sanity":                "Personalise",

    # ── DeveloperHub ───────────────────────────────────────────────────────
    "Developerhub Sanity - UI":                    "DeveloperHub",

    # ── Launch ─────────────────────────────────────────────────────────────
    "CLI-Launch Sanity":                           "Launch",

    # ── Automate ───────────────────────────────────────────────────────────
    # (add suite names here when Automate sanities are tracked)

    # ── Lytics ─────────────────────────────────────────────────────────────
    # (add suite names here when Lytics sanities are tracked)

    # ── Agent OS ───────────────────────────────────────────────────────────
    # (add suite names here when Agent OS sanities are tracked)
}

# Lines that are Slack noise or separator rows — skip them
SKIP_PREFIXES = ("<!channel>", "Dev11 CMS Sanity", "DailyMonitorBot", "dev11-preview")


# ─── Helpers ───────────────────────────────────────────────────────────────

def parse_sorted_tests(filepath: Path) -> dict[str, float]:
    """Return {suite_name: test_count} from one sorted_tests CSV."""
    counts: dict[str, float] = {}
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)   # skip header row
        for row in reader:
            if len(row) < 2:
                continue
            suite = row[0].strip()
            if not suite or any(suite.startswith(p) for p in SKIP_PREFIXES):
                continue
            raw = row[1].strip()
            if raw in ("", "NA", "N/A", "-"):
                continue
            try:
                counts[suite] = float(raw)
            except ValueError:
                pass
    return counts


def aggregate_by_product(suite_counts: dict[str, float]) -> dict[str, int]:
    """Map suite counts → product totals. Unmapped suites → CMS."""
    totals: dict[str, int] = defaultdict(int)
    for suite, count in suite_counts.items():
        product = SUITE_TO_PRODUCT.get(suite, "CMS")
        totals[product] += int(round(count))
    return dict(totals)


def find_last_file_per_month(src_dir: Path) -> dict[tuple[int, int], Path]:
    """
    Scan src_dir for sorted_tests_YYYY-MM-DD.csv files.
    Return {(year, month): latest_filepath} (one per calendar month).
    """
    pattern = re.compile(r"sorted_tests_(\d{4})-(\d{2})-(\d{2})\.csv$")
    month_files: dict[tuple[int, int], list[Path]] = defaultdict(list)

    for fp in src_dir.glob("sorted_tests_*.csv"):
        m = pattern.match(fp.name)
        if m:
            year, month = int(m.group(1)), int(m.group(2))
            month_files[(year, month)].append(fp)

    return {ym: sorted(fps)[-1] for ym, fps in month_files.items()}


def col_name(year: int, month: int) -> str:
    return f"TEST_COUNT_{MONTH_NUM_TO_ABBREV[month]}_{year}"


# ─── Main ──────────────────────────────────────────────────────────────────

def build():
    src_dir = Path(os.environ.get("SORTED_TESTS_DIR", DEFAULT_SORTED_TESTS_DIR))
    if not src_dir.exists():
        print(f"❌  Source directory not found: {src_dir}")
        print("    Set SORTED_TESTS_DIR env var to the folder containing sorted_tests_*.csv files.")
        return

    month_files = find_last_file_per_month(src_dir)
    if not month_files:
        print(f"❌  No sorted_tests_*.csv files found in {src_dir}")
        return

    sorted_months = sorted(month_files.keys())
    print(f"📅  Found {len(sorted_months)} months: "
          f"{MONTH_NUM_TO_ABBREV[sorted_months[0][1]]} {sorted_months[0][0]} → "
          f"{MONTH_NUM_TO_ABBREV[sorted_months[-1][1]]} {sorted_months[-1][0]}")

    # Collect all products across all months
    all_products: set[str] = set()
    monthly: dict[tuple[int, int], dict[str, int]] = {}

    for ym in sorted_months:
        fp = month_files[ym]
        suite_counts = parse_sorted_tests(fp)
        product_totals = aggregate_by_product(suite_counts)
        monthly[ym] = product_totals
        all_products.update(product_totals.keys())
        print(f"   {MONTH_NUM_TO_ABBREV[ym[1]]} {ym[0]:4}  ← {fp.name}  "
              f"({sum(product_totals.values()):,} total tests)")

    # Determine row order: CMS first, then alphabetical
    product_order = ["CMS"] + sorted(p for p in all_products if p != "CMS")

    # Build column list
    columns = [col_name(y, m) for y, m in sorted_months]
    fieldnames = ["PRODUCT"] + columns

    # Write CSV
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    dest = DATA_DIR / "cs_e2e_test.csv"
    with open(dest, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for product in product_order:
            row: dict[str, object] = {"PRODUCT": product}
            for ym, col in zip(sorted_months, columns):
                row[col] = monthly[ym].get(product, "")
            writer.writerow(row)

    print(f"\n✅  Written → {dest}")
    print(f"   Products: {', '.join(product_order)}")
    print(f"   Columns : {columns[0]} … {columns[-1]}")
    print("\nNext: git add public/data/cs_e2e_test.csv && git push")


if __name__ == "__main__":
    build()
