// Temporary file to hold the updated GRI data structures

const griGroups = [
  { id: 'GRI-305-1', name: 'GRI 305-1 Direct GHG emissions (Scope 1)' },
  { id: 'GRI-305-2', name: 'GRI 305-2 Indirect GHG emissions (Scope 2)' },
  { id: 'GRI-305-3', name: 'GRI 305-3 Indirect GHG emissions (Scope 3)' },
  { id: 'GRI-302-1', name: 'GRI 302-1 Energy Consumption within the organization' },
  { id: 'GRI-303-3-ALL', name: 'GRI 303-3 (a) (b) (c): Withdrawal from all areas' },
  { id: 'GRI-303-3-STRESS', name: 'GRI 303-3 (a) (b) (c): Withdrawal from all areas with water stress' },
  { id: 'GRI-303-4-ALL', name: 'GRI 303-4 (a) (b) (c): Discharge to all areas' },
  { id: 'GRI-303-4-STRESS', name: 'GRI 303-4 (a) (b) (c): Discharge to all areas with water stress' },
  { id: 'GRI-303-5', name: 'GRI 303-5 Water consumption' },
  { id: 'GRI-306-4', name: 'GRI 306-4 Waste diverted from disposal' },
  { id: 'GRI-306-5', name: 'GRI 306-5 Waste directed to disposal' }
];

