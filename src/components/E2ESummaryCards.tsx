import { useMemo } from 'react';
import type { E2ETestData } from '../types';
import { formatNumber, getTrendIndicator } from '../utils/helpers';
import { TestTube2, Target, TrendingUp } from 'lucide-react';

interface E2ESummaryCardsProps {
  data: E2ETestData[];
  loading: boolean;
}

export function E2ESummaryCards({ data, loading }: E2ESummaryCardsProps) {
  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        totalTests: 0,
        productsCount: 0,
        avgTestsPerProduct: 0,
        trend: 0,
      };
    }

    // Get latest data per product
    const latestByProduct = new Map<string, E2ETestData>();
    data.forEach(record => {
      const existing = latestByProduct.get(record.product);
      if (!existing || record.date > existing.date) {
        latestByProduct.set(record.product, record);
      }
    });

    const latestData = Array.from(latestByProduct.values());
    const totalTests = latestData.reduce((sum, p) => sum + p.test_count, 0);
    const productsCount = latestData.length;
    const avgTestsPerProduct = productsCount > 0 ? Math.round(totalTests / productsCount) : 0;

    // Calculate trend (compare with 7 days ago)
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    const weekAgoData = data.filter(d => d.date === weekAgoStr);
    const weekAgoTotal = weekAgoData.reduce((sum, d) => sum + d.test_count, 0);
    const trend = weekAgoTotal > 0 ? ((totalTests - weekAgoTotal) / weekAgoTotal) * 100 : 0;

    return {
      totalTests,
      productsCount,
      avgTestsPerProduct,
      trend,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const trendIndicator = getTrendIndicator(stats.trend);

  const cards = [
    {
      title: 'Total E2E Tests',
      value: formatNumber(stats.totalTests),
      icon: TestTube2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: stats.trend !== 0 ? `${trendIndicator.icon} ${Math.abs(stats.trend).toFixed(1)}%` : undefined,
      trendColor: trendIndicator.color,
    },
    {
      title: 'Products Covered',
      value: formatNumber(stats.productsCount),
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      subtitle: 'With E2E tests',
    },
    {
      title: 'Avg Tests/Product',
      value: formatNumber(stats.avgTestsPerProduct),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      subtitle: 'Average coverage',
    },
  ];

  return (
    <>
      <div className="mb-2">
        <p className="text-sm text-gray-600">
          Overview of E2E test coverage across all products with week-over-week trends
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-gray-900">{card.value}</span>
              {card.trend && (
                <span className={`text-sm font-medium ${card.trendColor}`}>
                  {card.trend}
                </span>
              )}
            </div>
            {card.subtitle && (
              <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
            )}
          </div>
        );
      })}
    </div>
    </>
  );
}

