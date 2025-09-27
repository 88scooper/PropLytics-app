/**
 * Currency formatting utilities for consistent display of financial values
 */

/**
 * Formats a number as Canadian currency with exactly 2 decimal places
 * @param value - The numerical value to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a number with exactly 2 decimal places (without currency symbol)
 * @param value - The numerical value to format
 * @returns Formatted number string (e.g., "1,234.56")
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a percentage with exactly 2 decimal places
 * @param value - The percentage value to format (e.g., 5.5 for 5.5%)
 * @returns Formatted percentage string (e.g., "5.50%")
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};
