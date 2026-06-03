/**
 * SustainPro — ISO 14064-1 Mock Activity Submissions (FY2025)
 * ===========================================================
 *
 * The ISO counterpart to `seedActivitySubmissions.ts`. Demonstrates the full
 * ISO flow end-to-end:
 *
 *   SA creates ISO activities (isoActivitiesData.ts, framework:'ISO')
 *     → SA creates BCA Project "FY2025 ISO 14064-1 Inventory" (PROJ_ISO)
 *       → SA assigns 3 Business Units
 *         → Customer Users upload activity data per BU   ← THIS FILE
 *           → SA generates the ISO 14064-1 Report (Cat 1–6)
 *
 * Each calculated row carries the ISO categorisation DIRECTLY:
 *     framework:        'ISO'
 *     isoCategoryNumber:'1'..'6'
 *     isoCategory:      full ISO category title
 *     isoSubcategory:   '1.1' .. '6.1'  (matches isoTemplate row numbers)
 *
 * The ISO report aggregates by `isoSubcategory` (see `sumISOValues` in
 * reportTemplates.ts). `griCategory`/`griSubcategory` are intentionally absent
 * — these activities were never mapped to GRI.
 *
 * Numbers are deterministic. Org-level total = 7,223,820 kgCO₂e ≈ 7,224 tCO₂e.
 *
 *   ┌──────────────────────────────┬───────────────┐
 *   │ Business Unit                │ Total kgCO₂e  │
 *   ├──────────────────────────────┼───────────────┤
 *   │ Production Plant — Texas     │   3,939,550   │
 *   │ Cold Storage & Dist. — Ohio  │   2,691,980   │
 *   │ Head Office & Sales — IL     │     592,290   │
 *   ├──────────────────────────────┼───────────────┤
 *   │ TOTAL (Categories 1–6)       │   7,223,820   │
 *   └──────────────────────────────┴───────────────┘
 */

// This file lives at: src/data/seedISOActivitySubmissions.ts

// Fixed UUID for the ISO BCA project (add to businessUnitsData.ts as PROJ_ISO_UUID).
export const PROJ_ISO_UUID = 'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90';

interface DataPoint {
  parameterId: string;
  parameterName: string;
  value: string;
  unit: string;
  parameterType?: 'variable' | 'ef_value';
}

/** ISO-flavoured calculated row. Mirrors CalculatedActivityData but ISO-coded. */
interface ISOCalculatedActivityData {
  activityUID: string;
  activityName: string;
  framework: 'ISO';
  isoCategoryNumber: '1' | '2' | '3' | '4' | '5' | '6';
  isoCategory: string;
  isoSubcategory: string;
  calculatedValue: number;
  unit: string;
  formula: string;
  inputParameters: DataPoint[];
}

interface BusinessUnitDataSubmission {
  id: string;
  businessUnitId: string;
  businessUnitName: string;
  businessUnitUID: string;
  projectId: string;
  projectName: string;
  calculatedData: ISOCalculatedActivityData[];
  uploadedBy: string;
  uploadedAt: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  comments?: string;
  fileName?: string;
}

const ISO_CAT = {
  c1: 'Category 1: Direct GHG emissions and removals',
  c2: 'Category 2: Indirect GHG emissions from imported energy',
  c3: 'Category 3: Indirect GHG emissions from transportation',
  c4: 'Category 4: Indirect GHG emissions from products used by the organization',
  c5: 'Category 5: Indirect GHG emissions associated with the use of products from the organization',
  c6: 'Category 6: Other indirect GHG emissions',
} as const;

