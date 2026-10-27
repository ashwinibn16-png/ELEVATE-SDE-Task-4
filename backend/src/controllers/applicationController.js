import pool from '../config/db.js';
import { generateApplicationId } from '../utils/generateIds.js';

/**
 * API 1: Request Certificate
 * POST /api/applications
 * Submits a new citizen certificate application with 'Pending' status.
 */
export const requestCertificate = async (req, res, next) => {
  try {
    const { name, phone, gender, city, state } = req.body;

    // Retry loop in the unlikely event of an ID collision
    let attempts = 0;
    const maxAttempts = 3;
    let savedApplication = null;

    while (attempts < maxAttempts) {
      attempts++;
      const applicationId = generateApplicationId();

      try {
        const insertQuery = `
          INSERT INTO applications (application_id, name, phone, gender, city, state, status)
          VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
          RETURNING application_id, status, submitted_at;
        `;
        const values = [applicationId, name.trim(), phone.trim(), gender.trim(), city.trim(), state.trim()];
        const result = await pool.query(insertQuery, values);
        savedApplication = result.rows[0];
        break;
      } catch (dbErr) {
        // 23505 = unique_violation error in PostgreSQL
        if (dbErr.code === '23505' && attempts < maxAttempts) {
          continue;
        }
        throw dbErr;
      }
    }

    if (!savedApplication) {
      return res.status(500).json({
        success: false,
        message: 'Could not generate a unique application ID. Please try again.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Certificate application submitted successfully',
      applicationId: savedApplication.application_id,
      status: savedApplication.status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * API 2: Track Application
 * GET /api/applications/track/:applicationId
 * Allows citizens to track their application status using their application ID.
 */
export const trackApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const query = `
      SELECT 
        a.application_id, 
        a.name, 
        a.status, 
        a.submitted_at,
        a.rejection_reason,
        c.certificate_id
      FROM applications a
      LEFT JOIN certificates c ON a.application_id = c.application_id
      WHERE a.application_id = $1;
    `;
    const result = await pool.query(query, [applicationId.trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const app = result.rows[0];

    return res.status(200).json({
      success: true,
      applicationId: app.application_id,
      name: app.name,
      status: app.status,
      submittedAt: app.submitted_at,
      certificateId: app.certificate_id || null,
      rejectionReason: app.rejection_reason || null,
    });
  } catch (error) {
    next(error);
  }
};
