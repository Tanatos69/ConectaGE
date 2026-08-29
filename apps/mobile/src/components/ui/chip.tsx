import { Pressable, Text, View } from "react-native";
import { Icon, type IconName } from "./icon";
import { useThemeColors } from "@/theme";

interface ChipProps {
  label: string;
  active?: boolean;
  icon?: IconName;
  onPress?: () => void;
}

/** Selectable pill for filters, category shortcuts and quick toggles. */
export function Chip({ label, active = false, icon, onPress }: ChipProps) {
  const theme = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 active:opacity-80 ${
        active ? "border-primary bg-primary" : "border-line bg-card"
      }`}
    >
      {icon && <Icon name={icon} size={15} color={active ? theme.primaryForeground : theme.body} />}
      <Text className={`font-sans-medium text-sm ${active ? "text-primary-foreground" : "text-body"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

interface ChoicePillProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** Allow tapping the active option again to clear it. */
  clearable?: boolean;
}

/** Row of mutually-exclusive choice chips (used in the filters sheet). */
export function ChoicePills<T extends string>({ options, value, onChange, clearable = true }: ChoicePillProps<T>) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          active={value === o.value}
          onPress={() => onChange(clearable && value === o.value ? null : o.value)}
        />
      ))}
    </View>
  );
}
