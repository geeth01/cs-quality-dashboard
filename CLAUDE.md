# cs-quality-dashboard

React + Vite + TypeScript dashboard for tracking unit test coverage and E2E test progress across all Contentstack microservices.

## Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript 5.3 |
| Build | Vite 5 |
| Charts | Recharts |
| Styles | TailwindCSS 3 |
| Icons | lucide-react |

## Dev commands

```bash
npm run dev       # start dev server → http://localhost:5173
npm run build     # tsc + vite build → dist/
npm run preview   # preview production build
npm run lint      # eslint check
```

## Data sources (priority order)

1. **CSV files** (active): `public/data/cs_unit_test.csv` and `public/data/cs_e2e_test.csv`
2. **Mock data** fallback: `src/services/mockData.ts` — generates 250 fake services if no CSV found

Switch via `VITE_USE_MOCK_DATA=false` in `.env` and set `VITE_API_URL` when a real API is ready.

## CSV schema

**Unit tests** (`cs_unit_test.csv`):
```
DATE | PRODUCT | SUBPRODUCT | NAMESPACE | SERVICE_NAME | COVERAGE_% | TEST_COUNT
```

**E2E tests** (`cs_e2e_test.csv`):
```
DATE | PRODUCT | TEST_COUNT
```

Place updated CSVs in `public/data/` and refresh the page — no server restart needed.

## Key files

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Root layout, tab state (unit / e2e), filter state |
| `src/services/api.ts` | Data layer — CSV loader, mock fallback, summary/chart calc |
| `src/services/mockData.ts` | Mock data generator (250 services, configurable) |
| `src/hooks/useDashboardData.ts` | Main data-fetching hook consumed by App |
| `src/components/` | UI components — Filters, SummaryCards, CoverageChart, DataTable, E2E* |
| `src/utils/csvLoader.ts` | Fetches and parses CSV from `public/data/` |
| `src/utils/helpers.ts` | Coverage color/status thresholds (≥80 excellent, 70–79 good, 50–69 needs work, <50 critical) |
| `src/types/index.ts` | Shared TypeScript types |

## Coverage thresholds

| Status | Range |
|--------|-------|
| Excellent | ≥ 80% |
| Good | 70–79% |
| Needs Improvement | 50–69% |
| Critical | < 50% |

## Tabs

- **Unit Tests** — filters (product / subproduct / namespace / service / date range), summary cards, line chart (coverage % + test count over time), paginated sortable table
- **E2E Tests** — filters (product / date range), summary cards, bar/line charts, table

## Extending

- **Add chart types** — edit `src/components/CoverageChart.tsx` (Recharts)
- **Change thresholds** — edit `src/utils/helpers.ts` (`getCoverageColor`, `getCoverageBgColor`, `getCoverageStatus`)
- **Connect a real API** — flip `VITE_USE_MOCK_DATA=false`, set `VITE_API_URL`, uncomment fetch blocks in `src/services/api.ts`
- **PostgreSQL migration** — see `database/schema.sql` and `scripts/migrate_csv_to_db.py`

## Environment variables

```env
VITE_USE_MOCK_DATA=true        # false = use real API
VITE_API_URL=http://localhost:3000/api   # only when USE_MOCK_DATA=false
```

## Shared cs-quality conventions

- Credentials in `.env` (gitignored), never printed or committed
- Contentstack brand styling for any leadership-facing visuals
- Data accuracy cross-check before publishing numbers to Slack
