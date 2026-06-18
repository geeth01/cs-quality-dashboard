/**
 * CSV Loader Utility
 * Loads data from CSV files placed in the public folder
 */

import type { UnitTestData, E2ETestData } from '../types';

/**
 * Parse CSV text into array of objects
 * Handles quoted values and empty fields properly
 */
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse CSV line respecting quotes
  function parseLine(line: string): string[] {
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

  const headers = parseLine(lines[0]);
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const values = parseLine(lines[i]);
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Only add row if it has at least a date or service name
    if (row.DATE || row.date || row.SERVICE_NAME || row.service_name || row.PRODUCT || row.product) {
      data.push(row);
    }
  }

  return data;
}

/**
 * Month name to date mapping
 */
const MONTH_TO_DATE: Record<string, string> = {
  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
  'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
  'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
};

/**
 * Transform monthly columns to date-based records
 * Format: COVERAGE_%_Feb_2025, TEST_COUNT_Feb_2025 → date: 2025-02-01
 */
function transformMonthlyData(row: Record<string, string>): UnitTestData[] {
  // Handle both column orders:
  // 1. Correct: PRODUCT,SUBPRODUCT,SERVICE_NAME,NAMESPACE
  // 2. Common mistake: PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME (but data is still SERVICE_NAME,NAMESPACE)
  
  let serviceName = row.SERVICE_NAME || row['SERVICE NAME'] || row.service_name || '';
  let namespace = row.NAMESPACE || row.namespace || '';
  
  // Auto-detect and fix column swap
  // If SERVICE_NAME looks like a namespace, swap them
  // Common namespace patterns: ends with -ns, or specific known namespaces
  const namespacePatterns = ['-ns', 'analytics', 'contentfly', 'contentstack', 'superadmin-rewrite'];
  const serviceNameLooksLikeNamespace = namespacePatterns.some(pattern => 
    serviceName.endsWith(pattern) || serviceName === pattern
  );
  const namespaceLooksLikeService = namespace && !namespacePatterns.some(pattern => 
    namespace.endsWith(pattern) || namespace === pattern
  );
  
  if (serviceNameLooksLikeNamespace && namespaceLooksLikeService) {
    // Swap them
    [serviceName, namespace] = [namespace, serviceName];
  }
  
  const baseData = {
    product: row.PRODUCT || row.product || '',
    subproduct: row.SUBPRODUCT || row.subproduct || '',
    namespace: namespace,
    service_name: serviceName,
  };

  const records: UnitTestData[] = [];
  let recordId = 1;

  // Find all monthly columns (e.g., COVERAGE_%_Feb_2025)
  const headers = Object.keys(row);
  const monthlyData = new Map<string, { coverage?: string, count?: string }>();

  // Group coverage and count by month
  headers.forEach(header => {
    const coverageMatch = header.match(/COVERAGE_%_(\w+)_(\d{4})/);
    const countMatch = header.match(/TEST_COUNT_(\w+)_(\d{4})/);

    if (coverageMatch) {
      const [, month, year] = coverageMatch;
      const key = `${month}_${year}`;
      if (!monthlyData.has(key)) {
        monthlyData.set(key, {});
      }
      monthlyData.get(key)!.coverage = row[header];
    } else if (countMatch) {
      const [, month, year] = countMatch;
      const key = `${month}_${year}`;
      if (!monthlyData.has(key)) {
        monthlyData.set(key, {});
      }
      monthlyData.get(key)!.count = row[header];
    }
  });

  // Transform each month to a record
  monthlyData.forEach((data, key) => {
    const [month, year] = key.split('_');
    
    // Convert month name to number
    const monthNum = MONTH_TO_DATE[month];
    if (!monthNum) {
      console.warn(`Unknown month: ${month}`);
      return;
    }

    // Create date string (YYYY-MM-DD)
    const date = `${year}-${monthNum}-01`;

    // Parse values - ALWAYS use 0 if missing or empty (no skipping!)
    const hasCoverage = data.coverage && data.coverage.trim() !== '';
    const hasCount = data.count && data.count.trim() !== '';
    
    const coverage = hasCoverage ? parseFloat(data.coverage!) || 0 : 0;
    const count = hasCount ? parseInt(data.count!) || 0 : 0;

    // Include ALL services, even with 0 coverage and 0 tests
    records.push({
      id: recordId++,
      date,
      ...baseData,
      coverage_pct: coverage,
      test_count: count,
    });
  });

  return records;
}

/**
 * Load unit test data from CSV file
 * Supports two formats:
 * 1. Date-based: DATE,PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%,TEST_COUNT
 * 2. Monthly: PRODUCT,SUBPRODUCT,NAMESPACE,SERVICE_NAME,COVERAGE_%_Feb_2025,TEST_COUNT_Feb_2025,...
 */
