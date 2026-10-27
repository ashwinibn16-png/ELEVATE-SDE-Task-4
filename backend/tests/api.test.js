import request from 'supertest';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../src/app.js';
import pool from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Certificate Issuing & Verification Platform API Tests', () => {
  let adminToken = '';
  const testAdmin = {
    username: 'testadmin',
    password: 'TestPassword@123',
  };

  beforeAll(async () => {
    // 1. Initialize schema in test database
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);

    // 2. Clean up test database tables in correct order
    await pool.query('DELETE FROM certificates;');
    await pool.query('DELETE FROM applications;');
    await pool.query('DELETE FROM admins;');

    // 3. Seed a test admin
    const hashedPassword = await bcrypt.hash(testAdmin.password, 10);
    await pool.query(
      'INSERT INTO admins (username, password) VALUES ($1, $2);',
      [testAdmin.username, hashedPassword]
    );

    // 4. Obtain valid JWT for admin tests
    const loginRes = await request(app)
      .post('/api/admin/login')
      .send(testAdmin);

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.token).toBeDefined();
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    // Close test database connection pool
    await pool.end();
  });

  // =========================================================================
  // Health Check
  // =========================================================================
  describe('GET /api/health', () => {
    it('should return 200 and healthy status message', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('healthy');
    });
  });

  // =========================================================================
  // API 1: Request Certificate (POST /api/applications)
  // =========================================================================
  describe('POST /api/applications', () => {
    it('should fail with 400 when required fields are missing or invalid', async () => {
      const res = await request(app)
        .post('/api/applications')
        .send({
          name: '',
          phone: 'invalid-phone',
          gender: '',
          city: '',
          state: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(4);
    });

    it('should successfully submit an application and return 201 with Pending status', async () => {
      const newApp = {
        name: 'Rohan Sharma',
        phone: '9876543210',
        gender: 'Male',
        city: 'Bengaluru',
        state: 'Karnataka',
      };

      const res = await request(app)
        .post('/api/applications')
        .send(newApp);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Certificate application submitted successfully');
      expect(res.body.applicationId).toMatch(/^APP-\d{4}-[A-F0-9]{8}$/);
      expect(res.body.status).toBe('Pending');
    });
  });

  // =========================================================================
  // API 2: Track Application (GET /api/applications/track/:applicationId)
  // =========================================================================
  describe('GET /api/applications/track/:applicationId', () => {
    let createdAppId = '';

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/applications')
        .send({
          name: 'Priya Patel',
          phone: '9123456780',
          gender: 'Female',
          city: 'Ahmedabad',
          state: 'Gujarat',
        });
      createdAppId = res.body.applicationId;
    });

    it('should return 200 with application details for existing application', async () => {
      const res = await request(app).get(`/api/applications/track/${createdAppId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.applicationId).toBe(createdAppId);
      expect(res.body.name).toBe('Priya Patel');
      expect(res.body.status).toBe('Pending');
      expect(res.body.submittedAt).toBeDefined();
      // Unnecessary personal info must not be exposed
      expect(res.body.phone).toBeUndefined();
    });

    it('should return 404 for a non-existent application ID', async () => {
      const res = await request(app).get('/api/applications/track/APP-2026-NONEXIST');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Application not found');
    });
  });

  // =========================================================================
  // API 4: Admin Login (POST /api/admin/login)
  // =========================================================================
  describe('POST /api/admin/login', () => {
    it('should reject login with wrong password returning 401', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          username: testAdmin.username,
          password: 'IncorrectPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid username or password');
      expect(res.body.token).toBeUndefined();
    });

    it('should reject login with non-existent username returning 401', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'nonexistent_admin',
          password: testAdmin.password,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid username or password');
    });

    it('should succeed with valid credentials returning 200 and a JWT token', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send(testAdmin);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.token).toBeDefined();
      expect(res.body.admin).toBeDefined();
      expect(res.body.admin.username).toBe(testAdmin.username);
      expect(res.body.admin.password).toBeUndefined(); // Never expose password hash
    });
  });

  // =========================================================================
  // Unauthorized Access Checks
  // =========================================================================
  describe('Admin Routes Authorization Protection', () => {
    it('should reject access to protected endpoint without token returning 401', async () => {
      const res = await request(app).get('/api/admin/applications');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token/i);
    });

    it('should reject access with an invalid token returning 401', async () => {
      const res = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', 'Bearer invalid.fake.token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // API 5: Admin List Applications (GET /api/admin/applications)
  // =========================================================================
  describe('GET /api/admin/applications', () => {
    it('should return list of applications with 200 for authenticated admin', async () => {
      const res = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.applications)).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('should filter applications by status query param', async () => {
      const res = await request(app)
        .get('/api/admin/applications?status=Pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.applications.every((a) => a.status === 'Pending')).toBe(true);
    });
  });

  // =========================================================================
  // API 6: Approve Application (PATCH /api/admin/applications/:applicationId/approve)
  // =========================================================================
  describe('PATCH /api/admin/applications/:applicationId/approve', () => {
    let pendingAppId = '';
    let issuedCertId = '';

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/applications')
        .send({
          name: 'Ananya Verma',
          phone: '9988776655',
          gender: 'Female',
          city: 'Hyderabad',
          state: 'Telangana',
        });
      pendingAppId = res.body.applicationId;
    });

    it('should approve a pending application and issue exactly one certificate', async () => {
      const res = await request(app)
        .patch(`/api/admin/applications/${pendingAppId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.applicationId).toBe(pendingAppId);
      expect(res.body.status).toBe('Approved');
      expect(res.body.certificateId).toMatch(/^CERT-\d{4}-[A-F0-9]{8}$/);
      issuedCertId = res.body.certificateId;

      // Verify certificate table has exactly 1 entry for this application
      const certCheck = await pool.query(
        'SELECT * FROM certificates WHERE application_id = $1;',
        [pendingAppId]
      );
      expect(certCheck.rows.length).toBe(1);
      expect(certCheck.rows[0].certificate_id).toBe(issuedCertId);
      expect(certCheck.rows[0].status).toBe('Valid');
    });

    it('should return 409 conflict when attempting to approve an already approved application', async () => {
      // First approval
      await request(app)
        .patch(`/api/admin/applications/${pendingAppId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Second approval attempt
      const res = await request(app)
        .patch(`/api/admin/applications/${pendingAppId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already been processed/i);
    });

    it('should return 404 for a non-existent application', async () => {
      const res = await request(app)
        .patch('/api/admin/applications/APP-NONEXISTENT/approve')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // API 7: Reject Application (PATCH /api/admin/applications/:applicationId/reject)
  // =========================================================================
  describe('PATCH /api/admin/applications/:applicationId/reject', () => {
    let pendingAppId = '';

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/applications')
        .send({
          name: 'Vikram Singh',
          phone: '9765432109',
          gender: 'Male',
          city: 'Jaipur',
          state: 'Rajasthan',
        });
      pendingAppId = res.body.applicationId;
    });

    it('should reject a pending application with optional reason', async () => {
      const res = await request(app)
        .patch(`/api/admin/applications/${pendingAppId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Incomplete residential documentation.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.applicationId).toBe(pendingAppId);
      expect(res.body.status).toBe('Rejected');

      // Verify no certificate was issued
      const certCheck = await pool.query(
        'SELECT * FROM certificates WHERE application_id = $1;',
        [pendingAppId]
      );
      expect(certCheck.rows.length).toBe(0);
    });

    it('should return 409 conflict when attempting to reject an already rejected application', async () => {
      // First rejection
      await request(app)
        .patch(`/api/admin/applications/${pendingAppId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Rejected first time' });

      // Second rejection attempt
      const res = await request(app)
        .patch(`/api/admin/applications/${pendingAppId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Rejected second time' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already been processed/i);
    });
  });

  // =========================================================================
  // API 3: Verify Certificate & API 8: Admin List & API 9: Revoke Certificate
  // =========================================================================
  describe('Certificates Workflow (Verify, List, Revoke)', () => {
    let testCertId = '';
    let testAppId = '';

    beforeAll(async () => {
      // Create and approve an application to produce a valid certificate
      const appRes = await request(app)
        .post('/api/applications')
        .send({
          name: 'Sunita Rao',
          phone: '9845012345',
          gender: 'Female',
          city: 'Mysuru',
          state: 'Karnataka',
        });
      testAppId = appRes.body.applicationId;

      const approveRes = await request(app)
        .patch(`/api/admin/applications/${testAppId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      testCertId = approveRes.body.certificateId;
    });

    it('API 3: should verify a valid certificate returning 200 with citizen details', async () => {
      const res = await request(app).get(`/api/certificates/verify/${testCertId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.certificateId).toBe(testCertId);
      expect(res.body.name).toBe('Sunita Rao');
      expect(res.body.phone).toBe('9845012345');
      expect(res.body.status).toBe('Valid');
      expect(res.body.issuedOn).toBeDefined();
    });

    it('API 3: should return 404 for a non-existent certificate ID', async () => {
      const res = await request(app).get('/api/certificates/verify/CERT-2026-INVALID0');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Certificate not found');
    });

    it('API 8: Admin List Certificates should return certificates with citizen name', async () => {
      const res = await request(app)
        .get('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.certificates)).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);

      const found = res.body.certificates.find((c) => c.certificateId === testCertId);
      expect(found).toBeDefined();
      expect(found.name).toBe('Sunita Rao');
    });

    it('API 9: should revoke certificate successfully and leave application status Approved', async () => {
      const res = await request(app)
        .patch(`/api/admin/certificates/${testCertId}/revoke`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.certificateId).toBe(testCertId);
      expect(res.body.status).toBe('Revoked');

      // Verify certificate table shows Revoked
      const certCheck = await pool.query(
        'SELECT status FROM certificates WHERE certificate_id = $1;',
        [testCertId]
      );
      expect(certCheck.rows[0].status).toBe('Revoked');

      // Crucial requirement: Revocation must NEVER change original application's status
      const appCheck = await pool.query(
        'SELECT status FROM applications WHERE application_id = $1;',
        [testAppId]
      );
      expect(appCheck.rows[0].status).toBe('Approved');
    });

    it('API 3: Revoked certificate must still be found, but with status Revoked', async () => {
      const res = await request(app).get(`/api/certificates/verify/${testCertId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.certificateId).toBe(testCertId);
      expect(res.body.status).toBe('Revoked');
      expect(res.body.name).toBe('Sunita Rao');
    });

    it('API 9: should return 409 conflict when attempting to revoke an already revoked certificate', async () => {
      const res = await request(app)
        .patch(`/api/admin/certificates/${testCertId}/revoke`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Certificate is already revoked');
    });

    it('API 9: should return 404 when attempting to revoke a non-existent certificate', async () => {
      const res = await request(app)
        .patch('/api/admin/certificates/CERT-NONEXISTENT/revoke')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Certificate not found');
    });
  });
});
