import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import type { ListingRow } from "@conectage/shared";
import { QUANTITY_CATEGORIES, isValidWhatsApp } from "@conectage/shared";
import { getListingById } from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import { useUpdateListing } from "@/lib/hooks";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { ChoicePills } from "@/components/ui/chip";
import { useThemeColors } from "@/theme";

function Label({ children }: { children: string }) {
  return <Text className="mb-2 mt-4 font-sans-bold text-sm text-ink">{children}</Text>;
}

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useThemeColors();
  const { user } = useAuth();
  const update = useUpdateListing(user?.id ?? "");

  const { data: listing, isLoading } = useQuery({
    queryKey: ["editListing", id],
    queryFn: () => getListingById(id),
    enabled: !!id,
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    priceType: "fixed" as ListingRow["price_type"],
    price: "",
    city: "",
    condition: "used" as ListingRow["condition"],
    whatsapp: "",
    quantity: "",
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (!listing) return;
    setForm({
      title: listing.title,
      description: listing.description,
      priceType: listing.price_type,
      price: listing.price != null ? String(listing.price) : "",
      city: listing.city,
      condition: listing.condition,
      whatsapp: listing.whatsapp,
      quantity: listing.quantity != null ? String(listing.quantity) : "",
    });
  }, [listing]);

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      </Screen>
    );
  }
  if (!listing) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-sans text-sm text-subtle">No se encontró este anuncio.</Text>
        </View>
      </Screen>
    );
  }

  const priced = form.priceType === "fixed" || form.priceType === "negotiable";
  const showQuantity = QUANTITY_CATEGORIES.has(listing.category_slug);

  function save() {
    if (form.title.trim().length < 5) return Alert.alert("Revisa", "El título debe tener al menos 5 caracteres.");
    if (form.description.trim().length < 10) return Alert.alert("Revisa", "La descripción es muy corta.");
    if (!isValidWhatsApp(form.whatsapp)) return Alert.alert("Revisa", "WhatsApp no válido.");
    update.mutate(
      {
        id: listing!.id,
        input: {
          title: form.title.trim(),
          description: form.description.trim(),
          price: priced ? Number(form.price.replace(/[^0-9]/g, "")) || 0 : null,
          priceType: form.priceType,
          city: form.city,
          condition: form.condition,
          whatsapp: form.whatsapp,
          quantity: showQuantity && form.quantity ? Number(form.quantity) : null,
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Guardado", "Tu anuncio se actualizó.");
          router.back();
        },
        onError: (e) => Alert.alert("Error", (e as Error).message),
      },
    );
  }

  return (
    <Screen edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <Label>Título</Label>
          <TextField value={form.title} onChangeText={(t) => set({ title: t })} maxLength={100} />
          <Label>Descripción</Label>
          <View className="rounded-2xl border border-line bg-card px-4 py-3">
            <TextInput
              value={form.description}
              onChangeText={(t) => set({ description: t })}
              multiline
              style={{ minHeight: 96, textAlignVertical: "top" }}
              placeholderTextColor={theme.faint}
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
              <TextField keyboardType="numeric" value={form.price} onChangeText={(t) => set({ price: t })} />
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
              <Label>Cantidad disponible</Label>
              <TextField keyboardType="numeric" value={form.quantity} onChangeText={(t) => set({ quantity: t })} />
            </>
          )}
          <Label>WhatsApp</Label>
          <TextField keyboardType="phone-pad" value={form.whatsapp} onChangeText={(t) => set({ whatsapp: t })} icon="logo-whatsapp" />

          <View className="mt-6">
            <Button label="Guardar cambios" loading={update.isPending} onPress={save} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
