import "@/lib/polyfills";
import "../global.css";

import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { useFonts as useInterFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import {
  useFonts as usePlusJakartaFonts,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/i18n/context";
import { colors } from "@/theme";

SplashScreen.preventAutoHideAsync();

/** Circular translucent back button that floats over hero images. */
function FloatingBack() {
  const router = useRouter();
  if (!router.canGoBack()) return null;
  return (
    <Pressable onPress={() => router.back()} hitSlop={8}>
      <View className="h-9 w-9 items-center justify-center rounded-full bg-black/45">
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

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
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              headerTintColor: colors.primary,
              headerTitleStyle: { fontFamily: "Inter_700Bold", color: colors.ink },
              headerStyle: { backgroundColor: colors.surface },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.surfaceMuted },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="listing/[slug]"
              options={{ headerShown: true, headerTransparent: true, title: "", headerLeft: () => <FloatingBack /> }}
            />
            <Stack.Screen
              name="store/[slug]"
              options={{ headerShown: true, headerTransparent: true, title: "", headerLeft: () => <FloatingBack /> }}
            />
            <Stack.Screen
              name="login"
              options={{ headerShown: true, title: "Iniciar sesión", presentation: "modal" }}
            />
            <Stack.Screen
              name="registro"
              options={{ headerShown: true, title: "Crear cuenta", presentation: "modal" }}
            />
            <Stack.Screen name="completar-perfil" options={{ headerShown: true, title: "Completa tu perfil" }} />
          </Stack>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
