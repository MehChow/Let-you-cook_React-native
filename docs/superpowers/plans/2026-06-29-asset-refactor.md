# Asset Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up `assets/mock` and `assets/mock_images`, convert retained originals to `.webp`, centralize static image imports in `src/data/images.ts`, and update all call sites to use that registry.

**Architecture:** Keep the asset folders in place but reduce them to canonical source images only. Add one repo-local conversion script that deletes old `.jpg/.jpeg` originals after producing `.webp`, then point all static mock-data usage through a single `src/data/images.ts` registry so feature files stop depending on raw asset paths.

**Tech Stack:** Expo, React Native, TypeScript, Node.js, Sharp, glob

---

### Task 1: Inventory and prune mock assets

**Files:**
- Modify: `assets/mock/*`
- Modify: `assets/mock_images/*`

- [ ] **Step 1: Record the current file inventory**

Run: `find assets/mock assets/mock_images -type f | sort`
Expected: full list of current files, including `thumb`, `large`, `@2x`, `@3x`, `.webp`, and `.avif` variants.

- [ ] **Step 2: Keep only canonical source files**

Keep this exact set as the retained source images before conversion:

```text
assets/mock/icon.jpg
assets/mock/popular_recipe_1.jpg
assets/mock/todays_special.jpg
assets/mock/categories/breakfast.jpg
assets/mock/categories/dinner.jpg
assets/mock/categories/lunch.jpg
assets/mock/categories/other.jpeg
assets/mock/categories/dessert.webp
assets/mock/categories/drinks.avif
assets/mock/categories/vegan.webp
assets/mock/popular_recipe_2.webp
assets/mock_images/recipe-detail-1.jpg
assets/mock_images/recipe-detail-2.jpg
assets/mock_images/recipe-detail-3.jpg
```

Delete every other file under those two folders.

- [ ] **Step 3: Verify the prune result**

Run: `find assets/mock assets/mock_images -type f | sort`
Expected: only the retained canonical source files remain.

### Task 2: Add and wire the conversion script

**Files:**
- Create: `scripts/convert-assets.cjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing script entry expectation**

Run: `node -e "const p=require('./package.json'); process.exit(p.scripts['convert-assets'] ? 0 : 1)"`
Expected: exit code `1` because `convert-assets` does not exist yet.

- [ ] **Step 2: Add the conversion script implementation**

Create `scripts/convert-assets.cjs` with logic that:

```js
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const { glob } = require("glob");

const TARGET_DIRS = ["assets/mock", "assets/mock_images"];

async function convertAssets() {
  const files = (
    await Promise.all(
      TARGET_DIRS.map((dir) => glob(`${dir}/**/*.{jpg,jpeg}`, { nodir: true })),
    )
  ).flat();

  for (const file of files) {
    const ext = path.extname(file);
    const outputFilePath = file.slice(0, -ext.length) + ".webp";
    await sharp(file).webp({ quality: 80 }).toFile(outputFilePath);
    fs.unlinkSync(file);
  }
}

convertAssets().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 3: Add the package script**

Update `package.json` to include:

```json
"convert-assets": "node scripts/convert-assets.cjs"
```

- [ ] **Step 4: Verify the script entry exists**

Run: `node -e "const p=require('./package.json'); process.exit(p.scripts['convert-assets']==='node scripts/convert-assets.cjs' ? 0 : 1)"`
Expected: exit code `0`.

### Task 3: Convert the retained source images

**Files:**
- Modify: `assets/mock/*`
- Modify: `assets/mock_images/*`

- [ ] **Step 1: Run the conversion script**

Run: `npm run convert-assets`
Expected: `.jpg/.jpeg` files in the retained set become `.webp` files and the `.jpg/.jpeg` originals are removed.

- [ ] **Step 2: Verify post-conversion file state**

Run: `find assets/mock assets/mock_images -type f | sort`
Expected:

```text
assets/mock/icon.webp
assets/mock/popular_recipe_1.webp
assets/mock/popular_recipe_2.webp
assets/mock/todays_special.webp
assets/mock/categories/breakfast.webp
assets/mock/categories/dessert.webp
assets/mock/categories/dinner.webp
assets/mock/categories/drinks.avif
assets/mock/categories/lunch.webp
assets/mock/categories/other.webp
assets/mock/categories/vegan.webp
assets/mock_images/recipe-detail-1.webp
assets/mock_images/recipe-detail-2.webp
assets/mock_images/recipe-detail-3.webp
```

### Task 4: Create the shared image registry

**Files:**
- Create: `src/data/images.ts`

- [ ] **Step 1: Write the failing import expectation**

Run: `test -f src/data/images.ts`
Expected: exit code `1` because the registry file does not exist yet.

