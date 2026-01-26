/**
 * Newsletter Token System
 *
 * Generates and verifies JWT tokens for newsletter verification and unsubscribe links.
 * Uses jose library for Edge runtime compatibility.
 */

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

interface NewsletterTokenPayload {
  email: string;
  purpose: 'verification' | 'unsubscribe';
  iat?: number;
  exp?: number;
}

/**
 * Generates a signed JWT token for email verification
 * @param email - The email address to verify
 * @returns Signed JWT token string (expires in 24 hours)
 */
export async function generateVerificationToken(email: string): Promise<string> {
  const token = await new SignJWT({ email, purpose: 'verification' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Generates a signed JWT token for unsubscribe links
 * @param email - The email address to unsubscribe
 * @returns Signed JWT token string (expires in 1 year)
 */
export async function generateUnsubscribeToken(email: string): Promise<string> {
  const token = await new SignJWT({ email, purpose: 'unsubscribe' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1y')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifies a newsletter token and returns the payload if valid
 * @param token - The JWT token to verify
 * @param expectedPurpose - The expected purpose of the token
 * @returns The payload if valid, null if invalid
 */
export async function verifyNewsletterToken(
  token: string,
  expectedPurpose: 'verification' | 'unsubscribe'
): Promise<NewsletterTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Verify the payload has the expected structure
    if (
      typeof payload.email !== 'string' ||
      typeof payload.purpose !== 'string'
    ) {
      return null;
    }

    // Verify the purpose matches
    if (payload.purpose !== expectedPurpose) {
      return null;
    }

    return {
      email: payload.email,
      purpose: payload.purpose as 'verification' | 'unsubscribe',
      iat: typeof payload.iat === 'number' ? payload.iat : undefined,
      exp: typeof payload.exp === 'number' ? payload.exp : undefined,
    };
  } catch (error) {
    // Token is invalid, expired, or malformed
    console.error('Newsletter token verification failed:', error);
    return null;
  }
}

/**
 * Checks if a verification token is valid
 * @param token - The JWT token to check
 * @returns true if the token is valid for verification
 */
export async function isValidVerificationToken(token: string): Promise<boolean> {
  const payload = await verifyNewsletterToken(token, 'verification');
  return payload !== null;
}

/**
 * Checks if an unsubscribe token is valid
 * @param token - The JWT token to check
 * @returns true if the token is valid for unsubscribe
 */
export async function isValidUnsubscribeToken(token: string): Promise<boolean> {
  const payload = await verifyNewsletterToken(token, 'unsubscribe');
  return payload !== null;
}
