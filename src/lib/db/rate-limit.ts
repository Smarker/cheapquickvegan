/**
 * Rate Limiting Module
 *
 * Tracks and limits comment submissions by IP address to prevent spam.
 */

import { getAdminConfig } from '../auth/admin-auth';
import { RateLimitInfo } from '@/types/comment';
import { createRateLimiter } from './rate-limit-factory';

const rateLimiter = createRateLimiter<RateLimitInfo>(
  {
    tableName: 'comment_rate_limits',
    countColumn: 'comment_count',
    maxCount: 5,
    windowHours: 1,
    cleanupIntervalDays: 1,
    failOpenCount: 5
  },
  (ipAddress, commentCount, windowStart, isAllowed, remainingComments): RateLimitInfo => ({
    ipAddress,
    commentCount,
    windowStart,
    isAllowed,
    remainingComments
  })
);

/**
 * Checks if an IP address has exceeded the rate limit
 * @param ipAddress - The IP address to check
 * @returns Rate limit information including whether submission is allowed
 */
export async function checkRateLimit(ipAddress: string): Promise<RateLimitInfo> {
  // Get rate limit configuration from admin settings
  const getMaxComments = async () => {
    const maxComments = parseInt(await getAdminConfig('rate_limit_max') || '5');
    return maxComments;
  };

  return rateLimiter.check(ipAddress, getMaxComments);
}

/**
 * Increments the comment count for an IP address
 * @param ipAddress - The IP address to increment
 */
export async function incrementRateLimit(ipAddress: string): Promise<void> {
  return rateLimiter.increment(ipAddress);
}

/**
 * Cleans up old rate limit records (older than 24 hours)
 * Call this periodically or in a cron job
 */
export async function cleanOldRateLimits(): Promise<number> {
  return rateLimiter.cleanOld();
}

/**
 * Resets rate limit for an IP address (admin utility)
 * @param ipAddress - The IP address to reset
 */
export async function resetRateLimit(ipAddress: string): Promise<void> {
  return rateLimiter.reset(ipAddress);
}
