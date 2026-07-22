import { NextResponse, type NextRequest } from "next/server";
import webPush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

// Called by a Supabase Database Webhook (Studio → Database → Webhooks,
// configured manually — see supabase/README.md) on every INSERT into
// `notifications`. That single hook point means every existing
// notification-inserting trigger (listing published, followed-store post,
// saved-search match, etc.) gets a push counterpart for free, with zero
// changes to those triggers.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublicKey || !vapidPrivateKey) {
    return NextResponse.json({ error: "push no configurado" }, { status: 500 });
  }

  const payload = (await req.json()) as {
    record?: { user_id?: string; title?: string; message?: string };
  };
  const record = payload.record;
  if (!record?.user_id) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  webPush.setVapidDetails("mailto:info@conectage.com", vapidPublicKey, vapidPrivateKey);

  // No user session exists on a webhook request — RLS would block
  // everything, so this genuinely needs the service-role client, not just
  // a convenient one (see the eslint.config.mjs exemption for this file).
  const admin = createAdminClient();
  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", record.user_id);

  if (!subscriptions?.length) {
    return NextResponse.json({ sent: 0 });
  }

  const notificationPayload = JSON.stringify({
    title: record.title ?? "ConectaGE",
    message: record.message ?? "",
    url: "/mi-cuenta/notificaciones",
  });

  let sent = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notificationPayload,
        );
        sent++;
      } catch (err) {
        // 404/410 = the subscription is gone (browser data cleared,
        // uninstalled, etc.) — clean it up so it's never retried again.
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }),
  );

  return NextResponse.json({ sent });
}
