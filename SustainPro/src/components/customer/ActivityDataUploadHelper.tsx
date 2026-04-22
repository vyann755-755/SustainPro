// Helper function to calculate emissions based on formula expression
import { getFormulaByUID, getExpression, type FormulaParameter } from '../../data/formulasData';
import { allActivities } from '../sa/activitiesData';

export interface ParsedActivityData {
  activityUID: string;
  activityName: string;
  scope: '1' | '2' | '3';
  formula: string;
  parameters: {
    name: string;
    value: number;
    unit: string;
  }[];
}

export function calculateEmissions(
  activityUID: string,
  userInputs: Map<string, number>
): { calculatedValue: number; formula: string; allParameters: { name: string; value: number; unit: string; parameterType: string }[] } {
  // Find the activity
  const activity = allActivities.find(a => a.uid === activityUID);
  if (!activity || !activity.formulaUID || !activity.expressionId) {
    console.error('Activity or formula not found for', activityUID);
    return { calculatedValue: 0, formula: 'Unknown', allParameters: [] };
  }

  // Get the expression
  const expression = getExpression(activity.formulaUID, activity.expressionId);
  if (!expression) {
    console.error('Expression not found for', activity.formulaUID, activity.expressionId);
    return { calculatedValue: 0, formula: 'Unknown', allParameters: [] };
  }

  // Build a map of all parameter values
  const parameterValues = new Map<string, number>();
  const allParameters: { name: string; value: number; unit: string; parameterType: string }[] = [];

  expression.parameters.forEach(param => {
    let value = 0;
    
    if (param.parameterType === 'variable') {
      // Get from user inputs
      value = userInputs.get(param.name) || 0;
    } else if (param.parameterType === 'ef_value') {
      // Use hardcoded EF value for demo (in real system, fetch from EF database)
      // For now, use random realistic values based on common emission factors
      if (param.name.toLowerCase().includes('emission factor') || param.name.toLowerCase().includes('ef')) {
        value = 2.5; // kg CO2e per unit
      } else if (param.name.toLowerCase().includes('gwp')) {
        value = 1.0;
      } else {
        value = 1.5;
      }
    }
    
    parameterValues.set(param.name, value);
    allParameters.push({
      name: param.name,
      value: value,
      unit: param.unit,
      parameterType: param.parameterType
    });
  });

  // Calculate the result based on the expression
  // For simplicity, we'll evaluate basic arithmetic expressions
  let result = 0;
  
  try {
    // Simple calculation: multiply all values
    // In a real system, you would parse and evaluate the actual formula string
    const values = Array.from(parameterValues.values());
    if (values.length > 0) {
      result = values.reduce((acc, val) => acc * val, 1);
    }
  } catch (error) {
    console.error('Error calculating emissions:', error);
    result = 0;
  }

  return {
    calculatedValue: result,
    formula: expression.expression || activity.formulaName || 'Unknown',
    allParameters
  };
}