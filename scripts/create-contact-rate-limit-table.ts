/**
 * Migration script to create contact_rate_limits table
 * Run once: npx tsx scripts/create-contact-rate-limit-table.ts
 */

import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createTable() {
  try {
    console.log('Creating contact_rate_limits table...');

    await sql`
      CREATE TABLE IF NOT EXISTS contact_rate_limits (
        ip_address VARCHAR(45) PRIMARY KEY,
        submission_count INTEGER NOT NULL DEFAULT 0,
        window_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ Table contact_rate_limits created successfully!');
    console.log('\nTable structure:');
    console.log('- ip_address: Primary key, stores IPv4 or IPv6');
    console.log('- submission_count: Number of submissions in current window');
    console.log('- window_start: When the current rate limit window started');
    console.log('- created_at: When the record was created');
    console.log('- updated_at: When the record was last updated');

  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    process.exit(0);
  }
}

createTable();
