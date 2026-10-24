import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatNumber, getDictionary, hasLocale } from "@/lib/i18n";
import { catName, getAncestors, getCategory, getChildren } from "@/lib/catalog";
import { Listing } from "@/components/listing";
import { Breadcrumbs, PageTitle } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/category/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const c = getCategory(decodeURIComponent(slug));
  return c && hasLocale(lang) ? { title: catName(c, lang) } : {};
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/category/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const cat = getCategory(decodeURIComponent(slug));
  if (!cat) notFound();
  const t = getDictionary(lang);
  const ancestors = getAncestors(cat);
  const children = getChildren(cat.id);

  return (
    <>
      <Breadcrumbs
        items={[
          { href: `/${lang}`, label: t.home },
          ...ancestors.map((a) => ({ href: `/${lang}/category/${a.slug}`, label: catName(a, lang) })),
          { label: catName(cat, lang) },
        ]}
      />
      <PageTitle meta={`${formatNumber(cat.count, lang)} ${t.products}`}>{catName(cat, lang)}</PageTitle>

      {children.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 border-t border-s border-line mb-6">
          {children.map((c) => (
            <Link key={c.id} href={`/${lang}/category/${c.slug}`} className="group bg-surface border-e border-b border-line p-3 flex flex-col items-center text-center gap-2 hover:bg-tint">
              {c.image ? (
                <span className="product-img size-28 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote catalogue images */}
                  <img src={c.image} alt="" loading="lazy" className="size-full object-contain" />
                </span>
              ) : (
                <span className="size-28 shrink-0 bg-surface-2" />
              )}
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-primary leading-tight group-hover:underline">{catName(c, lang)}</span>
                <span className="block text-[11px] text-muted">{formatNumber(c.count, lang)}</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      <Listing lang={lang} basePath={`/${lang}/category/${cat.slug}`} searchParams={await searchParams} base={{ category: cat.id }} />
    </>
  );
}
