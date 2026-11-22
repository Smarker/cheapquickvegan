/**
 * Comment System Validation Schemas
 *
 * Zod schemas for validating comment forms and API requests.
 */

import { z } from 'zod';

// Schema for top-level comments (with optional rating)
export const commentSchema = z.object({
  name: z
    .string()
    .max(100, 'Name must be 100 characters or less')
    .optional()
    .transform(val => val?.trim() || undefined),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be 255 characters or less')
    .transform(val => val.trim().toLowerCase()),
  commentText: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be 1000 characters or less')
    .transform(val => val.trim()),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating must be at most 5 stars')
    .optional(),
  recipeId: z
    .string()
    .min(1, 'Recipe ID is required'),
});

// Schema for reply comments (no rating required)
export const replySchema = z.object({
  name: z
    .string()
    .max(100, 'Name must be 100 characters or less')
    .optional()
    .transform(val => val?.trim() || undefined),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be 255 characters or less')
    .transform(val => val.trim().toLowerCase()),
  commentText: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be 1000 characters or less')
    .transform(val => val.trim()),
  recipeId: z
    .string()
    .min(1, 'Recipe ID is required'),
  parentCommentId: z
    .string()
    .uuid('Invalid parent comment ID'),
});

// Schema for editing a comment
export const editCommentSchema = z.object({
  commentText: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be 1000 characters or less')
    .transform(val => val.trim()),
  ownershipToken: z
    .string()
    .min(1, 'Ownership token is required'),
});

// Schema for deleting a comment
export const deleteCommentSchema = z.object({
  ownershipToken: z
    .string()
    .min(1, 'Ownership token is required'),
});

// Schema for admin login
export const adminLoginSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required'),
});

// Schema for comment moderation actions
export const moderationActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  commentId: z.string().uuid('Invalid comment ID'),
});

// Type exports for TypeScript
export type CommentInput = z.infer<typeof commentSchema>;
export type ReplyInput = z.infer<typeof replySchema>;
export type EditCommentInput = z.infer<typeof editCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type ModerationActionInput = z.infer<typeof moderationActionSchema>;
