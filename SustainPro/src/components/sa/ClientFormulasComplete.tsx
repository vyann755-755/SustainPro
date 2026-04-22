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
  Activity,
  Layers,
  Filter
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
  'Transportation',
  'Energy',
  'Buildings',
  'Waste',
  'Manufacturing',
  'Agriculture',
  'Electricity',
  'Fuel Combustion',
  'Process Emissions',
  'Refrigerants',
  'Other'
];

// Common units for parameters
const commonUnits = [
  // Mass/Weight
  { value: 'kg', label: 'Kilograms (kg)', category: 'Mass' },
  { value: 't', label: 'Tonnes (t)', category: 'Mass' },
  { value: 'g', label: 'Grams (g)', category: 'Mass' },
  { value: 'lb', label: 'Pounds (lb)', category: 'Mass' },
  { value: 'oz', label: 'Ounces (oz)', category: 'Mass' },
  
  // Volume
  { value: 'L', label: 'Litres (L)', category: 'Volume' },
  { value: 'm3', label: 'Cubic metres (m³)', category: 'Volume' },
  { value: 'gal', label: 'Gallons (gal)', category: 'Volume' },
  { value: 'ft3', label: 'Cubic feet (ft³)', category: 'Volume' },
  
  // Distance
  { value: 'km', label: 'Kilometres (km)', category: 'Distance' },
  { value: 'm', label: 'Metres (m)', category: 'Distance' },
  { value: 'mi', label: 'Miles (mi)', category: 'Distance' },
  { value: 'ft', label: 'Feet (ft)', category: 'Distance' },
  
  // Energy
  { value: 'kWh', label: 'Kilowatt hours (kWh)', category: 'Energy' },
  { value: 'MWh', label: 'Megawatt hours (MWh)', category: 'Energy' },
  { value: 'GJ', label: 'Gigajoules (GJ)', category: 'Energy' },
  { value: 'BTU', label: 'British Thermal Units (BTU)', category: 'Energy' },
  { value: 'J', label: 'Joules (J)', category: 'Energy' },
  { value: 'kJ', label: 'Kilojoules (kJ)', category: 'Energy' },
  
  // Power
  { value: 'kW', label: 'Kilowatts (kW)', category: 'Power' },
  { value: 'MW', label: 'Megawatts (MW)', category: 'Power' },
  { value: 'W', label: 'Watts (W)', category: 'Power' },
  
  // Time
  { value: 'h', label: 'Hours (h)', category: 'Time' },
  { value: 'min', label: 'Minutes (min)', category: 'Time' },
  { value: 'day', label: 'Days', category: 'Time' },
  { value: 'year', label: 'Years', category: 'Time' },
  { value: 'month', label: 'Months', category: 'Time' },
  
  // Area
  { value: 'm2', label: 'Square metres (m²)', category: 'Area' },
  { value: 'ha', label: 'Hectares (ha)', category: 'Area' },
  { value: 'km2', label: 'Square kilometres (km²)', category: 'Area' },
  { value: 'ft2', label: 'Square feet (ft²)', category: 'Area' },
  
  // Temperature
  { value: '°C', label: 'Degrees Celsius (°C)', category: 'Temperature' },
  { value: '°F', label: 'Degrees Fahrenheit (°F)', category: 'Temperature' },
  { value: 'K', label: 'Kelvin (K)', category: 'Temperature' },
  
  // Emissions
  { value: 'kg CO2e', label: 'Kilograms CO₂ equivalent (kg CO₂e)', category: 'Emissions' },
  { value: 't CO2e', label: 'Tonnes CO₂ equivalent (t CO₂e)', category: 'Emissions' },
  { value: 'kg CO2', label: 'Kilograms CO₂ (kg CO₂)', category: 'Emissions' },
  { value: 't CO2', label: 'Tonnes CO₂ (t CO₂)', category: 'Emissions' },
  
  // Dimensionless
  { value: 'ratio', label: 'Ratio (dimensionless)', category: 'Dimensionless' },
  { value: '%', label: 'Percentage (%)', category: 'Dimensionless' },
  { value: 'factor', label: 'Factor (dimensionless)', category: 'Dimensionless' },
  { value: 'count', label: 'Count (number)', category: 'Dimensionless' },
];

