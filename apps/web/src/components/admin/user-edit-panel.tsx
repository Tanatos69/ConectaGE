"use client";

import { useState, useTransition } from "react";
import { Save, StickyNote, Pencil } from "lucide-react";
import { adminUpdateUserProfileAction, addUserNoteAction } from "@/lib/actions/admin";

const inputClass =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30";

/** Admin-side profile corrections + internal notes on a user. */
export function UserEditPanel({
  userId,
  fullName,
  phone,
  city,
}: {
  userId: string;
  fullName: string;
  phone: string | null;
  city: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName, phone: phone ?? "", city: city ?? "" });
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [pending, startTransition] = useTransition();

  function flash(msg: string) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 3000);
  }

  function saveProfile() {
    setError("");
    startTransition(async () => {
      const result = await adminUpdateUserProfileAction(userId, form);
      if (result?.error) setError(result.error);
      else {
        setEditing(false);
        flash("Perfil actualizado.");
      }
    });
  }

  function saveNote() {
    setError("");
    startTransition(async () => {
      const result = await addUserNoteAction(userId, note);
      if (result?.error) setError(result.error);
      else {
        setNote("");
        flash("Nota guardada.");
      }
    });
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Pencil className="size-4 text-primary" />
          Editar y anotar
        </h2>
        {savedMsg && <span className="text-xs font-medium text-green-600">{savedMsg}</span>}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Nombre completo"
              className={inputClass}
            />
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Teléfono / WhatsApp"
              className={inputClass}
            />
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Ciudad"
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveProfile}
              disabled={pending}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="size-4" />
              {pending ? "Guardando…" : "Guardar perfil"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
        >
          Editar datos del perfil
        </button>
      )}

      <div className="border-t pt-4 space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <StickyNote className="size-3.5" />
          Nota interna (solo visible para admins)
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej.: verificado por teléfono, aviso previo por spam…"
            className={inputClass}
            onKeyDown={(e) => e.key === "Enter" && note.trim() && saveNote()}
          />
          <button
            onClick={saveNote}
            disabled={pending || !note.trim()}
            className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            Añadir
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
