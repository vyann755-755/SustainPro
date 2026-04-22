/**
 * Centralized Business Units Data
 * 
 * This file provides synchronized business unit data for:
 * - Sustainability Architect role (assignment and management)
 * - Customer User role (data input and submission)
 * 
 * All activities reference the centralized activitiesData.ts
 */

import { allActivities, type ActivityDefinition } from '../components/sa/activitiesData';

// Helper function to get activity from centralized data by UID and add BU-specific context
export const getActivity = (uid: string, country: string, year: number) => {
  const baseActivity = allActivities.find(a => a.uid === uid);
  if (!baseActivity) return null;
  
  // Determine scope from GRP categories
  let scope: '1' | '2' | '3' = '1';
  if (baseActivity.grpCategories && baseActivity.grpCategories.length > 0) {
    const firstCategory = baseActivity.grpCategories[0];
    if (firstCategory.startsWith('305.1')) scope = '1';
    else if (firstCategory.startsWith('305.2')) scope = '2';
    else if (firstCategory.startsWith('305.3')) scope = '3';
  }
  
  return {
    ...baseActivity,
    country,
    year,
    scope
  };
};

export interface BusinessUnitActivity extends ActivityDefinition {
  country: string;
  year: number;
  scope: '1' | '2' | '3';
  category?: string;
}