// Parameter type configurations
const parameterTypeInfo = {
  formula_parameter: {
    title: 'Formula Parameter',
    description: 'User input values',
    color: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
    icon: Variable
  },
  ef_value: {
    title: 'Emission Factor',  
    description: 'Linked EF values',
    color: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: Database
  },
  constant: {
    title: 'Constant Value',
    description: 'Fixed constants',
    color: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-800',
    icon: Hash
  }
};

// Mock Client Formulas
const mockClientFormulas: ClientFormulaDefinition[] = [
  {
    id: 'cf1',
    uid: 'CF-CLI-MANUF-001',
    name: 'Custom Manufacturing Process',
    category: 'Manufacturing',
    description: 'Client-specific manufacturing process emissions calculation',
    tags: ['manufacturing', 'process', 'custom'],
    parameters: [
      {
        id: 'cp1',
        parentFormulaUID: 'CF-CLI-MANUF-001',
        name: 'Production Volume',
        type: 'number',
        unit: 'kg',
        defaultValue: 0,
        description: 'Total production volume',
        required: true,
        parameterType: 'formula_parameter',
        versions: [],
        createdAt: '2024-01-20T14:30:00Z',
        createdBy: 'sa_user'
      },
      {
        id: 'cp2',
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
  
  // Dialog states
  const [isCreateFormulaDialogOpen, setIsCreateFormulaDialogOpen] = useState(false);
  const [isMasterFormulaDialogOpen, setIsMasterFormulaDialogOpen] = useState(false);
  const [isViewFormulaDialogOpen, setIsViewFormulaDialogOpen] = useState(false);
  const [isAddParameterDialogOpen, setIsAddParameterDialogOpen] = useState(false);
  const [isAddExpressionDialogOpen, setIsAddExpressionDialogOpen] = useState(false);

  // Form states
  const [formulaFormData, setFormulaFormData] = useState<FormulaFormData>({
    name: '',
    category: '',
    description: '',
    tags: [],
    customFieldValues: {}
  });

  const [parameterFormData, setParameterFormData] = useState({
    name: '',
    type: 'number',
    unit: '',
    defaultValue: '',
    description: '',
    required: false,
    minValue: '',
    maxValue: '',
    parameterType: 'formula_parameter' as FormulaParameterType,
    efSource: 'master_db',
    efCategory: '',
    efUID: '',
    efDefinition: '',
    constantValue: '',
    constantDescription: ''
  });

  // Parameter dialog state
  const [showParameterTypeSelection, setShowParameterTypeSelection] = useState(true);
  
  // EF Search and Selection State
  const [efSearchTerm, setEfSearchTerm] = useState('');
  const [isEFSearchOpen, setIsEFSearchOpen] = useState(false);
  const [selectedEF, setSelectedEF] = useState<any>(null);

  const [expressionFormData, setExpressionFormData] = useState({
    name: '',
    description: '',
    expression: '',
    outputUnit: ''
  });

  // Selection states
  const [selectedFormula, setSelectedFormula] = useState<ClientFormulaDefinition | null>(null);
  const [selectedMasterFormula, setSelectedMasterFormula] = useState<FormulaDefinition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDatabase, setSelectedDatabase] = useState<'all' | 'master' | 'client'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'deprecated'>('all');

  // Listen for create formula dialog event from CDB
  useEffect(() => {
    const handleOpenCreateFormula = () => {
      setIsCreateFormulaDialogOpen(true);
    };

    window.addEventListener('openCreateFormulaDialog', handleOpenCreateFormula);
    return () => {
      window.removeEventListener('openCreateFormulaDialog', handleOpenCreateFormula);
    };
  }, []);

  // Available master formulas that haven't been assigned yet
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

  // Utility functions
  const getTotalParameters = (formula?: ClientFormulaDefinition) => {
    if (formula) {
      return formula.parameters?.length || 0;
    }
    return allFormulas.reduce((total, f) => total + (f.parameters?.length || 0), 0);
  };
  
  const getTotalExpressions = (formula?: ClientFormulaDefinition) => {
    if (formula) {
      return formula.expressions?.length || 0;
    }
    return allFormulas.reduce((total, f) => total + (f.expressions?.length || 0), 0);
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
      .replace(/[a-z0-9]/g, '_')
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="formulas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="formulas" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Formulas ({filteredFormulas.length})
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Assign from Master DB
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formulas" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900">Formulas</h1>
                  <p className="text-gray-600">Manage formulas assigned from Master DB and create custom formulas</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                onClick={() => setIsCreateFormulaDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Formula
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
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                
                <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                  <SelectTrigger className="w-48 border-emerald-200">
                    <Database className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="master">Master DB</SelectItem>
                    <SelectItem value="client">Client Custom</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                          )}
                          {formula.database === 'master' && formula.isAssignedFromMaster && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnassignMasterFormula(formula.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Unassign Formula"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
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
                                  {formula.database === 'client' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedFormula(formula);
                                        setIsAddParameterDialogOpen(true);
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Parameter
                                    </Button>
                                  )}
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
                                          <span className="font-medium text-sm">
                                            {convertParameterNameForExpression(param.name)}
                                          </span>
                                          <Badge className={`text-xs ${parameterTypeInfo[param.parameterType].badge}`}>
                                            {param.parameterType.replace('_', ' ').toUpperCase()}
                                          </Badge>
                                          {param.required && (
                                            <Badge variant="outline" className="text-xs">Required</Badge>
                                          )}
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
                                  {formula.database === 'client' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedFormula(formula);
                                        setIsAddExpressionDialogOpen(true);
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Expression
                                    </Button>
                                  )}
                                </div>
                                
                                {/* Expressions List */}
                                <div className="space-y-3">
                                  {(formula.expressions || []).map(expr => (
                                    <div key={expr.id} className="bg-white rounded-lg border p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                          <div className="p-1 rounded bg-purple-50">
                                            <Calculator className="h-3 w-3 text-purple-600" />
                                          </div>
                                          <span className="font-medium text-sm">{expr.name}</span>
                                          <Badge className="text-xs bg-purple-100 text-purple-800">
                                            {expr.outputUnit}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      <div className="text-xs text-gray-600 space-y-2">
                                        <div><strong>Expression:</strong></div>
                                        <code className="block p-2 bg-gray-50 rounded text-xs font-mono">
                                          {expr.expression}
                                        </code>
                                        {expr.description && (
                                          <div><strong>Description:</strong> {expr.description}</div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {(!formula.expressions || formula.expressions.length === 0) && (
                                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                      <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                      <p className="text-sm">No expressions defined yet</p>
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
        </TabsContent>

        <TabsContent value="assign" className="space-y-6">
          {/* Assign from Master DB Tab */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Available Master DB Formulas
              </CardTitle>
              <p className="text-sm text-gray-600">
                Assign formulas from the Master Database to your client environment. 
                All parameters and expressions will be inherited.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Formula Details</TableHead>
                      <TableHead className="w-32">Category</TableHead>
                      <TableHead className="w-32">Parameters</TableHead>
                      <TableHead className="w-32">Expressions</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableMasterFormulas.map((formula) => (
                      <TableRow key={formula.id} className="hover:bg-blue-50 transition-colors">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calculator className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-900">{formula.name}</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{formula.description}</p>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{formula.uid}</code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {formula.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                              {formula.parameters.length}
                            </div>
                            <div className="text-xs text-gray-500">parameters</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-600">
                              {formula.expressions.length}
                            </div>
                            <div className="text-xs text-gray-500">expressions</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={formula.status === 'active' ? 'default' : 'secondary'}
                            className={
                              formula.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {formula.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedMasterFormula(formula);
                                setIsViewFormulaDialogOpen(true);
                              }}
                              variant="outline"
                              className="h-8"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAssignMasterFormula(formula)}
                              className="h-8"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {availableMasterFormulas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No Master Formulas Available</p>
                  <p className="text-sm">All available Master DB formulas have been assigned.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Custom Formula Dialog */}
      <Dialog open={isCreateFormulaDialogOpen} onOpenChange={setIsCreateFormulaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Create Custom Formula
            </DialogTitle>
            <DialogDescription>
              Create a new custom formula specific to your client's needs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formula-name">Formula Name *</Label>
                <Input
                  id="formula-name"
                  value={formulaFormData.name}
                  onChange={(e) => setFormulaFormData({...formulaFormData, name: e.target.value})}
                  placeholder="e.g., Custom Manufacturing Process"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formula-category">Category *</Label>
                <Select value={formulaFormData.category} onValueChange={(value) => setFormulaFormData({...formulaFormData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {formulaCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formula-description">Description</Label>
              <Textarea
                id="formula-description"
                value={formulaFormData.description}
                onChange={(e) => setFormulaFormData({...formulaFormData, description: e.target.value})}
                placeholder="Describe what this formula calculates"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateFormulaDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFormula}
              disabled={!formulaFormData.name || !formulaFormData.category}
            >
              Create Formula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Formula Dialog */}
      <Dialog open={isViewFormulaDialogOpen} onOpenChange={setIsViewFormulaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              {selectedFormula?.name || selectedMasterFormula?.name}
              {(selectedFormula?.database === 'master' || selectedMasterFormula) && (
                <Badge className="bg-blue-100 text-blue-800">Master DB</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedFormula?.description || selectedMasterFormula?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {(selectedFormula || selectedMasterFormula) && (
              <>
                {/* Formula Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">UID</Label>
                    <code className="block text-sm bg-gray-100 p-2 rounded">
                      {selectedFormula?.uid || selectedMasterFormula?.uid}
                    </code>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <div className="mt-1">
                      <Badge variant="secondary">
                        {selectedFormula?.category || selectedMasterFormula?.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Parameters */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Variable className="h-4 w-4 text-blue-600" />
                    Parameters ({(selectedFormula?.parameters || selectedMasterFormula?.parameters || []).length})
                  </h3>
                  {(selectedFormula?.parameters || selectedMasterFormula?.parameters || []).length > 0 ? (
                    <div className="space-y-2">
                      {(selectedFormula?.parameters || selectedMasterFormula?.parameters || []).map((param) => (
                        <div key={param.id} className="p-3 border rounded-lg bg-blue-50/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-blue-900">
                                {convertParameterNameForExpression(param.name)}
                              </span>
                              {convertParameterNameForExpression(param.name) !== param.name && (
                                <span className="text-sm text-gray-500 italic">({param.name})</span>
                              )}
                              <Badge 
                                className={parameterTypeInfo[param.parameterType].badge}
                                variant="secondary"
                              >
                                {parameterTypeInfo[param.parameterType].title}
                              </Badge>
                            </div>
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
                    <Code2 className="h-4 w-4 text-purple-600" />
                    Expressions ({(selectedFormula?.expressions || selectedMasterFormula?.expressions || []).length})
                  </h3>
                  {(selectedFormula?.expressions || selectedMasterFormula?.expressions || []).length > 0 ? (
                    <div className="space-y-2">
                      {(selectedFormula?.expressions || selectedMasterFormula?.expressions || []).map((expr) => (
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
            <Button 
              variant="outline" 
              onClick={() => {
                setIsViewFormulaDialogOpen(false);
                setSelectedFormula(null);
                setSelectedMasterFormula(null);
              }}
            >
              Close
            </Button>
            {selectedMasterFormula && !assignedMasterFormulas.includes(selectedMasterFormula.id) && (
              <Button 
                onClick={() => {
                  handleAssignMasterFormula(selectedMasterFormula);
                  setIsViewFormulaDialogOpen(false);
                  setSelectedMasterFormula(null);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign This Formula
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Parameter Dialog */}
      <Dialog open={isAddParameterDialogOpen} onOpenChange={(open) => {
        setIsAddParameterDialogOpen(open);
        if (!open) {
          // Reset form when dialog closes
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
          // Reset EF search state
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
                      {/* Icon Section */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Variable className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-blue-900">Formula Parameter</h3>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">User Input</Badge>
                        </div>
                        <p className="text-blue-700 mb-3 leading-relaxed">
                          Parameters that require user input when the formula is used. Perfect for dynamic values like distance, consumption, or activity data.
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-blue-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Manual data entry</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>File uploads</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Variable inputs</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Indicator */}
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
                      {/* Icon Section */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Database className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-emerald-900">Emission Factor</h3>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Database Value</Badge>
                        </div>
                        <p className="text-emerald-700 mb-3 leading-relaxed">
                          Links to emission factors from Master Database or Client Database. Values are automatically retrieved and updated when the underlying data changes.
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Master DB integration</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Client database access</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Auto-updates</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Indicator */}
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
                  <div className="p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl bg-gradient-to-r from-purple-50 to-indigo-50 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      {/* Icon Section */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Hash className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-purple-900">Constant Value</h3>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">Fixed Value</Badge>
                        </div>
                        <p className="text-purple-700 mb-3 leading-relaxed">
                          Fixed values that don't change, such as GWP values, conversion factors, or scientific constants. Perfect for standardized coefficients.
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-purple-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>GWP values</span>
                          </div>
                          <div className="flex items-center gap-2 text-purple-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Conversion factors</span>
                          </div>
                          <div className="flex items-center gap-2 text-purple-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Scientific standards</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Indicator */}
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
            <div className="space-y-6">
              {/* Basic Parameter Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="param-name">Parameter Name *</Label>
                      <Input
                        id="param-name"
                        value={parameterFormData.name}
                        onChange={(e) => setParameterFormData({...parameterFormData, name: e.target.value})}
                        placeholder="e.g., Distance Traveled, Fuel Emission Factor"
                      />
                      {parameterFormData.name && (
                        <p className="text-xs text-blue-600 mt-1">
                          In expressions: <code className="bg-blue-50 px-1 rounded text-blue-800 font-mono">{convertParameterNameForExpression(parameterFormData.name)}</code>
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="param-type">Data Type</Label>
                      <Select value={parameterFormData.type} onValueChange={(value: 'number' | 'text' | 'boolean') => setParameterFormData({...parameterFormData, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="param-unit">Unit {parameterFormData.parameterType === 'ef_value' && '*'}</Label>
                      {parameterFormData.parameterType === 'ef_value' ? (
                        <>
                          <Input
                            id="param-unit"
                            value={parameterFormData.unit}
                            readOnly
                            className="bg-gray-50 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500">Unit is automatically retrieved from selected EF</p>
                        </>
                      ) : (
                        <Select 
                          value={parameterFormData.unit} 
                          onValueChange={(value) => setParameterFormData({...parameterFormData, unit: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                          <SelectContent className="max-h-80">
                            {Object.entries(
                              commonUnits.reduce((acc, unit) => {
                                if (!acc[unit.category]) acc[unit.category] = [];
                                acc[unit.category].push(unit);
                                return acc;
                              }, {} as Record<string, typeof commonUnits>)
                            ).map(([category, units]) => (
                              <div key={category}>
                                <div className="px-2 py-1 text-sm font-medium text-gray-500 bg-gray-50 sticky top-0">
                                  {category}
                                </div>
                                {units.map((unit) => (
                                  <SelectItem key={unit.value} value={unit.value}>
                                    {unit.label}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="param-default">
                        {parameterFormData.parameterType === 'ef_value' ? 'EF Value *' : 'Default Value'}
                      </Label>
                      <Input
                        id="param-default"
                        value={parameterFormData.defaultValue}
                        onChange={(e) => setParameterFormData({...parameterFormData, defaultValue: e.target.value})}
                        placeholder={parameterFormData.parameterType === 'ef_value' ? 'EF value (auto-filled)' : 'Default value (optional)'}
                        readOnly={parameterFormData.parameterType === 'ef_value'}
                        className={parameterFormData.parameterType === 'ef_value' ? 'bg-gray-50 cursor-not-allowed' : ''}
                      />
                      {parameterFormData.parameterType === 'ef_value' && (
                        <p className="text-xs text-gray-500">Value is automatically retrieved from selected EF</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="param-description">Description</Label>
                    <Textarea
                      id="param-description"
                      value={parameterFormData.description}
                      onChange={(e) => setParameterFormData({...parameterFormData, description: e.target.value})}
                      placeholder="Describe what this parameter represents"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="param-required"
                      checked={parameterFormData.required}
                      onCheckedChange={(checked) => setParameterFormData({...parameterFormData, required: checked as boolean})}
                    />
                    <Label htmlFor="param-required">This parameter is required</Label>
                  </div>
                </CardContent>
              </Card>

              {/* EF Parameter Configuration */}
              {parameterFormData.parameterType === 'ef_value' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5 text-emerald-600" />
                      Emission Factor Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data Source</Label>
                        <Select value={parameterFormData.efSource} onValueChange={(value: 'master_db' | 'client_db') => setParameterFormData({...parameterFormData, efSource: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="master_db">Master Database</SelectItem>
                            <SelectItem value="client_db">Client Database</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Search & Select EF *</Label>
                        <div className="relative">
                          <Input
                            value={efSearchTerm}
                            onChange={(e) => setEfSearchTerm(e.target.value)}
                            onFocus={() => setIsEFSearchOpen(true)}
                            placeholder="Search emission factors..."
                            className="pr-10"
                          />
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* EF Search Results */}
                    {isEFSearchOpen && (
                      <Card className="border-emerald-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Available Emission Factors</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEFSearchOpen(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="max-h-60 overflow-y-auto">
                          <div className="space-y-2">
                            {getAvailableEFs()
                              .filter(ef => 
                                !efSearchTerm || 
                                ef.name.toLowerCase().includes(efSearchTerm.toLowerCase()) ||
                                ef.category.toLowerCase().includes(efSearchTerm.toLowerCase())
                              )
                              .slice(0, 10)
                              .map(ef => (
                                <div
                                  key={ef.uid}
                                  className="p-3 border rounded-lg cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                                  onClick={() => handleEFSelection(ef)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-medium text-sm">{ef.name}</h5>
                                      <p className="text-xs text-gray-600">{ef.category} • {ef.uid}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-medium text-sm">{ef.latestValue.value}</span>
                                      <p className="text-xs text-gray-500">{ef.latestValue.unit}</p>
                                    </div>
                                  </div>
                                  {ef.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ef.description}</p>
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Selected EF Display */}
                    {selectedEF && (
                      <Card className="bg-emerald-50 border-emerald-200">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            Selected Emission Factor
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-emerald-800">Name:</span>
                              <p className="text-emerald-700">{selectedEF.name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-emerald-800">UID:</span>
                              <p className="text-emerald-700">{selectedEF.uid}</p>
                            </div>
                            <div>
                              <span className="font-medium text-emerald-800">Category:</span>
                              <p className="text-emerald-700">{selectedEF.category}</p>
                            </div>
                            <div>
                              <span className="font-medium text-emerald-800">Value:</span>
                              <p className="text-emerald-700 font-medium">
                                {selectedEF.latestValue.value} {selectedEF.latestValue.unit}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium text-emerald-800">Description:</span>
                              <p className="text-emerald-700">{selectedEF.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Constant Parameter Configuration */}
              {parameterFormData.parameterType === 'constant' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Hash className="h-5 w-5 text-purple-600" />
                      Constant Value Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="constant-value">Constant Value *</Label>
                        <Input
                          id="constant-value"
                          value={parameterFormData.constantValue}
                          onChange={(e) => setParameterFormData({...parameterFormData, constantValue: e.target.value})}
                          placeholder="e.g., 25, 3.14159, 1000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="constant-desc">Source/Reference</Label>
                        <Input
                          id="constant-desc"
                          value={parameterFormData.constantDescription}
                          onChange={(e) => setParameterFormData({...parameterFormData, constantDescription: e.target.value})}
                          placeholder="e.g., IPCC AR6, Scientific literature"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Validation Rules (for formula parameters) */}
              {parameterFormData.parameterType === 'formula_parameter' && parameterFormData.type === 'number' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Validation Rules</CardTitle>
                    <p className="text-sm text-gray-600">Set optional minimum and maximum value constraints</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min-value">Minimum Value</Label>
                        <Input
                          id="min-value"
                          type="number"
                          value={parameterFormData.minValue}
                          onChange={(e) => setParameterFormData({...parameterFormData, minValue: e.target.value})}
                          placeholder="Optional minimum"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-value">Maximum Value</Label>
                        <Input
                          id="max-value"
                          type="number"
                          value={parameterFormData.maxValue}
                          onChange={(e) => setParameterFormData({...parameterFormData, maxValue: e.target.value})}
                          placeholder="Optional maximum"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
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
          // Reset form when dialog closes
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