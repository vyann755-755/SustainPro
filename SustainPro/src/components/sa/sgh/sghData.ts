/**
 * SGH Sustainability Dashboard — KPI calculations.
 *
 * Every figure on the dashboard is calculated here from monthly activity rows
 * (see sghPipeline) and emission factors: emissions per source and scope,
 * yearly roll-ups, block totals, projections and the EUI / water / waste indices.
 */
import { findFactor, type ActivityKind, type ActivityRow, type EmissionFactor } from './sghPipeline';

export const SCOPE_COLORS = { 1: '#4F7F55', 2: '#3F6F80', 3: '#B9763F' } as const;
export const LINE_COLORS = { historical: '#E0A43A', bau: '#C2410C', predicted: '#2563EB', target: '#047857' } as const;

/** Assumptions behind the projections; confirm with SGH. */
export const ASSUMPTIONS = {
  /** Business as usual: yearly growth from the latest actual. */
  bauGrowth: 0.03,
  /** Emissions target: 50% below the first year of data by 2030, net zero by 2035. */
  emissionsReduction2030: 0.5,
  /** Energy, water and waste target: 50% below the first year of data by 2035. */
  resourceReduction2035: 0.5,
  horizon: 2035,
};

export interface EmissionSource {
  name: string;
  scope: 1 | 2 | 3;
  tCO2e: number;
  color: string;
}

/** Block-level consumption. Only electricity and water are metered per block. */
export interface BlockUtilities {
  name: string;
  electricityKWh: number;
  waterM3: number;
}

export type ResourceKey = 'energy' | 'water' | 'waste';

export interface ResourceSeries {
  key: ResourceKey;
  title: string;
  color: string;
  totalLabel: string;
  /** Yearly totals in the base unit (kWh, m³, kg), one per `historyYears`. */
  annual: number[];
  /** Reporting-year months in the base unit; null where no row was uploaded. */
  monthly: (number | null)[];
}

export interface SGHDataset {
  reportingYear: number;
  /** Up to five years ending at the reporting year. */
  historyYears: number[];
  /** Reporting-year emissions per source, tCO2e. */
  sources: EmissionSource[];
  /** Scope totals for the year before, tCO2e; null without data for that year. */
  previousScopes: { 1: number; 2: number; 3: number } | null;
  /** Total emissions per `historyYears`, tCO2e. */
  emissionsHistory: number[];
  blocks: BlockUtilities[];
  resources: ResourceSeries[];
  factors: { electricity?: EmissionFactor; water?: EmissionFactor };
  /** Months with any data in the reporting year. */
  monthsReported: number;
}

// ---------------------------------------------------------------------------
// Emission sources

const SOURCE_DEFS: { name: string; scope: 1 | 2 | 3; color: string; match: (r: ActivityRow) => boolean }[] = [
  { name: 'Stationary combustion', scope: 1, color: '#3E6A44', match: r => r.kind === 'fuel' },
  { name: 'Fugitive – refrigerant', scope: 1, color: '#62936A', match: r => r.kind === 'gases' && !isAnaesthetic(r.item) && !isFireSuppressant(r.item) },
  { name: 'Fugitive – anaesthetic gas', scope: 1, color: '#8FB896', match: r => r.kind === 'gases' && isAnaesthetic(r.item) },
  { name: 'Fugitive – fire suppressant', scope: 1, color: '#A9CBAE', match: r => r.kind === 'gases' && isFireSuppressant(r.item) },
  { name: 'Electricity purchased', scope: 2, color: '#3F6F80', match: r => r.kind === 'electricity' },
  { name: 'Waste generated', scope: 3, color: '#B9763F', match: r => r.kind === 'waste' },
  { name: 'Water supply & treatment', scope: 3, color: '#D8A67F', match: r => r.kind === 'water' },
];

function isAnaesthetic(gas: string) { return /desflurane|sevoflurane|isoflurane|n2o|nitrous/i.test(gas); }
function isFireSuppressant(gas: string) { return /^co2$|fm-?200|hfc-?227|novec/i.test(gas.trim()); }

/** tCO2e for one row; 0 when no emission factor matches (reported as a warning on upload). */
export const rowEmissions = (r: ActivityRow, factors: EmissionFactor[]) => ((findFactor(r.item, factors)?.value ?? 0) * r.quantity) / 1000;

// ---------------------------------------------------------------------------
// Dataset

