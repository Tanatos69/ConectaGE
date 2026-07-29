import { type ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme";

interface ScreenProps {
  children: ReactNode;
  edges?: Edge[];
  /** Page background — muted app surface (default) or the card surface. */
  muted?: boolean;
}

/** Consistent, theme-aware safe-area page wrapper. */
export function Screen({ children, edges = ["top"], muted = true }: ScreenProps) {
  const theme = useThemeColors();
  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: muted ? theme.surfaceMuted : theme.surface }}
    >
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
