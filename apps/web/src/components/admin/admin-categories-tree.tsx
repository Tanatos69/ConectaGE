"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight, Plus, Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  createCategoryAction,
  updateCategoryAction,
  setCategoryActiveAction,
  deleteCategoryAction,
} from "@/lib/actions/admin";
import { iconByName, AVAILABLE_ICONS, DEFAULT_ICON_NAME } from "@/lib/categories";
import type { AdminCategoryNode } from "@/app/admin/data";
import { cn } from "@/lib/utils";

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

function CategoryIcon({ iconName }: { iconName: string | null }) {
  const icon = (iconName && iconByName[iconName]) || iconByName[DEFAULT_ICON_NAME];
  return (
    <FontAwesomeIcon icon={icon} className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
  );
}

function SubcategoryRow({ sub, count }: { sub: AdminCategoryNode; count: number }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(sub.name);
  const editAction = useAction();
  const deleteAction = useAction();

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-3 py-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="h-8 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
        />
        <button
          onClick={() =>
            editAction.run(() => updateCategoryAction(sub.id, { name }), () => setEditing(false))
          }
          disabled={editAction.pending}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          onClick={() => setEditing(false)}
          className="rounded-lg border px-3 py-1.5 text-xs text-muted-foreground"
        >
          Cancelar
        </button>
        {editAction.error && <p className="text-xs text-destructive">{editAction.error}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-background",
        !sub.isActive && "opacity-50",
      )}
    >
      <span className="flex-1 text-muted-foreground">{sub.name}</span>
      <span className="text-xs text-muted-foreground">/{sub.slug}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
      <button
        onClick={() => setEditing(true)}
        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <Edit className="size-3" />
      </button>
      <button
        onClick={() => {
          if (window.confirm(`¿Eliminar la subcategoría "${sub.name}"?`)) {
            deleteAction.run(() => deleteCategoryAction(sub.id));
          }
        }}
        disabled={deleteAction.pending}
        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-red-50 hover:text-destructive disabled:opacity-50"
      >
        <Trash2 className="size-3" />
      </button>
      {deleteAction.error && <p className="text-xs text-destructive">{deleteAction.error}</p>}
    </div>
  );
}

export function AdminCategoriesTree({
  tree,
  counts,
}: {
  tree: AdminCategoryNode[];
  counts: { byCategory: Map<string, number>; bySubcategory: Map<string, number> };
}) {
  const topLevel = tree.filter((c) => c.parentId === null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [addingSubTo, setAddingSubTo] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState(DEFAULT_ICON_NAME);

  const editAction = useAction();
  const toggleAction = useAction();
  const deleteAction = useAction();
  const createAction = useAction();
  const createSubAction = useAction();

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startEdit(cat: AdminCategoryNode) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon ?? DEFAULT_ICON_NAME);
  }

  function saveEdit(id: string) {
    editAction.run(
      () => updateCategoryAction(id, { name: editName, icon: editIcon }),
      () => setEditingId(null),
    );
  }

  function addCategory() {
    createAction.run(
      () => createCategoryAction(newCatName, newCatIcon, null),
      () => {
        setNewCatName("");
        setNewCatIcon(DEFAULT_ICON_NAME);
        setShowAddCat(false);
      },
    );
  }

  function addSubcategory(parentId: string) {
    createSubAction.run(
      () => createCategoryAction(newSubName, "", parentId),
      () => {
        setNewSubName("");
        setAddingSubTo(null);
        setExpanded((prev) => new Set(prev).add(parentId));
      },
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorías</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {topLevel.length} categorías · gestiona el árbol de contenido
          </p>
        </div>
        <button
          onClick={() => setShowAddCat((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Añadir categoría
        </button>
      </div>

      {/* Add category form */}
      {showAddCat && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-foreground">Nueva categoría</p>
          <div className="flex gap-3">
            <select
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {AVAILABLE_ICONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="h-10 flex-1 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addCategory}
              disabled={createAction.pending || !newCatName.trim()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {createAction.pending ? "Creando…" : "Crear"}
            </button>
            <button
              onClick={() => setShowAddCat(false)}
              className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              Cancelar
            </button>
          </div>
          {createAction.error && <p className="text-xs text-destructive">{createAction.error}</p>}
        </div>
      )}

      {/* Category list */}
      <div className="overflow-hidden divide-y rounded-2xl border bg-card shadow-sm">
        {topLevel.map((cat) => {
          const subs = tree.filter((c) => c.parentId === cat.id);
          const isExpanded = expanded.has(cat.id);
          return (
            <div key={cat.id} className={cn(!cat.isActive && "opacity-50")}>
              {/* Category row */}
              <div className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20">
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>

                <CategoryIcon iconName={cat.icon} />

                {editingId === cat.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <select
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      className="h-8 rounded-lg border border-input bg-background px-2 text-sm focus:outline-none"
                    >
                      {AVAILABLE_ICONS.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(cat.id)}
                      disabled={editAction.pending}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{cat.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">/{cat.slug}</span>
                      {!cat.isActive && (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Oculta
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(counts.byCategory.get(cat.slug) ?? 0).toLocaleString()} anuncios
                    </span>
                    <span className="text-xs text-muted-foreground">{subs.length} subcategorías</span>
                  </>
                )}

                {editingId !== cat.id && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => startEdit(cat)}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                      title="Editar"
                    >
                      <Edit className="size-3.5" />
                    </button>
                    <button
                      onClick={() => toggleAction.run(() => setCategoryActiveAction(cat.id, !cat.isActive))}
                      disabled={toggleAction.pending}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
                      title={cat.isActive ? "Ocultar" : "Mostrar"}
                    >
                      {cat.isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Eliminar "${cat.name}"${subs.length > 0 ? ` y sus ${subs.length} subcategorías` : ""}? Esta acción no se puede deshacer.`,
                          )
                        ) {
                          deleteAction.run(() => deleteCategoryAction(cat.id));
                        }
                      }}
                      disabled={deleteAction.pending}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-destructive disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {(toggleAction.error || deleteAction.error) && (
                <p className="px-5 pb-2 text-xs text-destructive">
                  {toggleAction.error || deleteAction.error}
                </p>
              )}

              {/* Subcategories */}
              {isExpanded && (
                <div className="space-y-1 border-t bg-muted/20 py-2 pl-12 pr-5">
                  {subs.map((sub) => (
                    <SubcategoryRow
                      key={sub.id}
                      sub={sub}
                      count={counts.bySubcategory.get(`${cat.slug}:${sub.slug}`) ?? 0}
                    />
                  ))}

                  {addingSubTo === cat.id ? (
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                      <input
                        type="text"
                        placeholder="Nombre de subcategoría"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        autoFocus
                        className="h-8 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && newSubName.trim() && addSubcategory(cat.id)}
                      />
                      <button
                        onClick={() => addSubcategory(cat.id)}
                        disabled={createSubAction.pending || !newSubName.trim()}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Añadir
                      </button>
                      <button
                        onClick={() => setAddingSubTo(null)}
                        className="rounded-lg border px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingSubTo(cat.id)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-primary transition-colors hover:bg-background"
                    >
                      <Plus className="size-3.5" />
                      Añadir subcategoría
                    </button>
                  )}
                  {createSubAction.error && (
                    <p className="px-3 text-xs text-destructive">{createSubAction.error}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
