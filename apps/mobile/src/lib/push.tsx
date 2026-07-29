import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useAuth } from "./auth-context";
import { getSupabaseClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/config";

/**
 * Push registration. The saved-search matcher that actually SENDS pushes is a
 * Supabase Edge Function (server-side, tracked separately) — this is the
 * client half: it asks permission, gets the Expo push token and stores it in
 * `push_tokens` so the function knows where to deliver. Everything is guarded
 * so a missing table / Expo Go limitation never crashes the app.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

async function registerForPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;
  try {
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return null;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return token.data;
  } catch {
    return null;
  }
}

async function storeToken(userId: string, token: string): Promise<void> {
  try {
    await getSupabaseClient()
      .from("push_tokens")
      .upsert(
        { user_id: userId, token, platform: Platform.OS },
        { onConflict: "token" },
      );
  } catch {
    // push_tokens table may not exist yet (backend follow-on) — ignore.
  }
}

/** Invisible component: registers the logged-in user's device for push. */
export function PushGate() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    let cancelled = false;
    registerForPushToken().then((token) => {
      if (token && !cancelled) storeToken(user.id, token);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return null;
}
