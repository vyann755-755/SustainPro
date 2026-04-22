import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Building,
  Copy,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
  Globe,
  Activity,
  Calculator,
  Zap,
  AlertCircle,
  Save,
  FileText,
  Settings,
  CheckCircle,
  Users
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useMasterDB } from '../../contexts/MasterDBContext';
import { GRIActivityTemplateSelector } from './GRIActivityTemplateSelector';
import { griStructure } from './griStructureData';
import { mockUsers } from '../client-admin/UserManagement';
import { allActivities, type ActivityDefinition } from './activitiesData';
import { businessUnitsData, projectsData, getActivity as getActivityFromData, type BusinessUnit as SharedBusinessUnit, type BusinessUnitActivity } from '../../data/businessUnitsData';
import { getFormulaByUID, getExpression, getVariableParameters, getEFParameters, type FormulaParameter } from '../../data/formulasData';
import { AssignUnitsDialog } from './AssignUnitsDialog';

// Interfaces
// Activity now uses the centralized ActivityDefinition from activitiesData.ts
type Activity = BusinessUnitActivity;

export interface BusinessUnit extends SharedBusinessUnit {
  // Extending the shared type if needed for SA-specific fields
}

// Helper function alias for backward compatibility
const getActivity = getActivityFromData;

/**
 * Mock Business Units
 * 
 * WORKFLOW & DATA SYNC:
 * - Activities assigned to Business Units are references to activities in activitiesData.ts
 * - All activities MUST first be created in the "Activities" section (CDBActivities component)
 * - Once created with expressions and parameter mappings, they can be assigned here
 * - The getActivity() helper function fetches activities from the centralized store
 * - This ensures data consistency between Activities section and Business Units section
 * 
 * DATA SOURCE: /data/businessUnitsData.ts (synchronized with Customer User role)
 */
export const mockBusinessUnits: BusinessUnit[] = businessUnitsData as BusinessUnit[];

