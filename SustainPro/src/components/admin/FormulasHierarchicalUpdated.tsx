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

interface FormulaDefinition {
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

// Parameter type configurations
const parameterTypeInfo = {
  formula_parameter: {
    title: 'Formula Parameter',
    description: 'User-provided input parameters for calculations',
    color: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
    icon: Variable
  },
  ef_value: {
    title: 'Emission Factor',
    description: 'Link to emission factors from Master DB or Client Database',
    color: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: Database
  },
  constant: {
    title: 'Constant Value',
    description: 'Fixed constants like GWP values or conversion factors',
    color: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-800',
    icon: Hash
  }
};

export function FormulasHierarchical() {
  const { 
    masterEFDefinitions, 
    getMasterEFsForAssignment
  } = useMasterDB();

  // Main state
  const [formulaDefinitions, setFormulaDefinitions] = useState<FormulaDefinition[]>([]);
  const [expandedFormulas, setExpandedFormulas] = useState<Set<string>>(new Set());
  const [expandedParameters, setExpandedParameters] = useState<Set<string>>(new Set());
  const [expandedExpressions, setExpandedExpressions] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isCreateFormulaDialogOpen, setIsCreateFormulaDialogOpen] = useState(false);
  const [isAddParameterDialogOpen, setIsAddParameterDialogOpen] = useState(false);
  const [isAddExpressionDialogOpen, setIsAddExpressionDialogOpen] = useState(false);
  const [isCustomFieldDialogOpen, setIsCustomFieldDialogOpen] = useState(false);
  
  // Form states
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

  // Selection states
  const [selectedFormula, setSelectedFormula] = useState<FormulaDefinition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'deprecated'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Creation workflow
  const [formulaCreationStep, setFormulaCreationStep] = useState<'basic' | 'parameters' | 'expressions'>('basic');
  const [createdFormulaForWorkflow, setCreatedFormulaForWorkflow] = useState<FormulaDefinition | null>(null);

  // Custom fields management
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  // EF Search states
  const [efSearchTerm, setEfSearchTerm] = useState('');
  const [selectedEF, setSelectedEF] = useState<any | null>(null);
  const [isEFSearchOpen, setIsEFSearchOpen] = useState(false);
  
  // Parameter editing states
  const [editingParameter, setEditingParameter] = useState<FormulaParameter | null>(null);
  const [isEditParameterDialogOpen, setIsEditParameterDialogOpen] = useState(false);
  const [showParameterTypeSelection, setShowParameterTypeSelection] = useState(true);

