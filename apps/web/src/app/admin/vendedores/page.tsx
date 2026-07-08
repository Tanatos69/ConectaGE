import type { Metadata } from "next";
import { UserCheck } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SellerRequest, Profile } from "@/lib/supabase/types";
import { SellerRequestActions } from "@/components/admin/seller-request-actions";
import { postedLabel } from "@/lib/supabase/queries";

export const metadata: Metadata = { title: "Vendedores" };

interface RequestWithProfile extends SellerRequest {
  profiles: Pick<Profile, "full_name" | "email" | "phone" | "city"> | null;
}

async function getRequests(): Promise<RequestWithProfile[]> {
  if (!isSupabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  // Middleware + admin layout already gated this route to role='admin'.
  const admin = createAdminClient();
  const { data } = await admin
    .from("seller_requests")
    .select("*, profiles!seller_requests_user_id_fkey(full_name, email, phone, city)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return (data as RequestWithProfile[] | null) ?? [];
}

export default async function AdminVendedoresPage() {
  const requests = await getRequests();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Solicitudes de vendedor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Al aprobar una solicitud se crea la tienda y el usuario pasa a ser vendedor.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
          <UserCheck className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No hay solicitudes pendientes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Las nuevas solicitudes de tienda aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{req.store_name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {req.profiles?.full_name || "—"} · {req.profiles?.email || "—"}
                    {req.profiles?.phone ? ` · ${req.profiles.phone}` : ""}
                    {req.profiles?.city ? ` · ${req.profiles.city}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Solicitado {postedLabel(req.created_at).toLowerCase()}
                  </p>
                  {req.message && (
                    <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      {req.message}
                    </p>
                  )}
                </div>
                <SellerRequestActions requestId={req.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
