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
import { Formula, FormulaVersion, FormulaParameter } from '../../types';
import { FormulaManager } from './FormulaManager';
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
  Database
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Custom field types - for formula definition
type CustomFieldType = 'text' | 'number' | 'date' | 'dropdown' | 'boolean' | 'textarea';

interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[]; // for dropdown type
  defaultValue?: string;
}

// Parameter types for formula construction
type FormulaParameterType = 'custom' | 'ef_value' | 'constant';

interface FormulaParameterExtended extends FormulaParameter {
  parameterType: FormulaParameterType;
  // For EF Value parameters
  efSource?: 'master_db' | 'cdb'; // Where the EF value comes from
  efCategory?: string; // EF category
  efUID?: string; // Reference to specific EF
  // For constant parameters  
  constantValue?: number | string; // Fixed value for constants
}

// UID Generation Helper
const generateFormulaUID = (category: string, sequence: number): string => {
  const categoryCode = category ? category.substring(0, 3).toUpperCase() : 'GEN';
  return `FML-${categoryCode}-${new Date().getFullYear()}-${sequence.toString().padStart(3, '0')}`;
};

const generateVersionUID = (parentUID: string, version: string): string => {
  return `${parentUID}-V${version}`;
};

const mockFormulas: Formula[] = [
  {
    id: '1',
    uid: 'FML-TRA-2024-001',
    name: 'Transport Emission Calculation',
    description: 'Calculate emissions from transportation activities using distance and fuel efficiency',
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
        description: 'Total distance traveled',
        minValue: 0
      },
      { 
        id: '2', 
        name: 'fuel_efficiency', 
        type: 'number', 
        unit: 'L/100km', 
        defaultValue: 8, 
        required: true,
        description: 'Vehicle fuel efficiency',
        minValue: 0.1
      },
      { 
        id: '3', 
        name: 'emission_factor', 
        type: 'number', 
        unit: 'kg CO2e/L', 
        defaultValue: 2.31, 
        required: true,
        description: 'Fuel emission factor'
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
        expression: '(distance * fuel_efficiency / 100) * emission_factor',
        parameters: [
          { 
            id: '1', 
            name: 'distance', 
            type: 'number', 
            unit: 'km', 
            defaultValue: 0, 
            required: true,
            description: 'Total distance traveled',
            minValue: 0
          },
          { 
            id: '2', 
            name: 'fuel_efficiency', 
            type: 'number', 
            unit: 'L/100km', 
            defaultValue: 8, 
            required: true,
            description: 'Vehicle fuel efficiency',
            minValue: 0.1
          },
          { 
            id: '3', 
            name: 'emission_factor', 
            type: 'number', 
            unit: 'kg CO2e/L', 
            defaultValue: 2.31, 
            required: true,
            description: 'Fuel emission factor'
          }
        ],
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
    uid: 'FML-ENE-2024-001',
    name: 'Electricity Consumption Emissions',
    description: 'Calculate scope 2 emissions from electricity consumption',
    category: 'Energy',
    latestVersion: '2.0',
    parameters: [
      { 
        id: '4', 
        name: 'consumption', 
        type: 'number', 
        unit: 'kWh', 
        defaultValue: 0, 
        required: true,
        description: 'Electricity consumption amount',
        minValue: 0
      },
      { 
        id: '5', 
        name: 'grid_factor', 
        type: 'number', 
        unit: 'kg CO2e/kWh', 
        defaultValue: 0.42, 
        required: true,
        description: 'Grid emission factor for the region'
      },
      { 
        id: '6', 
        name: 'transmission_loss', 
        type: 'number', 
        unit: '%', 
        defaultValue: 5, 
        required: false,
        description: 'Transmission and distribution losses',
        minValue: 0,
        maxValue: 100
      }
    ],
    tags: ['electricity', 'scope-2', 'energy', 'grid'],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-10T08:30:00Z',
    versions: [
      {
        id: 'v2',
        versionUID: 'FML-ENE-2024-001-V2.0',
        parentUID: 'FML-ENE-2024-001',
        version: '2.0',
        expression: 'consumption * grid_factor * (1 + transmission_loss / 100)',
        parameters: [
          { 
            id: '4', 
            name: 'consumption', 
            type: 'number', 
            unit: 'kWh', 
            defaultValue: 0, 
            required: true,
            description: 'Electricity consumption amount',
            minValue: 0
          },
          { 
            id: '5', 
            name: 'grid_factor', 
            type: 'number', 
            unit: 'kg CO2e/kWh', 
            defaultValue: 0.42, 
            required: true,
            description: 'Grid emission factor for the region'
          },
          { 
            id: '6', 
            name: 'transmission_loss', 
            type: 'number', 
            unit: '%', 
            defaultValue: 5, 
            required: false,
            description: 'Transmission and distribution losses',
            minValue: 0,
            maxValue: 100
          }
        ],
        sourceName: 'EPA eGRID',
        sourceURL: 'https://www.epa.gov/egrid',
        sourceType: 'primary',
        algorithmType: 'linear',
        applicationScope: 'Facility electricity emissions',
        validationStatus: 'validated',
        isActive: true,
        createdAt: '2024-01-10T08:30:00Z',
        createdBy: 'admin'
      }
    ]
  }
];

