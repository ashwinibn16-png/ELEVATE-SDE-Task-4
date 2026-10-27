import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isTest = process.env.NODE_ENV === 'test';
const database = isTest
  ? (process.env.DB_NAME_TEST || 'certificate_platform_test')
  : (process.env.DB_NAME || 'certificate_platform');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const query = (text, params) => pool.query(text, params);

export const getClient = () => pool.connect();

export default pool;
