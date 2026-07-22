import { Pressable, Text, Linking, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";

interface WhatsAppCTAProps {
  phoneNumber: string;
  listingTitle: string;
  listingSlug?: string;
  tiendaSlug?: string;
  message?: string;
  label?: string;
}

/** Mirrors apps/web/src/components/listing/whatsapp-cta.tsx for React Native. */
export function WhatsAppCTA({
  phoneNumber,
  listingTitle,
  listingSlug,
  tiendaSlug,
  message,
  label = "Contactar por WhatsApp",
}: WhatsAppCTAProps) {
  const { user } = useAuth();
  const router = useRouter();

  const clean = phoneNumber.replace(/\D/g, "");
  const msg = message ?? `Hola, me interesa tu anuncio: ${listingTitle}`;
  const href = `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;

  async function handlePress() {
    // Contacting a seller requires an account — spam/abuse control, and it
    // unlocks leaving a review afterwards.
    if (!user) {
      router.push("/login");
      return;
    }

    if (listingSlug || tiendaSlug) {
      try {
        const supabase = getSupabaseClient();
        await supabase.from("listing_contacts").insert(
          listingSlug
            ? { user_id: user.id, listing_slug: listingSlug }
            : { user_id: user.id, tienda_slug: tiendaSlug },
        );
      } catch {
        // Tracking must never block contacting the seller.
      }
    }

    Linking.openURL(href);
  }

  return (
    <Pressable
      onPress={handlePress}
      className="h-14 flex-row items-center justify-center gap-2.5 rounded-2xl bg-whatsapp px-5 active:opacity-90"
    >
      <View className="flex-row items-center gap-2.5">
        <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
        <Text className="font-sans-bold text-base text-whatsapp-foreground">{label}</Text>
      </View>
    </Pressable>
  );
}
