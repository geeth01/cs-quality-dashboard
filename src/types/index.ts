// Type definitions for the CS Quality Dashboard

export interface UnitTestData {
  id: number;
  date: string; // YYYY-MM-DD format
  product: string;
  subproduct: string;
  namespace: string;
  service_name: string;
  coverage_pct: number;
  test_count: number;
}

export interface E2ETestData {
  id: number;
  date: string; // YYYY-MM-DD format
  product: string;
  test_count: number;
}

export interface CoverageTrend {
  service_name: string;
  product: string;
  subproduct: string;
  current_coverage: number;
  coverage_change: number; // Change from previous period
  test_count: number;
  test_count_change: number;
}

export interface SummaryStats {
  total_services: number;
  avg_coverage: number;
  total_tests: number;
  services_below_threshold: number; // Below 70%
  coverage_trend: number; // Overall trend
}

export interface ChartDataPoint {
  date: string;
  coverage: number;
  tests: number;
}

export interface FilterOptions {
  products: string[];
  subproducts: string[];
  namespaces: string[];
  services: string[];
}

export interface DashboardFilters {
  product: string;
  subproduct: string;
  namespace: string;
  service: string;
  dateFrom: string;
  dateTo: string;
}

export interface E2EFilters {
  product: string;
  dateFrom: string;
  dateTo: string;
}

