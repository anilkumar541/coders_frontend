/**
 * formatCount
 *
 * Formats a raw integer count into a compact, human-readable string,
 * matching the display conventions used by Instagram and YouTube.
 *
 * Rules:
 *  - null / undefined  → null
 *  - 0–999             → exact digits         e.g. "0", "42", "999"
 *  - 1 000–999 999     → k-suffix, 1 decimal  e.g. "1k", "1.5k", "999.9k"
 *  - 1 000 000+        → M-suffix, 1 decimal  e.g. "1M", "8.8M"
 *  - 1 000 000 000+    → B-suffix, 1 decimal  e.g. "1B", "2.5B"
 *  - Negatives         → sign preserved       e.g. "-1.5k"
 *
 * Values are TRUNCATED (floor), not rounded:
 *   999 999 → "999.9k", never "1M"
 */

/**
 * @param {number | null | undefined} value
 * @returns {string | null}
 */
export function formatCount(value) {
  if (value === null || value === undefined) return null
  if (!Number.isFinite(value)) return null

  const sign = value < 0 ? '-' : ''
  const abs  = Math.abs(value)

  /**
   * Truncates to 1 decimal place and appends a suffix.
   * @param {number} n
   * @param {number} divisor
   * @param {string} suffix
   * @returns {string}
   */
  function compact(n, divisor, suffix) {
    const raw       = Math.floor((n / divisor) * 10) / 10
    const formatted = raw % 1 === 0 ? String(raw) : raw.toFixed(1)
    return `${sign}${formatted}${suffix}`
  }

  if (abs >= 1_000_000_000) return compact(abs, 1_000_000_000, 'B')
  if (abs >= 1_000_000)     return compact(abs, 1_000_000,     'M')
  if (abs >= 1_000)         return compact(abs, 1_000,         'k')

  return String(value)
}