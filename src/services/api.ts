/**
 * API Service Layer
 * 
 * CURRENT STATE: Using mock data for development
 * TODO: Replace with actual database API calls when ready
 * 
 * When database is ready:
 * 1. Set up API endpoint (e.g., Express/FastAPI server)
 * 2. Replace mock functions with fetch/axios calls
 * 3. Update BASE_URL to your API endpoint
 */

import type { 
  UnitTestData, 
  E2ETestData, 
  FilterOptions, 
  DashboardFilters,
  SummaryStats,
  ChartDataPoint 
} from '../types';
import { generateMockData } from './mockData';
import { loadUnitTestCSV, loadE2ETestCSV, hasCSVFiles } from '../utils/csvLoader';

// TODO: Replace with your actual API endpoint
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'; // Default to true

// Cache for CSV data
let csvDataCache: {
  unitTests: UnitTestData[] | null;
  e2eTests: E2ETestData[] | null;
  hasCSV: { unitTests: boolean; e2eTests: boolean } | null;
} = {
  unitTests: null,
  e2eTests: null,
  hasCSV: null,
};

/**
 * Check if user has provided CSV files
 */
async function checkForCSVFiles() {
  if (csvDataCache.hasCSV === null) {
    csvDataCache.hasCSV = await hasCSVFiles();
  }
  return csvDataCache.hasCSV;
}

/**
 * Load data from CSV files if available, otherwise use mock data
 */
async function loadDataSource(filters: DashboardFilters): Promise<{
  unitTests: UnitTestData[];
  e2eTests: E2ETestData[];
  isFromCSV: boolean;
}> {
  const hasCSV = await checkForCSVFiles();
  
  // Try to load from CSV first
  if (hasCSV.unitTests) {
    if (csvDataCache.unitTests === null) {
      csvDataCache.unitTests = await loadUnitTestCSV();
      console.log('✅ Loaded unit test data from CSV:', csvDataCache.unitTests.length, 'records');
    }
  }
  
  if (hasCSV.e2eTests) {
    if (csvDataCache.e2eTests === null) {
      csvDataCache.e2eTests = await loadE2ETestCSV();
      console.log('✅ Loaded E2E test data from CSV:', csvDataCache.e2eTests.length, 'records');
    }
  }

  // Use CSV data if available, otherwise use mock data
  const isFromCSV = hasCSV.unitTests || hasCSV.e2eTests;
  
  if (isFromCSV) {
    const mockData = generateMockData(250, filters.dateFrom, filters.dateTo);
    return {
      unitTests: csvDataCache.unitTests || mockData.unitTests,
      e2eTests: csvDataCache.e2eTests || mockData.e2eTests,
      isFromCSV: true,
    };
  } else {
    const mockData = generateMockData(250, filters.dateFrom, filters.dateTo);
    return {
      unitTests: mockData.unitTests,
      e2eTests: mockData.e2eTests,
      isFromCSV: false,
    };
  }
}

/**
 * Fetch unit test coverage data with filters
 */
export async function fetchUnitTestData(filters: DashboardFilters): Promise<UnitTestData[]> {
  if (USE_MOCK_DATA) {
    // Load from CSV if available, otherwise use mock data
    const dataSource = await loadDataSource(filters);
    return filterMockData(dataSource.unitTests, filters);
  }

  // TODO: Uncomment and use when database API is ready
  /*
  const params = new URLSearchParams();
  if (filters.product) params.append('product', filters.product);
  if (filters.subproduct) params.append('subproduct', filters.subproduct);
  if (filters.namespace) params.append('namespace', filters.namespace);
  if (filters.service) params.append('service', filters.service);
  if (filters.dateFrom) params.append('date_from', filters.dateFrom);
  if (filters.dateTo) params.append('date_to', filters.dateTo);

  const response = await fetch(`${BASE_URL}/unit-tests?${params}`);
  if (!response.ok) throw new Error('Failed to fetch unit test data');
  return response.json();
  */
  
  return [];
}

/**
 * Fetch E2E test data with filters
 */
export async function fetchE2ETestData(filters: DashboardFilters): Promise<E2ETestData[]> {
  if (USE_MOCK_DATA) {
    // Load from CSV if available, otherwise use mock data
    const dataSource = await loadDataSource(filters);
    return filterE2EMockData(dataSource.e2eTests, filters);
  }

  // TODO: Uncomment when ready
  /*
  const params = new URLSearchParams();
  if (filters.product) params.append('product', filters.product);
  if (filters.dateFrom) params.append('date_from', filters.dateFrom);
  if (filters.dateTo) params.append('date_to', filters.dateTo);

  const response = await fetch(`${BASE_URL}/e2e-tests?${params}`);
  if (!response.ok) throw new Error('Failed to fetch E2E test data');
  return response.json();
  */
  
  return [];
}

/**
 * Get available filter options (products, subproducts, etc.)
 */
