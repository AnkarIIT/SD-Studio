/**
 * Currency formatting for Indian Rupee
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format price with decimal
 */
export const formatPriceWithDecimal = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (original: number, current: number): number => {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

/**
 * Format date to readable format
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, length: number): string => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Format order ID
 */
export const formatOrderId = (id: string): string => {
  return `ORD-${id.substring(0, 8).toUpperCase()}`;
};
