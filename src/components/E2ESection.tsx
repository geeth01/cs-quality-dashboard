import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { E2ETestData } from '../types';
import { formatNumber, formatDate } from '../utils/helpers';
import { TestTube2, TrendingUp } from 'lucide-react';

interface E2ESectionProps {
  data: E2ETestData[];
  loading: boolean;
}

export function E2ESection({ data, loading }: E2ESectionProps) {
  // Get latest data per product
  const latestByProduct = useMemo(() => {
    const productMap = new Map<string, E2ETestData>();
    
    data.forEach(record => {
      const existing = productMap.get(record.product);
      if (!existing || record.date > existing.date) {
        productMap.set(record.product, record);
      }
    });
    
    return Array.from(productMap.values()).sort((a, b) => a.product.localeCompare(b.product));
  }, [data]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (latestByProduct.length === 0) {
      return { totalTests: 0, avgTestsPerProduct: 0, productsCount: 0 };
    }

    const totalTests = latestByProduct.reduce((sum, p) => sum + p.test_count, 0);
    return {
      totalTests,
      avgTestsPerProduct: Math.round(totalTests / latestByProduct.length),
      productsCount: latestByProduct.length,
    };
  }, [latestByProduct]);

  // Prepare chart data (trend over time by product)
  const chartData = useMemo(() => {
    // Group by date
    const byDate = new Map<string, { date: string; [key: string]: string | number }>();
    
    data.forEach(record => {
      if (!byDate.has(record.date)) {
        byDate.set(record.date, { date: record.date });
      }
      const dateData = byDate.get(record.date)!;
      dateData[record.product] = record.test_count;
    });

    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // Get unique products for chart colors
  const products = useMemo(() => {
    return Array.from(new Set(data.map(d => d.product))).sort();
  }, [data]);

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TestTube2 className="w-5 h-5" />
          E2E Tests
        </h2>
        <div className="text-center py-12 text-gray-500">
          No E2E test data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <TestTube2 className="w-5 h-5 text-purple-600" />
        E2E Tests Overview
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Total E2E Tests</span>
            <TestTube2 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-900">
            {formatNumber(summaryStats.totalTests)}
          </div>
          <p className="text-xs text-purple-700 mt-1">Across all products</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Products Tested</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">
            {summaryStats.productsCount}
          </div>
          <p className="text-xs text-blue-700 mt-1">With E2E coverage</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-900">Avg Tests/Product</span>
            <TestTube2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-900">
            {formatNumber(summaryStats.avgTestsPerProduct)}
          </div>
          <p className="text-xs text-indigo-700 mt-1">Average per product</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-800 mb-4">E2E Tests Trend by Product</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              label={{ value: 'Test Count', angle: -90, position: 'insideLeft' }}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              formatter={(value: number) => formatNumber(value)}
              labelFormatter={(label) => formatDate(label)}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            {products.map((product, index) => (
              <Bar 
                key={product}
                dataKey={product} 
                fill={colors[index % colors.length]} 
                name={product}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Current E2E Tests by Product</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {latestByProduct.map((record) => (
                <tr key={record.product} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-semibold text-purple-600">
                      {formatNumber(record.test_count)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(record.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

