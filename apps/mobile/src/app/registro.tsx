import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { signUp } from "@/lib/auth";

export default function RegistroScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setError(null);
    setBusy(true);
    const result = await signUp({ fullName, email, password, phone, city, birthDate });
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white p-6">
        <Text className="text-center text-lg font-semibold text-neutral-900">¡Revisa tu correo!</Text>
        <Text className="text-center text-neutral-500">
          Te enviamos un enlace de confirmación para activar tu cuenta.
        </Text>
        <Pressable onPress={() => router.replace("/login")} className="mt-2">
          <Text className="text-primary font-semibold">Ir a iniciar sesión</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, gap: 16 }}>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nombre completo"
        className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
      />
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
        placeholder="Contraseña (mínimo 8 caracteres)"
        secureTextEntry
        className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
      />
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Teléfono, ej. +240222000000"
        keyboardType="phone-pad"
        className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
      />
      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="Ciudad"
        className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
      />
      <TextInput
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="Fecha de nacimiento (AAAA-MM-DD)"
        className="rounded-xl border border-neutral-200 px-4 py-3 text-base"
      />
      {error && <Text className="text-featured text-sm">{error}</Text>}
      <Pressable
        onPress={handleSubmit}
        disabled={busy}
        className="bg-primary h-12 items-center justify-center rounded-xl active:opacity-90"
      >
        {busy ? <ActivityIndicator color="white" /> : <Text className="text-primary-foreground font-semibold">Crear cuenta</Text>}
      </Pressable>
    </ScrollView>
  );
}
