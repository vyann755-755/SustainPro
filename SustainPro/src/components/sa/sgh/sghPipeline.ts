/**
 * SGH source-data pipeline: workbook template → parsing and checks → activity rows.
 *
 * One workbook holds one sheet per data type, one row per month (and block for
 * electricity and water). Emission factors use the same columns as the CWS
 * "Data Rows" bulk-upload template, so SGH's Data_Rows_Template.xlsx can be
 * uploaded as it is.
 */
import * as XLSX from 'xlsx';
import { daysInMonth, type YearParameters } from './sghData';

export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface EmissionFactor {
  uid: string;
  name: string;
  /** kgCO2e per functional unit. */
  value: number;
  unit: string;
  reference: string;
}

/** Values from SGH's Data_Rows_Template.xlsx, used when no emission factor sheet is uploaded. */
export const DEFAULT_EMISSION_FACTORS: EmissionFactor[] = [
  { uid: 'EF-2027-00005', name: 'Electricity Grid', value: 0.402, unit: 'kWh', reference: 'EMA 2026' },
  { uid: 'EF-2027-00006', name: 'Water Consumption', value: 0.5662, unit: 'm3', reference: 'SEFR 2026' },
  { uid: 'EF-2027-00007', name: 'General Waste', value: 0.1114606, unit: 'kg', reference: 'SEFR 2026' },
  { uid: 'EF-2027-00008', name: 'Diesel Consumption', value: 3.196749, unit: 'liters', reference: 'SEFR 2026' },
  { uid: 'EF-2027-00009', name: 'Desflurane', value: 2540, unit: 'kg', reference: 'IPCC AR6' },
  { uid: 'EF-2027-00010', name: 'R410A', value: 1923, unit: 'kg', reference: 'IPCC AR6' },
  { uid: 'EF-2027-00011', name: 'R22', value: 1760, unit: 'kg', reference: 'IPCC AR6' },
  { uid: 'EF-2027-00012', name: 'N2O', value: 273, unit: 'kg', reference: 'IPCC AR6' },
  { uid: 'EF-2027-00013', name: 'Medical Waste', value: 0.1114606, unit: 'kg', reference: 'DEFRA 2025' },
  { uid: 'EF-2027-00014', name: 'Recyclables Plastic', value: 0.004685684, unit: 'kg', reference: 'DEFRA 2025' },
  { uid: 'EF-2027-00015', name: 'Recyclables Metal', value: 0.004685684, unit: 'kg', reference: 'DEFRA 2025' },
  { uid: 'EF-2027-00016', name: 'Recyclables E-waste', value: 0.004685684, unit: 'kg', reference: 'DEFRA 2025' },
  { uid: 'EF-2027-00017', name: 'Recyclables Horticultural Waste', value: 0.00898311, unit: 'kg', reference: 'DEFRA 2025' },
  { uid: 'EF-2027-00018', name: 'Recyclables Glass', value: 0.004685684, unit: 'kg', reference: 'DEFRA 2025' },
  { uid: 'EF-2027-00019', name: 'Recyclables Textile', value: 0.004685684, unit: 'kg', reference: 'DEFRA 2025' },
  { uid: 'EF-2027-00020', name: 'Recyclables Food Waste', value: 0.00898311, unit: 'kg', reference: 'DEFRA 2025' },
  { uid: 'EF-2027-00021', name: 'CO2', value: 1, unit: 'kg', reference: 'IPCC AR6' },
];

export type ActivityKind = 'electricity' | 'water' | 'waste' | 'fuel' | 'gases';
export type SheetKind = ActivityKind | 'gfa' | 'occupancy' | 'factors';

/** One month of one item: a block's meter reading, a waste stream, a fuel or a gas. */
export interface ActivityRow {
  kind: ActivityKind;
  year: number;
  /** 0 = January. */
  month: number;
  /** Electricity and water only. */
  block?: string;
  /** Emission factor name the quantity is multiplied by. */
  item: string;
  quantity: number;
}

interface SheetSpec {
  kind: SheetKind;
  sheet: string;
  required: boolean;
  description: string;
  columns: string[];
  /** Header patterns, in column order, used to find each column in an uploaded sheet. */
  patterns: RegExp[];
  /** Matches the sheet name. */
  name: RegExp;
}

