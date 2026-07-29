import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/theme";

interface RatingProps {
  value: number;
  count?: number;
  size?: number;
  showValue?: boolean;
}

/** Read-only star rating with optional numeric value + review count. */
export function Rating({ value, count, size = 14, showValue = true }: RatingProps) {
  const theme = useThemeColors();
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="star" size={size} color={theme.star} />
      {showValue && (
        <Text className="font-sans-bold text-body" style={{ fontSize: size }}>
          {value > 0 ? value.toFixed(1) : "—"}
        </Text>
      )}
      {count != null && (
        <Text className="font-sans text-subtle" style={{ fontSize: size - 1 }}>
          ({count})
        </Text>
      )}
    </View>
  );
}

interface StarInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

/** Interactive 1–5 star picker for writing a review. */
export function StarInput({ value, onChange, size = 34 }: StarInputProps) {
  const theme = useThemeColors();
  return (
    <View className="flex-row gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>
          <Ionicons
            name={n <= value ? "star" : "star-outline"}
            size={size}
            color={n <= value ? theme.star : theme.faint}
          />
        </Pressable>
      ))}
    </View>
  );
}
