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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Calendar } from '../ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { 
  Plus, 
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
  uid: string;
  parentEFUID: string;
  value: number;
  impactCategory: string;
  impactUnit: string;
  functionalUnit: string[];
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
  source: 'master' | 'client';
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
  'km',
  'piece'
];

// Helper functions
const generateEFUID = (category: string, sequence: number): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  return `EF-CDB-${categoryCode}-${year}-${sequence.toString().padStart(4, '0')}`;
};

const generateDataRowUID = (parentEFUID: string, sequence: number): string => {
  return `DR-${parentEFUID}-${sequence.toString().padStart(3, '0')}`;
};

// Sample client-created EF data
const mockClientEFDefinitions: EFDefinition[] = [
  {
    id: 'client-1',
    uid: 'EF-CDB-ENE-2025-0001',
    name: 'Custom Solar Panel Manufacturing',
    ipccCategory: 'Energy',
    functionalUnit: 'unit',
    tags: ['solar', 'renewable', 'manufacturing', 'custom'],
    status: 'active',
    database: 'client',
    source: 'client',
    createdBy: 'SA User',
    createdAt: '2025-01-15T09:00:00Z',
    flexibleAttributes: {
      'Process Type': 'Photovoltaic',
      'Efficiency Rating': '18%'
    },
    coreDataRows: [
      {
        id: 'client-row1',
        uid: 'DR-EF-CDB-ENE-2025-0001-001',
        parentEFUID: 'EF-CDB-ENE-2025-0001',
        value: 1250.5,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: 'unit',
        referenceName: 'Internal LCA Study 2024',
        country: 'United States',
        region: 'North America',
        referenceDate: '2024-12-01',
        createdAt: '2025-01-15T09:00:00Z',
        createdBy: 'SA User'
      }
    ]
  },
  {
    id: 'client-2',
    uid: 'EF-CDB-IND-2025-0001',
    name: 'Custom Aluminum Recycling Process',
    ipccCategory: 'Industrial Processes and Product Use (IPPU)',
    functionalUnit: 'kg',
    tags: ['aluminum', 'recycling', 'circular-economy'],
    status: 'active',
    database: 'client',
    source: 'client',
    createdBy: 'SA User',
    createdAt: '2025-02-10T14:30:00Z',
    flexibleAttributes: {
      'Recovery Rate': '95%',
      'Source Material': 'Post-Consumer'
    },
    coreDataRows: [
      {
        id: 'client-row2a',
        uid: 'DR-EF-CDB-IND-2025-0001-001',
        parentEFUID: 'EF-CDB-IND-2025-0001',
        value: 0.385,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: 'kg',
        referenceName: 'Company Sustainability Report 2024',
        country: 'Germany',
        region: 'Europe',
        referenceDate: '2024-11-15',
        createdAt: '2025-02-10T14:30:00Z',
        createdBy: 'SA User'
      },
      {
        id: 'client-row2b',
        uid: 'DR-EF-CDB-IND-2025-0001-002',
        parentEFUID: 'EF-CDB-IND-2025-0001',
        value: 0.012,
        impactCategory: 'Energy (ENERGY)',
        impactUnit: 'kJ',
        functionalUnit: 'kg',
        referenceName: 'Environmental Impact Assessment',
        country: 'Germany',
        region: 'Europe',
        referenceDate: '2024-11-20',
        createdAt: '2025-02-10T14:35:00Z',
        createdBy: 'SA User'
      }
    ]
  },
  {
    id: 'client-3',
    uid: 'EF-CDB-AGR-2025-0001',
    name: 'Organic Wheat Cultivation - Local',
    ipccCategory: 'Agriculture, Forestry and Other Land Use (AFOLU)',
    functionalUnit: 'kg',
    tags: ['agriculture', 'organic', 'wheat', 'crops'],
    status: 'draft',
    database: 'client',
    source: 'client',
    createdBy: 'SA User',
    createdAt: '2025-03-05T11:20:00Z',
    flexibleAttributes: {
      'Farming Method': 'Organic',
      'Irrigation Type': 'Drip',
      'Yield': '3.5 tonnes/ha'
    },
    coreDataRows: [
      {
        id: 'client-row3',
        uid: 'DR-EF-CDB-AGR-2025-0001-001',
        parentEFUID: 'EF-CDB-AGR-2025-0001',
        value: 0.125,
        impactCategory: 'Climate Change - total (GWP)',
        impactUnit: 'kgCO2 eq',
        functionalUnit: 'kg',
        referenceName: 'Local Farm Data Collection',
        country: 'Canada',
        region: 'North America',
        referenceDate: '2025-01-10',
        createdAt: '2025-03-05T11:20:00Z',
        createdBy: 'SA User'
      }
    ]
  }
];

