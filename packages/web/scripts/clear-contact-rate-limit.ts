/**
 * Script to clear contact form rate limits
 * Usage: npm run clear-rate-limit
 */

import { sql } from '@vercel/postgres';
import 'dotenv/config';

async function clearRateLimits() {
  try {
    console.log('Checking current rate limits...');
    const current = await sql`SELECT * FROM comment_rate_limits ORDER BY window_start DESC`;

    if (current.rows.length === 0) {
      console.log('No rate limit entries found.');
    } else {
      console.log('Current rate limits:');
      current.rows.forEach((row: any) => {
        console.log(`  IP: ${row.ip_address}, Count: ${row.comment_count}, Window: ${row.window_start}`);
      });
    }

    console.log('\nClearing all rate limits...');
    const result = await sql`DELETE FROM comment_rate_limits`;
    console.log(`Deleted ${result.rowCount} rate limit entries.`);
    console.log('✅ Rate limits cleared! You can now submit the contact form.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

clearRateLimits();
