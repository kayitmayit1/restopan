const CLEAN_RE = /[\s\-\(\)\.]/g;

export function normalizePhone(value: string): string {
  return value.replace(CLEAN_RE, "");
}

/**
 * Türkiye telefon formatı: 05XX XXX XX XX (11 hane) veya +905XX XXX XX XX
 * Sabit hat: 0(2|3|4)XX XXX XX XX da kabul edilir.
 * Boş string geçerli sayılır (opsiyonel alanlar için).
 */
export function isValidTurkishPhone(raw: string): boolean {
  if (!raw.trim()) return true;
  const clean = normalizePhone(raw);
  if (!/^\d+$/.test(clean)) return false;
  // 11 hane: 0 ile başlayıp ikinci hane 2-9
  if (clean.length === 11 && /^0[2-9]/.test(clean)) return true;
  // 12 hane: 90 ile başlayıp üçüncü hane 2-9 (uluslararası, + olmadan)
  if (clean.length === 12 && /^90[2-9]/.test(clean)) return true;
  return false;
}

export const PHONE_ERROR = "Geçerli bir Türkiye telefon numarası girin (05XX XXX XX XX)";
