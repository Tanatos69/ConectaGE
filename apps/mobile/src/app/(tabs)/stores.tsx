import { FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { useStores, useFollowedSlugs, useToggleFollow } from "@/lib/hooks";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useTranslation } from "@/i18n/context";
import { Screen } from "@/components/ui/screen";
import { EmptyState } from "@/components/ui/empty-state";
import { StoreCard } from "@/components/store/store-card";

export default function StoresScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: stores, isLoading, refetch, isRefetching } = useStores();
  const { data: followed } = useFollowedSlugs(user?.id);
  const toggleFollow = useToggleFollow(user?.id);
  const followingSet = new Set(followed ?? []);

  if (!isSupabaseConfigured) {
    return (
      <Screen>
        <EmptyState icon="cloud-offline-outline" title={t("tabs.stores")} subtitle={t("browse.notConfigured")} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="px-4 pb-1 pt-2">
        <Text className="font-display text-2xl text-ink">{t("tabs.stores")}</Text>
      </View>
      <FlatList
        data={stores ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 14, paddingTop: 6 }}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-20">
              <Text className="font-sans text-sm text-subtle">Cargando…</Text>
            </View>
          ) : (
            <EmptyState icon="storefront-outline" title="No hay tiendas todavía" />
          )
        }
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            onPress={() => router.push(`/store/${item.slug}`)}
            following={followingSet.has(item.slug)}
            onToggleFollow={
              user
                ? () => toggleFollow.mutate({ slug: item.slug, next: !followingSet.has(item.slug) })
                : () => router.push("/login")
            }
          />
        )}
      />
    </Screen>
  );
}
