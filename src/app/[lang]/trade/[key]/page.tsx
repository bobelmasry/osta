import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatNumber, getDictionary, hasLocale } from "@/lib/i18n";
import { catName, getCategoryById } from "@/lib/catalog";
import { trades } from "@/lib/taxonomy";
import { Listing } from "@/components/listing";
import { Breadcrumbs, PageTitle } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/trade/[key]">): Promise<Metadata> {
  const { lang, key } = await params;
  const tr = trades.find((x) => x.key === key);
  return tr ? { title: lang === "ar" ? tr.ar : tr.en } : {};
}

export default async function TradePage({ params, searchParams }: PageProps<"/[lang]/trade/[key]">) {
  const { lang, key } = await params;
  if (!hasLocale(lang)) notFound();
  const trade = trades.find((x) => x.key === key);
  if (!trade) notFound();
  const t = getDictionary(lang);
  const cats = trade.categories.map(getCategoryById).filter((c) => c != null);
  const title = lang === "ar" ? trade.ar : trade.en;

  return (
    <>
      <Breadcrumbs items={[{ href: `/${lang}`, label: t.home }, { label: t.shopByTrade }, { label: title }]} />
      <PageTitle>{title}</PageTitle>
      <p className="text-[12px] mb-4">
        <span className="text-muted">{t.inThisCategory}: </span>
        {cats.map((c, i) => (
          <span key={c.id}>
            {i > 0 && " · "}
            <Link href={`/${lang}/category/${c.slug}`} className="text-link hover:underline">{catName(c, lang)}</Link>
            <span className="text-muted"> ({formatNumber(c.count, lang)})</span>
          </span>
        ))}
      </p>
      <Listing lang={lang} basePath={`/${lang}/trade/${trade.key}`} searchParams={await searchParams} base={{ categories: trade.categories }} />
    </>
  );
}
