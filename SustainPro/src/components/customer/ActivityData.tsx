import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Download, 
  Upload, 
  FileSpreadsheet,
  Eye,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  Activity as ActivityIcon,
  Layers,
  Zap,
  Building,
  FolderOpen,
  Search,
  X,
  Info,
  FileText,
  TrendingUp,
  Package,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';
import { businessUnitsData, projectsData, type BusinessUnit as SharedBusinessUnit, type Project as SharedProject } from '../../data/businessUnitsData';
import { mockSubmissions as seedSubmissions } from '../../data/seedActivitySubmissions';
import { allActivities } from '../sa/activitiesData';
import { getFormulaByUID, getExpression, getVariableParameters, getEFParameters, type FormulaParameter } from '../../data/formulasData';
import { calculateEmissions, type ParsedActivityData } from './ActivityDataUploadHelper';
import { supabase } from '../../utils/supabase/client';
import { UploadedDataTableWithRemarks } from './UploadedDataTableWithRemarks';

// Interfaces
interface Project extends SharedProject {
  // Extend if needed for customer-specific fields
}

interface BusinessUnit {
  id: string;
  uid: string;
  name: string;
  projectId: string;
  projectName: string;
  defaultYear: number;
  defaultCountry: string;
  activitiesCount: number;
}

interface ActivityTemplate {
  id: string;
  uid: string;
  name: string;
  formulaName: string;
  scope: '1' | '2' | '3';
  impactCategories: string[];
  parameters: TemplateParameter[];
}

interface TemplateParameter {
  id: string;
  name: string;
  description: string;
  unit: string;
  parameterType: 'variable' | 'ef_value';
  required: boolean;
}

interface DataPoint {
  parameterId: string;
  parameterName: string;
  value: string;
  unit: string;
  parameterType?: string;
}

interface CalculatedActivityData {
  activityUID: string;
  activityName: string;
  griCategory: string;
  griSubcategory: string;
  scope: '1' | '2' | '3';
  calculatedValue: number;
  unit: string;
  formula: string;
  inputParameters: DataPoint[];
  /** Reporting framework this row was produced under. Absent = 'GRI' (legacy). */
  framework?: 'GRI' | 'ISO';
  /** ISO 14064-1 category number '1'..'6' (ISO activities only). */
  isoCategoryNumber?: string;
  /** Full ISO category title (ISO activities only). */
  isoCategory?: string;
  /** ISO 14064-1 sub-category code, e.g. '1.1' (ISO activities only). */
  isoSubcategory?: string;
}

interface BusinessUnitDataSubmission {
  id: string;
  businessUnitId: string;
  businessUnitName: string;
  businessUnitUID: string;
  projectId: string;
  projectName: string;
  calculatedData: CalculatedActivityData[];
  uploadedBy: string;
  uploadedAt: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  comments?: string;
  fileName?: string;
}

// Mock Data
const mockProjects: Project[] = projectsData.map(p => ({
  ...p,
  // Map status from shared type to customer type if needed
  status: p.status === 'active' ? 'in-progress' : p.status as 'draft' | 'in-progress' | 'completed'
}));

const mockBusinessUnits: BusinessUnit[] = businessUnitsData.map(bu => ({
  id: bu.id,
  uid: bu.uid,
  name: bu.name,
  projectId: bu.projectId || 'e0915ab8-8b06-4071-8b05-f9ad220fcb69',
  projectName: bu.projectName || 'Unknown Project',
  defaultYear: bu.defaultYear,
  defaultCountry: bu.defaultCountry,
  activitiesCount: bu.activities.length
}));

// Convert activities from businessUnitsData to activity templates for the customer view
const mockActivityTemplates: ActivityTemplate[] = (() => {
  // Get unique activities across all business units
  const uniqueActivitiesMap = new Map<string, ActivityTemplate>();
  
  businessUnitsData.forEach(bu => {
    bu.activities.forEach(activity => {
      if (!uniqueActivitiesMap.has(activity.uid)) {
        // Find the base activity to get formula and expression info
        const baseActivity = allActivities.find(a => a.uid === activity.uid);
        if (baseActivity && baseActivity.formulaUID && baseActivity.expressionId) {
          // Get the actual expression from formulas data
          const expression = getExpression(baseActivity.formulaUID, baseActivity.expressionId);
          
          if (expression) {
            // Extract variable and EF parameters from the expression
            const templateParameters: TemplateParameter[] = expression.parameters.map(param => ({
              id: param.id,
              name: param.name,
              description: param.description,
              unit: param.unit,
              parameterType: param.parameterType as 'variable' | 'ef_value',
              required: param.required
            }));
            
            uniqueActivitiesMap.set(activity.uid, {
              id: activity.id,
              uid: activity.uid,
              name: activity.name,
              formulaName: baseActivity.formulaName || 'Unknown Formula',
              scope: activity.scope,
              impactCategories: activity.impactCategories,
              parameters: templateParameters
            });
          }
        }
      }
    });
  });
  
  return Array.from(uniqueActivitiesMap.values());
})();

export const mockSubmissions = seedSubmissions;

// Helper function to group activities by GRI category
interface GroupedActivity {
  category: string;
  scope: string;
  activities: CalculatedActivityData[];
}

