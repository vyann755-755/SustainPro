import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { 
  Plus, 
  Upload, 
  Download, 
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
  Activity,
  Calculator,
  Variable,
  Code2,
  Hash,
  Zap,
  HelpCircle,
  ChevronLeft,
  MousePointer,
  Filter
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
  parameterType: FormulaParameterType;
  efUID?: string;
  constantValue?: string;
  versions: FormulaParameterVersion[];
  createdAt: string;
  createdBy: string;
}

interface FormulaExpression {
  id: string;
  parentFormulaUID: string;
  name: string;
  description?: string;
  expression: string;
  outputUnit: string;
  createdAt: string;
  createdBy: string;
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
  sourceType: 'custom' | 'assigned_from_master';
  masterFormulaUID?: string;
  isAssignedFromMaster?: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Parameter type information for UI
const parameterTypeInfo = {
  'formula_parameter': {
    title: 'Formula Parameter',
    description: 'User-provided parameter values during calculation',
    badge: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  'ef_value': {
    title: 'Emission Factor',
    description: 'Values from Master or Client Database',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  'constant': {
    title: 'Constant Value',
    description: 'Fixed values like GWP or conversion factors',
    badge: 'bg-purple-100 text-purple-800 border-purple-200'
  }
};

// Common units for parameters
const commonUnits = [
  // Mass
  { category: 'Mass', value: 'kg', label: 'kg (kilograms)' },
  { category: 'Mass', value: 't', label: 't (tonnes)' },
  { category: 'Mass', value: 'g', label: 'g (grams)' },
  { category: 'Mass', value: 'lb', label: 'lb (pounds)' },
  
  // Energy
  { category: 'Energy', value: 'MJ', label: 'MJ (megajoules)' },
  { category: 'Energy', value: 'kWh', label: 'kWh (kilowatt hours)' },
  { category: 'Energy', value: 'GJ', label: 'GJ (gigajoules)' },
  { category: 'Energy', value: 'BTU', label: 'BTU (British Thermal Units)' },
  
  // Distance
  { category: 'Distance', value: 'km', label: 'km (kilometers)' },
  { category: 'Distance', value: 'm', label: 'm (meters)' },
  { category: 'Distance', value: 'mi', label: 'mi (miles)' },
  { category: 'Distance', value: 'ft', label: 'ft (feet)' },
  
  // Volume
  { category: 'Volume', value: 'L', label: 'L (liters)' },
  { category: 'Volume', value: 'm³', label: 'm³ (cubic meters)' },
  { category: 'Volume', value: 'gal', label: 'gal (gallons)' },
  { category: 'Volume', value: 'ft³', label: 'ft³ (cubic feet)' },
  
  // Emissions
  { category: 'Emissions', value: 'kg CO₂e', label: 'kg CO₂e (kilograms CO₂ equivalent)' },
  { category: 'Emissions', value: 't CO₂e', label: 't CO₂e (tonnes CO₂ equivalent)' },
  { category: 'Emissions', value: 'kg CO₂e/kg', label: 'kg CO₂e/kg (emission factor per kg)' },
  { category: 'Emissions', value: 'kg CO₂e/kWh', label: 'kg CO₂e/kWh (emission factor per kWh)' },
  { category: 'Emissions', value: 'kg CO₂e/km', label: 'kg CO₂e/km (emission factor per km)' },
  
  // Time
  { category: 'Time', value: 'year', label: 'year (years)' },
  { category: 'Time', value: 'month', label: 'month (months)' },
  { category: 'Time', value: 'day', label: 'day (days)' },
  { category: 'Time', value: 'hour', label: 'hour (hours)' },
  
  // Dimensionless
  { category: 'Dimensionless', value: 'ratio', label: 'ratio (dimensionless ratio)' },
  { category: 'Dimensionless', value: 'percentage', label: '% (percentage)' },
  { category: 'Dimensionless', value: 'count', label: 'count (number of items)' }
];

// Form interfaces
interface FormulaFormData {
  name: string;
  category: string;
  description: string;
  tags: string[];
}

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

const ClientFormulasFixed: React.FC = () => {
  const { masterFormulaDefinitions, getMasterFormulasForAssignment } = useMasterDB();
  
  // State management
  const [clientFormulas, setClientFormulas] = useState<ClientFormulaDefinition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  const [expandedFormulas, setExpandedFormulas] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isCreateFormulaDialogOpen, setIsCreateFormulaDialogOpen] = useState(false);
  const [isEditFormulaDialogOpen, setIsEditFormulaDialogOpen] = useState(false);
  const [isAssignMasterFormulaDialogOpen, setIsAssignMasterFormulaDialogOpen] = useState(false);
  const [masterFormulaSearchTerm, setMasterFormulaSearchTerm] = useState('');
  const [selectedMasterFormulaIds, setSelectedMasterFormulaIds] = useState<string[]>([]);
  const [isAddParameterDialogOpen, setIsAddParameterDialogOpen] = useState(false);
  const [isAddExpressionDialogOpen, setIsAddExpressionDialogOpen] = useState(false);
  
  // Enhanced parameter dialog states
  const [showParameterTypeSelection, setShowParameterTypeSelection] = useState(true);
  const [selectedEF, setSelectedEF] = useState<any>(null);
  const [efSearchTerm, setEfSearchTerm] = useState('');
  const [isEFSearchOpen, setIsEFSearchOpen] = useState(false);
  
  // Enhanced expression dialog states
  const [parameterSuggestions, setParameterSuggestions] = useState<any[]>([]);
  const [showParameterSuggestions, setShowParameterSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  // Form states
  const [selectedFormula, setSelectedFormula] = useState<ClientFormulaDefinition | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<FormulaParameter | null>(null);
  const [selectedExpression, setSelectedExpression] = useState<FormulaExpression | null>(null);
  
  const [formulaForm, setFormulaForm] = useState<FormulaFormData>({
    name: '',
    category: '',
    description: '',
    tags: []
  });
  
  const [parameterForm, setParameterForm] = useState<ParameterFormData>({
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
  
  const [expressionForm, setExpressionForm] = useState<ExpressionFormData>({
    name: '',
    description: '',
    expression: '',
    outputUnit: ''
  });

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

  // Event listener for opening create dialog from CDB
  useEffect(() => {
    const handleOpenCreateDialog = () => {
      setIsCreateFormulaDialogOpen(true);
    };

    window.addEventListener('openCreateFormulaDialog', handleOpenCreateDialog);
    return () => {
      window.removeEventListener('openCreateFormulaDialog', handleOpenCreateDialog);
    };
  }, []);

  // Initialize with sample data
  useEffect(() => {
    const sampleFormulas: ClientFormulaDefinition[] = [
      {
        id: '1',
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
            createdAt: '2024-01-15',
            createdBy: 'john.doe@company.com'
          }
        ],
        status: 'active',
        latestVersion: '1.0',
        sourceType: 'custom',
        isAssignedFromMaster: false,
        createdAt: '2024-01-15',
        createdBy: 'john.doe@company.com'
      }
    ];
    setClientFormulas(sampleFormulas);
  }, []);

  // Helper functions
  const generateUID = (prefix: string) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp.toUpperCase()}_${random.toUpperCase()}`;
  };

  // Convert parameter name for use in expressions
  const convertParameterNameForExpression = (name: string) => {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/^_+|_+$/g, '');
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

  // Get available EFs for parameter linking
  const getAvailableEFs = () => {
    // This would normally come from MasterDB context, but for now return mock data
    return [
      {
        uid: 'EF_ELEC_GRID_US_2023',
        name: 'US Grid Electricity',
        category: 'Energy',
        description: 'Average US electricity grid emission factor',
        latestValue: { value: 0.385, unit: 'kg CO₂e/kWh' }
      },
      {
        uid: 'EF_GASOLINE_2023',
        name: 'Gasoline Combustion',
        category: 'Fuel',
        description: 'Gasoline combustion emission factor',
        latestValue: { value: 2.31, unit: 'kg CO₂e/L' }
      },
      {
        uid: 'EF_DIESEL_2023',
        name: 'Diesel Combustion',
        category: 'Fuel',
        description: 'Diesel combustion emission factor',
        latestValue: { value: 2.68, unit: 'kg CO₂e/L' }
      }
    ];
  };

  // Get parameter suggestions for expression building
  const getParameterSuggestions = (searchTerm: string) => {
    if (!selectedFormula) return [];
    
    return selectedFormula.parameters
      .map(param => ({
        ...param,
        name: convertParameterNameForExpression(param.name)
      }))
      .filter(param => 
        param.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
    const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory;
    const matchesDatabase = selectedDatabase === 'all' || 
                           (selectedDatabase === 'master' && formula.isAssignedFromMaster) ||
                           (selectedDatabase === 'client' && !formula.isAssignedFromMaster);
    
    return matchesSearch && matchesCategory && matchesDatabase;
  });

  // Statistics calculations
  const getTotalParameters = (formula: ClientFormulaDefinition) => {
    return formula.parameters?.length || 0;
  };

  const getTotalExpressions = (formula: ClientFormulaDefinition) => {
    return formula.expressions?.length || 0;
  };

  const getTotalParametersAll = () => {
    return clientFormulas.reduce((total, formula) => total + getTotalParameters(formula), 0);
  };

  const getTotalExpressionsAll = () => {
    return clientFormulas.reduce((total, formula) => total + getTotalExpressions(formula), 0);
  };

  const getAssignedFromMasterCount = () => {
    return clientFormulas.filter(f => f.isAssignedFromMaster).length;
  };

  // Reset forms
  const resetFormulaForm = () => {
    setFormulaForm({ name: '', category: '', description: '', tags: [] });
  };

  const resetParameterForm = () => {
    setParameterForm({
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
  };

  const resetExpressionForm = () => {
    setExpressionForm({ name: '', description: '', expression: '', outputUnit: '' });
  };

  // Handler functions
  const createFormulaDefinition = () => {
    if (!formulaForm.name || !formulaForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newUID = generateUID('CF');
    const newFormula: ClientFormulaDefinition = {
      id: generateUID('CF'),
      uid: newUID,
      name: formulaForm.name,
      category: formulaForm.category,
      description: formulaForm.description,
      tags: formulaForm.tags,
      parameters: [],
      expressions: [],
      status: 'draft',
      latestVersion: '1.0',
      sourceType: 'custom',
      isAssignedFromMaster: false,
      createdAt: new Date().toISOString(),
      createdBy: 'current.user@company.com'
    };

    setClientFormulas([...clientFormulas, newFormula]);
    
    // Auto-expand the new formula
    setExpandedFormulas(new Set([...expandedFormulas, newFormula.id]));
    
    setIsCreateFormulaDialogOpen(false);
    resetFormulaForm();
    toast.success(`Client Formula Definition created — UID ${newUID}. You can now add parameters and expressions below.`);
  };

  const updateFormulaDefinition = () => {
    if (!selectedFormula || !formulaForm.name || !formulaForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedFormula = {
      ...selectedFormula,
      name: formulaForm.name,
      category: formulaForm.category,
      description: formulaForm.description,
      tags: formulaForm.tags,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current.user@company.com'
    };

    setClientFormulas(clientFormulas.map(f => 
      f.id === selectedFormula.id ? updatedFormula : f
    ));
    
    setIsEditFormulaDialogOpen(false);
    setSelectedFormula(null);
    resetFormulaForm();
    toast.success('Formula updated successfully');
  };

  const deleteFormulaDefinition = (formula: ClientFormulaDefinition) => {
    if (window.confirm(`Are you sure you want to delete the formula "${formula.name}"?`)) {
      setClientFormulas(clientFormulas.filter(f => f.id !== formula.id));
      toast.success('Formula deleted successfully');
    }
  };

  const handleMasterFormulaSelection = (formulaId: string, checked: boolean) => {
    if (checked) {
      setSelectedMasterFormulaIds([...selectedMasterFormulaIds, formulaId]);
    } else {
      setSelectedMasterFormulaIds(selectedMasterFormulaIds.filter(id => id !== formulaId));
    }
  };

  const handleAssignSelectedMasterFormulas = () => {
    const selectedFormulas = getMasterFormulasForAssignment()
      .filter(formula => selectedMasterFormulaIds.includes(formula.id));
    
    const newFormulas = selectedFormulas.map(formula => {
      const newFormulaUID = generateUID('CF');
      
      return {
        id: generateUID('CF'),
        uid: newFormulaUID,
        name: formula.name,
        category: formula.category,
        description: formula.description,
        tags: [...(formula.tags || []), 'assigned-from-master'],
        parameters: formula.parameters?.map((param: any) => ({
          ...param,
          id: generateUID('CP'),
          parentFormulaUID: newFormulaUID,
          createdAt: new Date().toISOString(),
        createdBy: 'current.user@company.com'
      })) || [],
        expressions: formula.expressions?.map((expr: any) => ({
        ...expr,
        id: generateUID('CE'),
          parentFormulaUID: newFormulaUID,
        createdAt: new Date().toISOString(),
        createdBy: 'current.user@company.com'
      })) || [],
      status: 'active',
        latestVersion: formula.latestVersion || '1.0',
      sourceType: 'assigned_from_master',
      isAssignedFromMaster: true,
        masterFormulaUID: formula.uid,
      createdAt: new Date().toISOString(),
      createdBy: 'current.user@company.com'
      };
    });

    setClientFormulas([...clientFormulas, ...newFormulas]);
    setSelectedMasterFormulaIds([]);
    setMasterFormulaSearchTerm('');
    toast.success(`Formula "${selectedFormulas.length} formula(s)" assigned from Master DB successfully`);
    setIsAssignMasterFormulaDialogOpen(false);
  };

  const handleAssignMasterFormula = (formula: any) => {
    handleMasterFormulaSelection(formula.id, true);
  };

  const handleCancelAssignMasterFormula = () => {
    setSelectedMasterFormulaIds([]);
    setMasterFormulaSearchTerm('');
    setIsAssignMasterFormulaDialogOpen(false);
  };

  const handleEFSelection = (ef: any) => {
    setSelectedEF(ef);
    setParameterForm({
      ...parameterForm,
      efUID: ef.uid,
      efDefinition: ef.name,
      efCategory: ef.category,
      unit: ef.latestValue.unit,
      defaultValue: ef.latestValue.value.toString()
    });
    setEfSearchTerm(ef.name);
    setIsEFSearchOpen(false);
  };

  const addParameter = () => {
    if (!selectedFormula || !parameterForm.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate based on parameter type
    if (parameterForm.parameterType === 'ef_value' && !selectedEF) {
      toast.error('Please select an emission factor');
      return;
    }

    if (parameterForm.parameterType === 'constant' && !parameterForm.constantValue) {
      toast.error('Please provide a constant value');
      return;
    }

    const newParameter: FormulaParameter = {
      id: generateUID('CP'),
      parentFormulaUID: selectedFormula.uid,
      name: parameterForm.name,
      type: parameterForm.type,
      unit: parameterForm.unit,
      defaultValue: parameterForm.defaultValue || undefined,
      description: parameterForm.description,
      required: parameterForm.required,
      parameterType: parameterForm.parameterType,
      efUID: parameterForm.parameterType === 'ef_value' ? parameterForm.efUID : undefined,
      constantValue: parameterForm.parameterType === 'constant' ? parameterForm.constantValue : undefined,
      versions: [],
      createdAt: new Date().toISOString(),
      createdBy: 'current.user@company.com'
    };

    const updatedFormula = {
      ...selectedFormula,
      parameters: [...(selectedFormula.parameters || []), newParameter]
    };

    setClientFormulas(clientFormulas.map(f => 
      f.id === selectedFormula.id ? updatedFormula : f
    ));

    setIsAddParameterDialogOpen(false);
    resetParameterForm();
    toast.success(`Parameter "${newParameter.name}" added successfully`);
  };

  const addExpression = () => {
    if (!selectedFormula || !expressionForm.name || !expressionForm.expression) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate expression
    const validation = validateMathematicalExpression(expressionForm.expression);
    if (!validation.isValid) {
      toast.error(`Expression validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    const newExpression: FormulaExpression = {
      id: generateUID('CE'),
      parentFormulaUID: selectedFormula.uid,
      name: expressionForm.name,
      description: expressionForm.description,
      expression: expressionForm.expression,
      outputUnit: expressionForm.outputUnit,
      createdAt: new Date().toISOString(),
      createdBy: 'current.user@company.com'
    };

    const updatedFormula = {
      ...selectedFormula,
      expressions: [...(selectedFormula.expressions || []), newExpression]
    };

    setClientFormulas(clientFormulas.map(f => 
      f.id === selectedFormula.id ? updatedFormula : f
    ));

    setIsAddExpressionDialogOpen(false);
    resetExpressionForm();
    toast.success('Expression added successfully');
  };

  const startEdit = (formula: ClientFormulaDefinition) => {
    setSelectedFormula(formula);
    setFormulaForm({
      name: formula.name,
      category: formula.category,
      description: formula.description,
      tags: formula.tags
    });
    setIsEditFormulaDialogOpen(true);
  };

  const startAddParameter = (formula: ClientFormulaDefinition) => {
    setSelectedFormula(formula);
    resetParameterForm();
    setIsAddParameterDialogOpen(true);
  };

  const startAddExpression = (formula: ClientFormulaDefinition) => {
    setSelectedFormula(formula);
    resetExpressionForm();
    setIsAddExpressionDialogOpen(true);
  };

  const deleteParameter = (formula: ClientFormulaDefinition, parameterId: string) => {
    const updatedFormula = {
      ...formula,
      parameters: formula.parameters?.filter(p => p.id !== parameterId) || []
    };
    setClientFormulas(clientFormulas.map(f => 
      f.id === formula.id ? updatedFormula : f
    ));
    toast.success('Parameter deleted');
  };

  const deleteExpression = (formula: ClientFormulaDefinition, expressionId: string) => {
    const updatedFormula = {
      ...formula,
      expressions: formula.expressions?.filter(e => e.id !== expressionId) || []
    };
    setClientFormulas(clientFormulas.map(f => 
      f.id === formula.id ? updatedFormula : f
    ));
    toast.success('Expression deleted');
  };

  return (
    <div className="space-y-6">
      {/* Header - Exact same as EF layout */}
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
          <Button variant="outline" onClick={() => toast.success('Bulk upload completed: 5 Client Formulas inserted, 1 updated')}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            onClick={() => setIsAssignMasterFormulaDialogOpen(true)}
          >
            <Star className="h-4 w-4 mr-2" />
            Assign from Master DB
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            onClick={() => setIsCreateFormulaDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Client Formula Definition
          </Button>
        </div>
      </div>

      {/* Filters - Exact same as EF layout */}
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
      </div>

      {/* Stats Cards - Exact same as EF layout */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Formula Definitions</p>
                <p className="text-2xl font-semibold text-gray-900">{clientFormulas.length}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{getTotalParametersAll()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Expressions</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalExpressionsAll()}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{getAssignedFromMasterCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Hierarchical Table - Matches Master DB */}
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
                        {formula.isAssignedFromMaster && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            <Star className="h-3 w-3 mr-1" />
                            From Master DB
                          </Badge>
                        )}
                      </div>
                      {formula.description && (
                        <div className="text-sm text-gray-600">{formula.description}</div>
                      )}
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                          {formula.category}
                        </Badge>
                        {formula.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{formula.category}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-gray-600">
                      v{formula.latestVersion}
                      <div className="text-xs">{new Date(formula.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      <div>{getTotalParameters(formula)} parameters</div>
                      <div className="text-gray-500">{getTotalExpressions(formula)} expressions</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge 
                      variant={formula.status === 'active' ? 'default' : formula.status === 'draft' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {formula.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!formula.isAssignedFromMaster && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => startEdit(formula)}
                            title="Edit Formula Definition"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteFormulaDefinition(formula)}
                            title="Delete Formula Definition"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {formula.isAssignedFromMaster && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteFormulaDefinition(formula)}
                            title="Remove from Client DB"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Assigned from Master DB"
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded Content - Parameters and Expressions with Enhanced Layout */}
                {expandedFormulas.has(formula.id) && (
                  <TableRow className="border-l-4 border-l-emerald-300 bg-emerald-25">
                    <TableCell colSpan={7} className="p-0">
                      <div className="p-6 space-y-6">
                        {/* Parameters Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                                <Variable className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-cyan-900">Parameters</h3>
                                <p className="text-sm text-cyan-700">Input variables and constants for this formula</p>
                              </div>
                            </div>
                            
                            {!formula.isAssignedFromMaster && (
                              <Button
                                variant="outline"
                                onClick={() => startAddParameter(formula)}
                                className="border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Parameter
                              </Button>
                            )}
                          </div>
                          
                          {/* Parameters List */}
                          <div className="space-y-3">
                            {formula.parameters?.map(parameter => (
                              <div key={parameter.id} className="bg-white rounded-lg border p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <Variable className="h-4 w-4 text-cyan-600" />
                                    <span className="font-medium text-sm">{parameter.name}</span>
                                    <Badge className={`text-xs ${parameterTypeInfo[parameter.parameterType]?.badge || 'bg-gray-100 text-gray-800'}`}>
                                      {parameterTypeInfo[parameter.parameterType]?.title || parameter.parameterType}
                                    </Badge>
                                    {parameter.required && (
                                      <Badge variant="outline" className="text-xs">Required</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {!formula.isAssignedFromMaster && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => deleteParameter(formula, parameter.id)}
                                        title="Delete Parameter"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {formula.isAssignedFromMaster && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        title="Protected - From Master DB"
                                      >
                                        <Lock className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div><strong>Type:</strong> {parameter.type}</div>
                                    <div><strong>Unit:</strong> {parameter.unit || '—'}</div>
                                    <div><strong>Default:</strong> {parameter.defaultValue || '—'}</div>
                                  </div>
                                  {parameter.description && <div><strong>Description:</strong> {parameter.description}</div>}
                                </div>
                              </div>
                            )) || (
                              <div className="text-center py-8 text-gray-500">
                                <Variable className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No parameters yet. Add input variables to define the formula.</p>
                                {!formula.isAssignedFromMaster && (
                                  <Button 
                                    variant="outline" 
                                    className="mt-4"
                                    onClick={() => startAddParameter(formula)}
                                  >
                                    Add your first parameter
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expressions Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                                <Calculator className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-orange-900">Mathematical Expressions</h3>
                                <p className="text-sm text-orange-700">Calculation logic using the parameters above</p>
                              </div>
                            </div>
                            
                            {!formula.isAssignedFromMaster && (
                              <Button
                                variant="outline"
                                onClick={() => startAddExpression(formula)}
                                disabled={formula.parameters.length === 0}
                                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Expression
                              </Button>
                            )}
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
                                    {!formula.isAssignedFromMaster && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => deleteExpression(formula, expression.id)}
                                        title="Delete Expression"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {formula.isAssignedFromMaster && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        title="Protected - From Master DB"
                                      >
                                        <Lock className="h-4 w-4" />
                                      </Button>
                                    )}
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
                                {!formula.isAssignedFromMaster && formula.parameters.length > 0 && (
                                  <Button 
                                    variant="outline" 
                                    className="mt-4"
                                    onClick={() => startAddExpression(formula)}
                                  >
                                    Add your first expression
                                  </Button>
                                )}
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

            {filteredFormulas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No formulas found matching your criteria.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setIsCreateFormulaDialogOpen(true)}
                  >
                    Create your first client formula definition
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Client Formula Definition Dialog - Enhanced */}
      <Dialog open={isCreateFormulaDialogOpen} onOpenChange={setIsCreateFormulaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Create Client Formula Definition
            </DialogTitle>
            <DialogDescription>
              Create the basic structure and metadata for your new client-specific formula. You'll add parameters and expressions in the next steps.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Basic Information
                </CardTitle>
                <p className="text-sm text-gray-600">Define the core properties of your formula</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="formula-name" className="font-medium text-blue-900">Formula Name *</Label>
                    <Input
                      id="formula-name"
                      value={formulaForm.name}
                      onChange={(e) => setFormulaForm({ ...formulaForm, name: e.target.value })}
                      placeholder="e.g., Office Energy Consumption Calculator"
                      className="h-12 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formula-category" className="font-medium text-blue-900">Category *</Label>
                    <Select value={formulaForm.category} onValueChange={(value) => setFormulaForm({ ...formulaForm, category: value })}>
                      <SelectTrigger className="h-12 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-200">
                        <SelectValue placeholder="Select formula category" />
                      </SelectTrigger>
                      <SelectContent>
                        {formulaCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-gray-500" />
                              {category}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formula-description" className="font-medium text-blue-900">Description</Label>
                  <Textarea
                    id="formula-description"
                    value={formulaForm.description}
                    onChange={(e) => setFormulaForm({ ...formulaForm, description: e.target.value })}
                    placeholder="Describe what this formula calculates, its purpose, and specific use case for your client"
                    rows={3}
                    className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formula-tags" className="font-medium text-blue-900">Tags (comma-separated)</Label>
                  <Input
                    id="formula-tags"
                    value={formulaForm.tags.join(', ')}
                    onChange={(e) => setFormulaForm({
                      ...formulaForm, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    placeholder="e.g., energy, calculation, client-specific, building"
                    className="h-12 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formulaForm.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateFormulaDialogOpen(false);
                resetFormulaForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={createFormulaDefinition}
              disabled={!formulaForm.name || !formulaForm.category}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Create Definition & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Formula Dialog */}
      <Dialog open={isEditFormulaDialogOpen} onOpenChange={setIsEditFormulaDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Client Formula Definition</DialogTitle>
            <DialogDescription>
              Edit the selected formula definition
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-formula-name">Name *</Label>
                <Input
                  id="edit-formula-name"
                  value={formulaForm.name}
                  onChange={(e) => setFormulaForm({ ...formulaForm, name: e.target.value })}
                  placeholder="Enter formula name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-formula-category">Category *</Label>
                <Select value={formulaForm.category} onValueChange={(value) => setFormulaForm({ ...formulaForm, category: value })}>
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
              <Label htmlFor="edit-formula-description">Description</Label>
              <Textarea
                id="edit-formula-description"
                value={formulaForm.description}
                onChange={(e) => setFormulaForm({ ...formulaForm, description: e.target.value })}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFormulaDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateFormulaDefinition}>
              Update Formula Definition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Master Formula Dialog - Exact same layout as EF dialog */}
      <Dialog open={isAssignMasterFormulaDialogOpen} onOpenChange={setIsAssignMasterFormulaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-600" />
              Assign Formulas from Master Database
            </DialogTitle>
            <DialogDescription>
              Search and select formulas from the Master DB to assign to this client
            </DialogDescription>
          </DialogHeader>
          
          {/* Search Bar for Master Formulas - Same as EF */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search Master DB formulas by name, UID, category, or description..."
                  value={masterFormulaSearchTerm}
                  onChange={(e) => setMasterFormulaSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>
            {masterFormulaSearchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMasterFormulaSearchTerm('')}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          
          {/* Search Results Info - Same as EF */}
          <div className="flex items-center justify-between px-1 text-sm">
            <div className="text-gray-600">
              {masterFormulaSearchTerm ? (
                <>Showing {getMasterFormulasForAssignment && getMasterFormulasForAssignment()
                  .filter(formula => !clientFormulas.some(cf => cf.masterFormulaUID === formula.uid))
                  .filter(formula => 
                    formula.name.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase()) ||
                    formula.uid.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase()) ||
                    formula.category.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase()) ||
                    formula.description.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase())
                  ).length} of {getMasterFormulasForAssignment && getMasterFormulasForAssignment()
                  .filter(formula => !clientFormulas.some(cf => cf.masterFormulaUID === formula.uid)).length} formulas</>
              ) : (
                <>Available formulas: {getMasterFormulasForAssignment && getMasterFormulasForAssignment()
                  .filter(formula => !clientFormulas.some(cf => cf.masterFormulaUID === formula.uid)).length}</>
              )}
            </div>
          </div>
          
          {/* Master Formulas List - Same card structure as EF */}
          <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-2">
            {getMasterFormulasForAssignment && getMasterFormulasForAssignment()
              .filter(formula => !clientFormulas.some(cf => cf.masterFormulaUID === formula.uid))
              .filter(formula => !masterFormulaSearchTerm || 
                formula.name.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase()) ||
                formula.uid.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase()) ||
                formula.category.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase()) ||
                formula.description.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase())
              ).length > 0 ? (
              getMasterFormulasForAssignment()
                .filter(formula => !clientFormulas.some(cf => cf.masterFormulaUID === formula.uid))
                .filter(formula => !masterFormulaSearchTerm || 
                  formula.name.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase()) ||
                  formula.uid.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase()) ||
                  formula.category.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase()) ||
                  formula.description.toLowerCase().includes(masterFormulaSearchTerm.toLowerCase())
                )
                .map((formula) => (
                <Card 
                  key={formula.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-md border hover:border-blue-200"
                  onClick={() => handleMasterFormulaSelection(formula.id, !selectedMasterFormulaIds.includes(formula.id))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedMasterFormulaIds.includes(formula.id)}
                        onChange={() => {}} // Handled by card click
                        className="mt-0.5"
                      />
                      
                      <div className="flex-1 space-y-2">
                        {/* Header - Same as EF */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{formula.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                <Database className="h-3 w-3 mr-1" />
                                Master DB
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                                {formula.uid}
                              </code>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs">
                                {formula.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Details - Adapted for formulas */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Variable className="h-3 w-3" />
                              <span>Parameters: {formula.parametersCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Code2 className="h-3 w-3" />
                              <span>Expressions: {formula.expressionsCount || 0}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                v{formula.latestVersion || '1.0'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Latest Version
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Description - Same as EF */}
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {formula.description}
                        </p>
                        
                        {/* Tags - Adapted for formulas */}
                        {formula.tags && formula.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Tags:</span>
                            <div className="flex flex-wrap gap-1">
                              {formula.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No formulas found</p>
                <p className="text-sm">
                  {masterFormulaSearchTerm 
                    ? "Try adjusting your search terms" 
                    : "No Master DB formulas are available for assignment"
                  }
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t bg-gray-50 mt-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {selectedMasterFormulaIds.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {selectedMasterFormulaIds.length} formula(s) selected
                  </Badge>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancelAssignMasterFormula}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignSelectedMasterFormulas}
                  disabled={selectedMasterFormulaIds.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Assign Selected ({selectedMasterFormulaIds.length})
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Add Parameter Dialog - Replicated from Master DB */}
      <Dialog open={isAddParameterDialogOpen} onOpenChange={(open) => {
        setIsAddParameterDialogOpen(open);
        if (!open) {
          resetParameterForm();
        } else {
          setShowParameterTypeSelection(true);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Variable className="h-5 w-5 text-emerald-600" />
              {showParameterTypeSelection ? 'Select Parameter Type' : `Add ${parameterTypeInfo[parameterForm.parameterType]?.title}`} {selectedFormula && `${showParameterTypeSelection ? 'for' : 'to'} ${selectedFormula.name}`}
            </DialogTitle>
            <DialogDescription>
              {showParameterTypeSelection 
                ? 'Choose the type of parameter you want to create for this formula.'
                : (
                  <>
                    {parameterForm.parameterType === 'formula_parameter' && 'Create a parameter that will be provided by users when using this formula.'}
                    {parameterForm.parameterType === 'ef_value' && 'Link to an emission factor from Master DB or Client Database.'}
                    {parameterForm.parameterType === 'constant' && 'Define a fixed value parameter with a constant value.'}
                  </>
                )
              }
            </DialogDescription>
          </DialogHeader>

          {/* Parameter Type Selection Step */}
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

              {/* Parameter Type Options */}
              <div className="space-y-4">
                
                {/* Formula Parameter Option */}
                <div 
                  className="group cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                  onClick={() => {
                    setParameterForm({
                      ...parameterForm,
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
                    setParameterForm({
                      ...parameterForm,
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
                    setParameterForm({
                      ...parameterForm,
                      parameterType: 'constant'
                    });
                    setShowParameterTypeSelection(false);
                  }}
                >
                  <div className="p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl bg-gradient-to-r from-purple-50 to-indigo-50 transition-all duration-300">
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
                        value={parameterForm.name}
                        onChange={(e) => setParameterForm({...parameterForm, name: e.target.value})}
                        placeholder="e.g., Distance Traveled, Fuel Emission Factor"
                      />
                      {parameterForm.name && (
                        <p className="text-xs text-blue-600 mt-1">
                          In expressions: <code className="bg-blue-50 px-1 rounded text-blue-800 font-mono">{convertParameterNameForExpression(parameterForm.name)}</code>
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="param-type">Data Type</Label>
                      <Select value={parameterForm.type} onValueChange={(value: 'number' | 'text' | 'boolean') => setParameterForm({...parameterForm, type: value})}>
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
                      <Label htmlFor="param-unit">Unit {parameterForm.parameterType === 'ef_value' && '*'}</Label>
                      {parameterForm.parameterType === 'ef_value' ? (
                        <>
                          <Input
                            id="param-unit"
                            value={parameterForm.unit}
                            readOnly
                            className="bg-gray-50 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500">Unit is automatically retrieved from selected EF</p>
                        </>
                      ) : (
                        <Select 
                          value={parameterForm.unit} 
                          onValueChange={(value) => setParameterForm({...parameterForm, unit: value})}
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
                        {parameterForm.parameterType === 'ef_value' ? 'EF Value *' : 'Default Value'}
                      </Label>
                      <Input
                        id="param-default"
                        value={parameterForm.defaultValue}
                        onChange={(e) => setParameterForm({...parameterForm, defaultValue: e.target.value})}
                        placeholder={parameterForm.parameterType === 'ef_value' ? 'EF value (auto-filled)' : 'Default value (optional)'}
                        readOnly={parameterForm.parameterType === 'ef_value'}
                        className={parameterForm.parameterType === 'ef_value' ? 'bg-gray-50 cursor-not-allowed' : ''}
                      />
                      {parameterForm.parameterType === 'ef_value' && (
                        <p className="text-xs text-gray-500">Value is automatically retrieved from selected EF</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="param-description">Description</Label>
                    <Textarea
                      id="param-description"
                      value={parameterForm.description}
                      onChange={(e) => setParameterForm({...parameterForm, description: e.target.value})}
                      placeholder="Describe what this parameter represents"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="param-required"
                      checked={parameterForm.required}
                      onCheckedChange={(checked) => setParameterForm({...parameterForm, required: checked as boolean})}
                    />
                    <Label htmlFor="param-required">This parameter is required</Label>
                  </div>
                </CardContent>
              </Card>

              {/* EF Parameter Configuration */}
              {parameterForm.parameterType === 'ef_value' && (
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
                        <Select value={parameterForm.efSource} onValueChange={(value: 'master_db' | 'client_db') => setParameterForm({...parameterForm, efSource: value})}>
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
              {parameterForm.parameterType === 'constant' && (
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
                          value={parameterForm.constantValue}
                          onChange={(e) => setParameterForm({...parameterForm, constantValue: e.target.value})}
                          placeholder="e.g., 25, 3.14159, 1000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="constant-desc">Source/Reference</Label>
                        <Input
                          id="constant-desc"
                          value={parameterForm.constantDescription}
                          onChange={(e) => setParameterForm({...parameterForm, constantDescription: e.target.value})}
                          placeholder="e.g., IPCC AR6, Scientific literature"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Validation Rules (for formula parameters) */}
              {parameterForm.parameterType === 'formula_parameter' && parameterForm.type === 'number' && (
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
                          value={parameterForm.minValue}
                          onChange={(e) => setParameterForm({...parameterForm, minValue: e.target.value})}
                          placeholder="Optional minimum"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-value">Maximum Value</Label>
                        <Input
                          id="max-value"
                          type="number"
                          value={parameterForm.maxValue}
                          onChange={(e) => setParameterForm({...parameterForm, maxValue: e.target.value})}
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
                    onClick={addParameter}
                    disabled={!parameterForm.name || (parameterForm.parameterType === 'ef_value' && !selectedEF) || (parameterForm.parameterType === 'constant' && !parameterForm.constantValue)}
                  >
                    Add Parameter
                  </Button>
                </div>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Add Expression Dialog - Matches Master DB */}
      <Dialog open={isAddExpressionDialogOpen} onOpenChange={setIsAddExpressionDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
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
                      value={expressionForm.name}
                      onChange={(e) => setExpressionForm({...expressionForm, name: e.target.value})}
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
                      value={expressionForm.description}
                      onChange={(e) => setExpressionForm({...expressionForm, description: e.target.value})}
                      placeholder="Describe what this expression calculates"
                      className="h-12 bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                    />
                  </div>
                </div>
              </div>

              {/* Available Parameters - Redesigned */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <MousePointer className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Available Parameters</h3>
                    <p className="text-sm text-blue-700">Click any parameter to insert it into your expression. Names are shown in expression format (with underscores).</p>
                  </div>
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
                                const currentValue = expressionForm.expression;
                                const newValue = currentValue.substring(0, start) + convertedName + currentValue.substring(end);
                                
                                setExpressionForm({...expressionForm, expression: newValue});
                                
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
                        value={expressionForm.expression}
                        onChange={(e) => {
                          const value = e.target.value;
                          setExpressionForm({...expressionForm, expression: value});
                          
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
                                  const currentValue = expressionForm.expression;
                                  const cursorPos = cursorPosition;
                                  const beforeCursor = currentValue.substring(0, cursorPos);
                                  const afterCursor = currentValue.substring(cursorPos);
                                  
                                  // Find the word being typed to replace it completely
                                  const words = beforeCursor.split(/[\s+\-*/()^]+/);
                                  const currentWord = words[words.length - 1];
                                  const wordStart = beforeCursor.lastIndexOf(currentWord);
                                  
                                  const newValue = currentValue.substring(0, wordStart) + suggestion.name + afterCursor;
                                  
                                  setExpressionForm({...expressionForm, expression: newValue});
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="expr-output-unit" className="font-medium text-gray-900">
                      Output Unit *
                    </Label>
                    <Select 
                      value={expressionForm.outputUnit} 
                      onValueChange={(value) => setExpressionForm({...expressionForm, outputUnit: value})}
                    >
                      <SelectTrigger className="bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-200">
                        <SelectValue placeholder="Select output unit" />
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

                  {/* Expression Validation */}
                  {expressionForm.expression && (
                    <div className="mt-4">
                      {(() => {
                        const validation = validateMathematicalExpression(expressionForm.expression);
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
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50/50">
            <Button 
              variant="outline" 
              onClick={() => setIsAddExpressionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={addExpression}
              disabled={
                !expressionForm.name || 
                !expressionForm.expression || 
                !expressionForm.outputUnit ||
                !validateMathematicalExpression(expressionForm.expression).isValid
              }
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Add Expression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientFormulasFixed;