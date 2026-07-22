import { Text, View } from "react-native";
import { useRouter } from "expo-router";

/**
 * Stub — the real "complete your profile" form (matching
 * apps/web's /completar-perfil) is dashboard-parity scope, deferred per
 * the mobile app plan. This exists so the auth callback always has a
 * valid screen to land on when phone/birth_date are missing.
 */
export default function CompletarPerfilScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white p-6">
      <Text className="text-center text-lg font-semibold text-neutral-900">Completa tu perfil</Text>
      <Text className="text-center text-neutral-500">
        Esta pantalla estará disponible próximamente. Por ahora puedes seguir explorando anuncios.
      </Text>
      <Text className="text-primary mt-2 font-semibold" onPress={() => router.replace("/(tabs)")}>
        Volver al inicio
      </Text>
    </View>
  );
}
