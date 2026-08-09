import { sql } from "drizzle-orm";

import { hashPassword } from "../auth/password";
import { CURATED_CATEGORIES } from "../recipes/categories";
import { db } from "./client";
import { categories, profiles, users } from "./schema";

const DEVELOPMENT_DATABASE_NAME = "letyoucook";
const LOCAL_DATABASE_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const POSTGRESQL_PROTOCOLS = new Set(["postgres:", "postgresql:"]);
const CONNECTION_ADDRESSING_PARAMETERS = ["database", "db", "host", "port"];

export const DEVELOPMENT_SEED_PASSWORD = "coffee123";

// Describes the deterministic accounts created for local development.
export interface DevelopmentSeedResult {
  unverifiedEmail: string;
  verifiedEmail: string;
}

// Formats reset success output without exposing development credentials.
export const formatDevelopmentResetSuccess = (
  result: DevelopmentSeedResult,
): string =>
  `Development database reset complete. ${JSON.stringify({
    unverifiedEmail: result.unverifiedEmail,
    verifiedEmail: result.verifiedEmail,
  })}`;

// Prevents destructive reset commands from targeting non-development databases.
export const assertSafeDevelopmentDatabase = (databaseUrl: string): void => {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for development reset");
  }

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL is invalid for development reset");
  }

  if (!POSTGRESQL_PROTOCOLS.has(parsed.protocol)) {
    throw new Error("DATABASE_URL must use a PostgreSQL protocol");
  }

  const databaseName = parsed.pathname.replace(/^\//, "");
  const databaseHost = parsed.hostname.replace(/^\[|\]$/g, "");

  if (
    CONNECTION_ADDRESSING_PARAMETERS.some((parameter) =>
      parsed.searchParams.has(parameter),
    )
  ) {
    throw new Error(
      "Refusing to reset a database with connection-addressing overrides",
    );
  }

  if (!LOCAL_DATABASE_HOSTS.has(databaseHost)) {
    throw new Error("Refusing to reset a non-local database");
  }

  if (databaseName !== DEVELOPMENT_DATABASE_NAME) {
    throw new Error("Refusing to reset a non-development database");
  }
};

// Clears every current application table in the local database.
export const resetDevelopmentData = async (): Promise<void> => {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  assertSafeDevelopmentDatabase(databaseUrl);
  await db.execute(sql`
    TRUNCATE TABLE
      blocks,
      reports,
      favourites,
      nutrition,
      steps,
      ingredients,
      recipe_images,
      recipes,
      categories,
      refresh_tokens,
      profiles,
      users
    RESTART IDENTITY CASCADE
  `);
};

// Restores the fixed ordered category taxonomy for local development.
export const seedDevelopmentCategories = async (): Promise<void> => {
  await db
    .insert(categories)
    .values([...CURATED_CATEGORIES])
    .onConflictDoUpdate({
      target: categories.id,
      set: {
        slug: sql`excluded.slug`,
        displayName: sql`excluded.display_name`,
        sortOrder: sql`excluded.sort_order`,
        isActive: sql`excluded.is_active`,
      },
    });
};

// Seeds verified and unverified accounts for repeatable local testing.
export const seedDevelopmentData = async (): Promise<DevelopmentSeedResult> => {
  assertSafeDevelopmentDatabase(process.env.DATABASE_URL ?? "");
  await seedDevelopmentCategories();
  const passwordHash = await hashPassword(DEVELOPMENT_SEED_PASSWORD);
  const seeds = [
    {
      displayName: "Verified Cook",
      email: "verified@letyoucook.local",
      emailVerifiedAt: new Date(),
    },
    {
      displayName: "Unverified Cook",
      email: "unverified@letyoucook.local",
      emailVerifiedAt: null,
    },
  ];

  for (const seed of seeds) {
    const [user] = await db
      .insert(users)
      .values({
        email: seed.email,
        emailVerifiedAt: seed.emailVerifiedAt,
        passwordHash,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          emailVerifiedAt: seed.emailVerifiedAt,
          passwordHash,
          updatedAt: new Date(),
        },
      })
      .returning({ id: users.id });

    await db
      .insert(profiles)
      .values({ displayName: seed.displayName, userId: user.id })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          displayName: seed.displayName,
          updatedAt: new Date(),
        },
      });
  }

  return {
    unverifiedEmail: seeds[1].email,
    verifiedEmail: seeds[0].email,
  };
};

// Resets and seeds local data as one development operation.
export const resetAndSeedDevelopmentData =
  async (): Promise<DevelopmentSeedResult> => {
    await resetDevelopmentData();
    return seedDevelopmentData();
  };