const EF_COLUMNS = ['EF UID*', 'EF Name (for reference - read only)', 'Value*', 'Impact Category*', 'Impact Unit*', 'Functional Unit*',
  'Reference Name*', 'Reference URL', 'Country*', 'Region*', 'Reference Date (YYYY-MM-DD)*'];

export const SHEET_SPECS: SheetSpec[] = [
  { kind: 'electricity', sheet: 'Electricity', required: true, description: 'kWh per block per month',
    columns: ['Year', 'Month', 'Block', 'Electricity (kWh)'], patterns: [/^year/i, /^month/i, /block/i, /kwh|electric|consumption/i], name: /electric/i },
  { kind: 'water', sheet: 'Water', required: true, description: 'm³ per block per month',
    columns: ['Year', 'Month', 'Block', 'Water (m3)'], patterns: [/^year/i, /^month/i, /block/i, /m3|m³|water|consumption/i], name: /^water/i },
  { kind: 'waste', sheet: 'Waste', required: true, description: 'kg per waste stream per month',
    columns: ['Year', 'Month', 'Waste stream', 'Quantity (kg)'], patterns: [/^year/i, /^month/i, /stream|waste|type/i, /quantity|kg/i], name: /waste/i },
  { kind: 'fuel', sheet: 'Fuel', required: true, description: 'Litres of stationary fuel per month',
    columns: ['Year', 'Month', 'Fuel', 'Quantity (litres)'], patterns: [/^year/i, /^month/i, /^fuel|type/i, /quantity|litre|liter/i], name: /fuel|diesel/i },
  { kind: 'gases', sheet: 'Refrigerants & Gases', required: true, description: 'kg of refrigerant, anaesthetic and fire suppressant gas per month',
    columns: ['Year', 'Month', 'Gas', 'Quantity (kg)'], patterns: [/^year/i, /^month/i, /^gas|refrigerant|type/i, /quantity|kg/i], name: /gas|refrig/i },
  { kind: 'gfa', sheet: 'GFA', required: false, description: 'Gross floor area per year (or enter it in the app)',
    columns: ['Year', 'GFA (m2)'], patterns: [/^year/i, /gfa|floor area/i], name: /gfa|floor/i },
  { kind: 'occupancy', sheet: 'Occupancy', required: false, description: 'Operational days, visitors and occupants per month (or enter them in the app)',
    columns: ['Year', 'Month', 'Operational days', 'Avg visitors per day', 'Avg occupants per day'],
    patterns: [/^year/i, /^month/i, /operational|days/i, /visitor/i, /occupant/i], name: /occupan/i },
  { kind: 'factors', sheet: 'Emission Factors', required: false, description: 'CWS Data Rows format; built-in SGH factors are used if absent',
    columns: EF_COLUMNS, patterns: [/ef uid/i, /ef name/i, /^value/i, /impact category/i, /impact unit/i, /functional unit/i, /reference name/i], name: /emission factor|data rows/i },
];

export const specFor = (kind: SheetKind) => SHEET_SPECS.find(s => s.kind === kind)!;

/** Sheets in the template or the CWS Data Rows file that carry no data. */
const IGNORED_SHEETS = /instruction|allowed functional|^lists$|read ?me/i;

// ---------------------------------------------------------------------------
// Parsing

export interface SheetIssue { level: 'Error' | 'Warning'; text: string }

