/**
 * Comment System Types
 *
 * Type definitions for the recipe comment system including comments,
 * ratings, and moderation.
 */

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
  id: string;
  recipeId: string;
  parentCommentId: string | null;
  name: string | null;
  email: string;
  commentText: string;
  rating: number | null;  // 1-5 for top-level comments, null for replies
  status: CommentStatus;
  ownershipToken: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  replies?: Comment[];  // Nested replies for hierarchical display
}

export interface AggregateRating {
  average: number;  // Average rating (1-5)
  count: number;    // Number of ratings
  total: number;    // Sum of all ratings
}

export interface CommentFormData {
  name?: string;
  email: string;
  commentText: string;
  rating?: number;  // Required for top-level, omitted for replies
  recipeId: string;
  parentCommentId?: string;
}

export interface CommentWithRecipe extends Comment {
  recipeTitle: string;
  recipeSlug: string;
}

export interface RateLimitInfo {
  ipAddress: string;
  commentCount: number;
  windowStart: Date;
  isAllowed: boolean;
  remainingComments: number;
}
