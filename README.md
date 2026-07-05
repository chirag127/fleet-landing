# api-fleet-landing

[![GitHub stars](https://img.shields.io/github/stars/chirag127/api-fleet-landing?style=social)](https://github.com/chirag127/api-fleet-landing/stargazers)

Static landing page for the [oriz API fleet](https://api.oriz.in) — 5 free, static JSON APIs for reference data (RTO codes, physics constants, Indian classical ragas, Indian dynasties, Countries+).

Deployed to **https://api.oriz.in** via Cloudflare Pages.

## Adding a new API to the fleet

Edit `src/data/apis.json` — one entry per API. Each entry needs:

```jsonc
{
  "slug": "your-api",
  "name": "Human-readable name",
  "description": "One-sentence pitch.",
  "subdomain": "your-api.oriz.in",
  "repo": "oriz-org/your-api",
  "sampleEndpoint": "/resources/example.json",
  "sampleResponse": "{ ... }",
  "stats": "N records · source · license",
  "themeColor": "amber",        // tailwind color: amber | indigo | rose | emerald | teal | ...
  "tags": ["topic1", "topic2"],
  "license": "CC BY-SA 4.0 (data) / MIT (code)"
}
```

If you use a new `themeColor`, add the matching accent classes to the `@source inline(...)` in `src/styles/global.css` so Tailwind generates them.

## Dev

```bash
npm install
npm run dev
npm run build      # writes dist/
```

## Deploy

Pushed to `main` and deployed via `wrangler pages deploy dist --project-name=api-fleet-landing`.

## Stack

- Astro 7 (static output)
- Tailwind CSS 4 via `@tailwindcss/vite`
- Zero runtime JS — pure HTML + CSS

## License

MIT (see `LICENSE`). Data license varies per linked API; see footer on the live page.
