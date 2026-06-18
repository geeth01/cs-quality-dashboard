/**
 * Month Helper Utilities
 * For working with month-based date ranges
 */

export interface MonthOption {
  value: string; // YYYY-MM-DD (first day of month)
  label: string; // "Feb 2025"
  month: string; // "Feb"
  year: string; // "2025"
}

/**
 * Get available months from data dates
 */
export function getAvailableMonths(dates: string[]): MonthOption[] {
  const monthSet = new Set<string>();
  
  dates.forEach(date => {
    if (date) {
      // Extract YYYY-MM from YYYY-MM-DD
      const yearMonth = date.substring(0, 7); // "2025-02"
      monthSet.add(yearMonth);
    }
  });

  const months: MonthOption[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  Array.from(monthSet).sort().forEach(yearMonth => {
    const [year, monthNum] = yearMonth.split('-');
    const monthIndex = parseInt(monthNum) - 1;
    const monthName = monthNames[monthIndex];

    months.push({
      value: `${yearMonth}-01`, // First day of month
      label: `${monthName} ${year}`,
      month: monthName,
      year: year,
    });
  });

  return months;
}

/**
 * Get last day of month from a date string
 */
export function getLastDayOfMonth(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Get last day by going to next month day 0
  const lastDay = new Date(year, month + 1, 0).getDate();
  const monthStr = String(month + 1).padStart(2, '0');
  const dayStr = String(lastDay).padStart(2, '0');
  
  return `${year}-${monthStr}-${dayStr}`;
}

/**
 * Format date as month label (e.g., "Feb 2025")
 */
export function formatDateAsMonth(dateStr: string): string {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  return `${month} ${year}`;
}

/**
 * Get default month range (last 3 months)
 */
export function getDefaultMonthRange(): { from: string; to: string } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Current month
  const toMonth = String(currentMonth).padStart(2, '0');
  const to = `${currentYear}-${toMonth}-01`;
  
  // 3 months ago
  const fromDate = new Date(currentYear, currentMonth - 3, 1);
  const fromMonth = String(fromDate.getMonth() + 1).padStart(2, '0');
  const from = `${fromDate.getFullYear()}-${fromMonth}-01`;
  
  return { from, to };
}

/**
 * Get all months in the dashboard range (Feb 2025 – Jun 2026)
 */
export function getAll2025Months(): MonthOption[] {
  const months: MonthOption[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const start = { year: 2025, month: 2 };  // Feb 2025
  const end   = { year: 2026, month: 6 };  // Jun 2026

  let { year, month } = start;
  while (year < end.year || (year === end.year && month <= end.month)) {
    const monthNum = String(month).padStart(2, '0');
    const monthName = monthNames[month - 1];
    months.push({
      value: `${year}-${monthNum}-01`,
      label: `${monthName} ${year}`,
      month: monthName,
      year: String(year),
    });
    month++;
    if (month > 12) { month = 1; year++; }
  }

  return months;
}

