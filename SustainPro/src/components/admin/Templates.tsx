import React, { useState, useContext, useMemo } from 'react';
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
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Lock, 
  Activity, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle,
  Link2,
  Database,
  Search,
  X,
  ArrowRight,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MasterDBContext } from '../../contexts/MasterDBContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { GRICategorySelector } from './GRICategorySelector';
import { allActivities, type ActivityDefinition, type EFParameterMapping } from '../sa/activitiesData';

const impactCategories = [
  'Climate Change - total (GWP)',
  'Ozone Depletion (ODP)',
  'Acidification (AP)',
  'Eutrophication - freshwater (EP-freshwater)',
  'Eutrophication - marine (EP-marine)',
  'Eutrophication - terrestrial (EP-terrestrial)',
  'Photochemical Ozone Formation (POCP)',
  'Resource Depletion - mineral and metals (ADP-elements)',
  'Resource Depletion - fossil fuels (ADP-fossil)',
  'Land Use (LAND)',
  'Water (WATER)',
  'WDP (Water Depletion Potential)'
];

// Helper function to determine scope from GRP categories
const getScopeFromGRPCategories = (grpCategories: string[]): string => {
  if (grpCategories.some(cat => cat.startsWith('305.1'))) return 'Scope 1';
  if (grpCategories.some(cat => cat.startsWith('305.2'))) return 'Scope 2';
  if (grpCategories.some(cat => cat.startsWith('305.3'))) return 'Scope 3';
  return 'Unknown';
};

