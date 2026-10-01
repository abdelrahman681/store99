/** Pulls a readable message out of any error shape this API returns (object, JSON string, plain text, Identity error list). */
export function apiErrorMessage(err: any, fallback: string): string {
  let body = err?.error;

  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return body.trim() || fallback; }
  }
  if (Array.isArray(body)) {
    const text = body.map(e => e?.description ?? e?.message ?? (typeof e === 'string' ? e : '')).filter(Boolean).join('، ');
    return text || fallback;
  }
  return body?.message ?? body?.Message ?? body?.title ?? fallback;
}
