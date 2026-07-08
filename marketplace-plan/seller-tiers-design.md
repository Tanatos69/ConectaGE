# Diseño: niveles de vendedor de pago (seller tiers)

> Documento de diseño — **sin implementar todavía** (julio 2026). Decisión pendiente del
> propietario del producto. El objetivo: diferenciar a vendedores casuales de tiendas, y
> ofrecer un nivel de pago con más visibilidad, con posible transición futura a un modelo
> mayoritariamente de pago.

## Estado actual (lo que existe hoy)

- `profiles.role` = `buyer | seller | admin`. "seller" solo se obtiene con la aprobación de
  una tienda (`seller_requests` → admin aprueba → fila en `tiendas`).
- Cualquier usuario con sesión puede publicar anuncios **sin límite**, aunque `/planes` ya
  anuncia "Hasta 5 anuncios activos" para el plan gratuito — no se aplica en ningún sitio.
- `lib/promotions.ts` ya define el catálogo de marketing: Particular (gratis) / Profesional
  (25.000 FCFA/mes) / Empresa (a medida), y un sistema de créditos de promoción que hoy vive
  solo en localStorage.
- Todos los métodos de pago están marcados "próximamente" — no hay pasarela.

## Camino recomendado (incremental)

1. **Columna `profiles.seller_tier`**: `'free' | 'plus' | 'pro'`, default `free`, solo
   modificable por administradores (trigger de protección idéntico al de `role`/`verified`).
   Eje independiente de "tiene tienda": un vendedor casual puede pagar y una tienda puede ser
   gratuita — no mezclar ambos conceptos.
2. **Aplicar el límite gratuito en el servidor**: `createListingAction` cuenta los anuncios
   `published` del usuario y rechaza el sexto si `seller_tier = 'free'` (por fin coincide con
   lo que `/planes` promete). Límites sugeridos: free 5 · plus 25 · pro ilimitado.
3. **"Más visibilidad" real**: clave de ordenación secundaria en `getPublishedListings`
   (anuncios de niveles de pago primero, empatados por fecha). Los datos de
   analítica (vistas y clics de WhatsApp por anuncio, ya recopilados desde la migración
   0003) permiten **demostrar el ROI** a los vendedores: "los anuncios pro reciben X% más
   contactos".
4. **Asignación manual del tier por el admin** (misma UI que la gestión de administradores en
   `/admin/ajustes`) hasta que exista una pasarela de pago real. Nada de UI de cobro
   desechable antes de elegir proveedor (Mobile Money local vs. tarjeta).
5. **Pregunta abierta antes de construir**: ¿el límite gratuito aplica igual a tiendas
   aprobadas que a vendedores casuales, o las tiendas (ya filtradas por un admin) reciben un
   límite mayor de serie?

## Riesgos a vigilar

- Pasar a "solo de pago" demasiado pronto mata la liquidez del marketplace (sin anuncios no
  hay compradores; sin compradores nadie paga). Referencia: Expat-Dakar y OLX mantienen
  publicación gratuita limitada + visibilidad de pago.
- Si la ordenación favorece siempre a los de pago, la relevancia de búsqueda empeora —
  mantener el boost como desempate, no como filtro.
