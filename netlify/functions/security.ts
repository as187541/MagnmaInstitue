// ============================================================
// Shared Security Utilities for Netlify Functions
// ============================================================

/**
 * Get the allowed CORS origin from environment or default to wildcard in dev.
 * For production, set NETLIFY_CORS_ORIGIN to your frontend domain.
 */
export function getCorsOrigin(): string {
  return process.env.NETLIFY_CORS_ORIGIN || process.env.CORS_ORIGIN || "*";
}

/**
 * Standard security headers for Netlify function responses.
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": getCorsOrigin(),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  };
}

/**
 * CORS preflight response for OPTIONS requests.
 */
export function getCorsPreflightHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": getCorsOrigin(),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Sanitize a string input by removing null bytes and trimming.
 */
export function sanitizeString(input: string | undefined): string {
  if (!input) return "";
  return input.replace(/\0/g, "").trim();
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic international format).
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}