export interface ParsedSheet {
  file: string;
  sheet: string;
  kind: SheetKind | null;
  ignored: boolean;
  rows: number;
  years: number[];
  /** Months with data in the latest year. */
  latestMonths: number[];
  blocks: string[];
  items: string[];
  issues: SheetIssue[];
  activity: ActivityRow[];
  factors: EmissionFactor[];
  gfa: { year: number; gfaM2: number }[];
  occupancy: { year: number; month: number; operationalDays: number; visitorsPerDay: number; occupantsPerDay: number }[];
  /** Raw cells, kept so the sheet can be re-read when its data type is changed by hand. */
  aoa: unknown[][];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function toNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const s = v.replace(/^Example:\s*/i, '').replace(/,/g, '').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toMonth(v: unknown): number | null {
  if (v instanceof Date) return v.getMonth();
  const n = toNumber(v);
  if (n !== null) return n >= 1 && n <= 12 && Number.isInteger(n) ? n - 1 : null;
  if (typeof v === 'string') {
    const i = MONTH_LABELS.findIndex(m => v.trim().toLowerCase().startsWith(m.toLowerCase()));
    return i >= 0 ? i : null;
  }
  return null;
}

function toYear(v: unknown, monthCell: unknown): number | null {
  const n = toNumber(v);
  if (n !== null && Number.isInteger(n) && n >= 2000 && n <= 2100) return n;
  return monthCell instanceof Date ? monthCell.getFullYear() : null;
}

const text = (v: unknown) => (v === null || v === undefined ? '' : String(v).replace(/^Example:\s*/i, '').trim());

function toBlock(v: unknown): string {
  const s = text(v);
  if (!s) return '';
  const m = s.match(/^(?:block|blk)?\s*([0-9]+[a-z]?)$/i);
  return m ? `Block ${m[1].toUpperCase()}` : s;
}

/** "functional_units: [{"name":"kWh"}]" (as exported by CWS) or plain "kWh". */
export function toFunctionalUnit(v: unknown): string {
  const s = text(v);
  return s.match(/"name"\s*:\s*"([^"]+)"/)?.[1] ?? s;
}

function detectKind(sheetName: string, header: string[]): SheetKind | null {
  const byName = SHEET_SPECS.find(s => s.name.test(sheetName));
  if (byName) return byName.kind;
  const h = header.join(' | ');
  if (/ef uid/i.test(h)) return 'factors';
  if (/visitor/i.test(h) && /occupant/i.test(h)) return 'occupancy';
  if (/gfa|floor area/i.test(h)) return 'gfa';
  if (/kwh/i.test(h)) return 'electricity';
  if (/stream/i.test(h)) return 'waste';
  if (/m3|m³/i.test(h)) return 'water';
  if (/fuel|litre|liter/i.test(h)) return 'fuel';
  if (/gas|refrigerant/i.test(h)) return 'gases';
  return null;
}

/** Electricity and water carry a fixed emission factor; other sheets name their item in a column. */
const FIXED_ITEM: Partial<Record<ActivityKind, string>> = { electricity: 'Electricity Grid', water: 'Water Consumption' };

