#!/usr/bin/env node
// Resize every patio photo in public/patios/* to WebP at ≤ MAX_WIDTH wide.
// Replaces originals in place. Skips files that are already small enough +
// already in webp. Idempotent — safe to re-run after adding new photos.
//
// Why: ImageCarousel renders these at ~560px on desktop, ~430px on mobile.
// Pre-resizing avoids paying Vercel's image-optimization quota on every
// request and shrinks the public/ tree from ~85 MB to ~8 MB.

import { readdir, stat, rename, unlink } from "node:fs/promises";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const MAX_WIDTH = 1400; // 2x of the 560px desktop card width, with headroom
const QUALITY = 78;
const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
// Both the current patio photo tree and the legacy /images/places tree —
// patios.json mixes refs to both, so we need to optimize files in both.
const ROOTS = [join(PUBLIC_DIR, "patios"), join(PUBLIC_DIR, "images", "places")];

const PATIO_EXTS = new Set([".jpg", ".jpeg", ".png"]);

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

async function main() {
  let processed = 0;
  let skipped = 0;
  let savedBytes = 0;

  for (const root of ROOTS) {
    try {
      await stat(root);
    } catch {
      continue; // root doesn't exist, skip
    }
    for await (const path of walk(root)) {
      const ext = extname(path).toLowerCase();
      if (!PATIO_EXTS.has(ext) && ext !== ".webp") continue;

      const beforeSize = (await stat(path)).size;
      const meta = await sharp(path).metadata();
      const needsResize = (meta.width ?? 0) > MAX_WIDTH;
      const needsConvert = ext !== ".webp";

      if (!needsResize && !needsConvert) {
        skipped++;
        continue;
      }

      const outPath = join(dirname(path), basename(path, ext) + ".webp");
      const tmpPath = outPath + ".tmp";

      let pipeline = sharp(path);
      if (needsResize) pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      await pipeline.webp({ quality: QUALITY }).toFile(tmpPath);

      await rename(tmpPath, outPath);
      if (needsConvert && outPath !== path) await unlink(path);

      const afterSize = (await stat(outPath)).size;
      const saved = beforeSize - afterSize;
      savedBytes += saved;
      processed++;
      console.log(`${path.replace(PUBLIC_DIR + "/", "")} → ${basename(outPath)}: ${fmt(beforeSize)} → ${fmt(afterSize)} (saved ${fmt(saved)})`);
    }
  }

  console.log(`\nProcessed ${processed}, skipped ${skipped}. Total saved: ${fmt(savedBytes)}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
