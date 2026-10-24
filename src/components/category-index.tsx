import Link from "next/link";
import { catName, getChildren, getTopCategories } from "@/lib/catalog";
import { formatNumber, type Locale } from "@/lib/i18n";

/** Multi-column text index of every category and its subcategories. */
export function CategoryIndex({ lang }: { lang: Locale }) {
  return (
    <div className="columns-1 sm:columns-2 xl:columns-3 2xl:columns-4 gap-8">
      {getTopCategories().map((c) => {
        const children = getChildren(c.id);
        return (
          <section key={c.id} className="break-inside-avoid mb-6">
            <h2 className="flex items-center gap-3 border-b-2 border-primary-2 pb-1.5 mb-1.5">
              {c.image && (
                <span className="product-img size-16 shrink-0 border border-line p-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote catalogue images */}
                  <img src={c.image} alt="" loading="lazy" className="size-full object-contain" />
                </span>
              )}
              <Link href={`/${lang}/category/${c.slug}`} className="text-[15px] font-bold text-primary hover:underline leading-tight">
                {catName(c, lang)}
              </Link>
            </h2>
            <ul className="text-[12px] leading-[1.6]">
              {children.map((s) => (
                <li key={s.id}>
                  <Link href={`/${lang}/category/${s.slug}`} className="text-link hover:underline">{catName(s, lang)}</Link>
                  <span className="text-muted"> ({formatNumber(s.count, lang)})</span>
                </li>
              ))}
              {!children.length && (
                <li className="text-muted">{formatNumber(c.count, lang)}</li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