  // Generate UIDs
  const generateFormulaUID = (name: string) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const timestamp = Date.now().toString().slice(-6);
    return `formula_${cleanName}_${timestamp}`;
  };

  const generateVersionUID = (entityId: string, version: string) => {
    const timestamp = Date.now().toString().slice(-6);
    return `${entityId}_v${version.replace('.', '_')}_${timestamp}`;
  };

  // Filter functions
  const filteredFormulas = formulaDefinitions.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || formula.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || formula.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
  const getTotalParameters = (formula: FormulaDefinition) => formula.parameters.length;
  const getTotalExpressions = (formula: FormulaDefinition) => formula.expressions.length;

  // Custom field management
  const addCustomField = () => {
    if (!newFieldName.trim()) {
      toast.error('Please enter a field name');
      return;
    }

    if (customFields.some(field => field.name.toLowerCase() === newFieldName.toLowerCase())) {
      toast.error('A field with this name already exists');
      return;
    }

    const newField: CustomField = {
      id: `field_${Date.now()}`,
      name: newFieldName.trim(),
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
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
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
              id={field.id}
              checked={formulaFormData.customFieldValues[field.id] === 'true'}
              onCheckedChange={(checked) => setFormulaFormData({
                ...formulaFormData,
                customFieldValues: {
                  ...formulaFormData.customFieldValues,
                  [field.id]: checked ? 'true' : 'false'
                }
              })}
            />
            <Label htmlFor={field.id}>Yes</Label>
          </div>
        );
      case 'date':
        return (
          <Input
            type="date"
            value={formulaFormData.customFieldValues[field.id] || ''}
            onChange={(e) => setFormulaFormData({
              ...formulaFormData,
              customFieldValues: {
                ...formulaFormData.customFieldValues,
                [field.id]: e.target.value
              }
            })}
          />
        );
      default:
        return null;
    }
  };

  // Formula CRUD operations
  const handleCreateFormula = () => {
    if (!formulaFormData.name || !formulaFormData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newUID = generateFormulaUID(formulaFormData.name);
    const newFormula: FormulaDefinition = {
      id: `formula_${Date.now()}`,
      uid: newUID,
      name: formulaFormData.name,
      category: formulaFormData.category,
      description: formulaFormData.description,
      tags: formulaFormData.tags,
      status: 'draft',
      customFieldValues: formulaFormData.customFieldValues,
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
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
      const availableEFs = getAvailableEFs();
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
    if (!selectedFormula || !expressionFormData.name || !expressionFormData.expression) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newExpression: FormulaExpression = {
      id: `expr_${Date.now()}`,
      parentFormulaUID: selectedFormula.uid,
      name: expressionFormData.name,
      description: expressionFormData.description,
      expression: expressionFormData.expression,
      outputUnit: expressionFormData.outputUnit,
      versions: [
        {
          id: `ev_${Date.now()}`,
          versionUID: generateVersionUID(`expr_${Date.now()}`, '1.0'),
          parentExpressionId: `expr_${Date.now()}`,
          version: '1.0',
          expression: expressionFormData.expression,
          description: expressionFormData.description,
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
      expressions: [...selectedFormula.expressions, newExpression],
      latestVersion: '1.0'
    };

    setFormulaDefinitions(formulaDefinitions.map(formula => 
      formula.id === selectedFormula.id ? updatedFormula : formula
    ));

    setCreatedFormulaForWorkflow(updatedFormula);
    setSelectedFormula(updatedFormula);
    
    // Reset expression form
    setExpressionFormData({
      name: '',
      description: '',
      expression: '',
      outputUnit: ''
    });
    
    setIsAddExpressionDialogOpen(false);
    toast.success(`Expression added to Formula ${updatedFormula.uid}`);
  };

  // Use the context method to get EFs for assignment
  const getAvailableEFs = () => {
    try {
      const contextEFs = getMasterEFsForAssignment();
      return contextEFs.map(ef => ({
        uid: ef.uid,
        name: ef.name,
        category: ef.category,
        description: ef.description || '',
        source: 'master_db',
        latestValue: {
          value: ef.latestValue?.value || 0,
          unit: ef.latestValue?.unit || 'kg CO2e',
          version: '1.0'
        }
      }));
    } catch (error) {
      console.error('Error getting available EFs:', error);
      return [];
    }
  };

  const handleEFSelection = (ef: any) => {
    setSelectedEF(ef);
    setParameterFormData({
      ...parameterFormData,
      efUID: ef.uid,
      efDefinition: ef.name,
      efCategory: ef.category,
      unit: ef.latestValue.unit,
      defaultValue: ef.latestValue.value.toString()
    });
    setEfSearchTerm(ef.name);
    setIsEFSearchOpen(false);
  };

  // Handle form submission functions
  const handleEditFormula = (formula: FormulaDefinition) => {
    setSelectedFormula(formula);
    setFormulaFormData({
      name: formula.name,
      category: formula.category,
      description: formula.description,
      tags: formula.tags,
      customFieldValues: formula.customFieldValues
    });
    setIsCreateFormulaDialogOpen(true);
  };

  const handleDeleteFormula = (formulaId: string) => {
    setFormulaDefinitions(formulaDefinitions.filter(f => f.id !== formulaId));
    toast.success('Formula deleted');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master DB - Formulas</h1>
          <p className="text-gray-600 mt-1">Create and manage calculation formulas with parameters and expressions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsCreateFormulaDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Formula
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search formulas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {formulaCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Formulas</p>
                <p className="text-2xl font-bold">{formulaDefinitions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Formulas</p>
                <p className="text-2xl font-bold">{formulaDefinitions.filter(f => f.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Variable className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Parameters</p>
                <p className="text-2xl font-bold">{formulaDefinitions.reduce((acc, f) => acc + f.parameters.length, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Code2 className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expressions</p>
                <p className="text-2xl font-bold">{formulaDefinitions.reduce((acc, f) => acc + f.expressions.length, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formula Creation Workflow */}
      {(formulaCreationStep !== 'basic' && createdFormulaForWorkflow) && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Sparkles className="h-5 w-5" />
              Formula Creation Workflow
            </CardTitle>
            <p className="text-emerald-700">
              Continue building your formula "{createdFormulaForWorkflow.name}" (UID: {createdFormulaForWorkflow.uid})
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Basic Info</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${formulaCreationStep === 'parameters' ? 'bg-blue-500 text-white' : getTotalParameters(createdFormulaForWorkflow) > 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'} rounded-full flex items-center justify-center`}>
                    {getTotalParameters(createdFormulaForWorkflow) > 0 ? <CheckCircle className="h-5 w-5" /> : <Variable className="h-5 w-5" />}
                  </div>
                  <span className="font-medium">Parameters ({getTotalParameters(createdFormulaForWorkflow)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${formulaCreationStep === 'expressions' ? 'bg-blue-500 text-white' : getTotalExpressions(createdFormulaForWorkflow) > 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'} rounded-full flex items-center justify-center`}>
                    {getTotalExpressions(createdFormulaForWorkflow) > 0 ? <CheckCircle className="h-5 w-5" /> : <Calculator className="h-5 w-5" />}
                  </div>
                  <span className="font-medium">Expressions ({getTotalExpressions(createdFormulaForWorkflow)})</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setFormulaCreationStep('basic');
                  setCreatedFormulaForWorkflow(null);
                }}
              >
                Exit Workflow
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setSelectedFormula(createdFormulaForWorkflow);
                  setIsAddParameterDialogOpen(true);
                }}
                disabled={formulaCreationStep !== 'parameters'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Parameter
              </Button>
              <Button
                onClick={() => setFormulaCreationStep('expressions')}
                disabled={getTotalParameters(createdFormulaForWorkflow) === 0}
                variant="outline"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Move to Expressions
              </Button>
              {formulaCreationStep === 'expressions' && (
                <Button
                  onClick={() => {
                    setSelectedFormula(createdFormulaForWorkflow);
                    setIsAddExpressionDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expression
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formula Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formulas ({filteredFormulas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Formula Details</TableHead>
                <TableHead>Parameters</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFormulas.map((formula) => (
                <React.Fragment key={formula.id}>
                  {/* Main Formula Row */}
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
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{formula.name}</h4>
                          <Badge variant="outline" className="text-xs">{formula.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{formula.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>UID: {formula.uid}</span>
                          <span>•</span>
                          <span>{formula.tags.length} tags</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Variable className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{getTotalParameters(formula)} parameters</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {formula.parameters.slice(0, 3).map(param => (
                            <Badge 
                              key={param.id} 
                              variant="outline" 
                              className={`text-xs ${parameterTypeInfo[param.parameterType].badge}`}
                            >
                              {param.name}
                            </Badge>
                          ))}
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
                          onClick={() => handleDeleteFormula(formula.id)}
                          title="Delete Formula"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Content */}
                  {expandedFormulas.has(formula.id) && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gray-50 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Parameters Section */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <Variable className="h-4 w-4" />
                                Parameters ({formula.parameters.length})
                              </h4>
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
                            
                            <div className="space-y-3">
                              {formula.parameters.map(param => (
                                <div key={param.id} className="bg-white rounded-lg border p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
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
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleEditParameter(param)}
                                        title="Edit Parameter"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                          toast.info('Delete parameter functionality coming soon');
                                        }}
                                        title="Delete Parameter"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
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
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpressionExpansion(expression.id)}
                                      >
                                        {expandedExpressions.has(expression.id) ? 
                                          <ChevronDown className="h-4 w-4" /> : 
                                          <ChevronRight className="h-4 w-4" />
                                        }
                                      </Button>
                                      <Calculator className="h-4 w-4 text-orange-600" />
                                      <span className="font-medium text-sm">{expression.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        Output: {expression.outputUnit}
                                      </Badge>
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
                                  
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div><strong>Expression:</strong> <code className="bg-gray-100 px-1 rounded">{expression.expression}</code></div>
                                    {expression.description && <div><strong>Description:</strong> {expression.description}</div>}
                                  </div>

                                  {/* Expression Versions */}
                                  {expandedExpressions.has(expression.id) && (
                                    <div className="mt-3 pt-3 border-t">
                                      <h5 className="font-medium text-sm mb-2">Versions ({expression.versions.length})</h5>
                                      <div className="space-y-2">
                                        {expression.versions.map(version => (
                                          <div key={version.id} className="bg-gray-50 rounded p-3">
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">v{version.version}</Badge>
                                                <span className="text-xs text-gray-600">{version.versionUID}</span>
                                                {version.isActive && (
                                                  <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                                                )}
                                              </div>
                                            </div>
                                            <div className="text-xs">
                                              <strong>Expression:</strong> <code className="bg-white px-1 rounded">{version.expression}</code>
                                            </div>
                                            {version.description && (
                                              <p className="text-xs text-gray-500 mt-1">{version.description}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )) || (
                                <div className="text-center py-8 text-gray-500">
                                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>No expressions yet. Add your first expression to get started.</p>
                                </div>
                              )}
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

          {filteredFormulas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No formulas found matching your criteria.</p>
              <Button 
                className="mt-4" 
                onClick={() => setIsCreateFormulaDialogOpen(true)}
              >
                Create your first formula
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Formula Dialog */}
      <Dialog open={isCreateFormulaDialogOpen} onOpenChange={setIsCreateFormulaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              {selectedFormula ? 'Edit Formula' : 'Create New Formula'}
            </DialogTitle>
            <DialogDescription>
              {selectedFormula ? 'Update the formula definition' : 'Create a new calculation formula with parameters and expressions'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="formula-name">Formula Name *</Label>
                    <Input
                      id="formula-name"
                      value={formulaFormData.name}
                      onChange={(e) => setFormulaFormData({...formulaFormData, name: e.target.value})}
                      placeholder="e.g., Vehicle Emissions Calculator"
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

                <div className="space-y-2">
                  <Label htmlFor="formula-tags">Tags (comma-separated)</Label>
                  <Input
                    id="formula-tags"
                    value={formulaFormData.tags.join(', ')}
                    onChange={(e) => setFormulaFormData({
                      ...formulaFormData, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    placeholder="e.g., transport, fuel, emissions, scope1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            {customFields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Custom Fields
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsCustomFieldDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customFields.map((field) => (
                    <div key={field.id} className="grid grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>{field.name} {field.required && '*'}</Label>
                        {renderCustomFieldInput(field)}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomField(field.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Add Custom Fields Button */}
            {customFields.length === 0 && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Plus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Add Custom Fields</h3>
                    <p className="text-gray-600 mb-4">
                      Create additional fields to capture specific information for this formula
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => setIsCustomFieldDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Field
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateFormulaDialogOpen(false);
                setSelectedFormula(null);
                setFormulaFormData({
                  name: '',
                  category: '',
                  description: '',
                  tags: [],
                  customFieldValues: {}
                });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFormula}
              disabled={!formulaFormData.name || !formulaFormData.category}
            >
              {selectedFormula ? 'Update Formula' : 'Create Formula'}
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

      {/* Add Expression Dialog */}
      <Dialog open={isAddExpressionDialogOpen} onOpenChange={setIsAddExpressionDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-orange-600" />
              Add Expression {selectedFormula && `to ${selectedFormula.name}`}
            </DialogTitle>
            <DialogDescription>
              Create a mathematical expression that defines how to calculate the output using the formula parameters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expression Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expr-name">Expression Name *</Label>
                    <Input
                      id="expr-name"
                      value={expressionFormData.name}
                      onChange={(e) => setExpressionFormData({...expressionFormData, name: e.target.value})}
                      placeholder="e.g., Total CO2 Emissions"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expr-unit">Output Unit *</Label>
                    <Input
                      id="expr-unit"
                      value={expressionFormData.outputUnit}
                      onChange={(e) => setExpressionFormData({...expressionFormData, outputUnit: e.target.value})}
                      placeholder="e.g., kg CO2e, tonnes CO2, kWh"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expr-description">Description</Label>
                  <Textarea
                    id="expr-description"
                    value={expressionFormData.description}
                    onChange={(e) => setExpressionFormData({...expressionFormData, description: e.target.value})}
                    placeholder="Describe what this expression calculates"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expr-expression">Mathematical Expression *</Label>
                  <Textarea
                    id="expr-expression"
                    value={expressionFormData.expression}
                    onChange={(e) => setExpressionFormData({...expressionFormData, expression: e.target.value})}
                    placeholder="e.g., distance * fuel_consumption * emission_factor"
                    rows={3}
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500">
                    Use parameter names and mathematical operators (+, -, *, /, ^, parentheses)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Available Parameters Reference */}
            {selectedFormula && selectedFormula.parameters.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Parameters</CardTitle>
                  <p className="text-sm text-gray-600">Reference these parameter names in your expression</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedFormula.parameters.map(param => (
                      <div key={param.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                            {param.name}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {param.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{param.description || 'No description'}</p>
                        {param.unit && <p className="text-xs text-gray-500">Unit: {param.unit}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddExpressionDialogOpen(false);
                setExpressionFormData({
                  name: '',
                  description: '',
                  expression: '',
                  outputUnit: ''
                });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddExpression}
              disabled={!expressionFormData.name || !expressionFormData.expression || !expressionFormData.outputUnit}
            >
              Add Expression
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
              Create a custom field to capture additional information for formulas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-name">Field Name *</Label>
                <Input
                  id="field-name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="e.g., Reference Standard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-type">Field Type</Label>
                <Select value={newFieldType} onValueChange={setNewFieldType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="textarea">Long Text</SelectItem>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                    <SelectItem value="boolean">Yes/No</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newFieldType === 'dropdown' && (
              <div className="space-y-2">
                <Label htmlFor="field-options">Dropdown Options *</Label>
                <Input
                  id="field-options"
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  placeholder="Option 1, Option 2, Option 3"
                />
                <p className="text-xs text-gray-500">Separate options with commas</p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-required"
                checked={newFieldRequired}
                onCheckedChange={setNewFieldRequired}
              />
              <Label htmlFor="field-required">This field is required</Label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCustomFieldDialogOpen(false);
                setNewFieldName('');
                setNewFieldType('text');
                setNewFieldRequired(false);
                setNewFieldOptions('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={addCustomField}
              disabled={!newFieldName || (newFieldType === 'dropdown' && !newFieldOptions)}
            >
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}