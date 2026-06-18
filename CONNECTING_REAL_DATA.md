# Connecting Real Data Guide

Step-by-step guide to connect your actual Google Sheets data to the dashboard.

## 🎯 Overview

You have two main options:

1. **Simple API Server** - Quick setup, reads from CSV exports
2. **Full Database Solution** - Scalable, uses PostgreSQL

## Option 1: Simple API Server (Quick Start)

Perfect if you want to get started quickly and have <100K rows of data.

### Step 1: Export Google Sheets to CSV

1. Open your Google Sheet
2. File → Download → Comma Separated Values (.csv)
3. Save as `data/unit_tests.csv` and `data/e2e_tests.csv`

### Step 2: Create Simple API Server

Create `api-server/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
app.use(cors());

let unitTestsData = [];
let e2eTestsData = [];

// Load CSV data on startup
function loadData() {
  unitTestsData = [];
  e2eTestsData = [];
  
  // Load unit tests
  fs.createReadStream('../data/unit_tests.csv')
    .pipe(csv())
    .on('data', (row) => {
      unitTestsData.push({
        date: row.DATE,
        product: row.PRODUCT,
        subproduct: row.SUBPRODUCT,
        namespace: row.NAMESPACE,
        service_name: row['SERVICE_NAME'] || row['SERVICE NAME'],
        coverage_pct: parseFloat(row['COVERAGE_%'] || row['COVERAGE_PCT']) || 0,
        test_count: parseInt(row.TEST_COUNT) || 0
      });
    })
    .on('end', () => console.log('✅ Loaded unit tests'));
    
  // Load E2E tests
  fs.createReadStream('../data/e2e_tests.csv')
    .pipe(csv())
    .on('data', (row) => {
      e2eTestsData.push({
        date: row.DATE,
        product: row.PRODUCT,
        test_count: parseInt(row.TEST_COUNT) || 0
      });
    })
    .on('end', () => console.log('✅ Loaded E2E tests'));
}

loadData();

// API Endpoints
app.get('/api/unit-tests', (req, res) => {
  let data = [...unitTestsData];
  
  // Apply filters
  const { product, subproduct, namespace, service, date_from, date_to } = req.query;
  
  if (product) data = data.filter(d => d.product === product);
  if (subproduct) data = data.filter(d => d.subproduct === subproduct);
  if (namespace) data = data.filter(d => d.namespace === namespace);
  if (service) data = data.filter(d => d.service_name.includes(service));
  if (date_from) data = data.filter(d => d.date >= date_from);
  if (date_to) data = data.filter(d => d.date <= date_to);
  
  res.json(data);
});

app.get('/api/e2e-tests', (req, res) => {
  let data = [...e2eTestsData];
  
  const { product, date_from, date_to } = req.query;
  
  if (product) data = data.filter(d => d.product === product);
  if (date_from) data = data.filter(d => d.date >= date_from);
  if (date_to) data = data.filter(d => d.date <= date_to);
  
  res.json(data);
});

app.get('/api/filter-options', (req, res) => {
  const products = [...new Set(unitTestsData.map(d => d.product))].sort();
  const subproducts = [...new Set(unitTestsData.map(d => d.subproduct))].sort();
  const namespaces = [...new Set(unitTestsData.map(d => d.namespace))].sort();
  const services = [...new Set(unitTestsData.map(d => d.service_name))].sort();
  
  res.json({ products, subproducts, namespaces, services });
});

// Reload endpoint (call this after updating CSV)
app.post('/api/reload', (req, res) => {
  loadData();
  res.json({ message: 'Data reloaded successfully' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
```

### Step 3: Install API Dependencies

```bash
cd api-server
npm init -y
npm install express cors csv-parser
```

### Step 4: Start API Server

```bash
node server.js
```

### Step 5: Update Dashboard Configuration

Create `.env` in dashboard root:

```env
VITE_USE_MOCK_DATA=false
VITE_API_URL=http://localhost:3000/api
```

### Step 6: Start Dashboard

```bash
npm run dev
```

🎉 **Your dashboard now shows real data!**

### Daily Updates

To update data:
1. Your script updates Google Sheets
2. Export to CSV (can be automated)
3. Call `POST http://localhost:3000/api/reload`

Or just restart the API server.

## Option 2: PostgreSQL Database (Recommended for Production)

For scalable, production-ready solution with millions of rows.

### Why PostgreSQL?

- ✅ Handles years of data (millions of rows)
- ✅ Fast queries with indexes
- ✅ Concurrent access
- ✅ No manual CSV exports needed
- ✅ Your script writes directly to DB

### Setup Steps

See detailed guide in `database/README.md`

**Quick Overview:**

