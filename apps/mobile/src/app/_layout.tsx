import "@/lib/polyfills";
import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts as useInterFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import {
  useFonts as usePlusJakartaFonts,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/i18n/context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [jakartaLoaded] = usePlusJakartaFonts({
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const fontsLoaded = interLoaded && jakartaLoaded;

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <LanguageProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="listing/[slug]" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="store/[slug]" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="login" options={{ headerShown: true, title: "Iniciar sesión", presentation: "modal" }} />
          <Stack.Screen name="registro" options={{ headerShown: true, title: "Crear cuenta", presentation: "modal" }} />
          <Stack.Screen name="completar-perfil" options={{ headerShown: true, title: "Completa tu perfil" }} />
        </Stack>
      </AuthProvider>
    </LanguageProvider>
  );
}
