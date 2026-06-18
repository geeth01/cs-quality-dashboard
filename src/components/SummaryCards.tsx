import type { SummaryStats } from '../types';
import { formatPercent, formatNumber, getTrendIndicator } from '../utils/helpers';
import { TrendingUp, Target, AlertTriangle, TestTube } from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats | null;
  loading: boolean;
}

export function SummaryCards({ stats, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const trend = getTrendIndicator(stats.coverage_trend);

  const cards = [
    {
      title: 'Total Services',
      value: formatNumber(stats.total_services),
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Average Coverage',
      value: formatPercent(stats.avg_coverage),
      icon: TrendingUp,
      color: trend.color,
      bgColor: 'bg-green-100',
      trend: `${trend.icon} ${Math.abs(stats.coverage_trend).toFixed(1)}%`,
    },
    {
      title: 'Total Tests',
      value: formatNumber(stats.total_tests),
      icon: TestTube,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Below 70% Coverage',
      value: formatNumber(stats.services_below_threshold),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      subtitle: `${((stats.services_below_threshold / stats.total_services) * 100).toFixed(1)}% of services`,
    },
  ];

  return (
    <>
      <div className="mb-2">
        <p className="text-sm text-gray-600">
          Key metrics snapshot showing overall health and progress of your test coverage
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                <span className={`text-sm font-medium ${card.color}`}>
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

