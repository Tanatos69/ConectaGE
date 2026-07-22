import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import type { ListingRow, Profile } from "@conectage/shared";
import { getListingBySlug } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { WhatsAppCTA } from "@/components/whatsapp-cta";

export default function ListingDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [data, setData] = useState<{ listing: ListingRow; seller: Profile | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getListingBySlug(slug).then((result) => {
      setData(result);
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

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-neutral-500">No se encontró este anuncio.</Text>
      </View>
    );
  }

  const { listing, seller } = data;
  const phone = listing.show_phone ? listing.phone : listing.whatsapp;

  return (
    <ScrollView className="flex-1 bg-white">
      <Image source={{ uri: listing.images[0] }} className="h-72 w-full bg-neutral-100" resizeMode="cover" />
      <View className="gap-3 p-4">
        <Text className="font-display text-2xl font-bold text-neutral-900">{listing.title}</Text>
        <Text className="text-primary text-xl font-bold">{formatPrice(listing)}</Text>
        <Text className="text-neutral-500">
          {listing.city}, {listing.region}
        </Text>
        <Text className="text-neutral-700">{listing.description}</Text>
        {seller && <Text className="text-sm text-neutral-500">Vendedor: {seller.full_name}</Text>}
        <View className="mt-2">
          <WhatsAppCTA phoneNumber={phone} listingTitle={listing.title} listingSlug={listing.slug} />
        </View>
      </View>
    </ScrollView>
  );
}
