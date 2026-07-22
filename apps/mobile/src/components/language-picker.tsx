import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from "@/i18n/context";
import { languages } from "@/i18n/languages";
import { Icon } from "@/components/ui/icon";
import { colors, shadow } from "@/theme";

/** Globe trigger + bottom-sheet language list. Uses native labels, no flag emoji. */
export function LanguagePicker() {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        className="h-10 flex-row items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 active:opacity-80"
      >
        <Icon name="globe-outline" size={16} color={colors.body} />
        <Text className="font-sans-medium text-sm uppercase text-neutral-700">{language.code}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable
            className="rounded-t-3xl bg-white px-5 pb-10 pt-3"
            style={shadow.float}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="mb-2 h-1.5 w-10 self-center rounded-full bg-neutral-200" />
            <Text className="mb-2 py-2 text-center font-display text-lg text-neutral-900">Idioma / Language</Text>
            {languages.map((lang) => {
              const active = lang.code === language.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => {
                    setLanguage(lang);
                    setOpen(false);
                  }}
                  className={`mt-1 flex-row items-center justify-between rounded-2xl px-4 py-3.5 active:opacity-80 ${
                    active ? "bg-primary-soft" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-base ${active ? "font-sans-bold text-primary" : "font-sans-medium text-neutral-800"}`}
                  >
                    {lang.label}
                  </Text>
                  {active && <Icon name="checkmark-circle" size={20} color={colors.primary} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
