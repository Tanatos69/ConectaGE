import { Alert, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Icon } from "@/components/ui/icon";
import { compressImage } from "@/lib/image";
import { useThemeColors } from "@/theme";

interface SingleImagePickerProps {
  uri?: string | null;
  onChange: (uri: string | null) => void;
  label: string;
  aspect?: [number, number];
  rounded?: boolean;
}

/** Pick/replace one image (store logo or banner). */
export function SingleImagePicker({ uri, onChange, label, aspect = [4, 3], rounded }: SingleImagePickerProps) {
  const theme = useThemeColors();

  async function pick() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso necesario", "Concede acceso a tus fotos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect, quality: 1 });
    if (result.canceled) return;
    onChange(await compressImage(result.assets[0].uri, 1024));
  }

  return (
    <View>
      <Text className="mb-2 font-sans-bold text-sm text-ink">{label}</Text>
      <Pressable
        onPress={pick}
        className={`items-center justify-center overflow-hidden border border-dashed border-line bg-card active:opacity-80 ${
          rounded ? "rounded-full" : "rounded-2xl"
        }`}
        style={rounded ? { width: 88, height: 88 } : { width: "100%", height: 120 }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        ) : (
          <View className="items-center gap-1">
            <Icon name="camera-outline" size={22} color={theme.primary} />
            <Text className="font-sans text-xs text-subtle">Añadir</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