- [ ] **Step 2: Create the registry**

Create `src/data/images.ts` with a single exported `images` object similar to:

```ts
export const images = {
  avatarMock: require("@/assets/mock/icon.webp"),
  todaySpecial: require("@/assets/mock/todays_special.webp"),
  popularRecipe1: require("@/assets/mock/popular_recipe_1.webp"),
  popularRecipe2: require("@/assets/mock/popular_recipe_2.webp"),
  categoryBreakfast: require("@/assets/mock/categories/breakfast.webp"),
  categoryLunch: require("@/assets/mock/categories/lunch.webp"),
  categoryDinner: require("@/assets/mock/categories/dinner.webp"),
  categoryDessert: require("@/assets/mock/categories/dessert.webp"),
  categoryDrinks: require("@/assets/mock/categories/drinks.avif"),
  categoryVegan: require("@/assets/mock/categories/vegan.webp"),
  categoryOther: require("@/assets/mock/categories/other.webp"),
  recipeDetail1: require("@/assets/mock_images/recipe-detail-1.webp"),
  recipeDetail2: require("@/assets/mock_images/recipe-detail-2.webp"),
  recipeDetail3: require("@/assets/mock_images/recipe-detail-3.webp"),
} as const;
```

- [ ] **Step 3: Verify the registry exists**

Run: `test -f src/data/images.ts`
Expected: exit code `0`.

### Task 5: Refactor home mock data to use the registry

**Files:**
- Modify: `src/features/home/mockData.ts`
- Modify: `src/app/modal.tsx` (only if type assumptions need adjustment)

- [ ] **Step 1: Replace inline static requires**

Update `src/features/home/mockData.ts` to import `images`:

```ts
import { images } from "@/data/images";
```

Then replace all retained asset `require(...)` calls with `images.*` references:

```ts
export const mockAvatar: ImageSourcePropType = images.avatarMock;
image: images.todaySpecial;
imageThumb: images.categoryBreakfast;
imageLarge: images.categoryBreakfast;
image: images.popularRecipe1;
image: images.popularRecipe2;
image: images.categoryLunch;
```

Use the same image for both `imageThumb` and `imageLarge` where only one canonical original remains.

- [ ] **Step 2: Verify no home mock-data inline requires remain**

Run: `rg -n "require\\(" src/features/home/mockData.ts`
Expected: no output.

### Task 6: Refactor recipe-detail mock data to use the registry

**Files:**
- Modify: `src/features/recipe-detail/mockData.ts`

- [ ] **Step 1: Replace inline static requires**

Update `src/features/recipe-detail/mockData.ts` to import `images`:

```ts
import { images } from "@/data/images";
```

Then replace the local `detailImage*` and `reviewAvatar*` constants with image-registry references, for example:

```ts
const detailImageOne = images.recipeDetail1;
const detailImageTwo = images.recipeDetail2;
const detailImageThree = images.recipeDetail3;

const reviewAvatarOne = images.avatarMock;
const reviewAvatarTwo = images.categoryDessert;
const reviewAvatarThree = images.categoryBreakfast;
```

- [ ] **Step 2: Verify no recipe-detail inline requires remain**

Run: `rg -n "require\\(" src/features/recipe-detail/mockData.ts`
Expected: no output.

### Task 7: Verify deleted asset names are no longer referenced

**Files:**
- Verify: `src/**/*`

- [ ] **Step 1: Search for removed asset naming patterns**

Run:

```bash
rg -n "thumb|large|@2x|@3x|\\.jpg|\\.jpeg|\\.avif" src assets/mock assets/mock_images
```

Expected: no app-source references to deleted mock asset filenames. Remaining `.avif` output is allowed only if `assets/mock/categories/drinks.avif` is intentionally retained and referenced via `src/data/images.ts`.

- [ ] **Step 2: Search for old direct mock-folder requires**

Run:

```bash
rg -n "assets/mock|assets/mock_images" src
```

Expected: only `src/data/images.ts` contains direct static asset paths.

### Task 8: Final verification

**Files:**
- Verify: `package.json`
- Verify: `scripts/convert-assets.cjs`
- Verify: `src/data/images.ts`
- Verify: `src/features/home/mockData.ts`
- Verify: `src/features/recipe-detail/mockData.ts`

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: if lint fails, separate pre-existing failures from anything introduced by this refactor.

- [ ] **Step 2: Review git diff**

Run: `git diff -- package.json scripts/convert-assets.cjs src/data/images.ts src/features/home/mockData.ts src/features/recipe-detail/mockData.ts assets/mock assets/mock_images`
Expected: diff shows only asset cleanup, conversion wiring, registry creation, and call-site refactors.
