/**
 * Rate Limiting Module
 *
 * Tracks and limits comment submissions by IP address to prevent spam.
 */

import { sql } from '@vercel/postgres';
import { getAdminConfig } from '../auth/admin-auth';
import { RateLimitInfo } from '@/types/comment';

/**
 * Checks if an IP address has exceeded the rate limit
 * @param ipAddress - The IP address to check
 * @returns Rate limit information including whether submission is allowed
 */
export async function checkRateLimit(ipAddress: string): Promise<RateLimitInfo> {
  try {
    // Get rate limit configuration
    const maxComments = parseInt(await getAdminConfig('rate_limit_max') || '5');
    const windowHours = parseInt(await getAdminConfig('rate_limit_window_hours') || '1');

    // Get or create rate limit record
    const result = await sql`
      SELECT * FROM comment_rate_limits
      WHERE ip_address = ${ipAddress}
    `;

    if (result.rows.length === 0) {
      // No record exists, create one
      await sql`
        INSERT INTO comment_rate_limits (ip_address, comment_count, window_start)
        VALUES (${ipAddress}, 0, CURRENT_TIMESTAMP)
      `;

      return {
        ipAddress,
        commentCount: 0,
        windowStart: new Date(),
        isAllowed: true,
        remainingComments: maxComments,
      };
    }

    const record = result.rows[0];
    const windowStart = new Date(record.window_start);
    const now = new Date();
    const hoursSinceWindowStart = (now.getTime() - windowStart.getTime()) / (1000 * 60 * 60);

    // Check if window has expired
    if (hoursSinceWindowStart >= windowHours) {
      // Reset the window
      await sql`
        UPDATE comment_rate_limits
        SET comment_count = 0,
            window_start = CURRENT_TIMESTAMP
        WHERE ip_address = ${ipAddress}
      `;

      return {
        ipAddress,
        commentCount: 0,
        windowStart: new Date(),
        isAllowed: true,
        remainingComments: maxComments,
      };
    }

    // Check if limit exceeded
    const commentCount = parseInt(record.comment_count);
    const isAllowed = commentCount < maxComments;
    const remainingComments = Math.max(0, maxComments - commentCount);

    return {
      ipAddress,
      commentCount,
      windowStart,
      isAllowed,
      remainingComments,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the comment (fail open)
    return {
      ipAddress,
      commentCount: 0,
      windowStart: new Date(),
      isAllowed: true,
      remainingComments: 5,
    };
  }
}

/**
 * Increments the comment count for an IP address
 * @param ipAddress - The IP address to increment
 */
export async function incrementRateLimit(ipAddress: string): Promise<void> {
  try {
    await sql`
      INSERT INTO comment_rate_limits (ip_address, comment_count, window_start)
      VALUES (${ipAddress}, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (ip_address)
      DO UPDATE SET comment_count = comment_rate_limits.comment_count + 1
    `;
  } catch (error) {
    console.error('Failed to increment rate limit:', error);
  }
}

/**
 * Cleans up old rate limit records (older than 24 hours)
 * Call this periodically or in a cron job
 */
export async function cleanOldRateLimits(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM comment_rate_limits
      WHERE window_start < NOW() - INTERVAL '24 hours'
    `;

    return result.rowCount || 0;
  } catch (error) {
    console.error('Failed to clean old rate limits:', error);
    return 0;
  }
}

/**
 * Resets rate limit for an IP address (admin utility)
 * @param ipAddress - The IP address to reset
 */
export async function resetRateLimit(ipAddress: string): Promise<void> {
  try {
    await sql`
      DELETE FROM comment_rate_limits
      WHERE ip_address = ${ipAddress}
    `;
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
  }
}
