import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/auth";
import { useProfile, useOwnListings, useFavoriteSlugs, useUnreadCount, useOwnTienda } from "@/lib/hooks";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { MenuRow, MenuGroup } from "@/components/ui/menu-row";
import { AuthGate } from "@/components/auth-gate";
import { useThemeColors } from "@/theme";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center">
      <Text className="font-display text-xl text-ink">{value}</Text>
      <Text className="font-sans text-xs text-subtle">{label}</Text>
    </View>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { user, loading } = useAuth();

  const { data: profile } = useProfile(user?.id);
  const { data: ownListings } = useOwnListings(user?.id);
  const { data: favSlugs } = useFavoriteSlugs(user?.id);
  const { data: unread } = useUnreadCount(user?.id);
  const { data: tienda } = useOwnTienda(user?.id);

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
          <ActivityIndicator color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <View className="px-4 pt-3">
          <Text className="font-display text-2xl text-ink">Cuenta</Text>
        </View>
        <AuthGate />
      </Screen>
    );
  }

  const name = profile?.full_name || (user.user_metadata?.full_name as string | undefined) || user.email || "";
  const avatar = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Text className="px-1 font-display text-2xl text-ink">Cuenta</Text>

        {/* Profile card */}
        <View className="rounded-3xl border border-line bg-card p-4">
          <View className="flex-row items-center gap-4">
            <Avatar uri={avatar} name={name} size={60} />
            <View className="flex-1">
              <Text numberOfLines={1} className="font-sans-bold text-lg text-ink">
                {name}
              </Text>
              <Text numberOfLines={1} className="font-sans text-sm text-subtle">
                {user.email}
              </Text>
            </View>
          </View>
          <View className="mt-4 flex-row border-t border-hairline pt-3">
            <Stat label="Anuncios" value={ownListings?.length ?? 0} />
            <View className="w-px bg-hairline" />
            <Stat label="Favoritos" value={favSlugs?.length ?? 0} />
            <View className="w-px bg-hairline" />
            <Stat label="Avisos" value={unread ?? 0} />
          </View>
        </View>

        <Button label="Publicar anuncio" icon="add-circle-outline" onPress={() => router.push("/publish")} />

        {/* Activity */}
        <MenuGroup>
          <MenuRow icon="pricetags-outline" label="Mis anuncios" onPress={() => router.push("/account/my-listings")} />
          <View className="h-px bg-hairline" />
          <MenuRow
            icon="storefront-outline"
            label={tienda ? "Mi tienda" : "Crear mi tienda"}
            sublabel={tienda?.name}
            onPress={() => router.push("/account/store")}
          />
          <View className="h-px bg-hairline" />
          <MenuRow icon="bookmark-outline" label="Búsquedas guardadas" onPress={() => router.push("/account/saved-searches")} />
          <View className="h-px bg-hairline" />
          <MenuRow
            icon="notifications-outline"
            label="Notificaciones"
            badge={unread}
            onPress={() => router.push("/account/notifications")}
          />
        </MenuGroup>

        {/* Account */}
        <MenuGroup>
          <MenuRow icon="person-outline" label="Editar perfil" onPress={() => router.push("/account/profile-edit")} />
          <View className="h-px bg-hairline" />
          <MenuRow icon="star-outline" label="Planes y destacados" onPress={() => router.push("/plans")} />
          <View className="h-px bg-hairline" />
          <MenuRow icon="settings-outline" label="Ajustes" onPress={() => router.push("/account/settings")} />
        </MenuGroup>

        <Button label="Cerrar sesión" variant="outline" icon="log-out-outline" onPress={() => signOut()} />
      </ScrollView>
    </Screen>
  );
}
