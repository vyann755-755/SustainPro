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
  total: string;
  totalUnit: string;
  totalLabel: string;
  /** Annual totals 2021–2025, in `chartUnit`. */
  history: number[];
  monthly: number[];
  chartUnit: string;
  intensity: { label: string; unit: string; value: string; previous: number; current: number };
  projection: { bau2035: number; predicted2035: number; target2035: number; axisMax: number; ticks: number[] };
}

export interface SGHDataset {
  reportingYear: number;
  sources: EmissionSource[];
  /** Scope totals for the previous year, tCO2e. */
  previousScopes: { 1: number; 2: number; 3: number };
  /** Total emissions 2021–2025, tCO2e. */
  emissionsHistory: number[];
  blocks: BlockEmissions[];
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
    { name: 'Block 1', scope1: 1400, scope2: 1450, scope3: 350 },
    { name: 'Block 2', scope1: 1050, scope2: 1300, scope3: 350 },
    { name: 'Block 3', scope1: 1000, scope2: 1150, scope3: 350 },
    { name: 'Block 4', scope1: 800, scope2: 950, scope3: 350 },
    { name: 'Block 5', scope1: 550, scope2: 550, scope3: 400 },
  ],
  resources: [
    {
      key: 'energy', title: 'Energy performance', color: '#047857', total: '28.4M', totalUnit: 'kWh', totalLabel: 'Total energy use',
      history: [30.1, 30.3, 30.2, 30.3, 28.4],
      monthly: [2.31, 2.18, 2.40, 2.36, 2.47, 2.52, 2.49, 2.55, 2.44, 2.38, 2.27, 2.03],
      chartUnit: 'GWh',
      intensity: { label: 'Energy intensity', unit: 'kWh/m²', value: '162', previous: 174.6, current: 162 },
      projection: { bau2035: 35.5, predicted2035: 24.8, target2035: 15, axisMax: 40, ticks: [0, 20, 40] },
    },
    {
      key: 'water', title: 'Water performance', color: '#1D4ED8', total: '198,745', totalUnit: 'm³', totalLabel: 'Total water use',
      history: [209, 210, 211, 210, 198.7],
      monthly: [16.2, 15.1, 16.8, 16.4, 17.0, 17.3, 17.1, 17.6, 16.9, 16.6, 16.0, 15.7],
      chartUnit: 'thousand m³',
      intensity: { label: 'Water intensity', unit: 'L/m²', value: '1,137', previous: 1211, current: 1137 },
      projection: { bau2035: 260, predicted2035: 160, target2035: 100, axisMax: 300, ticks: [0, 150, 300] },
    },
    {
      key: 'waste', title: 'Waste performance', color: '#9A3412', total: '1,245', totalUnit: 'tonnes', totalLabel: 'Total waste',
      history: [1340, 1350, 1342, 1340, 1245],
      monthly: [98, 94, 104, 101, 108, 110, 107, 112, 106, 104, 101, 100],
      chartUnit: 'tonnes',
      intensity: { label: 'Waste intensity', unit: 'kg/bed-day', value: '0.68', previous: 0.73, current: 0.68 },
      projection: { bau2035: 1400, predicted2035: 900, target2035: 620, axisMax: 1600, ticks: [0, 800, 1600] },
    },
  ],
  projection: { bau2035: 17800, predicted2035: 10500, targetReduction2030: 0.5 },
};

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

  const blocks = data.blocks
    .map(b => ({ ...b, total: b.scope1 + b.scope2 + b.scope3 }))
    .sort((a, b) => b.total - a.total);
  const blockAverage = blocks.reduce((a, b) => a + b.total, 0) / blocks.length;

  const largest = [...data.sources].sort((a, b) => b.tCO2e - a.tCO2e)[0];

  return {
    total, previous, yoy: pctChange(total, previous), scopes, history,
    bau, predicted, target2030, predicted2030: predicted[5],
    blocks, blockAverage, largest,
  };
}

export type Overview = ReturnType<typeof computeOverview>;
