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
    
    // Reset version form
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
          <Button onClick={() => setIsDefinitionFieldDialogOpen(true)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Definition Fields
          </Button>
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
              <div key={formula.id} className="border border-gray-200 rounded-lg">
                {/* Formula Level */}
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFormulaExpansion(formula.id)}
                        className="p-0 h-6 w-6"
                      >
                        <ChevronRight className={`h-4 w-4 transition-transform ${
                          expandedFormulas.has(formula.id) ? 'rotate-90' : ''
                        }`} />
                      </Button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{formula.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {formula.uid}
                          </Badge>
                          <Badge className={
                            formula.status === 'active' ? 'bg-green-100 text-green-800' :
                            formula.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {formula.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{formula.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Category: {formula.category}</span>
                          <span>Parameters: {formula.parameters?.length || 0}</span>
                          <span>Versions: {formula.versions?.length || 0}</span>
                          <span>Latest: v{formula.latestVersion || 'None'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyUID(formula.uid)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFormula(formula);
                          setIsVersionDialogOpen(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(formula)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Formula Content */}
                {expandedFormulas.has(formula.id) && (
                  <div className="p-4 space-y-4">
                    {/* Parameters Section */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Formula Parameters ({formula.parameters?.length || 0})
                      </h4>
                      {formula.parameters && formula.parameters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {formula.parameters.map((param) => (
                            <div key={param.id} className="bg-gray-50 p-3 rounded border">
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-medium">{param.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {param.type}
                                  {param.unit && ` (${param.unit})`}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{param.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">
                                  Default: {param.defaultValue}
                                </span>
                                {param.required && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No parameters defined</p>
                      )}
                    </div>

                    {/* Versions Section */}
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Formula Versions ({formula.versions?.length || 0})
                      </h4>
                      {formula.versions && formula.versions.length > 0 ? (
                        <div className="space-y-2">
                          {formula.versions.map((version) => (
                            <div key={version.id} className="border rounded-lg">
                              <div className="p-3 bg-blue-50 border-b">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleVersionExpansion(version.id)}
                                      className="p-0 h-5 w-5"
                                    >
                                      <ChevronRight className={`h-3 w-3 transition-transform ${
                                        expandedVersions.has(version.id) ? 'rotate-90' : ''
                                      }`} />
                                    </Button>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Version {version.version}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {version.versionUID}
                                        </Badge>
                                        <Badge className={
                                          version.validationStatus === 'validated' ? 'bg-green-100 text-green-800' :
                                          version.validationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }>
                                          {version.validationStatus}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        <strong>Expression:</strong> {version.expression}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyUID(version.versionUID)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Expanded Version Details */}
                              {expandedVersions.has(version.id) && (
                                <div className="p-3 space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <strong>Source:</strong> {version.sourceName}
                                    </div>
                                    <div>
                                      <strong>Algorithm:</strong> {version.algorithmType}
                                    </div>
                                    <div>
                                      <strong>Source Type:</strong> {version.sourceType}
                                    </div>
                                    <div>
                                      <strong>Application:</strong> {version.applicationScope}
                                    </div>
                                  </div>
                                  {version.sourceURL && (
                                    <div className="text-sm">
                                      <strong>Source URL:</strong> 
                                      <a 
                                        href={version.sourceURL} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline ml-1"
                                      >
                                        {version.sourceURL}
                                      </a>
                                    </div>
                                  )}
                                  {version.notes && (
                                    <div className="text-sm">
                                      <strong>Notes:</strong> {version.notes}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No versions created yet</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Formula Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              Create New Formula
            </DialogTitle>
            <DialogDescription>
              Define formula basic information and add parameters with three types: Formula Parameters, EF Value Parameters, and Constant Parameters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
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
                  placeholder="Describe what this formula calculates and how it should be used"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Parameter Types Info */}
            <div>
              <h3 className="font-semibold mb-4">Parameter Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(parameterTypeInfo).map(([type, info]) => {
                  const Icon = info.icon;
                  return (
                    <Card key={type} className={`border-2 transition-all hover:shadow-md ${
                      newParameter.parameterType === type ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${info.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{info.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{info.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Current Parameters */}
            {formData.parameters.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Current Parameters ({formData.parameters.length})</h3>
                <div className="space-y-3">
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
                                {param.efCategory && <div><strong>Category:</strong> {param.efCategory}</div>}
                                {param.efUID && <div><strong>EF UID:</strong> {param.efUID}</div>}
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
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Add Parameter */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Add Parameters</h3>
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

              {showParameterForm && (
                <Card className="border-2 border-emerald-200">
                  <CardContent className="p-6 space-y-4">
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
                              Formula Parameters (Main Factors)
                            </div>
                          </SelectItem>
                          <SelectItem value="ef_value">
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              EF Value Parameters (From EF Sections)
                            </div>
                          </SelectItem>
                          <SelectItem value="constant">
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Constant Parameters (Fixed Values)
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Unit (optional)</Label>
                        <Input
                          value={newParameter.unit}
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

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newParameter.description}
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
                        onClick={() => setShowParameterForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={addParameter}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Parameter
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

      {/* Create Version Dialog */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Formula Version</DialogTitle>
            <DialogDescription>
              Create the first version for {selectedFormula?.name} ({selectedFormula?.uid})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Mathematical Expression *</Label>
              <Input
                value={versionFormData.expression}
                onChange={(e) => setVersionFormData({
                  ...versionFormData,
                  expression: e.target.value
                })}
                placeholder="e.g., (distance * fuel_efficiency / conversion_factor) * emission_factor"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use parameter names defined above. Available: {selectedFormula?.parameters?.map(p => p.name).join(', ')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Source Type</Label>
                <Select 
                  value={versionFormData.sourceType} 
                  onValueChange={(value: 'primary' | 'secondary' | 'tertiary') => setVersionFormData({
                    ...versionFormData,
                    sourceType: value
                  })}
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
              <div>
                <Label>Algorithm Type</Label>
                <Select 
                  value={versionFormData.algorithmType} 
                  onValueChange={(value: 'linear' | 'logarithmic' | 'polynomial' | 'custom') => setVersionFormData({
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
                placeholder="Additional notes about this version"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVersion} className="bg-emerald-600 hover:bg-emerald-700">
              Create Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Definition Fields Dialog */}
      <Dialog open={isDefinitionFieldDialogOpen} onOpenChange={setIsDefinitionFieldDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Formula Definition Fields</DialogTitle>
            <DialogDescription>
              Manage custom fields for formula definition metadata
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Definition Fields */}
            {definitionFields.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Current Definition Fields</h4>
                <div className="space-y-2">
                  {definitionFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div>
                        <span className="font-medium">{field.name}</span>
                        <div className="text-sm text-gray-600">
                          Type: {field.type} {field.required && '(Required)'}
                          {field.options && ` • Options: ${field.options.join(', ')}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDefinitionField(field.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Add New Field */}
            <div>
              <h4 className="font-medium mb-3">Add New Definition Field</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Field Name</Label>
                    <Input
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="e.g., Methodology Reference"
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
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newFieldType === 'dropdown' && (
                  <div>
                    <Label>Options (comma-separated)</Label>
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
            <Button onClick={addDefinitionField} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}