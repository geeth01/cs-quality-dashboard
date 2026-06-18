# Monthly CSV Format Guide

## 📋 Overview

The dashboard now supports a **new monthly column format** for unit test data, making it easier to track coverage and test counts across multiple months in a single row per service.

---

## 🆕 New Format vs Old Format

### Old Format (Date-based Rows)
Each service has multiple rows, one per date:

```csv
DATE,PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%,TEST_COUNT
2025-02-01,CMS,Content Delivery,cda-ns,service-1,85.5,100
2025-03-01,CMS,Content Delivery,cda-ns,service-1,86.2,105
2025-04-01,CMS,Content Delivery,cda-ns,service-1,87.0,110
```

**Issue:** 250 services × 10 months = 2,500 rows

### New Format (Monthly Columns) ✅
Each service has ONE row with monthly columns:

```csv
PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025,COVERAGE_%_Apr_2025,TEST_COUNT_Apr_2025
CMS,Content Delivery,cda-ns,service-1,85.5,100,86.2,105,87.0,110
```

**Benefit:** 250 services = 250 rows (10x smaller!)

---

## 📊 Column Structure

### Required Columns (Fixed)
1. `PRODUCT` - Product name
2. `SUBPRODUCT` - Subproduct name
3. `NAMESPACE` - Kubernetes namespace
4. `SERVICE_NAME` - Service name

### Monthly Columns (Repeating Pattern)
For each month, two columns:
1. `COVERAGE_%_<Month>_<Year>` - Coverage percentage
2. `TEST_COUNT_<Month>_<Year>` - Number of tests

**Supported Months:**
- `Feb_2025` through `Nov_2025`
- Can add `Dec_2025`, `Jan_2026`, etc.

**Full Example Header:**
```csv
PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025,COVERAGE_%_Apr_2025,TEST_COUNT_Apr_2025,COVERAGE_%_May_2025,TEST_COUNT_May_2025,COVERAGE_%_Jun_2025,TEST_COUNT_Jun_2025,COVERAGE_%_Jul_2025,TEST_COUNT_Jul_2025,COVERAGE_%_Aug_2025,TEST_COUNT_Aug_2025,COVERAGE_%_Sep_2025,TEST_COUNT_Sep_2025,COVERAGE_%_Oct_2025,TEST_COUNT_Oct_2025,COVERAGE_%_Nov_2025,TEST_COUNT_Nov_2025
```

---

## 🔄 How It Works

### Auto-Detection
The dashboard automatically detects which format you're using:

1. **Checks for monthly columns** (e.g., `COVERAGE_%_Feb_2025`)
   - If found → Uses new format
   - If not found → Checks for `DATE` column

2. **Checks for DATE column**
   - If found → Uses old format
   - If not found → Shows error

**Console Output:**
```
📅 Detected monthly column format, transforming to date-based records...
✅ Transformed 223 rows into 2,230 date-based records
```

### Transformation Process

Each row is transformed into multiple date-based records:

**Input Row:**
```csv
CMS,Content Delivery,cda-ns,service-1,85.5,100,86.2,105,87.0,110
```

**Output Records:**
```javascript
[
  { date: '2025-02-01', product: 'CMS', ..., coverage_pct: 85.5, test_count: 100 },
  { date: '2025-03-01', product: 'CMS', ..., coverage_pct: 86.2, test_count: 105 },
  { date: '2025-04-01', product: 'CMS', ..., coverage_pct: 87.0, test_count: 110 },
]
```

### Month to Date Mapping

| Month Column | Date Generated |
|--------------|----------------|
| `Feb_2025` | `2025-02-01` |
| `Mar_2025` | `2025-03-01` |
| `Apr_2025` | `2025-04-01` |
| `May_2025` | `2025-05-01` |
| `Jun_2025` | `2025-06-01` |
| `Jul_2025` | `2025-07-01` |
| `Aug_2025` | `2025-08-01` |
| `Sep_2025` | `2025-09-01` |
| `Oct_2025` | `2025-10-01` |
| `Nov_2025` | `2025-11-01` |
| `Dec_2025` | `2025-12-01` |

