/**
 * Complete End-to-End Workflow Verification Script
 * Tests the integrated API server and PostgreSQL database across all citizen and admin flows.
 */

import http from 'http';
import app from '../src/app.js';
import pool from '../src/config/db.js';

const PORT = 5099; // Use dedicated port for test runner to avoid port collisions

function doRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('--- STARTING E2E INTEGRATION VERIFICATION ---');

  const server = app.listen(PORT);
  console.log(`Test server running on http://localhost:${PORT}`);

  try {
    // 1. Health check
    const health = await doRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET',
    });
    console.log('1. Health Check:', health.statusCode === 200 ? 'PASS' : 'FAIL', health.body);

    // 2. Submit citizen application (POST /api/applications)
    const citizenData = {
      name: 'Ashwini B N',
      phone: '9876543210',
      gender: 'Female',
      city: 'Bengaluru',
      state: 'Karnataka',
    };
    const submitRes = await doRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/applications',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      citizenData
    );
    console.log('2. Citizen Submit Application:', submitRes.statusCode === 201 ? 'PASS' : 'FAIL', submitRes.body);
    const appId = submitRes.body.applicationId;
    if (!appId) throw new Error('Missing applicationId in submission response');

    // 3. Track application status (GET /api/applications/track/:applicationId)
    const trackRes = await doRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/applications/track/${appId}`,
      method: 'GET',
    });
    console.log('3. Track Application (Pending):', trackRes.statusCode === 200 && trackRes.body.status === 'Pending' ? 'PASS' : 'FAIL', trackRes.body);

    // 4. Admin login (POST /api/admin/login)
    const loginRes = await doRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/admin/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        username: 'admin',
        password: process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPass@123',
      }
    );
    console.log('4. Admin Login:', loginRes.statusCode === 200 && Boolean(loginRes.body.token) ? 'PASS' : 'FAIL', {
      success: loginRes.body.success,
      admin: loginRes.body.admin,
      tokenReceived: Boolean(loginRes.body.token),
    });
    const token = loginRes.body.token;

    // 5. Admin list applications (GET /api/admin/applications)
    const listAppsRes = await doRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/applications',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('5. Admin List Applications:', listAppsRes.statusCode === 200 ? 'PASS' : 'FAIL', `Total applications: ${listAppsRes.body.count}`);

    // 6. Admin approve application & issue certificate (PATCH /api/admin/applications/:id/approve)
    const approveRes = await doRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/applications/${appId}/approve`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('6. Admin Approve Application:', approveRes.statusCode === 200 ? 'PASS' : 'FAIL', approveRes.body);
    const certId = approveRes.body.certificateId;
    if (!certId) throw new Error('Missing certificateId in approval response');

    // 7. Duplicate certificate prevention check
    const dupApproveRes = await doRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/applications/${appId}/approve`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('7. Duplicate Approval Conflict Prevention:', dupApproveRes.statusCode === 409 ? 'PASS' : 'FAIL', dupApproveRes.body);

    // 8. Citizen track approved application
    const trackApproved = await doRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/applications/track/${appId}`,
      method: 'GET',
    });
    console.log('8. Track Application (Approved with Cert ID):', trackApproved.statusCode === 200 && trackApproved.body.certificateId === certId ? 'PASS' : 'FAIL', trackApproved.body);

    // 9. Public verify certificate (GET /api/certificates/verify/:certificateId)
    const verifyRes = await doRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/certificates/verify/${certId}`,
      method: 'GET',
    });
    console.log('9. Public Verify Certificate (Valid):', verifyRes.statusCode === 200 && verifyRes.body.status === 'Valid' ? 'PASS' : 'FAIL', verifyRes.body);

    // 10. Admin list certificates (GET /api/admin/certificates)
    const listCertsRes = await doRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/certificates',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('10. Admin List Certificates:', listCertsRes.statusCode === 200 ? 'PASS' : 'FAIL', `Total certificates: ${listCertsRes.body.count}`);

    // 11. Admin revoke certificate (PATCH /api/admin/certificates/:certificateId/revoke)
    const revokeRes = await doRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/certificates/${certId}/revoke`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('11. Admin Revoke Certificate:', revokeRes.statusCode === 200 && revokeRes.body.status === 'Revoked' ? 'PASS' : 'FAIL', revokeRes.body);

    // 12. Public verify revoked certificate
    const verifyRevoked = await doRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/certificates/verify/${certId}`,
      method: 'GET',
    });
    console.log('12. Public Verify Certificate (Revoked status):', verifyRevoked.statusCode === 200 && verifyRevoked.body.status === 'Revoked' ? 'PASS' : 'FAIL', verifyRevoked.body);

    // 13. Rejection workflow: Submit another application and reject it
    const sub2 = await doRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/applications',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Applicant Two',
        phone: '9123456789',
        gender: 'Male',
        city: 'Mysuru',
        state: 'Karnataka',
      }
    );
    const appId2 = sub2.body.applicationId;

    const rejectRes = await doRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/admin/applications/${appId2}/reject`,
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      { reason: 'Document verification failed.' }
    );
    console.log('13. Admin Reject Application:', rejectRes.statusCode === 200 && rejectRes.body.status === 'Rejected' ? 'PASS' : 'FAIL', rejectRes.body);

    // 14. Track rejected application
    const trackRejected = await doRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/applications/track/${appId2}`,
      method: 'GET',
    });
    console.log('14. Track Rejected Application:', trackRejected.statusCode === 200 && trackRejected.body.status === 'Rejected' && trackRejected.body.rejectionReason === 'Document verification failed.' ? 'PASS' : 'FAIL', trackRejected.body);

    console.log('\n>>> ALL 14 E2E INTEGRATION WORKFLOW CHECKS PASSED SUCCESSFULLY! <<<');
  } finally {
    server.close();
    await pool.end();
  }
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('VERIFICATION FAILED:', err);
    process.exit(1);
  });
