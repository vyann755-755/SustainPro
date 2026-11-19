/**
 * SGH Sustainability Dashboard — sample data and KPI calculations.
 *
 * All figures are SAMPLE values taken from the SGH mock-up deck. Once SGH's
 * source Excel files are received, the upload screen will produce a
 * `SGHDataset` with the same shape and every figure on the dashboard is
 * recalculated from it by `computeOverview`.
 */

export const SCOPE_COLORS = { 1: '#4F7F55', 2: '#3F6F80', 3: '#B9763F' } as const;
export const LINE_COLORS = { historical: '#E0A43A', bau: '#C2410C', predicted: '#2563EB', target: '#047857' } as const;

export interface EmissionSource {
  name: string;
  scope: 1 | 2 | 3;
  tCO2e: number;
  color: string;
}

/** Emission factors from SGH's EF data rows (Data_Rows_Template.xlsx), kgCO2e per functional unit. */
export const EMISSION_FACTORS = {
  electricity: { uid: 'EF-2027-00005', kgCO2ePerUnit: 0.402, unit: 'kWh', reference: 'EMA 2026' },
  water: { uid: 'EF-2027-00006', kgCO2ePerUnit: 0.5662, unit: 'm³', reference: 'SEFR 2026' },
} as const;

/** Block-level consumption. Only electricity and water are metered per block. */
export interface BlockUtilities {
  name: string;
  electricityKWh: number;
  waterM3: number;
}

export interface ResourceSeries {
  key: 'energy' | 'water' | 'waste';
  title: string;
  color: string;
  total: string;
  totalUnit: string;
  totalLabel: string;
  /** Annual totals 2021–2025, in `chartUnit`. */
  history: number[];
  monthly: number[];
  chartUnit: string;
  projection: { bau2035: number; predicted2035: number; target2035: number; axisMax: number; ticks: number[] };
}

export interface SGHDataset {
  reportingYear: number;
  sources: EmissionSource[];
  /** Scope totals for the previous year, tCO2e. */
  previousScopes: { 1: number; 2: number; 3: number };
  /** Total emissions 2021–2025, tCO2e. */
  emissionsHistory: number[];
  blocks: BlockUtilities[];
  resources: ResourceSeries[];
  projection: { bau2035: number; predicted2035: number; targetReduction2030: number };
}

