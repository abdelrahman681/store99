/** Arabic label + badge colour for the order statuses the API returns. Unknown values fall back to the raw text. */
const LABELS: Record<string, string> = {
  Pending: 'قيد الانتظار',
  PaymentReceived: 'تم الدفع',
  PaymentFailed: 'فشل الدفع',
  Cancelled: 'ملغي',
  Canceled: 'ملغي'
};

const TONES: Record<string, string> = {
  Pending: 'warning',
  PaymentReceived: 'success',
  PaymentFailed: 'danger',
  Cancelled: 'danger',
  Canceled: 'danger'
};

export function orderStatusLabel(status: string | null | undefined): string {
  return (status && LABELS[status]) || status || '—';
}

export function orderStatusClass(status: string | null | undefined): string {
  return `status-badge status-badge--${(status && TONES[status]) || 'muted'}`;
}
