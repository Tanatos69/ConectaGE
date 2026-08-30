// One-off codegen: derives the PWA icon set from the brand emblem in
// src/app/icon.png (a full lockup with the wordmark + tagline text baked in
// below the graphic mark — too small to read at icon size, so this crops that
// text off before generating anything). Re-run manually
// (`node scripts/generate-pwa-icons.mjs`) only if the source logo changes.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(__dirname, "../src/app/icon.png");
const OUT_DIR = path.join(__dirname, "../public");
const BRAND_BLUE = { r: 0x25, g: 0x63, b: 0xeb, alpha: 1 };

async function loadEmblem() {
  const meta = await sharp(SOURCE).metadata();
  // The wordmark + tagline live below the emblem, separated by a ~10px
  // blank gap that starts at 72.6% of the image height (measured via a
  // per-row content scan) — cut there so trim() below only ever sees the
  // graphic mark, not the text. Two separate sharp() calls (not chained) —
  // chaining extract().trim() directly in one pipeline throws "bad extract
  // area" in sharp 0.35.
  const cropHeight = Math.round(meta.height * 0.726);
  const cropped = await sharp(SOURCE)
    .extract({ left: 0, top: 0, width: meta.width, height: cropHeight })
    .png()
    .toBuffer();
  const trimmed = await sharp(cropped).trim({ threshold: 10 }).toBuffer();
  return trimmed;
}

/** Emblem resized to fill `coverage` of a transparent `size`x`size` canvas. */
async function emblemOnCanvas(emblemBuffer, size, coverage, background) {
  const targetEdge = Math.round(size * coverage);
  const scaled = await sharp(emblemBuffer)
    .resize(targetEdge, targetEdge, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: scaled, gravity: "center" }])
    .png()
    .toBuffer();
}

async function main() {
  const emblemBuffer = await loadEmblem();
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

  // "any" purpose — emblem fills almost the whole canvas, transparent bg.
  for (const size of [192, 512]) {
    const buf = await emblemOnCanvas(emblemBuffer, size, 0.92, transparent);
    await sharp(buf).toFile(path.join(OUT_DIR, `icon-${size}.png`));
  }

  // "maskable" purpose — emblem confined to the ~80% safe zone, opaque
  // brand-blue bg so OS shape-masking (circle/squircle/etc.) never clips
  // content or leaves a transparent hole.
  for (const size of [192, 512]) {
    const buf = await emblemOnCanvas(emblemBuffer, size, 0.62, BRAND_BLUE);
    await sharp(buf).toFile(path.join(OUT_DIR, `icon-maskable-${size}.png`));
  }

  // apple-touch-icon — iOS ignores alpha and can render it black, so flatten
  // onto brand-blue explicitly rather than leaving transparency.
  const appleBuf = await emblemOnCanvas(emblemBuffer, 180, 0.78, BRAND_BLUE);
  await sharp(appleBuf).flatten({ background: BRAND_BLUE }).toFile(path.join(OUT_DIR, "apple-touch-icon.png"));

  console.log("Generated icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png, apple-touch-icon.png in public/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
