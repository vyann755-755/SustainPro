import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { 
  ArrowLeft,
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Calculator,
  CheckCircle,
  AlertCircle,
  Info,
  Variable,
  Database,
  Zap,
  Code2,
  HelpCircle,
  Lightbulb,
  Save,
  MousePointer,
  Target,
  ChevronRight,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Types
interface FormulaParameter {
  id: string;
  name: string;
  type: 'number' | 'text';
  unit: string;
  defaultValue: string;
  description: string;
  required: boolean;
  minValue?: string;
  maxValue?: string;
  parameterType: 'variable' | 'ef_value' | 'constant';
  efSource?: 'master_db' | 'client_db';
  efCategory?: string;
  efUID?: string;
  efDefinition?: string;
  constantValue?: string;
  constantDescription?: string;
}

interface FormulaDefinition {
  uid: string;
  name: string;
  category: string;
  description?: string;
  parameters: FormulaParameter[];
  expressions: any[];
  tags?: string[];
  customFieldValues?: Record<string, any>;
  latestVersion?: string;
  createdAt: string;
  createdBy: string;
}

interface ExpressionFormData {
  name: string;
  description: string;
  expression: string;
  outputUnit: string;
}

interface ParameterFormData {
  name: string;
  type: 'number' | 'text';
  unit: string;
  defaultValue: string;
  description: string;
  required: boolean;
  minValue: string;
  maxValue: string;
  parameterType: 'variable' | 'ef_value' | 'constant';
  efSource: 'master_db' | 'client_db';
  efCategory: string;
  efUID: string;
  efDefinition: string;
  constantValue: string;
  constantDescription: string;
}

interface FormulaExpressionEditorProps {
  formula: FormulaDefinition;
  onSave: (expressionData: any) => void;
  onCancel: () => void;
  masterEmissionFactors?: any[];
}

// Common units
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
  
  // Emissions
  { value: 'kgCO2e', label: 'kg CO2 equivalent', category: 'Emissions' },
  { value: 'tCO2e', label: 'tonnes CO2 equivalent', category: 'Emissions' },
  
  // Dimensionless
  { value: 'none', label: 'No unit', category: 'Dimensionless' },
  { value: 'ratio', label: 'Ratio', category: 'Dimensionless' },
  { value: '%', label: 'Percentage (%)', category: 'Dimensionless' },
];

