/**
 * SGH Sustainability Dashboard — sample data and KPI calculations.
 *
 * All figures are SAMPLE values taken from the SGH mock-up deck. Once SGH's
 * source Excel files are received, the upload screen will produce a
 * `SGHDataset` with the same shape and every KPI, insight and chart on the
 * dashboard is recalculated from it by `computeOverview`.
 */

export type Scope2Method = 'location' | 'market';

export const SCOPE_COLORS = { 1: '#4F7F55', 2: '#3F6F80', 3: '#B9763F' } as const;
export const LINE_COLORS = { actual: '#9DBFAE', bau: '#C2410C', predicted: '#2563EB', target: '#047857' } as const;

export interface EmissionSource {
  name: string;
  scope: 1 | 2 | 3;
  tCO2e: number;
}

export interface BlockEmissions {
  name: string;
  scope1: number;
  scope2: number;
  scope3: number;
}

export interface ResourceSeries {
  key: 'energy' | 'water' | 'waste';
  title: string;
  color: string;
  totalLabel: string;
  totalUnit: string;
  /** Annual totals 2021–2025, in `annualUnit`. */
  history: number[];
  monthly: number[];
  monthlyUnit: string;
  monthlyDecimals: number;
  annualUnit: string;
  intensity: { label: string; value: string; delta: string; definition: string };
  perPerson: { label: string; value: string; definition: string };
  outlook: { bau2035: number; predicted2035: number; target2035: number; axisMax: number; ticks: number[] };
}

export interface SGHDataset {
  reportingYear: number;
  /** Scope 2 total under each method, tCO2e. */
  scope2: Record<Scope2Method, number>;
  sources: EmissionSource[];
  /** Total emissions 2021–2025 (location-based), tCO2e. */
  emissionsHistory: number[];
  blocks: BlockEmissions[];
  resources: ResourceSeries[];
  projection: { bau2035: number; predicted2035: number; targetReduction2030: number };
}

export const sampleDataset: SGHDataset = {
  reportingYear: 2025,
  scope2: { location: 5400, market: 4900 },
  sources: [
    { name: 'Stationary combustion', scope: 1, tCO2e: 1900 },
    { name: 'Refrigerant leaks', scope: 1, tCO2e: 1100 },
    { name: 'Anaesthetic gases', scope: 1, tCO2e: 950 },
    { name: 'Fire suppressant', scope: 1, tCO2e: 300 },
    { name: 'Wastewater treatment', scope: 1, tCO2e: 300 },
    { name: 'Electrical insulating gas (SF₆)', scope: 1, tCO2e: 250 },
    { name: 'Purchased goods & services', scope: 3, tCO2e: 600 },
    { name: 'Waste generated', scope: 3, tCO2e: 450 },
    { name: 'Staff commuting', scope: 3, tCO2e: 350 },
    { name: 'Business travel', scope: 3, tCO2e: 250 },
    { name: 'Water supply & treatment', scope: 3, tCO2e: 150 },
  ],
  emissionsHistory: [11800, 12700, 11000, 13000, 12000],
  blocks: [
    { name: 'Block 1', scope1: 1400, scope2: 1450, scope3: 350 },
    { name: 'Block 2', scope1: 1050, scope2: 1300, scope3: 350 },
    { name: 'Block 3', scope1: 1000, scope2: 1150, scope3: 350 },
    { name: 'Block 4', scope1: 800, scope2: 950, scope3: 350 },
    { name: 'Block 5', scope1: 550, scope2: 550, scope3: 400 },
  ],
  resources: [
    {
      key: 'energy', title: 'Energy', color: '#047857', totalLabel: '28.4M', totalUnit: 'kWh',
      history: [30.1, 30.3, 30.2, 30.3, 28.4],
      monthly: [2.31, 2.18, 2.40, 2.36, 2.47, 2.52, 2.49, 2.55, 2.44, 2.38, 2.27, 2.03], monthlyUnit: 'GWh', monthlyDecimals: 2,
      annualUnit: 'GWh per year',
      intensity: { label: 'Energy intensity', value: '162 kWh/m²', delta: '↓ 7.2% vs 2024', definition: 'Electricity and fuel energy per m² of floor area per year' },
      perPerson: { label: 'Per person per day', value: '[—] kWh', definition: 'Per occupant, visitor and staff member per day' },
      outlook: { bau2035: 35.5, predicted2035: 24.8, target2035: 15, axisMax: 40, ticks: [0, 20, 40] },
    },
    {
      key: 'water', title: 'Water', color: '#1D4ED8', totalLabel: '198,745', totalUnit: 'm³',
      history: [209, 210, 211, 210, 198.7],
      monthly: [16.2, 15.1, 16.8, 16.4, 17.0, 17.3, 17.1, 17.6, 16.9, 16.6, 16.0, 15.7], monthlyUnit: 'thousand m³', monthlyDecimals: 1,
      annualUnit: 'thousand m³ per year',
      intensity: { label: 'Water intensity', value: '1,137 L/m²', delta: '↓ 6.1% vs 2024', definition: 'Litres per m² of floor area per year' },
      perPerson: { label: 'Per person per day', value: '[—] L', definition: 'Litres per occupant, visitor and staff member per day (NEA count)' },
      outlook: { bau2035: 260, predicted2035: 160, target2035: 100, axisMax: 300, ticks: [0, 150, 300] },
    },
    {
      key: 'waste', title: 'Waste', color: '#9A3412', totalLabel: '1,245', totalUnit: 'tonnes',
      history: [1340, 1350, 1342, 1340, 1245],
      monthly: [98, 94, 104, 101, 108, 110, 107, 112, 106, 104, 101, 100], monthlyUnit: 'tonnes', monthlyDecimals: 0,
      annualUnit: 'tonnes per year',
      intensity: { label: 'Per bed-day', value: '0.68 kg', delta: '↓ 6.8% vs 2024', definition: 'Waste per occupied bed per day' },
      perPerson: { label: 'Per person per day', value: '[—] kg', definition: 'Per occupant, visitor and staff member per day' },
      outlook: { bau2035: 1400, predicted2035: 900, target2035: 620, axisMax: 1600, ticks: [0, 800, 1600] },
    },
  ],
  projection: { bau2035: 17800, predicted2035: 10500, targetReduction2030: 0.5 },
};

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
export const fmtK = (n: number) => (Math.abs(n) < 0.5 ? '0' : (n / 1000).toFixed(1) + 'k');
export const pctChange = (cur: number, prev: number) => (cur - prev) / prev;

