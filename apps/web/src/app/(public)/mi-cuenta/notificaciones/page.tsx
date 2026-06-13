"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, Clock, Star, Check } from "lucide-react";
import { demoNotifications, type NotificationType } from "@/lib/demo-user";
import { cn } from "@/lib/utils";

const iconMap: Record<NotificationType, React.ElementType> = {
  approved: CheckCircle,
  rejected: AlertTriangle,
  expiring: Clock,
  review: Star,
  review_approved: CheckCircle,
};

const colorMap: Record<NotificationType, string> = {
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-destructive",
  expiring: "bg-amber-50 text-amber-600",
  review: "bg-blue-50 text-blue-600",
  review_approved: "bg-green-50 text-green-600",
};

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState(demoNotifications);
  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
          {unread > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {unread} sin leer
            </p>
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
            const Icon = iconMap[n.type];
            const colorClass = colorMap[n.type];
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
                  <p className="text-xs text-muted-foreground mt-0.5">{n.date}</p>
                </div>
                {!n.read && (
                  <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Las notificaciones se eliminan automáticamente a los 90 días.
      </p>
    </div>
  );
}
