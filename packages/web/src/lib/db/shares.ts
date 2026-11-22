/**
 * Share Database Operations
 *
 * Functions for tracking recipe shares across different platforms.
 */

import { sql } from '@vercel/postgres';
import { ShareEvent, ShareCounts, SharePlatform } from '@/types/share';

/**
 * Records a share event
 */
export async function trackShare(data: {
  recipeId: string;
  platform: SharePlatform;
  ipAddress?: string;
  userAgent?: string;
}): Promise<ShareEvent> {
  const result = await sql`
    INSERT INTO shares (
      recipe_id,
      platform,
      ip_address,
      user_agent
    ) VALUES (
      ${data.recipeId},
      ${data.platform},
      ${data.ipAddress || null},
      ${data.userAgent || null}
    )
    RETURNING id, recipe_id, platform, created_at, ip_address, user_agent
  `;

  const row = result.rows[0];
  return {
    id: row.id,
    recipeId: row.recipe_id,
    platform: row.platform,
    createdAt: new Date(row.created_at),
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
  };
}

/**
 * Gets share counts for a specific recipe
 */
export async function getShareCounts(recipeId: string): Promise<ShareCounts> {
  const result = await sql`
    SELECT
      platform,
      COUNT(*) as count
    FROM shares
    WHERE recipe_id = ${recipeId}
    GROUP BY platform
  `;

  const counts: ShareCounts = {
    recipeId,
    facebook: 0,
    whatsapp: 0,
    email: 0,
    native: 0,
    pinterest: 0,
    total: 0,
  };

  result.rows.forEach((row) => {
    const platform = row.platform as SharePlatform;
    const count = parseInt(row.count);
    counts[platform] = count;
    counts.total += count;
  });

  return counts;
}

/**
 * Gets total share counts across all recipes
 */
export async function getTotalShareCounts(): Promise<ShareCounts> {
  const result = await sql`
    SELECT
      platform,
      COUNT(*) as count
    FROM shares
    GROUP BY platform
  `;

  const counts: ShareCounts = {
    recipeId: 'all',
    facebook: 0,
    whatsapp: 0,
    email: 0,
    native: 0,
    pinterest: 0,
    total: 0,
  };

  result.rows.forEach((row) => {
    const platform = row.platform as SharePlatform;
    const count = parseInt(row.count);
    counts[platform] = count;
    counts.total += count;
  });

  return counts;
}

/**
 * Gets the most shared recipes
 */
export async function getMostSharedRecipes(limit: number = 10): Promise<Array<{ recipeId: string; count: number }>> {
  const result = await sql`
    SELECT
      recipe_id,
      COUNT(*) as count
    FROM shares
    GROUP BY recipe_id
    ORDER BY count DESC
    LIMIT ${limit}
  `;

  return result.rows.map((row) => ({
    recipeId: row.recipe_id,
    count: parseInt(row.count),
  }));
}
