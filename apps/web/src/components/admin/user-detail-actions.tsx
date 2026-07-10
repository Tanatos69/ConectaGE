"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff, ShieldAlert, Store, Trash2 } from "lucide-react";
import {
  blockUserAction,
  unblockUserAction,
  deleteUserAction,
  grantAdminAction,
  revokeAdminAction,
  promoteToSellerAction,
} from "@/lib/actions/admin";
import { TypedConfirmDialog } from "./typed-confirm-dialog";

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

function useAction() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function run(fn: () => Promise<{ error?: string }>, onSuccess?: () => void) {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setError(result.error);
      else onSuccess?.();
    });
  }
  return { error, pending, run };
}

export function UserDetailActions({
  userId,
  email,
  fullName,
  role,
  blockedAt,
  isSelf,
}: {
  userId: string;
  email: string;
  fullName: string;
  role: "buyer" | "seller" | "admin";
  blockedAt: string | null;
  isSelf: boolean;
}) {
  const router = useRouter();
  const { error: blockError, pending: blockPending, run: runBlock } = useAction();
  const { error: adminError, pending: adminPending, run: runAdmin } = useAction();
  const { error: promoteError, pending: promotePending, run: runPromote } = useAction();
  const { error: deleteError, pending: deletePending, run: runDelete } = useAction();

  const [blocking, setBlocking] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Block / unblock */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          {blockedAt ? (
            <ShieldOff className="size-4 text-destructive" />
          ) : (
            <ShieldAlert className="size-4 text-muted-foreground" />
          )}
          <h2 className="text-sm font-semibold text-foreground">
            {blockedAt ? "Cuenta bloqueada" : "Bloquear cuenta"}
          </h2>
        </div>

        {blockedAt ? (
          <>
            <p className="text-xs text-muted-foreground">
              Bloqueada el {new Date(blockedAt).toLocaleDateString("es-ES")}.
            </p>
            <button
              type="button"
              onClick={() => runBlock(() => unblockUserAction(userId), refresh)}
              disabled={blockPending}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {blockPending ? "Desbloqueando…" : "Desbloquear cuenta"}
            </button>
          </>
        ) : blocking ? (
          <div className="space-y-3">
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Motivo del bloqueo (se mostrará a este usuario)…"
              rows={3}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  runBlock(
                    () => blockUserAction(userId, blockReason),
                    () => {
                      setBlocking(false);
                      setBlockReason("");
                      refresh();
                    },
                  )
                }
                disabled={blockPending || !blockReason.trim()}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {blockPending ? "Bloqueando…" : "Confirmar bloqueo"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlocking(false);
                  setBlockReason("");
                }}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setBlocking(true)}
            disabled={isSelf}
            className="rounded-xl border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Bloquear cuenta
          </button>
        )}
        {isSelf && !blockedAt && (
          <p className="text-xs text-muted-foreground">No puedes bloquear tu propia cuenta.</p>
        )}
        {blockError && <p className="text-xs text-destructive">{blockError}</p>}
      </div>

      {/* Role management */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Rol</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Rol actual: <span className="font-semibold text-foreground">{role}</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {role === "buyer" &&
            (promoting ? (
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Nombre de la tienda"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    runPromote(
                      () => promoteToSellerAction(userId, storeName),
                      () => {
                        setPromoting(false);
                        refresh();
                      },
                    )
                  }
                  disabled={promotePending || storeName.trim().length < 3}
                  className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {promotePending ? "Creando…" : "Confirmar"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPromoting(true)}
                className="flex items-center gap-1.5 rounded-xl border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                <Store className="size-3.5" />
                Convertir en vendedor
              </button>
            ))}

          {role !== "admin" ? (
            <button
              type="button"
              onClick={() => runAdmin(() => grantAdminAction(email), refresh)}
              disabled={adminPending}
              className="flex items-center gap-1.5 rounded-xl border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-60"
            >
              <ShieldCheck className="size-3.5" />
              {adminPending ? "Concediendo…" : "Conceder acceso admin"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => runAdmin(() => revokeAdminAction(userId), refresh)}
              disabled={adminPending || isSelf}
              className="flex items-center gap-1.5 rounded-xl border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {adminPending ? "Revocando…" : "Revocar acceso admin"}
            </button>
          )}
        </div>
        {(adminError || promoteError) && (
          <p className="text-xs text-destructive">{adminError || promoteError}</p>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Trash2 className="size-4 text-destructive" />
          <h2 className="text-sm font-semibold text-destructive">Eliminar cuenta</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Elimina la cuenta y todo su contenido (anuncios, reseñas, tienda, reportes) de forma
          permanente. Esta acción no se puede deshacer.
        </p>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={isSelf}
          className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Eliminar cuenta permanentemente
        </button>
        {isSelf && (
          <p className="text-xs text-muted-foreground">No puedes eliminar tu propia cuenta.</p>
        )}
        {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
      </div>

      <TypedConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          runDelete(
            () => deleteUserAction(userId),
            () => router.push("/admin/usuarios"),
          )
        }
        title="Eliminar cuenta permanentemente"
        description={`Esto elimina la cuenta de ${fullName || email} y todo su contenido de forma irreversible.`}
        confirmText={email}
        confirmLabel="Eliminar cuenta"
        pending={deletePending}
      />
    </div>
  );
}
