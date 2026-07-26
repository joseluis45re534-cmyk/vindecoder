// GoodCar B2B API adapter — the SINGLE source of truth for the integration.
// When the real response spec is confirmed, only the map*() functions and the
// endpoint paths below change; nothing outside this file should need edits.
//
// Cost-control invariant: decodeVin() is CHEAP and safe pre-payment. getFullReport()
// is PAID and must only be reached through /api/report behind the entitlement gate.

import { getEnv } from '@/lib/cf';
import type { Env } from '@/db';

// ---------- Public types ----------

export interface VehicleSpecs {
  vin: string;
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  bodyStyle?: string;
  drivetrain?: string;
  engine?: string;
  transmission?: string;
  country?: string;
  fuelType?: string;
  /** Real photo of THIS exact vehicle (auto.dev retail CDN), when one exists. */
  photoUrl?: string;
  /** Real gallery photos (VinCheck preview `images[]` — Copart/IAAI auction shots). */
  images?: string[];
  /** GoodCar per-make logo — branded fallback when no real photo exists. */
  brandImageUrl?: string;
  raw?: unknown;
}

export interface FullReport {
  vin: string;
  specs: VehicleSpecs;
  titleHistory?: unknown;
  salvageTotalLoss?: unknown;
  accidents?: unknown;
  odometer?: unknown;
  theft?: unknown;
  liensLoans?: unknown;
  auctionSales?: unknown;
  photos?: unknown;
  recalls?: unknown;
  marketValue?: unknown;
  /** VinCheck-only rich sections (optional; absent from the GoodCar provider). */
  titleBrands?: unknown; //   confirmed NMVTIS/state title brands (salvage, junk, …)
  nmvtis?: unknown; //        raw NMVTIS brand + title-history record
  riskProfile?: unknown; //   scored risk assessment (tier/score/factors/summary)
  sectionCount: number;
  dataPointCount: number;
  /** content.main.mainCarImage — the paid report's vehicle photo, when present. */
  photoUrl?: string;
  /** GoodCar per-make logo (section_mfr.manufacturer.carBrandImg) — branded fallback. */
  brandImageUrl?: string;
  raw?: unknown;
}

// ---------- Typed errors ----------

export class GoodCarValidationError extends Error { constructor(m = 'Invalid VIN') { super(m); this.name = 'GoodCarValidationError'; } }
export class GoodCarAuthError extends Error { constructor(m = 'GoodCar auth/credit failure') { super(m); this.name = 'GoodCarAuthError'; } }
export class GoodCarNotFoundError extends Error { constructor(m = 'No records for VIN') { super(m); this.name = 'GoodCarNotFoundError'; } }
export class GoodCarRateLimitError extends Error { constructor(m = 'GoodCar rate limited') { super(m); this.name = 'GoodCarRateLimitError'; } }
export class GoodCarTimeoutError extends Error { constructor(m = 'GoodCar timed out') { super(m); this.name = 'GoodCarTimeoutError'; } }
export class GoodCarUnknownError extends Error { constructor(m = 'GoodCar error') { super(m); this.name = 'GoodCarUnknownError'; } }

// ---------- VIN validation ----------

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/; // 17 chars, no I/O/Q

