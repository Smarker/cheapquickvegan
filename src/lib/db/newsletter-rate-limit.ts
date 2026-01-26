/**
 * Newsletter Rate Limiting
 *
 * Rate limiter for newsletter subscription attempts.
 * Limits to 3 attempts per 24 hours per IP address.
 */

import { createRateLimiter } from './rate-limit-factory';
import { NewsletterRateLimitInfo } from '@/types/newsletter';

const NEWSLETTER_MAX_ATTEMPTS = 3;
const NEWSLETTER_WINDOW_HOURS = 24;
const CLEANUP_INTERVAL_DAYS = 7;

// Create newsletter rate limiter
const newsletterRateLimiter = createRateLimiter<NewsletterRateLimitInfo>(
  {
    tableName: 'newsletter_rate_limits',
    countColumn: 'attempt_count',
    maxCount: NEWSLETTER_MAX_ATTEMPTS,
    windowHours: NEWSLETTER_WINDOW_HOURS,
    cleanupIntervalDays: CLEANUP_INTERVAL_DAYS,
  },
  (ipAddress, count, windowStart, isAllowed, remaining) => {
    const resetTime = new Date(windowStart.getTime() + NEWSLETTER_WINDOW_HOURS * 60 * 60 * 1000);

    return {
      ipAddress,
      attemptCount: count,
      windowStart,
      isAllowed,
      remainingAttempts: remaining,
      resetTime,
    };
  }
);

/**
 * Checks if an IP address is allowed to make a newsletter subscription attempt
 * @param ipAddress - The IP address to check
 * @returns Rate limit information including isAllowed status
 */
export async function checkNewsletterRateLimit(
  ipAddress: string
): Promise<NewsletterRateLimitInfo> {
  return newsletterRateLimiter.check(ipAddress);
}

/**
 * Increments the newsletter subscription attempt counter for an IP address
 * @param ipAddress - The IP address to increment
 */
export async function incrementNewsletterRateLimit(ipAddress: string): Promise<void> {
  await newsletterRateLimiter.increment(ipAddress);
}

/**
 * Resets rate limit for an IP address (admin utility)
 * @param ipAddress - The IP address to reset
 */
export async function resetNewsletterRateLimit(ipAddress: string): Promise<void> {
  await newsletterRateLimiter.reset(ipAddress);
}

/**
 * Cleans up old rate limit records
 * @returns Number of records deleted
 */
export async function cleanupOldNewsletterRateLimits(): Promise<number> {
  return newsletterRateLimiter.cleanOld();
}
