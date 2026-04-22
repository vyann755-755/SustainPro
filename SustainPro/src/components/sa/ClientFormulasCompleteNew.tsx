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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
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
  Lock,
  Star,
  Sparkles,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useMasterDB } from '../../contexts/MasterDBContext';

// Import types from MasterDB context
import type { FormulaDefinition, FormulaParameter, FormulaExpression } from '../../contexts/MasterDBContext';

// Parameter types for formulas
type FormulaParameterType = 'formula_parameter' | 'ef_value' | 'constant';

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

// Expression form data interface
interface ExpressionFormData {
  name: string;
  description: string;
  expression: string;
  outputUnit: string;
}

// Formula form data interface
interface FormulaFormData {
  name: string;
  category: string;
  description: string;
  tags: string[];
  customFieldValues: Record<string, string>;
}

// Client-specific formula interface (extends base Formula)
interface ClientFormulaDefinition extends FormulaDefinition {
  database: 'master' | 'client';
  clientId?: string;
  isAssignedFromMaster?: boolean;
  assignedFrom?: {
    originalUID: string;
    assignedAt: string;
    assignedBy: string;
  };
}

// Mock formula categories
const formulaCategories = [
  'Energy Consumption',
  'Transportation',
  'Waste Management',
  'Water Usage',
  'Manufacturing',
  'Construction',
  'Agriculture',
  'General'
];

// Mock formula data with hierarchy
const mockClientFormulas: ClientFormulaDefinition[] = [
  {
    id: '1',
    uid: 'CF-CLI-ENERGY-001',
    name: 'Client Energy Consumption',
    category: 'Energy Consumption',
    description: 'Custom formula for client-specific energy consumption calculations',
    tags: ['energy', 'custom', 'client'],
    parameters: [
      {
        id: 'p1',
        parentFormulaUID: 'CF-CLI-ENERGY-001',
        name: 'Energy Consumption',
        type: 'number',
        unit: 'kWh',
        defaultValue: 1000,
        description: 'Total energy consumed',
        required: true,
        parameterType: 'formula_parameter',
        versions: [],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'sa_user'
      },
      {
        id: 'p2',
        parentFormulaUID: 'CF-CLI-ENERGY-001',
        name: 'Grid Emission Factor',
        type: 'number',
        unit: 'kg CO2e/kWh',
        defaultValue: 0.45,
        description: 'Local grid emission factor',
        required: true,
        parameterType: 'ef_value',
        efSource: 'client_db',
        efUID: 'CEF_GRID_LOCAL_2024',
        efDefinition: 'Client-specific local grid EF',
        versions: [],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'sa_user'
      }
    ],
    expressions: [
      {
        id: 'e1',
        parentFormulaUID: 'CF-CLI-ENERGY-001',
        name: 'Total Energy Emissions',
        description: 'Calculate total CO2 emissions from energy consumption',
        expression: 'Energy_Consumption * Grid_Emission_Factor',
        outputUnit: 'kg CO2e',
        versions: [],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'sa_user'
      }
    ],
    status: 'active',
    latestVersion: '1.0',
    customFieldValues: {},
    database: 'client',
    clientId: 'client-001',
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'sa_user'
  },
  {
    id: '2',
    uid: 'CF-CLI-MANUF-001',
    name: 'Manufacturing Process Emissions',
    category: 'Manufacturing',
    description: 'Client-specific manufacturing emissions calculation',
    tags: ['manufacturing', 'process', 'custom'],
    parameters: [
      {
        id: 'p3',
        parentFormulaUID: 'CF-CLI-MANUF-001',
        name: 'Production Volume',
        type: 'number',
        unit: 'kg',
        defaultValue: 1000,
        description: 'Total production volume',
        required: true,
        parameterType: 'formula_parameter',
        versions: [],
        createdAt: '2024-01-20T14:30:00Z',
        createdBy: 'sa_user'
      },
      {
        id: 'p4',
        parentFormulaUID: 'CF-CLI-MANUF-001',
        name: 'Process Intensity',
        type: 'number',
        unit: 'kg CO2e/kg',
        defaultValue: 0.45,
        description: 'Process-specific emission intensity',
        required: true,
        parameterType: 'constant',
        constantValue: '0.45',
        versions: [],
        createdAt: '2024-01-20T14:30:00Z',
        createdBy: 'sa_user'
      }
    ],
    expressions: [
      {
        id: 'ce1',
        parentFormulaUID: 'CF-CLI-MANUF-001',
        name: 'Manufacturing Emissions',
        description: 'Calculate emissions from manufacturing process',
        expression: 'Production_Volume * Process_Intensity',
        outputUnit: 'kg CO2e',
        versions: [],
        createdAt: '2024-01-20T14:30:00Z',
        createdBy: 'sa_user'
      }
    ],
    status: 'active',
    latestVersion: '1.2',
    customFieldValues: {},
    database: 'client',
    clientId: 'client-001',
    createdAt: '2024-01-20T14:30:00Z',
    createdBy: 'sa_user'
  }
];