export function parseSheet(file: string, sheet: string, aoa: unknown[][], kindOverride?: SheetKind | null): ParsedSheet {
  const base: ParsedSheet = { file, sheet, kind: null, ignored: false, rows: 0, years: [], latestMonths: [], blocks: [], items: [], issues: [], activity: [], factors: [], gfa: [], occupancy: [], aoa };
  if (kindOverride === undefined && IGNORED_SHEETS.test(sheet)) return { ...base, ignored: true };
  const headerIdx = aoa.slice(0, 10).findIndex(r => r.some(c => /^year$|^year\b|ef uid/i.test(text(c))));
  const header = headerIdx >= 0 ? aoa[headerIdx].map(text) : [];
  const kind = kindOverride !== undefined ? kindOverride : detectKind(sheet, header);
  if (!kind) {
    const ignored = IGNORED_SHEETS.test(sheet) || headerIdx < 0;
    return { ...base, ignored, issues: ignored ? [] : [{ level: 'Warning', text: 'Data type not recognised; choose one or the sheet is not used.' }] };
  }
  const spec = specFor(kind);
  if (headerIdx < 0) return { ...base, kind, issues: [{ level: 'Error', text: `Header row not found. Expected columns: ${spec.columns.join(', ')}.` }] };

  // Locate each expected column by its header; the first unused match wins.
  const used = new Set<number>();
  const cols = spec.patterns.map(p => {
    const i = header.findIndex((h, j) => !used.has(j) && p.test(h));
    if (i >= 0) used.add(i);
    return i;
  });
  const missing = spec.columns.filter((c, i) => cols[i] < 0 && (kind !== 'factors' || i !== 1) && !(kind === 'factors' && i > 2 && i !== 5));
  if (missing.length) return { ...base, kind, issues: [{ level: 'Error', text: `Missing column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}.` }] };

  const out: ParsedSheet = { ...base, kind };
  const skipped: string[] = [];
  const body = aoa.slice(headerIdx + 1).filter(r => r.some(c => text(c) !== ''));
  body.forEach((r, i) => {
    const rowNo = headerIdx + 2 + i;
    const cell = (k: number) => r[cols[k]];
    if (kind === 'factors') {
      const uid = text(cell(0));
      const value = toNumber(cell(2));
      if (!uid || value === null) { skipped.push(`row ${rowNo}: ${!uid ? 'EF UID' : 'Value'} missing`); return; }
      const known = DEFAULT_EMISSION_FACTORS.find(f => f.uid === uid);
      const name = text(cols[1] >= 0 ? cell(1) : '') || known?.name || uid;
      out.factors.push({ uid, name, value, unit: toFunctionalUnit(cell(5)), reference: text(cols[6] >= 0 ? cell(6) : '') });
      return;
    }
    const year = toYear(cell(0), kind === 'gfa' ? null : cell(1));
    if (year === null) { skipped.push(`row ${rowNo}: year missing or invalid`); return; }
    if (kind === 'gfa') {
      const gfa = toNumber(cell(1));
      if (gfa === null || gfa <= 0) { skipped.push(`row ${rowNo}: GFA missing`); return; }
      out.gfa.push({ year, gfaM2: gfa });
      return;
    }
    const month = toMonth(cell(1));
    if (month === null) { skipped.push(`row ${rowNo}: month missing or invalid`); return; }
    if (kind === 'occupancy') {
      const [days, visitors, occupants] = [toNumber(cell(2)), toNumber(cell(3)), toNumber(cell(4))];
      if (days === null || visitors === null || occupants === null) { skipped.push(`row ${rowNo}: a value is missing`); return; }
      if (days > daysInMonth(year, month)) out.issues.push({ level: 'Warning', text: `${MONTH_LABELS[month]} ${year}: ${days} operational days is more than the days in the month.` });
      out.occupancy.push({ year, month, operationalDays: days, visitorsPerDay: visitors, occupantsPerDay: occupants });
      return;
    }
    const quantity = toNumber(cell(3));
    if (quantity === null || quantity < 0) { skipped.push(`row ${rowNo}: quantity missing or negative`); return; }
    const fixed = FIXED_ITEM[kind];
    const block = fixed ? toBlock(cell(2)) : undefined;
    if (fixed && !block) { skipped.push(`row ${rowNo}: block missing`); return; }
    const item = fixed ?? text(cell(2));
    if (!item) { skipped.push(`row ${rowNo}: ${spec.columns[2].toLowerCase()} missing`); return; }
    out.activity.push({ kind, year, month, block, item, quantity });
  });

  if (skipped.length) out.issues.push({ level: 'Warning', text: `${skipped.length} row${skipped.length > 1 ? 's' : ''} skipped (${skipped.slice(0, 3).join('; ')}${skipped.length > 3 ? '; …' : ''}).` });
  const dated = [...out.activity, ...out.occupancy];
  out.rows = out.activity.length + out.factors.length + out.gfa.length + out.occupancy.length;
  out.years = [...new Set([...dated.map(d => d.year), ...out.gfa.map(g => g.year)])].sort();
  const latest = out.years[out.years.length - 1];
  out.latestMonths = [...new Set(dated.filter(d => d.year === latest).map(d => d.month))].sort((a, b) => a - b);
  if (dated.length && out.latestMonths.length < 12) {
    out.issues.push({ level: 'Warning', text: `${latest} has ${out.latestMonths.length} of 12 months; missing months count as zero.` });
  }
  out.blocks = [...new Set(out.activity.map(a => a.block).filter(Boolean) as string[])].sort();
  out.items = [...new Set(out.activity.map(a => a.item))];
  if (out.rows === 0) out.issues.push({ level: 'Error', text: 'No data rows found under the header.' });
  return out;
}

export async function parseFile(file: File): Promise<ParsedSheet[]> {
  const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
  return wb.SheetNames.map(name => parseSheet(file.name, name, XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, blankrows: false, defval: null })));
}

// ---------------------------------------------------------------------------
// Emission factor matching and checks across sheets

const EXPECTED_UNIT: Record<ActivityKind, RegExp> = { electricity: /^kwh$/i, water: /^m3$|^m³$/i, waste: /^kg$/i, fuel: /^l$|^litres?$|^liters?$/i, gases: /^kg$/i };

/** Exact name match first, then a factor whose name starts with the item (e.g. "Diesel" → "Diesel Consumption"). */
export function findFactor(item: string, factors: EmissionFactor[]): EmissionFactor | undefined {
  const n = norm(item);
  return factors.find(f => norm(f.name) === n) ?? factors.find(f => norm(f.name).startsWith(n));
}

