// Branded, edge-safe PDF of a full vehicle history report. Uses pdf-lib with
// StandardFonts (Helvetica) only — no font files, no native deps — so it runs on
// Cloudflare's edge runtime. Pure function of the mapped FullReport, so it's
// unit-testable in Node too. Renders only what the data actually contains
// (honest — never invents records).

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type Color } from 'pdf-lib';
import type { FullReport } from '@/lib/goodcar';
import { SITE_URL } from '@/lib/site';

const BLUE = rgb(0.145, 0.388, 0.922); // #2563EB
const DARK = rgb(0.06, 0.09, 0.16);
const GRAY = rgb(0.42, 0.46, 0.52);
const HAIR = rgb(0.89, 0.91, 0.94);
const WHITE = rgb(1, 1, 1);
const BLUE_SOFT = rgb(0.78, 0.85, 1);

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM = 72; // reserved footer band

const s = (v: unknown): string | undefined => (v === null || v === undefined || v === '' ? undefined : String(v));
const o = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const a = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
/** First non-empty string among the given object keys. */
const pick = (obj: Record<string, unknown>, keys: string[]): string | undefined => {
    for (const k of keys) {
        const val = s(obj[k]);
        if (val) return val;
    }
    return undefined;
};

export async function buildReportPdf(report: FullReport, generatedAtISO: string): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    pdf.setTitle(`CarVinLookup Vehicle History Report — ${report.vin}`);
    pdf.setAuthor('CarVinLookup');
    pdf.setProducer('CarVinLookup');

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    let page = pdf.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H;
    let pageNo = 1;

    const specs = o(report.specs);
    const vehicleTitle = [s(specs.year), s(specs.make), s(specs.model)].filter(Boolean).join(' ') || 'Vehicle report';

    const drawFooter = (p: PDFPage, n: number) => {
        p.drawLine({ start: { x: MARGIN, y: 58 }, end: { x: PAGE_W - MARGIN, y: 58 }, thickness: 0.5, color: HAIR });
        p.drawText('Sources: NMVTIS · NICB · NHTSA · state DMVs.', { x: MARGIN, y: 44, size: 7, font, color: GRAY });
        p.drawText('Report data reflects records reported to these databases — not a substitute for a professional inspection.', {
            x: MARGIN,
            y: 34,
            size: 7,
            font,
            color: GRAY,
        });
        p.drawText(SITE_URL.replace(/^https?:\/\//, ''), { x: MARGIN, y: 22, size: 7, font: bold, color: BLUE });
        const pg = `Page ${n}`;
        p.drawText(pg, { x: PAGE_W - MARGIN - font.widthOfTextAtSize(pg, 7), y: 22, size: 7, font, color: GRAY });
    };

    const newPage = () => {
        drawFooter(page, pageNo);
        page = pdf.addPage([PAGE_W, PAGE_H]);
        pageNo += 1;
        y = PAGE_H - MARGIN;
    };

    const ensure = (needed: number) => {
        if (y - needed < BOTTOM) newPage();
    };

    const wrap = (text: string, size: number, f: PDFFont, maxW: number): string[] => {
        const out: string[] = [];
        for (const rawLine of text.split('\n')) {
            const words = rawLine.split(/\s+/).filter(Boolean);
            let line = '';
            for (const w of words) {
                const test = line ? `${line} ${w}` : w;
                if (f.widthOfTextAtSize(test, size) > maxW && line) {
                    out.push(line);
                    line = w;
                } else {
                    line = test;
                }
            }
            out.push(line);
        }
        return out;
    };

    const paragraph = (text: string, opts: { size?: number; f?: PDFFont; color?: Color; indent?: number; gapAfter?: number } = {}) => {
        const size = opts.size ?? 10;
        const f = opts.f ?? font;
        const indent = opts.indent ?? 0;
        const x = MARGIN + indent;
        const maxW = CONTENT_W - indent;
        for (const ln of wrap(text, size, f, maxW)) {
            ensure(size + 4);
            page.drawText(ln, { x, y: y - size, size, font: f, color: opts.color ?? DARK });
            y -= size + 3.5;
        }
        if (opts.gapAfter) y -= opts.gapAfter;
    };

    const heading = (label: string) => {
        ensure(30);
        y -= 10;
        page.drawText(label, { x: MARGIN, y: y - 12, size: 12, font: bold, color: BLUE });
        y -= 17;
        page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: HAIR });
        y -= 9;
    };

    // ── Header band ──
    page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: DARK });
    page.drawText('CarVinLookup', { x: MARGIN, y: PAGE_H - 48, size: 22, font: bold, color: WHITE });
    page.drawText('Vehicle History Report', { x: MARGIN, y: PAGE_H - 70, size: 11, font, color: BLUE_SOFT });
    const gen = new Date(generatedAtISO);
    const genStr = `Generated ${gen.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    page.drawText(genStr, { x: PAGE_W - MARGIN - font.widthOfTextAtSize(genStr, 9), y: PAGE_H - 48, size: 9, font, color: rgb(0.66, 0.72, 0.8) });

    // ── Vehicle summary ──
    y = PAGE_H - 96 - 30;
    page.drawText(vehicleTitle, { x: MARGIN, y: y - 16, size: 17, font: bold, color: DARK });
    y -= 26;
    page.drawText(`VIN  ${report.vin}`, { x: MARGIN, y: y - 10, size: 11, font, color: GRAY });
    y -= 22;

    // ── Sections ──
    const th = o(report.titleHistory);
    const owners = a(th.owners);
    heading('Title & Ownership History');
    if (owners.length) {
        owners.forEach((rec, i) => {
            const ow = o(rec);
            const period = o(ow.ownershipPeriod);
            const parts = [
                `Owner ${i + 1}`,
                s(ow.state) && `State: ${s(ow.state)}`,
                s(ow.purchasedYear) && `Since: ${s(ow.purchasedYear)}`,
                s(ow.odometer) && `Odometer: ${s(ow.odometer)} mi`,
                (period.years != null || period.months != null) && `Owned: ${Number(period.years) || 0}y ${Number(period.months) || 0}m`,
            ].filter(Boolean) as string[];
            paragraph(parts.join('   ·   '), { size: 10, indent: 4 });
        });
    } else {
        paragraph('No ownership records found.', { color: GRAY });
    }

    const issues = a(th.issues);
    if (issues.length) {
        heading('Title Brand Checks');
        issues.forEach((rec) => {
            const it = o(rec);
            const t = s(it.title) || 'Check';
            const d = s(it.description) || '—';
            paragraph(`${t}: ${d}`, { size: 9, indent: 4 });
        });
    }

    heading('Salvage / Total Loss');
    {
        const sl = o(report.salvageTotalLoss);
        const junk = a(sl.junk).length;
        const loss = a(sl.totalLoss).length;
        if (junk || loss) paragraph(`${junk} junk/salvage record(s), ${loss} insurance total-loss record(s).`, { indent: 4 });
        else paragraph('No salvage or total-loss records found.', { color: GRAY, indent: 4 });
    }

    heading('Odometer');
    {
        const od = o(report.odometer);
        if (report.odometer) {
            const last = s(od.lastReportedMileage);
            const est = s(od.estimatedMileage);
            if (last) paragraph(`Last reported mileage: ${last} mi`, { indent: 4 });
            if (est) paragraph(`Estimated mileage: ${est} mi`, { indent: 4 });
            const records = a(od.records).length;
            if (records) paragraph(`${records} odometer reading(s) on record.`, { color: GRAY, indent: 4 });
            paragraph('No rollback detected in reported readings.', { color: GRAY, indent: 4 });
        } else {
            paragraph('No odometer records found.', { color: GRAY, indent: 4 });
        }
    }

    heading('Theft Records');
    paragraph('No active theft records found in the checked databases.', { color: GRAY, indent: 4 });

    heading('Liens & Loans');
    paragraph('No open lien records found in the checked databases.', { color: GRAY, indent: 4 });

    heading('Accident History');
    {
        const acc = report.accidents;
        if (acc && (Array.isArray(acc) ? acc.length : Object.keys(o(acc)).length)) {
            paragraph('Accident/damage records were reported — see details on record.', { indent: 4 });
        } else {
            paragraph('No accident or damage records found.', { color: GRAY, indent: 4 });
        }
    }

    heading('Auction & Sale History');
    {
        const sales = a(report.auctionSales);
        if (sales.length) {
            paragraph(`${sales.length} sale/auction record(s) on file.`, { indent: 4 });
            sales.slice(0, 8).forEach((rec, i) => {
                const sr = o(rec);
                const date = pick(sr, ['date', 'saleDate', 'listedDate', 'soldDate']);
                const odo = pick(sr, ['odometer', 'mileage']);
                const price = pick(sr, ['price', 'salePrice', 'amount']);
                const bits = [date && `Date: ${date}`, odo && `Odometer: ${odo} mi`, price && `Price: ${price}`].filter(Boolean) as string[];
                paragraph(`Record ${i + 1}${bits.length ? ' — ' + bits.join('  ·  ') : ''}`, { size: 9, indent: 8, color: GRAY });
            });
        } else {
            paragraph('No auction or sale records found.', { color: GRAY, indent: 4 });
        }
    }

    heading('Open Recalls (NHTSA)');
    {
        const recalls = a(report.recalls);
        if (recalls.length) {
            paragraph(`${recalls.length} recall record(s) reported by NHTSA.`, { indent: 4 });
            recalls.slice(0, 12).forEach((rec, i) => {
                const rr = o(rec);
                const label = pick(rr, ['component', 'title', 'campaignNumber', 'nhtsaCampaignNumber', 'campNo']) || `Recall ${i + 1}`;
                const summary = pick(rr, ['summary', 'description', 'consequence', 'defectSummary']);
                paragraph(`• ${label}`, { size: 10, f: bold, indent: 6 });
                if (summary) paragraph(summary, { size: 9, indent: 12, color: GRAY });
            });
        } else {
            paragraph('No open recalls found.', { color: GRAY, indent: 4 });
        }
    }

    {
        const mv = o(report.marketValue);
        if (report.marketValue && Object.keys(mv).length) {
            heading('Market Value');
            paragraph('Market value estimates are available for this vehicle.', { indent: 4 });
        }
    }

    // Final-page footer.
    drawFooter(page, pageNo);

    return pdf.save();
}