// ---------------------------------------------------------------------------
// ISO-BU-1 · Production Plant — Texas · BU-PRD-2025-001
// Cat 1 (1.1–1.4) · Cat 2 (2.1, 2.2) · Cat 4 (4.1, 4.2, 4.3)
// ---------------------------------------------------------------------------
const isoBU1: ISOCalculatedActivityData[] = [
  // 1.1 — Stationary Combustion (natural gas boilers)
  {
    activityUID: 'ACT-ISO-2025-0101',
    activityName: 'Stationary Combustion — Natural Gas Boilers',
    framework: 'ISO', isoCategoryNumber: '1', isoCategory: ISO_CAT.c1, isoSubcategory: '1.1',
    calculatedValue: 793800,        // 420,000 m³ × 1.89
    unit: 'kgCO2e',
    formula: 'Natural Gas Combustion · Gross Emissions',
    inputParameters: [
      { parameterId: 'param_gas_volume', parameterName: 'gas_volume', value: '420000', unit: 'm³', parameterType: 'variable' },
      { parameterId: 'param_gas_ef', parameterName: 'gas_ef', value: '1.89', unit: 'kg CO2e/m³', parameterType: 'ef_value' },
    ],
  },
  // 1.2 — Mobile Combustion (plant diesel fleet)
  {
    activityUID: 'ACT-ISO-2025-0102',
    activityName: 'Mobile Combustion — Plant Diesel Fleet',
    framework: 'ISO', isoCategoryNumber: '1', isoCategory: ISO_CAT.c1, isoSubcategory: '1.2',
    calculatedValue: 255550,        // 95,000 L × 2.69
    unit: 'kgCO2e',
    formula: 'Vehicle Fleet Emissions · Fuel-Based',
    inputParameters: [
      { parameterId: 'param_fuel_volume', parameterName: 'fuel_volume', value: '95000', unit: 'L', parameterType: 'variable' },
      { parameterId: 'param_fuel_ef', parameterName: 'fuel_ef', value: '2.69', unit: 'kg CO2e/L', parameterType: 'ef_value' },
    ],
  },
  // 1.3 — Process Emissions (calcination)
  {
    activityUID: 'ACT-ISO-2025-0103',
    activityName: 'Process Emissions — Calcination',
    framework: 'ISO', isoCategoryNumber: '1', isoCategory: ISO_CAT.c1, isoSubcategory: '1.3',
    calculatedValue: 637500,        // 1,250,000 kg × 0.51
    unit: 'kgCO2e',
    formula: 'Industrial Process Emissions · Mass-Based',
    inputParameters: [
      { parameterId: 'param_process_mass', parameterName: 'process_mass', value: '1250000', unit: 'kg', parameterType: 'variable' },
      { parameterId: 'param_process_ef', parameterName: 'process_ef', value: '0.51', unit: 'kg CO2e/kg', parameterType: 'ef_value' },
    ],
  },
  // 1.4 — Fugitive Refrigerant (R-410A, mass × GWP100)
  {
    activityUID: 'ACT-ISO-2025-0104',
    activityName: 'Fugitive Emissions — Refrigerant Leakage (R-410A)',
    framework: 'ISO', isoCategoryNumber: '1', isoCategory: ISO_CAT.c1, isoSubcategory: '1.4',
    calculatedValue: 26100,         // 12.5 kg × 2,088 GWP100
    unit: 'kgCO2e',
    formula: 'Refrigerant Leakage · Mass-Balance Method',
    inputParameters: [
      { parameterId: 'param_refrigerant_mass', parameterName: 'refrigerant_mass', value: '12.5', unit: 'kg', parameterType: 'variable' },
      { parameterId: 'param_gwp_factor', parameterName: 'gwp_factor', value: '2088', unit: 'kg CO2e/kg', parameterType: 'ef_value' },
    ],
  },
  // 2.1 — Imported Electricity (location-based)
  {
    activityUID: 'ACT-ISO-2025-0201',
    activityName: 'Imported Electricity — Grid (Location-based)',
    framework: 'ISO', isoCategoryNumber: '2', isoCategory: ISO_CAT.c2, isoSubcategory: '2.1',
    calculatedValue: 1550400,       // 3,800,000 kWh × 0.408
    unit: 'kgCO2e',
    formula: 'Electricity Consumption · Location-based',
    inputParameters: [
      { parameterId: 'param_electricity_consumption', parameterName: 'electricity_consumption', value: '3800000', unit: 'kWh', parameterType: 'variable' },
      { parameterId: 'param_grid_ef', parameterName: 'grid_ef', value: '0.408', unit: 'kg CO2e/kWh', parameterType: 'ef_value' },
    ],
  },
  // 2.2 — Imported Steam
  {
    activityUID: 'ACT-ISO-2025-0202',
    activityName: 'Imported Steam & District Heat',
    framework: 'ISO', isoCategoryNumber: '2', isoCategory: ISO_CAT.c2, isoSubcategory: '2.2',
    calculatedValue: 96000,         // 480,000 kWh × 0.20
    unit: 'kgCO2e',
    formula: 'Imported Steam Emissions',
    inputParameters: [
      { parameterId: 'param_steam_consumption', parameterName: 'steam_consumption', value: '480000', unit: 'kWh', parameterType: 'variable' },
      { parameterId: 'param_steam_ef', parameterName: 'steam_ef', value: '0.20', unit: 'kg CO2e/kWh', parameterType: 'ef_value' },
    ],
  },
  // 4.1 — Purchased Goods & Services
  {
    activityUID: 'ACT-ISO-2025-0401',
    activityName: 'Purchased Goods & Services (Spend-based)',
    framework: 'ISO', isoCategoryNumber: '4', isoCategory: ISO_CAT.c4, isoSubcategory: '4.1',
    calculatedValue: 369000,        // $820,000 × 0.45
    unit: 'kgCO2e',
    formula: 'Purchased Goods - Spend-based',
    inputParameters: [
      { parameterId: 'param_purchase_amount', parameterName: 'purchase_amount', value: '820000', unit: 'USD', parameterType: 'variable' },
      { parameterId: 'param_spend_ef', parameterName: 'spend_ef', value: '0.45', unit: 'kg CO2e/USD', parameterType: 'ef_value' },
    ],
  },
  // 4.2 — Capital Goods
  {
    activityUID: 'ACT-ISO-2025-0402',
    activityName: 'Capital Goods (Spend-based)',
    framework: 'ISO', isoCategoryNumber: '4', isoCategory: ISO_CAT.c4, isoSubcategory: '4.2',
    calculatedValue: 130200,        // $310,000 × 0.42
    unit: 'kgCO2e',
    formula: 'Capital Goods - Spend-based',
    inputParameters: [
      { parameterId: 'param_capex_amount', parameterName: 'capex_amount', value: '310000', unit: 'USD', parameterType: 'variable' },
      { parameterId: 'param_capex_ef', parameterName: 'capex_ef', value: '0.42', unit: 'kg CO2e/USD', parameterType: 'ef_value' },
    ],
  },
  // 4.3 — Waste Disposal
  {
    activityUID: 'ACT-ISO-2025-0403',
    activityName: 'Disposal of Solid & Liquid Waste',
    framework: 'ISO', isoCategoryNumber: '4', isoCategory: ISO_CAT.c4, isoSubcategory: '4.3',
    calculatedValue: 81000,         // 180 ton × 450
    unit: 'kgCO2e',
    formula: 'Waste Disposal Emissions · Mass-Based',
    inputParameters: [
      { parameterId: 'param_waste_mass', parameterName: 'waste_mass', value: '180', unit: 'ton', parameterType: 'variable' },
      { parameterId: 'param_waste_ef', parameterName: 'waste_ef', value: '450', unit: 'kg CO2e/ton', parameterType: 'ef_value' },
    ],
  },
];

