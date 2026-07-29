import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import type { ListingRow } from "@conectage/shared";
import { isListingFeatured } from "@conectage/shared";
import { formatPrice } from "@/lib/format";
import { useTranslation } from "@/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useThemeColors, shadow } from "@/theme";

interface ListingCardProps {
  listing: ListingRow;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  favLoading?: boolean;
  /** Fixed width for horizontal carousels; omit for fluid grid cells. */
  width?: number;
}

/** Image-first card — the Wallapop/Vinted/OfferUp pattern, theme-aware. */
export function ListingCard({
  listing,
  onPress,
  isFavorite,
  onToggleFavorite,
  favLoading,
  width,
}: ListingCardProps) {
  const { t } = useTranslation();
  const theme = useThemeColors();
  const cover = listing.images?.[0];
  const conditionLabel = listing.condition ? t(`browse.condition.${listing.condition}`) : null;
  const featured = isListingFeatured(listing);

  return (
    <Pressable onPress={onPress} className="active:opacity-90" style={width ? { width } : undefined}>
      <View className="overflow-hidden rounded-2xl bg-card" style={shadow.card}>
        <View className="relative">
          {cover ? (
            <Image
              source={{ uri: cover }}
              style={{ width: "100%", aspectRatio: 1 }}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={{ width: "100%", aspectRatio: 1 }} className="items-center justify-center bg-fill">
              <Icon name="image-outline" size={28} color={theme.faint} />
            </View>
          )}

          {featured && (
            <View className="absolute left-2 top-2">
              <Badge label={t("browse.featured")} tone="featured" icon="star" />
            </View>
          )}
          {listing.listing_type === "wanted" && !featured && (
            <View className="absolute left-2 top-2">
              <Badge label={t("browse.wanted")} tone="solid-dark" />
            </View>
          )}

          {onToggleFavorite && (
            <View className="absolute right-2 top-2">
              <FavoriteButton active={!!isFavorite} onToggle={onToggleFavorite} loading={favLoading} />
            </View>
          )}
        </View>

        <View className="gap-1 p-3">
          <Text className="font-sans-bold text-base text-primary">{formatPrice(listing)}</Text>
          <Text numberOfLines={2} className="font-sans-medium text-sm leading-5 text-ink">
            {listing.title}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1">
            <Icon name="location-outline" size={12} color={theme.faint} />
            <Text numberOfLines={1} className="flex-1 font-sans text-xs text-subtle">
              {listing.city}
              {conditionLabel ? ` · ${conditionLabel}` : ""}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
