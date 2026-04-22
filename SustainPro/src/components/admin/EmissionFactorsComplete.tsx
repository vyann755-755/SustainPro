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
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { 
  Plus, 
  Upload, 
  Search, 
  Edit, 
  Trash2,
  Database,
  Sparkles,
  Copy,
  Globe,
  Calendar as CalendarIcon,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useMasterDB } from '../../contexts/MasterDBContext';
import { format } from 'date-fns';

// Interfaces
interface CoreDataRow {
  id: string;
  uid: string; // Auto-generated unique identifier for the data row
  parentEFUID: string;
  value: number;
  impactCategory: string;
  impactUnit: string;
  functionalUnit: string[]; // Changed to array to support multiple functional units
  referenceName: string;
  referenceURL?: string;
  country: string;
  region: string;
  referenceDate: Date | string;
  createdAt: string;
  createdBy: string;
}

interface EFDefinition {
  id: string;
  uid: string;
  name: string;
  ipccCategory: string;
  tags: string[];
  flexibleAttributes?: Record<string, any>;
  status: 'draft' | 'active' | 'archived';
  database: string;
  createdBy: string;
  createdAt: string;
  coreDataRows: CoreDataRow[];
  updatedAt?: string;
  updatedBy?: string;
}

// Constants
const countries = [
  'Global', 'United States', 'United Kingdom', 'Germany', 'France', 'Canada', 
  'Australia', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'South Korea', 
  'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland'
];

const countryToRegion: Record<string, string> = {
  'Global': 'Global',
  'United States': 'North America',
  'Canada': 'North America',
  'Mexico': 'North America',
  'United Kingdom': 'Europe',
  'Germany': 'Europe',
  'France': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Netherlands': 'Europe',
  'Sweden': 'Europe',
  'Norway': 'Europe',
  'Denmark': 'Europe',
  'Switzerland': 'Europe',
  'Australia': 'Oceania',
  'Japan': 'Asia',
  'China': 'Asia',
  'India': 'Asia',
  'South Korea': 'Asia',
  'Brazil': 'Latin America',
};

const ipccCategories = [
  'Energy',
  'Industrial Processes and Product Use (IPPU)',
  'Agriculture, Forestry and Other Land Use (AFOLU)',
  'Waste',
  'Other'
];

// Impact Category to Unit Mapping
const impactCategoryUnitMapping: Record<string, string> = {
  'Climate Change - total (GWP)': 'kgCO2 eq',
  'Climate Change - CO2 (CO2)': 'kgCO2',
  'Climate Change - CH4 (CH4)': 'kgCH4',
  'Climate Change - N2O (N2O)': 'kgN2O',
  'Energy (ENERGY)': 'kJ',
  'Water (WATER)': 'm3',
  'Waste (WASTE)': 'kg'
};

const impactCategories = [
  'Climate Change - total (GWP)',
  'Climate Change - CO2 (CO2)',
  'Climate Change - CH4 (CH4)',
  'Climate Change - N2O (N2O)',
  'Energy (ENERGY)',
  'Water (WATER)',
  'Waste (WASTE)'
];

const functionalUnits = [
  'kg',
  'tonne',
  'kWh',
  'MJ',
  'GJ',
  'L',
  'm³',
  'tkm',
  'pkm',
  'unit',
  'm²',
  'piece'
];

const impactUnits = [
  'kg CO2e',
  'kg CO2e/kWh',
  'kg CO2e/MJ',
  'kg CO2e/kg',
  'kg CO2e/L',
  'kg CO2e/m³',
  'kg CO2e/tkm',
  'kg CO2e/unit',
  'kg SO2e',
  'kg PO4e',
  'kg CFC-11e',
  'kg C2H4e'
];

// Helper functions
const generateEFUID = (category: string, sequence: number): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  return `EF-${categoryCode}-${year}-${sequence.toString().padStart(4, '0')}`;
};

const generateDataRowUID = (parentEFUID: string, sequence: number): string => {
  // Extract the EF UID and append data row sequence
  // Format: DR-[Parent EF UID]-[Sequence]
  return `DR-${parentEFUID}-${sequence.toString().padStart(3, '0')}`;
};