export interface BusinessUnit {
  id: string;
  uid: string;
  name: string;
  description: string;
  projectId?: string;
  projectName?: string;
  defaultYear: number;
  defaultCountry: string;
  activities: BusinessUnitActivity[];
  assignedUsers?: string[]; // User IDs assigned to this BU
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Centralized Business Units Data
 * 
 * IMPORTANT: All activities use getActivity() which fetches from activitiesData.ts
 * This ensures:
 * 1. Activities in SA's Activities section match those in Business Units
 * 2. Customer Users see the exact same activities with proper formula/expression data
 * 3. No data duplication or inconsistency
 */
export const businessUnitsData: BusinessUnit[] = [
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
    assignedUsers: ['3', '7', '9'], // Customer user IDs
    activities: [
      getActivity('ACT-2024-0001', 'United States', 2025)!, // Stationary Combustion
      getActivity('ACT-2024-0002', 'United States', 2025)!, // Mobile Combustion
      getActivity('ACT-2024-0003', 'United States', 2025)!, // Fugitive Emissions
      getActivity('ACT-2024-0008', 'United States', 2025)!, // Electricity Location-based
      getActivity('ACT-2024-0009', 'United States', 2025)!, // Electricity Market-based
      getActivity('ACT-2024-0031', 'United States', 2025)!, // Purchased goods
      getActivity('ACT-2024-0032', 'United States', 2025)!, // Capital goods
    ].filter(Boolean) as BusinessUnitActivity[],
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'sa_user'
  },
  {
    id: 'bu-2',
    uid: 'BU-WHS-2025-002',
    name: 'Distribution Warehouse - East Coast',
    description: 'Regional distribution center serving East Coast markets',
    projectId: 'proj-1',
    projectName: 'Q1 2025 Carbon Assessment',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['5', '8'],
    activities: [
      getActivity('ACT-2024-0008', 'United States', 2025)!, // Electricity Location-based
      getActivity('ACT-2024-0009', 'United States', 2025)!, // Electricity Market-based
      getActivity('ACT-2024-0034', 'United States', 2025)!, // Upstream transportation
      getActivity('ACT-2024-0036', 'United States', 2025)!, // Business travel
      getActivity('ACT-2024-0037', 'United States', 2025)!, // Employee commuting
    ].filter(Boolean) as BusinessUnitActivity[],
    createdAt: '2024-01-16T11:00:00Z',
    createdBy: 'sa_user'
  },
  {
    id: 'bu-3',
    uid: 'BU-OFF-2025-003',
    name: 'Corporate Office - HQ',
    description: 'Corporate headquarters and administrative functions',
    projectId: 'proj-1',
    projectName: 'Q1 2025 Carbon Assessment',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['4', '6'],
    activities: [
      getActivity('ACT-2024-0008', 'United States', 2025)!, // Electricity Location-based
      getActivity('ACT-2024-0036', 'United States', 2025)!, // Business travel
      getActivity('ACT-2024-0037', 'United States', 2025)!, // Employee commuting
      getActivity('ACT-2024-0031', 'United States', 2025)!, // Purchased goods
    ].filter(Boolean) as BusinessUnitActivity[],
    createdAt: '2024-01-17T09:00:00Z',
    createdBy: 'sa_user'
  },
  {
    id: 'bu-4',
    uid: 'BU-RET-2025-004',
    name: 'Retail Operations - Southwest',
    description: 'Retail store operations in Southwest region',
    projectId: 'proj-2',
    projectName: 'Annual Sustainability Report 2025',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['10'],
    activities: [
      getActivity('ACT-2024-0008', 'United States', 2025)!, // Electricity Location-based
      getActivity('ACT-2024-0001', 'United States', 2025)!, // Stationary Combustion
      getActivity('ACT-2024-0037', 'United States', 2025)!, // Employee commuting
    ].filter(Boolean) as BusinessUnitActivity[],
    createdAt: '2024-01-18T14:00:00Z',
    createdBy: 'sa_user'
  },
  {
    id: 'bu-5',
    uid: 'BU-LOG-2025-005',
    name: 'Logistics Hub - Central',
    description: 'Central logistics and transportation coordination center',
    projectId: 'proj-2',
    projectName: 'Annual Sustainability Report 2025',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['11'],
    activities: [
      getActivity('ACT-2024-0002', 'United States', 2025)!, // Mobile Combustion
      getActivity('ACT-2024-0034', 'United States', 2025)!, // Upstream transportation
      getActivity('ACT-2024-0008', 'United States', 2025)!, // Electricity Location-based
    ].filter(Boolean) as BusinessUnitActivity[],
    createdAt: '2024-01-19T10:30:00Z',
    createdBy: 'sa_user'
  },
  {
    id: 'bu-6',
    uid: 'BU-RND-2025-006',
    name: 'R&D Center - Innovation Campus',
    description: 'Research and development facility',
    projectId: 'proj-2',
    projectName: 'Annual Sustainability Report 2025',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['12'],
    activities: [
      getActivity('ACT-2024-0008', 'United States', 2025)!, // Electricity Location-based
      getActivity('ACT-2024-0009', 'United States', 2025)!, // Electricity Market-based
      getActivity('ACT-2024-0001', 'United States', 2025)!, // Stationary Combustion
      getActivity('ACT-2024-0032', 'United States', 2025)!, // Capital goods
    ].filter(Boolean) as BusinessUnitActivity[],
    createdAt: '2024-01-20T08:45:00Z',
    createdBy: 'sa_user'
  }
];

/**
 * Project Data (referenced by Business Units)
 */
export interface Project {
  id: string;
  name: string;
  type: 'BCA' | 'LCA';
  status: 'draft' | 'in-progress' | 'completed' | 'active';
  description?: string;
  deadline?: string;
  createdAt: string;
  createdBy: string;
}

export const projectsData: Project[] = [
  {
    id: 'proj-1',
    name: 'Q1 2025 Carbon Assessment',
    type: 'BCA',
    status: 'in-progress',
    description: 'Quarterly carbon footprint assessment for Q1 2025',
    deadline: '2025-04-15',
    createdAt: '2024-12-01T09:00:00Z',
    createdBy: 'sa_user'
  },
  {
    id: 'proj-2',
    name: 'Annual Sustainability Report 2025',
    type: 'BCA',
    status: 'in-progress',
    description: 'Comprehensive annual sustainability and carbon accounting report',
    deadline: '2025-12-31',
    createdAt: '2024-11-15T10:00:00Z',
    createdBy: 'sa_user'
  }
];
