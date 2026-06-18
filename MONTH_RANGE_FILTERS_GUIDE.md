# Month Range Filters Guide

## 📋 Overview

The dashboard now uses **month selection dropdowns** instead of day-based date pickers, making it easier to filter data by month ranges (Feb 2025 - Nov 2025).

---

## ✨ What Changed

### Before (Days Range)
- Date pickers: Select specific days (e.g., 2025-02-15, 2025-03-20)
- Preset buttons: "Last 7 days", "Last 30 days", etc.
- Complex to select exact month boundaries

### After (Month Range) ✅
- Month dropdowns: Select whole months (Feb 2025, Mar 2025, etc.)
- From Month / To Month selection
- Automatically uses first day of "From" month and last day of "To" month
- Simpler, more intuitive

---

## 🎯 How It Works

### Unit Tests Tab

**Month Range Filter:**
```
From Month: [Feb 2025 ▼]
To Month:   [Nov 2025 ▼]
```

**Behind the scenes:**
- From Month "Feb 2025" → `dateFrom: 2025-02-01`
- To Month "Nov 2025" → `dateTo: 2025-11-30` (last day)

### E2E Tests Tab

**Month Range Filter:**
```
From Month: [Feb 2025 ▼]
To Month:   [Nov 2025 ▼]
```

**Same behavior** as Unit Tests

---

## 📅 Available Months

Currently hardcoded to 2025 months:
- Feb 2025
- Mar 2025
- Apr 2025
- May 2025
- Jun 2025
- Jul 2025
- Aug 2025
- Sep 2025
- Oct 2025
- Nov 2025

**Note:** Easy to extend to other years/months by updating `getAll2025Months()` in `monthHelpers.ts`

---

## 🔧 Technical Implementation

### New Helper Functions

**`src/utils/monthHelpers.ts`:**

```typescript
// Get all 2025 months (Feb-Nov)
getAll2025Months(): MonthOption[]

// Get last day of a month from date string
getLastDayOfMonth(dateStr: string): string

// Format date as month label
formatDateAsMonth(dateStr: string): string
```

### Filter Components Updated

**Unit Tests (`Filters.tsx`):**
- Replaced date input with month dropdown
- Changed "Date Range" to "Month Range"
- Removed preset day buttons (7, 30, 90, 365 days)
- Added `handleMonthChange()` function

**E2E Tests (`E2EFilters.tsx`):**
- Same changes as Unit Tests
- Consistent UX across both tabs

---

## 💡 Usage Examples

### Example 1: View Single Month
```
From Month: Mar 2025
To Month:   Mar 2025
Result: Shows only March 2025 data
```

### Example 2: View Quarter
```
From Month: Feb 2025
To Month:   Apr 2025
Result: Shows Q1 2025 data (Feb, Mar, Apr)
```

### Example 3: View Half Year
```
From Month: Feb 2025
To Month:   Jul 2025
Result: Shows Feb-Jul 2025 data
```

### Example 4: View Full Year Range
```
From Month: Feb 2025
To Month:   Nov 2025
Result: Shows all available 2025 data
```

---

## 🔄 Date Conversion Logic

### When You Select "From Month: Mar 2025"

1. **User sees:** "Mar 2025"
2. **Stored internally:** `dateFrom: "2025-03-01"`
3. **Filter applies:** Data from `2025-03-01` onwards

### When You Select "To Month: Apr 2025"

1. **User sees:** "Apr 2025"
2. **Calculated:** Last day of April = 30
3. **Stored internally:** `dateTo: "2025-04-30"`
4. **Filter applies:** Data up to `2025-04-30`

**This ensures you get the ENTIRE month's data!**

---

## 🎨 UI Changes

### Unit Tests Filter Section

**Old:**
```
Date Range
[Last 7 days] [Last 30 days] [Last 90 days] [Last 365 days]

From: [date picker]
To:   [date picker]
```

**New:**
```
Month Range

From Month: [Feb 2025 ▼]
To Month:   [Nov 2025 ▼]
```

### E2E Tests Filter Section

**Old:**
```
Date Range
[Last 7 days] [Last 30 days] [Last 90 days] [Last 365 days]

From: [date picker]
To:   [date picker]
```

**New:**
```
Month Range

From Month: [Feb 2025 ▼]
To Month:   [Nov 2025 ▼]
```

---

## 🚀 Benefits

### 1. **Simpler UX**
- No need to remember month boundaries
- Select "Feb 2025" instead of "2025-02-01 to 2025-02-28"
- Dropdown is faster than date picker

### 2. **Matches Data Structure**
- CSV has monthly columns (Feb_2025, Mar_2025, etc.)
- Filters now match the data granularity
- More intuitive for users

### 3. **Less Confusion**
- Old: "Should I pick Feb 1 or Feb 28?"
- New: Just pick "Feb 2025" - automatically includes whole month

### 4. **Consistent Experience**
- Both Unit Tests and E2E Tests use same month selection
- Same months available across dashboard
- Unified filter UI

---

## 🔧 Default Filter Values

### On Page Load
```
From Month: Feb 2025 (2025-02-01)
To Month:   Nov 2025 (2025-11-30)
```

### After "Clear All"
```
All filters reset to:
- Product: All Products
- Subproduct: All Subproducts
- Service: All Services
- Namespace: All Namespaces
- From Month: Feb 2025
- To Month: Nov 2025
```

---

## 📊 Integration with CSV Data

### Monthly CSV Format

**Unit Tests:**
```csv
PRODUCT,SUBPRODUCT,...,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,COVERAGE_%_Mar_2025,TEST_COUNT_Mar_2025
```

