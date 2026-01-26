/**
 * Newsletter Database Operations
 *
 * Functions for interacting with the newsletter_subscriptions table in the database.
 */

import { sql } from '@vercel/postgres';
import { NewsletterSubscription } from '@/types/newsletter';

/**
 * Converts a database row to a NewsletterSubscription object
 */
function rowToSubscription(row: any): NewsletterSubscription {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    status: row.status,
    verificationToken: row.verification_token,
    subscribedAt: row.subscribed_at ? new Date(row.subscribed_at) : null,
    unsubscribedAt: row.unsubscribed_at ? new Date(row.unsubscribed_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ipAddress: row.ip_address,
  };
}

/**
 * Creates a new newsletter subscription with pending status
 * Handles re-subscriptions by updating existing records
 */
export async function createSubscription(data: {
  email: string;
  name: string | null;
  verificationToken: string;
  ipAddress: string;
}): Promise<NewsletterSubscription> {
  const result = await sql`
    INSERT INTO newsletter_subscriptions (
      email,
      name,
      status,
      verification_token,
      ip_address
    ) VALUES (
      ${data.email},
      ${data.name},
      'pending',
      ${data.verificationToken},
      ${data.ipAddress}
    )
    ON CONFLICT (email)
    DO UPDATE SET
      name = COALESCE(${data.name}, newsletter_subscriptions.name),
      status = 'pending',
      verification_token = ${data.verificationToken},
      ip_address = ${data.ipAddress},
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return rowToSubscription(result.rows[0]);
}

/**
 * Finds a subscription by email address
 */
export async function findSubscriptionByEmail(
  email: string
): Promise<NewsletterSubscription | null> {
  const result = await sql`
    SELECT * FROM newsletter_subscriptions
    WHERE email = ${email}
  `;

  if (result.rows.length === 0) {
    return null;
  }

  return rowToSubscription(result.rows[0]);
}

/**
 * Finds a subscription by verification token
 */
export async function findSubscriptionByToken(
  token: string
): Promise<NewsletterSubscription | null> {
  const result = await sql`
    SELECT * FROM newsletter_subscriptions
    WHERE verification_token = ${token}
  `;

  if (result.rows.length === 0) {
    return null;
  }

  return rowToSubscription(result.rows[0]);
}

/**
 * Confirms a subscription by updating status to active
 */
export async function confirmSubscription(
  email: string
): Promise<NewsletterSubscription> {
  const result = await sql`
    UPDATE newsletter_subscriptions
    SET status = 'active',
        subscribed_at = CURRENT_TIMESTAMP,
        verification_token = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = ${email}
    RETURNING *
  `;

  if (result.rows.length === 0) {
    throw new Error('Subscription not found');
  }

  return rowToSubscription(result.rows[0]);
}

/**
 * Unsubscribes an email address
 */
export async function unsubscribeEmail(
  email: string
): Promise<NewsletterSubscription> {
  const result = await sql`
    UPDATE newsletter_subscriptions
    SET status = 'unsubscribed',
        unsubscribed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = ${email}
    RETURNING *
  `;

  if (result.rows.length === 0) {
    throw new Error('Subscription not found');
  }

  return rowToSubscription(result.rows[0]);
}

/**
 * Gets all active subscribers (for sending newsletters)
 */
export async function getActiveSubscribers(): Promise<NewsletterSubscription[]> {
  const result = await sql`
    SELECT * FROM newsletter_subscriptions
    WHERE status = 'active'
    ORDER BY subscribed_at DESC
  `;

  return result.rows.map(rowToSubscription);
}

/**
 * Gets the count of active subscribers
 */
export async function getActiveSubscriberCount(): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM newsletter_subscriptions
    WHERE status = 'active'
  `;

  return parseInt(result.rows[0].count);
}

/**
 * Gets the count of pending subscriptions
 */
export async function getPendingSubscriptionCount(): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM newsletter_subscriptions
    WHERE status = 'pending'
  `;

  return parseInt(result.rows[0].count);
}
