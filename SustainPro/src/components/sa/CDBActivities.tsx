import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
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
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Activity as ActivityIcon, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Upload,
  Download,
  FileSpreadsheet,
  Search,
  X,
  Eye,
  Database,
  Link2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MasterDBContext } from '../../contexts/MasterDBContext';
import { GRICategorySelector } from '../admin/GRICategorySelector';
import { useMasterDB } from '../../contexts/MasterDBContext';
import { allActivities, type ActivityDefinition, type EFParameterMapping } from './activitiesData';

// Types from CDB contexts
interface FormulaParameter {
  id: string;
  name: string;
  description: string;
  unit: string;
  defaultValue?: string;
  efCategory?: string;
  parameterType: 'variable' | 'ef_value';
}

interface FormulaExpression {
  id: string;
  name: string;
  expression: string;
  outputUnit: string;
  parameters: FormulaParameter[];
}

interface FormulaDefinition {
  uid: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  expressions: FormulaExpression[];
  source?: 'master' | 'client';
}

interface EFDefinition {
  uid: string;
  name: string;
  description: string;
  category: string;
  source?: 'master' | 'client';
}

// Interfaces - importing from activitiesData.ts
// interface EFParameterMapping and ActivityDefinition are now imported

// Mock client formulas - matching CDBFormulas.tsx structure
const mockClientFormulas: FormulaDefinition[] = [
  {
    uid: 'FORM-CDB-TRA-2025-001',
    name: 'Custom Fleet Emission Calculator',
    description: 'Calculates emissions for company-specific vehicle fleet considering local factors',
    category: 'Transport',
    tags: ['transport', 'fleet', 'custom', 'scope-1'],
    expressions: [
      {
        id: 'client-expr-1',
        name: 'Total Fleet Emissions',
        expression: 'Fleet_Distance * Custom_Vehicle_EF',
        outputUnit: 'kg CO2e',
        parameters: [
          {
            id: 'client-param-1',
            name: 'Fleet_Distance',
            description: 'Total distance traveled by company fleet',
            unit: 'km',
            defaultValue: '0',
            parameterType: 'variable'
          },
          {
            id: 'client-param-2',
            name: 'Custom_Vehicle_EF',
            description: 'Company-specific vehicle emission factor',
            unit: 'kg CO2e/km',
            defaultValue: '0.215',
            efCategory: 'Transport',
            parameterType: 'ef_value'
          }
        ]
      }
    ],
    source: 'client'
  },
  {
    uid: 'FORM-CDB-ENE-2025-001',
    name: 'Renewable Energy Mix Calculator',
    description: 'Calculates emissions from energy consumption with renewable energy percentage',
    category: 'Energy',
    tags: ['energy', 'renewable', 'scope-2', 'sustainability'],
    expressions: [
      {
        id: 'client-expr-2',
        name: 'Net Grid Emissions',
        expression: 'Total_Energy_Consumption * (1 - Renewable_Percentage/100) * 0.4156',
        outputUnit: 'kg CO2e',
        parameters: [
          {
            id: 'client-param-3',
            name: 'Total_Energy_Consumption',
            description: 'Total energy consumed from the grid',
            unit: 'kWh',
            defaultValue: '0',
            parameterType: 'variable'
          },
          {
            id: 'client-param-4',
            name: 'Renewable_Percentage',
            description: 'Percentage of energy from renewable sources',
            unit: '%',
            defaultValue: '0',
            parameterType: 'variable'
          }
        ]
      }
    ],
    source: 'client'
  }
];

// Mock client EFs - these would come from the SA's CDB
const mockClientEFs: EFDefinition[] = [
  {
    uid: 'EF-CDB-TRA-2025-0001',
    name: 'Custom Fleet Diesel',
    description: 'Client-specific diesel emission factor',
    category: 'Transportation',
    source: 'client'
  },
  {
    uid: 'EF-CDB-AGR-2025-0001',
    name: 'Organic Waste Processing',
    description: 'Client-specific organic waste emissions',
    category: 'Agriculture',
    source: 'client'
  }
];

// Mock data - now imported from centralized activitiesData.ts
// Activities are the single source of truth - created here first, then assigned to Business Units

// Export activities for use in Business Units
export { allActivities };

