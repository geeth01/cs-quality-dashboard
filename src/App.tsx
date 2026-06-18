import { useState, useMemo } from 'react';
import { Filters } from './components/Filters';
import { SummaryCards } from './components/SummaryCards';
import { CoverageChart } from './components/CoverageChart';
import { DataTable } from './components/DataTable';
import { TabNavigation } from './components/TabNavigation';
import { E2EFilters } from './components/E2EFilters';
import { E2ESummaryCards } from './components/E2ESummaryCards';
import { E2ECharts } from './components/E2ECharts';
import { E2ETable } from './components/E2ETable';
import { useDashboardData } from './hooks/useDashboardData';
import type { DashboardFilters, E2EFilters as E2EFiltersType } from './types';
import { RefreshCw, AlertCircle, FileText } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'unit' | 'e2e'>('unit');
  const [filters, setFilters] = useState<DashboardFilters>(() => {
    return {
      product: '',
      subproduct: '',
      namespace: '',
      service: '',
      dateFrom: '2025-02-01',
      dateTo: '2026-06-30',
    };
  });

  const [e2eFilters, setE2EFilters] = useState<E2EFiltersType>(() => {
    return {
      product: '',
      dateFrom: '2025-02-01',
      dateTo: '2026-06-30',
    };
  });

  const { 
    data, 
    e2eData,
    summaryStats, 
    chartData, 
    filterOptions, 
    loading, 
    error,
    usingCSV,
    refresh 
  } = useDashboardData(filters);

  // Filter E2E data based on E2E filters
  const filteredE2EData = useMemo(() => {
    return e2eData.filter(record => {
      if (e2eFilters.product && record.product !== e2eFilters.product) return false;
      if (e2eFilters.dateFrom && record.date < e2eFilters.dateFrom) return false;
      if (e2eFilters.dateTo && record.date > e2eFilters.dateTo) return false;
      return true;
    });
  }, [e2eData, e2eFilters]);

  // Get unique products from E2E data
  const e2eProducts = useMemo(() => {
    return Array.from(new Set(e2eData.map(d => d.product))).sort();
  }, [e2eData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img 
                  src="/CS_Logo_Light.gif" 
                  alt="CS Logo" 
                  className="h-12 w-auto"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  CS Quality Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Track unit test coverage and progress across all services
                </p>
              </div>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        {usingCSV ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-900">
                  ✅ Using your CSV data
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Dashboard is loading data from your CSV files in the <code className="bg-green-100 px-1 py-0.5 rounded">public/data/</code> folder.
                  To update the data, replace the CSV files and refresh the page.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Currently using mock data
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  No CSV files found. Place your <code className="bg-blue-100 px-1 py-0.5 rounded">cs_unit_test.csv</code> and{' '}
                  <code className="bg-blue-100 px-1 py-0.5 rounded">cs_e2e_test.csv</code> files in{' '}
                  <code className="bg-blue-100 px-1 py-0.5 rounded">public/data/</code> folder.
                  See <code className="bg-blue-100 px-1 py-0.5 rounded">HOW_TO_ADD_CSV.md</code> for instructions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Unit Tests Tab */}
        {activeTab === 'unit' && (
          <>
            {/* Filters */}
            <Filters 
              filters={filters} 
              filterOptions={filterOptions}
              onChange={setFilters} 
            />

            {/* Summary Cards */}
            <SummaryCards stats={summaryStats} loading={loading} />

            {/* Coverage Chart */}
            <CoverageChart data={chartData} loading={loading} />

            {/* Data Table */}
            <DataTable data={data} loading={loading} />
          </>
        )}

        {/* E2E Tests Tab */}
        {activeTab === 'e2e' && (
          <>
            {/* E2E Filters */}
            <E2EFilters 
              filters={e2eFilters}
              products={e2eProducts}
              onChange={setE2EFilters}
            />

            {/* E2E Summary Cards */}
            <E2ESummaryCards data={filteredE2EData} loading={loading} />

            {/* E2E Charts */}
            <E2ECharts data={filteredE2EData} loading={loading} />

            {/* E2E Table */}
            <E2ETable data={filteredE2EData} loading={loading} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            CS Quality Dashboard - Built with React, TypeScript, and Recharts
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

