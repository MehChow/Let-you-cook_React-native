import sharp from "sharp";

const checks = [
  {
    path: "assets/mock/todays_special.webp",
    maxWidth: 1200,
    maxHeight: 800,
    maxBytes: 350 * 1024,
  },
];

let hasFailure = false;

for (const check of checks) {
  const metadata = await sharp(check.path).metadata();
  const stats = await import("node:fs/promises").then(({ stat }) =>
    stat(check.path),
  );

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const size = stats.size;

  const dimensionFailure = width > check.maxWidth || height > check.maxHeight;
  const sizeFailure = size > check.maxBytes;

  if (dimensionFailure || sizeFailure) {
    hasFailure = true;
    console.error(
      [
        `${check.path} exceeds the mobile budget.`,
        `width=${width} maxWidth=${check.maxWidth}`,
        `height=${height} maxHeight=${check.maxHeight}`,
        `bytes=${size} maxBytes=${check.maxBytes}`,
      ].join(" "),
    );
  } else {
    console.log(
      `${check.path} is within budget: ${width}x${height}, ${size} bytes.`,
    );
  }
}

if (hasFailure) {
  process.exit(1);
}
