import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ListingRow, TiendaRow } from "@conectage/shared";
import { getStoreBySlug, getStoreListings } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { WhatsAppCTA } from "@/components/whatsapp-cta";

export default function StoreDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
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
        <ActivityIndicator color="#216FD1" />
      </View>
    );
  }

  if (!store) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-neutral-500">No se encontró esta tienda.</Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-white"
      data={listings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 12, gap: 12 }}
      ListHeaderComponent={
        <View className="mb-4 gap-3">
          {store.banner && <Image source={{ uri: store.banner }} className="h-32 w-full rounded-2xl bg-neutral-100" />}
          <Text className="font-display text-2xl font-bold text-neutral-900">{store.name}</Text>
          <Text className="text-neutral-500">{store.tagline}</Text>
          <Text className="text-sm text-neutral-500">{store.city}</Text>
          <WhatsAppCTA
            phoneNumber={store.whatsapp}
            listingTitle={store.name}
            tiendaSlug={store.slug}
            message={`Hola, vi tu tienda ${store.name} en ConectaGE`}
          />
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/listing/${item.slug}`)}
          className="flex-row gap-3 rounded-2xl border border-neutral-100 bg-white p-2 active:opacity-90"
        >
          <Image source={{ uri: item.images[0] }} className="h-16 w-16 rounded-xl bg-neutral-100" />
          <View className="flex-1 justify-center gap-1">
            <Text numberOfLines={1} className="font-semibold text-neutral-900">
              {item.title}
            </Text>
            <Text className="text-primary font-semibold">{formatPrice(item)}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}
