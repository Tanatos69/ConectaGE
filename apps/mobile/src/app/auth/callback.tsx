import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Lands here after either an OAuth redirect or an email-confirmation link
 * deep-links back into the app (conectage://auth/callback?code=...).
 * Mirrors apps/web/src/app/auth/callback/route.ts's exchangeCodeForSession +
 * profile-completeness check.
 */
/** Only the "no code at all" cases — known synchronously from the URL, no effect needed. */
function immediateError(code?: string, oauthError?: string): string | null {
  if (oauthError) return "No se pudo completar el inicio de sesión.";
  if (!code) return "Enlace inválido o caducado.";
  return null;
}

export default function AuthCallbackScreen() {
  const { code, error: oauthError } = useLocalSearchParams<{ code?: string; error?: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(() => immediateError(code, oauthError));
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !code || oauthError) return;
    ran.current = true;

    (async () => {
      const supabase = getSupabaseClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError || !data.session) {
        setError("No se pudo completar el inicio de sesión.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, birth_date")
        .eq("id", data.session.user.id)
        .maybeSingle();

      if (!profile?.phone || !profile?.birth_date) {
        router.replace("/completar-perfil");
      } else {
        router.replace("/(tabs)");
      }
    })();
  }, [code, oauthError, router]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white p-6">
        <Text className="text-center text-neutral-700">{error}</Text>
        <Text className="text-primary font-semibold" onPress={() => router.replace("/login")}>
          Volver a intentar
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator color="#216FD1" />
    </View>
  );
}
