# GoodCar API Integration

Wires `business.goodcar.com` into carvinlookup.us with a **preview-before-payment** model:
the cheap **VIN Decoder** runs pre-payment (free preview); the expensive **Vehicle History /
Premium** call runs **only after a confirmed payment**, once per VIN, then cached.

## The four things you must fill / confirm

All live behind the adapter — when you confirm the real spec, **only `src/lib/goodcar.ts` changes.**

| # | What | Where | Status |
|---|------|-------|--------|
| 1 | `GOODCAR_API_BASE` | env (`.dev.vars` / Pages secret) | ✅ `https://goodcar.com` |
| 2 | `GOODCAR_API_KEY` | **Pages secret only** (never committed) | ⚠️ set it yourself; rotate the one shared in chat |
| 3 | Auth scheme | env `GOODCAR_AUTH_HEADER` / `GOODCAR_AUTH_PREFIX` | ✅ `Authorization: Bearer` |
| 4 | Endpoint paths + **response field names** | `src/lib/goodcar.ts` (`mapSpecs` / `mapReport`) | 🟡 VIN Decoder mapped from your sample; **Vehicle History response still needed** |

**Confirmed endpoints**
- VIN Decoder (cheap): `POST /business/api/vin-decoder` — body **form-encoded** `vin=...`. Response mapped in `mapSpecs()`.
- Vehicle History (paid): `POST /business/api/vin-report-comprehensive` — body **JSON** `{ "vin": "..." }`. Field mapping in `mapReport()` is **`// TODO confirm field name`** until you paste a real comprehensive response.

## Where field mappings live
`src/lib/goodcar.ts` — **the single source of truth.** Two functions, every external field marked `// TODO confirm field name`:
- `mapSpecs(content[0], vin)` → `VehicleSpecs` (year/make/model/trim/body/drivetrain/engine/transmission/country/fuel). Already mapped to your decoder sample.
- `mapReport(data, vin)` → `FullReport` (title/salvage/accidents/odometer/theft/liens/auction/photos/recalls/marketValue). **Paste a real `/vin-report-comprehensive` response and I'll finalize these.**

## Files
- `src/lib/goodcar.ts` — typed adapter: `goodcarFetch` (auth, timeout, form-vs-JSON, error normalization, logging), VIN validation, typed errors, `decodeVin` (cheap), `getFullReport` (paid).
- `src/lib/report-cache.ts` — D1-backed cache + rate-limit + entitlement (`getCachedDecode/Report`, `setCached…`, `isVinUnlocked`, `markVinUnlocked`, `allowRequest`).
- `src/app/api/preview/route.ts` — free decode; IP rate-limited; cached; **cannot call the paid endpoint**.
- `src/app/api/report/route.ts` — entitlement-gated; cached; paid call once.
- `src/app/(site)/report/[id]/page.tsx` + `src/components/report/UnlockedReport.tsx` — preview wiring + post-payment unlocked sections.
- `src/app/api/webhooks/stripe/route.ts` — sets `reports.is_unlocked` on payment.

## Cost-control guarantees
1. **Paid call is unreachable pre-payment.** `getFullReport()` is imported **only** by `/api/report`, behind the entitlement gate (402 without it). `/api/preview` does not import it (enforced by comment + omitted import).
2. **Entitlement gate.** `/api/report` requires either `reports.is_unlocked` (set by the Stripe webhook) or a valid paid Stripe `session_id` whose `metadata.reportId === vin`.
3. **Cache by VIN.** Decode → `vin_decodes` (30d). Full report → `reports.data` (TTL `REPORT_CACHE_TTL_DAYS`, default 30d). Re-views never re-bill.
4. **Rate limit.** `/api/preview` is limited to `PREVIEW_RATE_LIMIT_PER_HOUR` (default 20) per IP via D1.
5. **No secret leakage.** `GOODCAR_API_KEY` is server-only, never `NEXT_PUBLIC_`, never in a response body or the client bundle (verified by grep).
6. **Logging.** Every GoodCar call logs `{ endpoint, vin, paid, ms, outcome, remainingBalance }` (no secrets) for spend↔revenue reconciliation; `remainingBalance` surfaces credit exhaustion.

## Setup
1. Add the GoodCar block from `.dev.vars.example` to `.dev.vars` (local) and set each as a Cloudflare Pages secret in prod (`npx wrangler pages secret put GOODCAR_API_KEY`, etc.).
2. Apply the D1 migrations (adds `vin_decodes`, `rate_limits`): `npx wrangler d1 migrations apply carvinlookup-db --remote` (or execute `drizzle/0001_rainy_pretty_boy.sql`).
3. Paste a real **Vehicle History** response so `mapReport()` can be finalized.

## Notes / decisions
- **GoodCar for everything** (decode + history + photos). auto.dev is no longer used by the report flow. Because the decoder returns no photo, the **free preview shows the "No photo on record" placeholder** — the exact-VIN photo arrives with the paid report (correct cost behavior).
- **VIN not found → checkout blocked** (the preview surfaces a "couldn't find records" message and the report/CTA don't render).
- **Entitlement = Stripe session_id + unlock flag** for now; full **customer accounts (email+password + email provider)** are a **separate, deferred epic**.

## Test checklist
- [x] `/api/preview` invalid VIN → 400; never triggers a paid call (getFullReport not imported).
- [x] `/api/preview` returns 503 when GoodCar unconfigured; rate-limit returns 429 after N/hr.
- [x] `/api/report` → 402 without entitlement.
- [x] No secret in the client bundle (grep clean).
- [ ] `decodeVin` maps a real sample VIN (`1FA6P8CF5R5404003`) correctly — needs a live key.
- [ ] `/api/report` returns cached data on second call (GoodCar called exactly once) — needs a live key + D1.
- [ ] Empty/missing sections render as "No records found" — handled in `UnlockedReport`; confirm against a real response.
