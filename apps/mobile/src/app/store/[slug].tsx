import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, useWindowDimensions, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ListingRow, TiendaRow } from "@conectage/shared";
import { getStoreBySlug, getStoreListings } from "@/lib/queries";
import { useTranslation } from "@/i18n/context";
import { WhatsAppCTA } from "@/components/whatsapp-cta";
import { ListingCard } from "@/components/listing/listing-card";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { colors, shadow } from "@/theme";

const GAP = 12;
const PADDING = 16;

export default function StoreDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;

  const [store, setStore] = useState<TiendaRow | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getStoreBySlug(slug).then(async (result) => {
      setStore(result);
      if (result) setListings(await getStoreListings(result.owner_id));
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!store) {
    return (
      <View className="flex-1 bg-white">
        <EmptyState icon="storefront-outline" title={t("store.notFound")} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-50"
      data={listings}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ gap: GAP, paddingHorizontal: PADDING }}
      contentContainerStyle={{ paddingBottom: 28, gap: GAP }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="mb-2">
          {/* Banner */}
          {store.banner ? (
            <Image source={{ uri: store.banner }} style={{ width, height: 170 }} className="bg-neutral-200" />
          ) : (
            <View style={{ width, height: 140 }} className="bg-primary-soft" />
          )}

          {/* Store header card */}
          <View className="-mt-8 mx-4 rounded-3xl bg-white p-4" style={shadow.card}>
            <View className="flex-row items-center gap-3">
              <View className="rounded-2xl border-2 border-white" style={shadow.card}>
                <Avatar uri={store.logo} name={store.name} size={56} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-display text-xl text-neutral-900">{store.name}</Text>
                  {store.verified && <Icon name="checkmark-circle" size={17} color={colors.primary} />}
                </View>
                <View className="mt-0.5 flex-row items-center gap-3">
                  <View className="flex-row items-center gap-1">
                    <Icon name="location-outline" size={13} color={colors.faint} />
                    <Text className="font-sans text-xs text-neutral-500">{store.city}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Icon name="people-outline" size={13} color={colors.faint} />
                    <Text className="font-sans text-xs text-neutral-500">
                      {store.followers_count} {t("store.followers")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {!!store.tagline && (
              <Text className="mt-3 font-sans text-sm leading-5 text-neutral-600">{store.tagline}</Text>
            )}

            <View className="mt-4">
              <WhatsAppCTA
                phoneNumber={store.whatsapp}
                listingTitle={store.name}
                tiendaSlug={store.slug}
                message={`Hola, vi tu tienda ${store.name} en ConectaGE`}
                label={t("listing.contact")}
              />
            </View>
          </View>

          <Text className="px-4 pb-1 pt-5 font-sans-bold text-base text-neutral-900">{t("store.listings")}</Text>
        </View>
      }
      ListEmptyComponent={<EmptyState icon="pricetags-outline" title={t("browse.empty")} />}
      renderItem={({ item }) => (
        <View style={{ width: cardWidth }}>
          <ListingCard listing={item} onPress={() => router.push(`/listing/${item.slug}`)} />
        </View>
      )}
    />
  );
}
