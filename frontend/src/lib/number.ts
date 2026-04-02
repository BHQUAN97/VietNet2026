/**
 * Number & currency formatting — locale vi-VN.
 * Thay the inline toLocaleString scattered across pages.
 */

const LOCALE = 'vi-VN';

/** Format so: 1234567 -> "1.234.567" */
export function formatNumber(
  value: number | null | undefined,
): string {
  if (value == null) return '0';
  return value.toLocaleString(LOCALE);
}

/** Format tien VND: 1500000 -> "1.500.000 ₫" */
export function formatCurrency(
  value: number | null | undefined,
  currency = 'VND',
): string {
  if (value == null) return '0 ₫';
  return value.toLocaleString(LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
}

/** Format phan tram: 0.156 -> "15,6%" */
export function formatPercent(
  value: number | null | undefined,
  decimals = 1,
): string {
  if (value == null) return '0%';
  return `${(value * 100).toFixed(decimals).replace('.', ',')}%`;
}

/** Format so compact: 1234 -> "1,2K", 1234567 -> "1,2M" */
export function formatCompact(
  value: number | null | undefined,
): string {
  if (value == null) return '0';
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(1).replace('.', ',')}K`;
  return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
}

/** Format file size: 1048576 -> "1.0 MB" */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
