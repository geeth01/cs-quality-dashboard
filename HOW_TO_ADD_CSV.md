# How to Add Your CSV Files

## 📁 Quick Steps

### 1. Create the Data Folder

```bash
cd /Users/geethanjali.kandasamy/Desktop/cs-quality-dashboard
mkdir -p public/data
```

### 2. Add Your CSV Files

Place your CSV files in the `public/data/` folder:

- **Unit Test Data:** `public/data/cs_unit_test.csv`
- **E2E Test Data:** `public/data/cs_e2e_test.csv`

**You can copy them with:**
```bash
cp /path/to/your/cs_unit_test.csv public/data/
cp /path/to/your/cs_e2e_test.csv public/data/
```

### 3. Refresh the Dashboard

If the dashboard is already running, just refresh your browser (Cmd+R or F5).

The dashboard will automatically detect and load your CSV files! ✅

---

## 📊 CSV Format Requirements

### Unit Test CSV (`cs_unit_test.csv`)

**Required columns:**
```
DATE,PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%,TEST_COUNT
```

**Example:**
```csv
DATE,PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%,TEST_COUNT
2025-11-14,Auth,Login,auth-ns,login-service,75.5,234
2025-11-14,Auth,Session,auth-ns,session-service,82.3,189
2025-11-14,Payment,API,payment-ns,payment-api,68.0,156
```

**Column Details:**
- `DATE` - Date in YYYY-MM-DD format (e.g., 2025-11-14)
- `PRODUCT` - Product name (e.g., Auth, Payment, User)
- `SUBPRODUCT` - Subproduct/layer (e.g., API, Worker, Frontend)
- `NAMESPACE` - Kubernetes namespace (e.g., prod-ns, staging-ns)
- `SERVICE_NAME` - Microservice name (e.g., login-service)
- `COVERAGE_%` - Coverage percentage (0-100, can have decimals)
- `TEST_COUNT` - Number of tests (integer)

**Notes:**
- Column names are case-insensitive
- Spaces in column names are OK (e.g., "SERVICE NAME" or "SERVICE_NAME")
- Missing values will be treated as 0
- Alternative column name: `COVERAGE_PCT` instead of `COVERAGE_%`

---

### E2E Test CSV (`cs_e2e_test.csv`)

**Required columns:**
```
DATE,PRODUCT,TEST_COUNT
```

**Example:**
```csv
DATE,PRODUCT,TEST_COUNT
2025-11-14,Auth,45
2025-11-14,Payment,67
2025-11-14,User,52
```

**Column Details:**
- `DATE` - Date in YYYY-MM-DD format
- `PRODUCT` - Product name
- `TEST_COUNT` - Number of E2E tests (integer)

**Notes:**
- Column names are case-insensitive
- Missing test counts will be treated as 0

---

## 📂 Folder Structure

After adding your files, your project should look like:

```
cs-quality-dashboard/
├── public/
│   └── data/
│       ├── cs_unit_test.csv     ← Your unit test data
│       └── cs_e2e_test.csv      ← Your E2E test data
├── src/
├── package.json
└── ...
```

---

## ✅ Verification

After adding your CSV files:

1. **Start the dashboard** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open in browser**: http://localhost:5173

3. **Check the banner**:
   - ✅ Green banner = "Using your CSV data" → Success!
   - 🔵 Blue banner = "Using mock data" → CSV files not found

4. **Verify data**:
   - Summary cards show your actual numbers
   - Table shows your services
   - E2E section appears with your E2E data
   - Filters show your actual products

---

## 🔄 Updating Your Data

### Method 1: Replace the Files

1. Replace `public/data/cs_unit_test.csv` with updated file
2. Replace `public/data/cs_e2e_test.csv` with updated file
3. Refresh browser (Cmd+R or F5)

### Method 2: Use a Script

Create a script to automatically copy from Google Sheets export:

```bash
#!/bin/bash
# update-data.sh

# Export from Google Sheets (you'll need to set this up)
# Then copy to dashboard
cp ~/Downloads/cs_unit_test.csv public/data/
cp ~/Downloads/cs_e2e_test.csv public/data/

echo "✅ Data updated! Refresh your browser."
```

Make it executable:
```bash
chmod +x update-data.sh
./update-data.sh
```

---

## 🐛 Troubleshooting

