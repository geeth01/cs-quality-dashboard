# Cascading Filters Guide

This guide explains how the 4-level cascading filter system works in the CS Quality Dashboard.

## 📊 Overview

The dashboard uses `cs_microservice_mapping.csv` to build intelligent cascading filters:

```
PRODUCT → SUBPRODUCT → SERVICE_NAME → NAMESPACE
```

Each level filters the options available in the next level.

---

## 🔗 How Cascading Works

### Level 1: Product
**When you select a product:**
- Subproduct dropdown shows ONLY subproducts for that product
- Service dropdown shows ONLY services for that product
- Namespace dropdown shows ONLY namespaces for that product

**Example: Select "CMS"**
```
Subproducts available: Content Delivery, Content Management, Venus, Assets, Reignite Search
Services available: All CMS services
Namespaces available: cda-ns, cma-ns, search-ns, etc.
```

### Level 2: Subproduct
**When you select a subproduct:**
- Service dropdown shows ONLY services for that product+subproduct
- Namespace dropdown shows ONLY namespaces for that product+subproduct

**Example: Select "CMS" → "Content Delivery"**
```
Services available: assets-delivery-api, cda-dj-v3-2-single, content-delivery-api, etc.
Namespaces available: cda-ns
```

### Level 3: Service
**When you select a service:**
- Namespace dropdown shows ONLY namespaces for that specific service

**Example: Select "CMS" → "Content Delivery" → "assets-delivery-api"**
```
Namespaces available: cda-ns
```

### Level 4: Namespace
**Final filter:**
- Shows data only for the selected namespace

---

## 🔄 Auto-Clear Behavior

The dashboard automatically clears invalid selections:

### Scenario 1: Change Product
```
Before: Product=CMS, Subproduct=Content Delivery, Service=assets-delivery-api
Change: Product=DAM
After:  Product=DAM, Subproduct="" (cleared), Service="" (cleared), Namespace="" (cleared)
```

### Scenario 2: Change Subproduct
```
Before: Product=CMS, Subproduct=Content Delivery, Service=assets-delivery-api
Change: Subproduct=Content Management
After:  Product=CMS, Subproduct=Content Management, Service="" (cleared), Namespace="" (cleared)
```

### Scenario 3: Change Service
```
Before: Product=CMS, Subproduct=Content Delivery, Service=assets-delivery-api, Namespace=cda-ns
Change: Service=content-delivery-api
After:  Product=CMS, Subproduct=Content Delivery, Service=content-delivery-api, Namespace=cda-ns
(Namespace stays if still valid)
```

---

## 🎯 Usage Examples

### Use Case 1: View All Data
```
Product: All Products
Subproduct: All Subproducts
Service: All Services
Namespace: All Namespaces
Result: Shows all 222 services
```

### Use Case 2: View Specific Product
```
Product: CMS
Subproduct: All CMS Subproducts
Service: All Services
Namespace: All Namespaces
Result: Shows only CMS services
```

### Use Case 3: Deep Dive into Subproduct
```
Product: CMS
Subproduct: Content Delivery
Service: All Services
Namespace: All Namespaces
Result: Shows only Content Delivery services
```

### Use Case 4: Specific Service Analysis
```
Product: CMS
Subproduct: Content Delivery
Service: assets-delivery-api
Namespace: All Namespaces
Result: Shows only assets-delivery-api data
```

### Use Case 5: Namespace-Level Detail
```
Product: Platform
Subproduct: Data Engineering
Service: webhook-api-rewrite
Namespace: webhook-ns
Result: Shows specific service in specific namespace
```

---

## 📁 Data Source

### File: `cs_microservice_mapping.csv`

**Location:** `/public/cs_microservice_mapping.csv`

**Format:**
```csv
PRODUCT,SUBPRODUCT,SERVICE NAME,NAMESPACE,NOT FOUND? Please add the name and gitrepo details at the end
CMS,Content Delivery,assets-delivery-api,cda-ns,
CMS,Content Management,cma-api,cma-ns,
Platform,Org Admin,auth-service,auth-ns,
...
```

**Column Descriptions:**
- **PRODUCT**: Top-level product (e.g., CMS, Platform, DAM)
- **SUBPRODUCT**: Sub-category within product (e.g., Content Delivery, Org Admin)
- **SERVICE NAME**: Microservice name (note: can have space in header)
- **NAMESPACE**: Kubernetes namespace
- **5th Column**: Optional notes/comments (ignored by dashboard)

**Auto-Reload:** 
- The CSV is loaded with cache-busting (`?t=timestamp`)
- Simply refresh your browser (Cmd+R) after editing the CSV
- No server restart needed!

**Flexible Headers:**
- Columns are detected dynamically by name
- Case-insensitive: "PRODUCT" or "product" both work
- "SERVICE NAME" with space is handled automatically
- Extra columns (like notes) are ignored