export const sampleDataset: SGHDataset = {
  reportingYear: 2025,
  sources: [
    { name: 'Stationary combustion', scope: 1, tCO2e: 1900, color: '#3E6A44' },
    { name: 'Fugitive – refrigerant', scope: 1, tCO2e: 1100, color: '#4F7F55' },
    { name: 'Fugitive – fire suppressant', scope: 1, tCO2e: 300, color: '#62936A' },
    { name: 'Fugitive – insulating gas (SF₆)', scope: 1, tCO2e: 250, color: '#78A57F' },
    { name: 'Fugitive – anaesthetic gas', scope: 1, tCO2e: 950, color: '#8FB896' },
    { name: 'Fugitive – wastewater', scope: 1, tCO2e: 300, color: '#A9CBAE' },
    { name: 'Electricity purchased', scope: 2, tCO2e: 5400, color: '#3F6F80' },
    { name: 'Purchased goods & services', scope: 3, tCO2e: 600, color: '#9E5F2F' },
    { name: 'Waste generated', scope: 3, tCO2e: 450, color: '#B9763F' },
    { name: 'Staff commuting', scope: 3, tCO2e: 350, color: '#CA8E5E' },
    { name: 'Business travel', scope: 3, tCO2e: 250, color: '#D8A67F' },
    { name: 'Water supply & treatment', scope: 3, tCO2e: 150, color: '#E5BFA1' },
  ],
  previousScopes: { 1: 5200, 2: 5900, 3: 1900 },
  emissionsHistory: [11800, 12700, 11000, 13000, 12000],
  blocks: [
    { name: 'Block 1', electricityKWh: 62_200, waterM3: 44_100 },
    { name: 'Block 2', electricityKWh: 47_300, waterM3: 53_000 },
    { name: 'Block 3', electricityKWh: 52_200, waterM3: 53_000 },
    { name: 'Block 4', electricityKWh: 42_300, waterM3: 74_200 },
    { name: 'Block 5', electricityKWh: 52_200, waterM3: 42_400 },
  ],
  resources: [
    {
      key: 'energy', title: 'Energy performance', color: '#047857', total: '28.4M', totalUnit: 'kWh', totalLabel: 'Total energy use',
      history: [30.1, 30.3, 30.2, 30.3, 28.4],
      monthly: [2.31, 2.18, 2.40, 2.36, 2.47, 2.52, 2.49, 2.55, 2.44, 2.38, 2.27, 2.03],
      chartUnit: 'GWh',
      projection: { bau2035: 35.5, predicted2035: 24.8, target2035: 15, axisMax: 40, ticks: [0, 20, 40] },
    },
    {
      key: 'water', title: 'Water performance', color: '#1D4ED8', total: '198,745', totalUnit: 'm³', totalLabel: 'Total water use',
      history: [209, 210, 211, 210, 198.7],
      monthly: [16.2, 15.1, 16.8, 16.4, 17.0, 17.3, 17.1, 17.6, 16.9, 16.6, 16.0, 15.7],
      chartUnit: 'thousand m³',
      projection: { bau2035: 260, predicted2035: 160, target2035: 100, axisMax: 300, ticks: [0, 150, 300] },
    },
    {
      key: 'waste', title: 'Waste performance', color: '#9A3412', total: '1,245', totalUnit: 'tonnes', totalLabel: 'Total waste',
      history: [1340, 1350, 1342, 1340, 1245],
      monthly: [98, 94, 104, 101, 108, 110, 107, 112, 106, 104, 101, 100],
      chartUnit: 'tonnes',
      projection: { bau2035: 1400, predicted2035: 900, target2035: 620, axisMax: 1600, ticks: [0, 800, 1600] },
    },
  ],
  projection: { bau2035: 17800, predicted2035: 10500, targetReduction2030: 0.5 },
};

/** Yearly and monthly inputs for the indices (EUI, Water Efficiency Index, Waste Disposal Index). */
export interface MonthlyParameters {
  operationalDays: number;
  visitorsPerDay: number;
  occupantsPerDay: number;
}

export interface YearParameters {
  /** Gross floor area, m² (yearly input). */
  gfaM2: number;
  /** Jan–Dec (monthly inputs). */
  monthly: MonthlyParameters[];
}

export const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export function emptyParameters(year: number): YearParameters {
  return { gfaM2: 0, monthly: Array.from({ length: 12 }, (_, m) => ({ operationalDays: daysInMonth(year, m), visitorsPerDay: 0, occupantsPerDay: 0 })) };
}

const sampleYear = (year: number, visitorsPerDay: number, occupantsPerDay: number): YearParameters => ({
  gfaM2: 175_300,
  monthly: Array.from({ length: 12 }, (_, m) => ({ operationalDays: daysInMonth(year, m), visitorsPerDay, occupantsPerDay })),
});

export const sampleParameters: Record<number, YearParameters> = {
  2024: sampleYear(2024, 9_200, 6_000),
  2025: sampleYear(2025, 9_000, 6_000),
};

/** Σ over the months of (average visitors + average occupants per day) × operational days. */
export const personDays = (p: YearParameters) =>
  p.monthly.reduce((a, m) => a + (m.visitorsPerDay + m.occupantsPerDay) * m.operationalDays, 0);

/**
 * Index formulas (hard-coded). EUI follows the BCA definition. The Water
 * Efficiency and Waste Disposal Index formulas are provisional until SGH
 * confirms them: both are per person-day of visitors and occupants.
 */
export const INDEX_DEFINITIONS = {
  energy: { label: 'Energy Use Intensity (EUI)', unit: 'kWh/m²/yr', formula: 'Electricity (kWh) ÷ GFA (m²)', provisional: false, decimals: 1 },
  water: { label: 'Water Efficiency Index', unit: 'L/person-day', formula: 'Water (L) ÷ Σ (visitors + occupants per day) × operational days', provisional: true, decimals: 1 },
  waste: { label: 'Waste Disposal Index', unit: 'kg/person-day', formula: 'Waste (kg) ÷ Σ (visitors + occupants per day) × operational days', provisional: true, decimals: 3 },
} as const;

