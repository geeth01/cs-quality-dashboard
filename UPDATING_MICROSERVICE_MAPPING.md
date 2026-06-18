# Updating Microservice Mapping Guide

## 📝 How to Update the Mapping

### File Location
```
/public/cs_microservice_mapping.csv
```

### CSV Format

**Required Columns (in order):**
1. `PRODUCT` - Product name
2. `SUBPRODUCT` - Subproduct name
3. `SERVICE NAME` - Service name (note: can have space)
4. `NAMESPACE` - Kubernetes namespace
5. Additional columns (optional, ignored by dashboard)

### Example Format
```csv
PRODUCT,SUBPRODUCT,SERVICE NAME,NAMESPACE,NOT FOUND? Please add the name and gitrepo details at the end
CMS,Content Delivery,assets-delivery-api,cda-ns,
Platform,Org Admin,auth-service,auth-ns,
AI Platform,AI Platform,ai-platform-service,ai-platform-ns,
```

---

## ✏️ How to Add/Edit Entries

### Adding a New Service

1. **Open the CSV file:**
   ```
   /public/cs_microservice_mapping.csv
   ```

2. **Add a new row at the end:**
   ```csv
   New Product,New Subproduct,new-service-name,new-namespace,
   ```

3. **Save the file**

4. **Refresh the dashboard** (Cmd+R or F5)
   - The CSV is loaded with cache-busting
   - Changes appear immediately

### Editing Existing Entries

1. Find the row you want to edit
2. Update the values (keep commas in place)
3. Save the file
4. Refresh the dashboard

### Removing Entries

1. Delete the entire row
2. Save the file
3. Refresh the dashboard

---

## ⚠️ Important Rules

### Column Names
- **Case-insensitive**: `PRODUCT`, `Product`, or `product` all work
- **SERVICE NAME**: Can have a space (both "SERVICE NAME" and "SERVICE_NAME" work)
- **Order matters**: Columns must be in the order shown above
- **Extra columns**: OK to have additional columns (like your notes column), they're ignored

### Data Requirements
- ✅ **PRODUCT**: Required, cannot be empty
- ✅ **SUBPRODUCT**: Required, cannot be empty
- ✅ **SERVICE NAME**: Required, cannot be empty
- ⚠️ **NAMESPACE**: Optional, can be empty (rare)
- ❌ Empty rows are skipped automatically

### Special Characters
- **Commas in names**: If a name has a comma, wrap it in quotes:
  ```csv
  "Product, Inc",Subproduct,service-name,namespace,
  ```
- **Quotes in names**: Use double quotes:
  ```csv
  Product,"Subproduct ""Quoted""",service-name,namespace,
  ```
