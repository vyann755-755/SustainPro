/**
 * SustainPro — Interrelated Mock Activity Submissions (FY2025)
 * =============================================================
 *
 * Drop-in replacement for the auto-generated `mockSubmissions` block
 * in `src/components/customer/ActivityData.tsx` (~line 200).
 *
 * Single client org · single project ("Q1 2025 Carbon Assessment", PROJ_1) ·
 * three business units (bu-1 Manufacturing, bu-2 Warehouse, bu-3 Office) ·
 * full reporting year 2025.
 *
 * Numbers are deterministic — totals match the README and the GRI/ISO
 * preview HTML in `Mock Data Spec.html`.
 *
 * EF and Formula UIDs reference the existing Master DB rows in
 * `src/data/formulasData.ts` and `src/components/sa/activitiesData.ts`.
 */

// This file lives at: src/data/seedActivitySubmissions.ts
import { PROJ_1_UUID } from './businessUnitsData';

// Local types (copied from ActivityData.tsx so this file can be lifted out
// without code changes — but the shapes must match those interfaces).
interface DataPoint {
  parameterId: string;
  parameterName: string;
  value: string;
  unit: string;
  parameterType?: 'variable' | 'ef_value';
}

interface CalculatedActivityData {
  activityUID: string;
  activityName: string;
  griCategory: string;
  griSubcategory: string;
  scope: '1' | '2' | '3';
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
  calculatedData: CalculatedActivityData[];
  uploadedBy: string;
  uploadedAt: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  comments?: string;
  fileName?: string;
}

// ---------------------------------------------------------------------------
// EF VALUES (reference — sourced from Master DB in formulasData.ts)
// ---------------------------------------------------------------------------
//   EF-FUE-GLB-2024-001  Natural Gas Combustion        1.89    kg CO₂e/m³   (IPCC AR6 / EPA)
//   EF-TRA-2024-0007     Light Duty Vehicle — Gasoline 0.192   kg CO₂e/km   (DEFRA 2024)
//   EF-ENE-2024-0001     US National Grid              0.408   kg CO₂e/kWh  (US EPA eGRID 2022)
//   EF-ENE-2024-0002     Renewable Energy (Wind / REC) 0.030   kg CO₂e/kWh  (residual-mix premium)
//   EF-ENE-2024-0003     Heavy-Duty Diesel Truck       2.690   kg CO₂e/L    (DEFRA 2024 — diesel)
// ---------------------------------------------------------------------------

const GRI_LABEL = {
  s1: 'GRI 305-1 Direct GHG emissions (Scope 1)',
  s2: 'GRI 305-2 Indirect GHG emissions (Scope 2)',
  s3: 'GRI 305-3 Indirect GHG emissions (Scope 3)',
} as const;

