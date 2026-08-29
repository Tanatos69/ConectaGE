import { useLayoutEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { webPath } from "@/lib/site";
import { useThemeColors } from "@/theme";

/** Hosts the web app's static info/legal pages inside the app. */
export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();
  const navigation = useNavigation();
  const theme = useThemeColors();

  useLayoutEffect(() => {
    if (title) navigation.setOptions({ title });
  }, [navigation, title]);

  const source = /^https?:\/\//.test(url) ? url : webPath(url);

  return (
    <View className="flex-1 bg-bg">
      <WebView
        source={{ uri: source }}
        startInLoadingState
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-bg">
            <ActivityIndicator color={theme.primary} />
          </View>
        )}
        style={{ backgroundColor: theme.surfaceMuted }}
      />
    </View>
  );
}
