import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const CATEGORIES_DIR = path.join(ROOT, "assets", "mock", "categories");

const THUMB_SIZES = [128, 256, 384]; // 1x, 2x, 3x
const LARGE_SIZES = [256, 512, 768]; // 1x, 2x, 3x

const INPUT_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);

function outputName(baseName, variant, scale) {
  const suffix = scale === 1 ? "" : `@${scale}x`;
  return `${baseName}-${variant}${suffix}.jpg`;
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const entries = await fs.readdir(CATEGORIES_DIR, { withFileTypes: true });
  const inputs = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => {
      const ext = path.extname(name).toLowerCase();
      if (!INPUT_EXTS.has(ext)) return false;
      // Skip already-generated outputs
      if (name.includes("-thumb")) return false;
      if (name.includes("-large")) return false;
      if (name.includes("@2x") || name.includes("@3x")) return false;
      return true;
    });

  if (inputs.length === 0) {
    console.log("No input images found in", CATEGORIES_DIR);
    return;
  }

  console.log(`Found ${inputs.length} category images. Generating JPEG variants...`);

  for (const filename of inputs) {
    const inputPath = path.join(CATEGORIES_DIR, filename);
    const baseName = path.parse(filename).name;

    const image = sharp(inputPath, { failOn: "none" }).rotate();

    const jobs = [
      ...THUMB_SIZES.map((size, idx) => ({
        out: outputName(baseName, "thumb", idx + 1),
        size,
      })),
      ...LARGE_SIZES.map((size, idx) => ({
        out: outputName(baseName, "large", idx + 1),
        size,
      })),
    ];

    for (const job of jobs) {
      const outPath = path.join(CATEGORIES_DIR, job.out);
      if (await fileExists(outPath)) continue;

      await image
        .clone()
        // Center-crop to 1:1 even for portrait/landscape sources
        .resize(job.size, job.size, { fit: "cover", position: "centre" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(outPath);
    }

    console.log(`✓ ${filename} → ${baseName}-thumb/large jpgs`);
  }

  console.log("Done.");
  console.log("Next: update mockData.ts to use *-thumb.jpg and *-large.jpg (base names only).");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

