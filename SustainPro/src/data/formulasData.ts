/**
 * Centralized Formulas Data - Master DB Formulas with Expressions
 * 
 * This file contains all Master DB formulas with their expressions and parameters.
 * Each formula can have multiple expressions (versions), and each expression defines
 * which parameters are needed and their types (variable vs ef_value).
 */

export interface FormulaParameter {
  id: string;
  name: string;
  type: 'number' | 'text' | 'date';
  unit: string;
  defaultValue?: number | string;
  required: boolean;
  description: string;
  minValue?: number;
  maxValue?: number;
  parameterType: 'variable' | 'ef_value' | 'constant';
  efUID?: string; // Link to emission factor for ef_value parameters
}

export interface FormulaExpression {
  id: string;
  name: string;
  expression: string;
  parameters: FormulaParameter[];
  sourceName: string;
  sourceURL?: string;
  methodology?: string;
  isActive: boolean;
}

export interface FormulaDefinition {
  id: string;
  uid: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  database: 'master' | 'client';
  createdBy: string;
  createdAt: string;
  expressions: FormulaExpression[];
}

/**
 * All Master DB Formulas with their expressions
 */
export const masterFormulas: FormulaDefinition[] = [
  // ============================================
  // FORMULA 1: Natural Gas Combustion
  // ============================================
  {
    id: 'form-1',
    uid: 'FORM-FUE-NAT-2024-003',
    name: 'Natural Gas Combustion',
    description: 'Calculate emissions from natural gas combustion in stationary equipment',
    category: 'Fuel - Natural Gas',
    tags: ['scope-1', 'combustion', 'stationary', 'natural-gas'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    expressions: [
      {
        id: 'expr_gross_emissions',
        name: 'Gross Emissions',
        expression: 'gas_volume * gas_ef',
        parameters: [
          {
            id: 'param_gas_volume',
            name: 'gas_volume',
            type: 'number',
            unit: 'm³',
            required: true,
            description: 'Volume of natural gas consumed',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_gas_ef',
            name: 'gas_ef',
            type: 'number',
            unit: 'kg CO2e/m³',
            required: true,
            description: 'Natural Gas Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-NAT-GAS-2024-001'
          }
        ],
        sourceName: 'IPCC 2006 Guidelines',
        sourceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        isActive: true
      },
      {
        id: 'expr_net_emissions',
        name: 'Net Emissions',
        expression: 'gas_volume * gas_ef',
        parameters: [
          {
            id: 'param_gas_volume_net',
            name: 'gas_volume',
            type: 'number',
            unit: 'm³',
            required: true,
            description: 'Volume of natural gas consumed',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_gas_ef_net',
            name: 'gas_ef',
            type: 'number',
            unit: 'kg CO2e/m³',
            required: true,
            description: 'Natural Gas Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-NAT-GAS-2024-001'
          }
        ],
        sourceName: 'IPCC 2006 Guidelines',
        sourceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        isActive: true
      }
    ]
  },

  // ============================================
  // FORMULA 2: Vehicle Fleet Emissions
  // ============================================
  {
    id: 'form-2',
    uid: 'FORM-TRA-VEH-2024-002',
    name: 'Vehicle Fleet Emissions',
    description: 'Calculate emissions from vehicle fleet based on distance traveled',
    category: 'Transport - Vehicles',
    tags: ['scope-1', 'transport', 'mobile', 'vehicles'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    expressions: [
      {
        id: 'expr_distance_emissions',
        name: 'Distance-based Emissions',
        expression: 'distance * vehicle_ef',
        parameters: [
          {
            id: 'param_distance',
            name: 'distance',
            type: 'number',
            unit: 'km',
            required: true,
            description: 'Total distance traveled by vehicles',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_vehicle_ef',
            name: 'vehicle_ef',
            type: 'number',
            unit: 'kg CO2e/km',
            required: true,
            description: 'Vehicle Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-VEH-2024-001'
          }
        ],
        sourceName: 'IPCC 2006 Guidelines',
        sourceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        isActive: true
      },
      {
        id: 'expr_fuel_emissions',
        name: 'Fuel-based Emissions',
        expression: 'fuel_volume * fuel_ef',
        parameters: [
          {
            id: 'param_fuel_volume',
            name: 'fuel_volume',
            type: 'number',
            unit: 'L',
            required: true,
            description: 'Volume of fuel consumed',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_fuel_ef',
            name: 'fuel_ef',
            type: 'number',
            unit: 'kg CO2e/L',
            required: true,
            description: 'Fuel Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-FUEL-2024-001'
          }
        ],
        sourceName: 'IPCC 2006 Guidelines',
        isActive: true
      }
    ]
  },

  // ============================================
  // FORMULA 3: Refrigerant Emissions
  // ============================================
  {
    id: 'form-3',
    uid: 'FORM-REF-FUG-2024-001',
    name: 'Refrigerant Emissions',
    description: 'Calculate fugitive emissions from refrigerant leakage',
    category: 'Fugitive - Refrigerants',
    tags: ['scope-1', 'fugitive', 'refrigerant', 'gwp'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    expressions: [
      {
        id: 'expr_refrigerant_gwp',
        name: 'GWP-based Emissions',
        expression: 'refrigerant_mass * gwp_factor',
        parameters: [
          {
            id: 'param_refrigerant_mass',
            name: 'refrigerant_mass',
            type: 'number',
            unit: 'kg',
            required: true,
            description: 'Mass of refrigerant leaked',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_gwp_factor',
            name: 'gwp_factor',
            type: 'number',
            unit: 'kg CO2e/kg',
            required: true,
            description: 'Global Warming Potential Factor',
            parameterType: 'ef_value',
            efUID: 'EF-REF-GWP-2024-001'
          }
        ],
        sourceName: 'IPCC AR6',
        sourceURL: 'https://www.ipcc.ch/report/ar6/',
        isActive: true
      }
    ]
  },

  // ============================================
  // FORMULA 4: Electricity Consumption Emissions
  // ============================================
  {
    id: 'form-4',
    uid: 'FORM-ENE-ELEC-2024-001',
    name: 'Electricity Consumption Emissions',
    description: 'Calculate scope 2 emissions from electricity consumption',
    category: 'Energy - Electricity',
    tags: ['scope-2', 'electricity', 'grid', 'purchased-energy'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-10T08:30:00Z',
    expressions: [
      {
        id: 'expr_location_based',
        name: 'Location-based Method',
        expression: 'electricity_consumption * grid_ef',
        parameters: [
          {
            id: 'param_electricity_consumption',
            name: 'electricity_consumption',
            type: 'number',
            unit: 'kWh',
            required: true,
            description: 'Electricity consumption amount',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_grid_ef',
            name: 'grid_ef',
            type: 'number',
            unit: 'kg CO2e/kWh',
            required: true,
            description: 'Grid Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-GRID-2024-001'
          }
        ],
        sourceName: 'GHG Protocol Scope 2 Guidance',
        sourceURL: 'https://ghgprotocol.org/scope-2-guidance',
        isActive: true
      },
      {
        id: 'expr_market_based',
        name: 'Market-based Method',
        expression: 'electricity_consumption * market_ef',
        parameters: [
          {
            id: 'param_electricity_consumption_mb',
            name: 'electricity_consumption',
            type: 'number',
            unit: 'kWh',
            required: true,
            description: 'Electricity consumption amount',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_market_ef',
            name: 'market_ef',
            type: 'number',
            unit: 'kg CO2e/kWh',
            required: true,
            description: 'Market-specific Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-MARKET-2024-001'
          }
        ],
        sourceName: 'GHG Protocol Scope 2 Guidance',
        sourceURL: 'https://ghgprotocol.org/scope-2-guidance',
        isActive: true
      },
      {
        id: 'expr_total_emissions',
        name: 'Total CO2 Emissions',
        expression: 'electricity_consumption * grid_ef',
        parameters: [
          {
            id: 'param_electricity_consumption_total',
            name: 'electricity_consumption',
            type: 'number',
            unit: 'kWh',
            required: true,
            description: 'Electricity consumption amount',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_grid_ef_total',
            name: 'grid_ef',
            type: 'number',
            unit: 'kg CO2e/kWh',
            required: true,
            description: 'Grid Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-GRID-2024-001'
          }
        ],
        sourceName: 'GHG Protocol Scope 2 Guidance',
        sourceURL: 'https://ghgprotocol.org/scope-2-guidance',
        isActive: true
      }
    ]
  },

  // ============================================
  // FORMULA 5: Purchased Goods Emissions
  // ============================================
  {
    id: 'form-5',
    uid: 'FORM-PUR-GOO-2024-001',
    name: 'Purchased Goods Emissions',
    description: 'Calculate scope 3 emissions from purchased goods and services',
    category: 'Scope 3 - Purchased Goods',
    tags: ['scope-3', 'purchased-goods', 'supply-chain', 'upstream'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-20T09:00:00Z',
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
            description: 'Total purchase amount in currency',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_spend_ef',
            name: 'spend_ef',
            type: 'number',
            unit: 'kg CO2e/USD',
            required: true,
            description: 'Spend-based Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-SPEND-2024-001'
          }
        ],
        sourceName: 'GHG Protocol Scope 3 Standard',
        sourceURL: 'https://ghgprotocol.org/standards/scope-3-standard',
        isActive: true
      }
    ]
  },

  // ============================================
  // FORMULA 6: Capital Goods Emissions
  // ============================================
  {
    id: 'form-6',
    uid: 'FORM-CAP-GOO-2024-001',
    name: 'Capital Goods Emissions',
    description: 'Calculate scope 3 emissions from capital goods purchases',
    category: 'Scope 3 - Capital Goods',
    tags: ['scope-3', 'capital-goods', 'capex', 'upstream'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-20T09:00:00Z',
    expressions: [
      {
        id: 'expr_capex_based',
        name: 'Capital Expenditure Method',
        expression: 'capex_amount * capex_ef',
        parameters: [
          {
            id: 'param_capex_amount',
            name: 'capex_amount',
            type: 'number',
            unit: 'USD',
            required: true,
            description: 'Capital expenditure amount',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_capex_ef',
            name: 'capex_ef',
            type: 'number',
            unit: 'kg CO2e/USD',
            required: true,
            description: 'Capital Goods Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-CAPEX-2024-001'
          }
        ],
        sourceName: 'GHG Protocol Scope 3 Standard',
        sourceURL: 'https://ghgprotocol.org/standards/scope-3-standard',
        isActive: true
      }
    ]
  },

  // ============================================
  // FORMULA 7: Upstream Transportation
  // ============================================
  {
    id: 'form-7',
    uid: 'FORM-TRA-UPS-2024-001',
    name: 'Upstream Transportation',
    description: 'Calculate scope 3 emissions from upstream transportation and distribution',
    category: 'Scope 3 - Transportation',
    tags: ['scope-3', 'transportation', 'logistics', 'upstream'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-20T09:00:00Z',
    expressions: [
      {
        id: 'expr_tonne_km',
        name: 'Tonne-Kilometer Method',
        expression: 'weight * distance * transport_ef',
        parameters: [
          {
            id: 'param_weight',
            name: 'weight',
            type: 'number',
            unit: 'tonne',
            required: true,
            description: 'Weight of goods transported',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_transport_distance',
            name: 'distance',
            type: 'number',
            unit: 'km',
            required: true,
            description: 'Distance goods are transported',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_transport_ef',
            name: 'transport_ef',
            type: 'number',
            unit: 'kg CO2e/tonne-km',
            required: true,
            description: 'Transportation Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-TRANSPORT-2024-001'
          }
        ],
        sourceName: 'GHG Protocol Scope 3 Standard',
        sourceURL: 'https://ghgprotocol.org/standards/scope-3-standard',
        isActive: true
      }
    ]
  },

  // ============================================
  // FORMULA 8: Business Travel
  // ============================================
  {
    id: 'form-8',
    uid: 'FORM-TRA-BTR-2024-001',
    name: 'Business Travel',
    description: 'Calculate scope 3 emissions from employee business travel',
    category: 'Scope 3 - Business Travel',
    tags: ['scope-3', 'business-travel', 'air-travel', 'employee'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-20T09:00:00Z',
    expressions: [
      {
        id: 'expr_distance_class',
        name: 'Distance and Class Method',
        expression: 'travel_distance * travel_ef',
        parameters: [
          {
            id: 'param_travel_distance',
            name: 'travel_distance',
            type: 'number',
            unit: 'km',
            required: true,
            description: 'Total business travel distance',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_travel_ef',
            name: 'travel_ef',
            type: 'number',
            unit: 'kg CO2e/km',
            required: true,
            description: 'Business Travel Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-BUSINESS-TRAVEL-2024-001'
          }
        ],
        sourceName: 'GHG Protocol Scope 3 Standard',
        sourceURL: 'https://ghgprotocol.org/standards/scope-3-standard',
        isActive: true
      }
    ]
  },

  // ============================================
  // FORMULA 9: Employee Commuting
  // ============================================
  {
    id: 'form-9',
    uid: 'FORM-COM-EMP-2024-001',
    name: 'Employee Commuting',
    description: 'Calculate scope 3 emissions from employee commuting',
    category: 'Scope 3 - Employee Commuting',
    tags: ['scope-3', 'commuting', 'employee', 'transportation'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-20T09:00:00Z',
    expressions: [
      {
        id: 'expr_employee_distance',
        name: 'Employee Distance Method',
        expression: 'num_employees * avg_distance * work_days * commute_ef',
        parameters: [
          {
            id: 'param_num_employees',
            name: 'num_employees',
            type: 'number',
            unit: 'employees',
            required: true,
            description: 'Number of employees',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_avg_distance',
            name: 'avg_distance',
            type: 'number',
            unit: 'km/day',
            required: true,
            description: 'Average commute distance per day',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_work_days',
            name: 'work_days',
            type: 'number',
            unit: 'days',
            required: true,
            description: 'Number of work days per year',
            minValue: 0,
            parameterType: 'variable'
          },
          {
            id: 'param_commute_ef',
            name: 'commute_ef',
            type: 'number',
            unit: 'kg CO2e/km',
            required: true,
            description: 'Commuting Emission Factor',
            parameterType: 'ef_value',
            efUID: 'EF-COMMUTING-2024-001'
          }
        ],
        sourceName: 'GHG Protocol Scope 3 Standard',
        sourceURL: 'https://ghgprotocol.org/standards/scope-3-standard',
        isActive: true
      }
    ]
  }
];

/**
 * Helper function to get a formula by UID
 */
export function getFormulaByUID(uid: string): FormulaDefinition | undefined {
  return masterFormulas.find(f => f.uid === uid);
}

/**
 * Helper function to get an expression from a formula
 */
export function getExpression(formulaUID: string, expressionId: string): FormulaExpression | undefined {
  const formula = getFormulaByUID(formulaUID);
  return formula?.expressions.find(e => e.id === expressionId);
}

/**
 * Helper function to get variable parameters from an expression
 */
export function getVariableParameters(formulaUID: string, expressionId: string): FormulaParameter[] {
  const expression = getExpression(formulaUID, expressionId);
  return expression?.parameters.filter(p => p.parameterType === 'variable') || [];
}

/**
 * Helper function to get EF parameters from an expression
 */
export function getEFParameters(formulaUID: string, expressionId: string): FormulaParameter[] {
  const expression = getExpression(formulaUID, expressionId);
  return expression?.parameters.filter(p => p.parameterType === 'ef_value') || [];
}