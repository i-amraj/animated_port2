import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 400,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  const apiLog = [];

  page.on('request', (req) => {
    if (['xhr', 'fetch'].includes(req.resourceType())) {
      apiLog.push({ method: req.method(), url: req.url(), postData: req.postData() || null });
      if (req.url().includes('cosmofeed') || req.url().includes('superprofile')) {
        console.log(`\n➡️  [${req.method()}] ${req.url()}`);
        if (req.postData()) {
          try { console.log('   📦', JSON.stringify(JSON.parse(req.postData()), null, 2).slice(0, 800)); }
          catch { console.log('   📦', req.postData().slice(0, 400)); }
        }
      }
    }
  });

  page.on('response', async (res) => {
    if (['xhr', 'fetch'].includes(res.request().resourceType())) {
      const url = res.url();
      if (url.includes('cosmofeed') || url.includes('superprofile')) {
        let body = '';
        try { body = await res.text(); } catch (_) {}
        console.log(`\n✅ [${res.status()}] ${url}`);
        try { console.log('   📨', JSON.stringify(JSON.parse(body), null, 2).slice(0, 1200)); }
        catch { if (body) console.log('   📨', body.slice(0, 500)); }
      }
    }
  });

  // ── Login ──────────────────────────────────────────────────────────────────
  console.log('\n🌐 Login karein...\n');
  await page.goto('https://superprofile.bio/signin', { waitUntil: 'networkidle', timeout: 30000 });

  await page.waitForURL((url) => {
    const s = url.toString();
    return !s.includes('/signin') && !s.includes('/signup');
  }, { timeout: 180000 });

  console.log('\n✅ Logged in:', page.url());
  await page.waitForTimeout(2000);

  // ── Step 1: Go to Auto DM list ─────────────────────────────────────────────
  await page.goto('https://superprofile.bio/creator/auto-dm', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  console.log('\n📍 Auto DM Page loaded');

  // ── Step 2: Click on existing Auto DM to see its full detail ──────────────
  console.log('\n🔍 Existing Auto DM pe click karna...');
  const autoDmCards = await page.$$('[class*="card"], [class*="item"], [class*="row"], [class*="automation"]');
  console.log(`Found ${autoDmCards.length} possible card elements`);

  if (autoDmCards.length > 0) {
    try {
      await autoDmCards[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'autodm-detail.png' });
      console.log('📸 autodm-detail.png');
    } catch(e) { console.log('Click failed:', e.message); }
  }

  // ── Step 3: Try to navigate to get single auto DM detail ──────────────────
  // Get the auto DM ID from the list
  const listData = apiLog.find(r => r.url.includes('list_auto_dms'));
  console.log('\n📋 Auto DM list API found:', listData?.url);

  // ── Step 4: Click "Create Automation" and go through full flow ────────────
  await page.goto('https://superprofile.bio/creator/auto-dm', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);

  console.log('\n🖱️  Clicking "Create Automation"...');
  try {
    await page.getByText('Create Automation', { exact: false }).first().click();
    await page.waitForTimeout(3000);
    console.log('URL after click:', page.url());
    await page.screenshot({ path: 'create-flow-1.png' });
    console.log('📸 create-flow-1.png');

    // Print all elements on create page
    const createPageElements = await page.evaluate(() =>
      [...document.querySelectorAll('input, select, textarea, button, [role="button"], label')]
        .map(el => ({
          tag: el.tagName,
          type: el.type || '',
          placeholder: el.placeholder || '',
          text: el.innerText?.trim().slice(0, 50) || '',
          name: el.name || el.id || ''
        }))
        .filter(el => el.text || el.placeholder || el.name)
    );
    console.log('\n=== CREATE AUTOMATION FORM FIELDS ===');
    createPageElements.forEach(e =>
      console.log(`  <${e.tag} type="${e.type}" name="${e.name}" placeholder="${e.placeholder}"> ${e.text}`)
    );
  } catch(e) {
    console.log('Create click failed:', e.message);
  }

  // ── Step 5: 4-minute manual monitoring ────────────────────────────────────
  console.log('\n\n⏺️  MANUAL MONITORING MODE — 4 minutes');
  console.log('👉 Ab browser mein:');
  console.log('   1. Koi Reel ya Post select karein');
  console.log('   2. Trigger keyword type karein (e.g. "DM", "LINK")');
  console.log('   3. Auto reply message likhein');
  console.log('   4. Save/Launch button click karein');
  console.log('   Script saari API calls capture kar rahi hai...\n');

  await page.waitForTimeout(240000);

  // ── Save & summarize ──────────────────────────────────────────────────────
  const cosmoOnly = apiLog.filter(r => r.url.includes('cosmofeed') || r.url.includes('superprofile'));
  fs.writeFileSync('superprofile-api-log.json', JSON.stringify(cosmoOnly, null, 2));

  const unique = [...new Set(cosmoOnly.map(r => `[${r.method}] ${r.url.split('?')[0]}`))];
  console.log('\n=== ALL UNIQUE COSMO/SUPERPROFILE ENDPOINTS ===');
  unique.forEach(u => console.log(' ', u));

  await page.screenshot({ path: 'superprofile-final.png' });
  await browser.close();
  console.log('\n✅ Done! Log: superprofile-api-log.json');
})();
