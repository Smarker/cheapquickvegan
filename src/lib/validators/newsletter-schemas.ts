/**
 * Newsletter Subscription Validation Schemas
 *
 * Zod schemas for validating newsletter subscription forms and API requests.
 */

import { z } from 'zod';

// Schema for newsletter subscription (includes honeypot field)
export const subscribeSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be 255 characters or less')
    .transform(val => val.trim().toLowerCase()),
  name: z
    .string()
    .max(100, 'Name must be 100 characters or less')
    .optional()
    .transform(val => val?.trim() || undefined),
  website: z
    .string()
    .optional(),  // Honeypot field - should be empty for real users
});

// Schema for email verification confirmation
export const confirmSchema = z.object({
  token: z
    .string()
    .min(1, 'Verification token is required'),
});

// Schema for unsubscribe requests
export const unsubscribeSchema = z.object({
  token: z
    .string()
    .min(1, 'Unsubscribe token is required')
    .optional(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional(),
}).refine(data => data.token || data.email, {
  message: 'Either token or email must be provided',
});

// Type exports for TypeScript
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type ConfirmInput = z.infer<typeof confirmSchema>;
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;
