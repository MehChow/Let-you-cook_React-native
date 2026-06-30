const test = require("node:test");
const assert = require("node:assert/strict");

const {
  resolveSearchRoot,
  findConvertibleFiles,
} = require("./convert-assets.cjs");

test("resolveSearchRoot prefers npm INIT_CWD over process cwd", () => {
  assert.equal(
    resolveSearchRoot({
      initCwd: "/repo/assets/screenshot",
      cwd: "/repo",
    }),
    "/repo/assets/screenshot",
  );
});

test("findConvertibleFiles only returns source image formats", async () => {
  const files = await findConvertibleFiles("/repo", async () => [
    "/repo/a.jpg",
    "/repo/b.jpeg",
    "/repo/c.png",
    "/repo/d.webp",
    "/repo/e.avif",
  ]);

  assert.deepEqual(files, [
    "/repo/a.jpg",
    "/repo/b.jpeg",
    "/repo/c.png",
  ]);
});
