import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Settings, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { getVariableParameters, getExpression, type FormulaParameter } from '../../data/formulasData';
import { allActivities } from './activitiesData';
import { toast } from 'sonner@2.0.3';

interface AssignUnitsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activity: any | null; // BusinessUnitActivity type
  onSave: (units: Record<string, string>) => void;
}

// Common units for different parameter types
const commonUnits = {
  mass: ['kg', 'g', 'ton', 'lb', 'oz'],
  distance: ['km', 'mi', 'm', 'ft'],
  energy: ['kWh', 'MWh', 'GJ', 'MJ', 'BTU'],
  volume: ['L', 'mL', 'gal', 'm³', 'ft³'],
  time: ['hour', 'day', 'month', 'year'],
  currency: ['USD', 'EUR', 'GBP', 'JPY'],
  percentage: ['%'],
  count: ['units', 'items', 'pieces']
};

export function AssignUnitsDialog({ isOpen, onClose, activity, onSave }: AssignUnitsDialogProps) {
  const [parameterUnits, setParameterUnits] = useState<Record<string, string>>({});
  const [variableParams, setVariableParams] = useState<FormulaParameter[]>([]);
  const [expressionDetails, setExpressionDetails] = useState<{ expression: string; name: string } | null>(null);

  useEffect(() => {
    if (activity && isOpen) {
      // Get the full activity details from allActivities
      const fullActivity = allActivities.find(a => a.uid === activity.uid);
      if (fullActivity && fullActivity.expressionId && fullActivity.formulaUID) {
        // Get the expression details
        const expr = getExpression(fullActivity.formulaUID, fullActivity.expressionId);
        if (expr) {
          setExpressionDetails({ expression: expr.expression, name: expr.name });
        }
        
        // Get variable parameters for this activity's expression
        const params = getVariableParameters(fullActivity.formulaUID, fullActivity.expressionId);
        setVariableParams(params);
        
        // Initialize with default units from the expression parameters
        const initialUnits: Record<string, string> = {};
        params.forEach(param => {
          initialUnits[param.id] = param.unit || '';
        });
        setParameterUnits(initialUnits);
      }
    }
  }, [activity, isOpen]);

  const handleUnitChange = (parameterId: string, unit: string) => {
    setParameterUnits(prev => ({
      ...prev,
      [parameterId]: unit
    }));
  };

  const handleSave = () => {
    // Validate that all parameters have units assigned
    const missingUnits = variableParams.filter(param => !parameterUnits[param.id]?.trim());
    if (missingUnits.length > 0) {
      toast.error('Please assign units for all parameters', {
        description: `${missingUnits.length} parameter${missingUnits.length > 1 ? 's' : ''} missing unit assignments`
      });
      return;
    }

    onSave(parameterUnits);
  };

  const getSuggestedUnits = (param: FormulaParameter): string[] => {
    const paramName = param.name.toLowerCase();
    const currentUnit = param.unit?.toLowerCase() || '';

    // Return relevant units based on parameter name or current unit
    if (paramName.includes('mass') || paramName.includes('weight') || currentUnit.includes('kg')) {
      return commonUnits.mass;
    } else if (paramName.includes('distance') || paramName.includes('km') || currentUnit.includes('km')) {
      return commonUnits.distance;
    } else if (paramName.includes('energy') || paramName.includes('electricity') || currentUnit.includes('kwh')) {
      return commonUnits.energy;
    } else if (paramName.includes('volume') || paramName.includes('liter') || currentUnit.includes('l')) {
      return commonUnits.volume;
    } else if (paramName.includes('time') || paramName.includes('hour') || paramName.includes('day')) {
      return commonUnits.time;
    } else if (paramName.includes('cost') || paramName.includes('price') || currentUnit.includes('usd')) {
      return commonUnits.currency;
    } else if (paramName.includes('percent') || currentUnit.includes('%')) {
      return commonUnits.percentage;
    } else if (paramName.includes('count') || paramName.includes('number')) {
      return commonUnits.count;
    }
    
    // Return all units if no specific category matches
    return [...commonUnits.mass, ...commonUnits.distance, ...commonUnits.energy, ...commonUnits.volume];
  };

  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            Assign Input Units for Variable Parameters
          </DialogTitle>
          <DialogDescription>
            Configure the input units for variable parameters in {activity.name}
          </DialogDescription>
        </DialogHeader>

        {/* Activity Info */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{activity.name}</span>
                <Badge variant="outline" className="text-xs">
                  Scope {activity.scope}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <div>
                  <span className="text-gray-500">UID:</span> {activity.uid}
                </div>
                {activity.formulaName && (
                  <div>
                    <span className="text-gray-500">Formula:</span> {activity.formulaName}
                  </div>
                )}
                {activity.country && (
                  <div>
                    <span className="text-gray-500">Location:</span> {activity.country} ({activity.year})
                  </div>
                )}
              </div>
              {expressionDetails && (
                <div className="mt-3 pt-3 border-t border-emerald-300">
                  <div className="text-xs text-gray-500 mb-1">Expression: {expressionDetails.name}</div>
                  <div className="font-mono text-sm bg-white border border-emerald-200 rounded px-3 py-2 text-gray-800">
                    {expressionDetails.expression}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {variableParams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Info className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-center">
              This activity has no variable parameters to configure.<br />
              All parameters are either constants or emission factors.
            </p>
          </div>
        ) : (
          <>
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">What are Input Units?</p>
                <p className="text-blue-700">
                  These units define what format customer users will use to input their data. For example, if you set "km" for distance, 
                  customers will enter their values in kilometers.
                </p>
              </div>
            </div>

            {/* Parameters List */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  Variable Parameters ({variableParams.length})
                </h4>
                
                {variableParams.map((param, index) => (
                  <div key={param.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{param.name}</span>
                          {param.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{param.description}</p>
                        {param.defaultValue && (
                          <p className="text-xs text-gray-500 mt-1">
                            Default: {param.defaultValue} {param.unit}
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor={`unit-select-${param.id}`} className="text-sm font-medium">
                        Select Input Unit *
                      </Label>
                      <Select
                        value={parameterUnits[param.id] || ''}
                        onValueChange={(value) => handleUnitChange(param.id, value)}
                      >
                        <SelectTrigger id={`unit-select-${param.id}`}>
                          <SelectValue placeholder="Choose a unit..." />
                        </SelectTrigger>
                        <SelectContent>
                          {param.unit && (
                            <>
                              <SelectItem value={param.unit}>
                                {param.unit} (Default)
                              </SelectItem>
                              <Separator className="my-2" />
                            </>
                          )}
                          {getSuggestedUnits(param).map(unit => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {parameterUnits[param.id] && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded p-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700">
                          Customer users will input values in: <strong>{parameterUnits[param.id]}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={variableParams.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Unit Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}