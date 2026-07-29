import { FlatList, Pressable, Text, View } from "react-native";
import type { NotificationKind } from "@conectage/shared";
import { useAuth } from "@/lib/auth-context";
import { useNotifications, useMarkAllNotificationsRead } from "@/lib/hooks";
import { markNotificationRead } from "@/lib/queries";
import { postedLabel } from "@/lib/format";
import { Screen } from "@/components/ui/screen";
import { Icon, type IconName } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { AuthGate } from "@/components/auth-gate";
import { useThemeColors } from "@/theme";

const iconByKind: Record<NotificationKind, IconName> = {
  listing_published: "checkmark-circle-outline",
  seller_request_approved: "storefront-outline",
  seller_request_rejected: "close-circle-outline",
  followed_store_listing: "pricetags-outline",
  welcome: "hand-left-outline",
  listing_removed: "trash-outline",
  listing_approved: "checkmark-circle-outline",
  featured_confirmed: "star-outline",
  featured_rejected: "close-circle-outline",
  saved_search_match: "search-outline",
};

export default function NotificationsScreen() {
  const theme = useThemeColors();
  const { user, loading } = useAuth();
  const { data: notifications, refetch } = useNotifications(user?.id);
  const markAll = useMarkAllNotificationsRead(user?.id ?? "");

  if (!loading && !user) return <Screen><AuthGate /></Screen>;

  const hasUnread = (notifications ?? []).some((n) => !n.read);

  return (
    <Screen>
      {hasUnread && (
        <View className="items-end px-4 pt-2">
          <Pressable onPress={() => markAll.mutate()} hitSlop={8} className="active:opacity-70">
            <Text className="font-sans-medium text-sm text-primary">Marcar todo como leído</Text>
          </Pressable>
        </View>
      )}
      <FlatList
        data={notifications ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title="No tienes notificaciones" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={async () => {
              if (!item.read) {
                await markNotificationRead(item.id);
                refetch();
              }
            }}
            className={`flex-row gap-3 rounded-2xl border p-3.5 active:opacity-80 ${
              item.read ? "border-line bg-card" : "border-primary/30 bg-primary-soft"
            }`}
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
              <Icon name={iconByKind[item.type] ?? "notifications-outline"} size={18} color={theme.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-sans-bold text-sm text-ink">{item.title}</Text>
              <Text className="mt-0.5 font-sans text-sm leading-5 text-body">{item.message}</Text>
              <Text className="mt-1 font-sans text-xs text-subtle">{postedLabel(item.created_at)}</Text>
            </View>
            {!item.read && <View className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />}
          </Pressable>
        )}
      />
    </Screen>
  );
}
