# Product to Subproduct Mapping Reference

This document explains the relationship between products and their subproducts in the CS Quality Dashboard.

## 📋 Current Mapping

### AI Platform
- AI Platform

### Automate
- Automate

### CMS
- Content Delivery
- Content Management
- Developer Experience
- Reignite Search
- RTE
- UX Experience
- Venus

### Creative Experience
- Composable Studio
- Visual Builder
- Visual Preview

### DAM
- Asset Managements 2.0
- Assets

### Data & Insights
- Lytics
- Personalize

### Launch
- Launch

### Marketplace
- Marketplace

### Platform
- Data Engineering
- Growth
- Superadmin
- Org Admin

---

## 🎯 How It Works in the Dashboard

### 1. **All Products Selected**
When "All Products" is selected in the dropdown:
- Shows all subproducts across all products
- User can select any subproduct

### 2. **Specific Product Selected**
When a specific product (e.g., "CMS") is selected:
- Subproduct dropdown shows ONLY subproducts for that product
- Example: If "CMS" is selected, only shows:
  - Content Delivery
  - Content Management
  - Developer Experience
  - Reignite Search
  - RTE
  - UX Experience
  - Venus

### 3. **Auto-Clear Behavior**
When switching products:
- If the currently selected subproduct doesn't belong to the new product
- The subproduct selection is automatically cleared
- Example: If "Content Delivery" (CMS) is selected and you switch to "DAM", the subproduct clears

---

## 🔧 How to Update the Mapping

### File Location
`src/data/productSubproductMapping.ts`

### Adding a New Product

```typescript
export const PRODUCT_SUBPRODUCT_MAP: Record<string, string[]> = {
  // ... existing products ...
  
  'New Product Name': [
    'Subproduct 1',
    'Subproduct 2',
    'Subproduct 3',
  ],
};
```

### Adding Subproducts to Existing Product

```typescript
'CMS': [
  'Content Delivery',
  'Content Management',
  'Developer Experience',
  'Reignite Search',
  'RTE',
  'UX Experience',
  'Venus',
  'New Subproduct',  // Add here
],
```

### Removing a Product or Subproduct

Simply delete the line from the mapping file.

---

## ⚠️ Important Notes

1. **Exact Matching**: Product and subproduct names MUST match EXACTLY with your CSV data
   - Case-sensitive
   - Spaces matter
   - Special characters matter

2. **CSV Data**: The mapping only controls the UI filtering
   - Your CSV data should still have the correct PRODUCT and SUBPRODUCT columns
   - The dashboard will only show data that exists in the CSV

3. **Testing**: After updating the mapping:
   - Refresh the dashboard
   - Test each product dropdown
   - Verify subproducts filter correctly

---

## 📊 Example Use Cases

### Use Case 1: View all CMS services
1. Select "CMS" from Product dropdown
2. Leave Subproduct as "All CMS Subproducts"
3. See all CMS services across all 7 subproducts

### Use Case 2: View specific subproduct
1. Select "CMS" from Product dropdown
2. Select "Content Delivery" from Subproduct dropdown
3. See only Content Delivery services

### Use Case 3: View everything
1. Select "All Products"
2. Select "All Subproducts"
3. See all 222 services

---

## 🔍 Debugging

### Subproduct dropdown is empty
- Check if the product has subproducts defined in the mapping
- Verify product name matches exactly (case-sensitive)

### Subproduct doesn't appear
- Check if it's listed under the correct product in the mapping
- Verify the subproduct name matches your CSV data exactly

### Subproduct clears when switching products
- This is expected behavior
- It means the subproduct doesn't belong to the new product

---

## 📝 Future Enhancements

Possible improvements to consider:
1. Load mapping from a JSON file or database
2. Admin UI to manage mappings
3. Multi-select for subproducts
4. Hierarchical tree view

---

**Last Updated**: November 2025  
**Maintainer**: Dashboard Team

