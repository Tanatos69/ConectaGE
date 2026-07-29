import { Pressable, Text, View } from "react-native";
import { Icon, type IconName } from "./icon";
import { useThemeColors } from "@/theme";

interface MenuRowProps {
  icon: IconName;
  label: string;
  sublabel?: string;
  onPress: () => void;
  badge?: number;
  danger?: boolean;
}

/** Settings/dashboard list row: icon + label + optional badge + chevron. */
export function MenuRow({ icon, label, sublabel, onPress, badge, danger }: MenuRowProps) {
  const theme = useThemeColors();
  const tint = danger ? theme.featured : theme.primary;
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 bg-card px-4 py-3.5 active:opacity-70"
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
        <Icon name={icon} size={18} color={tint} />
      </View>
      <View className="flex-1">
        <Text className={`font-sans-medium text-base ${danger ? "text-featured" : "text-ink"}`}>{label}</Text>
        {sublabel && <Text className="font-sans text-xs text-subtle">{sublabel}</Text>}
      </View>
      {badge != null && badge > 0 && (
        <View className="h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5">
          <Text className="font-sans-bold text-[11px] text-primary-foreground">{badge}</Text>
        </View>
      )}
      <Icon name="chevron-forward" size={18} color={theme.faint} />
    </Pressable>
  );
}

/** Groups menu rows into a rounded card with hairline dividers. */
export function MenuGroup({ children }: { children: React.ReactNode }) {
  return <View className="overflow-hidden rounded-2xl border border-line bg-card">{children}</View>;
}
