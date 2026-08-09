import assert from "node:assert/strict";
import { test } from "node:test";

import { InvalidTagLabelError, normalizeTagInput } from "./tagService";

test("tag normalization produces one canonical label and slug", () => {
  assert.deepEqual(normalizeTagInput("  QUICK   meals "), {
    label: "Quick Meals",
    slug: "quick-meals",
  });
  assert.deepEqual(normalizeTagInput("Crème brûlée"), {
    label: "Crème Brûlée",
    slug: "creme-brulee",
  });
});

test("tag normalization rejects labels without letters or numbers", () => {
  assert.throws(() => normalizeTagInput(" --- "), InvalidTagLabelError);
});