export function Templates() {
  const masterDBContext = useContext(MasterDBContext);
  // Filter to show only Master DB activities (source: 'master')
  const masterActivities = useMemo(() => allActivities.filter(a => a.source === 'master'), []);
  const [activities, setActivities] = useState<ActivityDefinition[]>(masterActivities);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityDefinition | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formulaSearchQuery, setFormulaSearchQuery] = useState('');
  const [efSearchQuery, setEFSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    impactCategories: [] as string[],
    grpCategories: [] as string[],
    formulaUID: null as string | null,
    formulaName: null as string | null,
    expressionId: null as string | null,
    expressionName: null as string | null,
    efParameterMappings: [] as EFParameterMapping[]
  });

  // Get available formulas from Master DB
  const availableFormulas = useMemo(() => {
    const formulas = masterDBContext?.getMasterFormulasForAssignment() || [];
    if (!formulaSearchQuery) return formulas;
    
    const query = formulaSearchQuery.toLowerCase();
    return formulas.filter(f => 
      f.name.toLowerCase().includes(query) ||
      f.description.toLowerCase().includes(query) ||
      f.uid.toLowerCase().includes(query) ||
      f.category.toLowerCase().includes(query) ||
      f.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [masterDBContext, formulaSearchQuery]);
  
  // Get available emission factors from Master DB
  const availableEFs = masterDBContext?.getMasterEFsForAssignment() || [];

  // Enhanced search function that searches both EFs and their data rows
  const searchEFsAndDataRows = (ef: any, query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Search in EF properties
    const efMatch = 
      ef.name.toLowerCase().includes(lowerQuery) ||
      ef.uid.toLowerCase().includes(lowerQuery) ||
      ef.category.toLowerCase().includes(lowerQuery) ||
      ef.description.toLowerCase().includes(lowerQuery) ||
      ef.country.toLowerCase().includes(lowerQuery);
    
    if (efMatch) return true;
    
    // Search in data rows
    const efDef = masterDBContext?.masterEFDefinitions.find(e => e.uid === ef.uid);
    if (efDef?.coreDataRows) {
      return efDef.coreDataRows.some(row => 
        row.country.toLowerCase().includes(lowerQuery) ||
        row.region.toLowerCase().includes(lowerQuery) ||
        row.impactCategory.toLowerCase().includes(lowerQuery) ||
        row.impactUnit.toLowerCase().includes(lowerQuery) ||
        row.referenceName.toLowerCase().includes(lowerQuery) ||
        row.value.toString().includes(lowerQuery)
      );
    }
    
    return false;
  };

  // Get selected formula details
  const selectedFormula = useMemo(() => {
    if (!formData.formulaUID) return null;
    return masterDBContext?.masterFormulaDefinitions.find(f => f.uid === formData.formulaUID) || null;
  }, [formData.formulaUID, masterDBContext?.masterFormulaDefinitions]);

  // Get selected expression details
  const selectedExpression = useMemo(() => {
    if (!selectedFormula || !formData.expressionId) return null;
    return selectedFormula.expressions.find(e => e.id === formData.expressionId) || null;
  }, [selectedFormula, formData.expressionId]);

  // Get EF parameters from selected formula (all EF parameters are needed)
  const efParameters = useMemo(() => {
    if (!selectedFormula) return [];
    // Extract EF parameters from the formula's parameters
    return selectedFormula.parameters.filter(p => p.parameterType === 'ef_value');
  }, [selectedFormula]);

  const handleFormulaSelect = (formulaUID: string) => {
    const formula = masterDBContext?.masterFormulaDefinitions.find(f => f.uid === formulaUID);
    if (!formula) return;

    setFormData(prev => ({
      ...prev,
      formulaUID,
      formulaName: formula.name,
      expressionId: null,
      expressionName: null,
      efParameterMappings: []
    }));
  };

  const handleExpressionSelect = (expressionId: string) => {
    if (!selectedFormula) return;
    
    const expression = selectedFormula.expressions.find(e => e.id === expressionId);
    if (!expression) return;

    // Initialize EF parameter mappings from the formula's EF parameters
    const efParams = selectedFormula.parameters.filter(p => p.parameterType === 'ef_value');
    const mappings: EFParameterMapping[] = efParams.map(param => ({
      parameterId: param.id,
      parameterName: param.name,
      efUID: null,
      efName: null,
      dataRowUID: null,
      value: null,
      unit: param.unit || '',
      impactCategory: null,
      country: null,
      referenceName: null
    }));

    setFormData(prev => ({
      ...prev,
      expressionId,
      expressionName: expression.name,
      efParameterMappings: mappings
    }));
  };

  const handleEFSelection = (parameterId: string, efUID: string) => {
    const ef = masterDBContext?.masterEFDefinitions.find(e => e.uid === efUID);
    if (!ef) return;

    // Set EF selection only
    setFormData(prev => ({
      ...prev,
      efParameterMappings: prev.efParameterMappings.map(mapping =>
        mapping.parameterId === parameterId
          ? {
              ...mapping,
              efUID: ef.uid,
              efName: ef.name
            }
          : mapping
      )
    }));
  };

  const canProceedToStep2 = () => {
    return (
      formData.name.trim() !== '' &&
      formData.grpCategories.length > 0
    );
  };

  const canProceedToStep3 = () => {
    return formData.formulaUID !== null && formData.expressionId !== null;
  };

  const canCreate = () => {
    if (efParameters.length === 0) return true;
    return formData.efParameterMappings.every(m => m.efUID !== null);
  };

  const generateActivityUID = () => {
    const year = new Date().getFullYear();
    const count = activities.length + 1;
    return `ACT-${year}-${String(count).padStart(4, '0')}`;
  };

  const handleCreate = () => {
    if (!canCreate()) {
      toast.error('Please map all EF parameters before saving the activity');
      return;
    }

    if (editingActivity) {
      // Update existing activity
      const updatedActivity: ActivityDefinition = {
        ...editingActivity,
        name: formData.name,
        impactCategories: formData.impactCategories,
        grpCategories: formData.grpCategories,
        formulaUID: formData.formulaUID,
        formulaName: formData.formulaName,
        expressionId: formData.expressionId,
        expressionName: formData.expressionName,
        efParameterMappings: formData.efParameterMappings,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      };

      setActivities(activities.map(a => a.id === editingActivity.id ? updatedActivity : a));
      toast.success(`Activity updated: ${updatedActivity.name} (${updatedActivity.uid})`);
    } else {
      // Create new activity
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
        createdBy: 'admin',
        status: 'active',
        source: 'master'
      };

      setActivities([...activities, newActivity]);
      toast.success(`Activity created: ${newActivity.name} (${newActivity.uid})`);
    }
    
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingActivity(null);
    setCurrentStep(1);
    setFormulaSearchQuery('');
    setEFSearchQuery('');
    setFormData({
      name: '',
      impactCategories: [],
      grpCategories: [],
      formulaUID: null,
      formulaName: null,
      expressionId: null,
      expressionName: null,
      efParameterMappings: []
    });
  };

  const handleEdit = (activity: ActivityDefinition) => {
    // Set editing mode
    setEditingActivity(activity);
    
    // Populate form with activity data
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
    
    // Open dialog for editing
    setIsCreateDialogOpen(true);
    setCurrentStep(1);
    toast.info(`Editing activity: ${activity.name}`);
  };

  const handleDelete = (activity: ActivityDefinition) => {
    setActivities(activities.filter(a => a.id !== activity.id));
    toast.success(`Activity "${activity.name}" deleted successfully`);
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Master Activity Templates - Centralized Data Flow</h3>
              <p className="text-sm text-blue-800 mb-2">
                These activity templates are the single source of truth for all sustainability calculations across the platform.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <Badge variant="outline" className="bg-blue-100 border-blue-300">Platform Admin creates</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline" className="bg-blue-100 border-blue-300">SA inherits & assigns to BUs</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="outline" className="bg-blue-100 border-blue-300">Customer Users fill data</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Master DB - Activity Templates</h1>
          <p className="text-gray-600">Create and manage reusable activity templates with formula-based calculations and emission factor mappings</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Activity
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-[98vw] w-full max-h-[92vh] overflow-y-auto lg:max-w-[1600px] xl:max-w-[1800px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                {editingActivity ? 'Edit Activity' : 'Create New Activity'}
              </DialogTitle>
              <DialogDescription>
                {editingActivity 
                  ? 'Update activity template with impact categories, formulas, and emission factor mappings'
                  : 'Define a new activity template with impact categories, formulas, and emission factor mappings'
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
                      value={generateActivityUID()}
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
                        Choose a formula from Master DB to calculate emissions for this activity
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
                        key={formula.id}
                        className={`cursor-pointer transition-all ${
                          formData.formulaUID === formula.uid
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'hover:border-gray-400'
                        }`}
                        onClick={() => handleFormulaSelect(formula.uid)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {formData.formulaUID === formula.uid && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                )}
                                {formula.name}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {formula.description}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {formula.uid}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>Category: {formula.category}</span>
                            <span>•</span>
                            <span>{formula.parametersCount} parameters</span>
                            <span>•</span>
                            <span>{formula.expressionsCount} expressions</span>
                          </div>
                          {formula.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {formula.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Expression Selection within Formula Selection */}
                {formData.formulaUID && selectedFormula && selectedFormula.expressions.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm text-purple-900">Select Expression</h4>
                          <p className="text-xs text-purple-700 mt-1">
                            Choose one expression from the formula. Each activity can only use one expression.
                          </p>
                        </div>
                      </div>
                    </div>

                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-3">
                        {selectedFormula.expressions.map((expr, idx) => (
                          <Card
                            key={expr.id}
                            className={`cursor-pointer transition-all ${
                              formData.expressionId === expr.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'hover:border-gray-400'
                            }`}
                            onClick={() => handleExpressionSelect(expr.id)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                                  formData.expressionId === expr.id
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {formData.expressionId === expr.id ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    idx + 1
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base">{expr.name}</CardTitle>
                                  {expr.description && (
                                    <CardDescription className="mt-1">{expr.description}</CardDescription>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                <div className="p-3 bg-white rounded border border-gray-200">
                                  <div className="text-xs text-gray-500 mb-1">Expression:</div>
                                  <div className="font-mono text-sm overflow-x-auto">
                                    {expr.expression}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                  <span>Output: {expr.outputUnit}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: EF Parameter Mapping */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {efParameters.length === 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h4 className="text-green-900">No EF Parameters Required</h4>
                    <p className="text-sm text-green-700 mt-1">
                      The selected formula doesn't require any emission factor parameter mappings
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
                            Link each EF parameter from the selected expression to emission factors from Master DB
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
                          {efParameters.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-purple-200">
                              <div className="text-xs text-purple-700 mb-2">
                                EF Parameters requiring mapping:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {efParameters.map(param => (
                                  <Badge key={param.id} variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                                    {param.name}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-purple-600 mt-2">
                                These parameters must be mapped to emission factors from Master DB
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Search Section */}
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

                    <ScrollArea className="h-[450px] pr-4">
                      <div className="space-y-5">
                        {formData.efParameterMappings.map((mapping, index) => {
                          const parameter = efParameters.find(p => p.id === mapping.parameterId);
                          if (!parameter) return null;

                          // Get the selected EF to show its data rows
                          const selectedEF = mapping.efUID 
                            ? masterDBContext?.masterEFDefinitions.find(e => e.uid === mapping.efUID)
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
                                                    <div className="font-medium text-gray-900 mb-1 truncate group-hover:text-emerald-900">
                                                      {ef.name}
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
                                          <div className="font-medium text-emerald-900 mb-2">{selectedEF?.name}</div>
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

            <DialogFooter className="border-t pt-4">
              <div className="flex items-center justify-between w-full">
                <div>
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  {currentStep < 3 && (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={currentStep === 1 ? !canProceedToStep2() : !canProceedToStep3()}
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
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-lg border">
        {/* Summary Stats */}
        <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-sm text-gray-600">Master Activity Templates</div>
                  <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
                </div>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <div className="text-sm text-gray-600">Scope Breakdown</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 text-xs">
                    Scope 1: {activities.filter(a => getScopeFromGRPCategories(a.grpCategories) === 'Scope 1').length}
                  </Badge>
                  <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700 text-xs">
                    Scope 2: {activities.filter(a => getScopeFromGRPCategories(a.grpCategories) === 'Scope 2').length}
                  </Badge>
                  <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700 text-xs">
                    Scope 3: {activities.filter(a => getScopeFromGRPCategories(a.grpCategories) === 'Scope 3').length}
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <div className="text-sm text-gray-600">Source</div>
                <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-700 mt-1">
                  Master DB
                </Badge>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <div className="text-sm text-gray-600">Available to SA</div>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">All Clients</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity UID</TableHead>
              <TableHead>Activity Name</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Formula & EF Mappings</TableHead>
              <TableHead>Impact Categories</TableHead>
              <TableHead>GRI Categories</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => {
              const selectedFormula = masterDBContext?.masterFormulaDefinitions.find(f => f.uid === activity.formulaUID);
              const selectedExpression = selectedFormula?.expressions.find(e => e.id === activity.expressionId);
              
              return (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      <span className="font-mono text-sm">{activity.uid}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{activity.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      getScopeFromGRPCategories(activity.grpCategories) === 'Scope 1' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                      getScopeFromGRPCategories(activity.grpCategories) === 'Scope 2' ? 'border-purple-300 bg-purple-50 text-purple-700' :
                      'border-orange-300 bg-orange-50 text-orange-700'
                    }>
                      {getScopeFromGRPCategories(activity.grpCategories)}
                    </Badge>
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
                      {activity.impactCategories.slice(0, 3).map(cat => (
                        <Badge key={cat} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                          {cat}
                        </Badge>
                      ))}
                      {activity.impactCategories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{activity.impactCategories.length - 3}
                        </Badge>
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
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                      <Database className="h-3 w-3 mr-1" />
                      Master DB
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
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
