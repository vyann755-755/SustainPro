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
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { AssignMasterEFDialog } from './ClientEmissionFactorsSearch';
import { useMasterDB } from '../../contexts/MasterDBContext';
import { 
  Plus, 
  Upload, 
  Search, 
  Edit, 
  Trash2,
  GitBranch,
  Database,
  Sparkles,
  Copy,
  Globe,
  Building,
  MapPin,
  Clock,
  Link,
  FileText,
  CheckCircle,
  AlertCircle,
  Layers,
  ChevronRight,
  TreePine,
  Star,
  Shield,
  Lock,
  Users,
  Eye,
  MoreVertical,
  X,
  Save,
  Activity
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Interfaces
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

interface DataRow {
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

interface ClientEFDefinition {
  id: string;
  uid: string;
  name: string;
  category: string;
  country: string;
  tags: string[];
  status: 'draft' | 'active' | 'archived';
  description: string;
  impactCategories: string[];
  database: 'client' | 'master';
  clientId?: string;
  createdBy: string;
  createdAt: string;
  customAttributes?: Record<string, any>;
  dataRows: DataRow[];
  isAssignedFromMaster?: boolean;
  assignedFrom?: {
    originalUID: string;
    assignedAt: string;
    assignedBy: string;
  };
}

// Constants
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

// Helper functions
const generateClientEFUID = (category: string, country: string, year: number, sequence: number, clientId: string): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const countryCode = country === 'Global' ? 'GLB' : country.substring(0, 3).toUpperCase();
  const clientCode = clientId.substring(0, 3).toUpperCase();
  return `CEF-${clientCode}-${categoryCode}-${countryCode}-${year}-${sequence.toString().padStart(3, '0')}`;
};

const generateVersionUID = (parentRowId: string, version: string): string => {
  return `${parentRowId}-V${version}`;
};

// Mock Data
const mockClientEFDefinitions: ClientEFDefinition[] = [
  {
    id: '1',
    uid: 'CEF-CLI-ENE-USA-2024-001',
    name: 'Client-Specific Electricity Grid Mix - Regional',
    category: 'Energy',
    country: 'United States',
    tags: ['electricity', 'grid', 'scope-2', 'regional'],
    status: 'active',
    description: 'Regional electricity grid emission factor tailored for client operations',
    impactCategories: ['GWP-100', 'GWP-20'],
    database: 'client',
    clientId: 'CLIENT-001',
    createdBy: 'sa_user',
    createdAt: '2024-01-20T14:30:00Z',
    dataRows: [
      {
        id: 'row1',
        parentEFUID: 'CEF-CLI-ENE-USA-2024-001',
        year: 2024,
        country: 'United States',
        region: 'Northeast',
        sector: 'Power Generation',
        subSector: 'Regional Grid Mix',
        unit: 'kg CO2e/kWh',
        uncertainty: 12,
        geographicScope: 'regional',
        technologyScope: 'average',
        timeScope: 'current',
        sourceName: 'EPA eGRID 2024',
        sourceURL: 'https://www.epa.gov/egrid',
        methodology: 'Grid average emission factor calculation',
        sourceType: 'primary',
        notes: 'Based on regional grid mix for client\'s operational area',
        functionalUnit: 'kWh of electricity consumed',
        systemBoundary: 'Cradle-to-gate electricity production',
        allocationMethod: 'Economic allocation',
        derivationReason: 'Client-specific regional grid requirements',
        createdAt: '2024-01-20T14:30:00Z',
        createdBy: 'sa_user',
        versions: [
          {
            id: 'v1',
            versionUID: 'CEF-CLI-ENE-USA-2024-001-row1-V1.0',
            parentRowId: 'row1',
            version: '1.0',
            value: 0.425,
            isActive: false,
            createdAt: '2024-01-20T14:30:00Z',
            createdBy: 'sa_user',
            notes: 'Initial version based on Q4 2023 data'
          },
          {
            id: 'v2',
            versionUID: 'CEF-CLI-ENE-USA-2024-001-row1-V1.1',
            parentRowId: 'row1',
            version: '1.1',
            value: 0.418,
            isActive: true,
            createdAt: '2024-02-15T10:20:00Z',
            createdBy: 'sa_user',
            notes: 'Updated with Q1 2024 renewable energy integration'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    uid: 'CEF-CLI-TRA-USA-2024-002',
    name: 'Client Fleet Transportation - Delivery Vehicles',
    category: 'Transport',
    country: 'United States',
    tags: ['transport', 'delivery', 'scope-1', 'fleet'],
    status: 'active',
    description: 'Emission factors for client\'s delivery vehicle fleet operations',
    impactCategories: ['GWP-100'],
    database: 'client',
    clientId: 'CLIENT-001',
    createdBy: 'sa_user',
    createdAt: '2024-01-25T09:15:00Z',
    dataRows: [
      {
        id: 'row2',
        parentEFUID: 'CEF-CLI-TRA-USA-2024-002',
        year: 2024,
        country: 'United States',
        region: 'National',
        sector: 'Transportation',
        subSector: 'Light Duty Vehicles',
        unit: 'kg CO2e/km',
        uncertainty: 8,
        geographicScope: 'national',
        technologyScope: 'specific',
        timeScope: 'current',
        sourceName: 'Client Fleet Data Analysis',
        sourceURL: '',
        methodology: 'Fuel consumption analysis and EPA emission factors',
        sourceType: 'primary',
        notes: 'Based on actual fleet performance data from 2023-2024',
        functionalUnit: 'Vehicle kilometer traveled',
        systemBoundary: 'Fuel combustion emissions only',
        allocationMethod: 'Direct attribution',
        derivationReason: 'Client-specific fleet performance optimization',
        createdAt: '2024-01-25T09:15:00Z',
        createdBy: 'sa_user',
        versions: [
          {
            id: 'v3',
            versionUID: 'CEF-CLI-TRA-USA-2024-002-row2-V1.0',
            parentRowId: 'row2',
            version: '1.0',
            value: 0.152,
            isActive: true,
            createdAt: '2024-01-25T09:15:00Z',
            createdBy: 'sa_user',
            notes: 'Initial fleet analysis'
          }
        ]
      }
    ]
  }
];

export const ClientEmissionFactorsComplete: React.FC = () => {
  const { masterEFDefinitions } = useMasterDB();
  
  // State
  const [clientEFDefinitions, setClientEFDefinitions] = useState<ClientEFDefinition[]>(mockClientEFDefinitions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  const [expandedEFs, setExpandedEFs] = useState<Set<string>>(new Set());
  const [expandedDataRows, setExpandedDataRows] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isCreateEFDialogOpen, setIsCreateEFDialogOpen] = useState(false);
  const [isEditEFDialogOpen, setIsEditEFDialogOpen] = useState(false);
  const [isCreateDataRowDialogOpen, setIsCreateDataRowDialogOpen] = useState(false);
  const [isEditDataRowDialogOpen, setIsEditDataRowDialogOpen] = useState(false);
  const [isCreateVersionDialogOpen, setIsCreateVersionDialogOpen] = useState(false);
  const [isAssignMasterEFDialogOpen, setIsAssignMasterEFDialogOpen] = useState(false);
  
  // Edit states
  const [selectedEF, setSelectedEF] = useState<ClientEFDefinition | null>(null);
  const [selectedDataRow, setSelectedDataRow] = useState<DataRow | null>(null);

  // Form states
  const [efForm, setEFForm] = useState({
    name: '',
    category: '',
    country: '',
    tags: [],
    description: '',
    impactCategories: []
  });

  const [dataRowForm, setDataRowForm] = useState({
    year: new Date().getFullYear(),
    country: '',
    region: '',
    sector: '',
    subSector: '',
    impactCategory: '',
    impactUnit: '',
    functionalUnit: [] as string[],
    unit: '',
    uncertainty: 0,
    geographicScope: 'national' as const,
    technologyScope: 'average' as const,
    timeScope: 'current' as const,
    sourceName: '',
    sourceURL: '',
    methodology: '',
    sourceType: 'primary' as const,
    initialValue: '',
    notes: ''
  });

  const [versionForm, setVersionForm] = useState({
    value: 0,
    notes: ''
  });

  const filteredEFs = clientEFDefinitions.filter(ef => {
    const matchesSearch = ef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ef.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || !selectedCountry || ef.country === selectedCountry;
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || ef.category === selectedCategory;
    const matchesDatabase = selectedDatabase === 'all' || !selectedDatabase || ef.database === selectedDatabase;
    
    return matchesSearch && matchesCountry && matchesCategory && matchesDatabase;
  });

  // Expansion functions
  const toggleEFExpansion = (efId: string) => {
    const newExpanded = new Set(expandedEFs);
    if (newExpanded.has(efId)) {
      newExpanded.delete(efId);
      const efDataRowIds = clientEFDefinitions.find(ef => ef.id === efId)?.dataRows.map(row => row.id) || [];
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

  // CRUD Functions
  const createEFDefinition = () => {
    if (!efForm.name || !efForm.category || !efForm.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newUID = generateClientEFUID(efForm.category, efForm.country, new Date().getFullYear(), 1, 'CLIENT-001');
    const newEF: ClientEFDefinition = {
      id: Date.now().toString(),
      uid: newUID,
      name: efForm.name,
      category: efForm.category,
      country: efForm.country,
      tags: efForm.tags,
      status: 'draft',
      description: efForm.description,
      impactCategories: efForm.impactCategories,
      database: 'client',
      clientId: 'CLIENT-001',
      createdBy: 'sa_user',
      createdAt: new Date().toISOString(),
      dataRows: []
    };
    
    setClientEFDefinitions([...clientEFDefinitions, newEF]);
    
    // Auto-expand the new EF
    const newExpanded = new Set(expandedEFs);
    newExpanded.add(newEF.id);
    setExpandedEFs(newExpanded);
    
    setIsCreateEFDialogOpen(false);
    resetEFForm();
    toast.success(`Client EF Definition created — UID ${newUID}. You can now add data rows and versions below.`);
  };

  const createDataRow = () => {
    if (!selectedEF) return;
    
    const newDataRow: DataRow = {
      id: Date.now().toString(),
      parentEFUID: selectedEF.uid,
      year: dataRowForm.year,
      country: dataRowForm.country,
      region: dataRowForm.region,
      sector: dataRowForm.sector,
      subSector: dataRowForm.subSector,
      unit: dataRowForm.unit,
      uncertainty: dataRowForm.uncertainty,
      geographicScope: dataRowForm.geographicScope,
      technologyScope: dataRowForm.technologyScope,
      timeScope: dataRowForm.timeScope,
      sourceName: dataRowForm.sourceName,
      sourceURL: dataRowForm.sourceURL,
      methodology: dataRowForm.methodology,
      sourceType: dataRowForm.sourceType,
      notes: dataRowForm.notes,
      createdAt: new Date().toISOString(),
      createdBy: 'sa_user',
      versions: []
    };
    
    setClientEFDefinitions(clientEFDefinitions.map(ef => 
      ef.id === selectedEF.id 
        ? { ...ef, dataRows: [...ef.dataRows, newDataRow] }
        : ef
    ));
    
    setIsCreateDataRowDialogOpen(false);
    setDataRowForm({
      year: new Date().getFullYear(),
      country: '',
      region: '',
      sector: '',
      subSector: '',
      impactCategory: '',
      impactUnit: '',
      functionalUnit: [],
      unit: '',
      uncertainty: 0,
      geographicScope: 'national',
      technologyScope: 'average',
      timeScope: 'current',
      sourceName: '',
      sourceURL: '',
      methodology: '',
      sourceType: 'primary',
      initialValue: '',
      notes: ''
    });
    toast.success('Data Row created successfully');
  };

  const createVersion = () => {
    if (!selectedDataRow) return;
    
    const newVersion: DataVersion = {
      id: Date.now().toString(),
      versionUID: generateVersionUID(selectedDataRow.id, '1.0'),
      parentRowId: selectedDataRow.id,
      version: '1.0',
      value: versionForm.value,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'sa_user',
      notes: versionForm.notes
    };
    
    setClientEFDefinitions(clientEFDefinitions.map(ef => ({
      ...ef,
      dataRows: ef.dataRows.map(row => {
        if (row.id === selectedDataRow.id) {
          const updatedVersions = row.versions.map(v => ({ ...v, isActive: false }));
          return { 
            ...row, 
            versions: [...updatedVersions, newVersion]
          };
        }
        return row;
      })
    })));
    
    setIsCreateVersionDialogOpen(false);
    setVersionForm({ value: 0, notes: '' });
    toast.success('Version created successfully');
  };

  const handleAssignMasterEFs = (selectedEFIds: string[]) => {
    const assignedEFs = selectedEFIds.map((efId) => {
      const masterEF = masterEFDefinitions.find(ef => ef.id === efId);
      if (!masterEF) return null;
      
      // Convert Master EF to Client EF format
      const assignedEF: ClientEFDefinition = {
        id: `assigned-${Date.now()}-${efId}`,
        uid: masterEF.uid,
        name: masterEF.name,
        category: masterEF.category,
        country: masterEF.country,
        tags: masterEF.tags,
        status: 'active',
        description: masterEF.description,
        impactCategories: masterEF.impactCategories,
        database: 'master',
        clientId: 'CLIENT-001',
        createdBy: 'sa_user',
        createdAt: new Date().toISOString(),
        isAssignedFromMaster: true,
        assignedFrom: {
          originalUID: masterEF.uid,
          assignedAt: new Date().toISOString(),
          assignedBy: 'sa_user'
        },
        // Convert core data rows to client data rows format
        dataRows: masterEF.coreDataRows?.map(coreRow => {
          // Extract year from referenceDate if available
          const refDate = typeof coreRow.referenceDate === 'string' 
            ? new Date(coreRow.referenceDate) 
            : coreRow.referenceDate;
          const year = refDate ? refDate.getFullYear() : new Date().getFullYear();
          
          // Create initial version from the core data row value
          const initialVersion: DataVersion = {
            id: `v1-${coreRow.id}`,
            versionUID: `${coreRow.id}-V1.0`,
            parentRowId: `client-${coreRow.id}`,
            version: '1.0',
            value: coreRow.value,
            isActive: true,
            createdAt: coreRow.createdAt,
            createdBy: coreRow.createdBy,
            notes: 'Initial version from Master DB'
          };
          
          return {
            id: `client-${coreRow.id}`,
            parentEFUID: masterEF.uid,
            year: year,
            country: coreRow.country,
            region: coreRow.region,
            sector: 'General',
            subSector: 'General',
            unit: coreRow.impactUnit,
            uncertainty: undefined,
            geographicScope: 'national' as const,
            technologyScope: 'average' as const,
            timeScope: 'current' as const,
            sourceName: coreRow.referenceName,
            sourceURL: coreRow.referenceURL,
            methodology: undefined,
            sourceType: 'secondary' as const,
            notes: undefined,
            functionalUnit: masterEF.functionalUnit,
            systemBoundary: undefined,
            allocationMethod: undefined,
            derivationReason: 'Assigned from Master DB',
            createdAt: coreRow.createdAt,
            createdBy: coreRow.createdBy,
            versions: [initialVersion]
          };
        }) || []
      };
      
      return assignedEF;
    }).filter(Boolean) as ClientEFDefinition[];
    
    setClientEFDefinitions([...clientEFDefinitions, ...assignedEFs]);
    setIsAssignMasterEFDialogOpen(false);
    toast.success(`${assignedEFs.length} emission factors assigned from Master DB`);
  };

  // Edit functions
  const startEdit = (item: any, type: 'ef' | 'datarow' | 'version') => {
    if (type === 'ef') {
      const ef = item as ClientEFDefinition;
      setSelectedEF(ef);
      setEFForm({
        name: ef.name,
        category: ef.category,
        country: ef.country,
        tags: ef.tags,
        description: ef.description
      });
      setIsEditEFDialogOpen(true);
    } else if (type === 'datarow') {
      const dataRow = item as DataRow;
      setSelectedDataRow(dataRow);
      setDataRowForm({
        year: dataRow.year,
        country: dataRow.country,
        region: dataRow.region,
        sector: dataRow.sector,
        subSector: dataRow.subSector,
        unit: dataRow.unit,
        uncertainty: dataRow.uncertainty || 0,
        geographicScope: dataRow.geographicScope,
        technologyScope: dataRow.technologyScope,
        timeScope: dataRow.timeScope,
        sourceName: dataRow.sourceName,
        sourceURL: dataRow.sourceURL || '',
        methodology: dataRow.methodology || '',
        sourceType: dataRow.sourceType,
        notes: dataRow.notes || '',
        impactCategory: dataRow.impactCategory || '',
        impactUnit: dataRow.impactUnit || '',
        functionalUnit: dataRow.functionalUnit || [],
        initialValue: '',
        systemBoundary: '',
        allocationMethod: '',
        derivationReason: ''
      });
      setIsEditDataRowDialogOpen(true);
    }
  };



  // Delete functions
  const deleteEFDefinition = (ef: ClientEFDefinition) => {
    setClientEFDefinitions(clientEFDefinitions.filter(e => e.id !== ef.id));
    toast.success('EF Definition deleted');
  };

  const deleteDataRow = (ef: ClientEFDefinition, dataRow: DataRow) => {
    setClientEFDefinitions(clientEFDefinitions.map(e => 
      e.id === ef.id 
        ? { ...e, dataRows: e.dataRows.filter(row => row.id !== dataRow.id) }
        : e
    ));
    toast.success('Data Row deleted');
  };

  const deleteVersion = (ef: ClientEFDefinition, dataRow: DataRow, version: DataVersion) => {
    setClientEFDefinitions(clientEFDefinitions.map(e => ({
      ...e,
      dataRows: e.dataRows.map(row => {
        if (row.id === dataRow.id) {
          let remainingVersions = row.versions.filter(v => v.id !== version.id);
          if (version.isActive && remainingVersions.length > 0) {
            remainingVersions[remainingVersions.length - 1].isActive = true;
          }
          return { ...row, versions: remainingVersions };
        }
        return row;
      })
    })));
    
    toast.success('Version deleted');
  };

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

  // Reset form helper
  const resetEFForm = () => {
    setEFForm({
      name: '',
      category: '',
      country: '',
      tags: [],
      description: '',
      impactCategories: []
    });
  };

  const updateEFDefinition = () => {
    if (!selectedEF || !efForm.name || !efForm.category || !efForm.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedEF: ClientEFDefinition = {
      ...selectedEF,
      name: efForm.name,
      category: efForm.category,
      country: efForm.country,
      tags: efForm.tags,
      description: efForm.description
    };

    setClientEFDefinitions(clientEFDefinitions.map(ef => 
      ef.id === selectedEF.id ? updatedEF : ef
    ));

    setIsEditEFDialogOpen(false);
    setSelectedEF(null);
    setEFForm({
      name: '',
      category: '',
      country: '',
      tags: [],
      description: ''
    });
    toast.success('EF Definition updated successfully');
  };

  const updateDataRow = () => {
    if (!selectedDataRow || !dataRowForm.sourceName || !dataRowForm.unit) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedDataRow: DataRow = {
      ...selectedDataRow,
      year: dataRowForm.year,
      country: dataRowForm.country,
      region: dataRowForm.region,
      sector: dataRowForm.sector,
      subSector: dataRowForm.subSector,
      unit: dataRowForm.unit,
      uncertainty: dataRowForm.uncertainty,
      geographicScope: dataRowForm.geographicScope,
      technologyScope: dataRowForm.technologyScope,
      timeScope: dataRowForm.timeScope,
      sourceName: dataRowForm.sourceName,
      sourceURL: dataRowForm.sourceURL,
      methodology: dataRowForm.methodology,
      sourceType: dataRowForm.sourceType,
      notes: dataRowForm.notes
    };

    setClientEFDefinitions(clientEFDefinitions.map(ef => ({
      ...ef,
      dataRows: ef.dataRows.map(row => 
        row.id === selectedDataRow.id ? updatedDataRow : row
      )
    })));

    setIsEditDataRowDialogOpen(false);
    setSelectedDataRow(null);
    setDataRowForm({
      year: new Date().getFullYear(),
      country: '',
      region: '',
      sector: '',
      subSector: '',
      impactCategory: '',
      impactUnit: '',
      functionalUnit: [],
      unit: '',
      uncertainty: 0,
      geographicScope: 'national',
      technologyScope: 'average',
      timeScope: 'current',
      sourceName: '',
      sourceURL: '',
      methodology: '',
      sourceType: 'primary',
      initialValue: '',
      notes: ''
    });
    toast.success('Data Row updated successfully');
  };

  const handleBulkUpload = () => {
    toast.success('Bulk upload completed: 8 Client EFs inserted, 2 updated, 1 skipped');
  };

  const getActiveVersion = (dataRow: DataRow) => {
    return dataRow.versions.find(v => v.isActive) || dataRow.versions[dataRow.versions.length - 1];
  };

  const getTotalDataRows = (ef: ClientEFDefinition) => {
    return ef.dataRows.length;
  };

  const getTotalVersions = (ef: ClientEFDefinition) => {
    return ef.dataRows.reduce((total, row) => total + row.versions.length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Client Emission Factors</h1>
              <p className="text-gray-600">Manage client-specific EF definitions and assigned Master DB factors</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            onClick={() => setIsAssignMasterEFDialogOpen(true)}
          >
            <Star className="h-4 w-4 mr-2" />
            Assign from Master DB
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            onClick={() => setIsCreateEFDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Client EF Definition
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search emission factors by name or UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-48">
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
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Databases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Databases</SelectItem>
            <SelectItem value="client">Client DB</SelectItem>
            <SelectItem value="master">Master DB (Assigned)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total EF Definitions</p>
                <p className="text-2xl font-semibold text-gray-900">{clientEFDefinitions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Data Rows</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {clientEFDefinitions.reduce((total, ef) => total + getTotalDataRows(ef), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Versions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {clientEFDefinitions.reduce((total, ef) => total + getTotalVersions(ef), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">From Master DB</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {clientEFDefinitions.filter(ef => ef.isAssignedFromMaster).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
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
                          {ef.isAssignedFromMaster && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              <Star className="h-3 w-3 mr-1" />
                              From Master DB
                            </Badge>
                          )}
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
                      <Badge 
                        variant={ef.status === 'active' ? 'default' : ef.status === 'draft' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {ef.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!ef.isAssignedFromMaster && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => startEdit(ef, 'ef')}
                              title="Edit EF Definition"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteEFDefinition(ef)}
                              title="Delete EF Definition"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {ef.isAssignedFromMaster && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Protected - From Master DB"
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Add Data Row Button when EF is expanded */}
                  {expandedEFs.has(ef.id) && !ef.isAssignedFromMaster && (
                    <TableRow className="border-l-4 border-l-emerald-300 bg-emerald-25">
                      <TableCell colSpan={7} className="py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEF(ef);
                            setIsCreateDataRowDialogOpen(true);
                          }}
                          className="ml-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Data Row
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Data Rows */}
                  {expandedEFs.has(ef.id) && ef.dataRows.map((dataRow) => (
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
                              {getActiveVersion(dataRow)?.value} {dataRow.unit}
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
                            {!ef.isAssignedFromMaster && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => startEdit(dataRow, 'datarow')}
                                  title="Edit Data Row"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteDataRow(ef, dataRow)}
                                  title="Delete Data Row"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Add Version Button when Data Row is expanded */}
                      {expandedDataRows.has(dataRow.id) && !ef.isAssignedFromMaster && (
                        <TableRow className="border-l-4 border-l-cyan-300 bg-cyan-25">
                          <TableCell colSpan={7} className="py-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDataRow(dataRow);
                                setIsCreateVersionDialogOpen(true);
                              }}
                              className="ml-16 border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Version
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
                              {!ef.isAssignedFromMaster && (
                                <>
                                  {version.isActive ? (
                                    <Badge variant="default" className="text-xs bg-green-600">
                                      Latest
                                    </Badge>
                                  ) : (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => deleteVersion(ef, dataRow, version)}
                                      title="Delete Version"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      disabled={dataRow.versions.length <= 1}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              )}
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

      {/* Create Client EF Definition Dialog - Enhanced */}
      <Dialog open={isCreateEFDialogOpen} onOpenChange={setIsCreateEFDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              Create Client EF Definition
            </DialogTitle>
            <DialogDescription>
              Create the basic structure and metadata for your new client-specific emission factor. You'll add data rows and versions in the next steps.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  Basic Information
                </CardTitle>
                <p className="text-sm text-gray-600">Define the core properties of your emission factor</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ef-name" className="font-medium text-teal-900">EF Name *</Label>
                    <Input
                      id="ef-name"
                      value={efForm.name}
                      onChange={(e) => setEFForm({ ...efForm, name: e.target.value })}
                      placeholder="e.g., Client-Specific Electricity Grid Mix"
                      className="h-12 bg-white border-teal-200 focus:border-teal-400 focus:ring-teal-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ef-category" className="font-medium text-teal-900">Category *</Label>
                    <Select value={efForm.category} onValueChange={(value) => setEFForm({ ...efForm, category: value })}>
                      <SelectTrigger className="h-12 bg-white border-teal-200 focus:border-teal-400 focus:ring-teal-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ef-country" className="font-medium text-teal-900">Country/Region *</Label>
                  <Select value={efForm.country} onValueChange={(value) => setEFForm({ ...efForm, country: value })}>
                    <SelectTrigger className="h-12 bg-white border-teal-200 focus:border-teal-400 focus:ring-teal-200">
                      <SelectValue placeholder="Select country or region" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            {country}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ef-description" className="font-medium text-teal-900">Description</Label>
                  <Textarea
                    id="ef-description"
                    value={efForm.description}
                    onChange={(e) => setEFForm({ ...efForm, description: e.target.value })}
                    placeholder="Describe this emission factor's purpose, scope, and specific use case for your client"
                    rows={3}
                    className="bg-white border-teal-200 focus:border-teal-400 focus:ring-teal-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ef-tags" className="font-medium text-teal-900">Tags (comma-separated)</Label>
                  <Input
                    id="ef-tags"
                    value={efForm.tags.join(', ')}
                    onChange={(e) => setEFForm({
                      ...efForm, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    placeholder="e.g., client-specific, regional, electricity, scope-2"
                    className="h-12 bg-white border-teal-200 focus:border-teal-400 focus:ring-teal-200"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {efForm.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-teal-100 text-teal-800 border-teal-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Impact Categories
                </CardTitle>
                <p className="text-sm text-gray-600">Select the environmental impact categories this emission factor covers</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {impactCategories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`impact-${category}`}
                        checked={efForm.impactCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEFForm({
                              ...efForm,
                              impactCategories: [...efForm.impactCategories, category]
                            });
                          } else {
                            setEFForm({
                              ...efForm,
                              impactCategories: efForm.impactCategories.filter(c => c !== category)
                            });
                          }
                        }}
                        className="border-green-300 data-[state=checked]:bg-green-600"
                      />
                      <Label 
                        htmlFor={`impact-${category}`}
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
                {efForm.impactCategories.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Selected categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {efForm.impactCategories.map(category => (
                        <Badge key={category} className="bg-green-100 text-green-800 border-green-200">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateEFDialogOpen(false);
                setEFForm({
                  name: '',
                  category: '',
                  country: '',
                  tags: [],
                  description: '',
                  impactCategories: []
                });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={createEFDefinition}
              disabled={!efForm.name || !efForm.category || !efForm.country}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            >
              Create Definition & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit EF Definition Dialog */}
      <Dialog open={isEditEFDialogOpen} onOpenChange={setIsEditEFDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Client EF Definition</DialogTitle>
            <DialogDescription>
              Update the emission factor definition for {selectedEF?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ef-name">Name *</Label>
                <Input
                  id="edit-ef-name"
                  value={efForm.name}
                  onChange={(e) => setEFForm({ ...efForm, name: e.target.value })}
                  placeholder="Enter EF name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ef-category">Category *</Label>
                <Select value={efForm.category} onValueChange={(value) => setEFForm({ ...efForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ef-country">Country *</Label>
              <Select value={efForm.country} onValueChange={(value) => setEFForm({ ...efForm, country: value })}>
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
              <Label htmlFor="edit-ef-description">Description</Label>
              <Textarea
                id="edit-ef-description"
                value={efForm.description}
                onChange={(e) => setEFForm({ ...efForm, description: e.target.value })}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEFDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateEFDefinition}>
              Update EF Definition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Data Row Dialog */}
      <Dialog open={isCreateDataRowDialogOpen} onOpenChange={setIsCreateDataRowDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Add Data Row to {selectedEF?.name}
            </DialogTitle>
            <DialogDescription>
              Add a new data row to this EF definition. Data row UID will be auto-generated.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Value *</Label>
                <Input
                  type="number"
                  step="any"
                  value={dataRowForm.initialValue}
                  onChange={(e) => setDataRowForm({...dataRowForm, initialValue: e.target.value})}
                  placeholder="e.g., 0.4207"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Impact Category *</Label>
                    <Select 
                      value={dataRowForm.impactCategory} 
                      onValueChange={(value) => {
                        const impactUnit = impactCategoryToUnitMapping[value] || '';
                        setDataRowForm({
                          ...dataRowForm, 
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Impact Unit (Auto-populated) *</Label>
                <Input
                  value={dataRowForm.impactUnit}
                  disabled
                  placeholder="Auto-populated based on Impact Category"
                  className="bg-gray-50"
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
                            id={`fu-create-${unit}`}
                            checked={dataRowForm.functionalUnit.includes(unit)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setDataRowForm({
                                  ...dataRowForm,
                                  functionalUnit: [...dataRowForm.functionalUnit, unit]
                                });
                              } else {
                                setDataRowForm({
                                  ...dataRowForm,
                                  functionalUnit: dataRowForm.functionalUnit.filter(u => u !== unit)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`fu-create-${unit}`} className="cursor-pointer text-sm font-normal">
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
            </div>
            
            <div className="space-y-2">
              <Label>Reference Name *</Label>
              <Input
                value={dataRowForm.sourceName}
                onChange={(e) => setDataRowForm({...dataRowForm, sourceName: e.target.value})}
                placeholder="e.g., EPA eGRID"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Reference URL</Label>
              <Input
                value={dataRowForm.sourceURL}
                onChange={(e) => setDataRowForm({...dataRowForm, sourceURL: e.target.value})}
                placeholder="https://..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select 
                  value={dataRowForm.country} 
                  onValueChange={(value) => setDataRowForm({...dataRowForm, country: value})}
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
                <Label>Region (Auto-generated)</Label>
                <Select 
                  value={dataRowForm.region} 
                  onValueChange={(value) => setDataRowForm({...dataRowForm, region: value})}
                  disabled={!dataRowForm.country}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dataRowForm.country ? "Select region" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Reference Date *</Label>
              <Input
                type="number"
                value={dataRowForm.year}
                onChange={(e) => setDataRowForm({...dataRowForm, year: parseInt(e.target.value)})}
                placeholder="e.g., 2024"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDataRowDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createDataRow} className="bg-emerald-600 hover:bg-emerald-700">
              Add Data Row
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Data Row Dialog */}
      <Dialog open={isEditDataRowDialogOpen} onOpenChange={setIsEditDataRowDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Data Row
            </DialogTitle>
            <DialogDescription>
              Update the data row information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Impact Category *</Label>
              <Select 
                value={dataRowForm.impactCategory} 
                onValueChange={(value) => {
                  const impactUnit = impactCategoryToUnitMapping[value] || '';
                  setDataRowForm({
                    ...dataRowForm, 
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Impact Unit (Auto-populated) *</Label>
                <Input
                  value={dataRowForm.impactUnit}
                  disabled
                  placeholder="Auto-populated based on Impact Category"
                  className="bg-gray-50"
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
                            checked={dataRowForm.functionalUnit.includes(unit)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setDataRowForm({
                                  ...dataRowForm,
                                  functionalUnit: [...dataRowForm.functionalUnit, unit]
                                });
                              } else {
                                setDataRowForm({
                                  ...dataRowForm,
                                  functionalUnit: dataRowForm.functionalUnit.filter(u => u !== unit)
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
            </div>
            
            <div className="space-y-2">
              <Label>Reference Name *</Label>
              <Input
                value={dataRowForm.sourceName}
                onChange={(e) => setDataRowForm({...dataRowForm, sourceName: e.target.value})}
                placeholder="e.g., EPA eGRID"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Reference URL</Label>
              <Input
                value={dataRowForm.sourceURL}
                onChange={(e) => setDataRowForm({...dataRowForm, sourceURL: e.target.value})}
                placeholder="https://..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select 
                  value={dataRowForm.country} 
                  onValueChange={(value) => setDataRowForm({...dataRowForm, country: value})}
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
                <Label>Region (Auto-generated)</Label>
                <Select 
                  value={dataRowForm.region} 
                  onValueChange={(value) => setDataRowForm({...dataRowForm, region: value})}
                  disabled={!dataRowForm.country}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dataRowForm.country ? "Select region" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Reference Date *</Label>
              <Input
                type="number"
                value={dataRowForm.year}
                onChange={(e) => setDataRowForm({...dataRowForm, year: parseInt(e.target.value)})}
                placeholder="e.g., 2024"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDataRowDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateDataRow} className="bg-emerald-600 hover:bg-emerald-700">
              Update Data Row
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Version Dialog */}
      <Dialog open={isCreateVersionDialogOpen} onOpenChange={setIsCreateVersionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Add a new version to the selected data row
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version-value">Value *</Label>
              <Input
                id="version-value"
                type="number"
                step="any"
                value={versionForm.value}
                onChange={(e) => setVersionForm({ ...versionForm, value: parseFloat(e.target.value) })}
                placeholder="Enter emission factor value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version-notes">Notes</Label>
              <Textarea
                id="version-notes"
                value={versionForm.notes}
                onChange={(e) => setVersionForm({ ...versionForm, notes: e.target.value })}
                placeholder="Enter notes for this version"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateVersionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createVersion}>
              Create Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Master EF Dialog */}
      <AssignMasterEFDialog
        isOpen={isAssignMasterEFDialogOpen}
        onClose={() => setIsAssignMasterEFDialogOpen(false)}
        onAssign={handleAssignMasterEFs}
      />
    </div>
  );
};