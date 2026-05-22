/**
 * SustainPro — Dedicated Formulas Patch
 * =====================================
 *
 * Removes the proxy reuses in the FY2025 seed by adding two new formulas to
 * the Master DB and rebinding three activities to use them:
 *
 *  Activity                                      Before                                  After
 *  ───────────────────────────────────────────────────────────────────────────────────────────
 *  ACT-2024-0003 Fugitive Refrigerant            Natural Gas Combustion (proxy)          FORM-REF-FUG-2024-001 Refrigerant Leakage (mass × GWP)
 *  ACT-2024-0031 Cat. 1 Purchased Goods          Vehicle Fleet Emissions (proxy)         FORM-PUR-GOO-2024-001 Purchased Goods (spend × EF)
 *  ACT-2024-0032 Cat. 2 Capital Goods            Natural Gas Combustion (proxy)          FORM-CAP-GOO-2024-001 Capital Goods (capex × EF)
 *
 * Two new Master DB EFs are referenced:
 *  EF-REF-GWP-2024-001  R-410A refrigerant — IPCC AR6, GWP100 = 2,088 kg CO2e/kg
 *  EF-SPEND-2024-001    Purchased goods spend-based — US EPA, 0.45 kg CO2e/USD
 *  EF-CAPEX-2024-001    Capital goods spend-based — US EPA, 0.42 kg CO2e/USD
 *
 * HOW TO APPLY
 * ────────────
 * 1) Add the EF rows below to whatever Master DB EF table powers
 *    `src/components/admin/EmissionFactors.tsx` (or the Supabase EF table if
 *    you keep them server-side). UIDs must match those above.
 * 2) Append `newFormulas` to the `masterFormulas` array in
 *    `src/data/formulasData.ts` (drop in just before the closing `];`).
 * 3) Apply `activityRemap` to the relevant entries in
 *    `src/components/sa/activitiesData.ts` (replaces formulaUID /
 *    expressionId / efParameterMappings for the three activities).
 * 4) Re-run the Supabase seed (`mock-data/seed-supabase.sql`) — it now uses
 *    the new formula labels for clarity, but the calculated values are
 *    deliberately unchanged so the GRI / ISO totals stay the same.
 */

import type { FormulaDefinition } from '../SustainPro/src/data/formulasData';
import type { ActivityDefinition } from '../SustainPro/src/components/sa/activitiesData';

// ===========================================================================
// 1)  EMISSION FACTORS — add these three rows to the Master DB
// ===========================================================================
//
// EF-REF-GWP-2024-001  Refrigerant — R-410A         GWP100 = 2,088   kg CO2e/kg   (IPCC AR6)
// EF-SPEND-2024-001    Purchased goods — spend      0.45             kg CO2e/USD  (US EPA env. economic input-output)
// EF-CAPEX-2024-001    Capital goods — spend        0.42             kg CO2e/USD  (US EPA env. economic input-output)
//
// (Add via the Admin · Master DB - Emission Factors UI, or insert into the
// Supabase emission_factors table if you keep them server-side. The seed
// references these UIDs by name only — they don't need to exist for the
// seed to render, but the SA's activity-creation UI will need them.)

