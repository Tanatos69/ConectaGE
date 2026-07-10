import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";
import { monthYearLabel } from "@/lib/time";
import { getSiteSettings } from "@/lib/supabase/settings";
import { AdminManagers, type AdminEntry } from "@/components/admin/admin-managers";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export const metadata: Metadata = { title: "Ajustes" };

async function getAdmins(): Promise<AdminEntry[]> {
  if (!isSupabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, email, full_name, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: true });
  return (data ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    fullName: (row.full_name as string) ?? "",
    since: monthYearLabel(row.created_at as string),
  }));
}

export default async function AdminAjustesPage() {
  const [user, admins, settings] = await Promise.all([getUser(), getAdmins(), getSiteSettings()]);

  return (
    <div className="space-y-6">
      {/* Admin role management */}
      {user && admins.length > 0 && (
        <AdminManagers admins={admins} currentAdminId={user.id} />
      )}

      {/* Site settings, persisted in site_settings (migration 0013) */}
      <SiteSettingsForm initialValues={settings} />
    </div>
  );
}
