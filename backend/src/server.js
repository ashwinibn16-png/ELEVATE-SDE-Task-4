import app from './app.js';
import pool from './config/db.js';
import { initializeDatabase } from '../database/initDb.js';
import { seedAdmin } from '../database/seedAdmin.js';

const PORT = process.env.PORT || 5000;

/**
 * Bootstrap the server:
 * 1. Test database connection
 * 2. Ensure schema tables are initialized
 * 3. Ensure default admin is provisioned
 * 4. Start HTTP listener
 */
const startServer = async () => {
  try {
    console.log('⏳ Connecting to PostgreSQL database...');
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection established successfully.');
    client.release();

    // Auto-initialize tables and seed admin in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      await initializeDatabase();
      await seedAdmin();
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is listening at http://localhost:${PORT}`);
      console.log(`📌 Base API Endpoint: http://localhost:${PORT}/api`);
      console.log(`🛡️  Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await pool.end();
        console.log('🔒 Database pool closed. Server exited cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
