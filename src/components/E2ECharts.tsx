import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import type { E2ETestData } from '../types';
import { formatDate, formatNumber } from '../utils/helpers';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface E2EChartsProps {
  data: E2ETestData[];
  loading: boolean;
}

export function E2ECharts({ data, loading }: E2EChartsProps) {
  // Trend chart data - tests over time (aggregate all products)
  const trendData = useMemo(() => {
    const byDate = new Map<string, number>();
    
    data.forEach(record => {
      const current = byDate.get(record.date) || 0;
      byDate.set(record.date, current + record.test_count);
    });

    return Array.from(byDate.entries())
      .map(([date, count]) => ({ date, tests: count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // Product comparison data - latest test count per product
  const productComparisonData = useMemo(() => {
    const latestByProduct = new Map<string, E2ETestData>();
    
    data.forEach(record => {
      const existing = latestByProduct.get(record.product);
      if (!existing || record.date > existing.date) {
        latestByProduct.set(record.product, record);
      }
    });

    return Array.from(latestByProduct.values())
      .map(record => ({
        product: record.product,
        tests: record.test_count,
      }))
      .sort((a, b) => b.tests - a.tests); // Sort by test count descending
  }, [data]);

  // Trend by product over time
  const productTrendData = useMemo(() => {
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

  const products = useMemo(() => {
    return Array.from(new Set(data.map(d => d.product))).sort();
  }, [data]);

  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-80 bg-gray-100 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-80 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-center py-12 text-gray-500">
          No E2E test data available for the selected filters
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Trend Chart - Total Tests Over Time */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          E2E Tests Trend Over Time
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Total E2E tests across all products showing growth or decline over the selected period
        </p>
        
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              label={{ value: 'Total Tests', angle: -90, position: 'insideLeft' }}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              formatter={(value: number) => [formatNumber(value), 'Total Tests']}
              labelFormatter={(label) => formatDate(label)}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Line 
              type="monotone" 
              dataKey="tests" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Total E2E Tests"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Product Comparison Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          E2E Tests by Product (Current)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Compare current E2E test counts across all products to identify which need more coverage
        </p>
        
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={productComparisonData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number"
              label={{ value: 'Test Count', position: 'insideBottom', offset: -5 }}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              type="category"
              dataKey="product" 
              width={100}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              formatter={(value: number) => [formatNumber(value), 'Tests']}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Bar 
              dataKey="tests" 
              fill="#8b5cf6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend by Product Over Time - Stacked Area */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          E2E Tests Trend by Product
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Individual product trends over time - compare which products are actively improving their E2E coverage
        </p>
        
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={productTrendData}>
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
              <Line 
                key={product}
                type="monotone" 
                dataKey={product} 
                stroke={colors[index % colors.length]} 
                strokeWidth={2}
                dot={{ r: 3 }}
                name={product}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