export async function loadUnitTestCSV(): Promise<UnitTestData[]> {
  try {
    const response = await fetch('/data/cs_unit_test.csv');
    if (!response.ok) {
      console.warn('Unit test CSV not found, using mock data');
      return [];
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length === 0) return [];

    // Detect format by checking first row
    const firstRow = rows[0];
    const hasDateColumn = 'DATE' in firstRow || 'date' in firstRow;
    const hasMonthlyCoverage = Object.keys(firstRow).some(k => k.match(/COVERAGE_%_\w+_\d{4}/));

    if (hasMonthlyCoverage) {
      // New monthly format - transform to date-based records
      console.log('📅 Detected monthly column format, transforming to date-based records...');
      const allRecords: UnitTestData[] = [];
      let globalId = 1;

      rows.forEach(row => {
        const monthlyRecords = transformMonthlyData(row);
        monthlyRecords.forEach(record => {
          allRecords.push({ ...record, id: globalId++ });
        });
      });

      console.log(`✅ Transformed ${rows.length} rows into ${allRecords.length} date-based records`);
      return allRecords;
    } else if (hasDateColumn) {
      // Old date-based format - parse as before
      console.log('📅 Detected date-based format');
      return rows.map((row, index) => ({
        id: index + 1,
        date: row.DATE || row.date || '',
        product: row.PRODUCT || row.product || '',
        subproduct: row.SUBPRODUCT || row.subproduct || '',
        namespace: row.NAMESPACE || row.namespace || '',
        service_name: row.SERVICE_NAME || row['SERVICE NAME'] || row.service_name || '',
        coverage_pct: parseFloat(row['COVERAGE_%'] || row.COVERAGE_PCT || row.coverage_pct || '0') || 0,
        test_count: parseInt(row.TEST_COUNT || row.test_count || '0') || 0,
      }));
    } else {
      console.error('❌ Unknown CSV format - no DATE column or monthly columns found');
      return [];
    }
  } catch (error) {
    console.error('Error loading unit test CSV:', error);
    return [];
  }
}

/**
 * Transform E2E monthly columns to date-based records
 * Format: TEST_COUNT_Feb_2025 → date: 2025-02-01
 */
function transformE2EMonthlyData(row: Record<string, string>): E2ETestData[] {
  const product = row.PRODUCT || row.product || '';
  const records: E2ETestData[] = [];
  let recordId = 1;

  // Find all monthly columns (e.g., TEST_COUNT_Feb_2025)
  const headers = Object.keys(row);
  const monthlyData = new Map<string, string>();

  // Group test counts by month
  headers.forEach(header => {
    const countMatch = header.match(/TEST_COUNT_(\w+)_(\d{4})/);

    if (countMatch) {
      const [, month, year] = countMatch;
      const key = `${month}_${year}`;
      monthlyData.set(key, row[header]);
    }
  });

  // Transform each month to a record
  monthlyData.forEach((countValue, key) => {
    const [month, year] = key.split('_');
    
    // Skip if test count is missing/empty
    if (!countValue || countValue.trim() === '') {
      return;
    }

    // Convert month name to number
    const monthNum = MONTH_TO_DATE[month];
    if (!monthNum) {
      console.warn(`Unknown month: ${month}`);
      return;
    }

    // Create date string (YYYY-MM-DD)
    const date = `${year}-${monthNum}-01`;

    // Parse value
    const count = parseInt(countValue) || 0;

    records.push({
      id: recordId++,
      date,
      product,
      test_count: count,
    });
  });

  return records;
}

/**
 * Load E2E test data from CSV file
 * Supports two formats:
 * 1. Date-based: DATE,PRODUCT,TEST_COUNT
 * 2. Monthly: PRODUCT,TEST_COUNT_Feb_2025,TEST_COUNT_Mar_2025,...
 */
export async function loadE2ETestCSV(): Promise<E2ETestData[]> {
  try {
    const response = await fetch('/data/cs_e2e_test.csv');
    if (!response.ok) {
      console.warn('E2E test CSV not found, using mock data');
      return [];
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length === 0) return [];

    // Detect format by checking first row
    const firstRow = rows[0];
    const hasDateColumn = 'DATE' in firstRow || 'date' in firstRow;
    const hasMonthlyCount = Object.keys(firstRow).some(k => k.match(/TEST_COUNT_\w+_\d{4}/));

    if (hasMonthlyCount) {
      // New monthly format - transform to date-based records
      console.log('📅 E2E: Detected monthly column format, transforming to date-based records...');
      const allRecords: E2ETestData[] = [];
      let globalId = 1;

      rows.forEach(row => {
        const monthlyRecords = transformE2EMonthlyData(row);
        monthlyRecords.forEach(record => {
          allRecords.push({ ...record, id: globalId++ });
        });
      });

      console.log(`✅ E2E: Transformed ${rows.length} rows into ${allRecords.length} date-based records`);
      return allRecords;
    } else if (hasDateColumn) {
      // Old date-based format - parse as before
      console.log('📅 E2E: Detected date-based format');
      return rows.map((row, index) => ({
        id: index + 1,
        date: row.DATE || row.date || '',
        product: row.PRODUCT || row.product || '',
        test_count: parseInt(row.TEST_COUNT || row.test_count || '0') || 0,
      }));
    } else {
      console.error('❌ E2E: Unknown CSV format - no DATE column or monthly columns found');
      return [];
    }
  } catch (error) {
    console.error('Error loading E2E test CSV:', error);
    return [];
  }
}

/**
 * Check if CSV files are available
 */
export async function hasCSVFiles(): Promise<{unitTests: boolean, e2eTests: boolean}> {
  const unitTests = await fetch('/data/cs_unit_test.csv', { method: 'HEAD' })
    .then(r => r.ok)
    .catch(() => false);
  
  const e2eTests = await fetch('/data/cs_e2e_test.csv', { method: 'HEAD' })
    .then(r => r.ok)
    .catch(() => false);

  return { unitTests, e2eTests };
}