- **Trailing commas**: OK to have trailing commas (they're handled)

---

## 🔄 How Auto-Reload Works

### Cache-Busting
The dashboard loads the CSV with a timestamp parameter:
```
/cs_microservice_mapping.csv?t=1700000000000
```

This ensures you always get the latest version when you refresh.

### When Changes Take Effect

1. **Edit CSV** → Save
2. **Refresh browser** → New data loads
3. **Dropdowns update** → Shows new options immediately

**No server restart needed!** ✅

### Comprehensive Data Display

The dashboard now shows **ALL** items from the mapping CSV, even if they don't have test data yet:

- ✅ **All products** from mapping appear in the Product dropdown
- ✅ **All subproducts** from mapping appear (filtered by product if selected)
- ✅ **All services** from mapping appear (filtered by product/subproduct if selected)
- ✅ **All namespaces** from mapping appear (filtered by selections)

**This means:**
- No missing products/services in dropdowns
- You can see what services exist even without test data
- Complete visibility of your microservice architecture

---

## 🧪 Testing Your Changes

### After Updating the CSV:

1. **Refresh the browser** (Cmd+R or F5)

2. **Check the browser console** (F12 → Console):
   ```
   ✅ Loaded 229 microservice mappings from CSV
   📊 11 products, 25 subproducts, 220 services
   🎯 Cascading filters initialized with mapping data
   ```

3. **Test the filters:**
   - Select your new/updated product
   - Verify subproducts appear correctly
   - Check services filter properly
   - Confirm namespaces show up

### Verification Checklist

- [ ] Console shows correct count of mappings
- [ ] New product appears in Product dropdown
- [ ] New subproduct appears when product selected
- [ ] New service appears when product+subproduct selected
- [ ] Namespace appears when all selected
- [ ] No console errors

---

## 🐛 Troubleshooting

### Problem: Changes Don't Appear

**Possible Causes:**
1. Browser cache is aggressive
2. File not saved properly
3. CSV format error

**Solutions:**
```bash
# Hard refresh
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R

# Or clear browser cache
# Or open in incognito/private window
```

### Problem: Console Shows "0 mappings loaded"

**Possible Causes:**
1. CSV file not in correct location
2. CSV format error
3. All rows are invalid

**Solutions:**
1. Verify file is at: `/public/cs_microservice_mapping.csv`
2. Check console for error messages
3. Verify CSV has valid data rows (not just header)

### Problem: "Required columns not found"

**Error in console:**
```
❌ Required columns not found. Expected: PRODUCT, SUBPRODUCT, SERVICE NAME, NAMESPACE
Found columns: [actual columns]
```

**Solution:**
- Check that header row has these columns
- Column names can have spaces
- Order must match

### Problem: Some Services Not Appearing

**Possible Causes:**
1. Missing required fields (product, subproduct, or service name)
2. Whitespace issues
3. Row is commented out or deleted

**Solution:**
1. Check that row has all required fields filled
2. Remove extra spaces
3. Verify row exists in CSV

---

## 📊 Current Mapping Statistics

Your current CSV has:
- **229 total mappings** (excluding empty rows)
- **12 unique products**:
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
- **Multiple subproducts per product**
- **220+ unique services**

---

## 💡 Best Practices

### 1. **Consistent Naming**
```csv
✅ Good: CMS,Content Delivery,service-name,cda-ns,
❌ Bad:  cms,content delivery,service-name,cda-ns,  (inconsistent case)
```

### 2. **One Service Per Row**
```csv
✅ Good:
CMS,Content Delivery,service-1,cda-ns,
CMS,Content Delivery,service-2,cda-ns,

❌ Bad:
CMS,Content Delivery,service-1; service-2,cda-ns,
```

### 3. **Keep It Updated**
- Add new services as they're created
- Remove decommissioned services
- Update product/subproduct changes
- Keep namespace mappings accurate

### 4. **Document Changes**
Use the 5th column for notes:
```csv
PRODUCT,SUBPRODUCT,SERVICE NAME,NAMESPACE,NOTES
CMS,Content Delivery,new-service,cda-ns,Added on 2025-11-15 for Feature X
```

### 5. **Backup Before Major Changes**
```bash
cp cs_microservice_mapping.csv cs_microservice_mapping.backup.csv
```

---

## 🔍 Validation

The dashboard automatically validates:
- ✅ Skips empty rows
- ✅ Skips rows missing required fields
- ✅ Trims whitespace
- ✅ Handles trailing commas
- ✅ Case-insensitive column headers
- ✅ Flexible column names (SERVICE NAME or SERVICE_NAME)

---

## 📞 Getting Help

### Console Logging

The dashboard provides helpful console messages:

**Success:**
```
📋 CSV Headers: ["PRODUCT", "SUBPRODUCT", "SERVICE NAME", "NAMESPACE", ...]
✅ Loaded 229 microservice mappings from CSV
📊 11 products, 25 subproducts, 220 services
🎯 Cascading filters initialized with mapping data
```

**Errors:**
```
❌ Required columns not found...
❌ Error loading microservice mappings: [error details]
```

**Warnings:**
```
⚠️ CSV file is empty or has no data rows
⚠️ Microservice mapping CSV not found
```

---

## 🎯 Quick Reference

### File Path
```
/public/cs_microservice_mapping.csv
```

### To Add Service
1. Add row to CSV
2. Save
3. Refresh browser (Cmd+R)

### To Test
1. Open browser console (F12)
2. Look for "✅ Loaded X mappings"
3. Test dropdown filters

### Common Issues
- Hard refresh if changes don't appear
- Check console for errors
- Verify all required fields are filled
- Ensure CSV is in `/public/` folder

---

**Last Updated**: November 2025  
**CSV Version**: With 5 columns (includes notes column)  
**Auto-reload**: Enabled with cache-busting

