/**
 * Contact Form Rate Limiting Module
 *
 * Tracks and limits contact form submissions by IP address to prevent spam.
 * Separate from comment rate limits with different thresholds (2 per week).
 */

import { sql } from '@vercel/postgres';

interface ContactRateLimitInfo {
  ipAddress: string;
  submissionCount: number;
  windowStart: Date;
  isAllowed: boolean;
  remainingSubmissions: number;
}

/**
 * Checks if an IP address has exceeded the contact form rate limit
 * @param ipAddress - The IP address to check
 * @returns Rate limit information including whether submission is allowed
 */
export async function checkContactRateLimit(ipAddress: string): Promise<ContactRateLimitInfo> {
  try {
    // Contact form limit: 2 submissions per week
    const maxSubmissions = 2;
    const windowHours = 7 * 24; // 1 week

    // Get or create rate limit record
    const result = await sql`
      SELECT * FROM contact_rate_limits
      WHERE ip_address = ${ipAddress}
    `;

    if (result.rows.length === 0) {
      // No record exists, create one
      await sql`
        INSERT INTO contact_rate_limits (ip_address, submission_count, window_start)
        VALUES (${ipAddress}, 0, CURRENT_TIMESTAMP)
      `;

      return {
        ipAddress,
        submissionCount: 0,
        windowStart: new Date(),
        isAllowed: true,
        remainingSubmissions: maxSubmissions,
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
        UPDATE contact_rate_limits
        SET submission_count = 0,
            window_start = CURRENT_TIMESTAMP
        WHERE ip_address = ${ipAddress}
      `;

      return {
        ipAddress,
        submissionCount: 0,
        windowStart: new Date(),
        isAllowed: true,
        remainingSubmissions: maxSubmissions,
      };
    }

    // Check if limit exceeded
    const submissionCount = parseInt(record.submission_count);
    const isAllowed = submissionCount < maxSubmissions;
    const remainingSubmissions = Math.max(0, maxSubmissions - submissionCount);

    return {
      ipAddress,
      submissionCount,
      windowStart,
      isAllowed,
      remainingSubmissions,
    };
  } catch (error) {
    console.error('Contact rate limit check failed:', error);
    // On error, allow the submission (fail open)
    return {
      ipAddress,
      submissionCount: 0,
      windowStart: new Date(),
      isAllowed: true,
      remainingSubmissions: 2,
    };
  }
}

/**
 * Increments the submission count for an IP address
 * @param ipAddress - The IP address to increment
 */
export async function incrementContactRateLimit(ipAddress: string): Promise<void> {
  try {
    await sql`
      INSERT INTO contact_rate_limits (ip_address, submission_count, window_start)
      VALUES (${ipAddress}, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (ip_address)
      DO UPDATE SET submission_count = contact_rate_limits.submission_count + 1
    `;
  } catch (error) {
    console.error('Failed to increment contact rate limit:', error);
  }
}

/**
 * Resets rate limit for an IP address (admin utility)
 * @param ipAddress - The IP address to reset
 */
export async function resetContactRateLimit(ipAddress: string): Promise<void> {
  try {
    await sql`
      DELETE FROM contact_rate_limits
      WHERE ip_address = ${ipAddress}
    `;
  } catch (error) {
    console.error('Failed to reset contact rate limit:', error);
  }
}

/**
 * Cleans up old rate limit records (older than 2 weeks)
 */
export async function cleanOldContactRateLimits(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM contact_rate_limits
      WHERE window_start < NOW() - INTERVAL '14 days'
    `;

    return result.rowCount || 0;
  } catch (error) {
    console.error('Failed to clean old contact rate limits:', error);
    return 0;
  }
}