export async function fetchFilterOptions(): Promise<FilterOptions> {
  if (USE_MOCK_DATA) {
    // Load from CSV if available, otherwise use mock data
    const dataSource = await loadDataSource({
      product: '',
      subproduct: '',
      namespace: '',
      service: '',
      dateFrom: '',
      dateTo: '',
    });
    return extractFilterOptions(dataSource.unitTests);
  }

  // TODO: Uncomment when ready
  /*
  const response = await fetch(`${BASE_URL}/filter-options`);
  if (!response.ok) throw new Error('Failed to fetch filter options');
  return response.json();
  */
  
  return { products: [], subproducts: [], namespaces: [], services: [] };
}

/**
 * Check if using CSV data
 */
export async function isUsingCSVData(): Promise<boolean> {
  const hasCSV = await checkForCSVFiles();
  return hasCSV.unitTests || hasCSV.e2eTests;
}

/**
 * Calculate summary statistics
 */
export async function fetchSummaryStats(filters: DashboardFilters): Promise<SummaryStats> {
  const data = await fetchUnitTestData(filters);
  
  if (data.length === 0) {
    return {
      total_services: 0,
      avg_coverage: 0,
      total_tests: 0,
      services_below_threshold: 0,
      coverage_trend: 0,
    };
  }

  // Get latest data per service
  const latestByService = new Map<string, UnitTestData>();
  data.forEach(record => {
    const key = `${record.product}-${record.subproduct}-${record.service_name}`;
    const existing = latestByService.get(key);
    if (!existing || record.date > existing.date) {
      latestByService.set(key, record);
    }
  });

  const latestData = Array.from(latestByService.values());
  const totalServices = latestData.length;
  const avgCoverage = latestData.reduce((sum, d) => sum + d.coverage_pct, 0) / totalServices;
  const totalTests = latestData.reduce((sum, d) => sum + d.test_count, 0);
  const servicesBelowThreshold = latestData.filter(d => d.coverage_pct < 70).length;

  // Calculate trend (compare with 7 days ago)
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  
  const weekAgoData = data.filter(d => d.date === weekAgoStr);
  if (weekAgoData.length > 0) {
    const weekAgoAvg = weekAgoData.reduce((sum, d) => sum + d.coverage_pct, 0) / weekAgoData.length;
    const coverageTrend = avgCoverage - weekAgoAvg;
    
    return {
      total_services: totalServices,
      avg_coverage: avgCoverage,
      total_tests: totalTests,
      services_below_threshold: servicesBelowThreshold,
      coverage_trend: coverageTrend,
    };
  }

  return {
    total_services: totalServices,
    avg_coverage: avgCoverage,
    total_tests: totalTests,
    services_below_threshold: servicesBelowThreshold,
    coverage_trend: 0,
  };
}

/**
 * Get chart data for coverage trends over time
 */
export async function fetchChartData(filters: DashboardFilters): Promise<ChartDataPoint[]> {
  const data = await fetchUnitTestData(filters);
  
  // Group by date and calculate averages
  const byDate = new Map<string, { totalCoverage: number; totalTests: number; count: number }>();
  
  data.forEach(record => {
    const existing = byDate.get(record.date) || { totalCoverage: 0, totalTests: 0, count: 0 };
    existing.totalCoverage += record.coverage_pct;
    existing.totalTests += record.test_count;
    existing.count += 1;
    byDate.set(record.date, existing);
  });

  const chartData: ChartDataPoint[] = Array.from(byDate.entries())
    .map(([date, stats]) => ({
      date,
      coverage: stats.totalCoverage / stats.count,
      tests: stats.totalTests,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return chartData;
}

// ============================================
// Helper Functions for Mock Data
// ============================================

function filterMockData(data: UnitTestData[], filters: DashboardFilters): UnitTestData[] {
  return data.filter(record => {
    if (filters.product && record.product !== filters.product) return false;
    if (filters.subproduct && record.subproduct !== filters.subproduct) return false;
    if (filters.namespace && record.namespace !== filters.namespace) return false;
    if (filters.service && record.service_name !== filters.service) return false;
    if (filters.dateFrom && record.date < filters.dateFrom) return false;
    if (filters.dateTo && record.date > filters.dateTo) return false;
    return true;
  });
}

function filterE2EMockData(data: E2ETestData[], filters: DashboardFilters): E2ETestData[] {
  return data.filter(record => {
    if (filters.product && record.product !== filters.product) return false;
    if (filters.dateFrom && record.date < filters.dateFrom) return false;
    if (filters.dateTo && record.date > filters.dateTo) return false;
    return true;
  });
}

function extractFilterOptions(data: UnitTestData[]): FilterOptions {
  const products = new Set<string>();
  const subproducts = new Set<string>();
  const namespaces = new Set<string>();
  const services = new Set<string>();

  data.forEach(record => {
    products.add(record.product);
    subproducts.add(record.subproduct);
    namespaces.add(record.namespace);
    services.add(record.service_name);
  });

  return {
    products: Array.from(products).sort(),
    subproducts: Array.from(subproducts).sort(),
    namespaces: Array.from(namespaces).sort(),
    services: Array.from(services).sort(),
  };
}

