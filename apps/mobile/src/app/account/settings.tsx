import { ScrollView, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useColorScheme } from "nativewind";
import { BRAND } from "@gemarket/shared";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/auth";
import { useProfile, useUpdateProfile } from "@/lib/hooks";
import { useTranslation } from "@/i18n/context";
import { languages } from "@/i18n/languages";
import { INFO_PAGES } from "@/lib/site";
import { Screen } from "@/components/ui/screen";
import { Icon } from "@/components/ui/icon";
import { Chip } from "@/components/ui/chip";
import { MenuRow, MenuGroup } from "@/components/ui/menu-row";
import { Button } from "@/components/ui/button";
import { useThemeColors } from "@/theme";

function SectionTitle({ children }: { children: string }) {
  return <Text className="mb-2 mt-5 px-1 font-sans-bold text-sm uppercase tracking-wide text-subtle">{children}</Text>;
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const theme = useThemeColors();
  return (
    <View className="flex-row items-center justify-between bg-card px-4 py-3.5">
      <Text className="flex-1 font-sans-medium text-base text-ink">{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.primary }} />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { language, setLanguage } = useTranslation();
  const { colorScheme, setColorScheme } = useColorScheme();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const update = useUpdateProfile(user?.id ?? "");

  const openInfo = (page: { path: string; title: string }) =>
    router.push(`/settings/webview?url=${encodeURIComponent(page.path)}&title=${encodeURIComponent(page.title)}`);

  const notif = (key: "notify_listings" | "notify_seller_requests" | "notify_followed_stores") => ({
    value: profile?.[key] ?? true,
    onChange: (v: boolean) => update.mutate({ [key]: v }),
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Language */}
        <SectionTitle>Idioma</SectionTitle>
        <View className="flex-row flex-wrap gap-2">
          {languages.map((l) => (
            <Chip key={l.code} label={l.label} active={l.code === language.code} onPress={() => setLanguage(l)} />
          ))}
        </View>

        {/* Appearance */}
        <SectionTitle>Apariencia</SectionTitle>
        <View className="flex-row gap-2">
          {(["system", "light", "dark"] as const).map((mode) => (
            <Chip
              key={mode}
              label={mode === "system" ? "Sistema" : mode === "light" ? "Claro" : "Oscuro"}
              active={(colorScheme ?? "system") === mode}
              onPress={() => setColorScheme(mode)}
            />
          ))}
        </View>

        {/* Notifications */}
        {user && (
          <>
            <SectionTitle>Notificaciones</SectionTitle>
            <MenuGroup>
              <ToggleRow label="Nuevos anuncios y coincidencias" {...notif("notify_listings")} />
              <View className="h-px bg-hairline" />
              <ToggleRow label="Estado de vendedor" {...notif("notify_seller_requests")} />
              <View className="h-px bg-hairline" />
              <ToggleRow label="Tiendas que sigo" {...notif("notify_followed_stores")} />
            </MenuGroup>
          </>
        )}

        {/* Help & legal */}
        <SectionTitle>Ayuda e información</SectionTitle>
        <MenuGroup>
          <MenuRow icon="help-circle-outline" label={INFO_PAGES.ayuda.title} onPress={() => openInfo(INFO_PAGES.ayuda)} />
          <View className="h-px bg-hairline" />
          <MenuRow icon="information-circle-outline" label={INFO_PAGES.sobreNosotros.title} onPress={() => openInfo(INFO_PAGES.sobreNosotros)} />
          <View className="h-px bg-hairline" />
          <MenuRow icon="card-outline" label={INFO_PAGES.pagos.title} onPress={() => openInfo(INFO_PAGES.pagos)} />
          <View className="h-px bg-hairline" />
          <MenuRow icon="mail-outline" label={INFO_PAGES.contacto.title} onPress={() => openInfo(INFO_PAGES.contacto)} />
        </MenuGroup>

        <SectionTitle>Legal</SectionTitle>
        <MenuGroup>
          <MenuRow icon="document-text-outline" label={INFO_PAGES.terminos.title} onPress={() => openInfo(INFO_PAGES.terminos)} />
          <View className="h-px bg-hairline" />
          <MenuRow icon="lock-closed-outline" label={INFO_PAGES.privacidad.title} onPress={() => openInfo(INFO_PAGES.privacidad)} />
          <View className="h-px bg-hairline" />
          <MenuRow icon="shield-checkmark-outline" label={INFO_PAGES.cookies.title} onPress={() => openInfo(INFO_PAGES.cookies)} />
        </MenuGroup>

        {user && (
          <View className="mt-6">
            <Button label="Cerrar sesión" variant="outline" icon="log-out-outline" onPress={() => signOut()} />
          </View>
        )}

        <View className="mt-6 flex-row items-center justify-center gap-1.5">
          <Icon name="pricetags" size={14} color={theme.faint} />
          <Text className="font-sans text-xs text-subtle">
            {BRAND.name} v{Constants.expoConfig?.version ?? "1.0.0"}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
