"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Edit, Eye, EyeOff, Trash2, GripVertical } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCar, faHouse, faLaptop, faBriefcase, faCouch, faShirt,
  faWrench, faHeartPulse, faGraduationCap, faDumbbell,
  faUtensils, faHotel, faLandmark, faBoxOpen, faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { categories } from "@/lib/categories";
import { subcategories } from "@/lib/subcategories";
import { cn } from "@/lib/utils";

const iconMap: Record<string, IconDefinition> = {
  faCar, faHouse, faLaptop, faBriefcase, faCouch, faShirt,
  faWrench, faHeartPulse, faGraduationCap, faDumbbell,
  faUtensils, faHotel, faLandmark, faBoxOpen,
};

interface CategoryState {
  slug: string;
  iconName: string;
  name: string;
  count: number;
  hidden: boolean;
  expanded: boolean;
}

export default function AdminCategoriasPage() {
  const [cats, setCats] = useState<CategoryState[]>(
    categories.map((c) => ({ slug: c.slug, iconName: c.iconName, name: c.name, count: c.count, hidden: false, expanded: false })),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [addingSubTo, setAddingSubTo] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("faBoxOpen");

  function startEdit(slug: string, name: string, iconName: string) {
    setEditingId(slug);
    setEditName(name);
    setEditIcon(iconName);
  }

  function saveEdit(slug: string) {
    setCats((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, name: editName, iconName: editIcon } : c)),
    );
    setEditingId(null);
  }

  function toggleHide(slug: string) {
    setCats((prev) => prev.map((c) => (c.slug === slug ? { ...c, hidden: !c.hidden } : c)));
  }

  function toggleExpand(slug: string) {
    setCats((prev) => prev.map((c) => (c.slug === slug ? { ...c, expanded: !c.expanded } : c)));
  }

  function deleteCat(slug: string) {
    setCats((prev) => prev.filter((c) => c.slug !== slug));
  }

  function addCategory() {
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[̀-ͯ]/g, "");
    setCats((prev) => [
      ...prev,
      { slug, iconName: newCatIcon, name: newCatName.trim(), count: 0, hidden: false, expanded: false },
    ]);
    setNewCatName("");
    setNewCatIcon("faBoxOpen");
    setShowAddCat(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorías</h1>
          <p className="mt-1 text-sm text-muted-foreground">{cats.length} categorías · gestiona el árbol de contenido</p>
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
            <input
              type="text"
              placeholder="Nombre del icono (ej: faCar)"
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
              className="h-10 w-20 rounded-xl border border-input bg-background px-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
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
            <button onClick={addCategory} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
              Crear
            </button>
            <button onClick={() => setShowAddCat(false)} className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden divide-y">
        {cats.map((cat) => {
          const subs = subcategories[cat.slug] ?? [];
          return (
            <div key={cat.slug} className={cn(cat.hidden && "opacity-50")}>
              {/* Category row */}
              <div className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                <GripVertical className="size-4 text-muted-foreground cursor-grab shrink-0" />

                <button
                  onClick={() => toggleExpand(cat.slug)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  {cat.expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>

                <FontAwesomeIcon icon={iconMap[cat.iconName] ?? faQuestion} className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />

                {editingId === cat.slug ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      className="h-8 w-12 rounded-lg border border-input bg-background px-2 text-center text-sm focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(cat.slug)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90">
                      Guardar
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-lg border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{cat.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">/{cat.slug}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{cat.count.toLocaleString()} anuncios</span>
                    <span className="text-xs text-muted-foreground">{subs.length} subcategorías</span>
                  </>
                )}

                {editingId !== cat.slug && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(cat.slug, cat.name, cat.iconName)} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground" title="Editar">
                      <Edit className="size-3.5" />
                    </button>
                    <button onClick={() => toggleHide(cat.slug)} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground" title={cat.hidden ? "Mostrar" : "Ocultar"}>
                      {cat.hidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </button>
                    <button onClick={() => deleteCat(cat.slug)} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-destructive" title="Eliminar">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Subcategories */}
              {cat.expanded && (
                <div className="border-t bg-muted/20 pl-12 pr-5 py-2 space-y-1">
                  {subs.map((sub) => (
                    <div key={sub.slug} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-background transition-colors">
                      <GripVertical className="size-3.5 text-muted-foreground/50 cursor-grab" />
                      <span className="flex-1 text-muted-foreground">{sub.name}</span>
                      <span className="text-xs text-muted-foreground">/{sub.slug}</span>
                      <span className="text-xs text-muted-foreground">{sub.count}</span>
                      <button className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <Edit className="size-3" />
                      </button>
                      <button className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-red-50 hover:text-destructive">
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add subcategory */}
                  {addingSubTo === cat.slug ? (
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                      <input
                        type="text"
                        placeholder="Nombre de subcategoría"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        autoFocus
                        className="h-8 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newSubName.trim()) {
                            setAddingSubTo(null);
                            setNewSubName("");
                          }
                        }}
                      />
                      <button
                        onClick={() => { setAddingSubTo(null); setNewSubName(""); }}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Añadir
                      </button>
                      <button onClick={() => setAddingSubTo(null)} className="rounded-lg border px-3 py-1.5 text-xs text-muted-foreground">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingSubTo(cat.slug)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-primary hover:bg-background transition-colors"
                    >
                      <Plus className="size-3.5" />
                      Añadir subcategoría
                    </button>
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
