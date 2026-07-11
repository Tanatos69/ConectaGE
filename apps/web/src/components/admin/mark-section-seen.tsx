"use client";

import { useEffect } from "react";
import { markAdminSectionSeenAction } from "@/lib/actions/admin";

/**
 * Renders nothing — fires once on mount to record that this admin has now
 * looked at this section, clearing its "new since last visit" sidebar badge
 * (see admin_view_state, migration 0017).
 */
export function MarkSectionSeen({ section }: { section: "users" | "listings" }) {
  useEffect(() => {
    markAdminSectionSeenAction(section);
    // Only ever needs to fire once per mount, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
