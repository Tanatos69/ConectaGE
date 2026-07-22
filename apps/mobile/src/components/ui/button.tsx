import { ActivityIndicator, Pressable, Text, View, type PressableProps } from "react-native";
import { Icon, type IconName } from "./icon";
import { colors } from "@/theme";

type Variant = "primary" | "whatsapp" | "outline" | "ghost";
type Size = "md" | "lg";

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
  outline: "border border-neutral-200 bg-white",
  ghost: "bg-transparent",
};

const labelColor: Record<Variant, string> = {
  primary: "text-primary-foreground",
  whatsapp: "text-whatsapp-foreground",
  outline: "text-neutral-800",
  ghost: "text-primary",
};

const iconTint: Record<Variant, string> = {
  primary: colors.primaryForeground,
  whatsapp: colors.whatsappForeground,
  outline: colors.body,
  ghost: colors.primary,
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
  const height = size === "lg" ? "h-14" : "h-12";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`${height} ${fullWidth ? "w-full" : ""} flex-row items-center justify-center gap-2 rounded-2xl px-5 active:opacity-90 ${container[variant]} ${disabled ? "opacity-50" : ""}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={iconTint[variant]} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && <Icon name={icon} size={18} color={iconTint[variant]} />}
          <Text className={`font-sans-bold text-base ${labelColor[variant]}`}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
