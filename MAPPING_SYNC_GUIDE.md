# Mapping CSV Sync Guide

## 🎯 Overview

The dashboard now uses **`cs_microservice_mapping.csv` as the source of truth** for all products, subproducts, services, and namespaces.

This ensures that **nothing is missing** from your dropdowns, even if some services don't have test data yet.

---

## ✨ How It Works

### Data Sources

The dashboard merges data from two sources:

1. **Mapping CSV** (`/public/cs_microservice_mapping.csv`)
   - Defines ALL possible products, subproducts, services, namespaces
   - Source of truth for your microservice architecture
   
2. **Unit Test CSV** (`/public/data/cs_unit_test.csv`)
   - Contains actual test coverage data
   - Only includes services with test data

### Merge Strategy

For each filter dropdown:

```typescript
Available Options = Mapping CSV ∪ Test Data CSV
```

**Example:**
- Mapping has: `["AI Platform", "Agent OS", "CMS", "Platform"]`
- Test data has: `["AI Platform", "CMS", "Platform"]`
- **Dropdown shows**: `["Agent OS", "AI Platform", "CMS", "Platform"]` ✅

---

## 🔍 What This Fixes

### ❌ Before (Old Behavior)

**Problem:** Dropdown only showed items with test data

```
Mapping CSV has:
- Product: Agent OS
- Subproduct: Polaris
- Service: ask-ai-backend-service

But no test data for Agent OS exists yet.

Result: Agent OS MISSING from dropdown ❌
```

### ✅ After (New Behavior)

**Solution:** Dropdown shows ALL items from mapping

```
Mapping CSV has:
- Product: Agent OS
- Subproduct: Polaris
- Service: ask-ai-backend-service

Even without test data:

Result: Agent OS APPEARS in dropdown ✅
```

---

## 📋 Benefits

### 1. **Complete Visibility**
- See all products/services even without test data
- Identify services that need test coverage added
- Complete view of your microservice architecture

### 2. **No Missing Items**
- If it's in the mapping CSV, it appears in the dropdown
- No surprises with "missing" services
- Prevents filtering errors

