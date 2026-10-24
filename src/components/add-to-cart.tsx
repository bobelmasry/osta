"use client";

import { useState } from "react";
import type { ProductCard } from "@/lib/catalog";
import { useCart } from "./cart";

type Labels = { add: string; added: string; out: string };

/** Qty box + "Add to cart" button, in the compact row style used by the spec tables. */
export function AddToCart({
  product,
  lang,
  labels,
  size = "sm",
}: {
  product: ProductCard;
  lang: string;
  labels: Labels;
  size?: "sm" | "lg";
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const disabled = !product.stock || product.price <= 0;

  if (disabled) return <span className="text-[11px] text-muted whitespace-nowrap">{labels.out}</span>;

  const onAdd = () => {
    add(product, lang, qty);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };

  const lg = size === "lg";
  return (
    <div className="flex items-center gap-1.5 justify-end">
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        aria-label="Qty"
        className={`border border-[#999] bg-white text-center tabular-nums ${lg ? "w-16 h-10 text-sm" : "w-11 h-8 text-[13px]"}`}
      />
      <button
        onClick={onAdd}
        className={`whitespace-nowrap font-bold text-cta-ink ${done ? "bg-cta-strong" : "bg-cta hover:bg-cta-strong"} ${lg ? "h-10 px-6 text-sm" : "h-8 px-3 text-[12px]"}`}
      >
        {done ? `✓ ${labels.added}` : labels.add}
      </button>
    </div>
  );
}