// ===========================================================================
// 2)  FORMULAS — append to masterFormulas in src/data/formulasData.ts
// ===========================================================================
export const newFormulas: FormulaDefinition[] = [

  // -------------------------------------------------------------------------
  // FORM-REF-FUG-2024-001  ·  Refrigerant Leakage (mass × GWP)
  // -------------------------------------------------------------------------
  {
    id: 'form-ref-fug',
    uid: 'FORM-REF-FUG-2024-001',
    name: 'Refrigerant Leakage',
    description:
      'Calculate fugitive Scope 1 emissions from refrigerant leakage using ' +
      'the mass-balance method (annual leakage × GWP100).',
    category: 'Fugitive - Refrigerants',
    tags: ['scope-1', 'fugitive', 'refrigerant', 'gwp'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2025-01-10T10:00:00Z',
    expressions: [
      {
        id: 'expr_mass_balance',
        name: 'Mass-Balance Method',
        expression: 'refrigerant_mass * gwp_factor',
        parameters: [
          {
            id: 'param_refrigerant_mass',
            name: 'refrigerant_mass',
            type: 'number',
            unit: 'kg',
            required: true,
            description: 'Annual mass of refrigerant leaked / topped up',
            minValue: 0,
            parameterType: 'variable',
          },
          {
            id: 'param_gwp_factor',
            name: 'gwp_factor',
            type: 'number',
            unit: 'kg CO2e/kg',
            required: true,
            description: 'Global Warming Potential (GWP100) of the refrigerant',
            parameterType: 'ef_value',
            efUID: 'EF-REF-GWP-2024-001',
          },
        ],
        sourceName: 'IPCC AR6 · GWP100 values',
        sourceURL: 'https://www.ipcc.ch/report/ar6/',
        methodology:
          'GHG Protocol Scope 1 - Fugitive emissions; mass-balance / simplified ' +
          'material balance approach.',
        isActive: true,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // FORM-PUR-GOO-2024-001  ·  Purchased Goods & Services (spend-based)
  // -------------------------------------------------------------------------
  {
    id: 'form-pur-goo',
    uid: 'FORM-PUR-GOO-2024-001',
    name: 'Purchased Goods - Spend-based',
    description:
      'Calculate Scope 3 Cat. 1 emissions from purchased goods and services ' +
      'using the spend-based method (procurement value × spend EF).',
    category: 'Scope 3 - Purchased Goods',
    tags: ['scope-3', 'purchased-goods', 'spend-based', 'upstream'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2025-01-10T10:30:00Z',
    expressions: [
      {
        id: 'expr_spend_based',
        name: 'Spend-based Method',
        expression: 'purchase_amount * spend_ef',
        parameters: [
          {
            id: 'param_purchase_amount',
            name: 'purchase_amount',
            type: 'number',
            unit: 'USD',
            required: true,
            description: 'Annual procurement spend on goods & services',
            minValue: 0,
            parameterType: 'variable',
          },
          {
            id: 'param_spend_ef',
            name: 'spend_ef',
            type: 'number',
            unit: 'kg CO2e/USD',
            required: true,
            description: 'Spend-based emission factor (US EPA EEIO)',
            parameterType: 'ef_value',
            efUID: 'EF-SPEND-2024-001',
          },
        ],
        sourceName: 'GHG Protocol Scope 3 Standard · US EPA EEIO',
        sourceURL: 'https://ghgprotocol.org/standards/scope-3-standard',
        isActive: true,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // FORM-CAP-GOO-2024-001  ·  Capital Goods (capex × EF)
  // -------------------------------------------------------------------------
  {
    id: 'form-cap-goo',
    uid: 'FORM-CAP-GOO-2024-001',
    name: 'Capital Goods - Spend-based',
    description:
      'Calculate Scope 3 Cat. 2 emissions from capital expenditure using the ' +
      'spend-based method.',
    category: 'Scope 3 - Capital Goods',
    tags: ['scope-3', 'capital-goods', 'capex', 'upstream'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2025-01-10T11:00:00Z',
    expressions: [
      {
        id: 'expr_capex_spend',
        name: 'Capital Expenditure Method',
        expression: 'capex_amount * capex_ef',
        parameters: [
          {
            id: 'param_capex_amount',
            name: 'capex_amount',
            type: 'number',
            unit: 'USD',
            required: true,
            description: 'Annual capital expenditure (equipment, buildings, vehicles…)',
            minValue: 0,
            parameterType: 'variable',
          },
          {
            id: 'param_capex_ef',
            name: 'capex_ef',
            type: 'number',
            unit: 'kg CO2e/USD',
            required: true,
            description: 'Capital goods spend-based emission factor (US EPA EEIO)',
            parameterType: 'ef_value',
            efUID: 'EF-CAPEX-2024-001',
          },
        ],
        sourceName: 'GHG Protocol Scope 3 Standard · US EPA EEIO',
        sourceURL: 'https://ghgprotocol.org/standards/scope-3-standard',
        isActive: true,
      },
    ],
  },
];

// ===========================================================================
// 3)  ACTIVITY RE-MAPPINGS — apply to src/components/sa/activitiesData.ts
// ===========================================================================
//
// Use these to overwrite the matching fields on each of the three activities.
// Leave id/uid/name/grpCategories/createdAt/createdBy/status/source unchanged.

export const activityRemap: Partial<Record<string, Pick<ActivityDefinition,
  'formulaUID' | 'formulaName' | 'expressionId' | 'expressionName' | 'efParameterMappings'
>>> = {

  // -- ACT-2024-0003  Fugitive Refrigerant ----------------------------------
  'ACT-2024-0003': {
    formulaUID:     'FORM-REF-FUG-2024-001',
    formulaName:    'Refrigerant Leakage',
    expressionId:   'expr_mass_balance',
    expressionName: 'Mass-Balance Method',
    efParameterMappings: [
      {
        parameterId:   'param_gwp_factor',
        parameterName: 'GWP100 (R-410A)',
        unit:          'kg CO2e/kg',
        efUID:         'EF-REF-GWP-2024-001',
        efName:        'Refrigerant R-410A — IPCC AR6 GWP100',
      },
    ],
  },

  // -- ACT-2024-0031  Cat. 1 Purchased Goods & Services ---------------------
  'ACT-2024-0031': {
    formulaUID:     'FORM-PUR-GOO-2024-001',
    formulaName:    'Purchased Goods - Spend-based',
    expressionId:   'expr_spend_based',
    expressionName: 'Spend-based Method',
    efParameterMappings: [
      {
        parameterId:   'param_spend_ef',
        parameterName: 'Spend-based EF (US EPA EEIO)',
        unit:          'kg CO2e/USD',
        efUID:         'EF-SPEND-2024-001',
        efName:        'Purchased Goods — Spend-based (US EPA EEIO)',
      },
    ],
  },

  // -- ACT-2024-0032  Cat. 2 Capital Goods ----------------------------------
  'ACT-2024-0032': {
    formulaUID:     'FORM-CAP-GOO-2024-001',
    formulaName:    'Capital Goods - Spend-based',
    expressionId:   'expr_capex_spend',
    expressionName: 'Capital Expenditure Method',
    efParameterMappings: [
      {
        parameterId:   'param_capex_ef',
        parameterName: 'Capex EF (US EPA EEIO)',
        unit:          'kg CO2e/USD',
        efUID:         'EF-CAPEX-2024-001',
        efName:        'Capital Goods — Spend-based (US EPA EEIO)',
      },
    ],
  },
};
