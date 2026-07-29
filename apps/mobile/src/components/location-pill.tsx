import { useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { GE_CITIES } from "@conectage/shared";
import { Icon } from "@/components/ui/icon";
import { Sheet } from "@/components/ui/sheet";
import { useThemeColors } from "@/theme";

interface LocationPillProps {
  city: string;
  onChange: (city: string) => void;
}

const ALL = "Todas";

/** Airbnb-style location selector: current city + a picker sheet. */
export function LocationPill({ city, onChange }: LocationPillProps) {
  const theme = useThemeColors();
  const [open, setOpen] = useState(false);
  const options = [ALL, ...GE_CITIES];

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={6}
        className="flex-row items-center gap-1 active:opacity-70"
      >
        <Icon name="location-sharp" size={16} color={theme.primary} />
        <Text className="font-sans-bold text-base text-ink">{city || ALL}</Text>
        <Icon name="chevron-down" size={16} color={theme.muted} />
      </Pressable>

      <Sheet visible={open} onClose={() => setOpen(false)} title="Ubicación">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}>
          {options.map((c) => {
            const active = (city || ALL) === c;
            return (
              <Pressable
                key={c}
                onPress={() => {
                  onChange(c === ALL ? ALL : c);
                  setOpen(false);
                }}
                className={`mt-1 flex-row items-center justify-between rounded-2xl px-4 py-3.5 active:opacity-80 ${
                  active ? "bg-primary-soft" : ""
                }`}
              >
                <Text className={`text-base ${active ? "font-sans-bold text-primary" : "font-sans-medium text-ink"}`}>
                  {c}
                </Text>
                {active && <Icon name="checkmark-circle" size={20} color={theme.primary} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </Sheet>
    </>
  );
}