export function ClientFormulasComplete() {
  const { 
    masterFormulaDefinitions,
    getMasterEFsForAssignment
  } = useMasterDB();

  // Main state
  const [clientFormulas, setClientFormulas] = useState<ClientFormulaDefinition[]>(mockClientFormulas);
  const [assignedMasterFormulas, setAssignedMasterFormulas] = useState<string[]>(['1']); // IDs of assigned formulas
  const [expandedFormulas, setExpandedFormulas] = useState<Set<string>>(new Set());
  const [expandedParameters, setExpandedParameters] = useState<Set<string>>(new Set());
  const [expandedExpressions, setExpandedExpressions] = useState<Set<string>>(new Set());
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog state
  const [isCreateFormulaDialogOpen, setIsCreateFormulaDialogOpen] = useState(false);
  const [isMasterFormulaDialogOpen, setIsMasterFormulaDialogOpen] = useState(false);
  const [isViewFormulaDialogOpen, setIsViewFormulaDialogOpen] = useState(false);
  const [isAddParameterDialogOpen, setIsAddParameterDialogOpen] = useState(false);
  const [isAddExpressionDialogOpen, setIsAddExpressionDialogOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<ClientFormulaDefinition | null>(null);

  // Parameter dialog state
  const [showParameterTypeSelection, setShowParameterTypeSelection] = useState(true);
  
  // EF Search and Selection State
  const [efSearchTerm, setEfSearchTerm] = useState('');
  const [isEFSearchOpen, setIsEFSearchOpen] = useState(false);
  const [selectedEF, setSelectedEF] = useState<any>(null);

  // Form state
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

  // Common units for dropdowns
  const commonUnits = [
    // Emissions
    { value: 'kg CO2e', label: 'kg CO₂e', category: 'Emissions' },
    { value: 't CO2e', label: 't CO₂e', category: 'Emissions' },
    { value: 'g CO2e', label: 'g CO₂e', category: 'Emissions' },
    
    // Energy
    { value: 'kWh', label: 'kWh', category: 'Energy' },
    { value: 'MWh', label: 'MWh', category: 'Energy' },
    { value: 'GJ', label: 'GJ', category: 'Energy' },
    { value: 'TJ', label: 'TJ', category: 'Energy' },
    
    // Mass
    { value: 'kg', label: 'kg', category: 'Mass' },
    { value: 't', label: 't', category: 'Mass' },
    { value: 'g', label: 'g', category: 'Mass' },
    
    // Volume
    { value: 'L', label: 'L', category: 'Volume' },
    { value: 'm3', label: 'm³', category: 'Volume' },
    
    // Distance
    { value: 'km', label: 'km', category: 'Distance' },
    { value: 'm', label: 'm', category: 'Distance' },
    
    // Ratios and Factors
    { value: 'kg CO2e/kWh', label: 'kg CO₂e/kWh', category: 'Emission Factors' },
    { value: 'kg CO2e/L', label: 'kg CO₂e/L', category: 'Emission Factors' },
    { value: 'kg CO2e/km', label: 'kg CO₂e/km', category: 'Emission Factors' },
    { value: 'kg CO2e/kg', label: 'kg CO₂e/kg', category: 'Emission Factors' },
    
    // Dimensionless
    { value: '%', label: '%', category: 'Dimensionless' },
    { value: 'ratio', label: 'ratio', category: 'Dimensionless' }
  ];

  // Available Master Formulas (filter out assigned ones)
  const availableMasterFormulas = masterFormulaDefinitions.filter(formula => 
    !assignedMasterFormulas.includes(formula.id)
  );

  // Combine all formulas for display
  const allFormulas: ClientFormulaDefinition[] = [
    ...clientFormulas,
    ...masterFormulaDefinitions
      .filter(formula => assignedMasterFormulas.includes(formula.id))
      .map((formula): ClientFormulaDefinition => ({
        ...formula,
        database: 'master' as const,
        isAssignedFromMaster: true,
        assignedFrom: {
          originalUID: formula.uid,
          assignedAt: new Date().toISOString(),
          assignedBy: 'sa_user'
        }
      }))
  ];

  // Filter functions
  const filteredFormulas = allFormulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory;
    const matchesDatabase = selectedDatabase === 'all' || formula.database === selectedDatabase;
    const matchesStatus = statusFilter === 'all' || formula.status === statusFilter;
    return matchesSearch && matchesCategory && matchesDatabase && matchesStatus;
  });

  // Generate UIDs
  const generateClientFormulaUID = (name: string) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const timestamp = Date.now().toString().slice(-6);
    return `CF_CLI_${cleanName}_${timestamp}`;
  };

  // Toggle functions
  const toggleFormulaExpansion = (formulaId: string) => {
    const newExpanded = new Set(expandedFormulas);
    if (newExpanded.has(formulaId)) {
      newExpanded.delete(formulaId);
    } else {
      newExpanded.add(formulaId);
    }
    setExpandedFormulas(newExpanded);
  };

  const toggleParameterExpansion = (parameterId: string) => {
    const newExpanded = new Set(expandedParameters);
    if (newExpanded.has(parameterId)) {
      newExpanded.delete(parameterId);
    } else {
      newExpanded.add(parameterId);
    }
    setExpandedParameters(newExpanded);
  };

  const toggleExpressionExpansion = (expressionId: string) => {
    const newExpanded = new Set(expandedExpressions);
    if (newExpanded.has(expressionId)) {
      newExpanded.delete(expressionId);
    } else {
      newExpanded.add(expressionId);
    }
    setExpandedExpressions(newExpanded);
  };

  // Handle create custom formula
  const handleCreateFormula = () => {
    if (!formulaFormData.name || !formulaFormData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newUID = generateClientFormulaUID(formulaFormData.name);
    const newFormula: ClientFormulaDefinition = {
      id: `formula_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uid: newUID,
      name: formulaFormData.name,
      category: formulaFormData.category,
      description: formulaFormData.description,
      tags: formulaFormData.tags,
      status: 'draft',
      customFieldValues: formulaFormData.customFieldValues,
      database: 'client',
      clientId: 'client-001',
      createdAt: new Date().toISOString(),
      createdBy: 'sa_user',
      parameters: [],
      expressions: [],
      latestVersion: '1.0'
    };
    
    setClientFormulas([...clientFormulas, newFormula]);
    setSelectedFormula(newFormula);
    setIsCreateFormulaDialogOpen(false);
    
    // Auto-expand the new formula
    const newExpanded = new Set(expandedFormulas);
    newExpanded.add(newFormula.id);
    setExpandedFormulas(newExpanded);
    
    // Reset form
    setFormulaFormData({
      name: '',
      category: '',
      description: '',
      tags: [],
      customFieldValues: {}
    });
    
    toast.success(`Custom Formula created — UID ${newUID}. You can now add parameters and expressions.`);
  };

  // Handle assign master formula
  const handleAssignMasterFormula = (masterFormula: FormulaDefinition) => {
    if (assignedMasterFormulas.includes(masterFormula.id)) {
      toast.error('This formula is already assigned');
      return;
    }

    setAssignedMasterFormulas([...assignedMasterFormulas, masterFormula.id]);
    
    // Auto-expand the assigned formula
    const newExpanded = new Set(expandedFormulas);
    newExpanded.add(masterFormula.id);
    setExpandedFormulas(newExpanded);
    
    setIsMasterFormulaDialogOpen(false);
    toast.success(`Master Formula "${masterFormula.name}" assigned successfully.`);
  };

  // Handle unassign master formula
  const handleUnassignMasterFormula = (formulaId: string) => {
    setAssignedMasterFormulas(assignedMasterFormulas.filter(id => id !== formulaId));
    toast.success('Master Formula unassigned successfully.');
  };

  // Handle add parameter to client formula
  const handleAddParameter = () => {
    if (!selectedFormula || !parameterFormData.name || selectedFormula.database !== 'client') {
      toast.error('Please fill in all required fields or select a client formula');
      return;
    }

    const newParameter: FormulaParameter = {
      id: `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parentFormulaUID: selectedFormula.uid,
      name: parameterFormData.name,
      type: parameterFormData.type as 'text' | 'number' | 'date' | 'dropdown' | 'boolean',
      unit: parameterFormData.unit,
      defaultValue: parameterFormData.defaultValue ? (parameterFormData.type === 'number' ? parseFloat(parameterFormData.defaultValue) : parameterFormData.defaultValue) : undefined,
      description: parameterFormData.description,
      required: parameterFormData.required,
      minValue: parameterFormData.minValue ? parseFloat(parameterFormData.minValue) : undefined,
      maxValue: parameterFormData.maxValue ? parseFloat(parameterFormData.maxValue) : undefined,
      parameterType: parameterFormData.parameterType,
      efSource: parameterFormData.parameterType === 'ef_value' ? parameterFormData.efSource : undefined,
      efCategory: parameterFormData.parameterType === 'ef_value' ? parameterFormData.efCategory : undefined,
      efUID: parameterFormData.parameterType === 'ef_value' ? parameterFormData.efUID : undefined,
      efDefinition: parameterFormData.parameterType === 'ef_value' ? parameterFormData.efDefinition : undefined,
      constantValue: parameterFormData.parameterType === 'constant' ? parameterFormData.constantValue : undefined,
      constantDescription: parameterFormData.parameterType === 'constant' ? parameterFormData.constantDescription : undefined,
      versions: [],
      createdAt: new Date().toISOString(),
      createdBy: 'sa_user'
    };

    const updatedFormula = {
      ...selectedFormula,
      parameters: [...(selectedFormula.parameters || []), newParameter]
    };

    setClientFormulas(clientFormulas.map(formula => 
      formula.id === selectedFormula.id ? updatedFormula : formula
    ));

    setSelectedFormula(updatedFormula);
    setIsAddParameterDialogOpen(false);
    
    // Reset form
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
    
    // Reset EF search state
    setEfSearchTerm('');
    setIsEFSearchOpen(false);
    setSelectedEF(null);
    setShowParameterTypeSelection(true);
    
    toast.success(`Parameter "${newParameter.name}" added successfully.`);
  };

  // Handle add expression to client formula
  const handleAddExpression = () => {
    if (!selectedFormula || !expressionFormData.name || !expressionFormData.expression || selectedFormula.database !== 'client') {
      toast.error('Please fill in all required fields or select a client formula');
      return;
    }

    const newExpression: FormulaExpression = {
      id: `expr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parentFormulaUID: selectedFormula.uid,
      name: expressionFormData.name,
      description: expressionFormData.description,
      expression: expressionFormData.expression,
      outputUnit: expressionFormData.outputUnit,
      versions: [],
      createdAt: new Date().toISOString(),
      createdBy: 'sa_user'
    };

    const updatedFormula = {
      ...selectedFormula,
      expressions: [...(selectedFormula.expressions || []), newExpression]
    };

    setClientFormulas(clientFormulas.map(formula => 
      formula.id === selectedFormula.id ? updatedFormula : formula
    ));

    setSelectedFormula(updatedFormula);
    setIsAddExpressionDialogOpen(false);
    
    // Reset form
    setExpressionFormData({
      name: '',
      description: '',
      expression: '',
      outputUnit: ''
    });
    
    toast.success(`Expression "${newExpression.name}" added successfully.`);
  };

  // Helper function to get available EFs based on source
  const getAvailableEFs = () => {
    if (parameterFormData.efSource === 'master_db') {
      // Return mock Master DB EFs - in real app, this would come from MasterDBContext
      return [
        {
          uid: 'EF_ELECTRICITY_GRID_US',
          name: 'US Grid Electricity',
          category: 'Energy',
          description: 'Average US grid electricity emission factor',
          latestValue: { value: '0.385', unit: 'kg CO2e/kWh' },
          source: 'EPA eGRID 2022'
        },
        {
          uid: 'EF_NATURAL_GAS_COMBUSTION',
          name: 'Natural Gas Combustion',
          category: 'Energy',
          description: 'Natural gas combustion emission factor',
          latestValue: { value: '0.202', unit: 'kg CO2e/kWh' },
          source: 'IPCC 2006'
        },
        {
          uid: 'EF_DIESEL_FUEL',
          name: 'Diesel Fuel',
          category: 'Transportation',
          description: 'Diesel fuel combustion emission factor',
          latestValue: { value: '2.68', unit: 'kg CO2e/L' },
          source: 'EPA 2023'
        },
        {
          uid: 'EF_GASOLINE',
          name: 'Gasoline',
          category: 'Transportation', 
          description: 'Gasoline combustion emission factor',
          latestValue: { value: '2.31', unit: 'kg CO2e/L' },
          source: 'EPA 2023'
        }
      ];
    } else {
      // Return mock Client DB EFs - in real app, this would come from client context
      return [
        {
          uid: 'CEF_SOLAR_ONSITE',
          name: 'On-site Solar Generation',
          category: 'Renewable Energy',
          description: 'Client-specific solar generation emission factor',
          latestValue: { value: '0.045', unit: 'kg CO2e/kWh' },
          source: 'Client Data 2024'
        },
        {
          uid: 'CEF_COMPANY_FLEET',
          name: 'Company Fleet Average',
          category: 'Transportation',
          description: 'Client fleet average emission factor',
          latestValue: { value: '0.21', unit: 'kg CO2e/km' },
          source: 'Fleet Management System'
        }
      ];
    }
  };

  // Handle EF selection
  const handleEFSelection = (ef: any) => {
    setSelectedEF(ef);
    setParameterFormData({
      ...parameterFormData,
      efUID: ef.uid,
      unit: ef.latestValue.unit,
      defaultValue: ef.latestValue.value,
      efDefinition: ef.description
    });
    setIsEFSearchOpen(false);
    setEfSearchTerm(ef.name);
  };

  // Convert parameter name to expression format (same as Master DB)
  const convertParameterNameForExpression = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  // Handle bulk upload
  const handleBulkUpload = () => {
    toast.success('Bulk upload completed: 8 Client Formulas inserted, 2 updated, 1 skipped');
  };

  // Stats helper functions
  const getTotalParameters = () => {
    return filteredFormulas.reduce((total, f) => total + (f.parameters?.length || 0), 0);
  };
  
  const getTotalExpressions = () => {
    return filteredFormulas.reduce((total, f) => total + (f.expressions?.length || 0), 0);
  };

  const getAssignedFromMaster = () => {
    return filteredFormulas.filter(f => f.database === 'master').length;
  };

  const copyUID = async (uid: string) => {
    try {
      // Try the modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(uid);
        toast.success(`UID copied to clipboard: ${uid}`);
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
        toast.success(`UID copied to clipboard: ${uid}`);
      } else {
        toast.error('Failed to copy UID');
      }
    } catch (error) {
      toast.error('Failed to copy UID');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Client Formulas</h1>
              <p className="text-gray-600">Manage client-specific formula definitions and assigned Master DB formulas</p>
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
            onClick={() => setIsMasterFormulaDialogOpen(true)}
          >
            <Star className="h-4 w-4 mr-2" />
            Assign from Master DB
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            onClick={() => setIsCreateFormulaDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Client Formula
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search formulas by name or UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {formulaCategories.map(category => (
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Formulas</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredFormulas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <Variable className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Parameters</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalParameters()}</p>
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
                <p className="text-sm text-gray-600">Total Expressions</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalExpressions()}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{getAssignedFromMaster()}</p>
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
              <TableHead>Formula Definition / Parameter / Expression</TableHead>
              <TableHead>Category/Tags</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Components</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFormulas.map((formula) => (
              <React.Fragment key={formula.id}>
                {/* Formula Definition Row */}
                <TableRow className="bg-emerald-25 border-emerald-100">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFormulaExpansion(formula.id)}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedFormulas.has(formula.id) ? 'transform rotate-90' : ''
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
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={formula.status === 'active' ? 'default' : 'secondary'}
                        className={formula.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {formula.status}
                      </Badge>
                      {formula.database === 'master' && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          Master DB
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFormula(formula);
                          setIsViewFormulaDialogOpen(true);
                        }}
                        title="View Formula"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {formula.database === 'client' && (
                        <>
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
                              setSelectedFormula(formula);
                              setIsAddParameterDialogOpen(true);
                            }}
                            title="Add Parameter"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {formula.database === 'master' && formula.isAssignedFromMaster && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnassignMasterFormula(formula.id)}
                          title="Unassign from Client"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                {/* Parameters and Expressions (when expanded) */}
                {expandedFormulas.has(formula.id) && (
                  <>
                    {/* Parameters */}
                    {formula.parameters?.map((parameter) => (
                      <TableRow key={parameter.id} className="bg-cyan-25 border-cyan-100">
                        <TableCell>
                          <div className="ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleParameterExpansion(parameter.id)}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  expandedParameters.has(parameter.id) ? 'transform rotate-90' : ''
                                }`} 
                              />
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="ml-4 space-y-1">
                            <div className="flex items-center gap-2">
                              <Variable className="h-4 w-4 text-cyan-600" />
                              <span className="font-medium">{parameter.name}</span>
                              <Badge variant="outline" className="text-xs">
                                Parameter
                              </Badge>
                            </div>
                            {parameter.description && (
                              <div className="text-sm text-gray-600">{parameter.description}</div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            <div>{parameter.type}</div>
                            <div className="text-gray-500">{parameter.unit}</div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {parameter.defaultValue !== undefined ? String(parameter.defaultValue) : 'No default'}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            <Badge variant="outline" className="text-xs">
                              {parameter.parameterType?.replace('_', ' ') || 'parameter'}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant={parameter.required ? 'default' : 'secondary'} className="text-xs">
                            {parameter.required ? 'Required' : 'Optional'}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {formula.database === 'client' && (
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" title="Edit Parameter">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Delete Parameter" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Expressions */}
                    {formula.expressions?.map((expression) => (
                      <TableRow key={expression.id} className="bg-purple-25 border-purple-100">
                        <TableCell>
                          <div className="ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpressionExpansion(expression.id)}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  expandedExpressions.has(expression.id) ? 'transform rotate-90' : ''
                                }`} 
                              />
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="ml-4 space-y-1">
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">{expression.name}</span>
                              <Badge variant="outline" className="text-xs">
                                Expression
                              </Badge>
                            </div>
                            {expression.description && (
                              <div className="text-sm text-gray-600">{expression.description}</div>
                            )}
                            {expandedExpressions.has(expression.id) && (
                              <div className="text-sm font-mono bg-gray-50 p-2 rounded border">
                                {expression.expression}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            <div>Mathematical</div>
                            <div className="text-gray-500">{expression.outputUnit}</div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">Output: {expression.outputUnit}</div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            calculation
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge variant="default" className="text-xs bg-purple-600">
                            Active
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {formula.database === 'client' && (
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" title="Edit Expression">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Delete Expression" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Add Parameter/Expression Row for Client Formulas */}
                    {formula.database === 'client' && (
                      <TableRow className="bg-gray-50 border-gray-200">
                        <TableCell></TableCell>
                        <TableCell>
                          <div className="ml-4 flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFormula(formula);
                                setIsAddParameterDialogOpen(true);
                              }}
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Parameter
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFormula(formula);
                                setIsAddExpressionDialogOpen(true);
                              }}
                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Expression
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </>
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
                          <div>{formula.parameters?.length || 0} parameters</div>
                          <div className="text-gray-500">{formula.expressions?.length || 0} expressions</div>
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

      {/* View Formula Dialog */}
      <Dialog open={isViewFormulaDialogOpen} onOpenChange={(open) => {
        setIsViewFormulaDialogOpen(open);
        if (!open) {
          setSelectedFormula(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              View Formula: {selectedFormula?.name}
            </DialogTitle>
            <DialogDescription>
              Detailed view of formula definition, parameters, and expressions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {selectedFormula && (
              <>
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Formula Name</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      {selectedFormula.name}
                    </div>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      {selectedFormula.category}
                    </div>
                  </div>
                  <div>
                    <Label>UID</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border flex items-center gap-2">
                      <span className="font-mono text-sm">{selectedFormula.uid}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyUID(selectedFormula.uid)}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      <Badge variant={selectedFormula.status === 'active' ? 'default' : 'secondary'}>
                        {selectedFormula.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border">
                    {selectedFormula.description || 'No description provided'}
                  </div>
                </div>

                {/* Parameters */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Variable className="h-4 w-4 text-cyan-600" />
                    Parameters ({selectedFormula.parameters?.length || 0})
                  </h3>
                  {selectedFormula.parameters && selectedFormula.parameters.length > 0 ? (
                    <div className="space-y-2">
                      {selectedFormula.parameters.map((param) => (
                        <div key={param.id} className="p-3 border rounded-lg bg-cyan-50/30">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-cyan-900">{param.name}</span>
                            <div className="text-sm text-gray-600">
                              {param.unit && <span className="bg-gray-200 px-2 py-1 rounded">{param.unit}</span>}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No parameters defined</p>
                  )}
                </div>

                {/* Expressions */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-purple-600" />
                    Expressions ({selectedFormula.expressions?.length || 0})
                  </h3>
                  {selectedFormula.expressions && selectedFormula.expressions.length > 0 ? (
                    <div className="space-y-2">
                      {selectedFormula.expressions.map((expr) => (
                        <div key={expr.id} className="p-3 border rounded-lg bg-purple-50/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-purple-900">{expr.name}</span>
                            <span className="text-sm bg-purple-200 text-purple-800 px-2 py-1 rounded">
                              {expr.outputUnit}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{expr.description}</p>
                          <code className="block text-sm bg-gray-100 p-2 rounded font-mono">
                            {expr.expression}
                          </code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No expressions defined</p>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewFormulaDialogOpen(false)}>
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
}