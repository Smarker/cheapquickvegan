/**
 * Moderation Token System
 *
 * Generates one-time use tokens for email-based moderation (approve/reject).
 */

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

const TOKEN_EXPIRATION = '7d'; // 7 days for email links

interface ModerationTokenPayload {
  commentId: string;
  iat?: number;
  exp?: number;
}

/**
 * Generates a signed token for one-click moderation from email
 * Same token works for both approve and reject - the URL path determines the action
 */
export async function generateModerationToken(
  commentId: string
): Promise<string> {
  const token = await new SignJWT({ commentId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifies a moderation token and returns the commentId
 */
export async function verifyModerationToken(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload as ModerationTokenPayload).commentId;
  } catch (error) {
    console.error('Moderation token verification failed:', error);
    return null;
  }
}
