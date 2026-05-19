# Calories Step UI Implementation

## Overview

The add-recipe wizard calories step now supports two nutrition entry modes:

- `AI Calculator`: local demo flow with `idle -> loading -> success` states
- `Manual input`: live macro entry with derived calories and animated ring updates

The implementation is fully UI-only for now. No backend calls are made.

## File Responsibilities

- `src/features/add-recipe/sections/CaloriesSection.tsx`
  - Step-level UI composition
  - Tabs for AI/manual mode
  - AI and manual mode state rendering
- `src/features/add-recipe/hooks/useCaloriesSection.ts`
  - Form watching
  - Macro parsing
  - Calorie derivation
  - Ring segment derivation
  - Local demo AI state machine
- `src/features/add-recipe/components/calories/NutritionSummary.tsx`
  - Shared calorie ring
  - Macro list and macro input layout
  - Shared summary card for editable and read-only states

## Form Fields

The wizard form now stores:

- `nutritionMode: "ai" | "manual"`
- `nutritionProteinGrams: string`
- `nutritionCarbsGrams: string`
- `nutritionFatGrams: string`

The following values are derived and intentionally not stored in the form:

- `totalCalories`
- per-macro calorie contribution
- ring segment percentages
- manual completeness state
- local AI demo state

## Derivation Rules

Manual calories are computed from macro grams:

- protein: `grams * 4`
- carbs: `grams * 4`
- fat: `grams * 9`

Total calories:

```text
totalCalories = protein*4 + carbs*4 + fat*9
```

Ring segment size is based on calorie contribution, not raw grams.

The ring animates clockwise in this order:

1. protein
2. carbs
3. fat

Manual mode updates live from the first valid input. Blank fields are treated as zero.

## Current AI Demo Behavior

The AI tab is intentionally local-only for this implementation:

- `Analyze` triggers a temporary loading state
- loading resolves to a fixed demo result
- `Remove` clears the result and returns to the default state

The demo result currently uses:

- protein: `7g`
- carbs: `48g`
- fat: `40g`
- total: `580 kcal`

## Backend Integration Guide

### Suggested Request Contract

When backend integration is ready, the AI tab can replace the local demo flow with a request shaped like:

```json
{
  "recipeName": "string",
  "description": "string",
  "servings": 4,
  "ingredients": [
    {
      "name": "Chicken breast",
      "amount": "500",
      "unit": "g"
    }
  ],
  "steps": [
    {
      "instruction": "Cook over medium heat"
    }
  ]
}
```

### Suggested Response Contract

```json
{
  "proteinGrams": 7,
  "carbsGrams": 48,
  "fatGrams": 40,
  "totalCalories": 580,
  "source": "ai"
}
```

### Integration Steps

1. Replace the local timeout in `useCaloriesSection.ts` with a mutation or async action.
2. Map the response fields into the same summary shape already used by the shared component.
3. Keep `nutritionMode` in form state as-is.
4. Decide whether AI nutrition values should remain derived-only or also be persisted into dedicated saved fields.
5. Add failure handling for API and network errors and show a retry state in the AI card.

## Recommended Future Additions

- explicit AI error state
- nutrition confidence or source metadata
- persisted AI nutrition payload for final recipe save
- edit-after-AI flow that seeds manual mode from the AI result
