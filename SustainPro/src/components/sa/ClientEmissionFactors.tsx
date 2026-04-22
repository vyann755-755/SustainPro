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
import { AssignMasterEFDialog } from './ClientEmissionFactorsSearch';
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
  TreePine,
  Star,
  Shield,
  Lock,
  Users
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Custom field types
type CustomFieldType = 'text' | 'number' | 'date' | 'dropdown' | 'boolean' | 'textarea';

interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

// New Data Structure for Hierarchical Flow (SA-specific)
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
  coreDataRows: CoreDataRow[];
  updatedAt?: string;
  updatedBy?: string;
  isAssignedFromMaster?: boolean;
  masterEFUID?: string;
}

// UID Generation Helpers for SA
const generateClientEFUID = (category: string, country: string, year: number, sequence: number, clientId: string): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const countryCode = country === 'Global' ? 'GLB' : country.substring(0, 3).toUpperCase();
  const clientCode = clientId.substring(0, 3).toUpperCase();
  return `CEF-${clientCode}-${categoryCode}-${countryCode}-${year}-${sequence.toString().padStart(3, '0')}`;
};

const generateVersionUID = (parentRowId: string, version: string): string => {
  return `${parentRowId}-V${version}`;
};

// Mock Data - Client EF Definitions
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
    coreDataRows: [
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
        sourceName: 'Regional Utility Data',
        sourceType: 'primary',
        createdAt: '2024-01-20T14:30:00Z',
        createdBy: 'sa_user',
        versions: [
          {
            id: 'v1',
            versionUID: 'row1-V1.0',
            parentRowId: 'row1',
            version: '1.0',
            value: 0.385,
            isActive: true,
            createdAt: '2024-01-20T14:30:00Z',
            createdBy: 'sa_user'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    uid: 'EF-ENE-USA-2024-001',
    name: 'Electricity Grid Mix - US (Master DB)',
    category: 'Energy',
    country: 'United States',
    tags: ['electricity', 'grid', 'scope-2', 'assigned'],
    status: 'active',
    description: 'US national average electricity grid emission factor - assigned from Master DB',
    impactCategories: ['GWP-100', 'GWP-20'],
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    isAssignedFromMaster: true,
    masterEFUID: 'EF-ENE-USA-2024-001',
    coreDataRows: [
      {
        id: 'row2',
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
            versionUID: 'row2-V1.0',
            parentRowId: 'row2',
            version: '1.0',
            value: 0.4207,
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
            createdBy: 'admin'
          }
        ]
      }
    ]
  }
];

// Mock Master EFs available for assignment
const mockAvailableMasterEFs = [
  {
    id: 'master1',
    uid: 'EF-FUE-GLB-2024-001',
    name: 'Natural Gas Combustion',
    category: 'Fuel',
    country: 'Global',
    description: 'Direct combustion of natural gas',
    impactCategories: ['GWP-100'],
    latestVersion: '1.0',
    latestValue: { value: 1.9867, unit: 'kg CO2e/m³' }
  },
  {
    id: 'master2',
    uid: 'EF-TRA-USA-2024-002',
    name: 'Light Duty Vehicle Transport',
    category: 'Transport',
    country: 'United States',
    description: 'Average passenger vehicle transportation',
    impactCategories: ['GWP-100'],
    latestVersion: '1.0',
    latestValue: { value: 0.23, unit: 'kg CO2e/km' }
  },
  {
    id: 'master3',
    uid: 'EF-ENE-GER-2024-003',
    name: 'Electricity Grid Mix - Germany',
    category: 'Energy',
    country: 'Germany',
    description: 'German national electricity grid emission factor',
    impactCategories: ['GWP-100', 'GWP-20'],
    latestVersion: '1.0',
    latestValue: { value: 0.366, unit: 'kg CO2e/kWh' }
  },
  {
    id: 'master4',
    uid: 'EF-MAT-GLB-2024-004',
    name: 'Steel Production - Primary',
    category: 'Materials',
    country: 'Global',
    description: 'Primary steel production from iron ore',
    impactCategories: ['GWP-100'],
    latestVersion: '1.0',
    latestValue: { value: 2.1, unit: 'kg CO2e/kg' }
  },
  {
    id: 'master5',
    uid: 'EF-TRA-UK-2024-005',
    name: 'Heavy Duty Vehicle Transport',
    category: 'Transport',
    country: 'United Kingdom',
    description: 'Heavy goods vehicle transportation',
    impactCategories: ['GWP-100'],
    latestVersion: '1.0',
    latestValue: { value: 0.89, unit: 'kg CO2e/tkm' }
  },
  {
    id: 'master6',
    uid: 'EF-FUE-CAN-2024-006',
    name: 'Diesel Fuel Combustion',
    category: 'Fuel',
    country: 'Canada',
    description: 'Direct combustion of diesel fuel',
    impactCategories: ['GWP-100'],
    latestVersion: '1.0',
    latestValue: { value: 2.68, unit: 'kg CO2e/L' }
  }
];

