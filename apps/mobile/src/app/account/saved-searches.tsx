import { Alert, FlatList, Pressable, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { describeCriteria } from "@conectage/shared";
import { useAuth } from "@/lib/auth-context";
import { useSavedSearches, useDeleteSavedSearch, useSetSavedSearchAlerts } from "@/lib/hooks";
import { Screen } from "@/components/ui/screen";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { AuthGate } from "@/components/auth-gate";
import { useThemeColors } from "@/theme";

export default function SavedSearchesScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { user, loading } = useAuth();
  const { data: searches } = useSavedSearches(user?.id);
  const del = useDeleteSavedSearch(user?.id ?? "");
  const setAlerts = useSetSavedSearchAlerts(user?.id ?? "");

  if (!loading && !user) return <Screen><AuthGate /></Screen>;

  return (
    <Screen>
      <FlatList
        data={searches ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title="No tienes búsquedas guardadas"
            subtitle="Guarda una búsqueda desde la pestaña Buscar para recibir avisos de nuevos anuncios."
            actionLabel="Ir a buscar"
            onAction={() => router.push("/search")}
          />
        }
        renderItem={({ item }) => (
          <View className="rounded-2xl border border-line bg-card p-4">
            <Pressable
              onPress={() =>
                router.push(
                  `/search?cat=${item.criteria.category ?? ""}&q=${encodeURIComponent(item.criteria.q ?? "")}`,
                )
              }
              className="active:opacity-70"
            >
              <Text className="font-sans-bold text-base text-ink">{item.label}</Text>
              <Text className="mt-0.5 font-sans text-xs text-subtle">{describeCriteria(item.criteria)}</Text>
            </Pressable>
            <View className="mt-3 flex-row items-center justify-between border-t border-hairline pt-3">
              <View className="flex-row items-center gap-2">
                <Icon name="notifications-outline" size={16} color={theme.muted} />
                <Text className="font-sans text-sm text-body">Avisos</Text>
                <Switch
                  value={item.alerts}
                  onValueChange={(v) => setAlerts.mutate({ id: item.id, alerts: v })}
                  trackColor={{ true: theme.primary }}
                />
              </View>
              <Pressable
                onPress={() =>
                  Alert.alert("Eliminar búsqueda", "", [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Eliminar", style: "destructive", onPress: () => del.mutate(item.id) },
                  ])
                }
                hitSlop={8}
                className="flex-row items-center gap-1 active:opacity-70"
              >
                <Icon name="trash-outline" size={16} color={theme.featured} />
                <Text className="font-sans-medium text-sm text-featured">Eliminar</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}
