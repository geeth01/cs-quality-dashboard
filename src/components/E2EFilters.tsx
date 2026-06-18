import { useMemo } from 'react';
import type { E2EFilters } from '../types';
import { getAll2025Months, getLastDayOfMonth } from '../utils/monthHelpers';
import { Search, Calendar, X } from 'lucide-react';

interface E2EFiltersProps {
  filters: E2EFilters;
  products: string[];
  onChange: (filters: E2EFilters) => void;
}

export function E2EFilters({ filters, products, onChange }: E2EFiltersProps) {
  const availableMonths = useMemo(() => getAll2025Months(), []);

  const handleFilterChange = (key: keyof E2EFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const handleMonthChange = (type: 'from' | 'to', monthValue: string) => {
    if (type === 'from') {
      onChange({ ...filters, dateFrom: monthValue });
    } else {
      // For "to" date, use last day of the month
      const lastDay = getLastDayOfMonth(monthValue);
      onChange({ ...filters, dateTo: lastDay });
    }
  };

  const handleClearFilters = () => {
    onChange({
      product: '',
      dateFrom: '2025-02-01',
      dateTo: '2026-06-30',
    });
  };

  const hasActiveFilters = filters.product;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Product Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product
          </label>
          <select
            value={filters.product}
            onChange={(e) => handleFilterChange('product', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Products</option>
            {products.map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
        </div>

        {/* Placeholder for alignment */}
        <div></div>
      </div>

      {/* Month Range */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Month Range
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">From Month</label>
            <select
              value={filters.dateFrom}
              onChange={(e) => handleMonthChange('from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {availableMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">To Month</label>
            <select
              value={filters.dateTo.substring(0, 7) + '-01'} // Convert YYYY-MM-DD to YYYY-MM-01 for matching
              onChange={(e) => handleMonthChange('to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {availableMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

