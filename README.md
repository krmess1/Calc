# Deal Calculator

Wholesale real estate deal analyzer (React 19 + TypeScript + Vite + Tailwind, installable PWA).

Strategies: **DSCR rental, Seller Finance, Subject-To, Fix & Flip (70% rule), Double Close**, plus a Compare tab, seller net sheet, holding costs, rehab checklist, deal pipeline, share/tear-sheet export and optional Google Drive sync (Firebase Google sign-in).

Each strategy shows an **Anchor / Target / MMAO** range:
- **MMAO** – hard ceiling (Flip: `ARV × 70% − rehab − assignment fee`, compared against the *seller contract price*).
- **Anchor** – 75% of MMAO on every strategy.
- **Target** – Flip & Double Close: 90% of MMAO. DSCR / Seller Finance: highest price hitting ≥20% CoC (and DSCR ≥1.25 / ≥$200 cash flow). Sub-To: cash to seller at 25% CoC.

Seller Finance and Subject-To also show an **HMHW Creative Offer Oven closer checklist**. Thresholds live in [`src/utils/criteria.ts`](src/utils/criteria.ts) (`OFFER_OVEN`):

| Seller finance | Subject-to |
|---|---|
| Cash flow ≥ $200/mo | Cash flow ≥ $150/mo (advisory) |
| Offer ≤ $500K | Rate ≤ 8% if loan < $150K, else ≤ 5% |
| CoC ≥ 13% | Equity ≤ 15% |
| Down ≤ 15%, entry fee ≤ 15% of price | CoC ≥ −10% |
| Rate ≤ 4% | Cash to seller ≤ 15%, entry fee ≤ 15% of value |
| Balloon ≥ 5 yrs | Remaining term (balloon) ≥ 5 yrs |

## Run locally

```bash
npm install        # or: bun install
npm run dev        # http://localhost:3000
npm test           # vitest unit tests (src/utils/__tests__)
npm run lint       # TypeScript typecheck
npm run build      # production build -> dist/
```

## Environment / config

- Firebase (Google sign-in for Drive sync) is configured from `firebase-applet-config.json` (committed; Firebase web config is public by design). No env var is needed.
- `GEMINI_API_KEY` is listed in `.env.example` from the AI Studio template, but the current source does not call Gemini. Only set it if you add AI features.

## Deploy to Vercel

1. Import this repo in Vercel (framework preset **Vite**; build `npm run build`, output `dist`).
2. No env vars are required for the current build.
3. In Firebase console → Authentication → Settings → **Authorized domains**, add your `*.vercel.app` / custom domain so Google sign-in works.
4. The app is a single page with no client-side router, so no `vercel.json` rewrite is needed.
