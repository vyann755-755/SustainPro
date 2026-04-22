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
  DialogTrigger,
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
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  GitBranch,
  ExternalLink,
  Settings,
  X,
  Calendar,
  Hash,
  Type,
  ChevronDown,
  Database,
  Sparkles,
  Copy,
  Eye,
  Globe,
  Building,
  MapPin,
  Clock,
  Link,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  Layers,
  MoreVertical,
  ChevronRight,
  TreePine
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Custom field types
type CustomFieldType = 'text' | 'number' | 'date' | 'dropdown' | 'boolean' | 'textarea';

interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[]; // for dropdown type
  defaultValue?: string;
}

// New Data Structure for Hierarchical Flow
interface CoreDataRow {
  id: string;
  parentEFUID: string;
  year: number;
  country: string;
  region: string;
  sector: string;
  subSector: string;
  unit: string;
  impactCategory?: string;
  impactUnit?: string;
  functionalUnit?: string;
  uncertainty?: number;
  geographicScope: 'global' | 'national' | 'regional' | 'local';
  technologyScope: 'average' | 'best' | 'worst' | 'specific';
  timeScope: 'current' | 'historical' | 'forecast';
  sourceName: string;
  sourceURL?: string;
  methodology?: string;
  sourceType: 'primary' | 'secondary' | 'tertiary';
  notes?: string;
  systemBoundary?: string;
  allocationMethod?: string;
  derivationReason?: string;
  versions: DataVersion[];
  createdAt: string;
  createdBy: string;
}

interface DataVersion {
  id: string;
  versionUID: string;
  parentRowId: string;
  version: string;
  value: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  notes?: string;
}

interface EFDefinition {
  id: string;
  uid: string;
  name: string;
  category: string;
  country: string;
  tags: string[];
  status: 'draft' | 'active' | 'archived';
  description: string;
  impactCategories: string[];
  database: string;
  createdBy: string;
  createdAt: string;
  customAttributes?: Record<string, any>;
  coreDataRows: CoreDataRow[];
  updatedAt?: string;
  updatedBy?: string;
}

// UID Generation Helpers
const generateEFUID = (category: string, country: string, year: number, sequence: number): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const countryCode = country === 'Global' ? 'GLB' : country.substring(0, 3).toUpperCase();
  return `EF-${categoryCode}-${countryCode}-${year}-${sequence.toString().padStart(3, '0')}`;
};

const generateVersionUID = (parentRowId: string, version: string): string => {
  return `${parentRowId}-V${version}`;
};

