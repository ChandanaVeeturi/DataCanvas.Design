import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';

const OUT = 'C:/Users/lenovo/desktop/DataCanvas.Design/screenshots';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const PAGES = [
  { name: 'homepage', url: 'http://localhost:3000' },
  { name: 'charts', url: 'http://localhost:3000/charts' },
  { name: 'chart-detail-bar', url: 'http://localhost:3000/charts/comparison/bar-chart' },
  { name: 'chart-detail-pie', url: 'http://localhost:3000/charts/composition/pie-chart' },
  { name: 'wizard', url: 'http://localhost:3000/wizard' },
  { name: 'playground', url: 'http://localhost:3000/playground' },
  { name: 'datasets', url: 'http://localhost:3000/datasets' },
  { name: 'dashboards', url: 'http://localhost:3000/dashboards' },
];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

for (const p of PAGES) {
  try {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
    console.log(`✅ ${p.name}: ${p.url}`);
  } catch (e) {
    console.log(`❌ ${p.name}: ${e.message.slice(0, 80)}`);
  }
}

await browser.close();
console.log('Done. Screenshots saved to:', OUT);
