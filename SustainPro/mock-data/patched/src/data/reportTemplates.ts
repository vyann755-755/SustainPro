/**
 * SustainPro — Report Templates (GRI + ISO 14064-1)
 * ==================================================
 * Single source of truth for the row structure of the GRI GHG Report and
 * ISO 14064-1 Report. Mirrors `Sample GRI.xlsx` and `Sample ISO.xlsx`
 * row-for-row, so PDFs / in-app tables / future Excel exports all stay
 * aligned automatically.
 *
 * Empty data rows still render — values are shown as "—".
 */

// ─────────────────────────────────────────────────────────────────────────────
// GRI GHG REPORT  (mirrors Sample GRI.xlsx, GHG section only)
// ─────────────────────────────────────────────────────────────────────────────
export interface GRIRow {
  type: 'scope-header' | 'category';
  scope: '1' | '2' | '3';
  category?: string;     // e.g. "305.1.1" — undefined for scope headers
  name: string;          // displayed in the "Reporting category" column
}

export const griGHGTemplate: GRIRow[] = [
  // Scope 1
  { type: 'scope-header', scope: '1', name: 'GRI 305-1 Direct GHG emissions (Scope 1) ' },
  { type: 'category', scope: '1', category: '305.1.1', name: 'Table-1 : Stationary Combustion' },
  { type: 'category', scope: '1', category: '305.1.2', name: 'Table-2 : Mobile Combustion' },
  { type: 'category', scope: '1', category: '305.1.3', name: 'Table-3 : Fugitive Emissions - Refrigerent' },
  { type: 'category', scope: '1', category: '305.2.4', name: 'Table-4 : Fugitive Emissions - Fire Suppressant' },
  { type: 'category', scope: '1', category: '305.1.5', name: 'Table-5 : Fugitive Emissions - Electrical Insulating Gas' },
  { type: 'category', scope: '1', category: '305.2.6', name: 'Table-6 : Fugitive Emissions - Anesthetic Gas' },
  { type: 'category', scope: '1', category: '305.1.7', name: 'Table-7 : Fugitive Emissions - Waste Water Treatment' },

  // Scope 2
  { type: 'scope-header', scope: '2', name: 'GRI 305-2 Indirect GHG emissions (Scope 2) ' },
  { type: 'category', scope: '2', category: '305.2.8', name: 'Table 8. Electricity purchased: Location-based' },
  { type: 'category', scope: '2', category: '305.2.9', name: 'Table 9. Electricity purchased: Market-based' },
  { type: 'category', scope: '2', category: '305.2.10', name: 'Table 10. Electricity sold' },

  // Scope 3
  { type: 'scope-header', scope: '3', name: 'GRI 305-3 Indirect GHG emissions (Scope 3) ' },
  { type: 'category', scope: '3', category: '305.3.1', name: 'Cat. 1: Purchased goods and services' },
  { type: 'category', scope: '3', category: '305.3.2', name: 'Cat. 2: Capital goods' },
  { type: 'category', scope: '3', category: '305.3.3', name: 'Cat. 3: Fuel- and energy-related' },
  { type: 'category', scope: '3', category: '305.3.4', name: 'Cat. 4: Upstream Transportation and Distribution' },
  { type: 'category', scope: '3', category: '305.3.5', name: 'Cat. 5: Waste generated in operations' },
  { type: 'category', scope: '3', category: '305.3.6', name: 'Cat. 6: Business Travel' },
  { type: 'category', scope: '3', category: '305.3.7', name: 'Cat. 7: Employee Commuting' },
  { type: 'category', scope: '3', category: '305.3.8', name: 'Cat 8: Upstream Leased Assets' },
  { type: 'category', scope: '3', category: '305.3.9', name: 'Cat. 9: Downstream Transportation and Distribution' },
  { type: 'category', scope: '3', category: '305.3.10', name: 'Cat 10: Processing of sold products' },
  { type: 'category', scope: '3', category: '305.3.11', name: 'Cat. 11: Use of Sold Products' },
  { type: 'category', scope: '3', category: '305.3.12', name: 'Cat. 12: End-of-life treatment of sold products' },
  { type: 'category', scope: '3', category: '305.3.13', name: 'Cat. 13: Downstream Leased Assets' },
  { type: 'category', scope: '3', category: '305.3.14', name: 'Cat 14: Franchises' },
  { type: 'category', scope: '3', category: '305.3.15', name: 'Cat 15: Investments' },
];

// ─────────────────────────────────────────────────────────────────────────────
// ISO 14064-1 REPORT  (mirrors Sample ISO.xlsx)
// ─────────────────────────────────────────────────────────────────────────────
// Categories 1–6, plus the totals/removals/liabilities footers.

export interface ISORow {
  type: 'category-header' | 'sub-row' | 'spacer' | 'total' | 'section';
  number?: string;          // "1", "1.1", "2", etc.
  name: string;
  notes?: string;
  /** GRI sub-categories that aggregate into this ISO row */
  griCategoryUIDs?: string[];
}

