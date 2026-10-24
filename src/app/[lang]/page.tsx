import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNumber, getDictionary, hasLocale } from "@/lib/i18n";
import { getBrands, queryProducts, toCard, totalProducts } from "@/lib/catalog";
import { trades } from "@/lib/taxonomy";
import { CategoryIndex } from "@/components/category-index";
import { ProductTiles } from "@/components/product-card";
import { SectionHead } from "@/components/ui";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  const deals = queryProducts({ sort: "discount", onSale: true, inStock: true, perPage: 24 })
    .items.filter((p) => p.img)
    .slice(0, 12);
  const brands = getBrands().slice(0, 40);

  return (
    <>
      <p className="text-[12px] text-muted mb-4">
        {formatNumber(totalProducts(), lang)} {t.products} · {t.tagline}
      </p>

      <CategoryIndex lang={lang} />

      <SectionHead title={t.shopByTrade} />
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-1 text-[13px]">
        {trades.map((tr) => (
          <li key={tr.key}>
            <Link href={`/${lang}/trade/${tr.key}`} className="text-link hover:underline">{lang === "ar" ? tr.ar : tr.en}</Link>
          </li>
        ))}
      </ul>

      <SectionHead title={t.todaysDeals} href={`/${lang}/offers`} linkLabel={t.viewAll} />
      <ProductTiles items={deals.map((p) => toCard(p, lang))} lang={lang} />

      <SectionHead title={t.brands} href={`/${lang}/brands`} linkLabel={t.viewAll} />
      <p className="text-[12px] leading-relaxed">
        {brands.map((b, i) => (
          <span key={b.key}>
            {i > 0 && <span className="text-muted"> · </span>}
            <Link href={`/${lang}/brand/${b.key}`} className="text-link hover:underline">{b.name}</Link>
          </span>
        ))}
      </p>
    </>
  );
}
