import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { Gender } from "@gemarket/shared";
import { GE_CITIES } from "@gemarket/shared";
import { useAuth } from "@/lib/auth-context";
import { useProfile, useUpdateProfile } from "@/lib/hooks";
import { uploadImage } from "@/lib/storage";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Chip, ChoicePills } from "@/components/ui/chip";
import { AuthGate } from "@/components/auth-gate";
import { SingleImagePicker } from "@/components/publish/single-image-picker";
import { useThemeColors } from "@/theme";

function Label({ children }: { children: string }) {
  return <Text className="mb-2 mt-4 font-sans-bold text-sm text-ink">{children}</Text>;
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { user, loading } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const update = useUpdateProfile(user?.id ?? "");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    city: "",
    gender: null as Gender | null,
    birth_date: "",
    avatarUri: null as string | null,
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      city: profile.city ?? "",
      gender: profile.gender,
      birth_date: profile.birth_date ?? "",
      avatarUri: profile.avatar_url,
    });
  }, [profile]);

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

  async function save() {
    if (form.full_name.trim().length < 2) return Alert.alert("Revisa", "Introduce tu nombre.");
    setSaving(true);
    try {
      let avatar_url = profile?.avatar_url ?? null;
      if (form.avatarUri && !/^https?:\/\//.test(form.avatarUri)) {
        avatar_url = await uploadImage(user!.id, form.avatarUri, "avatars");
      }
      await update.mutateAsync({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        city: form.city || null,
        gender: form.gender,
        birth_date: form.birth_date || null,
        avatar_url,
      });
      Alert.alert("Guardado", "Tu perfil se actualizó.");
      router.back();
    } catch (e) {
      Alert.alert("Error", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <View className="items-center py-2">
            <SingleImagePicker label="" uri={form.avatarUri} onChange={(u) => set({ avatarUri: u })} rounded />
          </View>

          <Label>Nombre completo</Label>
          <TextField value={form.full_name} onChangeText={(t) => set({ full_name: t })} />
          <Label>Teléfono</Label>
          <TextField value={form.phone} onChangeText={(t) => set({ phone: t })} keyboardType="phone-pad" />

          <Label>Ciudad</Label>
          <View className="flex-row flex-wrap gap-2">
            {GE_CITIES.map((c) => (
              <Chip key={c} label={c} active={form.city === c} onPress={() => set({ city: form.city === c ? "" : c })} />
            ))}
          </View>

          <Label>Género</Label>
          <ChoicePills
            options={[
              { value: "male", label: "Hombre" },
              { value: "female", label: "Mujer" },
              { value: "other", label: "Otro" },
              { value: "prefer_not_to_say", label: "Prefiero no decir" },
            ]}
            value={form.gender}
            onChange={(v) => set({ gender: v as Gender | null })}
          />

          <Label>Fecha de nacimiento (AAAA-MM-DD)</Label>
          <TextField value={form.birth_date} onChangeText={(t) => set({ birth_date: t })} placeholder="1995-06-15" />

          <View className="mt-6">
            <Button label="Guardar perfil" loading={saving} onPress={save} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
