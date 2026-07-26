# AI Nutrition: Feasibility, Product Rules, and Architecture

Last reviewed: 2026-07-26

## Recommendation

The feature is feasible and useful if it is positioned as an **ingredient-based
nutrition estimate with AI assistance**. It is not reliable enough to promise
that a dish photo alone reveals its calories.

Build it last, after recipe drafts, structured ingredients, servings, cooking
steps, R2 media, and normal nutrition persistence work end to end. Those are not
just dependencies: they are the reliable inputs that make the estimate
defensible.

The current name "AI Calories" is acceptable as a compact UI label, but pair it
with plain copy such as "Estimated from your ingredients" and an `Estimated`
badge. "Estimate nutrition" would be the clearer long-term product name.

## Why It Can Be Valuable

- It removes tedious lookup/arithmetic for recipe authors.
- It gives the existing calories/macronutrient chart real data without making
  manual entry mandatory.
- It enables useful calorie filtering once enough recipes have nutrition.
- It can flag missing quantities or ambiguous ingredients and improve recipe
  quality.

It becomes harmful if it shows false precision, invents missing amounts, implies
medical accuracy, or derives a confident result from appearance alone.

Research such as Nutrition5k demonstrates that image-based nutrition prediction
is possible under a dataset with ingredient weights, accurate nutrition labels,
multiple views, and depth information. It also describes the task as a
challenging computer-vision problem. Ordinary user photos lack most of those
signals. Hidden oil, sauces, preparation loss/gain, density, edible portion, and
serving size are material sources of error.

## Product Contract

Nutrition is optional and always per serving.

### Eligibility

Enable Analyze only when:

- recipe name is present;
- servings is a positive number;
- there is at least one ingredient;
- every included ingredient has a name;
- enough ingredients have a quantity and supported unit to calculate a
  meaningful result;
- the draft is owned by the requesting user.

Cooking steps/methods and description improve interpretation. Images are
optional supporting inputs. A photo must not be required and must not override
explicit ingredient data.

If a key amount is absent or non-convertible, return a specific `needsInput`
result instead of guessing silently. Examples: "How much oil is used?" or
"Choose a weight/volume for one chicken breast."

### Analyze and Result

1. The user presses Analyze.
2. The app shows cancellable progress and keeps the draft editable after a
   reasonable request boundary.
3. The service returns calories, carbohydrates, fat, and protein per serving;
   confidence/coverage; warnings; and ingredient matches.
4. The chart displays the estimate with an `Estimated` label.
5. The user can accept it, rerun it, switch to manual, or remove it.

Removing the selected estimate removes it from the recipe UI. Server-side
analysis audit records may be retained for a documented short period for
quality/cost/debugging, then deleted according to the privacy policy.

### Manual Mode

Manual calories, carbohydrate, fat, and protein are non-negative values. The
chart updates locally in real time. Manual entry is not passed through AI.

The UI may show an informational comparison between entered calories and
`4 * protein + 4 * carbohydrate + 9 * fat`, but must not overwrite the author's
calories. Fibre, sugar alcohols, alcohol, rounding, and data-source conventions
can make the values differ.

### Staleness

Create a canonical input payload and SHA-256 fingerprint covering every field
that affects analysis:

- recipe title/description when used for disambiguation;
- servings;
- ingredient group, name, amount, unit, and preparation;
- cooking-step text/method;
- any image asset checksum actually sent to the model;
- analysis schema/prompt/data-source versions.

When a covered recipe input changes, keep the previous value visible only with a
clear `Out of date` state and disable publish-with-estimate until the user reruns,
switches to manual, or removes it. Changes to purely decorative images should
not stale an ingredient-only result.

## Recommended Technical Stack

### Core

- Existing Node 20 + Hono service owns the workflow and all secrets.
- Zod defines the canonical analysis input and model output schema.
- PostgreSQL/Drizzle stores analysis attempts, ingredient matches, selected
  snapshots, provenance, latency, and usage.
- USDA FoodData Central is the initial food-composition source.
- TanStack Query mutation handles Analyze and normal retry/cancel UI.
- R2 provides a short-lived read URL only when an optional image is used.

Do not call an AI or USDA API directly from the mobile app.

### Model Layer

Use a small provider adapter, for example:

```ts
interface NutritionNormalizer {
  normalize(input: NutritionAnalysisInput): Promise<NormalizedIngredientResult>;
}
```

For an initial hosted implementation, use the OpenAI JavaScript SDK and
Responses API with Structured Outputs/Zod. As of this review, start evaluation
with `gpt-5.6-terra` at low reasoning for the quality/cost balance, and compare
`gpt-5.6-luna` on the same evaluation set for a lower-cost/high-volume option.
Keep the model in a server environment variable such as
`AI_NUTRITION_MODEL`; do not scatter a model slug through business code.

This is a baseline to evaluate, not a permanent architectural dependency.
Provider output must satisfy the same schema and evaluation gates. Do not
fine-tune a model before prompt/schema + retrieval evaluation shows a repeatable
failure that training data can solve.

### Nutrition Data Layer

FoodData Central provides search and food-detail endpoints. Keep its API key on
the server. Cache normalized food records/matches in PostgreSQL with source IDs
and retrieval/version timestamps to reduce latency and keep results explainable.

FoodData Central is US-oriented and may match branded foods poorly for global
home recipes. Preserve the source adapter so a Hong Kong/Asian food dataset or
curated mapping can be added later without changing the product contract.

## Processing Pipeline

The model interprets; code calculates.

1. **Validate and fingerprint** — reject an ineligible/stale-version request and
   persist a pending attempt.
2. **Normalize** — use structured model output to split ingredient name,
   preparation, quantity/unit interpretation, candidate search terms, and
   ambiguity. The model is instructed not to invent missing quantities.
