/**
 * ISO 14064-1 Activities — multi-framework Activity definitions
 * =============================================================
 *
 * Companion to `activitiesData.ts`. These Activities were created by the
 * Sustainability Architect under the **ISO** framework, i.e. in the Activity
 * creation flow they picked an ISO 14064-1 sub-category (from
 * `isoStructureData.ts`) instead of a GRI sub-category.
 *
 * ── MODEL CHANGE ────────────────────────────────────────────────────────────
 * Two optional fields were added to `ActivityDefinition` so an Activity can be
 * created under EITHER framework (one framework per Activity):
 *
 *     framework?:     'GRI' | 'ISO'   // defaults to 'GRI' for legacy activities
 *     isoCategories?: string[]        // ISO sub-category codes, e.g. ['1.1']
 *
 * GRI activities keep using `grpCategories` (e.g. ['305.1.1']); ISO activities
 * leave `grpCategories: []` and populate `isoCategories` instead. Report
 * Template rows can therefore be mapped to a GRI activity OR an ISO activity —
 * the mapping is just an `activityUID`, framework-agnostic.
 *
 * ── EMISSION FACTORS referenced ─────────────────────────────────────────────
 *   EF-FUE-GLB-2024-001  Natural Gas Combustion          1.89   kg CO₂e/m³
 *   EF-ENE-2024-0003     Heavy-Duty Diesel               2.69   kg CO₂e/L
 *   EF-ENE-2024-0001     US National Grid Electricity    0.408  kg CO₂e/kWh
 *   EF-TRA-2024-0007     Light Duty Vehicle — Gasoline   0.192  kg CO₂e/km
 *   EF-PRO-CAL-2025-001  Industrial Process — Calcination 0.51  kg CO₂e/kg     (NEW · ISO)
 *   EF-ENE-STM-2025-001  Imported Steam / District Heat   0.20  kg CO₂e/kWh    (NEW · ISO)
 *   EF-WAS-LAN-2025-001  Mixed Waste to Landfill         450    kg CO₂e/ton    (NEW · ISO)
 *   EF-USE-PRD-2025-001  Product Use-Phase Energy        12.5   kg CO₂e/unit   (NEW · ISO)
 *   EF-EOL-PRD-2025-001  Product End-of-Life Treatment    2.1   kg CO₂e/unit   (NEW · ISO)
 *   EF-SPD-GOO-2024-001  Purchased Goods — Spend-based   0.45   kg CO₂e/USD
 *   EF-SPD-CAP-2024-001  Capital Goods — Spend-based     0.42   kg CO₂e/USD
 *   (R-410A refrigerant GWP100 = 2088, applied as gwp_factor)
 */

import type { ActivityDefinition } from './activitiesData';

/** ActivityDefinition extended with the two multi-framework fields. */
export interface FrameworkActivityDefinition extends ActivityDefinition {
  /** Which standard this Activity was created under. Legacy = 'GRI'. */
  framework?: 'GRI' | 'ISO';
  /** ISO 14064-1 sub-category codes (e.g. ['1.1']). Empty for GRI activities. */
  isoCategories?: string[];
}

