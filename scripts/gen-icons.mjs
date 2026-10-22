// Vẽ bộ icon Dương Sinh (nền navy, ô cờ trắng, vương miện vàng) từ SVG rồi xuất PNG.
// Chạy: node scripts/gen-icons.mjs   (cần Chromium của Playwright; đặt CHROMIUM_PATH nếu cần)
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const NAVY = '#2B3990';
const NAVY_DARK = '#1B2466';
const GOLD = '#FBB040';

// Hình logo gốc nằm trong hộp (8,7)–(40,40) của lưới 48 — giống LogoMark trong packages/ui.
const mark = (white = '#FFFFFF') => `
  <rect x="8" y="24" width="8" height="8" fill="${white}" opacity="0.92"/>
  <rect x="24" y="24" width="8" height="8" fill="${white}" opacity="0.92"/>
  <rect x="16" y="32" width="8" height="8" fill="${white}" opacity="0.92"/>
  <rect x="32" y="32" width="8" height="8" fill="${white}" opacity="0.92"/>
  <path d="M10 20 L14 9 L20 15 L24 7 L28 15 L34 9 L38 20 Z" fill="${GOLD}" stroke="${GOLD}" stroke-width="0.8" stroke-linejoin="round"/>`;

/** Ô cờ mờ trên cùng lưới 8 đơn vị với logo, để nền và ô trắng của logo thẳng hàng. */
const checker = (opacity) => {
  let out = '';
  for (let r = -6; r < 12; r++)
    for (let c = -6; c < 12; c++)
      if ((r + c) % 2 !== 0) out += `<rect x="${c * 8}" y="${r * 8}" width="8" height="8"/>`;
  return `<g fill="#FFFFFF" opacity="${opacity}">${out}</g>`;
};

/** Đặt logo vào giữa khung `size`, rộng `ratio` phần khung (kèm nền ô cờ nếu cần). */
const placed = (size, ratio, { pattern = false, white } = {}) => {
  const s = (size * ratio) / 32;
  return `<g transform="translate(${size / 2} ${size / 2}) scale(${s}) translate(-24 -23.5)">${pattern ? checker(0.06) : ''}${mark(white)}</g>`;
};

const background = (size, rx = 0, inset = 0) => {
  const w = size - inset * 2;
  return `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${NAVY}"/><stop offset="1" stop-color="${NAVY_DARK}"/>
    </linearGradient>
    <clipPath id="clip"><rect x="${inset}" y="${inset}" width="${w}" height="${w}" rx="${rx}"/></clipPath>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)" clip-path="url(#clip)"/>`;
};

/** Nền + logo cắt theo khung bo góc của nền. */
const framed = (bg, inner) => `${bg}<g clip-path="url(#clip)">${inner}</g>`;

const svg = (size, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`;

const ICONS = [
  // iOS/Android/web: vuông đủ, hệ điều hành tự bo góc.
  {
    file: 'apps/app/assets/images/icon.png',
    size: 1024,
    body: framed(background(1024), placed(1024, 0.6, { pattern: true })),
  },
  // Android adaptive: nền trong suốt, logo nằm trong vùng an toàn 66%.
  {
    file: 'apps/app/assets/images/adaptive-icon.png',
    size: 1024,
    transparent: true,
    body: placed(1024, 0.42),
  },
  // Màn hình chờ: nền navy do app.json đặt, ảnh trong suốt.
  {
    file: 'apps/app/assets/images/splash-icon.png',
    size: 512,
    transparent: true,
    body: placed(512, 0.8),
  },
  {
    file: 'apps/app/assets/images/favicon.png',
    size: 64,
    body: framed(background(64, 12), placed(64, 0.72)),
  },
  // Desktop: kiểu macOS — bo góc, chừa lề, rồi `tauri icon` sinh .ico/.icns/png.
  {
    file: 'apps/desktop/app-icon.png',
    size: 1024,
    transparent: true,
    body: framed(background(1024, 185, 100), placed(1024, 0.5, { pattern: true })),
  },
];

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage();
for (const icon of ICONS) {
  await page.setViewportSize({ width: icon.size, height: icon.size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${svg(icon.size, icon.body)}</body></html>`,
  );
  const out = join(root, icon.file);
  mkdirSync(dirname(out), { recursive: true });
  await page.locator('svg').screenshot({ path: out, omitBackground: !!icon.transparent });
  console.log('✓', icon.file);
}
await browser.close();
