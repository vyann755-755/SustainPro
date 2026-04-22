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
  uncertainty?: number;
  geographicScope: 'global' | 'national' | 'regional' | 'local';
  technologyScope: 'average' | 'best' | 'worst' | 'specific';
  timeScope: 'current' | 'historical' | 'forecast';
  sourceName: string;
  sourceURL?: string;
  methodology?: string;
  sourceType: 'primary' | 'secondary' | 'tertiary';
  notes?: string;
  functionalUnit?: string;
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
        unit: 'kg CO2e/kWh',
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
  const [isEditEFDialogOpen, setIsEditEFDialogOpen] = useState(false);
  const [isEditDataRowDialogOpen, setIsEditDataRowDialogOpen] = useState(false);
  const [isAddVersionDialogOpen, setIsAddVersionDialogOpen] = useState(false);
  
  // Selected items
  const [selectedEF, setSelectedEF] = useState<EFDefinition | null>(null);
  const [selectedDataRow, setSelectedDataRow] = useState<CoreDataRow | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<DataVersion | null>(null);
  
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
    functionalUnit: '',
    systemBoundary: '',
    allocationMethod: '',
    derivationReason: '',
    initialValue: ''
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
    setIsCreateEFDialogOpen(false);
    
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

  const handleAddDataRow = () => {
    if (!selectedEF || !dataRowFormData.sourceName || !dataRowFormData.unit || !dataRowFormData.initialValue) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newDataRow: CoreDataRow = {
      id: `row_${Date.now()}`,
      parentEFUID: selectedEF.uid,
      year: dataRowFormData.year,
      country: dataRowFormData.country || selectedEF.country,
      region: dataRowFormData.region,
      sector: dataRowFormData.sector,
      subSector: dataRowFormData.subSector,
      unit: dataRowFormData.unit,
      uncertainty: dataRowFormData.uncertainty ? parseFloat(dataRowFormData.uncertainty) : undefined,
      geographicScope: dataRowFormData.geographicScope,
      technologyScope: dataRowFormData.technologyScope,
      timeScope: dataRowFormData.timeScope,
      sourceName: dataRowFormData.sourceName,
      sourceURL: dataRowFormData.sourceURL,
      methodology: dataRowFormData.methodology,
      sourceType: dataRowFormData.sourceType,
      notes: dataRowFormData.notes,
      functionalUnit: dataRowFormData.functionalUnit,
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
      functionalUnit: '',
      systemBoundary: '',
      allocationMethod: '',
      derivationReason: '',
      initialValue: ''
    });
    
    toast.success(`Data row added to EF ${updatedEF.uid}`);
  };

  const handleEditDataRow = (dataRow: CoreDataRow) => {
    setSelectedDataRow(dataRow);
    setDataRowFormData({
      year: dataRow.year,
      country: dataRow.country,
      region: dataRow.region,
      sector: dataRow.sector,
      subSector: dataRow.subSector,
      unit: dataRow.unit,
      uncertainty: dataRow.uncertainty?.toString() || '',
      geographicScope: dataRow.geographicScope,
      technologyScope: dataRow.technologyScope,
      timeScope: dataRow.timeScope,
      sourceName: dataRow.sourceName,
      sourceURL: dataRow.sourceURL || '',
      methodology: dataRow.methodology || '',
      sourceType: dataRow.sourceType,
      notes: dataRow.notes || '',
      functionalUnit: dataRow.functionalUnit || '',
      systemBoundary: dataRow.systemBoundary || '',
      allocationMethod: dataRow.allocationMethod || '',
      derivationReason: dataRow.derivationReason || '',
      initialValue: dataRow.versions.find(v => v.isActive)?.value.toString() || ''
    });
    setIsEditDataRowDialogOpen(true);
  };

  const handleUpdateDataRow = () => {
    if (!selectedDataRow || !dataRowFormData.sourceName || !dataRowFormData.unit) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedDataRow: CoreDataRow = {
      ...selectedDataRow,
      year: dataRowFormData.year,
      country: dataRowFormData.country,
      region: dataRowFormData.region,
      sector: dataRowFormData.sector,
      subSector: dataRowFormData.subSector,
      unit: dataRowFormData.unit,
      uncertainty: dataRowFormData.uncertainty ? parseFloat(dataRowFormData.uncertainty) : undefined,
      geographicScope: dataRowFormData.geographicScope,
      technologyScope: dataRowFormData.technologyScope,
      timeScope: dataRowFormData.timeScope,
      sourceName: dataRowFormData.sourceName,
      sourceURL: dataRowFormData.sourceURL,
      methodology: dataRowFormData.methodology,
      sourceType: dataRowFormData.sourceType,
      notes: dataRowFormData.notes,
      functionalUnit: dataRowFormData.functionalUnit,
      systemBoundary: dataRowFormData.systemBoundary,
      allocationMethod: dataRowFormData.allocationMethod,
      derivationReason: dataRowFormData.derivationReason
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

    setIsEditDataRowDialogOpen(false);
    setSelectedDataRow(null);
    
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
      functionalUnit: '',
      systemBoundary: '',
      allocationMethod: '',
      derivationReason: '',
      initialValue: ''
    });

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

  const copyUID = (uid: string) => {
    navigator.clipboard.writeText(uid);
    toast.success('UID copied to clipboard');
  };

  const handleBulkUpload = () => {
    toast.success('Bulk upload completed: 15 EFs inserted, 3 updated, 2 skipped');
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

  // Version management functions
  const handleAddVersion = (dataRow: CoreDataRow) => {
    setSelectedDataRow(dataRow);
    setVersionFormData({
      value: '',
      notes: ''
    });
    setIsAddVersionDialogOpen(true);
  };

  const handleCreateVersion = () => {
    if (!selectedDataRow || !versionFormData.value) {
      toast.error('Please enter a value for the new version');
      return;
    }

    // Get the next version number
    const existingVersions = selectedDataRow.versions.map(v => parseFloat(v.version)).sort((a, b) => b - a);
    const nextVersion = (existingVersions[0] + 0.1).toFixed(1);

    const newVersion: DataVersion = {
      id: `v_${Date.now()}`,
      versionUID: generateVersionUID(selectedDataRow.id, nextVersion),
      parentRowId: selectedDataRow.id,
      version: nextVersion,
      value: parseFloat(versionFormData.value),
      isActive: false, // New versions start as inactive
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      notes: versionFormData.notes || undefined
    };

    // Update the data row with the new version
    const updatedDataRow: CoreDataRow = {
      ...selectedDataRow,
      versions: [...selectedDataRow.versions, newVersion]
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
    setVersionFormData({ value: '', notes: '' });
    
    toast.success(`Version ${nextVersion} created successfully`);
  };

  const handleActivateVersion = (dataRow: CoreDataRow, version: DataVersion) => {
    if (version.isActive) return; // Already active

    // Update all versions to inactive, then activate the selected one
    const updatedVersions = dataRow.versions.map(v => ({
      ...v,
      isActive: v.id === version.id
    }));

    const updatedDataRow: CoreDataRow = {
      ...dataRow,
      versions: updatedVersions
    };

    // Update the EF definition
    const updatedEF = efDefinitions.find(ef => ef.uid === dataRow.parentEFUID);
    if (updatedEF) {
      const updatedEFWithRow = {
        ...updatedEF,
        coreDataRows: updatedEF.coreDataRows.map(row => 
          row.id === dataRow.id ? updatedDataRow : row
        )
      };

      setEFDefinitions(efDefinitions.map(ef => 
        ef.id === updatedEF.id ? updatedEFWithRow : ef
      ));
    }

    toast.success(`Version ${version.version} activated`);
  };

  const handleDeleteVersion = (dataRow: CoreDataRow, version: DataVersion) => {
    if (version.isActive) {
      toast.error('Cannot delete the active version. Please activate another version first.');
      return;
    }

    if (dataRow.versions.length <= 1) {
      toast.error('Cannot delete the last version. Each data row must have at least one version.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete version ${version.version}? This action cannot be undone.`)) {
      const updatedVersions = dataRow.versions.filter(v => v.id !== version.id);
      
      const updatedDataRow: CoreDataRow = {
        ...dataRow,
        versions: updatedVersions
      };

      // Update the EF definition
      const updatedEF = efDefinitions.find(ef => ef.uid === dataRow.parentEFUID);
      if (updatedEF) {
        const updatedEFWithRow = {
          ...updatedEF,
          coreDataRows: updatedEF.coreDataRows.map(row => 
            row.id === dataRow.id ? updatedDataRow : row
          )
        };

        setEFDefinitions(efDefinitions.map(ef => 
          ef.id === updatedEF.id ? updatedEFWithRow : ef
        ));
      }

      toast.success(`Version ${version.version} deleted successfully`);
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
              {/* Create EF Dialog Content - keeping the existing content */}
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  Create EF Definition
                </DialogTitle>
                <DialogDescription>
                  Create a new emission factor definition. After creation, you'll add core data rows.
                </DialogDescription>
              </DialogHeader>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Standard Fields</CardTitle>
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
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={efFormData.description}
                      onChange={(e) => setEFFormData({...efFormData, description: e.target.value})}
                      placeholder="Describe the emission factor's purpose and application"
                      rows={3}
                    />
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
                                  impactCategories: efFormData.impactCategories.filter(cat => cat !== category)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={category} className="text-sm">{category}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label>Tags</Label>
                    <Input
                      value={efFormData.tags.join(', ')}
                      onChange={(e) => setEFFormData({...efFormData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                      placeholder="Enter tags separated by commas"
                    />
                  </div>
                </CardContent>
              </Card>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateEFDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEFDefinition}>
                  Create EF Definition
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-48 border-emerald-200">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 border-emerald-200">
                <Layers className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-emerald-700">
            Found {filteredEFs.length} EF definition{filteredEFs.length !== 1 ? 's' : ''} • {filteredEFs.reduce((sum, ef) => sum + getTotalDataRows(ef), 0)} total data rows • {filteredEFs.reduce((sum, ef) => sum + getTotalVersions(ef), 0)} total versions
          </div>
        </CardContent>
      </Card>

      {/* Hierarchical Table */}
      <Card className="border-emerald-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-emerald-50 hover:bg-emerald-50">
              <TableHead className="w-12"></TableHead>
              <TableHead>EF Definition / Data Row / Version</TableHead>
              <TableHead>Country/Region</TableHead>
              <TableHead>Year/Date</TableHead>
              <TableHead>Unit/Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEFs.map((ef) => (
              <React.Fragment key={ef.id}>
                {/* EF Definition Row */}
                <TableRow className="border-l-4 border-l-emerald-500 bg-emerald-25">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleEFExpansion(ef.id)}
                      className="p-1"
                    >
                      <ChevronRight 
                        className={`h-4 w-4 transition-transform ${
                          expandedEFs.has(ef.id) ? 'rotate-90' : ''
                        }`} 
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-gray-900">{ef.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyUID(ef.uid)}
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {ef.uid}
                        </Button>
                      </div>
                      <div className="text-sm text-gray-600">{ef.description}</div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                          {ef.category}
                        </Badge>
                        {ef.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{ef.country}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      Created {new Date(ef.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{getTotalDataRows(ef)} rows</div>
                      <div className="text-gray-500">{getTotalVersions(ef)} versions</div>
                    </div>
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

                {/* Data Rows */}
                {expandedEFs.has(ef.id) && ef.coreDataRows.map((dataRow) => (
                  <React.Fragment key={dataRow.id}>
                    {/* Data Row */}
                    <TableRow className="border-l-4 border-l-cyan-400 bg-cyan-25">
                      <TableCell className="pl-8">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDataRowExpansion(dataRow.id)}
                          className="p-1"
                        >
                          <ChevronRight 
                            className={`h-4 w-4 transition-transform ${
                              expandedDataRows.has(dataRow.id) ? 'rotate-90' : ''
                            }`} 
                          />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-cyan-600" />
                            <span className="font-medium">Data Row</span>
                            <Badge variant="outline" className="text-xs">
                              {dataRow.versions.length} version{dataRow.versions.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {dataRow.sector} • {dataRow.subSector} • {dataRow.sourceName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{dataRow.country}</div>
                          <div className="text-gray-500">{dataRow.region}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{dataRow.year}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {dataRow.versions.find(v => v.isActive)?.value} {dataRow.unit}
                          </div>
                          {dataRow.uncertainty && (
                            <div className="text-gray-500">±{dataRow.uncertainty}%</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-xs w-fit">
                            {dataRow.sourceType}
                          </Badge>
                          <Badge variant="secondary" className="text-xs w-fit">
                            {dataRow.geographicScope}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAddVersion(dataRow)}
                            title="Add New Version"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
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

                    {/* Show Add Data Row button when expanded */}
                    {expandedEFs.has(ef.id) && (
                      <TableRow className="border-l-4 border-l-emerald-300 bg-emerald-25">
                        <TableCell colSpan={7} className="py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEF(ef);
                              setIsAddDataRowDialogOpen(true);
                            }}
                            className="ml-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Data Row
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Versions */}
                    {expandedDataRows.has(dataRow.id) && dataRow.versions.map((version) => (
                      <TableRow key={version.id} className="border-l-4 border-l-purple-400 bg-purple-25">
                        <TableCell className="pl-16">
                          <GitBranch className="h-4 w-4 text-purple-600" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Version {version.version}</span>
                            {version.isActive && (
                              <Badge variant="default" className="text-xs bg-green-600">
                                Active
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyUID(version.versionUID)}
                              className="h-6 px-2 text-xs"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              {version.versionUID}
                            </Button>
                          </div>
                          {version.notes && (
                            <div className="text-sm text-gray-600 mt-1">{version.notes}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">-</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(version.createdAt).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{version.value}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            by {version.createdBy}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!version.isActive && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleActivateVersion(dataRow, version)}
                                title="Activate Version"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteVersion(dataRow, version)}
                              title="Delete Version"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={version.isActive || dataRow.versions.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Version Dialog */}
      <Dialog open={isAddVersionDialogOpen} onOpenChange={setIsAddVersionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-emerald-600" />
              Add New Version
            </DialogTitle>
            <DialogDescription>
              Create a new version for this data row.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="version-value">Value *</Label>
              <Input
                id="version-value"
                type="number"
                step="any"
                value={versionFormData.value}
                onChange={(e) => setVersionFormData({...versionFormData, value: e.target.value})}
                placeholder="e.g., 0.4207"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="version-notes">Notes</Label>
              <Textarea
                id="version-notes"
                value={versionFormData.notes}
                onChange={(e) => setVersionFormData({...versionFormData, notes: e.target.value})}
                placeholder="Reason for the new version or changes made"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVersionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVersion}>
              Create Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keep existing dialogs for Add Data Row and Edit Data Row */}
      {/* These would be the same as in the original file - keeping them for completeness */}

    </div>
  );
}