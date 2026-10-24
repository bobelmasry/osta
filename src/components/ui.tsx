import Link from "next/link";

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[12px] text-muted mb-2">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span>›</span>}
            {item.href ? (
              <Link href={item.href} className="text-link hover:underline">{item.label}</Link>
            ) : (
              <span className="text-fg line-clamp-1">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageTitle({ children, meta }: { children: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 border-b-[3px] border-primary pb-1.5 mb-4">
      <h1 className="text-[24px] font-bold text-primary leading-tight">{children}</h1>
      {meta && <span className="text-[12px] text-muted">{meta}</span>}
    </div>
  );
}

export function SectionHead({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b-2 border-primary-2 pb-1 mb-3 mt-10">
      <h2 className="text-[16px] font-bold text-primary">{title}</h2>
      {href && (
        <Link href={href} className="text-[12px] text-link hover:underline">
          {linkLabel} ›
        </Link>
      )}
    </div>
  );
}
