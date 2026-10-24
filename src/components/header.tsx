import Link from "next/link";
import { Wrench } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import { SearchBox } from "./search-box";
import { CartButton } from "./cart-button";
import { LangSwitch } from "./lang-switch";
import { MobileMenu } from "./mobile-menu";
import type { MenuNode } from "./sidebar";

export function Header({ lang, tree }: { lang: Locale; tree: MenuNode[] }) {
  const t = getDictionary(lang);
  const links = [
    { href: `/${lang}/brands`, label: t.brands },
    { href: `/${lang}/offers`, label: t.offers },
  ];

  return (
    <header className="sticky top-0 z-40 bg-primary text-white shadow-[0_1px_0_rgba(0,0,0,0.15)]">
      <div className="max-w-[1400px] mx-auto h-14 px-3 lg:px-4 flex items-center gap-3 lg:gap-6">
        <MobileMenu lang={lang} tree={tree} links={links} title={t.categories} languageLabel={t.language} />
        <Link href={`/${lang}`} className="shrink-0 flex items-center gap-2 leading-none">
          <span className="grid place-items-center size-8 bg-cta text-cta-ink">
            <Wrench className="size-[18px]" strokeWidth={2.5} />
          </span>
          <span className="hidden sm:block font-bold text-[17px] tracking-tight">{t.brand}</span>
        </Link>
        <div className="flex-1 max-w-2xl">
          <SearchBox lang={lang} placeholder={t.searchPlaceholder} label={t.search} />
        </div>
        <nav className="hidden md:flex items-center gap-5 text-[13px] text-white/85 lnk">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">{l.label}</Link>
          ))}
          <LangSwitch lang={lang} label={t.language} className="hover:text-white" />
        </nav>
        <LangSwitch lang={lang} label={lang === "ar" ? "EN" : "ع"} className="md:hidden font-bold px-1" />
        <CartButton lang={lang} label={t.cart} />
      </div>
    </header>
  );
}
