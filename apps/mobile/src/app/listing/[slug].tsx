import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isListingFeatured } from "@conectage/shared";
import { useListing, useFavorites, useReviewsForListing, useCreateReview } from "@/lib/hooks";
import { qk } from "@/lib/query-client";
import { incrementListingViews } from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/format";
import { useTranslation } from "@/i18n/context";
import { WhatsAppCTA } from "@/components/whatsapp-cta";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { Rating } from "@/components/ui/rating";
import { ReviewList } from "@/components/reviews/review-list";
import { WriteReviewSheet } from "@/components/reviews/write-review-sheet";
import { useThemeColors, shadow } from "@/theme";

export default function ListingDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useThemeColors();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);

  const { data, isLoading } = useListing(slug);
  const fav = useFavorites(user?.id);
  const listingId = data?.listing?.id;
  const { data: reviews } = useReviewsForListing(listingId);
  const createReview = useCreateReview(qk.reviewsListing(listingId ?? ""));

  useEffect(() => {
    if (slug) incrementListingViews(slug);
  }, [slug]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }
  if (!data) {
    return (
      <View className="flex-1 bg-bg">
        <EmptyState icon="alert-circle-outline" title={t("listing.notFound")} />
      </View>
    );
  }

  const { listing, seller } = data;
  const phone = listing.show_phone ? listing.phone : listing.whatsapp;
  const images = listing.images?.length ? listing.images : [];
  const conditionLabel = listing.condition ? t(`browse.condition.${listing.condition}`) : null;
  const avgRating = reviews && reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <View className="flex-1 bg-bg">
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
                <Image source={{ uri: item }} style={{ width, height: width }} contentFit="cover" />
              )}
            />
            {images.length > 1 && (
              <View className="absolute bottom-3 w-full flex-row justify-center gap-1.5">
                {images.map((_, i) => (
                  <View key={i} className={`h-1.5 rounded-full ${i === page ? "w-4 bg-white" : "w-1.5 bg-white/60"}`} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={{ width, height: width * 0.7 }} className="items-center justify-center bg-fill">
            <Icon name="image-outline" size={40} color={theme.faint} />
          </View>
        )}

        {/* Favorite overlay */}
        {fav.enabled && (
          <View className="absolute right-4 top-14">
            <FavoriteButton active={fav.has(listing.slug)} onToggle={() => fav.toggle(listing.slug)} size={22} />
          </View>
        )}

        {/* Content card */}
        <View className="-mt-4 rounded-t-3xl bg-card px-5 pt-5">
          <View className="flex-row flex-wrap gap-2">
            {isListingFeatured(listing) && <Badge label={t("browse.featured")} tone="featured" icon="star" />}
            {conditionLabel && <Badge label={conditionLabel} tone="primary" />}
            {listing.listing_type === "wanted" && <Badge label={t("browse.wanted")} tone="neutral" />}
          </View>

          <Text className="mt-3 font-display text-2xl leading-8 text-ink">{listing.title}</Text>
          <Text className="mt-1 font-sans-bold text-2xl text-primary">{formatPrice(listing)}</Text>

          <View className="mt-3 flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Icon name="location-outline" size={15} color={theme.muted} />
              <Text className="font-sans text-sm text-subtle">
                {listing.city}
                {listing.region ? `, ${listing.region}` : ""}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon name="eye-outline" size={15} color={theme.muted} />
              <Text className="font-sans text-sm text-subtle">{listing.views_count}</Text>
            </View>
          </View>

          {!!listing.description && (
            <View className="mt-5 border-t border-hairline pt-4">
              <Text className="font-sans-bold text-base text-ink">{t("listing.description")}</Text>
              <Text className="mt-2 font-sans text-[15px] leading-6 text-body">{listing.description}</Text>
            </View>
          )}

          {seller && (
            <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-hairline bg-bg p-3">
              <Avatar uri={seller.avatar_url} name={seller.full_name} size={44} />
              <View className="flex-1">
                <Text className="font-sans text-xs text-subtle">{t("listing.seller")}</Text>
                <View className="flex-row items-center gap-1">
                  <Text className="font-sans-bold text-base text-ink">{seller.full_name}</Text>
                  {seller.verified && <Icon name="checkmark-circle" size={15} color={theme.primary} />}
                </View>
              </View>
            </View>
          )}

          {/* Reviews */}
          <View className="mt-6 border-t border-hairline pt-4">
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="font-sans-bold text-base text-ink">Reseñas</Text>
                {reviews && reviews.length > 0 && <Rating value={avgRating} count={reviews.length} />}
              </View>
              <Pressable
                onPress={() => (user ? setReviewOpen(true) : router.push("/login"))}
                hitSlop={8}
                className="flex-row items-center gap-1 active:opacity-70"
              >
                <Icon name="create-outline" size={16} color={theme.primary} />
                <Text className="font-sans-medium text-sm text-primary">Escribir</Text>
              </Pressable>
            </View>
            <ReviewList reviews={reviews ?? []} />
          </View>
        </View>
      </ScrollView>

      {/* Sticky contact bar */}
      <View
        className="absolute bottom-0 w-full border-t border-hairline bg-card px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12, ...shadow.float }}
      >
        <WhatsAppCTA phoneNumber={phone} listingTitle={listing.title} listingSlug={listing.slug} label={t("listing.contact")} />
      </View>

      <WriteReviewSheet
        visible={reviewOpen}
        onClose={() => setReviewOpen(false)}
        submitting={createReview.isPending}
        onSubmit={(rating, comment) =>
          createReview.mutate(
            { reviewerId: user!.id, listingId: listing.id, rating, comment },
            { onSuccess: () => setReviewOpen(false) },
          )
        }
      />
    </View>
  );
}
