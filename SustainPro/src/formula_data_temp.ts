// This file can be deleted - data has been moved to MasterDBContext

interface FormulaParameter {
  id: string;
  parentFormulaUID: string;
  name: string;
  type: 'number' | 'text' | 'boolean';
  unit?: string;
  defaultValue?: number | string;
  description?: string;
  required: boolean;
  minValue?: number;
  maxValue?: number;
  parameterType: FormulaParameterType;
  efSource?: 'master_db' | 'client_db';
  efCategory?: string;
  efUID?: string;
  efDefinition?: string;
  constantValue?: string;
  constantDescription?: string;
  versions: any[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface FormulaExpression {
  id: string;
  parentFormulaUID: string;
  name: string;
  description?: string;
  expression: string;
  outputUnit: string;
  versions: any[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface FormulaDefinition {
  id: string;
  uid: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  parameters: FormulaParameter[];
  expressions: FormulaExpression[];
  status: 'draft' | 'active' | 'deprecated';
  latestVersion: string;
  customFieldValues: Record<string, string>;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Sample Formula Data
export const mockMasterFormulaDefinitions: FormulaDefinition[] = [
  {
    id: '1',
    uid: 'FORM-ENE-GEN-2024-001',
    name: 'Electricity Consumption Emissions',
    category: 'Energy',
    description: 'Calculates CO2 emissions from electricity consumption using grid emission factors',
    tags: ['electricity', 'scope-2', 'energy'],
    status: 'active',
    latestVersion: '1.0',
    customFieldValues: {},
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin',
    parameters: [
      {
        id: 'param1',
        parentFormulaUID: 'FORM-ENE-GEN-2024-001',
        name: 'electricity_consumption',
        type: 'number',
        unit: 'kWh',
        description: 'Total electricity consumed in kilowatt-hours',
        required: true,
        minValue: 0,
        parameterType: 'formula_parameter',
        versions: [],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param2',
        parentFormulaUID: 'FORM-ENE-GEN-2024-001',
        name: 'grid_emission_factor',
        type: 'number',
        unit: 'kg CO2e/kWh',
        description: 'Grid emission factor for the location',
        required: true,
        parameterType: 'ef_value',
        efSource: 'master_db',
        efCategory: 'Energy',
        efUID: 'EF-ENE-USA-2024-001',
        efDefinition: 'US national average electricity grid emission factor',
        defaultValue: 0.4922,
        versions: [],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'expr1',
        parentFormulaUID: 'FORM-ENE-GEN-2024-001',
        name: 'Total CO2 Emissions',
        description: 'Calculates total CO2 emissions from electricity consumption',
        expression: 'electricity_consumption * grid_emission_factor',
        outputUnit: 'kg CO2e',
        versions: [],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '2',
    uid: 'FORM-TRA-VEH-2024-002',
    name: 'Vehicle Fleet Emissions',
    category: 'Transport',
    description: 'Calculates emissions from vehicle fleet based on distance traveled and fuel consumption',
    tags: ['transport', 'vehicles', 'scope-1', 'fleet'],
    status: 'active',
    latestVersion: '1.0',
    customFieldValues: {},
    createdAt: '2024-01-18T14:30:00Z',
    createdBy: 'admin',
    parameters: [
      {
        id: 'param3',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'distance_traveled',
        type: 'number',
        unit: 'km',
        description: 'Total distance traveled by the vehicle fleet',
        required: true,
        minValue: 0,
        parameterType: 'formula_parameter',
        versions: [],
        createdAt: '2024-01-18T14:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param4',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'fuel_consumption_rate',
        type: 'number',
        unit: 'L/100km',
        description: 'Average fuel consumption rate of the fleet',
        required: true,
        minValue: 0,
        parameterType: 'formula_parameter',
        defaultValue: 8.5,
        versions: [],
        createdAt: '2024-01-18T14:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param5',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'fuel_emission_factor',
        type: 'number',
        unit: 'kg CO2e/L',
        description: 'Diesel fuel combustion emission factor',
        required: true,
        parameterType: 'ef_value',
        efSource: 'master_db',
        efCategory: 'Fuel',
        efUID: 'EF-FUE-CAN-2024-006',
        efDefinition: 'Direct combustion of diesel fuel',
        defaultValue: 2.68,
        versions: [],
        createdAt: '2024-01-18T14:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param6',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'unit_conversion',
        type: 'number',
        unit: 'dimensionless',
        description: 'Conversion factor from L/100km to L/km',
        required: true,
        parameterType: 'constant',
        constantValue: '0.01',
        constantDescription: 'Mathematical constant: 1/100',
        versions: [],
        createdAt: '2024-01-18T14:30:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'expr2',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'Total Fuel Consumed',
        description: 'Calculates total fuel consumed by the fleet',
        expression: 'distance_traveled * fuel_consumption_rate * unit_conversion',
        outputUnit: 'L',
        versions: [],
        createdAt: '2024-01-18T14:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'expr3',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'Total Fleet Emissions',
        description: 'Calculates total CO2 emissions from vehicle fleet',
        expression: 'distance_traveled * fuel_consumption_rate * unit_conversion * fuel_emission_factor',
        outputUnit: 'kg CO2e',
        versions: [],
        createdAt: '2024-01-18T14:30:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '3',
    uid: 'FORM-FUE-NAT-2024-003',
    name: 'Natural Gas Combustion',
    category: 'Fuel',
    description: 'Calculates CO2 emissions from natural gas combustion for heating and industrial processes',
    tags: ['natural-gas', 'scope-1', 'heating', 'industrial'],
    status: 'active',
    latestVersion: '1.0',
    customFieldValues: {},
    createdAt: '2024-01-20T09:15:00Z',
    createdBy: 'admin',
    parameters: [
      {
        id: 'param7',
        parentFormulaUID: 'FORM-FUE-NAT-2024-003',
        name: 'gas_volume',
        type: 'number',
        unit: 'm³',
        description: 'Volume of natural gas consumed',
        required: true,
        minValue: 0,
        parameterType: 'formula_parameter',
        versions: [],
        createdAt: '2024-01-20T09:15:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param8',
        parentFormulaUID: 'FORM-FUE-NAT-2024-003',
        name: 'calorific_value',
        type: 'number',
        unit: 'MJ/m³',
        description: 'Higher heating value of natural gas',
        required: true,
        parameterType: 'constant',
        constantValue: '38.7',
        constantDescription: 'Standard calorific value for natural gas (IPCC)',
        versions: [],
        createdAt: '2024-01-20T09:15:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param9',
        parentFormulaUID: 'FORM-FUE-NAT-2024-003',
        name: 'emission_factor_mj',
        type: 'number',
        unit: 'kg CO2e/MJ',
        description: 'Natural gas emission factor per MJ',
        required: true,
        parameterType: 'constant',
        constantValue: '0.0551',
        constantDescription: 'IPCC 2006 Guidelines for natural gas',
        versions: [],
        createdAt: '2024-01-20T09:15:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'expr4',
        parentFormulaUID: 'FORM-FUE-NAT-2024-003',
        name: 'Energy Content',
        description: 'Calculates total energy content from gas volume',
        expression: 'gas_volume * calorific_value',
        outputUnit: 'MJ',
        versions: [],
        createdAt: '2024-01-20T09:15:00Z',
        createdBy: 'admin'
      },
      {
        id: 'expr5',
        parentFormulaUID: 'FORM-FUE-NAT-2024-003',
        name: 'CO2 Emissions',
        description: 'Calculates CO2 emissions from natural gas combustion',
        expression: 'gas_volume * calorific_value * emission_factor_mj',
        outputUnit: 'kg CO2e',
        versions: [],
        createdAt: '2024-01-20T09:15:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '4',
    uid: 'FORM-TRA-FRE-2024-004',
    name: 'Freight Transportation',
    category: 'Transport',
    description: 'Calculates emissions from freight transportation by road, rail, sea, or air',
    tags: ['freight', 'logistics', 'scope-3', 'transport'],
    status: 'active',
    latestVersion: '1.0',
    customFieldValues: {},
    createdAt: '2024-01-25T16:20:00Z',
    createdBy: 'admin',
    parameters: [
      {
        id: 'param10',
        parentFormulaUID: 'FORM-TRA-FRE-2024-004',
        name: 'cargo_mass',
        type: 'number',
        unit: 'tonnes',
        description: 'Mass of cargo transported',
        required: true,
        minValue: 0,
        parameterType: 'formula_parameter',
        versions: [],
        createdAt: '2024-01-25T16:20:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param11',
        parentFormulaUID: 'FORM-TRA-FRE-2024-004',
        name: 'transport_distance',
        type: 'number',
        unit: 'km',
        description: 'Distance over which cargo is transported',
        required: true,
        minValue: 0,
        parameterType: 'formula_parameter',
        versions: [],
        createdAt: '2024-01-25T16:20:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param12',
        parentFormulaUID: 'FORM-TRA-FRE-2024-004',
        name: 'transport_ef',
        type: 'number',
        unit: 'kg CO2e/tkm',
        description: 'Transportation emission factor per tonne-kilometer',
        required: true,
        parameterType: 'ef_value',
        efSource: 'master_db',
        efCategory: 'Transport',
        efUID: 'EF-TRA-UK-2024-005',
        efDefinition: 'Heavy goods vehicle transportation',
        defaultValue: 0.89,
        versions: [],
        createdAt: '2024-01-25T16:20:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'expr6',
        parentFormulaUID: 'FORM-TRA-FRE-2024-004',
        name: 'Total Transport Work',
        description: 'Calculates total transport work in tonne-kilometers',
        expression: 'cargo_mass * transport_distance',
        outputUnit: 'tkm',
        versions: [],
        createdAt: '2024-01-25T16:20:00Z',
        createdBy: 'admin'
      },
      {
        id: 'expr7',
        parentFormulaUID: 'FORM-TRA-FRE-2024-004',
        name: 'Transport Emissions',
        description: 'Calculates CO2 emissions from freight transportation',
        expression: 'cargo_mass * transport_distance * transport_ef',
        outputUnit: 'kg CO2e',
        versions: [],
        createdAt: '2024-01-25T16:20:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '5',
    uid: 'FORM-WAS-ORG-2024-005',
    name: 'Organic Waste Disposal',
    category: 'Waste',
    description: 'Calculates methane emissions from organic waste disposal in landfills',
    tags: ['waste', 'methane', 'scope-3', 'landfill'],
    status: 'active',
    latestVersion: '1.0',
    customFieldValues: {},
    createdAt: '2024-01-22T11:45:00Z',
    createdBy: 'admin',
    parameters: [
      {
        id: 'param13',
        parentFormulaUID: 'FORM-WAS-ORG-2024-005',
        name: 'waste_mass',
        type: 'number',
        unit: 'tonnes',
        description: 'Mass of organic waste disposed',
        required: true,
        minValue: 0,
        parameterType: 'formula_parameter',
        versions: [],
        createdAt: '2024-01-22T11:45:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param14',
        parentFormulaUID: 'FORM-WAS-ORG-2024-005',
        name: 'methane_potential',
        type: 'number',
        unit: 'm³ CH4/tonne',
        description: 'Methane generation potential of organic waste',
        required: true,
        parameterType: 'constant',
        constantValue: '100',
        constantDescription: 'Typical value for mixed organic waste (IPCC)',
        versions: [],
        createdAt: '2024-01-22T11:45:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param15',
        parentFormulaUID: 'FORM-WAS-ORG-2024-005',
        name: 'gwp_methane',
        type: 'number',
        unit: 'kg CO2e/kg CH4',
        description: 'Global warming potential of methane (100-year)',
        required: true,
        parameterType: 'constant',
        constantValue: '25',
        constantDescription: 'IPCC AR4 GWP-100 for methane',
        versions: [],
        createdAt: '2024-01-22T11:45:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'expr8',
        parentFormulaUID: 'FORM-WAS-ORG-2024-005',
        name: 'Methane Emissions',
        description: 'Calculates CO2 equivalent emissions from methane',
        expression: 'waste_mass * methane_potential * 0.717 * gwp_methane',
        outputUnit: 'kg CO2e',
        versions: [],
        createdAt: '2024-01-22T11:45:00Z',
        createdBy: 'admin'
      }
    ]
  }
];