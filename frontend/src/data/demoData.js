/**
 * Initial Realistic Demo Data for CredVault
 * Seeded only once if localStorage is uninitialized.
 */

export const INITIAL_APPLICATIONS = [
  {
    id: 'APP-0001',
    fullName: 'Aarav Sharma',
    phone: '9876543210',
    gender: 'Male',
    city: 'Bengaluru',
    state: 'Karnataka',
    status: 'Approved',
    submittedAt: '2026-10-15T09:30:00.000Z',
    certificateId: 'CERT-0001',
    isSample: true,
  },
  {
    id: 'APP-0002',
    fullName: 'Priya Patel',
    phone: '9123456789',
    gender: 'Female',
    city: 'Ahmedabad',
    state: 'Gujarat',
    status: 'Pending',
    submittedAt: '2026-10-20T14:15:00.000Z',
    certificateId: null,
    isSample: true,
  },
  {
    id: 'APP-0003',
    fullName: 'Rohan Verma',
    phone: '9811223344',
    gender: 'Male',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    status: 'Rejected',
    submittedAt: '2026-10-18T11:00:00.000Z',
    certificateId: null,
    isSample: true,
  },
  {
    id: 'APP-0004',
    fullName: 'Ananya Iyer',
    phone: '9740112233',
    gender: 'Female',
    city: 'Chennai',
    state: 'Tamil Nadu',
    status: 'Approved',
    submittedAt: '2026-10-10T16:45:00.000Z',
    certificateId: 'CERT-0002',
    isSample: true,
  },
];

export const INITIAL_CERTIFICATES = [
  {
    id: 'CERT-0001',
    applicationId: 'APP-0001',
    fullName: 'Aarav Sharma',
    phone: '9876543210',
    gender: 'Male',
    city: 'Bengaluru',
    state: 'Karnataka',
    status: 'Valid',
    issuedAt: '2026-10-16T10:00:00.000Z',
    isSample: true,
  },
  {
    id: 'CERT-0002',
    applicationId: 'APP-0004',
    fullName: 'Ananya Iyer',
    phone: '9740112233',
    gender: 'Female',
    city: 'Chennai',
    state: 'Tamil Nadu',
    status: 'Revoked',
    issuedAt: '2026-10-12T12:00:00.000Z',
    revokedAt: '2026-10-22T08:30:00.000Z',
    isSample: true,
  },
];
