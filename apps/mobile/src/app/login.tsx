import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { signIn, signInWithOAuth } from "@/lib/auth";
import { isOAuthProviderEnabled } from "@/lib/oauth-providers";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { colors } from "@/theme";

export default function LoginScreen() {
  const router = useRouter();
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
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#FFFFFF" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View className="gap-1 pb-2">
          <Text className="font-display text-2xl text-neutral-900">Bienvenido de nuevo</Text>
          <Text className="font-sans text-sm text-neutral-500">Inicia sesión para continuar en ConectaGE.</Text>
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

        {error && (
          <View className="flex-row items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5">
            <Icon name="alert-circle" size={16} color={colors.featured} />
            <Text className="flex-1 font-sans text-sm text-featured">{error}</Text>
          </View>
        )}

        <Button label="Entrar" loading={busy} onPress={handleSubmit} />

        {isOAuthProviderEnabled("google") && (
          <>
            <View className="flex-row items-center gap-3 py-1">
              <View className="h-px flex-1 bg-neutral-200" />
              <Text className="font-sans text-xs text-neutral-400">o</Text>
              <View className="h-px flex-1 bg-neutral-200" />
            </View>
            <Button label="Continuar con Google" variant="outline" icon="logo-google" onPress={handleGoogle} disabled={busy} />
          </>
        )}

        <Pressable onPress={() => router.push("/registro")} className="mt-2 flex-row justify-center">
          <Text className="font-sans text-sm text-neutral-500">¿No tienes cuenta? </Text>
          <Text className="font-sans-bold text-sm text-primary">Regístrate</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