const countries = ['Global', 'United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia', 'Japan'];
const categories = ['Energy', 'Fuel', 'Transport', 'Materials', 'Waste', 'Agriculture', 'Industrial Process'];
const impactCategories = ['GWP-100', 'GWP-20', 'AP', 'EP', 'ODP', 'POCP', 'ADP', 'FAETP'];

export function ClientEmissionFactors() {
  const [clientEFDefinitions, setClientEFDefinitions] = useState<ClientEFDefinition[]>(mockClientEFDefinitions);
  const [availableMasterEFs] = useState(mockAvailableMasterEFs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  
  // Expansion states for hierarchical table
  const [expandedEFs, setExpandedEFs] = useState<Set<string>>(new Set());
  const [expandedDataRows, setExpandedDataRows] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isCreateEFDialogOpen, setIsCreateEFDialogOpen] = useState(false);
  const [isAssignMasterEFDialogOpen, setIsAssignMasterEFDialogOpen] = useState(false);
  
  // Selected items
  const [selectedEF, setSelectedEF] = useState<ClientEFDefinition | null>(null);

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
      const efDataRowIds = clientEFDefinitions.find(ef => ef.id === efId)?.coreDataRows.map(row => row.id) || [];
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

  // Handler functions
  const handleAssignMasterEFs = (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one emission factor');
      return;
    }

    const assignedEFs = selectedIds.map(masterId => {
      const masterEF = availableMasterEFs.find(ef => ef.id === masterId);
      if (!masterEF) return null;

      return {
        ...masterEF,
        id: `assigned_${Date.now()}_${masterId}`,
        database: 'master' as const,
        isAssignedFromMaster: true,
        masterEFUID: masterEF.uid,
        clientId: 'CLIENT-001',
        tags: [...(masterEF.tags || []), 'assigned'],
        coreDataRows: [] // Will be populated based on master data
      } as ClientEFDefinition;
    }).filter(Boolean);

    setClientEFDefinitions([...clientEFDefinitions, ...assignedEFs as ClientEFDefinition[]]);
    setIsAssignMasterEFDialogOpen(false);
    
    toast.success(`${assignedEFs.length} emission factor(s) assigned from Master DB`);
  };

  const copyUID = (uid: string) => {
    navigator.clipboard.writeText(uid);
    toast.success('UID copied to clipboard');
  };

  const handleBulkUpload = () => {
    toast.success('Bulk upload completed: 8 Client EFs inserted, 2 updated, 1 skipped');
  };

  const getActiveVersion = (dataRow: CoreDataRow) => {
    return dataRow.versions.find(v => v.isActive) || dataRow.versions[dataRow.versions.length - 1];
  };

  const getTotalDataRows = (ef: ClientEFDefinition) => {
    return ef.coreDataRows.length;
  };

  const getTotalVersions = (ef: ClientEFDefinition) => {
    return ef.coreDataRows.reduce((total, row) => total + row.versions.length, 0);
  };

  const handleUnassignMasterEF = (ef: ClientEFDefinition) => {
    if (!ef.isAssignedFromMaster) {
      toast.error('This is not an assigned Master EF');
      return;
    }

    setClientEFDefinitions(clientEFDefinitions.filter(item => item.id !== ef.id));
    toast.success(`Master EF ${ef.uid} unassigned from client`);
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
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="client">Client EFs</SelectItem>
            <SelectItem value="master">Master DB</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hierarchical Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Client Emission Factors ({filteredEFs.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {filteredEFs.filter(ef => ef.database === 'client').length} Client EFs
              </Badge>
              <Badge variant="outline" className="text-xs">
                {filteredEFs.filter(ef => ef.database === 'master').length} Master DB
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>EF Definition</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Data Summary</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEFs.map((ef) => (
                  <React.Fragment key={ef.id}>
                    {/* EF Definition Row */}
                    <TableRow 
                      className={`cursor-pointer hover:bg-gray-50 ${expandedEFs.has(ef.id) ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleEFExpansion(ef.id)}
                    >
                      <TableCell>
                        <ChevronRight 
                          className={`h-4 w-4 transition-transform ${expandedEFs.has(ef.id) ? 'rotate-90' : ''}`} 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ef.name}</span>
                            {ef.isAssignedFromMaster && <Lock className="h-3 w-3 text-gray-400" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{ef.uid}</code>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                copyUID(ef.uid);
                              }}
                              className="h-5 w-5 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ef.category}</Badge>
                      </TableCell>
                      <TableCell>{ef.country}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={ef.status === 'active' ? 'default' : ef.status === 'draft' ? 'secondary' : 'outline'}
                        >
                          {ef.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={ef.database === 'client' ? 'default' : 'outline'}
                            className={ef.database === 'client' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'}
                          >
                            {ef.database === 'client' ? 'Client' : 'Master DB'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {getTotalDataRows(ef)} rows, {getTotalVersions(ef)} versions
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {ef.isAssignedFromMaster ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnassignMasterEF(ef);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Core Data Rows (when EF is expanded) */}
                    {expandedEFs.has(ef.id) && ef.coreDataRows.map((row) => (
                      <React.Fragment key={row.id}>
                        <TableRow 
                          className={`bg-gray-50 cursor-pointer hover:bg-gray-100 ${expandedDataRows.has(row.id) ? 'bg-blue-100' : ''}`}
                          onClick={() => toggleDataRowExpansion(row.id)}
                        >
                          <TableCell className="pl-8">
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${expandedDataRows.has(row.id) ? 'rotate-90' : ''}`} 
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">Core Data Row</span>
                            </div>
                          </TableCell>
                          <TableCell>{row.sector}</TableCell>
                          <TableCell>{row.country}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {row.year}
                            </Badge>
                          </TableCell>
                          <TableCell>{row.sourceName}</TableCell>
                          <TableCell>
                            <span className="text-sm">{row.versions.length} versions</span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Versions (when Core Data Row is expanded) */}
                        {expandedDataRows.has(row.id) && row.versions.map((version) => (
                          <TableRow key={version.id} className="bg-blue-50">
                            <TableCell className="pl-12"></TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">Version {version.version}</span>
                                {version.isActive && (
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{row.unit}</TableCell>
                            <TableCell>
                              <span className="font-medium">{version.value}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-gray-500">
                                {new Date(version.createdAt).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell>{version.createdBy}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-white px-2 py-0.5 rounded border">
                                {version.versionUID}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEFs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No emission factors found</p>
              <p className="text-sm">Try adjusting your search criteria or create a new emission factor</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Master EF Dialog */}
      <AssignMasterEFDialog
        isOpen={isAssignMasterEFDialogOpen}
        onClose={() => setIsAssignMasterEFDialogOpen(false)}
        onAssign={handleAssignMasterEFs}
      />

      {/* Create EF Dialog placeholder */}
      <Dialog open={isCreateEFDialogOpen} onOpenChange={setIsCreateEFDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Client EF Definition</DialogTitle>
            <DialogDescription>
              Create a new client-specific emission factor definition
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">Create EF form would go here...</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateEFDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateEFDialogOpen(false)}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}