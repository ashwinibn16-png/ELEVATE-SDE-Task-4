import bcrypt from 'bcryptjs';
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates the initial admin account securely using bcrypt password hashing.
 * Password is NEVER stored in plaintext.
 */
export const seedAdmin = async () => {
  const username = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
  const password = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPass@123';

  try {
    // Check if the admin user already exists
    const checkQuery = 'SELECT id, username FROM admins WHERE username = $1;';
    const checkResult = await pool.query(checkQuery, [username]);

    if (checkResult.rows.length > 0) {
      console.log(`ℹ️  Admin account '${username}' already exists (ID: ${checkResult.rows[0].id}).`);
      return checkResult.rows[0];
    }

    // Hash the password with bcrypt (salt rounds = 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertQuery = `
      INSERT INTO admins (username, password)
      VALUES ($1, $2)
      RETURNING id, username, created_at;
    `;
    const insertResult = await pool.query(insertQuery, [username, hashedPassword]);
    const newAdmin = insertResult.rows[0];

    console.log(`✅ Default admin created successfully!`);
    console.log(`   Username: ${newAdmin.username}`);
    console.log(`   (Password securely hashed with bcrypt)`);
    return newAdmin;
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    throw error;
  }
};

// Execute if run directly from CLI
if (process.argv[1].endsWith('seedAdmin.js')) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
