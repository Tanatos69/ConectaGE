/**
 * GEMarket — realistic demo seed for a fresh Supabase project.
 *
 * Creates login-able users (buyers + sellers), tiendas, ~30 Spanish-language
 * listings across categories and cities with images uploaded to real
 * Supabase Storage, plus reviews, favorites, follows and pending admin-queue
 * items so every part of the site and admin panel has data.
 *
 * Idempotent: users are looked up by email, listings by slug, tiendas by
 * owner — re-running adds nothing. Requires migrations 0001–0016 applied.
 *
 * Run from apps/web:  pnpm seed:demo
 * Needs in .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (ejecuta con --env-file=.env.local).",
  );
  process.exit(1);
}

const admin = createClient(URL_, KEY, { auth: { persistSession: false } });
const demoDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "demo");

const PASSWORD = "Demo1234!";

// ── Users ────────────────────────────────────────────────────────────────────

const USERS = [
  // Sellers (get a tienda)
  { email: "miguel.obiang@demo.gemarket.com", name: "Miguel Obiang Nsue", phone: "+240222111001", city: "Malabo", role: "seller", birth: "1988-03-14", store: { name: "Electrónica Malabo Center", slug: "electronica-malabo-center", category: "electronica", tagline: "Tecnología original con garantía", description: "Tienda de electrónica en el centro de Malabo. Teléfonos, ordenadores y accesorios originales con garantía de 6 meses. Envíos a toda la isla.", verified: true } },
  { email: "carmen.ondo@demo.gemarket.com", name: "Carmen Ondo Mbá", phone: "+240222111002", city: "Bata", role: "seller", store: { name: "AutoGuinea Bata", slug: "autoguinea-bata", category: "vehiculos", tagline: "Vehículos importados y repuestos", description: "Compra-venta de vehículos importados de Europa y repuestos originales en Bata. Financiación disponible para funcionarios.", verified: true }, birth: "1985-07-22" },
  { email: "teresa.nchama@demo.gemarket.com", name: "Teresa Nchama Eyang", phone: "+240222111003", city: "Malabo", role: "seller", store: { name: "Moda Nzalang", slug: "moda-nzalang", category: "moda", tagline: "Moda africana y urbana", description: "Ropa tradicional ecuatoguineana, moda urbana y calzado. Confección a medida por encargo.", verified: false }, birth: "1993-11-05" },
  // Buyers
  { email: "pedro.esono@demo.gemarket.com", name: "Pedro Esono Edú", phone: "+240222111004", city: "Bata", role: "buyer", birth: "1996-01-30" },
  { email: "maria.bindang@demo.gemarket.com", name: "María Bindang Oyana", phone: "+240222111005", city: "Malabo", role: "buyer", birth: "1999-09-12" },
  { email: "jose.mba@demo.gemarket.com", name: "José Mbá Ondó", phone: "+240222111006", city: "Ebebiyín", role: "buyer", birth: "1990-05-08" },
  { email: "rosa.avomo@demo.gemarket.com", name: "Rosa Avomo Nguema", phone: "+240222111007", city: "Mongomo", role: "buyer", birth: "1997-12-19" },
  // Buyer with a pending seller request (fills the admin queue)
  { email: "francisco.nve@demo.gemarket.com", name: "Francisco Nve Abaga", phone: "+240222111008", city: "Luba", role: "buyer", birth: "1991-04-02", sellerRequest: "Repuestos Luba Motor" },
];

// ── Listings ─────────────────────────────────────────────────────────────────
// seller: email · img: file in public/demo · days: age of the listing

const L = (seller, title, price, cat, sub, city, img, opts = {}) => ({
  seller, title, price, cat, sub, city, img,
  description: opts.desc ?? "",
  condition: opts.condition ?? "used",
  priceType: opts.priceType ?? "fixed",
  listingType: opts.listingType ?? "offer",
  days: opts.days ?? 0,
  featured: opts.featured ?? false,
  extra: opts.extra ?? {},
});

const LISTINGS = [
  L("carmen.ondo@demo.gemarket.com", "Toyota RAV4 2019 — importado, 45.000 km", 8500000, "vehiculos", "coches-4x4", "Bata", "toyota-rav4.jpg", { desc: "Toyota RAV4 2019 recién importado de España. 45.000 km reales, motor 2.0 gasolina, caja automática, aire acondicionado, cámara trasera. Documentación al día, lista para transferir. Se acepta prueba con mecánico.", featured: true, days: 2, extra: { brand: "Toyota", model: "RAV4", year: "2019", fuel: "Gasolina" } }),
  L("carmen.ondo@demo.gemarket.com", "Yamaha NMAX 155 — 2022, poco uso", 1850000, "vehiculos", "motos-scooters", "Bata", "yamaha-scooter.jpg", { desc: "Scooter Yamaha NMAX 155 del 2022 con solo 8.000 km. Ideal para moverse por Bata, consume muy poco. Incluye casco y baúl trasero. Precio ligeramente negociable.", priceType: "negotiable", days: 5, extra: { brand: "Yamaha", model: "NMAX 155", year: "2022" } }),
  L("carmen.ondo@demo.gemarket.com", "Juego de llantas 17\" Toyota originales", 280000, "vehiculos", "repuestos", "Bata", "toyota-rav4.jpg", { desc: "Cuatro llantas originales Toyota de 17 pulgadas en buen estado, sin golpes ni soldaduras. Válidas para RAV4, Hilux y Land Cruiser Prado.", days: 9 }),
  L("carmen.ondo@demo.gemarket.com", "Se busca: Toyota Hilux 2015 o superior", null, "vehiculos", "coches-4x4", "Bata", "toyota-rav4.jpg", { desc: "Busco Toyota Hilux del 2015 en adelante, doble cabina, diésel, en buen estado. Pago al contado. Contactar por WhatsApp con fotos y precio.", listingType: "wanted", priceType: "on_request", days: 3 }),

  L("miguel.obiang@demo.gemarket.com", "iPhone 15 128GB nuevo, precintado", 850000, "electronica", "telefonos-tablets", "Malabo", "iphone-15.jpg", { desc: "iPhone 15 de 128GB nuevo y precintado, color negro. Garantía de 6 meses de la tienda. Aceptamos Muni Dinero y efectivo. Entrega en el centro de Malabo o envío a Bata.", condition: "new", featured: true, days: 1 }),
  L("miguel.obiang@demo.gemarket.com", "MacBook Pro M2 13\" — 16GB RAM", 1450000, "electronica", "ordenadores", "Malabo", "macbook-pro.jpg", { desc: "MacBook Pro M2 de 13 pulgadas, 16GB de RAM y 512GB SSD. Batería al 92%, incluye cargador original y funda. Perfecto para trabajo y estudios. Factura de compra disponible.", days: 4 }),
  L("miguel.obiang@demo.gemarket.com", "Samsung Smart TV 55\" 4K UHD", 620000, "electronica", "tv-audio", "Malabo", "samsung-tv.jpg", { desc: "Televisor Samsung de 55 pulgadas 4K con Smart TV (YouTube, Netflix). Nuevo en caja con garantía. Instalación en pared disponible en Malabo por un pequeño extra.", condition: "new", days: 6 }),
  L("miguel.obiang@demo.gemarket.com", "PlayStation 5 + 2 mandos + 3 juegos", 780000, "electronica", "consolas", "Malabo", "ps5.jpg", { desc: "PS5 edición disco con dos mandos DualSense y tres juegos (FIFA 24, God of War, Spider-Man 2). Poco uso, en perfecto estado. Se prueba antes de comprar.", days: 8 }),
  L("miguel.obiang@demo.gemarket.com", "Cámara Canon EOS 2000D + objetivo 18-55mm", 480000, "electronica", "camaras", "Malabo", "canon-camera.jpg", { desc: "Cámara réflex Canon EOS 2000D con objetivo 18-55mm, bolsa, trípode y tarjeta de 64GB. Ideal para empezar en fotografía o cubrir eventos.", days: 12 }),
  L("miguel.obiang@demo.gemarket.com", "Nevera Samsung 320L No Frost", 520000, "electronica", "electrodomesticos", "Malabo", "nevera.jpg", { desc: "Frigorífico Samsung de 320 litros No Frost, clase A+. Nuevo con garantía de 1 año. Transporte a domicilio en Malabo incluido en el precio.", condition: "new", days: 7 }),

  L("teresa.nchama@demo.gemarket.com", "Vestidos de tela africana hechos a medida", 45000, "moda", "ropa-mujer", "Malabo", "ropa-tradicional.jpg", { desc: "Vestidos de tela africana confeccionados a medida. Elige tu tela y diseño; entrega en 5-7 días. Precio desde 45.000 FCFA según modelo. También uniformes para eventos y bodas.", condition: "new", priceType: "negotiable", featured: true, days: 3 }),
  L("teresa.nchama@demo.gemarket.com", "Nike Air Max 270 — tallas 40 a 45", 85000, "moda", "calzado", "Malabo", "nike-airmax.jpg", { desc: "Zapatillas Nike Air Max 270 originales, nuevas en caja. Tallas disponibles de la 40 a la 45. Varios colores. Envío a Bata por 5.000 FCFA extra.", condition: "new", days: 5 }),

  L("carmen.ondo@demo.gemarket.com", "Apartamento 2 dormitorios — Malabo II", 350000, "inmobiliaria", "pisos-apartamentos", "Malabo", "apartamento-malabo.jpg", { desc: "Alquilo apartamento de 2 dormitorios en Malabo II, amueblado, con agua corriente, generador comunitario y plaza de aparcamiento. 350.000 FCFA/mes, mínimo 6 meses. Se piden referencias.", days: 2, extra: { rooms: "2", furnished: "Sí" } }),
  L("carmen.ondo@demo.gemarket.com", "Casa con patio en Bata — zona Ncolombong", 25000000, "inmobiliaria", "casas-chalets", "Bata", "casa-bata.jpg", { desc: "Vendo casa de 3 dormitorios con patio amplio y pozo propio en Ncolombong, Bata. Título de propiedad en regla. Ideal para familia. Se puede visitar cualquier día.", days: 10 }),

  L("teresa.nchama@demo.gemarket.com", "Sofá gris de 3 plazas, casi nuevo", 180000, "muebles", "salon-comedor", "Malabo", "sofa-gris.jpg", { desc: "Sofá gris de 3 plazas comprado hace 8 meses, casi nuevo. Muy cómodo, sin manchas ni roturas. Se vende por mudanza. Recogida en Malabo, puedo ayudar con el transporte.", days: 4 }),
  L("teresa.nchama@demo.gemarket.com", "Mesa de comedor + 6 sillas madera maciza", 240000, "muebles", "salon-comedor", "Malabo", "mesa-comedor.jpg", { desc: "Mesa de comedor de madera maciza con 6 sillas tapizadas. Fabricación local de gran calidad. Perfecto estado.", priceType: "negotiable", days: 15 }),

  L("miguel.obiang@demo.gemarket.com", "Bicicleta de montaña 26\" con cambios Shimano", 120000, "deporte", "ciclismo", "Malabo", "bicicleta.jpg", { desc: "Bicicleta de montaña rueda 26 con 21 velocidades Shimano. Frenos revisados y ruedas nuevas. Lista para usar.", days: 11 }),

  L("carmen.ondo@demo.gemarket.com", "Se necesita conductor con carnet B — Bata", 250000, "empleo", "ofertas", "Bata", "conductor.jpg", { desc: "Empresa de distribución en Bata busca conductor con carnet B y al menos 3 años de experiencia. Sueldo 250.000 FCFA/mes + dietas. Enviar datos y referencias por WhatsApp.", condition: null, priceType: "fixed", days: 1 }),
  L("teresa.nchama@demo.gemarket.com", "Clases particulares de matemáticas y física", 5000, "educacion", "clases-particulares", "Malabo", "clases.jpg", { desc: "Profesor titulado da clases particulares de matemáticas y física para secundaria y bachillerato. 5.000 FCFA/hora, descuento por grupos. Zona centro de Malabo, también a domicilio.", condition: null, days: 6 }),
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const daysAgo = (n) => new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();
const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

async function ensureUser(u) {
  const { data: existing } = await admin.from("profiles").select("id").eq("email", u.email).maybeSingle();
  if (existing) return { id: existing.id, created: false };

  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: u.name, phone: u.phone, city: u.city },
  });
  if (error) throw new Error(`createUser ${u.email}: ${error.message}`);
  const id = data.user.id;

  // The handle_new_user trigger creates the profile; top up the fields the
  // trigger doesn't copy.
  await admin
    .from("profiles")
    .update({ full_name: u.name, phone: u.phone, city: u.city, birth_date: u.birth ?? null, role: u.role })
    .eq("id", id);
  return { id, created: true };
}

const uploadedBySeller = new Map(); // sellerId -> Map(filename -> publicUrl)

async function imageUrl(sellerId, filename) {
  let bySeller = uploadedBySeller.get(sellerId);
  if (!bySeller) {
    bySeller = new Map();
    uploadedBySeller.set(sellerId, bySeller);
  }
  if (bySeller.has(filename)) return bySeller.get(filename);

  const storagePath = `${sellerId}/seed-${filename}`;
  const file = await readFile(path.join(demoDir, filename));
  const { error } = await admin.storage
    .from("listing-images")
    .upload(storagePath, file, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`upload ${filename}: ${error.message}`);
  const { data } = admin.storage.from("listing-images").getPublicUrl(storagePath);
  bySeller.set(filename, data.publicUrl);
  return data.publicUrl;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Sembrando datos de demo en ${URL_} …\n`);

  // 1. Users + profiles
  const idByEmail = new Map();
  for (const u of USERS) {
    const { id, created } = await ensureUser(u);
    idByEmail.set(u.email, id);
    console.log(`${created ? "✓ creado " : "· existe "} ${u.email} (${u.role})`);
  }

  // 2. Tiendas for sellers
  for (const u of USERS.filter((x) => x.store)) {
    const ownerId = idByEmail.get(u.email);
    const { data: existing } = await admin.from("tiendas").select("id").eq("owner_id", ownerId).maybeSingle();
    if (existing) {
      console.log(`· tienda existe: ${u.store.name}`);
      continue;
    }
    const { error } = await admin.from("tiendas").insert({
      owner_id: ownerId,
      slug: u.store.slug,
      name: u.store.name,
      tagline: u.store.tagline,
      description: u.store.description,
      city: u.city,
      category_slug: u.store.category,
      whatsapp: u.phone,
      verified: u.store.verified,
    });
    if (error) throw new Error(`tienda ${u.store.name}: ${error.message}`);
    console.log(`✓ tienda creada: ${u.store.name}`);
  }

  // 3. Pending seller request (admin queue)
  for (const u of USERS.filter((x) => x.sellerRequest)) {
    const userId = idByEmail.get(u.email);
    const { data: existing } = await admin
      .from("seller_requests")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!existing) {
      await admin.from("seller_requests").insert({
        user_id: userId,
        store_name: u.sellerRequest,
        message: "Quiero vender repuestos de motos y coches en Luba. Tengo local físico en el mercado.",
      });
      console.log(`✓ solicitud de vendedor pendiente: ${u.sellerRequest}`);
    }
  }

  // 4. Listings (+ images)
  const listingIdBySlug = new Map();
  for (const l of LISTINGS) {
    const slug = `${slugify(l.title)}-seed`;
    const sellerId = idByEmail.get(l.seller);
    const { data: existing } = await admin.from("listings").select("id").eq("slug", slug).maybeSingle();
    if (existing) {
      listingIdBySlug.set(slug, { id: existing.id, ...l });
      console.log(`· anuncio existe: ${l.title}`);
      continue;
    }
    const img = await imageUrl(sellerId, l.img);
    const { data, error } = await admin
      .from("listings")
      .insert({
        seller_id: sellerId,
        title: l.title,
        slug,
        description: l.description,
        price: l.price,
        price_type: l.priceType,
        currency: "XAF",
        category_slug: l.cat,
        subcategory_slug: l.sub,
        city: l.city,
        condition: l.condition,
        images: [img],
        whatsapp: USERS.find((u) => u.email === l.seller).phone,
        listing_type: l.listingType,
        status: "published",
        extra_fields: l.extra,
        created_at: daysAgo(l.days),
      })
      .select("id")
      .single();
    if (error) throw new Error(`listing "${l.title}": ${error.message}`);
    listingIdBySlug.set(slug, { id: data.id, ...l });
    console.log(`✓ anuncio: ${l.title}`);
  }

  // 5. Featured listings (confirmed) + one pending featured request
  const featured = [...listingIdBySlug.values()].filter((l) => l.featured);
  for (const l of featured) {
    const { data: existing } = await admin
      .from("featured_requests")
      .select("id")
      .eq("listing_id", l.id)
      .maybeSingle();
    if (existing) continue;
    const endsAt = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
    await admin.from("featured_requests").insert({
      listing_id: l.id,
      user_id: idByEmail.get(l.seller),
      plan_days: 15,
      amount: 8000,
      payment_method: "mobile_money",
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      starts_at: new Date().toISOString(),
      ends_at: endsAt,
    });
    await admin.from("listings").update({ is_featured: true, featured_until: endsAt }).eq("id", l.id);
    console.log(`✓ destacado: ${l.title}`);
  }
  // Pending request so /admin/destacados has something to confirm.
  const pendingCandidate = [...listingIdBySlug.values()].find(
    (l) => !l.featured && l.seller === "miguel.obiang@demo.gemarket.com",
  );
  if (pendingCandidate) {
    const { data: existing } = await admin
      .from("featured_requests")
      .select("id")
      .eq("listing_id", pendingCandidate.id)
      .eq("status", "pending")
      .maybeSingle();
    if (!existing) {
      await admin.from("featured_requests").insert({
        listing_id: pendingCandidate.id,
        user_id: idByEmail.get(pendingCandidate.seller),
        plan_days: 7,
        amount: 5000,
        payment_method: "bank_transfer",
        status: "pending",
      });
      console.log(`✓ solicitud de destacado pendiente: ${pendingCandidate.title}`);
    }
  }

  // 6. Reviews (buyers → seller listings), favorites and follows
  const reviews = [
    { reviewer: "pedro.esono@demo.gemarket.com", listing: "iphone-15-128gb-nuevo-precintado-seed", rating: 5, comment: "Compré el iPhone y todo perfecto: original, precintado y entrega el mismo día. Muy recomendable." },
    { reviewer: "maria.bindang@demo.gemarket.com", listing: "iphone-15-128gb-nuevo-precintado-seed", rating: 4, comment: "Buen trato y producto tal como se anunciaba. El local es fácil de encontrar." },
    { reviewer: "jose.mba@demo.gemarket.com", listing: "toyota-rav4-2019-importado-45-000-km-seed", rating: 5, comment: "Vehículo en excelente estado, dejaron que mi mecánico lo revisara sin problema. Seriedad total." },
    { reviewer: "rosa.avomo@demo.gemarket.com", listing: "vestidos-de-tela-africana-hechos-a-medida-seed", rating: 5, comment: "Me hicieron un vestido precioso para una boda en menos de una semana. Calidad de costura excelente." },
  ];
  for (const r of reviews) {
    const target = listingIdBySlug.get(r.listing);
    if (!target) continue;
    const reviewerId = idByEmail.get(r.reviewer);
    const { data: existing } = await admin
      .from("reviews")
      .select("id")
      .eq("listing_id", target.id)
      .eq("reviewer_id", reviewerId)
      .maybeSingle();
    if (!existing) {
      const { error } = await admin.from("reviews").insert({
        listing_id: target.id,
        reviewer_id: reviewerId,
        rating: r.rating,
        comment: r.comment,
      });
      if (error) console.warn(`  (reseña omitida: ${error.message})`);
      else console.log(`✓ reseña de ${r.reviewer.split("@")[0]}`);
    }
  }

  const follows = [
    { follower: "pedro.esono@demo.gemarket.com", tienda: "electronica-malabo-center" },
    { follower: "maria.bindang@demo.gemarket.com", tienda: "electronica-malabo-center" },
    { follower: "maria.bindang@demo.gemarket.com", tienda: "moda-nzalang" },
    { follower: "jose.mba@demo.gemarket.com", tienda: "autoguinea-bata" },
  ];
  for (const f of follows) {
    const { error } = await admin
      .from("store_follows")
      .upsert(
        { follower_id: idByEmail.get(f.follower), tienda_slug: f.tienda },
        { onConflict: "follower_id,tienda_slug", ignoreDuplicates: true },
      );
    if (error) console.warn(`  (follow omitido: ${error.message})`);
  }
  console.log("✓ seguidores de tiendas");

  const favs = [
    { user: "pedro.esono@demo.gemarket.com", listing: "playstation-5-2-mandos-3-juegos-seed" },
    { user: "maria.bindang@demo.gemarket.com", listing: "sofa-gris-de-3-plazas-casi-nuevo-seed" },
    { user: "rosa.avomo@demo.gemarket.com", listing: "nike-air-max-270-tallas-40-a-45-seed" },
  ];
  for (const f of favs) {
    const target = listingIdBySlug.get(f.listing);
    if (!target) continue;
    const { error } = await admin
      .from("listing_favorites")
      .upsert(
        { user_id: idByEmail.get(f.user), listing_slug: f.listing },
        { onConflict: "user_id,listing_slug", ignoreDuplicates: true },
      );
    if (error) console.warn(`  (favorito omitido: ${error.message})`);
  }
  console.log("✓ favoritos");

  console.log(`\nListo. Todas las cuentas usan la contraseña: ${PASSWORD}`);
  console.log("Detalles y limpieza: docs/SEEDING.md");
}

main().catch((err) => {
  console.error("\nError durante la siembra:", err.message);
  process.exit(1);
});
