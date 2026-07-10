"use client";

import { useState } from "react";
import { X } from "lucide-react";

/**
 * Reusable typed-confirmation modal for irreversible admin actions. No
 * existing dialog primitive in this codebase, so this matches the same
 * hand-rolled overlay markup already used in onboarding-intent-modal.tsx
 * and report-button.tsx rather than pulling in a new dependency.
 */
export function TypedConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmLabel = "Eliminar",
  pending = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  /** The exact text the admin must type to enable the confirm button. */
  confirmText: string;
  confirmLabel?: string;
  pending?: boolean;
}) {
  const [value, setValue] = useState("");

  if (!open) return null;

  const matches = value.trim() === confirmText;

  function handleClose() {
    setValue("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">{description}</p>

        <p className="mt-4 text-xs text-muted-foreground">
          Escribe <span className="font-mono font-semibold text-foreground">{confirmText}</span> para
          confirmar:
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          autoComplete="off"
        />

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => matches && onConfirm()}
            disabled={!matches || pending}
            className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Eliminando…" : confirmLabel}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
