"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Suspense, useState } from "react";

function SearchInner({ lang, placeholder, label }: { lang: string; placeholder: string; label: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/${lang}/search?q=${encodeURIComponent(term)}` : `/${lang}/search`);
      }}
      className="flex w-full items-center border border-transparent bg-white text-fg focus-within:shadow-[0_0_0_3px_var(--cta)]"
    >
      <Search className="size-4 text-muted ms-2 shrink-0" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="flex-1 min-w-0 h-9 px-2 bg-transparent outline-none text-[13px] placeholder:text-muted"
      />
    </form>
  );
}

export function SearchBox(props: { lang: string; placeholder: string; label: string }) {
  return (
    <Suspense fallback={<div className="h-[34px] bg-white" />}>
      <SearchInner {...props} />
    </Suspense>
  );
}
