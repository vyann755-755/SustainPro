import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
  CheckSquare,
  AlertCircle,
  Info,
  Calculator,
  CheckCircle,
  X,
  Sparkles,
  AlertTriangle,
  FileText,
  Variable,
  Database
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { FormulaDefinition, FormulaParameter, FormulaExpression } from '../../types';

// Validation Error Interface
interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// Uploaded Formula Data Interface
interface UploadedFormulaData {
  rowNumber: number;
  name: string;
  description?: string;
  tags: string[];
  parameters: UploadedParameterData[];
  expressions: UploadedExpressionData[];
  errors: ValidationError[];
}

interface UploadedParameterData {
  rowNumber: number;
  formulaName: string;
  name: string;
  parameterType: 'variable' | 'ef_value';
  unit?: string;
  description?: string;
  errors: ValidationError[];
}

interface UploadedExpressionData {
  rowNumber: number;
  formulaName: string;
  name: string;
  description?: string;
  expression: string;
  errors: ValidationError[];
}

interface FormulasBulkUploadProps {
  onBack: () => void;
  onUploadSuccess: (formulas: FormulaDefinition[]) => void;
}

export default function FormulasBulkUpload({ onBack, onUploadSuccess }: FormulasBulkUploadProps) {
  const [uploadedFormulas, setUploadedFormulas] = useState<UploadedFormulaData[]>([]);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [validationSummary, setValidationSummary] = useState({ total: 0, valid: 0, warnings: 0, errors: 0 });

  // ============ TEMPLATE DOWNLOAD ============
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    
    // Formula Definitions Sheet
    const formulaHeaders = [
      'Formula Name*',
      'Description',
      'Tags (comma-separated)'
    ];
    
    const formulaExamples = [
      'Example: Vehicle Emissions Calculator',
      'Example: Calculates emissions from vehicle fuel consumption',
      'Example: transport, fuel, emissions, scope1'
    ];
    
    const formulaWs = XLSX.utils.aoa_to_sheet([formulaHeaders, formulaExamples]);
    XLSX.utils.book_append_sheet(wb, formulaWs, 'Formula Definitions');
    
    // Parameters Sheet
    const parameterHeaders = [
      'Formula Name*',
      'Parameter Name*',
      'Parameter Type* (variable/ef_value)',
      'Unit (required for variable)',
      'Description'
    ];
    
    const parameterExamples = [
      'Example: Vehicle Emissions Calculator',
      'Example: Distance Traveled',
      'Example: variable',
      'Example: km',
      'Example: Total distance traveled by the vehicle'
    ];
    
    const parameterWs = XLSX.utils.aoa_to_sheet([parameterHeaders, parameterExamples]);
    XLSX.utils.book_append_sheet(wb, parameterWs, 'Parameters');
    
    // Expressions Sheet
    const expressionHeaders = [
      'Formula Name*',
      'Expression Name*',
      'Expression*',
      'Description'
    ];
    
    const expressionExamples = [
      'Example: Vehicle Emissions Calculator',
      'Example: Total Emissions',
      'Example: Distance_Traveled * Fuel_Consumption * Emission_Factor',
      'Example: Calculates total CO2 emissions from vehicle operation'
    ];
    
    const expressionWs = XLSX.utils.aoa_to_sheet([expressionHeaders, expressionExamples]);
    XLSX.utils.book_append_sheet(wb, expressionWs, 'Expressions');
    
    // Instructions Sheet
    const instructions = [
      ['FORMULA BULK UPLOAD - INSTRUCTIONS'],
      [''],
      ['This template contains three sheets for bulk uploading formulas with parameters and expressions:'],
      [''],
      ['Sheet 1: Formula Definitions'],
      ['- Formula Name*: Unique name for the formula (Required)'],
      ['- Description: What the formula calculates (Optional)'],
      ['- Tags: Comma-separated tags for categorization (Optional)'],
      [''],
      ['Sheet 2: Parameters'],
      ['- Formula Name*: Must match a formula name from Sheet 1 (Required)'],
      ['- Parameter Name*: Name of the parameter (Required)'],
      ['- Parameter Type*: Either "variable" or "ef_value" (Required)'],
      ['  * variable: User input parameter (requires Unit)'],
      ['  * ef_value: Emission factor parameter (Unit optional)'],
      ['- Unit: Measurement unit - REQUIRED for variable parameters (kg, km, kWh, etc.)'],
      ['- Description: Parameter description (Optional)'],
      [''],
      ['Sheet 3: Expressions'],
      ['- Formula Name*: Must match a formula name from Sheet 1 (Required)'],
      ['- Expression Name*: Name for this expression (Required)'],
      ['- Expression*: Mathematical formula using parameter names (Required)'],
      ['  * Use underscores instead of spaces in parameter names'],
      ['  * Example: Distance_Traveled * Fuel_Consumption * Emission_Factor'],
      ['  * Only use numbers, operators (+, -, *, /, ^), and created parameter names'],
      ['- Description: Expression description (Optional)'],
      [''],
      ['VALIDATION RULES:'],
      ['1. All parameters used in expressions must be created in the Parameters sheet'],
      ['2. Parameter names with spaces will be converted to underscores in expressions'],
      ['3. Mathematical expressions must be valid (balanced parentheses, no consecutive operators)'],
      ['4. Variable parameters MUST have a unit specified'],
      ['5. EF parameters do not require units'],
      [''],
      ['Upload Process:'],
      ['1. Fill in all three sheets with your data'],
      ['2. Keep the example rows prefixed with "Example:" or delete them'],
      ['3. Save the Excel file'],
      ['4. Use "Upload Excel" button to upload'],
      ['5. Review validation results'],
      ['6. Confirm to add to formulas table'],
      [''],
      ['Notes:'],
      ['- UIDs are auto-generated for formulas and expressions'],
      ['- All formulas start with status "draft"'],
      ['- Example rows (prefixed with "Example:") are automatically filtered out']
    ];
    const instructionsWs = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');
    
    XLSX.writeFile(wb, `Formula_Bulk_Upload_Template_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Formula template downloaded');
  };

  // ============ VALIDATION FUNCTIONS ============
  
  // Validate mathematical expression
  const validateMathematicalExpression = (expression: string, parameters: UploadedParameterData[]): { isValid: boolean; errors: string[] } => {
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

    // Check for valid characters
    const invalidCharsRegex = /[^a-zA-Z0-9+\-*/^().\s_]/;
    if (invalidCharsRegex.test(expression)) {
      errors.push('Invalid characters detected. Only alphanumeric, +, -, *, /, ^, (), . and _ are allowed');
      isValid = false;
    }

    // Check for consecutive operators
    const consecutiveOpsRegex = /[+\/*^]{2,}|--/;
    if (consecutiveOpsRegex.test(expression)) {
      errors.push('Consecutive operators detected');
      isValid = false;
    }

    // Check for operators at the beginning (except minus)
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

    // Validate parameters in expression
    const variableRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const foundVariables = expression.match(variableRegex) || [];
    
    if (foundVariables.length > 0) {
      const validParameterNames = new Set(
        parameters.map(p => p.name.replace(/\s+/g, '_'))
      );
      
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
          `These parameters must be created in the Parameters sheet.`
        );
        isValid = false;
      }
    }

    return { isValid, errors };
  };

  // ============ FILE UPLOAD AND PARSING ============
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Read all three sheets
      const formulaSheet = workbook.Sheets['Formula Definitions'];
      const parameterSheet = workbook.Sheets['Parameters'];
      const expressionSheet = workbook.Sheets['Expressions'];
      
      if (!formulaSheet || !parameterSheet || !expressionSheet) {
        toast.error('Invalid template. Please ensure all three sheets exist: Formula Definitions, Parameters, and Expressions');
        return;
      }
      
      // Parse sheets
      const formulaData: any[] = XLSX.utils.sheet_to_json(formulaSheet);
      const parameterData: any[] = XLSX.utils.sheet_to_json(parameterSheet);
      const expressionData: any[] = XLSX.utils.sheet_to_json(expressionSheet);
      
      // Filter out example rows
      const filteredFormulaData = formulaData.filter(row => 
        row['Formula Name*'] && !row['Formula Name*'].toString().toLowerCase().startsWith('example')
      );
      const filteredParameterData = parameterData.filter(row => 
        row['Formula Name*'] && !row['Formula Name*'].toString().toLowerCase().startsWith('example')
      );
      const filteredExpressionData = expressionData.filter(row => 
        row['Formula Name*'] && !row['Formula Name*'].toString().toLowerCase().startsWith('example')
      );
      
      // Process and validate data
      const processedFormulas = processUploadedData(
        filteredFormulaData,
        filteredParameterData,
        filteredExpressionData
      );
      
      if (processedFormulas.length === 0) {
        toast.error('No valid formulas found in the upload');
        return;
      }
      
      setUploadedFormulas(processedFormulas);
      
      // Calculate validation summary
      const summary = {
        total: processedFormulas.length,
        valid: processedFormulas.filter(f => f.errors.length === 0 && 
          f.parameters.every(p => p.errors.length === 0) &&
          f.expressions.every(e => e.errors.length === 0)
        ).length,
        warnings: processedFormulas.filter(f => 
          f.errors.some(e => e.severity === 'warning') ||
          f.parameters.some(p => p.errors.some(e => e.severity === 'warning')) ||
          f.expressions.some(e => e.errors.some(e => e.severity === 'warning'))
        ).length,
        errors: processedFormulas.filter(f => 
          f.errors.some(e => e.severity === 'error') ||
          f.parameters.some(p => p.errors.some(e => e.severity === 'error')) ||
          f.expressions.some(e => e.errors.some(e => e.severity === 'error'))
        ).length
      };
      
      setValidationSummary(summary);
      setIsValidationDialogOpen(true);
      
      toast.success(`Processed ${processedFormulas.length} formulas`);
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing Excel file. Please check the format.');
    }
    
    // Reset file input
    event.target.value = '';
  };

  // Process uploaded data
  const processUploadedData = (
    formulaData: any[],
    parameterData: any[],
    expressionData: any[]
  ): UploadedFormulaData[] => {
    const processedFormulas: UploadedFormulaData[] = [];
    
    formulaData.forEach((row, index) => {
      const errors: ValidationError[] = [];
      const formulaName = row['Formula Name*']?.toString().trim();
      
      // Validate required fields
      if (!formulaName) {
        errors.push({
          row: index + 2, // +2 for header row and 0-index
          field: 'Formula Name',
          message: 'Formula name is required',
          severity: 'error'
        });
      }
      
      // Get parameters for this formula
      const formulaParameters: UploadedParameterData[] = parameterData
        .map((paramRow, paramIndex) => {
          const paramErrors: ValidationError[] = [];
          const paramFormulaName = paramRow['Formula Name*']?.toString().trim();
          const paramName = paramRow['Parameter Name*']?.toString().trim();
          const paramType = paramRow['Parameter Type* (variable/ef_value)']?.toString().trim().toLowerCase();
          const unit = paramRow['Unit (required for variable)']?.toString().trim();
          const description = paramRow['Description']?.toString().trim();
          
          if (paramFormulaName !== formulaName) return null;
          
          // Validate parameter name
          if (!paramName) {
            paramErrors.push({
              row: paramIndex + 2,
              field: 'Parameter Name',
              message: 'Parameter name is required',
              severity: 'error'
            });
          }
          
          // Validate parameter type
          if (!paramType || !['variable', 'ef_value'].includes(paramType)) {
            paramErrors.push({
              row: paramIndex + 2,
              field: 'Parameter Type',
              message: 'Parameter type must be either "variable" or "ef_value"',
              severity: 'error'
            });
          }
          
          // Validate unit for variable parameters
          if (paramType === 'variable' && !unit) {
            paramErrors.push({
              row: paramIndex + 2,
              field: 'Unit',
              message: 'Unit is required for variable parameters',
              severity: 'error'
            });
          }
          
          return {
            rowNumber: paramIndex + 2,
            formulaName,
            name: paramName || '',
            parameterType: (paramType as 'variable' | 'ef_value') || 'variable',
            unit,
            description,
            errors: paramErrors
          };
        })
        .filter(p => p !== null) as UploadedParameterData[];
      
      // Get expressions for this formula
      const formulaExpressions: UploadedExpressionData[] = expressionData
        .map((exprRow, exprIndex) => {
          const exprErrors: ValidationError[] = [];
          const exprFormulaName = exprRow['Formula Name*']?.toString().trim();
          const exprName = exprRow['Expression Name*']?.toString().trim();
          const expression = exprRow['Expression*']?.toString().trim();
          const description = exprRow['Description']?.toString().trim();
          
          if (exprFormulaName !== formulaName) return null;
          
          // Validate expression name
          if (!exprName) {
            exprErrors.push({
              row: exprIndex + 2,
              field: 'Expression Name',
              message: 'Expression name is required',
              severity: 'error'
            });
          }
          
          // Validate expression
          if (!expression) {
            exprErrors.push({
              row: exprIndex + 2,
              field: 'Expression',
              message: 'Expression is required',
              severity: 'error'
            });
          } else {
            // Validate mathematical expression
            const validation = validateMathematicalExpression(expression, formulaParameters);
            if (!validation.isValid) {
              validation.errors.forEach(errorMsg => {
                exprErrors.push({
                  row: exprIndex + 2,
                  field: 'Expression',
                  message: errorMsg,
                  severity: 'error'
                });
              });
            }
          }
          
          return {
            rowNumber: exprIndex + 2,
            formulaName,
            name: exprName || '',
            description,
            expression: expression || '',
            errors: exprErrors
          };
        })
        .filter(e => e !== null) as UploadedExpressionData[];
      
      // Check if formula has at least one parameter
      if (formulaParameters.length === 0) {
        errors.push({
          row: index + 2,
          field: 'Parameters',
          message: 'Formula must have at least one parameter',
          severity: 'warning'
        });
      }
      
      // Check if formula has at least one expression
      if (formulaExpressions.length === 0) {
        errors.push({
          row: index + 2,
          field: 'Expressions',
          message: 'Formula should have at least one expression',
          severity: 'warning'
        });
      }
      
      processedFormulas.push({
        rowNumber: index + 2,
        name: formulaName || '',
        description: row['Description']?.toString().trim(),
        tags: row['Tags (comma-separated)']?.toString().split(',').map((t: string) => t.trim()).filter(Boolean) || [],
        parameters: formulaParameters,
        expressions: formulaExpressions,
        errors
      });
    });
    
    return processedFormulas;
  };

  // ============ CONFIRM UPLOAD ============
  const handleConfirmUpload = () => {
    // Filter out formulas with critical errors
    const validFormulas = uploadedFormulas.filter(f => 
      !f.errors.some(e => e.severity === 'error') &&
      !f.parameters.some(p => p.errors.some(e => e.severity === 'error')) &&
      !f.expressions.some(e => e.errors.some(e => e.severity === 'error'))
    );
    
    if (validFormulas.length === 0) {
      toast.error('No valid formulas to upload. Please fix errors and try again.');
      return;
    }
    
    // Convert to FormulaDefinition objects
    const newFormulas: FormulaDefinition[] = validFormulas.map(formula => {
      const formulaUID = `formula_${formula.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
      
      // Create parameters
      const parameters: FormulaParameter[] = formula.parameters.map(param => ({
        id: `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        parentFormulaUID: formulaUID,
        name: param.name,
        type: 'number',
        unit: param.unit,
        description: param.description,
        required: false,
        parameterType: param.parameterType,
        versions: [],
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
      }));
      
      // Create expressions
      const expressions: FormulaExpression[] = formula.expressions.map(expr => {
        const exprId = `expr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const exprUID = `${formulaUID}_expr_${expr.name.replace(/\s+/g, '_').toLowerCase()}`;
        
        return {
          id: exprId,
          uid: exprUID,
          parentFormulaUID: formulaUID,
          name: expr.name,
          description: expr.description || '',
          expression: expr.expression,
          outputUnit: '',
          versions: [
            {
              id: `ev_${Date.now()}`,
              versionUID: `${exprUID}_v1.0`,
              parentExpressionId: exprId,
              version: '1.0',
              expression: expr.expression,
              description: expr.description || '',
              isActive: true,
              createdAt: new Date().toISOString(),
              createdBy: 'admin'
            }
          ],
          createdAt: new Date().toISOString(),
          createdBy: 'admin'
        };
      });
      
      return {
        id: `formula_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uid: formulaUID,
        name: formula.name,
        description: formula.description || '',
        category: 'General',
        tags: formula.tags,
        status: 'draft',
        parameters,
        expressions,
        versions: [
          {
            id: `fv_${Date.now()}`,
            versionUID: `${formulaUID}_v1.0`,
            parentFormulaId: formulaUID,
            version: '1.0',
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: 'admin'
          }
        ],
        latestVersion: '1.0',
        database: 'master',
        createdBy: 'admin',
        createdAt: new Date().toISOString()
      };
    });
    
    onUploadSuccess(newFormulas);
    toast.success(`Successfully uploaded ${newFormulas.length} formula(s)`);
    setIsValidationDialogOpen(false);
  };

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
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Formulas
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Upload className="h-4 w-4" />
                  <span>Master DB / Formulas</span>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Formula Bulk Upload
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="grid grid-cols-1 gap-6">
            {/* Step 1: Download Template */}
            <Card className="border-emerald-200 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="font-semibold">1</span>
                  </div>
                  <CardTitle>Download Excel Template</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Download the template with three sheets: Formula Definitions, Parameters, and Expressions. 
                  Each sheet contains example data to guide you.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-2">Template includes:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>Formula Definitions:</strong> Name, description, and tags</li>
                        <li><strong>Parameters:</strong> Variable and EF parameters with units</li>
                        <li><strong>Expressions:</strong> Mathematical expressions using parameters</li>
                        <li><strong>Instructions:</strong> Detailed guidelines and validation rules</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={downloadTemplate}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </CardContent>
            </Card>

            {/* Step 2: Upload Filled Template */}
            <Card className="border-emerald-200 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="font-semibold">2</span>
                  </div>
                  <CardTitle>Upload Filled Template</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Fill in the template with your formula data and upload it for validation.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-900">
                      <p className="font-medium mb-2">Important Requirements:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>All parameters used in expressions must be created in the Parameters sheet</li>
                        <li>Variable parameters MUST have a unit specified</li>
                        <li>Use underscores instead of spaces in parameter names within expressions</li>
                        <li>Mathematical expressions must be valid (balanced parentheses, valid operators)</li>
                        <li>Example rows (prefixed with "Example:") will be automatically filtered out</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">Excel files only (.xlsx, .xls)</p>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Sparkles className="h-5 w-5" />
                  Quick Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <Calculator className="h-6 w-6 text-emerald-600 mb-2" />
                    <h4 className="font-medium text-gray-900 mb-2">Formula Definitions</h4>
                    <p className="text-sm text-gray-600">
                      Create formulas with unique names, descriptions, and tags for easy categorization.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <Variable className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-medium text-gray-900 mb-2">Parameters</h4>
                    <p className="text-sm text-gray-600">
                      Define variable parameters (with units) and EF parameters for your formulas.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <FileText className="h-6 w-6 text-indigo-600 mb-2" />
                    <h4 className="font-medium text-gray-900 mb-2">Expressions</h4>
                    <p className="text-sm text-gray-600">
                      Write mathematical expressions using created parameters with proper syntax.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Validation Dialog */}
      <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
        <DialogContent className="w-[95vw] !max-w-[1600px] h-[95vh] !max-h-[95vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-emerald-600" />
              Validation Results
            </DialogTitle>
            <DialogDescription className="text-base">
              Review the validation results before confirming the upload
            </DialogDescription>
          </DialogHeader>

          {/* Validation Summary */}
          <div className="grid grid-cols-4 gap-6 px-6 py-6 shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-4xl font-bold text-blue-900">{validationSummary.total}</div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-sm font-medium text-blue-700">Total Formulas</div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-4xl font-bold text-green-900">{validationSummary.valid}</div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-sm font-medium text-green-700">Valid</div>
            </div>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-4xl font-bold text-amber-900">{validationSummary.warnings}</div>
                <AlertTriangle className="h-8 w-8 text-amber-400" />
              </div>
              <div className="text-sm font-medium text-amber-700">Warnings</div>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-4xl font-bold text-red-900">{validationSummary.errors}</div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <div className="text-sm font-medium text-red-700">Errors</div>
            </div>
          </div>

          {/* Validation Details */}
          <div className="flex-1 overflow-auto px-6 min-h-0">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50 z-10 border-b-2 border-gray-200">
                  <TableRow>
                    <TableHead className="w-20">Row</TableHead>
                    <TableHead className="w-64">Formula Name</TableHead>
                    <TableHead className="w-40">Parameters</TableHead>
                    <TableHead className="w-40">Expressions</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {uploadedFormulas.map((formula, index) => {
                  const hasErrors = 
                    formula.errors.some(e => e.severity === 'error') ||
                    formula.parameters.some(p => p.errors.some(e => e.severity === 'error')) ||
                    formula.expressions.some(e => e.errors.some(e => e.severity === 'error'));
                  
                  const hasWarnings = 
                    formula.errors.some(e => e.severity === 'warning') ||
                    formula.parameters.some(p => p.errors.some(e => e.severity === 'warning')) ||
                    formula.expressions.some(e => e.errors.some(e => e.severity === 'warning'));
                  
                  const allErrors = [
                    ...formula.errors,
                    ...formula.parameters.flatMap(p => p.errors),
                    ...formula.expressions.flatMap(e => e.errors)
                  ];
                  
                  return (
                    <TableRow key={index} className={`${hasErrors ? 'bg-red-50 hover:bg-red-100' : hasWarnings ? 'bg-amber-50 hover:bg-amber-100' : 'bg-green-50 hover:bg-green-100'} transition-colors`}>
                      <TableCell className="font-mono text-sm font-medium">{formula.rowNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{formula.name}</div>
                          {formula.description && (
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{formula.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 font-medium">
                            {formula.parameters.length}
                          </Badge>
                          {formula.parameters.some(p => p.errors.length > 0) && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300 font-medium">
                            {formula.expressions.length}
                          </Badge>
                          {formula.expressions.some(e => e.errors.length > 0) && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {hasErrors ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
                            <X className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        ) : hasWarnings ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Warning
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {allErrors.length > 0 ? (
                          <div className="space-y-2">
                            {allErrors.slice(0, 3).map((error, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                {error.severity === 'error' ? (
                                  <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                )}
                                <div>
                                  <span className={`text-sm ${error.severity === 'error' ? 'text-red-700 font-medium' : 'text-amber-700'}`}>
                                    {error.message}
                                  </span>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {error.field} • Row {error.row}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {allErrors.length > 3 && (
                              <div className="text-xs text-gray-500 font-medium pl-6">
                                +{allErrors.length - 3} more issue(s)...
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">No issues</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-200 shrink-0 bg-gray-50">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-600">
                {validationSummary.errors > 0 ? (
                  <span className="text-red-600 font-medium">
                    Please fix {validationSummary.errors} error(s) before uploading
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    Ready to upload {validationSummary.valid} valid formula(s)
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsValidationDialogOpen(false)} className="min-w-[100px]">
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpload}
                  disabled={validationSummary.errors > 0}
                  className="bg-emerald-600 hover:bg-emerald-700 min-w-[200px]"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Confirm Upload ({validationSummary.valid} formulas)
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
