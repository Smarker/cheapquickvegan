/**
 * Newsletter Unsubscribe API Route
 *
 * GET /api/newsletter/unsubscribe?token=xxx - Unsubscribe via email link
 * POST /api/newsletter/unsubscribe - Unsubscribe via form
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyNewsletterToken } from '@/lib/auth/newsletter-token';
import {
  findSubscriptionByEmail,
  unsubscribeEmail
} from '@/lib/db/newsletter';
import { unsubscribeSchema } from '@/lib/validators/newsletter-schemas';
import { sanitizeEmail } from '@/lib/sanitize';

/**
 * GET /api/newsletter/unsubscribe?token=xxx
 * Unsubscribes via token from email link
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const payload = await verifyNewsletterToken(token, 'unsubscribe');

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token' },
        { status: 400 }
      );
    }

    // Find subscription by email
    const subscription = await findSubscriptionByEmail(payload.email);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Check if already unsubscribed
    if (subscription.status === 'unsubscribed') {
      return NextResponse.redirect(
        new URL('/newsletter/unsubscribed?already=true', request.url)
      );
    }

    // Check if subscription is active
    if (subscription.status !== 'active') {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=not-active', request.url)
      );
    }

    // Unsubscribe
    await unsubscribeEmail(payload.email);

    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed', request.url)
    );
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribes via form submission (token or email)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = unsubscribeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    let email: string;

    // If token provided, verify it
    if (data.token) {
      const payload = await verifyNewsletterToken(data.token, 'unsubscribe');

      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired unsubscribe token' },
          { status: 400 }
        );
      }

      email = payload.email;
    } else if (data.email) {
      // Sanitize email
      email = sanitizeEmail(data.email);
    } else {
      return NextResponse.json(
        { error: 'Either token or email must be provided' },
        { status: 400 }
      );
    }

    // Find subscription
    const subscription = await findSubscriptionByEmail(email);

    if (!subscription) {
      // Don't reveal if email exists
      return NextResponse.json(
        { message: 'If your email was in our system, you have been unsubscribed.' },
        { status: 200 }
      );
    }

    // Check if already unsubscribed
    if (subscription.status === 'unsubscribed') {
      return NextResponse.json(
        { message: 'You have already been unsubscribed.' },
        { status: 200 }
      );
    }

    // Unsubscribe
    await unsubscribeEmail(email);

    return NextResponse.json(
      { message: 'You have been successfully unsubscribed from our newsletter.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