### Problem: Dashboard still shows "using mock data"

**Check:**
1. Files are in correct location: `public/data/`
2. File names are exact: `cs_unit_test.csv` and `cs_e2e_test.csv`
3. Files are not empty
4. You refreshed the browser
5. Check browser console (F12) for errors

**Try:**
```bash
# Verify files exist
ls -la public/data/

# Check file contents
head public/data/cs_unit_test.csv
head public/data/cs_e2e_test.csv
```

### Problem: "No data available" or charts are empty

**Check:**
1. CSV has proper headers (first row)
2. Column names match expected format
3. DATE column is in YYYY-MM-DD format
4. No special characters or encoding issues

**Try:**
- Open CSV in text editor to verify format
- Ensure no extra commas or quotes
- Check for UTF-8 encoding

### Problem: Some columns show as 0

**Check:**
1. Column names match exactly (case-insensitive but spelling matters)
2. Numbers don't have extra characters (%, $, etc.)
3. No empty rows at the end of file

### Problem: Browser shows network errors

**Check:**
1. Dev server is running (`npm run dev`)
2. Files are readable (not locked by another program)
3. Browser console for specific error messages

---

## 📝 CSV Export from Google Sheets

### Manual Export

1. Open your Google Sheet
2. Click on the sheet tab (e.g., "UNIT_TESTS")
3. File → Download → Comma Separated Values (.csv)
4. Save as `cs_unit_test.csv`
5. Repeat for E2E sheet, save as `cs_e2e_test.csv`
6. Copy both files to `public/data/`

### Automated Export (Advanced)

You can use Google Sheets API to automatically export:

**Python example:**
```python
# export_sheets.py
from google.oauth2 import service_account
from googleapiclient.discovery import build
import csv

# Set up credentials (you'll need to set this up)
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
creds = service_account.Credentials.from_service_account_file(
    'credentials.json', scopes=SCOPES)

service = build('sheets', 'v4', credentials=creds)

# Export UNIT_TESTS sheet
result = service.spreadsheets().values().get(
    spreadsheetId='YOUR_SHEET_ID',
    range='UNIT_TESTS!A:G'
).execute()

with open('public/data/cs_unit_test.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(result['values'])

# Export E2E_TESTS sheet
result = service.spreadsheets().values().get(
    spreadsheetId='YOUR_SHEET_ID',
    range='E2E_TESTS!A:C'
).execute()

with open('public/data/cs_e2e_test.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(result['values'])

print("✅ Exported to CSV files!")
```

---

## 🎯 Best Practices

1. **Keep headers consistent** - Don't change column names
2. **Date format** - Always use YYYY-MM-DD
3. **Backup your files** - Keep originals safe
4. **Regular updates** - Update daily/weekly for trends
5. **Check data quality** - Verify numbers make sense

---

## 🚀 What Happens When You Add CSVs

1. **Dashboard detects files** automatically
2. **Loads your data** instead of mock data
3. **Green banner appears** confirming CSV data loaded
4. **All features work** with your real data:
   - Summary cards show your metrics
   - Charts display your trends
   - Filters use your products/services
   - E2E section shows your E2E tests
   - Table lists all your services

---

## 📊 Example: Complete Workflow

```bash
# 1. Export from Google Sheets
# (Manual: File → Download → CSV)

# 2. Copy to dashboard
cd /Users/geethanjali.kandasamy/Desktop/cs-quality-dashboard
mkdir -p public/data
cp ~/Downloads/UNIT_TESTS.csv public/data/cs_unit_test.csv
cp ~/Downloads/E2E_TESTS.csv public/data/cs_e2e_test.csv

# 3. Verify files
ls -la public/data/
head public/data/cs_unit_test.csv

# 4. Start or refresh dashboard
npm run dev
# Then refresh browser: http://localhost:5173

# 5. Check for green banner! ✅
```

---

## ✨ Success Indicators

You'll know it's working when you see:

- ✅ **Green banner** at top: "Using your CSV data"
- ✅ **Real service names** in the table
- ✅ **Actual coverage numbers** in summary cards
- ✅ **Your products** in filter dropdowns
- ✅ **E2E section** with your E2E test data
- ✅ **Browser console** shows: "Loaded unit test data from CSV: X records"

---

**Need help? Let me know if you encounter any issues!** 🚀

