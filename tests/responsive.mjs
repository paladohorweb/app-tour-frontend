import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const root = path.resolve("dist/turismo-demo-v2/browser");
const server = http.createServer((req, res) => {
  let file = path.resolve(
    root,
    "." + decodeURIComponent(req.url.split("?")[0]),
  );
  if (
    !file.startsWith(root + path.sep) ||
    !fs.existsSync(file) ||
    fs.statSync(file).isDirectory()
  )
    file = path.join(root, "index.html");
  const ext = path.extname(file);
  res.setHeader(
    "Content-Type",
    {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".ico": "image/x-icon",
      ".mp4": "video/mp4",
      ".webp": "image/webp",
    }[ext] || "application/octet-stream",
  );
  res.end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port;
let launch = { headless: true };
if (process.env.CHROMIUM_MODULE) {
  const mod = (await import(process.env.CHROMIUM_MODULE)).default;
  launch = {
    ...launch,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-zygote",
    ],
    executablePath: await mod.executablePath(),
  };
}
const browser = await chromium.launch(launch);
const page = await browser.newPage();
// Exercise layout independently of external image/tile availability.
if (!process.env.ALLOW_EXTERNAL) await page.route('https://**/*', route => route.abort());
const errors = [];
page.on('pageerror', e => errors.push(e.message));
try {
 for (const width of [320, 360, 390, 600, 768, 1024, 1440]) {
  await page.setViewportSize({width, height:844});
  for (const route of ['/', '/tours', '/mapa']) {
   await page.goto(base + route);
   await page.locator(route === '/' ? '.experience-card' : route === '/tours' ? '.v2-card' : '.map-item').first().waitFor();
   await check(width, route);
   if (route === '/' && width === 1024) {
    assert.equal(await page.locator('.experience-card').count(), 11);
    assert.equal(await page.locator('.experience-card img[src^="http"]').count(), 0);
    const previewCard = page.locator('.experience-card:has(video)').first();
    await previewCard.hover();
    await page.waitForFunction(() => !document.querySelector('.experience-card:hover video')?.paused);
   }
   if (route === '/mapa') {
    await page.locator('.map-item').first().click();
    await page.locator('.map-selected').waitFor();
    await check(width, 'selected map plan');
   }
   if (route === '/tours') {
    await page.locator('.v2-card').first().click();
    await page.locator('#reserva').waitFor();
    await check(width, 'detail');
    await page.locator('.v2-back').click();
    await page.waitForURL('**/tours');
   }
  }
  if (width < 992) {
   await page.getByRole('button', {name:'Abrir navegación',exact:true}).click();
   await page.locator('#main-navigation.show').waitFor();
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#main-navigation.show').count(),0);
  }
 }
 assert.deepEqual(errors, []);
 console.log('Responsive routes, cards, back link and navigation passed at 7 widths.');
} finally { await browser.close(); server.close(); }
async function check(width, route) {
 if ([390,1440].includes(width) && process.env.SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR, (route === '/' ? 'home' : route.replaceAll('/', '')) + '-' + width + '.png'),fullPage:true});
 const overflow = await page.evaluate(() => ({page:document.documentElement.scrollWidth, viewport:innerWidth,
  cards:[...document.querySelectorAll('.experience-card,.v2-card,#reserva')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right};})}));
 assert(overflow.page<=width+1, `${route} overflows at ${width}: ${JSON.stringify(overflow)}`);
 assert(overflow.cards.every(r=>r.right-r.left<=width+1), `${route} card wider than viewport at ${width}`);
}
