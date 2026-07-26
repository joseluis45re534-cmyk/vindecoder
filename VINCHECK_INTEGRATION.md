# VinCheck Partner API — Integration

CarVinLookup's VIN preview + paid report data comes from the **VinCheck Partner
API v1** (`https://vincheck.it.com/api/v1`). This replaces the earlier GoodCar
provider; the GoodCar adapter (`src/lib/goodcar.ts`) is kept only for the shared
types and the make-logo fallback helper.

## Where it lives

| File | Role |
|---|---|
| `src/lib/vincheck.ts` | The **only** place VinCheck field names/endpoints live. `previewVin()`/`decodeVin()` (FREE), `getFullReport()` (PAID), `getAccount()`, `ping()`, typed errors. |
| `src/app/api/preview/route.ts` | FREE preview (`GET /vins/{vin}/preview`). Rate-limited per IP, D1-cached. Never calls the paid report. |
| `src/app/api/report/route.ts` | PAID report (`POST /reports`) behind the entitlement gate + D1 cache. |
| `src/app/api/report/pdf/route.ts` | Same paid path, renders the branded PDF. |

Routes swap providers by import only — the public shape matches `goodcar.ts`
(`VehicleSpecs` / `FullReport` / `decodeVin` / `getFullReport`).

## Environment variables (server-side secrets — never `NEXT_PUBLIC_`)

| Var | Value |
|---|---|
| `VINCHECK_API_KEY` | `vc_test_…` in dev, `vc_live_…` in production |
| `VINCHECK_API_BASE` | `https://vincheck.it.com/api/v1` (default) |
| `VINCHECK_TIMEOUT_MS` | `30000` (report), preview uses 15s |

- **Local dev:** put the `vc_test_` key in `.env.local` (gitignored). Test mode is
  free, returns realistic sample data, and never hits live data providers.
- **Production:** set the `vc_live_` key as a Cloudflare Pages secret —
  `npx wrangler pages secret put VINCHECK_API_KEY` or dashboard → Settings →
  Environment variables (encrypted).

## Product flow

1. **Preview (free):** `GET /vins/{VIN}/preview` → `records_found` counts
   (title, accident/damage, odometer, auction, recalls, photos) + `vehicle` +
   `estimated_market_value`. Rendered as the paywall teaser.
2. **Report (paid):** after the customer pays, `POST /reports` with body
   `{vin}` and header `Idempotency-Key: report:{VIN}`. Charged **only on
   success**; the idempotency key makes retries safe (never a second charge),
   and VinCheck returns the same VIN free within 30 days.

## Billing safety — important

- **Balance:** the partner account is prepaid. **It is currently $0**, so every
  *live* report returns HTTP 402 `insufficient_balance` until topped up. Top up
  in the VinCheck admin before going live.
- **402 handling:** if the balance is empty *after* a customer has paid us,
  `/api/report` **keeps the entitlement**, returns a retryable "being finalized"
  message, and logs `⚠ INSUFFICIENT BALANCE` loudly. The report was **not**
  charged, so a retry after top-up bills exactly once. **Watch the logs / poll
  `getAccount().balanceCents`.**
- Cost per report: **$3.99** live (`399`), `150` in test mode.

## Report sections (confirmed against the live example payloads)

The paid report (`POST /reports`) nests everything under `report`, with
**camelCase** keys and each section an **array of record objects** (empty `[]`
when none). `src/lib/vincheck.ts#mapReport` maps them to `FullReport`:

| FullReport field | VinCheck source key(s) |
|---|---|
| `specs` | `report.specs` (→ `report.decoder` → top-level `vehicle`) |
| `titleHistory` | `report.titleBrands` + `report.titleIssues` + `report.titleHistory` + `report.nmvtis` |
| `salvageTotalLoss` | `report.junkSalvage` + `report.insuranceLoss` |
| `accidents` | `report.accidents` |
| `odometer` | `report.odometerHistory` (→ `report.odometer`) |
| `theft` | derived from `report.riskProfile.factors[key=theft]` (status + flagged) |
| `liensLoans` | `report.lienRecords` |
| `auctionSales` | `report.auctions` + `auctionRecords` + `carSales` + `saleHistory` |
| `photos` | `report.photos` |
| `recalls` | `report.recalls` |
| `riskProfile` | `report.riskProfile` (tier / score / headline / summary / factors) |

**Corrects the earlier note:** VinCheck **does** provide liens (`lienRecords`),
salvage/total-loss (`junkSalvage` + `insuranceLoss`), and a theft status (scored
in `riskProfile`), so the checkout's theft/lien promises are backed by data.

### Preview vs. report shape gotchas
- The **preview** `vehicle` uses `bodyType`/`engineType`/`driveType`/`fuelType`;
  the **report** specs live at `report.specs` (same keys + `madeIn`, `cylinders`).
  `mapVehicleSpecs` reads both VinCheck and generic names.
- Preview `records_found` **omits `recalls`** and returns `null` (not `0`) for a
  category it hasn't computed pre-payment. The preview teaser only shows tiles
  for categories with a real count (never asserts "0 title records").
- Preview `images[]` is the real Copart/IAAI gallery (`preview_image_url` = hero).
- Neither preview nor report carried `estimated_market_value` in the examples →
  `marketValue` is `null` when absent (the value bar simply hides).

## Go-live checklist

1. Build + test entirely on the `vc_test_` key (responses carry `test_mode: true`).
2. Top up the VinCheck balance so live reports can generate.
3. Swap `VINCHECK_API_KEY` to the `vc_live_` key in the production secret.
4. Run one real report; confirm `charged_cents: 399` and a matching ledger entry
   in `GET /api/v1/usage`. Quote the `X-Request-Id` in any support request.