---

## 🔧 How It Works Technically

### 1. Loading Mappings
On dashboard load:
```typescript
// Loads and caches the CSV mappings
loadMicroserviceMappings()
```

### 2. Building Filter Options
For each filter level:
```typescript
// Get subproducts for selected product
getSubproductsForProduct(mappings, product)

// Get services for selected product+subproduct
getServicesForProductSubproduct(mappings, product, subproduct)

// Get namespaces for selected product+subproduct+service
getNamespacesForCombination(mappings, product, subproduct, service)
```

### 3. Validating Selections
When a parent filter changes:
```typescript
// Check if current selection is still valid
isValidSubproduct(mappings, product, subproduct)
isValidService(mappings, product, subproduct, service)
isValidNamespace(mappings, product, subproduct, service, namespace)
```

### 4. Auto-Clearing Invalid Selections
```typescript
if (!isValidService(mappings, newProduct, subproduct, service)) {
  service = ''; // Clear invalid service
}
```

---

## 🔄 Updating the Mapping

### When to Update
Update `cs_microservice_mapping.csv` when:
- New microservices are added
- Services move to different products/subproducts
- Namespaces change
- Products or subproducts are renamed

### How to Update

1. **Edit the CSV file:**
   ```bash
   /public/cs_microservice_mapping.csv
   ```

2. **Add new rows:**
   ```csv
   PRODUCT,SUBPRODUCT,SERVICE NAME,NAMESPACE,Optional Notes
   New Product,New Subproduct,new-service,new-ns,Added for Feature X
   ```

3. **Save the file**

4. **Refresh the dashboard (Cmd+R or Ctrl+R)**
   - Changes appear immediately!
   - No code changes needed!
   - No server restart needed!

### Important Notes
- ✅ Headers detected automatically (PRODUCT, SUBPRODUCT, SERVICE NAME, NAMESPACE)
- ✅ Column order flexible (detected by name, not position)
- ✅ Case-insensitive headers
- ✅ "SERVICE NAME" with space supported
- ✅ Extra columns (notes) are okay - they're ignored
- ✅ Empty cells okay (treated as empty strings)
- ⚠️ Names must match EXACTLY with your `cs_unit_test.csv` data
- ⚠️ Commas in names need quotes: `"Product, Inc",Subproduct,service,ns,`

**For detailed instructions, see:** [UPDATING_MICROSERVICE_MAPPING.md](./UPDATING_MICROSERVICE_MAPPING.md)

---

## 🐛 Troubleshooting

### Problem: Dropdown is Empty
**Possible Causes:**
1. No data in CSV for that combination
2. Names don't match between CSV files
3. CSV file not loaded properly

**Solution:**
1. Check browser console for: "✅ Loaded X microservice mappings"
2. Verify CSV file exists at `/public/cs_microservice_mapping.csv`
3. Compare names in mapping CSV vs unit test CSV

### Problem: Selection Gets Cleared
**Expected Behavior:**
- This is intentional! Invalid selections clear automatically
- Example: If you select a CMS subproduct, then switch to DAM product, the CMS subproduct will clear

**If Unexpected:**
- Check if the combination exists in the mapping CSV
- Verify exact name matching (case-sensitive)

### Problem: Filter Shows All Options
**Possible Causes:**
1. CSV file not found or not loaded
2. Parent filters not selected

**Solution:**
1. Check browser console for loading messages
2. Select a product first, then subproduct will filter

---

## 📊 Current Mappings Summary

Based on your `cs_microservice_mapping.csv`:

### Products (11 total)
- AI Assistant
- AI Platform
- Agent OS
- Automate
- Brand Kit
- CMS
- Creative Experience
- DAM
- Data & Insights
- Launch
- Marketplace
- Platform

### Example Product → Subproduct Mappings

**CMS** →
- Assets
- Content Delivery
- Content Management
- Reignite Search
- Venus

**Platform** →
- Data Engineering
- Growth
- Org Admin
- Superadmin

**AI Platform** →
- AI Assistant
- AI Config Store
- AI Platform

**DAM** →
- Asset Managements 2.0

*(and more...)*

---

## ✨ Benefits

1. **Accurate Filtering**: Only shows valid combinations
2. **Better UX**: Users don't see irrelevant options
3. **Data Integrity**: Prevents selecting impossible combinations
4. **Easy Maintenance**: Just update one CSV file
5. **Self-Documenting**: Mapping CSV serves as documentation

---

## 🔮 Future Enhancements

Possible improvements:
1. Admin UI to edit mappings without CSV
2. Import mapping from database
3. Show count of services for each filter option
4. Multi-select filters
5. Save filter presets

---

**Last Updated**: November 2025  
**Source**: `cs_microservice_mapping.csv`  
**Maintainer**: Dashboard Team

