import React, { createContext, useContext, useState } from 'react';

// Interfaces (updated to match EmissionFactorsComplete)
interface CoreDataRow {
  id: string;
  uid: string; // Auto-generated unique identifier for the data row
  parentEFUID: string;
  value: number;
  impactCategory: string;
  impactUnit: string;
  functionalUnit: string;
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

// Master DB Mock Data (updated to match EmissionFactorsComplete)
const mockMasterEFDefinitions: EFDefinition[] = [
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
        functionalUnit: 'kWh',
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
        functionalUnit: 'kWh',
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
        functionalUnit: 'kWh',
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
        functionalUnit: 'kWh',
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
        functionalUnit: 'm³',
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
        functionalUnit: 'm³',
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
        functionalUnit: 'm³',
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
        functionalUnit: 'm³',
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
    uid: 'EF-ENE-2024-0003',
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
        uid: 'DR-EF-ENE-2024-0003-001',
        parentEFUID: 'EF-ENE-2024-0003',
        value: 2.687,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2e',
        functionalUnit: 'L',
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
        uid: 'DR-EF-ENE-2024-0003-002',
        parentEFUID: 'EF-ENE-2024-0003',
        value: 2.638,
        impactCategory: 'Climate Change - CO2 (CO2)',
        impactUnit: 'kgCO2',
        functionalUnit: 'L',
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
        uid: 'DR-EF-ENE-2024-0003-003',
        parentEFUID: 'EF-ENE-2024-0003',
        value: 0.000016,
        impactCategory: 'Climate Change - N2O (N2O)',
        impactUnit: 'kgN2O',
        functionalUnit: 'L',
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
        uid: 'DR-EF-ENE-2024-0003-004',
        parentEFUID: 'EF-ENE-2024-0003',
        value: 43200,
        impactCategory: 'Energy (ENERGY)',
        impactUnit: 'kJ',
        functionalUnit: 'L',
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
        functionalUnit: 'kg',
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
        functionalUnit: 'kg',
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
        functionalUnit: 'kg',
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
        functionalUnit: 'kg',
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
        functionalUnit: 'kg',
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
        functionalUnit: 'kg',
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
        functionalUnit: 'tkm',
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
        functionalUnit: 'tkm',
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
        functionalUnit: 'tkm',
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
        functionalUnit: 'km',
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
        functionalUnit: 'km',
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
        functionalUnit: 'km',
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
        functionalUnit: 'km',
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
        functionalUnit: 'km',
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
        functionalUnit: 'km',
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
        functionalUnit: 'km',
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
        functionalUnit: 'km',
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
        functionalUnit: 'km',
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

// Formula interfaces (full definitions)
interface FormulaParameterVersion {
  id: string;
  versionUID: string;
  parentParameterId: string;
  version: string;
  value: number | string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

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
  parameterType: 'variable' | 'ef_value';
  efSource?: 'master_db' | 'client_db';
  efCategory?: string;
  efUID?: string;
  efDefinition?: string;
  constantValue?: string;
  constantDescription?: string;
  versions: FormulaParameterVersion[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface FormulaExpressionVersion {
  id: string;
  versionUID: string;
  parentExpressionId: string;
  version: string;
  expression: string;
  description?: string;
  validationRules?: string[];
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface FormulaExpression {
  id: string;
  uid: string;
  parentFormulaUID: string;
  name: string;
  description?: string;
  expression: string;
  outputUnit: string;
  versions: FormulaExpressionVersion[];
  createdAt: string;
  createdBy: 'admin';
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
  createdBy: 'admin';
  updatedAt?: string;
  updatedBy?: string;
}

interface MasterDBContextType {
  masterEFDefinitions: EFDefinition[];
  setMasterEFDefinitions: (definitions: EFDefinition[]) => void;
  masterFormulaDefinitions: FormulaDefinition[];
  setMasterFormulaDefinitions: (definitions: FormulaDefinition[]) => void;
  getMasterEFsForAssignment: () => {
    id: string;
    uid: string;
    name: string;
    category: string;
    country: string;
    description: string;
    impactCategories: string[];
    latestVersion: string;
    latestValue: { value: number; unit: string };
  }[];
  getMasterFormulasForAssignment: () => {
    id: string;
    uid: string;
    name: string;
    category: string;
    description: string;
    tags: string[];
    parameters: FormulaParameter[];
    expressions: FormulaExpression[];
    parametersCount: number;
    expressionsCount: number;
    status: string;
    latestVersion: string;
  }[];
}

// Master Formula Definitions with complete structure
const mockMasterFormulaDefinitions: FormulaDefinition[] = [
  {
    id: '1',
    uid: 'FORM-ENE-ELEC-2024-001',
    name: 'Electricity Consumption Emissions',
    category: 'Energy',
    description: 'Calculates CO2 emissions from electricity consumption using grid emission factors',
    tags: ['electricity', 'scope-2', 'energy', 'grid'],
    status: 'active',
    latestVersion: '1.0',
    customFieldValues: {},
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin',
    parameters: [
      {
        id: 'param_elec_consumption',
        parentFormulaUID: 'FORM-ENE-ELEC-2024-001',
        name: 'Electricity Consumption',
        type: 'number',
        unit: 'kWh',
        defaultValue: 0,
        description: 'Total electricity consumed in kilowatt hours',
        required: true,
        minValue: 0,
        parameterType: 'variable',
        versions: [{
          id: 'pv1',
          versionUID: 'param_elec_consumption_v1_0',
          parentParameterId: 'param_elec_consumption',
          version: '1.0',
          value: 0,
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param_grid_ef',
        parentFormulaUID: 'FORM-ENE-ELEC-2024-001',
        name: 'Grid Emission Factor',
        type: 'number',
        unit: 'kg CO2e/kWh',
        defaultValue: 0.4156,
        description: 'Electricity grid emission factor for the region',
        required: true,
        parameterType: 'ef_value',
        efSource: 'master_db',
        efCategory: 'Energy',
        efUID: 'EF-ENE-2024-0001',
        efDefinition: 'National Grid Electricity Mix - United States',
        versions: [{
          id: 'pv2',
          versionUID: 'param_grid_ef_v1_0',
          parentParameterId: 'param_grid_ef',
          version: '1.0',
          value: 0.4156,
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'expr_total_emissions',
        uid: 'EXPR-FORM-ENE-ELEC-2024-001-001',
        parentFormulaUID: 'FORM-ENE-ELEC-2024-001',
        name: 'Total CO2 Emissions',
        description: 'Calculates total emissions from electricity consumption',
        expression: 'Electricity_Consumption * Grid_Emission_Factor',
        outputUnit: 'kg CO2e',
        versions: [{
          id: 'ev1',
          versionUID: 'expr_total_emissions_v1_0',
          parentExpressionId: 'expr_total_emissions',
          version: '1.0',
          expression: 'Electricity_Consumption * Grid_Emission_Factor',
          description: 'Calculates total emissions from electricity consumption',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          createdBy: 'admin'
        }],
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
    createdAt: '2024-01-16T11:30:00Z',
    createdBy: 'admin',
    parameters: [
      {
        id: 'param_distance',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'Distance Traveled',
        type: 'number',
        unit: 'km',
        defaultValue: 0,
        description: 'Total distance traveled by vehicles',
        required: true,
        minValue: 0,
        parameterType: 'variable',
        versions: [{
          id: 'pv3',
          versionUID: 'param_distance_v1_0',
          parentParameterId: 'param_distance',
          version: '1.0',
          value: 0,
          isActive: true,
          createdAt: '2024-01-16T11:30:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-16T11:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param_vehicle_ef',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'Vehicle Emission Factor',
        type: 'number',
        unit: 'kg CO2e/km',
        defaultValue: 0.23,
        description: 'Emission factor per kilometer for vehicle type',
        required: true,
        parameterType: 'ef_value',
        efSource: 'master_db',
        efCategory: 'Transport',
        efUID: 'EF-TRA-2024-0007',
        efDefinition: 'Light Duty Vehicle - Gasoline',
        versions: [{
          id: 'pv4',
          versionUID: 'param_vehicle_ef_v1_0',
          parentParameterId: 'param_vehicle_ef',
          version: '1.0',
          value: 0.23,
          isActive: true,
          createdAt: '2024-01-16T11:30:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-16T11:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param_fuel_volume',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'Fuel Volume',
        type: 'number',
        unit: 'L',
        defaultValue: 0,
        description: 'Total fuel consumed in litres',
        required: false,
        minValue: 0,
        parameterType: 'variable',
        versions: [{
          id: 'pv5',
          versionUID: 'param_fuel_volume_v1_0',
          parentParameterId: 'param_fuel_volume',
          version: '1.0',
          value: 0,
          isActive: true,
          createdAt: '2024-01-16T11:30:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-16T11:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param_fuel_ef',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'Fuel Emission Factor',
        type: 'number',
        unit: 'kg CO2e/L',
        defaultValue: 2.68,
        description: 'Emission factor per litre of fuel',
        required: false,
        parameterType: 'variable',
        versions: [{
          id: 'pv6',
          versionUID: 'param_fuel_ef_v1_0',
          parentParameterId: 'param_fuel_ef',
          version: '1.0',
          value: 2.68,
          isActive: true,
          createdAt: '2024-01-16T11:30:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-16T11:30:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'expr_distance_emissions',
        uid: 'EXPR-FORM-TRA-VEH-2024-002-001',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'Distance-Based Emissions',
        description: 'Calculates emissions based on distance traveled',
        expression: 'Distance_Traveled * Vehicle_Emission_Factor',
        outputUnit: 'kg CO2e',
        versions: [{
          id: 'ev2',
          versionUID: 'expr_distance_emissions_v1_0',
          parentExpressionId: 'expr_distance_emissions',
          version: '1.0',
          expression: 'Distance_Traveled * Vehicle_Emission_Factor',
          description: 'Calculates emissions based on distance traveled',
          isActive: true,
          createdAt: '2024-01-16T11:30:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-16T11:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'expr_fuel_emissions',
        uid: 'EXPR-FORM-TRA-VEH-2024-002-002',
        parentFormulaUID: 'FORM-TRA-VEH-2024-002',
        name: 'Fuel-Based Emissions',
        description: 'Calculates emissions based on fuel consumption',
        expression: 'Fuel_Volume * Fuel_Emission_Factor',
        outputUnit: 'kg CO2e',
        versions: [{
          id: 'ev3',
          versionUID: 'expr_fuel_emissions_v1_0',
          parentExpressionId: 'expr_fuel_emissions',
          version: '1.0',
          expression: 'Fuel_Volume * Fuel_Emission_Factor',
          description: 'Calculates emissions based on fuel consumption',
          isActive: true,
          createdAt: '2024-01-16T11:30:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-16T11:30:00Z',
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
    createdAt: '2024-01-17T14:15:00Z',
    createdBy: 'admin',
    parameters: [
      {
        id: 'param_gas_volume',
        parentFormulaUID: 'FORM-FUE-NAT-2024-003',
        name: 'Natural Gas Volume',
        type: 'number',
        unit: 'm³',
        defaultValue: 0,
        description: 'Volume of natural gas consumed',
        required: true,
        minValue: 0,
        parameterType: 'variable',
        versions: [{
          id: 'pv7',
          versionUID: 'param_gas_volume_v1_0',
          parentParameterId: 'param_gas_volume',
          version: '1.0',
          value: 0,
          isActive: true,
          createdAt: '2024-01-17T14:15:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-17T14:15:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param_gas_ef',
        parentFormulaUID: 'FORM-FUE-NAT-2024-003',
        name: 'Natural Gas Emission Factor',
        type: 'number',
        unit: 'kg CO2e/m³',
        defaultValue: 1.9867,
        description: 'Emission factor for natural gas combustion',
        required: true,
        parameterType: 'ef_value',
        efSource: 'master_db',
        efCategory: 'Fuel',
        efUID: 'EF-FUE-GLB-2024-001',
        efDefinition: 'Natural Gas Combustion',
        versions: [{
          id: 'pv8',
          versionUID: 'param_gas_ef_v1_0',
          parentParameterId: 'param_gas_ef',
          version: '1.0',
          value: 1.9867,
          isActive: true,
          createdAt: '2024-01-17T14:15:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-17T14:15:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param_efficiency',
        parentFormulaUID: 'FORM-FUE-NAT-2024-003',
        name: 'Combustion Efficiency',
        type: 'number',
        unit: '%',
        defaultValue: 85,
        description: 'Efficiency of the combustion process',
        required: false,
        minValue: 0,
        maxValue: 100,
        parameterType: 'variable',
        versions: [{
          id: 'pv9',
          versionUID: 'param_efficiency_v1_0',
          parentParameterId: 'param_efficiency',
          version: '1.0',
          value: 85,
          isActive: true,
          createdAt: '2024-01-17T14:15:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-17T14:15:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'expr_gross_emissions',
        uid: 'EXPR-FORM-FUE-NAT-2024-003-001',
        parentFormulaUID: 'FORM-FUE-NAT-2024-003',
        name: 'Gross Emissions',
        description: 'Calculate emissions before efficiency adjustment',
        expression: 'Natural_Gas_Volume * Natural_Gas_Emission_Factor',
        outputUnit: 'kg CO2e',
        versions: [{
          id: 'ev4',
          versionUID: 'expr_gross_emissions_v1_0',
          parentExpressionId: 'expr_gross_emissions',
          version: '1.0',
          expression: 'Natural_Gas_Volume * Natural_Gas_Emission_Factor',
          description: 'Calculate emissions before efficiency adjustment',
          isActive: true,
          createdAt: '2024-01-17T14:15:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-17T14:15:00Z',
        createdBy: 'admin'
      },
      {
        id: 'expr_net_emissions',
        uid: 'EXPR-FORM-FUE-NAT-2024-003-002',
        parentFormulaUID: 'FORM-FUE-NAT-2024-003',
        name: 'Net Emissions',
        description: 'Calculate emissions adjusted for combustion efficiency',
        expression: 'Natural_Gas_Volume * Natural_Gas_Emission_Factor * (Combustion_Efficiency / 100)',
        outputUnit: 'kg CO2e',
        versions: [{
          id: 'ev5',
          versionUID: 'expr_net_emissions_v1_0',
          parentExpressionId: 'expr_net_emissions',
          version: '1.0',
          expression: 'Natural_Gas_Volume * Natural_Gas_Emission_Factor * (Combustion_Efficiency / 100)',
          description: 'Calculate emissions adjusted for combustion efficiency',
          isActive: true,
          createdAt: '2024-01-17T14:15:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-17T14:15:00Z',
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
    createdAt: '2024-01-18T09:20:00Z',
    createdBy: 'admin',
    parameters: [
      {
        id: 'param_cargo_weight',
        parentFormulaUID: 'FORM-TRA-FRE-2024-004',
        name: 'Cargo Weight',
        type: 'number',
        unit: 'tonnes',
        defaultValue: 0,
        description: 'Weight of cargo transported',
        required: true,
        minValue: 0,
        parameterType: 'variable',
        versions: [{
          id: 'pv10',
          versionUID: 'param_cargo_weight_v1_0',
          parentParameterId: 'param_cargo_weight',
          version: '1.0',
          value: 0,
          isActive: true,
          createdAt: '2024-01-18T09:20:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-18T09:20:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param_freight_distance',
        parentFormulaUID: 'FORM-TRA-FRE-2024-004',
        name: 'Transport Distance',
        type: 'number',
        unit: 'km',
        defaultValue: 0,
        description: 'Distance transported',
        required: true,
        minValue: 0,
        parameterType: 'variable',
        versions: [{
          id: 'pv11',
          versionUID: 'param_freight_distance_v1_0',
          parentParameterId: 'param_freight_distance',
          version: '1.0',
          value: 0,
          isActive: true,
          createdAt: '2024-01-18T09:20:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-18T09:20:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param_freight_ef',
        parentFormulaUID: 'FORM-TRA-FRE-2024-004',
        name: 'Freight Emission Factor',
        type: 'number',
        unit: 'kg CO2e/tkm',
        defaultValue: 0.89,
        description: 'Emission factor per tonne-kilometer',
        required: true,
        parameterType: 'ef_value',
        efSource: 'master_db',
        efCategory: 'Transport',
        efUID: 'EF-TRA-UK-2024-005',
        efDefinition: 'Heavy Duty Vehicle Transport',
        versions: [{
          id: 'pv12',
          versionUID: 'param_freight_ef_v1_0',
          parentParameterId: 'param_freight_ef',
          version: '1.0',
          value: 0.89,
          isActive: true,
          createdAt: '2024-01-18T09:20:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-18T09:20:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'expr_freight_tkm',
        uid: 'EXPR-FORM-TRA-FRE-2024-004-001',
        parentFormulaUID: 'FORM-TRA-FRE-2024-004',
        name: 'Tonne-Kilometers',
        description: 'Calculate total tonne-kilometers',
        expression: 'Cargo_Weight * Transport_Distance',
        outputUnit: 'tkm',
        versions: [{
          id: 'ev6',
          versionUID: 'expr_freight_tkm_v1_0',
          parentExpressionId: 'expr_freight_tkm',
          version: '1.0',
          expression: 'Cargo_Weight * Transport_Distance',
          description: 'Calculate total tonne-kilometers',
          isActive: true,
          createdAt: '2024-01-18T09:20:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-18T09:20:00Z',
        createdBy: 'admin'
      },
      {
        id: 'expr_freight_emissions',
        uid: 'EXPR-FORM-TRA-FRE-2024-004-002',
        parentFormulaUID: 'FORM-TRA-FRE-2024-004',
        name: 'Total Freight Emissions',
        description: 'Calculate total emissions from freight transport',
        expression: 'Cargo_Weight * Transport_Distance * Freight_Emission_Factor',
        outputUnit: 'kg CO2e',
        versions: [{
          id: 'ev7',
          versionUID: 'expr_freight_emissions_v1_0',
          parentExpressionId: 'expr_freight_emissions',
          version: '1.0',
          expression: 'Cargo_Weight * Transport_Distance * Freight_Emission_Factor',
          description: 'Calculate total emissions from freight transport',
          isActive: true,
          createdAt: '2024-01-18T09:20:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-18T09:20:00Z',
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
    createdAt: '2024-01-19T16:45:00Z',
    createdBy: 'admin',
    parameters: [
      {
        id: 'param_waste_mass',
        parentFormulaUID: 'FORM-WAS-ORG-2024-005',
        name: 'Waste Mass',
        type: 'number',
        unit: 'tonnes',
        defaultValue: 0,
        description: 'Mass of organic waste disposed',
        required: true,
        minValue: 0,
        parameterType: 'variable',
        versions: [{
          id: 'pv13',
          versionUID: 'param_waste_mass_v1_0',
          parentParameterId: 'param_waste_mass',
          version: '1.0',
          value: 0,
          isActive: true,
          createdAt: '2024-01-19T16:45:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-19T16:45:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param_methane_potential',
        parentFormulaUID: 'FORM-WAS-ORG-2024-005',
        name: 'Methane Generation Potential',
        type: 'number',
        unit: 'm³ CH4/tonne',
        defaultValue: 170,
        description: 'Potential methane generation per tonne of waste',
        required: true,
        parameterType: 'variable',
        versions: [{
          id: 'pv14',
          versionUID: 'param_methane_potential_v1_0',
          parentParameterId: 'param_methane_potential',
          version: '1.0',
          value: 170,
          isActive: true,
          createdAt: '2024-01-19T16:45:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-19T16:45:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param_methane_gwp',
        parentFormulaUID: 'FORM-WAS-ORG-2024-005',
        name: 'Methane GWP Factor',
        type: 'number',
        unit: 'kg CO2e/kg CH4',
        defaultValue: 25,
        description: 'Global Warming Potential factor for methane (100-year)',
        required: true,
        parameterType: 'variable',
        versions: [{
          id: 'pv15',
          versionUID: 'param_methane_gwp_v1_0',
          parentParameterId: 'param_methane_gwp',
          version: '1.0',
          value: 25,
          isActive: true,
          createdAt: '2024-01-19T16:45:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-19T16:45:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param_conversion_factor',
        parentFormulaUID: 'FORM-WAS-ORG-2024-005',
        name: 'CH4 Conversion Factor',
        type: 'number',
        unit: 'kg CH4/kg waste',
        defaultValue: 0.0007,
        description: 'Conversion factor for organic waste to methane generation',
        required: true,
        parameterType: 'variable',
        versions: [{
          id: 'pv16',
          versionUID: 'param_conversion_factor_v1_0',
          parentParameterId: 'param_conversion_factor',
          version: '1.0',
          value: 0.0007,
          isActive: true,
          createdAt: '2024-01-19T16:45:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-19T16:45:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'expr_waste_emissions',
        uid: 'EXPR-FORM-WAS-ORG-2024-005-001',
        parentFormulaUID: 'FORM-WAS-ORG-2024-005',
        name: 'Waste Disposal Emissions',
        description: 'Calculate CO2 equivalent emissions from organic waste disposal',
        expression: 'Waste_Mass * Methane_Generation_Potential * CH4_Conversion_Factor * Methane_GWP_Factor',
        outputUnit: 'kg CO2e',
        versions: [{
          id: 'ev8',
          versionUID: 'expr_waste_emissions_v1_0',
          parentExpressionId: 'expr_waste_emissions',
          version: '1.0',
          expression: 'Waste_Mass * Methane_Generation_Potential * CH4_Conversion_Factor * Methane_GWP_Factor',
          description: 'Calculate CO2 equivalent emissions from organic waste disposal',
          isActive: true,
          createdAt: '2024-01-19T16:45:00Z',
          createdBy: 'admin'
        }],
        createdAt: '2024-01-19T16:45:00Z',
        createdBy: 'admin'
      }
    ]
  }
];

export const MasterDBContext = createContext<MasterDBContextType | undefined>(undefined);

export function MasterDBProvider({ children }: { children: React.ReactNode }) {
  const [masterEFDefinitions, setMasterEFDefinitions] = useState<EFDefinition[]>(mockMasterEFDefinitions);
  const [masterFormulaDefinitions, setMasterFormulaDefinitions] = useState<FormulaDefinition[]>(mockMasterFormulaDefinitions);

  // Sample Master Formula Definitions (simplified for assignment purposes)
  const sampleFormulas = [
    {
      id: '1',
      uid: 'FORM-ENE-GEN-2024-001',
      name: 'Electricity Consumption Emissions',
      category: 'Energy',
      description: 'Calculates CO2 emissions from electricity consumption using grid emission factors',
      tags: ['electricity', 'scope-2', 'energy'],
      parametersCount: 2,
      expressionsCount: 1,
      status: 'active',
      latestVersion: '1.0'
    },
    {
      id: '2',
      uid: 'FORM-TRA-VEH-2024-002',
      name: 'Vehicle Fleet Emissions',
      category: 'Transport',
      description: 'Calculates emissions from vehicle fleet based on distance traveled and fuel consumption',
      tags: ['transport', 'vehicles', 'scope-1', 'fleet'],
      parametersCount: 4,
      expressionsCount: 2,
      status: 'active',
      latestVersion: '1.0'
    },
    {
      id: '3',
      uid: 'FORM-FUE-NAT-2024-003',
      name: 'Natural Gas Combustion',
      category: 'Fuel',
      description: 'Calculates CO2 emissions from natural gas combustion for heating and industrial processes',
      tags: ['natural-gas', 'scope-1', 'heating', 'industrial'],
      parametersCount: 3,
      expressionsCount: 2,
      status: 'active',
      latestVersion: '1.0'
    },
    {
      id: '4',
      uid: 'FORM-TRA-FRE-2024-004',
      name: 'Freight Transportation',
      category: 'Transport',
      description: 'Calculates emissions from freight transportation by road, rail, sea, or air',
      tags: ['freight', 'logistics', 'scope-3', 'transport'],
      parametersCount: 3,
      expressionsCount: 2,
      status: 'active',
      latestVersion: '1.0'
    },
    {
      id: '5',
      uid: 'FORM-WAS-ORG-2024-005',
      name: 'Organic Waste Disposal',
      category: 'Waste',
      description: 'Calculates methane emissions from organic waste disposal in landfills',
      tags: ['waste', 'methane', 'scope-3', 'landfill'],
      parametersCount: 4,
      expressionsCount: 1,
      status: 'active',
      latestVersion: '1.0'
    }
  ];

  const getMasterEFsForAssignment = () => {
    return masterEFDefinitions
      .filter(ef => ef.status === 'active')
      .map(ef => {
        // Get the first data row for value and unit
        const firstDataRow = ef.coreDataRows[0];
        
        // Get unique countries from all data rows
        const countries = [...new Set(ef.coreDataRows.map(row => row.country))];
        const country = countries.length === 1 ? countries[0] : 'Multiple';
        
        // Get unique impact categories
        const impactCategories = [...new Set(ef.coreDataRows.map(row => row.impactCategory))];
        
        return {
          id: ef.id,
          uid: ef.uid,
          name: ef.name,
          category: ef.ipccCategory,
          country: country,
          description: `${ef.ipccCategory}`,
          impactCategories: impactCategories,
          latestVersion: '1.0',
          latestValue: {
            value: firstDataRow?.value || 0,
            unit: firstDataRow?.impactUnit || 'kg CO2e'
          }
        };
      });
  };

  const getMasterFormulasForAssignment = () => {
    return masterFormulaDefinitions
      .filter(formula => formula.status === 'active')
      .map(formula => ({
        id: formula.id,
        uid: formula.uid,
        name: formula.name,
        category: formula.category,
        description: formula.description,
        tags: formula.tags,
        parameters: formula.parameters,
        expressions: formula.expressions,
        parametersCount: formula.parameters.length,
        expressionsCount: formula.expressions.length,
        status: formula.status,
        latestVersion: formula.latestVersion
      }));
  };

  return (
    <MasterDBContext.Provider value={{
      masterEFDefinitions,
      setMasterEFDefinitions,
      masterFormulaDefinitions,
      setMasterFormulaDefinitions,
      getMasterEFsForAssignment,
      getMasterFormulasForAssignment
    }}>
      {children}
    </MasterDBContext.Provider>
  );
}

export function useMasterDB() {
  const context = useContext(MasterDBContext);
  if (context === undefined) {
    throw new Error('useMasterDB must be used within a MasterDBProvider');
  }
  return context;
}

export type { EFDefinition, CoreDataRow, FormulaDefinition, FormulaParameter, FormulaExpression };