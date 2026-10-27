import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:4173';

async function run() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();

  // Helper to take screenshot
  const shoot = async (filename) => {
    const fullPath = path.join(__dirname, 'screenshots', filename);
    await page.screenshot({ path: fullPath, fullPage: false });
    console.log(`Captured: ${filename}`);
  };

  try {
    // 1. Home
    console.log('Capturing Home...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shoot('home.png');

    // 2. Request Certificate
    console.log('Capturing Request Certificate...');
    await page.goto(`${BASE_URL}/request`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shoot('request.png');

    // 3. Track Application
    console.log('Capturing Track Application...');
    await page.goto(`${BASE_URL}/track`, { waitUntil: 'networkidle0' });
    // Type APP-0001 into input and track
    await page.waitForSelector('#applicationId');
    await page.type('#applicationId', 'APP-0001');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 800));
    await shoot('track.png');

    // 4. Verify Certificate
    console.log('Capturing Verify Certificate...');
    await page.goto(`${BASE_URL}/verify`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#certificateId');
    await page.type('#certificateId', 'CERT-0001');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 800));
    await shoot('verify.png');

    // 5. Admin Login
    console.log('Capturing Admin Login...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shoot('admin-login.png');

    // Perform login
    await page.type('#username', 'admin');
    await page.type('#password', 'admin');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1000));

    // 6. Admin Applications
    console.log('Capturing Admin Applications...');
    await page.goto(`${BASE_URL}/admin/applications`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    await shoot('admin-applications.png');

    // 7. Admin Certificates
    console.log('Capturing Admin Certificates...');
    await page.goto(`${BASE_URL}/admin/certificates`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    await shoot('admin-certificates.png');

    console.log('All 7 screenshots captured successfully!');
  } catch (err) {
    console.error('Screenshot error:', err);
  } finally {
    await browser.close();
  }
}

run();
