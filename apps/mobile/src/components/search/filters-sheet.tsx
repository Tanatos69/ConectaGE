import { ScrollView, Text, TextInput, View } from "react-native";
import type { SearchCriteria } from "@gemarket/shared";
import { categories, getSubcategories, GE_CITIES } from "@gemarket/shared";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Chip, ChoicePills } from "@/components/ui/chip";
import { useTranslation } from "@/i18n/context";
import { useThemeColors } from "@/theme";

interface FiltersSheetProps {
  visible: boolean;
  onClose: () => void;
  value: SearchCriteria;
  onChange: (next: SearchCriteria) => void;
  onClear: () => void;
}

function FieldLabel({ children }: { children: string }) {
  return <Text className="mb-2 mt-4 font-sans-bold text-sm text-ink">{children}</Text>;
}

export function FiltersSheet({ visible, onClose, value, onChange, onClear }: FiltersSheetProps) {
  const { t } = useTranslation();
  const theme = useThemeColors();
  const set = (patch: Partial<SearchCriteria>) => onChange({ ...value, ...patch });
  const subs = value.category ? getSubcategories(value.category) : [];

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t("search.filters")}
      footer={
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button label={t("search.clear")} variant="outline" onPress={onClear} />
          </View>
          <View className="flex-[2]">
            <Button label={t("search.apply")} onPress={onClose} />
          </View>
        </View>
      }
    >
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <FieldLabel>{t("search.category")}</FieldLabel>
        <View className="flex-row flex-wrap gap-2">
          {categories.map((c) => (
            <Chip
              key={c.slug}
              label={c.name}
              active={value.category === c.slug}
              onPress={() => set({ category: value.category === c.slug ? undefined : c.slug, subcategory: undefined })}
            />
          ))}
        </View>

        {subs.length > 0 && (
          <>
            <FieldLabel>Subcategoría</FieldLabel>
            <View className="flex-row flex-wrap gap-2">
              {subs.map((s) => (
                <Chip
                  key={s.slug}
                  label={s.name}
                  active={value.subcategory === s.slug}
                  onPress={() => set({ subcategory: value.subcategory === s.slug ? undefined : s.slug })}
                />
              ))}
            </View>
          </>
        )}

        <FieldLabel>{t("search.type")}</FieldLabel>
        <ChoicePills
          options={[
            { value: "offer", label: t("search.offer") },
            { value: "wanted", label: t("search.wanted") },
          ]}
          value={value.listingType ?? null}
          onChange={(v) => set({ listingType: v ?? undefined })}
        />

        <FieldLabel>{t("search.condition")}</FieldLabel>
        <ChoicePills
          options={[
            { value: "new", label: t("browse.condition.new") },
            { value: "used", label: t("browse.condition.used") },
            { value: "refurbished", label: t("browse.condition.refurbished") },
          ]}
          value={value.condition ?? null}
          onChange={(v) => set({ condition: v ?? undefined })}
        />

        <FieldLabel>{t("search.price")}</FieldLabel>
        <View className="flex-row gap-3">
          {(["minPrice", "maxPrice"] as const).map((k) => (
            <View
              key={k}
              className="flex-1 flex-row items-center rounded-2xl border border-line bg-card px-4"
              style={{ height: 50 }}
            >
              <TextInput
                keyboardType="numeric"
                placeholder={k === "minPrice" ? t("search.min") : t("search.max")}
                placeholderTextColor={theme.faint}
                value={value[k] != null ? String(value[k]) : ""}
                onChangeText={(txt) => {
                  const n = parseInt(txt.replace(/[^0-9]/g, ""), 10);
                  set({ [k]: Number.isFinite(n) ? n : undefined } as Partial<SearchCriteria>);
                }}
                className="flex-1 font-sans text-base text-ink"
              />
            </View>
          ))}
        </View>

        <FieldLabel>{t("search.location")}</FieldLabel>
        <View className="flex-row flex-wrap gap-2">
          {GE_CITIES.map((c) => (
            <Chip
              key={c}
              label={c}
              active={value.city === c}
              onPress={() => set({ city: value.city === c ? undefined : c })}
            />
          ))}
        </View>
      </ScrollView>
    </Sheet>
  );
}