/** Uploaded factors replace the built-in ones with the same UID; others are added. */
export function mergeFactors(uploaded: EmissionFactor[]): EmissionFactor[] {
  const byUid = new Map(DEFAULT_EMISSION_FACTORS.map(f => [f.uid, f]));
  uploaded.forEach(f => byUid.set(f.uid, f));
  return [...byUid.values()];
}

export function crossSheetIssues(sheets: ParsedSheet[], factors: EmissionFactor[]): SheetIssue[] {
  const issues: SheetIssue[] = [];
  const active = sheets.filter(s => s.kind && !s.ignored);
  SHEET_SPECS.filter(s => s.required).forEach(spec => {
    const found = active.filter(s => s.kind === spec.kind && s.rows > 0);
    if (!found.length) issues.push({ level: 'Error', text: `${spec.sheet} data is missing.` });
    if (found.length > 1) issues.push({ level: 'Warning', text: `${spec.sheet} data found in ${found.length} sheets; their rows are added together.` });
  });
  const items = new Map<string, ActivityKind>();
  active.forEach(s => s.activity.forEach(a => items.set(a.item, a.kind)));
  items.forEach((kind, item) => {
    const f = findFactor(item, factors);
    if (!f) issues.push({ level: 'Warning', text: `No emission factor for “${item}”; it is left out of emissions${kind === 'waste' ? ' but counted in total waste' : ''}.` });
    else if (!EXPECTED_UNIT[kind].test(f.unit)) issues.push({ level: 'Warning', text: `Emission factor “${f.name}” is per ${f.unit}, but ${specFor(kind).sheet} quantities are in ${specFor(kind).columns[3].match(/\(([^)]+)\)/)?.[1]}.` });
  });
  return issues;
}

export const parameterSheetsPresent = (sheets: ParsedSheet[]) => sheets.some(s => s.gfa.length > 0 || s.occupancy.length > 0);

/** Parameters from GFA and Occupancy sheets, by year. Months without a row keep their current values. */
export function parametersFromSheets(sheets: ParsedSheet[], current: Record<number, YearParameters>, empty: (year: number) => YearParameters) {
  const next: Record<number, YearParameters> = {};
  const touch = (year: number) => (next[year] ??= structuredClone(current[year] ?? empty(year)));
  sheets.forEach(s => {
    s.gfa.forEach(g => { touch(g.year).gfaM2 = g.gfaM2; });
    s.occupancy.forEach(o => { touch(o.year).monthly[o.month] = { operationalDays: o.operationalDays, visitorsPerDay: o.visitorsPerDay, occupantsPerDay: o.occupantsPerDay }; });
  });
  return next;
}

// ---------------------------------------------------------------------------
// Template and sample workbooks

function factorRows(factors: EmissionFactor[]) {
  return factors.map(f => [f.uid, f.name, f.value, 'Climate Change - total', 'kgCO2e', f.unit, f.reference, 'NA', 'Singapore', 'APAC', '2026-01-15']);
}

const INSTRUCTIONS = [
  ['SGH SUSTAINABILITY DATA - SOURCE WORKBOOK'],
  [],
  ['One sheet per data type. Keep the sheet names and header row; add one row per month (and per block for electricity and water).'],
  ['Month can be 1-12, Jan-Dec or a date. Quantities are numbers without units. Rows for the same month and item are added together.'],
  [],
  ['Sheet', 'Required', 'What to enter'],
  ...SHEET_SPECS.map(s => [s.sheet, s.required ? 'Yes' : 'Optional', `${s.description}. Columns: ${s.columns.join(', ')}`]),
  [],
  ['Waste stream, Fuel and Gas names must match an emission factor name, e.g. General Waste, Medical Waste, Diesel, R410A, Desflurane, N2O.'],
  ['Emissions (tCO2e) = quantity x emission factor (kgCO2e per unit) / 1,000.'],
];

function sheetWithWidths(rows: unknown[][]) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = (rows[0] ?? []).map(h => ({ wch: Math.max(12, String(h ?? '').length + 2) }));
  return ws;
}

