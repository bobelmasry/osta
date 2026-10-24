import Link from "next/link";
import { discount, type ProductCard as Card } from "@/lib/catalog";
import { formatPrice, getDictionary, type Locale } from "@/lib/i18n";
import { AddToCart } from "./add-to-cart";

function Thumb({ src, alt, size }: { src: string | null; alt: string; size: string }) {
  return (
    <span className={`product-img inline-block shrink-0 border border-line ${size} p-1`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- remote catalogue images, served as-is
        <img src={src} alt={alt} loading="lazy" className="size-full object-contain" />
      )}
    </span>
  );
}

function Price({ p, lang }: { p: Card; lang: Locale }) {
  const off = discount(p);
  if (p.price <= 0) return <span className="text-muted">—</span>;
  return (
    <span className="whitespace-nowrap">
      <span className="font-bold tabular-nums">{formatPrice(p.price, lang)}</span>
      {off > 0 && (
        <span className="block text-[11px]">
          <span className="text-muted line-through tabular-nums">{formatPrice(p.regular, lang)}</span>{" "}
          <span className="text-sale font-bold">-{off}%</span>
        </span>
      )}
    </span>
  );
}

/** Dense product table: the primary way products are listed. */
export function ProductTable({ items, lang }: { items: Card[]; lang: Locale }) {
  const t = getDictionary(lang);
  const labels = { add: t.addToCart, added: t.added, out: t.outOfStock };
  return (
    <>
      <table className="spec-table w-full border-collapse hidden md:table">
        <thead>
          <tr>
            <th className="w-[140px]" />
            <th>{t.description}</th>
            <th className="w-32">{t.brandLabel}</th>
            <th className="w-40">{t.sku}</th>
            <th className="w-28 !text-end">{t.price}</th>
            <th className="w-40" />
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td><Link href={`/${lang}/product/${p.id}`}><Thumb src={p.img} alt={p.name} size="size-[120px]" /></Link></td>
              <td><Link href={`/${lang}/product/${p.id}`} className="text-link hover:underline">{p.name}</Link></td>
              <td className="text-[12px]">{p.brand ?? "—"}</td>
              <td className="text-[12px] font-mono text-muted whitespace-nowrap">{p.sku || "—"}</td>
              <td className="text-end"><Price p={p} lang={lang} /></td>
              <td><AddToCart product={p} lang={lang} labels={labels} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Narrow screens: stacked rows */}
      <ul className="md:hidden border-t border-line">
        {items.map((p) => (
          <li key={p.id} className="flex gap-3 py-2.5 border-b border-line">
            <Link href={`/${lang}/product/${p.id}`}><Thumb src={p.img} alt={p.name} size="size-28" /></Link>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <Link href={`/${lang}/product/${p.id}`} className="line-clamp-3 text-link">{p.name}</Link>
              <span className="text-[11px] text-muted">{[p.brand, p.sku].filter(Boolean).join(" · ")}</span>
              <div className="flex items-end justify-between gap-2 mt-auto">
                <Price p={p} lang={lang} />
                <AddToCart product={p} lang={lang} labels={labels} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Compact picture tiles, used sparingly (related items, home highlights). */
export function ProductTiles({ items, lang }: { items: Card[]; lang: Locale }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-6">
      {items.map((p) => (
        <Link key={p.id} href={`/${lang}/product/${p.id}`} className="group flex flex-col gap-1.5">
          <Thumb src={p.img} alt={p.name} size="w-full aspect-square" />
          <span className="text-[13px] leading-snug line-clamp-2 text-link group-hover:underline">{p.name}</span>
          <Price p={p} lang={lang} />
        </Link>
      ))}
    </div>
  );
}
