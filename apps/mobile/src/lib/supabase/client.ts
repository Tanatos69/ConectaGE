import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSupabaseClient } from "@gemarket/shared";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

/**
 * Singleton client for the whole app — created lazily so importing this
 * module doesn't throw before env vars are checked by a caller.
 */
let client: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no está configurado (faltan variables de entorno).");
  }
  if (!client) {
    client = createSupabaseClient({
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      storage: AsyncStorage,
    });
    // Supabase's auto token refresh needs to be told when the app is/isn't
    // foregrounded — otherwise it keeps refreshing in the background.
    AppState.addEventListener("change", (state) => {
      if (state === "active") {
        client?.auth.startAutoRefresh();
      } else {
        client?.auth.stopAutoRefresh();
      }
    });
  }
  return client;
}