// Parameter type information
const parameterTypeInfo = {
  variable: {
    title: 'Variable Parameter',
    description: 'A variable that will be provided by the user (e.g., distance, quantity)',
    icon: Variable,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  ef_value: {
    title: 'Emission Factor Parameter',
    description: 'A parameter that references an emission factor value',
    icon: Database,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
};

// Mathematical expression validation
const validateMathematicalExpression = (expression: string) => {
  const errors: string[] = [];
  let isValid = true;

  // Check for empty expression
  if (!expression.trim()) {
    return { isValid: false, errors: ['Expression cannot be empty'] };
  }

  // Check for balanced parentheses
  let parenthesesCount = 0;
  for (const char of expression) {
    if (char === '(') parenthesesCount++;
    if (char === ')') parenthesesCount--;
    if (parenthesesCount < 0) {
      errors.push('Unbalanced parentheses: closing parenthesis before opening');
      isValid = false;
      break;
    }
  }
  if (parenthesesCount > 0) {
    errors.push('Unbalanced parentheses: missing closing parenthesis');
    isValid = false;
  }

  // Check for valid operators (basic: +, -, *, /, ^, and parentheses)
  const invalidCharsRegex = /[^a-zA-Z0-9+\-*/^().\s_]/;
  if (invalidCharsRegex.test(expression)) {
    errors.push('Invalid characters detected. Only alphanumeric, +, -, *, /, ^, (), . and _ are allowed');
    isValid = false;
  }

  // Check for consecutive operators (except for negative numbers)
  const consecutiveOpsRegex = /[+\/*^]{2,}|--/;
  if (consecutiveOpsRegex.test(expression)) {
    errors.push('Consecutive operators detected');
    isValid = false;
  }

  // Check for operators at the beginning (except minus for negative numbers)
  if (/^[+\/*^]/.test(expression.trim())) {
    errors.push('Expression cannot start with an operator (except -)');
    isValid = false;
  }

  // Check for operators at the end
  if (/[+\-\/*^]$/.test(expression.trim())) {
    errors.push('Expression cannot end with an operator');
    isValid = false;
  }

  // Check for empty parentheses
  if (/\(\s*\)/.test(expression)) {
    errors.push('Empty parentheses detected');
    isValid = false;
  }

  return { isValid, errors };
};

// Enhanced validation with parameter checking
const validateExpressionWithParameters = (expression: string, parameters: FormulaParameter[] = []) => {
  // First run basic validation
  const basicValidation = validateMathematicalExpression(expression);
  
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  const errors: string[] = [];
  let isValid = true;

  // Extract all potential variable names (alphabetic sequences that could be parameter names)
  // This regex matches identifiers: letters/underscore followed by letters/numbers/underscores
  const variableRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
  const foundVariables = expression.match(variableRegex) || [];
  
  if (foundVariables.length > 0) {
    if (parameters.length === 0) {
      // If variables are found but no parameters exist
      const uniqueVariables = [...new Set(foundVariables)];
      errors.push(
        `Parameters detected: "${uniqueVariables.join('", "')}". ` +
        `No parameters have been created yet. Please create parameters first or use only constant values (numbers) and mathematical operators.`
      );
      isValid = false;
    } else {
      // Create a set of valid parameter names (converted for expression use)
      const validParameterNames = new Set(
        parameters.map(p => p.name.replace(/\s+/g, '_'))
      );
      
      // Check each variable found in the expression
      const invalidVariables: string[] = [];
      foundVariables.forEach(variable => {
        if (!validParameterNames.has(variable)) {
          invalidVariables.push(variable);
        }
      });
      
      if (invalidVariables.length > 0) {
        const uniqueInvalid = [...new Set(invalidVariables)];
        errors.push(
          `Invalid parameter(s): "${uniqueInvalid.join('", "')}". ` +
          `These parameters have not been created in the parameter list. ` +
          `Please create them first or use only numbers and mathematical operators (+, -, *, /, ^).`
        );
        isValid = false;
      }
    }
  }

  return { isValid, errors };
};

// Convert parameter name for expression use
const convertParameterNameForExpression = (name: string): string => {
  return name.replace(/\s+/g, '_');
};

export default function FormulaExpressionEditor({ 
  formula, 
  onSave, 
  onCancel,
  masterEmissionFactors = []
}: FormulaExpressionEditorProps) {
  const [expressionFormData, setExpressionFormData] = useState<ExpressionFormData>({
    name: '',
    description: '',
    expression: '',
    outputUnit: ''
  });

  const [parameterSuggestions, setParameterSuggestions] = useState<FormulaParameter[]>([]);
  const [showParameterSuggestions, setShowParameterSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Parameter creation states
  const [isAddParameterDialogOpen, setIsAddParameterDialogOpen] = useState(false);
  const [showParameterTypeSelection, setShowParameterTypeSelection] = useState(true);
  const [isAddingParameterFromExpression, setIsAddingParameterFromExpression] = useState(false);
  
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

  const [selectedEF, setSelectedEF] = useState<any>(null);
  const [efSearchTerm, setEfSearchTerm] = useState('');
  const [isEFSearchOpen, setIsEFSearchOpen] = useState(false);

  // Local formula state with parameters
  const [localFormula, setLocalFormula] = useState<FormulaDefinition>(formula);

  // Get parameter suggestions
  const getParameterSuggestions = (searchTerm: string): FormulaParameter[] => {
    if (!searchTerm || searchTerm.length < 1) return [];
    
    const lowerSearch = searchTerm.toLowerCase();
    return localFormula.parameters.filter(param => {
      const convertedName = convertParameterNameForExpression(param.name);
      return convertedName.toLowerCase().includes(lowerSearch);
    });
  };

  // Handle adding parameter
  const handleAddParameter = () => {
    if (!parameterFormData.name) {
      toast.error('Please enter a parameter name');
      return;
    }

    const newParameter: FormulaParameter = {
      id: `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: parameterFormData.name,
      type: parameterFormData.type,
      unit: parameterFormData.unit,
      defaultValue: parameterFormData.defaultValue,
      description: parameterFormData.description,
      required: parameterFormData.required,
      minValue: parameterFormData.minValue,
      maxValue: parameterFormData.maxValue,
      parameterType: parameterFormData.parameterType,
      efSource: parameterFormData.efSource,
      efCategory: parameterFormData.efCategory,
      efUID: parameterFormData.efUID,
      efDefinition: parameterFormData.efDefinition,
      constantValue: parameterFormData.constantValue,
      constantDescription: parameterFormData.constantDescription
    };

    setLocalFormula({
      ...localFormula,
      parameters: [...localFormula.parameters, newParameter]
    });

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
      parameterType: 'variable',
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
    setIsAddParameterDialogOpen(false);
    
    toast.success(`Parameter "${newParameter.name}" added successfully`);
  };

  // Handle saving expression
  const handleSaveExpression = () => {
    if (!expressionFormData.name || !expressionFormData.expression) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate expression with parameter checking
    const validation = validateExpressionWithParameters(expressionFormData.expression, localFormula.parameters);
    if (!validation.isValid) {
      toast.error(`Expression validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    // Pass the expression and updated formula back
    onSave({
      expression: {
        name: expressionFormData.name,
        description: expressionFormData.description,
        expression: expressionFormData.expression,
        outputUnit: ''
      },
      updatedFormula: localFormula
    });
  };

  // Handle EF selection
  const handleEFSelection = (ef: any) => {
    setSelectedEF(ef);
    setParameterFormData({
      ...parameterFormData,
      efUID: ef.uid,
      efDefinition: ef.name,
      efCategory: ef.category,
      unit: ef.latestValue?.unit || ''
    });
    setIsEFSearchOpen(false);
  };

  // Filter EFs based on search
  const filteredEFs = masterEmissionFactors.filter(ef => {
    const searchLower = efSearchTerm.toLowerCase();
    return (
      ef.name?.toLowerCase().includes(searchLower) ||
      ef.category?.toLowerCase().includes(searchLower) ||
      ef.uid?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-emerald-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Formulas
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calculator className="h-4 w-4" />
                  <span>Formula: {formula.name}</span>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Add Mathematical Expression
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveExpression}
                disabled={
                  !expressionFormData.name || 
                  !expressionFormData.expression || 
                  !validateExpressionWithParameters(expressionFormData.expression, localFormula.parameters).isValid
                }
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Expression
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1800px] mx-auto px-8 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Expression Builder (8 columns) */}
            <div className="col-span-8 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-emerald-200 shadow-sm">
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Code2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">Expression Information</h2>
                      <p className="text-sm text-emerald-100">Define the basic details for your expression</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="expr-name" className="font-medium text-gray-900">
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
                      <Label htmlFor="expr-description" className="font-medium text-gray-900">
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
              </div>

              {/* Expression Editor */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Calculator className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">Expression Formula Builder</h2>
                      <p className="text-sm text-gray-300">Build your mathematical expression using parameters</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="expr-expression" className="font-medium text-gray-900">
                        Expression Formula *
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-600">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Formula Guide
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96" align="end">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium mb-2">Supported Operators:</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><code className="bg-gray-100 px-2 py-1 rounded">+</code> Addition</div>
                                <div><code className="bg-gray-100 px-2 py-1 rounded">-</code> Subtraction</div>
                                <div><code className="bg-gray-100 px-2 py-1 rounded">*</code> Multiplication</div>
                                <div><code className="bg-gray-100 px-2 py-1 rounded">/</code> Division</div>
                                <div><code className="bg-gray-100 px-2 py-1 rounded">^</code> Power</div>
                                <div><code className="bg-gray-100 px-2 py-1 rounded">( )</code> Grouping</div>
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-2">Example:</h4>
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded block">
                                Distance_Traveled * Fuel_Consumption * Emission_Factor
                              </code>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
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
                        placeholder="Click parameters or type: Distance_Traveled * Fuel_Consumption * Emission_Factor"
                        rows={6}
                        className="w-full font-mono text-base bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-200 resize-none"
                      />
                      
                      {/* Parameter Suggestions Dropdown */}
                      {showParameterSuggestions && parameterSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                          {parameterSuggestions.map((suggestion) => {
                            const convertedName = convertParameterNameForExpression(suggestion.name);
                            return (
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
                                    
                                    const newValue = currentValue.substring(0, wordStart) + convertedName + afterCursor;
                                    
                                    setExpressionFormData({...expressionFormData, expression: newValue});
                                    setShowParameterSuggestions(false);
                                    
                                    setTimeout(() => {
                                      textarea.focus();
                                      textarea.setSelectionRange(wordStart + convertedName.length, wordStart + convertedName.length);
                                    }, 10);
                                    
                                    toast.success(`Parameter "${convertedName}" inserted`);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-medium text-sm">{convertedName}</span>
                                  {suggestion.unit && (
                                    <span className="text-xs text-gray-500">{suggestion.unit}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expression Validation */}
                  {expressionFormData.expression && (
                    <div>
                      {(() => {
                        const validation = validateExpressionWithParameters(expressionFormData.expression, localFormula.parameters);
                        return (
                          <div className={`p-3 rounded-lg border ${validation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2">
                              {validation.isValid ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`text-sm font-medium ${validation.isValid ? 'text-green-900' : 'text-red-900'}`}>
                                {validation.isValid ? 'Expression is valid' : 'Expression has errors'}
                              </span>
                            </div>
                            {!validation.isValid && validation.errors.length > 0 && (
                              <ul className="mt-2 ml-6 space-y-1">
                                {validation.errors.map((error, idx) => (
                                  <li key={idx} className="text-sm text-red-700 list-disc">{error}</li>
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

            {/* Right Column - Parameters (4 columns) */}
            <div className="col-span-4">
              <div className="bg-white rounded-xl border border-blue-200 shadow-sm sticky top-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <MousePointer className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-white">Available Parameters</h2>
                        <p className="text-sm text-blue-100">Click to insert into expression</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsAddingParameterFromExpression(true);
                      setShowParameterTypeSelection(true);
                      setIsAddParameterDialogOpen(true);
                    }}
                    className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Parameter
                  </Button>

                  {localFormula.parameters.length > 0 ? (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {localFormula.parameters.map(param => {
                        const convertedName = convertParameterNameForExpression(param.name);
                        const typeInfo = parameterTypeInfo[param.parameterType];
                        const TypeIcon = typeInfo.icon;
                        
                        return (
                          <div 
                            key={param.id} 
                            className={`p-3 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 border-2 ${typeInfo.bgColor} ${typeInfo.borderColor} hover:border-opacity-100 border-opacity-50`}
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
                            <div className="flex items-start gap-2">
                              <TypeIcon className={`h-4 w-4 ${typeInfo.color} mt-0.5 flex-shrink-0`} />
                              <div className="flex-1 min-w-0">
                                <div className="font-mono font-medium text-sm text-gray-900 break-all">
                                  {convertedName}
                                </div>
                                {param.unit && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Unit: {param.unit}
                                  </div>
                                )}
                                {param.description && (
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {param.description}
                                  </div>
                                )}
                                <Badge variant="outline" className={`mt-2 text-xs ${typeInfo.color}`}>
                                  {typeInfo.title}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Variable className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">No parameters yet</p>
                      <p className="text-xs mt-1">Add parameters to use in your expression</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Parameter Dialog - Keep as dialog for now since it's a sub-action */}
      {isAddParameterDialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Variable className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold text-lg">
                    {showParameterTypeSelection ? 'Select Parameter Type' : `Add ${parameterTypeInfo[parameterFormData.parameterType]?.title}`}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddParameterDialogOpen(false);
                    setShowParameterTypeSelection(true);
                    setParameterFormData({
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
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              {showParameterTypeSelection ? (
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(parameterTypeInfo).map(([type, info]) => {
                    const Icon = info.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setParameterFormData({ ...parameterFormData, parameterType: type as any });
                          setShowParameterTypeSelection(false);
                        }}
                        className={`p-6 rounded-xl border-2 ${info.borderColor} ${info.bgColor} hover:shadow-lg transition-all text-left group`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 ${info.bgColor} rounded-lg flex items-center justify-center border ${info.borderColor} group-hover:scale-110 transition-transform`}>
                            <Icon className={`h-6 w-6 ${info.color}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold mb-1 ${info.color}`}>{info.title}</h4>
                            <p className="text-sm text-gray-600">{info.description}</p>
                          </div>
                          <ChevronRight className={`h-5 w-5 ${info.color} group-hover:translate-x-1 transition-transform`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Parameter Name - Common for all types */}
                  <div className="space-y-2">
                    <Label>{parameterFormData.parameterType === 'variable' ? 'Variable Parameter Name' : 'EF Parameter Name'} *</Label>
                    <Input
                      value={parameterFormData.name}
                      onChange={(e) => setParameterFormData({...parameterFormData, name: e.target.value})}
                      placeholder={parameterFormData.parameterType === 'variable' ? 'e.g., Distance Traveled' : 'e.g., Fuel Emission Factor'}
                    />
                  </div>

                  {/* Description - Common for all types */}
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={parameterFormData.description}
                      onChange={(e) => setParameterFormData({...parameterFormData, description: e.target.value})}
                      placeholder="Describe this parameter"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowParameterTypeSelection(true)}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleAddParameter}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Add Parameter
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}