const RESOURCE_DEFS: { key: ResourceKey; kind: ActivityKind; title: string; color: string; totalLabel: string }[] = [
  { key: 'energy', kind: 'electricity', title: 'Energy performance', color: '#047857', totalLabel: 'Total electricity use' },
  { key: 'water', kind: 'water', title: 'Water performance', color: '#1D4ED8', totalLabel: 'Total water use' },
  { key: 'waste', kind: 'waste', title: 'Waste performance', color: '#9A3412', totalLabel: 'Total waste' },
];

export const dataYears = (rows: ActivityRow[]) => [...new Set(rows.map(r => r.year))].sort((a, b) => a - b);

/** Rolls monthly rows up to the reporting year and the years before it. */
export function buildDataset(rows: ActivityRow[], factors: EmissionFactor[], reportingYear: number): SGHDataset {
  const historyYears = dataYears(rows).filter(y => y <= reportingYear).slice(-5);
  const inYear = (y: number) => rows.filter(r => r.year === y);
  const current = inYear(reportingYear);

  const scopeTotals = (yearRows: ActivityRow[]) => {
    const t = { 1: 0, 2: 0, 3: 0 };
    SOURCE_DEFS.forEach(d => { t[d.scope] += yearRows.filter(d.match).reduce((a, r) => a + rowEmissions(r, factors), 0); });
    return t;
  };

  const sources = SOURCE_DEFS
    .map(d => ({ name: d.name, scope: d.scope, color: d.color, tCO2e: current.filter(d.match).reduce((a, r) => a + rowEmissions(r, factors), 0) }))
    .filter(s => s.tCO2e > 0);

  const previousRows = inYear(reportingYear - 1);
  const emissionsHistory = historyYears.map(y => inYear(y).reduce((a, r) => a + rowEmissions(r, factors), 0));

  const blockMap = new Map<string, BlockUtilities>();
  current.filter(r => r.block && (r.kind === 'electricity' || r.kind === 'water')).forEach(r => {
    const b = blockMap.get(r.block!) ?? { name: r.block!, electricityKWh: 0, waterM3: 0 };
    if (r.kind === 'electricity') b.electricityKWh += r.quantity; else b.waterM3 += r.quantity;
    blockMap.set(r.block!, b);
  });

  const resources = RESOURCE_DEFS.map(d => {
    const of = (yearRows: ActivityRow[]) => yearRows.filter(r => r.kind === d.kind);
    const months = Array.from({ length: 12 }, (_, m) => of(current).filter(r => r.month === m));
    return {
      key: d.key, title: d.title, color: d.color, totalLabel: d.totalLabel,
      annual: historyYears.map(y => of(inYear(y)).reduce((a, r) => a + r.quantity, 0)),
      monthly: months.map(ms => (ms.length ? ms.reduce((a, r) => a + r.quantity, 0) : null)),
    };
  });

  return {
    reportingYear, historyYears, sources,
    previousScopes: previousRows.length ? scopeTotals(previousRows) : null,
    emissionsHistory,
    blocks: [...blockMap.values()],
    resources,
    factors: { electricity: findFactor('Electricity Grid', factors), water: findFactor('Water Consumption', factors) },
    monthsReported: new Set(current.map(r => r.month)).size,
  };
}

// ---------------------------------------------------------------------------
// Formatting and projections

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
export const fmtK = (n: number) => (Math.abs(n) < 0.5 ? '0' : (n / 1000).toFixed(1) + 'k');
/** null when there is nothing to compare with. */
export const pctChange = (cur: number, prev: number | null | undefined) => (prev ? (cur - prev) / prev : null);

/** Axis maximum and ticks rounded to 1, 2, 2.5 or 5 × a power of ten, at most five intervals. */
export function niceScale(max: number) {
  if (max <= 0) return { max: 1, ticks: [0, 1] };
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * pow).find(s => max / s <= 5)!;
  const top = Math.ceil(max / step) * step;
  return { max: top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toFixed(6)) };
}

/** Years from the reporting year to the horizon (the first point is the latest actual). */
export const projectionYears = (reportingYear: number) =>
  Array.from({ length: Math.max(ASSUMPTIONS.horizon - reportingYear, 0) + 1 }, (_, k) => reportingYear + k);

/** Latest actual grown at the BAU rate each year. */
export const bauPath = (last: number, steps: number) => Array.from({ length: steps }, (_, k) => last * (1 + ASSUMPTIONS.bauGrowth) ** k);

