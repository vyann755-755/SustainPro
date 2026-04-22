import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import FormulaExpressionEditor from '../admin/FormulaExpressionEditor';
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
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Calculator,
  Copy,
  ChevronRight,
  X,
  Variable
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useMasterDB } from '../../contexts/MasterDBContext';

// Interfaces matching MasterDBContext
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
  parameterType: 'variable' | 'ef_value';
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
  source: 'master' | 'client';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Constants
const categories = [
  'Energy',
  'Transport',
  'Fuel',
  'Industrial Processes',
  'Agriculture',
  'Waste',
  'Materials',
  'Construction',
  'Water',
  'Other'
];

// Sample client-created formula data
const mockClientFormulaDefinitions: FormulaDefinition[] = [
  {
    id: 'client-form-1',
    uid: 'FORM-CDB-TRA-2025-001',
    name: 'Custom Fleet Emission Calculator',
    category: 'Transport',
    description: 'Calculates emissions for company-specific vehicle fleet considering local factors',
    tags: ['transport', 'fleet', 'custom', 'scope-1'],
    status: 'active',
    latestVersion: '1.0',
    customFieldValues: {},
    source: 'client',
    createdAt: '2025-02-01T10:00:00Z',
    createdBy: 'SA User',
    parameters: [
      {
        id: 'client-param-1',
        parentFormulaUID: 'FORM-CDB-TRA-2025-001',
        name: 'Fleet Distance',
        type: 'number',
        unit: 'km',
        defaultValue: 0,
        description: 'Total distance traveled by company fleet',
        required: true,
        minValue: 0,
        parameterType: 'variable',
        versions: [{
          id: 'cpv1',
          versionUID: 'client_param_1_v1_0',
          parentParameterId: 'client-param-1',
          version: '1.0',
          value: 0,
          isActive: true,
          createdAt: '2025-02-01T10:00:00Z',
          createdBy: 'SA User'
        }],
        createdAt: '2025-02-01T10:00:00Z',
        createdBy: 'SA User'
      },
      {
        id: 'client-param-2',
        parentFormulaUID: 'FORM-CDB-TRA-2025-001',
        name: 'Custom Vehicle EF',
        type: 'number',
        unit: 'kg CO2e/km',
        defaultValue: 0.215,
        description: 'Company-specific vehicle emission factor',
        required: true,
        parameterType: 'ef_value',
        efSource: 'client_db',
        efCategory: 'Transport',
        efUID: 'EF-CDB-TRA-2025-001',
        efDefinition: 'Custom Vehicle Fleet - Gasoline',
        versions: [{
          id: 'cpv2',
          versionUID: 'client_param_2_v1_0',
          parentParameterId: 'client-param-2',
          version: '1.0',
          value: 0.215,
          isActive: true,
          createdAt: '2025-02-01T10:00:00Z',
          createdBy: 'SA User'
        }],
        createdAt: '2025-02-01T10:00:00Z',
        createdBy: 'SA User'
      }
    ],
    expressions: [
      {
        id: 'client-expr-1',
        uid: 'EXPR-FORM-CDB-TRA-2025-001-001',
        parentFormulaUID: 'FORM-CDB-TRA-2025-001',
        name: 'Total Fleet Emissions',
        description: 'Calculates total emissions from fleet operations',
        expression: 'Fleet_Distance * Custom_Vehicle_EF',
        outputUnit: 'kg CO2e',
        versions: [{
          id: 'cev1',
          versionUID: 'client_expr_1_v1_0',
          parentExpressionId: 'client-expr-1',
          version: '1.0',
          expression: 'Fleet_Distance * Custom_Vehicle_EF',
          isActive: true,
          createdAt: '2025-02-01T10:00:00Z',
          createdBy: 'SA User'
        }],
        createdAt: '2025-02-01T10:00:00Z',
        createdBy: 'SA User'
      }
    ]
  },
  {
    id: 'client-form-2',
    uid: 'FORM-CDB-ENE-2025-001',
    name: 'Renewable Energy Mix Calculator',
    category: 'Energy',
    description: 'Calculates emissions from energy consumption with renewable energy percentage',
    tags: ['energy', 'renewable', 'scope-2', 'sustainability'],
    status: 'active',
    latestVersion: '1.0',
    customFieldValues: {},
    source: 'client',
    createdAt: '2025-03-10T14:30:00Z',
    createdBy: 'SA User',
    parameters: [
      {
        id: 'client-param-3',
        parentFormulaUID: 'FORM-CDB-ENE-2025-001',
        name: 'Total Energy Consumption',
        type: 'number',
        unit: 'kWh',
        defaultValue: 0,
        description: 'Total energy consumed from the grid',
        required: true,
        minValue: 0,
        parameterType: 'variable',
        versions: [{
          id: 'cpv3',
          versionUID: 'client_param_3_v1_0',
          parentParameterId: 'client-param-3',
          version: '1.0',
          value: 0,
          isActive: true,
          createdAt: '2025-03-10T14:30:00Z',
          createdBy: 'SA User'
        }],
        createdAt: '2025-03-10T14:30:00Z',
        createdBy: 'SA User'
      },
      {
        id: 'client-param-4',
        parentFormulaUID: 'FORM-CDB-ENE-2025-001',
        name: 'Renewable Percentage',
        type: 'number',
        unit: '%',
        defaultValue: 0,
        description: 'Percentage of energy from renewable sources',
        required: true,
        minValue: 0,
        maxValue: 100,
        parameterType: 'variable',
        versions: [{
          id: 'cpv4',
          versionUID: 'client_param_4_v1_0',
          parentParameterId: 'client-param-4',
          version: '1.0',
          value: 0,
          isActive: true,
          createdAt: '2025-03-10T14:30:00Z',
          createdBy: 'SA User'
        }],
        createdAt: '2025-03-10T14:30:00Z',
        createdBy: 'SA User'
      }
    ],
    expressions: [
      {
        id: 'client-expr-2',
        uid: 'EXPR-FORM-CDB-ENE-2025-001-001',
        parentFormulaUID: 'FORM-CDB-ENE-2025-001',
        name: 'Net Grid Emissions',
        description: 'Calculates emissions accounting for renewable energy',
        expression: 'Total_Energy_Consumption * (1 - Renewable_Percentage/100) * 0.4156',
        outputUnit: 'kg CO2e',
        versions: [{
          id: 'cev2',
          versionUID: 'client_expr_2_v1_0',
          parentExpressionId: 'client-expr-2',
          version: '1.0',
          expression: 'Total_Energy_Consumption * (1 - Renewable_Percentage/100) * 0.4156',
          isActive: true,
          createdAt: '2025-03-10T14:30:00Z',
          createdBy: 'SA User'
        }],
        createdAt: '2025-03-10T14:30:00Z',
        createdBy: 'SA User'
      }
    ]
  }
];

