import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool, { getClient } from '../config/db.js';
import { generateCertificateId } from '../utils/generateIds.js';

/**
 * API 4: Admin Login
 * POST /api/admin/login
 * Authenticates admin and returns a signed JWT.
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const query = 'SELECT id, username, password FROM admins WHERE username = $1;';
    const result = await pool.query(query, [username.trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const secret = process.env.JWT_SECRET || 'elevate_default_jwt_secret_key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      secret,
      { expiresIn }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * API 5: Admin List Applications
 * GET /api/admin/applications
 * Lists all citizen applications with optional status filter.
 */
export const listApplications = async (req, res, next) => {
  try {
    const { status } = req.query;

    let queryText = `
      SELECT 
        a.application_id AS "applicationId",
        a.name,
        a.phone,
        a.gender,
        a.city,
        a.state,
        a.status,
        a.rejection_reason AS "rejectionReason",
        a.submitted_at AS "submittedAt",
        c.certificate_id AS "certificateId"
      FROM applications a
      LEFT JOIN certificates c ON a.application_id = c.application_id
    `;
    const queryParams = [];

    if (status) {
      queryText += ' WHERE LOWER(a.status) = LOWER($1)';
      queryParams.push(status.trim());
    }

    queryText += ' ORDER BY a.submitted_at DESC;';

    const result = await pool.query(queryText, queryParams);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      applications: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * API 6: Approve Application
 * PATCH /api/admin/applications/:applicationId/approve
 * Approves a pending application and issues a certificate inside a PostgreSQL transaction.
 */
export const approveApplication = async (req, res, next) => {
  const client = await getClient();
  try {
    const { applicationId } = req.params;

    await client.query('BEGIN');

    // Lock application row for update to prevent concurrent race conditions
    const appQuery = `
      SELECT application_id, status 
      FROM applications 
      WHERE application_id = $1 
      FOR UPDATE;
    `;
    const appResult = await client.query(appQuery, [applicationId.trim()]);

    if (appResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const application = appResult.rows[0];

    // Only allow approval for Pending applications
    if (application.status !== 'Pending') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Application cannot be approved because it has already been processed (current status: ${application.status})`,
      });
    }

    // Update application status to Approved
    const updateQuery = `
      UPDATE applications
      SET status = 'Approved'
      WHERE application_id = $1;
    `;
    await client.query(updateQuery, [applicationId.trim()]);

    // Generate unique Certificate ID
    const certificateId = generateCertificateId();

    // Insert certificate record with 'Valid' status
    const certQuery = `
      INSERT INTO certificates (certificate_id, application_id, status, issued_on)
      VALUES ($1, $2, 'Valid', CURRENT_TIMESTAMP)
      RETURNING certificate_id, status, issued_on;
    `;
    const certResult = await client.query(certQuery, [certificateId, applicationId.trim()]);

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Application approved and certificate issued successfully',
      applicationId: applicationId.trim(),
      status: 'Approved',
      certificateId: certResult.rows[0].certificate_id,
    });
  } catch (error) {
    await client.query('ROLLBACK');

    // Handle foreign key or unique violation if certificate duplicate attempt occurs
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A certificate has already been issued for this application.',
      });
    }

    next(error);
  } finally {
    client.release();
  }
};

/**
 * API 7: Reject Application
 * PATCH /api/admin/applications/:applicationId/reject
 * Rejects a pending application with an optional reason.
 */
export const rejectApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body || {};

    // Check application status
    const appQuery = `
      SELECT application_id, status 
      FROM applications 
      WHERE application_id = $1;
    `;
    const appResult = await pool.query(appQuery, [applicationId.trim()]);

    if (appResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const application = appResult.rows[0];

    // Only allow rejection for Pending applications
    if (application.status !== 'Pending') {
      return res.status(409).json({
        success: false,
        message: `Application cannot be rejected because it has already been processed (current status: ${application.status})`,
      });
    }

    // Update application status to Rejected
    const updateQuery = `
      UPDATE applications
      SET status = 'Rejected', rejection_reason = $1
      WHERE application_id = $2
      RETURNING application_id, status;
    `;
    const updated = await pool.query(updateQuery, [reason ? reason.trim() : null, applicationId.trim()]);

    return res.status(200).json({
      success: true,
      message: 'Application rejected successfully',
      applicationId: updated.rows[0].application_id,
      status: updated.rows[0].status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * API 8: Admin List Certificates
 * GET /api/admin/certificates
 * Lists all issued certificates with citizen details and optional status filtering.
 */
export const listCertificates = async (req, res, next) => {
  try {
    const { status } = req.query;

    let queryText = `
      SELECT 
        c.certificate_id AS "certificateId",
        c.application_id AS "applicationId",
        a.name,
        a.phone,
        a.city,
        a.state,
        c.issued_on AS "issuedOn",
        c.status
      FROM certificates c
      JOIN applications a ON c.application_id = a.application_id
    `;
    const queryParams = [];

    if (status) {
      queryText += ' WHERE LOWER(c.status) = LOWER($1)';
      queryParams.push(status.trim());
    }

    queryText += ' ORDER BY c.issued_on DESC;';

    const result = await pool.query(queryText, queryParams);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      certificates: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * API 9: Revoke Certificate
 * PATCH /api/admin/certificates/:certificateId/revoke
 * Changes certificate status to 'Revoked' without altering original application status.
 */
export const revokeCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    // Find certificate
    const certQuery = `
      SELECT certificate_id, status 
      FROM certificates 
      WHERE certificate_id = $1;
    `;
    const certResult = await pool.query(certQuery, [certificateId.trim()]);

    if (certResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    const cert = certResult.rows[0];

    if (cert.status === 'Revoked') {
      return res.status(409).json({
        success: false,
        message: 'Certificate is already revoked',
      });
    }

    // Update ONLY certificate status from Valid to Revoked
    const updateQuery = `
      UPDATE certificates
      SET status = 'Revoked'
      WHERE certificate_id = $1
      RETURNING certificate_id, status;
    `;
    const result = await pool.query(updateQuery, [certificateId.trim()]);

    return res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully',
      certificateId: result.rows[0].certificate_id,
      status: result.rows[0].status,
    });
  } catch (error) {
    next(error);
  }
};
