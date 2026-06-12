// Programmatic SEO dataset for per-brand VIN-check pages (/vin-check/[brand]).
// Each brand carries genuinely unique content (origin, VIN/WMI hints, popular
// models, common used-buying issues) so the pages are differentiated, not
// thin duplicates — the durable way to win long-tail "[brand] vin check" queries.

export interface Brand {
  slug: string;
  name: string;
  country: string;
  founded: number;
  /** Leading WMI / VIN characters commonly seen for this make. */
  vinHints: string;
  models: string[];
  /** One-line positioning used in intros and meta descriptions. */
  blurb: string;
  /** Brand-specific things a used buyer should watch for. */
  watchFor: string;
}

export const BRANDS: Brand[] = [
  { slug: 'ford', name: 'Ford', country: 'USA', founded: 1903, vinHints: '1F, 2F, 3F', models: ['F-150', 'Mustang', 'Explorer', 'Escape', 'Ranger'], blurb: "America's best-selling trucks and a deep used-market inventory.", watchFor: 'PowerShift dual-clutch transmission issues on 2012–2016 Focus/Fiesta, and frame rust on older F-150s.' },
  { slug: 'chevrolet', name: 'Chevrolet', country: 'USA', founded: 1911, vinHints: '1G, 2G, 3G', models: ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Camaro'], blurb: 'Full-size trucks, SUVs, and affordable sedans across every price point.', watchFor: 'Excessive oil consumption on 2.4L Ecotec engines and lifter failures on some 5.3L V8s.' },
  { slug: 'toyota', name: 'Toyota', country: 'Japan', founded: 1937, vinHints: 'JT, 4T, 5T', models: ['Camry', 'RAV4', 'Corolla', 'Highlander', 'Tacoma'], blurb: 'Legendary reliability and the strongest resale value in the segment.', watchFor: 'Frame rust on 2005–2010 Tacoma/Tundra and dashboard cracking on older Camry/Corolla.' },
  { slug: 'honda', name: 'Honda', country: 'Japan', founded: 1948, vinHints: 'JH, 1H, 2H', models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'], blurb: 'Efficient, long-lasting cars with loyal owners and high resale.', watchFor: 'Automatic transmission failures on 2001–2004 models and AC compressor issues on some CR-Vs.' },
  { slug: 'nissan', name: 'Nissan', country: 'Japan', founded: 1933, vinHints: 'JN, 1N, 3N', models: ['Altima', 'Rogue', 'Sentra', 'Frontier', 'Maxima'], blurb: 'Value-priced sedans and crossovers with broad availability.', watchFor: 'CVT transmission failures across many 2013+ models — verify service history and any replacements.' },
  { slug: 'bmw', name: 'BMW', country: 'Germany', founded: 1916, vinHints: 'WBA, WBS, 5UX', models: ['3 Series', '5 Series', 'X3', 'X5', 'M3'], blurb: 'Driver-focused luxury with strong performance pedigree.', watchFor: 'Timing-chain guide wear on N20/N47 engines and oil leaks (valve cover, oil filter housing).' },
  { slug: 'mercedes-benz', name: 'Mercedes-Benz', country: 'Germany', founded: 1926, vinHints: 'WDD, WDC, 4JG', models: ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'], blurb: 'Flagship luxury and safety engineering across sedans and SUVs.', watchFor: 'Rust on early-2000s models, air-suspension failures on S-Class/GL, and balance-shaft issues on some V6s.' },
  { slug: 'audi', name: 'Audi', country: 'Germany', founded: 1909, vinHints: 'WAU, WA1, TRU', models: ['A4', 'A6', 'Q5', 'Q7', 'A3'], blurb: 'Quattro all-wheel drive and refined interiors.', watchFor: 'Excessive oil consumption on 2.0T (2009–2011) and carbon buildup on direct-injection engines.' },
  { slug: 'volkswagen', name: 'Volkswagen', country: 'Germany', founded: 1937, vinHints: 'WVW, 1VW, 3VW', models: ['Jetta', 'Passat', 'Tiguan', 'Golf', 'Atlas'], blurb: 'German engineering at mainstream prices.', watchFor: 'Timing-chain tensioner failures on 2008–2014 TSI engines; verify any TDI emissions-recall work.' },
  { slug: 'jeep', name: 'Jeep', country: 'USA', founded: 1943, vinHints: '1J, 1C4, 3C4', models: ['Grand Cherokee', 'Wrangler', 'Cherokee', 'Compass', 'Gladiator'], blurb: 'Off-road capability with iconic styling and strong demand.', watchFor: '"Death wobble" on Wrangler front suspension and 9-speed transmission complaints on Cherokee.' },
  { slug: 'dodge', name: 'Dodge', country: 'USA', founded: 1900, vinHints: '1B3, 2B3, 2C3', models: ['Charger', 'Challenger', 'Durango', 'Journey', 'Grand Caravan'], blurb: 'Muscle-car performance and family haulers.', watchFor: 'Transmission and electrical gremlins on Journey/Grand Caravan; check for modified/abused performance cars.' },
  { slug: 'ram', name: 'Ram', country: 'USA', founded: 2010, vinHints: '1C6, 3C6', models: ['1500', '2500', '3500', 'ProMaster', 'Dakota'], blurb: 'Comfort-leading full-size and heavy-duty trucks.', watchFor: 'EcoDiesel emissions recalls and air-suspension issues on 1500; verify towing/work history.' },
  { slug: 'gmc', name: 'GMC', country: 'USA', founded: 1911, vinHints: '1GT, 2GT, 3GT', models: ['Sierra', 'Acadia', 'Terrain', 'Yukon', 'Canyon'], blurb: 'Premium-trimmed trucks and SUVs sharing GM mechanicals.', watchFor: 'Same 5.3L lifter/oil-consumption concerns as Chevrolet; check timing-chain stretch.' },
  { slug: 'hyundai', name: 'Hyundai', country: 'South Korea', founded: 1967, vinHints: 'KMH, 5NP', models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona'], blurb: 'Long warranties and rapidly improving quality.', watchFor: 'Theta II engine failures (2011–2019 Sonata/Santa Fe) — confirm engine recall/replacement was performed.' },
  { slug: 'kia', name: 'Kia', country: 'South Korea', founded: 1944, vinHints: 'KNA, 5XY', models: ['Optima', 'Sorento', 'Sportage', 'Soul', 'Telluride'], blurb: 'Design-led value with strong feature content.', watchFor: 'Shared Theta II engine risk with Hyundai, plus theft vulnerability on some 2011–2021 models.' },
  { slug: 'subaru', name: 'Subaru', country: 'Japan', founded: 1953, vinHints: 'JF1, JF2, 4S', models: ['Outback', 'Forester', 'Crosstrek', 'Impreza', 'Ascent'], blurb: 'Standard all-wheel drive and a devoted outdoor following.', watchFor: 'Head-gasket failures on older 2.5L boxer engines and oil consumption on 2011–2014 models.' },
  { slug: 'mazda', name: 'Mazda', country: 'Japan', founded: 1920, vinHints: 'JM1, JM3', models: ['Mazda3', 'CX-5', 'CX-30', 'Mazda6', 'MX-5 Miata'], blurb: 'Sporty handling and premium interiors at mainstream prices.', watchFor: 'Rust on early CX-models and infotainment quirks; generally strong reliability otherwise.' },
  { slug: 'lexus', name: 'Lexus', country: 'Japan', founded: 1989, vinHints: 'JTH, 2T2', models: ['RX', 'ES', 'NX', 'GX', 'IS'], blurb: "Toyota reliability with luxury refinement and top resale.", watchFor: 'Generally excellent; watch for dashboard melt on older models and verify hybrid battery health.' },
  { slug: 'acura', name: 'Acura', country: 'Japan', founded: 1986, vinHints: '19U, JH4', models: ['MDX', 'RDX', 'TLX', 'TL', 'Integra'], blurb: 'Honda dependability with sportier, upscale trims.', watchFor: 'Older automatic-transmission issues (shared with Honda V6) and torque-converter judder.' },
  { slug: 'tesla', name: 'Tesla', country: 'USA', founded: 2003, vinHints: '5YJ, 7SA', models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'], blurb: 'Leading EVs with software-defined features and Supercharging.', watchFor: 'Battery/range degradation, panel-gap and suspension complaints; confirm any battery or drive-unit replacements.' },
  { slug: 'cadillac', name: 'Cadillac', country: 'USA', founded: 1902, vinHints: '1G6, 1GY', models: ['Escalade', 'XT5', 'CT5', 'XT4', 'CTS'], blurb: 'American luxury with bold styling and strong V-Series performance.', watchFor: 'CUE infotainment failures and timing-chain wear on some V6 engines.' },
  { slug: 'buick', name: 'Buick', country: 'USA', founded: 1903, vinHints: '1G4, KL4', models: ['Enclave', 'Encore', 'Envision', 'LaCrosse', 'Regal'], blurb: 'Quiet, comfortable SUVs popular with value-minded buyers.', watchFor: 'Same GM powertrain concerns; check for oil consumption and timing-chain stretch.' },
  { slug: 'chrysler', name: 'Chrysler', country: 'USA', founded: 1925, vinHints: '2C3, 1C3', models: ['Pacifica', '300', 'Voyager', 'Town & Country', '200'], blurb: 'Minivans and full-size sedans with strong value.', watchFor: 'Pacifica electrical/recall history and transmission issues on the 200.' },
  { slug: 'lincoln', name: 'Lincoln', country: 'USA', founded: 1917, vinHints: '5LM, 1LN', models: ['Navigator', 'Aviator', 'Corsair', 'Nautilus', 'MKZ'], blurb: 'Ford-based luxury with quiet cabins and generous equipment.', watchFor: 'Shares Ford powertrains — check EcoBoost and transmission service history.' },
  { slug: 'volvo', name: 'Volvo', country: 'Sweden', founded: 1927, vinHints: 'YV1, YV4', models: ['XC90', 'XC60', 'XC40', 'S60', 'V60'], blurb: 'Safety leadership and minimalist Scandinavian luxury.', watchFor: 'Electrical and infotainment issues; verify any transmission software updates on older models.' },
  { slug: 'porsche', name: 'Porsche', country: 'Germany', founded: 1931, vinHints: 'WP0, WP1', models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Boxster'], blurb: 'Benchmark sports cars and performance SUVs.', watchFor: 'IMS bearing on older 911/Boxster, coolant-pipe and bore-scoring concerns — get a pre-purchase inspection.' },
  { slug: 'land-rover', name: 'Land Rover', country: 'United Kingdom', founded: 1948, vinHints: 'SAL', models: ['Range Rover', 'Range Rover Sport', 'Discovery', 'Defender', 'Evoque'], blurb: 'Premium off-roaders with strong on-road luxury.', watchFor: 'Air-suspension and electrical reliability are perennial concerns — verify maintenance thoroughly.' },
  { slug: 'jaguar', name: 'Jaguar', country: 'United Kingdom', founded: 1922, vinHints: 'SAJ', models: ['F-PACE', 'XF', 'XE', 'F-TYPE', 'E-PACE'], blurb: 'British luxury and sporting heritage.', watchFor: 'Timing-chain tensioners on some engines and electrical gremlins; check service records.' },
  { slug: 'mitsubishi', name: 'Mitsubishi', country: 'Japan', founded: 1970, vinHints: 'JA3, 4A3', models: ['Outlander', 'Outlander Sport', 'Eclipse Cross', 'Mirage', 'Lancer'], blurb: 'Budget-friendly crossovers with long warranties.', watchFor: 'CVT longevity and overall refinement; confirm warranty transferability.' },
  { slug: 'infiniti', name: 'Infiniti', country: 'Japan', founded: 1989, vinHints: 'JNK, JNR', models: ['Q50', 'QX60', 'QX50', 'QX80', 'Q60'], blurb: 'Nissan-based luxury with strong V6 performance.', watchFor: 'QX60 shares Nissan CVT concerns; check timing-chain and electronics on VQ/VR engines.' },
  { slug: 'mini', name: 'MINI', country: 'United Kingdom', founded: 1959, vinHints: 'WMW', models: ['Cooper', 'Countryman', 'Clubman', 'Hardtop', 'Convertible'], blurb: 'Go-kart handling and distinctive style (BMW-owned).', watchFor: 'Timing-chain and turbo issues on 2007–2015 models; oil leaks are common.' },
  { slug: 'genesis', name: 'Genesis', country: 'South Korea', founded: 2015, vinHints: 'KMT', models: ['G70', 'G80', 'GV70', 'GV80', 'G90'], blurb: 'Hyundai’s luxury arm with strong value and long warranties.', watchFor: 'Young brand with few systemic issues — verify warranty coverage and software recalls.' },
  { slug: 'fiat', name: 'Fiat', country: 'Italy', founded: 1899, vinHints: '3C3, ZFB', models: ['500', '500X', '500L', '124 Spider', '500e'], blurb: 'Compact Italian styling for city driving.', watchFor: 'Reliability and parts availability are concerns; check transmission and electrical history.' },
];

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export function brandSlugs(): string[] {
  return BRANDS.map((b) => b.slug);
}
