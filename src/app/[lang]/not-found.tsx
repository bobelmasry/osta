import Link from "next/link";
import { lang as rootLang } from "next/root-params";
import { defaultLocale, formatNumber, getDictionary, hasLocale } from "@/lib/i18n";
import { catName, getTopCategories } from "@/lib/catalog";
import { SearchBox } from "@/components/search-box";

export default async function NotFound() {
  const param = await rootLang();
  const lang = param && hasLocale(param) ? param : defaultLocale;
  const t = getDictionary(lang);
  const sections = getTopCategories().slice(0, 12);

  return (
    <div className="max-w-3xl mx-auto py-12 sm:py-16">
      <div className="flex items-center gap-5 sm:gap-8 border-b-[3px] border-primary pb-5">
        <span className="text-[72px] sm:text-[96px] font-bold leading-none text-primary tabular-nums tracking-tight" dir="ltr">
          4<span className="text-cta">0</span>4
        </span>
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-bold text-primary leading-tight">{t.notFound}</h1>
          <p className="mt-1 text-[14px] text-muted">{t.notFoundSub}</p>
        </div>
      </div>

      <p className="mt-6 mb-2 text-[13px]">{t.notFoundSearch}</p>
      <div className="bg-primary p-2">
        <SearchBox lang={lang} placeholder={t.searchPlaceholder} label={t.search} />
      </div>

      <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 border-t border-s border-line">
        {sections.map((c) => (
          <li key={c.id} className="border-e border-b border-line">
            <Link href={`/${lang}/category/${c.slug}`} className="group flex items-center gap-3 p-3 hover:bg-tint">
              {c.image ? (
                <span className="product-img size-12 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote catalogue images */}
                  <img src={c.image} alt="" loading="lazy" className="size-full object-contain" />
                </span>
              ) : (
                <span className="size-12 shrink-0 bg-surface-2" />
              )}
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-primary leading-tight group-hover:underline">{catName(c, lang)}</span>
                <span className="block text-[11px] text-muted">{formatNumber(c.count, lang)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-[13px]">
        <Link href={`/${lang}`} className="h-9 px-5 inline-flex items-center bg-cta text-cta-ink font-bold hover:bg-cta-strong">
          {t.backHome}
        </Link>
        <Link href={`/${lang}/offers`} className="text-link hover:underline">{t.offers} ›</Link>
        <Link href={`/${lang}/brands`} className="text-link hover:underline">{t.brands} ›</Link>
      </div>
    </div>
  );
}
