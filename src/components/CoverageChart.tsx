import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { ChartDataPoint } from '../types';
import { formatDate, formatPercent, formatNumber } from '../utils/helpers';
import { TrendingUp } from 'lucide-react';

interface CoverageChartProps {
  data: ChartDataPoint[];
  loading: boolean;
}

export function CoverageChart({ data, loading }: CoverageChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-80 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Coverage Trend
        </h2>
        <div className="h-80 flex items-center justify-center text-gray-500">
          No data available for the selected filters
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Coverage Trend Over Time
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Track how average coverage percentage and total test count evolve over the selected time period
      </p>
      
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="left"
            label={{ value: 'Coverage %', angle: -90, position: 'insideLeft' }}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            label={{ value: 'Test Count', angle: 90, position: 'insideRight' }}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'coverage') return formatPercent(value);
              return formatNumber(value);
            }}
            labelFormatter={(label) => formatDate(label)}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="coverage" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5 }}
            name="Avg Coverage %"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="tests" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 3 }}
            activeDot={{ r: 5 }}
            name="Total Tests"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

