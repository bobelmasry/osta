import Link from "next/link";
import { Suspense } from "react";
import { queryProducts, toCard, type Query, type Sort } from "@/lib/catalog";
import { formatNumber, getDictionary, type Locale } from "@/lib/i18n";
import { ProductTable } from "./product-card";
import { SortSelect } from "./sort-select";

export type SearchParams = Record<string, string | string[] | undefined>;

const sorts: Sort[] = ["featured", "newest", "price-asc", "price-desc", "discount"];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | undefined) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);

export function parseQuery(sp: SearchParams): Query {
  const sort = one(sp.sort) as Sort | undefined;
  const brands = sp.brand ? (Array.isArray(sp.brand) ? sp.brand : sp.brand.split(",")) : undefined;
  return {
    q: one(sp.q),
    brands,
    min: num(one(sp.min)),
    max: num(one(sp.max)),
    inStock: one(sp.stock) === "1",
    onSale: one(sp.sale) === "1",
    sort: sort && sorts.includes(sort) ? sort : undefined,
    page: num(one(sp.page)),
  };
}

function hrefWith(basePath: string, sp: SearchParams, patch: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v == null) continue;
    for (const item of Array.isArray(v) ? v : [v]) params.append(k, item);
  }
  for (const [k, v] of Object.entries(patch)) {
    params.delete(k);
    if (v) params.set(k, v);
  }
  const s = params.toString();
  return s ? `${basePath}?${s}` : basePath;
}

export function Listing({
  lang,
  basePath,
  searchParams,
  base,
  hideBrandFilter,
  forceSale,
}: {
  lang: Locale;
  basePath: string;
  searchParams: SearchParams;
  base: Query;
  hideBrandFilter?: boolean;
  forceSale?: boolean;
}) {
  const t = getDictionary(lang);
  const query = { ...base, ...parseQuery(searchParams) };
  if (forceSale) query.onSale = true;
  const res = queryProducts({ ...query, perPage: 50 });
  const selectedBrands = new Set(query.brands ?? []);
  const hasFilters = !!(query.brands?.length || query.min || query.max || query.inStock || (!forceSale && query.onSale));
  const keep = Object.fromEntries(Object.entries(searchParams).filter(([k]) => k === "q" || k === "cat"));

  const filters = (
    <form action={basePath} method="get" className="text-[12px]">
      {Object.entries(keep).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={String(v)} />
      ))}
      {query.sort && <input type="hidden" name="sort" value={query.sort} />}

      <fieldset className="border-b border-line pb-3 mb-3">
        <legend className="font-bold mb-1.5">{t.priceRange}</legend>
        <div className="flex items-center gap-1">
          <input name="min" type="number" min={0} defaultValue={query.min} placeholder={formatNumber(res.priceBounds[0], lang)} className="w-full h-7 border border-[#999] bg-white px-1.5" aria-label={t.min} />
          <span>–</span>
          <input name="max" type="number" min={0} defaultValue={query.max} placeholder={formatNumber(res.priceBounds[1], lang)} className="w-full h-7 border border-[#999] bg-white px-1.5" aria-label={t.max} />
        </div>
      </fieldset>

      <fieldset className="border-b border-line pb-3 mb-3 space-y-1">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" name="stock" value="1" defaultChecked={query.inStock} className="accent-[var(--primary-2)]" />
          {t.onlyInStock}
        </label>
        {!forceSale && (
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" name="sale" value="1" defaultChecked={query.onSale} className="accent-[var(--primary-2)]" />
            {t.onlyOnSale}
          </label>
        )}
      </fieldset>

      {!hideBrandFilter && res.brandFacets.length > 0 && (
        <fieldset className="border-b border-line pb-3 mb-3">
          <legend className="font-bold mb-1.5">{t.brandLabel}</legend>
          <div className="max-h-80 overflow-y-auto space-y-0.5">
            {res.brandFacets.slice(0, 80).map(({ brand, count }) => (
              <label key={brand.key} className="flex items-center gap-1.5 cursor-pointer hover:bg-tint">
                <input type="checkbox" name="brand" value={brand.key} defaultChecked={selectedBrands.has(brand.key)} className="accent-[var(--primary-2)]" />
                <span className="flex-1 truncate">{brand.name}</span>
                <span className="text-muted tabular-nums">{formatNumber(count, lang)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" className="h-7 px-4 bg-cta text-cta-ink font-bold hover:bg-cta-strong">{t.apply}</button>
        {hasFilters && (
          <Link href={hrefWith(basePath, keep, {})} className="hover:underline">{t.clear}</Link>
        )}
      </div>
    </form>
  );

  return (
    <div className="flex flex-col md:flex-row gap-5">
      <aside className="hidden md:block w-48 shrink-0">
        <div className="sticky top-[72px]">
          <div className="font-bold uppercase text-[11px] text-white bg-primary px-2 py-1.5 mb-3">{t.filters}</div>
          {filters}
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <details className="md:hidden mb-3 border border-line">
          <summary className="px-3 py-2 font-bold bg-primary text-white cursor-pointer">{t.filters}</summary>
          <div className="p-3">{filters}</div>
        </details>

        <div className="flex flex-wrap items-center gap-3 mb-2 text-[12px]">
          <span className="text-muted">
            {formatNumber(res.total, lang)} {t.results}
            {res.pages > 1 && ` · ${t.page} ${formatNumber(res.page, lang)} / ${formatNumber(res.pages, lang)}`}
          </span>
          <div className="ms-auto">
            <Suspense>
              <SortSelect
                value={query.sort ?? "featured"}
                label={t.sortBy}
                options={[
                  ["featured", t.sortRelevance],
                  ["newest", t.sortNewest],
                  ["price-asc", t.sortPriceAsc],
                  ["price-desc", t.sortPriceDesc],
                  ["discount", t.sortDiscount],
                ]}
              />
            </Suspense>
          </div>
        </div>

        {res.items.length ? (
          <ProductTable items={res.items.map((p) => toCard(p, lang))} lang={lang} />
        ) : (
          <p className="border-t border-line py-10 text-center text-muted">{t.noResults}</p>
        )}

        {res.pages > 1 && (
          <nav className="mt-4 flex flex-wrap items-center gap-1 text-[12px]" aria-label="Pagination">
            {res.page > 1 && (
              <Link href={hrefWith(basePath, searchParams, { page: String(res.page - 1) })} className="px-2 py-1 border border-line hover:bg-tint">‹ {t.prev}</Link>
            )}
            {pageWindow(res.page, res.pages).map((n, i) =>
              n === null ? (
                <span key={`gap${i}`} className="px-1 text-muted">…</span>
              ) : (
                <Link
                  key={n}
                  href={hrefWith(basePath, searchParams, { page: n === 1 ? undefined : String(n) })}
                  aria-current={n === res.page ? "page" : undefined}
                  className={`min-w-7 px-2 py-1 text-center border tabular-nums ${n === res.page ? "border-primary bg-primary text-white font-bold" : "border-line hover:bg-tint"}`}
                >
                  {formatNumber(n, lang)}
                </Link>
              ),
            )}
            {res.page < res.pages && (
              <Link href={hrefWith(basePath, searchParams, { page: String(res.page + 1) })} className="px-2 py-1 border border-line hover:bg-tint">{t.next} ›</Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

function pageWindow(page: number, pages: number): (number | null)[] {
  const set = new Set([1, pages, page - 2, page - 1, page, page + 1, page + 2].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
}
