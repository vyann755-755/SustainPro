# Business Units Data Synchronization

## Overview
All business units are now centralized in `/data/businessUnitsData.ts` and shared between:
- **Sustainability Architect Role**: Business Units management and assignment
- **Customer User Role**: Activity data input and submission

## Business Units Structure

### BU-1: Manufacturing Plant - North America
- **UID**: `BU-MFG-2025-001`
- **Project**: Q1 2025 Carbon Assessment
- **Activities** (7):
  1. ACT-2024-0001: Table-1: Stationary Combustion (Scope 1)
  2. ACT-2024-0002: Table-2: Mobile Combustion (Scope 1)
  3. ACT-2024-0003: Table-3: Fugitive Emissions (Scope 1)
  4. ACT-2024-0008: Electricity Location-based (Scope 2)
  5. ACT-2024-0009: Electricity Market-based (Scope 2)
  6. ACT-2024-0031: Purchased goods and services (Scope 3)
  7. ACT-2024-0032: Capital goods (Scope 3)

### BU-2: Distribution Warehouse - East Coast
- **UID**: `BU-WHS-2025-002`
- **Project**: Q1 2025 Carbon Assessment
- **Activities** (5):
  1. ACT-2024-0008: Electricity Location-based (Scope 2)
  2. ACT-2024-0009: Electricity Market-based (Scope 2)
  3. ACT-2024-0034: Upstream transportation (Scope 3)
  4. ACT-2024-0036: Business travel (Scope 3)
  5. ACT-2024-0037: Employee commuting (Scope 3)

### BU-3: Corporate Office - HQ
- **UID**: `BU-OFF-2025-003`
- **Project**: Q1 2025 Carbon Assessment
- **Activities** (4):
  1. ACT-2024-0008: Electricity Location-based (Scope 2)
  2. ACT-2024-0036: Business travel (Scope 3)
  3. ACT-2024-0037: Employee commuting (Scope 3)
  4. ACT-2024-0031: Purchased goods and services (Scope 3)

### BU-4: Retail Operations - Southwest
- **UID**: `BU-RET-2025-004`
- **Project**: Annual Sustainability Report 2025
- **Activities** (3):
  1. ACT-2024-0008: Electricity Location-based (Scope 2)
  2. ACT-2024-0001: Stationary Combustion (Scope 1)
  3. ACT-2024-0037: Employee commuting (Scope 3)

### BU-5: Logistics Hub - Central
- **UID**: `BU-LOG-2025-005`
- **Project**: Annual Sustainability Report 2025
- **Activities** (3):
  1. ACT-2024-0002: Mobile Combustion (Scope 1)
  2. ACT-2024-0034: Upstream transportation (Scope 3)
  3. ACT-2024-0008: Electricity Location-based (Scope 2)

### BU-6: R&D Center - Innovation Campus
- **UID**: `BU-RND-2025-006`
- **Project**: Annual Sustainability Report 2025
- **Activities** (4):
  1. ACT-2024-0008: Electricity Location-based (Scope 2)
  2. ACT-2024-0009: Electricity Market-based (Scope 2)
  3. ACT-2024-0001: Stationary Combustion (Scope 1)
  4. ACT-2024-0032: Capital goods (Scope 3)

## Data Flow

```
/data/businessUnitsData.ts (SINGLE SOURCE OF TRUTH)
         │
         ├─→ SA Role: /components/sa/CDBBusinessUnits.tsx
         │   - Imports businessUnitsData directly
         │   - Displays for management and assignment
         │   - Can assign customer users to BUs
         │
         └─→ Customer Role: /components/customer/ActivityData.tsx
             - Imports businessUnitsData directly
             - Shows assigned BUs and activities
             - Generates submissions based on BU activities
             - Ensures customer sees exact activities assigned by SA
```

## Key Features

### ✅ Automatic Synchronization
- When SA updates business units, customer automatically sees changes
- Activities are fetched from centralized `activitiesData.ts`
- No manual synchronization needed

### ✅ Dynamic Submission Generation
- Customer submissions are generated from actual BU activities
- Each submission includes all activities assigned to the BU
- GRI categories and scope automatically derived from activity data

### ✅ Type Safety
- Shared TypeScript interfaces ensure consistency
- `BusinessUnit` type used across both roles
- `BusinessUnitActivity` extends base `ActivityDefinition`

## Usage

### For Sustainability Architect
```typescript
// Import and use directly
import { businessUnitsData, projectsData } from '../../data/businessUnitsData';

// Business units are ready to use
const bu = businessUnitsData.find(b => b.uid === 'BU-MFG-2025-001');
```

### For Customer User
```typescript
// Import and use directly
import { businessUnitsData, projectsData } from '../../data/businessUnitsData';

// Filter by assigned users (if needed)
const myBusinessUnits = businessUnitsData.filter(bu => 
  bu.assignedUsers?.includes(currentUserId)
);

// Activities are already populated
bu.activities.forEach(activity => {
  // Each activity has: uid, name, formulaUID, expressionId, etc.
});
```

## Benefits

1. **Single Source of Truth**: One file defines all business units
2. **Consistency**: SA and Customer see identical data
3. **Maintainability**: Update once, reflected everywhere
4. **Traceability**: All activities reference `activitiesData.ts`
5. **Type Safety**: TypeScript ensures data integrity
6. **Extensibility**: Easy to add new business units or activities

## Testing Verification

To verify synchronization:

1. **SA Role** → Navigate to Business Units → Check BU-MFG-2025-001 activities
2. **Customer Role** → Navigate to Activity Data → Select BU-MFG-2025-001
3. Both should show the same 7 activities in the same order

Expected activities for BU-MFG-2025-001:
- ✅ Stationary Combustion
- ✅ Mobile Combustion
- ✅ Fugitive Emissions
- ✅ Electricity Location-based
- ✅ Electricity Market-based
- ✅ Purchased goods
- ✅ Capital goods
