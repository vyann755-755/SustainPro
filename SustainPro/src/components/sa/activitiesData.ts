/**
 * Centralized Activities Data - Single Source of Truth
 * 
 * END-TO-END DATA FLOW:
 * =====================
 * 1. PLATFORM ADMIN creates:
 *    - Master DB - Emission Factors (with core data rows)
 *    - Master DB - Formulas (with parameters and expressions)
 * 
 * 2. SUSTAINABILITY ARCHITECT:
 *    - Inherits Master DB EFs and Formulas (tagged as 'master')
 *    - Can create own Client EFs and Formulas (tagged as 'client')
 *    - Creates Activities by:
 *      a) Selecting a formula from Master DB or Client DB
 *      b) Selecting an expression from that formula
 *      c) Mapping EF parameters to specific EFs from the EF list
 *    - Assigns activities to Business Units
 *    - Assigns customer users to Business Units
 *    - Creates BCA Projects and assigns Business Units
 * 
 * 3. CUSTOMER USER:
 *    - Sees assigned Business Units and Projects
 *    - Fills in VARIABLE parameter values for activities
 *    - EF parameters are already mapped by SA
 * 
 * This file contains activities that reference ACTUAL formulas and EFs from Master DB
 */

export interface EFParameterMapping {
  parameterId: string;
  parameterName: string;
  unit: string;
  efUID: string | null;
  efName: string | null;
}

