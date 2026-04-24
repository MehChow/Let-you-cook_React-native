import SectionHeader from "@/components/SectionHeader";
import { ScrollView, View } from "react-native";

import { Grid } from "@/components/Icon";
import CategoryCarousel from "@/features/home/CategoryCarousel";
import HomeHeader from "@/features/home/HomeHeader";
import PopularRecipeCard from "@/features/home/PopularRecipeCard";
import TodaySpecialCard from "@/features/home/TodaySpecialCard";
import { useCategoryStore } from "@/features/home/categoryStore";
import {
  categories,
  homeGreeting,
  mockAvatar,
  popularRecipes,
  todaySpecial,
} from "@/features/home/mockData";
import * as React from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const selectedCategoryId = useCategoryStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useCategoryStore((s) => s.setSelectedCategoryId);
  const [favourites, setFavourites] = React.useState<Record<string, boolean>>(
    {}
  );

  return (
    <View className="flex-1 bg-sage-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 gap-5"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 12) + 110,
        }}
      >
        <HomeHeader
          className="mt-4"
          title={homeGreeting.title}
          subtitle={homeGreeting.subtitle}
        />

        <View className="gap-1">
          <SectionHeader title="Today's special" />
          <TodaySpecialCard
            className=""
            title={todaySpecial.title}
            timeMin={todaySpecial.timeMin}
            calories={todaySpecial.calories}
            serving={todaySpecial.serving}
            rating={todaySpecial.rating}
            placeholderClassName={todaySpecial.imagePlaceholderClass}
            imageSource={todaySpecial.image}
            userAvatarSource={mockAvatar}
          />
        </View>

        <View className="gap-1">
          <SectionHeader
            title="Categories"
            actionLabel="See all"
            actionIcon={Grid}
            onPressAction={() => router.push("/modal")}
          />
          <CategoryCarousel
            className=""
            items={categories.map((c) => ({
              id: c.id,
              label: c.label,
              placeholderColorClass: c.placeholderColorClass,
              imageSource: c.imageThumb,
            }))}
            selectedId={selectedCategoryId ?? undefined}
            onSelect={(id) =>
              setSelectedCategoryId(selectedCategoryId === id ? null : id)
            }
          />
        </View>

        <View className="gap-1">
          <SectionHeader
            title="Popular recipes"
            actionLabel="See more ›"
            onPressAction={() => {}}
          />
          <View className="gap-4">
            {popularRecipes.map((r) => (
              <PopularRecipeCard
                key={r.id}
                title={r.title}
                description={r.description}
                author={r.author}
                authorAvatar={mockAvatar}
                timeMin={r.timeMin}
                calories={r.calories}
                serving={r.serving}
                rating={r.rating}
                tag={r.tag}
                imagePlaceholderClass={r.imagePlaceholderClass}
                imageSource={r.image}
                isFavourite={Boolean(favourites[r.id])}
                onChangeFavourite={(next) =>
                  setFavourites((prev) => ({ ...prev, [r.id]: next }))
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
