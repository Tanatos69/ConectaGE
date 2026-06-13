import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-8xl font-extrabold text-primary/20 select-none">404</p>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        La página que buscas no existe o ha sido eliminada. Prueba a buscar lo que necesitas.
      </p>

      <form
        action="/buscar"
        role="search"
        className="mt-6 flex w-full max-w-sm items-center gap-2 rounded-2xl border border-input bg-background px-4 shadow-sm focus-within:ring-2 focus-within:ring-ring/30"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          name="q"
          placeholder="Buscar anuncios…"
          className="h-11 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </form>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
        <Link
          href="/categorias"
          className="rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
        >
          Ver categorías
        </Link>
      </div>
    </div>
  );
}