/** Blank template: headers only, plus the built-in emission factors to review. */
export function buildTemplateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(INSTRUCTIONS), 'Instructions');
  SHEET_SPECS.forEach(s => XLSX.utils.book_append_sheet(wb, sheetWithWidths([s.columns, ...(s.kind === 'factors' ? factorRows(DEFAULT_EMISSION_FACTORS) : [])]), s.sheet));
  return wb;
}

/** Deterministic pseudo-random numbers so the sample workbook is the same every time. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SAMPLE_YEARS = [2021, 2022, 2023, 2024, 2025];
const SEASON = [0.95, 0.9, 1.0, 1.0, 1.04, 1.06, 1.05, 1.07, 1.03, 1.0, 0.97, 0.93];
const YEAR_TREND: Record<ActivityKind, number[]> = {
  electricity: [0.97, 0.99, 1.0, 1.02, 0.955],
  water: [0.98, 0.99, 1.0, 1.0, 0.95],
  waste: [0.99, 1.0, 1.0, 1.0, 0.93],
  fuel: [1.0, 1.01, 1.0, 1.0, 0.92],
  gases: [1.0, 1.02, 1.0, 1.03, 0.9],
};
const SAMPLE_MONTHLY: Record<ActivityKind, [string, number][]> = {
  electricity: [['Block 1', 560_000], ['Block 2', 480_000], ['Block 3', 450_000], ['Block 4', 400_000], ['Block 5', 330_000]],
  water: [['Block 1', 3_200], ['Block 2', 3_900], ['Block 3', 3_900], ['Block 4', 5_400], ['Block 5', 3_100]],
  waste: [['General Waste', 68_000], ['Medical Waste', 24_000], ['Recyclables Plastic', 3_200], ['Recyclables Metal', 900], ['Recyclables E-waste', 250],
    ['Recyclables Horticultural Waste', 1_600], ['Recyclables Glass', 450], ['Recyclables Textile', 700], ['Recyclables Food Waste', 5_200]],
  fuel: [['Diesel', 18_000]],
  gases: [['R410A', 28], ['R22', 9], ['Desflurane', 14], ['N2O', 210], ['CO2', 150]],
};

/** Sample source data for FY2021–FY2025 in the template layout. */
export function buildSampleWorkbook(): XLSX.WorkBook {
  const rand = seeded(2025);
  const noise = (pct: number) => 1 + (rand() * 2 - 1) * pct;
  const wb = buildTemplateWorkbook();
  (Object.keys(SAMPLE_MONTHLY) as ActivityKind[]).forEach(kind => {
    const spec = specFor(kind);
    const rows: unknown[][] = [spec.columns];
    SAMPLE_YEARS.forEach((year, yi) => MONTH_LABELS.forEach((label, m) => SAMPLE_MONTHLY[kind].forEach(([name, base]) => {
      const q = base * YEAR_TREND[kind][yi] * SEASON[m] * noise(0.03);
      rows.push([year, label, name, kind === 'gases' ? Math.round(q * 10) / 10 : Math.round(q)]);
    })));
    wb.Sheets[spec.sheet] = sheetWithWidths(rows);
  });
  const visitors = [8_500, 8_800, 9_100, 9_200, 9_000];
  wb.Sheets[specFor('gfa').sheet] = sheetWithWidths([specFor('gfa').columns, ...SAMPLE_YEARS.map(y => [y, 175_300])]);
  wb.Sheets[specFor('occupancy').sheet] = sheetWithWidths([specFor('occupancy').columns,
    ...SAMPLE_YEARS.flatMap((y, yi) => MONTH_LABELS.map((label, m) => [y, label, daysInMonth(y, m), Math.round(visitors[yi] * noise(0.03) / 10) * 10, Math.round(6_000 * noise(0.02) / 10) * 10]))]);
  return wb;
}

/** Reads a workbook built in memory, through the same path as an uploaded file. */
export function parseWorkbook(wb: XLSX.WorkBook, fileName: string): ParsedSheet[] {
  const copy = XLSX.read(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }), { cellDates: true });
  return copy.SheetNames.map(name => parseSheet(fileName, name, XLSX.utils.sheet_to_json<unknown[]>(copy.Sheets[name], { header: 1, blankrows: false, defval: null })));
}

export const SAMPLE_FILE_NAME = 'SGH_Sample_Source_Data_FY2021-2025.xlsx';
export const TEMPLATE_FILE_NAME = 'SGH_Source_Data_Template.xlsx';