export const isoActivities: FrameworkActivityDefinition[] = [
  // ════════════════════════════════════════════════════════════════════════
  // CATEGORY 1 · Direct GHG emissions and removals
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'act-iso-101',
    uid: 'ACT-ISO-2025-0101',
    name: 'Stationary Combustion — Natural Gas Boilers',
    framework: 'ISO',
    isoCategories: ['1.1'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-FUE-NAT-2024-003',
    formulaName: 'Natural Gas Combustion',
    expressionId: 'expr_gross_emissions',
    expressionName: 'Gross Emissions',
    efParameterMappings: [
      { parameterId: 'param_gas_ef', parameterName: 'Natural Gas Emission Factor', unit: 'kg CO2e/m³', efUID: 'EF-FUE-GLB-2024-001', efName: 'Natural Gas Combustion' },
    ],
    createdAt: '2025-01-08T09:00:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'master',
  },
  {
    id: 'act-iso-102',
    uid: 'ACT-ISO-2025-0102',
    name: 'Mobile Combustion — Plant Diesel Fleet',
    framework: 'ISO',
    isoCategories: ['1.2'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    expressionId: 'expr_fuel_emissions',
    expressionName: 'Fuel-Based Emissions',
    efParameterMappings: [
      { parameterId: 'param_fuel_ef', parameterName: 'Diesel Fuel Emission Factor', unit: 'kg CO2e/L', efUID: 'EF-ENE-2024-0003', efName: 'Heavy-Duty Diesel Truck' },
    ],
    createdAt: '2025-01-08T09:20:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'master',
  },
  {
    id: 'act-iso-102b',
    uid: 'ACT-ISO-2025-0112',
    name: 'Mobile Combustion — Refrigerated Delivery Trucks',
    framework: 'ISO',
    isoCategories: ['1.2'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    expressionId: 'expr_fuel_emissions',
    expressionName: 'Fuel-Based Emissions',
    efParameterMappings: [
      { parameterId: 'param_fuel_ef', parameterName: 'Diesel Fuel Emission Factor', unit: 'kg CO2e/L', efUID: 'EF-ENE-2024-0003', efName: 'Heavy-Duty Diesel Truck' },
    ],
    createdAt: '2025-01-08T09:25:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'master',
  },
  {
    id: 'act-iso-103',
    uid: 'ACT-ISO-2025-0103',
    name: 'Process Emissions — Calcination',
    framework: 'ISO',
    isoCategories: ['1.3'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-PRO-CAL-2025-001',
    formulaName: 'Industrial Process Emissions',
    expressionId: 'expr_process_emissions',
    expressionName: 'Process Emissions (mass-based)',
    efParameterMappings: [
      { parameterId: 'param_process_ef', parameterName: 'Calcination Emission Factor', unit: 'kg CO2e/kg', efUID: 'EF-PRO-CAL-2025-001', efName: 'Industrial Process — Calcination' },
    ],
    createdAt: '2025-01-08T09:40:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'client',
  },
  {
    id: 'act-iso-104',
    uid: 'ACT-ISO-2025-0104',
    name: 'Fugitive Emissions — Refrigerant Leakage (R-410A)',
    framework: 'ISO',
    isoCategories: ['1.4'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-REF-FUG-2024-001',
    formulaName: 'Refrigerant Leakage · Mass-Balance Method',
    expressionId: 'expr_mass_balance',
    expressionName: 'Mass-Balance Leakage',
    efParameterMappings: [
      { parameterId: 'param_gwp_factor', parameterName: 'Refrigerant GWP100', unit: 'kg CO2e/kg', efUID: 'EF-REF-410A-2024-001', efName: 'R-410A GWP100 (2088)' },
    ],
    createdAt: '2025-01-08T10:00:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'client',
  },

  // ════════════════════════════════════════════════════════════════════════
  // CATEGORY 2 · Indirect GHG emissions from imported energy
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'act-iso-201',
    uid: 'ACT-ISO-2025-0201',
    name: 'Imported Electricity — Grid (Location-based)',
    framework: 'ISO',
    isoCategories: ['2.1'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-ENE-ELEC-2024-001',
    formulaName: 'Electricity Consumption Emissions',
    expressionId: 'expr_total_emissions',
    expressionName: 'Total CO2 Emissions',
    efParameterMappings: [
      { parameterId: 'param_grid_ef', parameterName: 'Grid Emission Factor', unit: 'kg CO2e/kWh', efUID: 'EF-ENE-2024-0001', efName: 'National Grid Electricity Mix - United States' },
    ],
    createdAt: '2025-01-08T10:20:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'master',
  },
  {
    id: 'act-iso-202',
    uid: 'ACT-ISO-2025-0202',
    name: 'Imported Steam & District Heat',
    framework: 'ISO',
    isoCategories: ['2.2'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-ENE-STM-2025-001',
    formulaName: 'Imported Steam Emissions',
    expressionId: 'expr_total_emissions',
    expressionName: 'Total CO2 Emissions',
    efParameterMappings: [
      { parameterId: 'param_steam_ef', parameterName: 'Steam Emission Factor', unit: 'kg CO2e/kWh', efUID: 'EF-ENE-STM-2025-001', efName: 'Imported Steam / District Heat' },
    ],
    createdAt: '2025-01-08T10:30:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'client',
  },

  // ════════════════════════════════════════════════════════════════════════
  // CATEGORY 3 · Indirect GHG emissions from transportation
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'act-iso-301',
    uid: 'ACT-ISO-2025-0301',
    name: 'Upstream Transportation — Inbound Freight (3PL)',
    framework: 'ISO',
    isoCategories: ['3.1'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    expressionId: 'expr_fuel_emissions',
    expressionName: 'Fuel-Based Emissions',
    efParameterMappings: [
      { parameterId: 'param_fuel_ef', parameterName: 'Diesel Fuel Emission Factor', unit: 'kg CO2e/L', efUID: 'EF-ENE-2024-0003', efName: 'Heavy-Duty Diesel Truck' },
    ],
    createdAt: '2025-01-08T10:45:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'master',
  },
  {
    id: 'act-iso-303',
    uid: 'ACT-ISO-2025-0303',
    name: 'Employee Commuting',
    framework: 'ISO',
    isoCategories: ['3.3'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    expressionId: 'expr_distance_emissions',
    expressionName: 'Distance-Based Emissions',
    efParameterMappings: [
      { parameterId: 'param_vehicle_ef', parameterName: 'Commute Emission Factor', unit: 'kg CO2e/km', efUID: 'EF-TRA-2024-0007', efName: 'Light Duty Vehicle - Gasoline' },
    ],
    createdAt: '2025-01-08T11:00:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'master',
  },
  {
    id: 'act-iso-305',
    uid: 'ACT-ISO-2025-0305',
    name: 'Business Travel',
    framework: 'ISO',
    isoCategories: ['3.5'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    expressionId: 'expr_distance_emissions',
    expressionName: 'Distance-Based Emissions',
    efParameterMappings: [
      { parameterId: 'param_vehicle_ef', parameterName: 'Travel Emission Factor', unit: 'kg CO2e/km', efUID: 'EF-TRA-2024-0007', efName: 'Light Duty Vehicle - Gasoline' },
    ],
    createdAt: '2025-01-08T11:10:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'master',
  },

  // ════════════════════════════════════════════════════════════════════════
  // CATEGORY 4 · Indirect GHG emissions from products used by the organization
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'act-iso-401',
    uid: 'ACT-ISO-2025-0401',
    name: 'Purchased Goods & Services (Spend-based)',
    framework: 'ISO',
    isoCategories: ['4.1'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-PUR-GOO-2024-001',
    formulaName: 'Purchased Goods - Spend-based',
    expressionId: 'expr_spend_emissions',
    expressionName: 'Spend-Based Emissions',
    efParameterMappings: [
      { parameterId: 'param_spend_ef', parameterName: 'Spend Emission Factor', unit: 'kg CO2e/USD', efUID: 'EF-SPD-GOO-2024-001', efName: 'Purchased Goods — Spend-based' },
    ],
    createdAt: '2025-01-08T11:25:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'master',
  },
  {
    id: 'act-iso-402',
    uid: 'ACT-ISO-2025-0402',
    name: 'Capital Goods (Spend-based)',
    framework: 'ISO',
    isoCategories: ['4.2'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-CAP-GOO-2024-001',
    formulaName: 'Capital Goods - Spend-based',
    expressionId: 'expr_spend_emissions',
    expressionName: 'Spend-Based Emissions',
    efParameterMappings: [
      { parameterId: 'param_capex_ef', parameterName: 'Capex Emission Factor', unit: 'kg CO2e/USD', efUID: 'EF-SPD-CAP-2024-001', efName: 'Capital Goods — Spend-based' },
    ],
    createdAt: '2025-01-08T11:35:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'master',
  },
  {
    id: 'act-iso-403',
    uid: 'ACT-ISO-2025-0403',
    name: 'Disposal of Solid & Liquid Waste',
    framework: 'ISO',
    isoCategories: ['4.3'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-WAS-LAN-2025-001',
    formulaName: 'Waste Disposal Emissions',
    expressionId: 'expr_mass_emissions',
    expressionName: 'Mass-Based Emissions',
    efParameterMappings: [
      { parameterId: 'param_waste_ef', parameterName: 'Waste Disposal Emission Factor', unit: 'kg CO2e/ton', efUID: 'EF-WAS-LAN-2025-001', efName: 'Mixed Waste to Landfill' },
    ],
    createdAt: '2025-01-08T11:45:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'client',
  },

  // ════════════════════════════════════════════════════════════════════════
  // CATEGORY 5 · Indirect GHG emissions from use of products from the org
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'act-iso-501',
    uid: 'ACT-ISO-2025-0501',
    name: 'Use of Sold Products — Use-Phase Energy',
    framework: 'ISO',
    isoCategories: ['5.1'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-USE-PRD-2025-001',
    formulaName: 'Product Use-Phase Emissions',
    expressionId: 'expr_unit_emissions',
    expressionName: 'Unit-Based Emissions',
    efParameterMappings: [
      { parameterId: 'param_use_ef', parameterName: 'Use-Phase Emission Factor', unit: 'kg CO2e/unit', efUID: 'EF-USE-PRD-2025-001', efName: 'Product Use-Phase Energy' },
    ],
    createdAt: '2025-01-08T12:00:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'client',
  },
  {
    id: 'act-iso-503',
    uid: 'ACT-ISO-2025-0503',
    name: 'End-of-Life Treatment of Sold Products',
    framework: 'ISO',
    isoCategories: ['5.3'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-EOL-PRD-2025-001',
    formulaName: 'Product End-of-Life Emissions',
    expressionId: 'expr_unit_emissions',
    expressionName: 'Unit-Based Emissions',
    efParameterMappings: [
      { parameterId: 'param_eol_ef', parameterName: 'End-of-Life Emission Factor', unit: 'kg CO2e/unit', efUID: 'EF-EOL-PRD-2025-001', efName: 'Product End-of-Life Treatment' },
    ],
    createdAt: '2025-01-08T12:10:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'client',
  },

  // ════════════════════════════════════════════════════════════════════════
  // CATEGORY 6 · Other indirect GHG emissions
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'act-iso-601',
    uid: 'ACT-ISO-2025-0601',
    name: 'Other Indirect — Outsourced Operations (Spend-based)',
    framework: 'ISO',
    isoCategories: ['6.1'],
    grpCategories: [],
    impactCategories: ['Climate Change - total (GWP)'],
    formulaUID: 'FORM-PUR-GOO-2024-001',
    formulaName: 'Purchased Goods - Spend-based',
    expressionId: 'expr_spend_emissions',
    expressionName: 'Spend-Based Emissions',
    efParameterMappings: [
      { parameterId: 'param_spend_ef', parameterName: 'Spend Emission Factor', unit: 'kg CO2e/USD', efUID: 'EF-SPD-GOO-2024-001', efName: 'Purchased Goods — Spend-based' },
    ],
    createdAt: '2025-01-08T12:20:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'client',
  },
];

/**
 * Convenience: the combined activity list once ISO activities are folded in.
 * In the app, merge into `allActivities` so the Report Template "Map to
 * Activity" picker shows GRI and ISO activities side by side:
 *
 *   import { allActivities } from './activitiesData';
 *   import { isoActivities } from './isoActivitiesData';
 *   export const allActivitiesAllFrameworks = [...allActivities, ...isoActivities];
 */
export const isoActivityByUID: Record<string, FrameworkActivityDefinition> =
  isoActivities.reduce((acc, a) => { acc[a.uid] = a; return acc; }, {} as Record<string, FrameworkActivityDefinition>);
