import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initializes the database tables and indexes from schema.sql
 */
export const initializeDatabase = async () => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('🔄 Applying database schema...');
  try {
    await pool.query(sql);
    console.log('✅ Database schema initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error.message);
    throw error;
  }
};

// Execute directly if run via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
