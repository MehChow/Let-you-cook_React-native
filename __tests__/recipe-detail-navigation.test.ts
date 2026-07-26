import type { Href } from "expo-router";

import { pushRecipeDetail } from "@/features/recipe-detail/navigation";

describe("pushRecipeDetail", () => {
  it("opens the protected recipe route with an encoded identifier", () => {
    let destination: Href | undefined;
    const router = {
      push: (href: Href) => {
        destination = href;
      },
    };

    pushRecipeDetail(router, "pepper wings/42");

    expect(destination).toBe("/private/recipe/pepper%20wings%2F42");
  });
});