/** Least-squares yearly slope of the history, continued from the latest actual; never below zero. */
export function trendPath(history: number[], steps: number) {
  const n = history.length, last = history[n - 1];
  if (n < 2) return Array(steps).fill(last);
  const xm = (n - 1) / 2, ym = history.reduce((a, b) => a + b, 0) / n;
  const slope = history.reduce((a, y, i) => a + (i - xm) * (y - ym), 0) / history.reduce((a, _, i) => a + (i - xm) ** 2, 0);
  return Array.from({ length: steps }, (_, k) => Math.max(last + slope * k, 0));
}

/** Straight line from the latest actual to `end` at the horizon. */
export const linePath = (start: number, end: number, steps: number) =>
  Array.from({ length: steps }, (_, k) => (steps > 1 ? start + ((end - start) * k) / (steps - 1) : start));

export function computeOverview(data: SGHDataset) {
  const scopeTotal = (s: 1 | 2 | 3) => data.sources.filter(x => x.scope === s).reduce((a, x) => a + x.tCO2e, 0);
  const scopes = ([1, 2, 3] as const).map(s => ({ scope: s, value: scopeTotal(s), previous: data.previousScopes?.[s] ?? null }));
  const total = scopes.reduce((a, s) => a + s.value, 0);
  const history = data.emissionsHistory;
  const previous = data.previousScopes ? history[history.length - 2] ?? null : null;

  const projYears = projectionYears(data.reportingYear);
  const target2030 = history[0] * (1 - ASSUMPTIONS.emissionsReduction2030);
  const bau = bauPath(total, projYears.length);
  const predicted = trendPath(history, projYears.length);
  const i2030 = projYears.indexOf(2030);

  const largest = [...data.sources].sort((a, b) => b.tCO2e - a.tCO2e)[0];

  return {
    total, previous, yoy: pctChange(total, previous), scopes, history, projYears,
    bau, predicted, target2030, predicted2030: i2030 >= 0 ? predicted[i2030] : null,
    largest,
  };
}

export type Overview = ReturnType<typeof computeOverview>;

/** Electricity (Scope 2) and water (Scope 3) emissions per block in tCO2e, highest first. */
export function computeBlocks(data: SGHDataset) {
  const ef = (f?: EmissionFactor) => f?.value ?? 0;
  return data.blocks
    .map(b => {
      const electricity = (b.electricityKWh * ef(data.factors.electricity)) / 1000;
      const water = (b.waterM3 * ef(data.factors.water)) / 1000;
      return { ...b, electricity, water, total: electricity + water };
    })
    .sort((a, b) => b.total - a.total);
}

export type BlockRow = ReturnType<typeof computeBlocks>[number];

// ---------------------------------------------------------------------------
// Building parameters and indices

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
  water: { label: 'Water Efficiency Index', unit: 'L/person-day', formula: 'Water (m³) × 1,000 ÷ Σ (visitors + occupants per day) × operational days', provisional: true, decimals: 1 },
  waste: { label: 'Waste Disposal Index', unit: 'kg/person-day', formula: 'Waste (kg) ÷ Σ (visitors + occupants per day) × operational days', provisional: true, decimals: 3 },
} as const;

/** Base unit (kWh, m³, kg) to the unit in the index numerator. */
const NUMERATOR = { energy: 1, water: 1000, waste: 1 } as const;

function indexValue(key: ResourceKey, annual: number | undefined, p: YearParameters | undefined): number | null {
  if (!p || annual === undefined) return null;
  const denominator = key === 'energy' ? p.gfaM2 : personDays(p);
  return denominator > 0 ? (annual * NUMERATOR[key]) / denominator : null;
}

/** Index for the reporting year and the year before; null where data or parameters are missing. */
export function computeIndices(data: SGHDataset, params: Record<number, YearParameters>) {
  const n = data.historyYears.length;
  const hasPrevious = data.historyYears[n - 2] === data.reportingYear - 1;
  return Object.fromEntries(data.resources.map(r => [r.key, {
    ...INDEX_DEFINITIONS[r.key],
    current: indexValue(r.key, r.annual[n - 1], params[data.reportingYear]),
    previous: hasPrevious ? indexValue(r.key, r.annual[n - 2], params[data.reportingYear - 1]) : null,
  }])) as Record<ResourceKey, ResourceIndex>;
}

export type ResourceIndex = (typeof INDEX_DEFINITIONS)[ResourceKey] & { current: number | null; previous: number | null };
