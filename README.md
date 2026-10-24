# Osta · أسطى

A bilingual (English / Egyptian Arabic) tool-store catalogue built with Next.js. It lists ~27,000 hand tools, power tools, compressed-air equipment, welding gear, pumps and more, in a dense, spec-table layout.

## Features

- English and Arabic with full RTL layout (`/en/...`, `/ar/...`); the language is picked from a cookie or `Accept-Language`
- Category tree in a persistent sidebar, plus "shop by trade" groupings
- Search across both languages and part numbers, with Arabic spelling normalisation
- Filters (brand, price, stock, on sale), sorting and pagination
- Product pages with a spec table and related products
- Cart stored in the browser

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Data

The catalogue was collected from the public WooCommerce Store API of [toolsworldeg.com](https://toolsworldeg.com/). Only factual catalogue fields are stored (names, part numbers, prices, stock, specs, categories, brands, image URLs). Product images are linked, not copied.

| Path | What it is |
| --- | --- |
| `data/raw/` | Output of the scraper |
| `data/catalog/` | Compact bilingual catalogue the app reads |
| `data/category-en.json` | Hand-written English category names |
| `data/glossary.json` | Arabic → English tool glossary used to translate product names |

To refresh:

```bash
node scripts/scrape.mjs         # ~5 min, rate-limited
node scripts/build-catalog.mjs  # rebuilds data/catalog; the dev server reloads it automatically
```

English product names come from the glossary rather than a translation service, so some read awkwardly. Adding terms to `data/glossary.json` and rebuilding improves them; the build prints the most common untranslated words.

## Structure

- `src/app/[lang]/` — routes (home, category, brand, trade, search, offers, product, cart, 404)
- `src/components/` — header, sidebar, product tables, filters, cart
- `src/lib/catalog.ts` — in-memory catalogue, search and filtering
- `src/lib/i18n.ts` — UI strings for both languages
- `src/proxy.ts` — redirects `/` to the preferred language
