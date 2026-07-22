import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { LanguagePicker } from "@/components/language-picker";
import { colors } from "@/theme";

export default function AccountScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <Screen>
        <EmptyState icon="cloud-offline-outline" title="Cuenta" subtitle="Supabase no está configurado." />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-6 px-8">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
            <Icon name="person-outline" size={34} color={colors.primary} />
          </View>
          <View className="gap-1.5">
            <Text className="text-center font-display text-xl text-neutral-900">Inicia sesión en ConectaGE</Text>
            <Text className="text-center font-sans text-sm leading-5 text-neutral-500">
              Contacta vendedores, guarda favoritos y publica tus anuncios.
            </Text>
          </View>
          <View className="w-full gap-3">
            <Button label="Iniciar sesión" icon="log-in-outline" onPress={() => router.push("/login")} />
            <Button label="Crear cuenta" variant="outline" onPress={() => router.push("/registro")} />
          </View>
        </View>
      </Screen>
    );
  }

  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View className="flex-row items-center justify-between px-1 pt-1">
          <Text className="font-display text-2xl text-neutral-900">Cuenta</Text>
          <LanguagePicker />
        </View>

        {/* Profile card */}
        <View className="flex-row items-center gap-4 rounded-3xl bg-white p-4" style={{ borderWidth: 1, borderColor: colors.hairline }}>
          <Avatar uri={avatar} name={name} size={60} />
          <View className="flex-1">
            <Text numberOfLines={1} className="font-sans-bold text-lg text-neutral-900">
              {name}
            </Text>
            <Text numberOfLines={1} className="font-sans text-sm text-neutral-500">
              {user.email}
            </Text>
          </View>
        </View>

        <Button label="Cerrar sesión" variant="outline" icon="log-out-outline" onPress={() => signOut()} />
      </ScrollView>
    </Screen>
  );
}
