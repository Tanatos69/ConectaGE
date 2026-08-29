import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import type { ListingRow } from "@gemarket/shared";
import { categories, getSubcategories, GE_CITIES, QUANTITY_CATEGORIES, isValidWhatsApp } from "@gemarket/shared";
import { useAuth } from "@/lib/auth-context";
import { useCreateListing, useProfile } from "@/lib/hooks";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Chip, ChoicePills } from "@/components/ui/chip";
import { AuthGate } from "@/components/auth-gate";
import { PhotoPicker } from "@/components/publish/photo-picker";
import { useThemeColors } from "@/theme";

type Form = {
  listingType: ListingRow["listing_type"];
  category: string;
  subcategory: string;
  title: string;
  description: string;
  priceType: ListingRow["price_type"];
  price: string;
  currency: ListingRow["currency"];
  condition: ListingRow["condition"];
  quantity: string;
  city: string;
  region: string;
  whatsapp: string;
  imageUris: string[];
};

const STEPS = ["Categoría", "Detalles", "Fotos", "Contacto", "Revisar"];

function Label({ children }: { children: string }) {
  return <Text className="mb-2 mt-4 font-sans-bold text-sm text-ink">{children}</Text>;
}

export default function PublishScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { user, loading } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const createListing = useCreateListing(user?.id ?? "");

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({
    listingType: "offer",
    category: "",
    subcategory: "",
    title: "",
    description: "",
    priceType: "fixed",
    price: "",
    currency: "XAF",
    condition: "used",
    quantity: "",
    city: profile?.city ?? "",
    region: "",
    whatsapp: profile?.phone ?? "",
    imageUris: [],
  });
  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const subs = useMemo(() => (form.category ? getSubcategories(form.category) : []), [form.category]);
  const showQuantity = QUANTITY_CATEGORIES.has(form.category);
  const priced = form.priceType === "fixed" || form.priceType === "negotiable";

  if (!loading && !user) return <Screen><AuthGate title="Inicia sesión para publicar" /></Screen>;

  function validateStep(): string | null {
    if (step === 0 && !form.category) return "Selecciona una categoría.";
    if (step === 1) {
      if (form.title.trim().length < 5) return "El título debe tener al menos 5 caracteres.";
      if (form.description.trim().length < 10) return "La descripción debe tener al menos 10 caracteres.";
      if (priced && !form.price) return "Indica un precio.";
    }
    if (step === 3) {
      if (!form.city) return "Indica la ciudad.";
      if (!isValidWhatsApp(form.whatsapp)) return "Introduce un WhatsApp válido, ej. +240222000000.";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) {
      Alert.alert("Revisa el formulario", err);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function submit() {
    createListing.mutate(
      {
        title: form.title.trim(),
        description: form.description.trim(),
        price: priced ? Number(form.price.replace(/[^0-9]/g, "")) || 0 : null,
        priceType: form.priceType,
        currency: form.currency,
        categorySlug: form.category,
        subcategorySlug: form.subcategory,
        city: form.city,
        region: form.region,
        condition: form.condition,
        whatsapp: form.whatsapp,
        showPhone: false,
        phone: "",
        listingType: form.listingType,
        quantity: showQuantity && form.quantity ? Number(form.quantity) : null,
        imageUris: form.imageUris,
      },
      {
        onSuccess: ({ slug, pending }) => {
          Alert.alert(
            pending ? "Anuncio en revisión" : "¡Anuncio publicado!",
            pending
              ? "Lo revisaremos y aparecerá públicamente en breve."
              : "Tu anuncio ya está visible en GEMarket.",
            [{ text: "Ver anuncio", onPress: () => router.replace(`/listing/${slug}`) }],
          );
        },
        onError: (e) => Alert.alert("No se pudo publicar", (e as Error).message),
      },
    );
  }

  return (
    <Screen edges={["bottom"]}>
      {/* Progress */}
      <View className="flex-row gap-1.5 px-4 pb-3 pt-2">
        {STEPS.map((_, i) => (
          <View key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-line"}`} />
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <Text className="font-display text-xl text-ink">
            {step + 1}. {STEPS[step]}
          </Text>

          {step === 0 && (
            <>
              <Label>Tipo de anuncio</Label>
              <ChoicePills
                options={[
                  { value: "offer", label: "Ofrezco" },
                  { value: "wanted", label: "Busco" },
                ]}
                value={form.listingType}
                onChange={(v) => set({ listingType: (v as ListingRow["listing_type"]) ?? "offer" })}
                clearable={false}
              />
              <Label>Categoría</Label>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((c) => (
                  <Chip
                    key={c.slug}
                    label={c.name}
                    active={form.category === c.slug}
                    onPress={() => set({ category: c.slug, subcategory: "" })}
                  />
                ))}
              </View>
              {subs.length > 0 && (
                <>
                  <Label>Subcategoría</Label>
                  <View className="flex-row flex-wrap gap-2">
                    {subs.map((s) => (
                      <Chip
                        key={s.slug}
                        label={s.name}
                        active={form.subcategory === s.slug}
                        onPress={() => set({ subcategory: form.subcategory === s.slug ? "" : s.slug })}
                      />
                    ))}
                  </View>
                </>
              )}
            </>
          )}

          {step === 1 && (
            <View className="gap-1">
              <Label>Título</Label>
              <TextField placeholder="Ej. iPhone 13 128GB como nuevo" value={form.title} onChangeText={(t) => set({ title: t })} maxLength={100} />
              <Label>Descripción</Label>
              <View className="rounded-2xl border border-line bg-card px-4 py-3">
                <TextInput
                  value={form.description}
                  onChangeText={(t) => set({ description: t })}
                  placeholder="Describe el estado, detalles y condiciones…"
                  placeholderTextColor={theme.faint}
                  multiline
                  style={{ minHeight: 96, textAlignVertical: "top" }}
                  className="font-sans text-base text-ink"
                />
              </View>
              <Label>Tipo de precio</Label>
              <ChoicePills
                options={[
                  { value: "fixed", label: "Fijo" },
                  { value: "negotiable", label: "Negociable" },
                  { value: "free", label: "Gratis" },
                  { value: "on_request", label: "A consultar" },
                ]}
                value={form.priceType}
                onChange={(v) => set({ priceType: (v as ListingRow["price_type"]) ?? "fixed" })}
                clearable={false}
              />
              {priced && (
                <>
                  <Label>Precio</Label>
                  <View className="flex-row gap-2.5">
                    <View className="flex-[2]">
                      <TextField placeholder="0" keyboardType="numeric" value={form.price} onChangeText={(t) => set({ price: t })} />
                    </View>
                    <View className="flex-1">
                      <ChoicePills
                        options={[
                          { value: "XAF", label: "FCFA" },
                          { value: "USD", label: "$" },
                          { value: "EUR", label: "€" },
                        ]}
                        value={form.currency}
                        onChange={(v) => set({ currency: (v as ListingRow["currency"]) ?? "XAF" })}
                        clearable={false}
                      />
                    </View>
                  </View>
                </>
              )}
              <Label>Estado</Label>
              <ChoicePills
                options={[
                  { value: "new", label: "Nuevo" },
                  { value: "used", label: "Usado" },
                  { value: "refurbished", label: "Reacondicionado" },
                ]}
                value={form.condition ?? null}
                onChange={(v) => set({ condition: (v as ListingRow["condition"]) ?? null })}
              />
              {showQuantity && (
                <>
                  <Label>Cantidad disponible (opcional)</Label>
                  <TextField placeholder="Ej. 5" keyboardType="numeric" value={form.quantity} onChangeText={(t) => set({ quantity: t })} />
                </>
              )}
            </View>
          )}

          {step === 2 && (
            <View className="mt-4">
              <PhotoPicker uris={form.imageUris} onChange={(u) => set({ imageUris: u })} />
            </View>
          )}

          {step === 3 && (
            <View className="gap-1">
              <Label>Ciudad</Label>
              <View className="flex-row flex-wrap gap-2">
                {GE_CITIES.map((c) => (
                  <Chip key={c} label={c} active={form.city === c} onPress={() => set({ city: c })} />
                ))}
              </View>
              <Label>WhatsApp de contacto</Label>
              <TextField
                placeholder="+240 222 000 000"
                keyboardType="phone-pad"
                value={form.whatsapp}
                onChangeText={(t) => set({ whatsapp: t })}
                icon="logo-whatsapp"
              />
            </View>
          )}

          {step === 4 && (
            <View className="mt-4 gap-2 rounded-2xl border border-line bg-card p-4">
              <Text className="font-sans-bold text-lg text-ink">{form.title || "Sin título"}</Text>
              <Text className="font-sans text-sm text-subtle">
                {categories.find((c) => c.slug === form.category)?.name} · {form.city}
              </Text>
              <Text className="font-sans-bold text-base text-primary">
                {priced ? `${form.price || 0} ${form.currency}` : form.priceType === "free" ? "Gratis" : "A consultar"}
              </Text>
              <Text numberOfLines={4} className="font-sans text-sm text-body">{form.description}</Text>
              <Text className="mt-1 font-sans text-xs text-subtle">{form.imageUris.length} foto(s) · {form.listingType === "wanted" ? "Busco" : "Ofrezco"}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Nav buttons */}
      <View className="flex-row gap-3 border-t border-line px-4 pb-2 pt-3">
        {step > 0 && (
          <View className="flex-1">
            <Button label="Atrás" variant="outline" onPress={() => setStep((s) => s - 1)} />
          </View>
        )}
        <View className="flex-[2]">
          {step < STEPS.length - 1 ? (
            <Button label="Continuar" onPress={next} />
          ) : (
            <Button label="Publicar" icon="checkmark-circle-outline" loading={createListing.isPending} onPress={submit} />
          )}
        </View>
      </View>
    </Screen>
  );
}