// Mock Data
const mockEFDefinitions: EFDefinition[] = [
  {
    id: '1',
    uid: 'EF-ENE-USA-2024-001',
    name: 'Electricity Grid Mix - US',
    category: 'Energy',
    country: 'United States',
    tags: ['electricity', 'grid', 'scope-2'],
    status: 'active',
    description: 'US national average electricity grid emission factor',
    impactCategories: ['GWP-100', 'GWP-20'],
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    coreDataRows: [
      {
        id: 'row1',
        parentEFUID: 'EF-ENE-USA-2024-001',
        year: 2024,
        country: 'United States',
        region: 'National',
        sector: 'Power Generation',
        subSector: 'Grid Mix',
        unit: 'kgCO2e/kWh',
        impactCategory: 'Climate Change - total',
        impactUnit: 'kgCO2e',
        functionalUnit: 'kWh',
        uncertainty: 15,
        geographicScope: 'national',
        technologyScope: 'average',
        timeScope: 'current',
        sourceName: 'EPA eGRID',
        sourceURL: 'https://www.epa.gov/egrid',
        sourceType: 'primary',
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin',
        versions: [
          {
            id: 'v1',
            versionUID: 'row1-V1.0',
            parentRowId: 'row1',
            version: '1.0',
            value: 0.4207,
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
            createdBy: 'admin'
          },
          {
            id: 'v2',
            versionUID: 'row1-V2.0',
            parentRowId: 'row1',
            version: '2.0',
            value: 0.4156,
            isActive: false,
            createdAt: '2024-02-15T10:00:00Z',
            createdBy: 'admin',
            notes: 'Updated with latest EPA data'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    uid: 'EF-FUE-GLB-2024-001',
    name: 'Natural Gas Combustion',
    category: 'Fuel',
    country: 'Global',
    tags: ['natural-gas', 'combustion', 'scope-1'],
    status: 'active',
    description: 'Direct combustion of natural gas',
    impactCategories: ['GWP-100'],
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-10T08:30:00Z',
    coreDataRows: [
      {
        id: 'row2',
        parentEFUID: 'EF-FUE-GLB-2024-001',
        year: 2024,
        country: 'Global',
        region: 'Global',
        sector: 'Industrial',
        subSector: 'Direct Combustion',
        unit: 'kg CO2e/m³',
        uncertainty: 10,
        geographicScope: 'global',
        technologyScope: 'average',
        timeScope: 'current',
        sourceName: 'IPCC 2006 Guidelines',
        sourceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        sourceType: 'secondary',
        createdAt: '2024-01-10T08:30:00Z',
        createdBy: 'admin',
        versions: [
          {
            id: 'v1',
            versionUID: 'row2-V1.0',
            parentRowId: 'row2',
            version: '1.0',
            value: 1.9867,
            isActive: true,
            createdAt: '2024-01-10T08:30:00Z',
            createdBy: 'admin'
          }
        ]
      }
    ]
  }
];

const countries = ['Global', 'United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia', 'Japan'];
const categories = ['Energy', 'Fuel', 'Transport', 'Materials', 'Waste', 'Agriculture', 'Industrial Process'];
const impactCategories = ['GWP-100', 'GWP-20', 'AP', 'EP', 'ODP', 'POCP', 'ADP', 'FAETP'];
const units = ['kg CO2e/kWh', 'kg CO2e/m³', 'kg CO2e/kg', 'kg CO2e/L', 'kg CO2e/tkm', 'kg CO2e/t', 'kg CO2e/MJ'];
const sectors = ['Power Generation', 'Industrial', 'Residential', 'Commercial', 'Transportation', 'Agriculture'];
const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
const sourceTypes = ['primary', 'secondary', 'tertiary'];
const geographicScopes = ['global', 'national', 'regional', 'local'];
const technologyScopes = ['average', 'best', 'worst', 'specific'];
const timeScopes = ['current', 'historical', 'forecast'];

// Impact Category to Impact Unit Mapping
const impactCategoryToUnitMapping: Record<string, string> = {
  'Climate Change - total': 'kgCO2e',
  'Climate Change - CO2': 'kgCO2',
  'Climate Change - CH4': 'kgCH4',
  'Climate Change - N2O': 'kgN2O',
  'Energy': 'kJ',
  'Water': 'm3',
  'Waste': 'kg'
};

// Updated impact categories list for data rows
const impactCategoriesList = [
  'Climate Change - total',
  'Climate Change - CO2',
  'Climate Change - CH4',
  'Climate Change - N2O',
  'Energy',
  'Water',
  'Waste'
];

// Functional units list
const functionalUnits = ['kg', 'kWh', 'L', 't', 'km', 'm3', 'MJ', 'unit'];

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  date: Calendar,
  dropdown: ChevronDown,
  boolean: Checkbox,
  textarea: Type
};

export function EmissionFactors() {
  const [efDefinitions, setEFDefinitions] = useState<EFDefinition[]>(mockEFDefinitions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  
  // Expansion states for hierarchical table
  const [expandedEFs, setExpandedEFs] = useState<Set<string>>(new Set());
  const [expandedDataRows, setExpandedDataRows] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isCreateEFDialogOpen, setIsCreateEFDialogOpen] = useState(false);
  const [isAddDataRowDialogOpen, setIsAddDataRowDialogOpen] = useState(false);
  const [isAddVersionDialogOpen, setIsAddVersionDialogOpen] = useState(false);
  const [isCustomFieldDialogOpen, setIsCustomFieldDialogOpen] = useState(false);
  const [isEditEFDialogOpen, setIsEditEFDialogOpen] = useState(false);
  
  // Selected items
  const [selectedEF, setSelectedEF] = useState<EFDefinition | null>(null);
  const [selectedDataRow, setSelectedDataRow] = useState<CoreDataRow | null>(null);
  
  // Custom fields state
  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: '1',
      name: 'Creator',
      type: 'text',
      required: true,
      defaultValue: ''
    },
    {
      id: '2',
      name: 'Data Source',
      type: 'dropdown',
      required: false,
      options: ['IPCC', 'EPA', 'DEFRA', 'IEA', 'Custom'],
      defaultValue: 'IPCC'
    }
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');
  
  // Form data states
  const [efFormData, setEFFormData] = useState({
    name: '',
    category: '',
    country: '',
    description: '',
    impactCategories: [] as string[],
    tags: [] as string[],
    customFieldValues: {} as Record<string, any>
  });

  const [dataRowFormData, setDataRowFormData] = useState({
    year: new Date().getFullYear(),
    country: '',
    region: '',
    sector: '',
    subSector: '',
    unit: '',
    uncertainty: '',
    geographicScope: 'national' as const,
    technologyScope: 'average' as const,
    timeScope: 'current' as const,
    sourceName: '',
    sourceURL: '',
    methodology: '',
    sourceType: 'primary' as const,
    notes: '',
    functionalUnit: [] as string[],
    systemBoundary: '',
    allocationMethod: '',
    derivationReason: '',
    initialValue: '',
    impactCategory: '',
    impactUnit: ''
  });

  const [versionFormData, setVersionFormData] = useState({
    value: '',
    notes: ''
  });

  const filteredEFs = efDefinitions.filter(ef => {
    const matchesSearch = ef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ef.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || !selectedCountry || ef.country === selectedCountry;
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || ef.category === selectedCategory;
    const matchesDatabase = selectedDatabase === 'all' || !selectedDatabase || ef.database === selectedDatabase;
    
    return matchesSearch && matchesCountry && matchesCategory && matchesDatabase;
  });

  // Custom field functions
  const addCustomField = () => {
    if (!newFieldName.trim()) {
      toast.error('Field name is required');
      return;
    }

    const newField: CustomField = {
      id: Date.now().toString(),
      name: newFieldName,
      type: newFieldType,
      required: newFieldRequired,
      options: newFieldType === 'dropdown' ? newFieldOptions.split(',').map(opt => opt.trim()).filter(Boolean) : undefined
    };

    setCustomFields([...customFields, newField]);
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptions('');
    
    setEFFormData({
      ...efFormData,
      customFieldValues: {
        ...efFormData.customFieldValues,
        [newField.id]: newField.defaultValue || ''
      }
    });

    setIsCustomFieldDialogOpen(false);
    toast.success(`Custom field "${newField.name}" added`);
  };

  const removeCustomField = (fieldId: string) => {
    setCustomFields(customFields.filter(field => field.id !== fieldId));
    
    const newCustomFieldValues = { ...efFormData.customFieldValues };
    delete newCustomFieldValues[fieldId];
    setEFFormData({
      ...efFormData,
      customFieldValues: newCustomFieldValues
    });
    
    toast.success('Custom field removed');
  };

  const renderCustomFieldInput = (field: CustomField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={efFormData.customFieldValues[field.id] || ''}
            onChange={(e) => setEFFormData({
              ...efFormData,
              customFieldValues: {
                ...efFormData.customFieldValues,
                [field.id]: e.target.value
              }
            })}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={efFormData.customFieldValues[field.id] || ''}
            onChange={(e) => setEFFormData({
              ...efFormData,
              customFieldValues: {
                ...efFormData.customFieldValues,
                [field.id]: e.target.value
              }
            })}
            placeholder="0"
          />
        );
      
      case 'dropdown':
        return (
          <Select 
            value={efFormData.customFieldValues[field.id] || ''} 
            onValueChange={(value) => setEFFormData({
              ...efFormData,
              customFieldValues: {
                ...efFormData.customFieldValues,
                [field.id]: value
              }
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={efFormData.customFieldValues[field.id] || false}
              onCheckedChange={(checked) => setEFFormData({
                ...efFormData,
                customFieldValues: {
                  ...efFormData.customFieldValues,
                  [field.id]: checked
                }
              })}
            />
            <Label>Yes</Label>
          </div>
        );
      
      case 'textarea':
        return (
          <Textarea
            value={efFormData.customFieldValues[field.id] || ''}
            onChange={(e) => setEFFormData({
              ...efFormData,
              customFieldValues: {
                ...efFormData.customFieldValues,
                [field.id]: e.target.value
              }
            })}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            rows={3}
          />
        );
      
      default:
        return null;
    }
  };

  // Handler functions
  const handleCreateEFDefinition = () => {
    if (!efFormData.name || !efFormData.category || !efFormData.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    const sequence = efDefinitions.length + 1;
    const newUID = generateEFUID(efFormData.category, efFormData.country, new Date().getFullYear(), sequence);

    const newEF: EFDefinition = {
      id: Date.now().toString(),
      uid: newUID,
      name: efFormData.name,
      category: efFormData.category,
      country: efFormData.country,
      tags: efFormData.tags,
      status: 'draft',
      description: efFormData.description,
      impactCategories: efFormData.impactCategories,
      database: 'master',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      customAttributes: efFormData.customFieldValues,
      coreDataRows: []
    };
    
    setEFDefinitions([...efDefinitions, newEF]);
    setSelectedEF(newEF);
    setIsCreateEFDialogOpen(false);
    setIsAddDataRowDialogOpen(true);
    
    // Reset form
    setEFFormData({
      name: '',
      category: '',
      country: '',
      description: '',
      impactCategories: [],
      tags: [],
      customFieldValues: {}
    });
    
    toast.success(`EF Definition created — UID ${newUID}`);
  };

  const handleAddDataRow = () => {
    if (!selectedEF || !dataRowFormData.sourceName || !dataRowFormData.initialValue || !dataRowFormData.impactCategory || dataRowFormData.functionalUnit.length === 0) {
      toast.error('Please fill in all required fields (Impact Category, Functional Unit, Source Name, Initial Value)');
      return;
    }

    // Construct the unit string from impactUnit and functionalUnit(s)
    const functionalUnitStr = dataRowFormData.functionalUnit.join(', ');
    const constructedUnit = `${dataRowFormData.impactUnit}/${functionalUnitStr}`;

    const newDataRow: CoreDataRow = {
      id: `row_${Date.now()}`,
      parentEFUID: selectedEF.uid,
      year: dataRowFormData.year,
      country: dataRowFormData.country || selectedEF.country,
      region: dataRowFormData.region,
      sector: dataRowFormData.sector,
      subSector: dataRowFormData.subSector,
      unit: constructedUnit,
      impactCategory: dataRowFormData.impactCategory,
      impactUnit: dataRowFormData.impactUnit,
      functionalUnit: dataRowFormData.functionalUnit,
      uncertainty: dataRowFormData.uncertainty ? parseFloat(dataRowFormData.uncertainty) : undefined,
      geographicScope: dataRowFormData.geographicScope,
      technologyScope: dataRowFormData.technologyScope,
      timeScope: dataRowFormData.timeScope,
      sourceName: dataRowFormData.sourceName,
      sourceURL: dataRowFormData.sourceURL,
      methodology: dataRowFormData.methodology,
      sourceType: dataRowFormData.sourceType,
      notes: dataRowFormData.notes,
      systemBoundary: dataRowFormData.systemBoundary,
      allocationMethod: dataRowFormData.allocationMethod,
      derivationReason: dataRowFormData.derivationReason,
      versions: [
        {
          id: `v_${Date.now()}`,
          versionUID: generateVersionUID(`row_${Date.now()}`, '1.0'),
          parentRowId: `row_${Date.now()}`,
          version: '1.0',
          value: parseFloat(dataRowFormData.initialValue),
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: 'admin'
        }
      ],
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    };

    const updatedEF = {
      ...selectedEF,
      coreDataRows: [...selectedEF.coreDataRows, newDataRow],
      status: 'active' as const
    };

    setEFDefinitions(efDefinitions.map(ef => 
      ef.id === selectedEF.id ? updatedEF : ef
    ));

    setIsAddDataRowDialogOpen(false);
    setSelectedEF(null);
    
    // Reset form
    setDataRowFormData({
      year: new Date().getFullYear(),
      country: '',
      region: '',
      sector: '',
      subSector: '',
      unit: '',
      uncertainty: '',
      geographicScope: 'national',
      technologyScope: 'average',
      timeScope: 'current',
      sourceName: '',
      sourceURL: '',
      methodology: '',
      sourceType: 'primary',
      notes: '',
      functionalUnit: [],
      systemBoundary: '',
      allocationMethod: '',
      derivationReason: '',
      initialValue: '',
      impactCategory: '',
      impactUnit: ''
    });
    
    toast.success(`Data row added to EF ${updatedEF.uid}`);
  };

  const handleAddVersion = () => {
    if (!selectedDataRow || !versionFormData.value) {
      toast.error('Please provide a value for the new version');
      return;
    }

    const versionNumber = `${selectedDataRow.versions.length + 1}.0`;
    const newVersionUID = generateVersionUID(selectedDataRow.id, versionNumber);

    const newVersion: DataVersion = {
      id: `v_${Date.now()}`,
      versionUID: newVersionUID,
      parentRowId: selectedDataRow.id,
      version: versionNumber,
      value: parseFloat(versionFormData.value),
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      notes: versionFormData.notes
    };

    // Deactivate previous versions
    const updatedVersions = selectedDataRow.versions.map(v => ({ ...v, isActive: false }));
    updatedVersions.push(newVersion);

    const updatedDataRow = {
      ...selectedDataRow,
      versions: updatedVersions
    };

    // Update the EF definition
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

    setIsAddVersionDialogOpen(false);
    setSelectedDataRow(null);
    
    // Reset form
    setVersionFormData({
      value: '',
      notes: ''
    });
    
    toast.success(`Version ${versionNumber} created — UID ${newVersionUID}`);
  };

  const copyUID = (uid: string) => {
    navigator.clipboard.writeText(uid);
    toast.success('UID copied to clipboard');
  };

  const handleBulkUpload = () => {
    toast.success('Bulk upload completed: 15 EFs inserted, 3 updated, 2 skipped');
  };

  const handleEditEF = (ef: EFDefinition) => {
    setSelectedEF(ef);
    setEFFormData({
      name: ef.name,
      category: ef.category,
      country: ef.country,
      description: ef.description,
      impactCategories: ef.impactCategories,
      tags: ef.tags,
      customFieldValues: ef.customAttributes || {}
    });
    setIsEditEFDialogOpen(true);
  };

  const handleUpdateEF = () => {
    if (!selectedEF || !efFormData.name || !efFormData.category || !efFormData.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedEF: EFDefinition = {
      ...selectedEF,
      name: efFormData.name,
      category: efFormData.category,
      country: efFormData.country,
      description: efFormData.description,
      impactCategories: efFormData.impactCategories,
      tags: efFormData.tags,
      customAttributes: efFormData.customFieldValues,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin'
    };

    setEFDefinitions(efDefinitions.map(ef => 
      ef.id === selectedEF.id ? updatedEF : ef
    ));

    setIsEditEFDialogOpen(false);
    setSelectedEF(null);
    
    // Reset form
    setEFFormData({
      name: '',
      category: '',
      country: '',
      description: '',
      impactCategories: [],
      tags: [],
      customFieldValues: {}
    });

    toast.success(`EF Definition updated — ${updatedEF.name}`);
  };

  const handleDeleteEF = (ef: EFDefinition) => {
    if (window.confirm(`Are you sure you want to delete "${ef.name}"? This action cannot be undone.`)) {
      setEFDefinitions(efDefinitions.filter(e => e.id !== ef.id));
      toast.success(`EF Definition "${ef.name}" deleted successfully`);
    }
  };

  const getActiveVersion = (dataRow: CoreDataRow) => {
    return dataRow.versions.find(v => v.isActive) || dataRow.versions[dataRow.versions.length - 1];
  };

  const getTotalDataRows = (ef: EFDefinition) => {
    return ef.coreDataRows.length;
  };

  const getTotalVersions = (ef: EFDefinition) => {
    return ef.coreDataRows.reduce((total, row) => total + row.versions.length, 0);
  };

  const toggleEFExpansion = (efId: string) => {
    const newExpanded = new Set(expandedEFs);
    if (newExpanded.has(efId)) {
      newExpanded.delete(efId);
      // Also collapse all data rows under this EF
      const efDataRowIds = efDefinitions.find(ef => ef.id === efId)?.coreDataRows.map(row => row.id) || [];
      efDataRowIds.forEach(rowId => {
        expandedDataRows.delete(rowId);
      });
      setExpandedDataRows(new Set(expandedDataRows));
    } else {
      newExpanded.add(efId);
    }
    setExpandedEFs(newExpanded);
  };

  const toggleDataRowExpansion = (dataRowId: string) => {
    const newExpanded = new Set(expandedDataRows);
    if (newExpanded.has(dataRowId)) {
      newExpanded.delete(dataRowId);
    } else {
      newExpanded.add(dataRowId);
    }
    setExpandedDataRows(newExpanded);
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
              <h1 className="text-3xl font-semibold text-gray-900">Emission Factors</h1>
              <p className="text-gray-600">Manage EF definitions with core data rows and versioning</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          
          <Dialog open={isCreateEFDialogOpen} onOpenChange={setIsCreateEFDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create EF Definition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  Create EF Definition
                </DialogTitle>
                <DialogDescription>
                  Create a new emission factor definition. After creation, you'll add core data rows.
                </DialogDescription>
              </DialogHeader>
              
              {/* Standard Fields */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Standard Fields</CardTitle>
                    <Dialog open={isCustomFieldDialogOpen} onOpenChange={setIsCustomFieldDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Field
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">EF Name *</Label>
                      <Input
                        id="name"
                        value={efFormData.name}
                        onChange={(e) => setEFFormData({...efFormData, name: e.target.value})}
                        placeholder="e.g. Electricity Grid Mix - US"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Primary Category *</Label>
                      <Select value={efFormData.category} onValueChange={(value) => setEFFormData({...efFormData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select value={efFormData.country} onValueChange={(value) => setEFFormData({...efFormData, country: value})}>
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
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label>Impact Categories</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {impactCategories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={efFormData.impactCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setEFFormData({
                                  ...efFormData, 
                                  impactCategories: [...efFormData.impactCategories, category]
                                });
                              } else {
                                setEFFormData({
                                  ...efFormData,
                                  impactCategories: efFormData.impactCategories.filter(c => c !== category)
                                });
                              }
                            }}
                            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                          <Label htmlFor={category} className="text-sm">{category}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={efFormData.description}
                      onChange={(e) => setEFFormData({...efFormData, description: e.target.value})}
                      placeholder="Detailed description of the emission factor..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Custom Fields Display */}
              {customFields.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Custom Fields</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {customFields.map(field => {
                        const IconComponent = fieldTypeIcons[field.type];
                        return (
                          <div key={field.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4 text-gray-500" />
                                {field.name}
                                {field.required && <span className="text-red-500">*</span>}
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCustomField(field.id)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            {renderCustomFieldInput(field)}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateEFDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEFDefinition} className="bg-gradient-to-r from-emerald-500 to-green-600">
                  Create EF Definition
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by EF name or UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hierarchical EF Definitions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-emerald-600" />
              EF Definitions ({filteredEFs.length})
            </CardTitle>
            <div className="text-sm text-gray-600">
              Click to expand EF definitions and see core data rows with versions
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>UID & Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Data Rows</TableHead>
                <TableHead>Total Versions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEFs.map((ef) => {
                const isEFExpanded = expandedEFs.has(ef.id);
                return (
                  <React.Fragment key={ef.id}>
                    {/* Main EF Definition Row */}
                    <TableRow className="hover:bg-emerald-50/30 border-b border-emerald-100">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEFExpansion(ef.id)}
                          className="h-6 w-6 p-0"
                          disabled={ef.coreDataRows.length === 0}
                        >
                          {ef.coreDataRows.length > 0 ? (
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${isEFExpanded ? 'rotate-90' : ''}`}
                            />
                          ) : null}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <code 
                              className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded cursor-pointer hover:bg-emerald-100 transition-colors"
                              onClick={() => copyUID(ef.uid)}
                            >
                              {ef.uid}
                            </code>
                            <Copy className="h-3 w-3 text-gray-400 cursor-pointer hover:text-emerald-600" 
                                  onClick={() => copyUID(ef.uid)} />
                          </div>
                          <div className="font-medium text-gray-900">{ef.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{ef.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                          {ef.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{ef.country}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          {getTotalDataRows(ef)} rows
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                          {getTotalVersions(ef)} versions
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={ef.status === 'active' ? 'default' : ef.status === 'draft' ? 'secondary' : 'outline'}
                          className={ef.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                        >
                          {ef.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEF(ef);
                            setIsAddDataRowDialogOpen(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Data Row
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Core Data Rows (when EF is expanded) */}
                    {isEFExpanded && ef.coreDataRows.map((dataRow) => {
                      const isRowExpanded = expandedDataRows.has(dataRow.id);
                      const activeVersion = getActiveVersion(dataRow);
                      
                      return (
                        <React.Fragment key={dataRow.id}>
                          {/* Data Row */}
                          <TableRow className="bg-blue-50/50 hover:bg-blue-100/50 border-l-4 border-l-blue-400">
                            <TableCell className="pl-8">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleDataRowExpansion(dataRow.id)}
                                className="h-6 w-6 p-0"
                              >
                                <ChevronRight 
                                  className={`h-3 w-3 transition-transform ${isRowExpanded ? 'rotate-90' : ''}`}
                                />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Layers className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">
                                    {dataRow.sourceName} {dataRow.year} {dataRow.impactUnit && dataRow.functionalUnit ? `(${dataRow.impactUnit}/${dataRow.functionalUnit})` : dataRow.unit ? `(${dataRow.unit})` : ''}
                                  </span>
                                </div>
                                <div className="text-sm text-blue-700">
                                  {dataRow.impactCategory} • {dataRow.sector} - {dataRow.subSector}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-blue-200 text-blue-700">
                                {dataRow.geographicScope}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-blue-700">
                                {dataRow.country}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-blue-900">
                                  {activeVersion?.value} <span className="text-sm font-normal">{dataRow.unit}</span>
                                </span>
                                <Badge variant="outline" className="border-blue-200 text-blue-600">
                                  v{activeVersion?.version}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                                {dataRow.versions.length} versions
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-blue-200 text-blue-700">
                                {dataRow.sourceType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDataRow(dataRow);
                                  setIsAddVersionDialogOpen(true);
                                }}
                                className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Version
                              </Button>
                            </TableCell>
                          </TableRow>

                          {/* Versions (when Data Row is expanded) */}
                          {isRowExpanded && dataRow.versions
                            .sort((a, b) => parseFloat(b.version) - parseFloat(a.version))
                            .map((version) => (
                            <TableRow 
                              key={version.id} 
                              className={`${version.isActive ? 'bg-green-50/50' : 'bg-gray-50/50'} hover:bg-opacity-80 border-l-8 border-l-purple-300`}
                            >
                              <TableCell className="pl-16">
                                <GitBranch className="h-3 w-3 text-purple-500" />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                    v{version.version}
                                  </code>
                                  <span className="text-sm text-gray-600">
                                    {version.versionUID}
                                  </span>
                                  <Copy 
                                    className="h-3 w-3 text-gray-400 cursor-pointer hover:text-purple-600" 
                                    onClick={() => copyUID(version.versionUID)} 
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={version.isActive ? 'default' : 'secondary'}
                                  className={version.isActive ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                >
                                  {version.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-600">
                                  {new Date(version.createdAt).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-purple-900">
                                    {version.value}
                                  </span>
                                  <span className="text-sm text-gray-500">{dataRow.unit}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-600">
                                  {version.createdBy}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-xs text-gray-500 max-w-32 truncate">
                                  {version.notes || '-'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {!version.isActive && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-800 hover:bg-green-50 h-6 px-2"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Activate
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {filteredEFs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Database className="h-8 w-8" />
                      <p>No emission factor definitions found</p>
                      <p className="text-sm">Create your first EF definition to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Data Row Dialog */}
      <Dialog open={isAddDataRowDialogOpen} onOpenChange={setIsAddDataRowDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              Add Core Data Row
            </DialogTitle>
            <DialogDescription>
              Add a new core data row to EF: {selectedEF?.uid}. Each row can have multiple versions with different values.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Core Data Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Core Data Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Year *</Label>
                    <Input
                      type="number"
                      value={dataRowFormData.year}
                      onChange={(e) => setDataRowFormData({...dataRowFormData, year: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select 
                      value={dataRowFormData.country} 
                      onValueChange={(value) => setDataRowFormData({...dataRowFormData, country: value})}
                    >
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
                    <Label>Region</Label>
                    <Select 
                      value={dataRowFormData.region} 
                      onValueChange={(value) => setDataRowFormData({...dataRowFormData, region: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sector</Label>
                    <Select 
                      value={dataRowFormData.sector} 
                      onValueChange={(value) => setDataRowFormData({...dataRowFormData, sector: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map(sector => (
                          <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sub-Sector</Label>
                    <Input
                      value={dataRowFormData.subSector}
                      onChange={(e) => setDataRowFormData({...dataRowFormData, subSector: e.target.value})}
                      placeholder="e.g. Grid Mix, Direct Combustion"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Impact Category *</Label>
                    <Select 
                      value={dataRowFormData.impactCategory} 
                      onValueChange={(value) => {
                        const impactUnit = impactCategoryToUnitMapping[value] || '';
                        setDataRowFormData({
                          ...dataRowFormData, 
                          impactCategory: value,
                          impactUnit: impactUnit
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select impact category" />
                      </SelectTrigger>
                      <SelectContent>
                        {impactCategoriesList.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Impact Unit (Auto-populated) *</Label>
                    <Input
                      value={dataRowFormData.impactUnit}
                      disabled
                      placeholder="Auto-populated based on impact category"
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Functional Unit *</Label>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {functionalUnits.map(unit => (
                          <div key={unit} className="flex items-center space-x-2">
                            <Checkbox
                              id={`fu-${unit}`}
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
                            <Label htmlFor={`fu-${unit}`} className="cursor-pointer">
                              {unit}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Uncertainty (%)</Label>
                    <Input
                      type="number"
                      value={dataRowFormData.uncertainty}
                      onChange={(e) => setDataRowFormData({...dataRowFormData, uncertainty: e.target.value})}
                      placeholder="e.g. 15"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Geographic Scope</Label>
                    <Select 
                      value={dataRowFormData.geographicScope} 
                      onValueChange={(value) => setDataRowFormData({...dataRowFormData, geographicScope: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {geographicScopes.map(scope => (
                          <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Technology Scope</Label>
                    <Select 
                      value={dataRowFormData.technologyScope} 
                      onValueChange={(value) => setDataRowFormData({...dataRowFormData, technologyScope: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {technologyScopes.map(scope => (
                          <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Time Scope</Label>
                    <Select 
                      value={dataRowFormData.timeScope} 
                      onValueChange={(value) => setDataRowFormData({...dataRowFormData, timeScope: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeScopes.map(scope => (
                          <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Source Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Source Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Name *</Label>
                    <Input
                      value={dataRowFormData.sourceName}
                      onChange={(e) => setDataRowFormData({...dataRowFormData, sourceName: e.target.value})}
                      placeholder="e.g. EPA eGRID, IPCC Guidelines"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Source URL</Label>
                    <Input
                      value={dataRowFormData.sourceURL}
                      onChange={(e) => setDataRowFormData({...dataRowFormData, sourceURL: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Source Type</Label>
                    <Select 
                      value={dataRowFormData.sourceType} 
                      onValueChange={(value) => setDataRowFormData({...dataRowFormData, sourceType: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Initial Value *</Label>
                    <Input
                      type="number"
                      step="any"
                      value={dataRowFormData.initialValue}
                      onChange={(e) => setDataRowFormData({...dataRowFormData, initialValue: e.target.value})}
                      placeholder="e.g. 0.4207"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label>Methodology</Label>
                  <Textarea
                    value={dataRowFormData.methodology}
                    onChange={(e) => setDataRowFormData({...dataRowFormData, methodology: e.target.value})}
                    placeholder="Methodology description..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label>Notes</Label>
                  <Textarea
                    value={dataRowFormData.notes}
                    onChange={(e) => setDataRowFormData({...dataRowFormData, notes: e.target.value})}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDataRowDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDataRow} className="bg-gradient-to-r from-blue-500 to-blue-600">
              Add Data Row
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Version Dialog */}
      <Dialog open={isAddVersionDialogOpen} onOpenChange={setIsAddVersionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-emerald-600" />
              Add New Version
            </DialogTitle>
            <DialogDescription>
              Add a new version with a different value. All other attributes remain the same.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDataRow && (
            <div className="space-y-4">
              {/* Current Data Row Info */}
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Sector:</strong> {selectedDataRow.sector}</div>
                    <div><strong>Sub-Sector:</strong> {selectedDataRow.subSector}</div>
                    <div><strong>Country:</strong> {selectedDataRow.country}</div>
                    <div><strong>Year:</strong> {selectedDataRow.year}</div>
                    <div><strong>Unit:</strong> {selectedDataRow.unit}</div>
                    <div><strong>Source:</strong> {selectedDataRow.sourceName}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <strong>Current Active Version:</strong> {getActiveVersion(selectedDataRow)?.value} {selectedDataRow.unit} (v{getActiveVersion(selectedDataRow)?.version})
                  </div>
                </CardContent>
              </Card>
              
              {/* New Version Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>New Value *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={versionFormData.value}
                    onChange={(e) => setVersionFormData({...versionFormData, value: e.target.value})}
                    placeholder={`Enter new value in ${selectedDataRow.unit}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Version Notes</Label>
                  <Textarea
                    value={versionFormData.notes}
                    onChange={(e) => setVersionFormData({...versionFormData, notes: e.target.value})}
                    placeholder="Describe what changed in this version..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVersionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVersion} className="bg-gradient-to-r from-emerald-500 to-green-600">
              Add Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Custom Field Dialog */}
      <Dialog open={isCustomFieldDialogOpen} onOpenChange={setIsCustomFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Field</DialogTitle>
            <DialogDescription>
              Create a custom field that will be available for all emission factors.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Field Name *</Label>
              <Input
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g. Data Quality Score"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Field Type</Label>
              <Select value={newFieldType} onValueChange={(value: CustomFieldType) => setNewFieldType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newFieldType === 'dropdown' && (
              <div className="space-y-2">
                <Label>Options (comma-separated)</Label>
                <Input
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={newFieldRequired}
                onCheckedChange={(checked) => setNewFieldRequired(checked as boolean)}
              />
              <Label>Required field</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomFieldDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addCustomField}>
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}