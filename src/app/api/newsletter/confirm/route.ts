/**
 * Newsletter Confirmation API Route
 *
 * GET /api/newsletter/confirm?token=xxx - Verify email and activate subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyNewsletterToken } from '@/lib/auth/newsletter-token';
import {
  findSubscriptionByToken,
  confirmSubscription
} from '@/lib/db/newsletter';
import { sendWelcomeEmail } from '@/lib/email/newsletter-emails';

/**
 * GET /api/newsletter/confirm?token=xxx
 * Verifies email and activates newsletter subscription
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=missing-token', request.url)
      );
    }

    // Verify JWT token
    const payload = await verifyNewsletterToken(token, 'verification');

    if (!payload) {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=invalid-token', request.url)
      );
    }

    // Find subscription by token
    const subscription = await findSubscriptionByToken(token);

    if (!subscription) {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=not-found', request.url)
      );
    }

    // Check if already active
    if (subscription.status === 'active') {
      return NextResponse.redirect(
        new URL('/newsletter/confirmed?already=true', request.url)
      );
    }

    // Check if subscription is pending (not unsubscribed)
    if (subscription.status !== 'pending') {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=invalid-status', request.url)
      );
    }

    // Confirm subscription (update status to active)
    await confirmSubscription(subscription.email);

    // Send welcome email (async, non-blocking)
    sendWelcomeEmail(subscription.email, subscription.name).catch((error) => {
      console.error('Failed to send welcome email:', error);
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/newsletter/confirmed', request.url)
    );
  } catch (error) {
    console.error('Newsletter confirmation error:', error);
    return NextResponse.redirect(
      new URL('/newsletter/error?reason=server-error', request.url)
    );
  }
}
