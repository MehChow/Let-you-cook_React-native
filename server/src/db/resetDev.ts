import { pool } from "./client";
import {
  formatDevelopmentResetSuccess,
  resetAndSeedDevelopmentData,
} from "./devData";

// Resets local data and reports the deterministic development accounts.
const run = async (): Promise<void> => {
  const result = await resetAndSeedDevelopmentData();
  console.info(formatDevelopmentResetSuccess(result));
};

void run()
  .catch(() => {
    console.error("Development database reset failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
