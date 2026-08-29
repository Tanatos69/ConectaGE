import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ReviewRow } from "@gemarket/shared";
import { Avatar } from "@/components/ui/avatar";
import { useThemeColors } from "@/theme";

type ReviewWithName = ReviewRow & { reviewerName: string };

function Stars({ rating }: { rating: number }) {
  const theme = useThemeColors();
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={n <= rating ? "star" : "star-outline"}
          size={13}
          color={n <= rating ? theme.star : theme.faint}
        />
      ))}
    </View>
  );
}

export function ReviewList({ reviews }: { reviews: ReviewWithName[] }) {
  if (reviews.length === 0) {
    return <Text className="py-3 font-sans text-sm text-subtle">Aún no hay reseñas.</Text>;
  }
  return (
    <View className="gap-4">
      {reviews.map((r) => (
        <View key={r.id} className="flex-row gap-3">
          <Avatar name={r.reviewerName} size={40} />
          <View className="flex-1">
            <Text className="font-sans-bold text-sm text-ink">{r.reviewerName}</Text>
            <View className="mt-0.5">
              <Stars rating={r.rating} />
            </View>
            {!!r.comment && (
              <Text className="mt-1 font-sans text-sm leading-5 text-body">{r.comment}</Text>
            )}
            {!!r.seller_reply && (
              <View className="mt-2 rounded-xl bg-fill p-2.5">
                <Text className="font-sans-medium text-xs text-subtle">Respuesta del vendedor</Text>
                <Text className="mt-0.5 font-sans text-sm text-body">{r.seller_reply}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