1. **Create PostgreSQL database** (Supabase/Neon - free)
2. **Run schema** (`database/schema.sql`)
3. **Migrate existing data** (`python scripts/migrate_csv_to_db.py`)
4. **Update your daily script** (see `scripts/db_writer_example.py`)
5. **Create API server** (similar to above, but queries PostgreSQL)
6. **Update dashboard** (same .env setup)

## Comparison

| Feature | Simple API (CSV) | PostgreSQL |
|---------|------------------|------------|
| Setup Time | 10 minutes | 30 minutes |
| Best For | <100K rows | Unlimited |
| Performance | Good | Excellent |
| Scalability | Limited | Excellent |
| Daily Updates | Manual CSV export | Automatic |
| Queries | Slower with large data | Fast |
| Cost | Free | Free (Supabase/Neon) |

## API Endpoints Required

Your API server needs to provide these endpoints:

### GET /api/unit-tests
Query params: `product`, `subproduct`, `namespace`, `service`, `date_from`, `date_to`

Response:
```json
[
  {
    "id": 1,
    "date": "2025-11-14",
    "product": "Auth",
    "subproduct": "Login",
    "namespace": "auth-ns",
    "service_name": "login-service",
    "coverage_pct": 75.5,
    "test_count": 234
  }
]
```

### GET /api/e2e-tests
Query params: `product`, `date_from`, `date_to`

Response:
```json
[
  {
    "id": 1,
    "date": "2025-11-14",
    "product": "Auth",
    "test_count": 45
  }
]
```

### GET /api/filter-options
No params needed.

Response:
```json
{
  "products": ["Auth", "Payment", ...],
  "subproducts": ["API", "Worker", ...],
  "namespaces": ["prod-ns", ...],
  "services": ["login-service", ...]
}
```

## Automating CSV Export (Google Sheets)

If you choose Option 1 (CSV), you can automate exports:

### Using Google Apps Script

1. Open your Google Sheet
2. Extensions → Apps Script
3. Paste this code:

```javascript
function exportToCSV() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var unitTests = ss.getSheetByName('UNIT_TESTS');
  var e2eTests = ss.getSheetByName('E2E_TESTS');
  
  // Export logic here
  // You can use Google Drive API to save to a specific folder
  // Then use a cron job to download from Drive
}

// Set up time-based trigger to run daily
```

### Using Google Sheets API

Python script to download sheets:

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build
import csv

# Set up credentials
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
SERVICE_ACCOUNT_FILE = 'credentials.json'

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

service = build('sheets', 'v4', credentials=credentials)

# Download sheet data
SPREADSHEET_ID = 'your-spreadsheet-id'
result = service.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID,
    range='UNIT_TESTS!A:G'
).execute()

# Save to CSV
with open('data/unit_tests.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(result['values'])
```

## Testing Your Setup

### Test API Endpoints

```bash
# Test unit tests endpoint
curl "http://localhost:3000/api/unit-tests?product=Auth&date_from=2025-11-01"

# Test filter options
curl "http://localhost:3000/api/filter-options"
```

### Test Dashboard Connection

1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload dashboard
4. You should see API calls to your server
5. Check responses contain your data

## Troubleshooting

**CORS errors in browser:**
- Make sure API server has `app.use(cors())` enabled
- Or set specific origin: `cors({ origin: 'http://localhost:5173' })`

**API returns empty array:**
- Check CSV files are in correct location
- Check CSV column names match exactly
- Check API server logs for errors
- Test with no filters first

**Dashboard shows "No data available":**
- Verify `.env` has `VITE_USE_MOCK_DATA=false`
- Check API URL is correct
- Restart dashboard after changing .env: `npm run dev`
- Check browser console for errors

**Slow performance:**
- If CSV has >50K rows, consider PostgreSQL
- Add pagination to API endpoints
- Cache filter options in API server

## Next Steps

After connecting real data:

1. ✅ Verify all filters work
2. ✅ Check date ranges display correctly
3. ✅ Ensure sorting works
4. ✅ Test with different products
5. ✅ Deploy both API and dashboard to production

## Production Deployment

### API Server

Deploy to:
- **Heroku** - `git push heroku main`
- **Railway** - Connect GitHub repo
- **Render** - Free tier available
- **DigitalOcean** - App Platform

### Dashboard

Deploy to:
- **Vercel** - Automatic GitHub integration
- **Netlify** - Drag & drop deployment
- **Cloudflare Pages** - Free and fast

**Remember to update `VITE_API_URL` to production API URL!**

## Need Help?

I can help you:
1. Build the complete API server
2. Set up the PostgreSQL database
3. Modify your existing script
4. Deploy to production
5. Add more features

Just ask! 🚀

