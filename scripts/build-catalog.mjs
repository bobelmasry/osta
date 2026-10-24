// Turns data/raw/*.json (from scrape.mjs) into the compact bilingual catalog the app reads.
// Usage: node scripts/build-catalog.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";

const root = new URL("../data/", import.meta.url);
const read = async (p) => JSON.parse(await readFile(new URL(p, root), "utf8"));

const rawCats = await read("raw/categories.json");
const rawBrands = await read("raw/brands.json");
const rawProducts = await read("raw/products.json");
const catEn = await read("category-en.json");
const glossary = await read("glossary.json");

const entities = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
const decodeHtml = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(\w+);/g, (m, n) => entities[n] ?? m)
    .replace(/[″“”]/g, '"')
    .replace(/[′‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const normAr = (s) =>
  s
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");

const phrases = new Map(Object.entries(glossary.phrases).map(([k, v]) => [normAr(k), v]));
const words = new Map(Object.entries(glossary.words).map(([k, v]) => [normAr(k), v]));
const maxPhrase = Math.max(...[...phrases.keys()].map((k) => k.split(" ").length));
const isArabic = (w) => /[؀-ۿ]/.test(w);

const unknown = new Map();

// Labels, units and connectors split noun phrases; everything else Arabic-derived is reordered.
const breakers = new Set(
  "Size Model Length Width Dia. Height Depth Thickness Teeth from to with without & , for in on or pcs Set Kit Box Carton Roll per up to and No. Item No. Country of Origin Load Torque Power Pressure Speed Speeds Capacity Voltage Input Range Warranty Months Years Type Phase rpm Total"
    .split(" "),
);
const isUnit = (t) => /^(mm|cm|m|kg|g|L|Ton|"|V|W|A|HP|N|bar|Hz|J|kVA|Wh|rpm|1\/4|1\/2)$/.test(t);

// Word/phrase-level translation: Arabic tokens go through the glossary (longest phrase first),
// Latin tokens (brands, model numbers, units) are kept as-is. Arabic puts modifiers after the
// noun ("مفتاح عزم" = wrench torque), so each run of translated words is reversed.
function translate(text) {
  const tokens = text
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/\u066B/g, ".")
    .replace(/([\u0600-\u06FF])(\d)/g, "$1 $2")
    .replace(/(\d)([\u0600-\u06FF])/g, "$1 $2")
    .split(" ")
    .filter(Boolean);
  const segs = []; // {text, ar}
  for (let i = 0; i < tokens.length; ) {
    if (!isArabic(tokens[i])) {
      segs.push({ text: tokens[i++], ar: false });
      continue;
    }
    let matched = false;
    for (let len = Math.min(maxPhrase, tokens.length - i); len >= 2; len--) {
      const key = normAr(tokens.slice(i, i + len).join(" "));
      if (phrases.has(key)) {
        segs.push({ text: phrases.get(key), ar: true });
        i += len;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    let w = normAr(tokens[i++]).replace(/[،,.:]+$/, "");
    let conj = false;
    if (!words.has(w) && w.startsWith("و") && words.has(w.slice(1))) {
      conj = true;
      w = w.slice(1);
    }
    if (!words.has(w) && w.startsWith("ال") && words.has(w.slice(2))) w = w.slice(2);
    if (!words.has(w) && w.startsWith("بال") && words.has(w.slice(3))) w = w.slice(3);
    if (words.has(w)) {
      const t = words.get(w);
      if (conj) segs.push({ text: "&", ar: false });
      if (t) segs.push({ text: t, ar: true });
    } else {
      unknown.set(w, (unknown.get(w) || 0) + 1);
    }
  }
  const out = [];
  let run = [];
  const flush = () => {
    out.push(...run.reverse());
    run = [];
  };
  for (const seg of segs) {
    if (seg.ar && !breakers.has(seg.text) && !isUnit(seg.text) && !seg.text.startsWith("&") && !seg.text.startsWith("for ") && !seg.text.startsWith("with")) {
      run.push(seg.text);
    } else {
      flush();
      out.push(seg.text);
    }
  }
  flush();
  return tidy(out.join(" "));
}

function tidy(s) {
  let r = s
    .replace(/\s+"/g, '"')
    .replace(/(\d)\s+(mm|cm|kg|V|W|A|HP|bar|Hz|L|J)\b/g, "$1$2")
    .replace(/\s+([,)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/(^|\s)(&|,|-)(\s+(&|,|-))+/g, "$1$2")
    .replace(/^[\s&,\-]+|[\s&,\-]+$/g, "")
    .replace(/\s+/g, " ");
  // Drop immediately repeated words ("CROWN CROWN", "mm mm").
  r = r.replace(/\b(\S+)(\s+\1\b)+/gi, "$1");
  return r.charAt(0).toUpperCase() + r.slice(1);
}

// ---- Categories -----------------------------------------------------------
const skipCats = new Set([66082, 65178]); // "uncategorised"

// The source tree has ~20 small top-level categories that belong under a real parent.
const reparent = {
  622: 434, 621: 434, 623: 434, 687: 434, 503: 434, 626: 434, 624: 434, 78494: 434, // measuring
  69458: 380, 67469: 380, 67473: 380, // accessories
  69173: 367, 67526: 367, 67046: 367, 65149: 367, 80867: 367, // hand tools
  83394: 382, // rivet guns -> staplers & nails
  70526: 374, // metaform ladders -> handling
  65150: 401, // plumbing workshop -> plumbing
  80796: 376, 80795: 376, 80794: 376, // motors -> motors & pumps
};
// Tidier Arabic labels where the source name is a run-on string.
const arOverride = {
  380: "اكسسوارات وبنط وأقراص",
  395: "أقراص وصواني وبنط",
  80794: "مواتير مياه ومضخات",
};
const categories = rawCats
  .filter((c) => !skipCats.has(c.id))
  .map((c) => {
    const nameAr = arOverride[c.id] ?? decodeHtml(c.name);
    return {
      id: c.id,
      parent: reparent[c.id] ?? (skipCats.has(c.parent) ? 0 : c.parent),
      nameAr,
      nameEn: catEn[c.id] ?? translate(nameAr),
      slug: /^[a-z0-9_-]+$/i.test(c.slug) && !/^[a-z0-9]{5}$/.test(c.slug) ? c.slug.replace(/_/g, "-") : String(c.id),
      count: 0,
      image: c.image,
    };
  });
const catById = new Map(categories.map((c) => [c.id, c]));

// ---- Brands ---------------------------------------------------------------
const brandMap = new Map(); // key -> {key, name, nameAr, count}
const keyOf = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function addBrand(name, nameAr = null) {
  const key = keyOf(name);
  if (!key) return null;
  if (!brandMap.has(key)) brandMap.set(key, { key, name, nameAr, count: 0 });
  else if (nameAr && !brandMap.get(key).nameAr) brandMap.get(key).nameAr = nameAr;
  return key;
}
for (const b of rawBrands) addBrand(decodeHtml(b.name).replace(/^شنط عدة اي بي تي$/, "APT"));

function resolveBrand(p) {
  if (p.brand) {
    const b = rawBrands.find((x) => decodeURIComponent(x.slug) === p.brand);
    if (b && /[A-Za-z]/.test(b.name)) return addBrand(decodeHtml(b.name));
    if (b) return addBrand("APT");
  }
  if (p.brandAttr) {
    const attr = decodeHtml(p.brandAttr);
    const latin = attr.match(/[A-Za-z][A-Za-z0-9 .&+-]*[A-Za-z0-9]/);
    const arabic = attr.match(/[؀-ۿ][؀-ۿ ]*/);
    if (latin) return addBrand(latin[0].trim().toUpperCase(), arabic?.[0].trim() ?? null);
  }
  // Fall back to a known brand name appearing in the (mostly Arabic) title.
  const upper = ` ${decodeHtml(p.name).toUpperCase().replace(/[^A-Z0-9]+/g, " ")} `;
  for (const b of knownBrands()) if (upper.includes(` ${b.match} `)) return b.key;
  return null;
}

let brandCache = null;
function knownBrands() {
  brandCache ??= [...brandMap.values()]
    .filter((b) => b.name.length >= 3)
    .map((b) => ({ key: b.key, match: b.name.toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim() }))
    .sort((a, b) => b.match.length - a.match.length);
  return brandCache;
}

// ---- Products -------------------------------------------------------------
const attrNames = {
  "بلد المنشآ": "Country of origin",
  "بلد المنشأ": "Country of origin",
  "المقاس": "Size",
  "الحجم": "Size",
  "الطول": "Length",
  "القدرة": "Power",
  "القوة": "Power",
  "الجهد": "Voltage",
  "الوزن": "Weight",
  "اللون": "Colour",
  "مقاس القرص": "Disc size",
  "عدد السنون": "Teeth count",
  "حجم اللقمه": "Socket drive",
  "حجم اللقمة": "Socket drive",
  "عدد القطع": "Pieces",
  "الخامة": "Material",
  "النوع": "Type",
};

for (const p of rawProducts) if (p.brandAttr || p.brand) resolveBrand(p);
for (const b of brandMap.values()) b.count = 0;

const products = [];
const seen = new Set();
for (const p of rawProducts) {
  if (seen.has(p.id)) continue;
  seen.add(p.id);
  const nameAr = decodeHtml(p.name);
  if (!nameAr || /placeholder/i.test(nameAr)) continue;
  const cats = p.cats.filter((id) => catById.has(id));
  const brand = resolveBrand(p);
  if (brand) brandMap.get(brand).count++;
  const price = p.price;
  const regular = p.regular > price ? p.regular : price;
  products.push({
    id: p.id,
    ar: nameAr,
    en: translate(nameAr) || nameAr,
    sku: p.sku || "",
    price,
    regular,
    stock: p.inStock,
    rating: p.rating,
    cats,
    brand,
    img: p.images[0]?.thumb ?? null,
    imgs: p.images.map((i) => i.src),
    attrs: p.attrs.map((a) => {
      const n = decodeHtml(a.name);
      const v = a.values.map(decodeHtml).join("، ");
      return { ar: [n, v], en: [attrNames[n] ?? translate(n), translate(v) || v] };
    }),
    t: products.length, // recency order (scraped newest first)
  });
}

// Category counts include descendants.
const parentOf = (id) => catById.get(id)?.parent || 0;
for (const p of products) {
  const touched = new Set();
  for (let id of p.cats) {
    while (id && !touched.has(id)) {
      touched.add(id);
      id = parentOf(id);
    }
  }
  for (const id of touched) catById.get(id).count++;
}

const brands = [...brandMap.values()].filter((b) => b.count > 0).sort((a, b) => b.count - a.count);

await mkdir(new URL("catalog/", root), { recursive: true });
await writeFile(new URL("catalog/categories.json", root), JSON.stringify(categories.filter((c) => c.count > 0)));
await writeFile(new URL("catalog/brands.json", root), JSON.stringify(brands));
await writeFile(new URL("catalog/products.json", root), JSON.stringify(products));

const top = [...unknown.entries()].sort((a, b) => b[1] - a[1]).slice(0, 150);
console.log(`products ${products.length}, categories ${categories.length}, brands ${brands.length}`);
console.log(`untranslated words: ${unknown.size}; top:`, top.map(([w, n]) => `${w}:${n}`).join(" "));
