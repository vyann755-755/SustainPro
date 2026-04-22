import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
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
  Calculator,
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
  ChevronLeft,
  TreePine,
  Variable,
  Database,
  Zap,
  Code2,
  HelpCircle,
  Lightbulb,
  Save,
  RotateCcw,
  MousePointer,
  Target,
  Star
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useMasterDB } from '../../contexts/MasterDBContext';

// Parameter types for formulas
type FormulaParameterType = 'formula_parameter' | 'ef_value' | 'constant';

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
  parameterType: FormulaParameterType;
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
  parentFormulaUID: string;
  name: string;
  description?: string;
  expression: string;
  outputUnit: string;
  versions: FormulaExpressionVersion[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface ClientFormulaDefinition {
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
  sourceType: 'custom' | 'assigned_from_master';
  masterFormulaUID?: string; // For tracking if assigned from master
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Parameter form data interface
interface ParameterFormData {
  name: string;
  type: 'number' | 'text' | 'boolean';
  unit: string;
  defaultValue: string;
  description: string;
  required: boolean;
  minValue: string;
  maxValue: string;
  parameterType: FormulaParameterType;
  efSource: 'master_db' | 'client_db';
  efCategory: string;
  efUID: string;
  efDefinition: string;
  constantValue: string;
  constantDescription: string;
}

interface ExpressionFormData {
  name: string;
  description: string;
  expression: string;
  outputUnit: string;
}

interface FormulaFormData {
  name: string;
  category: string;
  description: string;
  tags: string[];
  customFieldValues: Record<string, string>;
}

interface MockEmissionFactor {
  uid: string;
  name: string;
  category: string;
  description: string;
  latestValue: {
    value: number;
    unit: string;
  };
  source: string;
}

const ClientFormulasCompleteFull: React.FC = () => {
  const { getMasterFormulasForAssignment } = useMasterDB();
  const masterFormulas = getMasterFormulasForAssignment();
  
  // State management
  const [clientFormulas, setClientFormulas] = useState<ClientFormulaDefinition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'deprecated'>('all');
  const [expandedFormulas, setExpandedFormulas] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isCreateFormulaDialogOpen, setIsCreateFormulaDialogOpen] = useState(false);
  const [isMasterFormulaDialogOpen, setIsMasterFormulaDialogOpen] = useState(false);
  const [isViewFormulaDialogOpen, setIsViewFormulaDialogOpen] = useState(false);
  const [isAddParameterDialogOpen, setIsAddParameterDialogOpen] = useState(false);
  const [isAddExpressionDialogOpen, setIsAddExpressionDialogOpen] = useState(false);
  const [showParameterTypeSelection, setShowParameterTypeSelection] = useState(true);
  
  // Form states
  const [selectedFormula, setSelectedFormula] = useState<ClientFormulaDefinition | null>(null);
  const [selectedMasterFormula, setSelectedMasterFormula] = useState<any>(null);
  const [formulaFormData, setFormulaFormData] = useState<FormulaFormData>({
    name: '',
    category: '',
    description: '',
    tags: [],
    customFieldValues: {}
  });
  
  const [parameterFormData, setParameterFormData] = useState<ParameterFormData>({
    name: '',
    type: 'number',
    unit: '',
    defaultValue: '',
    description: '',
    required: false,
    minValue: '',
    maxValue: '',
    parameterType: 'formula_parameter',
    efSource: 'master_db',
    efCategory: '',
    efUID: '',
    efDefinition: '',
    constantValue: '',
    constantDescription: ''
  });
  
  const [expressionFormData, setExpressionFormData] = useState<ExpressionFormData>({
    name: '',
    description: '',
    expression: '',
    outputUnit: ''
  });
  
  // EF Search states
  const [efSearchTerm, setEfSearchTerm] = useState('');
  const [isEFSearchOpen, setIsEFSearchOpen] = useState(false);
  const [selectedEF, setSelectedEF] = useState<MockEmissionFactor | null>(null);

  // Constants
  const formulaCategories = [
    'Energy Consumption',
    'Transportation',
    'Manufacturing',
    'Waste Management',
    'Water Usage',
    'Materials',
    'Building Operations',
    'Supply Chain',
    'Agriculture',
    'Land Use'
  ];

  const commonUnits = [
    { value: 'kg', label: 'Kilograms (kg)', category: 'Mass' },
    { value: 'kg_co2e', label: 'kg CO₂ equivalent', category: 'Emissions' },
    { value: 't_co2e', label: 'tonnes CO₂ equivalent', category: 'Emissions' },
    { value: 'kWh', label: 'Kilowatt Hours (kWh)', category: 'Energy' },
    { value: 'MWh', label: 'Megawatt Hours (MWh)', category: 'Energy' },
    { value: 'GJ', label: 'Gigajoules (GJ)', category: 'Energy' },
    { value: 'L', label: 'Liters (L)', category: 'Volume' },
    { value: 'm3', label: 'Cubic Meters (m³)', category: 'Volume' },
    { value: 'km', label: 'Kilometers (km)', category: 'Distance' },
    { value: 'miles', label: 'Miles', category: 'Distance' },
    { value: 'hours', label: 'Hours', category: 'Time' },
    { value: 'days', label: 'Days', category: 'Time' },
    { value: 'units', label: 'Units', category: 'Count' },
    { value: 'pieces', label: 'Pieces', category: 'Count' }
  ];

  const parameterTypeInfo = {
    formula_parameter: {
      title: 'Formula Parameter',
      icon: Variable,
      color: 'bg-blue-100 text-blue-600',
      badge: 'bg-blue-100 text-blue-800'
    },
    ef_value: {
      title: 'Emission Factor',
      icon: Database,
      color: 'bg-emerald-100 text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800'
    },
    constant: {
      title: 'Constant Value',
      icon: Hash,
      color: 'bg-purple-100 text-purple-600',
      badge: 'bg-purple-100 text-purple-800'
    }
  };

  // Mock emission factors data
  const mockEmissionFactors: MockEmissionFactor[] = [
    {
      uid: 'EF_ELEC_GRID_US_2023',
      name: 'US Grid Electricity',
      category: 'Energy',
      description: 'Average US electricity grid emission factor',
      latestValue: { value: 0.386, unit: 'kg CO₂e/kWh' },
      source: 'EPA eGRID 2023'
    },
    {
      uid: 'EF_FUEL_GASOLINE_2023',
      name: 'Gasoline Combustion',
      category: 'Fuel',
      description: 'Gasoline combustion emission factor',
      latestValue: { value: 2.31, unit: 'kg CO₂e/L' },
      source: 'IPCC 2006'
    },
    {
      uid: 'EF_FUEL_DIESEL_2023',
      name: 'Diesel Combustion',
      category: 'Fuel',
      description: 'Diesel fuel combustion emission factor',
      latestValue: { value: 2.68, unit: 'kg CO₂e/L' },
      source: 'IPCC 2006'
    }
  ];

  // Initialize with sample client formulas
  useEffect(() => {
    const sampleClientFormulas: ClientFormulaDefinition[] = [
      {
        id: 'client_formula_1',
        uid: 'CF_OFFICE_ENERGY_001',
        name: 'Office Energy Consumption',
        category: 'Energy Consumption',
        description: 'Calculate total energy consumption for office buildings',
        tags: ['office', 'energy', 'building'],
        parameters: [
          {
            id: 'param_1',
            parentFormulaUID: 'CF_OFFICE_ENERGY_001',
            name: 'Monthly Electricity Usage',
            type: 'number',
            unit: 'kWh',
            defaultValue: 0,
            description: 'Monthly electricity consumption in kWh',
            required: true,
            parameterType: 'formula_parameter',
            versions: [],
            createdAt: '2024-01-15',
            createdBy: 'john.doe@company.com'
          },
          {
            id: 'param_2',
            parentFormulaUID: 'CF_OFFICE_ENERGY_001',
            name: 'Grid Emission Factor',
            type: 'number',
            unit: 'kg CO₂e/kWh',
            description: 'Local electricity grid emission factor',
            required: true,
            parameterType: 'ef_value',
            efSource: 'master_db',
            efUID: 'EF_ELEC_GRID_US_2023',
            versions: [],
            createdAt: '2024-01-15',
            createdBy: 'john.doe@company.com'
          }
        ],
        expressions: [
          {
            id: 'expr_1',
            parentFormulaUID: 'CF_OFFICE_ENERGY_001',
            name: 'Monthly CO2 Emissions',
            description: 'Calculate monthly CO2 emissions from electricity',
            expression: 'Monthly_Electricity_Usage * Grid_Emission_Factor',
            outputUnit: 'kg CO₂e',
            versions: [],
            createdAt: '2024-01-15',
            createdBy: 'john.doe@company.com'
          }
        ],
        status: 'active',
        latestVersion: '1.0',
        customFieldValues: {},
        sourceType: 'custom',
        createdAt: '2024-01-15',
        createdBy: 'john.doe@company.com',
        updatedAt: '2024-01-20',
        updatedBy: 'jane.smith@company.com'
      }
    ];
    setClientFormulas(sampleClientFormulas);
  }, []);

  // Helper functions
  const generateUID = (type: 'formula' | 'parameter' | 'expression') => {
    const prefix = type === 'formula' ? 'CF' : type === 'parameter' ? 'CP' : 'CE';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp.toUpperCase()}_${random.toUpperCase()}`;
  };

  const convertParameterNameForExpression = (name: string) => {
    return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  };

  const copyUID = (uid: string) => {
    navigator.clipboard.writeText(uid);
    toast.success('UID copied to clipboard');
  };

  const toggleFormulaExpansion = (formulaId: string) => {
    const newExpanded = new Set(expandedFormulas);
    if (newExpanded.has(formulaId)) {
      newExpanded.delete(formulaId);
    } else {
      newExpanded.add(formulaId);
    }
    setExpandedFormulas(newExpanded);
  };

  // Filter formulas
  const filteredFormulas = clientFormulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || formula.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || formula.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get available master formulas (exclude already assigned ones)
  const assignedMasterFormulas = clientFormulas
    .filter(f => f.sourceType === 'assigned_from_master' && f.masterFormulaUID)
    .map(f => f.masterFormulaUID!);
  
  const availableMasterFormulas = masterFormulas.filter(f => 
    !assignedMasterFormulas.includes(f.uid)
  );

  // Get available emission factors based on source
  const getAvailableEFs = () => {
    if (parameterFormData.efSource === 'master_db') {
      return mockEmissionFactors;
    } else {
      // In a real app, this would fetch client-specific EFs
      return mockEmissionFactors.filter(ef => ef.source.includes('Client'));
    }
  };

  // Statistics calculations
  const getTotalParameters = () => {
    return filteredFormulas.reduce((total, formula) => total + (formula.parameters?.length || 0), 0);
  };

  const getTotalExpressions = () => {
    return filteredFormulas.reduce((total, formula) => total + (formula.expressions?.length || 0), 0);
  };

  const getAssignedFromMasterCount = () => {
    return clientFormulas.filter(f => f.sourceType === 'assigned_from_master').length;
  };

  const getCustomFormulasCount = () => {
    return clientFormulas.filter(f => f.sourceType === 'custom').length;
  };

  // Handler functions
  const handleCreateFormula = () => {
    if (!formulaFormData.name || !formulaFormData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newFormula: ClientFormulaDefinition = {
      id: generateUID('formula'),
      uid: generateUID('formula'),
      name: formulaFormData.name,
      category: formulaFormData.category,
      description: formulaFormData.description,
      tags: formulaFormData.tags,
      parameters: [],
      expressions: [],
      status: 'draft',
      latestVersion: '1.0',
      customFieldValues: formulaFormData.customFieldValues,
      sourceType: 'custom',
      createdAt: new Date().toISOString(),
      createdBy: 'current.user@company.com'
    };

    if (selectedFormula) {
      // Update existing formula
      setClientFormulas(clientFormulas.map(f => 
        f.id === selectedFormula.id 
          ? { 
              ...f, 
              ...newFormula, 
              id: selectedFormula.id, 
              uid: selectedFormula.uid,
              parameters: selectedFormula.parameters,
              expressions: selectedFormula.expressions,
              updatedAt: new Date().toISOString(),
              updatedBy: 'current.user@company.com'
            }
          : f
      ));
      toast.success('Formula updated successfully');
    } else {
      // Create new formula
      setClientFormulas([...clientFormulas, newFormula]);
      setExpandedFormulas(new Set([...expandedFormulas, newFormula.id]));
      toast.success('Formula created successfully');
    }

    setIsCreateFormulaDialogOpen(false);
    setSelectedFormula(null);
    setFormulaFormData({
      name: '',
      category: '',
      description: '',
      tags: [],
      customFieldValues: {}
    });
  };

  const handleAssignMasterFormula = (masterFormula: any) => {
    const newClientFormula: ClientFormulaDefinition = {
      id: generateUID('formula'),
      uid: generateUID('formula'),
      name: `${masterFormula.name} (Client Copy)`,
      category: masterFormula.category,
      description: masterFormula.description,
      tags: [...(masterFormula.tags || []), 'assigned-from-master'],
      parameters: [], // Will be empty initially, can be added later
      expressions: [], // Will be empty initially, can be added later
      status: 'active',
      latestVersion: masterFormula.latestVersion || '1.0',
      customFieldValues: {},
      sourceType: 'assigned_from_master',
      masterFormulaUID: masterFormula.uid,
      createdAt: new Date().toISOString(),
      createdBy: 'current.user@company.com'
    };

    setClientFormulas([...clientFormulas, newClientFormula]);
    setExpandedFormulas(new Set([...expandedFormulas, newClientFormula.id]));
    toast.success(`Formula "${masterFormula.name}" assigned successfully`);
    setIsMasterFormulaDialogOpen(false);
  };

  const handleEFSelection = (ef: MockEmissionFactor) => {
    setSelectedEF(ef);
    setParameterFormData({
      ...parameterFormData,
      efUID: ef.uid,
      efDefinition: ef.description,
      unit: ef.latestValue.unit
    });
    setIsEFSearchOpen(false);
  };

  const handleAddParameter = () => {
    if (!selectedFormula || !parameterFormData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newParameter: FormulaParameter = {
      id: generateUID('parameter'),
      parentFormulaUID: selectedFormula.uid,
      name: parameterFormData.name,
      type: parameterFormData.type,
      unit: parameterFormData.unit,
      defaultValue: parameterFormData.defaultValue || undefined,
      description: parameterFormData.description,
      required: parameterFormData.required,
      minValue: parameterFormData.minValue ? parseFloat(parameterFormData.minValue) : undefined,
      maxValue: parameterFormData.maxValue ? parseFloat(parameterFormData.maxValue) : undefined,
      parameterType: parameterFormData.parameterType,
      efSource: parameterFormData.parameterType === 'ef_value' ? parameterFormData.efSource : undefined,
      efUID: parameterFormData.parameterType === 'ef_value' ? parameterFormData.efUID : undefined,
      efDefinition: parameterFormData.parameterType === 'ef_value' ? parameterFormData.efDefinition : undefined,
      constantValue: parameterFormData.parameterType === 'constant' ? parameterFormData.constantValue : undefined,
      constantDescription: parameterFormData.parameterType === 'constant' ? parameterFormData.constantDescription : undefined,
      versions: [],
      createdAt: new Date().toISOString(),
      createdBy: 'current.user@company.com'
    };

    const updatedFormula = {
      ...selectedFormula,
      parameters: [...(selectedFormula.parameters || []), newParameter],
      updatedAt: new Date().toISOString(),
      updatedBy: 'current.user@company.com'
    };

    setClientFormulas(clientFormulas.map(f => 
      f.id === selectedFormula.id ? updatedFormula : f
    ));

    toast.success('Parameter added successfully');
    setIsAddParameterDialogOpen(false);
  };

  const handleEditParameter = (parameter: FormulaParameter) => {
    setParameterFormData({
      name: parameter.name,
      type: parameter.type,
      unit: parameter.unit || '',
      defaultValue: parameter.defaultValue?.toString() || '',
      description: parameter.description || '',
      required: parameter.required,
      minValue: parameter.minValue?.toString() || '',
      maxValue: parameter.maxValue?.toString() || '',
      parameterType: parameter.parameterType,
      efSource: parameter.efSource || 'master_db',
      efCategory: parameter.efCategory || '',
      efUID: parameter.efUID || '',
      efDefinition: parameter.efDefinition || '',
      constantValue: parameter.constantValue || '',
      constantDescription: parameter.constantDescription || ''
    });
    setShowParameterTypeSelection(false);
    setIsAddParameterDialogOpen(true);
  };

  const handleAddExpression = () => {
    if (!selectedFormula || !expressionFormData.name || !expressionFormData.expression) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newExpression: FormulaExpression = {
      id: generateUID('expression'),
      parentFormulaUID: selectedFormula.uid,
      name: expressionFormData.name,
      description: expressionFormData.description,
      expression: expressionFormData.expression,
      outputUnit: expressionFormData.outputUnit,
      versions: [],
      createdAt: new Date().toISOString(),
      createdBy: 'current.user@company.com'
    };

    const updatedFormula = {
      ...selectedFormula,
      expressions: [...(selectedFormula.expressions || []), newExpression],
      updatedAt: new Date().toISOString(),
      updatedBy: 'current.user@company.com'
    };

    setClientFormulas(clientFormulas.map(f => 
      f.id === selectedFormula.id ? updatedFormula : f
    ));

    toast.success('Expression added successfully');
    setIsAddExpressionDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-emerald-900 mb-2">Client Database - Formula Management</h2>
          <p className="text-emerald-700">
            Manage client-specific formula definitions, parameters, and calculation expressions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Calculator className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-emerald-600">Total Formulas</p>
                  <p className="text-2xl font-bold text-emerald-900">{clientFormulas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Variable className="h-6 w-6 text-cyan-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-cyan-600">Total Parameters</p>
                  <p className="text-2xl font-bold text-cyan-900">{getTotalParameters()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Code2 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Total Expressions</p>
                  <p className="text-2xl font-bold text-purple-900">{getTotalExpressions()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">From Master DB</p>
                  <p className="text-2xl font-bold text-blue-900">{getAssignedFromMasterCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => setIsCreateFormulaDialogOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Client Formula
          </Button>
          
          <Button 
            onClick={() => setIsMasterFormulaDialogOpen(true)}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Star className="h-4 w-4 mr-2" />
            Assign from Master DB
          </Button>
          
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
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
                placeholder="Search by formula name or UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-emerald-200 focus:border-emerald-500"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 border-emerald-200">
                <Layers className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {formulaCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-48 border-emerald-200">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-emerald-700">
            Found {filteredFormulas.length} formula definition{filteredFormulas.length !== 1 ? 's' : ''} • {getTotalParameters()} total parameters • {getTotalExpressions()} total expressions
          </div>
        </CardContent>
      </Card>

      {/* Hierarchical Table */}
      <Card className="border-emerald-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-emerald-50 hover:bg-emerald-50">
              <TableHead className="w-12"></TableHead>
              <TableHead>Formula Definition / Parameter / Expression</TableHead>
              <TableHead>Category/Type</TableHead>
              <TableHead>Version/Date</TableHead>
              <TableHead>Value/Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFormulas.map((formula) => (
              <React.Fragment key={formula.id}>
                {/* Formula Definition Row */}
                <TableRow className="border-l-4 border-l-emerald-500 bg-emerald-25">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFormulaExpansion(formula.id)}
                      className="p-1"
                    >
                      <ChevronRight 
                        className={`h-4 w-4 transition-transform ${
                          expandedFormulas.has(formula.id) ? 'rotate-90' : ''
                        }`} 
                      />
                    </Button>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">{formula.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyUID(formula.uid)}
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {formula.uid}
                        </Button>
                        {formula.sourceType === 'assigned_from_master' && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <Star className="h-3 w-3 mr-1" />
                            From Master
                          </Badge>
                        )}
                      </div>
                      {formula.description && (
                        <div className="text-sm text-gray-600">{formula.description}</div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      <div>{formula.category}</div>
                      <div className="text-gray-500">{formula.tags?.join(', ') || 'No tags'}</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">{formula.latestVersion}</div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {formula.parameters?.length || 0} parameters
                      </div>
                      <div className="text-gray-500">
                        {formula.expressions?.length || 0} expressions
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge 
                      variant={formula.status === 'active' ? 'default' : 'secondary'}
                      className={formula.status === 'active' ? 'bg-green-600' : ''}
                    >
                      {formula.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedFormula(formula);
                          setIsAddParameterDialogOpen(true);
                          setShowParameterTypeSelection(true);
                        }}
                        title="Add Parameter"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setFormulaFormData({
                            name: formula.name,
                            category: formula.category,
                            description: formula.description,
                            tags: formula.tags,
                            customFieldValues: formula.customFieldValues
                          });
                          setSelectedFormula(formula);
                          setIsCreateFormulaDialogOpen(true);
                        }}
                        title="Edit Formula"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${formula.name}"? This action cannot be undone.`)) {
                            setClientFormulas(clientFormulas.filter(f => f.id !== formula.id));
                            toast.success(`Formula "${formula.name}" deleted successfully`);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Formula"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded Content - Parameters and Expressions */}
                {expandedFormulas.has(formula.id) && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-gray-50 p-0">
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          
                          {/* Parameters Section */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <Variable className="h-4 w-4" />
                                Parameters ({formula.parameters?.length || 0})
                              </h4>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedFormula(formula);
                                  setShowParameterTypeSelection(true);
                                  setIsAddParameterDialogOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Parameter
                              </Button>
                            </div>
                            
                            {/* Parameters List */}
                            <div className="space-y-3">
                              {(formula.parameters || []).map(param => (
                                <div key={param.id} className="bg-white rounded-lg border p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-1 rounded ${parameterTypeInfo[param.parameterType].color}`}>
                                        {React.createElement(parameterTypeInfo[param.parameterType].icon, { className: "h-3 w-3" })}
                                      </div>
                                      <span className="font-medium text-sm">{param.name}</span>
                                      <Badge className={`text-xs ${parameterTypeInfo[param.parameterType].badge}`}>
                                        {param.parameterType.replace('_', ' ').toUpperCase()}
                                      </Badge>
                                      {param.required && (
                                        <Badge variant="outline" className="text-xs">Required</Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleEditParameter(param)}
                                        title="Edit Parameter"
                                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                                      >
                                        <Edit className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                        <span className="ml-1 text-xs font-medium hidden group-hover:inline-block">Edit</span>
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          const updatedFormula = {
                                            ...formula,
                                            parameters: (formula.parameters || []).filter(p => p.id !== param.id)
                                          };
                                          setClientFormulas(clientFormulas.map(f => 
                                            f.id === formula.id ? updatedFormula : f
                                          ));
                                          toast.success('Parameter deleted');
                                        }}
                                        title="Delete Parameter"
                                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 hover:shadow-md transition-all duration-200 group"
                                      >
                                        <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                        <span className="ml-1 text-xs font-medium hidden group-hover:inline-block">Delete</span>
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="text-xs text-gray-600 grid grid-cols-2 gap-4">
                                    <div><strong>Type:</strong> {param.type} {param.unit && `(${param.unit})`}</div>
                                    <div><strong>Default:</strong> {param.defaultValue || 'None'}</div>
                                    {param.efUID && (
                                      <div><strong>EF UID:</strong> {param.efUID}</div>
                                    )}
                                    {param.constantValue && (
                                      <div><strong>Constant:</strong> {param.constantValue}</div>
                                    )}
                                  </div>
                                  
                                  {param.description && (
                                    <p className="text-xs text-gray-500 mt-2 border-t pt-2">
                                      <strong>Description:</strong> {param.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                              
                              {(!formula.parameters || formula.parameters.length === 0) && (
                                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                  <Variable className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No parameters defined yet</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Expressions Section */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <Calculator className="h-4 w-4" />
                                Expressions ({formula.expressions?.length || 0})
                              </h4>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedFormula(formula);
                                  setIsAddExpressionDialogOpen(true);
                                }}
                                disabled={!formula.parameters || formula.parameters.length === 0}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Expression
                              </Button>
                            </div>
                            
                            {/* Expressions List */}
                            <div className="space-y-3">
                              {formula.expressions?.map(expression => (
                                <div key={expression.id} className="bg-white rounded-lg border p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <Calculator className="h-4 w-4 text-orange-600" />
                                      <span className="font-medium text-sm">{expression.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        Output: {expression.outputUnit}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                          setExpressionFormData({
                                            name: expression.name,
                                            description: expression.description || '',
                                            expression: expression.expression,
                                            outputUnit: expression.outputUnit
                                          });
                                          setSelectedFormula(formula);
                                          setIsAddExpressionDialogOpen(true);
                                        }}
                                        title="Edit Expression"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                          const updatedFormula = {
                                            ...formula,
                                            expressions: formula.expressions!.filter(e => e.id !== expression.id)
                                          };
                                          setClientFormulas(clientFormulas.map(f => 
                                            f.id === formula.id ? updatedFormula : f
                                          ));
                                          toast.success('Expression deleted');
                                        }}
                                        title="Delete Expression"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="text-xs text-gray-600 mb-2">
                                    <strong>Expression:</strong>
                                  </div>
                                  <code className="block text-xs bg-gray-100 p-2 rounded font-mono mb-2">
                                    {expression.expression}
                                  </code>
                                  
                                  {expression.description && (
                                    <p className="text-xs text-gray-500 border-t pt-2">
                                      <strong>Description:</strong> {expression.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                              
                              {(!formula.expressions || formula.expressions.length === 0) && (
                                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                  <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No expressions defined yet</p>
                                  {(!formula.parameters || formula.parameters.length === 0) && (
                                    <p className="text-xs text-gray-400 mt-1">Add parameters first to create expressions</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Formula Dialog */}
      <Dialog open={isCreateFormulaDialogOpen} onOpenChange={(open) => {
        setIsCreateFormulaDialogOpen(open);
        if (!open) {
          setFormulaFormData({
            name: '',
            category: '',
            description: '',
            tags: [],
            customFieldValues: {}
          });
          setSelectedFormula(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              {selectedFormula ? 'Edit Client Formula' : 'Create Client Formula'}
            </DialogTitle>
            <DialogDescription>
              {selectedFormula ? 'Update this client-specific formula definition.' : 'Create a new client-specific formula definition.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Formula Name *</Label>
                <Input
                  value={formulaFormData.name}
                  onChange={(e) => setFormulaFormData({...formulaFormData, name: e.target.value})}
                  placeholder="Enter formula name"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formulaFormData.category} onValueChange={(value) => setFormulaFormData({...formulaFormData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {formulaCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formulaFormData.description}
                onChange={(e) => setFormulaFormData({...formulaFormData, description: e.target.value})}
                placeholder="Enter formula description"
                rows={3}
              />
            </div>

            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={formulaFormData.tags.join(', ')}
                onChange={(e) => setFormulaFormData({ ...formulaFormData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFormulaDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFormula}>
              <Plus className="h-4 w-4 mr-2" />
              {selectedFormula ? 'Update Formula' : 'Create Formula'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Master Formula Dialog */}
      <Dialog open={isMasterFormulaDialogOpen} onOpenChange={setIsMasterFormulaDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-600" />
              Assign Formula from Master DB
            </DialogTitle>
            <DialogDescription>
              Browse and assign formulas from the Master Database to your client database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search master formulas..."
                className="pl-10"
              />
            </div>

            {/* Master Formulas List */}
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Formula</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableMasterFormulas.map((formula) => (
                    <TableRow key={formula.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formula.name}</div>
                          <div className="text-sm text-gray-500">{formula.uid}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{formula.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formula.parametersCount || 0} parameters</div>
                          <div className="text-gray-500">{formula.expressionsCount || 0} expressions</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={formula.status === 'active' ? 'default' : 'secondary'}>
                          {formula.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleAssignMasterFormula(formula)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMasterFormulaDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Parameter Dialog */}
      <Dialog open={isAddParameterDialogOpen} onOpenChange={(open) => {
        setIsAddParameterDialogOpen(open);
        if (!open) {
          setParameterFormData({
            name: '',
            type: 'number',
            unit: '',
            defaultValue: '',
            description: '',
            required: false,
            minValue: '',
            maxValue: '',
            parameterType: 'formula_parameter',
            efSource: 'master_db',
            efCategory: '',
            efUID: '',
            efDefinition: '',
            constantValue: '',
            constantDescription: ''
          });
          setShowParameterTypeSelection(true);
          setEfSearchTerm('');
          setIsEFSearchOpen(false);
          setSelectedEF(null);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Add Parameter to {selectedFormula?.name}
            </DialogTitle>
            <DialogDescription>
              {showParameterTypeSelection 
                ? "Choose the type of parameter you want to add to this formula."
                : "Configure the parameter details for your formula."
              }
            </DialogDescription>
          </DialogHeader>

          {/* Parameter Type Selection Step */}
          {showParameterTypeSelection && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Parameter Type</h3>
                <p className="text-gray-600">Choose the most appropriate parameter type for your calculation needs.</p>
              </div>

              <div className="grid gap-6">
                {/* Formula Parameter Option */}
                <div 
                  className="group cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                  onClick={() => {
                    setParameterFormData({
                      ...parameterFormData,
                      parameterType: 'formula_parameter'
                    });
                    setShowParameterTypeSelection(false);
                  }}
                >
                  <div className="p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Variable className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-blue-900">Formula Parameter</h3>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">User Input</Badge>
                        </div>
                        <p className="text-blue-700 mb-3 leading-relaxed">
                          Parameters that require user input when the formula is used. Perfect for dynamic values like distance, consumption, or activity data.
                        </p>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <span>Select</span>
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emission Factor Parameter Option */}
                <div 
                  className="group cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                  onClick={() => {
                    setParameterFormData({
                      ...parameterFormData,
                      parameterType: 'ef_value'
                    });
                    setShowParameterTypeSelection(false);
                  }}
                >
                  <div className="p-6 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl bg-gradient-to-r from-emerald-50 to-green-50 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Database className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-emerald-900">Emission Factor</h3>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Database Link</Badge>
                        </div>
                        <p className="text-emerald-700 mb-3 leading-relaxed">
                          Link to emission factors from Master DB or Client DB. Values are automatically updated when emission factors change.
                        </p>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-2 text-emerald-600 font-medium">
                          <span>Select</span>
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Constant Parameter Option */}
                <div 
                  className="group cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                  onClick={() => {
                    setParameterFormData({
                      ...parameterFormData,
                      parameterType: 'constant'
                    });
                    setShowParameterTypeSelection(false);
                  }}
                >
                  <div className="p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl bg-gradient-to-r from-purple-50 to-violet-50 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Hash className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-purple-900">Constant Value</h3>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">Fixed Value</Badge>
                        </div>
                        <p className="text-purple-700 mb-3 leading-relaxed">
                          Fixed values that don't change, such as conversion factors, constants, or predefined ratios.
                        </p>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-2 text-purple-600 font-medium">
                          <span>Select</span>
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parameter Configuration Step */}
          {!showParameterTypeSelection && (
            <div className="space-y-4">
              {/* Basic Parameter Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Parameter Name *</Label>
                  <Input
                    value={parameterFormData.name}
                    onChange={(e) => setParameterFormData({...parameterFormData, name: e.target.value})}
                    placeholder="Enter parameter name"
                  />
                </div>
                <div>
                  <Label>Data Type *</Label>
                  <Select value={parameterFormData.type} onValueChange={(value: 'number' | 'text' | 'boolean') => setParameterFormData({...parameterFormData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Parameter Type Specific Fields */}
              {parameterFormData.parameterType === 'ef_value' && (
                <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Database className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-medium text-emerald-900">Emission Factor Configuration</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Database Source *</Label>
                          <Select value={parameterFormData.efSource} onValueChange={(value: 'master_db' | 'client_db') => setParameterFormData({...parameterFormData, efSource: value})}>
                            <SelectTrigger className="border-emerald-200">
                              <SelectValue placeholder="Select database" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="master_db">Master Database</SelectItem>
                              <SelectItem value="client_db">Client Database</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>EF Search & Selection *</Label>
                          <Popover open={isEFSearchOpen} onOpenChange={setIsEFSearchOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isEFSearchOpen}
                                className="w-full justify-between border-emerald-200"
                              >
                                {selectedEF ? selectedEF.name : "Search & select EF..."}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 p-0" align="start">
                              <div className="border-b p-3">
                                <div className="relative">
                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search emission factors..."
                                    value={efSearchTerm}
                                    onChange={(e) => setEfSearchTerm(e.target.value)}
                                    className="pl-8"
                                  />
                                </div>
                              </div>
                              <ScrollArea className="h-64">
                                <div className="p-2">
                                  {getAvailableEFs()
                                    .filter(ef => 
                                      ef.name.toLowerCase().includes(efSearchTerm.toLowerCase()) ||
                                      ef.category.toLowerCase().includes(efSearchTerm.toLowerCase()) ||
                                      ef.uid.toLowerCase().includes(efSearchTerm.toLowerCase())
                                    )
                                    .map((ef) => (
                                      <div
                                        key={ef.uid}
                                        className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                                        onClick={() => handleEFSelection(ef)}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-sm">{ef.name}</div>
                                          <div className="text-xs text-gray-500">{ef.uid}</div>
                                          <div className="text-xs text-gray-600">{ef.category}</div>
                                        </div>
                                        <div className="flex-shrink-0 ml-2">
                                          <Badge variant="outline" className="text-xs">
                                            {ef.latestValue.value} {ef.latestValue.unit}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {selectedEF && (
                        <div className="bg-white/50 border border-emerald-200 rounded-lg p-3">
                          <div className="text-sm">
                            <div className="font-medium text-emerald-900">Selected: {selectedEF.name}</div>
                            <div className="text-gray-600">{selectedEF.description}</div>
                            <div className="text-gray-600">Value: {selectedEF.latestValue.value} {selectedEF.latestValue.unit}</div>
                            <div className="text-gray-500">Source: {selectedEF.source}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {parameterFormData.parameterType === 'constant' && (
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Hash className="h-5 w-5 text-purple-600" />
                        <h3 className="font-medium text-purple-900">Constant Value Configuration</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Constant Value *</Label>
                          <Input
                            value={parameterFormData.constantValue}
                            onChange={(e) => setParameterFormData({...parameterFormData, constantValue: e.target.value})}
                            placeholder="Enter constant value"
                          />
                        </div>
                        <div>
                          <Label>Unit</Label>
                          <Select value={parameterFormData.unit} onValueChange={(value) => setParameterFormData({...parameterFormData, unit: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonUnits.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {parameterFormData.parameterType === 'formula_parameter' && (
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Variable className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-900">Formula Parameter Configuration</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Unit *</Label>
                          <Select value={parameterFormData.unit} onValueChange={(value) => setParameterFormData({...parameterFormData, unit: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonUnits.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Default Value</Label>
                          <Input
                            value={parameterFormData.defaultValue}
                            onChange={(e) => setParameterFormData({...parameterFormData, defaultValue: e.target.value})}
                            placeholder="Optional default value"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="required"
                          checked={parameterFormData.required}
                          onCheckedChange={(checked) => setParameterFormData({...parameterFormData, required: checked as boolean})}
                        />
                        <label htmlFor="required" className="text-sm font-medium">
                          Required parameter
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Minimum Value</Label>
                          <Input
                            type="number"
                            value={parameterFormData.minValue}
                            onChange={(e) => setParameterFormData({...parameterFormData, minValue: e.target.value})}
                            placeholder="Optional minimum"
                          />
                        </div>
                        <div>
                          <Label>Maximum Value</Label>
                          <Input
                            type="number"
                            value={parameterFormData.maxValue}
                            onChange={(e) => setParameterFormData({...parameterFormData, maxValue: e.target.value})}
                            placeholder="Optional maximum"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label>Description</Label>
                <Textarea
                  value={parameterFormData.description}
                  onChange={(e) => setParameterFormData({...parameterFormData, description: e.target.value})}
                  placeholder="Enter parameter description"
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {showParameterTypeSelection ? (
              <Button 
                variant="outline" 
                onClick={() => setIsAddParameterDialogOpen(false)}
              >
                Cancel
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowParameterTypeSelection(true)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleAddParameter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Parameter
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expression Dialog */}
      <Dialog open={isAddExpressionDialogOpen} onOpenChange={(open) => {
        setIsAddExpressionDialogOpen(open);
        if (!open) {
          setExpressionFormData({
            name: '',
            description: '',
            expression: '',
            outputUnit: ''
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-600" />
              Add Expression to {selectedFormula?.name}
            </DialogTitle>
            <DialogDescription>
              Add a new mathematical expression to this client formula.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expression Name *</Label>
                <Input
                  value={expressionFormData.name}
                  onChange={(e) => setExpressionFormData({...expressionFormData, name: e.target.value})}
                  placeholder="Enter expression name"
                />
              </div>
              <div>
                <Label>Output Unit *</Label>
                <Select value={expressionFormData.outputUnit} onValueChange={(value) => setExpressionFormData({...expressionFormData, outputUnit: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select output unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonUnits.filter(unit => unit.category === 'Emissions' || unit.category === 'Energy' || unit.category === 'Mass').map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Mathematical Expression *</Label>
              <Textarea
                value={expressionFormData.expression}
                onChange={(e) => setExpressionFormData({...expressionFormData, expression: e.target.value})}
                placeholder="Enter mathematical expression (e.g., Parameter_1 * Parameter_2)"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">
                Use parameter names with underscores (spaces replaced). Available parameters: {selectedFormula?.parameters?.map(p => convertParameterNameForExpression(p.name)).join(', ') || 'None'}
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={expressionFormData.description}
                onChange={(e) => setExpressionFormData({...expressionFormData, description: e.target.value})}
                placeholder="Enter expression description"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpressionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpression}>
              <Calculator className="h-4 w-4 mr-2" />
              Add Expression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientFormulasCompleteFull;