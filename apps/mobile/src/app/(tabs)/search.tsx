import { useMemo, useState, useEffect } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ListingRow, SearchCriteria } from "@conectage/shared";
import { filterListings, activeFilterCount, hasActiveFilters, describeCriteria } from "@conectage/shared";
import { useListings, useFavorites, useCreateSavedSearch } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useTranslation } from "@/i18n/context";
import { Screen } from "@/components/ui/screen";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/listing/listing-card";
import { FiltersSheet } from "@/components/search/filters-sheet";
import { useThemeColors } from "@/theme";

const GAP = 12;
const PADDING = 16;

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useThemeColors();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;

  const params = useLocalSearchParams<{ cat?: string; q?: string }>();
  const [criteria, setCriteria] = useState<SearchCriteria>({});
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (params.cat) setCriteria((c) => ({ ...c, category: params.cat }));
    if (params.q) setQuery(params.q);
  }, [params.cat, params.q]);

  const { data: listings, isLoading } = useListings();
  const fav = useFavorites(user?.id);
  const saveSearch = useCreateSavedSearch(user?.id ?? "");

  const effective = useMemo<SearchCriteria>(() => ({ ...criteria, q: query.trim() || undefined }), [criteria, query]);
  const results = useMemo(() => filterListings(listings ?? [], effective), [listings, effective]);
  const filterCount = activeFilterCount(criteria);

  function onSave() {
    if (!user) {
      router.push("/login");
      return;
    }
    saveSearch.mutate(
      { label: describeCriteria(effective), criteria: effective, alerts: true },
      { onSuccess: () => Alert.alert(t("search.saved"), describeCriteria(effective)) },
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <Screen>
        <EmptyState icon="cloud-offline-outline" title={t("search.title")} subtitle={t("browse.notConfigured")} />
      </Screen>
    );
  }

  const renderFav = (item: ListingRow) => ({
    isFavorite: fav.enabled ? fav.has(item.slug) : undefined,
    onToggleFavorite: fav.enabled ? () => fav.toggle(item.slug) : undefined,
  });

  return (
    <Screen>
      {/* Search bar + filters button */}
      <View className="flex-row items-center gap-2.5 px-4 pb-2 pt-1">
        <View className="h-12 flex-1 flex-row items-center gap-2.5 rounded-2xl border border-line bg-card px-4">
          <Icon name="search-outline" size={18} color={theme.faint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("search.placeholder")}
            placeholderTextColor={theme.faint}
            returnKeyType="search"
            autoFocus={!params.cat}
            className="flex-1 font-sans text-base text-ink"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Icon name="close-circle" size={18} color={theme.faint} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          className="h-12 w-12 items-center justify-center rounded-2xl border border-line bg-card active:opacity-80"
        >
          <Icon name="options-outline" size={20} color={theme.ink} />
          {filterCount > 0 && (
            <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-primary">
              <Text className="font-sans-bold text-[10px] text-primary-foreground">{filterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Result count + save */}
      <View className="flex-row items-center justify-between px-4 pb-1 pt-1">
        <Text className="font-sans text-sm text-subtle">
          {results.length} {t("search.results")}
        </Text>
        {hasActiveFilters(effective) && (
          <Pressable onPress={onSave} hitSlop={8} className="flex-row items-center gap-1 active:opacity-70">
            <Icon name="bookmark-outline" size={16} color={theme.primary} />
            <Text className="font-sans-medium text-sm text-primary">{t("search.save")}</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP, paddingHorizontal: PADDING }}
          contentContainerStyle={{ paddingBottom: 24, gap: GAP, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<EmptyState icon="search-outline" title={t("search.noResults")} />}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <ListingCard listing={item} onPress={() => router.push(`/listing/${item.slug}`)} {...renderFav(item)} />
            </View>
          )}
        />
      )}

      <FiltersSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={criteria}
        onChange={setCriteria}
        onClear={() => setCriteria({})}
      />
    </Screen>
  );
}
