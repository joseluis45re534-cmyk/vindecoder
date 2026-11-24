// Authority sources cited on money pages and how-to guides — one list so a
// dead link is fixed once. Add a URL only after confirming it is live.
// Verified live 2026-11-24 (NHTSA pages via search index — nhtsa.gov blocks bots).
export const SRC = {
  nmvtis: { label: 'NMVTIS — consumer information (U.S. Department of Justice)', href: 'https://vehiclehistory.bja.ojp.gov/nmvtis_consumers' },
  nmvtisTips: { label: 'NMVTIS — tips for buying a used vehicle', href: 'https://vehiclehistory.bja.ojp.gov/nmvtis_buyingtips' },
  nicb: { label: 'NICB VINCheck — free theft and salvage screen', href: 'https://www.nicb.org/vincheck' },
  nhtsaRecalls: { label: 'NHTSA — check for recalls by VIN', href: 'https://www.nhtsa.gov/recalls' },
  nhtsaOdometer: { label: 'NHTSA — odometer fraud', href: 'https://www.nhtsa.gov/vehicle-safety/odometer-fraud' },
  vpic: { label: 'NHTSA vPIC — public VIN decoder', href: 'https://vpic.nhtsa.dot.gov/decoder/' },
  cfr565: { label: '49 CFR Part 565 — federal VIN requirements (eCFR)', href: 'https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-565' },
  dppa: { label: "Driver's Privacy Protection Act, 18 U.S.C. § 2721 (Cornell LII)", href: 'https://www.law.cornell.edu/uscode/text/18/2721' },
  ftcDealer: { label: 'FTC — buying a used car from a dealer', href: 'https://consumer.ftc.gov/articles/buying-used-car-dealer' },
  ftcUsed: { label: 'FTC — used cars consumer advice', href: 'https://consumer.ftc.gov/features/feature-0040-used-cars' },
} as const;
