/**
 * Rate Limiting Utilities
 * Prevents spam by limiting submissions per IP address
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

// In-memory store for rate limiting (will reset on server restart)
// For production with multiple servers, consider using Redis or a database
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every hour to prevent memory bloat
setInterval(() => {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.lastAttempt > oneWeek) {
      rateLimitStore.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Run every hour

/**
 * Checks if an IP address has exceeded the rate limit
 * @param ip - The IP address to check
 * @param maxAttempts - Maximum number of attempts allowed (default: 2)
 * @param windowMs - Time window in milliseconds (default: 1 week)
 * @returns Object with isAllowed and remainingAttempts
 */
export function checkRateLimit(
  ip: string,
  maxAttempts: number = 2,
  windowMs: number = 7 * 24 * 60 * 60 * 1000 // 1 week
): { isAllowed: boolean; remainingAttempts: number; resetTime?: Date } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // No previous attempts
  if (!entry) {
    rateLimitStore.set(ip, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return {
      isAllowed: true,
      remainingAttempts: maxAttempts - 1,
    };
  }

  // Check if the window has expired
  if (now - entry.firstAttempt > windowMs) {
    // Reset the counter
    rateLimitStore.set(ip, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return {
      isAllowed: true,
      remainingAttempts: maxAttempts - 1,
    };
  }

  // Within the window - check if limit exceeded
  if (entry.count >= maxAttempts) {
    const resetTime = new Date(entry.firstAttempt + windowMs);
    return {
      isAllowed: false,
      remainingAttempts: 0,
      resetTime,
    };
  }

  // Increment counter
  entry.count++;
  entry.lastAttempt = now;
  rateLimitStore.set(ip, entry);

  return {
    isAllowed: true,
    remainingAttempts: maxAttempts - entry.count,
  };
}

/**
 * Gets the client IP address from a Next.js request
 * @param request - Next.js request object
 * @returns IP address string
 */
export function getClientIp(request: Request): string {
  // Check various headers that might contain the IP
  const headers = request.headers;

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback (this won't work in production but useful for local dev)
  return 'unknown';
}