/** Converts each resource's `chartUnit` to the formula's base unit: GWh → kWh, thousand m³ → L, tonnes → kg. */
const TO_BASE_UNIT = { energy: 1e6, water: 1e6, waste: 1e3 } as const;

function indexValue(key: ResourceSeries['key'], annual: number, p: YearParameters | undefined): number | null {
  if (!p) return null;
  const denominator = key === 'energy' ? p.gfaM2 : personDays(p);
  return denominator > 0 ? (annual * TO_BASE_UNIT[key]) / denominator : null;
}

/** Index for the reporting year and the year before; null where parameters are missing. */
export function computeIndices(data: SGHDataset, params: Record<number, YearParameters>) {
  return Object.fromEntries(data.resources.map(r => {
    const h = r.history;
    return [r.key, {
      ...INDEX_DEFINITIONS[r.key],
      current: indexValue(r.key, h[h.length - 1], params[data.reportingYear]),
      previous: indexValue(r.key, h[h.length - 2], params[data.reportingYear - 1]),
    }];
  })) as Record<ResourceSeries['key'], ResourceIndex>;
}

export type ResourceIndex = (typeof INDEX_DEFINITIONS)[ResourceSeries['key']] & { current: number | null; previous: number | null };

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
export const fmtK = (n: number) => (Math.abs(n) < 0.5 ? '0' : (n / 1000).toFixed(1) + 'k');
export const pctChange = (cur: number, prev: number) => (cur - prev) / prev;

/** Path from the latest actual (2025) to `end` (2035), 11 yearly points with a small wobble. */
export function projectPath(start: number, end: number, wobble: number[] = []): number[] {
  const out: number[] = [];
  for (let k = 0; k <= 10; k++) out.push(start + (end - start) * k / 10 + (wobble[k] || 0) * Math.abs(end - start) * 0.12);
  return out;
}

export const BAU_WOBBLE = [0, 0.3, 0.1, 0.4, 0.2, 0.5, 0.3, 0.6, 0.2, 0.4, 0];
export const PREDICTED_WOBBLE = [0, -0.2, 0.3, -0.1, 0.4, 0, -0.3, 0.2, -0.2, 0.1, 0];
export const YEARS = Array.from({ length: 15 }, (_, i) => 2021 + i);

export function computeOverview(data: SGHDataset) {
  const scopeTotal = (s: 1 | 2 | 3) => data.sources.filter(x => x.scope === s).reduce((a, x) => a + x.tCO2e, 0);
  const scopes = ([1, 2, 3] as const).map(s => ({ scope: s, value: scopeTotal(s), previous: data.previousScopes[s] }));
  const total = scopes.reduce((a, s) => a + s.value, 0);
  const history = data.emissionsHistory;
  const previous = history[history.length - 2];

  const target2030 = history[history.length - 1] * (1 - data.projection.targetReduction2030);
  const bau = projectPath(total, data.projection.bau2035, BAU_WOBBLE);
  const predicted = projectPath(total, data.projection.predicted2035, PREDICTED_WOBBLE);

  const largest = [...data.sources].sort((a, b) => b.tCO2e - a.tCO2e)[0];

  return {
    total, previous, yoy: pctChange(total, previous), scopes, history,
    bau, predicted, target2030, predicted2030: predicted[5],
    largest,
  };
}

export type Overview = ReturnType<typeof computeOverview>;

/** Electricity (Scope 2) and water (Scope 3) emissions per block in tCO2e, highest first. */
export function computeBlocks(data: SGHDataset) {
  const t = (qty: number, ef: number) => (qty * ef) / 1000;
  return data.blocks
    .map(b => {
      const electricity = t(b.electricityKWh, EMISSION_FACTORS.electricity.kgCO2ePerUnit);
      const water = t(b.waterM3, EMISSION_FACTORS.water.kgCO2ePerUnit);
      return { ...b, electricity, water, total: electricity + water };
    })
    .sort((a, b) => b.total - a.total);
}

export type BlockRow = ReturnType<typeof computeBlocks>[number];
