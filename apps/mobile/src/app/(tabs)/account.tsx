import { ActivityIndicator, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AccountScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-neutral-500">Supabase no está configurado.</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#216FD1" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-white px-6">
        <Text className="text-center text-lg font-semibold text-neutral-900">
          Inicia sesión para ver tu cuenta
        </Text>
        <Pressable
          onPress={() => router.push("/login")}
          className="bg-primary h-12 w-full items-center justify-center rounded-xl"
        >
          <Text className="text-primary-foreground font-semibold">Iniciar sesión</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 gap-4 bg-white p-6">
      <Text className="text-lg font-semibold text-neutral-900">{user.email}</Text>
      <Pressable
        onPress={() => signOut()}
        className="h-12 items-center justify-center rounded-xl border border-neutral-200"
      >
        <Text className="font-semibold text-neutral-700">Cerrar sesión</Text>
      </Pressable>
    </SafeAreaView>
  );
}
