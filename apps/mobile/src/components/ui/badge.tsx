import { Text, View } from "react-native";
import { Icon, type IconName } from "./icon";
import { colors } from "@/theme";

type Tone = "featured" | "neutral" | "primary" | "solid-dark";

interface BadgeProps {
  label: string;
  tone?: Tone;
  icon?: IconName;
}

const toneStyles: Record<Tone, { container: string; text: string; icon: string }> = {
  featured: { container: "bg-featured", text: "text-featured-foreground", icon: colors.featuredForeground },
  primary: { container: "bg-primary-soft", text: "text-primary", icon: colors.primary },
  neutral: { container: "bg-neutral-100", text: "text-neutral-700", icon: colors.body },
  "solid-dark": { container: "bg-black/70", text: "text-white", icon: "#FFFFFF" },
};

/** Small pill for featured/condition/type labels — matches web badge conventions. */
export function Badge({ label, tone = "neutral", icon }: BadgeProps) {
  const s = toneStyles[tone];
  return (
    <View className={`flex-row items-center gap-1 self-start rounded-full px-2.5 py-1 ${s.container}`}>
      {icon && <Icon name={icon} size={12} color={s.icon} />}
      <Text className={`font-sans-medium text-[11px] ${s.text}`}>{label}</Text>
    </View>
  );
}
