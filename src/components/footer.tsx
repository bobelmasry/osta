import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";

export function Footer({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  return (
    <footer className="mt-10 border-t border-line bg-surface-2 text-[12px] text-muted">
      <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-wrap gap-x-6 gap-y-2 lnk">
        <Link href={`/${lang}/brands`}>{t.brands}</Link>
        <Link href={`/${lang}/offers`}>{t.offers}</Link>
        <Link href={`/${lang}/search?sort=newest`}>{t.newArrivals}</Link>
        <span>{t.contact}</span>
        <span>{t.shippingInfo}</span>
        <span>{t.returns}</span>
        <span className="ms-auto">© {new Date().getFullYear()} {t.brand}. {t.rights}</span>
      </div>
    </footer>
  );
}
