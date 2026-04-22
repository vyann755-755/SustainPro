import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useMasterDB } from '../../contexts/MasterDBContext';
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
  HelpCircle
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

// Parameter types for formulas
type FormulaParameterType = 'formula_parameter' | 'ef_value' | 'constant';

// New Data Structure for Hierarchical Formula Flow
interface FormulaParameter {
  id: string;
  parentFormulaUID: string;
  name: string;
  type: 'number' | 'string' | 'boolean';
  unit?: string;
  defaultValue?: number | string | boolean;
  description?: string;
  required: boolean;
  minValue?: number;
  maxValue?: number;
  parameterType: FormulaParameterType;
  // For EF Value parameters
  efSource?: 'master_db' | 'cdb';
  efCategory?: string;
  efUID?: string;
  efDefinition?: string;
  // For constant parameters
  constantValue?: number | string;
  constantDescription?: string;
  versions: ParameterVersion[];
  createdAt: string;
  createdBy: string;
}

interface ParameterVersion {
  id: string;
  versionUID: string;
  parentParameterId: string;
  version: string;
  value: number | string | boolean;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  notes?: string;
}

interface FormulaExpression {
  id: string;
  parentFormulaUID: string;
  version: string;
  expression: string;
  sourceName: string;
  sourceURL?: string;
  sourceType: 'primary' | 'secondary' | 'tertiary';
  algorithmType: 'linear' | 'logarithmic' | 'polynomial' | 'custom';
  applicationScope: string;
  validationStatus: 'pending' | 'validated' | 'rejected';
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  notes?: string;
}

interface FormulaDefinition {
  id: string;
  uid: string;
  name: string;
  category: string;
  tags: string[];
  status: 'draft' | 'active' | 'archived';
  description: string;
  database: string;
  createdBy: string;
  createdAt: string;
  customAttributes?: Record<string, any>;
  parameters: FormulaParameter[];
  expressions: FormulaExpression[];
  latestVersion: string;
  updatedAt?: string;
  updatedBy?: string;
}

// UID Generation Helpers
const generateFormulaUID = (category: string, sequence: number): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  return `FML-${categoryCode}-${new Date().getFullYear()}-${sequence.toString().padStart(3, '0')}`;
};

const generateParameterUID = (parentFormulaUID: string, parameterName: string): string => {
  return `${parentFormulaUID}-${parameterName.toUpperCase()}`;
};

const generateVersionUID = (parentId: string, version: string): string => {
  return `${parentId}-V${version}`;
};

