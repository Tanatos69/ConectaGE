import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/theme";

interface FavoriteButtonProps {
  active: boolean;
  onToggle: () => void;
  loading?: boolean;
  /** Overlay style sits on top of a card image; plain style for detail bars. */
  variant?: "overlay" | "plain";
  size?: number;
}

/** Heart toggle. Presentational — the screen owns the optimistic mutation. */
export function FavoriteButton({
  active,
  onToggle,
  loading = false,
  variant = "overlay",
  size = 20,
}: FavoriteButtonProps) {
  const theme = useThemeColors();
  const tint = active ? theme.featured : variant === "overlay" ? "#FFFFFF" : theme.body;

  const body = loading ? (
    <ActivityIndicator size="small" color={tint} />
  ) : (
    <Ionicons name={active ? "heart" : "heart-outline"} size={size} color={tint} />
  );

  if (variant === "overlay") {
    return (
      <Pressable onPress={onToggle} hitSlop={8} className="active:opacity-80">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-black/40">{body}</View>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onToggle} hitSlop={8} className="active:opacity-70">
      {body}
    </Pressable>
  );
}
