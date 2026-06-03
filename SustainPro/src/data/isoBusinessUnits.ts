/**
 * ISO 14064-1 Business Units + Project — merge-in for businessUnitsData.ts
 * =======================================================================
 *
 * The three BUs the SA assigns to the "FY2025 ISO 14064-1 Inventory" project,
 * plus the project record itself. The patched `businessUnitsData.ts` imports
 * these and folds them into the single sources of truth:
 *
 *   import { isoBusinessUnits, isoProject } from './isoBusinessUnits';
 *   businessUnitsData.push(...isoBusinessUnits);
 *   projectsData.push(isoProject);
 *
 * ISO activities live in `isoActivitiesData.ts`; this file attaches them to
 * the BUs with the BU-specific country/year/scope context, mirroring the
 * `getActivity()` pattern used for GRI BUs.
 */

import { isoActivities, type FrameworkActivityDefinition } from '../components/sa/isoActivitiesData';
import type { BusinessUnit, BusinessUnitActivity, Project } from './businessUnitsData';

/** Fixed UUID — matches seed-supabase-iso.sql and seedISOActivitySubmissions.ts. */
export const PROJ_ISO_UUID = 'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90';

// ISO category 1 → "Scope 1"-equivalent (direct), 2 → energy, 3–6 → other indirect.
const scopeFromISO = (iso?: string[]): '1' | '2' | '3' => {
  const cat = (iso && iso[0]) ? iso[0].split('.')[0] : '1';
  if (cat === '1') return '1';
  if (cat === '2') return '2';
  return '3';
};

/** Attach BU context to an ISO activity by UID (parallels getActivity). */
const getISOActivity = (uid: string, country: string, year: number): BusinessUnitActivity | null => {
  const base: FrameworkActivityDefinition | undefined = isoActivities.find((a) => a.uid === uid);
  if (!base) return null;
  return { ...base, country, year, scope: scopeFromISO(base.isoCategories) } as BusinessUnitActivity;
};

export const isoProject: Project = {
  id: PROJ_ISO_UUID,
  name: 'FY2025 ISO 14064-1 Inventory',
  type: 'BCA',
  status: 'in-progress',
  description: 'Organizational GHG inventory under ISO 14064-1:2018 (Categories 1–6).',
  deadline: '2025-06-30',
  createdAt: '2025-01-06T09:00:00Z',
  createdBy: 'sa_user',
};

export const isoBusinessUnits: BusinessUnit[] = [
  {
    id: 'iso-bu-1',
    uid: 'BU-PRD-2025-001',
    name: 'Production Plant - Texas',
    description: 'Primary production facility — boilers, fleet, and process lines.',
    projectId: PROJ_ISO_UUID,
    projectName: 'FY2025 ISO 14064-1 Inventory',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['3', '7'],
    activities: [
      getISOActivity('ACT-ISO-2025-0101', 'United States', 2025)!, // 1.1 Stationary
      getISOActivity('ACT-ISO-2025-0102', 'United States', 2025)!, // 1.2 Mobile
      getISOActivity('ACT-ISO-2025-0103', 'United States', 2025)!, // 1.3 Process
      getISOActivity('ACT-ISO-2025-0104', 'United States', 2025)!, // 1.4 Fugitive
      getISOActivity('ACT-ISO-2025-0201', 'United States', 2025)!, // 2.1 Electricity
      getISOActivity('ACT-ISO-2025-0202', 'United States', 2025)!, // 2.2 Steam
      getISOActivity('ACT-ISO-2025-0401', 'United States', 2025)!, // 4.1 Purchased goods
      getISOActivity('ACT-ISO-2025-0402', 'United States', 2025)!, // 4.2 Capital goods
      getISOActivity('ACT-ISO-2025-0403', 'United States', 2025)!, // 4.3 Waste
    ].filter(Boolean) as BusinessUnitActivity[],
    createdAt: '2025-01-06T10:00:00Z',
    createdBy: 'sa_user',
  },
  {
    id: 'iso-bu-2',
    uid: 'BU-DST-2025-002',
    name: 'Cold Storage & Distribution - Ohio',
    description: 'Refrigerated distribution center and inbound freight.',
    projectId: PROJ_ISO_UUID,
    projectName: 'FY2025 ISO 14064-1 Inventory',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['5', '8'],
    activities: [
      getISOActivity('ACT-ISO-2025-0112', 'United States', 2025)!, // 1.2 Refrigerated trucks
      getISOActivity('ACT-ISO-2025-0201', 'United States', 2025)!, // 2.1 Electricity
      getISOActivity('ACT-ISO-2025-0301', 'United States', 2025)!, // 3.1 Upstream transport
      getISOActivity('ACT-ISO-2025-0403', 'United States', 2025)!, // 4.3 Waste
    ].filter(Boolean) as BusinessUnitActivity[],
    createdAt: '2025-01-06T10:30:00Z',
    createdBy: 'sa_user',
  },
  {
    id: 'iso-bu-3',
    uid: 'BU-HQ-2025-003',
    name: 'Head Office & Sales - Illinois',
    description: 'Corporate office, sales fleet, and product stewardship.',
    projectId: PROJ_ISO_UUID,
    projectName: 'FY2025 ISO 14064-1 Inventory',
    defaultYear: 2025,
    defaultCountry: 'United States',
    status: 'active',
    assignedUsers: ['4', '6'],
    activities: [
      getISOActivity('ACT-ISO-2025-0201', 'United States', 2025)!, // 2.1 Electricity
      getISOActivity('ACT-ISO-2025-0303', 'United States', 2025)!, // 3.3 Commuting
      getISOActivity('ACT-ISO-2025-0305', 'United States', 2025)!, // 3.5 Business travel
      getISOActivity('ACT-ISO-2025-0501', 'United States', 2025)!, // 5.1 Use of products
      getISOActivity('ACT-ISO-2025-0503', 'United States', 2025)!, // 5.3 End-of-life
      getISOActivity('ACT-ISO-2025-0601', 'United States', 2025)!, // 6.1 Other indirect
    ].filter(Boolean) as BusinessUnitActivity[],
    createdAt: '2025-01-06T11:00:00Z',
    createdBy: 'sa_user',
  },
];