// ---------------------------------------------------------------------------
// BU-1  ·  Manufacturing Plant — North America  ·  bu-1 / BU-MFG-2025-001
// ---------------------------------------------------------------------------
const bu1Calculated: CalculatedActivityData[] = [
  // 305.1.1 — Stationary Combustion (Natural Gas, plant boilers)
  {
    activityUID: 'ACT-2024-0001',
    activityName: 'Table-1: Stationary Combustion',
    griCategory: GRI_LABEL.s1,
    griSubcategory: '305.1.1',
    scope: '1',
    calculatedValue: 538650,        // 285,000 m³ × 1.89
    unit: 'kgCO2e',
    formula: 'Natural Gas Combustion · Gross Emissions',
    inputParameters: [
      { parameterId: 'param_gas_volume', parameterName: 'gas_volume',
        value: '285000', unit: 'm³', parameterType: 'variable' },
      { parameterId: 'param_gas_ef',     parameterName: 'gas_ef',
        value: '1.89',    unit: 'kg CO2e/m³', parameterType: 'ef_value' },
    ],
  },
  // 305.1.2 — Mobile Combustion (plant fleet, gasoline)
  {
    activityUID: 'ACT-2024-0002',
    activityName: 'Table-2: Mobile Combustion',
    griCategory: GRI_LABEL.s1,
    griSubcategory: '305.1.2',
    scope: '1',
    calculatedValue: 32352,         // 168,500 km × 0.192
    unit: 'kgCO2e',
    formula: 'Vehicle Fleet Emissions · Distance-Based',
    inputParameters: [
      { parameterId: 'param_distance',    parameterName: 'distance',
        value: '168500', unit: 'km', parameterType: 'variable' },
      { parameterId: 'param_vehicle_ef',  parameterName: 'vehicle_ef',
        value: '0.192',  unit: 'kg CO2e/km', parameterType: 'ef_value' },
    ],
  },
  // 305.1.3 — Fugitive Refrigerant (R-410A leakage, mass × GWP100)
  // Uses dedicated formula FORM-REF-FUG-2024-001 (see dedicatedFormulas.ts)
  {
    activityUID: 'ACT-2024-0003',
    activityName: 'Table-3: Fugitive Emissions - Refrigerant',
    griCategory: GRI_LABEL.s1,
    griSubcategory: '305.1.3',
    scope: '1',
    calculatedValue: 14500,         // 6.943 kg R-410A × 2,088 GWP100 ≈ 14,500
    unit: 'kgCO2e',
    formula: 'Refrigerant Leakage · Mass-Balance Method',
    inputParameters: [
      { parameterId: 'param_refrigerant_mass', parameterName: 'refrigerant_mass',
        value: '6.943', unit: 'kg', parameterType: 'variable' },
      { parameterId: 'param_gwp_factor',       parameterName: 'gwp_factor',
        value: '2088',  unit: 'kg CO2e/kg', parameterType: 'ef_value' },
    ],
  },
  // 305.2.8 — Electricity (Location-based)
  {
    activityUID: 'ACT-2024-0008',
    activityName: 'Table 8. Electricity purchased: Location-based',
    griCategory: GRI_LABEL.s2,
    griSubcategory: '305.2.8',
    scope: '2',
    calculatedValue: 1734000,       // 4,250,000 kWh × 0.408
    unit: 'kgCO2e',
    formula: 'Electricity Consumption · Location-based',
    inputParameters: [
      { parameterId: 'param_electricity_consumption', parameterName: 'electricity_consumption',
        value: '4250000', unit: 'kWh', parameterType: 'variable' },
      { parameterId: 'param_grid_ef',                 parameterName: 'grid_ef',
        value: '0.408',   unit: 'kg CO2e/kWh', parameterType: 'ef_value' },
    ],
  },
  // 305.2.9 — Electricity (Market-based, RECs)
  {
    activityUID: 'ACT-2024-0009',
    activityName: 'Table 9. Electricity purchased: Market-based',
    griCategory: GRI_LABEL.s2,
    griSubcategory: '305.2.9',
    scope: '2',
    calculatedValue: 127500,        // 4,250,000 kWh × 0.030
    unit: 'kgCO2e',
    formula: 'Electricity Consumption · Market-based',
    inputParameters: [
      { parameterId: 'param_electricity_consumption', parameterName: 'electricity_consumption',
        value: '4250000', unit: 'kWh', parameterType: 'variable' },
      { parameterId: 'param_grid_ef',                 parameterName: 'market_ef',
        value: '0.030',   unit: 'kg CO2e/kWh', parameterType: 'ef_value' },
    ],
  },
  // 305.3.1 — Purchased Goods & Services (spend-based)
  // Uses dedicated formula FORM-PUR-GOO-2024-001 (see dedicatedFormulas.ts)
  {
    activityUID: 'ACT-2024-0031',
    activityName: 'Cat. 1: Purchased goods and services',
    griCategory: GRI_LABEL.s3,
    griSubcategory: '305.3.1',
    scope: '3',
    calculatedValue: 245760,        // $546,133 × 0.45 ≈ 245,760
    unit: 'kgCO2e',
    formula: 'Purchased Goods - Spend-based',
    inputParameters: [
      { parameterId: 'param_purchase_amount', parameterName: 'purchase_amount',
        value: '546133', unit: 'USD', parameterType: 'variable' },
      { parameterId: 'param_spend_ef',        parameterName: 'spend_ef',
        value: '0.45',   unit: 'kg CO2e/USD', parameterType: 'ef_value' },
    ],
  },
  // 305.3.2 — Capital Goods (spend-based capex)
  // Uses dedicated formula FORM-CAP-GOO-2024-001 (see dedicatedFormulas.ts)
  {
    activityUID: 'ACT-2024-0032',
    activityName: 'Cat. 2: Capital goods',
    griCategory: GRI_LABEL.s3,
    griSubcategory: '305.3.2',
    scope: '3',
    calculatedValue: 89397,         // $212,850 capex × 0.42 ≈ 89,397
    unit: 'kgCO2e',
    formula: 'Capital Goods - Spend-based',
    inputParameters: [
      { parameterId: 'param_capex_amount', parameterName: 'capex_amount',
        value: '212850', unit: 'USD', parameterType: 'variable' },
      { parameterId: 'param_capex_ef',     parameterName: 'capex_ef',
        value: '0.42',   unit: 'kg CO2e/USD', parameterType: 'ef_value' },
    ],
  },
  // ───────────────────────────────────────────────────────────────────
  // Energy / Water / Waste additions (FY2025)
  // ───────────────────────────────────────────────────────────────────
  // 302.1.1 — Table-1 : Non-renewable fuel consumed : Stationary Combustion
  {
    activityUID: 'ACT-MOCK-302-1-1',
    activityName: 'Table-1 : Non-renewable fuel consumed : Stationary Combustion',
    griCategory: 'GRI 302-1 Energy Consumption within the organization',
    griSubcategory: '302.1.1',
    scope: '1',
    calculatedValue: 12500,
    unit: 'GJ',
    formula: 'Energy meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '12500', unit: 'GJ', parameterType: 'variable' },
    ],
  },
  // 302.1.2 — Table-2 : Non-renewable fuel consumed : Mobile Combustion
  {
    activityUID: 'ACT-MOCK-302-1-2',
    activityName: 'Table-2 : Non-renewable fuel consumed : Mobile Combustion',
    griCategory: 'GRI 302-1 Energy Consumption within the organization',
    griSubcategory: '302.1.2',
    scope: '1',
    calculatedValue: 850,
    unit: 'GJ',
    formula: 'Energy meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '850', unit: 'GJ', parameterType: 'variable' },
    ],
  },
  // 302.1.4 — Table-4 : Electricity Purchased
  {
    activityUID: 'ACT-MOCK-302-1-4',
    activityName: 'Table-4 : Electricity Purchased',
    griCategory: 'GRI 302-1 Energy Consumption within the organization',
    griSubcategory: '302.1.4',
    scope: '1',
    calculatedValue: 15300,
    unit: 'GJ',
    formula: 'Energy meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '15300', unit: 'GJ', parameterType: 'variable' },
    ],
  },
  // 303.3.1 — Table-1 : Water withdrawal - Fresh Water : TDS<= 1000mg/l
  {
    activityUID: 'ACT-MOCK-303-3-1',
    activityName: 'Table-1 : Water withdrawal - Fresh Water : TDS<= 1000mg/l',
    griCategory: 'GRI 303-3 Water withdrawal',
    griSubcategory: '303.3.1',
    scope: '1',
    calculatedValue: 125.5,
    unit: 'ML',
    formula: 'Water meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '125.5', unit: 'ML', parameterType: 'variable' },
    ],
  },
  // 303.4.5 — Table-5 : Water discharge - Fresh Water : TDS<= 1000mg/l
  {
    activityUID: 'ACT-MOCK-303-4-5',
    activityName: 'Table-5 : Water discharge - Fresh Water : TDS<= 1000mg/l',
    griCategory: 'GRI 303-4 Water discharge',
    griSubcategory: '303.4.5',
    scope: '1',
    calculatedValue: 89.3,
    unit: 'ML',
    formula: 'Water meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '89.3', unit: 'ML', parameterType: 'variable' },
    ],
  },
  // 303.5.1 — All areas
  {
    activityUID: 'ACT-MOCK-303-5-1',
    activityName: 'All areas',
    griCategory: 'GRI 303-5 Water consumption',
    griSubcategory: '303.5.1',
    scope: '1',
    calculatedValue: 36.2,
    unit: 'ML',
    formula: 'Water meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '36.2', unit: 'ML', parameterType: 'variable' },
    ],
  },
  // 306.4.2 — Table-2 : Recycling (Hazardous Onsite)
  {
    activityUID: 'ACT-MOCK-306-4-2',
    activityName: 'Table-2 : Recycling (Hazardous Onsite)',
    griCategory: 'GRI 306-4 Waste diverted from disposal',
    griSubcategory: '306.4.2',
    scope: '1',
    calculatedValue: 42.5,
    unit: 'ton',
    formula: 'Waste log',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '42.5', unit: 'ton', parameterType: 'variable' },
    ],
  },
  // 306.4.8 — Table-8 : Recycling (Non-Hazardous Onsite)
  {
    activityUID: 'ACT-MOCK-306-4-8',
    activityName: 'Table-8 : Recycling (Non-Hazardous Onsite)',
    griCategory: 'GRI 306-4 Waste diverted from disposal',
    griSubcategory: '306.4.8',
    scope: '1',
    calculatedValue: 187,
    unit: 'ton',
    formula: 'Waste log',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '187', unit: 'ton', parameterType: 'variable' },
    ],
  },
  // 306.5.15 — Table-15 : Landfilling (Hazardous Onsite)
  {
    activityUID: 'ACT-MOCK-306-5-15',
    activityName: 'Table-15 : Landfilling (Hazardous Onsite)',
    griCategory: 'GRI 306-5 Waste directed to disposal',
    griSubcategory: '306.5.15',
    scope: '1',
    calculatedValue: 8.4,
    unit: 'ton',
    formula: 'Waste log',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '8.4', unit: 'ton', parameterType: 'variable' },
    ],
  },

];

