import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { useMasterDB } from '../../contexts/MasterDBContext';
import FormulaExpressionEditor from './FormulaExpressionEditor';
import FormulasBulkUpload from './FormulasBulkUpload';
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
  Target
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
type FormulaParameterType = 'variable' | 'ef_value';

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
  uid: string;
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



// Parameter suggestion interface
interface ParameterSuggestion {
  id: string;
  name: string;
  type: string;
  unit?: string;
  description?: string;
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
  variable: {
    title: 'Variable (User Input)',
    description: 'User input values',
    color: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
    icon: Variable
  },
  ef_value: {
    title: 'Emission Factor',
    description: 'EF parameter reference',
    color: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: Database
  }
};

// Mathematical operators for BODMAS validation
const mathOperators = ['+', '-', '*', '/', '^', '(', ')', 'sqrt', 'log', 'ln', 'sin', 'cos', 'tan'];

export function FormulasHierarchical() {
  const { 
    masterEFDefinitions, 
    getMasterEFsForAssignment,
    masterFormulaDefinitions,
    setMasterFormulaDefinitions
  } = useMasterDB();

  // Main state
  const [formulaDefinitions, setFormulaDefinitions] = useState<FormulaDefinition[]>(masterFormulaDefinitions);
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
    parameterType: 'variable',
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

  // Expression builder states
  const [expressionInputRef, setExpressionInputRef] = useState<HTMLTextAreaElement | null>(null);
  const [showParameterSuggestions, setShowParameterSuggestions] = useState(false);
  const [parameterSuggestions, setParameterSuggestions] = useState<ParameterSuggestion[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isAddingParameterFromExpression, setIsAddingParameterFromExpression] = useState(false);
  
  // Expression editor page state
  const [showExpressionEditorPage, setShowExpressionEditorPage] = useState(false);
  const [formulaForExpression, setFormulaForExpression] = useState<FormulaDefinition | null>(null);
  
  // Bulk upload state
  const [showBulkUpload, setShowBulkUpload] = useState(false);

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

  const generateExpressionUID = (parentFormulaUID: string, expressionName: string) => {
    const cleanName = expressionName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
    const timestamp = Date.now().toString().slice(-6);
    return `expr_${parentFormulaUID}_${cleanName}_${timestamp}`;
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
  const getTotalParameters = (formula?: FormulaDefinition) => {
    if (formula) {
      return formula.parameters?.length || 0;
    }
    // Aggregate function - sum all parameters across all formulas
    return formulaDefinitions.reduce((total, f) => total + (f.parameters?.length || 0), 0);
  };
  
  const getTotalExpressions = (formula?: FormulaDefinition) => {
    if (formula) {
      return formula.expressions?.length || 0;
    }
    // Aggregate function - sum all expressions across all formulas
    return formulaDefinitions.reduce((total, f) => total + (f.expressions?.length || 0), 0);
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

  // Formula creation functions
  const startFormulaCreation = () => {
    // Clear selected formula for new creation
    setSelectedFormula(null);
    setFormulaFormData({
      name: '',
      category: '',
      description: '',
      tags: [],
      customFieldValues: {}
    });
    setIsCreateFormulaDialogOpen(true);
  };

  const resetForms = () => {
    setFormulaFormData({
      name: '',
      category: '',
      description: '',
      tags: [],
      customFieldValues: {}
    });
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
    setExpressionFormData({
      name: '',
      description: '',
      expression: '',
      outputUnit: ''
    });
  };

  // Formula CRUD operations
  const handleCreateFormula = () => {
    if (!formulaFormData.name) {
      toast.error('Please enter a Formula Definition Name');
      return;
    }

    if (selectedFormula && formulaFormData.name) {
      // Update existing formula
      const updatedFormula: FormulaDefinition = {
        ...selectedFormula,
        name: formulaFormData.name,
        category: formulaFormData.category,
        description: formulaFormData.description,
        tags: formulaFormData.tags,
        customFieldValues: formulaFormData.customFieldValues,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      };

      const updatedDefinitions = formulaDefinitions.map(f => 
        f.id === selectedFormula.id ? updatedFormula : f
      );
      setFormulaDefinitions(updatedDefinitions);
      setMasterFormulaDefinitions(updatedDefinitions);
      setSelectedFormula(updatedFormula);
      setIsCreateFormulaDialogOpen(false);
      
      // Reset form
      setFormulaFormData({
        name: '',
        category: '',
        description: '',
        tags: [],
        customFieldValues: {}
      });
      
      toast.success(`Formula Definition "${updatedFormula.name}" updated successfully.`);
    } else {
      // Create new formula
      const newUID = generateFormulaUID(formulaFormData.name);
      const newFormula: FormulaDefinition = {
        id: `formula_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uid: newUID,
        name: formulaFormData.name,
        category: formulaFormData.category || 'General',
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
      
      const updatedDefinitions = [...formulaDefinitions, newFormula];
      setFormulaDefinitions(updatedDefinitions);
      setMasterFormulaDefinitions(updatedDefinitions);
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
      
      toast.success(`Formula Definition created — UID ${newUID}. You can now add parameters and expressions below.`);
    }
  };

  const handleAddParameter = () => {
    if (!selectedFormula || !parameterFormData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newParameter: FormulaParameter = {
      id: `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      parameters: [...selectedFormula.parameters, newParameter]
    };

    const updatedDefinitions = formulaDefinitions.map(formula => 
      formula.id === selectedFormula.id ? updatedFormula : formula
    );
    setFormulaDefinitions(updatedDefinitions);
    setMasterFormulaDefinitions(updatedDefinitions);

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
    
    setIsAddParameterDialogOpen(false);
    toast.success(`Parameter "${newParameter.name}" added to Formula ${updatedFormula.uid}`);
  };

  // Effect to sync with context changes
  useEffect(() => {
    setFormulaDefinitions(masterFormulaDefinitions);
  }, [masterFormulaDefinitions]);

  // Convert parameter name to expression-safe format (replace spaces with underscores)
  const convertParameterNameForExpression = (parameterName: string): string => {
    return parameterName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_');
  };

  // Parameter suggestion and expression builder functions
  const getParameterSuggestions = (searchTerm: string): ParameterSuggestion[] => {
    if (!selectedFormula) return [];
    
    return selectedFormula.parameters
      .filter(param => 
        param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        param.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        convertParameterNameForExpression(param.name).toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(param => ({
        id: param.id,
        name: convertParameterNameForExpression(param.name), // Use underscore format for expressions
        type: param.type,
        unit: param.unit,
        description: `${param.name} → ${convertParameterNameForExpression(param.name)} (${param.unit || 'no unit'})`
      }));
  };

  const handleExpressionInputChange = (value: string) => {
    setExpressionFormData({...expressionFormData, expression: value});
    
    // Get cursor position
    const cursorPos = expressionInputRef?.selectionStart || 0;
    setCursorPosition(cursorPos);
    
    // Check if we should show parameter suggestions
    const words = value.split(/[\s+\-*/()^]+/);
    const currentWord = words[words.length - 1];
    
    if (currentWord && currentWord.length > 0) {
      const suggestions = getParameterSuggestions(currentWord);
      if (suggestions.length > 0) {
        setParameterSuggestions(suggestions);
        setShowParameterSuggestions(true);
      } else {
        setShowParameterSuggestions(false);
      }
    } else {
      setShowParameterSuggestions(false);
    }
  };

  const insertParameterIntoExpression = (parameterName: string) => {
    if (!expressionInputRef) return;
    
    const currentExpression = expressionFormData.expression;
    const cursorPos = expressionInputRef.selectionStart || 0;
    const beforeCursor = currentExpression.substring(0, cursorPos);
    const afterCursor = currentExpression.substring(cursorPos);
    
    // Find the start of the current word being typed to replace it
    const wordMatch = beforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
    const insertPosition = wordMatch ? cursorPos - wordMatch[0].length : cursorPos;
    
    // Convert parameter name to expression-safe format (already done in suggestions)
    const expressionParameterName = parameterName; // Already converted in getParameterSuggestions
    
    // Add space if needed for proper formatting
    let prefix = currentExpression.substring(0, insertPosition);
    let suffix = afterCursor;
    
    // Add space before parameter if previous character is not an operator or opening bracket
    if (prefix.length > 0 && !/[\s+\-*/()^]$/.test(prefix)) {
      prefix += ' ';
    }
    
    // Add space after parameter if next character is not an operator or closing bracket
    if (suffix.length > 0 && !/^[\s+\-*/()^]/.test(suffix)) {
      suffix = ' ' + suffix;
    }
    
    const newExpression = prefix + expressionParameterName + suffix;
    const newCursorPosition = prefix.length + expressionParameterName.length;
    
    setExpressionFormData({...expressionFormData, expression: newExpression});
    setShowParameterSuggestions(false);
    
    // Provide visual feedback
    toast.success(`Parameter "${expressionParameterName}" inserted into expression`);
    
    // Focus back to input and position cursor
    setTimeout(() => {
      if (expressionInputRef) {
        expressionInputRef.focus();
        expressionInputRef.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 10);
  };

  // Enhanced BODMAS validation with strict parameter checking
  const validateMathematicalExpression = (expression: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!expression.trim()) {
      return { isValid: false, errors: ['Expression cannot be empty'] };
    }
    
    // Check for balanced parentheses
    let parenthesesCount = 0;
    for (const char of expression) {
      if (char === '(') parenthesesCount++;
      if (char === ')') parenthesesCount--;
      if (parenthesesCount < 0) {
        errors.push('Unmatched closing parenthesis');
        break;
      }
    }
    if (parenthesesCount > 0) {
      errors.push('Unmatched opening parenthesis');
    }
    
    // Check for consecutive operators
    const consecutiveOperators = /[+\-*/^]{2,}/g;
    if (consecutiveOperators.test(expression)) {
      errors.push('Consecutive operators found');
    }
    
    // Check for operators at start/end (allow negative numbers)
    if (/^[+*/^]/.test(expression.trim())) {
      errors.push('Expression cannot start with an operator');
    }
    if (/[+\-*/^]$/.test(expression.trim())) {
      errors.push('Expression cannot end with an operator');
    }
    
    // Check for valid characters only
    const allowedPattern = /^[a-zA-Z_][a-zA-Z0-9_]*|[+\-*/^().,\s]|sqrt|log|ln|sin|cos|tan|abs|floor|ceil$/;
    const invalidChars = expression.split('').filter(char => 
      !char.match(/[a-zA-Z0-9_+\-*/^().,\s]/)
    );
    if (invalidChars.length > 0) {
      errors.push(`Invalid characters found: ${[...new Set(invalidChars)].join(', ')}`);
    }
    
    // Strict parameter validation - no free numbers allowed
    if (selectedFormula) {
      // Convert parameter names to expression-safe format for validation
      const parameterNames = selectedFormula.parameters.map(p => p.name);
      const expressionParameterNames = selectedFormula.parameters.map(p => convertParameterNameForExpression(p.name));
      const allowedFunctions = ['sqrt', 'log', 'ln', 'sin', 'cos', 'tan', 'abs', 'floor', 'ceil'];
      
      // Extract all words and numbers from the expression
      const tokens = expression.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b|\b\d+\.?\d*\b/g) || [];
      
      // Check for standalone numbers (not allowed - must be parameters)
      const freeNumbers = tokens.filter(token => /^\d+\.?\d*$/.test(token));
      
      if (freeNumbers.length > 0) {
        errors.push(`Numbers must be created as parameters first. Found: ${freeNumbers.join(', ')}. Please create these as 'Constant' type parameters to use them in expressions.`);
      }
      
      // Check for unknown parameters or functions
      const unknownTokens = tokens.filter(token => 
        !/^\d+\.?\d*$/.test(token) && // not a number
        !expressionParameterNames.includes(token) && // Check against expression-safe parameter names
        !allowedFunctions.includes(token)
      );
      
      if (unknownTokens.length > 0) {
        errors.push(`Unknown parameters or functions: ${unknownTokens.join(', ')}. Only created parameters and allowed functions can be used.`);
      }
      
      // Check that only created parameters are used
      const parameterTokens = tokens.filter(token => 
        !allowedFunctions.includes(token) && 
        !/^\d+\.?\d*$/.test(token)
      );
      
      const missingParameters = parameterTokens.filter(token => 
        !expressionParameterNames.includes(token)
      );
      
      if (missingParameters.length > 0) {
        // Show helpful message with original parameter names for missing ones
        const suggestedNames = missingParameters.map(token => {
          // Try to find a similar parameter name that might help
          const similarParam = parameterNames.find(name => 
            convertParameterNameForExpression(name).toLowerCase().includes(token.toLowerCase()) ||
            name.toLowerCase().includes(token.toLowerCase())
          );
          return similarParam ? `"${token}" (did you mean "${convertParameterNameForExpression(similarParam)}"?)` : `"${token}"`;
        });
        errors.push(`These parameters must be created first: ${suggestedNames.join(', ')}. Remember to use underscores instead of spaces in parameter names.`);
      }
    }
    
    // Check for proper function syntax
    const functionPattern = /\b(sqrt|log|ln|sin|cos|tan|abs|floor|ceil)\s*\(/g;
    const functions = expression.match(/\b(sqrt|log|ln|sin|cos|tan|abs|floor|ceil)\b/g) || [];
    functions.forEach(func => {
      if (!expression.includes(`${func}(`)) {
        errors.push(`Function ${func} must be followed by parentheses: ${func}()`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleAddExpression = () => {
    if (!selectedFormula || !expressionFormData.name || !expressionFormData.expression) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate expression
    const validation = validateMathematicalExpression(expressionFormData.expression);
    if (!validation.isValid) {
      toast.error(`Expression validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    const newExpressionId = `expr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newExpressionUID = generateExpressionUID(selectedFormula.uid, expressionFormData.name);
    
    const newExpression: FormulaExpression = {
      id: newExpressionId,
      uid: newExpressionUID,
      parentFormulaUID: selectedFormula.uid,
      name: expressionFormData.name,
      description: expressionFormData.description,
      expression: expressionFormData.expression,
      outputUnit: '',
      versions: [
        {
          id: `ev_${Date.now()}`,
          versionUID: generateVersionUID(newExpressionId, '1.0'),
          parentExpressionId: newExpressionId,
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
      latestVersion: '1.0',
      status: 'active' as const
    };

    const updatedDefinitions = formulaDefinitions.map(formula => 
      formula.id === selectedFormula.id ? updatedFormula : formula
    );
    setFormulaDefinitions(updatedDefinitions);
    setMasterFormulaDefinitions(updatedDefinitions);

    setSelectedFormula(updatedFormula);
    
    // Reset expression form
    setExpressionFormData({
      name: '',
      description: '',
      expression: '',
      outputUnit: ''
    });
    
    setIsAddExpressionDialogOpen(false);
    toast.success(`Expression "${newExpression.name}" added to Formula ${updatedFormula.uid}`);
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

  const handleEditParameter = (parameter: FormulaParameter) => {
    setEditingParameter(parameter);
    
    // Find the linked EF if it's an EF parameter
    let linkedEF = null;
    if (parameter.parameterType === 'ef_value' && parameter.efUID) {
      const availableEFs = getAvailableEFs();
      linkedEF = availableEFs.find(ef => ef.uid === parameter.efUID);
    }
    
    // Determine parameter type - with robust fallback logic
    let resolvedParameterType: FormulaParameterType = 'formula_parameter'; // default
    
    if (parameter.parameterType) {
      resolvedParameterType = parameter.parameterType;
    } else {
      // Legacy parameter detection logic
      if (parameter.efUID || parameter.efSource) {
        resolvedParameterType = 'ef_value';
      } else if (parameter.constantValue !== undefined && parameter.constantValue !== '') {
        resolvedParameterType = 'constant';
      } else {
        resolvedParameterType = 'formula_parameter';
      }
    }
    

    
    // Populate form with parameter data - ensure parameterType is set
    setParameterFormData({
      name: parameter.name,
      type: parameter.type,
      unit: parameter.unit || '',
      defaultValue: parameter.defaultValue?.toString() || '',
      description: parameter.description || '',
      required: parameter.required,
      minValue: parameter.minValue?.toString() || '',
      maxValue: parameter.maxValue?.toString() || '',
      parameterType: resolvedParameterType,
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

  // Show bulk upload page if active
  if (showBulkUpload) {
    return (
      <FormulasBulkUpload
        onBack={() => setShowBulkUpload(false)}
        onUploadSuccess={(newFormulas) => {
          setFormulaDefinitions([...formulaDefinitions, ...newFormulas]);
          setMasterFormulaDefinitions([...formulaDefinitions, ...newFormulas]);
          setShowBulkUpload(false);
        }}
      />
    );
  }

  // Show expression editor page if active
  if (showExpressionEditorPage && formulaForExpression) {
    return (
      <FormulaExpressionEditor
        formula={formulaForExpression}
        masterEmissionFactors={masterEFDefinitions}
        onSave={(data) => {
          const { expression, updatedFormula } = data;
          
          // Generate expression with version and UID
          const newExpressionId = `expr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newExpressionUID = generateExpressionUID(updatedFormula.uid, expression.name);
          
          const newExpression = {
            id: newExpressionId,
            uid: newExpressionUID,
            parentFormulaUID: updatedFormula.uid,
            name: expression.name,
            description: expression.description,
            expression: expression.expression,
            outputUnit: expression.outputUnit,
            versions: [
              {
                id: `ev_${Date.now()}`,
                versionUID: generateVersionUID(newExpressionId, '1.0'),
                parentExpressionId: newExpressionId,
                version: '1.0',
                expression: expression.expression,
                description: expression.description,
                isActive: true,
                createdAt: new Date().toISOString(),
                createdBy: 'admin'
              }
            ],
            createdAt: new Date().toISOString(),
            createdBy: 'admin'
          };

          // Update formulas list
          const updatedFormulas = formulaDefinitions.map(f => 
            f.uid === updatedFormula.uid 
              ? {
                  ...updatedFormula,
                  expressions: [...updatedFormula.expressions, newExpression],
                  latestVersion: '1.0'
                }
              : f
          );

          setFormulaDefinitions(updatedFormulas);
          setMasterFormulaDefinitions(updatedFormulas);
          setShowExpressionEditorPage(false);
          setFormulaForExpression(null);
          toast.success(`Expression "${newExpression.name}" added to Formula ${updatedFormula.uid}`);
        }}
        onCancel={() => {
          setShowExpressionEditorPage(false);
          setFormulaForExpression(null);
        }}
      />
    );
  }

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
              <h1 className="text-3xl font-semibold text-gray-900">Formulas</h1>
              <p className="text-gray-600">Manage formula definitions with parameters and expressions</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            onClick={startFormulaCreation}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Formula Definition
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
              <TableHead>Date Created</TableHead>
              <TableHead>Value/Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {filteredFormulas.map((formula, index) => {
                const isExpanded = expandedFormulas.has(formula.id);
                const hasAnyExpanded = expandedFormulas.size > 0;
                const shouldFade = hasAnyExpanded && !isExpanded;
                const isEvenRow = index % 2 === 0;
                
                return (
                <React.Fragment key={formula.id}>
                  {/* Formula Definition Row */}
                  <TableRow className={`border-l-4 border-l-emerald-500 hover:bg-emerald-100 transition-all duration-200 ${
                    isEvenRow ? 'bg-white' : 'bg-emerald-50/30'
                  } ${shouldFade ? 'opacity-30' : 'opacity-100'}`}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFormulaExpansion(formula.id)}
                        className="p-1"
                      >
                        <ChevronRight 
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
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
                      <div className="text-sm">{new Date(formula.createdAt).toLocaleDateString()}</div>
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
                              setFormulaDefinitions(formulaDefinitions.filter(f => f.id !== formula.id));
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
                  {isExpanded && (
                    <TableRow className="transition-opacity duration-300 opacity-100">
                      <TableCell colSpan={6} className="bg-emerald-50/50 p-0">
                        <div className="p-6">
                          <div className="grid grid-cols-1 gap-6">
                            
                            {/* Parameters Section - Hidden since parameter creation is integrated into expression builder */}
                            <div className="hidden">
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
                                {(formula.parameters || []).map(param => {
                                  // Map old parameter types to new ones for backward compatibility
                                  const mappedType = param.parameterType === 'formula_parameter' ? 'variable' : param.parameterType;
                                  const typeInfo = parameterTypeInfo[mappedType] || parameterTypeInfo['variable'];
                                  
                                  return (
                                  <div key={param.id} className="bg-white rounded-lg border p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-3">
                                        <div className={`p-1 rounded ${typeInfo.color}`}>
                                          {React.createElement(typeInfo.icon, { className: "h-3 w-3" })}
                                        </div>
                                        <span className="font-medium text-sm">{param.name}</span>
                                        <Badge className={`text-xs ${typeInfo.badge}`}>
                                          {param.parameterType === 'formula_parameter' ? 'VARIABLE' : 
                                           param.parameterType === 'constant' ? 'CONSTANT (LEGACY)' : 
                                           param.parameterType.replace('_', ' ').toUpperCase()}
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
                                            setFormulaDefinitions(formulaDefinitions.map(f => 
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
                                  );
                                })}
                                
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
                                    setFormulaForExpression(formula);
                                    setShowExpressionEditorPage(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Expression
                                </Button>
                              </div>
                              
                              {/* Expressions List */}
                              <div className="space-y-3">
                                {formula.expressions?.map(expression => (
                                  <div key={expression.id} className="bg-cyan-50/70 rounded-lg border border-cyan-200 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-3 flex-1">
                                        <Calculator className="h-4 w-4 text-cyan-600" />
                                        <span className="font-medium text-sm">{expression.name}</span>
                                        <Badge variant="outline" className="text-xs font-mono bg-white">
                                          {expression.uid}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => {
                                            // TODO: Implement edit expression functionality with the new page
                                            setFormulaForExpression(formula);
                                            setShowExpressionEditorPage(true);
                                          }}
                                          title="Edit Expression"
                                          className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-100"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => {
                                            const updatedFormula = {
                                              ...formula,
                                              expressions: formula.expressions.filter(e => e.id !== expression.id)
                                            };
                                            setFormulaDefinitions(formulaDefinitions.map(f => 
                                              f.id === formula.id ? updatedFormula : f
                                            ));
                                            toast.success('Expression deleted');
                                          }}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <div><strong>Expression:</strong> <code className="bg-gray-100 px-1 rounded">{expression.expression}</code></div>
                                      {expression.description && <div><strong>Description:</strong> {expression.description}</div>}
                                    </div>
                                  </div>
                                )) || (
                                  <div className="text-center py-8 text-gray-500">
                                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No expressions yet. Add calculation logic to complete the formula.</p>
                                    {formula.parameters.length === 0 && (
                                      <p className="text-xs mt-2">You need to add parameters first before creating expressions.</p>
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
                );
              })}

              {filteredFormulas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No formulas found matching your criteria.</p>
                    <Button 
                      className="mt-4" 
                      onClick={startFormulaCreation}
                    >
                      Create your first formula definition
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

      {/* Create Formula Definition Dialog */}
      <Dialog open={isCreateFormulaDialogOpen} onOpenChange={setIsCreateFormulaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              {selectedFormula && formulaFormData.name ? 'Edit Formula Definition' : 'Create Formula Definition'}
            </DialogTitle>
            <DialogDescription>
              {selectedFormula && formulaFormData.name 
                ? 'Update the basic structure and metadata for your formula.'
                : 'Create the basic structure and metadata for your new formula. You\'ll add parameters and expressions in the next steps.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Formula Definition Name */}
                <div className="space-y-2">
                  <Label htmlFor="formula-name">Formula Definition Name *</Label>
                  <Input
                    id="formula-name"
                    value={formulaFormData.name}
                    onChange={(e) => setFormulaFormData({...formulaFormData, name: e.target.value})}
                    placeholder="e.g., Vehicle Emissions Calculator"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="formula-description">Description (Optional)</Label>
                  <Textarea
                    id="formula-description"
                    value={formulaFormData.description}
                    onChange={(e) => setFormulaFormData({...formulaFormData, description: e.target.value})}
                    placeholder="Describe what this formula calculates"
                    rows={3}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="formula-tags">Tags (Optional)</Label>
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
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateFormulaDialogOpen(false);
                resetForms();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFormula}
              disabled={!formulaFormData.name}
            >
              {selectedFormula && formulaFormData.name ? 'Update Definition' : 'Create Definition & Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Parameter Dialog - Similar to existing but integrated with workflow */}
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
          setSelectedEF(null);
          setEfSearchTerm('');
          setIsEFSearchOpen(false);
          // Reset to show parameter type selection by default when reopened
          setShowParameterTypeSelection(true);
        } else {
          // Ensure parameter type selection is shown when dialog opens
          setShowParameterTypeSelection(true);
        }
      }}>
        <DialogContent className="max-w-[85vw] max-h-[90vh] overflow-y-auto">
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

          {/* Parameter Type Selection Step - Redesigned */}
          {showParameterTypeSelection && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-full border border-emerald-200">
                  <Variable className="h-6 w-6 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-emerald-900">Choose Parameter Type</h2>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                        <HelpCircle className="h-4 w-4 text-emerald-600" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96" side="bottom">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Need help choosing?</h4>
                            <div className="text-sm text-gray-600 space-y-2">
                              <p><strong>Formula Parameters:</strong> Use when you need users to provide different values each time they use the formula.</p>
                              <p><strong>Emission Factors:</strong> Use when you need standardized emission factor values from your databases.</p>
                              <p><strong>Constants:</strong> Use for fixed values that never change, like scientific constants or conversion factors.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Select the type of parameter you want to add to your formula. Each type serves different purposes in calculations.
                </p>
              </div>

              {/* Parameter Type Options - Vertical Layout */}
              <div className="space-y-4">
                
                {/* Variable (User Input) Option */}
                <div 
                  className="group cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                  onClick={() => {
                    setParameterFormData({
                      ...parameterFormData,
                      parameterType: 'variable'
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
                          <h3 className="text-xl font-semibold text-blue-900">Variable (User Input)</h3>
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
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Reference Value</Badge>
                        </div>
                        <p className="text-emerald-700 mb-3 leading-relaxed">
                          Create emission factor parameters with basic information. These can be linked to specific emission factors from Master or Client databases.
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Basic EF info</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Database reference</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Flexible setup</span>
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
                      <Label htmlFor="param-unit">Unit (Optional)</Label>
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="param-default">Default Value (Optional)</Label>
                      <Input
                        id="param-default"
                        value={parameterFormData.defaultValue}
                        onChange={(e) => setParameterFormData({...parameterFormData, defaultValue: e.target.value})}
                        placeholder="Default value (optional)"
                      />
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
                </CardContent>
              </Card>

              {/* Validation Rules (for variable parameters) */}
              {parameterFormData.parameterType === 'variable' && parameterFormData.type === 'number' && (
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
                    disabled={!parameterFormData.name}
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
      <Dialog open={isEditParameterDialogOpen} onOpenChange={setIsEditParameterDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Variable className="h-5 w-5 text-blue-600" />
              Edit Parameter
              {editingParameter && <span className="text-sm text-gray-600">— {editingParameter.name}</span>}
            </DialogTitle>
            <DialogDescription>
              Update the parameter configuration. Parameter type cannot be changed after creation.
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

                <div className="space-y-2">
                  <Label>Parameter Type</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={parameterTypeInfo[parameterFormData.parameterType || 'variable']?.badge || 'bg-gray-100 text-gray-800'}>
                      {parameterTypeInfo[parameterFormData.parameterType || 'variable']?.title || 'Variable (User Input)'}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {parameterTypeInfo[parameterFormData.parameterType || 'variable']?.description || 'Parameter type cannot be changed after creation'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-param-unit">Unit (Optional)</Label>
                    <Select 
                      value={parameterFormData.unit} 
                      onValueChange={(value) => setParameterFormData({...parameterFormData, unit: value})}
                      disabled={parameterFormData.parameterType === 'ef_value'}
                    >
                      <SelectTrigger className={parameterFormData.parameterType === 'ef_value' ? 'bg-gray-50 cursor-not-allowed' : ''}>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-param-default">Default Value (Optional)</Label>
                    <Input
                      id="edit-param-default"
                      value={parameterFormData.defaultValue}
                      onChange={(e) => setParameterFormData({...parameterFormData, defaultValue: e.target.value})}
                      placeholder="Default value (optional)"
                    />
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
              </CardContent>
            </Card>

            {/* Validation Rules (for variable parameters) */}
            {parameterFormData.parameterType === 'variable' && parameterFormData.type === 'number' && (
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
              onClick={() => {
                setIsEditParameterDialogOpen(false);
                setEditingParameter(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!editingParameter || !selectedFormula) return;
                
                // Update the parameter - ensure parameterType is preserved
                const updatedParameter: FormulaParameter = {
                  ...editingParameter,
                  name: parameterFormData.name,
                  type: parameterFormData.type,
                  unit: parameterFormData.unit,
                  defaultValue: parameterFormData.parameterType === 'constant' 
                    ? parameterFormData.constantValue 
                    : (parameterFormData.defaultValue ? (parameterFormData.type === 'number' ? parseFloat(parameterFormData.defaultValue) : parameterFormData.defaultValue) : undefined),
                  description: parameterFormData.description,
                  required: parameterFormData.required,
                  minValue: parameterFormData.minValue ? parseFloat(parameterFormData.minValue) : undefined,
                  maxValue: parameterFormData.maxValue ? parseFloat(parameterFormData.maxValue) : undefined,
                  parameterType: parameterFormData.parameterType, // Ensure parameterType is updated
                  constantValue: parameterFormData.parameterType === 'constant' ? parameterFormData.constantValue : editingParameter.constantValue,
                  constantDescription: parameterFormData.parameterType === 'constant' ? parameterFormData.constantDescription : editingParameter.constantDescription,
                  updatedAt: new Date().toISOString(),
                  updatedBy: 'admin'
                };

                const updatedFormula = {
                  ...selectedFormula,
                  parameters: selectedFormula.parameters.map(p => 
                    p.id === editingParameter.id ? updatedParameter : p
                  )
                };

                setFormulaDefinitions(formulaDefinitions.map(f => 
                  f.id === selectedFormula.id ? updatedFormula : f
                ));

                setSelectedFormula(updatedFormula);
                setIsEditParameterDialogOpen(false);
                setEditingParameter(null);
                toast.success(`Parameter "${updatedParameter.name}" updated successfully`);
              }}
              disabled={!parameterFormData.name || (parameterFormData.parameterType === 'constant' && !parameterFormData.constantValue)}
            >
              Update Parameter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expression Dialog - Enhanced with Parameter Suggestions */}
      <Dialog open={isAddExpressionDialogOpen} onOpenChange={setIsAddExpressionDialogOpen}>
        <DialogContent className="max-w-[90vw] max-h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              Add Mathematical Expression
              {selectedFormula && <span className="text-sm text-gray-600">to {selectedFormula.name}</span>}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <span>Create a mathematical expression using the formula parameters.</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-1">
                    <HelpCircle className="h-4 w-4 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" side="bottom">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Mathematical Expression Rules</h4>
                    <div className="space-y-2 text-xs">
                      <div><strong>BODMAS Order:</strong> Brackets → Orders (powers) → Division → Multiplication → Addition → Subtraction</div>
                      <div><strong>Operators:</strong> +, -, *, /, ^ (power), sqrt(), log(), ln()</div>
                      <div><strong>Grouping:</strong> Use ( ) for grouping operations</div>
                      <div><strong>Parameters:</strong> Must use exact parameter names from the list</div>
                      <div><strong>Constants:</strong> Only numbers from constant parameters allowed</div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Information in 2 rows */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Code2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">Expression Information</h3>
                    <p className="text-sm text-emerald-700">Define the basic details for your expression</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="expr-name" className="font-medium text-emerald-900">
                      Expression Name *
                    </Label>
                    <Input
                      id="expr-name"
                      value={expressionFormData.name}
                      onChange={(e) => setExpressionFormData({...expressionFormData, name: e.target.value})}
                      placeholder="e.g., Total CO2 Emissions"
                      className="h-12 bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expr-description" className="font-medium text-emerald-900">
                      Description
                    </Label>
                    <Input
                      id="expr-description"
                      value={expressionFormData.description}
                      onChange={(e) => setExpressionFormData({...expressionFormData, description: e.target.value})}
                      placeholder="Describe what this expression calculates"
                      className="h-12 bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                    />
                  </div>
                </div>
              </div>

              {/* Available Parameters - Redesigned */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <MousePointer className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Available Parameters</h3>
                      <p className="text-sm text-blue-700">Click any parameter to insert it into your expression. Names are shown in expression format (with underscores).</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingParameterFromExpression(true);
                      setShowParameterTypeSelection(true);
                      setIsAddParameterDialogOpen(true);
                    }}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Parameter
                  </Button>
                </div>
                
                {selectedFormula && selectedFormula.parameters.length > 0 ? (
                  <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/30 rounded-xl p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedFormula.parameters.map(param => {
                        const convertedName = convertParameterNameForExpression(param.name);
                        return (
                          <div 
                            key={param.id} 
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition-all duration-200 border border-blue-200 hover:border-blue-400 hover:shadow-md group"
                            onClick={() => {
                              const textarea = document.getElementById('expr-expression') as HTMLTextAreaElement;
                              if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const currentValue = expressionFormData.expression;
                                const newValue = currentValue.substring(0, start) + convertedName + currentValue.substring(end);
                                
                                setExpressionFormData({...expressionFormData, expression: newValue});
                                
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start + convertedName.length, start + convertedName.length);
                                }, 10);
                                
                                toast.success(`Parameter "${convertedName}" inserted`);
                              }
                            }}
                          >
                            <code className="text-sm font-mono font-semibold text-blue-900 group-hover:text-blue-700">
                              {convertedName}
                            </code>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <span className="font-medium">{param.defaultValue || '—'}</span>
                              {param.unit && <span className="text-gray-500">{param.unit}</span>}
                            </div>
                            {convertedName !== param.name && (
                              <div className="text-xs text-gray-500 italic">
                                ({param.name})
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                    <Variable className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No Parameters Available</p>
                    <p className="text-sm">Add parameters first before creating expressions.</p>
                  </div>
                )}
              </div>

              {/* Mathematical Expression Field - Redesigned */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                    <Calculator className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Mathematical Expression *</h3>
                    <p className="text-sm text-gray-700">Build your formula using the parameters above</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expr-expression" className="font-medium text-gray-900">
                      Expression Formula *
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="expr-expression"
                        value={expressionFormData.expression}
                        onChange={(e) => {
                          const value = e.target.value;
                          setExpressionFormData({...expressionFormData, expression: value});
                          
                          // Handle parameter suggestions
                          const cursorPos = e.target.selectionStart || 0;
                          const beforeCursor = value.substring(0, cursorPos);
                          const words = beforeCursor.split(/[\s+\-*/()^]+/);
                          const currentWord = words[words.length - 1];
                          
                          if (currentWord && currentWord.length > 0) {
                            const suggestions = getParameterSuggestions(currentWord);
                            if (suggestions.length > 0) {
                              setParameterSuggestions(suggestions);
                              setShowParameterSuggestions(true);
                              setCursorPosition(cursorPos);
                            } else {
                              setShowParameterSuggestions(false);
                            }
                          } else {
                            setShowParameterSuggestions(false);
                          }
                        }}
                        placeholder="Click parameters above or type: Distance_Traveled * Fuel_Consumption * Emission_Factor"
                        rows={4}
                        className="w-full font-mono bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-200 resize-none"
                      />
                      
                      {/* Parameter Suggestions Dropdown */}
                      {showParameterSuggestions && parameterSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                          {parameterSuggestions.map((suggestion) => (
                            <div
                              key={suggestion.id}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                const textarea = document.getElementById('expr-expression') as HTMLTextAreaElement;
                                if (textarea) {
                                  const currentValue = expressionFormData.expression;
                                  const cursorPos = cursorPosition;
                                  const beforeCursor = currentValue.substring(0, cursorPos);
                                  const afterCursor = currentValue.substring(cursorPos);
                                  
                                  // Find the word being typed to replace it completely
                                  const words = beforeCursor.split(/[\s+\-*/()^]+/);
                                  const currentWord = words[words.length - 1];
                                  const wordStart = beforeCursor.lastIndexOf(currentWord);
                                  
                                  const newValue = currentValue.substring(0, wordStart) + suggestion.name + afterCursor;
                                  
                                  setExpressionFormData({...expressionFormData, expression: newValue});
                                  setShowParameterSuggestions(false);
                                  
                                  setTimeout(() => {
                                    textarea.focus();
                                    textarea.setSelectionRange(wordStart + suggestion.name.length, wordStart + suggestion.name.length);
                                  }, 10);
                                  
                                  toast.success(`Parameter "${suggestion.name}" inserted`);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium text-sm">{suggestion.name}</span>
                                {suggestion.unit && (
                                  <span className="text-xs text-gray-500">{suggestion.unit}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expression Validation */}
                {expressionFormData.expression && (
                  <div className="mt-4">
                    {(() => {
                      const validation = validateMathematicalExpression(expressionFormData.expression);
                      return (
                        <div className={`p-3 rounded-lg border ${validation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center gap-2">
                            {validation.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`font-medium text-sm ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                              {validation.isValid ? 'Expression is valid ✓' : 'Expression has errors'}
                            </span>
                          </div>
                          {!validation.isValid && (
                            <ul className="list-disc list-inside text-xs text-red-700 space-y-1 mt-2 ml-6">
                              {validation.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t bg-gray-50 p-4">
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
                setShowParameterSuggestions(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddExpression}
              disabled={
                !expressionFormData.name || 
                !expressionFormData.expression || 
                !validateMathematicalExpression(expressionFormData.expression).isValid
              }
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Add Expression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Parameter Dialog - Redesigned with always-visible Unit and Value fields */}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Parameter: {editingParameter?.name}
            </DialogTitle>
            <DialogDescription>
              Update the parameter configuration. Parameter type cannot be changed after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Parameter Type Display */}
            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className={parameterTypeInfo[parameterFormData.parameterType || 'formula_parameter']?.badge || 'bg-blue-100 text-blue-800'}>
                      {parameterTypeInfo[parameterFormData.parameterType || 'formula_parameter']?.title || 'Formula Parameter'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">
                      {parameterTypeInfo[parameterFormData.parameterType || 'formula_parameter']?.description || 'Parameter type cannot be changed after creation'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-param-name">Parameter Name *</Label>
                    <Input
                      id="edit-param-name"
                      value={parameterFormData.name}
                      onChange={(e) => setParameterFormData({...parameterFormData, name: e.target.value})}
                      placeholder="e.g., distance_traveled"
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

            {/* Unit and Value - Always Visible */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Unit and Value Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Unit Field */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-param-unit">
                      Unit {(parameterFormData.parameterType === 'ef_value' || parameterFormData.parameterType === 'constant') && '*'}
                    </Label>
                    <Select 
                      value={parameterFormData.unit} 
                      onValueChange={(value) => setParameterFormData({...parameterFormData, unit: value})}
                      disabled={parameterFormData.parameterType === 'ef_value'}
                    >
                      <SelectTrigger 
                        id="edit-param-unit"
                        className={parameterFormData.parameterType === 'ef_value' ? 'bg-gray-50 cursor-not-allowed' : ''}
                      >
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
                    {parameterFormData.parameterType === 'ef_value' && (
                      <p className="text-xs text-gray-500">Unit is automatically retrieved from selected EF</p>
                    )}
                  </div>

                  {/* Value Field */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-param-value">
                      {parameterFormData.parameterType === 'constant' ? 'Constant Value *' : 
                       parameterFormData.parameterType === 'ef_value' ? 'EF Value' : 'Default Value'}
                    </Label>
                    <Input
                      id="edit-param-value"
                      value={parameterFormData.parameterType === 'constant' ? parameterFormData.constantValue : parameterFormData.defaultValue}
                      onChange={(e) => {
                        if (parameterFormData.parameterType === 'constant') {
                          setParameterFormData({...parameterFormData, constantValue: e.target.value});
                        } else {
                          setParameterFormData({...parameterFormData, defaultValue: e.target.value});
                        }
                      }}
                      placeholder={parameterFormData.parameterType === 'constant' ? 'Enter constant value' : 
                                   parameterFormData.parameterType === 'ef_value' ? 'EF value (auto-filled)' : 'Default value (optional)'}
                      disabled={parameterFormData.parameterType === 'ef_value'}
                      className={parameterFormData.parameterType === 'ef_value' ? 'bg-gray-50 cursor-not-allowed' : ''}
                    />
                    {parameterFormData.parameterType === 'ef_value' && (
                      <p className="text-xs text-gray-500">Value is automatically retrieved from selected EF</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Rules (for formula parameters) */}
            {parameterFormData.parameterType === 'formula_parameter' && parameterFormData.type === 'number' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Validation Rules
                  </CardTitle>
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
              onClick={() => {
                if (!editingParameter || !selectedFormula) return;
                
                // Update the parameter with proper type preservation
                const updatedParameter: FormulaParameter = {
                  ...editingParameter,
                  name: parameterFormData.name,
                  type: parameterFormData.type,
                  unit: parameterFormData.unit,
                  defaultValue: parameterFormData.parameterType === 'constant' 
                    ? parameterFormData.constantValue 
                    : (parameterFormData.defaultValue ? (parameterFormData.type === 'number' ? parseFloat(parameterFormData.defaultValue) : parameterFormData.defaultValue) : undefined),
                  description: parameterFormData.description,
                  required: parameterFormData.required,
                  minValue: parameterFormData.minValue ? parseFloat(parameterFormData.minValue) : undefined,
                  maxValue: parameterFormData.maxValue ? parseFloat(parameterFormData.maxValue) : undefined,
                  parameterType: parameterFormData.parameterType,
                  constantValue: parameterFormData.parameterType === 'constant' ? parameterFormData.constantValue : editingParameter.constantValue,
                  constantDescription: parameterFormData.parameterType === 'constant' ? parameterFormData.constantDescription : editingParameter.constantDescription,
                  updatedAt: new Date().toISOString(),
                  updatedBy: 'admin'
                };

                const updatedFormula = {
                  ...selectedFormula,
                  parameters: selectedFormula.parameters.map(p => 
                    p.id === editingParameter.id ? updatedParameter : p
                  )
                };

                setFormulaDefinitions(formulaDefinitions.map(f => 
                  f.id === selectedFormula.id ? updatedFormula : f
                ));

                setSelectedFormula(updatedFormula);
                setIsEditParameterDialogOpen(false);
                setEditingParameter(null);
                
                toast.success(`Parameter "${updatedParameter.name}" updated successfully`);
              }}
              disabled={!parameterFormData.name}
            >
              Update Parameter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}