export interface ActivityDefinition {
  id: string;
  uid: string;
  name: string;
  impactCategories: string[];
  grpCategories: string[];
  formulaUID: string | null;
  formulaName: string | null;
  expressionId: string | null;
  expressionName: string | null;
  efParameterMappings: EFParameterMapping[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  status: 'active' | 'draft' | 'archived';
  source: 'master' | 'client';
}

/**
 * All available activities that can be assigned to Business Units
 * These reference actual formulas and EFs from Platform Admin's Master DB
 */
export const allActivities: ActivityDefinition[] = [
  // ============================================
  // GRI SCOPE 1 ACTIVITIES (Direct Emissions)
  // ============================================
  {
    id: 'act-1',
    uid: 'ACT-2024-0001',
    name: 'Table-1: Stationary Combustion',
    impactCategories: ['Climate Change - total (GWP)'],
    grpCategories: ['305.1.1'],
    // References Master DB Formula: FORM-FUE-NAT-2024-003
    formulaUID: 'FORM-FUE-NAT-2024-003',
    formulaName: 'Natural Gas Combustion',
    // Uses expression: expr_gross_emissions
    expressionId: 'expr_gross_emissions',
    expressionName: 'Gross Emissions',
    // Maps EF parameter to Master DB EF: EF-FUE-GLB-2024-001
    efParameterMappings: [
      {
        parameterId: 'param_gas_ef',
        parameterName: 'Natural Gas Emission Factor',
        unit: 'kg CO2e/m³',
        efUID: 'EF-FUE-GLB-2024-001',
        efName: 'Natural Gas Combustion'
      }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin',
    status: 'active',
    source: 'master'
  },
  {
    id: 'act-2',
    uid: 'ACT-2024-0002',
    name: 'Table-2: Mobile Combustion',
    impactCategories: ['Climate Change - total (GWP)'],
    grpCategories: ['305.1.2'],
    // References Master DB Formula: FORM-TRA-VEH-2024-002
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    // Uses expression: expr_distance_emissions
    expressionId: 'expr_distance_emissions',
    expressionName: 'Distance-Based Emissions',
    // Maps EF parameter to Master DB EF: EF-TRA-2024-0007
    efParameterMappings: [
      {
        parameterId: 'param_vehicle_ef',
        parameterName: 'Vehicle Emission Factor',
        unit: 'kg CO2e/km',
        efUID: 'EF-TRA-2024-0007',
        efName: 'Light Duty Vehicle - Gasoline'
      }
    ],
    createdAt: '2024-01-15T11:00:00Z',
    createdBy: 'admin',
    status: 'active',
    source: 'master'
  },
  {
    id: 'act-3',
    uid: 'ACT-2024-0003',
    name: 'Table-3: Fugitive Emissions - Refrigerant',
    impactCategories: ['Climate Change - total (GWP)'],
    grpCategories: ['305.1.3'],
    // References Master DB Formula: FORM-FUE-NAT-2024-003 (reusing for fugitive emissions)
    formulaUID: 'FORM-FUE-NAT-2024-003',
    formulaName: 'Natural Gas Combustion',
    // Uses expression: expr_net_emissions
    expressionId: 'expr_net_emissions',
    expressionName: 'Net Emissions',
    // Maps EF parameter to Master DB EF: EF-FUE-GLB-2024-001
    efParameterMappings: [
      {
        parameterId: 'param_gas_ef',
        parameterName: 'Natural Gas Emission Factor',
        unit: 'kg CO2e/m³',
        efUID: 'EF-FUE-GLB-2024-001',
        efName: 'Natural Gas Combustion'
      }
    ],
    createdAt: '2024-01-15T12:00:00Z',
    createdBy: 'admin',
    status: 'active',
    source: 'master'
  },
  
  // ============================================
  // GRI SCOPE 2 ACTIVITIES (Indirect - Energy)
  // ============================================
  {
    id: 'act-8',
    uid: 'ACT-2024-0008',
    name: 'Table 8. Electricity purchased: Location-based',
    impactCategories: ['Climate Change - total (GWP)'],
    grpCategories: ['305.2.8'],
    // References Master DB Formula: FORM-ENE-ELEC-2024-001
    formulaUID: 'FORM-ENE-ELEC-2024-001',
    formulaName: 'Electricity Consumption Emissions',
    // Uses expression: expr_total_emissions
    expressionId: 'expr_total_emissions',
    expressionName: 'Total CO2 Emissions',
    // Maps EF parameter to Master DB EF: EF-ENE-2024-0001
    efParameterMappings: [
      {
        parameterId: 'param_grid_ef',
        parameterName: 'Grid Emission Factor',
        unit: 'kg CO2e/kWh',
        efUID: 'EF-ENE-2024-0001',
        efName: 'National Grid Electricity Mix - United States'
      }
    ],
    createdAt: '2024-01-16T09:00:00Z',
    createdBy: 'admin',
    status: 'active',
    source: 'master'
  },
  {
    id: 'act-9',
    uid: 'ACT-2024-0009',
    name: 'Table 9. Electricity purchased: Market-based',
    impactCategories: ['Climate Change - total (GWP)'],
    grpCategories: ['305.2.9'],
    // References Master DB Formula: FORM-ENE-ELEC-2024-001
    formulaUID: 'FORM-ENE-ELEC-2024-001',
    formulaName: 'Electricity Consumption Emissions',
    // Uses expression: expr_total_emissions
    expressionId: 'expr_total_emissions',
    expressionName: 'Total CO2 Emissions',
    // Maps EF parameter to Master DB EF: EF-ENE-2024-0002 (Renewable)
    efParameterMappings: [
      {
        parameterId: 'param_grid_ef',
        parameterName: 'Market-Based Emission Factor',
        unit: 'kg CO2e/kWh',
        efUID: 'EF-ENE-2024-0002',
        efName: 'Renewable Energy Certificates - Wind Power'
      }
    ],
    createdAt: '2024-01-16T09:30:00Z',
    createdBy: 'admin',
    status: 'active',
    source: 'master'
  },
  
  // ============================================
  // GRI SCOPE 3 ACTIVITIES (Indirect - Value Chain)
  // ============================================
  {
    id: 'act-31',
    uid: 'ACT-2024-0031',
    name: 'Cat. 1: Purchased goods and services',
    impactCategories: ['Climate Change - total (GWP)'],
    grpCategories: ['305.3.1'],
    // References Master DB Formula: FORM-TRA-VEH-2024-002 (reusing for simplicity)
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    // Uses expression: expr_distance_emissions
    expressionId: 'expr_distance_emissions',
    expressionName: 'Distance-Based Emissions',
    // Maps EF parameter to Master DB EF: EF-TRA-2024-0007
    efParameterMappings: [
      {
        parameterId: 'param_vehicle_ef',
        parameterName: 'Transport Emission Factor',
        unit: 'kg CO2e/km',
        efUID: 'EF-TRA-2024-0007',
        efName: 'Light Duty Vehicle - Gasoline'
      }
    ],
    createdAt: '2024-01-17T10:00:00Z',
    createdBy: 'admin',
    status: 'active',
    source: 'master'
  },
  {
    id: 'act-32',
    uid: 'ACT-2024-0032',
    name: 'Cat. 2: Capital goods',
    impactCategories: ['Climate Change - total (GWP)'],
    grpCategories: ['305.3.2'],
    // References Master DB Formula: FORM-FUE-NAT-2024-003
    formulaUID: 'FORM-FUE-NAT-2024-003',
    formulaName: 'Natural Gas Combustion',
    // Uses expression: expr_gross_emissions
    expressionId: 'expr_gross_emissions',
    expressionName: 'Gross Emissions',
    // Maps EF parameter to Master DB EF: EF-FUE-GLB-2024-001
    efParameterMappings: [
      {
        parameterId: 'param_gas_ef',
        parameterName: 'Natural Gas Emission Factor',
        unit: 'kg CO2e/m³',
        efUID: 'EF-FUE-GLB-2024-001',
        efName: 'Natural Gas Combustion'
      }
    ],
    createdAt: '2024-01-17T11:00:00Z',
    createdBy: 'admin',
    status: 'active',
    source: 'master'
  },
  {
    id: 'act-34',
    uid: 'ACT-2024-0034',
    name: 'Cat. 4: Upstream transportation',
    impactCategories: ['Climate Change - total (GWP)'],
    grpCategories: ['305.3.4'],
    // References Master DB Formula: FORM-TRA-VEH-2024-002
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    // Uses expression: expr_fuel_emissions
    expressionId: 'expr_fuel_emissions',
    expressionName: 'Fuel-Based Emissions',
    // Maps EF parameter to Master DB EF: EF-ENE-2024-0003 (Diesel Truck)
    efParameterMappings: [
      {
        parameterId: 'param_fuel_ef',
        parameterName: 'Diesel Fuel Emission Factor',
        unit: 'kg CO2e/L',
        efUID: 'EF-ENE-2024-0003',
        efName: 'Heavy-Duty Diesel Truck Transportation'
      }
    ],
    createdAt: '2024-01-17T13:00:00Z',
    createdBy: 'admin',
    status: 'active',
    source: 'master'
  },
  {
    id: 'act-36',
    uid: 'ACT-2024-0036',
    name: 'Cat. 6: Business travel',
    impactCategories: ['Climate Change - total (GWP)'],
    grpCategories: ['305.3.6'],
    // References Master DB Formula: FORM-TRA-VEH-2024-002
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    // Uses expression: expr_distance_emissions
    expressionId: 'expr_distance_emissions',
    expressionName: 'Distance-Based Emissions',
    // Maps EF parameter to Master DB EF: EF-TRA-2024-0007
    efParameterMappings: [
      {
        parameterId: 'param_vehicle_ef',
        parameterName: 'Air Travel Emission Factor',
        unit: 'kg CO2e/km',
        efUID: 'EF-TRA-2024-0007',
        efName: 'Light Duty Vehicle - Gasoline'
      }
    ],
    createdAt: '2024-01-17T15:00:00Z',
    createdBy: 'admin',
    status: 'active',
    source: 'master'
  },
  {
    id: 'act-37',
    uid: 'ACT-2024-0037',
    name: 'Cat. 7: Employee commuting',
    impactCategories: ['Climate Change - total (GWP)'],
    grpCategories: ['305.3.7'],
    // References Master DB Formula: FORM-TRA-VEH-2024-002
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    // Uses expression: expr_distance_emissions
    expressionId: 'expr_distance_emissions',
    expressionName: 'Distance-Based Emissions',
    // Maps EF parameter to Master DB EF: EF-TRA-2024-0007
    efParameterMappings: [
      {
        parameterId: 'param_vehicle_ef',
        parameterName: 'Commute Emission Factor',
        unit: 'kg CO2e/km',
        efUID: 'EF-TRA-2024-0007',
        efName: 'Light Duty Vehicle - Gasoline'
      }
    ],
    createdAt: '2024-01-17T16:00:00Z',
    createdBy: 'admin',
    status: 'active',
    source: 'master'
  },
  
  // ============================================
  // CLIENT-CREATED ACTIVITIES
  // ============================================
  {
    id: 'act-client-1',
    uid: 'ACT-CLIENT-0001',
    name: 'Custom Manufacturing Process',
    impactCategories: ['Climate Change - total (GWP)', 'Water (WATER)'],
    grpCategories: ['305.1.1', '305.3.1'],
    // References Client DB Formula: FORM-CDB-ENE-2025-001
    formulaUID: 'FORM-CDB-ENE-2025-001',
    formulaName: 'Renewable Energy Mix Calculator',
    // Uses client expression: client-expr-2
    expressionId: 'client-expr-2',
    expressionName: 'Net Grid Emissions',
    // No EF mappings for this custom formula (uses hardcoded factor)
    efParameterMappings: [],
    createdAt: '2024-02-05T09:15:00Z',
    createdBy: 'sa_user',
    status: 'active',
    source: 'client'
  }
];