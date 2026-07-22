import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ListingRow, Profile } from "@conectage/shared";
import { getListingBySlug } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { useTranslation } from "@/i18n/context";
import { WhatsAppCTA } from "@/components/whatsapp-cta";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { colors, shadow } from "@/theme";

export default function ListingDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<{ listing: ListingRow; seller: Profile | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

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
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 bg-white">
        <EmptyState icon="alert-circle-outline" title={t("listing.notFound")} />
      </View>
    );
  }

  const { listing, seller } = data;
  const phone = listing.show_phone ? listing.phone : listing.whatsapp;
  const images = listing.images?.length ? listing.images : [];
  const conditionLabel = listing.condition ? t(`browse.condition.${listing.condition}`) : null;

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Gallery */}
        {images.length > 0 ? (
          <View>
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(uri, i) => `${uri}-${i}`}
              onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={{ width, height: width }} className="bg-neutral-100" />
              )}
            />
            {images.length > 1 && (
              <View className="absolute bottom-3 w-full flex-row justify-center gap-1.5">
                {images.map((_, i) => (
                  <View
                    key={i}
                    className={`h-1.5 rounded-full ${i === page ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={{ width, height: width * 0.7 }} className="items-center justify-center bg-neutral-100">
            <Icon name="image-outline" size={40} color={colors.faint} />
          </View>
        )}

        {/* Content card overlapping the gallery */}
        <View className="-mt-4 rounded-t-3xl bg-white px-5 pt-5">
          <View className="flex-row flex-wrap gap-2">
            {listing.is_featured && <Badge label={t("browse.featured")} tone="featured" icon="star" />}
            {conditionLabel && <Badge label={conditionLabel} tone="primary" />}
            {listing.listing_type === "wanted" && <Badge label={t("browse.wanted")} tone="neutral" />}
          </View>

          <Text className="mt-3 font-display text-2xl leading-8 text-neutral-900">{listing.title}</Text>
          <Text className="mt-1 font-sans-bold text-2xl text-primary">{formatPrice(listing)}</Text>

          <View className="mt-3 flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Icon name="location-outline" size={15} color={colors.muted} />
              <Text className="font-sans text-sm text-neutral-500">
                {listing.city}
                {listing.region ? `, ${listing.region}` : ""}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon name="eye-outline" size={15} color={colors.muted} />
              <Text className="font-sans text-sm text-neutral-500">{listing.views_count}</Text>
            </View>
          </View>

          {!!listing.description && (
            <View className="mt-5 border-t border-neutral-100 pt-4">
              <Text className="font-sans-bold text-base text-neutral-900">{t("listing.description")}</Text>
              <Text className="mt-2 font-sans text-[15px] leading-6 text-neutral-700">{listing.description}</Text>
            </View>
          )}

          {seller && (
            <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
              <Avatar uri={seller.avatar_url} name={seller.full_name} size={44} />
              <View className="flex-1">
                <Text className="font-sans text-xs text-neutral-500">{t("listing.seller")}</Text>
                <View className="flex-row items-center gap-1">
                  <Text className="font-sans-bold text-base text-neutral-900">{seller.full_name}</Text>
                  {seller.verified && <Icon name="checkmark-circle" size={15} color={colors.primary} />}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky contact bar */}
      <View
        className="absolute bottom-0 w-full border-t border-neutral-100 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12, ...shadow.float }}
      >
        <WhatsAppCTA
          phoneNumber={phone}
          listingTitle={listing.title}
          listingSlug={listing.slug}
          label={t("listing.contact")}
        />
      </View>
    </View>
  );
}
