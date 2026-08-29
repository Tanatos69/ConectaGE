import { Pressable, Text, View } from "react-native";
import { Icon } from "./icon";
import { useThemeColors } from "@/theme";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Section title with an optional trailing "see all" action. */
export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const theme = useThemeColors();
  return (
    <View className="flex-row items-center justify-between px-4 pb-2.5 pt-1">
      <Text className="font-display text-lg text-ink">{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8} className="flex-row items-center gap-0.5 active:opacity-70">
          <Text className="font-sans-medium text-sm text-primary">{actionLabel}</Text>
          <Icon name="chevron-forward" size={15} color={theme.primary} />
        </Pressable>
      )}
    </View>
  );
}