export function CDBActivities() {
  const { masterFormulaDefinitions, masterEFDefinitions } = useMasterDB();
  
  // Combine Master DB and Client Formulas (similar to CDBFormulas.tsx)
  // Transform master formulas to include parameters in each expression
  const allFormulas: FormulaDefinition[] = useMemo(() => [
    ...masterFormulaDefinitions.map(formula => ({
      ...formula,
      expressions: formula.expressions.map(expr => ({
        ...expr,
        parameters: formula.parameters || []
      })),
      source: 'master' as const
    })),
    ...mockClientFormulas
  ], [masterFormulaDefinitions]);

  // Combine Master DB and Client EFs (similar to CDBEmissionFactors.tsx)
  const allEFs: EFDefinition[] = useMemo(() => [
    ...masterEFDefinitions.map(ef => ({ ...ef, source: 'master' as const })),
    ...mockClientEFs
  ], [masterEFDefinitions]);

  const [activities, setActivities] = useState<ActivityDefinition[]>(allActivities);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingActivity, setEditingActivity] = useState<ActivityDefinition | null>(null);
  const [viewingActivity, setViewingActivity] = useState<ActivityDefinition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formulaSearchQuery, setFormulaSearchQuery] = useState('');
  const [efSearchQuery, setEFSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'master' | 'client'>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    impactCategories: ['Climate Change - total (GWP)'] as string[], // Auto-populated, not shown in UI
    grpCategories: [] as string[],
    formulaUID: null as string | null,
    formulaName: null as string | null,
    expressionId: null as string | null,
    expressionName: null as string | null,
    efParameterMappings: [] as EFParameterMapping[]
  });

  // Ensure EF parameter mappings are synced with the selected expression
  useEffect(() => {
    if (formData.formulaUID && formData.expressionId) {
      const formula = allFormulas.find(f => f.uid === formData.formulaUID);
      const expression = formula?.expressions.find(e => e.id === formData.expressionId);
      
      if (expression) {
        // Calculate what the mappings should be
        const expectedMappings = (expression.parameters || [])
          .filter(param => param.parameterType === 'ef_value');
        
        // Check if current mappings match expected
        const currentMappingIds = formData.efParameterMappings.map(m => m.parameterId).sort();
        const expectedMappingIds = expectedMappings.map(p => p.id).sort();
        
        // If they don't match, update them
        if (JSON.stringify(currentMappingIds) !== JSON.stringify(expectedMappingIds)) {
          setFormData(prev => ({
            ...prev,
            efParameterMappings: expectedMappings.map(param => ({
              parameterId: param.id,
              parameterName: param.name,
              unit: param.unit || '',
              efUID: null,
              efName: null
            }))
          }));
        }
      }
    }
  }, [formData.formulaUID, formData.expressionId, allFormulas]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = 
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.uid.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSource = 
        sourceFilter === 'all' || activity.source === sourceFilter;

      return matchesSearch && matchesSource;
    });
  }, [activities, searchQuery, sourceFilter]);

  // Filter formulas
  const availableFormulas = useMemo(() => {
    if (!formulaSearchQuery.trim()) {
      return allFormulas;
    }

    const query = formulaSearchQuery.toLowerCase();
    return allFormulas.filter(formula =>
      formula.name.toLowerCase().includes(query) ||
      formula.description.toLowerCase().includes(query) ||
      formula.uid.toLowerCase().includes(query) ||
      formula.category.toLowerCase().includes(query) ||
      formula.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [allFormulas, formulaSearchQuery]);

  // Enhanced search function that searches both EFs and their data rows (matching Platform Admin)
  const searchEFsAndDataRows = (ef: EFDefinition, query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    
    // Search in EF properties
    const efMatch = 
      ef.name?.toLowerCase().includes(lowerQuery) ||
      ef.uid?.toLowerCase().includes(lowerQuery) ||
      ef.category?.toLowerCase().includes(lowerQuery) ||
      (ef.description && ef.description.toLowerCase().includes(lowerQuery)) ||
      (ef.country && ef.country.toLowerCase().includes(lowerQuery));
    
    if (efMatch) return true;
    
    // Search in data rows for master EFs
    if (ef.source === 'master' && masterEFDefinitions) {
      const efDef = masterEFDefinitions.find(e => e.uid === ef.uid);
      if (efDef?.coreDataRows) {
        return efDef.coreDataRows.some(row => 
          row.country?.toLowerCase().includes(lowerQuery) ||
          row.region?.toLowerCase().includes(lowerQuery) ||
          row.impactCategory?.toLowerCase().includes(lowerQuery) ||
          row.impactUnit?.toLowerCase().includes(lowerQuery) ||
          row.referenceName?.toLowerCase().includes(lowerQuery) ||
          row.value?.toString().includes(lowerQuery)
        );
      }
    }
    
    return false;
  };

  const availableEFs = useMemo(() => {
    if (!efSearchQuery.trim()) {
      return allEFs;
    }
    return allEFs.filter(ef => searchEFsAndDataRows(ef, efSearchQuery));
  }, [allEFs, efSearchQuery, masterEFDefinitions]);

  const generateActivityUID = () => {
    const prefix = 'ACT-CLIENT';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${randomNum}`;
  };

  const handleFormulaSelect = (formulaUID: string) => {
    const formula = allFormulas.find(f => f.uid === formulaUID);
    if (!formula) return;

    setFormData(prev => ({
      ...prev,
      formulaUID: formula.uid,
      formulaName: formula.name,
      expressionId: null,
      expressionName: null,
      efParameterMappings: []
    }));
  };

  const handleExpressionSelect = (expressionId: string) => {
    const formula = allFormulas.find(f => f.uid === formData.formulaUID);
    const expression = formula?.expressions.find(e => e.id === expressionId);
    
    if (!expression || !formula) return;

    // Create EF parameter mappings ONLY for ef_value parameters (not variables)
    const mappings: EFParameterMapping[] = (expression.parameters || [])
      .filter(param => param.parameterType === 'ef_value')
      .map(param => ({
        parameterId: param.id,
        parameterName: param.name,
        unit: param.unit || '',
        efUID: null,
        efName: null
      }));

    // Always update, even if the same expression is clicked
    setFormData(prev => ({
      ...prev,
      expressionId: expression.id,
      expressionName: expression.name,
      efParameterMappings: mappings
    }));
  };

  const handleEFSelection = (parameterId: string, efUID: string) => {
    const ef = allEFs.find(e => e.uid === efUID);
    if (!ef) return;

    setFormData(prev => ({
      ...prev,
      efParameterMappings: prev.efParameterMappings.map(mapping =>
        mapping.parameterId === parameterId
          ? { ...mapping, efUID: ef.uid, efName: ef.name }
          : mapping
      )
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      impactCategories: ['Climate Change - total (GWP)'], // Auto-populated
      grpCategories: [],
      formulaUID: null,
      formulaName: null,
      expressionId: null,
      expressionName: null,
      efParameterMappings: []
    });
    setCurrentStep(1);
    setFormulaSearchQuery('');
    setEFSearchQuery('');
    setEditingActivity(null);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = (activity: ActivityDefinition) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      impactCategories: activity.impactCategories,
      grpCategories: activity.grpCategories,
      formulaUID: activity.formulaUID,
      formulaName: activity.formulaName,
      expressionId: activity.expressionId,
      expressionName: activity.expressionName,
      efParameterMappings: activity.efParameterMappings
    });
    setIsCreateDialogOpen(true);
  };

  const handleView = (activity: ActivityDefinition) => {
    setViewingActivity(activity);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (activity: ActivityDefinition) => {
    setActivities(prev => prev.filter(a => a.id !== activity.id));
    toast.success('Activity deleted successfully');
  };

  const canCreate = () => {
    // Check basic required fields
    const basicRequirements = formData.name && 
           formData.grpCategories.length > 0 && 
           formData.formulaUID && 
           formData.expressionId;
    
    if (!basicRequirements) return false;
    
    // If there are no EF parameter mappings required, allow creation
    if (formData.efParameterMappings.length === 0) return true;
    
    // If there are EF parameter mappings, ensure all are mapped
    return formData.efParameterMappings.every(m => m.efUID);
  };

  const handleCreate = () => {
    if (!canCreate()) return;

    if (editingActivity) {
      setActivities(prev => prev.map(a => 
        a.id === editingActivity.id 
          ? {
              ...a,
              name: formData.name,
              impactCategories: formData.impactCategories,
              grpCategories: formData.grpCategories,
              formulaUID: formData.formulaUID,
              formulaName: formData.formulaName,
              expressionId: formData.expressionId,
              expressionName: formData.expressionName,
              efParameterMappings: formData.efParameterMappings,
              updatedAt: new Date().toISOString(),
              updatedBy: 'sa_user'
            }
          : a
      ));
      toast.success('Activity updated successfully');
    } else {
      const newActivity: ActivityDefinition = {
        id: Date.now().toString(),
        uid: generateActivityUID(),
        name: formData.name,
        impactCategories: formData.impactCategories,
        grpCategories: formData.grpCategories,
        formulaUID: formData.formulaUID,
        formulaName: formData.formulaName,
        expressionId: formData.expressionId,
        expressionName: formData.expressionName,
        efParameterMappings: formData.efParameterMappings,
        createdAt: new Date().toISOString(),
        createdBy: 'sa_user',
        status: 'active',
        source: 'client'
      };
      setActivities(prev => [...prev, newActivity]);
      toast.success('Activity created successfully');
    }

    handleCloseDialog();
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectedFormula = allFormulas.find(f => f.uid === formData.formulaUID);
  const selectedExpression = selectedFormula?.expressions.find(e => e.id === formData.expressionId);
  const efParameters = selectedExpression?.parameters || [];
  const efParametersOnly = efParameters.filter(p => p.parameterType === 'ef_value');

  // Stats
  const totalActivities = activities.length;
  const masterActivities = activities.filter(a => a.source === 'master').length;
  const clientActivities = activities.filter(a => a.source === 'client').length;
  const activeActivities = activities.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Activities</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage activity templates with formulas and emission factor mappings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setIsBulkUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button 
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Activity
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl mt-1">{totalActivities}</p>
              </div>
              <ActivityIcon className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Master DB</p>
                <p className="text-2xl mt-1">{masterActivities}</p>
              </div>
              <ActivityIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Client Activities</p>
                <p className="text-2xl mt-1">{clientActivities}</p>
              </div>
              <ActivityIcon className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl mt-1">{activeActivities}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search Activities</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or UID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="source-filter">Filter by Source</Label>
              <div className="mt-2">
                <select
                  id="source-filter"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as 'all' | 'master' | 'client')}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
                >
                  <option value="all">All Sources</option>
                  <option value="client">Client Activities</option>
                  <option value="master">Master DB</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activities ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity UID</TableHead>
                <TableHead>Activity Name</TableHead>
                <TableHead>Formula & EF Mappings</TableHead>
                <TableHead>GRI Categories</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No activities found
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => {
                  const selectedFormula = allFormulas.find(f => f.uid === activity.formulaUID);
                  const selectedExpression = selectedFormula?.expressions.find(e => e.id === activity.expressionId);
                  
                  return (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ActivityIcon className={`h-4 w-4 ${activity.source === 'master' ? 'text-blue-600' : 'text-emerald-600'}`} />
                          <span className="font-mono text-sm">{activity.uid}</span>
                          {activity.source === 'master' ? (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Master DB
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                              Client Activity
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{activity.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 min-w-[400px]">
                          {/* Formula Info */}
                          <div>
                            <div className="text-sm font-medium">{activity.formulaName}</div>
                            <div className="text-gray-500 text-xs">{activity.formulaUID}</div>
                          </div>

                          {/* Expression Formula */}
                          {selectedExpression && (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-md p-2 border border-gray-300">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-600 flex-shrink-0">{activity.expressionName}:</span>
                                <span className="font-mono text-xs text-gray-900 flex-1">
                                  {selectedExpression.expression}
                                </span>
                                <Badge variant="secondary" className="text-xs flex-shrink-0">
                                  {selectedExpression.outputUnit}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* EF Parameter Mappings */}
                          {activity.efParameterMappings.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-gray-700">EF Mappings:</div>
                              <div className="space-y-1">
                                {activity.efParameterMappings.map((mapping) => (
                                  <div 
                                    key={mapping.parameterId} 
                                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md p-1.5 border border-blue-200"
                                  >
                                    <div className="flex items-center gap-2 flex-wrap text-xs">
                                      <span className="font-mono font-medium text-gray-900 bg-white px-1.5 py-0.5 rounded border border-blue-300">
                                        {mapping.parameterName}
                                      </span>
                                      <ArrowRight className="h-3 w-3 text-blue-600" />
                                      <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-300">
                                        {mapping.efName}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {activity.grpCategories.slice(0, 3).map(cat => (
                            <Badge key={cat} variant="secondary" className="text-xs font-mono">
                              {cat}
                            </Badge>
                          ))}
                          {activity.grpCategories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{activity.grpCategories.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            activity.source === 'master' 
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700' 
                              : 'border-blue-300 bg-blue-50 text-blue-700'
                          }
                        >
                          <Database className="h-3 w-3 mr-1" />
                          {activity.source === 'master' ? 'Master DB' : 'Client DB'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            activity.status === 'active' ? 'border-green-300 bg-green-50 text-green-700' :
                            activity.status === 'draft' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                            'border-gray-300 bg-gray-50 text-gray-700'
                          }
                        >
                          {activity.status === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {activity.source === 'client' ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(activity)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(activity)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleView(activity)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Activity Dialog - Multi-step */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        if (!open) handleCloseDialog();
      }}>
        <DialogContent key={`${formData.expressionId}-${formData.efParameterMappings.length}`} className="max-w-[98vw] w-full max-h-[92vh] overflow-y-auto lg:max-w-[1600px] xl:max-w-[1800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-emerald-600" />
              {editingActivity ? 'Edit Activity' : 'Create New Activity'}
            </DialogTitle>
            <DialogDescription>
              {editingActivity 
                ? 'Update activity template with formulas and emission factor mappings'
                : 'Define a new activity template with formulas and emission factor mappings'
              }
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 py-4 border-y">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100'}`}>
                {currentStep > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
              </div>
              <span className="text-sm">Basic Info</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100'}`}>
                {currentStep > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
              </div>
              <span className="text-sm">Formula Selection</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100'}`}>
                3
              </div>
              <span className="text-sm">EF Mapping</span>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-uid">Activity UID</Label>
                  <Input
                    id="activity-uid"
                    value={editingActivity ? editingActivity.uid : generateActivityUID()}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Auto-generated unique identifier</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-name">
                    Activity Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="activity-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Customer Meeting by Own Car"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>
                  GRI Categories <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-600">
                  Search and select GRI categories by group for reporting alignment
                </p>
                <GRICategorySelector
                  selectedCategories={formData.grpCategories}
                  onChange={(categories) => setFormData({ ...formData, grpCategories: categories })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Formula Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm text-blue-900">Select Calculation Formula</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Choose a formula from your CDB (includes Master DB formulas and client-created formulas)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formula-search">Search Formulas</Label>
                <Input
                  id="formula-search"
                  placeholder="Search by name, description, UID, category, or tags..."
                  value={formulaSearchQuery}
                  onChange={(e) => setFormulaSearchQuery(e.target.value)}
                  className="w-full"
                />
                {formulaSearchQuery && (
                  <p className="text-xs text-gray-500">
                    Found {availableFormulas.length} formula{availableFormulas.length === 1 ? '' : 's'}
                  </p>
                )}
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {availableFormulas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No formulas found matching your search</p>
                      <Button
                        variant="link"
                        onClick={() => setFormulaSearchQuery('')}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    availableFormulas.map(formula => (
                      <Card
                        key={formula.uid}
                        className={`cursor-pointer transition-all ${
                          formData.formulaUID === formula.uid
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'hover:border-emerald-300'
                        }`}
                        onClick={() => handleFormulaSelect(formula.uid)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{formula.name}</h4>
                                {formData.formulaUID === formula.uid && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                )}
                                {formula.source === 'client' ? (
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                    Client Formula
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Master DB
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{formula.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{formula.category}</Badge>
                                <span className="text-xs font-mono text-gray-500">{formula.uid}</span>
                                <div className="flex gap-1">
                                  {formula.tags?.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>

              {formData.formulaUID && selectedFormula && (
                <div className="space-y-3">
                  <Separator />
                  <div>
                    <Label>Select Expression *</Label>
                    <p className="text-xs text-gray-600 mt-1">Choose a calculation expression for this formula</p>
                  </div>
                  <div className="space-y-2">
                    {selectedFormula.expressions.map(expression => (
                      <Card
                        key={expression.id}
                        className={`cursor-pointer transition-all ${
                          formData.expressionId === expression.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'hover:border-emerald-300'
                        }`}
                        onClick={() => handleExpressionSelect(expression.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-medium">{expression.name}</h5>
                                {formData.expressionId === expression.id && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                )}
                              </div>
                              <div className="mt-2 bg-gray-50 rounded p-2 border">
                                <code className="text-xs font-mono">{expression.expression}</code>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  Output: {expression.outputUnit}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {expression.parameters?.length || 0} parameter{expression.parameters?.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: EF Mapping - Matching Master DB Style */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {formData.efParameterMappings.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-green-900 mb-2">No EF Parameters Required</h4>
                  <p className="text-sm text-green-700 max-w-md mx-auto">
                    The selected formula doesn't have any emission factor parameters that need to be mapped. You can proceed to create this activity by clicking the "Create Activity" button below.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Link2 className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm text-amber-900">Map Emission Factor Parameters</h4>
                        <p className="text-xs text-amber-700 mt-1">
                          Link each EF parameter from the selected expression to emission factors from CDB (includes Master DB and client-created EFs)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Show Selected Expression with EF Parameters Highlighted */}
                  {selectedExpression && (
                    <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Selected Expression</CardTitle>
                        <CardDescription className="text-xs">
                          {selectedExpression.description || selectedExpression.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-xs text-gray-500 mb-2">Mathematical Expression:</div>
                          <div className="font-mono text-sm overflow-x-auto p-2 bg-gray-50 rounded">
                            {selectedExpression.expression}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Output Unit: {selectedExpression.outputUnit}
                          </div>
                        </div>
                        
                        {/* Show EF Parameters that need mapping */}
                        {(() => {
                          // Filter to only show EF parameters (not variables)
                          const efOnlyParams = efParameters.filter(param => param.parameterType === 'ef_value');
                          
                          return efOnlyParams.length > 0 ? (
                            <div className="mt-3 pt-3 border-t border-purple-200">
                              <div className="text-xs text-purple-700 mb-2">
                                EF Parameters requiring mapping:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {efOnlyParams.map(param => (
                                  <Badge key={param.id} variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                                    {param.name}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-purple-600 mt-2">
                                These parameters must be mapped to emission factors from CDB
                              </p>
                            </div>
                          ) : null;
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Search Section - Moved above the emission factors list */}
                  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-sm">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Search className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-gray-900">Search Emission Factors</span>
                      </div>
                      
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="ef-search"
                          placeholder="Search by name, UID, category, country, reference, or value..."
                          value={efSearchQuery}
                          onChange={(e) => setEFSearchQuery(e.target.value)}
                          className="pl-9 pr-9 bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                        />
                        {efSearchQuery && (
                          <button
                            onClick={() => setEFSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{availableEFs.length} emission factors</span>
                          </div>
                        </div>
                        {efSearchQuery && (
                          <Badge variant="secondary" className="bg-emerald-600 text-white shadow-sm">
                            {availableEFs.filter(ef => searchEFsAndDataRows(ef, efSearchQuery)).length} matches
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emission Factors List - Show ALL Available EFs with Source Indicators */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-sm">Available Emission Factors</CardTitle>
                        </div>
                        <Badge variant="secondary" className="bg-blue-600 text-white">
                          {efSearchQuery 
                            ? `${availableEFs.filter(ef => searchEFsAndDataRows(ef, efSearchQuery)).length} / ${allEFs.length}` 
                            : `${allEFs.length} total`}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        Click any emission factor to map it to the first unmapped parameter
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-2">
                          {(() => {
                            const filteredEFs = efSearchQuery 
                              ? allEFs.filter(ef => searchEFsAndDataRows(ef, efSearchQuery))
                              : allEFs;
                            
                            if (filteredEFs.length === 0) {
                              return (
                                <div className="text-center py-8 px-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                  <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">No emission factors match your search</p>
                                  <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                                </div>
                              );
                            }
                            
                            return filteredEFs.map(ef => {
                              // Find first unmapped parameter
                              const firstUnmappedParam = formData.efParameterMappings.find(m => !m.efUID);
                              const canMap = !!firstUnmappedParam;
                              
                              return (
                                <button
                                  key={ef.uid}
                                  onClick={() => {
                                    if (firstUnmappedParam) {
                                      handleEFSelection(firstUnmappedParam.parameterId, ef.uid);
                                    }
                                  }}
                                  disabled={!canMap}
                                  className={`w-full text-left p-3 bg-white border-2 rounded-lg transition-all ${
                                    canMap 
                                      ? 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50 cursor-pointer' 
                                      : 'border-gray-100 opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-900 mb-1 flex items-center gap-2 flex-wrap">
                                        <span className="truncate">{ef.name}</span>
                                        {ef.source === 'master' ? (
                                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
                                            Master DB
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 flex-shrink-0">
                                            Client EF
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                          {ef.uid}
                                        </span>
                                        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                                          {ef.category}
                                        </Badge>
                                      </div>
                                      {ef.description && (
                                        <div className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                                          {ef.description}
                                        </div>
                                      )}
                                    </div>
                                    {canMap && (
                                      <div className="flex-shrink-0">
                                        <div className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">
                                          Click to map
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-50 px-3 text-gray-500 font-medium">Parameter Mappings</span>
                    </div>
                  </div>

                  <ScrollArea className="h-[450px] pr-4">
                    <div className="space-y-5">
                      {formData.efParameterMappings.map((mapping, index) => {
                        const parameter = efParameters.find(p => p.id === mapping.parameterId);
                        if (!parameter) return null;

                        const selectedEF = mapping.efUID 
                          ? allEFs.find(e => e.uid === mapping.efUID)
                          : null;

                        const isComplete = mapping.efUID !== null;

                        // Filter EFs for this parameter
                        const filteredEFsForParam = availableEFs.filter(ef => {
                          if (efSearchQuery) {
                            return searchEFsAndDataRows(ef, efSearchQuery);
                          }
                          // Optionally filter by suggested category
                          if (parameter.efCategory && !efSearchQuery) {
                            return ef.category === parameter.efCategory;
                          }
                          return true;
                        });

                        return (
                          <Card 
                            key={mapping.parameterId} 
                            className={`border-l-4 transition-all ${
                              isComplete 
                                ? 'border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent' 
                                : 'border-l-amber-400'
                            }`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shadow-sm ${
                                    isComplete 
                                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' 
                                      : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                                  }`}>
                                    {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <CardTitle className="text-base">
                                        <span className="font-mono text-gray-900">{mapping.parameterName}</span>
                                      </CardTitle>
                                      <Badge variant="outline" className={
                                        isComplete 
                                          ? "bg-emerald-100 text-emerald-700 border-emerald-300" 
                                          : "bg-amber-50 text-amber-700 border-amber-300"
                                      }>
                                        {isComplete ? 'Mapped' : 'Pending'}
                                      </Badge>
                                    </div>
                                    <CardDescription className="text-xs text-gray-600">
                                      {parameter.description || 'Map this EF parameter to an emission factor'}
                                    </CardDescription>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Parameter Info Pills */}
                              <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs">
                                  <span className="text-blue-600 font-medium">Unit:</span>
                                  <span className="text-blue-900">{mapping.unit || 'N/A'}</span>
                                </div>
                                {parameter.defaultValue && (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-xs">
                                    <span className="text-purple-600 font-medium">Default:</span>
                                    <span className="text-purple-900">{parameter.defaultValue}</span>
                                  </div>
                                )}
                                {parameter.efCategory && (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-xs">
                                    <span className="text-teal-600 font-medium">💡 Suggested:</span>
                                    <span className="text-teal-900">{parameter.efCategory}</span>
                                  </div>
                                )}
                              </div>

                              <Separator />

                              {/* Step 1: Select Emission Factor (Card-based) */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                                      mapping.efUID ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                                    }`}>
                                      {mapping.efUID ? <CheckCircle2 className="h-3.5 w-3.5" /> : '1'}
                                    </div>
                                    <Label className="text-sm font-medium">
                                      Select Emission Factor <span className="text-red-500">*</span>
                                    </Label>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {filteredEFsForParam.length} available
                                  </div>
                                </div>

                                {!mapping.efUID ? (
                                  /* Show EF selection grid */
                                  <div className="space-y-2">
                                    {filteredEFsForParam.length === 0 ? (
                                      <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">
                                          {efSearchQuery ? 'No emission factors match your search' : 'No emission factors available'}
                                        </p>
                                        {efSearchQuery && (
                                          <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                                        {filteredEFsForParam.slice(0, 10).map(ef => {
                                          return (
                                            <button
                                              key={ef.uid}
                                              onClick={() => handleEFSelection(mapping.parameterId, ef.uid)}
                                              className="text-left p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                                            >
                                              <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                  <div className="font-medium text-gray-900 mb-1 truncate group-hover:text-emerald-900 flex items-center gap-2">
                                                    {ef.name}
                                                    {ef.source === 'client' && (
                                                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                                        Client EF
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <div className="flex flex-wrap items-center gap-2 text-xs mb-1.5">
                                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 group-hover:bg-emerald-100 group-hover:text-emerald-700">
                                                      {ef.uid}
                                                    </span>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                      {ef.category}
                                                    </Badge>
                                                  </div>
                                                  {ef.description && (
                                                    <div className="text-xs text-gray-500 line-clamp-1">
                                                      {ef.description}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </button>
                                          );
                                        })}
                                        {filteredEFsForParam.length > 10 && (
                                          <div className="text-xs text-center text-gray-500 py-2">
                                            Showing 10 of {filteredEFsForParam.length} results. Use search to refine.
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  /* Show selected EF */
                                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-400 rounded-lg p-4 space-y-2 shadow-sm">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="font-medium text-emerald-900 mb-2 flex items-center gap-2">
                                          {selectedEF?.name}
                                          {selectedEF?.source === 'client' && (
                                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                              Client EF
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                          <span className="font-mono bg-white px-2 py-1 rounded border border-emerald-200 text-emerald-700">
                                            {selectedEF?.uid}
                                          </span>
                                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                                            {selectedEF?.category}
                                          </Badge>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          // Clear selection
                                          setFormData(prev => ({
                                            ...prev,
                                            efParameterMappings: prev.efParameterMappings.map(m =>
                                              m.parameterId === mapping.parameterId
                                                ? { ...m, efUID: null, efName: null }
                                                : m
                                            )
                                          }));
                                        }}
                                        className="text-emerald-600 hover:text-emerald-800 text-xs flex items-center gap-1 px-2 py-1 hover:bg-white rounded transition-colors"
                                      >
                                        <X className="h-3 w-3" />
                                        Change
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Show mapping status */}
                              {isComplete && (
                                <div className="pt-2">
                                  <Separator className="mb-3" />
                                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500 rounded-lg shadow-sm">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 flex-shrink-0">
                                      <CheckCircle2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-emerald-900 mb-2 text-base">
                                        ✓ Mapping Complete
                                      </div>
                                      <div className="text-sm text-emerald-800 mb-2">
                                        <span className="font-mono bg-white px-2 py-1 rounded border border-emerald-300 font-medium">
                                          {mapping.parameterName}
                                        </span>
                                        <span className="mx-2 text-emerald-600">→</span>
                                        <span className="font-medium text-gray-900">{mapping.efName}</span>
                                      </div>
                                      <div className="text-xs text-emerald-700">
                                        EF parameter successfully mapped to emission factor definition
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {/* Quick Summary Stats */}
                  {formData.efParameterMappings.length > 0 && (
                    <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-gray-300">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-gray-700">Mapping Summary:</div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm">
                                  <span className="font-medium text-emerald-700">
                                    {formData.efParameterMappings.filter(m => m.efUID).length}
                                  </span>
                                  <span className="text-gray-600"> complete</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <span className="text-sm">
                                  <span className="font-medium text-amber-700">
                                    {formData.efParameterMappings.filter(m => !m.efUID).length}
                                  </span>
                                  <span className="text-gray-600"> pending</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          {formData.efParameterMappings.every(m => m.efUID) && (
                            <Badge className="bg-emerald-600 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              All Mapped
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePreviousStep}>
                    <ChevronRight className="h-4 w-4 mr-1 rotate-180" /> Previous
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                {currentStep < 3 && (
                  <Button
                    onClick={handleNextStep}
                    disabled={
                      (currentStep === 1 && (!formData.name || formData.grpCategories.length === 0)) ||
                      (currentStep === 2 && (!formData.formulaUID || !formData.expressionId))
                    }
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
                {currentStep === 3 && (
                  <Button
                    onClick={handleCreate}
                    disabled={!canCreate()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {editingActivity ? 'Update Activity' : 'Create Activity'}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog for Master DB Activities */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Activity Details (View Only)</DialogTitle>
            <DialogDescription>
              This activity is inherited from Master DB and cannot be edited
            </DialogDescription>
          </DialogHeader>
          {viewingActivity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Activity UID</Label>
                  <div className="text-sm mt-1 font-mono">{viewingActivity.uid}</div>
                </div>
                <div>
                  <Label>Activity Name</Label>
                  <div className="text-sm mt-1">{viewingActivity.name}</div>
                </div>
              </div>
              <div>
                <Label>GRI Categories</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {viewingActivity.grpCategories.map(cat => (
                    <Badge key={cat} variant="secondary" className="text-xs font-mono">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Formula</Label>
                <div className="text-sm mt-1">{viewingActivity.formulaName}</div>
                <div className="text-xs text-gray-500">{viewingActivity.formulaUID}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Activities</DialogTitle>
            <DialogDescription>
              Upload multiple activities from a CSV or Excel file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: CSV, XLSX (Max 10MB)
              </p>
              <Button variant="outline" className="mt-4">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
