/**
 * ID Generation Service
 * Generates formatted IDs like APP-0001 and CERT-0001
 * Guarantees uniqueness based on existing records.
 */

/**
 * Generate next Application ID (format: APP-0001)
 * @param {Array<{id: string}>} existingApplications
 * @returns {string}
 */
export const generateApplicationId = (existingApplications = []) => {
  let maxNum = 0;
  
  existingApplications.forEach((app) => {
    if (app && typeof app.id === 'string') {
      const match = app.id.match(/^APP-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
  });

  const nextNum = maxNum + 1;
  return `APP-${String(nextNum).padStart(4, '0')}`;
};

/**
 * Generate next Certificate ID (format: CERT-0001)
 * @param {Array<{id: string}>} existingCertificates
 * @returns {string}
 */
export const generateCertificateId = (existingCertificates = []) => {
  let maxNum = 0;

  existingCertificates.forEach((cert) => {
    if (cert && typeof cert.id === 'string') {
      const match = cert.id.match(/^CERT-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
  });

  const nextNum = maxNum + 1;
  return `CERT-${String(nextNum).padStart(4, '0')}`;
};
