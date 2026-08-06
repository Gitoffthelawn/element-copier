/**
 * Generate localized Chrome Web Store screenshots for Element Copier.
 *
 * Produces docs/publication/screenshots/{LANG}-1.png (light) and
 * docs/publication/screenshots/{LANG}-2.png (dark). Each 1280×800 image
 * places the Settings and Copied panels side by side.
 */

import { chromium } from 'playwright';
import { createCanvas, loadImage } from 'canvas';
import { createServer } from 'http';
import { createReadStream, statSync } from 'fs';
import { extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PROJECT_DIR = resolve(__dirname, '..');
const OUT_DIR = resolve(PROJECT_DIR, 'docs/publication/screenshots');
const PORT = 14322;
const W = 1280;
const H = 800;
const LANGUAGES = [
  ['EN', 'en'], ['DE', 'de'], ['ES', 'es'], ['FR', 'fr'],
  ['RU', 'ru'], ['ZH', 'zh_CN'], ['AR', 'ar'],
];
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

function startStaticServer(root, port) {
  return new Promise((resolveServer, reject) => {
    const server = createServer((req, res) => {
      const urlPath = new URL(req.url, 'http://127.0.0.1').pathname;
      for (const candidate of [urlPath, `${urlPath}.js`, `${urlPath}.html`]) {
        const filePath = join(root, candidate);
        try {
          if (!statSync(filePath).isFile()) continue;
          res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
          createReadStream(filePath).pipe(res);
          return;
        } catch {}
      }
      res.writeHead(404).end('Not found');
    });
    server.listen(port, '127.0.0.1', () => resolveServer(server));
    server.on('error', reject);
  });
}

async function panelScreenshot(browser, locale, tab, dark) {
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  try {
    await page.setViewportSize({ width: 540, height: 900 });
    const query = new URLSearchParams({ locale, tab, dark: dark ? '1' : '0' });
    await page.goto(`http://127.0.0.1:${PORT}/scripts/popup-screenshot.html?${query}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
    const box = await page.locator('#element-copier-root').boundingBox();
    if (!box) throw new Error(`Panel did not render for ${locale}/${tab}/${dark ? 'dark' : 'light'}`);
    return await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
  } catch (error) {
    const details = pageErrors.length ? ` Page errors: ${pageErrors.join(' | ')}` : '';
    throw new Error(`Failed to render ${locale}/${tab}/${dark ? 'dark' : 'light'}.${details}`, { cause: error });
  } finally {
    await context.close();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
}

function drawRounded(ctx, image, x, y, w, h) {
  ctx.save(); roundRect(ctx, x, y, w, h, 12); ctx.clip();
  ctx.drawImage(image, x, y, w, h); ctx.restore();
}

async function compose(settingsBuffer, copiedBuffer, outputPath, dark) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, dark ? '#111827' : '#dde1f0');
  gradient.addColorStop(1, dark ? '#0a0e1e' : '#c8cfe8');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = dark ? '#1a2035' : '#f0f1f5'; ctx.fillRect(0, 0, W, 40);
  ctx.strokeStyle = dark ? '#2a3450' : '#d0d3e0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(W, 40); ctx.stroke();
  ctx.fillStyle = dark ? '#252f4a' : '#ffffff';
  ctx.strokeStyle = dark ? '#3a4560' : '#d0d3e0';
  roundRect(ctx, 420, 8, 440, 24, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#7080a0'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('chrome-extension://…/popup.html', W / 2, 20);

  const [settings, copied] = await Promise.all([loadImage(settingsBuffer), loadImage(copiedBuffer)]);
  const gap = 40;
  const availableW = W - 2 * 48 - gap;
  const availableH = H - 40 - 2 * 28;
  const scale = Math.min(availableW / (settings.width + copied.width), availableH / Math.max(settings.height, copied.height));
  const settingsW = Math.round(settings.width * scale), settingsH = Math.round(settings.height * scale);
  const copiedW = Math.round(copied.width * scale), copiedH = Math.round(copied.height * scale);
  const startX = Math.round((W - settingsW - gap - copiedW) / 2);
  const startY = 40 + Math.round((H - 40 - Math.max(settingsH, copiedH)) / 2);
  ctx.save();
  ctx.shadowColor = dark ? 'rgba(160,185,255,0.42)' : 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = dark ? 36 : 24; ctx.shadowOffsetY = dark ? 0 : 6;
  ctx.fillStyle = 'rgba(0,0,0,0.01)';
  roundRect(ctx, startX, startY, settingsW, settingsH, 12); ctx.fill();
  roundRect(ctx, startX + settingsW + gap, startY, copiedW, copiedH, 12); ctx.fill();
  ctx.restore();
  drawRounded(ctx, settings, startX, startY, settingsW, settingsH);
  drawRounded(ctx, copied, startX + settingsW + gap, startY, copiedW, copiedH);
  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
  console.log(`Saved ${outputPath}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = await startStaticServer(PROJECT_DIR, PORT);
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [code, locale] of LANGUAGES) {
      for (const [number, dark] of [['1', false], ['2', true]]) {
        const [settings, copied] = await Promise.all([
          panelScreenshot(browser, locale, 'settings', dark),
          panelScreenshot(browser, locale, 'copied', dark),
        ]);
        await compose(settings, copied, resolve(OUT_DIR, `${code}-${number}.png`), dark);
      }
    }
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
