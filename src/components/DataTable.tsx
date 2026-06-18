import { useState, useMemo } from 'react';
import type { UnitTestData } from '../types';
import { 
  formatPercent, 
  formatNumber, 
  formatDate, 
  getCoverageColor,
  getCoverageBgColor,
  getCoverageStatus 
} from '../utils/helpers';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DataTableProps {
  data: UnitTestData[];
  loading: boolean;
}

type SortKey = keyof UnitTestData;
type SortDirection = 'asc' | 'desc';

export function DataTable({ data, loading }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('product');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Get latest entry per service
  const latestData = useMemo(() => {
    const serviceMap = new Map<string, UnitTestData>();
    
    data.forEach(record => {
      const key = `${record.product}-${record.subproduct}-${record.service_name}`;
      const existing = serviceMap.get(key);
      
      if (!existing || record.date > existing.date) {
        serviceMap.set(key, record);
      }
    });
    
    return Array.from(serviceMap.values());
  }, [data]);

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...latestData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
    
    return sorted;
  }, [latestData, sortKey, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage]);

  // Calculate breakdown stats (MUST be before early returns)
  const breakdownStats = useMemo(() => {
    const excellent = sortedData.filter(d => d.coverage_pct >= 80).length;
    const good = sortedData.filter(d => d.coverage_pct >= 70 && d.coverage_pct < 80).length;
    const needsImprovement = sortedData.filter(d => d.coverage_pct >= 50 && d.coverage_pct < 70).length;
    const critical = sortedData.filter(d => d.coverage_pct < 50).length;
    return { excellent, good, needsImprovement, critical };
  }, [sortedData]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Coverage Details</h2>
        <p className="text-sm text-gray-600 mb-4">Complete list of all services with their current test coverage status</p>
        <div className="text-center py-12 text-gray-500">
          No services found matching the selected filters
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Service Coverage Details ({formatNumber(sortedData.length)} services)
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Complete breakdown of unit test coverage across all microservices
        </p>
        
        {/* Coverage Breakdown */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-green-700">{breakdownStats.excellent}</span> Excellent (≥80%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-yellow-700">{breakdownStats.good}</span> Good (70-79%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-orange-700">{breakdownStats.needsImprovement}</span> Needs Improvement (50-69%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-red-700">{breakdownStats.critical}</span> Critical (&lt;50%)
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('product')}
              >
                <div className="flex items-center gap-1">
                  Product
                  <SortIcon column="product" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('subproduct')}
              >
                <div className="flex items-center gap-1">
                  Subproduct
                  <SortIcon column="subproduct" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('service_name')}
              >
                <div className="flex items-center gap-1">
                  Service Name
                  <SortIcon column="service_name" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('coverage_pct')}
              >
                <div className="flex items-center gap-1">
                  Coverage
                  <SortIcon column="coverage_pct" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('test_count')}
              >
                <div className="flex items-center gap-1">
                  Test Count
                  <SortIcon column="test_count" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  Last Updated
                  <SortIcon column="date" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((record, index) => (
              <tr key={`${record.service_name}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.product}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {record.subproduct}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.service_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-semibold ${getCoverageColor(record.coverage_pct)}`}>
                    {formatPercent(record.coverage_pct)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(record.test_count)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCoverageBgColor(record.coverage_pct)} ${getCoverageColor(record.coverage_pct)}`}>
                    {getCoverageStatus(record.coverage_pct)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} of{' '}
            {formatNumber(sortedData.length)} services
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

