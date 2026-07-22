import { Image, Pressable, Text, View } from "react-native";
import type { ListingRow } from "@conectage/shared";
import { formatPrice } from "@/lib/format";
import { useTranslation } from "@/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { colors, shadow } from "@/theme";

interface ListingCardProps {
  listing: ListingRow;
  onPress: () => void;
}

/** Image-first grid card — the Wallapop/Vinted/OfferUp pattern. */
export function ListingCard({ listing, onPress }: ListingCardProps) {
  const { t } = useTranslation();
  const cover = listing.images?.[0];
  const conditionLabel = listing.condition ? t(`browse.condition.${listing.condition}`) : null;

  return (
    <Pressable onPress={onPress} className="w-full active:opacity-90">
      <View className="overflow-hidden rounded-2xl bg-white" style={shadow.card}>
        <View className="relative">
          {cover ? (
            <Image source={{ uri: cover }} style={{ width: "100%", aspectRatio: 1 }} className="bg-neutral-100" />
          ) : (
            <View style={{ width: "100%", aspectRatio: 1 }} className="items-center justify-center bg-neutral-100">
              <Icon name="image-outline" size={28} color={colors.faint} />
            </View>
          )}
          {listing.is_featured && (
            <View className="absolute left-2 top-2">
              <Badge label={t("browse.featured")} tone="featured" icon="star" />
            </View>
          )}
          {listing.listing_type === "wanted" && (
            <View className="absolute right-2 top-2">
              <Badge label={t("browse.wanted")} tone="solid-dark" />
            </View>
          )}
        </View>

        <View className="gap-1 p-3">
          <Text className="font-sans-bold text-base text-primary">{formatPrice(listing)}</Text>
          <Text numberOfLines={2} className="font-sans-medium text-sm leading-5 text-neutral-800">
            {listing.title}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1">
            <Icon name="location-outline" size={12} color={colors.faint} />
            <Text numberOfLines={1} className="flex-1 font-sans text-xs text-neutral-500">
              {listing.city}
              {conditionLabel ? ` · ${conditionLabel}` : ""}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
