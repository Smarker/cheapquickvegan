/**
 * Newsletter Subscription Types
 *
 * Type definitions for the newsletter subscription system including
 * subscriptions, verification, and rate limiting.
 */

export type NewsletterStatus = 'pending' | 'active' | 'unsubscribed';

export interface NewsletterSubscription {
  id: string;
  email: string;
  name: string | null;
  status: NewsletterStatus;
  verificationToken: string | null;
  subscribedAt: Date | null;
  unsubscribedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
}

export interface NewsletterRateLimitInfo {
  ipAddress: string;
  attemptCount: number;
  windowStart: Date;
  isAllowed: boolean;
  remainingAttempts: number;
  resetTime: Date;
}

export interface NewsletterSubscribeData {
  email: string;
  name?: string;
  website?: string;  // Honeypot field
}
