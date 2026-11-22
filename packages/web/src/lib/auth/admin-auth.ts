/**
 * Admin Authentication System
 *
 * Handles admin password verification and session management.
 */

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

const SESSION_EXPIRATION = '7d'; // 7 days

interface AdminSessionPayload {
  admin: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Gets admin configuration from database
 * @param key - The config key to retrieve
 * @returns The config value or null if not found
 */
export async function getAdminConfig(key: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT value FROM admin_config WHERE key = ${key}
    `;

    return result.rows[0]?.value || null;
  } catch (error) {
    console.error('Failed to get admin config:', error);
    return null;
  }
}

/**
 * Verifies an admin password against the stored hash
 * @param password - The password to verify
 * @returns true if password is correct, false otherwise
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const storedHash = await getAdminConfig('admin_password_hash');

    if (!storedHash) {
      console.error('Admin password hash not found in database');
      return false;
    }

    const isValid = await bcrypt.compare(password, storedHash);
    return isValid;
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

/**
 * Creates an admin session token
 * @returns Signed JWT session token
 */
export async function createAdminSession(): Promise<string> {
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifies an admin session token
 * @param token - The session token to verify
 * @returns true if the token is valid and represents an admin session
 */
export async function verifyAdminSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return payload.admin === true;
  } catch (error) {
    // Token is invalid, expired, or malformed
    console.error('Admin session verification failed:', error);
    return false;
  }
}

/**
 * Generates a bcrypt hash for a password (utility for setup)
 * @param password - The password to hash
 * @returns The bcrypt hash
 */
export async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

/**
 * Verifies admin authentication for API routes
 * Returns an error response if authentication fails, or null if authenticated
 *
 * @returns NextResponse with error if authentication fails, null if authenticated
 *
 * @example
 * const authError = await requireAdminAuth();
 * if (authError) return authError;
 * // Continue with authenticated logic...
 */
export async function requireAdminAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session')?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { error: 'Unauthorized - No session token' },
      { status: 401 }
    );
  }

  const isAdmin = await verifyAdminSession(sessionToken);

  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid session' },
      { status: 401 }
    );
  }

  return null;
}
