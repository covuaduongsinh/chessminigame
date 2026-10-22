// Tạo âm thanh hiệu ứng (tổng hợp bằng toán học, không dùng file của bên thứ ba).
// Chạy: node scripts/gen-sounds.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RATE = 22050;
const OUT = new URL('../apps/app/assets/sounds/', import.meta.url).pathname;

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.max(-1, Math.min(1, s)) * 32767, i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

/** Nốt có bao hình ADSR đơn giản, trộn họa âm để nghe "gỗ" hơn. */
function tone(freq, dur, { vol = 0.5, decay = 8, harmonics = [1, 0.4, 0.15], noise = 0 } = {}) {
  const n = Math.floor(RATE * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const env = Math.min(1, t * 400) * Math.exp(-decay * t);
    let s = 0;
    harmonics.forEach((a, k) => {
      s += a * Math.sin(2 * Math.PI * freq * (k + 1) * t);
    });
    s += noise * (Math.random() * 2 - 1) * Math.exp(-60 * t);
    out[i] = s * env * vol;
  }
  return out;
}

function concat(...parts) {
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Float32Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

const silence = (d) => new Float32Array(Math.floor(RATE * d));

const sounds = {
  // tiếng "cộc" của quân gỗ đặt xuống bàn
  move: tone(220, 0.12, { vol: 0.6, decay: 45, harmonics: [1, 0.6, 0.3, 0.1], noise: 0.5 }),
  capture: concat(
    tone(180, 0.08, { vol: 0.6, decay: 50, harmonics: [1, 0.7, 0.3], noise: 0.6 }),
    tone(260, 0.12, { vol: 0.5, decay: 40, harmonics: [1, 0.5, 0.2], noise: 0.4 }),
  ),
  star: concat(tone(988, 0.09, { vol: 0.35, decay: 18 }), tone(1319, 0.18, { vol: 0.35, decay: 14 })),
  wrong: concat(tone(330, 0.12, { vol: 0.35, decay: 12 }), tone(262, 0.22, { vol: 0.35, decay: 10 })),
  // hợp âm Đô trưởng đi lên — chúc mừng chiến thắng
  win: concat(
    tone(523, 0.14, { vol: 0.35, decay: 9 }),
    tone(659, 0.14, { vol: 0.35, decay: 9 }),
    tone(784, 0.14, { vol: 0.35, decay: 9 }),
    tone(1047, 0.45, { vol: 0.4, decay: 4 }),
    silence(0.05),
  ),
  check: tone(660, 0.16, { vol: 0.3, decay: 14, harmonics: [1, 0.2] }),
};

for (const [name, samples] of Object.entries(sounds)) {
  writeFileSync(join(OUT, `${name}.wav`), wav(samples));
  console.log(`${name}.wav`, samples.length, 'mẫu');
}
