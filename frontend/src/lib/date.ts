/**
 * Date formatting utilities — locale vi-VN.
 * Thay the inline toLocaleDateString scattered across pages.
 */

const LOCALE = 'vi-VN';

/** Format date: "02/04/2026" */
export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(LOCALE, options || {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Format date voi thoi gian: "02/04/2026 14:30" */
export function formatDateTime(
  date: string | Date | null | undefined,
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format date cho API params: "2026-04-02" */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Format relative time: "5 phut truoc", "2 gio truoc", "Hom qua" */
export function formatRelativeTime(
  date: string | Date | null | undefined,
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) return 'Hôm qua';
  if (diffDay < 7) return `${diffDay} ngày trước`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} tuần trước`;

  return formatDate(d);
}

/** Check xem date da qua chua */
export function isExpired(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/** Format thang/nam: "Tháng 4, 2026" */
export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
}
