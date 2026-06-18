/**
 * Utility helper functions
 */

/**
 * Format percentage with 1 decimal place
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format date to readable string
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Get coverage status color
 */
export function getCoverageColor(coverage: number): string {
  if (coverage >= 80) return 'text-green-600';
  if (coverage >= 70) return 'text-yellow-600';
  if (coverage >= 50) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get coverage status background color
 */
export function getCoverageBgColor(coverage: number): string {
  if (coverage >= 80) return 'bg-green-100';
  if (coverage >= 70) return 'bg-yellow-100';
  if (coverage >= 50) return 'bg-orange-100';
  return 'bg-red-100';
}

/**
 * Get coverage status label
 */
export function getCoverageStatus(coverage: number): string {
  if (coverage >= 80) return 'Excellent';
  if (coverage >= 70) return 'Good';
  if (coverage >= 50) return 'Needs Improvement';
  return 'Critical';
}

/**
 * Get trend indicator
 */
export function getTrendIndicator(trend: number): {
  icon: string;
  color: string;
  label: string;
} {
  if (trend > 0) {
    return { icon: '↑', color: 'text-green-600', label: 'increasing' };
  } else if (trend < 0) {
    return { icon: '↓', color: 'text-red-600', label: 'decreasing' };
  }
  return { icon: '→', color: 'text-gray-600', label: 'stable' };
}

/**
 * Get date range for last N days
 */
export function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

