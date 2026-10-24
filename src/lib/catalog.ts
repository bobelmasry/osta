import "server-only";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { Locale } from "./i18n";

export type Category = {
  id: number;
  parent: number;
  nameAr: string;
  nameEn: string;
  slug: string;
  count: number;
  image: string | null;
};

export type Brand = { key: string; name: string; nameAr: string | null; count: number };

export type Product = {
  id: number;
  ar: string;
  en: string;
  sku: string;
  price: number;
  regular: number;
  stock: boolean;
  rating: number;
  cats: number[];
  brand: string | null;
  img: string | null;
  imgs: string[];
  attrs: { ar: [string, string]; en: [string, string] }[];
  t: number;
};

/** Slim shape sent to client components / product cards. */
export type ProductCard = {
  id: number;
  name: string;
  sku: string;
  price: number;
  regular: number;
  stock: boolean;
  img: string | null;
  brand: string | null;
};

type Store = {
  products: Product[];
  byId: Map<number, Product>;
  categories: Category[];
  catById: Map<number, Category>;
  catBySlug: Map<string, Category>;
  children: Map<number, Category[]>;
  brands: Brand[];
  brandByKey: Map<string, Brand>;
  searchIndex: string[];
  mtime: number;
};

const g = globalThis as unknown as { __catalog?: Store };
const dataDir = () => path.join(process.cwd(), "data", "catalog");

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{N}./-]+/gu, " ")
    .trim();

function load(): Store {
  // Rebuilding the catalog (scripts/build-catalog.mjs) is picked up without a server restart.
  const mtime = statSync(path.join(dataDir(), "products.json")).mtimeMs;
  if (g.__catalog?.mtime === mtime) return g.__catalog;
  const dir = dataDir();
  const read = <T,>(f: string): T => JSON.parse(readFileSync(path.join(dir, f), "utf8"));
  const products = read<Product[]>("products.json");
  const categories = read<Category[]>("categories.json");
  const brands = read<Brand[]>("brands.json");

  const children = new Map<number, Category[]>();
  for (const c of categories) {
    const list = children.get(c.parent) ?? [];
    list.push(c);
    children.set(c.parent, list);
  }
  for (const list of children.values()) list.sort((a, b) => b.count - a.count);

  const brandByKey = new Map(brands.map((b) => [b.key, b]));
  const store: Store = {
    products,
    byId: new Map(products.map((p) => [p.id, p])),
    categories,
    catById: new Map(categories.map((c) => [c.id, c])),
    catBySlug: new Map(categories.map((c) => [c.slug, c])),
    children,
    brands,
    brandByKey,
    searchIndex: products.map((p) =>
      normalize(`${p.ar} ${p.en} ${p.sku} ${p.brand ? brandByKey.get(p.brand)?.name ?? "" : ""}`),
    ),
    mtime,
  };
  g.__catalog = store;
  return store;
}

export const catName = (c: Category, lang: Locale) => (lang === "ar" ? c.nameAr : c.nameEn);
export const brandName = (b: Brand, lang: Locale) => (lang === "ar" && b.nameAr ? b.nameAr : b.name);
export const productName = (p: Product, lang: Locale) => (lang === "ar" ? p.ar : p.en);
export const discount = (p: { price: number; regular: number }) =>
  p.regular > p.price && p.price > 0 ? Math.round((1 - p.price / p.regular) * 100) : 0;

export function toCard(p: Product, lang: Locale): ProductCard {
  const b = p.brand ? load().brandByKey.get(p.brand) : null;
  return {
    id: p.id,
    name: productName(p, lang),
    sku: p.sku,
    price: p.price,
    regular: p.regular,
    stock: p.stock,
    img: p.img,
    brand: b ? b.name : null,
  };
}

export const getProduct = (id: number) => load().byId.get(id) ?? null;
export const getCategory = (slug: string) => load().catBySlug.get(slug) ?? null;
export const getCategoryById = (id: number) => load().catById.get(id) ?? null;
export const getBrand = (key: string) => load().brandByKey.get(key) ?? null;
export const getBrands = () => load().brands;
export const getChildren = (id: number) => load().children.get(id) ?? [];
export const getTopCategories = () => getChildren(0);
export const totalProducts = () => load().products.length;

export function getAncestors(c: Category): Category[] {
  const { catById } = load();
  const chain: Category[] = [];
  let cur = catById.get(c.parent);
  while (cur) {
    chain.unshift(cur);
    cur = catById.get(cur.parent);
  }
  return chain;
}

function descendantIds(id: number): Set<number> {
  const ids = new Set([id]);
  const stack = [id];
  while (stack.length) {
    for (const child of getChildren(stack.pop()!)) {
      if (!ids.has(child.id)) {
        ids.add(child.id);
        stack.push(child.id);
      }
    }
  }
  return ids;
}

