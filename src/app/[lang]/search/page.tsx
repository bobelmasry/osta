import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { Listing } from "@/components/listing";
import { Breadcrumbs, PageTitle } from "@/components/ui";

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/search">): Promise<Metadata> {
  const { lang } = await params;
  const { q } = await searchParams;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: q ? `${t.resultsFor} "${q}"` : t.allProducts };
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;

  return (
    <>
      <Breadcrumbs items={[{ href: `/${lang}`, label: t.home }, { label: q ? t.search : t.allProducts }]} />
      <PageTitle>{q ? <>{t.resultsFor} “{q}”</> : t.allProducts}</PageTitle>
      <Listing lang={lang} basePath={`/${lang}/search`} searchParams={sp} base={{}} />
    </>
  );
}
