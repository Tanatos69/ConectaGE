import { FlatList, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { useFavoriteListings, useFavorites } from "@/lib/hooks";
import { useTranslation } from "@/i18n/context";
import { Screen } from "@/components/ui/screen";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { AuthGate } from "@/components/auth-gate";
import { ListingCard } from "@/components/listing/listing-card";

const GAP = 12;
const PADDING = 16;

export default function FavoritesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { width } = useWindowDimensions();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;

  const { data: listings, isLoading } = useFavoriteListings(user?.id);
  const fav = useFavorites(user?.id);

  if (!loading && !user) {
    return (
      <Screen>
        <View className="px-4 pt-2">
          <Text className="font-display text-2xl text-ink">{t("tabs.favorites")}</Text>
        </View>
        <AuthGate subtitle="Guarda anuncios para verlos aquí y recibir avisos." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="px-4 pb-1 pt-2">
        <Text className="font-display text-2xl text-ink">{t("tabs.favorites")}</Text>
      </View>
      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <FlatList
          data={listings ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP, paddingHorizontal: PADDING }}
          contentContainerStyle={{ paddingBottom: 24, gap: GAP, paddingTop: 6 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="Aún no tienes favoritos"
              subtitle="Toca el corazón en cualquier anuncio para guardarlo."
              actionLabel="Explorar anuncios"
              onAction={() => router.push("/")}
            />
          }
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <ListingCard
                listing={item}
                onPress={() => router.push(`/listing/${item.slug}`)}
                isFavorite={fav.has(item.slug)}
                onToggleFavorite={() => fav.toggle(item.slug)}
              />
            </View>
          )}
        />
      )}
    </Screen>
  );
}
