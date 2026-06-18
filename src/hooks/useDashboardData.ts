/**
 * Custom hook for fetching and managing dashboard data
 */

import { useState, useEffect } from 'react';
import type { 
  UnitTestData,
  E2ETestData,
  FilterOptions, 
  DashboardFilters, 
  SummaryStats, 
  ChartDataPoint 
} from '../types';
import { 
  fetchUnitTestData,
  fetchE2ETestData,
  fetchFilterOptions, 
  fetchSummaryStats, 
  fetchChartData,
  isUsingCSVData
} from '../services/api';

export function useDashboardData(filters: DashboardFilters) {
  const [data, setData] = useState<UnitTestData[]>([]);
  const [e2eData, setE2EData] = useState<E2ETestData[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingCSV, setUsingCSV] = useState(false);

  useEffect(() => {
    loadFilterOptions();
    checkCSVStatus();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  async function checkCSVStatus() {
    try {
      const hasCSV = await isUsingCSVData();
      setUsingCSV(hasCSV);
    } catch (err) {
      console.error('Error checking CSV status:', err);
    }
  }

  async function loadFilterOptions() {
    try {
      const options = await fetchFilterOptions();
      setFilterOptions(options);
    } catch (err) {
      console.error('Error loading filter options:', err);
      setError('Failed to load filter options');
    }
  }

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [unitTestData, e2eTestData, stats, chart] = await Promise.all([
        fetchUnitTestData(filters),
        fetchE2ETestData(filters),
        fetchSummaryStats(filters),
        fetchChartData(filters),
      ]);

      setData(unitTestData);
      setE2EData(e2eTestData);
      setSummaryStats(stats);
      setChartData(chart);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  return {
    data,
    e2eData,
    summaryStats,
    chartData,
    filterOptions,
    loading,
    error,
    usingCSV,
    refresh: loadData,
  };
}

