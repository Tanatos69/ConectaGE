import { Text, View } from "react-native";
import { Icon, type IconName } from "./icon";
import { useThemeColors } from "@/theme";

type Tone = "featured" | "neutral" | "primary" | "solid-dark" | "success" | "warning";

interface BadgeProps {
  label: string;
  tone?: Tone;
  icon?: IconName;
}

const container: Record<Tone, string> = {
  featured: "bg-featured",
  primary: "bg-primary-soft",
  neutral: "bg-fill",
  "solid-dark": "bg-black/70",
  success: "bg-whatsapp/15",
  warning: "bg-amber-500/15",
};

const textColor: Record<Tone, string> = {
  featured: "text-featured-foreground",
  primary: "text-primary",
  neutral: "text-body",
  "solid-dark": "text-white",
  success: "text-whatsapp",
  warning: "text-amber-600",
};

/** Small pill for featured/condition/type/status labels. */
export function Badge({ label, tone = "neutral", icon }: BadgeProps) {
  const theme = useThemeColors();
  const iconColor: Record<Tone, string> = {
    featured: theme.featuredForeground,
    primary: theme.primary,
    neutral: theme.body,
    "solid-dark": "#FFFFFF",
    success: theme.whatsapp,
    warning: "#D97706",
  };
  return (
    <View className={`flex-row items-center gap-1 self-start rounded-full px-2.5 py-1 ${container[tone]}`}>
      {icon && <Icon name={icon} size={12} color={iconColor[tone]} />}
      <Text className={`font-sans-medium text-[11px] ${textColor[tone]}`}>{label}</Text>
    </View>
  );
}