export function normalizeVin(vin: string): string {
  return (vin || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
export function isValidVin(vin: string): boolean {
  return VIN_RE.test(normalizeVin(vin));
}

// GoodCar serves a per-make logo at a predictable CDN path (confirmed across
// makes). We use it as a BRANDED FALLBACK image when no real photo of the exact
// vehicle exists — it's GoodCar's own asset, shown as a make emblem, never as a
// stand-in photo of the car.
export function goodcarBrandImageUrl(make?: string): string | undefined {
  const slug = (make || '').trim().toLowerCase().replace(/\s+/g, '-');
  return slug ? `https://goodcar.com/packages/premvin/img/cars/${slug}.png` : undefined;
}

// ---------- Low-level fetch ----------

interface FetchArgs {
  path: string;
  form?: Record<string, string>; // x-www-form-urlencoded (VIN Decoder uses this)
  json?: unknown; // application/json (comprehensive report uses this)
  timeoutMs?: number; // override (the comprehensive report is heavy)
}

function logCall(o: { endpoint: string; vin: string; paid: boolean; ms: number; outcome: string; balance?: unknown }) {
  // Structured, secret-free log for spend↔revenue reconciliation.
  console.log('[goodcar]', JSON.stringify({ ...o, ts: new Date().toISOString() }));
}

async function goodcarFetch(env: Partial<Env>, args: FetchArgs): Promise<unknown> {
  if (!env.GOODCAR_API_BASE || !env.GOODCAR_API_KEY) {
    throw new GoodCarAuthError('GOODCAR_API_BASE / GOODCAR_API_KEY not configured');
  }
  const headerName = env.GOODCAR_AUTH_HEADER || 'Authorization';
  const prefix = env.GOODCAR_AUTH_PREFIX ?? 'Bearer';
  const authValue = prefix ? `${prefix} ${env.GOODCAR_API_KEY}` : env.GOODCAR_API_KEY;
  const timeoutMs = args.timeoutMs || Number(env.GOODCAR_TIMEOUT_MS) || 10000;

  const headers: Record<string, string> = { [headerName]: authValue, Accept: 'application/json' };
  let body: BodyInit | undefined;
  if (args.form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(args.form).toString();
  } else if (args.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(args.json);
  }

  const url = `${env.GOODCAR_API_BASE.replace(/\/$/, '')}${args.path}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'POST', headers, body, signal: ctrl.signal });
    if (res.status === 401 || res.status === 403) throw new GoodCarAuthError(`GoodCar ${res.status}`);
    // 400 = bad VIN, 404/422 = no data for this VIN ("no-hit no fee") → treat as not-found.
    if (res.status === 404 || res.status === 422 || res.status === 400) throw new GoodCarNotFoundError();
    if (res.status === 429) throw new GoodCarRateLimitError();
    if (!res.ok) throw new GoodCarUnknownError(`GoodCar ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw new GoodCarTimeoutError();
    if (err instanceof GoodCarAuthError || err instanceof GoodCarNotFoundError || err instanceof GoodCarRateLimitError) throw err;
    throw new GoodCarUnknownError(err instanceof Error ? err.message : String(err));
  } finally {
    clearTimeout(t);
  }
}

// ---------- Field mapping (the only place GoodCar field names live) ----------

function str(v: unknown): string | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  return String(v);
}

// Maps a GoodCar VIN Decoder `content[0]` object → our VehicleSpecs.
function mapSpecs(c: Record<string, unknown>, vin: string): VehicleSpecs {
  return {
    vin,
    year: str(c.model_year), //        TODO confirm field name
    make: str(c.make), //              TODO confirm field name
    model: str(c.model), //            TODO confirm field name
    trim: str(c.series), //            TODO confirm field name (series vs style)
    bodyStyle: str(c.style), //        TODO confirm field name
    drivetrain: str(c.drivetrain), //  TODO confirm field name
    engine: str(c.engine_description), // TODO confirm field name
    transmission: str(c.transmission), // TODO confirm field name
    country: str(c.country), //        TODO confirm field name
    fuelType: str(c.fuel_type), //     TODO confirm field name
    raw: c,
  };
}

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as AnyObj) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
// GoodCar marks empty sections with isNoHit: "true" (string) or true.
const noHit = (s: unknown): boolean => {
  const o = obj(s);
  return o.isNoHit === true || o.isNoHit === 'true';
};

