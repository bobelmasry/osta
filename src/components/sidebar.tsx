"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type MenuNode = { id: number; name: string; href: string; count: number; children: MenuNode[] };

/** Persistent left-hand category index; expands the branch containing the current page. */
export function Sidebar({ tree, title, lang }: { tree: MenuNode[]; title: string; lang: string }) {
  const pathname = decodeURIComponent(usePathname());
  const nf = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US");
  const activeTop = tree.find((n) => n.href === pathname || n.children.some((c) => c.href === pathname));

  return (
    <aside className="hidden lg:block w-56 shrink-0 border-e border-line bg-surface-2">
      <nav className="sticky top-[57px] max-h-[calc(100dvh-57px)] overflow-y-auto py-3 text-[12px]">
        <div className="px-3 pb-2 font-bold uppercase tracking-wide text-[11px] text-primary-2">{title}</div>
        <ul>
          {tree.map((n) => {
            const open = activeTop?.id === n.id;
            return (
              <li key={n.id}>
                <Link
                  href={n.href}
                  className={`flex justify-between gap-2 px-3 py-[3px] hover:underline ${pathname === n.href ? "bg-tint text-primary font-bold border-s-[3px] border-primary-2" : open ? "font-bold text-primary" : ""}`}
                >
                  <span>{n.name}</span>
                </Link>
                {open && (
                  <ul className="mb-1">
                    {n.children.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={c.href}
                          className={`flex justify-between gap-2 ps-6 pe-3 py-[2px] text-fg/80 hover:underline ${pathname === c.href ? "bg-tint text-primary font-bold" : ""}`}
                        >
                          <span>{c.name}</span>
                          <span className="text-muted tabular-nums">{nf.format(c.count)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