export function CDBEmissionFactors() {
  // Get Master DB EFs
  const { masterEFDefinitions } = useMasterDB();
  
  // Client-specific EFs (initialize with mock data)
  const [clientEFDefinitions, setClientEFDefinitions] = useState<EFDefinition[]>(mockClientEFDefinitions);
  
  // Combine Master DB and Client EFs
  const allEFDefinitions: EFDefinition[] = [
    ...masterEFDefinitions.map(ef => ({ ...ef, source: 'master' as const })),
    ...clientEFDefinitions
  ];

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
    functionalUnit: '',
    tags: [] as string[],
    flexibleAttributes: [] as { key: string; value: string }[]
  });
  
  const [dataRowFormData, setDataRowFormData] = useState({
    value: '',
    impactCategory: '',
    impactUnit: '',
    functionalUnit: [] as string[],
    referenceName: '',
    referenceURL: '',
    country: '',
    region: '',
    referenceDate: undefined as Date | undefined
  });

  // Filtered data
  const filteredEFs = allEFDefinitions.filter(ef => {
    const matchesSearch = ef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ef.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ef.ipccCategory === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Helper functions
  const getTotalDataRows = (ef: EFDefinition) => ef.coreDataRows.length;
  
  const copyUID = async (uid: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(uid);
        toast.success('UID copied to clipboard');
        return;
      }
      
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
      functionalUnit: '',
      tags: [],
      flexibleAttributes: []
    });
  };

  const resetDataRowForm = () => {
    setDataRowFormData({
      value: '',
      impactCategory: '',
      impactUnit: '',
      functionalUnit: [],
      referenceName: '',
      referenceURL: '',
      country: '',
      region: '',
      referenceDate: undefined
    });
  };

  const toggleEFExpansion = (efId: string) => {
    const newExpanded = new Set(expandedEFs);
    if (newExpanded.has(efId)) {
      newExpanded.delete(efId);
    } else {
      newExpanded.add(efId);
    }
    setExpandedEFs(newExpanded);
  };

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

    const sequence = clientEFDefinitions.length + 1;
    const newUID = generateEFUID(efFormData.ipccCategory, sequence);
    
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
      database: 'client',
      source: 'client',
      createdBy: 'SA User',
      createdAt: new Date().toISOString(),
      coreDataRows: []
    };

    setClientEFDefinitions([...clientEFDefinitions, newEF]);
    setIsCreateEFDialogOpen(false);
    resetEFForm();
    toast.success(`EF Definition created with UID: ${newUID}`);
  };

  const handleEditEF = (ef: EFDefinition) => {
    if (ef.source === 'master') {
      toast.error('Cannot edit Master DB emission factors');
      return;
    }
    
    setSelectedEF(ef);
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
      updatedBy: 'SA User'
    };

    setClientEFDefinitions(clientEFDefinitions.map(ef => 
      ef.id === selectedEF.id ? updatedEF : ef
    ));

    setIsEditEFDialogOpen(false);
    setSelectedEF(null);
    resetEFForm();
    toast.success(`EF Definition updated successfully`);
  };

  const handleDeleteEF = (ef: EFDefinition) => {
    if (ef.source === 'master') {
      toast.error('Cannot delete Master DB emission factors');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${ef.name}"? This will also delete all associated data rows.`)) {
      setClientEFDefinitions(clientEFDefinitions.filter(e => e.id !== ef.id));
      toast.success(`EF Definition deleted successfully`);
    }
  };

  // Data Row handlers
  const handleAddDataRowClick = (ef: EFDefinition) => {
    if (ef.source === 'master') {
      toast.error('Cannot add data rows to Master DB emission factors');
      return;
    }
    
    setSelectedEF(ef);
    resetDataRowForm();
    setIsAddDataRowDialogOpen(true);
  };

  const handleAddDataRow = () => {
    if (!selectedEF || !dataRowFormData.value || !dataRowFormData.impactCategory || 
        !dataRowFormData.impactUnit || dataRowFormData.functionalUnit.length === 0 || 
        !dataRowFormData.referenceName || !dataRowFormData.country || 
        !dataRowFormData.referenceDate) {
      toast.error('Please fill in all required fields');
      return;
    }

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
      createdBy: 'SA User'
    };

    const updatedEF = {
      ...selectedEF,
      coreDataRows: [...selectedEF.coreDataRows, newDataRow]
    };

    setClientEFDefinitions(clientEFDefinitions.map(ef => 
      ef.id === selectedEF.id ? updatedEF : ef
    ));

    setIsAddDataRowDialogOpen(false);
    setSelectedEF(null);
    resetDataRowForm();
    toast.success(`Data row added with UID: ${dataRowUID}`);
  };

  const handleEditDataRow = (dataRow: CoreDataRow) => {
    const parentEF = allEFDefinitions.find(ef => ef.uid === dataRow.parentEFUID);
    if (parentEF?.source === 'master') {
      toast.error('Cannot edit data rows from Master DB emission factors');
      return;
    }
    
    setSelectedDataRow(dataRow);
    setDataRowFormData({
      value: dataRow.value.toString(),
      impactCategory: dataRow.impactCategory,
      impactUnit: dataRow.impactUnit,
      functionalUnit: dataRow.functionalUnit || [],
      referenceName: dataRow.referenceName,
      referenceURL: dataRow.referenceURL || '',
      country: dataRow.country,
      region: dataRow.region,
      referenceDate: typeof dataRow.referenceDate === 'string' ? new Date(dataRow.referenceDate) : dataRow.referenceDate
    });
    setIsEditDataRowDialogOpen(true);
  };

  const handleUpdateDataRow = () => {
    if (!selectedDataRow || !dataRowFormData.value || !dataRowFormData.impactCategory || 
        !dataRowFormData.impactUnit || dataRowFormData.functionalUnit.length === 0 || 
        !dataRowFormData.referenceName || !dataRowFormData.country || 
        !dataRowFormData.referenceDate) {
      toast.error('Please fill in all required fields');
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

    const updatedEF = clientEFDefinitions.find(ef => ef.uid === selectedDataRow.parentEFUID);
    if (updatedEF) {
      const updatedEFWithRow = {
        ...updatedEF,
        coreDataRows: updatedEF.coreDataRows.map(row => 
          row.id === selectedDataRow.id ? updatedDataRow : row
        )
      };

      setClientEFDefinitions(clientEFDefinitions.map(ef => 
        ef.id === updatedEF.id ? updatedEFWithRow : ef
      ));
    }

    setIsEditDataRowDialogOpen(false);
    setSelectedDataRow(null);
    resetDataRowForm();
    toast.success(`Data row updated successfully`);
  };

  const handleDeleteDataRow = (dataRow: CoreDataRow) => {
    const parentEF = allEFDefinitions.find(ef => ef.uid === dataRow.parentEFUID);
    if (parentEF?.source === 'master') {
      toast.error('Cannot delete data rows from Master DB emission factors');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete this data row? This action cannot be undone.`)) {
      const updatedEF = clientEFDefinitions.find(ef => ef.uid === dataRow.parentEFUID);
      if (updatedEF) {
        const updatedEFWithoutRow = {
          ...updatedEF,
          coreDataRows: updatedEF.coreDataRows.filter(row => row.id !== dataRow.id)
        };

        setClientEFDefinitions(clientEFDefinitions.map(ef => 
          ef.id === updatedEF.id ? updatedEFWithoutRow : ef
        ));
      }
      toast.success(`Data row deleted successfully`);
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
              <p className="text-gray-600">Manage EF definitions with core data rows</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
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
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              {allEFDefinitions.filter(ef => ef.source === 'master').length} from Master DB
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-300">
              {allEFDefinitions.filter(ef => ef.source === 'client').length} Client Created
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
              const borderColor = ef.source === 'master' ? 'border-l-blue-500' : 'border-l-emerald-500';
              
              return (
              <React.Fragment key={ef.id}>
                {/* EF Definition Row */}
                <TableRow className={`border-l-4 ${borderColor} hover:bg-emerald-100 transition-all duration-200 ${
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <Database className={`h-4 w-4 ${ef.source === 'master' ? 'text-blue-600' : 'text-emerald-600'}`} />
                        <span>{ef.name}</span>
                        {ef.source === 'master' ? (
                          <Badge className="bg-blue-100 text-blue-700 text-xs border border-blue-300">Master DB</Badge>
                        ) : (
                          <Badge className="bg-purple-100 text-purple-700 text-xs border border-purple-300">Client EF</Badge>
                        )}
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
                        disabled={ef.source === 'master'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteEF(ef)}
                        title="Delete EF Definition"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={ef.source === 'master'}
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
                        disabled={ef.source === 'master'}
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
                          <span className="text-sm">{dataRow.referenceName} ({dataRow.impactUnit}/{dataRow.functionalUnit})</span>
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
                          disabled={ef.source === 'master'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDataRow(dataRow)}
                          title="Delete Data Row"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={ef.source === 'master'}
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
              
              <div className="space-y-2">
                <Label>Functional Unit * <span className="text-xs text-gray-500">(Select multiple)</span></Label>
                <div className="border border-emerald-200 rounded-md p-3 max-h-40 overflow-y-auto bg-white">
                  {functionalUnits.length > 0 ? (
                    <div className="space-y-2">
                      {functionalUnits.map(unit => (
                        <div key={unit} className="flex items-center space-x-2">
                          <Checkbox
                            id={`fu-add-${unit}`}
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
                          <Label htmlFor={`fu-add-${unit}`} className="cursor-pointer text-sm font-normal">
                            {unit}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No functional units available</p>
                  )}
                </div>
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
              
              <div className="space-y-2">
                <Label>Functional Unit * <span className="text-xs text-gray-500">(Select multiple)</span></Label>
                <div className="border border-emerald-200 rounded-md p-3 max-h-40 overflow-y-auto bg-white">
                  {functionalUnits.length > 0 ? (
                    <div className="space-y-2">
                      {functionalUnits.map(unit => (
                        <div key={unit} className="flex items-center space-x-2">
                          <Checkbox
                            id={`fu-edit-${unit}`}
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
                          <Label htmlFor={`fu-edit-${unit}`} className="cursor-pointer text-sm font-normal">
                            {unit}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No functional units available</p>
                  )}
                </div>
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