export type Sort = "featured" | "newest" | "price-asc" | "price-desc" | "discount";

export type Query = {
  q?: string;
  category?: number;
  categories?: number[];
  brand?: string;
  brands?: string[];
  min?: number;
  max?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: Sort;
  page?: number;
  perPage?: number;
};

export type QueryResult = {
  items: Product[];
  total: number;
  page: number;
  pages: number;
  /** Facets computed over the result set before brand/price filters are applied. */
  brandFacets: { brand: Brand; count: number }[];
  priceBounds: [number, number];
};

export function queryProducts(query: Query): QueryResult {
  const { products, searchIndex, brandByKey } = load();
  const perPage = query.perPage ?? 24;

  let catIds: Set<number> | null = null;
  const roots = [...(query.category ? [query.category] : []), ...(query.categories ?? [])];
  if (roots.length) {
    catIds = new Set();
    for (const r of roots) for (const id of descendantIds(r)) catIds.add(id);
  }

  const terms = query.q ? normalize(query.q).split(" ").filter(Boolean) : [];

  // Base set (category + text search), used for facets.
  let base: Product[] = [];
  const scores = new Map<number, number>();
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (catIds && !p.cats.some((c) => catIds.has(c))) continue;
    if (query.brand && p.brand !== query.brand) continue;
    if (terms.length) {
      const hay = searchIndex[i];
      if (!terms.every((t) => hay.includes(t))) continue;
      // Rank: matches at word starts and SKU exact hits score higher.
      let score = 0;
      for (const t of terms) {
        if (hay.startsWith(t) || hay.includes(" " + t)) score += 2;
        if (p.sku && p.sku.toLowerCase() === t) score += 10;
      }
      scores.set(p.id, score);
    }
    base.push(p);
  }

  const facetCounts = new Map<string, number>();
  let lo = Infinity;
  let hi = 0;
  for (const p of base) {
    if (p.brand) facetCounts.set(p.brand, (facetCounts.get(p.brand) ?? 0) + 1);
    if (p.price > 0) {
      lo = Math.min(lo, p.price);
      hi = Math.max(hi, p.price);
    }
  }
  const brandFacets = [...facetCounts.entries()]
    .map(([k, count]) => ({ brand: brandByKey.get(k)!, count }))
    .filter((f) => f.brand)
    .sort((a, b) => b.count - a.count);

  const brandSet = query.brands?.length ? new Set(query.brands) : null;
  base = base.filter(
    (p) =>
      (!brandSet || (p.brand && brandSet.has(p.brand))) &&
      (query.min == null || p.price >= query.min) &&
      (query.max == null || p.price <= query.max) &&
      (!query.inStock || p.stock) &&
      (!query.onSale || discount(p) > 0),
  );

  const sort = query.sort ?? (terms.length ? "featured" : "featured");
  const byFeatured = (a: Product, b: Product) =>
    (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) ||
    Number(b.stock) - Number(a.stock) ||
    Number(!!b.img) - Number(!!a.img) ||
    a.t - b.t;
  const sorters: Record<Sort, (a: Product, b: Product) => number> = {
    featured: byFeatured,
    newest: (a, b) => a.t - b.t,
    "price-asc": (a, b) => (a.price || Infinity) - (b.price || Infinity),
    "price-desc": (a, b) => b.price - a.price,
    discount: (a, b) => discount(b) - discount(a) || byFeatured(a, b),
  };
  base.sort(sorters[sort]);

  const total = base.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), pages);
  return {
    items: base.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    pages,
    brandFacets,
    priceBounds: [lo === Infinity ? 0 : lo, hi],
  };
}

export function relatedProducts(p: Product, limit = 8): Product[] {
  const { products } = load();
  const leaf = p.cats[p.cats.length - 1];
  const out: Product[] = [];
  for (const other of products) {
    if (other.id === p.id || !other.img) continue;
    if (other.cats.includes(leaf)) out.push(other);
    if (out.length >= limit * 3) break;
  }
  // Prefer same brand first.
  out.sort((a, b) => Number(b.brand === p.brand) - Number(a.brand === p.brand));
  return out.slice(0, limit);
}

/** Product count per top-level category for a brand (for the brand page). */
export function brandCategories(key: string): { cat: Category; count: number }[] {
  const { products, catById } = load();
  const counts = new Map<number, number>();
  for (const p of products) {
    if (p.brand !== key) continue;
    const roots = new Set<number>();
    for (const id of p.cats) {
      let c = catById.get(id);
      while (c && c.parent) c = catById.get(c.parent);
      if (c) roots.add(c.id);
    }
    for (const r of roots) counts.set(r, (counts.get(r) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ cat: catById.get(id)!, count }))
    .sort((a, b) => b.count - a.count);
}
