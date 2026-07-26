// VinCheck Partner API v1 adapter — the SINGLE source of truth for the
// integration. Mirrors the goodcar.ts public shape (VehicleSpecs / FullReport /
// decodeVin / getFullReport) so /api/preview and /api/report swap providers by
// changing an import, nothing else.
//
// Docs: https://vincheck.it.com/api/v1  ·  Auth: Authorization: Bearer <key>
//
// Cost-control invariant: previewVin()/decodeVin() is FREE and safe pre-payment.
// getFullReport() is PAID (charged on success) and must only be reached through
// /api/report behind the entitlement gate. Keys are server-side secrets — this
// module runs only in edge route handlers, never in the browser.

import { getEnv } from '@/lib/cf';
import type { Env } from '@/db';
import type { VehicleSpecs, FullReport } from '@/lib/goodcar';

// Re-export the shared types so route code can import them from one place.
export type { VehicleSpecs, FullReport } from '@/lib/goodcar';

const DEFAULT_BASE = 'https://vincheck.it.com/api/v1';

// ---------- VIN validation (17 chars, no I/O/Q) ----------

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;
export function normalizeVin(vin: string): string {
  return (vin || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
export function isValidVin(vin: string): boolean {
  return VIN_RE.test(normalizeVin(vin));
}

// ---------- Typed errors (mapped from VinCheck's error envelope) ----------

export class VinCheckValidationError extends Error { constructor(m = 'Invalid VIN') { super(m); this.name = 'VinCheckValidationError'; } }
export class VinCheckAuthError extends Error { constructor(m = 'VinCheck auth failure') { super(m); this.name = 'VinCheckAuthError'; } }
/** 402 — our prepaid balance with VinCheck is exhausted. The CUSTOMER already
 *  paid us, so callers must NOT drop entitlement; keep it and alert the operator. */
export class VinCheckInsufficientBalanceError extends Error { constructor(m = 'VinCheck balance exhausted') { super(m); this.name = 'VinCheckInsufficientBalanceError'; } }
/** 409 — same Idempotency-Key still processing; retry shortly. */
export class VinCheckInProgressError extends Error { constructor(m = 'Report still generating') { super(m); this.name = 'VinCheckInProgressError'; } }
export class VinCheckRateLimitError extends Error {
  retryAfterMs?: number;
  constructor(m = 'VinCheck rate limited', retryAfterMs?: number) { super(m); this.name = 'VinCheckRateLimitError'; this.retryAfterMs = retryAfterMs; }
}
/** 502 — provider_unavailable / generation_failed. NOT charged; safe to retry
 *  with the same Idempotency-Key. */
export class VinCheckProviderError extends Error { constructor(m = 'VinCheck provider unavailable') { super(m); this.name = 'VinCheckProviderError'; } }
export class VinCheckNotFoundError extends Error { constructor(m = 'No records for VIN') { super(m); this.name = 'VinCheckNotFoundError'; } }
export class VinCheckTimeoutError extends Error { constructor(m = 'VinCheck timed out') { super(m); this.name = 'VinCheckTimeoutError'; } }
export class VinCheckUnknownError extends Error { constructor(m = 'VinCheck error') { super(m); this.name = 'VinCheckUnknownError'; } }

// ---------- Small helpers ----------

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as AnyObj) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
function str(v: unknown): string | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  return String(v);
}
function num(v: unknown): number | undefined {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function logCall(o: { endpoint: string; vin?: string; paid: boolean; ms: number; outcome: string; requestId?: string; charged?: unknown; balance?: unknown }) {
  // Structured, secret-free log for spend↔revenue reconciliation + support.
  console.log('[vincheck]', JSON.stringify({ ...o, ts: new Date().toISOString() }));
}

// ---------- Low-level fetch (auth + error-envelope mapping) ----------

interface FetchArgs {
  method: 'GET' | 'POST';
  path: string;
  json?: unknown;
  idempotencyKey?: string;
  timeoutMs?: number;
}

async function vincheckFetch(env: Partial<Env>, args: FetchArgs): Promise<{ data: unknown; requestId?: string }> {
  const key = env.VINCHECK_API_KEY;
  if (!key) throw new VinCheckAuthError('VINCHECK_API_KEY not configured');
  const base = (env.VINCHECK_API_BASE || DEFAULT_BASE).replace(/\/$/, '');
  const timeoutMs = args.timeoutMs || Number(env.VINCHECK_TIMEOUT_MS) || 15000;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
  };
  let body: BodyInit | undefined;
  if (args.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(args.json);
  }
  if (args.idempotencyKey) headers['Idempotency-Key'] = args.idempotencyKey;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}${args.path}`, { method: args.method, headers, body, signal: ctrl.signal });
    const requestId = res.headers.get('x-request-id') || undefined;
    // Parse the JSON body (both success and the {error:{code,message}} envelope).
    let parsed: unknown = null;
    try { parsed = await res.json(); } catch { /* non-JSON body */ }

    if (res.ok) return { data: parsed, requestId };

    const code = str(obj(obj(parsed).error).code) || '';
    const message = str(obj(obj(parsed).error).message) || `VinCheck ${res.status}`;
    switch (res.status) {
      case 400: throw new VinCheckValidationError(message);
      case 401:
      case 403: throw new VinCheckAuthError(message);
      case 402: throw new VinCheckInsufficientBalanceError(message);
      case 404: throw new VinCheckNotFoundError(message);
      case 409: throw new VinCheckInProgressError(message);
      case 429: {
        const ra = Number(res.headers.get('retry-after'));
        throw new VinCheckRateLimitError(message, Number.isFinite(ra) ? ra * 1000 : undefined);
      }
      case 502: throw new VinCheckProviderError(message);
      default:
        // A no-hit VIN may also surface as invalid_vin/not-found codes on a 400.
        if (code === 'invalid_vin') throw new VinCheckValidationError(message);
        throw new VinCheckUnknownError(`${message} [${res.status}${requestId ? ' ' + requestId : ''}]`);
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw new VinCheckTimeoutError();
    throw err;
  } finally {
    clearTimeout(t);
  }
}

// ---------- Mapping (the only place VinCheck field names live) ----------

/** VinCheck record counts shown as the paywall teaser. */
export interface RecordsFound {
  titleRecords: number;
  accidentOrDamage: number;
  odometerReadings: number;
  auctionRecords: number;
  recalls: number;
  photos: number;
}

// The preview's `records_found` counts. VinCheck returns `null` for a category
// it has no data on (→ 0), and OMITS `recalls` entirely (recall counts only
// appear in the paid report), so recalls defaults to 0 in the preview teaser.
function mapRecordsFound(rf: AnyObj): RecordsFound {
  return {
    titleRecords: num(rf.title_records) ?? 0,
    accidentOrDamage: num(rf.accident_or_damage) ?? 0,
    odometerReadings: num(rf.odometer_readings) ?? 0,
    auctionRecords: num(rf.auction_records) ?? 0,
    recalls: num(rf.recalls) ?? 0,
    photos: num(rf.photos) ?? 0,
  };
}

// Maps VinCheck's vehicle block → VehicleSpecs. The preview uses `vehicle`
// {year,make,model,trim,bodyType,engineType,driveType,fuelType}; the paid report
// uses `report.specs`/`report.decoder` (same keys + madeIn/cylinders/…). We read
// both the VinCheck names (bodyType/engineType/driveType/madeIn/fuelType) and the
// generic ones (bodyStyle/engine/drivetrain/country) so either payload maps.
function mapVehicleSpecs(v: AnyObj, vin: string, opts?: { photoUrl?: string; images?: string[] }): VehicleSpecs {
  const engineType = str(v.engineType) || str(v.engine) || str(v.engine_description);
  const displacement = str(v.displacement);
  const cylinders = str(v.cylinders);
  // Prefer the descriptive engineType ("V-Shaped 6cyl 3.5L"); else compose from parts.
  const engine =
    engineType || [cylinders && `${cylinders}-cyl`, displacement && `${displacement}L`].filter(Boolean).join(' ') || undefined;
  const images = opts?.images && opts.images.length ? opts.images : undefined;
  return {
    vin,
    year: str(v.year),
    make: str(v.make),
    model: str(v.model),
    trim: str(v.trim),
    bodyStyle: str(v.bodyType) || str(v.bodyStyle) || str(v.style),
    drivetrain: str(v.driveType) || str(v.drivetrain),
    engine,
    transmission: str(v.transmission),
    country: str(v.madeIn) || str(v.assembled_in) || str(v.country),
    fuelType: str(v.fuelType) || str(v.fuel_type),
    photoUrl: opts?.photoUrl || images?.[0],
    images,
    raw: v,
  };
}

function mapMarketValue(mv: AnyObj): AnyObj | null {
  if (!mv || !Object.keys(mv).length) return null;
  return {
    average: num(mv.average),
    low: num(mv.range_low),
    high: num(mv.range_high),
    currency: str(mv.currency) || 'USD',
    raw: mv,
  };
}

export interface PreviewResult extends VehicleSpecs {
  recordsFound: RecordsFound;
  marketValue: AnyObj | null;
  testMode: boolean;
}

function mapPreview(p: AnyObj, vin: string): PreviewResult {
  // `images[]` is the real Copart/IAAI gallery; `preview_image_url` is its hero
  // (may be null when the VIN has no auction history → empty gallery).
  const images = arr(p.images).map(str).filter((u): u is string => !!u);
  const hero = str(p.preview_image_url) || images[0];
  const specs = mapVehicleSpecs(obj(p.vehicle), vin, { photoUrl: hero, images });
  return {
    ...specs,
    recordsFound: mapRecordsFound(obj(p.records_found)),
    marketValue: mapMarketValue(obj(p.estimated_market_value)),
    testMode: p.test_mode === true,
  };
}

// Maps VinCheck's paid-report payload → our FullReport. The real shape (see the
// partner examples) nests everything under `report`, with camelCase section
// keys. Specs live at report.specs (NOT report.vehicle). Every section is an
// ARRAY of record objects (empty [] when none). VinCheck DOES provide liens
// (lienRecords) and salvage/total-loss (junkSalvage + insuranceLoss); theft has
// no standalone array but is scored in riskProfile.factors[key=theft]. There is
// no records_found or estimated_market_value inside the report — counts are
// derived from array lengths.
const arrStr = (v: unknown): string[] => arr(v).map(str).filter((u): u is string => !!u);

function mapReport(top: AnyObj, vin: string): FullReport {
  const r = obj(top.report);

  // Specs: report.specs (full) → report.decoder → top-level vehicle (basic).
  const specsSrc = Object.keys(obj(r.specs)).length
    ? obj(r.specs)
    : Object.keys(obj(r.decoder)).length
      ? obj(r.decoder)
      : obj(top.vehicle);
  const photos = arrStr(r.photos);
  const specs = mapVehicleSpecs(specsSrc, vin, { images: photos });

  // Title: confirmed brands + issues + the ownership/title timeline + raw NMVTIS.
  const titleBrands = arr(r.titleBrands);
  const titleIssues = arr(r.titleIssues);
  const titleTimeline = arr(r.titleHistory);
  const nmvtis = Object.keys(obj(r.nmvtis)).length ? obj(r.nmvtis) : null;
  const titleHistory =
    titleBrands.length || titleIssues.length || titleTimeline.length || nmvtis
      ? { brands: titleBrands, issues: titleIssues, history: titleTimeline, nmvtis }
      : null;

  // Salvage / total-loss: NMVTIS junk/salvage records + insurer total-loss records.
  const salvage = [...arr(r.junkSalvage), ...arr(r.insuranceLoss)];
  const accidents = arr(r.accidents);
  const odometer = arr(r.odometerHistory).length ? arr(r.odometerHistory) : arr(r.odometer);
  const liens = arr(r.lienRecords);
  // Auction + private sale history (several possible keys, all arrays).
  const auctions = [...arr(r.auctions), ...arr(r.auctionRecords), ...arr(r.carSales), ...arr(r.saleHistory)];
  const recalls = arr(r.recalls);

  const riskProfile = Object.keys(obj(r.riskProfile)).length ? obj(r.riskProfile) : null;
  // Theft: surface the risk engine's theft factor as an honest status object.
  const theftFactor = arr(obj(r.riskProfile).factors).find((f) => obj(f).key === 'theft');
  const theft = theftFactor
    ? { status: str(obj(theftFactor).detail) || 'Checked', flagged: obj(theftFactor).bad === true }
    : null;

  const nz = (a: unknown[]): unknown[] | null => (a.length ? a : null);

  const sections = {
    titleHistory,
    salvageTotalLoss: nz(salvage),
    accidents: nz(accidents),
    odometer: nz(odometer),
    theft,
    liensLoans: nz(liens),
    auctionSales: nz(auctions),
    photos: photos.length ? photos : null,
    recalls: nz(recalls),
    marketValue: mapMarketValue(obj(r.estimated_market_value)), // null when absent
    titleBrands: nz(titleBrands),
    nmvtis,
    riskProfile,
  };

  // "Present" = sections with substantive records (theft's no-record status and a
  // null marketValue don't inflate the count).
  const substantive = [
    titleHistory, sections.salvageTotalLoss, sections.accidents, sections.odometer,
    sections.liensLoans, sections.auctionSales, sections.photos, sections.recalls,
  ].filter((v) => v != null).length;

  const dataPointCount =
    titleBrands.length + titleIssues.length + titleTimeline.length + salvage.length +
    accidents.length + odometer.length + liens.length + auctions.length + recalls.length + photos.length;

  return {
    vin,
    specs,
    ...sections,
    photoUrl: photos[0],
    sectionCount: substantive,
    dataPointCount,
    raw: top,
  };
}

// ---------- Public API ----------

/** FREE preview — safe to call pre-payment. Retries once on transient failure. */
export async function previewVin(vin: string): Promise<PreviewResult> {
  const clean = normalizeVin(vin);
  if (!isValidVin(clean)) throw new VinCheckValidationError();
  const env = await getEnv();

  const attempt = async (): Promise<PreviewResult> => {
    const started = Date.now();
    try {
      const { data, requestId } = await vincheckFetch(env, { method: 'GET', path: `/vins/${clean}/preview` });
      logCall({ endpoint: 'preview', vin: clean, paid: false, ms: Date.now() - started, outcome: 'ok', requestId });
      return mapPreview(obj(data), clean);
    } catch (err) {
      logCall({ endpoint: 'preview', vin: clean, paid: false, ms: Date.now() - started, outcome: (err as Error).name || 'error' });
      throw err;
    }
  };

  try {
    return await attempt();
  } catch (err) {
    if (err instanceof VinCheckTimeoutError || err instanceof VinCheckProviderError || err instanceof VinCheckUnknownError) {
      await new Promise((r) => setTimeout(r, 400));
      return attempt();
    }
    throw err;
  }
}

/** Alias so /api/preview can keep calling decodeVin() unchanged. Returns the
 *  full PreviewResult (a superset of VehicleSpecs). */
export const decodeVin = previewVin;

/** PAID — only call after payment is confirmed (gated in /api/report). Charged
 *  on success only; the Idempotency-Key (the VIN) makes retries safe — same key
 *  always returns the same report, never a second charge. */
export async function getFullReport(vin: string, idempotencyKey?: string): Promise<FullReport> {
  const clean = normalizeVin(vin);
  if (!isValidVin(clean)) throw new VinCheckValidationError();
  const env = await getEnv();

  const started = Date.now();
  try {
    const { data, requestId } = await vincheckFetch(env, {
      method: 'POST',
      path: '/reports',
      json: { vin: clean },
      idempotencyKey: idempotencyKey || `report:${clean}`,
      timeoutMs: Number(env.VINCHECK_TIMEOUT_MS) || 30000,
    });
    const top = obj(data);
    logCall({ endpoint: 'reports', vin: clean, paid: true, ms: Date.now() - started, outcome: 'ok', requestId, charged: top.charged_cents, balance: top.balance_cents });
    return mapReport(top, clean);
  } catch (err) {
    logCall({ endpoint: 'reports', vin: clean, paid: true, ms: Date.now() - started, outcome: (err as Error).name || 'error' });
    throw err;
  }
}

// ---------- Monitoring (optional; for admin/ops) ----------

export interface AccountSnapshot {
  partner?: string;
  status?: string;
  mode?: string;
  balanceCents?: number;
  pricePerReportCents?: number;
  raw: unknown;
}

export async function getAccount(env?: Partial<Env>): Promise<AccountSnapshot> {
  const e = env || (await getEnv());
  const { data } = await vincheckFetch(e, { method: 'GET', path: '/account', timeoutMs: 10000 });
  const d = obj(data);
  return {
    partner: str(d.partner),
    status: str(d.status),
    mode: str(d.mode),
    balanceCents: num(d.balance_cents),
    pricePerReportCents: num(d.price_per_report_cents),
    raw: data,
  };
}

export async function ping(env?: Partial<Env>): Promise<{ ok: boolean; mode?: string; raw: unknown }> {
  const e = env || (await getEnv());
  const { data } = await vincheckFetch(e, { method: 'GET', path: '/ping', timeoutMs: 8000 });
  const d = obj(data);
  return { ok: d.ok === true, mode: str(d.mode), raw: data };
}
