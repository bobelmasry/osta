"use client";

import Link from "next/link";
import { formatPrice, type Dictionary, type Locale } from "@/lib/i18n";
import { useCart } from "./cart";

export function CartView({ lang, t }: { lang: Locale; t: Dictionary }) {
  const { items, subtotal, setQty, remove } = useCart();

  if (!items.length) {
    return (
      <p className="py-8 text-[13px]">
        {t.emptyCart}{" "}
        <Link href={`/${lang}`} className="underline">{t.continueShopping}</Link>
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px] items-start">
      <table className="spec-table w-full border-collapse">
        <thead>
          <tr>
            <th className="w-[140px]" />
            <th>{t.description}</th>
            <th className="w-20">{t.qty}</th>
            <th className="w-28 !text-end">{t.price}</th>
            <th className="w-28 !text-end">{t.total}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const name = item.name[lang] ?? item.name.en ?? item.name.ar ?? "";
            return (
              <tr key={item.id}>
                <td>
                  <span className="product-img block size-[120px] border border-line p-1">
                    {item.img && (
                      // eslint-disable-next-line @next/next/no-img-element -- remote catalogue images
                      <img src={item.img} alt="" className="size-full object-contain" />
                    )}
                  </span>
                </td>
                <td>
                  <Link href={`/${lang}/product/${item.id}`} className="hover:underline">{name}</Link>
                  <button onClick={() => remove(item.id)} className="block text-[11px] text-muted hover:text-sale hover:underline mt-0.5">
                    {t.remove}
                  </button>
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => setQty(item.id, Number(e.target.value) || 1)}
                    aria-label={t.qty}
                    className="w-14 h-6 border border-[#999] bg-white text-center tabular-nums"
                  />
                </td>
                <td className="text-end tabular-nums">{formatPrice(item.price, lang)}</td>
                <td className="text-end font-bold tabular-nums">{formatPrice(item.price * item.qty, lang)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <aside className="border border-line bg-surface-2 p-4 text-[13px]">
        <dl className="space-y-1.5">
          <div className="flex justify-between"><dt>{t.subtotal}</dt><dd className="tabular-nums">{formatPrice(subtotal, lang)}</dd></div>
          <div className="flex justify-between"><dt>{t.shipping}</dt><dd className="text-muted">{t.shippingCalc}</dd></div>
          <div className="flex justify-between border-t border-line pt-1.5 font-bold"><dt>{t.total}</dt><dd className="tabular-nums">{formatPrice(subtotal, lang)}</dd></div>
        </dl>
        <button className="mt-4 w-full h-9 bg-cta text-cta-ink font-bold hover:bg-cta-strong">{t.checkout}</button>
      </aside>
    </div>
  );
}