---

## 🎯 Handling Missing Values

### Rule 1: Coverage Missing → Skip Month
If `COVERAGE_%` is empty or missing for a month, that month is **completely skipped**.

**Example:**
```csv
PRODUCT,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025
CMS,service-1,85.5,100,,105
```

**Result:**
- ✅ February: `{ date: '2025-02-01', coverage_pct: 85.5, test_count: 100 }`
- ❌ March: Skipped (no coverage data)

### Rule 2: Test Count Missing → Use 0
If `TEST_COUNT` is empty but `COVERAGE_%` exists, use `0` for test count.

**Example:**
```csv
PRODUCT,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025
CMS,service-1,85.5,100,86.2,
```

**Result:**
- ✅ February: `{ date: '2025-02-01', coverage_pct: 85.5, test_count: 100 }`
- ✅ March: `{ date: '2025-03-01', coverage_pct: 86.2, test_count: 0 }`

### Rule 3: Both Missing → Skip Month
If both are empty, skip the month.

**Example:**
```csv
PRODUCT,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025
CMS,service-1,,,86.2,105
```

**Result:**
- ❌ February: Skipped (both empty)
- ✅ March: `{ date: '2025-03-01', coverage_pct: 86.2, test_count: 105 }`

---

## 📝 Example CSV File

### Complete Example

```csv
PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025,COVERAGE_%_Apr_2025,TEST_COUNT_Apr_2025
CMS,Content Delivery,cda-ns,assets-delivery-api,85.82,1240,86.1,1250,86.5,1260
Platform,Org Admin,auth-ns,auth-service,92.21,2732,92.5,2750,92.8,2780
Platform,Org Admin,auth-ns,auth-background-jobs-service,92.82,523,93.0,530,93.2,535
CMS,Content Delivery,cda-ns,content-delivery-api,,,86.2,1300,87.0,1320
Platform,Data Engineering,webhook-ns,webhook-api-rewrite,94.8,244,95.0,250,,
```

**This generates:**
- Row 1: 3 records (Feb, Mar, Apr)
- Row 2: 3 records (Feb, Mar, Apr)
- Row 3: 3 records (Feb, Mar, Apr)
- Row 4: 2 records (Mar, Apr) - Feb skipped
- Row 5: 2 records (Feb, Mar) - Apr skipped

**Total: 13 date-based records** from 5 CSV rows

---

## 🔧 How to Create Your CSV

### Step 1: Start with Template

```csv
PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025
```

### Step 2: Add Your Services

```csv
PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025
CMS,Content Delivery,cda-ns,service-1,,,
Platform,Org Admin,auth-ns,service-2,,,
```

### Step 3: Fill Monthly Data

Add coverage and test counts as they become available:

```csv
PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025
CMS,Content Delivery,cda-ns,service-1,85.5,100,86.2,105
Platform,Org Admin,auth-ns,service-2,92.0,500,92.5,510
```

### Step 4: Add More Months

Extend as needed:

```csv
PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025,COVERAGE_%_Apr_2025,TEST_COUNT_Apr_2025,COVERAGE_%_May_2025,TEST_COUNT_May_2025
CMS,Content Delivery,cda-ns,service-1,85.5,100,86.2,105,87.0,110,87.5,115
```

---

## 🚀 Updating Your Existing Script

If you have a script that populates the CSV, update it to use the new format:

### Old Script (Date-based)
```python
# For each service, add one row per month
for month in months:
    row = {
        'DATE': f'{year}-{month:02d}-01',
        'PRODUCT': product,
        'SUBPRODUCT': subproduct,
        'NAMESPACE': namespace,
        'SERVICE_NAME': service_name,
        'COVERAGE_%': coverage,
        'TEST_COUNT': count
    }
    rows.append(row)
```

