import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/theme";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/** Thin wrapper over Ionicons; defaults to the theme-aware ink color. */
export function Icon({ name, size = 22, color }: IconProps) {
  const theme = useThemeColors();
  return <Ionicons name={name} size={size} color={color ?? theme.ink} />;
}
