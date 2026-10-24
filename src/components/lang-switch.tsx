"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Inner({ lang, label, className }: { lang: string; label: string; className?: string }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const other = lang === "ar" ? "en" : "ar";
  const href = pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${other}`) + (search ? `?${search}` : "");
  return (
    <Link
      href={href}
      hrefLang={other}
      onClick={() => {
        document.cookie = `lang=${other}; path=/; max-age=31536000`;
      }}
      className={className}
    >
      {label}
    </Link>
  );
}

export function LangSwitch(props: { lang: string; label: string; className?: string }) {
  return (
    <Suspense fallback={<span className={props.className}>{props.label}</span>}>
      <Inner {...props} />
    </Suspense>
  );
}
