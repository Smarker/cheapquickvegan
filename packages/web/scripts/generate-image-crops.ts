/**
 * Image pipeline for recipe rich results and source compression.
 *
 * Phase 1 — compress: any JPEG in the public image directories that is wider
 * than MAX_SOURCE_WIDTH or visibly under-compressed (high bytes-per-pixel) is
 * resized/re-encoded in place. This replaces manually compressing photos
 * before adding them to the repo: drop the camera export in, run this script.
 *
 * Phase 2 — crops: for every local recipe cover image referenced in
 * recipes-cache.json, generate the 1:1 / 4:3 / 16:9 variants Google recommends
 * for Recipe rich results (https://developers.google.com/search/docs/appearance/structured-data/recipe).
 * Crops are written next to the source as foo-1x1.jpg etc. and are
 * gitignored — they are regenerated at build time.
 *
 * Idempotent: already-compressed sources fall under the bytes-per-pixel
 * threshold and are skipped; crops are skipped when newer than their source.
 *
 * Usage: pnpm images:crops
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGE_DIRS = ["images", "recipes/images", "guides/images"];

const MAX_SOURCE_WIDTH = 2000;
const JPEG_QUALITY = 80;
// A quality-80 JPEG photo lands around 0.15-0.25 bytes/pixel; anything above
// this is an uncompressed camera export. Re-encoded files fall below it,
// which is what makes the compression phase idempotent.
const MAX_BYTES_PER_PIXEL = 0.35;

const CROP_SUFFIX_RE = /-(1x1|4x3|16x9)\.(jpe?g|png|webp)$/i;
const CROP_VARIANTS = [
  { suffix: "1x1", width: 1200, height: 1200 },
  { suffix: "4x3", width: 1200, height: 900 },
  { suffix: "16x9", width: 1200, height: 675 },
] as const;

function formatKB(bytes: number): string {
  return `${Math.round(bytes / 1024)}KB`;
}

async function compressSources(): Promise<void> {
  let compressed = 0;
  let skipped = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  for (const dir of IMAGE_DIRS) {
    const absDir = path.join(PUBLIC_DIR, dir);
    if (!fs.existsSync(absDir)) continue;

    for (const file of fs.readdirSync(absDir)) {
      if (!/\.jpe?g$/i.test(file) || CROP_SUFFIX_RE.test(file)) continue;

      const absFile = path.join(absDir, file);
      const { size } = fs.statSync(absFile);
      const meta = await sharp(absFile).metadata();
      if (!meta.width || !meta.height) continue;

      const bytesPerPixel = size / (meta.width * meta.height);
      if (meta.width <= MAX_SOURCE_WIDTH && bytesPerPixel <= MAX_BYTES_PER_PIXEL) {
        skipped++;
        continue;
      }

      const tmpFile = `${absFile}.tmp`;
      await sharp(absFile)
        .rotate() // bake in EXIF orientation before it is stripped
        .resize(MAX_SOURCE_WIDTH, MAX_SOURCE_WIDTH, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toFile(tmpFile);
      fs.renameSync(tmpFile, absFile);

      const newSize = fs.statSync(absFile).size;
      bytesBefore += size;
      bytesAfter += newSize;
      compressed++;
      console.log(`  compressed ${dir}/${file}: ${formatKB(size)} → ${formatKB(newSize)}`);
    }
  }

  console.log(
    `Compression: ${compressed} compressed (${formatKB(bytesBefore)} → ${formatKB(bytesAfter)}), ${skipped} already optimal`
  );
}

function getLocalCoverImages(): string[] {
  const covers = new Set<string>();
  for (const cacheFile of ["recipes-cache.json", "guides-cache.json"]) {
    const cachePath = path.join(process.cwd(), cacheFile);
    if (!fs.existsSync(cachePath)) continue;
    const entries: Array<{ coverImage?: string }> = JSON.parse(
      fs.readFileSync(cachePath, "utf-8")
    );
    for (const entry of entries) {
      if (entry.coverImage?.startsWith("/")) covers.add(entry.coverImage);
    }
  }
  return [...covers];
}

async function generateCrops(): Promise<void> {
  let generated = 0;
  let skipped = 0;
  let missing = 0;

  for (const cover of getLocalCoverImages()) {
    const absSource = path.join(PUBLIC_DIR, cover);
    if (!fs.existsSync(absSource)) {
      console.warn(`  missing source for cover image: ${cover}`);
      missing++;
      continue;
    }

    const sourceMtime = fs.statSync(absSource).mtimeMs;
    const ext = path.extname(absSource);
    const base = absSource.slice(0, -ext.length);

    for (const { suffix, width, height } of CROP_VARIANTS) {
      const cropFile = `${base}-${suffix}.jpg`;
      if (fs.existsSync(cropFile) && fs.statSync(cropFile).mtimeMs > sourceMtime) {
        skipped++;
        continue;
      }

      await sharp(absSource)
        .rotate()
        .resize(width, height, { fit: "cover", position: sharp.strategy.attention })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toFile(cropFile);
      generated++;
    }
  }

  console.log(`Crops: ${generated} generated, ${skipped} up to date, ${missing} missing sources`);
}

async function main() {
  console.log("Phase 1: compressing oversized source images...");
  await compressSources();
  console.log("Phase 2: generating rich-result crops for cover images...");
  await generateCrops();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