3. **Retrieve** — search FoodData Central and fetch candidate nutrient records.
4. **Resolve** — choose/score candidates using deterministic rules plus a
   bounded model decision only where text ambiguity remains. Preserve
   alternatives and confidence.
5. **Convert** — convert the user's structured amount to edible grams using
   explicit unit/density/portion data. If conversion is unsupported, return a
   warning or `needsInput`; never use an invisible arbitrary portion.
6. **Calculate** — server code multiplies nutrients per 100 g by the converted
   weight, totals ingredients, and divides by servings.
7. **Adjust carefully** — cooking method may support documented retention/yield
   factors later. Do not let the model invent an oil-absorption percentage.
8. **Image consistency check (optional)** — a vision-capable model may flag an
   obvious mismatch such as ingredients mentioning soup while the image looks
   like cake. It does not calculate the portion or nutrients.
9. **Return provenance** — values, coverage, confidence, warnings, ingredient
   matches, source IDs, model/schema version, and fingerprint.
10. **Select explicitly** — accepting the result creates/updates the recipe's
    displayed nutrition snapshot; analysis alone does not publish it.

No nutrient arithmetic should come from free-form model prose.

## Suggested Structured Model Output

```json
{
  "ingredients": [
    {
      "recipeIngredientId": "opaque-id",
      "canonicalName": "olive oil",
      "preparation": null,
      "searchTerms": ["olive oil"],
      "quantityStatus": "provided",
      "ambiguity": "low",
      "notes": []
    }
  ],
  "missingInputs": [],
  "dishMethodHints": ["pan fried"],
  "warnings": []
}
```

Allowed quantity states should be an enum such as `provided`, `missing`,
`unsupportedUnit`, or `ambiguous`. Nutrient values are deliberately absent from
this model response; retrieval and server code supply them.

## API and Persistence

The target endpoints are documented in `docs/api-and-data-model.md`.

`nutrition_analyses` stores:

- recipe/requester IDs and status;
- canonical input fingerprint;
- provider/model and prompt/schema versions;
- food-data source/version;
- structured result, coverage/confidence, and warnings;
- safe error code;
- token/latency/cost metadata;
- created/completed times.

`nutrition_ingredient_matches` stores the recipe ingredient, normalized query,
selected source record ID, converted grams, confidence, and alternatives.

`recipe_nutrition` stores only the selected per-serving snapshot and source. It
may reference the accepted analysis. Never store private model reasoning.

Start synchronously. Set an application timeout and return a retryable failure
without creating duplicate attempts. If production measurements show requests
cannot finish reliably, keep the resource contract and change start to
`202 Accepted` plus polling; only then consider a background job/queue.

## Safety, Privacy, and Cost

- Display "Estimated nutrition; actual values vary by ingredients, brands,
  preparation, and portion size."
- Do not describe results as dietary/medical guidance or use them to diagnose.
- Send only fields needed for analysis; exclude email, profile, auth data, and
  private notes.
- Use temporary image access and avoid logging image URLs.
- Keep provider and FoodData keys server-only.
- Apply per-user and per-recipe rate limits, request deduplication, and a daily
  spend cap.
- Record usage/latency by provider/model without logging secrets or raw tokens.
- Define retention/deletion behavior before allowing real user data.

## Evaluation Plan and Launch Gate

Create a versioned internal evaluation set before integrating the real button:

- 50–100 representative recipes, including Hong Kong/Asian dishes;
- known ingredient weights/servings;
- independently calculated reference nutrition;
- ambiguous units, missing quantities, sauces/oils, branded foods, and cooking
  methods;
- a small set of deliberately mismatched/irrelevant photos.

Evaluate:

- structured-output/schema success rate;
- ingredient coverage and correct food-record match rate;
- quantity-to-grams conversion coverage;
- calorie/macronutrient error against reference;
- rate of unsupported inputs correctly requesting clarification;
- hallucinated quantities (target: zero);
- latency and cost per analysis;
- stale-fingerprint behavior and manual/remove fallback.

Initial release gates:

- 100% accepted responses pass Zod validation;
- zero silent invented quantities in the evaluation set;
- at least 90% of ingredient mass is covered for a displayed result;
- median calories-per-serving error no more than 15%, and 90th percentile no
  more than 30%, on eligible reference recipes;
- clear warning/`needsInput` for results below coverage/confidence thresholds;
- p95 latency and per-analysis cost fit an explicitly approved product budget;
- users can always skip, enter manual values, or remove the result.

If the accuracy gates are not met, ship manual nutrition only. The rest of the
app does not depend on AI nutrition.

## Delivery Order

1. Finalize structured ingredient/unit and nutrition schemas.
2. Persist recipe drafts and media.
3. Add manual nutrition end to end.
4. Build the evaluation fixture and deterministic FoodData calculation without
   AI for already-normalized ingredients.
5. Add model-assisted normalization behind a server feature flag.
6. Run offline evaluation and a developer-only Android pilot.
7. Tune prompt/matching thresholds; compare model variants.
8. Enable to a small beta only after the launch gate passes.

## Primary References

- [USDA FoodData Central API Guide](https://fdc.nal.usda.gov/api-guide.html)
- [FoodData Central downloadable data](https://fdc.nal.usda.gov/download-datasets/)
- [Nutrition5k, CVPR 2021](https://openaccess.thecvf.com/content/CVPR2021/html/Thames_Nutrition5k_Towards_Automatic_Nutritional_Understanding_of_Generic_Food_CVPR_2021_paper.html)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI image/vision inputs and limitations](https://developers.openai.com/api/docs/guides/images-vision)
- [OpenAI current model guidance](https://developers.openai.com/api/docs/guides/latest-model)
