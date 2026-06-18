"""
Extends both CSVs from Nov 2025 → Jun 2026 by extrapolating trends.
Strategy:
  - For each row, look at the last 3 non-empty values and compute avg monthly delta
  - Clamp coverage to [0, 100], counts to >= 0
  - If all historical values are empty, keep new months empty too
"""

import csv
import sys
from pathlib import Path

NEW_MONTHS = [
    ("Dec", "2025"),
    ("Jan", "2026"),
    ("Feb", "2026"),
    ("Mar", "2026"),
    ("Apr", "2026"),
    ("May", "2026"),
    ("Jun", "2026"),
]

DATA_DIR = Path(__file__).parent.parent / "public" / "data"


def extrapolate(history: list[float | None], n: int, clamp_min=0, clamp_max=None) -> list[float]:
    """Given a list of historical values (None = missing), project n steps forward."""
    known = [(i, v) for i, v in enumerate(history) if v is not None]
    if not known:
        return [None] * n

    # Use last 3 known points to compute avg delta
    tail = known[-3:]
    if len(tail) >= 2:
        deltas = [tail[i + 1][1] - tail[i][1] for i in range(len(tail) - 1)]
        avg_delta = sum(deltas) / len(deltas)
    else:
        avg_delta = 0.0

    last_val = tail[-1][1]
    projected = []
    for _ in range(n):
        last_val = last_val + avg_delta
        if clamp_max is not None:
            last_val = min(last_val, clamp_max)
        last_val = max(last_val, clamp_min)
        projected.append(round(last_val, 2))
    return projected


def extend_unit_tests():
    path = DATA_DIR / "cs_unit_test.csv"
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        original_fields = reader.fieldnames[:]
        rows = list(reader)

    # Find existing coverage/count month keys (ordered)
    import re
    cov_keys = [k for k in original_fields if re.match(r"COVERAGE_%_\w+_\d{4}", k)]
    cnt_keys = [k for k in original_fields if re.match(r"TEST_COUNT_\w+_\d{4}", k)]

    # New column names — interleaved (COVERAGE_%_Dec_2025, TEST_COUNT_Dec_2025, ...)
    new_cov_cols = [f"COVERAGE_%_{m}_{y}" for m, y in NEW_MONTHS]
    new_cnt_cols = [f"TEST_COUNT_{m}_{y}" for m, y in NEW_MONTHS]
    interleaved = [col for m, y in NEW_MONTHS
                   for col in (f"COVERAGE_%_{m}_{y}", f"TEST_COUNT_{m}_{y}")]

    new_fields = original_fields + interleaved

    extended_rows = []
    for row in rows:
        # Build history for coverage and test count
        cov_history = []
        for k in cov_keys:
            raw = row.get(k, "").strip()
            cov_history.append(float(raw) if raw else None)

        cnt_history = []
        for k in cnt_keys:
            raw = row.get(k, "").strip()
            cnt_history.append(float(raw) if raw else None)

        new_cov = extrapolate(cov_history, len(NEW_MONTHS), clamp_min=0, clamp_max=100)
        new_cnt = extrapolate(cnt_history, len(NEW_MONTHS), clamp_min=0)

        for col, val in zip(new_cov_cols, new_cov):
            row[col] = "" if val is None else (str(int(round(val))) if val == int(val) else str(val))

        for col, val in zip(new_cnt_cols, new_cnt):
            row[col] = "" if val is None else str(int(round(val)))

        extended_rows.append(row)

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=new_fields)
        writer.writeheader()
        writer.writerows(extended_rows)

    print(f"✅ cs_unit_test.csv: added {len(NEW_MONTHS)} months × 2 columns "
          f"({new_cov_cols[0]} … {new_cnt_cols[-1]})")


def extend_e2e_tests():
    path = DATA_DIR / "cs_e2e_test.csv"
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        original_fields = reader.fieldnames[:]
        rows = list(reader)

    import re
    cnt_keys = [k for k in original_fields if re.match(r"TEST_COUNT_\w+_\d{4}", k)]

    new_cnt_cols = [f"TEST_COUNT_{m}_{y}" for m, y in NEW_MONTHS]
    new_fields = original_fields + new_cnt_cols

    extended_rows = []
    for row in rows:
        cnt_history = []
        for k in cnt_keys:
            raw = row.get(k, "").strip()
            cnt_history.append(float(raw) if raw else None)

        new_cnt = extrapolate(cnt_history, len(NEW_MONTHS), clamp_min=0)

        for col, val in zip(new_cnt_cols, new_cnt):
            row[col] = "" if val is None else str(int(round(val)))

        extended_rows.append(row)

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=new_fields)
        writer.writeheader()
        writer.writerows(extended_rows)

    print(f"✅ cs_e2e_test.csv:   added {len(NEW_MONTHS)} months "
          f"({new_cnt_cols[0]} … {new_cnt_cols[-1]})")


if __name__ == "__main__":
    extend_unit_tests()
    extend_e2e_tests()
    print("\nDone. Refresh the dashboard to see the updated data.")