// ---------------------------------------------------------------------------
// ISO-BU-2 · Cold Storage & Distribution — Ohio · BU-DST-2025-002
// Cat 1 (1.2) · Cat 2 (2.1) · Cat 3 (3.1) · Cat 4 (4.3)
// ---------------------------------------------------------------------------
const isoBU2: ISOCalculatedActivityData[] = [
  // 1.2 — Mobile Combustion (refrigerated delivery trucks)
  {
    activityUID: 'ACT-ISO-2025-0112',
    activityName: 'Mobile Combustion — Refrigerated Delivery Trucks',
    framework: 'ISO', isoCategoryNumber: '1', isoCategory: ISO_CAT.c1, isoSubcategory: '1.2',
    calculatedValue: 371220,        // 138,000 L × 2.69
    unit: 'kgCO2e',
    formula: 'Vehicle Fleet Emissions · Fuel-Based',
    inputParameters: [
      { parameterId: 'param_fuel_volume', parameterName: 'fuel_volume', value: '138000', unit: 'L', parameterType: 'variable' },
      { parameterId: 'param_fuel_ef', parameterName: 'fuel_ef', value: '2.69', unit: 'kg CO2e/L', parameterType: 'ef_value' },
    ],
  },
  // 2.1 — Imported Electricity (refrigeration-heavy)
  {
    activityUID: 'ACT-ISO-2025-0201',
    activityName: 'Imported Electricity — Grid (Location-based)',
    framework: 'ISO', isoCategoryNumber: '2', isoCategory: ISO_CAT.c2, isoSubcategory: '2.1',
    calculatedValue: 2121600,       // 5,200,000 kWh × 0.408
    unit: 'kgCO2e',
    formula: 'Electricity Consumption · Location-based',
    inputParameters: [
      { parameterId: 'param_electricity_consumption', parameterName: 'electricity_consumption', value: '5200000', unit: 'kWh', parameterType: 'variable' },
      { parameterId: 'param_grid_ef', parameterName: 'grid_ef', value: '0.408', unit: 'kg CO2e/kWh', parameterType: 'ef_value' },
    ],
  },
  // 3.1 — Upstream Transportation (inbound 3PL freight)
  {
    activityUID: 'ACT-ISO-2025-0301',
    activityName: 'Upstream Transportation — Inbound Freight (3PL)',
    framework: 'ISO', isoCategoryNumber: '3', isoCategory: ISO_CAT.c3, isoSubcategory: '3.1',
    calculatedValue: 172160,        // 64,000 L × 2.69
    unit: 'kgCO2e',
    formula: 'Vehicle Fleet Emissions · Fuel-Based',
    inputParameters: [
      { parameterId: 'param_fuel_volume', parameterName: 'fuel_volume', value: '64000', unit: 'L', parameterType: 'variable' },
      { parameterId: 'param_fuel_ef', parameterName: 'fuel_ef', value: '2.69', unit: 'kg CO2e/L', parameterType: 'ef_value' },
    ],
  },
  // 4.3 — Waste Disposal
  {
    activityUID: 'ACT-ISO-2025-0403',
    activityName: 'Disposal of Solid & Liquid Waste',
    framework: 'ISO', isoCategoryNumber: '4', isoCategory: ISO_CAT.c4, isoSubcategory: '4.3',
    calculatedValue: 27000,         // 60 ton × 450
    unit: 'kgCO2e',
    formula: 'Waste Disposal Emissions · Mass-Based',
    inputParameters: [
      { parameterId: 'param_waste_mass', parameterName: 'waste_mass', value: '60', unit: 'ton', parameterType: 'variable' },
      { parameterId: 'param_waste_ef', parameterName: 'waste_ef', value: '450', unit: 'kg CO2e/ton', parameterType: 'ef_value' },
    ],
  },
];

