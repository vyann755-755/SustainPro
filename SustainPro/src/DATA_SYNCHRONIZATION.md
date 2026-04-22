# End-to-End Data Synchronization Documentation

## Overview
This document describes the complete data flow from Platform Admin to Customer Users, ensuring all sample data is synchronized across roles.

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PLATFORM ADMIN ROLE                              │
│                                                                            │
│  1. Creates Master DB - Emission Factors (EFs)                           │
│     Location: /contexts/MasterDBContext.tsx                              │
│     Examples:                                                             │
│     - EF-ENE-2024-0001: National Grid Electricity Mix - United States    │
│     - EF-ENE-2024-0002: Renewable Energy Certificates - Wind Power       │
│     - EF-ENE-2024-0003: Heavy-Duty Diesel Truck Transportation           │
│     - EF-TRA-2024-0007: Light Duty Vehicle - Gasoline                    │
│     - EF-FUE-GLB-2024-001: Natural Gas Combustion                        │
│                                                                            │
│  2. Creates Master DB - Formulas (with parameters & expressions)         │
│     Location: /contexts/MasterDBContext.tsx                              │
│     Examples:                                                             │
│     - FORM-ENE-ELEC-2024-001: Electricity Consumption Emissions          │
│       • Expression: expr_total_emissions                                  │
│       • Parameters: param_elec_consumption (variable),                   │
│                     param_grid_ef (ef_value → EF-ENE-2024-0001)         │
│                                                                            │
│     - FORM-TRA-VEH-2024-002: Vehicle Fleet Emissions                     │
│       • Expression 1: expr_distance_emissions                             │
│       • Expression 2: expr_fuel_emissions                                 │
│       • Parameters: param_distance (variable),                           │
│                     param_vehicle_ef (ef_value → EF-TRA-2024-0007),     │
│                     param_fuel_volume (variable),                        │
│                     param_fuel_ef (variable)                             │
│                                                                            │
│     - FORM-FUE-NAT-2024-003: Natural Gas Combustion                      │
│       • Expression 1: expr_gross_emissions                                │
│       • Expression 2: expr_net_emissions                                  │
│       • Parameters: param_gas_volume (variable),                         │
│                     param_gas_ef (ef_value → EF-FUE-GLB-2024-001),      │
│                     param_efficiency (variable)                          │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ INHERITS
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     SUSTAINABILITY ARCHITECT ROLE                         │
│                                                                            │
│  1. Inherits Master DB EFs and Formulas (tagged as 'master')             │
│     Locations:                                                            │
│     - /components/sa/EmissionFactorsCDB.tsx                              │
│     - /components/sa/CDBFormulas.tsx                                     │
│                                                                            │
│  2. Can create Client-specific EFs and Formulas (tagged as 'client')     │
│     Example:                                                              │
│     - FORM-CDB-ENE-2025-001: Renewable Energy Mix Calculator            │
│                                                                            │
│  3. Creates Activities (single source of truth)                          │
│     Location: /components/sa/activitiesData.ts                           │
│     Process:                                                              │
│     a) Select a formula (from Master DB or Client DB)                    │
│     b) Select an expression from that formula                            │
│     c) Map EF parameters to specific EFs from the EF list               │
│                                                                            │
│     Examples of Activities:                                               │
│     ┌────────────────────────────────────────────────────────────────┐  │
│     │ ACT-2024-0001: Table-1: Stationary Combustion                  │  │
│     │   Formula: FORM-FUE-NAT-2024-003 (Natural Gas Combustion)      │  │
│     │   Expression: expr_gross_emissions                              │  │
│     │   EF Mapping: param_gas_ef → EF-FUE-GLB-2024-001              │  │
│     │   Variable Params: param_gas_volume (customer will fill)       │  │
│     └────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│     ┌────────────────────────────────────────────────────────────────┐  │
│     │ ACT-2024-0002: Table-2: Mobile Combustion                      │  │
│     │   Formula: FORM-TRA-VEH-2024-002 (Vehicle Fleet Emissions)     │  │
│     │   Expression: expr_distance_emissions                           │  │
│     │   EF Mapping: param_vehicle_ef → EF-TRA-2024-0007             │  │
│     │   Variable Params: param_distance (customer will fill)         │  │
│     └────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│     ┌────────────────────────────────────────────────────────────────┐  │
│     │ ACT-2024-0008: Table 8. Electricity purchased: Location-based  │  │
│     │   Formula: FORM-ENE-ELEC-2024-001 (Electricity Consumption)    │  │
│     │   Expression: expr_total_emissions                              │  │
│     │   EF Mapping: param_grid_ef → EF-ENE-2024-0001                │  │
│     │   Variable Params: param_elec_consumption (customer will fill) │  │
│     └────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  4. Assigns Activities to Business Units                                 │
│     Location: /components/sa/CDBBusinessUnits.tsx                        │
│     Examples:                                                             │
│     - BU-MFG-2025-001: Manufacturing Plant - North America              │
│       Activities: ACT-2024-0001, ACT-2024-0002, ACT-2024-0003,          │
│                   ACT-2024-0008, ACT-2024-0009, ACT-2024-0031,          │
│                   ACT-2024-0032                                          │
│                                                                            │
│  5. Assigns Customer Users to Business Units                             │
│     Assignees stored in: businessUnit.assignedUsers[]                   │
│                                                                            │
│  6. Creates BCA Projects and assigns Business Units                      │
│     Location: /components/sa/ProjectsPage.tsx                            │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ ASSIGNED
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          CUSTOMER USER ROLE                               │
│                                                                            │
│  1. Sees assigned Business Units and Projects                            │
│     Location: /components/customer/DataInputPage.tsx                     │
│                                                                            │
│  2. Views Activities with:                                                │
│     - Formula name (inherited from SA)                                    │
│     - Expression (inherited from SA)                                      │
│     - Mapped EF parameters (already set by SA)                           │
│                                                                            │
│  3. Fills in VARIABLE parameter values                                    │
│     Example for ACT-2024-0001 (Stationary Combustion):                  │
│     ┌────────────────────────────────────────────────────────────────┐  │
│     │ Formula: Natural Gas Combustion                                 │  │
│     │ Expression: Natural_Gas_Volume * Natural_Gas_Emission_Factor    │  │
│     │                                                                  │  │
│     │ Parameters to fill:                                             │  │
│     │ ✏️  Natural_Gas_Volume: [____] m³    ← CUSTOMER FILLS THIS    │  │
│     │ ✓  Natural_Gas_Emission_Factor: 1.9867 kg CO2e/m³             │  │
│     │     (from EF-FUE-GLB-2024-001, already mapped by SA)           │  │
│     └────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  4. Downloads Excel template with:                                        │
│     - Sheet 1: Instructions                                               │
│     - Sheet 2: Activity data input (with variable parameters only)       │
│     - Sheet 3: Parameter reference (showing all EF mappings)             │
│                                                                            │
│  5. Uploads completed data                                                │
└──────────────────────────────────────────────────────────────────────────┘
```

## Data Synchronization Matrix

| Activity UID | Activity Name | Formula UID | Expression ID | EF Parameter | Mapped EF UID | Variable Params (Customer Fills) |
|---|---|---|---|---|---|---|
| ACT-2024-0001 | Table-1: Stationary Combustion | FORM-FUE-NAT-2024-003 | expr_gross_emissions | param_gas_ef | EF-FUE-GLB-2024-001 | param_gas_volume |
| ACT-2024-0002 | Table-2: Mobile Combustion | FORM-TRA-VEH-2024-002 | expr_distance_emissions | param_vehicle_ef | EF-TRA-2024-0007 | param_distance |
| ACT-2024-0003 | Table-3: Fugitive Emissions | FORM-FUE-NAT-2024-003 | expr_net_emissions | param_gas_ef | EF-FUE-GLB-2024-001 | param_gas_volume, param_efficiency |
| ACT-2024-0008 | Electricity Location-based | FORM-ENE-ELEC-2024-001 | expr_total_emissions | param_grid_ef | EF-ENE-2024-0001 | param_elec_consumption |
| ACT-2024-0009 | Electricity Market-based | FORM-ENE-ELEC-2024-001 | expr_total_emissions | param_grid_ef | EF-ENE-2024-0002 | param_elec_consumption |
| ACT-2024-0031 | Cat. 1: Purchased goods | FORM-TRA-VEH-2024-002 | expr_distance_emissions | param_vehicle_ef | EF-TRA-2024-0007 | param_distance |
| ACT-2024-0032 | Cat. 2: Capital goods | FORM-FUE-NAT-2024-003 | expr_gross_emissions | param_gas_ef | EF-FUE-GLB-2024-001 | param_gas_volume |
| ACT-2024-0034 | Cat. 4: Upstream transport | FORM-TRA-VEH-2024-002 | expr_fuel_emissions | param_fuel_ef | EF-ENE-2024-0003 | param_fuel_volume |
| ACT-2024-0036 | Cat. 6: Business travel | FORM-TRA-VEH-2024-002 | expr_distance_emissions | param_vehicle_ef | EF-TRA-2024-0007 | param_distance |
| ACT-2024-0037 | Cat. 7: Employee commuting | FORM-TRA-VEH-2024-002 | expr_distance_emissions | param_vehicle_ef | EF-TRA-2024-0007 | param_distance |
| ACT-CLIENT-0001 | Custom Manufacturing | FORM-CDB-ENE-2025-001 | client-expr-2 | (none) | (none) | Total_Energy_Consumption, Renewable_Percentage |

## File Locations

### Platform Admin (Master DB)
- **Emission Factors**: `/contexts/MasterDBContext.tsx` (mockMasterEFDefinitions)
- **Formulas**: `/contexts/MasterDBContext.tsx` (mockMasterFormulaDefinitions)

### Sustainability Architect (CDB - Client Database)
- **Centralized Activities Data**: `/components/sa/activitiesData.ts`
- **Activities UI**: `/components/sa/CDBActivities.tsx`
- **Business Units**: `/components/sa/CDBBusinessUnits.tsx`
- **Client EFs**: `/components/sa/EmissionFactorsCDB.tsx`
- **Client Formulas**: `/components/sa/CDBFormulas.tsx`
- **Projects**: `/components/sa/ProjectsPage.tsx`

### Customer User
- **Data Input**: `/components/customer/DataInputPage.tsx`
- **Excel Template Generator**: `/utils/excelTemplateGenerator.ts`

## Verification Checklist

✅ All activities reference existing Master DB formulas  
✅ All expressions exist within their formulas  
✅ All EF parameter mappings reference existing Master DB EFs  
✅ All Business Units reference activities from activitiesData.ts  
✅ Customer users see only variable parameters to fill  
✅ Excel template generation uses synchronized activity data  
✅ **SYNCHRONIZED: SA and Customer roles now use shared businessUnitsData.ts**
✅ **SYNCHRONIZED: Projects data shared between SA and Customer roles**  
✅ **SYNCHRONIZED: Activities properly inherited from centralized activitiesData.ts**
✅ **SYNCHRONIZED: Customer submissions dynamically generated from businessUnitsData activities**
✅ **VERIFIED: All 6 business units show consistent activities across SA and Customer roles**

## Key Principles

1. **Single Source of Truth**: Activities are defined once in `/components/sa/activitiesData.ts`
2. **Inheritance**: SA inherits all Master DB data, can extend with client-specific data
3. **Parameter Types**:
   - `variable`: Customer fills these values
   - `ef_value`: SA maps to specific EFs, values come from Master DB
4. **Data References**: All UIDs are actual references, not duplicates
5. **Flow Direction**: Platform Admin → SA → Customer Users (one-way inheritance)

## Sample Workflow Example

### 1. Platform Admin creates EF:
```typescript
{
  uid: 'EF-ENE-2024-0001',
  name: 'National Grid Electricity Mix - United States',
  // ... core data rows with impact values
}
```

### 2. Platform Admin creates Formula:
```typescript
{
  uid: 'FORM-ENE-ELEC-2024-001',
  name: 'Electricity Consumption Emissions',
  parameters: [
    { id: 'param_elec_consumption', parameterType: 'variable' },
    { 
      id: 'param_grid_ef', 
      parameterType: 'ef_value',
      efUID: 'EF-ENE-2024-0001' // ← References EF created above
    }
  ],
  expressions: [
    { 
      id: 'expr_total_emissions',
      expression: 'Electricity_Consumption * Grid_Emission_Factor'
    }
  ]
}
```

### 3. SA creates Activity:
```typescript
{
  uid: 'ACT-2024-0008',
  name: 'Table 8. Electricity purchased: Location-based',
  formulaUID: 'FORM-ENE-ELEC-2024-001', // ← References formula
  expressionId: 'expr_total_emissions',  // ← References expression
  efParameterMappings: [
    {
      parameterId: 'param_grid_ef',
      efUID: 'EF-ENE-2024-0001' // ← References EF
    }
  ]
}
```

### 4. SA assigns Activity to Business Unit:
```typescript
{
  uid: 'BU-MFG-2025-001',
  activities: [
    getActivity('ACT-2024-0008', 'United States', 2025)
  ]
}
```

### 5. Customer User fills data:
```typescript
// Sees:
// - Activity: "Table 8. Electricity purchased: Location-based"
// - Formula: "Electricity Consumption Emissions"
// - Expression: "Electricity_Consumption * Grid_Emission_Factor"
// - Fixed: Grid_Emission_Factor = 0.4156 kg CO2e/kWh (from EF-ENE-2024-0001)
// - Input: Electricity_Consumption = [USER ENTERS VALUE] kWh
```

This ensures complete end-to-end data synchronization with no disconnected or duplicate data!