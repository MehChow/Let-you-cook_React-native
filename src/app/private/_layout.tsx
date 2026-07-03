import { Stack } from "expo-router";

export default function PrivateLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-recipe/index" />
      <Stack.Screen name="add-recipe/preview" />
      <Stack.Screen name="recipe/[recipeId]" />
      <Stack.Screen
        name="recipe/[recipeId]/reviews"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.6],
          sheetExpandsWhenScrolledToEdge: false,
          sheetCornerRadius: 24,
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.7],
          sheetExpandsWhenScrolledToEdge: false,
          sheetCornerRadius: 24,
        }}
      />
      <Stack.Screen
        name="filters"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.62],
          sheetExpandsWhenScrolledToEdge: false,
          sheetCornerRadius: 24,
        }}
      />
    </Stack>
  );
}
