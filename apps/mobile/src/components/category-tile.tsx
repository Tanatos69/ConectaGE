import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Category } from "@conectage/shared";
import { useToneColors } from "@/theme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/** Vertical tinted-icon + label tile, for the home shortcuts row. */
export function CategoryTile({ category, onPress }: { category: Category; onPress: () => void }) {
  const tones = useToneColors();
  const tone = tones[category.tone];
  return (
    <Pressable onPress={onPress} className="items-center gap-1.5 active:opacity-80" style={{ width: 72 }}>
      <View
        className="h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: tone.bg }}
      >
        <Ionicons name={category.icon as IoniconName} size={26} color={tone.fg} />
      </View>
      <Text numberOfLines={1} className="text-center font-sans-medium text-xs text-body">
        {category.name}
      </Text>
    </Pressable>
  );
}

/** Full-width row tile for the category-browse list. */
export function CategoryRow({
  category,
  count,
  onPress,
}: {
  category: Category;
  count?: number;
  onPress: () => void;
}) {
  const tones = useToneColors();
  const tone = tones[category.tone];
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-card p-3 active:opacity-80"
    >
      <View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: tone.bg }}>
        <Ionicons name={category.icon as IoniconName} size={22} color={tone.fg} />
      </View>
      <Text className="flex-1 font-sans-medium text-base text-ink">{category.name}</Text>
      {count != null && <Text className="font-sans text-sm text-subtle">{count}</Text>}
      <Ionicons name="chevron-forward" size={18} color={tone.fg} />
    </Pressable>
  );
}
