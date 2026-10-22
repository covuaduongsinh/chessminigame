import { expect, type Page, test } from '@playwright/test';

async function square(page: Page, sq: string) {
  const box = (await page.getByTestId('board').filter({ visible: true }).first().boundingBox())!;
  const cell = box.width / 8;
  const f = sq.charCodeAt(0) - 97;
  const r = Number(sq[1]) - 1;
  return { x: box.x + f * cell + cell / 2, y: box.y + (7 - r) * cell + cell / 2 };
}
async function tap(page: Page, sq: string) {
  const p = await square(page, sq);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(120);
}
async function move(page: Page, from: string, to: string) {
  await tap(page, from);
  await tap(page, to);
  await page.waitForTimeout(250);
}
async function drag(page: Page, from: string, to: string) {
  const a = await square(page, from);
  const b = await square(page, to);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 5 });
  await page.mouse.move(b.x, b.y, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(300);
}

test('trang chủ tiếng Việt với lộ trình 6 cấp', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('screen-learn')).toContainText('Chào');
  for (const l of ['tot', 'ma', 'tuong', 'xe', 'hau', 'vua'])
    await expect(page.getByTestId(`level-${l}`)).toBeVisible();
});

test('chơi và thắng "Tốt ăn sao", tiến độ còn sau khi tải lại', async ({ page }) => {
  await page.goto('/minigame/tot-3');
  await page.getByText('Bắt đầu').click();
  await move(page, 'd2', 'd4');
  await move(page, 'd4', 'd5');
  await move(page, 'd5', 'd6');
  await move(page, 'd6', 'd7');
  await page.getByTestId('next-round').click();
  await drag(page, 'c2', 'd3');
  await drag(page, 'd3', 'e4');
  await drag(page, 'e4', 'f5');
  await expect(page.getByTestId('result-modal')).toBeVisible();
  await page.goto('/');
  await expect(page.getByTestId('game-tot-3').getByLabel('3/3 sao')).toBeVisible();
});

test('đi sai được giải thích', async ({ page }) => {
  await page.goto('/minigame/ma-1');
  await page.getByText('Bắt đầu').click();
  await move(page, 'b1', 'b3');
  await expect(page.getByTestId('banner')).toContainText('chữ L');
});

test('câu hỏi tìm ô', async ({ page }) => {
  await page.goto('/minigame/tot-1');
  await page.getByText('Bắt đầu').click();
  for (let i = 0; i < 8; i++) {
    const m = /ô ([a-h][1-8])/.exec((await page.getByTestId('prompt').textContent()) ?? '');
    if (!m) break;
    await tap(page, m[1]!);
  }
  await expect(page.getByTestId('result-modal')).toBeVisible();
});

test('chơi với máy: máy trả lời nước đi', async ({ page }) => {
  await page.goto('/choi');
  await move(page, 'e2', 'e4');
  await expect(page.getByText(/^1\.$/)).toBeVisible();
  await expect(page.getByText('Đến lượt em')).toBeVisible({ timeout: 5000 });
});

test('bàn phân tích: nhập PGN', async ({ page }) => {
  await page.goto('/phan-tich');
  await page.getByTestId('pgn-input').fill('1. e4 e5 2. Nf3 Nc6 3. Bc4 *');
  await page.getByTestId('load-pgn').click();
  await expect(page.getByTestId('analysis-message')).toContainText('5 ply');
});

test('HLV tạo mini-game ăn sao rồi chơi thử', async ({ page }) => {
  await page.goto('/phan-tich');
  await page.getByTestId('toggle-editor').click();
  await page.getByText('Bàn trống').click();
  await page.getByTestId('brush-wr').click();
  await tap(page, 'a1');
  await page.getByTestId('brush-star').click();
  await tap(page, 'a8');
  await tap(page, 'h8');
  await page.getByTestId('custom-title').fill('Xe của thầy');
  await page.getByTestId('custom-save').click();
  await expect(page.getByTestId('custom-result')).toContainText('2 nước');
  await page.getByTestId('custom-play').click();
  await page.getByText('Bắt đầu').click();
  await move(page, 'a1', 'a8');
  await move(page, 'a8', 'h8');
  await expect(page.getByTestId('result-modal')).toBeVisible();
});

test('lớp học: trình diễn lời giải bằng phím →', async ({ page }) => {
  await page.goto('/lop-hoc/ma-1');
  await page.waitForTimeout(500);
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(450);
  }
  await expect(page.getByTestId('result-modal')).toBeVisible();
});
