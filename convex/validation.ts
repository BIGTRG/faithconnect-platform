// ── Input Validation & Sanitization Utilities ────────────────

/** Sanitize HTML-dangerous characters from user input */
export function sanitizeText(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/** Validate phone number (US format) */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)\+\.]{7,20}$/;
  return phoneRegex.test(phone);
}

/** Validate monetary amount */
export function isValidAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000 && Number.isFinite(amount);
}

/** Validate string length */
export function isWithinLength(
  value: string,
  min: number,
  max: number
): boolean {
  return value.length >= min && value.length <= max;
}

/** Validate URL format */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** Trim and normalize whitespace */
export function normalizeText(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/** Validate a date timestamp is reasonable (not in distant past/future) */
export function isReasonableDate(timestamp: number): boolean {
  const minDate = new Date("2020-01-01").getTime();
  const maxDate = Date.now() + 365 * 24 * 60 * 60 * 1000 * 5; // 5 years from now
  return timestamp >= minDate && timestamp <= maxDate;
}

/** Comprehensive input validator */
export function validateInput(
  rules: Array<{ check: boolean; message: string }>
): { valid: boolean; errors: string[] } {
  const errors = rules.filter((r) => !r.check).map((r) => r.message);
  return { valid: errors.length === 0, errors };
}
