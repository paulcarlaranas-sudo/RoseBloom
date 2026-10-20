import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, drawPixel) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data with filter byte (0) per scanline
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData.writeUInt8(0, rowOffset); // filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData.writeUInt8(r, pixelOffset);
      rawData.writeUInt8(g, pixelOffset + 1);
      rawData.writeUInt8(b, pixelOffset + 2);
      rawData.writeUInt8(a, pixelOffset + 3);
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  typeBuf.copy(buf, 4);
  data.copy(buf, 8);

  const crc = crc32(Buffer.concat([typeBuf, data]));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

// Rose drawing algorithm for PWA app icon
function roseShader(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: elegant soft rose-cream gradient
  let bgR = 250, bgG = 244, bgB = 246, bgA = 255;
  if (isMaskable) {
    // Fill full bleed
    bgR = 253; bgG = 242; bgB = 244;
  } else if (dist > 0.95) {
    return [0, 0, 0, 0]; // Rounded squircle transparent corner
  }

  // Draw circular rose emblem badge in center (safe zone)
  const scale = isMaskable ? 0.68 : 0.82;
  const ndx = dx / scale;
  const ndy = dy / scale;
  const ndist = Math.sqrt(ndx * ndx + ndy * ndy);

  if (ndist <= 1.0) {
    // Inner badge gradient
    const t = ndist;
    const badgeR = Math.round(255 - t * 20);
    const badgeG = Math.round(230 - t * 30);
    const badgeB = Math.round(238 - t * 25);

    // Rose petals simulation via polar equations
    const angle = Math.atan2(ndy, ndx);
    const petals = Math.sin(5 * angle + ndist * 4);
    const core = Math.exp(-ndist * 4);

    if (ndist < 0.65) {
      // Rose petal colors (ruby to blush pink)
      const pR = Math.round(225 + 30 * core - 40 * petals);
      const pG = Math.round(75 + 110 * (1 - core) + 20 * petals);
      const pB = Math.round(110 + 90 * (1 - core));
      return [Math.min(255, Math.max(0, pR)), Math.min(255, Math.max(0, pG)), Math.min(255, Math.max(0, pB)), 255];
    }

    if (ndist < 0.85 && ndy > 0.2 && Math.abs(ndx) < 0.6) {
      // Emerald rose leaf accent
      return [110, 165, 125, 255];
    }

    return [badgeR, badgeG, badgeB, 255];
  }

  return [bgR, bgG, bgB, bgA];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
const pwa192 = createPNG(192, 192, (x, y, w, h) => roseShader(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// Generate 512x512
const pwa512 = createPNG(512, 512, (x, y, w, h) => roseShader(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// Generate maskable 512x512 with safe margin
const pwaMaskable = createPNG(512, 512, (x, y, w, h) => roseShader(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

// Generate apple-touch-icon 180x180
const appleTouch = createPNG(180, 180, (x, y, w, h) => roseShader(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

console.log('PWA icons generated successfully in public/');
