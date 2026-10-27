/**
 * CredVault API Service
 * Centralizes all REST API communication between the React frontend
 * and the Express/PostgreSQL backend (Task 3).
 * Base URL: http://localhost:5000/api
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'credvault_admin_token';
const ADMIN_USER_KEY = 'credvault_admin_user';

// ==========================================
// AUTHENTICATION STATE HELPERS
// ==========================================

export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const setAuthToken = (token, admin = null, remember = true) => {
  try {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    if (admin) {
      storage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
    }
  } catch (err) {
    console.error('Failed to save auth token:', err);
  }
};

export const clearAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
  } catch (err) {
    console.error('Failed to clear auth:', err);
  }
};

export const isAdminAuthenticated = () => {
  const token = getAuthToken();
  return Boolean(token && token.trim().length > 0);
};

export const getAdminUser = () => {
  try {
    const stored = localStorage.getItem(ADMIN_USER_KEY) || sessionStorage.getItem(ADMIN_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// ==========================================
// RESPONSE NORMALIZATION HELPERS
// ==========================================

export const normalizeApplication = (app) => {
  if (!app) return null;
  return {
    ...app,
    id: app.applicationId || app.id,
    applicationId: app.applicationId || app.id,
    fullName: app.name || app.fullName || '',
    name: app.name || app.fullName || '',
    status: app.status || 'Pending',
    rejectionReason: app.rejectionReason || null,
    submittedAt: app.submittedAt || new Date().toISOString(),
    certificateId: app.certificateId || null,
  };
};

export const normalizeCertificate = (cert) => {
  if (!cert) return null;
  return {
    ...cert,
    id: cert.certificateId || cert.id,
    certificateId: cert.certificateId || cert.id,
    fullName: cert.name || cert.fullName || '',
    name: cert.name || cert.fullName || '',
    phone: cert.phone || '',
    city: cert.city || '',
    state: cert.state || '',
    issuedAt: cert.issuedOn || cert.issuedAt || new Date().toISOString(),
    issuedOn: cert.issuedOn || cert.issuedAt || new Date().toISOString(),
    status: cert.status || 'Valid',
    applicationId: cert.applicationId || null,
  };
};

// Generic fetch wrapper with robust error handling
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    console.error(`Network error reaching ${url}:`, networkError);
    throw new Error(
      `Unable to connect to the backend server (${API_BASE_URL}). Please verify that the backend is running.`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = { success: false, message: `Invalid server response (${response.status})` };
  }

  // Handle unauthorized (expired or invalid token)
  if (response.status === 401 && endpoint.startsWith('/admin') && !endpoint.includes('/login')) {
    clearAuth();
  }

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

// ==========================================
// CITIZEN APIS (PUBLIC)
// ==========================================

/**
 * API 1: Submit citizen application
 * POST /api/applications
 */
export const submitApplication = async (formData) => {
  const payload = {
    name: (formData.name || formData.fullName || '').trim(),
    phone: (formData.phone || '').trim(),
    gender: (formData.gender || '').trim(),
    city: (formData.city || '').trim(),
    state: (formData.state || '').trim(),
  };

  const res = await request('/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorMsg =
      res.data?.errors?.map((e) => e.message).join(' ') ||
      res.data?.message ||
      'Failed to submit application.';
    throw new Error(errorMsg);
  }

  return {
    success: true,
    applicationId: res.data.applicationId,
    id: res.data.applicationId,
    status: res.data.status || 'Pending',
    submittedAt: new Date().toISOString(),
    message: res.data.message,
  };
};

/**
 * API 2: Track application status
 * GET /api/applications/track/:applicationId
 */
