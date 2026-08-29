import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import type { ListingRow } from "@gemarket/shared";
import { BRAND, categories, DEFAULT_CITY, isListingFeatured } from "@gemarket/shared";
import { useListings, useFavorites } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useTranslation } from "@/i18n/context";
import { Screen } from "@/components/ui/screen";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/listing/listing-card";
import { CategoryTile } from "@/components/category-tile";
import { LocationPill } from "@/components/location-pill";
import { useThemeColors } from "@/theme";

const GAP = 12;
const PADDING = 16;

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useThemeColors();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;

  const [city, setCity] = useState(DEFAULT_CITY);
  const { data: listings, isLoading, refetch, isRefetching } = useListings();
  const fav = useFavorites(user?.id);

  const featured = useMemo(() => (listings ?? []).filter(isListingFeatured).slice(0, 8), [listings]);
  const recent = useMemo(() => {
    const all = listings ?? [];
    if (!city || city === "Todas") return all;
    const inCity = all.filter((l) => l.city === city);
    return inCity.length > 0 ? inCity : all;
  }, [listings, city]);

  function goPublish() {
    router.push(user ? "/publish" : "/login");
  }

  if (!isSupabaseConfigured) {
    return (
      <Screen>
        <EmptyState icon="cloud-offline-outline" title={BRAND.name} subtitle={t("browse.notConfigured")} />
      </Screen>
    );
  }

  const renderFav = (item: ListingRow) => ({
    isFavorite: fav.enabled ? fav.has(item.slug) : undefined,
    onToggleFavorite: fav.enabled ? () => fav.toggle(item.slug) : undefined,
  });

  return (
    <Screen>
      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP, paddingHorizontal: PADDING }}
        contentContainerStyle={{ paddingBottom: 24, gap: GAP }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />
        }
        ListHeaderComponent={
          <View className="gap-4 pb-1">
            {/* Header: location + publish (no logo) */}
            <View className="flex-row items-center justify-between px-4 pt-1">
              <View>
                <Text className="font-sans text-xs text-subtle">{t("home.near")}</Text>
                <LocationPill city={city} onChange={setCity} />
              </View>
              <Pressable
                onPress={goPublish}
                className="h-11 flex-row items-center gap-1.5 rounded-full bg-primary px-4 active:opacity-90"
              >
                <Icon name="add" size={20} color={theme.primaryForeground} />
                <Text className="font-sans-bold text-sm text-primary-foreground">{t("home.publish")}</Text>
              </Pressable>
            </View>

            {/* Tappable search bar → Search tab */}
            <Pressable
              onPress={() => router.push("/search")}
              className="mx-4 h-12 flex-row items-center gap-2.5 rounded-2xl border border-line bg-card px-4 active:opacity-90"
            >
              <Icon name="search-outline" size={18} color={theme.faint} />
              <Text className="font-sans text-base text-faint">{t("browse.searchPlaceholder")}</Text>
            </Pressable>

            {/* Category shortcuts */}
            <View>
              <SectionHeader title={t("home.categories")} actionLabel={t("home.seeAll")} onAction={() => router.push("/search")} />
              <FlatList
                horizontal
                data={categories}
                keyExtractor={(c) => c.slug}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: PADDING, gap: 14 }}
                renderItem={({ item }) => (
                  <CategoryTile category={item} onPress={() => router.push(`/search?cat=${item.slug}`)} />
                )}
              />
            </View>

            {/* Featured carousel */}
            {featured.length > 0 && (
              <View>
                <SectionHeader title={t("home.featured")} />
                <FlatList
                  horizontal
                  data={featured}
                  keyExtractor={(l) => l.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: PADDING, gap: GAP }}
                  renderItem={({ item }) => (
                    <ListingCard
                      listing={item}
                      width={170}
                      onPress={() => router.push(`/listing/${item.slug}`)}
                      {...renderFav(item)}
                    />
                  )}
                />
              </View>
            )}

            <SectionHeader title={t("home.recent")} />
          </View>
        }
        ListEmptyComponent={
          isLoading ? <SkeletonGrid /> : <EmptyState icon="pricetags-outline" title={t("browse.empty")} />
        }
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <ListingCard listing={item} onPress={() => router.push(`/listing/${item.slug}`)} {...renderFav(item)} />
          </View>
        )}
      />
    </Screen>
  );
}
