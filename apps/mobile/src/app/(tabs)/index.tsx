import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { ListingRow } from "@conectage/shared";
import { getPublishedListings } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useTranslation } from "@/i18n/context";
import { languages } from "@/i18n/languages";

export default function BrowseScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getPublishedListings();
    setListings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Standard fetch-on-mount — the lint rule's "no setState in effect" heuristic
    // flags any useCallback that eventually sets state, including this one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isSupabaseConfigured) load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (!isSupabaseConfigured) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-base text-neutral-500">
          Supabase no está configurado (faltan variables de entorno EXPO_PUBLIC_SUPABASE_*).
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-between border-b border-neutral-100 px-4 py-3">
        <Text className="font-display text-xl font-bold text-neutral-900">{t("browse.title")}</Text>
        <View className="flex-row gap-1">
          {languages.map((lang) => (
            <Pressable key={lang.code} onPress={() => setLanguage(lang)} hitSlop={6}>
              <Text style={{ opacity: lang.code === language.code ? 1 : 0.35, fontSize: 16 }}>
                {lang.flag}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? <Text className="mt-12 text-center text-neutral-500">{t("browse.empty")}</Text> : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/listing/${item.slug}`)}
            className="flex-row gap-3 rounded-2xl border border-neutral-100 bg-white p-2 active:opacity-90"
          >
            <Image
              source={{ uri: item.images[0] }}
              className="h-20 w-20 rounded-xl bg-neutral-100"
              resizeMode="cover"
            />
            <View className="flex-1 justify-center gap-1">
              <Text numberOfLines={1} className="font-semibold text-neutral-900">
                {item.title}
              </Text>
              <Text className="text-primary font-semibold">{formatPrice(item)}</Text>
              <Text className="text-xs text-neutral-500">{item.city}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
