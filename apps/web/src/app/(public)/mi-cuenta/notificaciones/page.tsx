import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/supabase/queries";
import { NotificationsList } from "@/components/account/notifications-list";

export const metadata: Metadata = { title: "Notificaciones" };

export default async function NotificacionesPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/mi-cuenta/notificaciones");

  const items = await getNotifications(user.id);

  return <NotificationsList items={items} />;
}
