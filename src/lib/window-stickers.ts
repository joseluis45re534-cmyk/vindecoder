// Window-sticker (Monroney) cluster — makes and models drive /window-sticker,
// /window-sticker/[make], and /window-sticker/[make]/[model]. Same
// source-of-truth pattern as BRANDS. The pages are informational + funnel to
// the VIN lookup, which generates the actual sticker; we never hardcode a
// specific car's MSRP, options, or specs (those come live from the lookup).

type Row = [string, string]; // [slug, display name]

export interface StickerModel {
  slug: string;
  name: string;
}

export interface StickerMake {
  slug: string;
  name: string;
  models: StickerModel[];
}

const RAW: { slug: string; name: string; models: Row[] }[] = [
  { slug: 'toyota', name: 'Toyota', models: [['camry', 'Camry'], ['corolla', 'Corolla'], ['rav4', 'RAV4'], ['highlander', 'Highlander'], ['tacoma', 'Tacoma'], ['tundra', 'Tundra'], ['4runner', '4Runner'], ['sienna', 'Sienna'], ['prius', 'Prius'], ['sequoia', 'Sequoia']] },
  { slug: 'honda', name: 'Honda', models: [['civic', 'Civic'], ['accord', 'Accord'], ['cr-v', 'CR-V'], ['pilot', 'Pilot'], ['odyssey', 'Odyssey'], ['hr-v', 'HR-V'], ['passport', 'Passport'], ['ridgeline', 'Ridgeline'], ['insight', 'Insight']] },
  { slug: 'nissan', name: 'Nissan', models: [['altima', 'Altima'], ['sentra', 'Sentra'], ['rogue', 'Rogue'], ['pathfinder', 'Pathfinder'], ['frontier', 'Frontier'], ['titan', 'Titan'], ['maxima', 'Maxima'], ['murano', 'Murano'], ['versa', 'Versa'], ['kicks', 'Kicks']] },
  { slug: 'hyundai', name: 'Hyundai', models: [['elantra', 'Elantra'], ['sonata', 'Sonata'], ['tucson', 'Tucson'], ['santa-fe', 'Santa Fe'], ['palisade', 'Palisade'], ['kona', 'Kona'], ['ioniq', 'Ioniq'], ['venue', 'Venue'], ['accent', 'Accent']] },
  { slug: 'kia', name: 'Kia', models: [['forte', 'Forte'], ['k5', 'K5'], ['sportage', 'Sportage'], ['sorento', 'Sorento'], ['telluride', 'Telluride'], ['soul', 'Soul'], ['carnival', 'Carnival'], ['niro', 'Niro'], ['stinger', 'Stinger']] },
  { slug: 'mazda', name: 'Mazda', models: [['mazda3', 'Mazda3'], ['mazda6', 'Mazda6'], ['cx-5', 'CX-5'], ['cx-9', 'CX-9'], ['cx-30', 'CX-30'], ['mx-5-miata', 'MX-5 Miata'], ['cx-50', 'CX-50']] },
  { slug: 'subaru', name: 'Subaru', models: [['outback', 'Outback'], ['forester', 'Forester'], ['crosstrek', 'Crosstrek'], ['impreza', 'Impreza'], ['legacy', 'Legacy'], ['ascent', 'Ascent'], ['wrx', 'WRX'], ['brz', 'BRZ']] },
  { slug: 'lexus', name: 'Lexus', models: [['rx', 'RX'], ['es', 'ES'], ['nx', 'NX'], ['gx', 'GX'], ['lx', 'LX'], ['is', 'IS'], ['ux', 'UX'], ['ls', 'LS'], ['lc', 'LC']] },
  { slug: 'acura', name: 'Acura', models: [['mdx', 'MDX'], ['rdx', 'RDX'], ['tlx', 'TLX'], ['integra', 'Integra'], ['ilx', 'ILX'], ['nsx', 'NSX']] },
  { slug: 'infiniti', name: 'Infiniti', models: [['qx60', 'QX60'], ['qx50', 'QX50'], ['qx55', 'QX55'], ['qx80', 'QX80'], ['q50', 'Q50'], ['q60', 'Q60'], ['qx30', 'QX30']] },
  { slug: 'mitsubishi', name: 'Mitsubishi', models: [['outlander', 'Outlander'], ['eclipse-cross', 'Eclipse Cross'], ['mirage', 'Mirage'], ['outlander-sport', 'Outlander Sport']] },
  { slug: 'ford', name: 'Ford', models: [['f-150', 'F-150'], ['f-250', 'F-250'], ['f-350', 'F-350'], ['mustang', 'Mustang'], ['explorer', 'Explorer'], ['escape', 'Escape'], ['bronco', 'Bronco'], ['edge', 'Edge'], ['ranger', 'Ranger'], ['maverick', 'Maverick'], ['expedition', 'Expedition']] },
  { slug: 'chevrolet', name: 'Chevrolet', models: [['silverado-1500', 'Silverado 1500'], ['silverado-2500', 'Silverado 2500'], ['tahoe', 'Tahoe'], ['suburban', 'Suburban'], ['equinox', 'Equinox'], ['traverse', 'Traverse'], ['camaro', 'Camaro'], ['corvette', 'Corvette'], ['malibu', 'Malibu'], ['trax', 'Trax'], ['trailblazer', 'Trailblazer'], ['colorado', 'Colorado']] },
  { slug: 'ram', name: 'RAM', models: [['1500', '1500'], ['2500', '2500'], ['3500', '3500'], ['promaster', 'ProMaster'], ['promaster-city', 'ProMaster City']] },
  { slug: 'gmc', name: 'GMC', models: [['sierra-1500', 'Sierra 1500'], ['sierra-2500', 'Sierra 2500'], ['yukon', 'Yukon'], ['acadia', 'Acadia'], ['terrain', 'Terrain'], ['canyon', 'Canyon'], ['hummer-ev', 'Hummer EV']] },
  { slug: 'jeep', name: 'Jeep', models: [['grand-cherokee', 'Grand Cherokee'], ['wrangler', 'Wrangler'], ['cherokee', 'Cherokee'], ['compass', 'Compass'], ['renegade', 'Renegade'], ['gladiator', 'Gladiator'], ['wagoneer', 'Wagoneer'], ['grand-wagoneer', 'Grand Wagoneer']] },
  { slug: 'dodge', name: 'Dodge', models: [['charger', 'Charger'], ['challenger', 'Challenger'], ['durango', 'Durango'], ['hornet', 'Hornet']] },
  { slug: 'chrysler', name: 'Chrysler', models: [['pacifica', 'Pacifica'], ['300', '300'], ['voyager', 'Voyager']] },
  { slug: 'buick', name: 'Buick', models: [['encore', 'Encore'], ['encore-gx', 'Encore GX'], ['envision', 'Envision'], ['enclave', 'Enclave']] },
  { slug: 'cadillac', name: 'Cadillac', models: [['escalade', 'Escalade'], ['xt5', 'XT5'], ['xt6', 'XT6'], ['xt4', 'XT4'], ['ct4', 'CT4'], ['ct5', 'CT5'], ['lyriq', 'Lyriq']] },
  { slug: 'lincoln', name: 'Lincoln', models: [['navigator', 'Navigator'], ['aviator', 'Aviator'], ['nautilus', 'Nautilus'], ['corsair', 'Corsair']] },
  { slug: 'bmw', name: 'BMW', models: [['3-series', '3 Series'], ['5-series', '5 Series'], ['x3', 'X3'], ['x5', 'X5'], ['x7', 'X7'], ['m3', 'M3'], ['m5', 'M5'], ['i4', 'i4'], ['ix', 'iX'], ['x1', 'X1'], ['z4', 'Z4']] },
  { slug: 'mercedes-benz', name: 'Mercedes-Benz', models: [['c-class', 'C-Class'], ['e-class', 'E-Class'], ['s-class', 'S-Class'], ['gle', 'GLE'], ['glc', 'GLC'], ['g-class', 'G-Class'], ['gls', 'GLS'], ['eqs', 'EQS'], ['amg-gt', 'AMG GT'], ['sprinter', 'Sprinter']] },
  { slug: 'audi', name: 'Audi', models: [['a4', 'A4'], ['a6', 'A6'], ['q5', 'Q5'], ['q7', 'Q7'], ['q8', 'Q8'], ['e-tron', 'e-tron'], ['s4', 'S4'], ['rs6', 'RS6'], ['a8', 'A8'], ['q3', 'Q3']] },
  { slug: 'volkswagen', name: 'Volkswagen', models: [['jetta', 'Jetta'], ['atlas', 'Atlas'], ['tiguan', 'Tiguan'], ['taos', 'Taos'], ['passat', 'Passat'], ['golf', 'Golf'], ['id.4', 'ID.4'], ['arteon', 'Arteon']] },
  { slug: 'porsche', name: 'Porsche', models: [['911', '911'], ['cayenne', 'Cayenne'], ['macan', 'Macan'], ['panamera', 'Panamera'], ['taycan', 'Taycan'], ['718-cayman', '718 Cayman'], ['718-boxster', '718 Boxster']] },
  { slug: 'volvo', name: 'Volvo', models: [['xc90', 'XC90'], ['xc60', 'XC60'], ['xc40', 'XC40'], ['s60', 'S60'], ['v60', 'V60'], ['s90', 'S90'], ['ex30', 'EX30']] },
  { slug: 'land-rover', name: 'Land Rover', models: [['range-rover', 'Range Rover'], ['range-rover-sport', 'Range Rover Sport'], ['defender', 'Defender'], ['discovery', 'Discovery'], ['range-rover-velar', 'Range Rover Velar']] },
  { slug: 'jaguar', name: 'Jaguar', models: [['f-pace', 'F-PACE'], ['e-pace', 'E-PACE'], ['i-pace', 'I-PACE'], ['xf', 'XF'], ['f-type', 'F-TYPE']] },
  { slug: 'tesla', name: 'Tesla', models: [['model-3', 'Model 3'], ['model-y', 'Model Y'], ['model-s', 'Model S'], ['model-x', 'Model X'], ['cybertruck', 'Cybertruck']] },
  { slug: 'rivian', name: 'Rivian', models: [['r1t', 'R1T'], ['r1s', 'R1S']] },
  { slug: 'lucid', name: 'Lucid', models: [['air', 'Air'], ['gravity', 'Gravity']] },
  { slug: 'polestar', name: 'Polestar', models: [['2', '2'], ['3', '3']] },
];

export const STICKER_MAKES: StickerMake[] = RAW.map((m) => ({
  slug: m.slug,
  name: m.name,
  models: m.models.map(([slug, name]) => ({ slug, name })),
}));

export function getStickerMake(slug: string): StickerMake | undefined {
  return STICKER_MAKES.find((m) => m.slug === slug);
}

export function getStickerModel(makeSlug: string, modelSlug: string): { make: StickerMake; model: StickerModel } | undefined {
  const make = getStickerMake(makeSlug);
  const model = make?.models.find((x) => x.slug === modelSlug);
  if (!make || !model) return undefined;
  return { make, model };
}

/** Flat [make, model] list — used by the sitemap. */
export function allStickerModels(): { makeSlug: string; modelSlug: string }[] {
  return STICKER_MAKES.flatMap((m) => m.models.map((x) => ({ makeSlug: m.slug, modelSlug: x.slug })));
}

export function stickerModelCount(): number {
  return STICKER_MAKES.reduce((n, m) => n + m.models.length, 0);
}