**E2E Tests:**
```csv
PRODUCT,TEST_COUNT_Feb_2025,TEST_COUNT_Mar_2025,...
```

**Transformed to:**
```javascript
{ date: '2025-02-01', coverage_pct: 85.5, test_count: 100 }
{ date: '2025-03-01', coverage_pct: 86.2, test_count: 105 }
```

**Filtered by:**
Month selection (dateFrom/dateTo) filters these date-based records

---

## 🎯 How Filtering Works

### Data Flow

1. **CSV loaded** → Transformed to date-based records
2. **User selects months** → From: Mar 2025, To: May 2025
3. **Filter applied:**
   ```javascript
   dateFrom = '2025-03-01'
   dateTo = '2025-05-31'
   filteredData = data.filter(d => d.date >= dateFrom && d.date <= dateTo)
   ```
4. **Charts & tables** → Display filtered data

### Edge Cases

**Selecting same month for From and To:**
```
From: Apr 2025  → '2025-04-01'
To:   Apr 2025  → '2025-04-30'
Result: Only April data
```

**Selecting To before From:**
```
From: May 2025
To:   Feb 2025
Result: Empty (no data matches)
```
*UI could be improved to prevent this*

---

## 🔮 Future Enhancements

### 1. **Dynamic Month List**
Current: Hardcoded Feb-Nov 2025
Future: Auto-detect from CSV data
```typescript
// Detect available months from actual data
const months = getAvailableMonths(unitTestData.map(d => d.date));
```

### 2. **Prevent Invalid Ranges**
Disable "To" months that are before "From" month

### 3. **Preset Ranges**
Add buttons:
- [Last 3 Months]
- [Current Quarter]
- [Last 6 Months]
- [All Time]

### 4. **Year Selection**
Add year dropdown:
```
Year: [2025 ▼]
From Month: [Feb ▼]
To Month:   [Nov ▼]
```

### 5. **Visual Calendar**
Month picker with calendar view instead of dropdown

---

## 🐛 Troubleshooting

### Issue: Month dropdown is empty

**Cause:** `getAll2025Months()` returns empty array

**Solution:** Check `src/utils/monthHelpers.ts` - should return Feb-Nov 2025

### Issue: Selected "Nov 2025" but missing last day's data

**Cause:** `getLastDayOfMonth()` might be calculating wrong date

**Solution:** Check console - should show `dateTo: '2025-11-30'`

### Issue: Filter doesn't change data

**Cause:** Date comparison might be wrong

**Solution:** 
1. Check dateFrom/dateTo in filter state
2. Verify data has `date` field in YYYY-MM-DD format
3. Check console for filter values

### Issue: "To Month" shows wrong value

**Cause:** The dropdown value is calculated from `filters.dateTo` which might be last day of month

**Fix:** Line 365 in Filters.tsx converts `2025-11-30` to `2025-11-01` for dropdown:
```typescript
value={filters.dateTo.substring(0, 7) + '-01'}
```

---

## 📞 Console Logging

When dashboard loads, check for:

```
📅 Detected monthly column format, transforming to date-based records...
✅ Transformed 223 rows into 2,230 date-based records
📅 E2E: Detected monthly column format, transforming to date-based records...
✅ E2E: Transformed 9 rows into 90 date-based records
```

When you change month filter:
```javascript
// Check in React DevTools or add console.log:
console.log('Filter changed:', {
  dateFrom: filters.dateFrom, // '2025-03-01'
  dateTo: filters.dateTo       // '2025-05-31'
});
```

---

## ✅ Testing Checklist

### Unit Tests Tab
- [ ] Month dropdowns appear (not date pickers)
- [ ] "From Month" shows Feb-Nov 2025
- [ ] "To Month" shows Feb-Nov 2025
- [ ] Default: Feb 2025 to Nov 2025
- [ ] Selecting month updates charts/tables
- [ ] "Clear All" resets to Feb-Nov 2025

### E2E Tests Tab
- [ ] Month dropdowns appear (not date pickers)
- [ ] Same months available as Unit Tests
- [ ] Default: Feb 2025 to Nov 2025
- [ ] Filtering works correctly
- [ ] "Clear All" resets properly

### Data Integration
- [ ] CSV loads correctly (monthly format)
- [ ] Data transforms to date-based records
- [ ] Month filtering shows correct data
- [ ] Charts show monthly trends
- [ ] Summary cards reflect filtered data

---

## 📚 Related Files

**Components:**
- `src/components/Filters.tsx` - Unit Test filters
- `src/components/E2EFilters.tsx` - E2E Test filters

**Utilities:**
- `src/utils/monthHelpers.ts` - Month helper functions
- `src/utils/csvLoader.ts` - CSV loading and transformation

**Types:**
- `src/types/index.ts` - Filter type definitions

**Documentation:**
- `MONTHLY_CSV_FORMAT_GUIDE.md` - CSV format guide
- `MONTH_RANGE_FILTERS_GUIDE.md` - This file

---

## 🎉 Summary

✅ **Day ranges** replaced with **month ranges**  
✅ **Date pickers** replaced with **month dropdowns**  
✅ **Preset day buttons** removed  
✅ **Feb-Nov 2025** available for selection  
✅ **Automatic** first/last day calculation  
✅ **Consistent** across Unit Tests and E2E Tests  
✅ **Simpler UX** - just pick months!  

**The dashboard now provides an intuitive month-based filtering experience!** 🚀

---

**Last Updated**: November 2025  
**Applies To**: CS Quality Dashboard v2.2+  
**Month Range**: Feb 2025 - Nov 2025

