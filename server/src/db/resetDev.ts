import { pool } from "./client";
import { resetAndSeedDevelopmentData } from "./devData";

// Resets local data and reports the deterministic development accounts.
const run = async (): Promise<void> => {
  const result = await resetAndSeedDevelopmentData();
  console.info("Development database reset complete.", result);
};

void run()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
