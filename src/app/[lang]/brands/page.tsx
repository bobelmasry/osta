import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatNumber, getDictionary, hasLocale } from "@/lib/i18n";
import { getBrands } from "@/lib/catalog";
import { Breadcrumbs, PageTitle } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/brands">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).brands } : {};
}

export default async function BrandsPage({ params }: PageProps<"/[lang]/brands">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const brands = getBrands();
  const byLetter = new Map<string, typeof brands>();
  for (const b of [...brands].sort((a, z) => a.name.localeCompare(z.name))) {
    const letter = /[A-Z]/.test(b.name[0]) ? b.name[0] : "#";
    byLetter.set(letter, [...(byLetter.get(letter) ?? []), b]);
  }

  return (
    <>
      <Breadcrumbs items={[{ href: `/${lang}`, label: t.home }, { label: t.brands }]} />
      <PageTitle meta={formatNumber(brands.length, lang)}>{t.brands}</PageTitle>

      <div className="flex flex-wrap gap-x-2 gap-y-1 mb-5 text-[13px] font-bold" dir="ltr">
        {[...byLetter.keys()].map((l) => (
          <a key={l} href={`#letter-${l}`} className="text-link hover:underline">{l}</a>
        ))}
      </div>

      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-8" dir="ltr">
        {[...byLetter.entries()].map(([letter, list]) => (
          <section key={letter} id={`letter-${letter}`} className="break-inside-avoid mb-5 scroll-mt-20">
            <h2 className="font-bold text-[15px] text-primary border-b-2 border-primary-2 mb-1">{letter}</h2>
            <ul className="text-[12px] leading-[1.7]">
              {list.map((b) => (
                <li key={b.key}>
                  <Link href={`/${lang}/brand/${b.key}`} className="text-link hover:underline">{b.name}</Link>
                  <span className="text-muted"> ({formatNumber(b.count, lang)})</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
