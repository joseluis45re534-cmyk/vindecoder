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

function mapVehicleSpecs(vehicle: AnyObj, vin: string, previewImage?: string): VehicleSpecs {
  return {
    vin,
    year: str(vehicle.year),
    make: str(vehicle.make),
    model: str(vehicle.model),
    trim: str(vehicle.trim),
    engine: str(vehicle.engine),
    country: str(vehicle.assembled_in),
    photoUrl: previewImage,
    raw: vehicle,
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
  const specs = mapVehicleSpecs(obj(p.vehicle), vin, str(p.preview_image_url));
  return {
    ...specs,
    recordsFound: mapRecordsFound(obj(p.records_found)),
    marketValue: mapMarketValue(obj(p.estimated_market_value)),
    testMode: p.test_mode === true,
  };
}

// Maps VinCheck's report object → our FullReport. VinCheck surfaces record
// COUNTS reliably (records_found) plus, in live mode, detailed per-section data
// under the section keys listed in report.sections. We map the detailed data
// when present and fall back to a `{ count }` summary so a section still renders
// as "present". Theft and liens are NOT provided by VinCheck (→ null, same as
// the prior GoodCar provider).
function mapReport(top: AnyObj, vin: string): FullReport {
  const r = obj(top.report);
  const rf = mapRecordsFound(obj(r.records_found));
  const specs = mapVehicleSpecs(obj(r.vehicle), vin);
  const marketValue = mapMarketValue(obj(r.estimated_market_value));
  const photosArr = arr(r.photos ?? r.auction_photos_list);

  // Detailed section if the live payload carries it, else a count summary.
  const section = (detail: unknown, count: number): unknown =>
    detail != null && (Array.isArray(detail) ? detail.length : Object.keys(obj(detail)).length)
      ? detail
      : count > 0
        ? { count }
        : null;

  const titleHistory = section(r.title, rf.titleRecords);
  const accidents = section(r.accidents, rf.accidentOrDamage);
  const odometer = section(r.odometer, rf.odometerReadings);
  const auctionSales = section(r.auction_photos ?? r.auctions, rf.auctionRecords);
  const recalls = section(r.recalls, rf.recalls);
  const photos = photosArr.length ? photosArr : rf.photos > 0 ? { count: rf.photos } : null;

  const sections = {
    titleHistory,
    salvageTotalLoss: null, // VinCheck folds salvage/total-loss into title/accidents
    accidents,
    odometer,
    theft: null, //      not provided by VinCheck
    liensLoans: null, // not provided by VinCheck
    auctionSales,
    photos,
    recalls,
    marketValue,
  };
  const present = Object.values(sections).filter((v) => v != null).length;
  const firstPhoto = photosArr.map(str).find(Boolean);

  return {
    vin,
    specs,
    ...sections,
    photoUrl: firstPhoto,
    sectionCount: present,
    dataPointCount:
      rf.titleRecords + rf.accidentOrDamage + rf.odometerReadings + rf.auctionRecords + rf.recalls + rf.photos,
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
