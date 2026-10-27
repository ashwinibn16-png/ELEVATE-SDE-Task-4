import pool from '../config/db.js';

/**
 * API 3: Verify Certificate
 * GET /api/certificates/verify/:certificateId
 * Public endpoint to verify a certificate's authenticity.
 * Uses a SQL JOIN to pull the citizen's associated application record.
 */
export const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const query = `
      SELECT 
        c.certificate_id,
        c.application_id,
        c.issued_on,
        c.status,
        a.name,
        a.phone,
        a.city,
        a.state
      FROM certificates c
      JOIN applications a ON c.application_id = a.application_id
      WHERE c.certificate_id = $1;
    `;

    const result = await pool.query(query, [certificateId.trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    const cert = result.rows[0];

    return res.status(200).json({
      success: true,
      certificateId: cert.certificate_id,
      applicationId: cert.application_id,
      name: cert.name,
      phone: cert.phone,
      city: cert.city,
      state: cert.state,
      issuedOn: cert.issued_on,
      status: cert.status, // 'Valid' or 'Revoked'
    });
  } catch (error) {
    next(error);
  }
};
