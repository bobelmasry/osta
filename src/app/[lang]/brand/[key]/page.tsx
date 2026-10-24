import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatNumber, getDictionary, hasLocale } from "@/lib/i18n";
import { brandCategories, catName, getBrand } from "@/lib/catalog";
import { Listing } from "@/components/listing";
import { Breadcrumbs, PageTitle } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/brand/[key]">): Promise<Metadata> {
  const { key } = await params;
  const b = getBrand(key);
  return b ? { title: b.name } : {};
}

export default async function BrandPage({ params, searchParams }: PageProps<"/[lang]/brand/[key]">) {
  const { lang, key } = await params;
  if (!hasLocale(lang)) notFound();
  const brand = getBrand(key);
  if (!brand) notFound();
  const t = getDictionary(lang);
  const sp = await searchParams;
  const cats = brandCategories(brand.key);
  const activeCat = Number(Array.isArray(sp.cat) ? sp.cat[0] : sp.cat) || undefined;

  return (
    <>
      <Breadcrumbs items={[{ href: `/${lang}`, label: t.home }, { href: `/${lang}/brands`, label: t.brands }, { label: brand.name }]} />
      <PageTitle meta={`${brand.nameAr && lang === "ar" ? `${brand.nameAr} · ` : ""}${formatNumber(brand.count, lang)} ${t.products}`}>{brand.name}</PageTitle>
      {cats.length > 1 && (
        <p className="text-[12px] mb-4">
          <Link href={`/${lang}/brand/${brand.key}`} className={!activeCat ? "font-bold bg-highlight px-1" : "hover:underline"}>{t.allProducts}</Link>
          {cats.map(({ cat, count }) => (
            <span key={cat.id}>
              <span className="text-muted"> · </span>
              <Link href={`/${lang}/brand/${brand.key}?cat=${cat.id}`} className={activeCat === cat.id ? "font-bold bg-highlight px-1" : "hover:underline"}>
                {catName(cat, lang)}
              </Link>
              <span className="text-muted"> ({formatNumber(count, lang)})</span>
            </span>
          ))}
        </p>
      )}
      <Listing lang={lang} basePath={`/${lang}/brand/${brand.key}`} searchParams={sp} base={{ brand: brand.key, category: activeCat }} hideBrandFilter />
    </>
  );
}