export const trackApplication = async (applicationId) => {
  const cleanId = (applicationId || '').trim();
  if (!cleanId) return null;

  const res = await request(`/applications/track/${encodeURIComponent(cleanId)}`, {
    method: 'GET',
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(res.data?.message || 'Failed to track application.');
  }

  return normalizeApplication(res.data);
};

/**
 * API 3: Verify certificate
 * GET /api/certificates/verify/:certificateId
 */
export const verifyCertificate = async (certificateId) => {
  const cleanId = (certificateId || '').trim();
  if (!cleanId) return null;

  const res = await request(`/certificates/verify/${encodeURIComponent(cleanId)}`, {
    method: 'GET',
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(res.data?.message || 'Failed to verify certificate.');
  }

  return normalizeCertificate(res.data);
};

// ==========================================
// ADMIN APIS (AUTHENTICATION & MANAGEMENT)
// ==========================================

/**
 * API 4: Admin Login
 * POST /api/admin/login
 */
export const adminLogin = async (username, password) => {
  const res = await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({
      username: (username || '').trim(),
      password: (password || '').trim(),
    }),
  });

  if (!res.ok || !res.data.success) {
    return {
      success: false,
      message: res.data?.message || 'Invalid username or password.',
    };
  }

  // Store token and user details
  setAuthToken(res.data.token, res.data.admin);

  return {
    success: true,
    token: res.data.token,
    admin: res.data.admin,
    message: res.data.message,
  };
};

/**
 * Logout admin
 */
export const adminLogout = () => {
  clearAuth();
};

/**
 * API 5: Admin list applications
 * GET /api/admin/applications(?status=Pending|Approved|Rejected)
 */
export const getAdminApplications = async (statusFilter = 'All') => {
  let endpoint = '/admin/applications';
  if (statusFilter && statusFilter !== 'All') {
    endpoint += `?status=${encodeURIComponent(statusFilter)}`;
  }

  const res = await request(endpoint, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error(res.data?.message || 'Failed to fetch applications.');
  }

  const list = res.data.applications || [];
  return list.map(normalizeApplication);
};

/**
 * API 6: Approve application & issue certificate
 * PATCH /api/admin/applications/:applicationId/approve
 */
export const approveApplication = async (applicationId) => {
  const cleanId = (applicationId || '').trim();

  const res = await request(`/admin/applications/${encodeURIComponent(cleanId)}/approve`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    throw new Error(res.data?.message || 'Failed to approve application.');
  }

  return {
    success: true,
    applicationId: res.data.applicationId,
    status: res.data.status,
    certificateId: res.data.certificateId,
    message: res.data.message,
  };
};

/**
 * API 7: Reject application
 * PATCH /api/admin/applications/:applicationId/reject
 */
export const rejectApplication = async (applicationId, reason = '') => {
  const cleanId = (applicationId || '').trim();

  const res = await request(`/admin/applications/${encodeURIComponent(cleanId)}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason: reason ? reason.trim() : '' }),
  });

  if (!res.ok) {
    throw new Error(res.data?.message || 'Failed to reject application.');
  }

  return {
    success: true,
    applicationId: res.data.applicationId,
    status: res.data.status,
    message: res.data.message,
  };
};

/**
 * API 8: Admin list certificates
 * GET /api/admin/certificates(?status=Valid|Revoked)
 */
export const getAdminCertificates = async (statusFilter = 'All') => {
  let endpoint = '/admin/certificates';
  if (statusFilter && statusFilter !== 'All') {
    endpoint += `?status=${encodeURIComponent(statusFilter)}`;
  }

  const res = await request(endpoint, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error(res.data?.message || 'Failed to fetch certificates.');
  }

  const list = res.data.certificates || [];
  return list.map(normalizeCertificate);
};

/**
 * API 9: Revoke certificate
 * PATCH /api/admin/certificates/:certificateId/revoke
 */
export const revokeCertificate = async (certificateId) => {
  const cleanId = (certificateId || '').trim();

  const res = await request(`/admin/certificates/${encodeURIComponent(cleanId)}/revoke`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    throw new Error(res.data?.message || 'Failed to revoke certificate.');
  }

  return {
    success: true,
    certificateId: res.data.certificateId,
    status: res.data.status,
    message: res.data.message,
  };
};
