import { Text, View } from "react-native";
import { Icon, type IconName } from "./icon";
import { Button } from "./button";
import { useThemeColors } from "@/theme";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Centered icon + copy for empty lists, missing records, and error states. */
export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const theme = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10 py-16">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-fill">
        <Icon name={icon} size={28} color={theme.faint} />
      </View>
      <Text className="text-center font-sans-bold text-lg text-ink">{title}</Text>
      {subtitle && <Text className="text-center font-sans text-sm text-subtle">{subtitle}</Text>}
      {actionLabel && onAction && (
        <View className="mt-2 w-48">
          <Button label={actionLabel} onPress={onAction} size="sm" />
        </View>
      )}
    </View>
  );
}
