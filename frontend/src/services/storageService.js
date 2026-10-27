/**
 * Storage Service
 * Centralizes localStorage and sessionStorage operations for CredVault.
 * Handles graceful initialization, validation, corruption fallbacks,
 * and state synchronization between applications and certificates.
 */

import { INITIAL_APPLICATIONS, INITIAL_CERTIFICATES } from '../data/demoData';
import { generateApplicationId, generateCertificateId } from './idService';

const STORAGE_KEYS = {
  APPLICATIONS: 'credvault_applications',
  CERTIFICATES: 'credvault_certificates',
  ADMIN_AUTH: 'credvault_admin_session',
};

/**
 * Initialize storage with sample data if keys do not exist.
 * Preserves existing user data upon reload.
 */
export const initStorage = () => {
  try {
    const existingApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!existingApps) {
      localStorage.setItem(
        STORAGE_KEYS.APPLICATIONS,
        JSON.stringify(INITIAL_APPLICATIONS)
      );
    }

    const existingCerts = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    if (!existingCerts) {
      localStorage.setItem(
        STORAGE_KEYS.CERTIFICATES,
        JSON.stringify(INITIAL_CERTIFICATES)
      );
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
};

/**
 * Helper to safely read from localStorage
 */
const safeRead = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.warn(`Error parsing localStorage key "${key}", falling back:`, error);
    return fallback;
  }
};

/**
 * Helper to safely write to localStorage
 */
const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to write to localStorage key "${key}":`, error);
    return false;
  }
};

// ==========================================
// APPLICATION OPERATIONS
// ==========================================

export const getApplications = () => {
  initStorage();
  return safeRead(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
};

export const getApplicationById = (searchId) => {
  if (!searchId || typeof searchId !== 'string') return null;
  const cleanId = searchId.trim().toUpperCase();
  const applications = getApplications();
  return applications.find((app) => app.id.toUpperCase() === cleanId) || null;
};

export const createApplication = ({ fullName, phone, gender, city, state }) => {
  const applications = getApplications();
  const newId = generateApplicationId(applications);

  // Clean phone number (strip whitespace or +91 prefix for standardized 10-digit format)
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  const newApplication = {
    id: newId,
    fullName: fullName.trim(),
    phone: cleanPhone,
    gender,
    city: city.trim(),
    state,
    status: 'Pending',
    submittedAt: new Date().toISOString(),
    certificateId: null,
    isSample: false,
  };

  const updatedApps = [newApplication, ...applications];
  safeWrite(STORAGE_KEYS.APPLICATIONS, updatedApps);
  return newApplication;
};

export const rejectApplication = (applicationId, reason = 'Application rejected by administrator') => {
  const applications = getApplications();
  const index = applications.findIndex(
    (app) => app.id.toUpperCase() === applicationId.trim().toUpperCase()
  );

  if (index === -1) {
    return { success: false, message: 'Application not found' };
  }

  const app = applications[index];
  if (app.status === 'Approved') {
    return {
      success: false,
      message: 'Cannot reject an application that has already been approved and issued.',
    };
  }

  applications[index] = {
    ...app,
    status: 'Rejected',
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
  };

  safeWrite(STORAGE_KEYS.APPLICATIONS, applications);
  return { success: true, application: applications[index] };
};

// ==========================================
// CERTIFICATE OPERATIONS
// ==========================================

export const getCertificates = () => {
  initStorage();
  return safeRead(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
};

export const getCertificateById = (searchId) => {
  if (!searchId || typeof searchId !== 'string') return null;
  const cleanId = searchId.trim().toUpperCase();
  const certificates = getCertificates();
  return (
    certificates.find((cert) => cert.id.toUpperCase() === cleanId) || null
  );
};

/**
 * Issue a certificate for a pending application.
 * Generates unique Certificate ID, creates certificate with status 'Valid',
 * and updates application status to 'Approved'.
 */
export const issueCertificate = (applicationId) => {
  const applications = getApplications();
  const appIndex = applications.findIndex(
    (app) => app.id.toUpperCase() === applicationId.trim().toUpperCase()
  );

  if (appIndex === -1) {
    return { success: false, message: 'Application not found.' };
  }

  const application = applications[appIndex];

  if (application.status === 'Approved' && application.certificateId) {
    return {
      success: false,
      message: `This application has already been issued certificate ${application.certificateId}.`,
    };
  }

  if (application.status === 'Rejected') {
    return {
      success: false,
      message: 'Cannot issue a certificate for a rejected application.',
    };
  }

  const certificates = getCertificates();
  const newCertId = generateCertificateId(certificates);
  const now = new Date().toISOString();

  const newCertificate = {
    id: newCertId,
    applicationId: application.id,
    fullName: application.fullName,
    phone: application.phone,
    gender: application.gender,
    city: application.city,
    state: application.state,
    status: 'Valid',
    issuedAt: now,
    isSample: false,
  };

  // Update application
  applications[appIndex] = {
    ...application,
    status: 'Approved',
    certificateId: newCertId,
    approvedAt: now,
  };

  const updatedCertificates = [newCertificate, ...certificates];

  safeWrite(STORAGE_KEYS.CERTIFICATES, updatedCertificates);
  safeWrite(STORAGE_KEYS.APPLICATIONS, applications);

  return {
    success: true,
    certificate: newCertificate,
    application: applications[appIndex],
  };
};

/**
 * Revoke an active certificate
 */
export const revokeCertificate = (certificateId, reason = 'Revoked by authority') => {
  const certificates = getCertificates();
  const certIndex = certificates.findIndex(
    (c) => c.id.toUpperCase() === certificateId.trim().toUpperCase()
  );

  if (certIndex === -1) {
    return { success: false, message: 'Certificate not found.' };
  }

  const certificate = certificates[certIndex];
  if (certificate.status === 'Revoked') {
    return {
      success: false,
      message: 'Certificate is already revoked.',
    };
  }

  certificates[certIndex] = {
    ...certificate,
    status: 'Revoked',
    revokedAt: new Date().toISOString(),
    revocationReason: reason,
  };

  safeWrite(STORAGE_KEYS.CERTIFICATES, certificates);
  return { success: true, certificate: certificates[certIndex] };
};

// ==========================================
// ADMIN AUTHENTICATION (DEMO SESSION STORAGE)
// ==========================================

export const isAdminAuthenticated = () => {
  try {
    const token =
      localStorage.getItem('credvault_admin_token') ||
      sessionStorage.getItem('credvault_admin_token');
    if (token) return true;
    const session = sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
    return session === 'true';
  } catch {
    return false;
  }
};

export const loginAdmin = (username, password) => {
  // Demo credentials check: admin / admin
  if (username === 'admin' && (password === 'admin' || password === 'AdminPass@123')) {
    try {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Session storage error' };
    }
  }
  return { success: false, message: 'Invalid username or password.' };
};

export const logoutAdmin = () => {
  try {
    localStorage.removeItem('credvault_admin_token');
    localStorage.removeItem('credvault_admin_user');
    sessionStorage.removeItem('credvault_admin_token');
    sessionStorage.removeItem('credvault_admin_user');
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  } catch (e) {
    console.error('Logout error:', e);
  }
};

/**
 * Helper to reset data back to initial demo seeds
 */
export const resetToDemoData = () => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.APPLICATIONS,
      JSON.stringify(INITIAL_APPLICATIONS)
    );
    localStorage.setItem(
      STORAGE_KEYS.CERTIFICATES,
      JSON.stringify(INITIAL_CERTIFICATES)
    );
    return true;
  } catch {
    return false;
  }
};
