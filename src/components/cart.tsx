"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ProductCard } from "@/lib/catalog";

export type CartItem = { id: number; qty: number; price: number; img: string | null; name: { en?: string; ar?: string } };

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (p: ProductCard, lang: string, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "osta-cart";
const LEGACY_KEY = "toolcraft-cart"; // pre-rename carts are carried over once

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
      if (raw) localStorage.setItem(KEY, raw);
      localStorage.removeItem(LEGACY_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once on mount
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
      add: (p, lang, qty = 1) => {
        const existing = items.find((i) => i.id === p.id);
        if (existing) {
          persist(items.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty, name: { ...i.name, [lang]: p.name } } : i)));
        } else {
          persist([...items, { id: p.id, qty, price: p.price, img: p.img, name: { [lang]: p.name } }]);
        }
      },
      setQty: (id, qty) => persist(items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))),
      remove: (id) => persist(items.filter((i) => i.id !== id)),
      clear: () => persist([]),
    }),
    [items, persist],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
