import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { useRouter, Link } from "expo-router";
import { signIn, signInWithOAuth } from "@/lib/auth";
import { isOAuthProviderEnabled } from "@/lib/oauth-providers";

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
    <View className="flex-1 gap-4 bg-white p-6">
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Correo electrónico"
        autoCapitalize="none"
        keyboardType="email-address"
        className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        secureTextEntry
        className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
      />
      {error && <Text className="text-featured text-sm">{error}</Text>}
      <Pressable
        onPress={handleSubmit}
        disabled={busy}
        className="bg-primary h-12 items-center justify-center rounded-xl active:opacity-90"
      >
        {busy ? <ActivityIndicator color="white" /> : <Text className="text-primary-foreground font-semibold">Entrar</Text>}
      </Pressable>

      {isOAuthProviderEnabled("google") && (
        <Pressable
          onPress={handleGoogle}
          disabled={busy}
          className="h-12 items-center justify-center rounded-xl border border-neutral-200 active:opacity-90"
        >
          <Text className="font-semibold text-neutral-700">Continuar con Google</Text>
        </Pressable>
      )}

      <Link href="/registro" className="mt-2 text-center text-sm text-neutral-500">
        ¿No tienes cuenta? Regístrate
      </Link>
    </View>
  );
}
