import { Text, View } from "react-native";
import { Icon, type IconName } from "./icon";
import { colors } from "@/theme";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  subtitle?: string;
}

/** Centered icon + copy for empty lists, missing records, and error states. */
export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10 py-16">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <Icon name={icon} size={28} color={colors.faint} />
      </View>
      <Text className="text-center font-sans-bold text-lg text-neutral-900">{title}</Text>
      {subtitle && <Text className="text-center font-sans text-sm text-neutral-500">{subtitle}</Text>}
    </View>
  );
}
