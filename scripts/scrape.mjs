// Pulls the public WooCommerce Store API catalog from toolsworldeg.com into data/raw/.
// Only factual catalog fields are kept (names, SKUs, prices, taxonomy, specs, image URLs);
// marketing descriptions are intentionally not copied.
// Usage: node scripts/scrape.mjs
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const BASE = "https://toolsworldeg.com/wp-json/wc/store/v1";
const OUT = new URL("../data/raw/", import.meta.url);
const DELAY_MS = 400;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path, attempt = 1) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "User-Agent": "catalog-sync/1.0", Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { data: await res.json(), totalPages: Number(res.headers.get("x-wp-totalpages") || 1) };
  } catch (err) {
    if (attempt >= 5) throw err;
    console.warn(`retry ${attempt} ${path}: ${err.message}`);
    await sleep(2000 * attempt);
    return get(path, attempt + 1);
  }
}

async function paginate(path, map, file) {
  const target = new URL(file, OUT);
  // Resume support: skip pages already on disk.
  const partial = new URL(file + ".partial", OUT);
  let items = existsSync(partial) ? JSON.parse(await readFile(partial, "utf8")) : [];
  let page = Math.floor(items.length / 100) + 1;
  items = items.slice(0, (page - 1) * 100);
  let totalPages = Infinity;
  while (page <= totalPages) {
    const sep = path.includes("?") ? "&" : "?";
    const { data, totalPages: tp } = await get(`${path}${sep}per_page=100&page=${page}`);
    totalPages = tp;
    items.push(...data.map(map));
    if (page % 10 === 0 || page === totalPages) {
      console.log(`${file}: page ${page}/${totalPages} (${items.length})`);
      await writeFile(partial, JSON.stringify(items));
    }
    page++;
    await sleep(DELAY_MS);
  }
  await writeFile(target, JSON.stringify(items));
  return items;
}

const decode = (s) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

const mapTerm = (t) => ({
  id: t.id,
  name: t.name,
  slug: decode(t.slug),
  parent: t.parent,
  count: t.count,
  image: t.image?.thumbnail ?? null,
});

const mapProduct = (p) => ({
  id: p.id,
  name: p.name,
  slug: decode(p.slug),
  sku: p.sku,
  price: Number(p.prices?.price) || 0,
  regular: Number(p.prices?.regular_price) || 0,
  onSale: p.on_sale,
  inStock: p.is_in_stock,
  rating: Number(p.average_rating) || 0,
  reviews: p.review_count,
  cats: p.categories.map((c) => c.id),
  brand: p.brands?.[0]?.slug ? decode(p.brands[0].slug) : null,
  brandAttr: p.attributes.find((a) => a.taxonomy === "pa_brand")?.terms?.[0]?.name ?? null,
  images: p.images.slice(0, 4).map((i) => ({ src: i.src, thumb: i.thumbnail })),
  attrs: p.attributes
    .filter((a) => a.taxonomy !== "pa_brand")
    .map((a) => ({ name: a.name, values: a.terms.map((t) => t.name) })),
  tags: p.tags.map((t) => t.name),
});

await mkdir(OUT, { recursive: true });
await paginate("/products/categories", mapTerm, "categories.json");
await paginate("/products/brands", mapTerm, "brands.json");
await paginate("/products?orderby=date&order=desc", mapProduct, "products.json");
console.log("done");