export function CDBFormulas() {
  // Get Master DB Formulas and EFs
  const { masterFormulaDefinitions, setMasterFormulaDefinitions, masterEFDefinitions } = useMasterDB();
  
  // Client-specific Formulas (initialize with mock data)
  const [clientFormulaDefinitions, setClientFormulaDefinitions] = useState<FormulaDefinition[]>(mockClientFormulaDefinitions);
  
  // Combine Master DB and Client Formulas
  const allFormulaDefinitions: FormulaDefinition[] = [
    ...masterFormulaDefinitions.map(formula => ({ ...formula, source: 'master' as const })),
    ...clientFormulaDefinitions
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Expansion states
  const [expandedFormulas, setExpandedFormulas] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isCreateFormulaDialogOpen, setIsCreateFormulaDialogOpen] = useState(false);
  const [showExpressionEditorPage, setShowExpressionEditorPage] = useState(false);
  const [formulaForExpression, setFormulaForExpression] = useState<FormulaDefinition | null>(null);
  const [editingExpression, setEditingExpression] = useState<FormulaExpression | null>(null);
  
  // Selected items
  const [selectedFormula, setSelectedFormula] = useState<FormulaDefinition | null>(null);
  
  // Form data
  const [formulaFormData, setFormulaFormData] = useState({
    name: '',
    category: '',
    description: '',
    tags: [] as string[]
  });

  // Filtered data
  const filteredFormulas = allFormulaDefinitions.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || formula.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Helper functions
  const getTotalParameters = () => {
    return filteredFormulas.reduce((sum, f) => sum + (f.parameters?.length || 0), 0);
  };

  const getTotalExpressions = () => {
    return filteredFormulas.reduce((sum, f) => sum + (f.expressions?.length || 0), 0);
  };

  const copyUID = async (uid: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(uid);
        toast.success('UID copied to clipboard');
        return;
      }
      
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
        toast.success('UID copied to clipboard');
      } else {
        toast.error('Failed to copy UID');
      }
    } catch (error) {
      toast.error('Failed to copy UID');
    }
  };

  const resetFormulaForm = () => {
    setFormulaFormData({
      name: '',
      category: '',
      description: '',
      tags: []
    });
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

  // Handlers
  const handleCreateFormula = () => {
    if (!formulaFormData.name || !formulaFormData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const sequence = clientFormulaDefinitions.length + 1;
    const newUID = `FORM-CDB-${formulaFormData.category.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(sequence).padStart(3, '0')}`;

    const newFormula: FormulaDefinition = {
      id: `client-form-${Date.now()}`,
      uid: newUID,
      name: formulaFormData.name,
      category: formulaFormData.category,
      description: formulaFormData.description,
      tags: formulaFormData.tags,
      parameters: [],
      expressions: [],
      status: 'draft',
      latestVersion: '1.0',
      customFieldValues: {},
      source: 'client',
      createdAt: new Date().toISOString(),
      createdBy: 'SA User'
    };

    setClientFormulaDefinitions([...clientFormulaDefinitions, newFormula]);
    setSelectedFormula(newFormula);
    setIsCreateFormulaDialogOpen(false);
    resetFormulaForm();
    toast.success(`Formula created with UID: ${newUID}`);
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
      updatedAt: new Date().toISOString(),
      updatedBy: 'SA User'
    };

    setClientFormulaDefinitions(clientFormulaDefinitions.map(formula => 
      formula.id === selectedFormula.id ? updatedFormula : formula
    ));

    setIsCreateFormulaDialogOpen(false);
    setSelectedFormula(null);
    resetFormulaForm();
    toast.success(`Formula updated successfully`);
  };

  const handleDeleteFormula = (formula: FormulaDefinition) => {
    if (formula.source === 'master') {
      toast.error('Cannot delete Master DB formulas');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${formula.name}"? This action cannot be undone.`)) {
      setClientFormulaDefinitions(clientFormulaDefinitions.filter(f => f.id !== formula.id));
      toast.success(`Formula deleted successfully`);
    }
  };

  // Helper to generate expression UID
  const generateExpressionUID = (formulaUID: string, expressionName: string) => {
    const timestamp = Date.now();
    const sanitizedName = expressionName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    return `EXPR-${formulaUID}-${sanitizedName}-${timestamp}`;
  };

  const handleSaveExpression = (data: any) => {
    const { expression, updatedFormula } = data;

    if (editingExpression) {
      // When editing, we need to add the updated expression back
      // (we had removed it before passing to the editor)
      const updatedExpression: FormulaExpression = {
        ...editingExpression,
        name: expression.name,
        description: expression.description,
        expression: expression.expression,
        outputUnit: expression.outputUnit,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SA User'
      };

      // Get the original formula (not the one passed to editor which had expression removed)
      const originalFormula = allFormulaDefinitions.find(f => f.id === formulaForExpression?.id);
      if (!originalFormula) return;

      const finalUpdatedFormula = {
        ...updatedFormula,
        expressions: originalFormula.expressions.map(expr =>
          expr.id === editingExpression.id ? updatedExpression : expr
        )
      };

      updateFormulaInState(finalUpdatedFormula);
      toast.success('Expression updated successfully');
    } else {
      // Add new expression
      const newExpressionId = `expr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newExpressionUID = generateExpressionUID(updatedFormula.uid, expression.name);

      const newExpression: FormulaExpression = {
        id: newExpressionId,
        uid: newExpressionUID,
        parentFormulaUID: updatedFormula.uid,
        name: expression.name,
        description: expression.description,
        expression: expression.expression,
        outputUnit: expression.outputUnit,
        versions: [{
          id: `ev_${Date.now()}`,
          versionUID: `${newExpressionUID}_v1_0`,
          parentExpressionId: newExpressionId,
          version: '1.0',
          expression: expression.expression,
          description: expression.description,
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: 'SA User'
        }],
        createdAt: new Date().toISOString(),
        createdBy: 'SA User'
      };

      const finalUpdatedFormula = {
        ...updatedFormula,
        expressions: [...(updatedFormula.expressions || []), newExpression]
      };

      updateFormulaInState(finalUpdatedFormula);
      toast.success('Expression added successfully');
    }

    setShowExpressionEditorPage(false);
    setFormulaForExpression(null);
    setEditingExpression(null);
  };

  const updateFormulaInState = (updatedFormula: FormulaDefinition) => {
    if (updatedFormula.source === 'client') {
      setClientFormulaDefinitions(clientFormulaDefinitions.map(f =>
        f.id === updatedFormula.id ? updatedFormula : f
      ));
    } else {
      setMasterFormulaDefinitions(masterFormulaDefinitions.map(f =>
        f.id === updatedFormula.id ? updatedFormula : f
      ));
    }
  };

  // Show expression editor page if active
  if (showExpressionEditorPage && formulaForExpression) {
    // If editing, we need to remove the expression from the formula first
    // so the editor treats it as a new one (since it doesn't have edit mode)
    const formulaForEditor = editingExpression
      ? {
          ...formulaForExpression,
          expressions: formulaForExpression.expressions.filter(e => e.id !== editingExpression.id)
        }
      : formulaForExpression;

    return (
      <FormulaExpressionEditor
        formula={formulaForEditor}
        masterEmissionFactors={masterEFDefinitions}
        onSave={handleSaveExpression}
        onCancel={() => {
          setShowExpressionEditorPage(false);
          setFormulaForExpression(null);
          setEditingExpression(null);
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
              <h1 className="text-3xl text-gray-900">Formulas</h1>
              <p className="text-gray-600">Manage formula definitions with parameters and expressions</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            onClick={() => {
              resetFormulaForm();
              setSelectedFormula(null);
              setIsCreateFormulaDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Formula
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
              <SelectTrigger className="w-64 border-emerald-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48 border-emerald-200">
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
            {filteredFormulas.map((formula, index) => {
              const isExpanded = expandedFormulas.has(formula.id);
              const hasAnyExpanded = expandedFormulas.size > 0;
              const shouldFade = hasAnyExpanded && !isExpanded;
              const isEvenRow = index % 2 === 0;
              const borderColor = formula.source === 'master' ? 'border-l-blue-500' : 'border-l-emerald-500';
              const isReadOnly = formula.source === 'master';
              
              return (
              <React.Fragment key={formula.id}>
                {/* Formula Definition Row */}
                <TableRow className={`border-l-4 ${borderColor} hover:bg-emerald-100 transition-all duration-200 ${
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
                        <Calculator className={`h-4 w-4 ${formula.source === 'master' ? 'text-blue-600' : 'text-emerald-600'}`} />
                        <span className="font-medium">{formula.name}</span>
                        {formula.source === 'master' ? (
                          <Badge className="bg-blue-100 text-blue-700 text-xs border border-blue-300">Master DB</Badge>
                        ) : (
                          <Badge className="bg-purple-100 text-purple-700 text-xs border border-purple-300">Client Formula</Badge>
                        )}
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
                          });
                          setSelectedFormula(formula);
                          setIsCreateFormulaDialogOpen(true);
                        }}
                        title="Edit Formula"
                        disabled={isReadOnly}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteFormula(formula)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Formula"
                        disabled={isReadOnly}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded Content - Expressions */}
                {isExpanded && (
                  <TableRow className="transition-opacity duration-300 opacity-100">
                    <TableCell colSpan={7} className="bg-emerald-50/50 p-0">
                      <div className="p-6">
                        <div className="grid grid-cols-1 gap-6">
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
                                  setEditingExpression(null);
                                  setShowExpressionEditorPage(true);
                                }}
                                disabled={isReadOnly}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Expression
                              </Button>
                            </div>
                            
                            {/* Expressions List */}
                            <div className="space-y-3">
                              {(formula.expressions || []).map(expr => (
                                <div key={expr.id} className="bg-white rounded-lg border p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <span className="font-medium text-sm">{expr.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {expr.outputUnit}
                                      </Badge>
                                    </div>
                                    {!isReadOnly && (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setFormulaForExpression(formula);
                                            setEditingExpression(expr);
                                            setShowExpressionEditorPage(true);
                                          }}
                                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete expression "${expr.name}"?`)) {
                                              const updatedFormula = {
                                                ...formula,
                                                expressions: formula.expressions.filter(e => e.id !== expr.id)
                                              };
                                              updateFormulaInState(updatedFormula);
                                              toast.success('Expression deleted successfully');
                                            }
                                          }}
                                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  {expr.description && (
                                    <p className="text-xs text-gray-600 mb-2">{expr.description}</p>
                                  )}
                                  <div className="bg-gray-50 rounded p-2 font-mono text-xs">
                                    {expr.expression}
                                  </div>
                                </div>
                              ))}
                              
                              {(!formula.expressions || formula.expressions.length === 0) && (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                  <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No expressions defined yet</p>
                                  {!isReadOnly && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="mt-3"
                                      onClick={() => {
                                        setFormulaForExpression(formula);
                                        setEditingExpression(null);
                                        setShowExpressionEditorPage(true);
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add First Expression
                                    </Button>
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
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Formula Dialog */}
      <Dialog open={isCreateFormulaDialogOpen} onOpenChange={setIsCreateFormulaDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              {selectedFormula ? 'Edit Formula Definition' : 'Create Formula Definition'}
            </DialogTitle>
            <DialogDescription>
              {selectedFormula ? 'Update the formula definition details.' : 'Create a new client-specific formula. UID will be auto-generated.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Formula Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <Label htmlFor="category">Category *</Label>
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
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formulaFormData.description}
                    onChange={(e) => setFormulaFormData({...formulaFormData, description: e.target.value})}
                    placeholder="Describe the formula's purpose and application"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateFormulaDialogOpen(false);
              setSelectedFormula(null);
              resetFormulaForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={selectedFormula ? handleUpdateFormula : handleCreateFormula}
              disabled={!formulaFormData.name}
            >
              {selectedFormula ? 'Update Definition' : 'Create Definition & Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
