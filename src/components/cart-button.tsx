"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./cart";

export function CartButton({ lang, label }: { lang: string; label: string }) {
  const { count } = useCart();
  return (
    <Link href={`/${lang}/cart`} className="flex items-center gap-1.5 text-[12px] font-bold text-white hover:underline shrink-0" aria-label={label}>
      <ShoppingCart className="size-4" />
      <span className="hidden sm:inline">{label}</span>
      {count > 0 && <span className="bg-cta text-cta-ink px-1.5 text-[11px] tabular-nums">{count > 99 ? "99+" : count}</span>}
    </Link>
  );
}
