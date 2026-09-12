import { deflateSync, crc32 } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..', 'public');

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(size, px) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (d) => clamp(0.5 - d, 0, 1);

function segDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / len2;
  t = clamp(t);
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function roundRectSdf(cx, cy, half, r) {
  const dx = Math.abs(cx) - (half - r);
  const dy = Math.abs(cy) - (half - r);
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
}

function render(size, { maskable = false } = {}) {
  const px = Buffer.alloc(size * size * 4);
  const s = size;
  const bg = [11, 28, 48, 255];
  const lastR = maskable ? s - 1 : s - 1;
  const cornerR = maskable ? 0 : s * 0.22;
  const half = maskable ? s / 2 : (s / 2) - 1;

  // M strokes (normalized 0..1)
  const mk = maskable ? 0.20 : 0.24;   // mark inset (safe zone for maskable)
  const strokeW = 0.072;
  const segs = [
    [0.20 + mk, 0.80 - mk, 0.42, mk + 0.12],
    [0.44, mk + 0.12, 0.56, 0.80 - mk],
    [0.58, mk + 0.12, 0.80 - mk, 0.80 - mk],
  ].map(([x1, y1, x2, y2]) => [x1 * s, y1 * s, x2 * s, y2 * s]);

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const i = (y * s + x) * 4;
      const r = clamp(roundRectSdf(x - s / 2 + 0.5, y - s / 2 + 0.5, half, cornerR));
      px[i] = bg[0]; px[i + 1] = bg[1]; px[i + 2] = bg[2]; px[i + 3] = Math.round(255 * r);

      // mark
      let mark = 0;
      for (const [x1, y1, x2, y2] of segs) {
        const d = segDist(x, y, x1, y1, x2, y2) - strokeW * s * 0.5;
        mark = Math.max(mark, smooth(d));
      }
      const c = [56, 189, 248, 255];
      if (mark > 0) {
        const a = mark * (px[i + 3] / 255);
        px[i] = Math.round(c[0] * a + bg[0] * (1 - a));
        px[i + 1] = Math.round(c[1] * a + bg[1] * (1 - a));
        px[i + 2] = Math.round(c[2] * a + bg[2] * (1 - a));
        px[i + 3] = 255;
      }
      void lastR;
    }
  }
  return encodePng(s, px);
}

mkdirSync(ROOT, { recursive: true });
const out = {
  'icon-192.png': render(192),
  'icon-512.png': render(512),
  'icon-maskable-512.png': render(512, { maskable: true }),
  'icon-180.png': render(180),
};
for (const [name, buf] of Object.entries(out)) {
  writeFileSync(join(ROOT, name), buf);
  console.log('wrote', name, buf.length, 'bytes');
}