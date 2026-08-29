# Sembrar datos de demostración (seed)

Un solo comando llena la base de datos de Supabase con contenido realista de
Guinea Ecuatorial: usuarios con los que puedes iniciar sesión, 3 tiendas,
~19 anuncios con fotos subidas al Storage real, reseñas, favoritos,
seguidores y elementos pendientes en las colas del panel de administración.

## Requisitos

1. Migraciones `0001`–`0016` aplicadas en Supabase Studio → SQL Editor (en orden).
2. `apps/web/.env.local` con:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Ejecutar

```bash
cd apps/web
pnpm seed:demo
```

El script es **idempotente**: busca cada usuario por email y cada anuncio por
slug antes de crearlo, así que puedes ejecutarlo las veces que quieras sin
duplicar nada.

## Cuentas creadas

Todas con la contraseña **`Demo1234!`**

| Email | Rol | Ciudad | Tienda |
|---|---|---|---|
| miguel.obiang@demo.gemarket.com | Vendedor | Malabo | Electrónica Malabo Center (verificada) |
| carmen.ondo@demo.gemarket.com | Vendedor | Bata | AutoGuinea Bata (verificada) |
| teresa.nchama@demo.gemarket.com | Vendedor | Malabo | Moda Nzalang |
| pedro.esono@demo.gemarket.com | Comprador | Bata | — |
| maria.bindang@demo.gemarket.com | Comprador | Malabo | — |
| jose.mba@demo.gemarket.com | Comprador | Ebebiyín | — |
| rosa.avomo@demo.gemarket.com | Comprador | Mongomo | — |
| francisco.nve@demo.gemarket.com | Comprador (solicitud de vendedor pendiente) | Luba | — |

Tu cuenta de administrador no se toca: sigue siendo la que promoviste a mano
en Supabase Studio.

## Qué se siembra

- **19 anuncios** publicados en vehículos, electrónica, inmobiliaria, moda,
  muebles, deporte, empleo y educación, repartidos entre Malabo y Bata, con
  fechas de publicación variadas y las imágenes de `public/demo/` subidas al
  bucket `listing-images` de cada vendedor.
- **3 destacados confirmados** (RAV4, iPhone 15, vestidos a medida) con sus
  `featured_requests` correspondientes.
- **1 solicitud de destacado pendiente** y **1 solicitud de vendedor
  pendiente**, para que las colas de `/admin/destacados` y
  `/admin/vendedores` no estén vacías.
- **4 reseñas** de compradores, **4 seguimientos** de tiendas y
  **3 favoritos**.

## Añadir contenido real encima

El seed solo pone la base. Para contenido de verdad: regístrate normalmente
en `/registro`, publica desde `/publicar` (las fotos se comprimen y suben al
Storage automáticamente) y gestiona todo desde `/admin`.

## Limpieza

Para borrar SOLO los datos sembrados (los usuarios de demo y todo lo que les
pertenece, gracias a los `on delete cascade`):

```sql
delete from auth.users
where email like '%@demo.gemarket.com';
```

Las imágenes subidas quedan en Storage; puedes borrarlas en
Studio → Storage → `listing-images` (carpetas cuyos archivos empiezan por
`seed-`).
