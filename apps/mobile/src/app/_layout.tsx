import "@/lib/polyfills";
import "../global.css";

import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts as useInterFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import {
  useFonts as usePlusJakartaFonts,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/i18n/context";
import { queryClient } from "@/lib/query-client";
import { PushGate } from "@/lib/push";
import { useThemeColors } from "@/theme";

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

function RootNavigator() {
  const theme = useThemeColors();
  return (
    <>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          headerTintColor: theme.primary,
          headerTitleStyle: { fontFamily: "Inter_700Bold", color: theme.ink },
          headerStyle: { backgroundColor: theme.surface },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.surfaceMuted },
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
        <Stack.Screen name="listing/edit/[id]" options={{ headerShown: true, title: "Editar anuncio" }} />
        <Stack.Screen name="publish/index" options={{ headerShown: true, title: "Publicar anuncio", presentation: "modal" }} />
        <Stack.Screen name="account/profile-edit" options={{ headerShown: true, title: "Editar perfil" }} />
        <Stack.Screen name="account/my-listings" options={{ headerShown: true, title: "Mis anuncios" }} />
        <Stack.Screen name="account/store" options={{ headerShown: true, title: "Mi tienda" }} />
        <Stack.Screen name="account/saved-searches" options={{ headerShown: true, title: "Búsquedas guardadas" }} />
        <Stack.Screen name="account/notifications" options={{ headerShown: true, title: "Notificaciones" }} />
        <Stack.Screen name="account/settings" options={{ headerShown: true, title: "Ajustes" }} />
        <Stack.Screen name="settings/webview" options={{ headerShown: true, title: "" }} />
        <Stack.Screen name="plans" options={{ headerShown: true, title: "Planes y destacados" }} />
        <Stack.Screen name="login" options={{ headerShown: true, title: "Iniciar sesión", presentation: "modal" }} />
        <Stack.Screen name="registro" options={{ headerShown: true, title: "Crear cuenta", presentation: "modal" }} />
        <Stack.Screen name="recuperar-contrasena" options={{ headerShown: true, title: "Recuperar contraseña" }} />
        <Stack.Screen name="completar-perfil" options={{ headerShown: true, title: "Completa tu perfil" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [interLoaded] = useInterFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  const [jakartaLoaded] = usePlusJakartaFonts({ PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold });
  const fontsLoaded = interLoaded && jakartaLoaded;

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <AuthProvider>
              <PushGate />
              <RootNavigator />
            </AuthProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
