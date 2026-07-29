import { ActivityIndicator, Pressable, Text, View, type PressableProps } from "react-native";
import { Icon, type IconName } from "./icon";
import { useThemeColors } from "@/theme";

type Variant = "primary" | "whatsapp" | "outline" | "ghost" | "soft";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
}

const container: Record<Variant, string> = {
  primary: "bg-primary",
  whatsapp: "bg-whatsapp",
  outline: "border border-line bg-card",
  ghost: "bg-transparent",
  soft: "bg-primary-soft",
};

const labelColor: Record<Variant, string> = {
  primary: "text-primary-foreground",
  whatsapp: "text-whatsapp-foreground",
  outline: "text-ink",
  ghost: "text-primary",
  soft: "text-primary",
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  fullWidth = true,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useThemeColors();
  const iconTint: Record<Variant, string> = {
    primary: theme.primaryForeground,
    whatsapp: theme.whatsappForeground,
    outline: theme.ink,
    ghost: theme.primary,
    soft: theme.primary,
  };
  const height = size === "lg" ? "h-14" : size === "sm" ? "h-10" : "h-12";
  const text = size === "sm" ? "text-sm" : "text-base";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`${height} ${fullWidth ? "w-full" : ""} flex-row items-center justify-center gap-2 rounded-2xl px-5 active:opacity-80 ${container[variant]} ${disabled ? "opacity-50" : ""}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={iconTint[variant]} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} color={iconTint[variant]} />}
          <Text className={`font-sans-bold ${text} ${labelColor[variant]}`}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