// ---------------------------------------------------------------------------
// BU-2  ·  Distribution Warehouse — East Coast  ·  bu-2 / BU-WHS-2025-002
// ---------------------------------------------------------------------------
const bu2Calculated: CalculatedActivityData[] = [
  // 305.2.8 — Electricity (Location-based)
  {
    activityUID: 'ACT-2024-0008',
    activityName: 'Table 8. Electricity purchased: Location-based',
    griCategory: GRI_LABEL.s2,
    griSubcategory: '305.2.8',
    scope: '2',
    calculatedValue: 612000,        // 1,500,000 kWh × 0.408
    unit: 'kgCO2e',
    formula: 'Electricity Consumption · Location-based',
    inputParameters: [
      { parameterId: 'param_electricity_consumption', parameterName: 'electricity_consumption',
        value: '1500000', unit: 'kWh', parameterType: 'variable' },
      { parameterId: 'param_grid_ef',                 parameterName: 'grid_ef',
        value: '0.408',   unit: 'kg CO2e/kWh', parameterType: 'ef_value' },
    ],
  },
  // 305.2.9 — Electricity (Market-based)
  {
    activityUID: 'ACT-2024-0009',
    activityName: 'Table 9. Electricity purchased: Market-based',
    griCategory: GRI_LABEL.s2,
    griSubcategory: '305.2.9',
    scope: '2',
    calculatedValue: 45000,         // 1,500,000 kWh × 0.030
    unit: 'kgCO2e',
    formula: 'Electricity Consumption · Market-based',
    inputParameters: [
      { parameterId: 'param_electricity_consumption', parameterName: 'electricity_consumption',
        value: '1500000', unit: 'kWh', parameterType: 'variable' },
      { parameterId: 'param_grid_ef',                 parameterName: 'market_ef',
        value: '0.030',   unit: 'kg CO2e/kWh', parameterType: 'ef_value' },
    ],
  },
  // 305.3.4 — Upstream Transportation (diesel freight)
  {
    activityUID: 'ACT-2024-0034',
    activityName: 'Cat. 4: Upstream transportation',
    griCategory: GRI_LABEL.s3,
    griSubcategory: '305.3.4',
    scope: '3',
    calculatedValue: 184265,        // 68,500 L diesel × 2.69
    unit: 'kgCO2e',
    formula: 'Vehicle Fleet Emissions · Fuel-Based',
    inputParameters: [
      { parameterId: 'param_fuel_volume', parameterName: 'fuel_volume',
        value: '68500', unit: 'L', parameterType: 'variable' },
      { parameterId: 'param_fuel_ef',     parameterName: 'fuel_ef',
        value: '2.69',  unit: 'kg CO2e/L', parameterType: 'ef_value' },
    ],
  },
  // 305.3.6 — Business Travel
  {
    activityUID: 'ACT-2024-0036',
    activityName: 'Cat. 6: Business travel',
    griCategory: GRI_LABEL.s3,
    griSubcategory: '305.3.6',
    scope: '3',
    calculatedValue: 8640,          // 45,000 km × 0.192
    unit: 'kgCO2e',
    formula: 'Vehicle Fleet Emissions · Distance-Based',
    inputParameters: [
      { parameterId: 'param_distance',   parameterName: 'distance',
        value: '45000', unit: 'km', parameterType: 'variable' },
      { parameterId: 'param_vehicle_ef', parameterName: 'vehicle_ef',
        value: '0.192', unit: 'kg CO2e/km', parameterType: 'ef_value' },
    ],
  },
  // 305.3.7 — Employee Commuting
  {
    activityUID: 'ACT-2024-0037',
    activityName: 'Cat. 7: Employee commuting',
    griCategory: GRI_LABEL.s3,
    griSubcategory: '305.3.7',
    scope: '3',
    calculatedValue: 18893,         // 98,400 km × 0.192
    unit: 'kgCO2e',
    formula: 'Vehicle Fleet Emissions · Distance-Based',
    inputParameters: [
      { parameterId: 'param_distance',   parameterName: 'distance',
        value: '98400', unit: 'km', parameterType: 'variable' },
      { parameterId: 'param_vehicle_ef', parameterName: 'vehicle_ef',
        value: '0.192', unit: 'kg CO2e/km', parameterType: 'ef_value' },
    ],
  },
  // ───────────────────────────────────────────────────────────────────
  // Energy / Water / Waste additions (FY2025)
  // ───────────────────────────────────────────────────────────────────
  // 302.1.4 — Table-4 : Electricity Purchased
  {
    activityUID: 'ACT-MOCK-302-1-4',
    activityName: 'Table-4 : Electricity Purchased',
    griCategory: 'GRI 302-1 Energy Consumption within the organization',
    griSubcategory: '302.1.4',
    scope: '1',
    calculatedValue: 5400,
    unit: 'GJ',
    formula: 'Energy meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '5400', unit: 'GJ', parameterType: 'variable' },
    ],
  },
  // 303.3.1 — Table-1 : Water withdrawal - Fresh Water : TDS<= 1000mg/l
  {
    activityUID: 'ACT-MOCK-303-3-1',
    activityName: 'Table-1 : Water withdrawal - Fresh Water : TDS<= 1000mg/l',
    griCategory: 'GRI 303-3 Water withdrawal',
    griSubcategory: '303.3.1',
    scope: '1',
    calculatedValue: 12.8,
    unit: 'ML',
    formula: 'Water meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '12.8', unit: 'ML', parameterType: 'variable' },
    ],
  },
  // 303.4.5 — Table-5 : Water discharge - Fresh Water : TDS<= 1000mg/l
  {
    activityUID: 'ACT-MOCK-303-4-5',
    activityName: 'Table-5 : Water discharge - Fresh Water : TDS<= 1000mg/l',
    griCategory: 'GRI 303-4 Water discharge',
    griSubcategory: '303.4.5',
    scope: '1',
    calculatedValue: 10.4,
    unit: 'ML',
    formula: 'Water meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '10.4', unit: 'ML', parameterType: 'variable' },
    ],
  },
  // 306.4.8 — Table-8 : Recycling (Non-Hazardous Onsite)
  {
    activityUID: 'ACT-MOCK-306-4-8',
    activityName: 'Table-8 : Recycling (Non-Hazardous Onsite)',
    griCategory: 'GRI 306-4 Waste diverted from disposal',
    griSubcategory: '306.4.8',
    scope: '1',
    calculatedValue: 34.2,
    unit: 'ton',
    formula: 'Waste log',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '34.2', unit: 'ton', parameterType: 'variable' },
    ],
  },
  // 306.5.23 — Table-23 : Landfilling (Non-Hazardous Onsite)
  {
    activityUID: 'ACT-MOCK-306-5-23',
    activityName: 'Table-23 : Landfilling (Non-Hazardous Onsite)',
    griCategory: 'GRI 306-5 Waste directed to disposal',
    griSubcategory: '306.5.23',
    scope: '1',
    calculatedValue: 18.6,
    unit: 'ton',
    formula: 'Waste log',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '18.6', unit: 'ton', parameterType: 'variable' },
    ],
  },

];