// Mock Data
const mockFormulaDefinitions: FormulaDefinition[] = [
  {
    id: '1',
    uid: 'FML-TRA-2024-001',
    name: 'Comprehensive Transport Emission Formula',
    category: 'Transport',
    tags: ['transport', 'fuel', 'scope-1', 'comprehensive'],
    status: 'active',
    description: 'Calculate total transport emissions combining user inputs, database emission factors, and scientific constants',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    latestVersion: '1.2',
    parameters: [
      {
        id: 'param1',
        parentFormulaUID: 'FML-TRA-2024-001',
        name: 'distance_traveled',
        type: 'number',
        unit: 'km',
        defaultValue: 0,
        description: 'Total distance traveled by vehicle',
        required: true,
        minValue: 0,
        parameterType: 'formula_parameter',
        versions: [
          {
            id: 'pv1',
            versionUID: 'param1-V1.0',
            parentParameterId: 'param1',
            version: '1.0',
            value: 0,
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
            createdBy: 'admin'
          }
        ],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param2',
        parentFormulaUID: 'FML-TRA-2024-001',
        name: 'fuel_emission_factor',
        type: 'number',
        unit: 'kg CO2e/L',
        defaultValue: 2.31,
        description: 'Gasoline combustion emission factor',
        required: true,
        parameterType: 'ef_value',
        efSource: 'master_db',
        efUID: 'EF-TRA-2024-001',
        efCategory: 'Transportation Fuels',
        versions: [
          {
            id: 'pv2',
            versionUID: 'param2-V1.0',
            parentParameterId: 'param2',
            version: '1.0',
            value: 2.31,
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
            createdBy: 'admin'
          }
        ],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param3',
        parentFormulaUID: 'FML-TRA-2024-001',
        name: 'methane_gwp',
        type: 'number',
        unit: 'kg CO2e/kg CH4',
        defaultValue: 25,
        description: 'Global Warming Potential of methane over 100 years',
        required: true,
        parameterType: 'constant',
        constantValue: 25,
        constantDescription: 'IPCC AR5 GWP value for methane',
        versions: [
          {
            id: 'pv3',
            versionUID: 'param3-V1.0',
            parentParameterId: 'param3',
            version: '1.0',
            value: 25,
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
            createdBy: 'admin'
          }
        ],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'exp1',
        parentFormulaUID: 'FML-TRA-2024-001',
        version: '1.2',
        expression: 'distance_traveled * fuel_emission_factor * methane_gwp',
        sourceName: 'IPCC 2006 Guidelines + Custom Analysis',
        sourceURL: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
        sourceType: 'primary',
        algorithmType: 'linear',
        applicationScope: 'Road transport emissions with methane consideration',
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
    category: 'Energy',
    tags: ['industrial', 'energy', 'scope-1', 'scope-2'],
    status: 'active',
    description: 'Calculate combined energy and process emissions for industrial facilities',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-16T14:30:00Z',
    latestVersion: '1.1',
    parameters: [
      {
        id: 'param4',
        parentFormulaUID: 'FML-ENE-2024-002',
        name: 'electricity_consumption',
        type: 'number',
        unit: 'kWh',
        defaultValue: 0,
        description: 'Monthly electricity consumption',
        required: true,
        minValue: 0,
        parameterType: 'formula_parameter',
        versions: [
          {
            id: 'pv4',
            versionUID: 'param4-V1.0',
            parentParameterId: 'param4',
            version: '1.0',
            value: 0,
            isActive: true,
            createdAt: '2024-01-16T14:30:00Z',
            createdBy: 'admin'
          }
        ],
        createdAt: '2024-01-16T14:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'param5',
        parentFormulaUID: 'FML-ENE-2024-002',
        name: 'grid_electricity_ef',
        type: 'number',
        unit: 'kg CO2e/kWh',
        defaultValue: 0.42,
        description: 'Regional electricity grid emission factor',
        required: true,
        parameterType: 'ef_value',
        efSource: 'master_db',
        efUID: 'EF-ELE-2024-001',
        efCategory: 'Electricity Grid Factors',
        versions: [
          {
            id: 'pv5',
            versionUID: 'param5-V1.0',
            parentParameterId: 'param5',
            version: '1.0',
            value: 0.42,
            isActive: true,
            createdAt: '2024-01-16T14:30:00Z',
            createdBy: 'admin'
          }
        ],
        createdAt: '2024-01-16T14:30:00Z',
        createdBy: 'admin'
      }
    ],
    expressions: [
      {
        id: 'exp2',
        parentFormulaUID: 'FML-ENE-2024-002',
        version: '1.1',
        expression: 'electricity_consumption * grid_electricity_ef',
        sourceName: 'ISO 14040:2006 + Industrial Energy Standards',
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

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  date: Calendar,
  dropdown: ChevronDown,
  boolean: Checkbox,
  textarea: Type
};

export function Formulas() {
  // Context
  const { getMasterEFsForAssignment } = useMasterDB();
  
  const [formulaDefinitions, setFormulaDefinitions] = useState<FormulaDefinition[]>(mockFormulaDefinitions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  
  // Expansion states for hierarchical table
  const [expandedFormulas, setExpandedFormulas] = useState<Set<string>>(new Set());
  const [expandedParameters, setExpandedParameters] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isCreateFormulaDialogOpen, setIsCreateFormulaDialogOpen] = useState(false);
  const [isAddParameterDialogOpen, setIsAddParameterDialogOpen] = useState(false);
  const [isAddExpressionDialogOpen, setIsAddExpressionDialogOpen] = useState(false);
  const [isCustomFieldDialogOpen, setIsCustomFieldDialogOpen] = useState(false);
  const [isEditFormulaDialogOpen, setIsEditFormulaDialogOpen] = useState(false);
  const [isExpressionGuideDialogOpen, setIsExpressionGuideDialogOpen] = useState(false);
  
  // Multi-step formula creation states
  const [formulaCreationStep, setFormulaCreationStep] = useState<'definition' | 'parameters' | 'expression'>('definition');
  const [createdFormulaForWorkflow, setCreatedFormulaForWorkflow] = useState<FormulaDefinition | null>(null);
  
  // EF Search states
  const [efSearchTerm, setEfSearchTerm] = useState('');
  const [selectedEF, setSelectedEF] = useState<any | null>(null);
  const [isEFSearchOpen, setIsEFSearchOpen] = useState(false);
  
  // Parameter editing states
  const [editingParameter, setEditingParameter] = useState<FormulaParameter | null>(null);
  const [isEditParameterDialogOpen, setIsEditParameterDialogOpen] = useState(false);
  const [showParameterTypeSelection, setShowParameterTypeSelection] = useState(true);
  
  // Selected items
  const [selectedFormula, setSelectedFormula] = useState<FormulaDefinition | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<FormulaParameter | null>(null);
  
  // Custom fields state
  const [customFields, setCustomFields] = useState<CustomField[]>([
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
    }
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');
  
  // Form data states
  const [formulaFormData, setFormulaFormData] = useState({
    name: '',
    category: '',
    description: '',
    tags: [] as string[],
    customFieldValues: {} as Record<string, any>
  });

  const [parameterFormData, setParameterFormData] = useState({
    name: '',
    type: 'number' as const,
    unit: '',
    defaultValue: '',
    description: '',
    required: false,
    minValue: '',
    maxValue: '',
    parameterType: 'formula_parameter' as FormulaParameterType,
    efSource: 'master_db' as const,
    efCategory: '',
    efUID: '',
    efDefinition: '',
    constantValue: '',
    constantDescription: ''
  });

  const [expressionFormData, setExpressionFormData] = useState({
    expression: '',
    sourceName: '',
    sourceURL: '',
    sourceType: 'primary' as const,
    algorithmType: 'linear' as const,
    applicationScope: '',
    validationStatus: 'pending' as const,
    notes: ''
  });

  const filteredFormulas = formulaDefinitions.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || formula.category === selectedCategory;
    const matchesDatabase = selectedDatabase === 'all' || !selectedDatabase || formula.database === selectedDatabase;
    
    return matchesSearch && matchesCategory && matchesDatabase;
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
    
    setFormulaFormData({
      ...formulaFormData,
      customFieldValues: {
        ...formulaFormData.customFieldValues,
        [newField.id]: newField.defaultValue || ''
      }
    });

    setIsCustomFieldDialogOpen(false);
    toast.success(`Custom field "${newField.name}" added`);
  };

  const removeCustomField = (fieldId: string) => {
    setCustomFields(customFields.filter(field => field.id !== fieldId));
    
    const newCustomFieldValues = { ...formulaFormData.customFieldValues };
    delete newCustomFieldValues[fieldId];
    setFormulaFormData({
      ...formulaFormData,
      customFieldValues: newCustomFieldValues
    });
    
    toast.success('Custom field removed');
  };

  const renderCustomFieldInput = (field: CustomField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={formulaFormData.customFieldValues[field.id] || ''}
            onChange={(e) => setFormulaFormData({
              ...formulaFormData,
              customFieldValues: {
                ...formulaFormData.customFieldValues,
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
            value={formulaFormData.customFieldValues[field.id] || ''}
            onChange={(e) => setFormulaFormData({
              ...formulaFormData,
              customFieldValues: {
                ...formulaFormData.customFieldValues,
                [field.id]: e.target.value
              }
            })}
            placeholder="0"
          />
        );
      
      case 'dropdown':
        return (
          <Select 
            value={formulaFormData.customFieldValues[field.id] || ''} 
            onValueChange={(value) => setFormulaFormData({
              ...formulaFormData,
              customFieldValues: {
                ...formulaFormData.customFieldValues,
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
              checked={formulaFormData.customFieldValues[field.id] || false}
              onCheckedChange={(checked) => setFormulaFormData({
                ...formulaFormData,
                customFieldValues: {
                  ...formulaFormData.customFieldValues,
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
            value={formulaFormData.customFieldValues[field.id] || ''}
            onChange={(e) => setFormulaFormData({
              ...formulaFormData,
              customFieldValues: {
                ...formulaFormData.customFieldValues,
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
  const handleCreateFormulaDefinition = () => {
    if (!formulaFormData.name || !formulaFormData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const sequence = formulaDefinitions.length + 1;
    const newUID = generateFormulaUID(formulaFormData.category, sequence);

    const newFormula: FormulaDefinition = {
      id: Date.now().toString(),
      uid: newUID,
      name: formulaFormData.name,
      category: formulaFormData.category,
      tags: formulaFormData.tags,
      status: 'draft',
      description: formulaFormData.description,
      database: 'master',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      customAttributes: formulaFormData.customFieldValues,
      parameters: [],
      expressions: [],
      latestVersion: ''
    };
    
    setFormulaDefinitions([...formulaDefinitions, newFormula]);
    setCreatedFormulaForWorkflow(newFormula);
    setSelectedFormula(newFormula);
    
    // Move to parameter creation step
    setFormulaCreationStep('parameters');
    
    // Reset form
    setFormulaFormData({
      name: '',
      category: '',
      description: '',
      tags: [],
      customFieldValues: {}
    });
    
    toast.success(`Formula created — UID ${newUID}. Now add parameters.`);
  };

  const handleAddParameter = () => {
    if (!selectedFormula || !parameterFormData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newParameter: FormulaParameter = {
      id: `param_${Date.now()}`,
      parentFormulaUID: selectedFormula.uid,
      name: parameterFormData.name,
      type: parameterFormData.type,
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
      versions: [
        {
          id: `pv_${Date.now()}`,
          versionUID: generateVersionUID(`param_${Date.now()}`, '1.0'),
          parentParameterId: `param_${Date.now()}`,
          version: '1.0',
          value: parameterFormData.defaultValue ? (parameterFormData.type === 'number' ? parseFloat(parameterFormData.defaultValue) : parameterFormData.defaultValue) : 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: 'admin'
        }
      ],
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    };

    const updatedFormula = {
      ...selectedFormula,
      parameters: [...selectedFormula.parameters, newParameter],
      status: 'active' as const
    };

    setFormulaDefinitions(formulaDefinitions.map(formula => 
      formula.id === selectedFormula.id ? updatedFormula : formula
    ));

    setCreatedFormulaForWorkflow(updatedFormula);
    setSelectedFormula(updatedFormula);
    
    // Reset parameter form
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
    
    toast.success(`Parameter added to Formula ${updatedFormula.uid}`);
  };

  const handleEditParameter = (parameter: FormulaParameter) => {
    setEditingParameter(parameter);
    
    // Find the linked EF if it's an EF parameter
    let linkedEF = null;
    if (parameter.parameterType === 'ef_value' && parameter.efUID) {
      const availableEFs = getMasterEFsForAssignment();
      linkedEF = availableEFs.find(ef => ef.uid === parameter.efUID);
    }
    
    // Populate form with parameter data
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
    
    if (linkedEF) {
      setSelectedEF(linkedEF);
      setEfSearchTerm(linkedEF.name);
    }
    
    setShowParameterTypeSelection(false);
    setIsEditParameterDialogOpen(true);
  };

  const handleUpdateParameter = () => {
    if (!editingParameter || !parameterFormData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedParameter: FormulaParameter = {
      ...editingParameter,
      name: parameterFormData.name,
      type: parameterFormData.type,
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
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin'
    };

    // Find the formula containing this parameter
    const formula = formulaDefinitions.find(f => 
      f.parameters.some(p => p.id === editingParameter.id)
    );

    if (formula) {
      const updatedFormula = {
        ...formula,
        parameters: formula.parameters.map(param => 
          param.id === editingParameter.id ? updatedParameter : param
        )
      };

      setFormulaDefinitions(formulaDefinitions.map(f => 
        f.id === formula.id ? updatedFormula : f
      ));

      // Update selected formula if it's the current one
      if (selectedFormula?.id === formula.id) {
        setSelectedFormula(updatedFormula);
      }

      // Update workflow formula if it's the current one
      if (createdFormulaForWorkflow?.id === formula.id) {
        setCreatedFormulaForWorkflow(updatedFormula);
      }
    }

    // Reset edit state
    setEditingParameter(null);
    setIsEditParameterDialogOpen(false);
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
    setSelectedEF(null);
    setEfSearchTerm('');
    setShowParameterTypeSelection(true);
    
    toast.success(`Parameter "${updatedParameter.name}" updated successfully`);
  };

  const handleAddExpression = () => {
    if (!selectedFormula || !expressionFormData.expression || !expressionFormData.sourceName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const versionNumber = selectedFormula.expressions.length === 0 ? '1.0' : `${selectedFormula.expressions.length + 1}.0`;

    const newExpression: FormulaExpression = {
      id: `exp_${Date.now()}`,
      parentFormulaUID: selectedFormula.uid,
      version: versionNumber,
      expression: expressionFormData.expression,
      sourceName: expressionFormData.sourceName,
      sourceURL: expressionFormData.sourceURL,
      sourceType: expressionFormData.sourceType,
      algorithmType: expressionFormData.algorithmType,
      applicationScope: expressionFormData.applicationScope,
      validationStatus: expressionFormData.validationStatus,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      notes: expressionFormData.notes
    };

    // Deactivate previous expressions
    const updatedExpressions = selectedFormula.expressions.map(exp => ({ ...exp, isActive: false }));
    updatedExpressions.push(newExpression);

    const updatedFormula = {
      ...selectedFormula,
      expressions: updatedExpressions,
      latestVersion: versionNumber
    };

    setFormulaDefinitions(formulaDefinitions.map(formula => 
      formula.id === selectedFormula.id ? updatedFormula : formula
    ));

    // Complete the workflow
    setIsAddExpressionDialogOpen(false);
    setIsCreateFormulaDialogOpen(false);
    setSelectedFormula(null);
    setCreatedFormulaForWorkflow(null);
    setFormulaCreationStep('definition');
    
    // Reset form
    setExpressionFormData({
      expression: '',
      sourceName: '',
      sourceURL: '',
      sourceType: 'primary',
      algorithmType: 'linear',
      applicationScope: '',
      validationStatus: 'pending',
      notes: ''
    });
    
    toast.success(`Formula "${updatedFormula.name}" completed successfully with expression v${versionNumber}!`);
  };

  const copyUID = (uid: string) => {
    navigator.clipboard.writeText(uid);
    toast.success('UID copied to clipboard');
  };

  const handleBulkUpload = () => {
    toast.success('Bulk upload completed: 12 Formulas inserted, 5 updated, 1 skipped');
  };

  const handleEditFormula = (formula: FormulaDefinition) => {
    setSelectedFormula(formula);
    setFormulaFormData({
      name: formula.name,
      category: formula.category,
      description: formula.description,
      tags: formula.tags,
      customFieldValues: formula.customAttributes || {}
    });
    setIsEditFormulaDialogOpen(true);
  };

  const handleUpdateFormula = () => {
    if (!selectedFormula || !formulaFormData.name || !formulaFormData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedFormula: FormulaDefinition = {
      ...selectedFormula,
      name: formulaFormData.name,
      category: formulaFormData.category,
      description: formulaFormData.description,
      tags: formulaFormData.tags,
      customAttributes: formulaFormData.customFieldValues,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin'
    };

    setFormulaDefinitions(formulaDefinitions.map(formula => 
      formula.id === selectedFormula.id ? updatedFormula : formula
    ));

    setIsEditFormulaDialogOpen(false);
    setSelectedFormula(null);
    
    // Reset form
    setFormulaFormData({
      name: '',
      category: '',
      description: '',
      tags: [],
      customFieldValues: {}
    });

    toast.success(`Formula updated — ${updatedFormula.name}`);
  };

  const handleDeleteFormula = (formula: FormulaDefinition) => {
    if (window.confirm(`Are you sure you want to delete "${formula.name}"? This action cannot be undone.`)) {
      setFormulaDefinitions(formulaDefinitions.filter(f => f.id !== formula.id));
      toast.success(`Formula "${formula.name}" deleted successfully`);
    }
  };

  const getActiveExpression = (formula: FormulaDefinition) => {
    return formula.expressions.find(exp => exp.isActive) || formula.expressions[formula.expressions.length - 1];
  };

  const getTotalParameters = (formula: FormulaDefinition) => {
    return formula.parameters.length;
  };

  const getTotalVersions = (formula: FormulaDefinition) => {
    return formula.parameters.reduce((total, param) => total + param.versions.length, 0) + formula.expressions.length;
  };

  const toggleFormulaExpansion = (formulaId: string) => {
    const newExpanded = new Set(expandedFormulas);
    if (newExpanded.has(formulaId)) {
      newExpanded.delete(formulaId);
      // Also collapse all parameters under this formula
      const formulaParameterIds = formulaDefinitions.find(formula => formula.id === formulaId)?.parameters.map(param => param.id) || [];
      formulaParameterIds.forEach(paramId => {
        expandedParameters.delete(paramId);
      });
      setExpandedParameters(new Set(expandedParameters));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-lg">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold text-gray-900">Formulas</h1>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsExpressionGuideDialogOpen(true)}
                  className="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                  title="Mathematical Expression Usage Guide"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-gray-600">Manage formula definitions with parameters and expressions</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          
          <Dialog open={isCreateFormulaDialogOpen} onOpenChange={(open) => {
            setIsCreateFormulaDialogOpen(open);
            if (!open) {
              // Reset workflow when dialog closes
              setFormulaCreationStep('definition');
              setCreatedFormulaForWorkflow(null);
              setSelectedFormula(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Formula
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  Create Formula - Step {formulaCreationStep === 'definition' ? '1' : formulaCreationStep === 'parameters' ? '2' : '3'} of 3
                </DialogTitle>
                <DialogDescription>
                  {formulaCreationStep === 'definition' && 'Create the formula definition with basic information.'}
                  {formulaCreationStep === 'parameters' && 'Add parameters to your formula by selecting parameter types.'}
                  {formulaCreationStep === 'expression' && 'Create the mathematical expression to complete your formula.'}
                </DialogDescription>
              </DialogHeader>

              {/* Progress Indicator */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${formulaCreationStep === 'definition' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${formulaCreationStep === 'definition' ? 'bg-emerald-600 text-white' : createdFormulaForWorkflow ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {createdFormulaForWorkflow && formulaCreationStep !== 'definition' ? <CheckCircle className="h-3 w-3" /> : '1'}
                  </div>
                  <span className="text-sm font-medium">Definition</span>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${formulaCreationStep === 'parameters' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${formulaCreationStep === 'parameters' ? 'bg-emerald-600 text-white' : createdFormulaForWorkflow && createdFormulaForWorkflow.parameters.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {createdFormulaForWorkflow && createdFormulaForWorkflow.parameters.length > 0 && formulaCreationStep === 'expression' ? <CheckCircle className="h-3 w-3" /> : '2'}
                  </div>
                  <span className="text-sm font-medium">Parameters</span>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${formulaCreationStep === 'expression' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${formulaCreationStep === 'expression' ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    3
                  </div>
                  <span className="text-sm font-medium">Expression</span>
                </div>
              </div>

              {/* Step 1: Formula Definition */}
              {formulaCreationStep === 'definition' && (
                <div className="space-y-6">
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
                          <Label htmlFor="name">Formula Name *</Label>
                          <Input
                            id="name"
                            value={formulaFormData.name}
                            onChange={(e) => setFormulaFormData({...formulaFormData, name: e.target.value})}
                            placeholder="e.g. Transport Emission Formula"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="category">Primary Category *</Label>
                          <Select value={formulaFormData.category} onValueChange={(value) => setFormulaFormData({...formulaFormData, category: value})}>
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
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formulaFormData.description}
                          onChange={(e) => setFormulaFormData({...formulaFormData, description: e.target.value})}
                          placeholder="Describe the formula's purpose and application"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <Label>Tags</Label>
                        <Input
                          value={formulaFormData.tags.join(', ')}
                          onChange={(e) => setFormulaFormData({...formulaFormData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                          placeholder="Enter tags separated by commas"
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                          {formulaFormData.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                              <X 
                                className="h-3 w-3 ml-1 cursor-pointer" 
                                onClick={() => setFormulaFormData({
                                  ...formulaFormData, 
                                  tags: formulaFormData.tags.filter((_, i) => i !== index)
                                })}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Fields */}
                  {customFields.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Custom Fields</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {customFields.map(field => {
                            const Icon = fieldTypeIcons[field.type];
                            return (
                              <div key={field.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-gray-500" />
                                    {field.name}
                                    {field.required && <span className="text-red-500">*</span>}
                                  </Label>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeCustomField(field.id)}
                                    className="h-6 w-6 p-0"
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
                </div>
              )}

              {/* Step 2: Parameter Selection */}
              {formulaCreationStep === 'parameters' && createdFormulaForWorkflow && (
                <div className="space-y-6">
                  {/* Formula Info */}
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <div>
                          <h3 className="font-medium text-emerald-900">{createdFormulaForWorkflow.name}</h3>
                          <p className="text-sm text-emerald-700">UID: {createdFormulaForWorkflow.uid} • {createdFormulaForWorkflow.parameters.length} parameters added</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Parameter Types Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Choose Parameter Type to Add</CardTitle>
                      <p className="text-sm text-gray-600">Select the type of parameter you want to create for this formula</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Formula Parameters */}
                        <div 
                          className="group cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                          onClick={() => {
                            setParameterFormData({
                              ...parameterFormData,
                              parameterType: 'formula_parameter'
                            });
                            setIsAddParameterDialogOpen(true);
                          }}
                        >
                          <div className={`h-full p-5 rounded-lg border-2 border-dashed transition-all duration-200 ${parameterTypeInfo.formula_parameter.color} border-blue-200 hover:border-blue-400 hover:shadow-lg`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-blue-100">
                                <Variable className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-blue-900 text-sm">{parameterTypeInfo.formula_parameter.title}</h3>
                                <Badge className={`text-xs mt-1 ${parameterTypeInfo.formula_parameter.badge}`}>
                                  User Input
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-blue-700 mb-3 line-clamp-2">{parameterTypeInfo.formula_parameter.description}</p>
                            <div className="text-xs text-blue-600 space-y-1 mb-3">
                              <div>• Distance traveled, fuel consumption</div>
                              <div>• User-provided data or bulk uploads</div>
                              <div>• Validation rules and constraints</div>
                            </div>
                            <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                              Click to create →
                            </div>
                          </div>
                        </div>

                        {/* EF Parameters */}
                        <div 
                          className="group cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                          onClick={() => {
                            setParameterFormData({
                              ...parameterFormData,
                              parameterType: 'ef_value'
                            });
                            setIsAddParameterDialogOpen(true);
                          }}
                        >
                          <div className={`h-full p-5 rounded-lg border-2 border-dashed transition-all duration-200 ${parameterTypeInfo.ef_value.color} border-emerald-200 hover:border-emerald-400 hover:shadow-lg`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-emerald-100">
                                <Database className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-emerald-900 text-sm">{parameterTypeInfo.ef_value.title}</h3>
                                <Badge className={`text-xs mt-1 ${parameterTypeInfo.ef_value.badge}`}>
                                  Database Value
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-emerald-700 mb-3 line-clamp-2">{parameterTypeInfo.ef_value.description}</p>
                            <div className="text-xs text-emerald-600 space-y-1 mb-3">
                              <div>• Fuel emission factors, electricity grid factors</div>
                              <div>• Linked to Master DB or CDB entries</div>
                              <div>• Automatic updates when EF data changes</div>
                            </div>
                            <div className="text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                              Click to create →
                            </div>
                          </div>
                        </div>

                        {/* Constant Parameters */}
                        <div 
                          className="group cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                          onClick={() => {
                            setParameterFormData({
                              ...parameterFormData,
                              parameterType: 'constant'
                            });
                            setIsAddParameterDialogOpen(true);
                          }}
                        >
                          <div className={`h-full p-5 rounded-lg border-2 border-dashed transition-all duration-200 ${parameterTypeInfo.constant.color} border-purple-200 hover:border-purple-400 hover:shadow-lg`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-purple-100">
                                <Hash className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-purple-900 text-sm">{parameterTypeInfo.constant.title}</h3>
                                <Badge className={`text-xs mt-1 ${parameterTypeInfo.constant.badge}`}>
                                  Fixed Value
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-purple-700 mb-3 line-clamp-2">{parameterTypeInfo.constant.description}</p>
                            <div className="text-xs text-purple-600 space-y-1 mb-3">
                              <div>• GWP values, conversion factors</div>
                              <div>• Scientific constants and standards</div>
                              <div>• Reference-based fixed values</div>
                            </div>
                            <div className="text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                              Click to create →
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Current Parameters */}
                  {createdFormulaForWorkflow.parameters.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Added Parameters ({createdFormulaForWorkflow.parameters.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {createdFormulaForWorkflow.parameters.map(param => {
                            const typeInfo = parameterTypeInfo[param.parameterType];
                            const Icon = typeInfo.icon;
                            return (
                              <div key={param.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`p-1 rounded ${typeInfo.color}`}>
                                  <Icon className="h-3 w-3" />
                                </div>
                                <span className="font-medium text-sm">{param.name}</span>
                                <Badge className={`text-xs ${typeInfo.badge}`}>
                                  {param.parameterType.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {param.unit && (
                                  <span className="text-xs text-gray-500">({param.unit})</span>
                                )}
                                <span className="text-xs text-gray-500 ml-auto">{param.type}</span>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 3: Mathematical Expression */}
              {formulaCreationStep === 'expression' && createdFormulaForWorkflow && (
                <div className="space-y-6">
                  {/* Formula Summary */}
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <div>
                          <h3 className="font-medium text-emerald-900">{createdFormulaForWorkflow.name}</h3>
                          <p className="text-sm text-emerald-700">UID: {createdFormulaForWorkflow.uid} • {createdFormulaForWorkflow.parameters.length} parameters ready</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {createdFormulaForWorkflow.parameters.map(param => (
                          <Badge key={param.id} variant="outline" className="text-xs">
                            {param.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Expression Creation Interface */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-emerald-600" />
                        Mathematical Expression
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Create the mathematical formula using the parameters defined above.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="expression">Expression Formula *</Label>
                        <Textarea
                          id="expression"
                          value={expressionFormData.expression}
                          onChange={(e) => setExpressionFormData({...expressionFormData, expression: e.target.value})}
                          placeholder="Example: distance_traveled * fuel_emission_factor * methane_gwp"
                          rows={3}
                          className="font-mono text-sm bg-gray-50 border-2 border-dashed border-gray-300 focus:border-emerald-400 focus:bg-white transition-all"
                        />
                      </div>

                      {/* Quick Parameter Reference */}
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Available Parameters (Click to add)</Label>
                        <div className="flex flex-wrap gap-2">
                          {createdFormulaForWorkflow.parameters.map(param => {
                            const typeInfo = parameterTypeInfo[param.parameterType];
                            const Icon = typeInfo.icon;
                            return (
                              <Button
                                key={param.id}
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => {
                                  const currentExpression = expressionFormData.expression;
                                  const newExpression = currentExpression + (currentExpression ? ' * ' : '') + param.name;
                                  setExpressionFormData({...expressionFormData, expression: newExpression});
                                }}
                                className={`text-xs ${typeInfo.badge} border-current hover:bg-current hover:text-white transition-all`}
                              >
                                <Icon className="h-3 w-3 mr-1" />
                                {param.name}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Expression Validation Preview */}
                      {expressionFormData.expression && (
                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-800">Expression Preview</span>
                          </div>
                          <code className="text-sm text-emerald-700 font-mono bg-white px-2 py-1 rounded">
                            {expressionFormData.expression}
                          </code>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Expression Metadata */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Expression Metadata
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Provide source information and validation details for this expression.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sourceName">Source Name *</Label>
                          <Input
                            id="sourceName"
                            value={expressionFormData.sourceName}
                            onChange={(e) => setExpressionFormData({...expressionFormData, sourceName: e.target.value})}
                            placeholder="e.g., IPCC 2006 Guidelines"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sourceURL">Source URL</Label>
                          <Input
                            id="sourceURL"
                            value={expressionFormData.sourceURL}
                            onChange={(e) => setExpressionFormData({...expressionFormData, sourceURL: e.target.value})}
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sourceType">Source Type</Label>
                          <Select value={expressionFormData.sourceType} onValueChange={(value: 'primary' | 'secondary' | 'tertiary') => setExpressionFormData({...expressionFormData, sourceType: value})}>
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
                          <Label htmlFor="algorithmType">Algorithm Type</Label>
                          <Select value={expressionFormData.algorithmType} onValueChange={(value: 'linear' | 'logarithmic' | 'polynomial' | 'custom') => setExpressionFormData({...expressionFormData, algorithmType: value})}>
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
                        <div className="space-y-2">
                          <Label htmlFor="validationStatus">Validation Status</Label>
                          <Select value={expressionFormData.validationStatus} onValueChange={(value: 'pending' | 'validated' | 'rejected') => setExpressionFormData({...expressionFormData, validationStatus: value})}>
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

                      <div className="space-y-2">
                        <Label htmlFor="applicationScope">Application Scope</Label>
                        <Textarea
                          id="applicationScope"
                          value={expressionFormData.applicationScope}
                          onChange={(e) => setExpressionFormData({...expressionFormData, applicationScope: e.target.value})}
                          placeholder="Describe where and how this formula should be applied..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  if (formulaCreationStep === 'parameters' && createdFormulaForWorkflow) {
                    setFormulaCreationStep('definition');
                  } else if (formulaCreationStep === 'expression') {
                    setFormulaCreationStep('parameters');
                  } else {
                    setIsCreateFormulaDialogOpen(false);
                  }
                }}>
                  {formulaCreationStep === 'definition' ? 'Cancel' : 'Back'}
                </Button>
                
                {formulaCreationStep === 'definition' && (
                  <Button onClick={handleCreateFormulaDefinition}>
                    Create & Continue
                  </Button>
                )}

                {formulaCreationStep === 'parameters' && createdFormulaForWorkflow && (
                  <Button 
                    onClick={() => setFormulaCreationStep('expression')}
                    disabled={createdFormulaForWorkflow.parameters.length === 0}
                  >
                    Continue to Expression
                  </Button>
                )}

                {formulaCreationStep === 'expression' && (
                  <Button onClick={handleAddExpression}>
                    Complete Formula
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>



      {/* Filter Controls */}
      <Card>
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

      {/* Hierarchical Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="min-w-[300px]">Formula Details</TableHead>
                  <TableHead className="min-w-[150px]">Category & Tags</TableHead>
                  <TableHead className="min-w-[120px]">Parameters</TableHead>
                  <TableHead className="min-w-[150px]">Latest Expression</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormulas.map((formula) => (
                  <React.Fragment key={formula.id}>
                    {/* Formula Row */}
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
                            <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => copyUID(formula.uid)}>
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
                          <span className="font-medium">{getTotalParameters(formula)}</span> parameters
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formula.parameters?.slice(0, 3).map((param, index) => {
                              const typeInfo = parameterTypeInfo[param.parameterType];
                              const Icon = typeInfo.icon;
                              return (
                                <div key={index} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${typeInfo.badge}`}>
                                  <Icon className="h-3 w-3" />
                                  <span className="capitalize">{param.parameterType.replace('_', ' ')}</span>
                                </div>
                              );
                            })}
                            {getTotalParameters(formula) > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{getTotalParameters(formula) - 3} more
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
                            {formula.expressions?.length || 0} versions
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
                            onClick={() => {
                              setSelectedFormula(formula);
                              setIsAddParameterDialogOpen(true);
                            }}
                            title="Add Parameter"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditFormula(formula)}
                            title="Edit Formula"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteFormula(formula)}
                            title="Delete Formula"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Formula Content */}
                    {expandedFormulas.has(formula.id) && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-gray-50 p-6">
                          <div className="space-y-6">
                            {/* Parameters Section */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                  <Variable className="h-4 w-4" />
                                  Parameters ({getTotalParameters(formula)})
                                </h4>
                                <div className="flex gap-2">
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
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                {formula.parameters?.map(param => (
                                  <div key={param.id} className="bg-white rounded-lg border p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleParameterExpansion(param.id)}
                                        >
                                          {expandedParameters.has(param.id) ? 
                                            <ChevronDown className="h-4 w-4" /> : 
                                            <ChevronRight className="h-4 w-4" />
                                          }
                                        </Button>
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
                                        <Button variant="ghost" size="sm">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="text-xs text-gray-600 grid grid-cols-2 gap-4">
                                      <div><strong>Type:</strong> {param.type} {param.unit && `(${param.unit})`}</div>
                                      <div><strong>Default:</strong> {param.defaultValue}</div>
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

                                    {/* Parameter Versions */}
                                    {expandedParameters.has(param.id) && (
                                      <div className="mt-3 pt-3 border-t">
                                        <h5 className="font-medium text-sm mb-2">Versions ({param.versions.length})</h5>
                                        <div className="space-y-2">
                                          {param.versions.map(version => (
                                            <div key={version.id} className="bg-gray-50 rounded p-3">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <Badge variant="outline" className="text-xs">v{version.version}</Badge>
                                                  <span className="text-xs text-gray-600">{version.versionUID}</span>
                                                  {version.isActive && (
                                                    <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                                                  )}
                                                </div>
                                                <span className="text-sm font-medium">{version.value}</span>
                                              </div>
                                              {version.notes && (
                                                <p className="text-xs text-gray-500 mt-1">{version.notes}</p>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
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
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Expression
                                </Button>
                              </div>
                              
                              <div className="space-y-3">
                                {formula.expressions?.map(expression => (
                                  <div key={expression.id} className="bg-white rounded-lg border p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-3">
                                        <Badge variant="outline">v{expression.version}</Badge>
                                        <span className="text-sm text-gray-600">{expression.parentFormulaUID}-EXP-{expression.version}</span>
                                        {expression.isActive && (
                                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                                        )}
                                      </div>
                                      <Badge variant={
                                        expression.validationStatus === 'validated' ? 'default' :
                                        expression.validationStatus === 'pending' ? 'secondary' : 'destructive'
                                      }>
                                        {expression.validationStatus}
                                      </Badge>
                                    </div>

                                    <div className="text-sm text-gray-600 mb-3">
                                      <div className="flex items-start gap-2">
                                        <strong className="shrink-0">Expression:</strong> 
                                        <code className="bg-gray-100 px-3 py-2 rounded text-xs font-mono break-all flex-1">
                                          {expression.expression}
                                        </code>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <div className="space-y-2">
                                          <div><strong>Source:</strong> {expression.sourceName}</div>
                                          <div><strong>Algorithm:</strong> {expression.algorithmType}</div>
                                          <div><strong>Scope:</strong> {expression.applicationScope}</div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="space-y-2">
                                          <div><strong>Created:</strong> {new Date(expression.createdAt).toLocaleDateString()}</div>
                                          <div><strong>By:</strong> {expression.createdBy}</div>
                                          {expression.sourceURL && (
                                            <div>
                                              <strong>Reference:</strong> 
                                              <a href={expression.sourceURL} target="_blank" rel="noopener noreferrer" 
                                                 className="text-blue-600 hover:underline ml-1">
                                                <ExternalLink className="h-3 w-3 inline ml-1" />
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
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

      {/* Add Parameter Dialog */}
      <Dialog open={isAddParameterDialogOpen} onOpenChange={setIsAddParameterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Variable className="h-5 w-5 text-emerald-600" />
              Add Parameter {selectedFormula ? `to ${selectedFormula.name}` : ''}
            </DialogTitle>
            <DialogDescription>
              Add a new parameter to this formula definition.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Formula Selector - only show if no formula is selected and multiple formulas exist */}
            {!selectedFormula && filteredFormulas.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="formulaSelect">Select Formula *</Label>
                <Select onValueChange={(value) => {
                  const formula = filteredFormulas.find(f => f.id === value);
                  setSelectedFormula(formula || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a formula to add parameter to" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredFormulas.map(formula => (
                      <SelectItem key={formula.id} value={formula.id}>
                        <div className="flex items-center gap-2">
                          <span>{formula.name}</span>
                          <Badge variant="outline" className="text-xs">{formula.uid}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paramName">Parameter Name *</Label>
                <Input
                  id="paramName"
                  value={parameterFormData.name}
                  onChange={(e) => setParameterFormData({...parameterFormData, name: e.target.value})}
                  placeholder="parameter_name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paramType">Parameter Type</Label>
                <Select value={parameterFormData.parameterType} onValueChange={(value: FormulaParameterType) => setParameterFormData({...parameterFormData, parameterType: value})}>
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
              <div className="space-y-2">
                <Label htmlFor="dataType">Data Type</Label>
                <Select value={parameterFormData.type} onValueChange={(value: 'number' | 'string' | 'boolean') => setParameterFormData({...parameterFormData, type: value})}>
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
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={parameterFormData.unit}
                  onChange={(e) => setParameterFormData({...parameterFormData, unit: e.target.value})}
                  placeholder="kg, kWh, etc."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  checked={parameterFormData.required}
                  onCheckedChange={(checked) => setParameterFormData({...parameterFormData, required: checked as boolean})}
                />
                <Label htmlFor="required">Required parameter</Label>
              </div>
            </div>

            {/* Conditional fields based on parameter type */}
            {parameterFormData.parameterType === 'formula_parameter' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultValue">Default Value</Label>
                  <Input
                    id="defaultValue"
                    value={parameterFormData.defaultValue}
                    onChange={(e) => setParameterFormData({...parameterFormData, defaultValue: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minValue">Min Value</Label>
                  <Input
                    id="minValue"
                    value={parameterFormData.minValue}
                    onChange={(e) => setParameterFormData({...parameterFormData, minValue: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxValue">Max Value</Label>
                  <Input
                    id="maxValue"
                    value={parameterFormData.maxValue}
                    onChange={(e) => setParameterFormData({...parameterFormData, maxValue: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}

            {parameterFormData.parameterType === 'ef_value' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="efSource">EF Source</Label>
                    <Select value={parameterFormData.efSource} onValueChange={(value: 'master_db' | 'cdb') => setParameterFormData({...parameterFormData, efSource: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="master_db">Master DB</SelectItem>
                        <SelectItem value="cdb">Client DB (CDB)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="efCategory">EF Category</Label>
                    <Select value={parameterFormData.efCategory} onValueChange={(value) => setParameterFormData({...parameterFormData, efCategory: value})}>
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
                <div className="space-y-2">
                  <Label htmlFor="efUID">EF UID</Label>
                  <Input
                    id="efUID"
                    value={parameterFormData.efUID}
                    onChange={(e) => setParameterFormData({...parameterFormData, efUID: e.target.value})}
                    placeholder="EF-XXX-2024-001"
                  />
                </div>
              </div>
            )}

            {parameterFormData.parameterType === 'constant' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="constantValue">Constant Value *</Label>
                    <Input
                      id="constantValue"
                      value={parameterFormData.constantValue}
                      onChange={(e) => setParameterFormData({...parameterFormData, constantValue: e.target.value})}
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="constantDescription">Constant Description</Label>
                    <Input
                      id="constantDescription"
                      value={parameterFormData.constantDescription}
                      onChange={(e) => setParameterFormData({...parameterFormData, constantDescription: e.target.value})}
                      placeholder="e.g., IPCC AR5 GWP value"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={parameterFormData.description}
                onChange={(e) => setParameterFormData({...parameterFormData, description: e.target.value})}
                placeholder="Describe this parameter's purpose and usage"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddParameterDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddParameter}>
              Add Parameter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expression Dialog */}
      <Dialog open={isAddExpressionDialogOpen} onOpenChange={setIsAddExpressionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              Add Expression to {selectedFormula?.name}
            </DialogTitle>
            <DialogDescription>
              Add a mathematical expression for this formula.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Mathematical Expression with Enhanced UI */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-emerald-600" />
                  Mathematical Expression
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Enter the mathematical formula using parameter names. Use the syntax guide below for reference.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expression">Expression Formula *</Label>
                  <Textarea
                    id="expression"
                    value={expressionFormData.expression}
                    onChange={(e) => setExpressionFormData({...expressionFormData, expression: e.target.value})}
                    placeholder="Example: distance_traveled * fuel_emission_factor * methane_gwp"
                    rows={3}
                    className="font-mono text-sm bg-gray-50 border-2 border-dashed border-gray-300 focus:border-emerald-400 focus:bg-white transition-all"
                  />
                </div>

                {/* Quick Parameter Reference */}
                {selectedFormula && selectedFormula.parameters.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Available Parameters</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedFormula.parameters.map(param => {
                        const typeInfo = parameterTypeInfo[param.parameterType];
                        const Icon = typeInfo.icon;
                        return (
                          <Button
                            key={param.id}
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => {
                              const currentExpression = expressionFormData.expression;
                              const newExpression = currentExpression + (currentExpression ? ' * ' : '') + param.name;
                              setExpressionFormData({...expressionFormData, expression: newExpression});
                            }}
                            className={`text-xs ${typeInfo.badge} border-current hover:bg-current hover:text-white transition-all`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {param.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expression Validation Preview */}
                {expressionFormData.expression && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">Expression Preview</span>
                    </div>
                    <code className="text-sm text-emerald-700 font-mono bg-white px-2 py-1 rounded">
                      {expressionFormData.expression}
                    </code>
                  </div>
                )}

                {/* Quick Syntax Guide */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Syntax Guide</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-blue-700">
                    <div>
                      <div className="font-medium mb-1">Operations:</div>
                      <div>+ - * / pow() sqrt() log()</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Conditionals:</div>
                      <div>if(condition, true_val, false_val)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expression Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Expression Metadata
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Provide source information and validation details for this expression.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceName">Source Name *</Label>
                    <Input
                      id="sourceName"
                      value={expressionFormData.sourceName}
                      onChange={(e) => setExpressionFormData({...expressionFormData, sourceName: e.target.value})}
                      placeholder="e.g., IPCC 2006 Guidelines"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceURL">Source URL</Label>
                    <Input
                      id="sourceURL"
                      value={expressionFormData.sourceURL}
                      onChange={(e) => setExpressionFormData({...expressionFormData, sourceURL: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceType">Source Type</Label>
                    <Select value={expressionFormData.sourceType} onValueChange={(value: 'primary' | 'secondary' | 'tertiary') => setExpressionFormData({...expressionFormData, sourceType: value})}>
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
                    <Label htmlFor="algorithmType">Algorithm Type</Label>
                    <Select value={expressionFormData.algorithmType} onValueChange={(value: 'linear' | 'logarithmic' | 'polynomial' | 'custom') => setExpressionFormData({...expressionFormData, algorithmType: value})}>
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
                  <div className="space-y-2">
                    <Label htmlFor="validationStatus">Validation Status</Label>
                    <Select value={expressionFormData.validationStatus} onValueChange={(value: 'pending' | 'validated' | 'rejected') => setExpressionFormData({...expressionFormData, validationStatus: value})}>
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

                <div className="space-y-2">
                  <Label htmlFor="applicationScope">Application Scope</Label>
                  <Textarea
                    id="applicationScope"
                    value={expressionFormData.applicationScope}
                    onChange={(e) => setExpressionFormData({...expressionFormData, applicationScope: e.target.value})}
                    placeholder="Describe where and how this formula should be applied..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpressionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpression}>
              Add Expression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Field Dialog */}
      <Dialog open={isCustomFieldDialogOpen} onOpenChange={setIsCustomFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Field</DialogTitle>
            <DialogDescription>
              Create a custom field for formula definitions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name *</Label>
              <Input
                id="fieldName"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g., Algorithm Developer"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <Select value={newFieldType} onValueChange={(value: CustomFieldType) => setNewFieldType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newFieldType === 'dropdown' && (
              <div className="space-y-2">
                <Label htmlFor="fieldOptions">Options (comma-separated)</Label>
                <Input
                  id="fieldOptions"
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fieldRequired"
                checked={newFieldRequired}
                onCheckedChange={(checked) => setNewFieldRequired(checked as boolean)}
              />
              <Label htmlFor="fieldRequired">Required field</Label>
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

      {/* Edit Formula Dialog */}
      <Dialog open={isEditFormulaDialogOpen} onOpenChange={setIsEditFormulaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Formula
            </DialogTitle>
            <DialogDescription>
              Update the formula definition details.
            </DialogDescription>
          </DialogHeader>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Standard Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Formula Name *</Label>
                  <Input
                    id="edit-name"
                    value={formulaFormData.name}
                    onChange={(e) => setFormulaFormData({...formulaFormData, name: e.target.value})}
                    placeholder="e.g. Transport Emission Formula"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Primary Category *</Label>
                  <Select value={formulaFormData.category} onValueChange={(value) => setFormulaFormData({...formulaFormData, category: value})}>
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
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formulaFormData.description}
                  onChange={(e) => setFormulaFormData({...formulaFormData, description: e.target.value})}
                  placeholder="Describe the formula's purpose and application"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2 mt-4">
                <Label>Tags</Label>
                <Input
                  value={formulaFormData.tags.join(', ')}
                  onChange={(e) => setFormulaFormData({...formulaFormData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                  placeholder="Enter tags separated by commas"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {formulaFormData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setFormulaFormData({
                          ...formulaFormData, 
                          tags: formulaFormData.tags.filter((_, i) => i !== index)
                        })}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFormulaDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFormula}>
              Update Formula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mathematical Expression Usage Guide Dialog */}
      <Dialog open={isExpressionGuideDialogOpen} onOpenChange={setIsExpressionGuideDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              Mathematical Expression Usage Guide
            </DialogTitle>
            <DialogDescription>
              Comprehensive guide for creating mathematical expressions in formulas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expression Syntax */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Expression Syntax
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">Basic Operations</div>
                    <code className="text-xs bg-white px-2 py-1 rounded">distance * emission_factor</code>
                    <div className="text-xs text-gray-500 mt-1">Multiplication, addition (+), subtraction (-), division (/)</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">Functions</div>
                    <code className="text-xs bg-white px-2 py-1 rounded">pow(base, exponent), sqrt(value), log(value)</code>
                    <div className="text-xs text-gray-500 mt-1">Mathematical functions for complex calculations</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">Conditionals</div>
                    <code className="text-xs bg-white px-2 py-1 rounded">if(condition, true_value, false_value)</code>
                    <div className="text-xs text-gray-500 mt-1">Conditional logic for different scenarios</div>
                  </div>
                </div>
              </div>

              {/* Parameter Usage */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Variable className="h-4 w-4" />
                  Parameter Usage
                </h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <div className="text-sm font-medium text-blue-700 mb-1">Formula Parameters</div>
                    <code className="text-xs bg-white px-2 py-1 rounded">distance_traveled, fuel_consumption</code>
                    <div className="text-xs text-blue-600 mt-1">Use parameter names exactly as defined</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg border-l-4 border-emerald-400">
                    <div className="text-sm font-medium text-emerald-700 mb-1">EF Parameters</div>
                    <code className="text-xs bg-white px-2 py-1 rounded">fuel_emission_factor, grid_ef</code>
                    <div className="text-xs text-emerald-600 mt-1">Auto-linked to database values</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <div className="text-sm font-medium text-purple-700 mb-1">Constants</div>
                    <code className="text-xs bg-white px-2 py-1 rounded">methane_gwp, co2_gwp</code>
                    <div className="text-xs text-purple-600 mt-1">Fixed scientific values</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expression Examples */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4" />
                Expression Examples
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border">
                  <div className="font-medium text-emerald-800 mb-2">Transport Emissions</div>
                  <code className="text-sm bg-white px-3 py-2 rounded block mb-2">
                    distance_traveled * fuel_consumption * fuel_emission_factor
                  </code>
                  <div className="text-xs text-emerald-600">Basic linear calculation for vehicle emissions</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border">
                  <div className="font-medium text-blue-800 mb-2">Electricity with GWP</div>
                  <code className="text-sm bg-white px-3 py-2 rounded block mb-2">
                    electricity_usage * grid_emission_factor * methane_gwp
                  </code>
                  <div className="text-xs text-blue-600">Electricity emissions with methane impact factor</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
                  <div className="font-medium text-purple-800 mb-2">Conditional Logic</div>
                  <code className="text-sm bg-white px-3 py-2 rounded block mb-2">
                    if(fuel_type == "diesel", diesel_ef, gasoline_ef) * fuel_amount
                  </code>
                  <div className="text-xs text-purple-600">Different emission factors based on fuel type</div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border">
                  <div className="font-medium text-orange-800 mb-2">Complex Calculation</div>
                  <code className="text-sm bg-white px-3 py-2 rounded block mb-2">
                    pow(energy_input, 1.2) * efficiency_factor * carbon_intensity
                  </code>
                  <div className="text-xs text-orange-600">Non-linear relationship with power function</div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div>
                      <strong className="text-green-700">✓ Use descriptive parameter names</strong>
                      <div className="text-gray-600">distance_traveled instead of d</div>
                    </div>
                    <div>
                      <strong className="text-green-700">✓ Include units in parameter definitions</strong>
                      <div className="text-gray-600">Helps with validation and clarity</div>
                    </div>
                    <div>
                      <strong className="text-green-700">✓ Test expressions with sample data</strong>
                      <div className="text-gray-600">Verify calculations before deployment</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <strong className="text-red-700">✗ Avoid hardcoded values in expressions</strong>
                      <div className="text-gray-600">Use constant parameters instead</div>
                    </div>
                    <div>
                      <strong className="text-red-700">✗ Don't use spaces in parameter names</strong>
                      <div className="text-gray-600">Use underscores: fuel_type not "fuel type"</div>
                    </div>
                    <div>
                      <strong className="text-red-700">✗ Avoid overly complex single expressions</strong>
                      <div className="text-gray-600">Break down into multiple parameters</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsExpressionGuideDialogOpen(false)}>
              Close Guide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Parameter Dialog */}
      <Dialog open={isAddParameterDialogOpen} onOpenChange={(open) => {
        setIsAddParameterDialogOpen(open);
        if (!open) {
          // Reset form and selections
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
          setSelectedEF(null);
          setEfSearchTerm('');
          setIsEFSearchOpen(false);
          setShowParameterTypeSelection(true);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Variable className="h-5 w-5 text-emerald-600" />
              {showParameterTypeSelection ? 'Select Parameter Type' : `Add ${parameterTypeInfo[parameterFormData.parameterType]?.title}`} {selectedFormula && `${showParameterTypeSelection ? 'for' : 'to'} ${selectedFormula.name}`}
            </DialogTitle>
            <DialogDescription>
              {showParameterTypeSelection 
                ? 'Choose the type of parameter you want to create for this formula.'
                : (
                  <>
                    {parameterFormData.parameterType === 'formula_parameter' && 'Create a parameter that will be provided by users when using this formula.'}
                    {parameterFormData.parameterType === 'ef_value' && 'Link to an emission factor from Master DB or Client Database.'}
                    {parameterFormData.parameterType === 'constant' && 'Define a fixed value parameter with a constant value.'}
                  </>
                )
              }
            </DialogDescription>
          </DialogHeader>

          {/* Parameter Type Selection Step */}
          {showParameterTypeSelection && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Choose Parameter Type</CardTitle>
                  <p className="text-sm text-gray-600">Select the type of parameter you want to add to this formula</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formula Parameters */}
                    <div 
                      className="group cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => {
                        setParameterFormData({
                          ...parameterFormData,
                          parameterType: 'formula_parameter'
                        });
                        setShowParameterTypeSelection(false);
                      }}
                    >
                      <div className={`h-full p-5 rounded-lg border-2 border-dashed transition-all duration-200 ${parameterTypeInfo.formula_parameter.color} border-blue-200 hover:border-blue-400 hover:shadow-lg`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Variable className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-blue-900 text-sm">{parameterTypeInfo.formula_parameter.title}</h3>
                            <Badge className={`text-xs mt-1 ${parameterTypeInfo.formula_parameter.badge}`}>
                              User Input
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-blue-700 mb-3 line-clamp-2">{parameterTypeInfo.formula_parameter.description}</p>
                        <div className="text-xs text-blue-600 space-y-1 mb-3">
                          <div>• Distance traveled, fuel consumption</div>
                          <div>• User-provided data or bulk uploads</div>
                          <div>• Validation rules and constraints</div>
                        </div>
                        <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          Click to create →
                        </div>
                      </div>
                    </div>

                    {/* EF Parameters */}
                    <div 
                      className="group cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => {
                        setParameterFormData({
                          ...parameterFormData,
                          parameterType: 'ef_value'
                        });
                        setShowParameterTypeSelection(false);
                      }}
                    >
                      <div className={`h-full p-5 rounded-lg border-2 border-dashed transition-all duration-200 ${parameterTypeInfo.ef_value.color} border-emerald-200 hover:border-emerald-400 hover:shadow-lg`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-emerald-100">
                            <Database className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-emerald-900 text-sm">{parameterTypeInfo.ef_value.title}</h3>
                            <Badge className={`text-xs mt-1 ${parameterTypeInfo.ef_value.badge}`}>
                              Database Value
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-emerald-700 mb-3 line-clamp-2">{parameterTypeInfo.ef_value.description}</p>
                        <div className="text-xs text-emerald-600 space-y-1 mb-3">
                          <div>• Fuel emission factors, electricity grid factors</div>
                          <div>• Linked to Master DB or CDB entries</div>
                          <div>• Automatic updates when EF data changes</div>
                        </div>
                        <div className="text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          Click to create →
                        </div>
                      </div>
                    </div>

                    {/* Constant Parameters */}
                    <div 
                      className="group cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => {
                        setParameterFormData({
                          ...parameterFormData,
                          parameterType: 'constant'
                        });
                        setShowParameterTypeSelection(false);
                      }}
                    >
                      <div className={`h-full p-5 rounded-lg border-2 border-dashed transition-all duration-200 ${parameterTypeInfo.constant.color} border-purple-200 hover:border-purple-400 hover:shadow-lg`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-purple-100">
                            <Hash className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-purple-900 text-sm">{parameterTypeInfo.constant.title}</h3>
                            <Badge className={`text-xs mt-1 ${parameterTypeInfo.constant.badge}`}>
                              Fixed Value
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-purple-700 mb-3 line-clamp-2">{parameterTypeInfo.constant.description}</p>
                        <div className="text-xs text-purple-600 space-y-1 mb-3">
                          <div>• GWP values, conversion factors</div>
                          <div>• Scientific constants and standards</div>
                          <div>• Reference-based fixed values</div>
                        </div>
                        <div className="text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          Click to create →
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                      placeholder="e.g., distance_traveled, fuel_emission_factor"
                    />
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
                    <Input
                      id="param-unit"
                      value={parameterFormData.unit}
                      onChange={(e) => setParameterFormData({...parameterFormData, unit: e.target.value})}
                      placeholder="e.g., km, L, kg CO2e"
                      readOnly={parameterFormData.parameterType === 'ef_value'}
                      className={parameterFormData.parameterType === 'ef_value' ? 'bg-gray-50 cursor-not-allowed' : ''}
                    />
                    {parameterFormData.parameterType === 'ef_value' && (
                      <p className="text-xs text-gray-500">Unit is automatically retrieved from selected EF</p>
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
                    Emission Factor Configuration
                  </CardTitle>
                  <p className="text-sm text-gray-600">Search and select an emission factor from Master DB or Client Database</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Source Selection */}
                  <div className="space-y-2">
                    <Label>Database Source</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={parameterFormData.efSource === 'master_db' ? 'default' : 'outline'}
                        onClick={() => setParameterFormData({...parameterFormData, efSource: 'master_db'})}
                        className="flex-1"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Master Database
                      </Button>
                      <Button
                        type="button"
                        variant={parameterFormData.efSource === 'cdb' ? 'default' : 'outline'}
                        onClick={() => setParameterFormData({...parameterFormData, efSource: 'cdb'})}
                        className="flex-1"
                      >
                        <Building className="h-4 w-4 mr-2" />
                        Client Database
                      </Button>
                    </div>
                  </div>

                  {/* EF Search */}
                  <div className="space-y-2">
                    <Label>Search Emission Factors</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={efSearchTerm}
                        onChange={(e) => {
                          setEfSearchTerm(e.target.value);
                          setIsEFSearchOpen(e.target.value.length > 0);
                        }}
                        placeholder="Search for emission factors..."
                        className="pl-10"
                      />
                    </div>

                    {/* Search Results */}
                    {isEFSearchOpen && efSearchTerm && (
                      <Card className="max-h-64 overflow-y-auto">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            {(() => {
                              const availableEFs = getMasterEFsForAssignment();
                              const filteredEFs = availableEFs.filter(ef => 
                                ef.name.toLowerCase().includes(efSearchTerm.toLowerCase()) ||
                                ef.category.toLowerCase().includes(efSearchTerm.toLowerCase()) ||
                                ef.uid.toLowerCase().includes(efSearchTerm.toLowerCase()) ||
                                ef.country.toLowerCase().includes(efSearchTerm.toLowerCase())
                              );

                              if (filteredEFs.length === 0) {
                                return (
                                  <div className="text-center py-4 text-gray-500">
                                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No emission factors found matching "{efSearchTerm}"</p>
                                  </div>
                                );
                              }

                              return filteredEFs.map(ef => (
                                <div
                                  key={ef.id}
                                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                    selectedEF?.id === ef.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
                                  }`}
                                  onClick={() => {
                                    setSelectedEF(ef);
                                    setParameterFormData({
                                      ...parameterFormData,
                                      efUID: ef.uid,
                                      efDefinition: ef.name,
                                      efCategory: ef.category,
                                      unit: ef.latestValue.unit,
                                      defaultValue: ef.latestValue.value.toString(),
                                      description: `${ef.description} (Auto-linked from ${parameterFormData.efSource === 'master_db' ? 'Master DB' : 'CDB'})`
                                    });
                                    setIsEFSearchOpen(false);
                                    setEfSearchTerm(ef.name);
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-gray-900 truncate">{ef.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                          {ef.category}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">{ef.description}</p>
                                      <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>UID: {ef.uid}</span>
                                        <span>{ef.country}</span>
                                        <span className="font-medium text-emerald-600">
                                          {ef.latestValue.value} {ef.latestValue.unit}
                                        </span>
                                      </div>
                                    </div>
                                    {selectedEF?.id === ef.id && (
                                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Selected EF Display */}
                  {selectedEF && (
                    <Card className="bg-emerald-50 border-emerald-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                          <h4 className="font-medium text-emerald-900">Selected Emission Factor</h4>
                        </div>
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
                  <p className="text-sm text-gray-600">Define a fixed value that won't change during calculations</p>
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
                  className="mr-auto"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddParameterDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddParameter}
                    disabled={!parameterFormData.name || (parameterFormData.parameterType === 'ef_value' && !selectedEF) || (parameterFormData.parameterType === 'constant' && !parameterFormData.constantValue)}
                  >
                    Add Parameter
                  </Button>
                </div>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Parameter Dialog */}
      <Dialog open={isEditParameterDialogOpen} onOpenChange={(open) => {
        setIsEditParameterDialogOpen(open);
        if (!open) {
          setEditingParameter(null);
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
          setSelectedEF(null);
          setEfSearchTerm('');
          setIsEFSearchOpen(false);
          setShowParameterTypeSelection(true);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Parameter: {editingParameter?.name}
            </DialogTitle>
            <DialogDescription>
              Update the parameter configuration. 
              {parameterFormData.parameterType === 'ef_value' && ' EF-linked values are automatically managed.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Parameter Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-param-name">Parameter Name *</Label>
                    <Input
                      id="edit-param-name"
                      value={parameterFormData.name}
                      onChange={(e) => setParameterFormData({...parameterFormData, name: e.target.value})}
                      placeholder="e.g., distance_traveled, fuel_emission_factor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-param-type">Data Type</Label>
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
                    <Label htmlFor="edit-param-unit">Unit {parameterFormData.parameterType === 'ef_value' && '*'}</Label>
                    <Input
                      id="edit-param-unit"
                      value={parameterFormData.unit}
                      onChange={(e) => setParameterFormData({...parameterFormData, unit: e.target.value})}
                      placeholder="e.g., km, L, kg CO2e"
                      readOnly={parameterFormData.parameterType === 'ef_value'}
                      className={parameterFormData.parameterType === 'ef_value' ? 'bg-gray-50 cursor-not-allowed' : ''}
                    />
                    {parameterFormData.parameterType === 'ef_value' && (
                      <p className="text-xs text-gray-500">Unit is automatically retrieved from selected EF</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-param-default">
                      {parameterFormData.parameterType === 'ef_value' ? 'EF Value *' : 'Default Value'}
                    </Label>
                    <Input
                      id="edit-param-default"
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
                  <Label htmlFor="edit-param-description">Description</Label>
                  <Textarea
                    id="edit-param-description"
                    value={parameterFormData.description}
                    onChange={(e) => setParameterFormData({...parameterFormData, description: e.target.value})}
                    placeholder="Describe what this parameter represents"
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-param-required"
                    checked={parameterFormData.required}
                    onCheckedChange={(checked) => setParameterFormData({...parameterFormData, required: checked as boolean})}
                  />
                  <Label htmlFor="edit-param-required">This parameter is required</Label>
                </div>
              </CardContent>
            </Card>

            {/* EF Parameter Configuration - Read Only Display */}
            {parameterFormData.parameterType === 'ef_value' && selectedEF && (
              <Card className="bg-emerald-50 border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-600" />
                    Linked Emission Factor (Read-Only)
                  </CardTitle>
                  <p className="text-sm text-emerald-700">This parameter is linked to an EF. Values are automatically managed.</p>
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
                      <Label htmlFor="edit-constant-value">Constant Value *</Label>
                      <Input
                        id="edit-constant-value"
                        value={parameterFormData.constantValue}
                        onChange={(e) => setParameterFormData({...parameterFormData, constantValue: e.target.value})}
                        placeholder="e.g., 25, 3.14159, 1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-constant-desc">Source/Reference</Label>
                      <Input
                        id="edit-constant-desc"
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
                      <Label htmlFor="edit-min-value">Minimum Value</Label>
                      <Input
                        id="edit-min-value"
                        type="number"
                        value={parameterFormData.minValue}
                        onChange={(e) => setParameterFormData({...parameterFormData, minValue: e.target.value})}
                        placeholder="Optional minimum"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-max-value">Maximum Value</Label>
                      <Input
                        id="edit-max-value"
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

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditParameterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateParameter}
              disabled={!parameterFormData.name || (parameterFormData.parameterType === 'ef_value' && !selectedEF) || (parameterFormData.parameterType === 'constant' && !parameterFormData.constantValue)}
            >
              Update Parameter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}