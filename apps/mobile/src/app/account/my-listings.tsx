import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import type { ListingRow } from "@conectage/shared";
import { useAuth } from "@/lib/auth-context";
import { useOwnListings, useDeleteListing, useListingStatusMutation } from "@/lib/hooks";
import { formatPrice } from "@/lib/format";
import { Screen } from "@/components/ui/screen";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AuthGate } from "@/components/auth-gate";
import { useThemeColors } from "@/theme";

const statusMeta: Record<ListingRow["status"], { label: string; tone: "success" | "warning" | "featured" | "neutral" }> = {
  published: { label: "Publicado", tone: "success" },
  pending: { label: "En revisión", tone: "warning" },
  rejected: { label: "Rechazado", tone: "featured" },
  expired: { label: "Pausado", tone: "neutral" },
};

export default function MyListingsScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { user, loading } = useAuth();
  const { data: listings, isLoading } = useOwnListings(user?.id);
  const del = useDeleteListing(user?.id ?? "");
  const setStatus = useListingStatusMutation(user?.id ?? "");

  if (!loading && !user) return <Screen><AuthGate /></Screen>;

  function openActions(item: ListingRow) {
    const isPaused = item.status === "expired";
    Alert.alert(item.title, undefined, [
      { text: "Editar", onPress: () => router.push(`/listing/edit/${item.id}`) },
      item.status === "published" || isPaused
        ? {
            text: isPaused ? "Republicar" : "Pausar",
            onPress: () => setStatus.mutate({ id: item.id, status: isPaused ? "published" : "expired" }),
          }
        : { text: "Ver", onPress: () => router.push(`/listing/${item.slug}`) },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () =>
          Alert.alert("Eliminar anuncio", "Esta acción no se puede deshacer.", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => del.mutate(item.id) },
          ]),
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  return (
    <Screen>
      <FlatList
        data={listings ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-16">
              <Text className="font-sans text-sm text-subtle">Cargando…</Text>
            </View>
          ) : (
            <EmptyState
              icon="pricetags-outline"
              title="Aún no has publicado nada"
              actionLabel="Publicar anuncio"
              onAction={() => router.push("/publish")}
            />
          )
        }
        renderItem={({ item }) => {
          const meta = statusMeta[item.status];
          return (
            <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-card p-2.5">
              <Pressable onPress={() => router.push(`/listing/${item.slug}`)}>
                {item.images?.[0] ? (
                  <Image source={{ uri: item.images[0] }} style={{ width: 64, height: 64, borderRadius: 12 }} contentFit="cover" />
                ) : (
                  <View className="h-16 w-16 items-center justify-center rounded-xl bg-fill">
                    <Icon name="image-outline" size={22} color={theme.faint} />
                  </View>
                )}
              </Pressable>
              <View className="flex-1">
                <Text numberOfLines={1} className="font-sans-medium text-sm text-ink">{item.title}</Text>
                <Text className="font-sans-bold text-sm text-primary">{formatPrice(item)}</Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <Badge label={meta.label} tone={meta.tone} />
                  <Text className="font-sans text-xs text-subtle">{item.views_count} vistas</Text>
                </View>
              </View>
              <Pressable onPress={() => openActions(item)} hitSlop={8} className="p-1.5 active:opacity-60">
                <Icon name="ellipsis-vertical" size={20} color={theme.muted} />
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={
          (listings?.length ?? 0) > 0 ? (
            <View className="pt-2">
              <Button label="Publicar otro anuncio" variant="soft" icon="add" onPress={() => router.push("/publish")} />
            </View>
          ) : null
        }
      />
    </Screen>
  );
}
