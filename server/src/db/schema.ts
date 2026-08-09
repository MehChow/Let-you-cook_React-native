import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const authChallenges = pgTable(
  "auth_challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    purpose: text("purpose").notNull(),
    targetHash: text("target_hash").notNull(),
    codeHash: text("code_hash").notNull(),
    attemptCount: integer("attempt_count").default(0).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    grantHash: text("grant_hash"),
    grantExpiresAt: timestamp("grant_expires_at", { withTimezone: true }),
    grantConsumedAt: timestamp("grant_consumed_at", { withTimezone: true }),
    lastSentAt: timestamp("last_sent_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("auth_challenges_target_purpose_sent_idx").on(
      table.targetHash,
      table.purpose,
      table.lastSentAt,
    ),
    check(
      "auth_challenges_purpose_check",
      sql`${table.purpose} in ('email_verification', 'password_reset')`,
    ),
    check(
      "auth_challenges_attempt_count_check",
      sql`${table.attemptCount} between 0 and 5`,
    ),
    uniqueIndex("auth_challenges_grant_hash_unique").on(table.grantHash),
  ],
);

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarImageUrl: text("avatar_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  replacedByTokenId: uuid("replaced_by_token_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const recipes = pgTable("recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: text("category_id").notNull(),
  cookTimeMinutes: integer("cook_time_minutes").notNull(),
  servings: integer("servings").notNull(),
  calories: integer("calories"),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const recipeImages = pgTable("recipe_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: uuid("recipe_id").references(() => recipes.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ingredients = pgTable("ingredients", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  groupTitle: text("group_title"),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const steps = pgTable("steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  instruction: text("instruction").notNull(),
  imageId: uuid("image_id").references(() => recipeImages.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const nutrition = pgTable("nutrition", {
  recipeId: uuid("recipe_id")
    .primaryKey()
    .references(() => recipes.id, { onDelete: "cascade" }),
  source: text("source").notNull(),
  totalCalories: integer("total_calories").notNull(),
  proteinGrams: numeric("protein_grams", { precision: 8, scale: 2 }).notNull(),
  carbsGrams: numeric("carbs_grams", { precision: 8, scale: 2 }).notNull(),
  fatGrams: numeric("fat_grams", { precision: 8, scale: 2 }).notNull(),
});

export const favourites = pgTable(
  "favourites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("favourites_user_recipe_unique").on(table.userId, table.recipeId)],
);

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipeId: uuid("recipe_id").references(() => recipes.id, { onDelete: "cascade" }),
  reportedUserId: uuid("reported_user_id").references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const blocks = pgTable(
  "blocks",
  {
    blockerId: uuid("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: uuid("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("blocks_blocker_blocked_unique").on(table.blockerId, table.blockedId)],
);
