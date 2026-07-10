"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight, Plus, Edit, Eye, EyeOff, Trash2, MapPin } from "lucide-react";
import {
  createLocationAction,
  updateLocationAction,
  setLocationActiveAction,
  deleteLocationAction,
} from "@/lib/actions/admin";
import type { AdminLocationNode } from "@/app/admin/data";
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

function CityRow({ city }: { city: AdminLocationNode }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(city.name);
  const editAction = useAction();
  const toggleAction = useAction();
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
            editAction.run(() => updateLocationAction(city.id, name), () => setEditing(false))
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
        !city.isActive && "opacity-50",
      )}
    >
      <span className="flex-1 text-muted-foreground">{city.name}</span>
      {!city.isActive && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          Oculta
        </span>
      )}
      <button
        onClick={() => setEditing(true)}
        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
        title="Renombrar"
      >
        <Edit className="size-3" />
      </button>
      <button
        onClick={() => toggleAction.run(() => setLocationActiveAction(city.id, !city.isActive))}
        disabled={toggleAction.pending}
        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
        title={city.isActive ? "Ocultar de los desplegables" : "Mostrar"}
      >
        {city.isActive ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
      </button>
      <button
        onClick={() => {
          if (window.confirm(`¿Eliminar la ciudad "${city.name}"? Los anuncios existentes conservan su ciudad.`)) {
            deleteAction.run(() => deleteLocationAction(city.id));
          }
        }}
        disabled={deleteAction.pending}
        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-red-50 hover:text-destructive disabled:opacity-50"
        title="Eliminar"
      >
        <Trash2 className="size-3" />
      </button>
      {(toggleAction.error || deleteAction.error) && (
        <p className="text-xs text-destructive">{toggleAction.error || deleteAction.error}</p>
      )}
    </div>
  );
}

export function AdminLocationsTree({ tree }: { tree: AdminLocationNode[] }) {
  const provinces = tree.filter((n) => n.parentId === null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [addingCityTo, setAddingCityTo] = useState<string | null>(null);
  const [newCityName, setNewCityName] = useState("");
  const [showAddProvince, setShowAddProvince] = useState(false);
  const [newProvinceName, setNewProvinceName] = useState("");

  const editAction = useAction();
  const toggleAction = useAction();
  const deleteAction = useAction();
  const createAction = useAction();
  const createCityAction = useAction();

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addProvince() {
    createAction.run(
      () => createLocationAction(newProvinceName, null),
      () => {
        setNewProvinceName("");
        setShowAddProvince(false);
      },
    );
  }

  function addCity(provinceId: string) {
    createCityAction.run(
      () => createLocationAction(newCityName, provinceId),
      () => {
        setNewCityName("");
        setAddingCityTo(null);
        setExpanded((prev) => new Set(prev).add(provinceId));
      },
    );
  }

  const totalCities = tree.filter((n) => n.parentId !== null).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ubicaciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {provinces.length} provincias · {totalCities} ciudades · aparecen en todos los
            desplegables de ciudad del sitio
          </p>
        </div>
        <button
          onClick={() => setShowAddProvince((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Añadir provincia
        </button>
      </div>

      {showAddProvince && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-foreground">Nueva provincia</p>
          <input
            type="text"
            placeholder="Nombre de la provincia"
            value={newProvinceName}
            onChange={(e) => setNewProvinceName(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            onKeyDown={(e) => e.key === "Enter" && newProvinceName.trim() && addProvince()}
          />
          <div className="flex gap-2">
            <button
              onClick={addProvince}
              disabled={createAction.pending || !newProvinceName.trim()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {createAction.pending ? "Creando…" : "Crear"}
            </button>
            <button
              onClick={() => setShowAddProvince(false)}
              className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              Cancelar
            </button>
          </div>
          {createAction.error && <p className="text-xs text-destructive">{createAction.error}</p>}
        </div>
      )}

      <div className="overflow-hidden divide-y rounded-2xl border bg-card shadow-sm">
        {provinces.map((prov) => {
          const cities = tree.filter((n) => n.parentId === prov.id);
          const isExpanded = expanded.has(prov.id);
          return (
            <div key={prov.id} className={cn(!prov.isActive && "opacity-50")}>
              <div className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20">
                <button
                  onClick={() => toggleExpand(prov.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>

                <MapPin className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />

                {editingId === prov.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() =>
                        editAction.run(() => updateLocationAction(prov.id, editName), () => setEditingId(null))
                      }
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
                      <span className="font-medium text-foreground">{prov.name}</span>
                      {!prov.isActive && (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Oculta
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {cities.length} ciudad{cities.length !== 1 ? "es" : ""}
                    </span>
                  </>
                )}

                {editingId !== prov.id && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(prov.id);
                        setEditName(prov.name);
                      }}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                      title="Renombrar"
                    >
                      <Edit className="size-3.5" />
                    </button>
                    <button
                      onClick={() => toggleAction.run(() => setLocationActiveAction(prov.id, !prov.isActive))}
                      disabled={toggleAction.pending}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
                      title={prov.isActive ? "Ocultar (y sus ciudades)" : "Mostrar"}
                    >
                      {prov.isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Eliminar "${prov.name}"${cities.length > 0 ? ` y sus ${cities.length} ciudades` : ""}? Esta acción no se puede deshacer.`,
                          )
                        ) {
                          deleteAction.run(() => deleteLocationAction(prov.id));
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

              {isExpanded && (
                <div className="space-y-1 border-t bg-muted/20 py-2 pl-12 pr-5">
                  {cities.map((city) => (
                    <CityRow key={city.id} city={city} />
                  ))}

                  {addingCityTo === prov.id ? (
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                      <input
                        type="text"
                        placeholder="Nombre de la ciudad"
                        value={newCityName}
                        onChange={(e) => setNewCityName(e.target.value)}
                        autoFocus
                        className="h-8 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && newCityName.trim() && addCity(prov.id)}
                      />
                      <button
                        onClick={() => addCity(prov.id)}
                        disabled={createCityAction.pending || !newCityName.trim()}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Añadir
                      </button>
                      <button
                        onClick={() => setAddingCityTo(null)}
                        className="rounded-lg border px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingCityTo(prov.id)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-primary transition-colors hover:bg-background"
                    >
                      <Plus className="size-3.5" />
                      Añadir ciudad
                    </button>
                  )}
                  {createCityAction.error && (
                    <p className="px-3 text-xs text-destructive">{createCityAction.error}</p>
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
