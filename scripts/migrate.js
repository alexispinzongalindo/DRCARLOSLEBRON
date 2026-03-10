#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function runMigrations() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Get list of executed migrations
    const { rows: executedMigrations } = await client.query(
      'SELECT filename FROM migrations ORDER BY id'
    );
    const executedSet = new Set(executedMigrations.map(row => row.filename));

    // Migration files to run in order
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_seed_data.sql'
    ];

    for (const filename of migrationFiles) {
      if (executedSet.has(filename)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }

      console.log(`🚀 Running migration: ${filename}`);
      
      try {
        const migrationPath = join(__dirname, '..', 'migrations', filename);
        const migrationSQL = readFileSync(migrationPath, 'utf8');
        
        // Execute the migration
        await client.query(migrationSQL);
        
        // Record the migration as executed
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [filename]
        );
        
        console.log(`✅ Successfully executed ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to execute ${filename}:`, error.message);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
runMigrations().catch(console.error);