/** Shape of a path from `start` (2025) to `end` (2035), 11 yearly points with a small wobble. */
export function projectPath(start: number, end: number, wobble: number[] = []): number[] {
  const out: number[] = [];
  for (let k = 0; k <= 10; k++) out.push(start + (end - start) * k / 10 + (wobble[k] || 0) * Math.abs(end - start) * 0.12);
  return out;
}

export const BAU_WOBBLE = [0, 0.3, 0.1, 0.4, 0.2, 0.5, 0.3, 0.6, 0.2, 0.4, 0];
export const PREDICTED_WOBBLE = [0, -0.2, 0.3, -0.1, 0.4, 0, -0.3, 0.2, -0.2, 0.1, 0];
export const YEARS = Array.from({ length: 15 }, (_, i) => 2021 + i);

export function computeOverview(data: SGHDataset, method: Scope2Method) {
  const s2 = data.scope2[method];
  const s2Factor = s2 / data.scope2.location;
  const s1 = data.sources.filter(s => s.scope === 1).reduce((a, s) => a + s.tCO2e, 0);
  const s3 = data.sources.filter(s => s.scope === 3).reduce((a, s) => a + s.tCO2e, 0);
  const total = s1 + s2 + s3;

  const sources: EmissionSource[] = [
    ...data.sources,
    { name: method === 'market' ? 'Grid electricity (market-based)' : 'Grid electricity (location-based)', scope: 2 as const, tCO2e: s2 },
  ].sort((a, b) => b.tCO2e - a.tCO2e);
  const top3Share = (sources[0].tCO2e + sources[1].tCO2e + sources[2].tCO2e) / total;

  // History is stored location-based; scale it so comparisons use the same method.
  const scale = total / (s1 + data.scope2.location + s3);
  const history = data.emissionsHistory.map(v => v * scale);
  const previous = history[history.length - 2];
  const yoy = pctChange(total, previous);

  const target2030 = total * (1 - data.projection.targetReduction2030);
  const target = Array.from({ length: 11 }, (_, k) => (k <= 5 ? total - (total - target2030) * k / 5 : target2030 - target2030 * (k - 5) / 5));
  const bau = projectPath(total, data.projection.bau2035 * scale, BAU_WOBBLE);
  const predicted = projectPath(total, data.projection.predicted2035 * scale, PREDICTED_WOBBLE);
  const gap2030 = predicted[5] - target2030;
  const annualCutNeeded = 1 - Math.pow(target2030 / total, 1 / 5);

  const blocks = data.blocks
    .map(b => ({ name: b.name, scope1: b.scope1, scope2: b.scope2 * s2Factor, scope3: b.scope3 }))
    .map(b => ({ ...b, total: b.scope1 + b.scope2 + b.scope3 }))
    .sort((a, b) => b.total - a.total);
  const blockAverage = blocks.reduce((a, b) => a + b.total, 0) / blocks.length;

  return {
    total, scopes: [
      { scope: 1 as const, name: 'Scope 1 · Direct', value: s1 },
      { scope: 2 as const, name: 'Scope 2 · Electricity', value: s2 },
      { scope: 3 as const, name: 'Scope 3 · Value chain', value: s3 },
    ],
    sources, top3Share, history, previous, yoy,
    target2030, target, bau, predicted, gap2030, annualCutNeeded,
    blocks, blockAverage,
  };
}

export type Overview = ReturnType<typeof computeOverview>;
