import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { signUp } from "@/lib/auth";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { colors } from "@/theme";

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
      <View className="flex-1 items-center justify-center gap-4 bg-white px-8">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
          <Icon name="mail-open-outline" size={34} color={colors.primary} />
        </View>
        <View className="gap-1.5">
          <Text className="text-center font-display text-xl text-neutral-900">¡Revisa tu correo!</Text>
          <Text className="text-center font-sans text-sm leading-5 text-neutral-500">
            Te enviamos un enlace de confirmación para activar tu cuenta.
          </Text>
        </View>
        <Button label="Ir a iniciar sesión" onPress={() => router.replace("/login")} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#FFFFFF" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View className="gap-1 pb-2">
          <Text className="font-display text-2xl text-neutral-900">Crea tu cuenta</Text>
          <Text className="font-sans text-sm text-neutral-500">Únete a GEMarket en un minuto.</Text>
        </View>

        <TextField label="Nombre completo" icon="person-outline" value={fullName} onChangeText={setFullName} placeholder="Tu nombre" />
        <TextField
          label="Correo electrónico"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="tucorreo@ejemplo.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField label="Contraseña" icon="lock-closed-outline" value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" secure />
        <TextField
          label="Teléfono"
          icon="call-outline"
          value={phone}
          onChangeText={setPhone}
          placeholder="+240 222 000 000"
          keyboardType="phone-pad"
        />
        <TextField label="Ciudad" icon="location-outline" value={city} onChangeText={setCity} placeholder="Malabo" />
        <TextField
          label="Fecha de nacimiento"
          icon="calendar-outline"
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="AAAA-MM-DD"
          keyboardType="numbers-and-punctuation"
        />

        {error && (
          <View className="flex-row items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5">
            <Icon name="alert-circle" size={16} color={colors.featured} />
            <Text className="flex-1 font-sans text-sm text-featured">{error}</Text>
          </View>
        )}

        <Button label="Crear cuenta" loading={busy} onPress={handleSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