// ---------------------------------------------------------------------------
// ISO-BU-3 · Head Office & Sales — Illinois · BU-HQ-2025-003
// Cat 2 (2.1) · Cat 3 (3.3, 3.5) · Cat 5 (5.1, 5.3) · Cat 6 (6.1)
// ---------------------------------------------------------------------------
const isoBU3: ISOCalculatedActivityData[] = [
  // 2.1 — Imported Electricity
  {
    activityUID: 'ACT-ISO-2025-0201',
    activityName: 'Imported Electricity — Grid (Location-based)',
    framework: 'ISO', isoCategoryNumber: '2', isoCategory: ISO_CAT.c2, isoSubcategory: '2.1',
    calculatedValue: 167280,        // 410,000 kWh × 0.408
    unit: 'kgCO2e',
    formula: 'Electricity Consumption · Location-based',
    inputParameters: [
      { parameterId: 'param_electricity_consumption', parameterName: 'electricity_consumption', value: '410000', unit: 'kWh', parameterType: 'variable' },
      { parameterId: 'param_grid_ef', parameterName: 'grid_ef', value: '0.408', unit: 'kg CO2e/kWh', parameterType: 'ef_value' },
    ],
  },
  // 3.3 — Employee Commuting
  {
    activityUID: 'ACT-ISO-2025-0303',
    activityName: 'Employee Commuting',
    framework: 'ISO', isoCategoryNumber: '3', isoCategory: ISO_CAT.c3, isoSubcategory: '3.3',
    calculatedValue: 54720,         // 285,000 km × 0.192
    unit: 'kgCO2e',
    formula: 'Vehicle Fleet Emissions · Distance-Based',
    inputParameters: [
      { parameterId: 'param_distance', parameterName: 'distance', value: '285000', unit: 'km', parameterType: 'variable' },
      { parameterId: 'param_vehicle_ef', parameterName: 'vehicle_ef', value: '0.192', unit: 'kg CO2e/km', parameterType: 'ef_value' },
    ],
  },
  // 3.5 — Business Travel
  {
    activityUID: 'ACT-ISO-2025-0305',
    activityName: 'Business Travel',
    framework: 'ISO', isoCategoryNumber: '3', isoCategory: ISO_CAT.c3, isoSubcategory: '3.5',
    calculatedValue: 42240,         // 220,000 km × 0.192
    unit: 'kgCO2e',
    formula: 'Vehicle Fleet Emissions · Distance-Based',
    inputParameters: [
      { parameterId: 'param_distance', parameterName: 'distance', value: '220000', unit: 'km', parameterType: 'variable' },
      { parameterId: 'param_vehicle_ef', parameterName: 'vehicle_ef', value: '0.192', unit: 'kg CO2e/km', parameterType: 'ef_value' },
    ],
  },
  // 5.1 — Use of Sold Products
  {
    activityUID: 'ACT-ISO-2025-0501',
    activityName: 'Use of Sold Products — Use-Phase Energy',
    framework: 'ISO', isoCategoryNumber: '5', isoCategory: ISO_CAT.c5, isoSubcategory: '5.1',
    calculatedValue: 225000,        // 18,000 units × 12.5
    unit: 'kgCO2e',
    formula: 'Product Use-Phase Emissions · Unit-Based',
    inputParameters: [
      { parameterId: 'param_units_sold', parameterName: 'units_sold', value: '18000', unit: 'unit', parameterType: 'variable' },
      { parameterId: 'param_use_ef', parameterName: 'use_ef', value: '12.5', unit: 'kg CO2e/unit', parameterType: 'ef_value' },
    ],
  },
  // 5.3 — End-of-Life Treatment
  {
    activityUID: 'ACT-ISO-2025-0503',
    activityName: 'End-of-Life Treatment of Sold Products',
    framework: 'ISO', isoCategoryNumber: '5', isoCategory: ISO_CAT.c5, isoSubcategory: '5.3',
    calculatedValue: 37800,         // 18,000 units × 2.1
    unit: 'kgCO2e',
    formula: 'Product End-of-Life Emissions · Unit-Based',
    inputParameters: [
      { parameterId: 'param_units_sold', parameterName: 'units_sold', value: '18000', unit: 'unit', parameterType: 'variable' },
      { parameterId: 'param_eol_ef', parameterName: 'eol_ef', value: '2.1', unit: 'kg CO2e/unit', parameterType: 'ef_value' },
    ],
  },
  // 6.1 — Other Indirect (outsourced operations)
  {
    activityUID: 'ACT-ISO-2025-0601',
    activityName: 'Other Indirect — Outsourced Operations (Spend-based)',
    framework: 'ISO', isoCategoryNumber: '6', isoCategory: ISO_CAT.c6, isoSubcategory: '6.1',
    calculatedValue: 65250,         // $145,000 × 0.45
    unit: 'kgCO2e',
    formula: 'Purchased Goods - Spend-based',
    inputParameters: [
      { parameterId: 'param_purchase_amount', parameterName: 'purchase_amount', value: '145000', unit: 'USD', parameterType: 'variable' },
      { parameterId: 'param_spend_ef', parameterName: 'spend_ef', value: '0.45', unit: 'kg CO2e/USD', parameterType: 'ef_value' },
    ],
  },
];

