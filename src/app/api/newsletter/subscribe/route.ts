/**
 * Newsletter Subscribe API Route
 *
 * POST /api/newsletter/subscribe - Submit email for newsletter subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { subscribeSchema } from '@/lib/validators/newsletter-schemas';
import {
  checkNewsletterRateLimit,
  incrementNewsletterRateLimit
} from '@/lib/db/newsletter-rate-limit';
import {
  createSubscription,
  findSubscriptionByEmail
} from '@/lib/db/newsletter';
import { generateVerificationToken } from '@/lib/auth/newsletter-token';
import { sendVerificationEmail } from '@/lib/email/newsletter-emails';
import { sanitizeEmail, sanitizeName } from '@/lib/sanitize';

/**
 * POST /api/newsletter/subscribe
 * Creates a new newsletter subscription with pending status
 */
export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();

    // Check honeypot field FIRST (before rate limiting)
    // This way bots don't consume rate limit quota
    if (rawData.website && rawData.website.trim().length > 0) {
      console.log('Honeypot triggered - potential bot submission');
      // Return success to fool bots, but don't actually subscribe
      return NextResponse.json(
        { message: 'Success! Please check your email to confirm your subscription.' },
        { status: 200 }
      );
    }

    // Get IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    // Skip rate limiting in development (localhost)
    const isDevelopment = process.env.NODE_ENV === 'development' || clientIp === '127.0.0.1' || clientIp === '::1';

    if (!isDevelopment) {
      // Check rate limit (3 attempts per 24 hours)
      const rateLimit = await checkNewsletterRateLimit(clientIp);

      if (!rateLimit.isAllowed) {
        return NextResponse.json(
          {
            error: 'Too many subscription attempts',
            message: `You've reached the maximum number of subscription attempts. Please try again after ${rateLimit.resetTime.toLocaleString()}.`,
            remainingAttempts: rateLimit.remainingAttempts,
            resetTime: rateLimit.resetTime.toISOString(),
          },
          { status: 429 }
        );
      }
    }

    // Validate input with Zod
    const validationResult = subscribeSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Sanitize inputs
    const email = sanitizeEmail(data.email);
    const name = sanitizeName(data.name || null);

    // Check if email already exists
    const existingSubscription = await findSubscriptionByEmail(email);

    if (existingSubscription) {
      if (existingSubscription.status === 'active') {
        // Already subscribed - let them know
        return NextResponse.json(
          {
            message: 'You\'re already subscribed!',
            alreadySubscribed: true
          },
          { status: 200 }
        );
      } else if (existingSubscription.status === 'pending') {
        // Resend verification email
        const token = await generateVerificationToken(email);
        await createSubscription({
          email,
          name,
          verificationToken: token,
          ipAddress: clientIp,
        });

        // Send verification email (non-blocking)
        sendVerificationEmail(email, name, token).catch((error) => {
          console.error('Failed to send verification email:', error);
        });

        // Increment rate limit (skip in development)
        if (!isDevelopment) {
          await incrementNewsletterRateLimit(clientIp);
        }

        return NextResponse.json(
          { message: 'Success! Please check your email to confirm your subscription.' },
          { status: 200 }
        );
      } else if (existingSubscription.status === 'unsubscribed') {
        // Reactivate subscription with new token
        const token = await generateVerificationToken(email);
        await createSubscription({
          email,
          name,
          verificationToken: token,
          ipAddress: clientIp,
        });

        // Send verification email
        sendVerificationEmail(email, name, token).catch((error) => {
          console.error('Failed to send verification email:', error);
        });

        // Increment rate limit (skip in development)
        if (!isDevelopment) {
          await incrementNewsletterRateLimit(clientIp);
        }

        return NextResponse.json(
          { message: 'Success! Please check your email to confirm your subscription.' },
          { status: 200 }
        );
      }
    }

    // Generate verification token (24h expiry)
    const verificationToken = await generateVerificationToken(email);

    // Create subscription with pending status
    await createSubscription({
      email,
      name,
      verificationToken,
      ipAddress: clientIp,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, name, verificationToken).catch((error) => {
      console.error('Failed to send verification email:', error);
    });

    // Increment rate limit counter (skip in development)
    if (!isDevelopment) {
      await incrementNewsletterRateLimit(clientIp);
    }

    // Return success (don't reveal if email exists)
    return NextResponse.json(
      { message: 'Success! Please check your email to confirm your subscription.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your subscription. Please try again.' },
      { status: 500 }
    );
  }
}
