import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/** Thin wrapper over Ionicons so screens reference one icon set consistently. */
export function Icon({ name, size = 22, color = colors.ink }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
