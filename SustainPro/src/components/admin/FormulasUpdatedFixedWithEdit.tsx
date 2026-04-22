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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Formula, FormulaVersion, FormulaParameter } from '../../types';
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
  AlertTriangle,
  Info,
  Code,
  Variable,
  Zap,
  MoreHorizontal,
  Database,
  ChevronRight,
  ArrowRight,
  Layers,
  Target,
  Workflow
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Formula Definition Field types
type DefinitionFieldType = 'text' | 'number' | 'date' | 'dropdown' | 'boolean' | 'textarea';

interface FormulaDefinitionField {
  id: string;
  name: string;
  type: DefinitionFieldType;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

// Enhanced Parameter types for formula construction
type FormulaParameterType = 'formula_parameter' | 'ef_value' | 'constant';

interface EnhancedFormulaParameter extends FormulaParameter {
  parameterType: FormulaParameterType;
  // For EF Value parameters
  efSource?: 'master_db' | 'cdb';
  efCategory?: string;
  efUID?: string;
  efDefinition?: string;
  // For constant parameters
  constantValue?: number | string;
  constantDescription?: string;
}

// UID Generation Helper
const generateFormulaUID = (category: string, sequence: number): string => {
  const categoryCode = category ? category.substring(0, 3).toUpperCase() : 'GEN';
  return `FML-${categoryCode}-${new Date().getFullYear()}-${sequence.toString().padStart(3, '0')}`;
};

const generateVersionUID = (parentUID: string, version: string): string => {
  return `${parentUID}-V${version}`;
};

// Mock data with enhanced parameters showcasing mixed parameter types in realistic formulas
const mockFormulas: Formula[] = [
  {
    id: '1',
    uid: 'FML-TRA-2024-001',
    name: 'Comprehensive Transport Emission Formula',
    description: 'Calculate total transport emissions combining user inputs, database emission factors, and scientific constants',
    category: 'Transport',
    latestVersion: '1.2',
    parameters: [
      { 
        id: '1', 
        name: 'distance_traveled', 
        type: 'number', 
        unit: 'km', 
        defaultValue: 0, 
        required: true,
        description: 'Total distance traveled by vehicle (Formula Parameter - User Input)',
        minValue: 0,
        parameterType: 'formula_parameter'
      },
      { 
        id: '2', 
        name: 'fuel_consumed', 
        type: 'number', 
        unit: 'L', 
        defaultValue: 0, 
        required: true,
        description: 'Total fuel consumed during trip (Formula Parameter - User Input)',
        minValue: 0,
        parameterType: 'formula_parameter'
      },
      { 
        id: '3', 
        name: 'vehicle_load_factor', 
        type: 'number', 
        unit: 'ratio', 
        defaultValue: 0.75, 
        required: false,
        description: 'Vehicle capacity utilization ratio (Formula Parameter - User Input)',
        minValue: 0.1,
        maxValue: 1.0,
        parameterType: 'formula_parameter'
      },
      { 
        id: '4', 
        name: 'fuel_emission_factor', 
        type: 'number', 
        unit: 'kg CO2e/L', 
        defaultValue: 2.31, 
        required: true,
        description: 'Gasoline combustion emission factor (EF Parameter - Master DB: EF-TRA-2024-001)',
        parameterType: 'ef_value',
        efSource: 'master_db',
        efUID: 'EF-TRA-2024-001',
        efCategory: 'Transportation Fuels'
      },
      { 
        id: '5', 
        name: 'methane_slip_ef', 
        type: 'number', 
        unit: 'kg CH4/L', 
        defaultValue: 0.00015, 
        required: true,
        description: 'Methane slip emission factor for engines (EF Parameter - CDB: EF-TRA-2024-002)',
        parameterType: 'ef_value',
        efSource: 'cdb',
        efUID: 'EF-TRA-2024-002',
        efCategory: 'Transportation Fuels'
      },
      { 
        id: '6', 
        name: 'methane_gwp', 
        type: 'number', 
        unit: 'kg CO2e/kg CH4', 
        defaultValue: 25, 
        required: true,
        description: 'Global Warming Potential of methane over 100 years (Constant Parameter - IPCC AR5)',
        parameterType: 'constant',
        constantValue: 25,
        constantDescription: 'IPCC AR5 GWP value for methane'
      },
      { 
        id: '7', 
        name: 'unit_conversion_factor', 
        type: 'number', 
        unit: '', 
        defaultValue: 1000, 
        required: true,
        description: 'Conversion factor from grams to kilograms (Constant Parameter - Mathematical)',
        parameterType: 'constant',
        constantValue: 1000,
        constantDescription: 'Standard metric conversion constant'
      }
    ],
    tags: ['transport', 'fuel', 'scope-1', 'comprehensive', 'mixed-parameters'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    versions: [
      {
        id: 'v1',
        versionUID: 'FML-TRA-2024-001-V1.2',
        parentUID: 'FML-TRA-2024-001',
        version: '1.2',
        expression: '((fuel_consumed * fuel_emission_factor) + ((fuel_consumed * methane_slip_ef * methane_gwp) / unit_conversion_factor)) * vehicle_load_factor',
        parameters: [],
        sourceName: 'IPCC 2006 Guidelines + Custom Load Factor Analysis',
        sourceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        sourceType: 'primary',
        algorithmType: 'linear',
        applicationScope: 'Comprehensive road transport emissions with methane consideration',
        validationStatus: 'validated',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '2',
    uid: 'FML-ENE-2024-002',
    name: 'Industrial Energy & Process Emissions',
    description: 'Calculate combined energy and process emissions using mixed parameter types for industrial facilities',
    category: 'Industrial Process',
    latestVersion: '1.1',
    parameters: [
      { 
        id: '8', 
        name: 'electricity_consumption', 
        type: 'number', 
        unit: 'kWh', 
        defaultValue: 0, 
        required: true,
        description: 'Monthly electricity consumption (Formula Parameter - User Input)',
        minValue: 0,
        parameterType: 'formula_parameter'
      },
      { 
        id: '9', 
        name: 'natural_gas_volume', 
        type: 'number', 
        unit: 'm³', 
        defaultValue: 0, 
        required: true,
        description: 'Natural gas consumed for heating (Formula Parameter - User Input)',
        minValue: 0,
        parameterType: 'formula_parameter'
      },
      { 
        id: '10', 
        name: 'production_efficiency', 
        type: 'number', 
        unit: 'ratio', 
        defaultValue: 0.85, 
        required: false,
        description: 'Plant production efficiency factor (Formula Parameter - User Input)',
        minValue: 0.5,
        maxValue: 1.0,
        parameterType: 'formula_parameter'
      },
      { 
        id: '11', 
        name: 'grid_electricity_ef', 
        type: 'number', 
        unit: 'kg CO2e/kWh', 
        defaultValue: 0.42, 
        required: true,
        description: 'Regional electricity grid emission factor (EF Parameter - Master DB: EF-ELE-2024-001)',
        parameterType: 'ef_value',
        efSource: 'master_db',
        efUID: 'EF-ELE-2024-001',
        efCategory: 'Electricity Grid Factors'
      },
      { 
        id: '12', 
        name: 'natural_gas_ef', 
        type: 'number', 
        unit: 'kg CO2e/m³', 
        defaultValue: 1.96, 
        required: true,
        description: 'Natural gas combustion emission factor (EF Parameter - CDB: EF-GAS-2024-001)',
        parameterType: 'ef_value',
        efSource: 'cdb',
        efUID: 'EF-GAS-2024-001',
        efCategory: 'Industrial Processes'
      },
      { 
        id: '13', 
        name: 'operating_hours_per_month', 
        type: 'number', 
        unit: 'hours', 
        defaultValue: 720, 
        required: true,
        description: 'Standard operating hours per month (Constant Parameter - Industrial Standard)',
        parameterType: 'constant',
        constantValue: 720,
        constantDescription: 'Standard industrial operating schedule (24h × 30 days)'
      },
      { 
        id: '14', 
        name: 'energy_loss_factor', 
        type: 'number', 
        unit: 'ratio', 
        defaultValue: 1.15, 
        required: true,
        description: 'Energy transmission and distribution loss factor (Constant Parameter - Engineering Standard)',
        parameterType: 'constant',
        constantValue: 1.15,
        constantDescription: 'Typical industrial energy loss factor (15% losses)'
      }
    ],
    tags: ['industrial', 'energy', 'scope-1', 'scope-2', 'mixed-parameters'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-16T14:30:00Z',
    versions: [
      {
        id: 'v2',
        versionUID: 'FML-ENE-2024-002-V1.1',
        parentUID: 'FML-ENE-2024-002',
        version: '1.1',
        expression: '((electricity_consumption * grid_electricity_ef * energy_loss_factor) + (natural_gas_volume * natural_gas_ef)) * production_efficiency',
        parameters: [],
        sourceName: 'ISO 14040:2006 + Industrial Energy Efficiency Standards',
        sourceURL: 'https://www.iso.org/standard/37456.html',
        sourceType: 'primary',
        algorithmType: 'linear',
        applicationScope: 'Combined scope 1 & 2 emissions for industrial facilities',
        validationStatus: 'validated',
        isActive: true,
        createdAt: '2024-01-16T14:30:00Z',
        createdBy: 'admin'
      }
    ]
  }
];

const categories = ['Transport', 'Energy', 'Industrial Process', 'Materials', 'Waste', 'Agriculture', 'Buildings'];
const algorithmTypes = ['linear', 'logarithmic', 'polynomial', 'custom'];
const sourceTypes = ['primary', 'secondary', 'tertiary'];
const validationStatuses = ['pending', 'validated', 'rejected'];
const efCategories = [
  'Electricity Grid Factors',
  'Transportation Fuels',
  'Industrial Processes',
  'Waste Management',
  'Agriculture & Land Use',
  'Building Materials',
  'Chemical Processes'
];

const parameterTypeInfo = {
  formula_parameter: {
    icon: Variable,
    color: 'text-blue-600 bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
    title: 'Formula Parameters',
    description: 'User input or bulk upload values'
  },
  ef_value: {
    icon: Database,
    color: 'text-emerald-600 bg-emerald-50', 
    badge: 'bg-emerald-100 text-emerald-800',
    title: 'EF Parameters',
    description: 'Emission factors from Master DB or CDB'
  },
  constant: {
    icon: Hash,
    color: 'text-purple-600 bg-purple-50',
    badge: 'bg-purple-100 text-purple-800', 
    title: 'Constant Parameters',
    description: 'Fixed values for calculations'
  }
};

export function Formulas() {
  const [formulas, setFormulas] = useState<Formula[]>(mockFormulas);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  const [expandedFormulas, setExpandedFormulas] = useState<Set<string>>(new Set());
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isDefinitionFieldDialogOpen, setIsDefinitionFieldDialogOpen] = useState(false);
  
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  
  // Edit dialog tab state
  const [editDialogTab, setEditDialogTab] = useState<'info' | 'parameters' | 'expression'>('info');

  // Form data states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    parameters: [] as EnhancedFormulaParameter[],
    definitionFieldValues: {} as Record<string, any>
  });

  const [versionFormData, setVersionFormData] = useState({
    expression: '',
    sourceName: '',
    sourceURL: '',
    sourceType: 'primary' as const,
    algorithmType: 'linear' as const,
    applicationScope: '',
    validationStatus: 'pending' as const,
    notes: ''
  });

  // Expression validation and suggestions
  const [expressionSuggestions, setExpressionSuggestions] = useState<Array<{name: string, type: string, unit?: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expressionValidation, setExpressionValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: true, errors: [], warnings: [] });
  const [expressionCursorPosition, setExpressionCursorPosition] = useState(0);
  const expressionTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Parameter management state
  const [showParameterForm, setShowParameterForm] = useState(false);
  const [editingParameterId, setEditingParameterId] = useState<string | null>(null);
  const [efSearchTerm, setEfSearchTerm] = useState('');
  const [efSearchResults, setEfSearchResults] = useState<Array<{id: string, uid: string, name: string, value: number, unit: string}>>([]);
  const [selectedEF, setSelectedEF] = useState<{id: string, uid: string, name: string, value: number, unit: string} | null>(null);
  
  const [newParameter, setNewParameter] = useState<{
    name: string;
    type: 'number' | 'string' | 'boolean';
    unit: string;
    defaultValue: string;
    description: string;
    required: boolean;
    minValue: string;
    maxValue: string;
    parameterType: FormulaParameterType;
    efSource: 'master_db' | 'cdb';
    efCategory: string;
    efUID: string;
    efDefinition: string;
    constantValue: string;
    constantDescription: string;
  }>({
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

  // Formula Definition Fields
  const [definitionFields, setDefinitionFields] = useState([
    {
      id: '1',
      name: 'Algorithm Developer',
      type: 'text',
      required: true,
      defaultValue: ''
    },
    {
      id: '2',
      name: 'Complexity Level',
      type: 'dropdown',
      required: false,
      options: ['Simple', 'Moderate', 'Complex', 'Advanced'],
      defaultValue: 'Simple'
    },
    {
      id: '3',
      name: 'Methodology Reference',
      type: 'text',
      required: false,
      defaultValue: ''
    }
  ]);
  
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<DefinitionFieldType>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');
  
  const resetVersionDialog = () => {
    setVersionFormData({
      expression: '',
      sourceName: '',
      sourceURL: '',
      sourceType: 'primary',
      algorithmType: 'linear',
      applicationScope: '',
      validationStatus: 'pending',
      notes: ''
    });
    setExpressionValidation({ isValid: true, errors: [], warnings: [] });
    setShowSuggestions(false);
    setExpressionSuggestions([]);
  };

  const searchEF = (term: string, source: 'master_db' | 'cdb') => {
    if (!term.trim()) {
      setEfSearchResults([]);
      return;
    }
    
    const filtered = mockEFData.filter(ef => 
      ef.source === source &&
      (ef.name.toLowerCase().includes(term.toLowerCase()) || 
       ef.uid.toLowerCase().includes(term.toLowerCase()))
    );
    setEfSearchResults(filtered);
  };

  const addParameter = () => {
    if (!newParameter.name.trim()) {
      toast.error('Parameter name is required');
      return;
    }

    // Validation based on parameter type
    if (newParameter.parameterType === 'ef_value' && !selectedEF) {
      toast.error('Please select an EF from the search results');
      return;
    }

    if (newParameter.parameterType === 'constant' && !newParameter.constantValue) {
      toast.error('Constant value is required for Constant parameters');
      return;
    }

    let defaultValue: any = '';
    let unit = newParameter.unit;
    
    switch (newParameter.type) {
      case 'number':
        if (newParameter.parameterType === 'constant') {
          defaultValue = parseFloat(newParameter.constantValue) || 0;
        } else if (newParameter.parameterType === 'ef_value' && selectedEF) {
          defaultValue = selectedEF.value;
          unit = selectedEF.unit;
        } else {
          defaultValue = newParameter.defaultValue ? parseFloat(newParameter.defaultValue) : 0;
        }
        break;
      case 'boolean':
        defaultValue = false;
        break;
      default:
        if (newParameter.parameterType === 'constant') {
          defaultValue = newParameter.constantValue;
        } else {
          defaultValue = newParameter.defaultValue;
        }
    }

    const parameter: EnhancedFormulaParameter = {
      id: editingParameterId || Date.now().toString(),
      name: newParameter.name,
      type: newParameter.type,
      unit: unit || undefined,
      defaultValue,
      description: newParameter.description || undefined,
      required: newParameter.required,
      minValue: newParameter.minValue ? parseFloat(newParameter.minValue) : undefined,
      maxValue: newParameter.maxValue ? parseFloat(newParameter.maxValue) : undefined,
      parameterType: newParameter.parameterType,
      efSource: newParameter.parameterType === 'ef_value' ? newParameter.efSource : undefined,
      efCategory: newParameter.parameterType === 'ef_value' ? newParameter.efCategory : undefined,
      efUID: newParameter.parameterType === 'ef_value' && selectedEF ? selectedEF.uid : undefined,
      efDefinition: newParameter.parameterType === 'ef_value' ? newParameter.efDefinition : undefined,
      constantValue: newParameter.parameterType === 'constant' ? newParameter.constantValue : undefined,
      constantDescription: newParameter.parameterType === 'constant' ? newParameter.constantDescription : undefined
    };

    if (editingParameterId) {
      // Update existing parameter
      setFormData({
        ...formData,
        parameters: formData.parameters.map(p => p.id === editingParameterId ? parameter : p)
      });
      toast.success(`Parameter "${parameter.name}" updated`);
    } else {
      // Add new parameter
      setFormData({
        ...formData,
        parameters: [...formData.parameters, parameter]
      });
      toast.success(`${parameter.parameterType.replace('_', ' ').toUpperCase()} parameter "${parameter.name}" added`);
    }

    // Reset form
    resetParameterForm();
  };

  const resetParameterForm = () => {
    setNewParameter({
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
    setEditingParameterId(null);
    setShowParameterForm(false);
    setSelectedEF(null);
    setEfSearchTerm('');
    setEfSearchResults([]);
  };

  const editParameter = (parameter: EnhancedFormulaParameter) => {
    setNewParameter({
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
      constantValue: parameter.constantValue?.toString() || '',
      constantDescription: parameter.constantDescription || ''
    });
    
    // If it's an EF parameter, set the selected EF
    if (parameter.parameterType === 'ef_value' && parameter.efUID) {
      const ef = mockEFData.find(e => e.uid === parameter.efUID);
      if (ef) {
        setSelectedEF(ef);
      }
    }
    
    setEditingParameterId(parameter.id);
    setShowParameterForm(true);
  };

  const removeParameter = (id: string) => {
    setFormData({
      ...formData,
      parameters: formData.parameters.filter(p => p.id !== id)
    });
    toast.success('Parameter removed');
  };

  const handleCreate = () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.parameters.length === 0) {
      toast.error('Please add at least one parameter');
      return;
    }

    const sequence = formulas.length + 1;
    const newUID = generateFormulaUID(formData.category || 'General', sequence);

    const newFormula: Formula = {
      id: Date.now().toString(),
      uid: newUID,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      latestVersion: '',
      parameters: formData.parameters as FormulaParameter[],
      tags: formData.tags,
      status: 'draft',
      database: 'master',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      customAttributes: formData.definitionFieldValues,
      versions: []
    };
    
    setFormulas([...formulas, newFormula]);
    setSelectedFormula(newFormula);
    setIsCreateDialogOpen(false);
    setIsVersionDialogOpen(true);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: [],
      parameters: [],
      definitionFieldValues: {}
    });
    
    toast.success(`Formula created — UID ${newUID}`);
  };

  // Mock EF data for search
  const mockEFData = [
    { id: '1', uid: 'EF-ELE-2024-001', name: 'US Grid Average', value: 0.42, unit: 'kg CO2e/kWh', source: 'master_db' },
    { id: '2', uid: 'EF-TRA-2024-001', name: 'Gasoline Combustion', value: 2.31, unit: 'kg CO2e/L', source: 'master_db' },
    { id: '3', uid: 'EF-IND-2024-001', name: 'Steel Production', value: 1.85, unit: 'kg CO2e/kg', source: 'cdb' },
    { id: '4', uid: 'EF-WAS-2024-001', name: 'Landfill Methane', value: 25.0, unit: 'kg CO2e/kg', source: 'master_db' },
    { id: '5', uid: 'EF-AGR-2024-001', name: 'Fertilizer N2O', value: 298, unit: 'kg CO2e/kg', source: 'cdb' }
  ];

  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || formula.category === selectedCategory;
    const matchesDatabase = selectedDatabase === 'all' || !selectedDatabase || formula.database === selectedDatabase;
    
    return matchesSearch && matchesCategory && matchesDatabase;
  });

  const toggleFormulaExpansion = (formulaId: string) => {
    const newExpanded = new Set(expandedFormulas);
    if (newExpanded.has(formulaId)) {
      newExpanded.delete(formulaId);
    } else {
      newExpanded.add(formulaId);
    }
    setExpandedFormulas(newExpanded);
  };

  const toggleVersionExpansion = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  // Formula edit functions
  const openEditDialog = (formula: Formula) => {
    setEditingFormula(formula);
    setFormData({
      name: formula.name,
      description: formula.description,
      category: formula.category,
      tags: formula.tags || [],
      parameters: formula.parameters as EnhancedFormulaParameter[],
      definitionFieldValues: formula.customAttributes || {}
    });
    
    // Load latest version data for expression editing
    const latestVersion = formula.versions?.[0];
    if (latestVersion) {
      setVersionFormData({
        expression: latestVersion.expression || '',
        sourceName: latestVersion.sourceName || '',
        sourceURL: latestVersion.sourceURL || '',
        sourceType: latestVersion.sourceType || 'primary',
        algorithmType: latestVersion.algorithmType || 'linear',
        applicationScope: latestVersion.applicationScope || '',
        validationStatus: latestVersion.validationStatus || 'pending',
        notes: ''
      });
    }
    
    setEditDialogTab('info');
    setIsEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!editingFormula) return;

    let updatedVersions = [...(editingFormula.versions || [])];
    let newLatestVersion = editingFormula.latestVersion;

    // Check if expression was changed and create new version if needed
    const currentLatestVersion = editingFormula.versions?.[0];
    const expressionChanged = currentLatestVersion?.expression !== versionFormData.expression;
    
    if (expressionChanged && versionFormData.expression.trim()) {
      // Generate new version number
      const currentVersionNumber = parseFloat(currentLatestVersion?.version || '0');
      const newVersionNumber = (currentVersionNumber + 0.1).toFixed(1);
      newLatestVersion = newVersionNumber;

      const newVersion: FormulaVersion = {
        id: `v${Date.now()}`,
        versionUID: generateVersionUID(editingFormula.uid, newVersionNumber),
        parentUID: editingFormula.uid,
        version: newVersionNumber,
        expression: versionFormData.expression,
        parameters: [],
        sourceName: versionFormData.sourceName,
        sourceURL: versionFormData.sourceURL,
        sourceType: versionFormData.sourceType,
        algorithmType: versionFormData.algorithmType,
        applicationScope: versionFormData.applicationScope,
        validationStatus: versionFormData.validationStatus,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
      };

      // Deactivate previous version
      updatedVersions = updatedVersions.map(v => ({ ...v, isActive: false }));
      updatedVersions.unshift(newVersion);
    }

    const updatedFormula: Formula = {
      ...editingFormula,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      parameters: formData.parameters as FormulaParameter[],
      tags: formData.tags,
      customAttributes: formData.definitionFieldValues,
      latestVersion: newLatestVersion,
      versions: updatedVersions
    };

    setFormulas(formulas.map(f => f.id === editingFormula.id ? updatedFormula : f));
    setIsEditDialogOpen(false);
    setEditingFormula(null);
    
    // Reset forms
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: [],
      parameters: [],
      definitionFieldValues: {}
    });
    resetVersionDialog();
    resetParameterForm();
    
    if (expressionChanged) {
      toast.success(`Formula "${updatedFormula.name}" updated with new version ${newLatestVersion}`);
    } else {
      toast.success(`Formula "${updatedFormula.name}" updated successfully`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Master DB - Formulas</h1>
          </div>
          <p className="text-gray-600">Define and manage calculation formulas with advanced parameter systems</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Formula
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Database" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All DBs</SelectItem>
                <SelectItem value="master">Master</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Formulas Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="min-w-[300px]">Formula Details</TableHead>
                  <TableHead className="min-w-[180px]">Category & Tags</TableHead>
                  <TableHead className="min-w-[120px]">Parameters</TableHead>
                  <TableHead className="min-w-[150px]">Latest Version</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormulas.map((formula) => (
                  <React.Fragment key={formula.id}>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFormulaExpansion(formula.id)}
                        >
                          {expandedFormulas.has(formula.id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{formula.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {formula.uid}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {formula.description}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <Badge variant="secondary" className="text-xs">
                            {formula.category}
                          </Badge>
                          <div className="flex flex-wrap gap-1">
                            {formula.tags?.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {(formula.tags?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(formula.tags?.length || 0) - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{formula.parameters?.length || 0}</span> parameters
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formula.parameters?.slice(0, 3).map((param, index) => {
                              const enhancedParam = param as EnhancedFormulaParameter;
                              const paramType = enhancedParam.parameterType || 'formula_parameter';
                              const typeInfo = parameterTypeInfo[paramType];
                              const Icon = typeInfo.icon;
                              return (
                                <div key={index} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${typeInfo.badge}`}>
                                  <Icon className="h-3 w-3" />
                                  <span className="capitalize">{paramType.replace('_', ' ')}</span>
                                </div>
                              );
                            })}
                            {(formula.parameters?.length || 0) > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(formula.parameters?.length || 0) - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <GitBranch className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">v{formula.latestVersion}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formula.versions?.length || 0} versions
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge 
                          variant={formula.status === 'active' ? 'default' : 'secondary'}
                          className={formula.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {formula.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(formula)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row */}
                    {expandedFormulas.has(formula.id) && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-gray-50 p-6">
                          <div className="space-y-6">
                            {/* Parameter Details */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Variable className="h-4 w-4" />
                                Parameters ({formula.parameters?.length || 0})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {formula.parameters?.map(param => {
                                  const enhancedParam = param as EnhancedFormulaParameter;
                                  const paramType = enhancedParam.parameterType || 'formula_parameter';
                                  const typeInfo = parameterTypeInfo[paramType];
                                  const Icon = typeInfo.icon;
                                  return (
                                    <div key={param.id} className="bg-white rounded-lg border p-4">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`p-1 rounded ${typeInfo.color}`}>
                                            <Icon className="h-3 w-3" />
                                          </div>
                                          <span className="font-medium text-sm">{param.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                          <Badge className={`text-xs ${typeInfo.badge}`}>
                                            {paramType.replace('_', ' ').toUpperCase()}
                                          </Badge>
                                          {param.required && (
                                            <Badge variant="outline" className="text-xs">Required</Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-600 space-y-1">
                                        <div><strong>Type:</strong> {param.type}</div>
                                        {param.unit && <div><strong>Unit:</strong> {param.unit}</div>}
                                        <div><strong>Default:</strong> {param.defaultValue}</div>
                                        {enhancedParam.efUID && (
                                          <div><strong>EF UID:</strong> {enhancedParam.efUID}</div>
                                        )}
                                        {enhancedParam.constantValue && (
                                          <div><strong>Constant:</strong> {enhancedParam.constantValue}</div>
                                        )}
                                        {param.description && (
                                          <div className="text-gray-500 mt-2 border-t pt-2">
                                            <strong>Description:</strong> {param.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Version History */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                Version History ({formula.versions?.length || 0})
                              </h4>
                              <div className="space-y-3">
                                {formula.versions?.map(version => (
                                  <div key={version.id} className="bg-white rounded-lg border p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-3">
                                        <Badge variant="outline">v{version.version}</Badge>
                                        <span className="text-sm text-gray-600">{version.versionUID}</span>
                                        {version.isActive && (
                                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={
                                          version.validationStatus === 'validated' ? 'default' :
                                          version.validationStatus === 'pending' ? 'secondary' : 'destructive'
                                        }>
                                          {version.validationStatus}
                                        </Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleVersionExpansion(version.id)}
                                        >
                                          {expandedVersions.has(version.id) ? 
                                            <ChevronDown className="h-4 w-4" /> : 
                                            <ChevronRight className="h-4 w-4" />
                                          }
                                        </Button>
                                      </div>
                                    </div>

                                    {expandedVersions.has(version.id) && (
                                      <div className="mt-3 pt-3 border-t space-y-3">
                                        <div className="text-sm text-gray-600 mb-3">
                                          <div className="flex items-start gap-2">
                                            <strong className="shrink-0">Expression:</strong> 
                                            <code className="bg-gray-100 px-3 py-2 rounded text-xs font-mono break-all flex-1">
                                              {version.expression}
                                            </code>
                                          </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <div className="space-y-2">
                                              <div><strong>Source:</strong> {version.sourceName}</div>
                                              <div><strong>Algorithm:</strong> {version.algorithmType}</div>
                                              <div><strong>Scope:</strong> {version.applicationScope}</div>
                                            </div>
                                          </div>
                                          <div>
                                            <div className="space-y-2">
                                              <div><strong>Created:</strong> {new Date(version.createdAt).toLocaleDateString()}</div>
                                              <div><strong>By:</strong> {version.createdBy}</div>
                                              {version.sourceURL && (
                                                <div>
                                                  <strong>Reference:</strong> 
                                                  <a href={version.sourceURL} target="_blank" rel="noopener noreferrer" 
                                                     className="text-blue-600 hover:underline ml-1">
                                                    <ExternalLink className="h-3 w-3 inline ml-1" />
                                                  </a>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
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
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Edit Dialog with Tabs */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Formula: {editingFormula?.name}
            </DialogTitle>
            <DialogDescription>
              Update formula definition, parameters, and mathematical expression
            </DialogDescription>
          </DialogHeader>

          <Tabs value={editDialogTab} onValueChange={(value) => setEditDialogTab(value as 'info' | 'parameters' | 'expression')} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Formula Info
              </TabsTrigger>
              <TabsTrigger value="parameters" className="flex items-center gap-2">
                <Variable className="h-4 w-4" />
                Parameters ({formData.parameters.length})
              </TabsTrigger>
              <TabsTrigger value="expression" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Expression
              </TabsTrigger>
            </TabsList>

            {/* Formula Information Tab */}
            <TabsContent value="info" className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Formula Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter formula name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
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

                <div>
                  <Label htmlFor="edit-description">Description *</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the formula's purpose and application"
                    className="h-24"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-tags">Tags</Label>
                  <Input
                    id="edit-tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                    placeholder="Enter tags separated by commas"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => setFormData({
                            ...formData, 
                            tags: formData.tags.filter((_, i) => i !== index)
                          })}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Definition Fields */}
                <div>
                  <Label>Additional Definition Fields</Label>
                  <div className="space-y-3 mt-2">
                    {definitionFields.map(field => (
                      <div key={field.id} className="grid grid-cols-3 gap-4 items-center">
                        <span className="text-sm font-medium">{field.name}</span>
                        {field.type === 'dropdown' && field.options ? (
                          <Select 
                            value={formData.definitionFieldValues[field.id] || field.defaultValue} 
                            onValueChange={(value) => setFormData({
                              ...formData,
                              definitionFieldValues: {...formData.definitionFieldValues, [field.id]: value}
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={formData.definitionFieldValues[field.id] || field.defaultValue || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              definitionFieldValues: {...formData.definitionFieldValues, [field.id]: e.target.value}
                            })}
                            placeholder={field.required ? 'Required' : 'Optional'}
                          />
                        )}
                        <div className="flex items-center gap-2">
                          {field.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Parameters Tab */}
            <TabsContent value="parameters" className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Formula Parameters</h3>
                  <Button onClick={() => setShowParameterForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Parameter
                  </Button>
                </div>

                {/* Parameters List */}
                <div className="space-y-3">
                  {formData.parameters.map(param => {
                    const typeInfo = parameterTypeInfo[param.parameterType];
                    const Icon = typeInfo.icon;
                    return (
                      <div key={param.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-1 rounded ${typeInfo.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="font-medium">{param.name}</span>
                              <Badge className={`text-xs ${typeInfo.badge}`}>
                                {param.parameterType.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {param.required && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 grid grid-cols-2 gap-4">
                              <div>
                                <strong>Type:</strong> {param.type} {param.unit && `(${param.unit})`}
                              </div>
                              <div>
                                <strong>Default:</strong> {param.defaultValue}
                              </div>
                              {param.efUID && (
                                <div>
                                  <strong>EF UID:</strong> {param.efUID}
                                </div>
                              )}
                              {param.constantValue && (
                                <div>
                                  <strong>Constant:</strong> {param.constantValue}
                                </div>
                              )}
                            </div>
                            {param.description && (
                              <p className="text-sm text-gray-500 mt-2">{param.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => editParameter(param)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeParameter(param.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {formData.parameters.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Variable className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No parameters defined yet</p>
                    <p className="text-sm">Add parameters to build your formula</p>
                  </div>
                )}

                {/* Parameter Form */}
                {showParameterForm && (
                  <div className="border-t pt-6 mt-6">
                    <h4 className="font-medium mb-4">
                      {editingParameterId ? 'Edit Parameter' : 'Add New Parameter'}
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Parameter Name *</Label>
                          <Input
                            value={newParameter.name}
                            onChange={(e) => setNewParameter({...newParameter, name: e.target.value})}
                            placeholder="parameter_name"
                          />
                        </div>
                        <div>
                          <Label>Parameter Type</Label>
                          <Select value={newParameter.parameterType} onValueChange={(value: FormulaParameterType) => setNewParameter({...newParameter, parameterType: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="formula_parameter">Formula Parameter (User Input)</SelectItem>
                              <SelectItem value="ef_value">EF Parameter (Database Value)</SelectItem>
                              <SelectItem value="constant">Constant Parameter (Fixed Value)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Data Type</Label>
                          <Select value={newParameter.type} onValueChange={(value: 'number' | 'string' | 'boolean') => setNewParameter({...newParameter, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Unit</Label>
                          <Input
                            value={newParameter.unit}
                            onChange={(e) => setNewParameter({...newParameter, unit: e.target.value})}
                            placeholder="kg, kWh, etc."
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="required"
                            checked={newParameter.required}
                            onCheckedChange={(checked) => setNewParameter({...newParameter, required: checked as boolean})}
                          />
                          <Label htmlFor="required">Required parameter</Label>
                        </div>
                      </div>

                      {/* Conditional fields based on parameter type */}
                      {newParameter.parameterType === 'formula_parameter' && (
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Default Value</Label>
                            <Input
                              value={newParameter.defaultValue}
                              onChange={(e) => setNewParameter({...newParameter, defaultValue: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label>Min Value</Label>
                            <Input
                              value={newParameter.minValue}
                              onChange={(e) => setNewParameter({...newParameter, minValue: e.target.value})}
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <Label>Max Value</Label>
                            <Input
                              value={newParameter.maxValue}
                              onChange={(e) => setNewParameter({...newParameter, maxValue: e.target.value})}
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                      )}

                      {newParameter.parameterType === 'ef_value' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>EF Source</Label>
                              <Select value={newParameter.efSource} onValueChange={(value: 'master_db' | 'cdb') => setNewParameter({...newParameter, efSource: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="master_db">Master DB</SelectItem>
                                  <SelectItem value="cdb">Client DB (CDB)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>EF Category</Label>
                              <Select value={newParameter.efCategory} onValueChange={(value) => setNewParameter({...newParameter, efCategory: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {efCategories.map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>Search & Select EF</Label>
                            <div className="relative">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search by EF name or UID..."
                                value={efSearchTerm}
                                onChange={(e) => {
                                  setEfSearchTerm(e.target.value);
                                  searchEF(e.target.value, newParameter.efSource);
                                }}
                                className="pl-10"
                              />
                            </div>
                            
                            {efSearchResults.length > 0 && (
                              <div className="mt-2 border rounded-lg max-h-32 overflow-y-auto">
                                {efSearchResults.map(ef => (
                                  <div 
                                    key={ef.id}
                                    className={`p-2 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${selectedEF?.id === ef.id ? 'bg-emerald-50' : ''}`}
                                    onClick={() => {
                                      setSelectedEF(ef);
                                      setNewParameter({...newParameter, efUID: ef.uid, unit: ef.unit});
                                      setEfSearchTerm(ef.name);
                                      setEfSearchResults([]);
                                    }}
                                  >
                                    <div className="flex justify-between">
                                      <span className="font-medium text-sm">{ef.name}</span>
                                      <span className="text-xs text-gray-500">{ef.uid}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {ef.value} {ef.unit}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {selectedEF && (
                              <div className="mt-2 p-3 bg-emerald-50 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-sm">{selectedEF.name}</div>
                                    <div className="text-xs text-gray-600">{selectedEF.uid}</div>
                                    <div className="text-xs text-emerald-700 font-medium">
                                      Value: {selectedEF.value} {selectedEF.unit}
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedEF(null);
                                      setEfSearchTerm('');
                                      setNewParameter({...newParameter, efUID: '', unit: ''});
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {newParameter.parameterType === 'constant' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Constant Value *</Label>
                              <Input
                                value={newParameter.constantValue}
                                onChange={(e) => setNewParameter({...newParameter, constantValue: e.target.value})}
                                placeholder="25"
                              />
                            </div>
                            <div>
                              <Label>Constant Description</Label>
                              <Input
                                value={newParameter.constantDescription}
                                onChange={(e) => setNewParameter({...newParameter, constantDescription: e.target.value})}
                                placeholder="e.g., IPCC AR5 GWP value"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newParameter.description}
                          onChange={(e) => setNewParameter({...newParameter, description: e.target.value})}
                          placeholder="Describe this parameter's purpose and usage"
                          className="h-20"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <Button onClick={addParameter} className="bg-emerald-600 hover:bg-emerald-700">
                          {editingParameterId ? 'Update Parameter' : 'Add Parameter'}
                        </Button>
                        <Button variant="outline" onClick={resetParameterForm}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Expression Tab */}
            <TabsContent value="expression" className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-1">
                <div>
                  <h3 className="text-lg font-medium mb-2">Mathematical Expression</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Define the mathematical formula using the parameters above. Changes will create a new version.
                  </p>
                </div>

                {/* Expression Editor */}
                <div>
                  <Label htmlFor="expression">Mathematical Expression *</Label>
                  <div className="relative">
                    <Textarea
                      ref={expressionTextareaRef}
                      id="expression"
                      value={versionFormData.expression}
                      onChange={(e) => {
                        setVersionFormData({...versionFormData, expression: e.target.value});
                        setExpressionCursorPosition(e.target.selectionStart);
                      }}
                      placeholder="Enter mathematical expression using parameter names..."
                      className="font-mono text-sm h-32"
                      onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          const start = e.currentTarget.selectionStart;
                          const end = e.currentTarget.selectionEnd;
                          const value = e.currentTarget.value;
                          const newValue = value.substring(0, start) + '  ' + value.substring(end);
                          setVersionFormData({...versionFormData, expression: newValue});
                          setTimeout(() => {
                            e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
                          }, 0);
                        }
                      }}
                    />
                  </div>
                  
                  {/* Parameter suggestions */}
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-2">Available parameters:</div>
                    <div className="flex flex-wrap gap-1">
                      {formData.parameters.map(param => (
                        <Button
                          key={param.id}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => {
                            const textarea = expressionTextareaRef.current;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const currentValue = versionFormData.expression;
                              const newValue = currentValue.substring(0, start) + param.name + currentValue.substring(end);
                              setVersionFormData({...versionFormData, expression: newValue});
                              setTimeout(() => {
                                textarea.focus();
                                textarea.selectionStart = textarea.selectionEnd = start + param.name.length;
                              }, 0);
                            }
                          }}
                        >
                          {param.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Expression validation */}
                  {!expressionValidation.isValid && expressionValidation.errors.length > 0 && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Expression Errors:</span>
                      </div>
                      <ul className="text-sm text-red-700 space-y-1">
                        {expressionValidation.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Version Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sourceName">Source Name</Label>
                    <Input
                      id="sourceName"
                      value={versionFormData.sourceName}
                      onChange={(e) => setVersionFormData({...versionFormData, sourceName: e.target.value})}
                      placeholder="e.g., IPCC 2006 Guidelines"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sourceURL">Source URL</Label>
                    <Input
                      id="sourceURL"
                      value={versionFormData.sourceURL}
                      onChange={(e) => setVersionFormData({...versionFormData, sourceURL: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="sourceType">Source Type</Label>
                    <Select value={versionFormData.sourceType} onValueChange={(value: 'primary' | 'secondary' | 'tertiary') => setVersionFormData({...versionFormData, sourceType: value})}>
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
                  <div>
                    <Label htmlFor="algorithmType">Algorithm Type</Label>
                    <Select value={versionFormData.algorithmType} onValueChange={(value: 'linear' | 'logarithmic' | 'polynomial' | 'custom') => setVersionFormData({...versionFormData, algorithmType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {algorithmTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="validationStatus">Validation Status</Label>
                    <Select value={versionFormData.validationStatus} onValueChange={(value: 'pending' | 'validated' | 'rejected') => setVersionFormData({...versionFormData, validationStatus: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {validationStatuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="applicationScope">Application Scope</Label>
                  <Textarea
                    id="applicationScope"
                    value={versionFormData.applicationScope}
                    onChange={(e) => setVersionFormData({...versionFormData, applicationScope: e.target.value})}
                    placeholder="Describe where and how this formula should be applied..."
                    className="h-20"
                  />
                </div>

                {/* Current Expression Preview */}
                {versionFormData.expression && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Expression Preview:</div>
                    <code className="text-sm font-mono bg-white p-3 rounded border block overflow-x-auto">
                      {versionFormData.expression}
                    </code>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t pt-4 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-emerald-600 hover:bg-emerald-700">
              Update Formula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}