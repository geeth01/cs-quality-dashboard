/**
 * Product to Subproduct Mapping
 * 
 * This file defines the relationship between products and their subproducts.
 * When a product is selected in filters, only its associated subproducts will be shown.
 * 
 * HOW TO UPDATE:
 * 1. Add new product as key
 * 2. Add array of subproducts as value
 * 3. Ensure product and subproduct names match exactly with your CSV data
 */

export const PRODUCT_SUBPRODUCT_MAP: Record<string, string[]> = {
  'AI Platform': [
    'AI Platform',
  ],
  
  'Automate': [
    'Automate',
  ],
  
  'CMS': [
    'Content Delivery',
    'Content Management',
    'Developer Experience',
    'Reignite Search',
    'RTE',
    'UX Experience',
    'Venus',
  ],
  
  'Creative Experience': [
    'Composable Studio',
    'Visual Builder',
    'Visual Preview',
  ],
  
  'DAM': [
    'Asset Managements 2.0',
    'Assets',
  ],
  
  'Data & Insights': [
    'Lytics',
    'Personalize',
  ],
  
  'Launch': [
    'Launch',
  ],
  
  'Marketplace': [
    'Marketplace',
  ],
  
  'Platform': [
    'Data Engineering',
    'Growth',
    'Superadmin',
    'Org Admin',
  ],
};

/**
 * Get subproducts for a specific product
 */
export function getSubproductsForProduct(product: string): string[] {
  return PRODUCT_SUBPRODUCT_MAP[product] || [];
}

/**
 * Get all subproducts (for "All Products" selection)
 */
export function getAllSubproducts(): string[] {
  return Object.values(PRODUCT_SUBPRODUCT_MAP).flat();
}

/**
 * Check if a subproduct belongs to a product
 */
export function isValidSubproductForProduct(product: string, subproduct: string): boolean {
  if (!product) return true; // If no product selected, all subproducts are valid
  const validSubproducts = getSubproductsForProduct(product);
  return validSubproducts.includes(subproduct);
}

/**
 * Get all products
 */
export function getAllProducts(): string[] {
  return Object.keys(PRODUCT_SUBPRODUCT_MAP);
}