const categories = ['Transport', 'Energy', 'Industrial Process', 'Materials', 'Waste', 'Agriculture', 'Buildings'];
const algorithmTypes = ['linear', 'logarithmic', 'polynomial', 'custom'];
const sourceTypes = ['primary', 'secondary', 'tertiary'];
const validationStatuses = ['pending', 'validated', 'rejected'];
const applicationScopes = [
  'Road transport emissions',
  'Facility electricity emissions', 
  'Industrial process emissions',
  'Material production emissions',
  'Waste treatment emissions',
  'Building energy emissions'
];

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  date: Calendar,
  dropdown: ChevronDown,
  boolean: Checkbox,
  textarea: Type
};

const parameterTypeIcons = {
  number: Hash,
  string: Type,
  enum: ChevronDown,
  boolean: CheckCircle
};

export function Formulas() {
  const [formulas, setFormulas] = useState<Formula[]>(mockFormulas);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isViewVersionsDialogOpen, setIsViewVersionsDialogOpen] = useState(false);
  const [isCustomFieldDialogOpen, setIsCustomFieldDialogOpen] = useState(false);
  const [isParameterManagerOpen, setIsParameterManagerOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  
  // Formula Definition Fields state (formerly Custom fields)
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
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    parameters: [] as FormulaParameter[],
    customFieldValues: {} as Record<string, any>
  });

  const [versionFormData, setVersionFormData] = useState({
    expression: '',
    sourceName: '',
    sourceURL: '',
    supportingDocs: [] as string[],
    methodology: '',
    sourceType: 'primary' as const,
    notes: '',
    algorithmType: 'linear' as const,
    applicationScope: '',
    validationStatus: 'pending' as const,
    derivationReason: ''
  });

  // Expression builder state
  const [showParameterSuggestions, setShowParameterSuggestions] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const expressionInputRef = React.useRef<HTMLInputElement>(null);

  const [newParameter, setNewParameter] = useState({
    name: '',
    type: 'number' as const,
    unit: '',
    defaultValue: '',
    description: '',
    required: false,
    minValue: '',
    maxValue: '',
    enumValues: [] as string[],
    parameterType: 'custom' as FormulaParameterType,
    efSource: 'master_db' as const,
    efCategory: '',
    efUID: '',
    constantValue: ''
  });

  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || formula.category === selectedCategory;
    const matchesDatabase = selectedDatabase === 'all' || !selectedDatabase || formula.database === selectedDatabase;
    
    return matchesSearch && matchesCategory && matchesDatabase;
  });

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
    
    // Initialize form data for new field
    setFormData({
      ...formData,
      customFieldValues: {
        ...formData.customFieldValues,
        [newField.id]: newField.defaultValue || ''
      }
    });

    setIsCustomFieldDialogOpen(false);
    toast.success(`Custom field "${newField.name}" added`);
  };

  const removeCustomField = (fieldId: string) => {
    setCustomFields(customFields.filter(field => field.id !== fieldId));
    
    // Remove from form data
    const newCustomFieldValues = { ...formData.customFieldValues };
    delete newCustomFieldValues[fieldId];
    setFormData({
      ...formData,
      customFieldValues: newCustomFieldValues
    });
    
    toast.success('Custom field removed');
  };

  const renderCustomFieldInput = (field: CustomField) => {
    const IconComponent = fieldTypeIcons[field.type];
    
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={formData.customFieldValues[field.id] || ''}
            onChange={(e) => setFormData({
              ...formData,
              customFieldValues: {
                ...formData.customFieldValues,
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
            value={formData.customFieldValues[field.id] || ''}
            onChange={(e) => setFormData({
              ...formData,
              customFieldValues: {
                ...formData.customFieldValues,
                [field.id]: e.target.value
              }
            })}
            placeholder="0"
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={formData.customFieldValues[field.id] || ''}
            onChange={(e) => setFormData({
              ...formData,
              customFieldValues: {
                ...formData.customFieldValues,
                [field.id]: e.target.value
              }
            })}
          />
        );
      
      case 'dropdown':
        return (
          <Select 
            value={formData.customFieldValues[field.id] || ''} 
            onValueChange={(value) => setFormData({
              ...formData,
              customFieldValues: {
                ...formData.customFieldValues,
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
              checked={formData.customFieldValues[field.id] || false}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                customFieldValues: {
                  ...formData.customFieldValues,
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
            value={formData.customFieldValues[field.id] || ''}
            onChange={(e) => setFormData({
              ...formData,
              customFieldValues: {
                ...formData.customFieldValues,
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

  const addParameter = () => {
    if (!newParameter.name.trim()) {
      toast.error('Parameter name is required');
      return;
    }

    // Validation based on parameter type
    if (newParameter.parameterType === 'ef_value' && !newParameter.efCategory) {
      toast.error('EF Category is required for EF Value parameters');
      return;
    }

    if (newParameter.parameterType === 'constant' && !newParameter.constantValue) {
      toast.error('Constant value is required for Constant parameters');
      return;
    }

    let defaultValue: any = '';
    switch (newParameter.type) {
      case 'number':
        if (newParameter.parameterType === 'constant') {
          defaultValue = parseFloat(newParameter.constantValue) || 0;
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

    const parameter: FormulaParameterExtended = {
      id: Date.now().toString(),
      name: newParameter.name,
      type: newParameter.type,
      unit: newParameter.unit || undefined,
      defaultValue,
      description: newParameter.description || undefined,
      required: newParameter.required,
      minValue: newParameter.minValue ? parseFloat(newParameter.minValue) : undefined,
      maxValue: newParameter.maxValue ? parseFloat(newParameter.maxValue) : undefined,
      enumValues: newParameter.type === 'enum' ? newParameter.enumValues : undefined,
      parameterType: newParameter.parameterType,
      efSource: newParameter.parameterType === 'ef_value' ? newParameter.efSource : undefined,
      efCategory: newParameter.parameterType === 'ef_value' ? newParameter.efCategory : undefined,
      efUID: newParameter.parameterType === 'ef_value' ? newParameter.efUID : undefined,
      constantValue: newParameter.parameterType === 'constant' ? newParameter.constantValue : undefined
    };

    setFormData({
      ...formData,
      parameters: [...formData.parameters, parameter as any]
    });

    // Reset parameter form
    setNewParameter({
      name: '',
      type: 'number',
      unit: '',
      defaultValue: '',
      description: '',
      required: false,
      minValue: '',
      maxValue: '',
      enumValues: [],
      parameterType: 'custom',
      efSource: 'master_db',
      efCategory: '',
      efUID: '',
      constantValue: ''
    });

    toast.success(`${newParameter.parameterType.toUpperCase()} parameter "${parameter.name}" added`);
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

    const sequence = formulas.length + 1;
    const newUID = generateFormulaUID(formData.category || 'General', sequence);

    const newFormula: Formula = {
      id: Date.now().toString(),
      uid: newUID,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      latestVersion: '',
      parameters: formData.parameters,
      tags: formData.tags,
      status: 'draft',
      database: 'master',
      createdBy: 'admin', // Would be current user
      createdAt: new Date().toISOString(),
      customAttributes: formData.customFieldValues,
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
      customFieldValues: {}
    });
    
    toast.success(`Formula created — UID ${newUID}`);
  };

  const handleEdit = (formula: Formula) => {
    console.log('handleEdit called with Formula:', formula.uid, formula.name);
    setEditingFormula(formula);
    setFormData({
      name: formula.name,
      description: formula.description,
      category: formula.category,
      tags: formula.tags,
      parameters: formula.parameters,
      customFieldValues: formula.customAttributes || {}
    });
    console.log('Opening edit dialog for:', formula.uid);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingFormula || !formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedFormula: Formula = {
      ...editingFormula,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      parameters: formData.parameters,
      customAttributes: formData.customFieldValues,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin' // Would be current user
    };

    setFormulas(formulas.map(formula => 
      formula.id === editingFormula.id ? updatedFormula : formula
    ));

    setIsEditDialogOpen(false);
    setEditingFormula(null);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: [],
      parameters: [],
      customFieldValues: {}
    });

    toast.success(`Formula ${updatedFormula.uid} updated successfully`);
  };

  const handleCreateVersion = () => {
    if (!selectedFormula || !versionFormData.expression || !versionFormData.sourceName) {
      toast.error('Please fill in all required version fields');
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
      parameters: selectedFormula.parameters, // Use formula's parameters
      sourceName: versionFormData.sourceName,
      sourceURL: versionFormData.sourceURL,
      supportingDocs: versionFormData.supportingDocs,
      methodology: versionFormData.methodology,
      sourceType: versionFormData.sourceType,
      notes: versionFormData.notes,
      algorithmType: versionFormData.algorithmType,
      applicationScope: versionFormData.applicationScope,
      validationStatus: versionFormData.validationStatus,
      derivationReason: versionFormData.derivationReason,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    };

    // Update the Formula with new version
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
    
    // Reset version form
    setVersionFormData({
      expression: '',
      sourceName: '',
      sourceURL: '',
      supportingDocs: [],
      methodology: '',
      sourceType: 'primary',
      notes: '',
      algorithmType: 'linear',
      applicationScope: '',
      validationStatus: 'pending',
      derivationReason: ''
    });
    
    toast.success(`Version ${versionNumber} created — UID ${versionUID}`);
  };

  const handleDelete = (formula: Formula) => {
    // Mock dependency check
    const hasDependencies = Math.random() > 0.7;
    
    if (hasDependencies) {
      toast.error(`Cannot delete ${formula.uid} — in use by 5 products and 2 templates`);
      return;
    }
    
    setFormulas(formulas.filter(item => item.id !== formula.id));
    toast.success(`Formula ${formula.uid} deleted successfully`);
  };

  const handleBulkUpload = () => {
    toast.success('Bulk upload completed: 8 formulas inserted, 2 updated, 1 skipped');
  };

  const copyUID = (uid: string) => {
    navigator.clipboard.writeText(uid);
    toast.success('UID copied to clipboard');
  };

  const getLatestVersionExpression = (formula: Formula) => {
    const latestVersion = formula.versions.find(v => v.version === formula.latestVersion);
    return latestVersion ? latestVersion.expression : null;
  };

  // Expression builder helper functions
  const getAvailableParameters = () => {
    return selectedFormula?.parameters || formData.parameters || [];
  };

  const insertParameterAtCursor = (parameterName: string, replaceCurrentWord: boolean = false) => {
    if (!expressionInputRef.current) return;
    
    const input = expressionInputRef.current;
    const currentExpression = versionFormData.expression;
    let startPos = input.selectionStart || cursorPosition;
    let endPos = input.selectionEnd || cursorPosition;
    
    // If we're replacing the current word (from suggestions), find word boundaries
    if (replaceCurrentWord && suggestionFilter) {
      const textBeforeCursor = currentExpression.substring(0, startPos);
      const textAfterCursor = currentExpression.substring(startPos);
      
      // Find the start of the current word
      const wordStart = textBeforeCursor.lastIndexOf(suggestionFilter);
      if (wordStart !== -1) {
        startPos = wordStart;
        endPos = wordStart + suggestionFilter.length;
      }
    }
    
    // Insert/replace parameter
    const newExpression = 
      currentExpression.substring(0, startPos) + 
      parameterName + 
      currentExpression.substring(endPos);
    
    setVersionFormData({
      ...versionFormData,
      expression: newExpression
    });
    
    // Set cursor position after inserted parameter
    setTimeout(() => {
      if (input) {
        input.focus();
        const newCursorPos = startPos + parameterName.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }
    }, 10);
    
    setShowParameterSuggestions(false);
    setSuggestionFilter('');
  };

  const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    setVersionFormData({
      ...versionFormData,
      expression: newValue
    });
    
    setCursorPosition(cursorPos);
    
    // Check if we should show parameter suggestions
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const words = textBeforeCursor.split(/[\s+\-*/()=<>!&|,]+/);
    const currentWord = words[words.length - 1];
    
    if (currentWord && currentWord.length > 0) {
      const availableParams = getAvailableParameters();
      const matchingParams = availableParams.filter(param =>
        param.name.toLowerCase().includes(currentWord.toLowerCase())
      );
      
      if (matchingParams.length > 0) {
        setSuggestionFilter(currentWord);
        setShowParameterSuggestions(true);
      } else {
        setShowParameterSuggestions(false);
      }
    } else {
      setShowParameterSuggestions(false);
    }
  };

  const updateCursorPosition = () => {
    if (expressionInputRef.current) {
      setCursorPosition(expressionInputRef.current.selectionStart || 0);
    }
  };

  const handleExpressionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showParameterSuggestions) {
      if (e.key === 'Escape') {
        setShowParameterSuggestions(false);
        setSuggestionFilter('');
      }
    }
  };

  const getFilteredParameters = () => {
    const availableParams = getAvailableParameters();
    if (!suggestionFilter) return availableParams;
    
    return availableParams.filter(param =>
      param.name.toLowerCase().includes(suggestionFilter.toLowerCase())
    );
  };

  // Expression validation functions
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: true, errors: [], warnings: [] });

  const validateExpression = () => {
    const expression = versionFormData.expression.trim();
    const availableParams = getAvailableParameters();
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!expression) {
      errors.push("Expression cannot be empty");
      setValidationResult({ isValid: false, errors, warnings });
      return;
    }

    if (availableParams.length === 0) {
      errors.push("No parameters defined. Expression must be built using defined parameters only.");
      setValidationResult({ isValid: false, errors, warnings });
      return;
    }

    // Define allowed mathematical operators and functions
    const mathOperators = ['+', '-', '*', '/', '^', '(', ')', '.', ','];
    const mathFunctions = ['sqrt', 'log', 'exp', 'sin', 'cos', 'tan', 'abs', 'floor', 'ceil', 'round', 'max', 'min'];
    const availableParamNames = availableParams.map(p => p.name);

    // Tokenize the expression - split by operators and whitespace but keep the delimiters
    const tokenPattern = /([+\-*/()^.,\s])/;
    const rawTokens = expression.split(tokenPattern);
    
    // Filter out empty strings and whitespace
    const tokens = rawTokens.filter(token => token.trim().length > 0 && token.trim() !== '');

    // Check each token
    const invalidTokens: string[] = [];
    
    for (const token of tokens) {
      const trimmedToken = token.trim();
      
      // Skip whitespace and empty tokens
      if (!trimmedToken) continue;
      
      // Check if it's a mathematical operator
      if (mathOperators.includes(trimmedToken)) continue;
      
      // Check if it's a mathematical function
      if (mathFunctions.includes(trimmedToken.toLowerCase())) continue;
      
      // Check if it's a valid parameter name
      if (availableParamNames.includes(trimmedToken)) continue;
      
      // Check if it's a number (this should be rejected)
      if (/^\d+\.?\d*$/.test(trimmedToken)) {
        invalidTokens.push(`"${trimmedToken}" (raw numbers not allowed - use parameters only)`);
        continue;
      }
      
      // Check if it's an alphanumeric identifier that's not a parameter
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedToken)) {
        invalidTokens.push(`"${trimmedToken}" (unknown parameter)`);
        continue;
      }
      
      // Any other invalid token
      invalidTokens.push(`"${trimmedToken}" (invalid token)`);
    }

    if (invalidTokens.length > 0) {
      errors.push(`Invalid elements in expression: ${invalidTokens.join(', ')}. Expression must be built using only defined parameters, mathematical operators (+, -, *, /, ^, parentheses), and functions (${mathFunctions.join(', ')}).`);
    }

    // Check if expression uses at least one parameter
    const usedParameters = tokens.filter(token => 
      availableParamNames.includes(token.trim())
    );

    if (usedParameters.length === 0) {
      errors.push("Expression must use at least one defined parameter.");
    }

    // Check for balanced parentheses
    const openParens = (expression.match(/\(/g) || []).length;
    const closeParens = (expression.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push("Unbalanced parentheses");
    }

    // Basic syntax validation (only if no invalid tokens found)
    if (invalidTokens.length === 0) {
      try {
        // Replace parameters with dummy values for syntax check
        let testExpression = expression;
        availableParamNames.forEach(param => {
          testExpression = testExpression.replace(new RegExp(`\\b${param}\\b`, 'g'), '1');
        });

        // Replace math functions with Math object
        mathFunctions.forEach(func => {
          testExpression = testExpression.replace(new RegExp(`\\b${func}\\(`, 'g'), `Math.${func}(`);
        });
        
        // Handle power operator ^ -> **
        testExpression = testExpression.replace(/\^/g, '**');

        // Try to evaluate the expression
        new Function('return ' + testExpression);
      } catch (error) {
        errors.push(`Invalid mathematical expression syntax: ${error instanceof Error ? error.message : 'Syntax error'}`);
      }
    }

    const isValid = errors.length === 0;
    setValidationResult({ isValid, errors, warnings });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Formulas</h1>
              <p className="text-gray-600">Manage mathematical algorithms for impact calculations</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Formula
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Create Formula
                </DialogTitle>
                <DialogDescription>
                  Create a new mathematical algorithm with structured UID generation and parameters
                </DialogDescription>
              </DialogHeader>
              
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
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Custom Field</DialogTitle>
                          <DialogDescription>
                            Create a custom field for formulas
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="field-name">Field Name *</Label>
                            <Input
                              id="field-name"
                              value={newFieldName}
                              onChange={(e) => setNewFieldName(e.target.value)}
                              placeholder="e.g. Quality Rating"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="field-type">Field Type</Label>
                            <Select value={newFieldType} onValueChange={(value) => setNewFieldType(value as CustomFieldType)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="dropdown">Dropdown</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="textarea">Textarea</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {newFieldType === 'dropdown' && (
                            <div className="space-y-2">
                              <Label htmlFor="field-options">Options (comma-separated)</Label>
                              <Input
                                id="field-options"
                                value={newFieldOptions}
                                onChange={(e) => setNewFieldOptions(e.target.value)}
                                placeholder="Option 1, Option 2, Option 3"
                              />
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="field-required"
                              checked={newFieldRequired}
                              onCheckedChange={(checked) => setNewFieldRequired(checked as boolean)}
                            />
                            <Label htmlFor="field-required">Required field</Label>
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Formula Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Transport Emission Calculation"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
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
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe what this formula calculates and how it works..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Custom Fields Display */}
              {customFields.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Custom Fields</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {customFields.map(field => {
                        const IconComponent = fieldTypeIcons[field.type];
                        return (
                          <div key={field.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {field.name} {field.required && <span className="text-red-500">*</span>}
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCustomField(field.id)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
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

              {/* Parameters Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Variable className="h-4 w-4" />
                    Formula Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add Parameter Form */}
                  <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="space-y-2">
                        <Label htmlFor="param-name">Parameter Name *</Label>
                        <Input
                          id="param-name"
                          value={newParameter.name}
                          onChange={(e) => setNewParameter({...newParameter, name: e.target.value})}
                          placeholder="e.g. distance"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="param-type">Type</Label>
                        <Select 
                          value={newParameter.type} 
                          onValueChange={(value) => 
                            setNewParameter({...newParameter, type: value as any})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="enum">Enum</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="param-unit">Unit</Label>
                        <Input
                          id="param-unit"
                          value={newParameter.unit}
                          onChange={(e) => setNewParameter({...newParameter, unit: e.target.value})}
                          placeholder="e.g. km, kg, %, etc."
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="space-y-2">
                        <Label htmlFor="param-default">Default Value</Label>
                        <Input
                          id="param-default"
                          value={newParameter.defaultValue}
                          onChange={(e) => setNewParameter({...newParameter, defaultValue: e.target.value})}
                          placeholder="Default value"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="param-desc">Description</Label>
                        <Input
                          id="param-desc"
                          value={newParameter.description}
                          onChange={(e) => setNewParameter({...newParameter, description: e.target.value})}
                          placeholder="Parameter description"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox
                        id="param-required"
                        checked={newParameter.required}
                        onCheckedChange={(checked) => setNewParameter({...newParameter, required: checked as boolean})}
                      />
                      <Label htmlFor="param-required">Required parameter</Label>
                    </div>
                    
                    <Button onClick={addParameter} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Parameter
                    </Button>
                  </div>

                  {/* Parameter List */}
                  {formData.parameters.length > 0 && (
                    <div className="space-y-2">
                      <Label>Added Parameters</Label>
                      <div className="space-y-2">
                        {formData.parameters.map((param) => (
                          <div key={param.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                            <div className="flex items-center gap-3">
                              <Variable className="h-4 w-4 text-blue-600" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{param.name}</span>
                                  <Badge variant="outline">{param.type}</Badge>
                                  {param.unit && <Badge variant="secondary">{param.unit}</Badge>}
                                  {param.required && <Badge variant="destructive">Required</Badge>}
                                </div>
                                {param.description && (
                                  <p className="text-sm text-gray-600 mt-1">{param.description}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParameter(param.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>
                  Create Formula
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
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
                {categories.map(category => (
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
                <SelectItem value="master">Master</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Professional Table */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30">
        <CardHeader className="border-b border-emerald-100/50 bg-gradient-to-r from-emerald-50/30 to-green-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Formula Database</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredFormulas.length} formulas • Master database
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Calculator className="h-3 w-3 mr-1" />
                {filteredFormulas.filter(f => f.status === 'active').length} Active
              </Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Clock className="h-3 w-3 mr-1" />
                {filteredFormulas.filter(f => f.status === 'draft').length} Draft
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100">
                  <TableHead className="font-semibold text-slate-700 border-r border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Formula Details
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 border-r border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Category
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 border-r border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Expression Preview
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 border-r border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Version
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 border-r border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormulas.map((formula, index) => {
                  const latestExpression = getLatestVersionExpression(formula);
                  return (
                    <TableRow 
                      key={formula.id} 
                      className={`
                        group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 
                        ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                        border-b border-slate-100/50
                      `}
                    >
                      <TableCell className="border-r border-slate-100/50">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyUID(formula.uid)}
                              className="h-auto p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <code className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {formula.uid}
                            </code>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm leading-tight">
                              {formula.name}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {formula.description}
                            </div>
                          </div>
                          {formula.tags && formula.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {formula.tags.slice(0, 3).map(tag => (
                                <Badge 
                                  key={tag} 
                                  variant="secondary" 
                                  className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {formula.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{formula.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="border-r border-slate-100/50">
                        <Badge 
                          variant="outline" 
                          className="bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-purple-200 font-medium"
                        >
                          <Building className="h-3 w-3 mr-1" />
                          {formula.category || 'General'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="border-r border-slate-100/50">
                        {latestExpression ? (
                          <div className="space-y-1">
                            <code className="text-xs font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded block truncate max-w-xs">
                              {latestExpression}
                            </code>
                            <div className="text-xs text-gray-500">
                              {formula.parameters.length} parameters
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No expression</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="border-r border-slate-100/50">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border-teal-200"
                          >
                            v{formula.latestVersion || '0.0'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFormula(formula);
                              setIsViewVersionsDialogOpen(true);
                            }}
                            className="h-auto p-1 text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                          >
                            <GitBranch className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      
                      <TableCell className="border-r border-slate-100/50">
                        <Badge 
                          variant={formula.status === 'active' ? 'default' : 'secondary'}
                          className={
                            formula.status === 'active' 
                              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0' 
                              : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200'
                          }
                        >
                          <div className="flex items-center gap-1">
                            {formula.status === 'active' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {formula.status}
                          </div>
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Edit button clicked for formula:', formula.uid);
                              handleEdit(formula);
                            }}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200"
                            title="Edit Formula"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Add Version Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFormula(formula);
                              setIsVersionDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 transition-all duration-200"
                            title="Add Version"
                          >
                            <GitBranch className="h-4 w-4" />
                          </Button>

                          {/* View Details Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFormula(formula);
                              setIsViewVersionsDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(formula)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200"
                            title="Delete Formula"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Formula
            </DialogTitle>
            <DialogDescription>
              Modify the formula details and parameters
            </DialogDescription>
          </DialogHeader>
          
          {/* Standard Fields */}
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
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Transport Emission Calculation"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
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
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what this formula calculates and how it works..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom Fields Display */}
          {customFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {customFields.map(field => {
                    const IconComponent = fieldTypeIcons[field.type];
                    return (
                      <div key={field.id} className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {renderCustomFieldInput(field)}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update Formula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Dialog */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-green-600" />
              Create Version
            </DialogTitle>
            <DialogDescription>
              Add a new version for formula: {selectedFormula?.uid}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Version Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="expression" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Mathematical Expression *
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Build your formula using the parameters defined above. Click parameter names or type to get suggestions.
                      </p>
                    </div>
                    
                    {/* Available Parameters Helper */}
                    {getAvailableParameters().length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Variable className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Available Parameters</span>
                          <Badge variant="outline" className="bg-blue-100 text-blue-700">
                            Click to insert
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {getAvailableParameters().map((param) => (
                            <Button
                              key={param.id}
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                insertParameterAtCursor(param.name, false);
                              }}
                              className="justify-start h-auto p-2 bg-white hover:bg-blue-100 border-blue-200 text-blue-800 hover:text-blue-900 transition-all duration-200 cursor-pointer"
                              type="button"
                            >
                              <div className="flex items-center gap-2 text-left">
                                <Hash className="h-3 w-3 text-blue-500" />
                                <div>
                                  <div className="font-mono text-xs font-medium">{param.name}</div>
                                  {param.unit && (
                                    <div className="text-xs text-blue-600">({param.unit})</div>
                                  )}
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Expression Input with Autocomplete */}
                    <div className="relative">
                      <Input
                        id="expression"
                        ref={expressionInputRef}
                        value={versionFormData.expression}
                        onChange={handleExpressionChange}
                        onKeyDown={handleExpressionKeyDown}
                        onFocus={updateCursorPosition}
                        onClick={updateCursorPosition}
                        onKeyUp={updateCursorPosition}
                        placeholder="e.g. (distance * fuel_efficiency / 100) * emission_factor"
                        className="font-mono text-sm bg-gray-50 border-gray-300 focus:bg-white transition-colors"
                      />
                      
                      {/* Parameter Suggestions Dropdown */}
                      {showParameterSuggestions && getFilteredParameters().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                          <div className="p-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">Parameter Suggestions</span>
                            </div>
                          </div>
                          {getFilteredParameters().map((param) => (
                            <button
                              key={param.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                insertParameterAtCursor(param.name, true);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition-colors text-left cursor-pointer"
                              type="button"
                            >
                              <Hash className="h-3 w-3 text-blue-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-mono text-sm font-medium text-gray-900">
                                  {param.name}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {param.type}
                                  </Badge>
                                  {param.unit && (
                                    <Badge variant="secondary" className="text-xs">
                                      {param.unit}
                                    </Badge>
                                  )}
                                </div>
                                {param.description && (
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    {param.description}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Expression Validation */}
                    <div className="space-y-3">
                      <Button
                        type="button"
                        onClick={validateExpression}
                        variant="outline"
                        className="flex items-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Validate Expression
                      </Button>
                      
                      {/* Validation Results - Displayed directly under the button */}
                      {(validationResult.errors.length > 0 || validationResult.warnings.length > 0 || 
                        (validationResult.isValid && versionFormData.expression.trim())) && (
                        <div className="space-y-2">
                          {validationResult.errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-red-900 mb-1">Validation Errors:</div>
                                  <ul className="text-sm text-red-700 space-y-1">
                                    {validationResult.errors.map((error, index) => (
                                      <li key={index}>• {error}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {validationResult.warnings.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-yellow-900 mb-1">Warnings:</div>
                                  <ul className="text-sm text-yellow-700 space-y-1">
                                    {validationResult.warnings.map((warning, index) => (
                                      <li key={index}>• {warning}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {validationResult.isValid && validationResult.errors.length === 0 && versionFormData.expression.trim() && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="font-medium text-green-900">Expression is valid!</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expression Helper */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-600">
                          <div className="font-medium mb-1">Expression Building Tips:</div>
                          <ul className="space-y-1 text-xs">
                            <li>• Use standard mathematical operators: +, -, *, /, (), ^</li>
                            <li>• Parameter names are case-sensitive</li>
                            <li>• Functions available: sqrt(), log(), exp(), sin(), cos(), tan(), abs(), floor(), ceil(), round(), max(), min()</li>
                            <li>• Example: <code className="bg-white px-1 rounded">sqrt(param1^2 + param2^2)</code></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="source-name">Source Name *</Label>
                      <Input
                        id="source-name"
                        value={versionFormData.sourceName}
                        onChange={(e) => setVersionFormData({...versionFormData, sourceName: e.target.value})}
                        placeholder="e.g. IPCC 2006 Guidelines"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="source-url">Source URL</Label>
                      <Input
                        id="source-url"
                        value={versionFormData.sourceURL}
                        onChange={(e) => setVersionFormData({...versionFormData, sourceURL: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="source-type">Source Type</Label>
                      <Select 
                        value={versionFormData.sourceType} 
                        onValueChange={(value) => setVersionFormData({...versionFormData, sourceType: value as any})}
                      >
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
                      <Label htmlFor="algorithm-type">Algorithm Type</Label>
                      <Select 
                        value={versionFormData.algorithmType} 
                        onValueChange={(value) => setVersionFormData({...versionFormData, algorithmType: value as any})}
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="validation-status">Validation Status</Label>
                      <Select 
                        value={versionFormData.validationStatus} 
                        onValueChange={(value) => setVersionFormData({...versionFormData, validationStatus: value as any})}
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="application-scope">Application Scope</Label>
                    <Select 
                      value={versionFormData.applicationScope} 
                      onValueChange={(value) => setVersionFormData({...versionFormData, applicationScope: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select application scope" />
                      </SelectTrigger>
                      <SelectContent>
                        {applicationScopes.map(scope => (
                          <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="methodology">Methodology</Label>
                    <Textarea
                      id="methodology"
                      value={versionFormData.methodology}
                      onChange={(e) => setVersionFormData({...versionFormData, methodology: e.target.value})}
                      placeholder="Describe the methodology used..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={versionFormData.notes}
                      onChange={(e) => setVersionFormData({...versionFormData, notes: e.target.value})}
                      placeholder="Additional notes or comments..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVersion}>
              Create Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Versions Dialog */}
      <Dialog open={isViewVersionsDialogOpen} onOpenChange={setIsViewVersionsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              Formula Details & Versions
            </DialogTitle>
            <DialogDescription>
              View all versions and details for: {selectedFormula?.uid}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFormula && (
            <div className="space-y-6">
              {/* Formula Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Formula Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Name</Label>
                      <p className="text-sm">{selectedFormula.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Category</Label>
                      <p className="text-sm">{selectedFormula.category || 'General'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge variant={selectedFormula.status === 'active' ? 'default' : 'secondary'}>
                        {selectedFormula.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Latest Version</Label>
                      <p className="text-sm">v{selectedFormula.latestVersion || '0.0'}</p>
                    </div>
                  </div>
                  
                  {selectedFormula.description && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      <p className="text-sm text-gray-700">{selectedFormula.description}</p>
                    </div>
                  )}
                  
                  {selectedFormula.tags && selectedFormula.tags.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-600">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedFormula.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Parameters */}
              {selectedFormula.parameters && selectedFormula.parameters.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedFormula.parameters.map((param) => (
                        <div key={param.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Variable className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{param.name}</span>
                                <Badge variant="outline">{param.type}</Badge>
                                {param.unit && <Badge variant="secondary">{param.unit}</Badge>}
                                {param.required && <Badge variant="destructive">Required</Badge>}
                              </div>
                              {param.description && (
                                <p className="text-sm text-gray-600 mt-1">{param.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            Default: {param.defaultValue?.toString() || 'None'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Versions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Version History</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedFormula.versions && selectedFormula.versions.length > 0 ? (
                    <div className="space-y-4">
                      {selectedFormula.versions.map((version) => (
                        <div key={version.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">v{version.version}</Badge>
                              <Badge variant={version.validationStatus === 'validated' ? 'default' : 'secondary'}>
                                {version.validationStatus}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(version.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Expression</Label>
                              <code className="block text-sm font-mono bg-gray-100 p-2 rounded mt-1">
                                {version.expression}
                              </code>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Source</Label>
                                <p className="text-sm">{version.sourceName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Algorithm Type</Label>
                                <p className="text-sm">{version.algorithmType}</p>
                              </div>
                            </div>
                            
                            {version.applicationScope && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Application Scope</Label>
                                <p className="text-sm">{version.applicationScope}</p>
                              </div>
                            )}
                            
                            {version.sourceURL && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Source URL</Label>
                                <a 
                                  href={version.sourceURL} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  {version.sourceURL}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                            
                            {version.notes && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Notes</Label>
                                <p className="text-sm text-gray-700">{version.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No versions created yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewVersionsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}