// ---------------------------------------------------------------------------
// BU-3  ·  Corporate Office — HQ  ·  bu-3 / BU-OFF-2025-003
// ---------------------------------------------------------------------------
const bu3Calculated: CalculatedActivityData[] = [
  // 305.2.8 — Electricity (Location-based)
  {
    activityUID: 'ACT-2024-0008',
    activityName: 'Table 8. Electricity purchased: Location-based',
    griCategory: GRI_LABEL.s2,
    griSubcategory: '305.2.8',
    scope: '2',
    calculatedValue: 122400,        // 300,000 kWh × 0.408
    unit: 'kgCO2e',
    formula: 'Electricity Consumption · Location-based',
    inputParameters: [
      { parameterId: 'param_electricity_consumption', parameterName: 'electricity_consumption',
        value: '300000', unit: 'kWh', parameterType: 'variable' },
      { parameterId: 'param_grid_ef',                 parameterName: 'grid_ef',
        value: '0.408',  unit: 'kg CO2e/kWh', parameterType: 'ef_value' },
    ],
  },
  // 305.3.6 — Business Travel (air-heavy)
  {
    activityUID: 'ACT-2024-0036',
    activityName: 'Cat. 6: Business travel',
    griCategory: GRI_LABEL.s3,
    griSubcategory: '305.3.6',
    scope: '3',
    calculatedValue: 32400,         // 168,750 km × 0.192
    unit: 'kgCO2e',
    formula: 'Vehicle Fleet Emissions · Distance-Based',
    inputParameters: [
      { parameterId: 'param_distance',   parameterName: 'distance',
        value: '168750', unit: 'km', parameterType: 'variable' },
      { parameterId: 'param_vehicle_ef', parameterName: 'vehicle_ef',
        value: '0.192',  unit: 'kg CO2e/km', parameterType: 'ef_value' },
    ],
  },
  // 305.3.7 — Employee Commuting
  {
    activityUID: 'ACT-2024-0037',
    activityName: 'Cat. 7: Employee commuting',
    griCategory: GRI_LABEL.s3,
    griSubcategory: '305.3.7',
    scope: '3',
    calculatedValue: 45360,         // 236,250 km × 0.192
    unit: 'kgCO2e',
    formula: 'Vehicle Fleet Emissions · Distance-Based',
    inputParameters: [
      { parameterId: 'param_distance',   parameterName: 'distance',
        value: '236250', unit: 'km', parameterType: 'variable' },
      { parameterId: 'param_vehicle_ef', parameterName: 'vehicle_ef',
        value: '0.192',  unit: 'kg CO2e/km', parameterType: 'ef_value' },
    ],
  },
  // 305.3.1 — Purchased Goods (office supplies / services, spend-based)
  // Uses dedicated formula FORM-PUR-GOO-2024-001 (see dedicatedFormulas.ts)
  {
    activityUID: 'ACT-2024-0031',
    activityName: 'Cat. 1: Purchased goods and services',
    griCategory: GRI_LABEL.s3,
    griSubcategory: '305.3.1',
    scope: '3',
    calculatedValue: 18500,         // $41,111 × 0.45 ≈ 18,500
    unit: 'kgCO2e',
    formula: 'Purchased Goods - Spend-based',
    inputParameters: [
      { parameterId: 'param_purchase_amount', parameterName: 'purchase_amount',
        value: '41111', unit: 'USD', parameterType: 'variable' },
      { parameterId: 'param_spend_ef',        parameterName: 'spend_ef',
        value: '0.45',  unit: 'kg CO2e/USD', parameterType: 'ef_value' },
    ],
  },
  // ───────────────────────────────────────────────────────────────────
  // Energy / Water / Waste additions (FY2025)
  // ───────────────────────────────────────────────────────────────────
  // 302.1.4 — Table-4 : Electricity Purchased
  {
    activityUID: 'ACT-MOCK-302-1-4',
    activityName: 'Table-4 : Electricity Purchased',
    griCategory: 'GRI 302-1 Energy Consumption within the organization',
    griSubcategory: '302.1.4',
    scope: '1',
    calculatedValue: 1080,
    unit: 'GJ',
    formula: 'Energy meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '1080', unit: 'GJ', parameterType: 'variable' },
    ],
  },
  // 303.3.1 — Table-1 : Water withdrawal - Fresh Water : TDS<= 1000mg/l
  {
    activityUID: 'ACT-MOCK-303-3-1',
    activityName: 'Table-1 : Water withdrawal - Fresh Water : TDS<= 1000mg/l',
    griCategory: 'GRI 303-3 Water withdrawal',
    griSubcategory: '303.3.1',
    scope: '1',
    calculatedValue: 4.5,
    unit: 'ML',
    formula: 'Water meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '4.5', unit: 'ML', parameterType: 'variable' },
    ],
  },
  // 303.4.5 — Table-5 : Water discharge - Fresh Water : TDS<= 1000mg/l
  {
    activityUID: 'ACT-MOCK-303-4-5',
    activityName: 'Table-5 : Water discharge - Fresh Water : TDS<= 1000mg/l',
    griCategory: 'GRI 303-4 Water discharge',
    griSubcategory: '303.4.5',
    scope: '1',
    calculatedValue: 3.8,
    unit: 'ML',
    formula: 'Water meter reading',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '3.8', unit: 'ML', parameterType: 'variable' },
    ],
  },
  // 306.4.8 — Table-8 : Recycling (Non-Hazardous Onsite)
  {
    activityUID: 'ACT-MOCK-306-4-8',
    activityName: 'Table-8 : Recycling (Non-Hazardous Onsite)',
    griCategory: 'GRI 306-4 Waste diverted from disposal',
    griSubcategory: '306.4.8',
    scope: '1',
    calculatedValue: 6.8,
    unit: 'ton',
    formula: 'Waste log',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '6.8', unit: 'ton', parameterType: 'variable' },
    ],
  },
  // 306.5.23 — Table-23 : Landfilling (Non-Hazardous Onsite)
  {
    activityUID: 'ACT-MOCK-306-5-23',
    activityName: 'Table-23 : Landfilling (Non-Hazardous Onsite)',
    griCategory: 'GRI 306-5 Waste directed to disposal',
    griSubcategory: '306.5.23',
    scope: '1',
    calculatedValue: 2.3,
    unit: 'ton',
    formula: 'Waste log',
    inputParameters: [
      { parameterId: 'param_qty', parameterName: 'quantity',
        value: '2.3', unit: 'ton', parameterType: 'variable' },
    ],
  },

];

