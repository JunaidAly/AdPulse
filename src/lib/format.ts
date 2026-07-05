/**
 * Centralized display formatting. Revenue is stored internally as integer
 * cents everywhere in the app; it is converted to a currency string ONLY here.
 */

/** Format integer cents (e.g. 1169) as a currency string (e.g. "$11.69"). */
export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Format a whole number with thousands separators (e.g. 12800 -> "12,800"). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

/** Compact large numbers (e.g. 12800 -> "12.8K"). */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a ratio as a percent string.
 * @param value ratio in 0..1 space when `asRatio` is true, otherwise already a percent.
 */
export function formatPercent(value: number, digits = 1, asRatio = true): string {
  const pct = asRatio ? value * 100 : value;
  return `${pct.toFixed(digits)}%`;
}

/** Format a signed delta percentage for stat cards (e.g. 0.123 -> "+12.3%"). */
export function formatDelta(ratio: number, digits = 1): string {
  const pct = ratio * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}%`;
}

/** eCPM from integer-cents revenue and impressions, returned as integer cents. */
export function computeEcpmCents(revenueCents: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return Math.round((revenueCents / impressions) * 1000);
}

/** CTR ratio (clicks / impressions), returned in 0..1 space. */
export function computeCtr(clicks: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return clicks / impressions;
}
