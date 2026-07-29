import assert from "node:assert/strict";
import { test } from "node:test";

import {
  editableProfileSchema,
  privateProfileResponseSchema,
  updateProfileInputSchema,
  updateProfileResponseSchema,
} from "./profiles";

const editableProfile = {
  displayName: "Cook",
  bio: null,
  avatarImageUrl: "https://example.com/avatar.png",
};

test("profile update input preserves current validation and stripping", () => {
  assert.deepEqual(
    updateProfileInputSchema.parse({
      ...editableProfile,
      ignored: true,
    }),
    editableProfile,
  );
  assert.equal(
    updateProfileInputSchema.safeParse({ displayName: "" }).success,
    false,
  );
  assert.equal(
    updateProfileInputSchema.safeParse({ bio: "x".repeat(501) }).success,
    false,
  );
  assert.equal(
    updateProfileInputSchema.safeParse({ avatarImageUrl: "not-a-url" })
      .success,
    false,
  );
});

test("editable profile response is strict and nullable", () => {
  assert.deepEqual(editableProfileSchema.parse(editableProfile), editableProfile);
  assert.equal(
    editableProfileSchema.safeParse({
      ...editableProfile,
      updatedAt: new Date(),
    }).success,
    false,
  );
  assert.equal(
    editableProfileSchema.safeParse({
      ...editableProfile,
      avatarImageUrl: null,
    }).success,
    true,
  );
});

test("private profile response rejects account and database internals", () => {
  const valid = {
    profile: {
      id: "f6822e40-7c3a-40ec-a77f-c3291888dc0c",
      email: "cook@example.com",
      ...editableProfile,
    },
  };

  assert.deepEqual(privateProfileResponseSchema.parse(valid), valid);
  assert.equal(
    privateProfileResponseSchema.safeParse({
      profile: { ...valid.profile, passwordHash: "private" },
    }).success,
    false,
  );
});

test("profile update response wraps only editable fields", () => {
  const valid = { profile: editableProfile };

  assert.deepEqual(updateProfileResponseSchema.parse(valid), valid);
  assert.equal(
    updateProfileResponseSchema.safeParse({
      profile: { ...editableProfile, email: "private@example.com" },
    }).success,
    false,
  );
});
