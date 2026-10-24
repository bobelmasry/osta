import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { Listing } from "@/components/listing";
import { Breadcrumbs, PageTitle } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/offers">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).dealsTitle } : {};
}

export default async function OffersPage({ params, searchParams }: PageProps<"/[lang]/offers">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const sp = await searchParams;

  return (
    <>
      <Breadcrumbs items={[{ href: `/${lang}`, label: t.home }, { label: t.offers }]} />
      <PageTitle meta={t.dealsSub}>{t.dealsTitle}</PageTitle>
      <Listing lang={lang} basePath={`/${lang}/offers`} searchParams={{ sort: "discount", ...sp }} base={{}} forceSale />
    </>
  );
}
