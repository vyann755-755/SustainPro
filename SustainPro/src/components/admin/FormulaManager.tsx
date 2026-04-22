import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Plus,
  X,
  Hash,
  Type,
  Database,
  Calculator,
  Zap,
  Info,
  Variable,
  Code,
  Settings,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Enhanced Parameter Types for Formula Construction
type FormulaParameterType = 'custom' | 'ef_value' | 'constant';

interface EnhancedFormulaParameter {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean';
  unit?: string;
  defaultValue?: any;
  description?: string;
  required: boolean;
  minValue?: number;
  maxValue?: number;
  
  // Parameter Type Classification
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

// Mock EF Categories for dropdown
const mockEFCategories = [
  'Electricity Grid Factors',
  'Transportation Fuels',
  'Industrial Processes',
  'Waste Management',
  'Agriculture & Land Use',
  'Building Materials',
  'Chemical Processes'
];

// Mock EF UIDs for selection
const mockEFUIDs = [
  'EF-ELE-2024-001',
  'EF-TRA-2024-001', 
  'EF-IND-2024-001',
  'EF-WAS-2024-001',
  'EF-AGR-2024-001'
];

interface FormulaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  formulaData: any;
  setFormulaData: (data: any) => void;
}

export function FormulaManager({ isOpen, onClose, formulaData, setFormulaData }: FormulaManagerProps) {
  const [newParameter, setNewParameter] = useState<EnhancedFormulaParameter>({
    id: '',
    name: '',
    type: 'number',
    unit: '',
    defaultValue: '',
    description: '',
    required: false,
    minValue: undefined,
    maxValue: undefined,
    parameterType: 'custom',
    efSource: 'master_db',
    efCategory: '',
    efUID: '',
    efDefinition: '',
    constantValue: '',
    constantDescription: ''
  });

  const [showParameterForm, setShowParameterForm] = useState(false);

  const parameterTypeInfo = {
    custom: {
      icon: Variable,
      color: 'text-blue-600 bg-blue-50',
      badge: 'bg-blue-100 text-blue-800',
      title: 'Custom Parameter',
      description: 'User-defined input variables for main calculation factors'
    },
    ef_value: {
      icon: Database,
      color: 'text-emerald-600 bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-800',
      title: 'EF Value Parameter',
      description: 'Emission factor values from Master DB or CDB emission factors'
    },
    constant: {
      icon: Hash,
      color: 'text-purple-600 bg-purple-50',
      badge: 'bg-purple-100 text-purple-800',
      title: 'Constant Parameter',
      description: 'Fixed values with defined names for formula construction'
    }
  };

  const addParameter = () => {
    if (!newParameter.name.trim()) {
      toast.error('Parameter name is required');
      return;
    }

    // Validation based on parameter type
    if (newParameter.parameterType === 'ef_value') {
      if (!newParameter.efCategory) {
        toast.error('EF Category is required for EF Value parameters');
        return;
      }
    }

    if (newParameter.parameterType === 'constant') {
      if (!newParameter.constantValue) {
        toast.error('Constant value is required for Constant parameters');
        return;
      }
    }

    // Set default value based on parameter type
    let defaultValue: any = '';
    switch (newParameter.type) {
      case 'number':
        if (newParameter.parameterType === 'constant') {
          defaultValue = parseFloat(newParameter.constantValue as string) || 0;
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
      ...newParameter,
      id: Date.now().toString(),
      defaultValue
    };

    setFormulaData({
      ...formulaData,
      parameters: [...(formulaData.parameters || []), parameter]
    });

    // Reset form
    setNewParameter({
      id: '',
      name: '',
      type: 'number',
      unit: '',
      defaultValue: '',
      description: '',
      required: false,
      minValue: undefined,
      maxValue: undefined,
      parameterType: 'custom',
      efSource: 'master_db',
      efCategory: '',
      efUID: '',
      efDefinition: '',
      constantValue: '',
      constantDescription: ''
    });

    setShowParameterForm(false);
    toast.success(`${parameter.parameterType.toUpperCase()} parameter "${parameter.name}" added`);
  };

  const removeParameter = (id: string) => {
    setFormulaData({
      ...formulaData,
      parameters: formulaData.parameters?.filter((p: any) => p.id !== id) || []
    });
    toast.success('Parameter removed');
  };

  const renderParameterTypeSpecificFields = () => {
    switch (newParameter.parameterType) {
      case 'custom':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Value (optional)</Label>
                <Input
                  type="number"
                  value={newParameter.minValue || ''}
                  onChange={(e) => setNewParameter({
                    ...newParameter,
                    minValue: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Max Value (optional)</Label>
                <Input
                  type="number"
                  value={newParameter.maxValue || ''}
                  onChange={(e) => setNewParameter({
                    ...newParameter,
                    maxValue: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  placeholder="100"
                />
              </div>
            </div>
            <div>
              <Label>Default Value</Label>
              <Input
                type={newParameter.type === 'number' ? 'number' : 'text'}
                value={newParameter.defaultValue || ''}
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
                onValueChange={(value: 'master_db' | 'cdb') => setNewParameter({
                  ...newParameter,
                  efSource: value
                })}
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
              <Label>EF Category *</Label>
              <Select 
                value={newParameter.efCategory || ''} 
                onValueChange={(value) => setNewParameter({
                  ...newParameter,
                  efCategory: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select EF category" />
                </SelectTrigger>
                <SelectContent>
                  {mockEFCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Specific EF UID (optional)</Label>
              <Select 
                value={newParameter.efUID || ''} 
                onValueChange={(value) => setNewParameter({
                  ...newParameter,
                  efUID: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specific EF or leave blank for dynamic selection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Dynamic selection</SelectItem>
                  {mockEFUIDs.map(uid => (
                    <SelectItem key={uid} value={uid}>{uid}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>EF Definition/Notes</Label>
              <Textarea
                value={newParameter.efDefinition || ''}
                onChange={(e) => setNewParameter({
                  ...newParameter,
                  efDefinition: e.target.value
                })}
                placeholder="Define how this EF value should be used in the formula"
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
                value={newParameter.constantValue || ''}
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
                value={newParameter.constantDescription || ''}
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600" />
            Formula Parameter Management
          </DialogTitle>
          <DialogDescription>
            Define formula parameters using three types: Custom Parameters, EF Value Parameters, and Constant Parameters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Parameter Type Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <h3 className="font-semibold text-sm">{info.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Existing Parameters List */}
          {formulaData.parameters && formulaData.parameters.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Current Formula Parameters ({formulaData.parameters.length})
              </h3>
              <div className="space-y-3">
                {formulaData.parameters.map((param: EnhancedFormulaParameter) => (
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
                          
                          {param.parameterType === 'custom' && (
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

          {/* Add New Parameter */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Parameter
              </h3>
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
                        <SelectItem value="custom">
                          <div className="flex items-center gap-2">
                            <Variable className="h-4 w-4" />
                            Custom Parameters (Main Factors)
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
                        value={newParameter.unit || ''}
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
                      value={newParameter.description || ''}
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
          <Button variant="outline" onClick={onClose}>
            Close Parameter Manager
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}