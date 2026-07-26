import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const serverDirectory = fileURLToPath(new URL("../../", import.meta.url));

test("reports reset failures without exposing database credentials", () => {
  const secret = "cli-top-secret";
  const result = spawnSync(
    process.execPath,
    ["node_modules/tsx/dist/cli.mjs", "src/db/resetDev.ts"],
    {
      cwd: serverDirectory,
      encoding: "utf8",
      env: {
        ...process.env,
        DATABASE_URL: `postgres://postgres:${secret}@[invalid-host/letyoucook`,
      },
    },
  );

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr.trim(), "Development database reset failed.");
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(secret));
});
