"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ value, label, options }: { value: string; label: string; options: [string, string][] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-1.5">
      <span className="text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          next.delete("page");
          if (e.target.value === "featured") next.delete("sort");
          else next.set("sort", e.target.value);
          const s = next.toString();
          router.push(s ? `${pathname}?${s}` : pathname);
        }}
        className="h-7 border border-[#999] bg-white px-1"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}
