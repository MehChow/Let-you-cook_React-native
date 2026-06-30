const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const { glob } = require("glob");

const TARGET_DIRS = ["assets/mock"];
const WEBP_QUALITY = 80;

const MAX_LONG_EDGE_BY_PATH = [
  { pattern: /\/icon\./, maxLongEdge: 256 },
  { pattern: /\/categories\//, maxLongEdge: 640 },
  { pattern: /\/recipe-detail-/, maxLongEdge: 1440 },
  { pattern: /\/todays_special\./, maxLongEdge: 1440 },
  { pattern: /\/popular_recipe_/, maxLongEdge: 1440 },
];

const getMaxLongEdge = (file) =>
  MAX_LONG_EDGE_BY_PATH.find(({ pattern }) => pattern.test(file))?.maxLongEdge ??
  1440;

async function convertAssets() {
  const files = (
    await Promise.all(
      TARGET_DIRS.map((dir) =>
        glob(`${dir}/**/*.{jpg,jpeg,png,webp,avif}`, {
          nodir: true,
        }),
      ),
    )
  ).flat();

  if (files.length === 0) {
    console.log("No convertible assets found.");
    return;
  }

  for (const file of files) {
    const ext = path.extname(file);
    const outputFilePath = file.slice(0, -ext.length) + ".webp";
    const tempOutputFilePath = `${outputFilePath}.tmp`;
    const metadata = await sharp(file).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    const maxLongEdge = getMaxLongEdge(file);
    const needsResize = Math.max(width, height) > maxLongEdge;
    const transform = sharp(file);

    if (needsResize) {
      transform.resize({
        width: width >= height ? maxLongEdge : undefined,
        height: height > width ? maxLongEdge : undefined,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    await transform.webp({ quality: WEBP_QUALITY }).toFile(tempOutputFilePath);

    if (file !== outputFilePath && fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
    }

    fs.renameSync(tempOutputFilePath, outputFilePath);

    if (file !== outputFilePath) {
      fs.unlinkSync(file);
    }

    console.log(
      `${file} -> ${outputFilePath} (${width}x${height}${needsResize ? ` resized to <= ${maxLongEdge}` : ""})`,
    );
  }
}

convertAssets().catch((error) => {
  console.error("Failed to convert assets:", error);
  process.exit(1);
});
