import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { shadow } from "@/theme";

/** A single pulsing placeholder block. */
export function Skeleton({ className, style }: { className?: string; style?: object }) {
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View className={`bg-fill ${className ?? ""}`} style={[animatedStyle, style]} />;
}

/** Card-shaped placeholder matching ListingCard's footprint. */
export function SkeletonCard() {
  return (
    <View className="overflow-hidden rounded-2xl bg-card" style={shadow.card}>
      <Skeleton style={{ width: "100%", aspectRatio: 1 }} />
      <View className="gap-2 p-3">
        <Skeleton className="rounded-md" style={{ height: 16, width: "50%" }} />
        <Skeleton className="rounded-md" style={{ height: 12, width: "90%" }} />
        <Skeleton className="rounded-md" style={{ height: 12, width: "40%" }} />
      </View>
    </View>
  );
}

/** A 2-column grid of skeleton cards for initial loads. */
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-3 px-4 pt-2">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ width: "48%" }}>
          <SkeletonCard />
        </View>
      ))}
    </View>
  );
}
