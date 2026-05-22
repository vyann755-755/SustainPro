/**
 * SustainPro — Report Templates (GRI + ISO 14064-1)
 * ==================================================
 * Mirrors Sample GRI.xlsx and Sample ISO.xlsx row-for-row.
 *   • GRI GHG Report      (305 series · kgCO2e)
 *   • GRI Energy Report   (302 series · GJ)
 *   • GRI Water Report    (303 series · ML)
 *   • GRI Waste Report    (306 series · ton)
 *   • ISO 14064-1 Report  (Cat 1–6 · kgCO2e)
 *
 * Every row in the templates is always rendered; missing values show "—".
 */

export interface GRIRow {
  type: 'scope-header' | 'sub-header' | 'category';
  scope?: '1' | '2' | '3';
  category?: string;
  name: string;
  notes?: string;
}

// ─── GRI 305 · GHG (kgCO2e) ─────────────────────────────────────────────────
export const griGHGTemplate: GRIRow[] = [
  { type: 'scope-header', scope: '1', name: 'GRI 305-1 Direct GHG emissions (Scope 1) ' },
  { type: 'category', scope: '1', category: '305.1.1', name: 'Table-1 : Stationary Combustion' },
  { type: 'category', scope: '1', category: '305.1.2', name: 'Table-2 : Mobile Combustion' },
  { type: 'category', scope: '1', category: '305.1.3', name: 'Table-3 : Fugitive Emissions - Refrigerent' },
  { type: 'category', scope: '1', category: '305.2.4', name: 'Table-4 : Fugitive Emissions - Fire Suppressant' },
  { type: 'category', scope: '1', category: '305.1.5', name: 'Table-5 : Fugitive Emissions - Electrical Insulating Gas' },
  { type: 'category', scope: '1', category: '305.2.6', name: 'Table-6 : Fugitive Emissions - Anesthetic Gas' },
  { type: 'category', scope: '1', category: '305.1.7', name: 'Table-7 : Fugitive Emissions - Waste Water Treatment' },
  { type: 'scope-header', scope: '2', name: 'GRI 305-2 Indirect GHG emissions (Scope 2) ' },
  { type: 'category', scope: '2', category: '305.2.8', name: 'Table 8. Electricity purchased: Location-based' },
  { type: 'category', scope: '2', category: '305.2.9', name: 'Table 9. Electricity purchased: Market-based' },
  { type: 'category', scope: '2', category: '305.2.10', name: 'Table 10. Electricity sold' },
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

// ─── GRI 302 · Energy (GJ) ──────────────────────────────────────────────────
export const griEnergyTemplate: GRIRow[] = [
  { type: 'scope-header', name: 'GRI 302-1 Energy Consumption within the organization' },
  { type: 'sub-header', name: 'Non-renewable fuel consumed' },
  { type: 'category', category: '302.1.1', name: 'Table-1 : Non-renewable fuel consumed : Stationary Combustion' },
  { type: 'category', category: '302.1.2', name: 'Table-2 : Non-renewable fuel consumed : Mobile Combustion' },
  { type: 'sub-header', name: 'Renewable fuel consumed' },
  { type: 'category', category: '302.1.3', name: 'Table-3 : Renewable fuel consumed : Biofuels/biomass combustion' },
  { type: 'sub-header', name: 'Electricity consumption' },
  { type: 'category', category: '302.1.4', name: 'Table-4 : Electricity Purchased' },
  { type: 'category', category: '302.1.5', name: 'Table-5 : Self Generated Electricity' },
  { type: 'category', category: '302.1.6', name: 'Table-6 : Electricity sold' },
  { type: 'sub-header', name: 'Heating, cooling, and steam consumption' },
  { type: 'category', category: '302.1.7', name: 'Table-7 : Heating, Cooling and steam purchased' },
  { type: 'category', category: '302.1.8', name: 'Table-8 : Self generated heating, Cooling and steam purchased' },
  { type: 'category', category: '302.1.9', name: 'Table-9 : Heating, Cooling and steam sold' },
  { type: 'sub-header', name: 'Absolute energy consumption' },
  { type: 'category', name: 'Organization-specific metric', notes: '[to be input]' },
  { type: 'category', name: 'Energy Intensity Ratio', notes: '[depends on above]' },
];

// ─── GRI 303 · Water (ML) ───────────────────────────────────────────────────
export const griWaterTemplate: GRIRow[] = [
  { type: 'scope-header', name: 'GRI 303-3 Water withdrawal' },
  { type: 'sub-header', name: 'GRI 303-3 (a) (b) (c): Withdrawal from all areas' },
  { type: 'category', category: '303.3.1', name: 'Table-1 : Water withdrawal - Fresh Water : TDS<= 1000mg/l' },
  { type: 'category', category: '303.3.2', name: 'Table-2 : Water withdrawal - Other Water : TDS> 1000mg/l' },
  { type: 'sub-header', name: 'GRI 303-3 (a) (b) (c): Withdrawal from all areas with water stress' },
  { type: 'category', category: '303.3.3', name: 'Table-3 : Water withdrawal - Fresh Water : TDS<= 1000mg/l' },
  { type: 'category', category: '303.3.4', name: 'Table-4 : Water withdrawal - Other Water : TDS> 1000mg/l' },
  { type: 'scope-header', name: 'GRI 303-4 Water discharge' },
  { type: 'sub-header', name: 'GRI 303-4 (a) (b) (c): Discharge to all areas' },
  { type: 'category', category: '303.4.5', name: 'Table-5 : Water discharge - Fresh Water : TDS<= 1000mg/l' },
  { type: 'category', category: '303.4.6', name: 'Table-6 : Water discharge - Other Water : TDS> 1000mg/l' },
  { type: 'sub-header', name: 'GRI 303-4 (a) (b) (c): Discharge to all areas with water stress' },
  { type: 'category', category: '303.4.7', name: 'Table-7 : Water discharge - Fresh Water : TDS<= 1000mg/l' },
  { type: 'category', category: '303.4.8', name: 'Table-8 : Water discharge - Other Water : TDS> 1000mg/l' },
  { type: 'scope-header', name: 'GRI 303-5 Water consumption' },
  { type: 'category', category: '303.5.1', name: 'All areas' },
  { type: 'category', category: '303.5.2', name: 'All areas with water stress' },
];

// ─── GRI 306 · Waste (ton) ──────────────────────────────────────────────────
export const griWasteTemplate: GRIRow[] = [
  { type: 'scope-header', name: 'GRI 306-4 Waste diverted from disposal' },
  { type: 'sub-header', name: 'Hazardous waste: Onsite' },
  { type: 'category', category: '306.4.1', name: 'Table-1 : Preperation for reuse' },
  { type: 'category', category: '306.4.2', name: 'Table-2 : Recycling' },
  { type: 'category', category: '306.4.3', name: 'Table-3 : Other recovery operations' },
  { type: 'sub-header', name: 'Hazardous waste: Offsite' },
  { type: 'category', category: '306.4.4', name: 'Table-4 : Preperation for reuse' },
  { type: 'category', category: '306.4.5', name: 'Table-5 : Recycling' },
  { type: 'category', category: '306.4.6', name: 'Table-6 : Other recovery operations' },
  { type: 'sub-header', name: 'Non-hazardous waste: Onsite' },
  { type: 'category', category: '306.4.7', name: 'Table-7 : Preperation for reuse' },
  { type: 'category', category: '306.4.8', name: 'Table-8 : Recycling' },
  { type: 'category', category: '306.4.9', name: 'Table-9 : Other recovery operations' },
  { type: 'sub-header', name: 'Non-hazardous waste: Offsite' },
  { type: 'category', category: '306.4.10', name: 'Table-10 : Preperation for reuse' },
  { type: 'category', category: '306.4.11', name: 'Table-11 : Recycling' },
  { type: 'category', category: '306.4.12', name: 'Table-12 : Other recovery operations' },
  { type: 'scope-header', name: 'GRI 306-5 Waste directed to disposal' },
  { type: 'sub-header', name: 'Hazardous waste: Onsite' },
  { type: 'category', category: '306.5.13', name: 'Table-13 : Incineration with energy recovery' },
  { type: 'category', category: '306.5.14', name: 'Table-14 : Incineration without energy recovery' },
  { type: 'category', category: '306.5.15', name: 'Table-15 : Landfilling' },
  { type: 'category', category: '306.5.16', name: 'Table-16 : Other disposal operations' },
  { type: 'sub-header', name: 'Hazardous waste: Offsite' },
  { type: 'category', category: '306.5.17', name: 'Table-17 : Incineration with energy recovery' },
  { type: 'category', category: '306.5.18', name: 'Table-18 : Incineration without energy recovery' },
  { type: 'category', category: '306.5.19', name: 'Table-19 : Landfilling' },
  { type: 'category', category: '306.5.20', name: 'Table-20 : Other disposal operations' },
  { type: 'sub-header', name: 'Non-hazardous waste: Onsite' },
  { type: 'category', category: '306.5.21', name: 'Table-21 : Incineration with energy recovery' },
  { type: 'category', category: '306.5.22', name: 'Table-22 : Incineration without energy recovery' },
  { type: 'category', category: '306.5.23', name: 'Table-23 : Landfilling' },
  { type: 'category', category: '306.5.24', name: 'Table-24 : Other disposal operations' },
  { type: 'sub-header', name: 'Non-hazardous waste: Offsite' },
  { type: 'category', category: '306.5.25', name: 'Table-25 : Incineration with energy recovery' },
  { type: 'category', category: '306.5.26', name: 'Table-26 : Incineration without energy recovery' },
  { type: 'category', category: '306.5.27', name: 'Table-27 : Landfilling' },
  { type: 'category', category: '306.5.28', name: 'Table-28 : Other disposal operations' },
];

// ─── ISO 14064-1 ────────────────────────────────────────────────────────────
export interface ISORow {
  type: 'category-header' | 'sub-row' | 'spacer' | 'total' | 'section';
  number?: string;
  name: string;
  notes?: string;
  griCategoryUIDs?: string[];
}

export const isoTemplate: ISORow[] = [
  { type: 'category-header', number: '1', name: 'Category 1: Direct GHG emissions and removals' },
  { type: 'sub-row',  number: '1.1', name: 'Direct emissions from stationary combustion', griCategoryUIDs: ['305.1.1'] },
  { type: 'sub-row',  number: '1.2', name: 'Direct emissions from mobile combustion',     griCategoryUIDs: ['305.1.2'] },
  { type: 'sub-row',  number: '1.3', name: 'Direct process emissions and removals arise from industrial processes', notes: 'A3+A4+A5', griCategoryUIDs: ['305.2.4', '305.1.5', '305.2.6'] },
  { type: 'sub-row',  number: '1.4', name: 'Direct fugitive emissions arise from the release of greenhouse gases in anthropogenic systems', griCategoryUIDs: ['305.1.3', '305.1.7'] },
  { type: 'sub-row',  number: '1.5', name: 'Direct emissions and removals from Land Use, Land Use Change and Forestry' },
  { type: 'sub-row',  number: '1.6', name: 'Direct emissions in tonnes of CO2 from biomass' },
  { type: 'spacer', name: '' },
  { type: 'category-header', number: '2', name: 'Category 2: Indirect GHG emissions from imported energy' },
  { type: 'sub-row',  number: '2.1', name: 'Indirect emissions from imported electricity', griCategoryUIDs: ['305.2.8'] },
  { type: 'sub-row',  number: '2.2', name: 'Indirect emissions from imported energy',     griCategoryUIDs: ['305.2.9'] },
  { type: 'spacer', name: '' },
  { type: 'category-header', number: '3', name: 'Category 3: Indirect GHG emissions from Transportation' },
  { type: 'sub-row',  number: '3.1', name: 'Emissions from upstream transportation and distribution of goods',   griCategoryUIDs: ['305.3.4'] },
  { type: 'sub-row',  number: '3.2', name: 'Emissions from downstream transportation and distribution of goods', griCategoryUIDs: ['305.3.9'] },
  { type: 'sub-row',  number: '3.3', name: 'Emissions from employee commuting',                                  griCategoryUIDs: ['305.3.7'] },
  { type: 'sub-row',  number: '3.4', name: 'Emissions from client and visitor transport' },
  { type: 'sub-row',  number: '3.5', name: 'Emissions from business travels',                                    griCategoryUIDs: ['305.3.6'] },
  { type: 'spacer', name: '' },
  { type: 'category-header', number: '4', name: 'Category 4: Indirect GHG emissions from products used by organization' },
  { type: 'sub-row',  number: '4.1', name: 'Emissions from purchased goods and services',  griCategoryUIDs: ['305.3.1'] },
  { type: 'sub-row',  number: '4.2', name: 'Emissions from capital goods',                 griCategoryUIDs: ['305.3.2'] },
  { type: 'sub-row',  number: '4.3', name: 'Emissions from the disposal of solid and liquid waste', griCategoryUIDs: ['305.3.5'] },
  { type: 'sub-row',  number: '4.4', name: 'Emissions from the use of assets',             griCategoryUIDs: ['305.3.8'] },
  { type: 'sub-row',  number: '4.5', name: 'Emissions from other services not described above', griCategoryUIDs: ['305.3.3'] },
  { type: 'spacer', name: '' },
  { type: 'category-header', number: '5', name: 'Category 5: Indirect GHG emissions associated with the use of products from the organization' },
  { type: 'sub-row',  number: '5.1', name: 'Emissions or removals from the usage of product', griCategoryUIDs: ['305.3.11'] },
  { type: 'sub-row',  number: '5.2', name: 'Emissions from downstream leased assets',         griCategoryUIDs: ['305.3.13'] },
  { type: 'sub-row',  number: '5.3', name: 'Emissions from end of life stage of product',     griCategoryUIDs: ['305.3.12'] },
  { type: 'sub-row',  number: '5.4', name: 'Emissions from investments',                      griCategoryUIDs: ['305.3.15'] },
  { type: 'spacer', name: '' },
  { type: 'category-header', name: 'Category 6: Other Indirect GHG emissions sources', griCategoryUIDs: ['305.3.10', '305.3.14'] },
  { type: 'spacer', name: '' },
  { type: 'total',    name: 'TOTAL EMISSIONS CATEGORIES 1-6' },
  { type: 'spacer', name: '' },
  { type: 'section',  name: 'REMOVALS' },
  { type: 'sub-row',  name: 'Direct removals in tonnes CO2-e' },
  { type: 'spacer', name: '' },
  { type: 'section',  name: 'Emission Liabilities' },
  { type: 'sub-row',  name: 'Total Storage as of year end in tonnes CO2-e' },
];

// ─── helpers ────────────────────────────────────────────────────────────────
export function getGRIValue(calculatedData: any[] | undefined, griCategory: string): number {
  if (!calculatedData) return 0;
  return calculatedData
    .filter((a) => a.griSubcategory === griCategory)
    .reduce((sum, a) => sum + (Number(a.calculatedValue) || 0), 0);
}

export function sumGRIValues(calculatedData: any[] | undefined, griCategories: string[]): number {
  return griCategories.reduce((sum, c) => sum + getGRIValue(calculatedData, c), 0);
}

export function formatReportValue(value: number): string {
  if (!value || value === 0) return '—';
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
