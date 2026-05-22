import type {
  CookingTime,
  SortBy,
} from "@/features/search/filterStore";

export const sortOptions: { value: SortBy; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "top_rated", label: "Top rated" },
  { value: "newest", label: "Newest" },
  { value: "quickest", label: "Quickest" },
];

export const cookingTimeOptions: {
  value: CookingTime;
  label: string;
}[] = [
  { value: "any", label: "Any" },
  { value: "lt_15", label: "< 15 min" },
  { value: "lt_30", label: "< 30 min" },
  { value: "lt_60", label: "< 1 hr" },
  { value: "lt_120", label: "< 2 hr" },
];
