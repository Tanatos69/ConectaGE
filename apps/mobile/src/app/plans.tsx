import { ScrollView, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { webPath } from "@/lib/site";
import { Screen } from "@/components/ui/screen";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useThemeColors } from "@/theme";

const PERKS = [
  { icon: "star", title: "Anuncios destacados", desc: "Aparece primero en la búsqueda y la portada." },
  { icon: "trending-up", title: "Más visibilidad", desc: "Hasta 10× más vistas en tus anuncios." },
  { icon: "shield-checkmark", title: "Tienda verificada", desc: "Genera confianza con la insignia verificada." },
  { icon: "infinite", title: "Más anuncios activos", desc: "Publica sin límites diarios." },
] as const;

export default function PlansScreen() {
  const theme = useThemeColors();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View className="items-center gap-2 rounded-3xl bg-primary p-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <Icon name="rocket" size={28} color="#FFFFFF" />
          </View>
          <Text className="text-center font-display text-2xl text-white">Impulsa tu negocio</Text>
          <Text className="text-center font-sans text-sm leading-5 text-white/90">
            Destaca tus anuncios y consigue una tienda verificada para vender más rápido.
          </Text>
        </View>

        <View className="gap-3">
          {PERKS.map((p) => (
            <View key={p.title} className="flex-row items-center gap-3 rounded-2xl border border-line bg-card p-4">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
                <Icon name={p.icon} size={20} color={theme.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-base text-ink">{p.title}</Text>
                <Text className="font-sans text-sm text-subtle">{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="rounded-2xl bg-fill p-4">
          <Text className="text-center font-sans text-sm leading-5 text-body">
            Los pagos y la activación de destacados se gestionan de forma segura en nuestra web.
          </Text>
        </View>

        <Button
          label="Ver planes en la web"
          icon="open-outline"
          onPress={() => WebBrowser.openBrowserAsync(webPath("/planes"))}
        />
      </ScrollView>
    </Screen>
  );
}
