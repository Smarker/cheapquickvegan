/**
 * Comment Database Operations
 *
 * Functions for interacting with the comments table in the database.
 */

import { sql } from '@vercel/postgres';
import { Comment, AggregateRating, CommentWithRecipe } from '@/types/comment';

/**
 * Converts a database row to a Comment object
 */
function rowToComment(row: any): Comment {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    parentCommentId: row.parent_comment_id,
    name: row.name,
    email: row.email,
    commentText: row.comment_text,
    rating: row.rating,
    status: row.status,
    ownershipToken: row.ownership_token,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
  };
}

/**
 * Creates a new comment in the database
 */
export async function createComment(data: {
  recipeId: string;
  parentCommentId?: string;
  name: string | null;
  email: string;
  commentText: string;
  rating: number | null;
  ownershipToken: string;
  ipAddress: string;
  userAgent: string;
}): Promise<Comment> {
  const result = await sql`
    INSERT INTO comments (
      recipe_id,
      parent_comment_id,
      name,
      email,
      comment_text,
      rating,
      ownership_token,
      ip_address,
      user_agent
    ) VALUES (
      ${data.recipeId},
      ${data.parentCommentId || null},
      ${data.name},
      ${data.email},
      ${data.commentText},
      ${data.rating},
      ${data.ownershipToken},
      ${data.ipAddress},
      ${data.userAgent}
    )
    RETURNING *
  `;

  return rowToComment(result.rows[0]);
}

/**
 * Gets approved comments for a recipe with nested replies
 */
const MAX_COMMENTS_PER_RECIPE = 500;

export async function getApprovedComments(recipeId: string): Promise<Comment[]> {
  // Limit rows fetched so a single popular recipe can't cause an unbounded query.
  const result = await sql`
    SELECT * FROM comments
    WHERE recipe_id = ${recipeId}
      AND status = 'approved'
    ORDER BY created_at ASC
    LIMIT ${MAX_COMMENTS_PER_RECIPE}
  `;

  const allComments = result.rows.map(rowToComment);

  // Build nested structure
  const commentMap = new Map<string, Comment>();
  const topLevelComments: Comment[] = [];

  // First pass: create map and initialize replies array
  allComments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build hierarchy
  allComments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;

    if (comment.parentCommentId) {
      // This is a reply
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentWithReplies);
      }
    } else {
      // This is a top-level comment
      topLevelComments.push(commentWithReplies);
    }
  });

  // Sort top-level comments by newest first
  topLevelComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return topLevelComments;
}

/**
 * Gets a single comment by ID
 */
export async function getCommentById(id: string): Promise<Comment | null> {
  const result = await sql`
    SELECT * FROM comments WHERE id = ${id}
  `;

  if (result.rows.length === 0) {
    return null;
  }

  return rowToComment(result.rows[0]);
}

/**
 * Updates a comment's text (sets status back to pending)
 */
export async function updateComment(
  id: string,
  commentText: string
): Promise<Comment> {
  const result = await sql`
    UPDATE comments
    SET comment_text = ${commentText},
        status = 'pending',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;

  return rowToComment(result.rows[0]);
}

/**
 * Deletes a comment (cascade deletes replies automatically)
 */
export async function deleteComment(id: string): Promise<void> {
  await sql`
    DELETE FROM comments WHERE id = ${id}
  `;
}

/**
 * Gets the aggregate rating for a recipe
 */
export async function getAggregateRating(recipeId: string): Promise<AggregateRating> {
  const result = await sql`
    SELECT
      COUNT(*) as count,
      COALESCE(AVG(rating), 0) as average,
      COALESCE(SUM(rating), 0) as total
    FROM comments
    WHERE recipe_id = ${recipeId}
      AND status = 'approved'
      AND rating IS NOT NULL
      AND parent_comment_id IS NULL
  `;

  const row = result.rows[0];

  return {
    count: parseInt(row.count),
    average: parseFloat(row.average),
    total: parseInt(row.total),
  };
}

/**
 * Gets all pending comments for admin moderation
 */
export async function getPendingComments(): Promise<CommentWithRecipe[]> {
  const result = await sql`
    SELECT
      c.*,
      '' as recipe_title,
      c.recipe_id as recipe_slug
    FROM comments c
    WHERE c.status = 'pending'
    ORDER BY c.created_at DESC
  `;

  return result.rows.map(row => ({
    ...rowToComment(row),
    recipeTitle: row.recipe_title,
    recipeSlug: row.recipe_slug,
  }));
}

/**
 * Approves a comment
 */
export async function approveComment(id: string): Promise<Comment> {
  const result = await sql`
    UPDATE comments
    SET status = 'approved',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.rows.length === 0) {
    throw new Error('Comment not found');
  }

  return rowToComment(result.rows[0]);
}

/**
 * Rejects a comment
 */
export async function rejectComment(id: string): Promise<Comment> {
  const result = await sql`
    UPDATE comments
    SET status = 'rejected',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.rows.length === 0) {
    throw new Error('Comment not found');
  }

  return rowToComment(result.rows[0]);
}

/**
 * Gets the count of pending comments
 */
export async function getPendingCommentCount(): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM comments
    WHERE status = 'pending'
  `;

  return parseInt(result.rows[0].count);
}
