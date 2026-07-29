import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import type { TiendaRow } from "@conectage/shared";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { useThemeColors, shadow } from "@/theme";

interface StoreCardProps {
  store: TiendaRow;
  onPress: () => void;
  following?: boolean;
  onToggleFollow?: () => void;
}

export function StoreCard({ store, onPress, following, onToggleFollow }: StoreCardProps) {
  const theme = useThemeColors();
  return (
    <Pressable onPress={onPress} className="active:opacity-95">
      <View className="overflow-hidden rounded-2xl bg-card" style={shadow.card}>
        {store.banner ? (
          <Image source={{ uri: store.banner }} style={{ width: "100%", height: 96 }} contentFit="cover" />
        ) : (
          <View style={{ width: "100%", height: 96 }} className="bg-primary-soft" />
        )}
        <View className="flex-row items-center gap-3 p-3">
          <View className="-mt-8 rounded-full border-2 border-card">
            <Avatar uri={store.logo} name={store.name} size={52} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text numberOfLines={1} className="flex-1 font-sans-bold text-base text-ink">
                {store.name}
              </Text>
              {store.verified && <Icon name="checkmark-circle" size={16} color={theme.primary} />}
            </View>
            <Text numberOfLines={1} className="font-sans text-xs text-subtle">
              {store.city} · {store.followers_count} seguidores
            </Text>
          </View>
          {onToggleFollow && (
            <Pressable
              onPress={onToggleFollow}
              hitSlop={6}
              className={`h-9 items-center justify-center rounded-full px-4 active:opacity-80 ${
                following ? "border border-line bg-card" : "bg-primary"
              }`}
            >
              <Text className={`font-sans-bold text-xs ${following ? "text-body" : "text-primary-foreground"}`}>
                {following ? "Siguiendo" : "Seguir"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}
