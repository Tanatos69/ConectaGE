import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { categories, isValidWhatsApp, GE_CITIES } from "@gemarket/shared";
import { useAuth } from "@/lib/auth-context";
import { useOwnTienda, useCreateTienda, useUpdateTienda } from "@/lib/hooks";
import type { TiendaInput } from "@/lib/listing-actions";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Chip } from "@/components/ui/chip";
import { AuthGate } from "@/components/auth-gate";
import { SingleImagePicker } from "@/components/publish/single-image-picker";
import { useThemeColors } from "@/theme";

function Label({ children }: { children: string }) {
  return <Text className="mb-2 mt-4 font-sans-bold text-sm text-ink">{children}</Text>;
}

export default function StoreManageScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { user, loading } = useAuth();
  const { data: tienda, isLoading } = useOwnTienda(user?.id);
  const create = useCreateTienda(user?.id ?? "");
  const update = useUpdateTienda(user?.id ?? "");

  const [form, setForm] = useState<TiendaInput>({
    name: "",
    tagline: "",
    city: "",
    address: "",
    neighborhood: "",
    business_hours: "",
    instagram: "",
    facebook: "",
    category_slug: "",
    whatsapp: "",
    description: "",
    logoUri: null,
    bannerUri: null,
  });
  const set = (patch: Partial<TiendaInput>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (!tienda) return;
    setForm({
      name: tienda.name,
      tagline: tienda.tagline,
      city: tienda.city,
      address: tienda.address,
      neighborhood: tienda.neighborhood,
      business_hours: tienda.business_hours,
      instagram: tienda.instagram,
      facebook: tienda.facebook,
      category_slug: tienda.category_slug,
      whatsapp: tienda.whatsapp,
      description: tienda.description,
      logoUri: tienda.logo,
      bannerUri: tienda.banner,
    });
  }, [tienda]);

  if (!loading && !user) return <Screen><AuthGate /></Screen>;
  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      </Screen>
    );
  }

  const saving = create.isPending || update.isPending;

  function save() {
    if (form.name.trim().length < 3) return Alert.alert("Revisa", "El nombre de la tienda es muy corto.");
    if (!form.category_slug) return Alert.alert("Revisa", "Selecciona una categoría.");
    if (!form.city) return Alert.alert("Revisa", "Indica la ciudad.");
    if (!isValidWhatsApp(form.whatsapp)) return Alert.alert("Revisa", "WhatsApp no válido.");

    const onDone = (slug?: string) => {
      Alert.alert("Guardado", "Tu tienda se guardó correctamente.", [
        { text: "OK", onPress: () => (slug ? router.replace(`/store/${slug}`) : router.back()) },
      ]);
    };

    if (tienda) {
      update.mutate({ id: tienda.id, input: form }, { onSuccess: () => onDone(tienda.slug), onError: (e) => Alert.alert("Error", (e as Error).message) });
    } else {
      create.mutate(form, { onSuccess: ({ slug }) => onDone(slug), onError: (e) => Alert.alert("Error", (e as Error).message) });
    }
  }

  return (
    <Screen edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <Text className="font-display text-xl text-ink">{tienda ? "Editar tienda" : "Crear tienda"}</Text>
          <Text className="mt-1 font-sans text-sm text-subtle">
            Una tienda agrupa tus anuncios y te da un perfil verificable de vendedor.
          </Text>

          <View className="mt-4">
            <SingleImagePicker label="Portada" uri={form.bannerUri} onChange={(u) => set({ bannerUri: u })} aspect={[16, 9]} />
          </View>
          <View className="mt-4">
            <SingleImagePicker label="Logo" uri={form.logoUri} onChange={(u) => set({ logoUri: u })} rounded />
          </View>

          <Label>Nombre de la tienda</Label>
          <TextField value={form.name} onChangeText={(t) => set({ name: t })} placeholder="Ej. TecnoMalabo" />
          <Label>Eslogan</Label>
          <TextField value={form.tagline} onChangeText={(t) => set({ tagline: t })} placeholder="Ej. Tu tienda de tecnología de confianza" />

          <Label>Categoría</Label>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((c) => (
              <Chip key={c.slug} label={c.name} active={form.category_slug === c.slug} onPress={() => set({ category_slug: c.slug })} />
            ))}
          </View>

          <Label>Ciudad</Label>
          <View className="flex-row flex-wrap gap-2">
            {GE_CITIES.map((c) => (
              <Chip key={c} label={c} active={form.city === c} onPress={() => set({ city: c })} />
            ))}
          </View>

          <Label>WhatsApp</Label>
          <TextField value={form.whatsapp} onChangeText={(t) => set({ whatsapp: t })} keyboardType="phone-pad" icon="logo-whatsapp" placeholder="+240 222 000 000" />

          <Label>Descripción</Label>
          <View className="rounded-2xl border border-line bg-card px-4 py-3">
            <TextInput
              value={form.description}
              onChangeText={(t) => set({ description: t })}
              multiline
              placeholder="Cuenta qué vende tu tienda…"
              placeholderTextColor={theme.faint}
              style={{ minHeight: 90, textAlignVertical: "top" }}
              className="font-sans text-base text-ink"
            />
          </View>

          <Label>Dirección (opcional)</Label>
          <TextField value={form.address} onChangeText={(t) => set({ address: t })} />
          <Label>Horario (opcional)</Label>
          <TextField value={form.business_hours} onChangeText={(t) => set({ business_hours: t })} placeholder="Ej. L-V 9:00–18:00" />
          <Label>Instagram (opcional)</Label>
          <TextField value={form.instagram} onChangeText={(t) => set({ instagram: t })} autoCapitalize="none" />

          <View className="mt-6">
            <Button label={tienda ? "Guardar cambios" : "Crear tienda"} loading={saving} onPress={save} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
