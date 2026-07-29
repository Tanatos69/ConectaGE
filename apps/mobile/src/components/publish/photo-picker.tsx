import { Alert, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Icon } from "@/components/ui/icon";
import { compressAll } from "@/lib/image";
import { useThemeColors } from "@/theme";

interface PhotoPickerProps {
  uris: string[];
  onChange: (uris: string[]) => void;
  max?: number;
}

/** Grid of picked photos + add-from-gallery / camera actions. */
export function PhotoPicker({ uris, onChange, max = 8 }: PhotoPickerProps) {
  const theme = useThemeColors();
  const remaining = max - uris.length;

  async function pickFromLibrary() {
    if (remaining <= 0) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso necesario", "Concede acceso a tus fotos para añadir imágenes.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 1,
    });
    if (result.canceled) return;
    const picked = await compressAll(result.assets.map((a) => a.uri));
    onChange([...uris, ...picked].slice(0, max));
  }

  async function takePhoto() {
    if (remaining <= 0) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso necesario", "Concede acceso a la cámara para tomar una foto.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (result.canceled) return;
    const picked = await compressAll(result.assets.map((a) => a.uri));
    onChange([...uris, ...picked].slice(0, max));
  }

  function remove(uri: string) {
    onChange(uris.filter((u) => u !== uri));
  }

  return (
    <View>
      <View className="flex-row flex-wrap gap-2.5">
        {uris.map((uri, i) => (
          <View key={uri} className="relative">
            <Image source={{ uri }} style={{ width: 96, height: 96, borderRadius: 14 }} contentFit="cover" />
            {i === 0 && (
              <View className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5">
                <Text className="font-sans-medium text-[10px] text-white">Portada</Text>
              </View>
            )}
            <Pressable
              onPress={() => remove(uri)}
              hitSlop={6}
              className="absolute -right-1.5 -top-1.5 h-6 w-6 items-center justify-center rounded-full bg-featured"
            >
              <Icon name="close" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        ))}

        {remaining > 0 && (
          <>
            <Pressable
              onPress={pickFromLibrary}
              className="h-24 w-24 items-center justify-center gap-1 rounded-2xl border border-dashed border-line bg-card active:opacity-70"
            >
              <Icon name="images-outline" size={22} color={theme.primary} />
              <Text className="font-sans-medium text-[11px] text-subtle">Galería</Text>
            </Pressable>
            <Pressable
              onPress={takePhoto}
              className="h-24 w-24 items-center justify-center gap-1 rounded-2xl border border-dashed border-line bg-card active:opacity-70"
            >
              <Icon name="camera-outline" size={22} color={theme.primary} />
              <Text className="font-sans-medium text-[11px] text-subtle">Cámara</Text>
            </Pressable>
          </>
        )}
      </View>
      <Text className="mt-2 font-sans text-xs text-subtle">
        {uris.length}/{max} fotos · La primera es la portada
      </Text>
    </View>
  );
}
