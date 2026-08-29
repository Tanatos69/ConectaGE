import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { resetPassword } from "@/lib/auth";
import { Screen } from "@/components/ui/screen";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useThemeColors } from "@/theme";

export default function RecoverPasswordScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    const result = await resetPassword(email);
    setBusy(false);
    if (result.error) setError(result.error);
    else setSent(true);
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
          {sent ? (
            <View className="items-center gap-4 pt-10">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
                <Icon name="mail-outline" size={30} color={theme.primary} />
              </View>
              <Text className="text-center font-display text-xl text-ink">Revisa tu correo</Text>
              <Text className="text-center font-sans text-sm leading-5 text-subtle">
                Te enviamos un enlace para restablecer tu contraseña a {email}.
              </Text>
              <View className="w-full pt-2">
                <Button label="Volver a iniciar sesión" onPress={() => router.replace("/login")} />
              </View>
            </View>
          ) : (
            <>
              <View className="gap-1 pb-2">
                <Text className="font-display text-2xl text-ink">Recuperar contraseña</Text>
                <Text className="font-sans text-sm text-subtle">
                  Introduce tu correo y te enviaremos un enlace para restablecerla.
                </Text>
              </View>
              <TextField
                label="Correo electrónico"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="tucorreo@ejemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {error && <Text className="font-sans text-sm text-featured">{error}</Text>}
              <Button label="Enviar enlace" loading={busy} onPress={submit} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
