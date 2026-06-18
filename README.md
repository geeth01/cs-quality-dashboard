# CS Quality Dashboard

A modern, interactive dashboard to track unit test coverage and progress across all your microservices.

![Dashboard Preview](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue)

## ✨ Features

- 📊 **Interactive Charts** - Visualize coverage trends over time
- 🔍 **Advanced Filtering** - Search by product, subproduct, namespace, service, and date range
- 📈 **Summary Statistics** - See total services, average coverage, and services needing attention
- 📋 **Sortable Data Table** - View and sort all services by any metric
- 🎨 **Modern UI** - Beautiful, responsive design with TailwindCSS
- ⚡ **Fast Performance** - Built with React and Vite

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- (Optional) PostgreSQL database for production use

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Start the development server**

```bash
npm run dev
```

3. **Open your browser**

Navigate to `http://localhost:5173`

The dashboard will load with **mock data** for demonstration purposes.

## 📊 Current State: Mock Data

The dashboard is currently configured to use **mock data** that simulates:
- 250 microservices
- 90 days of daily coverage data
- Realistic coverage percentages and test counts

This allows you to explore the dashboard immediately without setting up a database.

## 🔗 Connecting to Real Data

When you're ready to connect your real data:

### Option 1: Using Google Sheets (Quick & Simple)

1. Export your Google Sheets to CSV:
   - `UNIT_TESTS` sheet → `data/unit_tests.csv`
   - `E2E_TESTS` sheet → `data/e2e_tests.csv`

2. Create a simple API server that reads these CSVs (we can build this together)

### Option 2: Using PostgreSQL (Recommended for Scale)

See the detailed guide in `database/README.md`

**Quick steps:**
1. Set up PostgreSQL (Supabase, Neon, or local)
2. Run the schema: `psql < database/schema.sql`
3. Migrate existing data: `python scripts/migrate_csv_to_db.py`
4. Update your daily script to write to PostgreSQL
5. Create a simple API server
6. Update `.env` to point to your API

## 📁 Project Structure

```
cs-quality-dashboard/
├── src/
│   ├── components/         # React components
│   │   ├── SummaryCards.tsx
│   │   ├── Filters.tsx
│   │   ├── CoverageChart.tsx
│   │   └── DataTable.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useDashboardData.ts
│   ├── services/           # API and data layer
│   │   ├── api.ts          # Main API service
│   │   └── mockData.ts     # Mock data generator
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Helper functions
│   │   └── helpers.ts
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── database/               # Database setup (placeholders)
│   ├── schema.sql          # PostgreSQL schema
│   └── README.md           # Database setup guide
├── scripts/                # Helper scripts (placeholders)
│   ├── db_writer_example.py      # Example for your daily script
│   └── migrate_csv_to_db.py      # CSV to DB migration
└── package.json
```

## 🎯 Dashboard Features Explained

### 1. Summary Cards
- **Total Services**: Count of all microservices being tracked
- **Average Coverage**: Mean coverage across all services
- **Total Tests**: Sum of all unit tests
- **Below 70% Coverage**: Services that need attention

### 2. Filters
- Filter by Product, Subproduct, Namespace
- Search services by name
- Date range selection (7, 30, 90, 365 days)
- Custom date range picker

### 3. Coverage Trend Chart
- Dual-axis line chart
- Left axis: Average coverage percentage over time
- Right axis: Total test count over time
- Interactive tooltips

### 4. Data Table
- Shows latest data for each service
- Sortable by any column
- Color-coded coverage status:
  - 🟢 **Excellent**: ≥80%
  - 🟡 **Good**: 70-79%
  - 🟠 **Needs Improvement**: 50-69%
  - 🔴 **Critical**: <50%
- Pagination (20 services per page)

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Environment Variables

Create a `.env` file in the root:

```env
# Use mock data (default: true)
VITE_USE_MOCK_DATA=true

# API endpoint (when using real database)
# VITE_API_URL=http://localhost:3000/api
```

### Customization

**Change mock data settings:**
Edit `src/services/mockData.ts` to adjust:
- Number of services
- Date range
- Coverage distribution

**Adjust color thresholds:**
Edit `src/utils/helpers.ts` functions:
- `getCoverageColor()`
- `getCoverageBgColor()`
- `getCoverageStatus()`

**Modify charts:**
Edit `src/components/CoverageChart.tsx` to customize:
- Chart types (line, bar, area)
- Colors
- Axes
- Tooltips

## 📊 Data Schema

### Unit Tests Table
```
DATE       | PRODUCT | SUBPRODUCT | NAMESPACE | SERVICE_NAME | COVERAGE_% | TEST_COUNT
2025-11-14 | Auth    | Login      | auth-ns   | login-svc    | 75.5       | 234
```

### E2E Tests Table
```
DATE       | PRODUCT | TEST_COUNT
2025-11-14 | Auth    | 45
```

## 🚢 Deployment

### Deploy to Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy (it's automatic!)

### Deploy to Netlify (Free)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy!

### Deploy anywhere else

```bash
# Build the production version
npm run build

# The dist/ folder contains your static site
# Upload it to any static hosting service
```

## 🔄 Daily Data Updates

### Current Workflow
Your script → Google Sheets

### Recommended Workflow (Future)
Your script → PostgreSQL → Dashboard API → Dashboard

See `scripts/db_writer_example.py` for how to modify your existing script.

## 🐛 Troubleshooting

**Dashboard shows "No data available"**
- Check that you're using mock data: `VITE_USE_MOCK_DATA=true`
- If using real API, verify the API endpoint is correct and accessible

**Charts not rendering**
- Clear browser cache
- Check browser console for errors
- Ensure all dependencies are installed: `npm install`

**Filters not working**
- Ensure mock data is being generated
- Check filter options are loaded in browser DevTools

## 📝 Next Steps

1. ✅ Dashboard is built and working with mock data
2. 🔲 Set up PostgreSQL database (when ready)
3. 🔲 Migrate existing Google Sheets data
4. 🔲 Update your daily script to write to PostgreSQL
5. 🔲 Create a simple API server
6. 🔲 Switch dashboard to use real data
7. 🔲 Deploy to production

## 🤝 Support

Need help? Here's what we can do next:

1. **Build the API server** to connect your data
2. **Set up the database** following the guide
3. **Modify your script** to write to PostgreSQL
4. **Add more features** (export to Excel, alerts, etc.)

## 📄 License

MIT License - feel free to use this for your projects!

---

**Built with ❤️ for better code quality**

