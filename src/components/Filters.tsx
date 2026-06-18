import { useMemo, useEffect, useState } from 'react';
import type { DashboardFilters, FilterOptions } from '../types';
import { getAll2025Months, getLastDayOfMonth } from '../utils/monthHelpers';
import { Search, Calendar, X } from 'lucide-react';
import {
  loadMicroserviceMappings,
  getUniqueProducts,
  getAllSubproducts,
  getAllServices,
  getAllNamespaces,
  getSubproductsForProduct,
  getServicesForProductSubproduct,
  getNamespacesForCombination,
  isValidSubproduct,
  isValidService,
  isValidNamespace,
  type MicroserviceMapping
} from '../data/microserviceMappingLoader';

interface FiltersProps {
  filters: DashboardFilters;
  filterOptions: FilterOptions | null;
  onChange: (filters: DashboardFilters) => void;
}

export function Filters({ filters, filterOptions, onChange }: FiltersProps) {
  const [mappings, setMappings] = useState<MicroserviceMapping[]>([]);

  // Load microservice mappings on mount
  useEffect(() => {
    loadMicroserviceMappings().then(data => {
      setMappings(data);
      if (data.length > 0) {
        console.log('🎯 Cascading filters initialized with mapping data');
        console.log(`   📦 ${getUniqueProducts(data).length} products from mapping`);
      }
    });
  }, []);

  // Merge products from mapping and actual data
  const availableProducts = useMemo(() => {
    const fromData = filterOptions?.products || [];
    const fromMapping = mappings.length > 0 ? getUniqueProducts(mappings) : [];
    
    // Merge and deduplicate
    const merged = Array.from(new Set([...fromData, ...fromMapping]));
    return merged.sort();
  }, [filterOptions?.products, mappings]);

  // Get filtered subproducts based on selected product
  const availableSubproducts = useMemo(() => {
    if (!filters.product) {
      // Show all subproducts from mapping when no product selected
      if (mappings.length > 0) {
        const fromData = filterOptions?.subproducts || [];
        const fromMapping = getAllSubproducts(mappings);
        return Array.from(new Set([...fromData, ...fromMapping])).sort();
      }
      return filterOptions?.subproducts || [];
    }
    
    if (mappings.length === 0) {
      return filterOptions?.subproducts || [];
    }
    
    // Show subproducts for selected product from mapping
    const validSubproducts = getSubproductsForProduct(mappings, filters.product);
    const fromData = filterOptions?.subproducts || [];
    
    // Merge and filter to only valid ones
    const merged = Array.from(new Set([...fromData, ...validSubproducts]));
    return merged.filter(sp => validSubproducts.includes(sp)).sort();
  }, [filters.product, filterOptions?.subproducts, mappings]);

  // Get filtered services based on selected product and subproduct
  const availableServices = useMemo(() => {
    if (!filters.product && !filters.subproduct) {
      // Show all services from mapping when no filters
      if (mappings.length > 0) {
        const fromData = filterOptions?.services || [];
        const fromMapping = getAllServices(mappings);
        return Array.from(new Set([...fromData, ...fromMapping])).sort();
      }
      return filterOptions?.services || [];
    }
    
    if (mappings.length === 0) {
      return filterOptions?.services || [];
    }
    
    // Show services for selected filters from mapping
    const validServices = getServicesForProductSubproduct(
      mappings, 
      filters.product, 
      filters.subproduct
    );
    const fromData = filterOptions?.services || [];
    
    // Merge and filter to only valid ones
    const merged = Array.from(new Set([...fromData, ...validServices]));
    return merged.filter(s => validServices.includes(s)).sort();
  }, [filters.product, filters.subproduct, filterOptions?.services, mappings]);

  // Get filtered namespaces based on selected product, subproduct, and service
  const availableNamespaces = useMemo(() => {
    if (!filters.product && !filters.subproduct && !filters.service) {
      // Show all namespaces from mapping when no filters
      if (mappings.length > 0) {
        const fromData = filterOptions?.namespaces || [];
        const fromMapping = getAllNamespaces(mappings);
        return Array.from(new Set([...fromData, ...fromMapping])).sort();
      }
      return filterOptions?.namespaces || [];
    }
    
    if (mappings.length === 0) {
      return filterOptions?.namespaces || [];
    }
    
    // Show namespaces for selected filters from mapping
    const validNamespaces = getNamespacesForCombination(
      mappings,
      filters.product,
      filters.subproduct,
      filters.service
    );
    const fromData = filterOptions?.namespaces || [];
    
    // Merge and filter to only valid ones
    const merged = Array.from(new Set([...fromData, ...validNamespaces]));
    return merged.filter(n => validNamespaces.includes(n)).sort();
  }, [filters.product, filters.subproduct, filters.service, filterOptions?.namespaces, mappings]);

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    if (mappings.length > 0) {
      // If product changed
      if (key === 'product') {
        // If product set to "All" (empty), clear all dependent filters
        if (value === '') {
          newFilters.subproduct = '';
          newFilters.service = '';
          newFilters.namespace = '';
        } else {
          // Otherwise, clear dependent filters if not valid
          if (filters.subproduct && !isValidSubproduct(mappings, value, filters.subproduct)) {
            newFilters.subproduct = '';
          }
          if (filters.service && !isValidService(mappings, value, newFilters.subproduct, filters.service)) {
            newFilters.service = '';
          }
          if (filters.namespace && !isValidNamespace(mappings, value, newFilters.subproduct, newFilters.service, filters.namespace)) {
            newFilters.namespace = '';
          }
        }
      }
      
      // If subproduct changed
      if (key === 'subproduct') {
        // If subproduct set to "All" (empty), clear dependent filters
        if (value === '') {
          newFilters.service = '';
          newFilters.namespace = '';
        } else {
          // Otherwise, clear dependent filters if not valid
          if (filters.service && !isValidService(mappings, filters.product, value, filters.service)) {
            newFilters.service = '';
          }
          if (filters.namespace && !isValidNamespace(mappings, filters.product, value, newFilters.service, filters.namespace)) {
            newFilters.namespace = '';
          }
        }
      }
      
      // If service changed
      if (key === 'service') {
        // If service set to "All" (empty), clear namespace
        if (value === '') {
          newFilters.namespace = '';
        } else {
          // Otherwise, clear namespace if not valid
          if (filters.namespace && !isValidNamespace(mappings, filters.product, filters.subproduct, value, filters.namespace)) {
            newFilters.namespace = '';
          }
        }
      }
    }
    
    onChange(newFilters);
  };

  const availableMonths = useMemo(() => getAll2025Months(), []);

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
      subproduct: '',
      namespace: '',
      service: '',
      dateFrom: '2025-02-01',
      dateTo: '2026-06-30',
    });
  };

  const hasActiveFilters = 
    filters.product || 
    filters.subproduct || 
    filters.namespace || 
    filters.service;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Product Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product
          </label>
          <select
            value={filters.product}
            onChange={(e) => handleFilterChange('product', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Products</option>
            {availableProducts.map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
        </div>

        {/* Subproduct Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subproduct
            {filters.product && (
              <span className="text-xs text-gray-500 ml-1">
                (for {filters.product})
              </span>
            )}
          </label>
          <select
            value={filters.subproduct}
            onChange={(e) => handleFilterChange('subproduct', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={availableSubproducts.length === 0}
          >
            <option value="">
              {filters.product 
                ? `All ${filters.product} Subproducts` 
                : 'All Subproducts'}
            </option>
            {availableSubproducts.map((subproduct) => (
              <option key={subproduct} value={subproduct}>
                {subproduct}
              </option>
            ))}
          </select>
        </div>

        {/* Service Name Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Name
            {(filters.product || filters.subproduct) && (
              <span className="text-xs text-gray-500 ml-1">
                (filtered)
              </span>
            )}
          </label>
          <select
            value={filters.service}
            onChange={(e) => handleFilterChange('service', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={availableServices.length === 0}
          >
            <option value="">All Services</option>
            {availableServices.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        {/* Namespace Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Namespace
            {(filters.product || filters.subproduct || filters.service) && (
              <span className="text-xs text-gray-500 ml-1">
                (filtered)
              </span>
            )}
          </label>
          <select
            value={filters.namespace}
            onChange={(e) => handleFilterChange('namespace', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={availableNamespaces.length === 0}
          >
            <option value="">All Namespaces</option>
            {availableNamespaces.map((namespace) => (
              <option key={namespace} value={namespace}>
                {namespace}
              </option>
            ))}
          </select>
        </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