const griCategories = [
  // GRI 305-1 Direct GHG emissions (Scope 1)
  { code: '305.1.1', label: 'Table-1 : Stationary Combustion', group: 'GRI-305-1' },
  { code: '305.1.2', label: 'Table-2 : Mobile Combustion', group: 'GRI-305-1' },
  { code: '305.1.3', label: 'Table-3 : Fugitive Emissions - Refrigerent', group: 'GRI-305-1' },
  { code: '305.2.4', label: 'Table-4 : Fugitive Emissions - Fire Suppressant', group: 'GRI-305-1' },
  { code: '305.1.5', label: 'Table-5 : Fugitive Emissions - Electrical Insulating Gas', group: 'GRI-305-1' },
  { code: '305.2.6', label: 'Table-6 : Fugitive Emissions - Anesthetic Gas', group: 'GRI-305-1' },
  { code: '305.1.7', label: 'Table-7 : Fugitive Emissions - Waste Water Treatment', group: 'GRI-305-1' },
  
  // GRI 305-2 Indirect GHG emissions (Scope 2)
  { code: '305.2.8', label: 'Table 8. Electricity purchased: Location-based', group: 'GRI-305-2' },
  { code: '305.2.9', label: 'Table 9. Electricity purchased: Market-based', group: 'GRI-305-2' },
  { code: '305.2.10', label: 'Table 10. Electricity sold', group: 'GRI-305-2' },
  
  // GRI 305-3 Indirect GHG emissions (Scope 3)
  { code: '305.3.1', label: 'Cat. 1: Purchased goods and services', group: 'GRI-305-3' },
  { code: '305.3.2', label: 'Cat. 2: Capital goods', group: 'GRI-305-3' },
  { code: '305.3.3', label: 'Cat. 3: Fuel- and energy-related', group: 'GRI-305-3' },
  { code: '305.3.4', label: 'Cat. 4: Upstream Transportation and Distribution', group: 'GRI-305-3' },
  { code: '305.3.5', label: 'Cat. 5: Waste generated in operations', group: 'GRI-305-3' },
  { code: '305.3.6', label: 'Cat. 6: Business Travel', group: 'GRI-305-3' },
  { code: '305.3.7', label: 'Cat. 7: Employee Commuting', group: 'GRI-305-3' },
  { code: '305.3.8', label: 'Cat 8: Upstream Leased Assets', group: 'GRI-305-3' },
  { code: '305.3.9', label: 'Cat. 9: Downstream Transportation and Distribution', group: 'GRI-305-3' },
  { code: '305.3.10', label: 'Cat 10: Processing of sold products', group: 'GRI-305-3' },
  { code: '305.3.11', label: 'Cat. 11: Use of Sold Products', group: 'GRI-305-3' },
  { code: '305.3.12', label: 'Cat. 12: End-of-life treatment of sold products', group: 'GRI-305-3' },
  { code: '305.3.13', label: 'Cat. 13: Downstream Leased Assets', group: 'GRI-305-3' },
  { code: '305.3.14', label: 'Cat 14: Franchises', group: 'GRI-305-3' },
  { code: '305.3.15', label: 'Cat 15: Investments', group: 'GRI-305-3' },
  
  // GRI 302-1 Energy Consumption within the organization
  { code: '302.1.1', label: 'Table-1 : Non-renewable fuel consumed : Stationary Combustion', group: 'GRI-302-1' },
  { code: '302.1.2', label: 'Table-2 : Non-renewable fuel consumed : Mobile Combustion', group: 'GRI-302-1' },
  { code: '302.1.3', label: 'Table-3 : Renewable fuel consumed : Biofuels/biomass combustion', group: 'GRI-302-1' },
  { code: '302.1.4', label: 'Table-4 : Electricity Purchased', group: 'GRI-302-1' },
  { code: '302.1.5', label: 'Table-5 : Self Generated Electricity', group: 'GRI-302-1' },
  { code: '302.1.6', label: 'Table-6 : Electricity sold', group: 'GRI-302-1' },
  { code: '302.1.7', label: 'Table-7 : Heating, Cooling and steam purchased', group: 'GRI-302-1' },
  { code: '302.1.8', label: 'Table-8 : Self generated heating, Cooling and steam purchased', group: 'GRI-302-1' },
  { code: '302.1.9', label: 'Table-9 : Heating, Cooling and steam sold', group: 'GRI-302-1' },
  
  // GRI 303-3 Withdrawal from all areas
  { code: '303.3.1', label: 'Table-1 : Water withdrawal with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', group: 'GRI-303-3-ALL' },
  { code: '303.3.2', label: 'Table-2 : Water withdrawal with a breakdown by sources - Other Water : TDS> 1000mg/l', group: 'GRI-303-3-ALL' },
  
  // GRI 303-3 Withdrawal from all areas with water stress
  { code: '303.3.3', label: 'Table-3 : Water withdrawal with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', group: 'GRI-303-3-STRESS' },
  { code: '303.3.4', label: 'Table-4 : Water withdrawal with a breakdown by sources - Other Water : TDS> 1000mg/l', group: 'GRI-303-3-STRESS' },
  
  // GRI 303-4 Discharge to all areas
  { code: '303.4.5', label: 'Table-5 : Water discharge with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', group: 'GRI-303-4-ALL' },
  { code: '303.4.6', label: 'Table-6 : Water discharge with a breakdown by sources - Other Water : TDS> 1000mg/l', group: 'GRI-303-4-ALL' },
  
  // GRI 303-4 Discharge to all areas with water stress
  { code: '303.4.7', label: 'Table-7 : Water discharge with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', group: 'GRI-303-4-STRESS' },
  { code: '303.4.8', label: 'Table-8 : Water discharge with a breakdown by sources - Other Water : TDS> 1000mg/l', group: 'GRI-303-4-STRESS' },
  
  // GRI 303-5 Water consumption
  { code: '303.5.1', label: 'All areas', group: 'GRI-303-5' },
  { code: '303.5.2', label: 'All areas with water stress', group: 'GRI-303-5' },
  
  // GRI 306-4 Waste diverted from disposal
  { code: '306.4.1', label: 'Table-1 : Preperation for reuse', group: 'GRI-306-4' },
  { code: '306.4.2', label: 'Table-2 : Recycling', group: 'GRI-306-4' },
  { code: '306.4.3', label: 'Table-3 : Other recovery operations', group: 'GRI-306-4' },
  { code: '306.4.4', label: 'Table-4 : Preperation for reuse', group: 'GRI-306-4' },
  { code: '306.4.5', label: 'Table-5 : Recycling', group: 'GRI-306-4' },
  { code: '306.4.6', label: 'Table-6 : Other recovery operations', group: 'GRI-306-4' },
  { code: '306.4.7', label: 'Table-7 : Preperation for reuse', group: 'GRI-306-4' },
  { code: '306.4.8', label: 'Table-8 : Recycling', group: 'GRI-306-4' },
  { code: '306.4.9', label: 'Table-9 : Other recovery operations', group: 'GRI-306-4' },
  { code: '306.4.10', label: 'Table-10 : Preperation for reuse', group: 'GRI-306-4' },
  { code: '306.4.11', label: 'Table-11 : Recycling', group: 'GRI-306-4' },
  { code: '306.4.12', label: 'Table-12 : Other recovery operations', group: 'GRI-306-4' },
  
  // GRI 306-5 Waste directed to disposal
  { code: '306.5.13', label: 'Table-13 : Incineration with energy recovery', group: 'GRI-306-5' },
  { code: '306.5.14', label: 'Table-14 : Incineration without energy recovery', group: 'GRI-306-5' },
  { code: '306.5.15', label: 'Table-15 : Landfilling', group: 'GRI-306-5' },
  { code: '306.5.16', label: 'Table-16 : Other disposal operations', group: 'GRI-306-5' },
  { code: '306.5.17', label: 'Table-17 : Incineration with energy recovery', group: 'GRI-306-5' },
  { code: '306.5.18', label: 'Table-18 : Incineration without energy recovery', group: 'GRI-306-5' },
  { code: '306.5.19', label: 'Table-19 : Landfilling', group: 'GRI-306-5' },
  { code: '306.5.20', label: 'Table-20 : Other disposal operations', group: 'GRI-306-5' },
  { code: '306.5.21', label: 'Table-21 : Incineration with energy recovery', group: 'GRI-306-5' },
  { code: '306.5.22', label: 'Table-22 : Incineration without energy recovery', group: 'GRI-306-5' },
  { code: '306.5.23', label: 'Table-23 : Landfilling', group: 'GRI-306-5' },
  { code: '306.5.24', label: 'Table-24 : Other disposal operations', group: 'GRI-306-5' },
  { code: '306.5.25', label: 'Table-25 : Incineration with energy recovery', group: 'GRI-306-5' },
  { code: '306.5.26', label: 'Table-26 : Incineration without energy recovery', group: 'GRI-306-5' },
  { code: '306.5.27', label: 'Table-27 : Landfilling', group: 'GRI-306-5' },
  { code: '306.5.28', label: 'Table-28 : Other disposal operations', group: 'GRI-306-5' }
];