// Maps GoodCar's comprehensive Vehicle History response → our FullReport.
// Field paths confirmed against GoodCar's documented `content.section_*` schema.
// GoodCar has no theft or lien section, so those stay null (→ "No records found").
function mapReport(data: AnyObj, vin: string): FullReport {
  const c = obj(data.content);
  const main = obj(c.main);
  const vd = obj(main.vehicleDataRaw);

  const specs: VehicleSpecs = {
    vin,
    year: str(vd.year),
    make: str(vd.make),
    model: str(vd.model),
    raw: main,
  };

  const owners = arr(obj(c.section_title).ownerships);
  const titleIssues = arr(obj(c.section_title_issues).problemCheckRows);
  const junk = arr(obj(c.section_junk).junkAndSalvageRecords);
  const loss = arr(obj(c.section_loss).insurersRecords);
  const sales = arr(obj(c.section_sales).salesHistoryRecords);
  const recallRecords = arr(obj(c.section_recalls).recallRecords);
  const mileage = obj(c.section_mileage);
  const photo = str(main.mainCarImage);
  // GoodCar's make logo (real API asset) → branded fallback when there's no photo.
  const mfr = obj(obj(c.section_mfr).manufacturer);
  const brandImageUrl = str(mfr.carBrandImg) || goodcarBrandImageUrl(str(vd.make));

  const titleHistory = owners.length || titleIssues.length ? { owners, issues: titleIssues } : null;
  const salvageTotalLoss = junk.length || loss.length ? { junk, totalLoss: loss } : null;
  const accidents = noHit(c.section_accidents) ? null : (c.section_accidents ?? null);
  const odometer =
    !noHit(mileage) && (str(mileage.lastReportedMileage) || str(mileage.estimatedMileage))
      ? { lastReportedMileage: str(mileage.lastReportedMileage), estimatedMileage: str(mileage.estimatedMileage), records: arr(mileage.mileageRecordsStates) }
      : null;
  const auctionSales = sales.length ? sales : null;
  const recalls = recallRecords.length ? recallRecords : null;
  const marketValue = !noHit(c.section_market_values) && Object.keys(obj(c.section_market_values)).length ? c.section_market_values : null;

  const sections = {
    titleHistory,
    salvageTotalLoss,
    accidents,
    odometer,
    theft: null, //      GoodCar comprehensive has no theft section
    liensLoans: null, // GoodCar comprehensive has no lien section
    auctionSales,
    photos: photo ? [photo] : null,
    recalls,
    marketValue,
  };
  const present = Object.values(sections).filter((v) => v != null).length;

  return {
    vin,
    specs,
    ...sections,
    photoUrl: photo,
    brandImageUrl,
    sectionCount: present,
    dataPointCount: 40,
    raw: data,
  };
}

// ---------- Public API ----------

/** CHEAP — safe to call pre-payment. Retries once on timeout/5xx (decode path only). */
export async function decodeVin(vin: string): Promise<VehicleSpecs> {
  const clean = normalizeVin(vin);
  if (!isValidVin(clean)) throw new GoodCarValidationError();
  const env = await getEnv();

  const attempt = async (): Promise<VehicleSpecs> => {
    const started = Date.now();
    try {
      const data = (await goodcarFetch(env, { path: '/business/api/vin-decoder', form: { vin: clean } })) as {
        content?: Record<string, unknown>[];
        remainingBalance?: unknown;
      };
      const c = data.content?.[0];
      if (!c) throw new GoodCarNotFoundError();
      logCall({ endpoint: 'vin-decoder', vin: clean, paid: false, ms: Date.now() - started, outcome: 'ok', balance: data.remainingBalance });
      return mapSpecs(c, clean);
    } catch (err) {
      logCall({ endpoint: 'vin-decoder', vin: clean, paid: false, ms: Date.now() - started, outcome: (err as Error).name || 'error' });
      throw err;
    }
  };

  try {
    return await attempt();
  } catch (err) {
    // Retry once on transient failures only — never on validation/not-found/auth.
    if (err instanceof GoodCarTimeoutError || err instanceof GoodCarUnknownError) {
      await new Promise((r) => setTimeout(r, 400));
      return attempt();
    }
    throw err;
  }
}

/** PAID — only call after payment is confirmed (gated in /api/report). Never retried (no double-bill). */
export async function getFullReport(vin: string): Promise<FullReport> {
  const clean = normalizeVin(vin);
  if (!isValidVin(clean)) throw new GoodCarValidationError();
  const env = await getEnv();

  const started = Date.now();
  try {
    // NOTE: despite GoodCar's docs showing a JSON body, this endpoint actually
    // requires form-encoding (JSON → 400 "Missing required fields!"), same as the
    // decoder. Heavy report → longer timeout than the decode.
    const data = (await goodcarFetch(env, { path: '/business/api/vin-report-comprehensive', form: { vin: clean }, timeoutMs: 25000 })) as Record<string, unknown>;
    logCall({ endpoint: 'vin-report-comprehensive', vin: clean, paid: true, ms: Date.now() - started, outcome: 'ok', balance: (data as { remainingBalance?: unknown }).remainingBalance });
    return mapReport(data, clean);
  } catch (err) {
    logCall({ endpoint: 'vin-report-comprehensive', vin: clean, paid: true, ms: Date.now() - started, outcome: (err as Error).name || 'error' });
    throw err;
  }
}
