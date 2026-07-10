"use client";

import { useState, useTransition } from "react";
import { CheckCircle, AlertTriangle, Store, Bell, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationRow, NotificationKind } from "@/lib/supabase/types";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/actions/notifications";
import { postedLabel } from "@/lib/time";

const iconMap: Record<NotificationKind, React.ElementType> = {
  listing_published: CheckCircle,
  seller_request_approved: Store,
  seller_request_rejected: AlertTriangle,
  followed_store_listing: Bell,
  welcome: Sparkles,
  listing_removed: AlertTriangle,
};

const colorMap: Record<NotificationKind, string> = {
  listing_published: "bg-green-50 text-green-600",
  seller_request_approved: "bg-green-50 text-green-600",
  seller_request_rejected: "bg-red-50 text-destructive",
  followed_store_listing: "bg-blue-50 text-blue-600",
  welcome: "bg-primary/10 text-primary",
  listing_removed: "bg-red-50 text-destructive",
};

export function NotificationsList({ items }: { items: NotificationRow[] }) {
  const [notifications, setNotifications] = useState(items);
  const [, startTransition] = useTransition();
  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    startTransition(() => {
      markAllNotificationsReadAction();
    });
  }

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    startTransition(() => {
      markNotificationReadAction(id);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
          {unread > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">{unread} sin leer</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-xl border border-input bg-background px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Check className="size-3.5" />
            Marcar todo leído
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center shadow-sm">
          <CheckCircle className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No tienes notificaciones.</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm divide-y overflow-hidden">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] ?? CheckCircle;
            const colorClass = colorMap[n.type] ?? "bg-primary/10 text-primary";
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-secondary/50",
                  !n.read && "bg-accent/30",
                )}
                onClick={() => markRead(n.id)}
              >
                <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", colorClass)}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", !n.read ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{postedLabel(n.created_at)}</p>
                </div>
                {!n.read && <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
