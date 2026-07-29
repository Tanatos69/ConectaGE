import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/i18n/context";
import { useAuth } from "@/lib/auth-context";
import { useUnreadCount } from "@/lib/hooks";
import { useThemeColors } from "@/theme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/** Factory for a tab's icon renderer (swaps outline/filled on focus). */
function tabIcon(active: IoniconName, inactive: IoniconName) {
  const Render = ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={24} color={color} />
  );
  Render.displayName = `TabIcon(${active})`;
  return Render;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useThemeColors();
  const { user } = useAuth();
  const { data: unread } = useUnreadCount(user?.id);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.faint,
        tabBarLabelStyle: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
        tabBarStyle: {
          borderTopColor: theme.hairline,
          backgroundColor: theme.surface,
          height: 86,
          paddingTop: 6,
          paddingBottom: 24,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t("tabs.home"), tabBarIcon: tabIcon("home", "home-outline") }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: t("tabs.search"), tabBarIcon: tabIcon("search", "search-outline") }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: t("tabs.favorites"), tabBarIcon: tabIcon("heart", "heart-outline") }}
      />
      <Tabs.Screen
        name="stores"
        options={{ title: t("tabs.stores"), tabBarIcon: tabIcon("storefront", "storefront-outline") }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t("tabs.account"),
          tabBarIcon: tabIcon("person-circle", "person-circle-outline"),
          tabBarBadge: unread && unread > 0 ? unread : undefined,
        }}
      />
    </Tabs>
  );
}