function groupActivitiesByGRI(activities: CalculatedActivityData[]): GroupedActivity[] {
  const grouped = new Map<string, CalculatedActivityData[]>();

  // Group by GRI category, or by ISO category for ISO-framework rows.
  const groupKey = (a: CalculatedActivityData) =>
    a.framework === 'ISO' ? (a.isoCategory || 'ISO 14064-1') : a.griCategory;
  const sortKey = (a: CalculatedActivityData) =>
    a.framework === 'ISO' ? (a.isoSubcategory || '') : a.griSubcategory;

  activities.forEach(activity => {
    const key = groupKey(activity);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(activity);
  });
  
  const result: GroupedActivity[] = [];
  grouped.forEach((activities, category) => {
    // Sort activities by GRI/ISO sub-category
    activities.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    result.push({
      category,
      scope: activities[0].scope,
      activities
    });
  });
  
  // Sort by scope
  return result.sort((a, b) => a.scope.localeCompare(b.scope));
}

interface ActivityDataProps {
  initialProjectId?: string;
  initialBUId?: string;
  onClearSelection?: () => void;
}

export function ActivityData({ initialProjectId = '', initialBUId = '', onClearSelection }: ActivityDataProps = {}) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [selectedBUId, setSelectedBUId] = useState<string>(initialBUId);
  const [activeTab, setActiveTab] = useState<'input' | 'view'>('input');
  
  // View tab filters
  const [viewProjectId, setViewProjectId] = useState<string>('');
  const [viewBUId, setViewBUId] = useState<string>('');
  const [viewSubmissionId, setViewSubmissionId] = useState<string>('');
  
  // View mode toggle: 'uploaded' for raw data, 'calculated' for computed results
  const [viewMode, setViewMode] = useState<'uploaded' | 'calculated'>('calculated');
  
  // Dialogs
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<CalculatedActivityData | null>(null);
  
  // Validation dialog state
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    passed: boolean;
    missingFields: string[];
    totalActivities: number;
    totalParameters: number;
    fileName: string;
    parsedData?: any;
  } | null>(null);
  
  // Store uploaded submissions
  const [uploadedSubmissions, setUploadedSubmissions] = useState<BusinessUnitDataSubmission[]>([...mockSubmissions]);

  // Backend fetched data for view tab
  // This ensures that "View Submitted Data" tab always shows the latest data from the server
  const [backendSubmission, setBackendSubmission] = useState<BusinessUnitDataSubmission | null>(null);
  const [isLoadingBackendData, setIsLoadingBackendData] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // SA-created projects + their BU assignments, loaded from Supabase, so a
  // Customer user can see and work on projects the SA created (not just seeds).
  const [dynamicProjects, setDynamicProjects] = useState<Project[]>([]);
  const [projectBULinks, setProjectBULinks] = useState<{ project_id: string; business_unit_id: string }[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const [{ data: projRows }, { data: links }] = await Promise.all([
          supabase.from('projects').select('*'),
          supabase.from('project_business_units').select('*'),
        ]);
        if (links) setProjectBULinks(links as any);
        if (projRows) {
          const seedIds = new Set(mockProjects.map((p) => p.id));
          setDynamicProjects(
            projRows
              .filter((r: any) => !seedIds.has(r.id))
              .map((r: any) => ({
                id: r.id,
                name: r.name,
                description: r.description || '',
                year: r.year,
                status: (r.status === 'in_progress' ? 'in-progress' : r.status) as any,
                type: 'BCA',
                createdAt: r.created_at,
                createdBy: 'sa_user',
              }))
          );
        }
      } catch (e) {
        console.error('Failed to load projects from Supabase:', e);
      }
    })();
  }, [refreshTrigger]);

  // Seed projects + SA-created projects, de-duped by id.
  const availableProjects: Project[] = React.useMemo(() => {
    const byId = new Map<string, Project>(mockProjects.map((p) => [p.id, p]));
    dynamicProjects.forEach((p) => { if (!byId.has(p.id)) byId.set(p.id, p); });
    return Array.from(byId.values());
  }, [dynamicProjects]);

  // projectId → Set(businessUnitId): from seed BU.projectId AND Supabase links.
  const projectBUMap = React.useMemo(() => {
    const m = new Map<string, Set<string>>();
    mockBusinessUnits.forEach((bu) => {
      if (!bu.projectId) return;
      if (!m.has(bu.projectId)) m.set(bu.projectId, new Set());
      m.get(bu.projectId)!.add(bu.id);
    });
    projectBULinks.forEach((l) => {
      if (!m.has(l.project_id)) m.set(l.project_id, new Set());
      m.get(l.project_id)!.add(l.business_unit_id);
    });
    return m;
  }, [projectBULinks]);

  // Update filters when initial values change
  React.useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
    if (initialBUId) {
      setSelectedBUId(initialBUId);
    }
  }, [initialProjectId, initialBUId]);

  // Fetch data from backend when view filters change
  React.useEffect(() => {
    const fetchBackendData = async () => {
      if (!viewProjectId || !viewBUId) {
        setBackendSubmission(null);
        return;
      }

      setIsLoadingBackendData(true);
      try {
        const { data, error } = await supabase
          .from('activity_submissions')
          .select('*')
          .eq('project_id', viewProjectId)
          .eq('business_unit_id', viewBUId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (!error && data && data.length > 0) {
          const dbData = data[0];
          const submission: BusinessUnitDataSubmission = {
            id: dbData.id,
            projectId: dbData.project_id,
            projectName: availableProjects.find(p => p.id === dbData.project_id)?.name || dbData.project_id,
            businessUnitId: dbData.business_unit_id,
            businessUnitName: mockBusinessUnits.find(bu => bu.id === dbData.business_unit_id)?.name || dbData.business_unit_id,
            businessUnitUID: mockBusinessUnits.find(bu => bu.id === dbData.business_unit_id)?.uid || dbData.business_unit_id,
            calculatedData: dbData.calculated_data,
            uploadedBy: dbData.uploaded_by,
            uploadedAt: dbData.created_at,
            status: dbData.status,
            fileName: dbData.file_name || 'Backend Data'
          };
          setBackendSubmission(submission);
        } else {
          setBackendSubmission(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setBackendSubmission(null);
      } finally {
        setIsLoadingBackendData(false);
      }
    };

    // Only fetch when on view tab
    if (activeTab === 'view') {
      fetchBackendData();
    }
  }, [viewProjectId, viewBUId, activeTab, refreshTrigger]);

  // Manual refresh function
  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.info('Refreshing data from backend...');
  };

  // Get filtered business units based on selected project
  // (uses seed BU.projectId AND Supabase project_business_units links)
  const filteredBusinessUnits = selectedProjectId
    ? mockBusinessUnits.filter(bu => projectBUMap.get(selectedProjectId)?.has(bu.id))
    : [];

  // Get business units for view tab
  const viewFilteredBusinessUnits = viewProjectId
    ? mockBusinessUnits.filter(bu => projectBUMap.get(viewProjectId)?.has(bu.id))
    : [];

  // Get submissions for the selected BU (use uploaded submissions which includes mock + new uploads)
  const viewFilteredSubmissions = viewProjectId && viewBUId
    ? uploadedSubmissions.filter(sub => 
        sub.projectId === viewProjectId && sub.businessUnitId === viewBUId
      )
    : [];

  // Get activities for selected BU - filter by BU's assigned activities
  const availableActivities = selectedBUId
    ? (() => {
        const bu = businessUnitsData.find(b => b.id === selectedBUId);
        if (!bu) return [];
        
        // Get activity UIDs for this business unit
        const buActivityUIDs = new Set(bu.activities.map(a => a.uid));
        
        // Filter mockActivityTemplates to only include this BU's activities
        return mockActivityTemplates.filter(template => buActivityUIDs.has(template.uid));
      })()
    : [];

  const handleDownloadConsolidatedTemplate = () => {
    if (!selectedBUId || !selectedProjectId) {
      toast.error('Please select both Project and Business Unit');
      return;
    }

    const selectedBU = mockBusinessUnits.find(bu => bu.id === selectedBUId);
    const selectedProject = availableProjects.find(p => p.id === selectedProjectId);
    
    if (!selectedBU || !selectedProject) return;

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Instructions
      const instructionsData = [
        ['Activity Data Input Template'],
        [''],
        ['Project:', selectedProject.name],
        ['Business Unit:', selectedBU.name],
        ['Business Unit ID:', selectedBU.uid],
        ['Default Year:', selectedBU.defaultYear],
        ['Default Country:', selectedBU.defaultCountry],
        [''],
        ['Instructions:'],
        ['1. This template contains all activities assigned to your business unit'],
        ['2. Fill in the "User Input Value" column for each VARIABLE parameter'],
        ['3. Do NOT modify Activity UID, Activity Name, Parameter Name, Description, Unit, or Type columns'],
        ['4. Only fill values for parameters marked as "Variable" in the Type column'],
        ['5. Parameters marked as "EF Value" are automatically filled by the system'],
        ['6. Ensure your input values match the units specified'],
        ['7. Save the file after completing all required inputs'],
        ['8. Upload the completed template using the "Upload Completed Template" button'],
        [''],
        ['Notes:'],
        ['- All user input values should be numeric'],
        ['- Use the units specified in the Unit column'],
        ['- Contact your Sustainability Architect if you need clarification on any parameters']
      ];
      const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

      // Sheet 2: Activity Data Input - Parameter Details Format
      const headers = [
        'Activity UID',
        'Activity Name',
        'Scope',
        'Formula',
        'Impact Categories',
        'Parameter Name',
        'Parameter Description',
        'Unit',
        'Required',
        'User Input Value'
      ];

      // Build data rows - one row per VARIABLE parameter only
      const dataRows: any[][] = [headers];
      
      availableActivities.forEach((activity) => {
        // Only include variable parameters (exclude EF parameters)
        const variableParams = activity.parameters.filter(p => p.parameterType === 'variable');

        variableParams.forEach((param, paramIndex) => {
          const row: any[] = [
            paramIndex === 0 ? activity.uid : '', // Only show activity info on first row
            paramIndex === 0 ? activity.name : '',
            paramIndex === 0 ? `Scope ${activity.scope}` : '',
            paramIndex === 0 ? activity.formulaName : '',
            paramIndex === 0 ? activity.impactCategories.join(', ') : '',
            param.name,
            param.description,
            param.unit,
            param.required ? 'Yes' : 'No',
            '' // Empty for user input
          ];
          dataRows.push(row);
        });
      });

      const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);

      // Set column widths for better readability
      dataSheet['!cols'] = [
        { wch: 20 }, // Activity UID
        { wch: 40 }, // Activity Name
        { wch: 10 }, // Scope
        { wch: 35 }, // Formula
        { wch: 30 }, // Impact Categories
        { wch: 25 }, // Parameter Name
        { wch: 45 }, // Parameter Description
        { wch: 15 }, // Unit
        { wch: 10 }, // Required
        { wch: 20 }  // User Input Value
      ];

      XLSX.utils.book_append_sheet(workbook, dataSheet, 'Activity Data Input');

      // Generate Excel file and trigger download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedBU.uid}_ActivityData_Template.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully!', {
        description: `${selectedBU.uid}_ActivityData_Template.xlsx contains ${availableActivities.length} activities with ${availableActivities.reduce((sum, act) => sum + act.parameters.filter(p => p.parameterType === 'variable').length, 0)} variable parameters`
      });
    } catch (error) {
      console.error('Error generating Excel template:', error);
      toast.error('Failed to generate template', {
        description: 'Please try again or contact support'
      });
    }
  };

  const handleConsolidatedUpload = () => {
    if (!selectedBUId || !selectedProjectId) {
      toast.error('Please select both Project and Business Unit');
      return;
    }

    const selectedBU = mockBusinessUnits.find(bu => bu.id === selectedBUId);
    
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';
    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      try {
        // Show processing toast
        toast.info(`Processing file: ${file.name}`, {
          description: 'Validating required fields...'
        });

        // Read the Excel file
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = 'Activity Data Input';
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          toast.error('Invalid template format', {
            description: 'Sheet "Activity Data Input" not found in the uploaded file'
          });
          return;
        }

        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = jsonData[0] as string[];
        const dataRows = jsonData.slice(1) as any[][];

        // Find column indices
        const activityUIDColIndex = headers.findIndex(h => h === 'Activity UID');
        const activityNameColIndex = headers.findIndex(h => h === 'Activity Name');
        const scopeColIndex = headers.findIndex(h => h === 'Scope');
        const formulaColIndex = headers.findIndex(h => h === 'Formula');
        const paramNameColIndex = headers.findIndex(h => h === 'Parameter Name');
        const unitColIndex = headers.findIndex(h => h === 'Unit');
        const requiredColIndex = headers.findIndex(h => h === 'Required');
        const userInputColIndex = headers.findIndex(h => h === 'User Input Value');

        if (userInputColIndex === -1 || requiredColIndex === -1) {
          toast.error('Invalid template format', {
            description: 'Required columns not found in the template'
          });
          return;
        }

        // Validate all required fields are filled
        const missingRequired: string[] = [];
        let currentActivityName = '';
        let currentActivityUID = '';
        const uniqueActivities = new Set<string>();
        let totalParameters = 0;

        // Parse data by activity
        const activityDataMap = new Map<string, { 
          uid: string; 
          name: string; 
          scope: string;
          formula: string;
          parameters: Map<string, number>; 
        }>();

        dataRows.forEach((row) => {
          // Update current activity if present
          if (row[activityUIDColIndex] && row[activityUIDColIndex].trim() !== '') {
            currentActivityUID = row[activityUIDColIndex].trim();
            currentActivityName = row[activityNameColIndex] || '';
            uniqueActivities.add(currentActivityUID);
            
            if (!activityDataMap.has(currentActivityUID)) {
              activityDataMap.set(currentActivityUID, {
                uid: currentActivityUID,
                name: currentActivityName,
                scope: row[scopeColIndex] || '',
                formula: row[formulaColIndex] || '',
                parameters: new Map()
              });
            }
          }

          const isRequired = row[requiredColIndex] === 'Yes';
          const userInputValue = row[userInputColIndex];
          const paramName = row[paramNameColIndex];

          if (paramName) {
            totalParameters++;
            
            // Check if required field is empty
            if (isRequired && (userInputValue === undefined || userInputValue === null || userInputValue === '')) {
              missingRequired.push(`${currentActivityName} - ${paramName}`);
            } else if (userInputValue !== undefined && userInputValue !== null && userInputValue !== '') {
              // Store the parameter value
              const activityData = activityDataMap.get(currentActivityUID);
              if (activityData) {
                activityData.parameters.set(paramName, parseFloat(userInputValue) || 0);
              }
            }
          }
        });

        // Show validation dialog
        setValidationResults({
          passed: missingRequired.length === 0,
          missingFields: missingRequired,
          totalActivities: uniqueActivities.size,
          totalParameters: totalParameters,
          fileName: file.name,
          parsedData: activityDataMap
        });
        setIsValidationDialogOpen(true);

      } catch (error) {
        console.error('Error processing Excel file:', error);
        toast.error('Failed to process file', {
          description: 'Please ensure you are uploading a valid Excel file'
        });
      }
    };
    fileInput.click();
  };

  const handleConfirmUpload = async () => {
    if (!validationResults || !validationResults.passed || !validationResults.parsedData) {
      return;
    }

    const selectedBU = mockBusinessUnits.find(bu => bu.id === selectedBUId);
    const selectedProject = availableProjects.find(p => p.id === selectedProjectId);
    
    if (!selectedBU || !selectedProject) return;

    try {
      // Calculate emissions for each activity using real formulas
      const calculatedData: CalculatedActivityData[] = [];
      
      validationResults.parsedData.forEach((activityData: any, activityUID: string) => {
        // Calculate using the helper function
        const calculation = calculateEmissions(activityUID, activityData.parameters);
        
        // Find the base activity to resolve its framework + categorisation
        const baseActivity = allActivities.find(a => a.uid === activityUID);
        const isISO = baseActivity?.framework === 'ISO'
          || ((baseActivity?.isoCategories?.length ?? 0) > 0
              && (baseActivity?.grpCategories?.length ?? 0) === 0);

        // ISO 14064-1 category titles, keyed by category number.
        const ISO_CATEGORY_TITLES: Record<string, string> = {
          '1': 'Category 1: Direct GHG emissions and removals',
          '2': 'Category 2: Indirect GHG emissions from imported energy',
          '3': 'Category 3: Indirect GHG emissions from transportation',
          '4': 'Category 4: Indirect GHG emissions from products used by the organization',
          '5': 'Category 5: Indirect GHG emissions associated with the use of products from the organization',
          '6': 'Category 6: Other indirect GHG emissions',
        };
        
        // Build the input parameters list
        const inputParameters: DataPoint[] = [];
        calculation.allParameters.forEach(param => {
          inputParameters.push({
            parameterId: `param-${activityUID}-${param.name}`,
            parameterName: param.name,
            value: String(param.value),
            unit: param.unit,
            parameterType: param.parameterType
          });
        });
        
        if (isISO) {
          // ── ISO activity → stamp ISO categorisation directly ──────────────
          const isoSub = baseActivity?.isoCategories?.[0] || '';
          const isoCatNum = isoSub.split('.')[0] || '';
          calculatedData.push({
            activityUID: activityUID,
            activityName: activityData.name,
            framework: 'ISO',
            isoCategoryNumber: isoCatNum,
            isoCategory: ISO_CATEGORY_TITLES[isoCatNum] || '',
            isoSubcategory: isoSub,
            // GRI fields left blank for ISO rows (kept for type compatibility)
            griCategory: '',
            griSubcategory: '',
            scope: (isoCatNum === '1' ? '1' : isoCatNum === '2' ? '2' : '3') as '1' | '2' | '3',
            calculatedValue: calculation.calculatedValue,
            unit: 'kgCO2e',
            formula: calculation.formula,
            inputParameters: inputParameters
          });
        } else {
          calculatedData.push({
            activityUID: activityUID,
            activityName: activityData.name,
            framework: 'GRI',
            griCategory: baseActivity?.grpCategories?.[0]?.startsWith('305.1') 
              ? 'GRI 305-1 Direct GHG emissions (Scope 1)'
              : baseActivity?.grpCategories?.[0]?.startsWith('305.2')
              ? 'GRI 305-2 Indirect GHG emissions (Scope 2)'
              : 'GRI 305-3 Indirect GHG emissions (Scope 3)',
            griSubcategory: baseActivity?.grpCategories?.[0] || `305.${activityData.scope}.1`,
            scope: activityData.scope.replace('Scope ', '') as '1' | '2' | '3',
            calculatedValue: calculation.calculatedValue,
            unit: 'kgCO2e',
            formula: calculation.formula,
            inputParameters: inputParameters
          });
        }
      });

      // Create new submission
      const newSubmission: BusinessUnitDataSubmission = {
        id: `sub-${Date.now()}`,
        businessUnitId: selectedBU.id,
        businessUnitName: selectedBU.name,
        businessUnitUID: selectedBU.uid,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        calculatedData,
        uploadedBy: 'John Smith', // In real system, get from auth
        uploadedAt: new Date().toISOString(),
        status: 'submitted',
        fileName: validationResults.fileName
      };

      // Add to uploaded submissions
      setUploadedSubmissions(prev => [...prev, newSubmission]);

      try {
        const { error } = await supabase
          .from('activity_submissions')
          .insert({
            project_id: selectedProject.id,
            business_unit_id: selectedBU.id,
            uploaded_by: 'John Smith',
            file_name: validationResults.fileName,
            calculated_data: calculatedData
          });
          
        if (error) {
           console.error('Supabase error:', error);
           toast.error('Failed to save data to Supabase');
           return;
        } else {
           console.log('Data successfully saved to Supabase');
        }
      } catch (error) {
        console.error('Error saving data:', error);
        toast.error('Failed to save data to Supabase');
        return;
      }

      // Close dialog
      setIsValidationDialogOpen(false);

      // Show success message
      toast.success('Data uploaded successfully!', {
        description: `${calculatedData.length} activities calculated and submitted for review`
      });

      // Switch to view tab
      setActiveTab('view');
      setViewProjectId(selectedProjectId);
      setViewBUId(selectedBUId);

    } catch (error) {
      console.error('Error processing upload:', error);
      toast.error('Failed to process upload', {
        description: 'An error occurred while calculating emissions'
      });
    }
  };

  const handleViewActivityDetails = (activity: CalculatedActivityData) => {
    setSelectedActivity(activity);
    setIsViewDetailsOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'submitted': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'draft': return <FileText className="h-4 w-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const selectedProject = availableProjects.find(p => p.id === selectedProjectId);
  const selectedBU = mockBusinessUnits.find(bu => bu.id === selectedBUId);
  
  const viewSelectedProject = availableProjects.find(p => p.id === viewProjectId);
  const viewSelectedBU = mockBusinessUnits.find(bu => bu.id === viewBUId);

  // Get the most recent submission for display - prioritize backend data
  const latestSubmission = backendSubmission || (viewFilteredSubmissions.length > 0 
    ? viewFilteredSubmissions[viewFilteredSubmissions.length - 1]
    : null);

  const groupedActivities = latestSubmission 
    ? groupActivitiesByGRI(latestSubmission.calculatedData)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Activity Data</h1>
        <p className="text-gray-600">
          Download consolidated templates and submit activity data for your assigned business units
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'input' | 'view')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Input Data
          </TabsTrigger>
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Submitted Data
          </TabsTrigger>
        </TabsList>

        {/* Input Data Tab */}
        <TabsContent value="input" className="space-y-4">
          {/* Project and Business Unit Selection */}
          <Card className="border-emerald-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Database className="h-5 w-5" />
                Select Project & Business Unit
              </CardTitle>
              <CardDescription>
                Choose the project and business unit to download the consolidated activity template
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-emerald-600" />
                    Project
                  </Label>
                  <Select value={selectedProjectId} onValueChange={(value) => {
                    setSelectedProjectId(value);
                    setSelectedBUId(''); // Reset BU when project changes
                  }}>
                    <SelectTrigger className="border-emerald-200 focus:ring-emerald-500">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {project.type}
                            </Badge>
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-emerald-600" />
                    Business Unit
                  </Label>
                  <Select 
                    value={selectedBUId} 
                    onValueChange={setSelectedBUId}
                    disabled={!selectedProjectId}
                  >
                    <SelectTrigger className="border-emerald-200 focus:ring-emerald-500">
                      <SelectValue placeholder="Select a business unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredBusinessUnits.map(bu => (
                        <SelectItem key={bu.id} value={bu.id}>
                          <div className="flex flex-col items-start">
                            <span>{bu.name}</span>
                            <span className="text-xs text-gray-500">
                              {bu.activitiesCount} activities • {bu.uid}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedProject && selectedBU && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-900">Selected Context</p>
                      <p className="text-sm text-emerald-700 mt-1">
                        <span className="font-medium">{selectedProject.name}</span> • {selectedBU.name}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Default: {selectedBU.defaultYear} • {selectedBU.defaultCountry} ��� {selectedBU.activitiesCount} Activities
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Download and Upload Section */}
          {selectedBUId ? (
            <Card className="border-emerald-200">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <FileSpreadsheet className="h-5 w-5" />
                  Consolidated Activity Template
                </CardTitle>
                <CardDescription>
                  Download a single Excel file containing all {availableActivities.length} activities for this business unit
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Activities Summary */}
                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-emerald-600" />
                    Activities Included in Template
                  </h3>
                  <div className="space-y-2">
                    {availableActivities.map((activity, index) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900">{activity.name}</p>
                            <Badge variant="outline" className="text-xs">
                              Scope {activity.scope}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            <Zap className="h-3 w-3 inline mr-1" />
                            {activity.formulaName}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {activity.parameters.map(param => (
                              <Badge 
                                key={param.id} 
                                variant="outline" 
                                className="text-xs bg-white"
                              >
                                {param.name} ({param.unit})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleDownloadConsolidatedTemplate}
                    className="w-full border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 h-auto py-4 flex-col gap-2"
                  >
                    <Download className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Download Template</div>
                      <div className="text-xs font-normal">Excel file with all activities</div>
                    </div>
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleConsolidatedUpload}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-auto py-4 flex-col gap-2"
                  >
                    <Upload className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Upload Completed Template</div>
                      <div className="text-xs font-normal">Submit your filled Excel file</div>
                    </div>
                  </Button>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Instructions
                  </h4>
                  <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
                    <li>Click "Download Template" to get the Excel file with all activities</li>
                    <li>Fill in the parameter values for each activity in the template</li>
                    <li>The system will automatically calculate emissions based on the formulas</li>
                    <li>Save the completed Excel file on your computer</li>
                    <li>Click "Upload Completed Template" to submit your data</li>
                    <li>Wait for the Sustainability Architect to review and approve your submission</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="pt-12 pb-12 text-center">
                <ActivityIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Select a Project and Business Unit</p>
                <p className="text-sm text-gray-500 mt-1">
                  Choose a project and business unit above to download the consolidated activity template
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* View Submitted Data Tab */}
        <TabsContent value="view" className="space-y-4">
          <Card className="border-emerald-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-emerald-900">
                    <Database className="h-5 w-5" />
                    Filter Submissions
                  </CardTitle>
                  <CardDescription>
                    Select project and business unit to view uploaded data
                  </CardDescription>
                </div>
                {viewProjectId && viewBUId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshData}
                    disabled={isLoadingBackendData}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingBackendData ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-emerald-600" />
                    Project
                  </Label>
                  <Select value={viewProjectId} onValueChange={(value) => {
                    setViewProjectId(value);
                    setViewBUId('');
                  }}>
                    <SelectTrigger className="border-emerald-200 focus:ring-emerald-500">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {project.type}
                            </Badge>
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-emerald-600" />
                    Business Unit
                  </Label>
                  <Select 
                    value={viewBUId} 
                    onValueChange={setViewBUId}
                    disabled={!viewProjectId}
                  >
                    <SelectTrigger className="border-emerald-200 focus:ring-emerald-500">
                      <SelectValue placeholder="Select a business unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {viewFilteredBusinessUnits.map(bu => (
                        <SelectItem key={bu.id} value={bu.id}>
                          <div className="flex flex-col items-start">
                            <span>{bu.name}</span>
                            <span className="text-xs text-gray-500">{bu.uid}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoadingBackendData && viewSelectedProject && viewSelectedBU && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Loading latest submitted data...</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Fetching data for {viewSelectedBU.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isLoadingBackendData && viewSelectedProject && viewSelectedBU && latestSubmission && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-emerald-900">Viewing Latest Submission for {viewSelectedBU.name}</p>
                        <p className="text-sm text-emerald-700 mt-1">
                          <span className="font-medium">{viewSelectedProject.name}</span>
                        </p>
                        <p className="text-sm text-emerald-600 mt-2 flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          <span className="font-semibold">Latest data from backend</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isLoadingBackendData && viewSelectedProject && viewSelectedBU && !latestSubmission && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">No Data Found</p>
                      <p className="text-sm text-gray-700 mt-1">
                        No data has been uploaded yet for {viewSelectedBU.name} in {viewSelectedProject.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Data View - Excel Format */}
          {isLoadingBackendData ? (
            <Card className="border-emerald-200">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading submitted data from backend...</p>
              </CardContent>
            </Card>
          ) : latestSubmission ? (
            <Card className="border-emerald-200">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <FileSpreadsheet className="h-5 w-5" />
                  Uploaded Parameter Data
                </CardTitle>
                <CardDescription>
                  Raw input data from uploaded template (variables only)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <UploadedDataTableWithRemarks
                  calculatedData={latestSubmission.calculatedData}
                  bcaProjectId={viewSelectedProject.id}
                  businessUnitId={viewSelectedBU.id}
                  onDataUpdate={() => {
                    // Trigger data refresh
                    setRefreshTrigger(prev => prev + 1);
                  }}
                />
                <div style={{display: 'none'}} className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50">
                        <TableHead className="font-semibold">Activity UID</TableHead>
                        <TableHead className="font-semibold">Activity Name</TableHead>
                        <TableHead className="font-semibold">Parameter Name</TableHead>
                        <TableHead className="font-semibold">Unit</TableHead>
                        <TableHead className="font-semibold text-right">Input Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        let globalRowIndex = 0;
                        return latestSubmission.calculatedData.map((activity, activityIndex) => {
                          // Filter out EF parameters, only show variables
                          const variableParams = activity.inputParameters.filter(param => 
                            param.parameterType === 'variable'
                          );
                          
                          return variableParams.length > 0 ? (
                            <React.Fragment key={activityIndex}>
                              {variableParams.map((param, paramIndex) => {
                                const currentRowIndex = globalRowIndex++;
                                const isEvenRow = currentRowIndex % 2 === 0;
                                return (
                                  <TableRow 
                                    key={`${activityIndex}-${paramIndex}`} 
                                    className={isEvenRow ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'bg-white hover:bg-gray-50'}
                                  >
                                    <TableCell className="font-mono text-xs text-gray-600">
                                      {paramIndex === 0 ? activity.activityUID : ''}
                                    </TableCell>
                                    <TableCell className="text-gray-900">
                                      {paramIndex === 0 ? activity.activityName : ''}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">
                                      {param.parameterName}
                                    </TableCell>
                                    <TableCell className="text-gray-600 text-sm">
                                      {param.unit}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-gray-900">
                                      {param.value}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </React.Fragment>
                          ) : null;
                        });
                      })()}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-4">
                  <Card className="border-gray-200">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Total Activities</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {latestSubmission.calculatedData.length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Variable Parameters</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {latestSubmission.calculatedData.reduce((sum, a) => 
                            sum + a.inputParameters.filter(p => p.parameterType === 'variable').length, 0
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Uploaded By</p>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                          {latestSubmission.uploadedBy}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Upload Date</p>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                          {new Date(latestSubmission.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="pt-12 pb-12 text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Select Project and Business Unit</p>
                <p className="text-sm text-gray-500 mt-1">
                  Choose filters above to view uploaded data
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Validation Dialog - Responsive Size */}
      <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
        <DialogContent className="!w-[98vw] sm:!w-[95vw] md:!w-[92vw] lg:!w-[90vw] xl:!w-[88vw] 2xl:!w-[85vw] !max-w-[2000px] h-[92vh] max-h-[95vh] flex flex-col p-6">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              {validationResults?.passed ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-900">Validation Passed</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-900">Validation Failed</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {validationResults?.passed 
                ? 'All required fields are filled. Review the uploaded data below and click OK to upload.'
                : 'Some required fields are missing. Please review the errors below.'}
            </DialogDescription>
          </DialogHeader>

          {validationResults && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* File Info Summary */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                        <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                        File: {validationResults.fileName}
                      </h3>
                      <div className="flex gap-8 text-base">
                        <div>
                          <span className="text-emerald-700 font-medium">Activities:</span>
                          <span className="ml-2 font-bold text-emerald-900 text-lg">{validationResults.totalActivities}</span>
                        </div>
                        <div>
                          <span className="text-emerald-700 font-medium">Parameters:</span>
                          <span className="ml-2 font-bold text-emerald-900 text-lg">{validationResults.totalParameters}</span>
                        </div>
                        <div>
                          <span className="text-emerald-700 font-medium">Missing Fields:</span>
                          <span className="ml-2 font-bold text-red-600 text-lg">{validationResults.missingFields.length}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      className="text-lg px-5 py-2.5 font-semibold"
                      variant={validationResults.passed ? 'default' : 'destructive'}
                    >
                      {validationResults.passed ? '✓ Valid' : '✗ Invalid'}
                    </Badge>
                  </div>
                </div>

                {/* Missing Fields Warning */}
                {!validationResults.passed && validationResults.missingFields.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                    <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Missing Required Fields ({validationResults.missingFields.length})
                    </h3>
                    <div className="max-h-40 overflow-y-auto bg-white rounded p-3 border border-red-200">
                      <ul className="text-sm text-red-800 space-y-1.5">
                        {validationResults.missingFields.map((field, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">✗</span>
                            <span className="font-medium">{field}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-sm text-red-700 mt-3 font-medium">
                      ⚠️ Please fill in all required fields in your Excel file and upload again.
                    </p>
                  </div>
                )}

                {/* Uploaded Data Table */}
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-5 py-3 border-b-2 border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Database className="h-5 w-5 text-emerald-600" />
                      Uploaded Data Preview
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-emerald-50 border-b-2 border-emerald-200">
                          <TableHead className="font-semibold text-emerald-900 whitespace-nowrap min-w-[120px]">Activity UID</TableHead>
                          <TableHead className="font-semibold text-emerald-900 whitespace-nowrap min-w-[200px]">Activity Name</TableHead>
                          <TableHead className="font-semibold text-emerald-900 whitespace-nowrap min-w-[100px]">Scope</TableHead>
                          <TableHead className="font-semibold text-emerald-900 min-w-[350px]">Formula</TableHead>
                          <TableHead className="font-semibold text-emerald-900 whitespace-nowrap min-w-[220px]">Parameter Name</TableHead>
                          <TableHead className="font-semibold text-emerald-900 whitespace-nowrap text-right min-w-[120px]">Value</TableHead>
                          <TableHead className="font-semibold text-emerald-900 whitespace-nowrap text-center min-w-[80px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResults.parsedData && Array.from(validationResults.parsedData.entries()).map(([activityUID, activityData]: [string, any], actIndex) => {
                          const paramEntries = Array.from(activityData.parameters.entries());
                          return (
                            <React.Fragment key={activityUID}>
                              {paramEntries.map(([paramName, paramValue]: [string, number], paramIndex) => (
                                <TableRow 
                                  key={`${activityUID}-${paramName}`}
                                  className={paramIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                >
                                  <TableCell className="font-mono text-xs text-gray-600 whitespace-nowrap">
                                    {paramIndex === 0 ? activityUID : ''}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-900 font-medium">
                                    {paramIndex === 0 ? activityData.name : ''}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {paramIndex === 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        {activityData.scope}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-700">
                                    {paramIndex === 0 ? activityData.formula : ''}
                                  </TableCell>
                                  <TableCell className="text-sm font-medium text-gray-900">
                                    {paramName}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold text-gray-900 whitespace-nowrap">
                                    {paramValue}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {paramValue > 0 ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 text-gray-400 mx-auto" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                              {actIndex < validationResults.parsedData.size - 1 && (
                                <TableRow>
                                  <TableCell colSpan={7} className="h-0.5 bg-emerald-200 p-0"></TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Success Message */}
                {validationResults.passed && (
                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                    <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      ✓ Validation Successful - Ready to Upload
                    </h3>
                    <p className="text-sm text-green-800 mb-3">
                      All {validationResults.totalParameters} parameter values have been successfully validated. 
                      The system will calculate emissions using the assigned formulas.
                    </p>
                    <div className="p-3 bg-white rounded border border-green-300">
                      <p className="text-sm text-green-700">
                        <strong>Next Steps:</strong> Click "OK - Upload Data" to process the calculations and submit 
                        the data for review by the Sustainability Architect.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="flex-shrink-0 gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsValidationDialogOpen(false)}
              className="min-w-32 h-11 text-base"
            >
              Cancel
            </Button>
            {validationResults?.passed && (
              <Button
                onClick={handleConfirmUpload}
                className="bg-emerald-600 hover:bg-emerald-700 min-w-48 h-11 text-base font-semibold"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                OK - Upload Data
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              Activity Calculation Details
            </DialogTitle>
            <DialogDescription>
              Formula, input parameters, and calculated result
            </DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-4">
              {/* Activity Info */}
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h3 className="font-semibold text-emerald-900 mb-2">{selectedActivity.activityName}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-emerald-700">GRI Code:</span>
                    <span className="ml-2 font-medium text-emerald-900">{selectedActivity.griSubcategory}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700">Scope:</span>
                    <Badge variant="outline" className="ml-2">{selectedActivity.scope}</Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-emerald-700">Category:</span>
                    <span className="ml-2 font-medium text-emerald-900">{selectedActivity.griCategory}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Formula */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-2 block flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  Calculation Formula
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <code className="text-sm font-mono text-gray-900">{selectedActivity.formula}</code>
                </div>
              </div>

              <Separator />

              {/* Input Parameters */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-2 block">Input Parameters</Label>
                <div className="space-y-2">
                  {selectedActivity.inputParameters.map((param) => (
                    <div 
                      key={param.parameterId} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{param.parameterName}</p>
                        <p className="text-xs text-gray-500">{param.unit}</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{param.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Calculated Result */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-300">
                <Label className="text-sm font-semibold text-emerald-900 mb-2 block">Calculated Result</Label>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-emerald-900">Total Emissions:</span>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-700">
                      {selectedActivity.calculatedValue.toLocaleString('en-US', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1
                      })}
                    </p>
                    <p className="text-sm text-emerald-600">{selectedActivity.unit}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}