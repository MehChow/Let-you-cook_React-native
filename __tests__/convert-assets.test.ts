const {
  resolveSearchRoot,
  findConvertibleFiles,
} = require("../scripts/convert-assets.cjs");

describe("convert-assets helpers", () => {
  it("prefers npm INIT_CWD over process cwd", () => {
    expect(
      resolveSearchRoot({
        initCwd: "/repo/assets/screenshot",
        cwd: "/repo",
      }),
    ).toBe("/repo/assets/screenshot");
  });

  it("only returns source image formats", async () => {
    const files = await findConvertibleFiles("/repo", async () => [
      "/repo/a.jpg",
      "/repo/b.jpeg",
      "/repo/c.png",
      "/repo/d.webp",
      "/repo/e.avif",
    ]);

    expect(files).toEqual([
      "/repo/a.jpg",
      "/repo/b.jpeg",
      "/repo/c.png",
    ]);
  });
});
