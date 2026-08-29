import { type ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { Icon } from "./icon";
import { useThemeColors } from "@/theme";

// A calm, deceleration-curve slide (no spring bounce) reads as far more
// polished than the default springify() — matches the native iOS sheet feel.
const enterSlide = SlideInDown.duration(280).easing(Easing.out(Easing.cubic));
const exitSlide = SlideOutDown.duration(220).easing(Easing.in(Easing.cubic));
const enterBackdrop = FadeIn.duration(220);
const exitBackdrop = FadeOut.duration(180);

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Sticky footer (e.g. an Apply button). */
  footer?: ReactNode;
}

/** Bottom sheet: dimmed backdrop + slide-up panel. Tap backdrop to dismiss. */
export function Sheet({ visible, onClose, title, children, footer }: SheetProps) {
  const theme = useThemeColors();
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end">
        <Animated.View entering={enterBackdrop} exiting={exitBackdrop} className="absolute inset-0 bg-black/50">
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={enterSlide}
          exiting={exitSlide}
          className="overflow-hidden rounded-t-3xl bg-card"
          style={{ maxHeight: "88%" }}
        >
          <SafeAreaView edges={["bottom"]}>
            <View className="items-center pt-3">
              <View className="h-1.5 w-10 rounded-full bg-line" />
            </View>
            {title && (
              <View className="flex-row items-center justify-between px-5 pb-1 pt-3">
                <Text className="font-display text-xl text-ink">{title}</Text>
                <Pressable onPress={onClose} hitSlop={8} className="active:opacity-70">
                  <Icon name="close" size={24} color={theme.muted} />
                </Pressable>
              </View>
            )}
            {children}
            {footer && <View className="border-t border-line px-5 pb-2 pt-3">{footer}</View>}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
