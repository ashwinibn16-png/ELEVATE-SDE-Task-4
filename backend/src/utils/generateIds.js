import crypto from 'crypto';

/**
 * Generates a unique, human-readable Application ID
 * Format: APP-YYYY-XXXXXXXX (e.g., APP-2026-A1B2C3D4)
 * @returns {string} Application ID
 */
export const generateApplicationId = () => {
  const year = new Date().getFullYear();
  const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `APP-${year}-${randomBytes}`;
};

/**
 * Generates a unique, human-readable Certificate ID
 * Format: CERT-YYYY-XXXXXXXX (e.g., CERT-2026-9E8D7C6B)
 * @returns {string} Certificate ID
 */
export const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CERT-${year}-${randomBytes}`;
};