// Legacy data kept for reference but not used
const _legacyBusinessUnits = [
  {
    id: 'bu-1',
    uid: 'BU-MFG-2025-001',
    name: 'Manufacturing Plant - North America',
    description: 'Primary manufacturing facility for product lines A, B, and C',
    projectId: 'proj-1',
    projectName: 'Q1 2025 Carbon Assessment',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['3', '7', '9'],
    activities: [
      { id: 'act-bu1-1', uid: 'ACT-2024-0001', name: 'Table-1: Stationary Combustion', scope: '1', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.1'], formulaUID: 'FORM-ENE-GAS-2024-001', formulaName: 'Fuel Combustion', source: 'master', status: 'active' },
      { id: 'act-bu1-2', uid: 'ACT-2024-0002', name: 'Table-2: Mobile Combustion', scope: '1', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.2'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Vehicle Fleet Emissions', source: 'master', status: 'active' },
      { id: 'act-bu1-3', uid: 'ACT-2024-0003', name: 'Table-3: Fugitive Emissions - Refrigerant', scope: '1', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.3'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Refrigerant Emissions', source: 'master', status: 'active' },
      { id: 'act-bu1-4', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu1-5', uid: 'ACT-2024-0009', name: 'Table 9. Electricity purchased: Market-based', scope: '2', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.9'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu1-6', uid: 'ACT-2024-0031', name: 'Cat. 1: Purchased goods and services', scope: '3', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.1'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Purchased Goods Emissions', source: 'master', status: 'active' },
      { id: 'act-bu1-7', uid: 'ACT-2024-0032', name: 'Cat. 2: Capital goods', scope: '3', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.2'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Capital Goods Emissions', source: 'master', status: 'active' }
    ],
    createdAt: '2025-01-15T10:00:00Z',
    createdBy: 'SA User'
  },
  {
    id: 'bu-2',
    uid: 'BU-OFF-2025-002',
    name: 'Corporate Office - Europe',
    description: 'Headquarters office building in London',
    projectId: 'proj-1',
    projectName: 'Q1 2025 Carbon Assessment',
    defaultYear: 2025,
    defaultCountry: 'United Kingdom',
    status: 'active',
    assignedUsers: ['4', '8', '15'],
    activities: [
      { id: 'act-bu2-1', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'United Kingdom', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu2-2', uid: 'ACT-2024-0009', name: 'Table 9. Electricity purchased: Market-based', scope: '2', year: 2025, country: 'United Kingdom', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.9'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu2-3', uid: 'ACT-2024-0001', name: 'Table-1: Stationary Combustion', scope: '1', year: 2025, country: 'United Kingdom', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.1'], formulaUID: 'FORM-ENE-GAS-2024-001', formulaName: 'Fuel Combustion', source: 'master', status: 'active' },
      { id: 'act-bu2-4', uid: 'ACT-2024-0036', name: 'Cat. 6: Business travel', scope: '3', year: 2025, country: 'United Kingdom', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.6'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Air Travel Emissions', source: 'master', status: 'active' },
      { id: 'act-bu2-5', uid: 'ACT-2024-0037', name: 'Cat. 7: Employee commuting', scope: '3', year: 2025, country: 'United Kingdom', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.7'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Commuting Emissions', source: 'master', status: 'active' }
    ],
    createdAt: '2025-02-01T14:30:00Z',
    createdBy: 'SA User'
  },
  {
    id: 'bu-3',
    uid: 'BU-DST-2025-003',
    name: 'Distribution Center - East Coast',
    description: 'Major distribution hub serving eastern United States',
    projectId: 'proj-1',
    projectName: 'Q1 2025 Carbon Assessment',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['6', '11'],
    activities: [
      { id: 'act-bu3-1', uid: 'ACT-2024-0001', name: 'Table-1: Stationary Combustion', scope: '1', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.1'], formulaUID: 'FORM-ENE-GAS-2024-001', formulaName: 'Fuel Combustion', source: 'master', status: 'active' },
      { id: 'act-bu3-2', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu3-3', uid: 'ACT-2024-0031', name: 'Cat. 1: Purchased goods and services', scope: '3', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.1'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Purchased Goods Emissions', source: 'master', status: 'active' },
      { id: 'act-bu3-4', uid: 'ACT-2024-0034', name: 'Cat. 4: Upstream transportation', scope: '3', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.4'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Transportation Emissions', source: 'master', status: 'active' }
    ],
    createdAt: '2025-01-20T09:15:00Z',
    createdBy: 'SA User'
  },
  {
    id: 'bu-4',
    uid: 'BU-WHS-2025-004',
    name: 'Warehouse - Canada',
    description: 'Regional warehouse facility in Toronto',
    defaultYear: 2025,
    defaultCountry: 'Canada',
    status: 'active',
    assignedUsers: ['7', '10'],
    activities: [
      { id: 'act-bu4-1', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'Canada', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu4-2', uid: 'ACT-2024-0001', name: 'Table-1: Stationary Combustion', scope: '1', year: 2025, country: 'Canada', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.1'], formulaUID: 'FORM-ENE-GAS-2024-001', formulaName: 'Fuel Combustion', source: 'master', status: 'active' },
      { id: 'act-bu4-3', uid: 'ACT-2024-0002', name: 'Table-2: Mobile Combustion', scope: '1', year: 2025, country: 'Canada', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.2'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Vehicle Fleet Emissions', source: 'master', status: 'active' }
    ],
    createdAt: '2025-01-22T11:00:00Z',
    createdBy: 'SA User'
  },
  {
    id: 'bu-5',
    uid: 'BU-MFG-2025-005',
    name: 'Manufacturing Plant - Mexico',
    description: 'Secondary manufacturing facility in Monterrey',
    defaultYear: 2025,
    defaultCountry: 'Mexico',
    status: 'active',
    assignedUsers: ['10', '14'],
    activities: [
      { id: 'act-bu5-1', uid: 'ACT-2024-0001', name: 'Table-1: Stationary Combustion', scope: '1', year: 2025, country: 'Mexico', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.1'], formulaUID: 'FORM-ENE-GAS-2024-001', formulaName: 'Fuel Combustion', source: 'master', status: 'active' },
      { id: 'act-bu5-2', uid: 'ACT-2024-0002', name: 'Table-2: Mobile Combustion', scope: '1', year: 2025, country: 'Mexico', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.2'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Vehicle Fleet Emissions', source: 'master', status: 'active' },
      { id: 'act-bu5-3', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'Mexico', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu5-4', uid: 'ACT-2024-0031', name: 'Cat. 1: Purchased goods and services', scope: '3', year: 2025, country: 'Mexico', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.1'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Purchased Goods Emissions', source: 'master', status: 'active' },
      { id: 'act-bu5-5', uid: 'ACT-2024-0032', name: 'Cat. 2: Capital goods', scope: '3', year: 2025, country: 'Mexico', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.2'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Capital Goods Emissions', source: 'master', status: 'active' }
    ],
    createdAt: '2025-01-25T13:30:00Z',
    createdBy: 'SA User'
  },
  {
    id: 'bu-6',
    uid: 'BU-OFF-2025-006',
    name: 'Regional Office - Asia Pacific',
    description: 'Asia-Pacific headquarters in Singapore',
    defaultYear: 2025,
    defaultCountry: 'Singapore',
    status: 'active',
    assignedUsers: ['8', '12'],
    activities: [
      { id: 'act-bu6-1', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'Singapore', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu6-2', uid: 'ACT-2024-0036', name: 'Cat. 6: Business travel', scope: '3', year: 2025, country: 'Singapore', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.6'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Air Travel Emissions', source: 'master', status: 'active' },
      { id: 'act-bu6-3', uid: 'ACT-2024-0037', name: 'Cat. 7: Employee commuting', scope: '3', year: 2025, country: 'Singapore', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.7'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Commuting Emissions', source: 'master', status: 'active' }
    ],
    createdAt: '2025-02-01T08:45:00Z',
    createdBy: 'SA User'
  },
  {
    id: 'bu-7',
    uid: 'BU-RND-2025-007',
    name: 'R&D Center - California',
    description: 'Research and development facility in Silicon Valley',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['3', '9'],
    activities: [
      { id: 'act-bu7-1', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu7-2', uid: 'ACT-2024-0001', name: 'Table-1: Stationary Combustion', scope: '1', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.1'], formulaUID: 'FORM-ENE-GAS-2024-001', formulaName: 'Fuel Combustion', source: 'master', status: 'active' }
    ],
    createdAt: '2025-02-03T10:20:00Z',
    createdBy: 'SA User'
  },
  {
    id: 'bu-8',
    uid: 'BU-DST-2025-008',
    name: 'Distribution Center - West Coast',
    description: 'Western distribution hub in Los Angeles',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['6', '11'],
    activities: [
      { id: 'act-bu8-1', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu8-2', uid: 'ACT-2024-0001', name: 'Table-1: Stationary Combustion', scope: '1', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.1'], formulaUID: 'FORM-ENE-GAS-2024-001', formulaName: 'Fuel Combustion', source: 'master', status: 'active' },
      { id: 'act-bu8-3', uid: 'ACT-2024-0034', name: 'Cat. 4: Upstream transportation', scope: '3', year: 2025, country: 'United States', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.4'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Transportation Emissions', source: 'master', status: 'active' }
    ],
    createdAt: '2025-02-05T14:10:00Z',
    createdBy: 'SA User'
  },
  {
    id: 'bu-9',
    uid: 'BU-MFG-2025-009',
    name: 'Manufacturing Plant - Brazil',
    description: 'South American production facility in São Paulo',
    defaultYear: 2025,
    defaultCountry: 'Brazil',
    status: 'active',
    assignedUsers: ['14', '15'],
    activities: [
      { id: 'act-bu9-1', uid: 'ACT-2024-0001', name: 'Table-1: Stationary Combustion', scope: '1', year: 2025, country: 'Brazil', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.1.1'], formulaUID: 'FORM-ENE-GAS-2024-001', formulaName: 'Fuel Combustion', source: 'master', status: 'active' },
      { id: 'act-bu9-2', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'Brazil', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu9-3', uid: 'ACT-2024-0031', name: 'Cat. 1: Purchased goods and services', scope: '3', year: 2025, country: 'Brazil', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.1'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Purchased Goods Emissions', source: 'master', status: 'active' }
    ],
    createdAt: '2025-02-07T09:30:00Z',
    createdBy: 'SA User'
  },
  {
    id: 'bu-10',
    uid: 'BU-OFF-2025-010',
    name: 'Sales Office - Germany',
    description: 'European sales headquarters in Berlin',
    defaultYear: 2025,
    defaultCountry: 'Germany',
    status: 'active',
    assignedUsers: ['13', '15'],
    activities: [
      { id: 'act-bu10-1', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'Germany', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu10-2', uid: 'ACT-2024-0036', name: 'Cat. 6: Business travel', scope: '3', year: 2025, country: 'Germany', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.6'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Air Travel Emissions', source: 'master', status: 'active' }
    ],
    createdAt: '2025-02-08T11:45:00Z',
    createdBy: 'SA User'
  },
  {
    id: 'bu-11',
    uid: 'BU-WHS-2025-011',
    name: 'Warehouse - Australia',
    description: 'Oceania warehouse facility in Sydney',
    defaultYear: 2025,
    defaultCountry: 'Australia',
    status: 'draft',
    assignedUsers: ['8', '12'],
    activities: [
      { id: 'act-bu11-1', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'Australia', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' }
    ],
    createdAt: '2025-02-10T07:20:00Z',
    createdBy: 'SA User'
  },
  {
    id: 'bu-12',
    uid: 'BU-DST-2025-012',
    name: 'Distribution Center - Japan',
    description: 'Asian distribution center in Tokyo',
    defaultYear: 2025,
    defaultCountry: 'Japan',
    status: 'active',
    assignedUsers: ['4', '12'],
    activities: [
      { id: 'act-bu12-1', uid: 'ACT-2024-0008', name: 'Table 8. Electricity purchased: Location-based', scope: '2', year: 2025, country: 'Japan', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.2.8'], formulaUID: 'FORM-ENE-ELEC-2024-001', formulaName: 'Electricity Consumption Emissions', source: 'master', status: 'active' },
      { id: 'act-bu12-2', uid: 'ACT-2024-0034', name: 'Cat. 4: Upstream transportation', scope: '3', year: 2025, country: 'Japan', impactCategories: ['Climate Change - total (GWP)'], grpCategories: ['305.3.4'], formulaUID: 'FORM-TRA-VEH-2024-002', formulaName: 'Transportation Emissions', source: 'master', status: 'active' }
    ],
    createdAt: '2025-02-12T15:00:00Z',
    createdBy: 'SA User'
  }
]; // End of legacy data

// Available templates
const buTemplates = [
  {
    id: 'template-1',
    name: 'Manufacturing Facility',
    description: 'Standard manufacturing plant with energy, water, and waste activities',
    activities: [
      { name: 'Electricity Consumption', category: 'Energy', reportingCategory: 'Scope 2 - Purchased Electricity' },
      { name: 'Natural Gas Heating', category: 'Energy', reportingCategory: 'Scope 1 - Stationary Combustion' },
      { name: 'Diesel Generators', category: 'Energy', reportingCategory: 'Scope 1 - Stationary Combustion' },
      { name: 'Water Consumption', category: 'Resources', reportingCategory: 'Scope 3 - Water Supply' },
      { name: 'Waste Disposal', category: 'Waste', reportingCategory: 'Scope 3 - Waste Disposal' },
      { name: 'Raw Material Transport', category: 'Transportation', reportingCategory: 'Scope 3 - Upstream Transportation' }
    ]
  },
  {
    id: 'template-2',
    name: 'Office Building',
    description: 'Corporate office with standard utilities and employee activities',
    activities: [
      { name: 'Office Electricity', category: 'Energy', reportingCategory: 'Scope 2 - Purchased Electricity' },
      { name: 'Heating & Cooling', category: 'Energy', reportingCategory: 'Scope 2 - Purchased Heat/Steam' },
      { name: 'Employee Commuting', category: 'Transportation', reportingCategory: 'Scope 3 - Employee Commuting' },
      { name: 'Business Travel', category: 'Transportation', reportingCategory: 'Scope 3 - Business Travel' },
      { name: 'Paper & Office Supplies', category: 'Materials', reportingCategory: 'Scope 3 - Purchased Goods' }
    ]
  },
  {
    id: 'template-3',
    name: 'Distribution Center',
    description: 'Warehouse and distribution facility',
    activities: [
      { name: 'Warehouse Electricity', category: 'Energy', reportingCategory: 'Scope 2 - Purchased Electricity' },
      { name: 'Forklift Fuel', category: 'Energy', reportingCategory: 'Scope 1 - Mobile Combustion' },
      { name: 'Inbound Logistics', category: 'Transportation', reportingCategory: 'Scope 3 - Upstream Transportation' },
      { name: 'Outbound Distribution', category: 'Transportation', reportingCategory: 'Scope 3 - Downstream Transportation' },
      { name: 'Refrigeration', category: 'Energy', reportingCategory: 'Scope 1 - Fugitive Emissions' }
    ]
  }
];

// Available Activities from CDB (Master DB + Client Activities)
const mockAvailableActivities: Activity[] = [
  // Master DB Activities
  {
    id: 'master-1',
    uid: 'ACT-2024-0001',
    name: 'Customer Meeting by Own Car',
    scope: '3',
    year: 2024,
    country: 'United States',
    impactCategories: ['GWP-100 (Global Warming Potential)', 'AP (Acidification Potential)'],
    grpCategories: ['305.1.2', '305.3.6'],
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    source: 'master',
    status: 'active'
  },
  {
    id: 'master-2',
    uid: 'ACT-2024-0002',
    name: 'Office Electricity Consumption',
    scope: '2',
    year: 2024,
    country: 'United Kingdom',
    impactCategories: ['GWP-100 (Global Warming Potential)'],
    grpCategories: ['305.2.8', '305.2.9'],
    formulaUID: 'FORM-ENE-ELEC-2024-001',
    formulaName: 'Electricity Consumption Emissions',
    source: 'master',
    status: 'active'
  },
  {
    id: 'master-3',
    uid: 'ACT-2024-0003',
    name: 'Natural Gas Heating',
    scope: '1',
    year: 2024,
    country: 'Global',
    impactCategories: ['GWP-100 (Global Warming Potential)'],
    grpCategories: ['305.1.1'],
    formulaUID: 'FORM-ENE-GAS-2024-001',
    formulaName: 'Fuel Combustion',
    source: 'master',
    status: 'active'
  },
  {
    id: 'master-4',
    uid: 'ACT-2024-0004',
    name: 'Freight Transport - Heavy Duty Truck',
    scope: '3',
    year: 2024,
    country: 'United States',
    impactCategories: ['GWP-100 (Global Warming Potential)'],
    grpCategories: ['305.3.4', '305.3.9'],
    formulaUID: 'FORM-TRA-FRE-2024-001',
    formulaName: 'Freight Transport Emissions',
    source: 'master',
    status: 'active'
  },
  // Client Activities
  {
    id: 'client-1',
    uid: 'ACT-CDB-2025-0001',
    name: 'Manufacturing Natural Gas Heating',
    scope: '1',
    year: 2025,
    country: 'United States',
    impactCategories: ['GWP-100 (Global Warming Potential)'],
    grpCategories: ['305.1.1'],
    formulaUID: 'FORM-CDB-ENE-2025-001',
    formulaName: 'Fuel Combustion',
    source: 'client',
    status: 'active'
  },
  {
    id: 'client-2',
    uid: 'ACT-CDB-2025-0002',
    name: 'Employee Air Travel',
    scope: '3',
    year: 2025,
    country: 'Global',
    impactCategories: ['GWP-100 (Global Warming Potential)'],
    grpCategories: ['305.3.6'],
    formulaUID: 'FORM-CDB-TRA-2025-001',
    formulaName: 'Air Travel Emissions',
    source: 'client',
    status: 'active'
  },
  {
    id: 'client-3',
    uid: 'ACT-CDB-2025-0003',
    name: 'Waste to Landfill',
    scope: '3',
    year: 2025,
    country: 'United States',
    impactCategories: ['GWP-100 (Global Warming Potential)'],
    grpCategories: ['305.3.5'],
    formulaUID: 'FORM-CDB-WAS-2025-001',
    formulaName: 'Waste Disposal Emissions',
    source: 'client',
    status: 'active'
  },
  {
    id: 'master-5',
    uid: 'ACT-2024-0005',
    name: 'Diesel Generator',
    scope: '1',
    year: 2024,
    country: 'Global',
    impactCategories: ['GWP-100 (Global Warming Potential)'],
    grpCategories: ['305.1.1'],
    formulaUID: 'FORM-ENE-GAS-2024-001',
    formulaName: 'Fuel Combustion',
    source: 'master',
    status: 'active'
  },
  {
    id: 'master-6',
    uid: 'ACT-2024-0006',
    name: 'Company Fleet - Gasoline Vehicles',
    scope: '1',
    year: 2024,
    country: 'United States',
    impactCategories: ['GWP-100 (Global Warming Potential)'],
    grpCategories: ['305.1.2'],
    formulaUID: 'FORM-TRA-VEH-2024-002',
    formulaName: 'Vehicle Fleet Emissions',
    source: 'master',
    status: 'active'
  },
  {
    id: 'master-7',
    uid: 'ACT-2024-0007',
    name: 'Steam from District Heating',
    scope: '2',
    year: 2024,
    country: 'Germany',
    impactCategories: ['GWP-100 (Global Warming Potential)'],
    grpCategories: ['305.2.9'],
    formulaUID: 'FORM-ENE-HEAT-2024-001',
    formulaName: 'Heat/Steam Consumption Emissions',
    source: 'master',
    status: 'active'
  },
  {
    id: 'master-8',
    uid: 'ACT-2024-0008',
    name: 'Business Air Travel - International',
    scope: '3',
    year: 2024,
    country: 'Global',
    impactCategories: ['GWP-100 (Global Warming Potential)'],
    grpCategories: ['305.3.6'],
    formulaUID: 'FORM-TRA-AIR-2024-001',
    formulaName: 'Air Travel Emissions',
    source: 'master',
    status: 'active'
  },
  {
    id: 'client-4',
    uid: 'ACT-CDB-2025-0004',
    name: 'Inbound Freight Transport',
    scope: '3',
    year: 2025,
    country: 'United States',
    impactCategories: ['GWP-100 (Global Warming Potential)'],
    grpCategories: ['305.3.4'],
    formulaUID: 'FORM-CDB-TRA-2025-002',
    formulaName: 'Freight Transport Emissions',
    source: 'client',
    status: 'active'
  }
];

const countries = [
  'United States', 'United Kingdom', 'Germany', 'France', 'China', 
  'Japan', 'Canada', 'Australia', 'Brazil', 'India', 'Mexico', 'Spain'
];

const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const impactCategoriesOptions = [
  'GHG Protocol', 'Scope 1', 'Scope 2', 'Scope 3', 
  'Climate Change', 'Water Use', 'Land Use', 'Acidification'
];

const reportingCategories = [
  'Scope 1 - Stationary Combustion',
  'Scope 1 - Mobile Combustion',
  'Scope 1 - Fugitive Emissions',
  'Scope 1 - Process Emissions',
  'Scope 2 - Purchased Electricity',
  'Scope 2 - Purchased Heat/Steam',
  'Scope 3 - Purchased Goods',
  'Scope 3 - Capital Goods',
  'Scope 3 - Upstream Transportation',
  'Scope 3 - Downstream Transportation',
  'Scope 3 - Waste Disposal',
  'Scope 3 - Business Travel',
  'Scope 3 - Employee Commuting',
  'Scope 3 - Water Supply'
];

export function CDBBusinessUnits() {
  // Get Master DB data
  const { masterFormulaDefinitions, masterEFDefinitions } = useMasterDB();
  
  // Business Units state
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>(mockBusinessUnits);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Expansion states
  const [expandedBUs, setExpandedBUs] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isCreateBUDialogOpen, setIsCreateBUDialogOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [isEditBUDialogOpen, setIsEditBUDialogOpen] = useState(false);
  const [isAddActivityDialogOpen, setIsAddActivityDialogOpen] = useState(false);
  const [isAddGRIGroupDialogOpen, setIsAddGRIGroupDialogOpen] = useState(false);
  const [isAddGRICategoryDialogOpen, setIsAddGRICategoryDialogOpen] = useState(false);
  const [isAddCategoryActivityDialogOpen, setIsAddCategoryActivityDialogOpen] = useState(false);
  const [isAssignUnitsDialogOpen, setIsAssignUnitsDialogOpen] = useState(false);
  const [selectedActivityForUnits, setSelectedActivityForUnits] = useState<Activity | null>(null);
  const [activityParameterUnits, setActivityParameterUnits] = useState<Record<string, string>>({});
  const [bulkActivityUnits, setBulkActivityUnits] = useState<Record<string, Record<string, string>>>({});
  
  // Selected items
  const [selectedBU, setSelectedBU] = useState<BusinessUnit | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedGRIGroupForCategory, setSelectedGRIGroupForCategory] = useState<string | null>(null);
  const [selectedGRICategoryForActivity, setSelectedGRICategoryForActivity] = useState<string | null>(null);
  
  // Activity selection states
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [selectedScope, setSelectedScope] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // GRI Template selection states
  const [griSearchTerm, setGRISearchTerm] = useState('');
  const [expandedGRIGroups, setExpandedGRIGroups] = useState<Set<string>>(new Set());
  const [expandedGRICategories, setExpandedGRICategories] = useState<Set<string>>(new Set());
  const [selectedGRIGroups, setSelectedGRIGroups] = useState<Set<string>>(new Set());
  const [selectedGRICategories, setSelectedGRICategories] = useState<Set<string>>(new Set());
  const [removedActivities, setRemovedActivities] = useState<Set<string>>(new Set());
  
  // Form data
  const [buFormData, setBUFormData] = useState({
    name: '',
    description: '',
    defaultYear: 2025,
    defaultCountry: 'United States',
    projectId: '',
    projectName: '',
    assignedUsers: [] as string[]
  });

  // Toggle BU expansion
  const toggleBUExpansion = (buId: string) => {
    const newExpanded = new Set(expandedBUs);
    if (newExpanded.has(buId)) {
      newExpanded.delete(buId);
    } else {
      newExpanded.add(buId);
    }
    setExpandedBUs(newExpanded);
  };

  // Reset forms
  const resetBUForm = () => {
    setBUFormData({
      name: '',
      description: '',
      defaultYear: 2025,
      defaultCountry: 'United States',
      projectId: '',
      projectName: '',
      assignedUsers: []
    });
    setSelectedActivities(new Set());
    setActivitySearchTerm('');
    setSelectedScope('all');
    setSelectedSource('all');
    setGRISearchTerm('');
    setExpandedGRIGroups(new Set());
    setExpandedGRICategories(new Set());
    setSelectedGRIGroups(new Set());
    setCreateStep(1);
    setSelectedGRICategories(new Set());
    setRemovedActivities(new Set());
  };

  // GRI selection handlers
  const handleGRIGroupToggle = (groupCode: string) => {
    const group = griStructure.find(g => g.code === groupCode);
    if (!group) return;

    const newSelectedGroups = new Set(selectedGRIGroups);
    const newSelectedCategories = new Set(selectedGRICategories);
    const newSelectedActivities = new Set(selectedActivities);

    if (newSelectedGroups.has(groupCode)) {
      // Unselect group and all its categories and activities
      newSelectedGroups.delete(groupCode);
      group.categories.forEach(cat => {
        newSelectedCategories.delete(cat.code);
        cat.activityIds.forEach(actId => newSelectedActivities.delete(actId));
      });
    } else {
      // Select group and all its categories and activities
      newSelectedGroups.add(groupCode);
      group.categories.forEach(cat => {
        newSelectedCategories.add(cat.code);
        cat.activityIds.forEach(actId => {
          if (!removedActivities.has(actId)) {
            newSelectedActivities.add(actId);
          }
        });
      });
    }

    setSelectedGRIGroups(newSelectedGroups);
    setSelectedGRICategories(newSelectedCategories);
    setSelectedActivities(newSelectedActivities);
  };

  const handleGRICategoryToggle = (groupCode: string, categoryCode: string) => {
    const group = griStructure.find(g => g.code === groupCode);
    const category = group?.categories.find(c => c.code === categoryCode);
    if (!category) return;

    const newSelectedCategories = new Set(selectedGRICategories);
    const newSelectedActivities = new Set(selectedActivities);
    const newSelectedGroups = new Set(selectedGRIGroups);

    if (newSelectedCategories.has(categoryCode)) {
      // Unselect category and its activities
      newSelectedCategories.delete(categoryCode);
      category.activityIds.forEach(actId => newSelectedActivities.delete(actId));
      
      // Unselect parent group if it was selected
      newSelectedGroups.delete(groupCode);
    } else {
      // Select category and its activities
      newSelectedCategories.add(categoryCode);
      category.activityIds.forEach(actId => {
        if (!removedActivities.has(actId)) {
          newSelectedActivities.add(actId);
        }
      });

      // Check if all categories in group are now selected
      const allCategoriesSelected = group?.categories.every(cat => 
        cat.code === categoryCode || newSelectedCategories.has(cat.code)
      );
      if (allCategoriesSelected) {
        newSelectedGroups.add(groupCode);
      }
    }

    setSelectedGRICategories(newSelectedCategories);
    setSelectedActivities(newSelectedActivities);
    setSelectedGRIGroups(newSelectedGroups);
  };

  const handleActivityToggle = (activityId: string, categoryCode: string, groupCode: string) => {
    const newSelectedActivities = new Set(selectedActivities);
    const newRemovedActivities = new Set(removedActivities);
    const newSelectedCategories = new Set(selectedGRICategories);
    const newSelectedGroups = new Set(selectedGRIGroups);

    if (newSelectedActivities.has(activityId)) {
      // Unselect activity
      newSelectedActivities.delete(activityId);
      newRemovedActivities.add(activityId);
      
      // Unselect parent category and group
      newSelectedCategories.delete(categoryCode);
      newSelectedGroups.delete(groupCode);
    } else {
      // Select activity
      newSelectedActivities.add(activityId);
      newRemovedActivities.delete(activityId);
    }

    setSelectedActivities(newSelectedActivities);
    setRemovedActivities(newRemovedActivities);
    setSelectedGRICategories(newSelectedCategories);
    setSelectedGRIGroups(newSelectedGroups);
  };

  // Filter GRI structure by search
  const filteredGRIStructure = griStructure.filter(group => {
    if (!griSearchTerm.trim()) return true;
    
    const searchLower = griSearchTerm.toLowerCase();
    const groupMatches = group.name.toLowerCase().includes(searchLower) ||
                        group.code.toLowerCase().includes(searchLower) ||
                        group.description.toLowerCase().includes(searchLower);
    
    const categoryMatches = group.categories.some(cat =>
      cat.name.toLowerCase().includes(searchLower) ||
      cat.code.toLowerCase().includes(searchLower) ||
      cat.description.toLowerCase().includes(searchLower)
    );

    return groupMatches || categoryMatches;
  });

  // Filter available activities
  const filteredAvailableActivities = mockAvailableActivities.filter(act => {
    const matchesSearch = activitySearchTerm === '' || 
      act.name.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
      act.uid.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
      (act.formulaName && act.formulaName.toLowerCase().includes(activitySearchTerm.toLowerCase()));
    
    const matchesScope = selectedScope === 'all' || act.scope === selectedScope;
    const matchesSource = selectedSource === 'all' || act.source === selectedSource;
    
    return matchesSearch && matchesScope && matchesSource;
  });

  // Create new BU
  const handleCreateBU = () => {
    if (!buFormData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Get selected activities from available activities
    const activitiesToAdd = mockAvailableActivities.filter(act => selectedActivities.has(act.id));

    const newBU: BusinessUnit = {
      id: `bu-${Date.now()}`,
      uid: `BU-${buFormData.name.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(businessUnits.length + 1).padStart(3, '0')}`,
      name: buFormData.name,
      description: buFormData.description,
      defaultYear: buFormData.defaultYear,
      defaultCountry: buFormData.defaultCountry,
      projectId: buFormData.projectId,
      projectName: buFormData.projectName,
      activities: activitiesToAdd, // Add selected activities during creation
      assignedUsers: buFormData.assignedUsers,
      status: 'draft',
      createdAt: new Date().toISOString(),
      createdBy: 'SA User'
    };

    setBusinessUnits([...businessUnits, newBU]);
    setIsCreateBUDialogOpen(false);
    setSelectedActivities(new Set());
    setActivitySearchTerm('');
    setSelectedScope('all');
    setSelectedSource('all');
    resetBUForm();
    
    const activityText = activitiesToAdd.length === 1 ? 'activity' : 'activities';
    const userText = buFormData.assignedUsers.length === 1 ? 'user' : 'users';
    toast.success(`Business Unit "${newBU.name}" created successfully`, {
      description: `${activitiesToAdd.length} ${activityText} and ${buFormData.assignedUsers.length} ${userText} assigned`
    });
  };

  // Update BU
  const handleUpdateBU = () => {
    if (!selectedBU) return;

    const updatedBU = {
      ...selectedBU,
      name: buFormData.name,
      description: buFormData.description,
      defaultYear: buFormData.defaultYear,
      defaultCountry: buFormData.defaultCountry,
      projectId: buFormData.projectId,
      projectName: buFormData.projectName,
      assignedUsers: buFormData.assignedUsers,
      updatedAt: new Date().toISOString(),
      updatedBy: 'SA User'
    };

    setBusinessUnits(businessUnits.map(bu => bu.id === selectedBU.id ? updatedBU : bu));
    setIsEditBUDialogOpen(false);
    setSelectedBU(null);
    resetBUForm();
    toast.success('Business Unit updated successfully');
  };

  // Delete BU
  const handleDeleteBU = (bu: BusinessUnit) => {
    if (window.confirm(`Are you sure you want to delete "${bu.name}"? This action cannot be undone and will remove all ${bu.activities.length} activities.`)) {
      setBusinessUnits(businessUnits.filter(b => b.id !== bu.id));
      toast.success(`Business Unit deleted successfully`);
    }
  };

  // Add Selected Activities to Business Unit
  const handleAddActivities = () => {
    if (!selectedBU || selectedActivities.size === 0) {
      toast.error('Please select at least one activity to add');
      return;
    }

    const activitiesToAdd = mockAvailableActivities.filter(act => selectedActivities.has(act.id));
    
    // Check for duplicates
    const existingActivityIds = new Set(selectedBU.activities.map(a => a.id));
    const newActivities = activitiesToAdd.filter(act => !existingActivityIds.has(act.id));
    
    if (newActivities.length === 0) {
      toast.error('All selected activities are already in this business unit');
      return;
    }

    const updatedBU = {
      ...selectedBU,
      activities: [...selectedBU.activities, ...newActivities],
      updatedAt: new Date().toISOString(),
      updatedBy: 'SA User'
    };

    setBusinessUnits(businessUnits.map(bu => bu.id === selectedBU.id ? updatedBU : bu));
    setIsAddActivityDialogOpen(false);
    setSelectedActivities(new Set());
    setActivitySearchTerm('');
    setSelectedScope('all');
    setSelectedSource('all');
    toast.success(`${newActivities.length} ${newActivities.length === 1 ? 'activity' : 'activities'} added successfully`);
  };



  // Delete Activity
  const handleDeleteActivity = (buId: string, activityId: string) => {
    const bu = businessUnits.find(b => b.id === buId);
    if (!bu) return;

    if (window.confirm('Are you sure you want to delete this activity?')) {
      const updatedBU = {
        ...bu,
        activities: bu.activities.filter(act => act.id !== activityId),
        updatedAt: new Date().toISOString(),
        updatedBy: 'SA User'
      };

      setBusinessUnits(businessUnits.map(b => b.id === buId ? updatedBU : b));
      toast.success('Activity deleted successfully');
    }
  };

  // Add GRI Groups to Business Unit
  const handleAddGRIGroups = (selectedGroups: Set<string>) => {
    if (!selectedBU || selectedGroups.size === 0) {
      toast.error('Please select at least one GRI group to add');
      return;
    }

    // Get all activities from selected GRI groups
    const activitiesToAdd: Activity[] = [];
    selectedGroups.forEach(groupCode => {
      const group = griStructure.find(g => g.code === groupCode);
      if (group) {
        group.categories.forEach(category => {
          category.activityIds.forEach(actId => {
            const activity = mockAvailableActivities.find(a => a.id === actId);
            if (activity) {
              activitiesToAdd.push(activity);
            }
          });
        });
      }
    });

    // Check for duplicates
    const existingActivityIds = new Set(selectedBU.activities.map(a => a.id));
    const newActivities = activitiesToAdd.filter(act => !existingActivityIds.has(act.id));
    
    if (newActivities.length === 0) {
      toast.error('All activities from selected groups are already in this business unit');
      return;
    }

    const updatedBU = {
      ...selectedBU,
      activities: [...selectedBU.activities, ...newActivities],
      updatedAt: new Date().toISOString(),
      updatedBy: 'SA User'
    };

    setBusinessUnits(businessUnits.map(bu => bu.id === selectedBU.id ? updatedBU : bu));
    setIsAddGRIGroupDialogOpen(false);
    toast.success(`${newActivities.length} ${newActivities.length === 1 ? 'activity' : 'activities'} added from ${selectedGroups.size} GRI ${selectedGroups.size === 1 ? 'group' : 'groups'}`);
  };

  // Remove GRI Group from Business Unit
  const handleRemoveGRIGroup = (buId: string, groupCode: string) => {
    const bu = businessUnits.find(b => b.id === buId);
    if (!bu) return;

    const group = griStructure.find(g => g.code === groupCode);
    if (!group) return;

    // Get all activity IDs from this group
    const activityIdsToRemove = new Set<string>();
    group.categories.forEach(category => {
      category.activityIds.forEach(actId => {
        activityIdsToRemove.add(actId);
      });
    });

    if (window.confirm(`Are you sure you want to remove all activities from "${group.name}"?`)) {
      const updatedBU = {
        ...bu,
        activities: bu.activities.filter(act => !activityIdsToRemove.has(act.id)),
        updatedAt: new Date().toISOString(),
        updatedBy: 'SA User'
      };

      setBusinessUnits(businessUnits.map(b => b.id === buId ? updatedBU : b));
      toast.success('GRI Group removed successfully');
    }
  };

  // Add GRI Categories to Business Unit
  const handleAddGRICategories = (selectedCategories: Set<string>) => {
    if (!selectedBU || selectedCategories.size === 0) {
      toast.error('Please select at least one GRI category to add');
      return;
    }

    // Get all activities from selected categories
    const activitiesToAdd: Activity[] = [];
    selectedCategories.forEach(categoryCode => {
      const group = griStructure.find(g => g.categories.some(cat => cat.code === categoryCode));
      if (group) {
        const category = group.categories.find(cat => cat.code === categoryCode);
        if (category) {
          category.activityIds.forEach(actId => {
            const activity = mockAvailableActivities.find(a => a.id === actId);
            if (activity) {
              activitiesToAdd.push(activity);
            }
          });
        }
      }
    });

    // Check for duplicates
    const existingActivityIds = new Set(selectedBU.activities.map(a => a.id));
    const newActivities = activitiesToAdd.filter(act => !existingActivityIds.has(act.id));
    
    if (newActivities.length === 0) {
      toast.error('All activities from selected categories are already in this business unit');
      return;
    }

    const updatedBU = {
      ...selectedBU,
      activities: [...selectedBU.activities, ...newActivities],
      updatedAt: new Date().toISOString(),
      updatedBy: 'SA User'
    };

    setBusinessUnits(businessUnits.map(bu => bu.id === selectedBU.id ? updatedBU : bu));
    setIsAddGRICategoryDialogOpen(false);
    toast.success(`${newActivities.length} ${newActivities.length === 1 ? 'activity' : 'activities'} added from ${selectedCategories.size} GRI ${selectedCategories.size === 1 ? 'category' : 'categories'}`);
  };

  // Remove GRI Category from Business Unit
  const handleRemoveGRICategory = (buId: string, categoryCode: string) => {
    const bu = businessUnits.find(b => b.id === buId);
    if (!bu) return;

    const group = griStructure.find(g => g.categories.some(cat => cat.code === categoryCode));
    if (!group) return;
    
    const category = group.categories.find(cat => cat.code === categoryCode);
    if (!category) return;

    if (window.confirm(`Are you sure you want to remove all activities from "${category.name}"?`)) {
      const updatedBU = {
        ...bu,
        activities: bu.activities.filter(act => 
          !act.grpCategories?.includes(categoryCode)
        ),
        updatedAt: new Date().toISOString(),
        updatedBy: 'SA User'
      };

      setBusinessUnits(businessUnits.map(b => b.id === buId ? updatedBU : b));
      toast.success('GRI Category removed successfully');
    }
  };

  // Add Activities to specific Category
  const handleAddCategoryActivities = (selectedActivityIds: Set<string>) => {
    if (!selectedBU || selectedActivityIds.size === 0) {
      toast.error('Please select at least one activity to add');
      return;
    }

    const activitiesToAdd = mockAvailableActivities.filter(act => selectedActivityIds.has(act.id));
    
    // Check for duplicates
    const existingActivityIds = new Set(selectedBU.activities.map(a => a.id));
    const newActivities = activitiesToAdd.filter(act => !existingActivityIds.has(act.id));
    
    if (newActivities.length === 0) {
      toast.error('All selected activities are already in this business unit');
      return;
    }

    const updatedBU = {
      ...selectedBU,
      activities: [...selectedBU.activities, ...newActivities],
      updatedAt: new Date().toISOString(),
      updatedBy: 'SA User'
    };

    setBusinessUnits(businessUnits.map(bu => bu.id === selectedBU.id ? updatedBU : bu));
    setIsAddCategoryActivityDialogOpen(false);
    toast.success(`${newActivities.length} ${newActivities.length === 1 ? 'activity' : 'activities'} added successfully`);
  };

  // Update EFs by time period
  // Filter business units
  const filteredBUs = businessUnits.filter(bu => {
    const matchesSearch = bu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bu.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bu.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || bu.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle opening the assign units dialog for an activity
  const handleAssignUnits = (activity: Activity) => {
    setSelectedActivityForUnits(activity);
    
    // Get the full activity details from allActivities
    const fullActivity = allActivities.find(a => a.uid === activity.uid);
    if (!fullActivity || !fullActivity.expressionId || !fullActivity.formulaUID) {
      toast.error('Activity does not have an expression assigned', {
        description: 'Please ensure the activity is linked to a formula expression in the Activities section'
      });
      return;
    }

    // Get variable parameters for this activity's expression
    const variableParams = getVariableParameters(fullActivity.formulaUID, fullActivity.expressionId);
    
    if (variableParams.length === 0) {
      toast.info('This activity has no variable parameters to configure', {
        description: 'All parameters are either constants or emission factors'
      });
      return;
    }

    // Initialize with default units from the expression parameters
    const initialUnits: Record<string, string> = {};
    variableParams.forEach(param => {
      initialUnits[param.id] = param.unit || '';
    });
    setActivityParameterUnits(initialUnits);
    
    setIsAssignUnitsDialogOpen(true);
  };

  // Handle saving unit assignments
  const handleSaveUnitAssignments = () => {
    // In a real system, you would save these assignments to the backend
    // For now, we'll just show a success message
    toast.success('Unit assignments saved successfully!', {
      description: `Updated ${Object.keys(activityParameterUnits).length} parameter units`
    });
    setIsAssignUnitsDialogOpen(false);
    setSelectedActivityForUnits(null);
    setActivityParameterUnits({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Business Units</h1>
            <p className="text-gray-600">Manage business unit templates and operational activities</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsCreateBUDialogOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Business Unit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total BUs</p>
                <p className="text-2xl font-semibold text-gray-900">{businessUnits.length}</p>
              </div>
              <Building className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active BUs</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {businessUnits.filter(bu => bu.status === 'active').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {businessUnits.reduce((sum, bu) => sum + bu.activities.length, 0)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft BUs</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {businessUnits.filter(bu => bu.status === 'draft').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search business units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Business Units Table */}
      <Card>
        <CardHeader>
          <CardTitle>Business Units ({filteredBUs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name / UID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Year / Country</TableHead>
                <TableHead>Activities</TableHead>
                <TableHead>Assigned Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBUs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No business units found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBUs.map(bu => (
                  <React.Fragment key={bu.id}>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBUExpansion(bu.id)}
                        >
                          {expandedBUs.has(bu.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{bu.name}</div>
                          <div className="text-sm text-gray-500">{bu.uid}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-gray-600">
                          {bu.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{bu.defaultYear}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Globe className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{bu.defaultCountry}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {bu.activities.length} activities
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Users className="h-3 w-3 mr-1" />
                          {bu.assignedUsers?.length || 0} users
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={bu.status === 'active' ? 'default' : 'secondary'}
                          className={
                            bu.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : bu.status === 'draft'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }
                        >
                          {bu.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBU(bu);
                              setBUFormData({
                                name: bu.name,
                                description: bu.description,
                                defaultYear: bu.defaultYear,
                                defaultCountry: bu.defaultCountry,
                                projectId: bu.projectId || '',
                                projectName: bu.projectName || '',
                                assignedUsers: bu.assignedUsers || []
                              });
                              setIsEditBUDialogOpen(true);
                            }}
                            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBU(bu)}
                            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Activities */}
                    {expandedBUs.has(bu.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-gray-50 p-6">
                          <div className="space-y-6">
                            {/* Assigned Users Section */}
                            {bu.assignedUsers && bu.assignedUsers.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border border-purple-200">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                                  <Users className="h-4 w-4 text-purple-600" />
                                  Assigned Customer Users ({bu.assignedUsers.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {bu.assignedUsers.map(userId => {
                                    const user = mockUsers.find(u => u.id === userId);
                                    if (!user) return null;
                                    return (
                                      <Badge key={userId} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                        {user.firstName} {user.lastName}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* Activities Section */}
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Activity Template ({bu.activities.length} activities)
                              </h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBU(bu);
                                  setIsAddGRIGroupDialogOpen(true);
                                }}
                                className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add GRI Group
                              </Button>
                            </div>

                            {bu.activities.length === 0 ? (
                              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed">
                                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No activities defined yet</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Group activities by GRI Group and Category */}
                                {(() => {
                                  // Build hierarchy: GRI Group -> GRI Category -> Activities
                                  const hierarchy = new Map<string, Map<string, typeof bu.activities>>();
                                  
                                  bu.activities.forEach(activity => {
                                    if (activity.grpCategories && activity.grpCategories.length > 0) {
                                      // Find the GRI category for this activity
                                      const categoryCode = activity.grpCategories[0];
                                      const griGroup = griStructure.find(g => 
                                        g.categories.some(cat => cat.code === categoryCode)
                                      );
                                      
                                      if (griGroup) {
                                        const category = griGroup.categories.find(cat => cat.code === categoryCode);
                                        if (category) {
                                          if (!hierarchy.has(griGroup.code)) {
                                            hierarchy.set(griGroup.code, new Map());
                                          }
                                          const groupMap = hierarchy.get(griGroup.code)!;
                                          if (!groupMap.has(category.code)) {
                                            groupMap.set(category.code, []);
                                          }
                                          groupMap.get(category.code)!.push(activity);
                                        }
                                      }
                                    }
                                  });

                                  // Render the hierarchy
                                  return Array.from(hierarchy.entries()).map(([groupCode, categoriesMap]) => {
                                    const griGroup = griStructure.find(g => g.code === groupCode);
                                    if (!griGroup) return null;

                                    return (
                                      <div key={groupCode} className="bg-white rounded-lg border overflow-hidden">
                                        {/* GRI Group Header */}
                                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-emerald-900 text-sm">
                                                {griGroup.name}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline" className="text-xs bg-white">
                                                {Array.from(categoriesMap.values()).reduce((sum, acts) => sum + acts.length, 0)} activities
                                              </Badge>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  setSelectedBU(bu);
                                                  setSelectedGRIGroupForCategory(groupCode);
                                                  setIsAddGRICategoryDialogOpen(true);
                                                }}
                                                className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Category
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRemoveGRIGroup(bu.id, groupCode)}
                                                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>

                                        {/* GRI Categories */}
                                        <div className="divide-y">
                                          {Array.from(categoriesMap.entries()).map(([categoryCode, activities]) => {
                                            const category = griGroup.categories.find(cat => cat.code === categoryCode);
                                            if (!category) return null;

                                            return (
                                              <div key={categoryCode} className="p-4">
                                                {/* Category Header */}
                                                <div className="flex items-center justify-between mb-3">
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                      <span className="font-mono text-emerald-600 text-sm">{category.code}</span>
                                                      <span className="text-gray-600 text-sm">- {category.name}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                                                      {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                                                    </Badge>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => {
                                                        setSelectedBU(bu);
                                                        setSelectedGRICategoryForActivity(categoryCode);
                                                        setIsAddCategoryActivityDialogOpen(true);
                                                      }}
                                                      className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                                    >
                                                      <Plus className="h-3 w-3 mr-1" />
                                                      Add
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => handleRemoveGRICategory(bu.id, categoryCode)}
                                                      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                </div>

                                                {/* Activities under Category */}
                                                <div className="space-y-2 pl-6 border-l-2 border-emerald-100">
                                                  {activities.map(activity => (
                                                    <div 
                                                      key={`${categoryCode}-${activity.id}`} 
                                                      className="bg-gray-50 rounded-lg border p-3 hover:bg-emerald-50 cursor-pointer transition-colors"
                                                      onClick={() => handleAssignUnits(activity)}
                                                    >
                                                      <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                          <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-medium text-sm">{activity.name}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                              Scope {activity.scope}
                                                            </Badge>
                                                            <Badge 
                                                              variant="outline" 
                                                              className={`text-xs ${
                                                                activity.source === 'master' 
                                                                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                                                              }`}
                                                            >
                                                              {activity.source === 'master' ? 'Master DB' : 'Client'}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                                                              <Settings className="h-3 w-3 mr-1" />
                                                              Configure Units
                                                            </Badge>
                                                          </div>
                                                          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                              <span className="text-gray-500">UID:</span>
                                                              <span>{activity.uid}</span>
                                                            </div>
                                                            {activity.formulaName && (
                                                              <div className="flex items-center gap-1">
                                                                <Calculator className="h-3 w-3" />
                                                                <span>{activity.formulaName}</span>
                                                              </div>
                                                            )}
                                                            {activity.country && (
                                                              <div className="flex items-center gap-1">
                                                                <Globe className="h-3 w-3" />
                                                                <span>{activity.country} ({activity.year})</span>
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                        <Button
                                                          variant="outline"
                                                          size="sm"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteActivity(bu.id, activity.id);
                                                          }}
                                                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 ml-4"
                                                        >
                                                          <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Business Unit Dialog */}
      <Dialog open={isCreateBUDialogOpen} onOpenChange={(open) => {
        setIsCreateBUDialogOpen(open);
        if (!open) {
          setCreateStep(1);
          resetBUForm();
        }
      }}>
        <DialogContent className="max-w-[90vw] lg:max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Create Business Unit - Step {createStep} of 3</DialogTitle>
            <DialogDescription>
              {createStep === 1 
                ? 'Create a new business unit and select activities from the Master DB and Client DB.' 
                : createStep === 2
                ? 'Assign input units for variable parameters in the selected activities.'
                : 'Assign customer users who will have access to this business unit.'}
            </DialogDescription>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex items-center gap-2 ${createStep >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${createStep >= 1 ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300'}`}>
                  {createStep > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
                </div>
                <span className="text-sm font-medium">BU Info & Activities</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200"></div>
              <div className={`flex items-center gap-2 ${createStep >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${createStep >= 2 ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300'}`}>
                  {createStep > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
                </div>
                <span className="text-sm font-medium">Assign Input Units</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200"></div>
              <div className={`flex items-center gap-2 ${createStep === 3 ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${createStep === 3 ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300'}`}>
                  3
                </div>
                <span className="text-sm font-medium">Assign Users</span>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Step 1: BU Info & Activity Template */}
            {createStep === 1 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bu-name">Business Unit Name *</Label>
                    <Input
                      id="bu-name"
                      placeholder="e.g., Manufacturing Plant - Asia Pacific"
                      value={buFormData.name}
                      onChange={(e) => setBUFormData({ ...buFormData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bu-country">Default Country *</Label>
                    <Select
                      value={buFormData.defaultCountry}
                      onValueChange={(value) => setBUFormData({ ...buFormData, defaultCountry: value })}
                    >
                      <SelectTrigger id="bu-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bu-description">Description</Label>
                  <Textarea
                    id="bu-description"
                    placeholder="Brief description of this business unit..."
                    value={buFormData.description}
                    onChange={(e) => setBUFormData({ ...buFormData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Select Activity Template</Label>
                  <p className="text-sm text-gray-600 mt-1 mb-3">
                    Select GRI groups, categories, and activities to add to this business unit. You can also add activities later.
                  </p>
                  
                  <GRIActivityTemplateSelector
                    griStructure={griStructure}
                    availableActivities={mockAvailableActivities}
                    selectedActivities={selectedActivities}
                    onActivitiesChange={setSelectedActivities}
                  />
                </div>
              </>
            )}

            {/* Step 2: Assign Input Units for Variable Parameters */}
            {createStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Assign Input Units for Variable Parameters</Label>
                  <p className="text-sm text-gray-600 mt-1 mb-3">
                    Review and assign input units for all variable parameters from ALL expressions in the selected activities. This ensures data consistency when customer users enter values.
                  </p>
                </div>

                {selectedActivities.size === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No Activities Selected</p>
                    <p className="text-sm mt-1">Please select activities in Step 1 to assign input units</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Array.from(selectedActivities).map(activityId => {
                      const activity = mockAvailableActivities.find(a => a.id === activityId);
                      if (!activity) return null;

                      const formula = activity.formulaUID 
                        ? getFormulaByUID(activity.formulaUID) 
                        : null;
                      
                      // Get ALL variable parameters from ALL expressions in the formula
                      const allVariableParams: Array<{
                        expressionId: string;
                        expressionName: string;
                        param: FormulaParameter;
                      }> = [];
                      
                      if (formula && formula.expressions && activity.formulaUID) {
                        formula.expressions.forEach(expression => {
                          const variableParams = getVariableParameters(activity.formulaUID!, expression.id);
                          variableParams.forEach(param => {
                            allVariableParams.push({
                              expressionId: expression.id,
                              expressionName: expression.name,
                              param: param
                            });
                          });
                        });
                      }

                      if (allVariableParams.length === 0) return null;

                      // Group parameters by expression
                      const paramsByExpression = new Map<string, Array<{ expressionName: string; param: FormulaParameter }>>();
                      allVariableParams.forEach(({ expressionId, expressionName, param }) => {
                        if (!paramsByExpression.has(expressionId)) {
                          paramsByExpression.set(expressionId, []);
                        }
                        paramsByExpression.get(expressionId)!.push({ expressionName, param });
                      });

                      return (
                        <div key={activityId} className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/30">
                          <div className="flex items-start gap-3 mb-3">
                            <Activity className="h-5 w-5 text-emerald-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-emerald-900">{activity.name}</h4>
                              <p className="text-xs text-emerald-700 mt-0.5">
                                {activity.grpCategories?.join(', ') || 'N/A'} • {allVariableParams.length} parameter{allVariableParams.length === 1 ? '' : 's'} across {paramsByExpression.size} expression{paramsByExpression.size === 1 ? '' : 's'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4 ml-8">
                            {Array.from(paramsByExpression.entries()).map(([expressionId, params]) => {
                              const expressionName = params[0].expressionName;
                              return (
                                <div key={expressionId} className="space-y-3">
                                  <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
                                    <Calculator className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm font-medium text-emerald-800">
                                      Expression: {expressionName}
                                    </span>
                                  </div>
                                  
                                  {params.map(({ param }) => {
                                    const currentUnit = bulkActivityUnits[activityId]?.[param.name] || '';
                                    
                                    // Get functional units from EF parameters in this expression
                                    const efParameters = activity.formulaUID 
                                      ? getEFParameters(activity.formulaUID, expressionId)
                                      : [];
                                    
                                    // Collect functional units from all emission factors referenced by ef_value parameters
                                    const functionalUnits = new Set<string>();
                                    efParameters.forEach(efParam => {
                                      if (efParam.efUID) {
                                        const ef = masterEFDefinitions.find(e => e.uid === efParam.efUID);
                                        if (ef && ef.coreDataRows) {
                                          ef.coreDataRows.forEach(row => {
                                            if (row.functionalUnit) {
                                              functionalUnits.add(row.functionalUnit);
                                            }
                                          });
                                        }
                                      }
                                    });
                                    
                                    // Add the parameter's default unit
                                    if (param.unit) {
                                      functionalUnits.add(param.unit);
                                    }
                                    
                                    // If no units found, use common fallback units
                                    if (functionalUnits.size === 0) {
                                      ['kg', 'kWh', 'L', 'm³', 'km', 'tonne', 'USD', 'unit', 'employees', 'days'].forEach(u => functionalUnits.add(u));
                                    }
                                    
                                    // Convert to array for rendering
                                    const availableUnits = Array.from(functionalUnits);
                                    
                                    return (
                                      <div key={`${expressionId}-${param.name}`} className="grid grid-cols-2 gap-3 items-center bg-white p-3 rounded border border-emerald-100">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">{param.name}</Label>
                                          {param.description && (
                                            <p className="text-xs text-gray-500 mt-0.5">{param.description}</p>
                                          )}
                                        </div>
                                        <div>
                                          <Select
                                            value={currentUnit}
                                            onValueChange={(value) => {
                                              setBulkActivityUnits(prev => ({
                                                ...prev,
                                                [activityId]: {
                                                  ...prev[activityId],
                                                  [param.name]: value
                                                }
                                              }));
                                            }}
                                          >
                                            <SelectTrigger className="border-emerald-200">
                                              <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {availableUnits.map(unit => (
                                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedActivities.size > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-sm text-teal-700">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Tip: All variable parameters from all expressions are shown. You can modify these unit assignments later for each activity individually.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Assign Customer Users */}
            {createStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Assign Customer Users</Label>
                  <p className="text-sm text-gray-600 mt-1 mb-3">
                    Select which customer users will have access to this business unit for data entry and reporting.
                  </p>
                </div>

                {/* Customer Users List */}
                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {mockUsers
                    .filter(user => user.role === 'Customer User' && user.status === 'Active')
                    .map(user => {
                      const isSelected = buFormData.assignedUsers.includes(user.id);
                      
                      return (
                        <div 
                          key={user.id} 
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${ 
                            isSelected ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setBUFormData({
                                  ...buFormData,
                                  assignedUsers: [...buFormData.assignedUsers, user.id]
                                });
                              } else {
                                setBUFormData({
                                  ...buFormData,
                                  assignedUsers: buFormData.assignedUsers.filter(id => id !== user.id)
                                });
                              }
                            }}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`user-${user.id}`} className="cursor-pointer font-medium flex items-center gap-2">
                              <Users className="h-4 w-4 text-emerald-600" />
                              <span>{user.firstName} {user.lastName}</span>
                            </Label>
                            <div className="text-sm text-gray-500 ml-6">
                              {user.email}
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                              Assigned
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  
                  {mockUsers.filter(user => user.role === 'Customer User' && user.status === 'Active').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active customer users found</p>
                      <p className="text-xs mt-1">Create customer users in Client Admin to assign them to business units</p>
                    </div>
                  )}
                </div>
                
                {buFormData.assignedUsers.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-sm text-emerald-700 font-medium">
                      ✓ {buFormData.assignedUsers.length} user{buFormData.assignedUsers.length === 1 ? '' : 's'} assigned
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            {createStep === 1 ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsCreateBUDialogOpen(false);
                  setSelectedActivities(new Set());
                  setActivitySearchTerm('');
                  setSelectedScope('all');
                  setSelectedSource('all');
                  setBulkActivityUnits({});
                  resetBUForm();
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (!buFormData.name) {
                      toast.error('Please enter a business unit name');
                      return;
                    }
                    setCreateStep(2);
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  Next: Assign Input Units
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : createStep === 2 ? (
              <>
                <Button variant="outline" onClick={() => setCreateStep(1)}>
                  <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                  Back
                </Button>
                <Button 
                  onClick={() => setCreateStep(3)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  Next: Assign Users
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCreateStep(2)}>
                  <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                  Back
                </Button>
                <Button 
                  onClick={handleCreateBU}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Business Unit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Business Unit Dialog */}
      <Dialog open={isEditBUDialogOpen} onOpenChange={setIsEditBUDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Business Unit</DialogTitle>
            <DialogDescription>
              Update business unit details, default settings, and assigned users
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              <div>
                <Label htmlFor="edit-bu-name">Business Unit Name *</Label>
                <Input
                  id="edit-bu-name"
                  value={buFormData.name}
                  onChange={(e) => setBUFormData({ ...buFormData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-bu-description">Description</Label>
                <Textarea
                  id="edit-bu-description"
                  value={buFormData.description}
                  onChange={(e) => setBUFormData({ ...buFormData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-bu-country">Default Country</Label>
                <Select
                  value={buFormData.defaultCountry}
                  onValueChange={(value) => setBUFormData({ ...buFormData, defaultCountry: value })}
                >
                  <SelectTrigger id="edit-bu-country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Note</p>
                    <p>Changing default settings here won't automatically update existing activities. Use "Update by Time Period" to bulk update all activities.</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Assigned Users Section */}
              <div className="space-y-3">
                <div>
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    Assigned Customer Users
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Select which customer users will have access to this business unit for data entry and reporting.
                  </p>
                </div>

                {/* Customer Users List */}
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {mockUsers
                    .filter(user => user.role === 'Customer User' && user.status === 'Active')
                    .length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active customer users found</p>
                      <p className="text-xs mt-1">Create customer users in Client Admin to assign them to business units</p>
                    </div>
                  ) : (
                    mockUsers
                      .filter(user => user.role === 'Customer User' && user.status === 'Active')
                      .map(user => {
                        const isSelected = buFormData.assignedUsers.includes(user.id);
                        
                        return (
                          <div 
                            key={user.id} 
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${ 
                              isSelected ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <Checkbox
                              id={`edit-user-${user.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setBUFormData({
                                    ...buFormData,
                                    assignedUsers: [...buFormData.assignedUsers, user.id]
                                  });
                                } else {
                                  setBUFormData({
                                    ...buFormData,
                                    assignedUsers: buFormData.assignedUsers.filter(id => id !== user.id)
                                  });
                                }
                              }}
                            />
                            <div className="flex-1">
                              <Label htmlFor={`edit-user-${user.id}`} className="cursor-pointer font-medium flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-600" />
                                <span>{user.firstName} {user.lastName}</span>
                              </Label>
                              <div className="text-sm text-gray-500 ml-6">
                                {user.email}
                              </div>
                            </div>
                            {isSelected && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                Assigned
                              </Badge>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>

                {/* Summary */}
                {buFormData.assignedUsers.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800">
                      <strong>{buFormData.assignedUsers.length}</strong> customer user{buFormData.assignedUsers.length !== 1 ? 's' : ''} assigned
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditBUDialogOpen(false);
              setSelectedBU(null);
              resetBUForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBU}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Activities Dialog - Select from Available Activities */}
      <Dialog open={isAddActivityDialogOpen} onOpenChange={setIsAddActivityDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Activities to {selectedBU?.name}</DialogTitle>
            <DialogDescription>
              Select activities from Master DB and Client DB to add to this business unit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Filters */}
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={activitySearchTerm}
                  onChange={(e) => setActivitySearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={selectedScope} onValueChange={setSelectedScope}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  <SelectItem value="1">Scope 1</SelectItem>
                  <SelectItem value="2">Scope 2</SelectItem>
                  <SelectItem value="3">Scope 3</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="master">Master DB</SelectItem>
                  <SelectItem value="client">Client DB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity List */}
            <ScrollArea className="flex-1 border rounded-lg">
              <div className="p-4 space-y-2">
                {filteredAvailableActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No activities found</p>
                  </div>
                ) : (
                  filteredAvailableActivities.map((activity) => {
                    const isSelected = selectedActivities.has(activity.id);
                    const isAlreadyAdded = selectedBU?.activities.some(a => a.id === activity.id);
                    
                    return (
                      <div
                        key={activity.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-300' 
                            : isAlreadyAdded
                            ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (isAlreadyAdded) return;
                          const newSelected = new Set(selectedActivities);
                          if (isSelected) {
                            newSelected.delete(activity.id);
                          } else {
                            newSelected.add(activity.id);
                          }
                          setSelectedActivities(newSelected);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            disabled={isAlreadyAdded}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{activity.name}</span>
                              <Badge variant="outline" className="text-xs">
                                Scope {activity.scope}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  activity.source === 'master' 
                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {activity.source === 'master' ? 'Master DB' : 'Client'}
                              </Badge>
                              {isAlreadyAdded && (
                                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                                  Already Added
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">UID:</span>
                                <span>{activity.uid}</span>
                              </div>
                              {activity.formulaName && (
                                <div className="flex items-center gap-1">
                                  <Calculator className="h-3 w-3" />
                                  <span>{activity.formulaName}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                <span>{activity.country}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{activity.year}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Selection Summary */}
            {selectedActivities.size > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-sm text-emerald-800">
                  <strong>{selectedActivities.size}</strong> {selectedActivities.size === 1 ? 'activity' : 'activities'} selected
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddActivityDialogOpen(false);
                setSelectedActivities(new Set());
                setActivitySearchTerm('');
                setSelectedScope('all');
                setSelectedSource('all');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddActivities}
              disabled={selectedActivities.size === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {selectedActivities.size > 0 ? `(${selectedActivities.size})` : ''} Activities
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add GRI Groups Dialog */}
      <Dialog open={isAddGRIGroupDialogOpen} onOpenChange={setIsAddGRIGroupDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add GRI Groups to Business Unit</DialogTitle>
            <DialogDescription>
              Select GRI groups to add all their activities to the business unit
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3">
              {griStructure.map(group => {
                // Count total activities in this group
                const totalActivities = group.categories.reduce((sum, cat) => sum + cat.activityIds.length, 0);
                // Check if already in BU
                const existingActivities = selectedBU?.activities.filter(act => {
                  const categoryCode = act.grpCategories?.[0];
                  return group.categories.some(cat => cat.code === categoryCode);
                }).length || 0;

                return (
                  <div key={group.code} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{group.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {totalActivities} activities
                          </Badge>
                          {existingActivities > 0 && (
                            <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                              {existingActivities} already added
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{group.description}</p>
                        <div className="mt-2 text-xs text-gray-600">
                          {group.categories.length} {group.categories.length === 1 ? 'category' : 'categories'}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleAddGRIGroups(new Set([group.code]));
                        }}
                        className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 ml-4"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Group
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddGRIGroupDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add GRI Categories Dialog */}
      <Dialog open={isAddGRICategoryDialogOpen} onOpenChange={setIsAddGRICategoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add GRI Categories</DialogTitle>
            <DialogDescription>
              Select GRI categories to add all their activities to the business unit
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3">
              {(() => {
                const group = griStructure.find(g => g.code === selectedGRIGroupForCategory);
                if (!group) return <p className="text-sm text-gray-500">No group selected</p>;

                return (
                  <>
                    <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-sm font-medium text-emerald-900">{group.name}</p>
                      <p className="text-xs text-emerald-700 mt-1">{group.description}</p>
                    </div>
                    {group.categories.map(category => {
                      const existingActivities = selectedBU?.activities.filter(act => 
                        act.grpCategories?.includes(category.code)
                      ).length || 0;

                      return (
                        <div key={category.code} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-emerald-600 text-sm">{category.code}</span>
                                <span className="text-gray-600 text-sm">- {category.name}</span>
                              </div>
                              <p className="text-xs text-gray-500 mb-2">{category.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {category.activityIds.length} activities
                                </Badge>
                                {existingActivities > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                                    {existingActivities} already added
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                handleAddGRICategories(new Set([category.code]));
                              }}
                              className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 ml-4"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Category
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddGRICategoryDialogOpen(false);
                setSelectedGRIGroupForCategory(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Activities under Category Dialog */}
      <Dialog open={isAddCategoryActivityDialogOpen} onOpenChange={setIsAddCategoryActivityDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Activities to Category</DialogTitle>
            <DialogDescription>
              Select activities under this category to add to the business unit
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3">
              {(() => {
                const group = griStructure.find(g => 
                  g.categories.some(cat => cat.code === selectedGRICategoryForActivity)
                );
                const category = group?.categories.find(cat => cat.code === selectedGRICategoryForActivity);
                
                if (!category) return <p className="text-sm text-gray-500">No category selected</p>;

                // Get available activities for this category
                const availableActivities = mockAvailableActivities.filter(act =>
                  category.activityIds.includes(act.id)
                );

                return (
                  <>
                    <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-emerald-600 text-sm">{category.code}</span>
                        <span className="text-gray-600 text-sm">- {category.name}</span>
                      </div>
                      <p className="text-xs text-emerald-700">{category.description}</p>
                    </div>
                    
                    {availableActivities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No activities available in this category</p>
                      </div>
                    ) : (
                      availableActivities.map(activity => {
                        const isAlreadyAdded = selectedBU?.activities.some(a => a.id === activity.id) || false;

                        return (
                          <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-sm">{activity.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    Scope {activity.scope}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      activity.source === 'master' 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                    }`}
                                  >
                                    {activity.source === 'master' ? 'Master DB' : 'Client'}
                                  </Badge>
                                  {isAlreadyAdded && (
                                    <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                                      Already added
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600 space-y-0.5">
                                  <div>UID: {activity.uid}</div>
                                  {activity.formulaName && <div>Formula: {activity.formulaName}</div>}
                                  <div>{activity.country} ({activity.year})</div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  handleAddCategoryActivities(new Set([activity.id]));
                                }}
                                disabled={isAlreadyAdded}
                                className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 ml-4"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                );
              })()}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddCategoryActivityDialogOpen(false);
                setSelectedGRICategoryForActivity(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Units Dialog */}
      <AssignUnitsDialog
        isOpen={isAssignUnitsDialogOpen}
        onClose={() => {
          setIsAssignUnitsDialogOpen(false);
          setSelectedActivityForUnits(null);
          setActivityParameterUnits({});
        }}
        activity={selectedActivityForUnits}
        onSave={handleSaveUnitAssignments}
      />

    </div>
  );
}
