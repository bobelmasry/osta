import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatPrice, getDictionary, hasLocale } from "@/lib/i18n";
import {
  catName,
  discount,
  getAncestors,
  getBrand,
  getCategoryById,
  getProduct,
  productName,
  relatedProducts,
  toCard,
} from "@/lib/catalog";
import { Gallery } from "@/components/gallery";
import { AddToCart } from "@/components/add-to-cart";
import { ProductTable } from "@/components/product-card";
import { Breadcrumbs, SectionHead } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const p = getProduct(Number(id));
  if (!p || !hasLocale(lang)) return {};
  return { title: productName(p, lang), openGraph: { images: p.img ? [p.img] : [] } };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/product/[id]">) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const p = getProduct(Number(id));
  if (!p) notFound();
  const t = getDictionary(lang);

  const name = productName(p, lang);
  const altName = lang === "ar" ? p.en : p.ar;
  const brand = p.brand ? getBrand(p.brand) : null;
  const leaf = p.cats
    .map(getCategoryById)
    .filter((c) => c != null)
    .sort((a, b) => getAncestors(b).length - getAncestors(a).length)[0];
  const trail = leaf ? [...getAncestors(leaf), leaf] : [];
  const off = discount(p);
  const related = relatedProducts(p, 10);

  const specs: [string, React.ReactNode][] = [
    ...(brand ? [[t.brandLabel, <Link key="b" href={`/${lang}/brand/${brand.key}`} className="text-link underline">{brand.name}</Link>] as [string, React.ReactNode]] : []),
    ...(p.sku ? [[t.sku, <span key="s" className="font-mono">{p.sku}</span>] as [string, React.ReactNode]] : []),
    ...(leaf ? [[t.category, <Link key="c" href={`/${lang}/category/${leaf.slug}`} className="text-link underline">{catName(leaf, lang)}</Link>] as [string, React.ReactNode]] : []),
    ...p.attrs.map((a) => (lang === "ar" ? a.ar : a.en) as [string, React.ReactNode]),
    [t.inStock, p.stock ? "✓" : t.outOfStock],
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { href: `/${lang}`, label: t.home },
          ...trail.map((c) => ({ href: `/${lang}/category/${c.slug}`, label: catName(c, lang) })),
          { label: name },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-[minmax(0,480px)_1fr] mt-2">
        <Gallery images={p.imgs} alt={name} />

        <div>
          <h1 className="text-[22px] font-bold text-primary leading-snug">{name}</h1>
          <p className="mt-1 text-[12px] text-muted" dir={lang === "ar" ? "ltr" : "rtl"}>{altName}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 bg-surface-2 border border-line px-4 py-3">
            <div>
              {p.price > 0 ? (
                <>
                  <span className="text-[24px] font-bold tabular-nums">{formatPrice(p.price, lang)}</span>
                  {off > 0 && (
                    <span className="ms-2 text-[12px]">
                      <span className="text-muted line-through tabular-nums">{formatPrice(p.regular, lang)}</span>{" "}
                      <span className="text-sale font-bold">-{off}%</span>
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted">—</span>
              )}
            </div>
            <AddToCart product={toCard(p, lang)} lang={lang} labels={{ add: t.addToCart, added: t.added, out: t.outOfStock }} size="lg" />
          </div>

          <h2 className="mt-6 mb-1.5 text-[14px] font-bold text-primary">{t.specifications}</h2>
          <table className="w-full max-w-xl border-collapse text-[13px] border-t border-line">
            <tbody>
              {specs.map(([k, v], i) => (
                <tr key={i} className="border-b border-line">
                  <th className="w-2/5 py-2 px-3 text-start font-normal text-muted align-top bg-surface-2">{k}</th>
                  <td className="py-2 px-3 break-words">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <SectionHead title={t.related} href={leaf ? `/${lang}/category/${leaf.slug}` : undefined} linkLabel={t.viewAll} />
          <ProductTable items={related.map((r) => toCard(r, lang))} lang={lang} />
        </>
      )}
    </>
  );
}