export const isoTemplate: ISORow[] = [
  // ── Category 1 ──
  { type: 'category-header', number: '1', name: 'Category 1: Direct GHG emissions and removals' },
  { type: 'sub-row',  number: '1.1', name: 'Direct emissions from stationary combustion', griCategoryUIDs: ['305.1.1'] },
  { type: 'sub-row',  number: '1.2', name: 'Direct emissions from mobile combustion',     griCategoryUIDs: ['305.1.2'] },
  { type: 'sub-row',  number: '1.3', name: 'Direct process emissions and removals arise from industrial processes', notes: 'A3+A4+A5', griCategoryUIDs: ['305.2.4', '305.1.5', '305.2.6'] },
  { type: 'sub-row',  number: '1.4', name: 'Direct fugitive emissions arise from the release of greenhouse gases in anthropogenic systems', griCategoryUIDs: ['305.1.3', '305.1.7'] },
  { type: 'sub-row',  number: '1.5', name: 'Direct emissions and removals from Land Use, Land Use Change and Forestry' },
  { type: 'sub-row',  number: '1.6', name: 'Direct emissions in tonnes of CO2 from biomass' },
  { type: 'spacer',   name: '' },

  // ── Category 2 ──
  { type: 'category-header', number: '2', name: 'Category 2: Indirect GHG emissions from imported energy' },
  { type: 'sub-row',  number: '2.1', name: 'Indirect emissions from imported electricity', griCategoryUIDs: ['305.2.8'] },
  { type: 'sub-row',  number: '2.2', name: 'Indirect emissions from imported energy',     griCategoryUIDs: ['305.2.9'] },
  { type: 'spacer',   name: '' },

  // ── Category 3 ──
  { type: 'category-header', number: '3', name: 'Category 3: Indirect GHG emissions from Transportation' },
  { type: 'sub-row',  number: '3.1', name: 'Emissions from upstream transportation and distribution of goods',   griCategoryUIDs: ['305.3.4'] },
  { type: 'sub-row',  number: '3.2', name: 'Emissions from downstream transportation and distribution of goods', griCategoryUIDs: ['305.3.9'] },
  { type: 'sub-row',  number: '3.3', name: 'Emissions from employee commuting',                                  griCategoryUIDs: ['305.3.7'] },
  { type: 'sub-row',  number: '3.4', name: 'Emissions from client and visitor transport' },
  { type: 'sub-row',  number: '3.5', name: 'Emissions from business travels',                                    griCategoryUIDs: ['305.3.6'] },
  { type: 'spacer',   name: '' },

  // ── Category 4 ──
  { type: 'category-header', number: '4', name: 'Category 4: Indirect GHG emissions from products used by organization' },
  { type: 'sub-row',  number: '4.1', name: 'Emissions from purchased goods and services',  griCategoryUIDs: ['305.3.1'] },
  { type: 'sub-row',  number: '4.2', name: 'Emissions from capital goods',                 griCategoryUIDs: ['305.3.2'] },
  { type: 'sub-row',  number: '4.3', name: 'Emissions from the disposal of solid and liquid waste', griCategoryUIDs: ['305.3.5'] },
  { type: 'sub-row',  number: '4.4', name: 'Emissions from the use of assets',             griCategoryUIDs: ['305.3.8'] },
  { type: 'sub-row',  number: '4.5', name: 'Emissions from other services not described above', griCategoryUIDs: ['305.3.3'] },
  { type: 'spacer',   name: '' },

  // ── Category 5 ──
  { type: 'category-header', number: '5', name: 'Category 5: Indirect GHG emissions associated with the use of products from the organization' },
  { type: 'sub-row',  number: '5.1', name: 'Emissions or removals from the usage of product', griCategoryUIDs: ['305.3.11'] },
  { type: 'sub-row',  number: '5.2', name: 'Emissions from downstream leased assets',         griCategoryUIDs: ['305.3.13'] },
  { type: 'sub-row',  number: '5.3', name: 'Emissions from end of life stage of product',     griCategoryUIDs: ['305.3.12'] },
  { type: 'sub-row',  number: '5.4', name: 'Emissions from investments',                      griCategoryUIDs: ['305.3.15'] },
  { type: 'spacer',   name: '' },

  // ── Category 6 ──
  { type: 'category-header', name: 'Category 6: Other Indirect GHG emissions sources', griCategoryUIDs: ['305.3.10', '305.3.14'] },
  { type: 'spacer',   name: '' },

  // ── Totals / Removals / Liabilities ──
  { type: 'total',    name: 'TOTAL EMISSIONS CATEGORIES 1-6' },
  { type: 'spacer',   name: '' },
  { type: 'section',  name: 'REMOVALS' },
  { type: 'sub-row',  name: 'Direct removals in tonnes CO2-e' },
  { type: 'spacer',   name: '' },
  { type: 'section',  name: 'Emission Liabilities' },
  { type: 'sub-row',  name: 'Total Storage as of year end in tonnes CO2-e' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregated value for a single GRI sub-category across one BU's data.
 * Returns 0 if no matching activity rows.
 */
export function getGRIValue(
  calculatedData: any[] | undefined,
  griCategory: string
): number {
  if (!calculatedData) return 0;
  return calculatedData
    .filter((a) => a.griSubcategory === griCategory)
    .reduce((sum, a) => sum + (Number(a.calculatedValue) || 0), 0);
}

/**
 * Sum of multiple GRI sub-categories — used by ISO rows that bundle multiple
 * GRI categories.
 */
export function sumGRIValues(
  calculatedData: any[] | undefined,
  griCategories: string[]
): number {
  return griCategories.reduce((sum, c) => sum + getGRIValue(calculatedData, c), 0);
}

/**
 * Format a number for the report table. Returns "—" for zero / missing values
 * (matches the Excel template behaviour).
 */
export function formatReportValue(value: number): string {
  if (!value || value === 0) return '—';
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
