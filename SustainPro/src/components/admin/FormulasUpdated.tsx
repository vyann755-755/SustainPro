import React, { useState } from 'react';
import exampleImage from 'figma:asset/36717a6cf26e300fea13b15fbdb3ecb1403193a5.png';
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

// Mock data with enhanced parameters
const mockFormulas: Formula[] = [
  {
    id: '1',
    uid: 'FML-TRA-2024-001',
    name: 'Transport Emission Calculation',
    description: 'Calculate emissions from transportation activities using distance, fuel efficiency, and emission factors',
    category: 'Transport',
    latestVersion: '1.0',
    parameters: [
      { 
        id: '1', 
        name: 'distance', 
        type: 'number', 
        unit: 'km', 
        defaultValue: 0, 
        required: true,
        description: 'Total distance traveled (user input)',
        minValue: 0
      },
      { 
        id: '2', 
        name: 'fuel_efficiency', 
        type: 'number', 
        unit: 'L/100km', 
        defaultValue: 8, 
        required: true,
        description: 'Vehicle fuel efficiency (user input)',
        minValue: 0.1
      },
      { 
        id: '3', 
        name: 'emission_factor', 
        type: 'number', 
        unit: 'kg CO2e/L', 
        defaultValue: 2.31, 
        required: true,
        description: 'Fuel emission factor from Master DB'
      },
      { 
        id: '4', 
        name: 'conversion_factor', 
        type: 'number', 
        unit: '', 
        defaultValue: 100, 
        required: true,
        description: 'Fixed conversion factor (constant)'
      }
    ],
    tags: ['transport', 'fuel', 'scope-1', 'mobile'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    versions: [
      {
        id: 'v1',
        versionUID: 'FML-TRA-2024-001-V1.0',
        parentUID: 'FML-TRA-2024-001',
        version: '1.0',
        expression: '(distance * fuel_efficiency / conversion_factor) * emission_factor',
        parameters: [],
        sourceName: 'IPCC 2006 Guidelines',
        sourceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        sourceType: 'primary',
        algorithmType: 'linear',
        applicationScope: 'Road transport emissions',
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
    name: 'Energy Consumption Analysis',
    description: 'Calculate carbon emissions from electricity consumption with user-defined parameters',
    category: 'Energy',
    latestVersion: '1.0',
    parameters: [
      { 
        id: '5', 
        name: 'energy_consumed', 
        type: 'number', 
        unit: 'kWh', 
        defaultValue: 0, 
        required: true,
        description: 'Monthly energy consumption (user input)',
        minValue: 0
      },
      { 
        id: '6', 
        name: 'building_efficiency', 
        type: 'number', 
        unit: 'ratio', 
        defaultValue: 0.85, 
        required: false,
        description: 'Building energy efficiency rating (user input)',
        minValue: 0.1,
        maxValue: 1.0
      },
      { 
        id: '7', 
        name: 'seasonal_factor', 
        type: 'number', 
        unit: 'multiplier', 
        defaultValue: 1.2, 
        required: false,
        description: 'Seasonal adjustment factor (user input)',
        minValue: 0.5,
        maxValue: 2.0
      }
    ],
    tags: ['energy', 'electricity', 'scope-2', 'building'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-16T14:30:00Z',
    versions: [
      {
        id: 'v2',
        versionUID: 'FML-ENE-2024-002-V1.0',
        parentUID: 'FML-ENE-2024-002',
        version: '1.0',
        expression: 'energy_consumed * building_efficiency * seasonal_factor',
        parameters: [],
        sourceName: 'ISO 14040:2006',
        sourceURL: 'https://www.iso.org/standard/37456.html',
        sourceType: 'primary',
        algorithmType: 'linear',
        applicationScope: 'Building energy consumption',
        validationStatus: 'validated',
        isActive: true,
        createdAt: '2024-01-16T14:30:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '3',
    uid: 'FML-IND-2024-003',
    name: 'Steel Production Emissions',
    description: 'Calculate emissions from steel production using emission factors from Master DB and CDB',
    category: 'Industrial Process',
    latestVersion: '1.0',
    parameters: [
      { 
        id: '8', 
        name: 'steel_production_ef', 
        type: 'number', 
        unit: 'kg CO2e/kg', 
        defaultValue: 1.85, 
        required: true,
        description: 'Steel production emission factor (from Master DB - EF-IND-2024-001)'
      },
      { 
        id: '9', 
        name: 'grid_electricity_ef', 
        type: 'number', 
        unit: 'kg CO2e/kWh', 
        defaultValue: 0.42, 
        required: true,
        description: 'Regional grid electricity factor (from CDB - EF-ELE-2024-001)'
      },
      { 
        id: '10', 
        name: 'process_heat_ef', 
        type: 'number', 
        unit: 'kg CO2e/MJ', 
        defaultValue: 0.067, 
        required: true,
        description: 'Process heat emission factor (from Master DB - EF-IND-2024-002)'
      }
    ],
    tags: ['industrial', 'steel', 'scope-1', 'scope-2', 'manufacturing'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-17T09:15:00Z',
    versions: [
      {
        id: 'v3',
        versionUID: 'FML-IND-2024-003-V1.0',
        parentUID: 'FML-IND-2024-003',
        version: '1.0',
        expression: 'steel_production_ef + (grid_electricity_ef * 2.5) + (process_heat_ef * 15)',
        parameters: [],
        sourceName: 'World Steel Association Guidelines',
        sourceURL: 'https://www.worldsteel.org/',
        sourceType: 'secondary',
        algorithmType: 'linear',
        applicationScope: 'Steel manufacturing processes',
        validationStatus: 'pending',
        isActive: true,
        createdAt: '2024-01-17T09:15:00Z',
        createdBy: 'admin'
      }
    ]
  },
  {
    id: '4',
    uid: 'FML-WAS-2024-004',
    name: 'Waste Treatment Constants',
    description: 'Calculate waste treatment emissions using fixed constants and standard factors',
    category: 'Waste',
    latestVersion: '1.0',
    parameters: [
      { 
        id: '11', 
        name: 'standard_density', 
        type: 'number', 
        unit: 'kg/m³', 
        defaultValue: 1000, 
        required: true,
        description: 'Standard water density (fixed constant)'
      },
      { 
        id: '12', 
        name: 'methane_gwp', 
        type: 'number', 
        unit: 'kg CO2e/kg CH4', 
        defaultValue: 25, 
        required: true,
        description: 'Global Warming Potential of methane (IPCC constant)'
      },
      { 
        id: '13', 
        name: 'conversion_ratio', 
        type: 'number', 
        unit: 'ratio', 
        defaultValue: 0.001, 
        required: true,
        description: 'Unit conversion ratio (mathematical constant)'
      },
      { 
        id: '14', 
        name: 'atmospheric_pressure', 
        type: 'number', 
        unit: 'kPa', 
        defaultValue: 101.325, 
        required: true,
        description: 'Standard atmospheric pressure (physical constant)'
      }
    ],
    tags: ['waste', 'landfill', 'scope-1', 'methane', 'constants'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-18T11:45:00Z',
    versions: [
      {
        id: 'v4',
        versionUID: 'FML-WAS-2024-004-V1.0',
        parentUID: 'FML-WAS-2024-004',
        version: '1.0',
        expression: '(standard_density * conversion_ratio * methane_gwp) / atmospheric_pressure',
        parameters: [],
        sourceName: 'IPCC AR5 Guidelines',
        sourceURL: 'https://www.ipcc.ch/report/ar5/',
        sourceType: 'primary',
        algorithmType: 'linear',
        applicationScope: 'Waste treatment facilities',
        validationStatus: 'validated',
        isActive: true,
        createdAt: '2024-01-18T11:45:00Z',
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
  
  // Formula Definition Fields (renamed from custom fields)
  const [definitionFields, setDefinitionFields] = useState<FormulaDefinitionField[]>([
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

  const addDefinitionField = () => {
    if (!newFieldName.trim()) {
      toast.error('Field name is required');
      return;
    }

    const newField: FormulaDefinitionField = {
      id: Date.now().toString(),
      name: newFieldName,
      type: newFieldType,
      required: newFieldRequired,
      options: newFieldType === 'dropdown' ? newFieldOptions.split(',').map(opt => opt.trim()).filter(Boolean) : undefined
    };

    setDefinitionFields([...definitionFields, newField]);
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptions('');
    
    setIsDefinitionFieldDialogOpen(false);
    toast.success(`Definition field "${newField.name}" added`);
  };

  const removeDefinitionField = (fieldId: string) => {
    setDefinitionFields(definitionFields.filter(field => field.id !== fieldId));
    toast.success('Definition field removed');
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

  const handleEdit = () => {
    if (!editingFormula) return;

    const updatedFormula: Formula = {
      ...editingFormula,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      parameters: formData.parameters as FormulaParameter[],
      tags: formData.tags,
      customAttributes: formData.definitionFieldValues
    };

    setFormulas(formulas.map(f => f.id === editingFormula.id ? updatedFormula : f));
    setIsEditDialogOpen(false);
    setEditingFormula(null);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: [],
      parameters: [],
      definitionFieldValues: {}
    });
    
    toast.success(`Formula "${updatedFormula.name}" updated successfully`);
  };

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
    setIsEditDialogOpen(true);
  };

  const renderDefinitionFieldInput = (field: FormulaDefinitionField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={formData.definitionFieldValues[field.id] || ''}
            onChange={(e) => setFormData({
              ...formData,
              definitionFieldValues: {
                ...formData.definitionFieldValues,
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
            value={formData.definitionFieldValues[field.id] || ''}
            onChange={(e) => setFormData({
              ...formData,
              definitionFieldValues: {
                ...formData.definitionFieldValues,
                [field.id]: e.target.value
              }
            })}
            placeholder="0"
          />
        );
      
      case 'dropdown':
        return (
          <Select 
            value={formData.definitionFieldValues[field.id] || ''} 
            onValueChange={(value) => setFormData({
              ...formData,
              definitionFieldValues: {
                ...formData.definitionFieldValues,
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
              checked={formData.definitionFieldValues[field.id] || false}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                definitionFieldValues: {
                  ...formData.definitionFieldValues,
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
            value={formData.definitionFieldValues[field.id] || ''}
            onChange={(e) => setFormData({
              ...formData,
              definitionFieldValues: {
                ...formData.definitionFieldValues,
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

  // Expression handling functions
  const getParameterSuggestions = (query: string) => {
    if (!selectedFormula || !query.trim()) return [];
    
    return selectedFormula.parameters
      .filter(param => param.name.toLowerCase().includes(query.toLowerCase()))
      .map(param => ({
        name: param.name,
        type: param.type,
        unit: param.unit || ''
      }));
  };

  const handleExpressionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const textarea = e.target;
    
    console.log('Expression changed:', value);
    
    setVersionFormData({
      ...versionFormData,
      expression: value
    });

    // Get cursor position and extract current word
    const cursorPos = textarea.selectionStart;
    setExpressionCursorPosition(cursorPos);
    
    console.log('Cursor at position:', cursorPos);
    
    const textBeforeCursor = value.substring(0, cursorPos);
    const separatorRegex = /[\s+\-*/()=<>!&|,]/;
    
    // Find the current word being typed
    let wordStart = cursorPos;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (separatorRegex.test(textBeforeCursor[i])) {
        wordStart = i + 1;
        break;
      }
      if (i === 0) {
        wordStart = 0;
      }
    }
    
    const currentWord = value.substring(wordStart, cursorPos);
    console.log('Current word:', currentWord);

    if (currentWord.length > 0 && /^[a-zA-Z_]/.test(currentWord)) {
      const suggestions = getParameterSuggestions(currentWord);
      console.log('Found suggestions:', suggestions);
      setExpressionSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertParameterAtCursor = (parameterName: string) => {
    const textarea = expressionTextareaRef.current;
    if (!textarea) {
      console.log('Textarea ref not found');
      return;
    }

    // Force focus first to ensure we have the current cursor position
    textarea.focus();
    
    // Use the current selection position from the focused textarea
    const cursorPos = textarea.selectionStart;
    const currentExpression = versionFormData.expression;
    
    console.log('Inserting parameter:', parameterName, 'at position:', cursorPos);
    
    const newExpression = 
      currentExpression.substring(0, cursorPos) + 
      parameterName + 
      currentExpression.substring(cursorPos);
    
    setVersionFormData({
      ...versionFormData,
      expression: newExpression
    });
    
    // Set cursor position after the inserted parameter
    requestAnimationFrame(() => {
      const newCursorPos = cursorPos + parameterName.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      console.log('Cursor set to position:', newCursorPos);
    });
  };

  const insertParameterSuggestion = (parameterName: string) => {
    const textarea = expressionTextareaRef.current;
    if (!textarea) {
      console.log('Textarea ref not found for suggestion');
      return;
    }

    const currentExpression = versionFormData.expression;
    
    // Use the current cursor position from the textarea
    textarea.focus();
    const cursorPos = textarea.selectionStart;
    
    console.log('Replacing suggestion:', parameterName, 'at cursor:', cursorPos);
    
    // Find the start of the current word being typed
    const textBeforeCursor = currentExpression.substring(0, cursorPos);
    const separatorRegex = /[\s+\-*/()=<>!&|,]/;
    
    // Find the start of the current word
    let wordStartPos = cursorPos;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (separatorRegex.test(textBeforeCursor[i])) {
        wordStartPos = i + 1;
        break;
      }
      if (i === 0) {
        wordStartPos = 0;
      }
    }
    
    console.log('Word starts at:', wordStartPos, 'current word:', textBeforeCursor.substring(wordStartPos));
    
    // Replace the current partial word with the parameter name
    const newExpression = 
      currentExpression.substring(0, wordStartPos) + 
      parameterName + 
      currentExpression.substring(cursorPos);
    
    setVersionFormData({
      ...versionFormData,
      expression: newExpression
    });
    
    setShowSuggestions(false);
    
    // Set cursor position after the inserted parameter
    requestAnimationFrame(() => {
      const newCursorPos = wordStartPos + parameterName.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      console.log('Suggestion cursor set to:', newCursorPos);
    });
  };

  const validateExpression = () => {
    if (!selectedFormula || !versionFormData.expression.trim()) {
      setExpressionValidation({
        isValid: false,
        errors: ['Expression is required'],
        warnings: []
      });
      return;
    }

    const expression = versionFormData.expression.trim();
    const parameterNames = selectedFormula.parameters.map(p => p.name);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Extract all variables from the expression (letters/underscores that aren't operators)
    const variableRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const foundVariables = expression.match(variableRegex) || [];
    const uniqueVariables = [...new Set(foundVariables)];

    // Check if all variables are from created parameters
    const invalidVariables = uniqueVariables.filter(variable => 
      !parameterNames.includes(variable) && 
      !['e', 'pi', 'sqrt', 'pow', 'log', 'ln', 'sin', 'cos', 'tan', 'abs', 'min', 'max'].includes(variable.toLowerCase())
    );

    if (invalidVariables.length > 0) {
      errors.push(`The following variables are not from created parameters: ${invalidVariables.join(', ')}. Please build the expression using only the parameters you created.`);
    }

    // Check for valid mathematical operators and structure
    const validOperatorRegex = /^[a-zA-Z0-9_+\-*/().=<>!&|,\s]+$/;
    if (!validOperatorRegex.test(expression)) {
      errors.push('Expression contains invalid characters. Only letters, numbers, and mathematical operators (+, -, *, /, (), =, <, >, !, &, |) are allowed.');
    }

    // Check for balanced parentheses
    let parenCount = 0;
    for (const char of expression) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (parenCount < 0) {
        errors.push('Unmatched closing parenthesis in expression.');
        break;
      }
    }
    if (parenCount > 0) {
      errors.push('Unmatched opening parenthesis in expression.');
    }

    // Check for numeric constants (warn but don't error)
    const numericConstantRegex = /\b\d+\.?\d*\b/g;
    const numericConstants = expression.match(numericConstantRegex) || [];
    if (numericConstants.length > 0) {
      warnings.push(`Found numeric constants: ${numericConstants.join(', ')}. Consider creating Constant Parameters for better maintainability.`);
    }

    // Check if any created parameters are unused
    const unusedParameters = parameterNames.filter(param => !uniqueVariables.includes(param));
    if (unusedParameters.length > 0) {
      warnings.push(`Unused parameters: ${unusedParameters.join(', ')}. These parameters are defined but not used in the expression.`);
    }

    const isValid = errors.length === 0;
    setExpressionValidation({ isValid, errors, warnings });

    if (isValid) {
      toast.success('Expression validation passed!');
    } else {
      toast.error('Expression validation failed. Please check the errors below.');
    }
  };

  const handleCreateVersion = () => {
    if (!selectedFormula || !versionFormData.expression || !versionFormData.sourceName) {
      toast.error('Please fill in all required version fields');
      return;
    }

    // Validate expression before creating version
    validateExpression();
    if (!expressionValidation.isValid && expressionValidation.errors.length > 0) {
      toast.error('Please fix expression validation errors before creating the version');
      return;
    }

    const versionNumber = selectedFormula.versions.length === 0 ? '1.0' : 
      `${selectedFormula.versions.length + 1}.0`;
    
    const versionUID = generateVersionUID(selectedFormula.uid, versionNumber);

    const newVersion: FormulaVersion = {
      id: Date.now().toString(),
      versionUID,
      parentUID: selectedFormula.uid,
      version: versionNumber,
      expression: versionFormData.expression,
      parameters: selectedFormula.parameters,
      sourceName: versionFormData.sourceName,
      sourceURL: versionFormData.sourceURL,
      sourceType: versionFormData.sourceType,
      algorithmType: versionFormData.algorithmType,
      applicationScope: versionFormData.applicationScope,
      validationStatus: versionFormData.validationStatus,
      notes: versionFormData.notes,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    };

    const updatedFormula = {
      ...selectedFormula,
      versions: [...selectedFormula.versions, newVersion],
      latestVersion: versionNumber,
      status: 'active' as const
    };

    setFormulas(formulas.map(f => 
      f.id === selectedFormula.id ? updatedFormula : f
    ));

    setIsVersionDialogOpen(false);
    setSelectedFormula(null);
    
    // Reset version form and validation
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
    
    toast.success(`Version ${versionNumber} created — UID ${versionUID}`);
  };

  const handleDelete = (formula: Formula) => {
    setFormulas(formulas.filter(item => item.id !== formula.id));
    toast.success(`Formula ${formula.uid} deleted successfully`);
  };

  const copyUID = (uid: string) => {
    navigator.clipboard.writeText(uid);
    toast.success('UID copied to clipboard');
  };

  const renderParameterBadge = (param: EnhancedFormulaParameter) => {
    const info = parameterTypeInfo[param.parameterType];
    const Icon = info.icon;
    
    return (
      <div className="flex items-center gap-2">
        <Badge className={info.badge}>
          <Icon className="h-3 w-3 mr-1" />
          {info.title}
        </Badge>
        {param.parameterType === 'ef_value' && param.efSource && (
          <Badge variant="outline" className="text-xs">
            {param.efSource === 'master_db' ? 'Master DB' : 'CDB'}
          </Badge>
        )}
        {param.parameterType === 'constant' && (
          <Badge variant="outline" className="text-xs">
            Value: {param.constantValue}
          </Badge>
        )}
      </div>
    );
  };

  const renderParameterTypeSpecificFields = () => {
    switch (newParameter.parameterType) {
      case 'formula_parameter':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Value (optional)</Label>
                <Input
                  type="number"
                  value={newParameter.minValue}
                  onChange={(e) => setNewParameter({
                    ...newParameter,
                    minValue: e.target.value
                  })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Max Value (optional)</Label>
                <Input
                  type="number"
                  value={newParameter.maxValue}
                  onChange={(e) => setNewParameter({
                    ...newParameter,
                    maxValue: e.target.value
                  })}
                  placeholder="100"
                />
              </div>
            </div>
            <div>
              <Label>Default Value</Label>
              <Input
                type={newParameter.type === 'number' ? 'number' : 'text'}
                value={newParameter.defaultValue}
                onChange={(e) => setNewParameter({
                  ...newParameter,
                  defaultValue: e.target.value
                })}
                placeholder={newParameter.type === 'number' ? '0' : 'Default text'}
              />
            </div>
          </div>
        );

      case 'ef_value':
        return (
          <div className="space-y-4">
            <div>
              <Label>EF Source *</Label>
              <Select 
                value={newParameter.efSource} 
                onValueChange={(value: 'master_db' | 'cdb') => {
                  setNewParameter({
                    ...newParameter,
                    efSource: value
                  });
                  setSelectedEF(null);
                  setEfSearchTerm('');
                  setEfSearchResults([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="master_db">Master DB - Emission Factors</SelectItem>
                  <SelectItem value="cdb">Client Database (CDB)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Search EF *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={efSearchTerm}
                  onChange={(e) => {
                    setEfSearchTerm(e.target.value);
                    searchEF(e.target.value, newParameter.efSource);
                  }}
                  placeholder="Search EF by name or UID..."
                  className="pl-10"
                />
              </div>
              
              {efSearchResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {efSearchResults.map(ef => (
                    <div 
                      key={ef.id}
                      className={`p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                        selectedEF?.id === ef.id ? 'bg-emerald-50 border-emerald-200' : ''
                      }`}
                      onClick={() => setSelectedEF(ef)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{ef.name}</div>
                          <div className="text-xs text-gray-500">{ef.uid}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {ef.value} {ef.unit}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedEF && (
              <div>
                <Label>Selected EF Value</Label>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{selectedEF.name}</div>
                      <div className="text-sm text-gray-600">{selectedEF.uid}</div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800">
                      {selectedEF.value} {selectedEF.unit}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label>EF Definition/Notes (optional)</Label>
              <Textarea
                value={newParameter.efDefinition}
                onChange={(e) => setNewParameter({
                  ...newParameter,
                  efDefinition: e.target.value
                })}
                placeholder="Optional notes about this EF parameter usage"
                rows={3}
              />
            </div>
          </div>
        );

      case 'constant':
        return (
          <div className="space-y-4">
            <div>
              <Label>Constant Value *</Label>
              <Input
                type={newParameter.type === 'number' ? 'number' : 'text'}
                value={newParameter.constantValue}
                onChange={(e) => setNewParameter({
                  ...newParameter,
                  constantValue: e.target.value
                })}
                placeholder={newParameter.type === 'number' ? '1.0' : 'Constant text value'}
              />
            </div>
            
            <div>
              <Label>Constant Description</Label>
              <Textarea
                value={newParameter.constantDescription}
                onChange={(e) => setNewParameter({
                  ...newParameter,
                  constantDescription: e.target.value
                })}
                placeholder="Describe the purpose and meaning of this constant"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="h-8 w-8 text-emerald-600" />
            Master DB - Formulas
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage mathematical formulas with comprehensive parameter systems
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Formula
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All DBs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Databases</SelectItem>
                <SelectItem value="master">Master DB</SelectItem>
                <SelectItem value="client">Client DB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hierarchical Formula List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Formula Definitions → Versions → Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFormulas.map((formula) => (
              <div key={formula.id} className="border rounded-lg">
                {/* Formula Level */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFormulaExpansion(formula.id)}
                      >
                        <ChevronRight className={`h-4 w-4 transition-transform ${
                          expandedFormulas.has(formula.id) ? 'rotate-90' : ''
                        }`} />
                      </Button>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{formula.name}</h3>
                          <Badge 
                            className="bg-emerald-100 text-emerald-800 cursor-pointer hover:bg-emerald-200"
                            onClick={() => copyUID(formula.uid)}
                          >
                            {formula.uid}
                          </Badge>
                          <Badge 
                            variant={formula.status === 'active' ? 'default' : 'secondary'}
                            className={formula.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {formula.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{formula.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Category:</span>
                          <Badge variant="outline" className="text-xs">{formula.category}</Badge>
                          <span className="text-xs text-gray-500">Parameters:</span>
                          <Badge variant="outline" className="text-xs">{formula.parameters.length}</Badge>
                          <span className="text-xs text-gray-500">Latest:</span>
                          <Badge variant="outline" className="text-xs">v{formula.latestVersion || '0.0'}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(formula)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedFormulas.has(formula.id) && (
                  <div className="p-4">
                    {/* Versions */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Versions ({formula.versions.length})
                      </h4>
                      {formula.versions.map((version) => (
                        <div key={version.id} className="ml-6 border-l-2 border-emerald-200 pl-4 pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-blue-100 text-blue-800">v{version.version}</Badge>
                            <Badge 
                              className="bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200"
                              onClick={() => copyUID(version.versionUID)}
                            >
                              {version.versionUID}
                            </Badge>
                            <Badge 
                              variant={version.validationStatus === 'validated' ? 'default' : 'secondary'}
                              className={version.validationStatus === 'validated' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {version.validationStatus}
                            </Badge>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md mb-3">
                            <Label className="text-sm font-medium">Mathematical Expression:</Label>
                            <div className="font-mono text-sm bg-white p-2 rounded border mt-1">
                              {version.expression}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-xs font-medium text-gray-600">Source:</Label>
                              <p>{version.sourceName}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-600">Algorithm:</Label>
                              <p>{version.algorithmType}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-600">Application:</Label>
                              <p>{version.applicationScope}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-600">Created:</Label>
                              <p>{new Date(version.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {formula.versions.length === 0 && (
                        <div className="ml-6 text-gray-500 text-sm">No versions created yet</div>
                      )}
                    </div>

                    {/* Parameters */}
                    <div>
                      <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Parameters ({formula.parameters.length})
                      </h4>
                      
                      {formula.parameters.map((param) => (
                        <div key={param.id} className="ml-6 bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{param.name}</span>
                              {param.unit && (
                                <Badge variant="outline" className="text-xs">
                                  {param.unit}
                                </Badge>
                              )}
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Default: <span className="font-mono">{param.defaultValue}</span>
                            </div>
                          </div>
                          {param.description && (
                            <p className="text-sm text-gray-600">{param.description}</p>
                          )}
                        </div>
                      ))}
                      
                      {formula.parameters.length === 0 && (
                        <div className="ml-6 text-gray-500 text-sm">No parameters defined yet</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredFormulas.length === 0 && (
              <div className="text-center py-12">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No formulas found</h3>
                <p className="text-gray-600">Get started by creating your first formula.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Formula Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Create New Formula
            </DialogTitle>
            <DialogDescription>
              Define a new mathematical formula with comprehensive parameter management
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Formula Definition */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Formula Definition
                </h3>
                <Button 
                  onClick={() => setIsDefinitionFieldDialogOpen(true)} 
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Core Formula Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Formula Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Transport Emission Calculation"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this formula calculates and how it works"
                    rows={3}
                  />
                </div>

                {/* Custom Definition Fields */}
                {definitionFields.map(field => (
                  <div key={field.id}>
                    <Label>
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderDefinitionFieldInput(field)}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Parameter Types Info Cards */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Parameter Types
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(parameterTypeInfo).map(([type, info]) => {
                  const Icon = info.icon;
                  return (
                    <Card 
                      key={type} 
                      className="border-2 border-gray-200 hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group"
                      onClick={() => {
                        setNewParameter({
                          ...newParameter,
                          parameterType: type as FormulaParameterType
                        });
                        setShowParameterForm(true);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className={`p-2 rounded-lg ${info.color} group-hover:scale-110 transition-transform`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm group-hover:text-emerald-700 transition-colors">{info.title}</h4>
                            <p className="text-xs text-gray-600 mt-1 leading-tight group-hover:text-gray-700">{info.description}</p>
                            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-emerald-600 font-medium">Click to add →</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Parameters Management */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Add Parameters ({formData.parameters.length})
                </h3>
                {!showParameterForm && (
                  <Button 
                    onClick={() => setShowParameterForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Parameter
                  </Button>
                )}
              </div>

              {/* Existing Parameters */}
              {formData.parameters.length > 0 && (
                <div className="space-y-3 mb-6">
                  {formData.parameters.map((param) => (
                    <div key={param.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{param.name}</span>
                            {renderParameterBadge(param)}
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Type: <span className="font-medium">{param.type}</span> 
                              {param.unit && <span> ({param.unit})</span>}
                            </div>
                            {param.description && (
                              <div>Description: {param.description}</div>
                            )}
                            
                            {/* Parameter-specific details */}
                            {param.parameterType === 'ef_value' && (
                              <div className="mt-2 text-xs bg-emerald-50 p-2 rounded">
                                <div><strong>EF Source:</strong> {param.efSource === 'master_db' ? 'Master DB' : 'CDB'}</div>
                                {param.efUID && <div><strong>EF UID:</strong> {param.efUID}</div>}
                                <div><strong>Value:</strong> {param.defaultValue} {param.unit}</div>
                              </div>
                            )}
                            
                            {param.parameterType === 'constant' && (
                              <div className="mt-2 text-xs bg-purple-50 p-2 rounded">
                                <div><strong>Constant Value:</strong> {param.constantValue}</div>
                                {param.constantDescription && (
                                  <div><strong>Description:</strong> {param.constantDescription}</div>
                                )}
                              </div>
                            )}
                            
                            {param.parameterType === 'formula_parameter' && (
                              <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                                <div><strong>Default:</strong> {param.defaultValue}</div>
                                {(param.minValue !== undefined || param.maxValue !== undefined) && (
                                  <div><strong>Range:</strong> {param.minValue || 'No min'} - {param.maxValue || 'No max'}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editParameter(param)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeParameter(param.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Parameter Form */}
              {showParameterForm && (
                <Card className="border-2 border-emerald-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        {editingParameterId ? 'Edit Parameter' : 'Add New Parameter'}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetParameterForm}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Parameter Type Selection */}
                    <div>
                      <Label>Parameter Type *</Label>
                      <Select 
                        value={newParameter.parameterType} 
                        onValueChange={(value: FormulaParameterType) => setNewParameter({
                          ...newParameter,
                          parameterType: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formula_parameter">
                            <div className="flex items-center gap-2">
                              <Variable className="h-4 w-4" />
                              Formula Parameters
                            </div>
                          </SelectItem>
                          <SelectItem value="ef_value">
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              EF Parameters
                            </div>
                          </SelectItem>
                          <SelectItem value="constant">
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Constant Parameters
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Basic Parameter Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Parameter Name *</Label>
                        <Input
                          value={newParameter.name}
                          onChange={(e) => setNewParameter({
                            ...newParameter,
                            name: e.target.value
                          })}
                          placeholder="e.g., distance, emission_factor, conversion_rate"
                        />
                      </div>
                      
                      <div>
                        <Label>Data Type</Label>
                        <Select 
                          value={newParameter.type} 
                          onValueChange={(value: 'number' | 'string' | 'boolean') => setNewParameter({
                            ...newParameter,
                            type: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="string">Text</SelectItem>
                            <SelectItem value="boolean">True/False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {newParameter.parameterType !== 'ef_value' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Unit (optional)</Label>
                          <Input
                            value={newParameter.unit || ''}
                            onChange={(e) => setNewParameter({
                              ...newParameter,
                              unit: e.target.value
                            })}
                            placeholder="e.g., km, kg, kWh, L"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={newParameter.required}
                            onCheckedChange={(checked) => setNewParameter({
                              ...newParameter,
                              required: checked as boolean
                            })}
                          />
                          <Label>Required Parameter</Label>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newParameter.description || ''}
                        onChange={(e) => setNewParameter({
                          ...newParameter,
                          description: e.target.value
                        })}
                        placeholder="Describe how this parameter is used in the formula"
                        rows={2}
                      />
                    </div>

                    {/* Parameter Type Specific Fields */}
                    {renderParameterTypeSpecificFields()}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={resetParameterForm}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={addParameter}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {editingParameterId ? 'Update Parameter' : 'Add Parameter'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
              Create Formula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Definition Fields Management Dialog */}
      <Dialog open={isDefinitionFieldDialogOpen} onOpenChange={setIsDefinitionFieldDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Formula Definition Fields</DialogTitle>
            <DialogDescription>
              Add custom fields to capture additional formula metadata
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Existing Fields */}
            <div>
              <h4 className="font-medium mb-3">Current Definition Fields</h4>
              <div className="space-y-2">
                {definitionFields.map(field => (
                  <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{field.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                      {field.required && <Badge className="ml-2 text-xs">Required</Badge>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDefinitionField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Add New Field */}
            <div>
              <h4 className="font-medium mb-3">Add New Field</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Field Name</Label>
                    <Input
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="e.g., Algorithm Developer"
                    />
                  </div>
                  <div>
                    <Label>Field Type</Label>
                    <Select value={newFieldType} onValueChange={setNewFieldType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="boolean">Checkbox</SelectItem>
                        <SelectItem value="textarea">Text Area</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newFieldType === 'dropdown' && (
                  <div>
                    <Label>Dropdown Options (comma-separated)</Label>
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
                    onCheckedChange={setNewFieldRequired}
                  />
                  <Label>Required field</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDefinitionFieldDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={addDefinitionField}>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Creation Dialog */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Formula Version</DialogTitle>
            <DialogDescription>
              Add a mathematical expression and metadata for the formula
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Available Parameters Info */}
            {selectedFormula && selectedFormula.parameters.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Available Parameters ({selectedFormula.parameters.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFormula.parameters.map((param) => (
                    <button
                      key={param.id}
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm transition-colors cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        insertParameterAtCursor(param.name);
                      }}
                    >
                      <span className="font-mono">{param.name}</span>
                      {param.unit && (
                        <span className="text-xs opacity-75">({param.unit})</span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Click any parameter to insert it at cursor position, or type to get suggestions
                </p>
              </div>
            )}

            <div className="relative">
              <Label>Mathematical Expression *</Label>
              <div className="relative">
                <div className="relative">
                  <Textarea
                    ref={expressionTextareaRef}
                    value={versionFormData.expression}
                    onChange={handleExpressionChange}
                    onFocus={(e) => setExpressionCursorPosition(e.target.selectionStart)}
                    onKeyUp={(e) => setExpressionCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                    onClick={(e) => setExpressionCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    placeholder="Build your formula using the parameters defined above. Click parameter names or type to get suggestions."
                    rows={4}
                    className="font-mono resize-none pr-4"
                  />
                  
                  {/* Helper text */}
                  <div className="absolute top-2 right-2 text-xs text-gray-400">
                    <span>ESC to close suggestions</span>
                  </div>
                </div>
                
                {/* Parameter Suggestions Dropdown */}
                {showSuggestions && expressionSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {expressionSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50 border-b last:border-b-0 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur on textarea
                          insertParameterSuggestion(suggestion.name);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-medium text-gray-900">{suggestion.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.type}
                            </Badge>
                            {suggestion.unit && (
                              <Badge variant="outline" className="text-xs">
                                {suggestion.unit}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Validation Button */}
              <div className="flex items-center gap-3 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={validateExpression}
                  className="flex items-center gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Validate Expression
                </Button>
                
                {expressionValidation.errors.length === 0 && expressionValidation.warnings.length === 0 && versionFormData.expression.trim() && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready to use
                  </Badge>
                )}
              </div>

              {/* Validation Results */}
              {(expressionValidation.errors.length > 0 || expressionValidation.warnings.length > 0) && (
                <div className="mt-3 space-y-3">
                  {/* Errors */}
                  {expressionValidation.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-medium text-red-900 mb-1">Validation Errors</h5>
                          <ul className="text-sm text-red-800 space-y-1">
                            {expressionValidation.errors.map((error, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-red-600 mt-1">•</span>
                                <span>{error}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {expressionValidation.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-medium text-yellow-900 mb-1">Validation Warnings</h5>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            {expressionValidation.warnings.map((warning, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Expression Building Tips */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-3">Expression Building Tips:</h5>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500 mt-1">•</span>
                        <span><strong>Use standard mathematical operators:</strong> +, -, *, /, (), ^</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500 mt-1">•</span>
                        <span><strong>Parameter names are case-sensitive</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500 mt-1">•</span>
                        <span><strong>Functions available:</strong> sqrt(), log(), exp(), sin(), cos(), tan(), abs(), floor(), ceil(), round(), max(), min()</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500 mt-1">•</span>
                        <span><strong>Example:</strong> <code className="bg-gray-200 px-1 rounded text-xs font-mono">sqrt(param1^2 + param2^2)</code></span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Source Name *</Label>
                <Input
                  value={versionFormData.sourceName}
                  onChange={(e) => setVersionFormData({
                    ...versionFormData,
                    sourceName: e.target.value
                  })}
                  placeholder="e.g., IPCC 2006 Guidelines"
                />
              </div>
              <div>
                <Label>Source URL</Label>
                <Input
                  value={versionFormData.sourceURL}
                  onChange={(e) => setVersionFormData({
                    ...versionFormData,
                    sourceURL: e.target.value
                  })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Algorithm Type</Label>
                <Select
                  value={versionFormData.algorithmType}
                  onValueChange={(value: any) => setVersionFormData({
                    ...versionFormData,
                    algorithmType: value
                  })}
                >
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
                <Label>Validation Status</Label>
                <Select
                  value={versionFormData.validationStatus}
                  onValueChange={(value: any) => setVersionFormData({
                    ...versionFormData,
                    validationStatus: value
                  })}
                >
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
              <Label>Application Scope</Label>
              <Input
                value={versionFormData.applicationScope}
                onChange={(e) => setVersionFormData({
                  ...versionFormData,
                  applicationScope: e.target.value
                })}
                placeholder="e.g., Road transport emissions"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={versionFormData.notes}
                onChange={(e) => setVersionFormData({
                  ...versionFormData,
                  notes: e.target.value
                })}
                placeholder="Additional notes about this version..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVersion}>Create Version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}