// GRI Hierarchical Structure for Activity Template Selection

export interface GRICategory {
  code: string;
  name: string;
  description: string;
  activityIds: string[];
}

export interface GRIGroup {
  code: string;
  name: string;
  description: string;
  scope: '1' | '2' | '3';
  categories: GRICategory[];
}

export const griStructure: GRIGroup[] = [
  {
    code: 'GRI-305-1',
    name: 'GRI 305-1 Direct GHG emissions (Scope 1)',
    description: 'Direct greenhouse gas emissions from sources owned or controlled by the organization',
    scope: '1',
    categories: [
      { code: '305.1.1', name: 'Table-1 : Stationary Combustion', description: 'Emissions from fuel combustion in stationary equipment', activityIds: ['master-3', 'master-5', 'client-1'] },
      { code: '305.1.2', name: 'Table-2 : Mobile Combustion', description: 'Emissions from fuel combustion in mobile sources', activityIds: ['master-1', 'master-6'] },
      { code: '305.1.3', name: 'Table-3 : Fugitive Emissions - Refrigerent', description: 'Refrigerant emissions from cooling systems', activityIds: [] },
      { code: '305.2.4', name: 'Table-4 : Fugitive Emissions - Fire Suppressant', description: 'Fire suppressant system emissions', activityIds: [] },
      { code: '305.1.5', name: 'Table-5 : Fugitive Emissions - Electrical Insulating Gas', description: 'Emissions from electrical equipment', activityIds: [] },
      { code: '305.2.6', name: 'Table-6 : Fugitive Emissions - Anesthetic Gas', description: 'Medical anesthetic gas emissions', activityIds: [] },
      { code: '305.1.7', name: 'Table-7 : Fugitive Emissions - Waste Water Treatment', description: 'Emissions from wastewater treatment processes', activityIds: [] }
    ]
  },
  {
    code: 'GRI-305-2',
    name: 'GRI 305-2 Indirect GHG emissions (Scope 2)',
    description: 'Emissions from the generation of purchased electricity, heat, or steam',
    scope: '2',
    categories: [
      { code: '305.2.8', name: 'Table 8. Electricity purchased: Location-based', description: 'Location-based electricity emissions', activityIds: ['master-2'] },
      { code: '305.2.9', name: 'Table 9. Electricity purchased: Market-based', description: 'Market-based electricity emissions and purchased heat/steam', activityIds: ['master-2', 'master-7'] },
      { code: '305.2.10', name: 'Table 10. Electricity sold', description: 'Electricity sold to grid', activityIds: [] }
    ]
  },
  {
    code: 'GRI-305-3',
    name: 'GRI 305-3 Indirect GHG emissions (Scope 3)',
    description: 'All other indirect emissions that occur in the value chain',
    scope: '3',
    categories: [
      { code: '305.3.1', name: 'Cat. 1: Purchased goods and services', description: 'Emissions from purchased goods and services', activityIds: [] },
      { code: '305.3.2', name: 'Cat. 2: Capital goods', description: 'Emissions from capital goods', activityIds: [] },
      { code: '305.3.3', name: 'Cat. 3: Fuel- and energy-related', description: 'Fuel and energy-related emissions', activityIds: [] },
      { code: '305.3.4', name: 'Cat. 4: Upstream Transportation and Distribution', description: 'Upstream transportation and distribution', activityIds: ['master-4', 'client-4'] },
      { code: '305.3.5', name: 'Cat. 5: Waste generated in operations', description: 'Waste disposal and treatment', activityIds: ['client-3'] },
      { code: '305.3.6', name: 'Cat. 6: Business Travel', description: 'Business travel by employees', activityIds: ['master-1', 'master-8', 'client-2'] },
      { code: '305.3.7', name: 'Cat. 7: Employee Commuting', description: 'Employee commuting', activityIds: [] },
      { code: '305.3.8', name: 'Cat 8: Upstream Leased Assets', description: 'Upstream leased assets', activityIds: [] },
      { code: '305.3.9', name: 'Cat. 9: Downstream Transportation and Distribution', description: 'Downstream transportation and distribution', activityIds: ['master-4'] },
      { code: '305.3.10', name: 'Cat 10: Processing of sold products', description: 'Processing of sold products', activityIds: [] },
      { code: '305.3.11', name: 'Cat. 11: Use of Sold Products', description: 'Use of sold products', activityIds: [] },
      { code: '305.3.12', name: 'Cat. 12: End-of-life treatment of sold products', description: 'End-of-life treatment', activityIds: [] },
      { code: '305.3.13', name: 'Cat. 13: Downstream Leased Assets', description: 'Downstream leased assets', activityIds: [] },
      { code: '305.3.14', name: 'Cat 14: Franchises', description: 'Franchise emissions', activityIds: [] },
      { code: '305.3.15', name: 'Cat 15: Investments', description: 'Investment emissions', activityIds: [] }
    ]
  },
  {
    code: 'GRI-302-1',
    name: 'GRI 302-1 Energy Consumption within the organization',
    description: 'Total energy consumption within the organization',
    scope: '1',
    categories: [
      { code: '302.1.1', name: 'Table-1 : Non-renewable fuel consumed : Stationary Combustion', description: 'Non-renewable stationary fuel', activityIds: ['master-3', 'master-5'] },
      { code: '302.1.2', name: 'Table-2 : Non-renewable fuel consumed : Mobile Combustion', description: 'Non-renewable mobile fuel', activityIds: ['master-1', 'master-6'] },
      { code: '302.1.3', name: 'Table-3 : Renewable fuel consumed : Biofuels/biomass combustion', description: 'Renewable biofuels', activityIds: [] },
      { code: '302.1.4', name: 'Table-4 : Electricity Purchased', description: 'Purchased electricity', activityIds: ['master-2'] },
      { code: '302.1.5', name: 'Table-5 : Self Generated Electricity', description: 'Self-generated electricity', activityIds: [] },
      { code: '302.1.6', name: 'Table-6 : Electricity sold', description: 'Electricity sold', activityIds: [] },
      { code: '302.1.7', name: 'Table-7 : Heating, Cooling and steam purchased', description: 'Purchased heating/cooling/steam', activityIds: ['master-7'] },
      { code: '302.1.8', name: 'Table-8 : Self generated heating, Cooling and steam purchased', description: 'Self-generated heating/cooling/steam', activityIds: [] },
      { code: '302.1.9', name: 'Table-9 : Heating, Cooling and steam sold', description: 'Heating/cooling/steam sold', activityIds: [] }
    ]
  },
  {
    code: 'GRI-303-3-ALL',
    name: 'GRI 303-3 (a) (b) (c): Withdrawal from all areas',
    description: 'Water withdrawal from all areas',
    scope: '1',
    categories: [
      { code: '303.3.1', name: 'Table-1 : Water withdrawal with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', description: 'Fresh water withdrawal', activityIds: [] },
      { code: '303.3.2', name: 'Table-2 : Water withdrawal with a breakdown by sources - Other Water : TDS> 1000mg/l', description: 'Other water withdrawal', activityIds: [] }
    ]
  },
  {
    code: 'GRI-303-3-STRESS',
    name: 'GRI 303-3 (a) (b) (c): Withdrawal from all areas with water stress',
    description: 'Water withdrawal from areas with water stress',
    scope: '1',
    categories: [
      { code: '303.3.3', name: 'Table-3 : Water withdrawal with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', description: 'Fresh water withdrawal (stressed areas)', activityIds: [] },
      { code: '303.3.4', name: 'Table-4 : Water withdrawal with a breakdown by sources - Other Water : TDS> 1000mg/l', description: 'Other water withdrawal (stressed areas)', activityIds: [] }
    ]
  },
  {
    code: 'GRI-303-4-ALL',
    name: 'GRI 303-4 (a) (b) (c): Discharge to all areas',
    description: 'Water discharge to all areas',
    scope: '1',
    categories: [
      { code: '303.4.5', name: 'Table-5 : Water discharge with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', description: 'Fresh water discharge', activityIds: [] },
      { code: '303.4.6', name: 'Table-6 : Water discharge with a breakdown by sources - Other Water : TDS> 1000mg/l', description: 'Other water discharge', activityIds: [] }
    ]
  },
  {
    code: 'GRI-303-4-STRESS',
    name: 'GRI 303-4 (a) (b) (c): Discharge to all areas with water stress',
    description: 'Water discharge to areas with water stress',
    scope: '1',
    categories: [
      { code: '303.4.7', name: 'Table-7 : Water discharge with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', description: 'Fresh water discharge (stressed areas)', activityIds: [] },
      { code: '303.4.8', name: 'Table-8 : Water discharge with a breakdown by sources - Other Water : TDS> 1000mg/l', description: 'Other water discharge (stressed areas)', activityIds: [] }
    ]
  },
  {
    code: 'GRI-303-5',
    name: 'GRI 303-5 Water consumption',
    description: 'Total water consumption',
    scope: '1',
    categories: [
      { code: '303.5.1', name: 'All areas', description: 'Water consumption in all areas', activityIds: [] },
      { code: '303.5.2', name: 'All areas with water stress', description: 'Water consumption in stressed areas', activityIds: [] }
    ]
  },
  {
    code: 'GRI-306-4',
    name: 'GRI 306-4 Waste diverted from disposal',
    description: 'Waste diverted from disposal through reuse, recycling, and recovery',
    scope: '3',
    categories: [
      { code: '306.4.1', name: 'Table-1 : Preperation for reuse', description: 'Waste prepared for reuse', activityIds: [] },
      { code: '306.4.2', name: 'Table-2 : Recycling', description: 'Waste recycled', activityIds: [] },
      { code: '306.4.3', name: 'Table-3 : Other recovery operations', description: 'Other recovery operations', activityIds: [] },
      { code: '306.4.4', name: 'Table-4 : Preperation for reuse', description: 'Preparation for reuse (offsite)', activityIds: [] },
      { code: '306.4.5', name: 'Table-5 : Recycling', description: 'Recycling (offsite)', activityIds: [] },
      { code: '306.4.6', name: 'Table-6 : Other recovery operations', description: 'Other recovery (offsite)', activityIds: [] },
      { code: '306.4.7', name: 'Table-7 : Preperation for reuse', description: 'Preparation for reuse (hazardous)', activityIds: [] },
      { code: '306.4.8', name: 'Table-8 : Recycling', description: 'Recycling (hazardous)', activityIds: [] },
      { code: '306.4.9', name: 'Table-9 : Other recovery operations', description: 'Other recovery (hazardous)', activityIds: [] },
      { code: '306.4.10', name: 'Table-10 : Preperation for reuse', description: 'Preparation for reuse (non-hazardous)', activityIds: [] },
      { code: '306.4.11', name: 'Table-11 : Recycling', description: 'Recycling (non-hazardous)', activityIds: [] },
      { code: '306.4.12', name: 'Table-12 : Other recovery operations', description: 'Other recovery (non-hazardous)', activityIds: [] }
    ]
  },
  {
    code: 'GRI-306-5',
    name: 'GRI 306-5 Waste directed to disposal',
    description: 'Waste directed to disposal operations',
    scope: '3',
    categories: [
      { code: '306.5.13', name: 'Table-13 : Incineration with energy recovery', description: 'Incineration with energy recovery', activityIds: ['client-3'] },
      { code: '306.5.14', name: 'Table-14 : Incineration without energy recovery', description: 'Incineration without energy recovery', activityIds: [] },
      { code: '306.5.15', name: 'Table-15 : Landfilling', description: 'Waste to landfill', activityIds: ['client-3'] },
      { code: '306.5.16', name: 'Table-16 : Other disposal operations', description: 'Other disposal operations', activityIds: [] },
      { code: '306.5.17', name: 'Table-17 : Incineration with energy recovery', description: 'Incineration with energy recovery (offsite)', activityIds: [] },
      { code: '306.5.18', name: 'Table-18 : Incineration without energy recovery', description: 'Incineration without energy recovery (offsite)', activityIds: [] },
      { code: '306.5.19', name: 'Table-19 : Landfilling', description: 'Landfilling (offsite)', activityIds: [] },
      { code: '306.5.20', name: 'Table-20 : Other disposal operations', description: 'Other disposal (offsite)', activityIds: [] },
      { code: '306.5.21', name: 'Table-21 : Incineration with energy recovery', description: 'Incineration with energy recovery (hazardous)', activityIds: [] },
      { code: '306.5.22', name: 'Table-22 : Incineration without energy recovery', description: 'Incineration without energy recovery (hazardous)', activityIds: [] },
      { code: '306.5.23', name: 'Table-23 : Landfilling', description: 'Landfilling (hazardous)', activityIds: [] },
      { code: '306.5.24', name: 'Table-24 : Other disposal operations', description: 'Other disposal (hazardous)', activityIds: [] },
      { code: '306.5.25', name: 'Table-25 : Incineration with energy recovery', description: 'Incineration with energy recovery (non-hazardous)', activityIds: [] },
      { code: '306.5.26', name: 'Table-26 : Incineration without energy recovery', description: 'Incineration without energy recovery (non-hazardous)', activityIds: [] },
      { code: '306.5.27', name: 'Table-27 : Landfilling', description: 'Landfilling (non-hazardous)', activityIds: [] },
      { code: '306.5.28', name: 'Table-28 : Other disposal operations', description: 'Other disposal (non-hazardous)', activityIds: [] }
    ]
  }
];
