import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { colors } from "@/theme";

/**
 * Lands here after either an OAuth redirect or an email-confirmation link
 * deep-links back into the app (<scheme>://auth/callback?code=..., scheme from app.json).
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
      <View className="flex-1 justify-between bg-white px-6 pb-8">
        <EmptyState icon="alert-circle-outline" title="Inicio de sesión" subtitle={error} />
        <Button label="Volver a intentar" onPress={() => router.replace("/login")} />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
