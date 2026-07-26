import { act, cleanup, renderHook } from "@testing-library/react-native";
import { router } from "expo-router";

import { useRecipeDetailScreen } from "@/features/recipe-detail/hooks/useRecipeDetailScreen";

jest.mock("@/data/images", () => ({
  images: new Proxy(
    {},
    {
      get: (_target, property) => String(property),
    },
  ),
}));

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

const mockRouterPush = jest.mocked(router.push);

describe("useRecipeDetailScreen", () => {
  afterEach(() => {
    cleanup();
    mockRouterPush.mockClear();
  });

  it("opens reviews inside the protected recipe route", () => {
    const { result } = renderHook(() =>
      useRecipeDetailScreen({ recipeId: "today-1" }),
    );

    act(() => {
      result.current.handleOpenReviews();
    });

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/private/recipe/today-1/reviews",
    );
  });
});
