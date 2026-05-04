const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// Ensure Metro bundles modern image formats used in `assets/mock/*`.
// Some setups omit these by default, causing `require("*.webp")` / `require("*.avif")` to fail.
config.resolver.assetExts = Array.from(
  new Set([...(config.resolver.assetExts ?? []), "webp", "avif"])
);

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});
