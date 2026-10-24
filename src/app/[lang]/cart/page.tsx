import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { CartView } from "@/components/cart-view";
import { Breadcrumbs, PageTitle } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/cart">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).yourCart } : {};
}

export default async function CartPage({ params }: PageProps<"/[lang]/cart">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <>
      <Breadcrumbs items={[{ href: `/${lang}`, label: t.home }, { label: t.yourCart }]} />
      <PageTitle>{t.yourCart}</PageTitle>
      <CartView lang={lang} t={t} />
    </>
  );
}