// ---------------------------------------------------------------------------
// THE EXPORT — ISO submissions for the FY2025 ISO 14064-1 Inventory project
// ---------------------------------------------------------------------------
export const mockISOSubmissions: BusinessUnitDataSubmission[] = [
  {
    id: 'sub-iso-bu1-2025',
    businessUnitId: 'iso-bu-1',
    businessUnitUID: 'BU-PRD-2025-001',
    businessUnitName: 'Production Plant - Texas',
    projectId: PROJ_ISO_UUID,
    projectName: 'FY2025 ISO 14064-1 Inventory',
    calculatedData: isoBU1,
    uploadedBy: 'Priya Nair',
    uploadedAt: '2025-02-05T10:30:00Z',
    status: 'approved',
    comments:
      'Direct (Cat 1) emissions reconciled with gas, fuel and process logs. Calcination process factor verified against the kiln mass-balance. Approved for the ISO 14064-1 inventory.',
    fileName: 'BU-PRD-2025-001_ISO14064_FY2025.xlsx',
  },
  {
    id: 'sub-iso-bu2-2025',
    businessUnitId: 'iso-bu-2',
    businessUnitUID: 'BU-DST-2025-002',
    businessUnitName: 'Cold Storage & Distribution - Ohio',
    projectId: PROJ_ISO_UUID,
    projectName: 'FY2025 ISO 14064-1 Inventory',
    calculatedData: isoBU2,
    uploadedBy: 'Tom Becker',
    uploadedAt: '2025-02-07T14:15:00Z',
    status: 'submitted',
    fileName: 'BU-DST-2025-002_ISO14064_FY2025.xlsx',
  },
  {
    id: 'sub-iso-bu3-2025',
    businessUnitId: 'iso-bu-3',
    businessUnitUID: 'BU-HQ-2025-003',
    businessUnitName: 'Head Office & Sales - Illinois',
    projectId: PROJ_ISO_UUID,
    projectName: 'FY2025 ISO 14064-1 Inventory',
    calculatedData: isoBU3,
    uploadedBy: 'Sofia Rossi',
    uploadedAt: '2025-02-08T09:45:00Z',
    status: 'submitted',
    fileName: 'BU-HQ-2025-003_ISO14064_FY2025.xlsx',
  },
];