// Mock Data
const mockEFDefinitions: EFDefinition[] = [
  {
    id: '1',
    uid: 'EF-ENE-2024-0001',
    name: 'National Grid Electricity Mix - United States',
    ipccCategory: 'Energy',
    functionalUnit: 'kWh',
    tags: ['electricity', 'grid', 'scope-2', 'renewable'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    flexibleAttributes: {
      'Data Quality': 'High',
      'Verification Status': 'Verified',
      'Update Frequency': 'Annual'
    },
    coreDataRows: [
      {
        id: 'row1a',
        uid: 'DR-EF-ENE-2024-0001-001',
        parentEFUID: 'EF-ENE-2024-0001',
        value: 0.4156,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2e',
        functionalUnit: ['kWh'],
        referenceName: 'EPA eGRID 2023',
        referenceURL: 'https://www.epa.gov/egrid',
        country: 'United States',
        region: 'North America',
        referenceDate: '2024-02-15',
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row1b',
        uid: 'DR-EF-ENE-2024-0001-002',
        parentEFUID: 'EF-ENE-2024-0001',
        value: 9850,
        impactCategory: 'Energy (ENERGY)',
        impactUnit: 'kJ',
        functionalUnit: ['kWh', 'MJ'],
        referenceName: 'IEA Energy Statistics 2023',
        referenceURL: 'https://www.iea.org/',
        country: 'United States',
        region: 'North America',
        referenceDate: '2024-02-15',
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row1c',
        uid: 'DR-EF-ENE-2024-0001-003',
        parentEFUID: 'EF-ENE-2024-0001',
        value: 1.89,
        impactCategory: 'Water (WATER)',
        impactUnit: 'm3',
        functionalUnit: ['kWh'],
        referenceName: 'USGS Water Use 2023',
        referenceURL: 'https://www.usgs.gov/',
        country: 'United States',
        region: 'North America',
        referenceDate: '2024-03-01',
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row1d',
        uid: 'DR-EF-ENE-2024-0001-004',
        parentEFUID: 'EF-ENE-2024-0001',
        value: 0.0125,
        impactCategory: 'Waste (WASTE)',
        impactUnit: 'kg',
        functionalUnit: ['kWh', 'kg'],
        referenceName: 'EPA Waste Database 2023',
        referenceURL: 'https://www.epa.gov/',
        country: 'United States',
        region: 'North America',
        referenceDate: '2024-02-20',
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '2',
    uid: 'EF-ENE-2024-0002',
    name: 'Industrial Natural Gas Combustion',
    ipccCategory: 'Energy',
    functionalUnit: 'm³',
    tags: ['natural-gas', 'combustion', 'scope-1', 'fossil-fuel'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-10T08:30:00Z',
    flexibleAttributes: {
      'Source Type': 'Primary',
      'Data Quality': 'High'
    },
    coreDataRows: [
      {
        id: 'row2a',
        uid: 'DR-EF-ENE-2024-0002-001',
        parentEFUID: 'EF-ENE-2024-0002',
        value: 1.9867,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2e',
        functionalUnit: ['m³'],
        referenceName: 'IPCC 2006 Guidelines',
        referenceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-01-10',
        createdAt: '2024-01-10T08:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row2b',
        uid: 'DR-EF-ENE-2024-0002-002',
        parentEFUID: 'EF-ENE-2024-0002',
        value: 1.825,
        impactCategory: 'Climate Change - CO2 (CO2)',
        impactUnit: 'kgCO2',
        functionalUnit: ['m³'],
        referenceName: 'IPCC 2006 Guidelines',
        referenceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-01-10',
        createdAt: '2024-01-10T08:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row2c',
        uid: 'DR-EF-ENE-2024-0002-003',
        parentEFUID: 'EF-ENE-2024-0002',
        value: 0.000092,
        impactCategory: 'Climate Change - CH4 (CH4)',
        impactUnit: 'kgCH4',
        functionalUnit: ['m³', 'L'],
        referenceName: 'IPCC 2006 Guidelines',
        referenceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-01-10',
        createdAt: '2024-01-10T08:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row2d',
        uid: 'DR-EF-ENE-2024-0002-004',
        parentEFUID: 'EF-ENE-2024-0002',
        value: 38640,
        impactCategory: 'Energy (ENERGY)',
        impactUnit: 'kJ',
        functionalUnit: ['m³'],
        referenceName: 'Engineering ToolBox 2024',
        referenceURL: 'https://www.engineeringtoolbox.com/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-01-10',
        createdAt: '2024-01-10T08:30:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '3',
    uid: 'EF-TRA-2024-0003',
    name: 'Heavy-Duty Diesel Truck Transportation',
    ipccCategory: 'Energy',
    functionalUnit: 'L',
    tags: ['diesel', 'fuel', 'scope-1', 'transport', 'logistics'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-02-20T11:15:00Z',
    flexibleAttributes: {
      'Source Type': 'Primary',
      'Geographic Coverage': 'Global',
      'Vehicle Type': 'Heavy-Duty Truck'
    },
    coreDataRows: [
      {
        id: 'row3a',
        uid: 'DR-EF-TRA-2024-0003-001',
        parentEFUID: 'EF-TRA-2024-0003',
        value: 2.687,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2e',
        functionalUnit: ['L', 'tkm'],
        referenceName: 'IPCC 2006 Guidelines',
        referenceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-02-01',
        createdAt: '2024-02-20T11:15:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row3b',
        uid: 'DR-EF-TRA-2024-0003-002',
        parentEFUID: 'EF-TRA-2024-0003',
        value: 2.638,
        impactCategory: 'Climate Change - CO2 (CO2)',
        impactUnit: 'kgCO2',
        functionalUnit: ['L'],
        referenceName: 'IPCC 2006 Guidelines',
        referenceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-02-01',
        createdAt: '2024-02-20T11:15:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row3c',
        uid: 'DR-EF-TRA-2024-0003-003',
        parentEFUID: 'EF-TRA-2024-0003',
        value: 0.000085,
        impactCategory: 'Climate Change - N2O (N2O)',
        impactUnit: 'kgN2O',
        functionalUnit: ['L', 'tkm'],
        referenceName: 'IPCC 2006 Guidelines',
        referenceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-02-01',
        createdAt: '2024-02-20T11:15:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row3d',
        uid: 'DR-EF-TRA-2024-0003-004',
        parentEFUID: 'EF-TRA-2024-0003',
        value: 38600,
        impactCategory: 'Energy (ENERGY)',
        impactUnit: 'kJ',
        functionalUnit: ['L'],
        referenceName: 'Ecoinvent v3.9',
        referenceURL: 'https://ecoinvent.org/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-03-15',
        createdAt: '2024-03-20T09:30:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '4',
    uid: 'EF-IND-2024-0004',
    name: 'Primary Steel Production (Basic Oxygen Furnace)',
    ipccCategory: 'Industrial Processes and Product Use (IPPU)',
    functionalUnit: 'kg',
    tags: ['steel', 'manufacturing', 'materials', 'industrial'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-03-05T13:45:00Z',
    flexibleAttributes: {
      'Production Method': 'Basic Oxygen Furnace',
      'Data Quality': 'High',
      'Verification Status': 'Verified'
    },
    coreDataRows: [
      {
        id: 'row4a',
        uid: 'DR-EF-IND-2024-0004-001',
        parentEFUID: 'EF-IND-2024-0004',
        value: 1.85,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2e',
        functionalUnit: ['kg', 'tonne'],
        referenceName: 'WorldSteel Association 2024',
        referenceURL: 'https://worldsteel.org/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-03-01',
        createdAt: '2024-03-05T13:45:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row4b',
        uid: 'DR-EF-IND-2024-0004-002',
        parentEFUID: 'EF-IND-2024-0004',
        value: 22500,
        impactCategory: 'Energy (ENERGY)',
        impactUnit: 'kJ',
        functionalUnit: ['kg'],
        referenceName: 'Ecoinvent v3.9',
        referenceURL: 'https://ecoinvent.org/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-03-01',
        createdAt: '2024-03-05T13:45:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row4c',
        uid: 'DR-EF-IND-2024-0004-003',
        parentEFUID: 'EF-IND-2024-0004',
        value: 0.065,
        impactCategory: 'Water (WATER)',
        impactUnit: 'm3',
        functionalUnit: ['kg', 'tonne'],
        referenceName: 'WorldSteel LCI Data 2024',
        referenceURL: 'https://worldsteel.org/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-03-01',
        createdAt: '2024-03-05T13:45:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '5',
    uid: 'EF-AGR-2024-0001',
    name: 'Wetland Rice Cultivation (Methane Emissions)',
    ipccCategory: 'Agriculture, Forestry and Other Land Use (AFOLU)',
    functionalUnit: 'kg',
    tags: ['agriculture', 'rice', 'methane', 'crops', 'food'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-04-12T16:20:00Z',
    flexibleAttributes: {
      'Cultivation Type': 'Wetland',
      'Data Quality': 'High',
      'Verification Status': 'Verified'
    },
    coreDataRows: [
      {
        id: 'row5a',
        uid: 'DR-EF-AGR-2024-0001-001',
        parentEFUID: 'EF-AGR-2024-0001',
        value: 2.45,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2e',
        functionalUnit: ['kg'],
        referenceName: 'FAO Agricultural Database 2024',
        referenceURL: 'https://www.fao.org/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-04-01',
        createdAt: '2024-04-12T16:20:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row5b',
        uid: 'DR-EF-AGR-2024-0001-002',
        parentEFUID: 'EF-AGR-2024-0001',
        value: 0.087,
        impactCategory: 'Climate Change - CH4 (CH4)',
        impactUnit: 'kgCH4',
        functionalUnit: ['kg', 'm²'],
        referenceName: 'IPCC 2019 Refinement',
        referenceURL: 'https://www.ipcc-nggip.iges.or.jp/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-04-01',
        createdAt: '2024-04-12T16:20:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row5c',
        uid: 'DR-EF-AGR-2024-0001-003',
        parentEFUID: 'EF-AGR-2024-0001',
        value: 2850,
        impactCategory: 'Water (WATER)',
        impactUnit: 'm3',
        functionalUnit: ['kg'],
        referenceName: 'Water Footprint Network 2024',
        referenceURL: 'https://waterfootprint.org/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-04-01',
        createdAt: '2024-04-12T16:20:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '6',
    uid: 'EF-ENE-2024-0006',
    name: 'International Air Freight (Long Haul)',
    ipccCategory: 'Energy',
    functionalUnit: 'tkm',
    tags: ['transport', 'aviation', 'freight', 'scope-3', 'long-haul'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-05-08T10:00:00Z',
    flexibleAttributes: {
      'Transport Mode': 'Air Freight',
      'Distance Category': 'Long Haul',
      'Data Quality': 'High'
    },
    coreDataRows: [
      {
        id: 'row6a',
        uid: 'DR-EF-ENE-2024-0006-001',
        parentEFUID: 'EF-ENE-2024-0006',
        value: 0.602,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2e',
        functionalUnit: ['tkm', 'pkm'],
        referenceName: 'GLEC Framework 2024',
        referenceURL: 'https://www.smartfreightcentre.org/en/glec/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-05-01',
        createdAt: '2024-05-08T10:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row6b',
        uid: 'DR-EF-ENE-2024-0006-002',
        parentEFUID: 'EF-ENE-2024-0006',
        value: 0.578,
        impactCategory: 'Climate Change - CO2 (CO2)',
        impactUnit: 'kgCO2',
        functionalUnit: ['tkm'],
        referenceName: 'ICAO Carbon Calculator 2024',
        referenceURL: 'https://www.icao.int/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-05-01',
        createdAt: '2024-05-08T10:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row6c',
        uid: 'DR-EF-ENE-2024-0006-003',
        parentEFUID: 'EF-ENE-2024-0006',
        value: 18500,
        impactCategory: 'Energy (ENERGY)',
        impactUnit: 'kJ',
        functionalUnit: ['tkm'],
        referenceName: 'IATA Environmental Report 2024',
        referenceURL: 'https://www.iata.org/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-05-01',
        createdAt: '2024-05-08T10:00:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '7',
    uid: 'EF-TRA-2024-0007',
    name: 'Light Duty Vehicle - Gasoline',
    ipccCategory: 'Transport',
    functionalUnit: 'km',
    tags: ['transport', 'vehicle', 'gasoline', 'scope-1', 'passenger'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-06-10T09:00:00Z',
    flexibleAttributes: {
      'Vehicle Type': 'Passenger Car',
      'Fuel Type': 'Gasoline'
    },
    coreDataRows: [
      {
        id: 'row7a',
        uid: 'DR-EF-TRA-2024-0007-001',
        parentEFUID: 'EF-TRA-2024-0007',
        value: 0.192,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: ['km', 'pkm'],
        referenceName: 'EPA Vehicle Emissions 2024',
        referenceURL: 'https://www.epa.gov/greenvehicles',
        country: 'United States',
        region: 'North America',
        referenceDate: '2024-06-01',
        createdAt: '2024-06-10T09:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row7b',
        uid: 'DR-EF-TRA-2024-0007-002',
        parentEFUID: 'EF-TRA-2024-0007',
        value: 0.185,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: ['km'],
        referenceName: 'UK DEFRA 2024',
        referenceURL: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
        country: 'United Kingdom',
        region: 'Europe',
        referenceDate: '2024-06-01',
        createdAt: '2024-06-10T09:00:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '8',
    uid: 'EF-TRA-2024-0008',
    name: 'Light Duty Vehicle - Diesel',
    ipccCategory: 'Transport',
    functionalUnit: 'km',
    tags: ['transport', 'vehicle', 'diesel', 'scope-1', 'passenger'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-06-10T09:30:00Z',
    flexibleAttributes: {
      'Vehicle Type': 'Passenger Car',
      'Fuel Type': 'Diesel'
    },
    coreDataRows: [
      {
        id: 'row8a',
        uid: 'DR-EF-TRA-2024-0008-001',
        parentEFUID: 'EF-TRA-2024-0008',
        value: 0.171,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: ['km'],
        referenceName: 'EPA Vehicle Emissions 2024',
        referenceURL: 'https://www.epa.gov/greenvehicles',
        country: 'United States',
        region: 'North America',
        referenceDate: '2024-06-01',
        createdAt: '2024-06-10T09:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row8b',
        uid: 'DR-EF-TRA-2024-0008-002',
        parentEFUID: 'EF-TRA-2024-0008',
        value: 0.168,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: ['km', 'pkm'],
        referenceName: 'UK DEFRA 2024',
        referenceURL: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
        country: 'United Kingdom',
        region: 'Europe',
        referenceDate: '2024-06-01',
        createdAt: '2024-06-10T09:30:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '9',
    uid: 'EF-TRA-2024-0009',
    name: 'Heavy Duty Truck',
    ipccCategory: 'Transport',
    functionalUnit: 'km',
    tags: ['transport', 'truck', 'freight', 'scope-1', 'heavy-duty'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-06-10T10:00:00Z',
    flexibleAttributes: {
      'Vehicle Type': 'Heavy Duty Truck',
      'Fuel Type': 'Diesel'
    },
    coreDataRows: [
      {
        id: 'row9a',
        uid: 'DR-EF-TRA-2024-0009-001',
        parentEFUID: 'EF-TRA-2024-0009',
        value: 0.89,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: ['km', 'tkm'],
        referenceName: 'GLEC Framework 2024',
        referenceURL: 'https://www.smartfreightcentre.org/en/glec/',
        country: 'Global',
        region: 'Global',
        referenceDate: '2024-06-01',
        createdAt: '2024-06-10T10:00:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '10',
    uid: 'EF-TRA-2024-0010',
    name: 'Medium Duty Van',
    ipccCategory: 'Transport',
    functionalUnit: 'km',
    tags: ['transport', 'van', 'delivery', 'scope-1', 'commercial'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-06-10T10:30:00Z',
    flexibleAttributes: {
      'Vehicle Type': 'Commercial Van',
      'Fuel Type': 'Diesel'
    },
    coreDataRows: [
      {
        id: 'row10a',
        uid: 'DR-EF-TRA-2024-0010-001',
        parentEFUID: 'EF-TRA-2024-0010',
        value: 0.265,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: ['km'],
        referenceName: 'UK DEFRA 2024',
        referenceURL: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
        country: 'United Kingdom',
        region: 'Europe',
        referenceDate: '2024-06-01',
        createdAt: '2024-06-10T10:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row10b',
        uid: 'DR-EF-TRA-2024-0010-002',
        parentEFUID: 'EF-TRA-2024-0010',
        value: 0.278,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: ['km'],
        referenceName: 'EPA Vehicle Emissions 2024',
        referenceURL: 'https://www.epa.gov/greenvehicles',
        country: 'United States',
        region: 'North America',
        referenceDate: '2024-06-01',
        createdAt: '2024-06-10T10:30:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '11',
    uid: 'EF-TRA-2024-0011',
    name: 'Electric Vehicle',
    ipccCategory: 'Transport',
    functionalUnit: 'km',
    tags: ['transport', 'vehicle', 'electric', 'scope-2', 'zero-emission'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-06-10T11:00:00Z',
    flexibleAttributes: {
      'Vehicle Type': 'Battery Electric Vehicle',
      'Fuel Type': 'Electricity'
    },
    coreDataRows: [
      {
        id: 'row11a',
        uid: 'DR-EF-TRA-2024-0011-001',
        parentEFUID: 'EF-TRA-2024-0011',
        value: 0.053,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: ['km', 'pkm'],
        referenceName: 'EPA eGRID 2024 - US Grid Average',
        referenceURL: 'https://www.epa.gov/egrid',
        country: 'United States',
        region: 'North America',
        referenceDate: '2024-06-01',
        createdAt: '2024-06-10T11:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 'row11b',
        uid: 'DR-EF-TRA-2024-0011-002',
        parentEFUID: 'EF-TRA-2024-0011',
        value: 0.047,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: ['km'],
        referenceName: 'UK DEFRA 2024 - UK Grid Average',
        referenceURL: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
        country: 'United Kingdom',
        region: 'Europe',
        referenceDate: '2024-06-01',
        createdAt: '2024-06-10T11:00:00Z',
        createdBy: 'admin'
      }
    ]
  }
];

interface EmissionFactorsProps {
  onNavigateToBulkUpload?: () => void;
}

export function EmissionFactors({ onNavigateToBulkUpload }: EmissionFactorsProps = {}) {
  // Use shared Master DB context
  const { masterEFDefinitions, setMasterEFDefinitions } = useMasterDB();
  const efDefinitions = masterEFDefinitions;
  const setEFDefinitions = setMasterEFDefinitions;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Expansion states
  const [expandedEFs, setExpandedEFs] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isCreateEFDialogOpen, setIsCreateEFDialogOpen] = useState(false);
  const [isEditEFDialogOpen, setIsEditEFDialogOpen] = useState(false);
  const [isAddDataRowDialogOpen, setIsAddDataRowDialogOpen] = useState(false);
  const [isEditDataRowDialogOpen, setIsEditDataRowDialogOpen] = useState(false);
  
  // Selected items
  const [selectedEF, setSelectedEF] = useState<EFDefinition | null>(null);
  const [selectedDataRow, setSelectedDataRow] = useState<CoreDataRow | null>(null);
  
  // Form data
  const [efFormData, setEFFormData] = useState({
    name: '',
    ipccCategory: '',
    tags: [] as string[],
    flexibleAttributes: [] as { key: string; value: string }[]
  });
  
  const [dataRowFormData, setDataRowFormData] = useState({
    value: '',
    impactCategory: '',
    impactUnit: '',
    functionalUnit: [] as string[], // Changed to array for multiple functional units
    referenceName: '',
    referenceURL: '',
    country: '',
    region: '',
    referenceDate: undefined as Date | undefined
  });

  // Filtered data
  const filteredEFs = efDefinitions.filter(ef => {
    const matchesSearch = ef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ef.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ef.ipccCategory === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Helper functions
  const getTotalDataRows = (ef: EFDefinition) => ef.coreDataRows.length;
  
  const copyUID = async (uid: string) => {
    try {
      // Try the modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(uid);
        toast.success('UID copied to clipboard');
        return;
      }
      
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = uid;
      textArea.style.position = 'fixed';
      textArea.style.top = '-9999px';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        toast.success('UID copied to clipboard');
      } else {
        toast.error('Failed to copy UID');
      }
    } catch (error) {
      toast.error('Failed to copy UID');
    }
  };

  const resetEFForm = () => {
    setEFFormData({
      name: '',
      ipccCategory: '',
      tags: [],
      flexibleAttributes: []
    });
  };

  const resetDataRowForm = () => {
    setDataRowFormData({
      value: '',
      impactCategory: '',
      impactUnit: '',
      functionalUnit: [], // Reset to empty array
      referenceName: '',
      referenceURL: '',
      country: '',
      region: '',
      referenceDate: undefined
    });
  };

  // Expansion handlers
  const toggleEFExpansion = (efId: string) => {
    const newExpanded = new Set(expandedEFs);
    if (newExpanded.has(efId)) {
      newExpanded.delete(efId);
    } else {
      newExpanded.add(efId);
    }
    setExpandedEFs(newExpanded);
  };

  // Auto-generate region when country changes
  const handleCountryChange = (country: string) => {
    const region = countryToRegion[country] || '';
    setDataRowFormData({
      ...dataRowFormData,
      country,
      region
    });
  };

  // EF Definition handlers
  const handleCreateEF = () => {
    if (!efFormData.name || !efFormData.ipccCategory || !efFormData.functionalUnit) {
      toast.error('Please fill in all required fields');
      return;
    }

    const sequence = efDefinitions.length + 1;
    const newUID = generateEFUID(efFormData.ipccCategory, sequence);
    
    // Convert flexible attributes array to object
    const flexibleAttributesObj = efFormData.flexibleAttributes.reduce((acc, attr) => {
      if (attr.key && attr.value) {
        acc[attr.key] = attr.value;
      }
      return acc;
    }, {} as Record<string, any>);

    const newEF: EFDefinition = {
      id: `ef_${Date.now()}`,
      uid: newUID,
      name: efFormData.name,
      ipccCategory: efFormData.ipccCategory,
      functionalUnit: efFormData.functionalUnit,
      tags: efFormData.tags,
      flexibleAttributes: Object.keys(flexibleAttributesObj).length > 0 ? flexibleAttributesObj : undefined,
      status: 'draft',
      database: 'master',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      coreDataRows: []
    };

    setEFDefinitions([...efDefinitions, newEF]);
    setIsCreateEFDialogOpen(false);
    resetEFForm();
    toast.success(`EF Definition created with UID: ${newUID}`);
  };

  const handleEditEF = (ef: EFDefinition) => {
    setSelectedEF(ef);
    // Convert flexible attributes object to array for editing
    const flexAttrsArray = ef.flexibleAttributes 
      ? Object.entries(ef.flexibleAttributes).map(([key, value]) => ({ key, value: String(value) }))
      : [];
    
    setEFFormData({
      name: ef.name,
      ipccCategory: ef.ipccCategory,
      functionalUnit: ef.functionalUnit,
      tags: ef.tags,
      flexibleAttributes: flexAttrsArray
    });
    setIsEditEFDialogOpen(true);
  };

  const handleUpdateEF = () => {
    if (!selectedEF || !efFormData.name || !efFormData.ipccCategory || !efFormData.functionalUnit) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Convert flexible attributes array to object
    const flexibleAttributesObj = efFormData.flexibleAttributes.reduce((acc, attr) => {
      if (attr.key && attr.value) {
        acc[attr.key] = attr.value;
      }
      return acc;
    }, {} as Record<string, any>);

    const updatedEF: EFDefinition = {
      ...selectedEF,
      name: efFormData.name,
      ipccCategory: efFormData.ipccCategory,
      functionalUnit: efFormData.functionalUnit,
      tags: efFormData.tags,
      flexibleAttributes: Object.keys(flexibleAttributesObj).length > 0 ? flexibleAttributesObj : undefined,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin'
    };

    setEFDefinitions(efDefinitions.map(ef => 
      ef.id === selectedEF.id ? updatedEF : ef
    ));

    setIsEditEFDialogOpen(false);
    setSelectedEF(null);
    resetEFForm();
    toast.success(`EF Definition updated successfully`);
  };

  const handleDeleteEF = (ef: EFDefinition) => {
    if (window.confirm(`Are you sure you want to delete "${ef.name}"? This will also delete all associated data rows.`)) {
      setEFDefinitions(efDefinitions.filter(e => e.id !== ef.id));
      toast.success(`EF Definition deleted successfully`);
    }
  };

  // Data Row handlers
  const handleAddDataRowClick = (ef: EFDefinition) => {
    setSelectedEF(ef);
    resetDataRowForm();
    setIsAddDataRowDialogOpen(true);
  };

  const handleAddDataRow = () => {
    if (!selectedEF || !dataRowFormData.value || !dataRowFormData.impactCategory || 
        !dataRowFormData.impactUnit || dataRowFormData.functionalUnit.length === 0 || !dataRowFormData.referenceName || 
        !dataRowFormData.country || !dataRowFormData.referenceDate) {
      toast.error('Please fill in all required fields (including at least one functional unit)');
      return;
    }

    // Generate data row UID
    const sequence = selectedEF.coreDataRows.length + 1;
    const dataRowUID = generateDataRowUID(selectedEF.uid, sequence);

    const newDataRow: CoreDataRow = {
      id: `row_${Date.now()}`,
      uid: dataRowUID,
      parentEFUID: selectedEF.uid,
      value: parseFloat(dataRowFormData.value),
      impactCategory: dataRowFormData.impactCategory,
      impactUnit: dataRowFormData.impactUnit,
      functionalUnit: dataRowFormData.functionalUnit,
      referenceName: dataRowFormData.referenceName,
      referenceURL: dataRowFormData.referenceURL || undefined,
      country: dataRowFormData.country,
      region: dataRowFormData.region,
      referenceDate: dataRowFormData.referenceDate,
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    };

    const updatedEF = {
      ...selectedEF,
      coreDataRows: [...selectedEF.coreDataRows, newDataRow]
    };

    setEFDefinitions(efDefinitions.map(ef => 
      ef.id === selectedEF.id ? updatedEF : ef
    ));

    setIsAddDataRowDialogOpen(false);
    setSelectedEF(null);
    resetDataRowForm();
    toast.success(`Data row added with UID: ${dataRowUID}`);
  };

  const handleEditDataRow = (dataRow: CoreDataRow) => {
    setSelectedDataRow(dataRow);
    setDataRowFormData({
      value: dataRow.value.toString(),
      impactCategory: dataRow.impactCategory,
      impactUnit: dataRow.impactUnit,
      functionalUnit: Array.isArray(dataRow.functionalUnit) ? dataRow.functionalUnit : [dataRow.functionalUnit].filter(Boolean),
      referenceName: dataRow.referenceName,
      referenceURL: dataRow.referenceURL || '',
      country: dataRow.country,
      region: dataRow.region,
      referenceDate: dataRow.referenceDate
    });
    setIsEditDataRowDialogOpen(true);
  };

  const handleUpdateDataRow = () => {
    if (!selectedDataRow || !dataRowFormData.value || !dataRowFormData.impactCategory || 
        !dataRowFormData.impactUnit || dataRowFormData.functionalUnit.length === 0 || !dataRowFormData.referenceName || 
        !dataRowFormData.country || !dataRowFormData.referenceDate) {
      toast.error('Please fill in all required fields (including at least one functional unit)');
      return;
    }

    const updatedDataRow: CoreDataRow = {
      ...selectedDataRow,
      value: parseFloat(dataRowFormData.value),
      impactCategory: dataRowFormData.impactCategory,
      impactUnit: dataRowFormData.impactUnit,
      functionalUnit: dataRowFormData.functionalUnit,
      referenceName: dataRowFormData.referenceName,
      referenceURL: dataRowFormData.referenceURL || undefined,
      country: dataRowFormData.country,
      region: dataRowFormData.region,
      referenceDate: dataRowFormData.referenceDate
    };

    const updatedEF = efDefinitions.find(ef => ef.uid === selectedDataRow.parentEFUID);
    if (updatedEF) {
      const updatedEFWithRow = {
        ...updatedEF,
        coreDataRows: updatedEF.coreDataRows.map(row => 
          row.id === selectedDataRow.id ? updatedDataRow : row
        )
      };

      setEFDefinitions(efDefinitions.map(ef => 
        ef.id === updatedEF.id ? updatedEFWithRow : ef
      ));
    }

    setIsEditDataRowDialogOpen(false);
    setSelectedDataRow(null);
    resetDataRowForm();
    toast.success(`Data row updated successfully`);
  };

  const handleDeleteDataRow = (dataRow: CoreDataRow) => {
    if (window.confirm(`Are you sure you want to delete this data row? This action cannot be undone.`)) {
      const updatedEF = efDefinitions.find(ef => ef.uid === dataRow.parentEFUID);
      if (updatedEF) {
        const updatedEFWithoutRow = {
          ...updatedEF,
          coreDataRows: updatedEF.coreDataRows.filter(row => row.id !== dataRow.id)
        };

        setEFDefinitions(efDefinitions.map(ef => 
          ef.id === updatedEF.id ? updatedEFWithoutRow : ef
        ));
      }
      toast.success(`Data row deleted successfully`);
    }
  };

  const handleBulkUpload = () => {
    if (onNavigateToBulkUpload) {
      onNavigateToBulkUpload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-lg">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-gray-900">Emission Factors</h1>
              <p className="text-gray-600">Manage emission factor definitions with multiple impact categories per source</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          
          <Button 
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => toast.info('API Upload: Please configure API endpoint and credentials')}
          >
            <Upload className="h-4 w-4 mr-2" />
            API Upload
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            onClick={() => setIsCreateEFDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create EF Definition
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by EF name or UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-emerald-200 focus:border-emerald-500"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64 border-emerald-200">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All IPCC Categories</SelectItem>
                {ipccCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300">
              {filteredEFs.length} EF{filteredEFs.length !== 1 ? 's' : ''} found
            </Badge>
            <Badge variant="outline" className="text-gray-600 border-gray-300">
              {filteredEFs.reduce((sum, ef) => sum + getTotalDataRows(ef), 0)} total data rows
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* EF Definitions Table */}
      <Card className="border-emerald-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-emerald-50 to-green-50">
              <TableHead className="w-12"></TableHead>
              <TableHead>EF Definition</TableHead>
              <TableHead>IPCC Category</TableHead>
              <TableHead>Data Rows</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEFs.map((ef, index) => {
              const isExpanded = expandedEFs.has(ef.id);
              const hasAnyExpanded = expandedEFs.size > 0;
              const shouldFade = hasAnyExpanded && !isExpanded;
              const isEvenRow = index % 2 === 0;
              
              return (
              <React.Fragment key={ef.id}>
                {/* EF Definition Row */}
                <TableRow className={`border-l-4 border-l-emerald-500 hover:bg-emerald-100 transition-all duration-200 ${
                  isEvenRow ? 'bg-white' : 'bg-emerald-50/30'
                } ${shouldFade ? 'opacity-30' : 'opacity-100'}`}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleEFExpansion(ef.id)}
                      className="p-1"
                    >
                      <ChevronRight 
                        className={`h-4 w-4 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`} 
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-emerald-600" />
                        <span>{ef.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyUID(ef.uid)}
                          className="h-6 px-2 text-xs text-gray-500 hover:text-emerald-600"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {ef.uid}
                        </Button>
                      </div>
                      {ef.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {ef.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                      {ef.ipccCategory}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{getTotalDataRows(ef)} rows</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ef.status === 'active' ? 'default' : ef.status === 'draft' ? 'secondary' : 'destructive'}>
                      {ef.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditEF(ef)}
                        title="Edit EF Definition"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteEF(ef)}
                        title="Delete EF Definition"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Add Data Row Button when EF is expanded */}
                {isExpanded && (
                  <TableRow className="border-l-4 border-l-emerald-300 bg-emerald-100/50 transition-opacity duration-300 opacity-100">
                    <TableCell colSpan={7} className="py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddDataRowClick(ef)}
                        className="ml-8 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Data Row
                      </Button>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data Rows */}
                {isExpanded && ef.coreDataRows.map((dataRow) => (
                  <TableRow key={dataRow.id} className="border-l-4 border-l-cyan-400 bg-cyan-50/70 transition-opacity duration-300 opacity-100">
                    <TableCell className="pl-8">
                      <Layers className="h-4 w-4 text-cyan-600" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm">
                            {dataRow.referenceName} ({dataRow.impactUnit}/{Array.isArray(dataRow.functionalUnit) ? dataRow.functionalUnit.join(' · ') : dataRow.functionalUnit})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyUID(dataRow.uid)}
                            className="h-5 px-1.5 text-xs text-cyan-700 hover:bg-cyan-100"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            {dataRow.uid}
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          {dataRow.country}
                        </div>
                        <div className="text-gray-500">{dataRow.region}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {dataRow.referenceDate ? format(
                          typeof dataRow.referenceDate === 'string' 
                            ? new Date(dataRow.referenceDate) 
                            : dataRow.referenceDate, 
                          'MMM dd, yyyy'
                        ) : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {dataRow.value} {dataRow.impactUnit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {dataRow.impactCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditDataRow(dataRow)}
                          title="Edit Data Row"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDataRow(dataRow)}
                          title="Delete Data Row"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Create EF Dialog */}
      <Dialog open={isCreateEFDialogOpen} onOpenChange={setIsCreateEFDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Create EF Definition
            </DialogTitle>
            <DialogDescription>
              Create a new emission factor definition. UID will be auto-generated.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Standard Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Standard Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={efFormData.name}
                      onChange={(e) => setEFFormData({...efFormData, name: e.target.value})}
                      placeholder="e.g. Electricity Grid Mix - US"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ipccCategory">IPCC Category *</Label>
                    <Select value={efFormData.ipccCategory} onValueChange={(value) => setEFFormData({...efFormData, ipccCategory: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select IPCC category" />
                      </SelectTrigger>
                      <SelectContent>
                        {ipccCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input
                      value={efFormData.tags.join(', ')}
                      onChange={(e) => setEFFormData({...efFormData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                      placeholder="Enter tags separated by commas"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flexible Attributes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Flexible Attributes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {efFormData.flexibleAttributes.map((attr, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="Attribute name"
                        value={attr.key}
                        onChange={(e) => {
                          const newAttrs = [...efFormData.flexibleAttributes];
                          newAttrs[idx] = { ...newAttrs[idx], key: e.target.value };
                          setEFFormData({...efFormData, flexibleAttributes: newAttrs});
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Attribute value"
                        value={attr.value}
                        onChange={(e) => {
                          const newAttrs = [...efFormData.flexibleAttributes];
                          newAttrs[idx] = { ...newAttrs[idx], value: e.target.value };
                          setEFFormData({...efFormData, flexibleAttributes: newAttrs});
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newAttrs = efFormData.flexibleAttributes.filter((_, i) => i !== idx);
                          setEFFormData({...efFormData, flexibleAttributes: newAttrs});
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEFFormData({
                        ...efFormData,
                        flexibleAttributes: [...efFormData.flexibleAttributes, { key: '', value: '' }]
                      });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Attribute
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateEFDialogOpen(false);
              resetEFForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateEF} className="bg-gradient-to-r from-emerald-500 to-green-600">
              Create EF Definition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit EF Dialog */}
      <Dialog open={isEditEFDialogOpen} onOpenChange={setIsEditEFDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit EF Definition
            </DialogTitle>
            <DialogDescription>
              Update the emission factor definition details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Standard Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Standard Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name *</Label>
                    <Input
                      id="edit-name"
                      value={efFormData.name}
                      onChange={(e) => setEFFormData({...efFormData, name: e.target.value})}
                      placeholder="e.g. Electricity Grid Mix - US"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-ipccCategory">IPCC Category *</Label>
                    <Select value={efFormData.ipccCategory} onValueChange={(value) => setEFFormData({...efFormData, ipccCategory: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select IPCC category" />
                      </SelectTrigger>
                      <SelectContent>
                        {ipccCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input
                      value={efFormData.tags.join(', ')}
                      onChange={(e) => setEFFormData({...efFormData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                      placeholder="Enter tags separated by commas"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flexible Attributes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Flexible Attributes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {efFormData.flexibleAttributes.map((attr, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="Attribute name"
                        value={attr.key}
                        onChange={(e) => {
                          const newAttrs = [...efFormData.flexibleAttributes];
                          newAttrs[idx] = { ...newAttrs[idx], key: e.target.value };
                          setEFFormData({...efFormData, flexibleAttributes: newAttrs});
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Attribute value"
                        value={attr.value}
                        onChange={(e) => {
                          const newAttrs = [...efFormData.flexibleAttributes];
                          newAttrs[idx] = { ...newAttrs[idx], value: e.target.value };
                          setEFFormData({...efFormData, flexibleAttributes: newAttrs});
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newAttrs = efFormData.flexibleAttributes.filter((_, i) => i !== idx);
                          setEFFormData({...efFormData, flexibleAttributes: newAttrs});
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEFFormData({
                        ...efFormData,
                        flexibleAttributes: [...efFormData.flexibleAttributes, { key: '', value: '' }]
                      });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Attribute
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditEFDialogOpen(false);
              setSelectedEF(null);
              resetEFForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEF} className="bg-gradient-to-r from-emerald-500 to-green-600">
              Update EF Definition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Data Row Dialog */}
      <Dialog open={isAddDataRowDialogOpen} onOpenChange={setIsAddDataRowDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Add Data Row to {selectedEF?.name}
            </DialogTitle>
            <DialogDescription>
              Add a new data row to this EF definition. Data row UID will be auto-generated.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Value *</Label>
                <Input
                  id="value"
                  type="number"
                  step="any"
                  value={dataRowFormData.value}
                  onChange={(e) => setDataRowFormData({...dataRowFormData, value: e.target.value})}
                  placeholder="e.g., 0.4207"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="impactCategory">Impact Category *</Label>
                <Select 
                  value={dataRowFormData.impactCategory} 
                  onValueChange={(value) => {
                    const autoUnit = impactCategoryUnitMapping[value] || '';
                    setDataRowFormData({...dataRowFormData, impactCategory: value, impactUnit: autoUnit});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact category" />
                  </SelectTrigger>
                  <SelectContent>
                    {impactCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="impactUnit">Impact Unit (Auto-populated) *</Label>
                <Input
                  id="impactUnit"
                  value={dataRowFormData.impactUnit}
                  readOnly
                  disabled
                  placeholder="Auto-populated based on Impact Category"
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-3 col-span-2">
                <Label>Functional Unit(s) * <span className="text-sm text-gray-500">(Select one or more)</span></Label>
                <div className="grid grid-cols-4 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  {functionalUnits.map(unit => (
                    <div key={unit} className="flex items-center space-x-2">
                      <Checkbox
                        id={`func-unit-${unit}`}
                        checked={dataRowFormData.functionalUnit.includes(unit)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDataRowFormData({
                              ...dataRowFormData,
                              functionalUnit: [...dataRowFormData.functionalUnit, unit]
                            });
                          } else {
                            setDataRowFormData({
                              ...dataRowFormData,
                              functionalUnit: dataRowFormData.functionalUnit.filter(u => u !== unit)
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`func-unit-${unit}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {unit}
                      </label>
                    </div>
                  ))}
                </div>
                {dataRowFormData.functionalUnit.length > 0 && (
                  <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
                    Selected: {dataRowFormData.functionalUnit.join(' · ')}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referenceName">Reference Name *</Label>
                <Input
                  id="referenceName"
                  value={dataRowFormData.referenceName}
                  onChange={(e) => setDataRowFormData({...dataRowFormData, referenceName: e.target.value})}
                  placeholder="e.g., EPA eGRID"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="referenceURL">Reference URL</Label>
                <Input
                  id="referenceURL"
                  value={dataRowFormData.referenceURL}
                  onChange={(e) => setDataRowFormData({...dataRowFormData, referenceURL: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select value={dataRowFormData.country} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">Region (Auto-generated)</Label>
                <Input
                  id="region"
                  value={dataRowFormData.region}
                  disabled
                  className="bg-gray-50"
                  placeholder="Select country first"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Reference Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !dataRowFormData.referenceDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataRowFormData.referenceDate ? (
                        format(dataRowFormData.referenceDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataRowFormData.referenceDate}
                      onSelect={(date) => setDataRowFormData({...dataRowFormData, referenceDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDataRowDialogOpen(false);
              setSelectedEF(null);
              resetDataRowForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddDataRow} className="bg-gradient-to-r from-emerald-500 to-green-600">
              Add Data Row
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Data Row Dialog */}
      <Dialog open={isEditDataRowDialogOpen} onOpenChange={setIsEditDataRowDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Data Row
            </DialogTitle>
            <DialogDescription>
              Update the data row information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-value">Value *</Label>
                <Input
                  id="edit-value"
                  type="number"
                  step="any"
                  value={dataRowFormData.value}
                  onChange={(e) => setDataRowFormData({...dataRowFormData, value: e.target.value})}
                  placeholder="e.g., 0.4207"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-impactCategory">Impact Category *</Label>
                <Select 
                  value={dataRowFormData.impactCategory} 
                  onValueChange={(value) => {
                    const autoUnit = impactCategoryUnitMapping[value] || '';
                    setDataRowFormData({...dataRowFormData, impactCategory: value, impactUnit: autoUnit});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact category" />
                  </SelectTrigger>
                  <SelectContent>
                    {impactCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-impactUnit">Impact Unit (Auto-populated) *</Label>
                <Input
                  id="edit-impactUnit"
                  value={dataRowFormData.impactUnit}
                  readOnly
                  disabled
                  placeholder="Auto-populated based on Impact Category"
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-3 col-span-2">
                <Label>Functional Unit(s) * <span className="text-sm text-gray-500">(Select one or more)</span></Label>
                <div className="grid grid-cols-4 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  {functionalUnits.map(unit => (
                    <div key={unit} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-func-unit-${unit}`}
                        checked={dataRowFormData.functionalUnit.includes(unit)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDataRowFormData({
                              ...dataRowFormData,
                              functionalUnit: [...dataRowFormData.functionalUnit, unit]
                            });
                          } else {
                            setDataRowFormData({
                              ...dataRowFormData,
                              functionalUnit: dataRowFormData.functionalUnit.filter(u => u !== unit)
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`edit-func-unit-${unit}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {unit}
                      </label>
                    </div>
                  ))}
                </div>
                {dataRowFormData.functionalUnit.length > 0 && (
                  <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
                    Selected: {dataRowFormData.functionalUnit.join(' · ')}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-referenceName">Reference Name *</Label>
                <Input
                  id="edit-referenceName"
                  value={dataRowFormData.referenceName}
                  onChange={(e) => setDataRowFormData({...dataRowFormData, referenceName: e.target.value})}
                  placeholder="e.g., EPA eGRID"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-referenceURL">Reference URL</Label>
                <Input
                  id="edit-referenceURL"
                  value={dataRowFormData.referenceURL}
                  onChange={(e) => setDataRowFormData({...dataRowFormData, referenceURL: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-country">Country *</Label>
                <Select value={dataRowFormData.country} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-region">Region (Auto-generated)</Label>
                <Input
                  id="edit-region"
                  value={dataRowFormData.region}
                  disabled
                  className="bg-gray-50"
                  placeholder="Select country first"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Reference Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !dataRowFormData.referenceDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataRowFormData.referenceDate ? (
                        format(dataRowFormData.referenceDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataRowFormData.referenceDate}
                      onSelect={(date) => setDataRowFormData({...dataRowFormData, referenceDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDataRowDialogOpen(false);
              setSelectedDataRow(null);
              resetDataRowForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDataRow} className="bg-gradient-to-r from-emerald-500 to-green-600">
              Update Data Row
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
