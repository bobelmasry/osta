import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { dir, getDictionary, hasLocale, locales } from "@/lib/i18n";
import { catName, getChildren, getTopCategories } from "@/lib/catalog";
import { CartProvider } from "@/components/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Sidebar, type MenuNode } from "@/components/sidebar";

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-arabic",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: { default: `${t.brand} — ${t.tagline}`, template: `%s · ${t.brand}` },
    description: t.heroSub,
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  const tree: MenuNode[] = getTopCategories().map((c) => ({
    id: c.id,
    name: catName(c, lang),
    href: `/${lang}/category/${c.slug}`,
    count: c.count,
    children: getChildren(c.id).map((s) => ({
      id: s.id,
      name: catName(s, lang),
      href: `/${lang}/category/${s.slug}`,
      count: s.count,
      children: [],
    })),
  }));

  return (
    <html lang={lang} dir={dir(lang)} className={`${arabic.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <CartProvider>
          <Header lang={lang} tree={tree} />
          <div className="flex-1 w-full max-w-[1400px] mx-auto flex">
            <Sidebar tree={tree} title={t.categories} lang={lang} />
            <main className="flex-1 min-w-0 px-4 lg:px-6 py-4">{children}</main>
          </div>
          <Footer lang={lang} />
        </CartProvider>
      </body>
    </html>
  );
}
