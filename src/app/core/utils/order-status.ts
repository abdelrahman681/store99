/** Arabic label + badge colour for the order statuses the API returns (matching is case-insensitive). */
const INFO: Record<string, { label: string; tone: string }> = {
  pending:            { label: 'قيد الانتظار', tone: 'warning' },
  paymentreceived:    { label: 'تم الدفع', tone: 'success' },
  paymentsuccessfully:{ label: 'تم الدفع', tone: 'success' },
  paymentsuccess:     { label: 'تم الدفع', tone: 'success' },
  paid:               { label: 'تم الدفع', tone: 'success' },
  paymentfailed:      { label: 'فشل الدفع', tone: 'danger' },
  cancelled:          { label: 'ملغي', tone: 'danger' },
  canceled:           { label: 'ملغي', tone: 'danger' }
};

const key = (status: string | null | undefined) => (status ?? '').replace(/[\s_-]/g, '').toLowerCase();

export function orderStatusLabel(status: string | null | undefined): string {
  return INFO[key(status)]?.label || status || '—';
}

export function orderStatusClass(status: string | null | undefined): string {
  return `status-badge status-badge--${INFO[key(status)]?.tone || 'muted'}`;
}

/** A card order stays "Pending" until the payment webhook reaches the API — the UI polls until it flips. */
export function isAwaitingPayment(order: { status?: string | null; paymentMethod?: string | null } | null | undefined): boolean {
  return !!order && key(order.status) === 'pending' && (order.paymentMethod ?? '').toLowerCase() === 'card';
}
