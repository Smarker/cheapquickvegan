/**
 * Generic Rate Limiting Factory
 *
 * Creates rate limiters for different resources (comments, contact forms, etc.)
 * with configurable limits and time windows.
 */

import { sql } from '@vercel/postgres';

export interface RateLimitConfig {
  tableName: string;
  countColumn: string;
  maxCount: number;
  windowHours: number;
  cleanupIntervalDays: number;
  failOpenCount?: number;
}

export interface GenericRateLimitInfo<T extends string = string> {
  ipAddress: string;
  [key: string]: any;
  windowStart: Date;
  isAllowed: boolean;
}

/**
 * Creates a rate limiter with the specified configuration
 */
export function createRateLimiter<TInfo extends GenericRateLimitInfo>(
  config: RateLimitConfig,
  infoBuilder: (
    ipAddress: string,
    count: number,
    windowStart: Date,
    isAllowed: boolean,
    remaining: number
  ) => TInfo
) {
  const {
    tableName,
    countColumn,
    maxCount,
    windowHours,
    cleanupIntervalDays,
    failOpenCount = maxCount
  } = config;

  /**
   * Checks if an IP address has exceeded the rate limit
   */
  async function check(ipAddress: string, getMaxCount?: () => Promise<number>): Promise<TInfo> {
    try {
      const effectiveMaxCount = getMaxCount ? await getMaxCount() : maxCount;

      // Get or create rate limit record
      const result = await sql.query(
        `SELECT * FROM ${tableName} WHERE ip_address = $1`,
        [ipAddress]
      );

      if (result.rows.length === 0) {
        // No record exists, create one
        await sql.query(
          `INSERT INTO ${tableName} (ip_address, ${countColumn}, window_start)
           VALUES ($1, 0, CURRENT_TIMESTAMP)`,
          [ipAddress]
        );

        return infoBuilder(ipAddress, 0, new Date(), true, effectiveMaxCount);
      }

      const record = result.rows[0];
      const windowStart = new Date(record.window_start);
      const now = new Date();
      const hoursSinceWindowStart = (now.getTime() - windowStart.getTime()) / (1000 * 60 * 60);

      // Check if window has expired
      if (hoursSinceWindowStart >= windowHours) {
        // Reset the window
        await sql.query(
          `UPDATE ${tableName}
           SET ${countColumn} = 0,
               window_start = CURRENT_TIMESTAMP
           WHERE ip_address = $1`,
          [ipAddress]
        );

        return infoBuilder(ipAddress, 0, new Date(), true, effectiveMaxCount);
      }

      // Check if limit exceeded
      const count = parseInt(record[countColumn]);
      const isAllowed = count < effectiveMaxCount;
      const remaining = Math.max(0, effectiveMaxCount - count);

      return infoBuilder(ipAddress, count, windowStart, isAllowed, remaining);
    } catch (error) {
      console.error(`Rate limit check failed for ${tableName}:`, error);
      // On error, fail open
      return infoBuilder(ipAddress, 0, new Date(), true, failOpenCount);
    }
  }

  /**
   * Increments the count for an IP address
   */
  async function increment(ipAddress: string): Promise<void> {
    try {
      await sql.query(
        `INSERT INTO ${tableName} (ip_address, ${countColumn}, window_start)
         VALUES ($1, 1, CURRENT_TIMESTAMP)
         ON CONFLICT (ip_address)
         DO UPDATE SET ${countColumn} = ${tableName}.${countColumn} + 1`,
        [ipAddress]
      );
    } catch (error) {
      console.error(`Failed to increment rate limit for ${tableName}:`, error);
    }
  }

  /**
   * Resets rate limit for an IP address (admin utility)
   */
  async function reset(ipAddress: string): Promise<void> {
    try {
      await sql.query(
        `DELETE FROM ${tableName} WHERE ip_address = $1`,
        [ipAddress]
      );
    } catch (error) {
      console.error(`Failed to reset rate limit for ${tableName}:`, error);
    }
  }

  /**
   * Cleans up old rate limit records
   */
  async function cleanOld(): Promise<number> {
    try {
      const result = await sql.query(
        `DELETE FROM ${tableName}
         WHERE window_start < NOW() - INTERVAL '${cleanupIntervalDays} days'`
      );

      return result.rowCount || 0;
    } catch (error) {
      console.error(`Failed to clean old rate limits for ${tableName}:`, error);
      return 0;
    }
  }

  return {
    check,
    increment,
    reset,
    cleanOld
  };
}