### 3. **Early Warning System**
- See services with 0% coverage (they'll show up in filters)
- Identify gaps in test data
- Plan test coverage strategy

### 4. **Future-Proof**
- Add services to mapping before they have tests
- Prepare for upcoming services
- Maintain architectural documentation

---

## 🔄 Cascading Filters

The cascading still works perfectly:

### All Filters Empty
Shows **ALL** items from mapping CSV:
- All Products
- All Subproducts
- All Services
- All Namespaces

### Product Selected
Shows filtered items:
- **All Subproducts** for that product (from mapping)
- **All Services** for that product (from mapping)
- **All Namespaces** for that product (from mapping)

### Product + Subproduct Selected
Shows filtered items:
- **All Services** for that product+subproduct (from mapping)
- **All Namespaces** for that product+subproduct (from mapping)

### Product + Subproduct + Service Selected
Shows filtered items:
- **All Namespaces** for that combination (from mapping)

---

## 🧪 Example Scenarios

### Scenario 1: New Service Added to Mapping

```csv
# Added to cs_microservice_mapping.csv
Agent OS,Polaris,ask-ai-backend-service,ask-ai-ns,
```

**Result:**
1. Refresh browser
2. "Agent OS" appears in Product dropdown ✅
3. Select "Agent OS" → "Polaris" appears in Subproduct dropdown ✅
4. Select "Polaris" → "ask-ai-backend-service" appears in Service dropdown ✅
5. Select service → "ask-ai-ns" appears in Namespace dropdown ✅

**Even without any test data in `cs_unit_test.csv`!**

### Scenario 2: Service Has Test Data

```csv
# In cs_unit_test.csv
2024-11-17,AI Platform,AI Platform,ai-platform-ns,ai-platform-service,75.5,100,1500,2000
```

**Result:**
- Service appears in dropdown (from test data)
- Service ALSO in mapping CSV
- Dropdown shows it (merged from both sources)
- Filtering works perfectly
- Coverage % displays in table

### Scenario 3: Service in Mapping but No Test Data

```csv
# In cs_microservice_mapping.csv
Brand Kit,Brand Kit,generator,ai-frameworks-ns,

# NOT in cs_unit_test.csv (no test data yet)
```

**Result:**
- "Brand Kit" appears in Product dropdown ✅
- Select "Brand Kit" → "generator" appears in Service dropdown ✅
- If you filter by it → Empty table (no test data)
- **This is expected!** You can see what's missing coverage

---

## 🎨 User Experience

### Discovering Missing Test Data

1. **Open Product dropdown**
   - See ALL products from mapping

2. **Select a product** (e.g., "Agent OS")
   - Subproducts filter to show only Agent OS subproducts

3. **Select a subproduct** (e.g., "Polaris")
   - Services filter to show only Polaris services

4. **Select a service** (e.g., "ask-ai-backend-service")
   - If no test data exists:
     - Table shows: "No data found"
     - Coverage chart: Empty
     - Summary cards: 0 services, 0% coverage

5. **Identify the gap!**
   - "Oh, ask-ai-backend-service has no test data!"
   - Add it to your testing pipeline

---

## 📊 Console Logging

When the dashboard loads, check the console:

```
📋 CSV Headers: ["PRODUCT", "SUBPRODUCT", "SERVICE NAME", "NAMESPACE", ...]
✅ Loaded 229 microservice mappings from CSV
   📊 11 products, 25 subproducts, 220 services
🎯 Cascading filters initialized with mapping data
   📦 12 products from mapping
```

**Key Metrics:**
- `229 microservice mappings` = Total rows in mapping CSV
- `12 products from mapping` = Total unique products in mapping
- These will be merged with test data

---

## ⚙️ Technical Implementation

### Code Flow

```typescript
// 1. Load mapping CSV
const mappings = await loadMicroserviceMappings();

// 2. Extract all products from mapping
const fromMapping = getUniqueProducts(mappings);
// ["Agent OS", "AI Platform", "Brand Kit", "CMS", ...]

// 3. Extract products from test data
const fromData = filterOptions?.products;
// ["AI Platform", "CMS", "Platform", ...]

// 4. Merge and deduplicate
const merged = Array.from(new Set([...fromData, ...fromMapping]));
// ["Agent OS", "AI Platform", "Brand Kit", "CMS", "Platform", ...]

// 5. Sort alphabetically
return merged.sort();
```

### For Each Filter Level

**Products:** `getUniqueProducts(mappings)` + test data products  
**Subproducts:** `getAllSubproducts(mappings)` + test data subproducts (filtered by product)  
**Services:** `getAllServices(mappings)` + test data services (filtered by product+subproduct)  
**Namespaces:** `getAllNamespaces(mappings)` + test data namespaces (filtered by all selections)

---

## 🔧 Maintenance

### Keep Mapping CSV Updated

✅ **DO:**
- Add new services to mapping CSV when they're created
- Update mapping when services move products/subproducts
- Keep namespace mappings accurate
- Remove decommissioned services

❌ **DON'T:**
- Rely on test data CSV for dropdown options
- Assume services not in mapping will appear
- Forget to update mapping when architecture changes

### Sync Workflow

```
1. New service created
   ↓
2. Add to cs_microservice_mapping.csv
   ↓
3. Commit and push
   ↓
4. Dashboard automatically shows it (after refresh)
   ↓
5. Later: Add test data to cs_unit_test.csv
   ↓
6. Dashboard shows coverage stats
```

---

## 🐛 Troubleshooting

### Issue: Service Not Appearing in Dropdown

**Check:**
1. Is it in `cs_microservice_mapping.csv`?
   - If NO → Add it!
   - If YES → Continue to step 2

2. Did you refresh the browser?
   - Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

3. Check console for errors:
   - Should see: "✅ Loaded X microservice mappings"
   - If error → Check CSV format

### Issue: Wrong Service Appears in Filtered List

**Check:**
1. Verify mapping CSV has correct product/subproduct for that service
2. Check for duplicate entries in mapping CSV
3. Verify cascading logic:
   - Service should appear when its product is selected
   - Service should NOT appear when a different product is selected

### Issue: Dropdown Shows Duplicate Items

**Possible Cause:** Service exists in both mapping and test data

**Solution:** This is normal! The merge deduplicates automatically.

If you see actual duplicates:
1. Check for duplicate rows in mapping CSV
2. Check for case sensitivity issues ("CMS" vs "cms")

---

## 📚 Related Documentation

- **[UPDATING_MICROSERVICE_MAPPING.md](./UPDATING_MICROSERVICE_MAPPING.md)** - How to edit the mapping CSV
- **[CASCADING_FILTERS_GUIDE.md](./CASCADING_FILTERS_GUIDE.md)** - How cascading filters work
- **[CONNECTING_REAL_DATA.md](./CONNECTING_REAL_DATA.md)** - Switching from CSV to database

---

## 🎯 Summary

**Before:** Dropdowns only showed items with test data  
**After:** Dropdowns show ALL items from mapping CSV  

**Result:**
- ✅ Complete visibility of architecture
- ✅ No missing products/services
- ✅ Identify gaps in test coverage
- ✅ Future-proof dashboard
- ✅ Single source of truth (mapping CSV)

**Your mapping CSV is now the master reference for your microservice architecture!** 🎉

---

**Last Updated**: November 2025  
**Applies To**: CS Quality Dashboard v2.0+  
**Mapping File**: `/public/cs_microservice_mapping.csv`

