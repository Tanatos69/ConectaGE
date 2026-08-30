import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BRAND } from "@gemarket/shared";
import { signIn, signInWithOAuth } from "@/lib/auth";
import { isOAuthProviderEnabled } from "@/lib/oauth-providers";
import { Screen } from "@/components/ui/screen";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useThemeColors } from "@/theme";

export default function LoginScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setError(null);
    setBusy(true);
    const result = await signIn({ email, password });
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.back();
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    const result = await signInWithOAuth("google");
    setBusy(false);
    if (result.error) setError(result.error);
    else router.back();
  }

  return (
    <Screen>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
          <View className="gap-1 pb-2">
            <Text className="font-display text-2xl text-ink">Bienvenido de nuevo</Text>
            <Text className="font-sans text-sm text-subtle">Inicia sesión para continuar en {BRAND.name}.</Text>
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
          <TextField
            label="Contraseña"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secure
          />

          <Pressable onPress={() => router.push("/recuperar-contrasena")} className="self-end">
            <Text className="font-sans-medium text-sm text-primary">¿Olvidaste tu contraseña?</Text>
          </Pressable>

          {error && (
            <View className="flex-row items-center gap-2 rounded-xl bg-featured/10 px-3 py-2.5">
              <Icon name="alert-circle" size={16} color={theme.featured} />
              <Text className="flex-1 font-sans text-sm text-featured">{error}</Text>
            </View>
          )}

          <Button label="Entrar" loading={busy} onPress={handleSubmit} />

          {isOAuthProviderEnabled("google") && (
            <>
              <View className="flex-row items-center gap-3 py-1">
                <View className="h-px flex-1 bg-line" />
                <Text className="font-sans text-xs text-faint">o</Text>
                <View className="h-px flex-1 bg-line" />
              </View>
              <Button label="Continuar con Google" variant="outline" icon="logo-google" onPress={handleGoogle} disabled={busy} />
            </>
          )}

          <Pressable onPress={() => router.push("/registro")} className="mt-2 flex-row justify-center">
            <Text className="font-sans text-sm text-subtle">¿No tienes cuenta? </Text>
            <Text className="font-sans-bold text-sm text-primary">Regístrate</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
