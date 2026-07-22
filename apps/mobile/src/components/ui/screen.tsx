import { type ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors } from "@/theme";

interface ScreenProps {
  children: ReactNode;
  edges?: Edge[];
  /** Page background — defaults to the muted app surface. */
  muted?: boolean;
}

/** Consistent safe-area page wrapper. */
export function Screen({ children, edges = ["top"], muted = true }: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: muted ? colors.surfaceMuted : colors.surface }}
    >
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
