/**
 * Contact Form Rate Limiting Module
 *
 * Tracks and limits contact form submissions by IP address to prevent spam.
 * Separate from comment rate limits with different thresholds (2 per week).
 */

import { createRateLimiter } from './rate-limit-factory';

export interface ContactRateLimitInfo {
  ipAddress: string;
  submissionCount: number;
  windowStart: Date;
  isAllowed: boolean;
  remainingSubmissions: number;
}

const rateLimiter = createRateLimiter<ContactRateLimitInfo>(
  {
    tableName: 'contact_rate_limits',
    countColumn: 'submission_count',
    maxCount: 2,
    windowHours: 7 * 24, // 1 week
    cleanupIntervalDays: 14,
    failOpenCount: 2
  },
  (ipAddress, submissionCount, windowStart, isAllowed, remainingSubmissions): ContactRateLimitInfo => ({
    ipAddress,
    submissionCount,
    windowStart,
    isAllowed,
    remainingSubmissions
  })
);

/**
 * Checks if an IP address has exceeded the contact form rate limit
 * @param ipAddress - The IP address to check
 * @returns Rate limit information including whether submission is allowed
 */
export async function checkContactRateLimit(ipAddress: string): Promise<ContactRateLimitInfo> {
  return rateLimiter.check(ipAddress);
}

/**
 * Increments the submission count for an IP address
 * @param ipAddress - The IP address to increment
 */
export async function incrementContactRateLimit(ipAddress: string): Promise<void> {
  return rateLimiter.increment(ipAddress);
}

/**
 * Resets rate limit for an IP address (admin utility)
 * @param ipAddress - The IP address to reset
 */
export async function resetContactRateLimit(ipAddress: string): Promise<void> {
  return rateLimiter.reset(ipAddress);
}

/**
 * Cleans up old rate limit records (older than 2 weeks)
 */
export async function cleanOldContactRateLimits(): Promise<number> {
  return rateLimiter.cleanOld();
}
