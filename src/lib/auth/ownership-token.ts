/**
 * Ownership Token System
 *
 * Generates and verifies JWT tokens for comment ownership.
 * Uses jose library for Edge runtime compatibility.
 */

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

const TOKEN_EXPIRATION = '24h'; // 24 hours for edit window

interface OwnershipTokenPayload {
  commentId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generates a signed JWT token for comment ownership
 * @param commentId - The UUID of the comment
 * @param email - The email address of the comment author
 * @returns Signed JWT token string
 */
export async function generateOwnershipToken(
  commentId: string,
  email: string
): Promise<string> {
  const token = await new SignJWT({ commentId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifies an ownership token and returns the payload if valid
 * @param token - The JWT token to verify
 * @param commentId - The comment ID to verify against
 * @returns The payload if valid, null if invalid
 */
export async function verifyOwnershipToken(
  token: string,
  commentId: string
): Promise<OwnershipTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Verify the comment ID matches
    if (payload.commentId !== commentId) {
      return null;
    }

    return payload as OwnershipTokenPayload;
  } catch (error) {
    // Token is invalid, expired, or malformed
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Checks if a token is valid for a given comment ID
 * @param token - The JWT token to check
 * @param commentId - The comment ID to check against
 * @returns true if the token is valid and matches the comment ID
 */
export async function isValidOwnershipToken(
  token: string,
  commentId: string
): Promise<boolean> {
  const payload = await verifyOwnershipToken(token, commentId);
  return payload !== null;
}