// ---------------------------------------------------------------------------
// THE EXPORT — replaces `mockSubmissions` in ActivityData.tsx
// ---------------------------------------------------------------------------
export const mockSubmissions: BusinessUnitDataSubmission[] = [
  {
    id: 'sub-bu1-2025',
    businessUnitId: 'bu-1',
    businessUnitUID: 'BU-MFG-2025-001',
    businessUnitName: 'Manufacturing Plant - North America',
    projectId: PROJ_1_UUID,
    projectName: 'Q1 2025 Carbon Assessment',
    calculatedData: bu1Calculated,
    uploadedBy: 'John Smith',
    uploadedAt: '2025-01-22T10:30:00Z',
    status: 'approved',
    comments:
      'All data verified against utility bills and fleet logs. Refrigerant leakage cross-checked with maintenance records. Approved for inclusion in GRI report.',
    fileName: 'BU-MFG-2025-001_ActivityData_FY2025.xlsx',
  },
  {
    id: 'sub-bu2-2025',
    businessUnitId: 'bu-2',
    businessUnitUID: 'BU-WHS-2025-002',
    businessUnitName: 'Distribution Warehouse - East Coast',
    projectId: PROJ_1_UUID,
    projectName: 'Q1 2025 Carbon Assessment',
    calculatedData: bu2Calculated,
    uploadedBy: 'Maria Chen',
    uploadedAt: '2025-01-24T14:15:00Z',
    status: 'submitted',
    fileName: 'BU-WHS-2025-002_ActivityData_FY2025.xlsx',
  },
  {
    id: 'sub-bu3-2025',
    businessUnitId: 'bu-3',
    businessUnitUID: 'BU-OFF-2025-003',
    businessUnitName: 'Corporate Office - HQ',
    projectId: PROJ_1_UUID,
    projectName: 'Q1 2025 Carbon Assessment',
    calculatedData: bu3Calculated,
    uploadedBy: 'David Park',
    uploadedAt: '2025-01-25T09:45:00Z',
    status: 'submitted',
    fileName: 'BU-OFF-2025-003_ActivityData_FY2025.xlsx',
  },
];
