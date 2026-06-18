/**
 * Microservice Mapping Loader
 * 
 * Loads and parses cs_microservice_mapping.csv to build cascading filter relationships
 * Product → Subproduct → Service → Namespace
 */

export interface MicroserviceMapping {
  product: string;
  subproduct: string;
  serviceName: string;
  namespace: string;
}


/**
 * Parse a CSV line properly handling quotes and multiple columns
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Load microservice mappings from CSV
 * Note: Always reloads to get latest data (no caching)
 */
export async function loadMicroserviceMappings(): Promise<MicroserviceMapping[]> {
  try {
    // Add cache-busting parameter to always get fresh data
    const timestamp = new Date().getTime();
    const response = await fetch(`/cs_microservice_mapping.csv?t=${timestamp}`);
    
    if (!response.ok) {
      console.warn('Microservice mapping CSV not found');
      return [];
    }

    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      console.warn('CSV file is empty or has no data rows');
      return [];
    }

    const mappings: MicroserviceMapping[] = [];
    
    // Parse header to understand column positions
    const headers = parseCSVLine(lines[0]);
    console.log('📋 CSV Headers:', headers);
    
    // Find column indices (case-insensitive)
    const productIdx = headers.findIndex(h => h.toUpperCase() === 'PRODUCT');
    const subproductIdx = headers.findIndex(h => h.toUpperCase() === 'SUBPRODUCT');
    const serviceIdx = headers.findIndex(h => h.toUpperCase().includes('SERVICE'));
    const namespaceIdx = headers.findIndex(h => h.toUpperCase() === 'NAMESPACE');
    
    if (productIdx === -1 || subproductIdx === -1 || serviceIdx === -1 || namespaceIdx === -1) {
      console.error('❌ Required columns not found. Expected: PRODUCT, SUBPRODUCT, SERVICE NAME, NAMESPACE');
      console.error('Found columns:', headers);
      return [];
    }
    
    // Skip header row (index 0), start from row 1
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = parseCSVLine(line);
      
      // Only add if we have the required data
      const product = parts[productIdx]?.trim() || '';
      const subproduct = parts[subproductIdx]?.trim() || '';
      const serviceName = parts[serviceIdx]?.trim() || '';
      const namespace = parts[namespaceIdx]?.trim() || '';
      
      // Skip rows with missing critical data
      if (!product || !subproduct || !serviceName) {
        continue;
      }
      
      mappings.push({
        product,
        subproduct,
        serviceName,
        namespace,
      });
    }

    console.log(`✅ Loaded ${mappings.length} microservice mappings from CSV`);
    
    // Log unique counts for verification
    const uniqueProducts = new Set(mappings.map(m => m.product)).size;
    const uniqueSubproducts = new Set(mappings.map(m => m.subproduct)).size;
    const uniqueServices = new Set(mappings.map(m => m.serviceName)).size;
    console.log(`   📊 ${uniqueProducts} products, ${uniqueSubproducts} subproducts, ${uniqueServices} services`);
    
    return mappings;
    
  } catch (error) {
    console.error('❌ Error loading microservice mappings:', error);
    return [];
  }
}

/**
 * Force reload of mappings (clears cache)
 */
export function reloadMappings(): void {
  // no-op: mappings are always reloaded fresh on next call
}

/**
 * Get unique products from mappings
 */
export function getUniqueProducts(mappings: MicroserviceMapping[]): string[] {
  return Array.from(new Set(mappings.map(m => m.product).filter(Boolean))).sort();
}

/**
 * Get all unique subproducts from mappings (not filtered)
 */
export function getAllSubproducts(mappings: MicroserviceMapping[]): string[] {
  return Array.from(new Set(mappings.map(m => m.subproduct).filter(Boolean))).sort();
}

/**
 * Get all unique services from mappings (not filtered)
 */
export function getAllServices(mappings: MicroserviceMapping[]): string[] {
  return Array.from(new Set(mappings.map(m => m.serviceName).filter(Boolean))).sort();
}

/**
 * Get all unique namespaces from mappings (not filtered)
 */
export function getAllNamespaces(mappings: MicroserviceMapping[]): string[] {
  return Array.from(new Set(mappings.map(m => m.namespace).filter(Boolean))).sort();
}

/**
 * Get subproducts for a specific product
 */
export function getSubproductsForProduct(
  mappings: MicroserviceMapping[], 
  product: string
): string[] {
  if (!product) return [];
  
  return Array.from(
    new Set(
      mappings
        .filter(m => m.product === product)
        .map(m => m.subproduct)
        .filter(Boolean)
    )
  ).sort();
}

/**
 * Get services for a specific product and subproduct combination
 */
export function getServicesForProductSubproduct(
  mappings: MicroserviceMapping[],
  product: string,
  subproduct: string
): string[] {
  if (!product && !subproduct) return [];
  
  return Array.from(
    new Set(
      mappings
        .filter(m => {
          if (product && m.product !== product) return false;
          if (subproduct && m.subproduct !== subproduct) return false;
          return true;
        })
        .map(m => m.serviceName)
        .filter(Boolean)
    )
  ).sort();
}

/**
 * Get namespaces for a specific product, subproduct, and service combination
 */
export function getNamespacesForCombination(
  mappings: MicroserviceMapping[],
  product: string,
  subproduct: string,
  service: string
): string[] {
  return Array.from(
    new Set(
      mappings
        .filter(m => {
          if (product && m.product !== product) return false;
          if (subproduct && m.subproduct !== subproduct) return false;
          if (service && m.serviceName !== service) return false;
          return true;
        })
        .map(m => m.namespace)
        .filter(Boolean)
    )
  ).sort();
}

/**
 * Check if a subproduct is valid for a product
 */
export function isValidSubproduct(
  mappings: MicroserviceMapping[],
  product: string,
  subproduct: string
): boolean {
  if (!product || !subproduct) return true;
  return mappings.some(m => m.product === product && m.subproduct === subproduct);
}

/**
 * Check if a service is valid for a product/subproduct combination
 */
export function isValidService(
  mappings: MicroserviceMapping[],
  product: string,
  subproduct: string,
  service: string
): boolean {
  if (!service) return true;
  
  return mappings.some(m => {
    if (product && m.product !== product) return false;
    if (subproduct && m.subproduct !== subproduct) return false;
    return m.serviceName === service;
  });
}

/**
 * Check if a namespace is valid for a product/subproduct/service combination
 */
export function isValidNamespace(
  mappings: MicroserviceMapping[],
  product: string,
  subproduct: string,
  service: string,
  namespace: string
): boolean {
  if (!namespace) return true;
  
  return mappings.some(m => {
    if (product && m.product !== product) return false;
    if (subproduct && m.subproduct !== subproduct) return false;
    if (service && m.serviceName !== service) return false;
    return m.namespace === namespace;
  });
}

