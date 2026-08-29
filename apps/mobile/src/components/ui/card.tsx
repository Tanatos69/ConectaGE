import { type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { shadow } from "@/theme";

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  /** Soft elevation shadow (default) vs. a flat hairline-bordered surface. */
  elevated?: boolean;
  className?: string;
}

/** Rounded surface used across list rows, tiles and panels. */
export function Card({ children, onPress, elevated = true, className }: CardProps) {
  const base = `rounded-2xl bg-card ${elevated ? "" : "border border-line"} ${className ?? ""}`;
  const style = elevated ? shadow.card : undefined;
  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${base} active:opacity-90`} style={style}>
        {children}
      </Pressable>
    );
  }
  return (
    <View className={base} style={style}>
      {children}
    </View>
  );
}
