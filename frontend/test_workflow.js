import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:4173';

async function testSuite() {
  console.log('=== STARTING CREDVAULT END-TO-END VERIFICATION TEST SUITE ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  let generatedAppId = '';
  let generatedCertId = '';

  try {
    // -------------------------------------------------------------
    // TEST 1: Home Page & Navigation Links
    // -------------------------------------------------------------
    console.log('\n[Test 1] Testing Home Page...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    const title = await page.title();
    console.log(`- Page title: "${title}"`);
    if (!title.includes('CredVault')) throw new Error('Title does not match CredVault');

    const heroText = await page.$eval('h1', el => el.innerText);
    console.log(`- Hero h1 text: "${heroText}"`);
    if (!heroText.includes('CredVault')) throw new Error('Hero does not include CredVault');

    console.log('✔ Test 1 Passed: Home Page and Branding verified.');

    // -------------------------------------------------------------
    // TEST 2: Indian States & UTs dropdown count
    // -------------------------------------------------------------
    console.log('\n[Test 2] Testing Request Certificate Page & State Dropdown...');
    await page.goto(`${BASE_URL}/request`, { waitUntil: 'networkidle0' });

    const stateOptionsCount = await page.$$eval('#state option', options => 
      options.filter(o => o.value !== '').length
    );
    console.log(`- States & UTs dropdown options count: ${stateOptionsCount} (Expected: 36)`);
    if (stateOptionsCount !== 36) throw new Error(`Expected 36 states/UTs, found ${stateOptionsCount}`);
    console.log('✔ Test 2 Passed: Exactly 36 States and UTs verified.');

    // -------------------------------------------------------------
    // TEST 3: Form Validations
    // -------------------------------------------------------------
    console.log('\n[Test 3] Testing Request Form Validation...');
    // Submit empty form
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 200));

    const errors = await page.$$eval('[role="alert"]', els => els.map(e => e.innerText));
    console.log(`- Validation errors on empty submission:`, errors);
    if (errors.length < 3) throw new Error('Validation errors failed to appear for required fields');

    // Test invalid phone number
    await page.type('#fullName', 'Test User');
    await page.type('#phone', '12345');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 200));

    const phoneError = await page.$eval('#phone-error', el => el.innerText).catch(() => '');
    console.log(`- Phone error for "12345": "${phoneError}"`);
    if (!phoneError.includes('10-digit')) throw new Error('Phone validation for invalid length failed');
    console.log('✔ Test 3 Passed: Form validations prevent invalid submission.');

    // -------------------------------------------------------------
    // TEST 4: Valid Application Submission
    // -------------------------------------------------------------
    console.log('\n[Test 4] Submitting Valid Application...');
    // Reset inputs
    await page.goto(`${BASE_URL}/request`, { waitUntil: 'networkidle0' });
    await page.type('#fullName', 'Vikram Malhotra');
    await page.type('#phone', '9876501234');
    // Select Gender radio Male
    await page.click('input[name="gender"][value="Male"]');
    await page.type('#city', 'Pune');
    await page.select('#state', 'Maharashtra');

    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 800));

    // Verify success banner and ID
    const successHeader = await page.$eval('h2', el => el.innerText);
    console.log(`- Success header: "${successHeader}"`);
    if (!successHeader.includes('Application submitted successfully')) {
      throw new Error('Success screen did not display');
    }

    generatedAppId = await page.$eval('.font-mono.font-extrabold', el => el.innerText);
    console.log(`- Generated Application ID: ${generatedAppId}`);
    if (!generatedAppId.startsWith('APP-')) throw new Error('Generated ID does not start with APP-');
    console.log('✔ Test 4 Passed: Application submitted and unique ID generated.');

    // -------------------------------------------------------------
    // TEST 5: Track Application Navigation & Auto-fill
    // -------------------------------------------------------------
    console.log('\n[Test 5] Tracking newly created application...');
    // Click "Track This Application" button using evaluate
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Track This Application'));
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 800));
    const trackedId = await page.$eval('h2.font-mono', el => el.innerText).catch(() => '');
    console.log(`- Tracked ID on screen: "${trackedId}"`);
    if (trackedId !== generatedAppId) throw new Error(`Expected tracked ID ${generatedAppId}, got ${trackedId}`);

    const resultText = await page.evaluate(() => {
      const container = document.querySelector('.bg-white.rounded-2xl.border.border-slate-200.shadow-md');
      return container ? container.innerText : '';
    });
    console.log(`- Tracking result preview: "${resultText.slice(0, 100).replace(/\s+/g, ' ')}"`);
    if (!resultText.includes('Pending')) throw new Error('Initial status is not Pending');
    console.log('✔ Test 5 Passed: Auto-filled tracking displays Pending status.');

    // -------------------------------------------------------------
    // TEST 6: Protected Route Guard
    // -------------------------------------------------------------
    console.log('\n[Test 6] Testing Admin Protected Route Guard...');
    await page.goto(`${BASE_URL}/admin/applications`, { waitUntil: 'networkidle0' });
    const currentUrl = page.url();
    console.log(`- Redirected unauthenticated URL: "${currentUrl}"`);
    if (!currentUrl.includes('/admin/login')) {
      throw new Error('Protected route did not redirect to /admin/login');
    }
    console.log('✔ Test 6 Passed: Protected route guard properly redirects.');

    // -------------------------------------------------------------
    // TEST 7: Admin Login Validation & Success
    // -------------------------------------------------------------
    console.log('\n[Test 7] Testing Admin Login...');
    // Invalid credentials
    await page.type('#username', 'wrong');
    await page.type('#password', 'wrong');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 500));

    const loginError = await page.evaluate(() => {
      const errEl = document.querySelector('.bg-rose-50');
      return errEl ? errEl.innerText : '';
    });
    console.log(`- Invalid login error: "${loginError}"`);
    if (!loginError.includes('Invalid username or password')) {
      throw new Error('Expected invalid credentials error');
    }

    // Use the Auto-Fill button directly
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const autoFillBtn = btns.find(b => b.innerText.includes('Auto-Fill'));
      if (autoFillBtn) autoFillBtn.click();
    });

    const userVal = await page.$eval('#username', el => el.value);
    const passVal = await page.$eval('#password', el => el.value);
    console.log(`- Values after Auto-Fill: user="${userVal}", pass="${passVal}"`);

    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1200));

    console.log(`- Logged in URL: "${page.url()}"`);
    if (!page.url().includes('/admin/applications')) {
      throw new Error('Admin login failed to navigate to /admin/applications');
    }
    console.log('✔ Test 7 Passed: Admin authentication succeeded.');

    // -------------------------------------------------------------
    // TEST 8: Issue Certificate in Admin
    // -------------------------------------------------------------
    console.log('\n[Test 8] Issuing Certificate for new application in Admin Applications...');
    // Check that generatedAppId is visible in table
    const tableText = await page.$eval('table', el => el.innerText);
    if (!tableText.includes(generatedAppId) || !tableText.includes('Vikram Malhotra')) {
      throw new Error(`Application ${generatedAppId} not found in admin table`);
    }

    // Find the row for generatedAppId and click "Issue"
    await page.evaluate((targetId) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      for (const row of rows) {
        if (row.innerText.includes(targetId)) {
          const issueBtn = Array.from(row.querySelectorAll('button')).find(b => b.innerText.includes('Issue'));
          if (issueBtn) issueBtn.click();
          break;
        }
      }
    }, generatedAppId);

    await new Promise(r => setTimeout(r, 1000));

    // Verify row now displays CERT-XXXX and status Approved
    const updatedRow = await page.evaluate((targetId) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const row = rows.find(r => r.innerText.includes(targetId));
      return row ? row.innerText : '';
    }, generatedAppId);

    console.log(`- Updated row content: "${updatedRow.replace(/\s+/g, ' ')}"`);
    if (!updatedRow.includes('Approved') || !updatedRow.includes('CERT-')) {
      throw new Error('Certificate was not issued or status was not set to Approved');
    }

    const certMatch = updatedRow.match(/CERT-\d+/);
    if (!certMatch) throw new Error('Could not find Certificate ID in row');
    generatedCertId = certMatch[0];
    console.log(`- Minted Certificate ID: ${generatedCertId}`);
    console.log('✔ Test 8 Passed: Certificate issued and application marked Approved.');

    // -------------------------------------------------------------
    // TEST 9: Verify Certificate Public Page (Status: Valid)
    // -------------------------------------------------------------
    console.log(`\n[Test 9] Verifying newly issued certificate ${generatedCertId} on public page...`);
    await page.goto(`${BASE_URL}/verify`, { waitUntil: 'networkidle0' });
    await page.type('#certificateId', generatedCertId);
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 800));

    await page.waitForSelector('[data-testid="certificate-valid-banner"]');
    const verifyHeaderText = await page.$eval('[data-testid="certificate-valid-banner"] h3', el => el.innerText);
    console.log(`- Verification status heading: "${verifyHeaderText}"`);
    if (!verifyHeaderText.includes('VALID')) {
      throw new Error(`Expected certificate to be VALID, but got "${verifyHeaderText}"`);
    }
    console.log('✔ Test 9 Passed: Certificate confirmed as VALID on public verification page.');

    // -------------------------------------------------------------
    // TEST 10: Revoke Certificate in Admin
    // -------------------------------------------------------------
    console.log(`\n[Test 10] Revoking Certificate ${generatedCertId} in Admin Certificates...`);
    await page.goto(`${BASE_URL}/admin/certificates`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    // Find row for generatedCertId and click "Revoke"
    await page.evaluate((targetCert) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      for (const row of rows) {
        if (row.innerText.includes(targetCert)) {
          const revokeBtn = Array.from(row.querySelectorAll('button')).find(b => b.innerText.includes('Revoke'));
          if (revokeBtn) revokeBtn.click();
          break;
        }
      }
    }, generatedCertId);

    await new Promise(r => setTimeout(r, 500));

    // Confirm revocation modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const confirmBtn = btns.find(b => b.innerText.includes('Confirm Revocation'));
      if (confirmBtn) confirmBtn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    // Verify row now shows Revoked
    const certRowAfterRevoke = await page.evaluate((targetCert) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const row = rows.find(r => r.innerText.includes(targetCert));
      return row ? row.innerText : '';
    }, generatedCertId);

    console.log(`- Certificate row after revoke: "${certRowAfterRevoke.replace(/\s+/g, ' ')}"`);
    if (!certRowAfterRevoke.includes('Revoked') && !certRowAfterRevoke.includes('REVOKED')) {
      throw new Error('Certificate status is not Revoked in admin table');
    }
    console.log('✔ Test 10 Passed: Certificate revoked in admin registry.');

    // -------------------------------------------------------------
    // TEST 11: Verify Public Verification Now Shows REVOKED
    // -------------------------------------------------------------
    console.log(`\n[Test 11] Checking public verification for revoked status...`);
    await page.goto(`${BASE_URL}/verify`, { waitUntil: 'networkidle0' });
    await page.type('#certificateId', generatedCertId);
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 800));

    await page.waitForSelector('[data-testid="certificate-revoked-banner"]');
    const verifyRevokedHeader = await page.$eval('[data-testid="certificate-revoked-banner"] h3', el => el.innerText);
    console.log(`- Verification status heading: "${verifyRevokedHeader}"`);
    if (!verifyRevokedHeader.includes('REVOKED')) {
      throw new Error(`Expected certificate to be REVOKED, but got "${verifyRevokedHeader}"`);
    }
    console.log('✔ Test 11 Passed: Public verification immediately reflects REVOKED status.');

    // -------------------------------------------------------------
    // TEST 12: Rejection Test & Prevention of Issuance
    // -------------------------------------------------------------
    console.log(`\n[Test 12] Testing Rejection workflow on sample application APP-0002...`);
    await page.goto(`${BASE_URL}/admin/applications`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    // Find row for APP-0002 and click Reject
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      for (const row of rows) {
        if (row.innerText.includes('APP-0002')) {
          const rejectBtn = Array.from(row.querySelectorAll('button')).find(b => b.innerText.includes('Reject'));
          if (rejectBtn) rejectBtn.click();
          break;
        }
      }
    });

    await new Promise(r => setTimeout(r, 500));

    // Confirm rejection
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const confirmBtn = btns.find(b => b.innerText.includes('Confirm Rejection'));
      if (confirmBtn) confirmBtn.click();
    });

    await new Promise(r => setTimeout(r, 800));

    const rejectedRow = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const row = rows.find(r => r.innerText.includes('APP-0002'));
      return row ? row.innerText : '';
    });

    console.log(`- APP-0002 row: "${rejectedRow.replace(/\s+/g, ' ')}"`);
    if (!rejectedRow.includes('Rejected')) {
      throw new Error('APP-0002 was not updated to Rejected');
    }
    if (!rejectedRow.includes('Cannot Issue')) {
      throw new Error('Rejected row does not lock issuance');
    }
    console.log('✔ Test 12 Passed: Rejection locks issuance and displays Rejected status.');

    // -------------------------------------------------------------
    // TEST 13: LocalStorage Persistence across Page Reloads
    // -------------------------------------------------------------
    console.log(`\n[Test 13] Testing data persistence across page reloads...`);
    await page.reload({ waitUntil: 'networkidle0' });
    const persistedTable = await page.$eval('table', el => el.innerText);
    if (!persistedTable.includes(generatedAppId) || !persistedTable.includes('Approved')) {
      throw new Error('Data failed to persist in localStorage across page reloads');
    }
    console.log('✔ Test 13 Passed: All state changes persisted cleanly in localStorage.');

    // -------------------------------------------------------------
    // TEST 14: Mobile Responsive Viewport
    // -------------------------------------------------------------
    console.log(`\n[Test 14] Testing Mobile Viewport (375x667)...`);
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    const mobileMenuButton = await page.$('button[aria-label="Toggle navigation menu"]');
    if (!mobileMenuButton) throw new Error('Mobile menu button not found on mobile viewport');
    await mobileMenuButton.click();
    await new Promise(r => setTimeout(r, 300));
    const mobileLinks = await page.$$eval('header a', els => els.map(e => e.innerText));
    console.log(`- Mobile menu items:`, mobileLinks);
    console.log('✔ Test 14 Passed: Mobile responsive navigation drawer works properly.');

    console.log('\n=============================================================');
    console.log('🎉 ALL 14 TESTS PASSED FLAWLESSLY WITH 100% SUCCESS!');
    console.log('=============================================================\n');

  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

testSuite();
