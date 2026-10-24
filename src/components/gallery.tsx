"use client";

import { useState } from "react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return <div className="product-img aspect-square border border-line" />;
  return (
    <div className="flex flex-col gap-2">
      <div className="product-img aspect-square border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote catalogue images */}
        <img src={images[active]} alt={alt} className="size-full object-contain p-4" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-1.5">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`product-img size-20 border ${i === active ? "border-primary-2 border-2" : "border-line hover:border-muted"}`}
              aria-label={`${alt} ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote catalogue images */}
              <img src={src} alt="" loading="lazy" className="size-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
