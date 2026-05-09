// ============================================================
// Security Middleware for Express APIs
// ============================================================

import type { Request, Response, NextFunction } from "express";

/**
 * Validate and sanitize query parameters to prevent injection attacks.
 */
export function validateQueryParams(
  allowedParams: string[]
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const invalidParams = Object.keys(req.query).filter(
      (key) => !allowedParams.includes(key)
    );
    if (invalidParams.length > 0) {
      console.warn(`Invalid query parameters rejected: ${invalidParams.join(", ")}`);
      // Remove invalid params instead of blocking
      invalidParams.forEach((key) => delete req.query[key]);
    }
    next();
  };
}

/**
 * Basic input sanitization - removes null bytes and trims strings.
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  const sanitize = (obj: any): any => {
    if (typeof obj === "string") {
      return obj.replace(/\0/g, "").trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
}

/**
 * Security headers middleware.
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // XSS protection for older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions policy
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  next();
}

/**
 * Rate limiting helper (simple in-memory implementation).
 * For production, use a proper rate limiter like express-rate-limit.
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: "Too many requests, please try again later.",
      });
    }

    record.count++;
    next();
  };
}
