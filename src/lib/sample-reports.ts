// Curated SAMPLE vehicle history reports — the single source of truth for both
// the homepage "See what a report catches" cards and the indexable /report/[id]
// sample pages. These 4 VINs are fictional (not decodable via the live GoodCar
// API — see report/[id]/page.tsx), so their content is fully static/curated
// rather than fetched. Every field here is illustrative example data, clearly
// labeled "Sample report" wherever it's rendered — never presented as a real
// individual vehicle's history.

export interface SampleReport {
  vin: string;
  year: number;
  make: string;
  model: string;
  title: string; // "2021 Toyota Camry"
  bodyType: string;
  engine: string;
  drivetrain: string;
  transmission: string;
  country: string;
  img: string;
  alt: string;
  statusLabel: string; // homepage badge text, e.g. "Clean history"
  badgeClass: string; // Tailwind bg color for the badge
  finding: string; // one-line summary shown on the homepage card
  sections: {
    titleBrand: string;
    accidents: string;
    odometer: string;
    theft: string;
    liens: string;
    auction: string;
    recalls: string;
    owners: string;
  };
}

export const SAMPLE_REPORTS: SampleReport[] = [
  {
    vin: '4T1G11AK5MU546321',
    year: 2021,
    make: 'Toyota',
    model: 'Camry',
    title: '2021 Toyota Camry',
    bodyType: 'Sedan',
    engine: '2.5L I4',
    drivetrain: 'FWD',
    transmission: 'Automatic',
    country: 'USA',
    img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=60',
    alt: 'White Toyota sedan parked outdoors',
    statusLabel: 'Clean history',
    badgeClass: 'bg-emerald-600',
    finding: 'No brands, liens, or theft records found. Verified odometer.',
    sections: {
      titleBrand: 'Clean — no brands recorded',
      accidents: 'No accidents reported',
      odometer: '62,340 mi — no rollback detected',
      theft: 'No theft records found',
      liens: 'None found',
      auction: '1 sale record (dealer auction, 2023)',
      recalls: 'No open recalls',
      owners: '2 previous owners',
    },
  },
  {
    vin: 'JF1VA2M62K980015S',
    year: 2019,
    make: 'Subaru',
    model: 'WRX',
    title: '2019 Subaru WRX',
    bodyType: 'Sedan',
    engine: '2.0L Turbo H4',
    drivetrain: 'AWD',
    transmission: 'Manual',
    country: 'USA',
    img: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=60',
    alt: 'Blue Subaru sports sedan on a road',
    statusLabel: 'Theft record',
    badgeClass: 'bg-red-600',
    finding: 'Active theft record reported to the NICB. Walk away or verify recovery.',
    sections: {
      titleBrand: 'Clean — no brands recorded',
      accidents: 'No accidents reported',
      odometer: '41,120 mi — no rollback detected',
      theft: 'Active theft record reported to the NICB (2022)',
      liens: 'None found',
      auction: 'No auction records',
      recalls: 'No open recalls',
      owners: '1 previous owner',
    },
  },
  {
    vin: '1G1ZE5ST5FF21984W',
    year: 2015,
    make: 'Chevrolet',
    model: 'Malibu',
    title: '2015 Chevrolet Malibu',
    bodyType: 'Sedan',
    engine: '2.5L I4',
    drivetrain: 'FWD',
    transmission: 'Automatic',
    country: 'USA',
    img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=60',
    alt: 'Red Chevrolet coupe in a studio',
    statusLabel: 'Salvage title',
    badgeClass: 'bg-amber-600',
    finding: 'Branded salvage after an insurance total loss. Expect heavy repairs.',
    sections: {
      titleBrand: 'Salvage — insurance total loss',
      accidents: '1 severe accident reported (front-end collision)',
      odometer: '78,450 mi — no rollback detected',
      theft: 'No theft records found',
      liens: 'None found',
      auction: '1 salvage-auction sale record',
      recalls: 'No open recalls',
      owners: '3 previous owners',
    },
  },
  {
    vin: '1FTFW1ED5PFA1234F',
    year: 2023,
    make: 'Ford',
    model: 'F-150',
    title: '2023 Ford F-150',
    bodyType: 'Pickup',
    engine: '3.5L V6',
    drivetrain: '4WD',
    transmission: 'Automatic',
    country: 'USA',
    img: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=60',
    alt: 'Black Ford pickup truck on a desert road',
    statusLabel: 'Active lien',
    badgeClass: 'bg-violet-600',
    finding: 'A lender still holds a lien — the seller cannot transfer a clean title yet.',
    sections: {
      titleBrand: 'Clean — no brands recorded',
      accidents: 'No accidents reported',
      odometer: '18,760 mi — no rollback detected',
      theft: 'No theft records found',
      liens: 'Active lien — lender has not released the title',
      auction: 'No auction records',
      recalls: '1 open recall (fuel pump)',
      owners: '1 previous owner',
    },
  },
];

const BY_VIN = new Map(SAMPLE_REPORTS.map((r) => [r.vin, r]));

export function getSampleReport(vin: string): SampleReport | undefined {
  return BY_VIN.get(vin.toUpperCase());
}

export function isSampleVin(vin: string): boolean {
  return BY_VIN.has(vin.toUpperCase());
}
