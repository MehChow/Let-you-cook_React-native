export const CURATED_CATEGORIES = [
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000001",
    slug: "breakfast",
    displayName: "Breakfast",
    sortOrder: 10,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000002",
    slug: "lunch",
    displayName: "Lunch",
    sortOrder: 20,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000003",
    slug: "dinner",
    displayName: "Dinner",
    sortOrder: 30,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000004",
    slug: "dessert",
    displayName: "Dessert",
    sortOrder: 40,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000005",
    slug: "drinks",
    displayName: "Drinks",
    sortOrder: 50,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000006",
    slug: "vegan",
    displayName: "Vegan",
    sortOrder: 60,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000007",
    slug: "other",
    displayName: "Other",
    sortOrder: 70,
    isActive: true,
  },
] as const;

export const OTHER_CATEGORY_ID = CURATED_CATEGORIES[6].id;
