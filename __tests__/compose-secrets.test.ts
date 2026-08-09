import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("development Compose secrets", () => {
  it("loads PostgreSQL credentials from the ignored local environment file", () => {
    const compose = readFileSync(resolve("compose.dev.yaml"), "utf8");

    expect(compose).toContain("env_file:");
    expect(compose).toContain(".env.docker.local");
    expect(compose).not.toMatch(/^\s+POSTGRES_(?:DB|PASSWORD|USER):/mu);
  });
});