### New Script (Monthly columns) ✅
```python
# For each service, add ONE row with monthly columns
row = {
    'PRODUCT': product,
    'SUBPRODUCT': subproduct,
    'NAMESPACE': namespace,
    'SERVICE_NAME': service_name
}

# Add monthly data
for month_name, month_num in [('Feb', 2), ('Mar', 3), ('Apr', 4), ...]:
    coverage_key = f'COVERAGE_%_{month_name}_2025'
    count_key = f'TEST_COUNT_{month_name}_2025'
    
    row[coverage_key] = get_coverage(service, year, month_num)
    row[count_key] = get_test_count(service, year, month_num)

rows.append(row)
```

---

## 📊 Advantages of Monthly Format

### 1. **Smaller File Size**
- Old: 250 services × 10 months = 2,500 rows
- New: 250 services = 250 rows
- **90% smaller!**

### 2. **Easier to Maintain**
- One row per service
- Update monthly columns as data comes in
- No duplicate service information

### 3. **Better for Spreadsheets**
- Excel/Google Sheets friendly
- Easy to compare months side-by-side
- Simpler formulas

### 4. **Backward Compatible**
- Dashboard still supports old format
- Auto-detects which format you're using
- No migration needed immediately

---

## 🧪 Testing

### Verify Format Detection

1. **Upload your CSV** to `/public/data/cs_unit_test.csv`

2. **Refresh the dashboard**

3. **Check console** (F12 → Console):
   ```
   📅 Detected monthly column format, transforming to date-based records...
   ✅ Transformed 223 rows into 1,845 date-based records
   ```

4. **Verify data**:
   - Coverage trends should show monthly progression
   - Date filter should work with month dates
   - All services should appear

### Test Missing Data

Create a test row with missing data:
```csv
PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025
Test,Test,test-ns,test-service,,,86.2,
```

**Expected:**
- February: Skipped (no coverage)
- March: Shows coverage 86.2%, test count 0

---

## ❓ FAQ

### Q: Can I mix old and new formats?
**A:** No, use one format per file. The dashboard detects the format from the first row.

### Q: What if I need data for 2024?
**A:** Use column names like `COVERAGE_%_Dec_2024`, `TEST_COUNT_Dec_2024`

### Q: Can I add more months later?
**A:** Yes! Just add new columns: `COVERAGE_%_Dec_2025`, `TEST_COUNT_Dec_2025`

### Q: What happens if month name is wrong?
**A:** Console warning: "Unknown month: Deb" and that month is skipped.

### Q: Do I need to fill all months?
**A:** No, leave empty for months without data. They'll be skipped.

### Q: Can I use full month names?
**A:** Yes, but must match: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec

### Q: What if coverage is 0%?
**A:** Use `0` or `0.0` in the column (not empty). Empty means "skip month".

---

## 📞 Troubleshooting

### Issue: Dashboard shows "Unknown CSV format"

**Cause:** No DATE column and no monthly columns detected

**Solution:**
1. Check header row has: `COVERAGE_%_Feb_2025` format
2. Verify month names are correct (Jan, Feb, Mar, etc.)
3. Verify year format is 4 digits (2025, not 25)

### Issue: Some months missing from charts

**Cause:** Coverage column was empty for those months

**Solution:**
- If no coverage → Expected behavior (month skipped)
- If coverage exists → Check column name format

### Issue: Test counts showing as 0

**Cause:** TEST_COUNT column was empty

**Solution:** This is expected behavior (empty count → 0)

---

## 🎉 Summary

✅ **New format**: One row per service with monthly columns  
✅ **Auto-detection**: Dashboard detects format automatically  
✅ **Smart handling**: Skips missing coverage, uses 0 for missing counts  
✅ **Backward compatible**: Old format still works  
✅ **Smaller files**: 90% reduction in rows  
✅ **Easy updates**: Add new months as columns  

**Your CSV is now optimized for yearly tracking!** 🚀

---

**Last Updated**: November 2025  
**Applies To**: CS Quality Dashboard v2.1+  
**CSV Location**: `/public/data/cs_unit_test.csv`

