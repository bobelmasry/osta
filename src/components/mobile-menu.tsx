"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { MenuNode } from "./sidebar";
import { LangSwitch } from "./lang-switch";

export function MobileMenu({
  lang,
  tree,
  links,
  title,
  languageLabel,
}: {
  lang: string;
  tree: MenuNode[];
  links: { href: string; label: string }[];
  title: string;
  languageLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const pathname = usePathname();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close on navigation
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden p-1" aria-label={title}>
        <Menu className="size-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-[85%] max-w-sm bg-surface flex flex-col">
            <div className="flex items-center justify-between h-12 px-3 border-b border-line bg-surface-2">
              <span className="font-bold">{title}</span>
              <button onClick={() => setOpen(false)} className="p-1" aria-label="Close"><X className="size-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto text-[13px]">
              <ul className="border-b border-line py-1">
                {links.map((l) => (
                  <li key={l.href}><Link href={l.href} className="block px-3 py-2 font-bold">{l.label}</Link></li>
                ))}
              </ul>
              <ul className="py-1">
                {tree.map((n) => {
                  const isOpen = expanded === n.id;
                  return (
                    <li key={n.id} className="border-b border-line/60">
                      <div className="flex">
                        <Link href={n.href} className="flex-1 px-3 py-2">{n.name}</Link>
                        {n.children.length > 0 && (
                          <button onClick={() => setExpanded(isOpen ? null : n.id)} className="w-10 text-muted font-bold" aria-expanded={isOpen}>
                            {isOpen ? "−" : "+"}
                          </button>
                        )}
                      </div>
                      {isOpen && (
                        <ul className="pb-1">
                          {n.children.map((c) => (
                            <li key={c.id}><Link href={c.href} className="block ps-7 pe-3 py-1.5 text-fg/80">{c.name}</Link></li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border-t border-line p-3">
              <LangSwitch lang={lang} label={languageLabel} className="font-bold" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
