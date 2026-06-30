// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**/*", "src/types/**/*.d.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportSpecifier[imported.name='memo'][parent.source.value='react']",
          message:
            "React Compiler is enabled; do not import memo outside src/components/ui.",
        },
        {
          selector:
            "ImportSpecifier[imported.name='useCallback'][parent.source.value='react']",
          message:
            "React Compiler is enabled; do not import useCallback outside src/components/ui.",
        },
        {
          selector:
            "ImportSpecifier[imported.name='useMemo'][parent.source.value='react']",
          message:
            "React Compiler is enabled; do not import useMemo outside src/components/ui.",
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "React",
          property: "memo",
          message:
            "React Compiler is enabled; do not use React.memo outside src/components/ui.",
        },
        {
          object: "React",
          property: "useCallback",
          message:
            "React Compiler is enabled; do not use React.useCallback outside src/components/ui.",
        },
        {
          object: "React",
          property: "useMemo",
          message:
            "React Compiler is enabled; do not use React.useMemo outside src/components/ui.",
        },
      ],
    },
  },
]);
