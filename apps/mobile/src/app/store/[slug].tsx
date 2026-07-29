import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useStore,
  useStoreListings,
  useStoreRating,
  useReviewsForStore,
  useFollowedSlugs,
  useToggleFollow,
  useFavorites,
  useCreateReview,
} from "@/lib/hooks";
import { qk } from "@/lib/query-client";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/i18n/context";
import { WhatsAppCTA } from "@/components/whatsapp-cta";
import { ListingCard } from "@/components/listing/listing-card";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Rating } from "@/components/ui/rating";
import { EmptyState } from "@/components/ui/empty-state";
import { ReviewList } from "@/components/reviews/review-list";
import { WriteReviewSheet } from "@/components/reviews/write-review-sheet";
import { useThemeColors, shadow } from "@/theme";

const GAP = 12;
const PADDING = 16;

export default function StoreDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useThemeColors();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;
  const [reviewOpen, setReviewOpen] = useState(false);

  const { data: store, isLoading } = useStore(slug);
  const { data: listings } = useStoreListings(store?.owner_id);
  const listingIds = useMemo(() => (listings ?? []).map((l) => l.id), [listings]);
  const { data: rating } = useStoreRating(slug, listingIds);
  const { data: reviews } = useReviewsForStore(slug, listingIds);
  const { data: followed } = useFollowedSlugs(user?.id);
  const toggleFollow = useToggleFollow(user?.id);
  const fav = useFavorites(user?.id);
  const createReview = useCreateReview([...qk.reviewsStore(slug)]);

  const following = new Set(followed ?? []).has(slug);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }
  if (!store) {
    return (
      <View className="flex-1 bg-bg">
        <EmptyState icon="storefront-outline" title={t("store.notFound")} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        className="flex-1 bg-bg"
        data={listings ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP, paddingHorizontal: PADDING }}
        contentContainerStyle={{ paddingBottom: 28, gap: GAP }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-2">
            {store.banner ? (
              <Image source={{ uri: store.banner }} style={{ width, height: 170 }} contentFit="cover" />
            ) : (
              <View style={{ width, height: 140 }} className="bg-primary-soft" />
            )}

            <View className="-mt-8 mx-4 rounded-3xl bg-card p-4" style={shadow.card}>
              <View className="flex-row items-center gap-3">
                <View className="rounded-2xl border-2 border-card" style={shadow.card}>
                  <Avatar uri={store.logo} name={store.name} size={56} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="font-display text-xl text-ink">{store.name}</Text>
                    {store.verified && <Icon name="checkmark-circle" size={17} color={theme.primary} />}
                  </View>
                  <View className="mt-0.5 flex-row items-center gap-3">
                    <Text className="font-sans text-xs text-subtle">{store.city}</Text>
                    <Text className="font-sans text-xs text-subtle">
                      {store.followers_count} {t("store.followers")}
                    </Text>
                    {rating && rating.count > 0 && <Rating value={rating.rating} count={rating.count} size={12} />}
                  </View>
                </View>
              </View>

              {!!store.tagline && <Text className="mt-3 font-sans text-sm leading-5 text-body">{store.tagline}</Text>}

              <View className="mt-4 flex-row gap-2.5">
                <Pressable
                  onPress={() =>
                    user ? toggleFollow.mutate({ slug, next: !following }) : router.push("/login")
                  }
                  className={`h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl active:opacity-80 ${
                    following ? "border border-line bg-card" : "bg-primary"
                  }`}
                >
                  <Icon
                    name={following ? "checkmark" : "add"}
                    size={18}
                    color={following ? theme.body : theme.primaryForeground}
                  />
                  <Text className={`font-sans-bold text-sm ${following ? "text-body" : "text-primary-foreground"}`}>
                    {following ? "Siguiendo" : "Seguir"}
                  </Text>
                </Pressable>
                <View className="flex-[1.4]">
                  <WhatsAppCTA
                    phoneNumber={store.whatsapp}
                    listingTitle={store.name}
                    tiendaSlug={store.slug}
                    message={`Hola, vi tu tienda ${store.name} en ConectaGE`}
                    label={t("listing.contact")}
                  />
                </View>
              </View>
            </View>

            <Text className="px-4 pb-1 pt-5 font-sans-bold text-base text-ink">{t("store.listings")}</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="pricetags-outline" title={t("browse.empty")} />}
        ListFooterComponent={
          <View className="mt-6 px-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-sans-bold text-base text-ink">Reseñas</Text>
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
        }
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <ListingCard
              listing={item}
              onPress={() => router.push(`/listing/${item.slug}`)}
              isFavorite={fav.enabled ? fav.has(item.slug) : undefined}
              onToggleFavorite={fav.enabled ? () => fav.toggle(item.slug) : undefined}
            />
          </View>
        )}
      />

      <WriteReviewSheet
        visible={reviewOpen}
        onClose={() => setReviewOpen(false)}
        submitting={createReview.isPending}
        onSubmit={(r, comment) =>
          createReview.mutate(
            { reviewerId: user!.id, tiendaSlug: slug, rating: r, comment },
            { onSuccess: () => setReviewOpen(false) },
          )
        }
      />
    </>
  );
}
