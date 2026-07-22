import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import type { ListingRow } from "@conectage/shared";
import { getPublishedListings } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useTranslation } from "@/i18n/context";
import { Screen } from "@/components/ui/screen";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { LanguagePicker } from "@/components/language-picker";
import { ListingCard } from "@/components/listing/listing-card";
import { colors } from "@/theme";

const GAP = 12;
const PADDING = 16;

export default function BrowseScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;

  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const data = await getPublishedListings();
    setListings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (l) => l.title.toLowerCase().includes(q) || l.city?.toLowerCase().includes(q),
    );
  }, [listings, query]);

  if (!isSupabaseConfigured) {
    return (
      <Screen>
        <EmptyState icon="cloud-offline-outline" title="ConectaGE" subtitle={t("browse.notConfigured")} />
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-1">
        <Text className="font-display text-2xl text-primary">{t("browse.title")}</Text>
        <LanguagePicker />
      </View>

      {/* Search */}
      <View className="px-4 pb-2">
        <View className="h-12 flex-row items-center gap-2.5 rounded-2xl border border-neutral-200 bg-white px-4">
          <Icon name="search-outline" size={18} color={colors.faint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("browse.searchPlaceholder")}
            placeholderTextColor={colors.faint}
            returnKeyType="search"
            className="flex-1 font-sans text-base text-neutral-900"
          />
          {query.length > 0 && (
            <Icon name="close-circle" size={18} color={colors.faint} />
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP, paddingHorizontal: PADDING }}
          contentContainerStyle={{ paddingBottom: 24, gap: GAP }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            filtered.length > 0 ? (
              <Text className="px-4 pb-2 pt-1 font-sans-bold text-base text-neutral-900">
                {t("browse.resultsNearby")}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState icon="pricetags-outline" title={t("browse.empty")} />
          }
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <ListingCard listing={item} onPress={() => router.push(`/listing/${item.slug}`)} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}
