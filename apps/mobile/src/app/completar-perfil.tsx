import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Stub — the real "complete your profile" form (matching apps/web's
 * /completar-perfil) is dashboard-parity scope, deferred per the mobile app
 * plan. This exists so the auth callback always has a valid screen to land on
 * when phone/birth_date are missing.
 */
export default function CompletarPerfilScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 justify-between bg-white px-6 pb-8">
      <EmptyState
        icon="person-add-outline"
        title="Completa tu perfil"
        subtitle="Esta sección estará disponible próximamente. Por ahora puedes seguir explorando anuncios."
      />
      <Button label="Volver al inicio" onPress={() => router.replace("/(tabs)")} />
    </View>
  );
}
