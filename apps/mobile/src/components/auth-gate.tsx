import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useThemeColors } from "@/theme";

interface AuthGateProps {
  title?: string;
  subtitle?: string;
}

/** Signed-out placeholder for gated screens (favorites, dashboard, etc.). */
export function AuthGate({
  title = "Inicia sesión en GEMarket",
  subtitle = "Contacta vendedores, guarda favoritos y publica tus anuncios.",
}: AuthGateProps) {
  const router = useRouter();
  const theme = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center gap-6 px-8">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
        <Icon name="person-outline" size={34} color={theme.primary} />
      </View>
      <View className="gap-1.5">
        <Text className="text-center font-display text-xl text-ink">{title}</Text>
        <Text className="text-center font-sans text-sm leading-5 text-subtle">{subtitle}</Text>
      </View>
      <View className="w-full gap-3">
        <Button label="Iniciar sesión" icon="log-in-outline" onPress={() => router.push("/login")} />
        <Button label="Crear cuenta" variant="outline" onPress={() => router.push("/registro")} />
      </View>
    </View>
  );
}
