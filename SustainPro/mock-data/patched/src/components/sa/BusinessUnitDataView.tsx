import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { 
  Building,
  FileText,
  TrendingUp,
  Database,
  Calendar,
  User,
  ArrowLeft,
  Download,
  Eye,
  BarChart3,
  Layers,
  MessageSquare,
  Send,
  Clock
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../utils/supabase/client';
import { GRIReportTable } from './GRIReportTable';
import { ISOReportTable } from './ISOReportTable';
import { UploadedDataTableWithRemarks } from './UploadedDataTableWithRemarks';
import { mockSubmissions } from '../customer/ActivityData';
import jsPDF from 'jspdf';
import { generateGRIPdf, generateISOPdf } from './reportPDF';
import { mockBusinessUnits } from './CDBBusinessUnits';
import autoTable from 'jspdf-autotable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface DataPoint {
  parameterId: string;
  parameterName: string;
  value: string;
  unit: string;
  parameterType?: string;
  remarks?: Remark[]; // Add remarks array
}

interface Remark {
  id: string;
  comment: string;
  commentedBy: string;
  role: 'sa' | 'customer';
  timestamp: string;
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
}

interface UploadedData {
  projectId: string;
  businessUnitId: string;
  calculatedData: CalculatedActivityData[];
  uploadedBy: string;
  timestamp: string;
}

interface BusinessUnitDataViewProps {
  projectId: string;
  businessUnitId: string;
  businessUnitName: string;
  projectName: string;
  onBack: () => void;
  assignedBUs?: string[]; // Add this to receive all BUs in the project
}

export function BusinessUnitDataView({ 
  projectId: bcaProjectId, 
  businessUnitId, 
  businessUnitName,
  projectName,
  onBack,
  assignedBUs
}: BusinessUnitDataViewProps) {
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('uploaded');

  useEffect(() => {
    fetchUploadedData();
  }, [businessUnitId]);

  const fetchUploadedData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_submissions')
        .select('*')
        .eq('project_id', bcaProjectId)
        .eq('business_unit_id', businessUnitId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const dbData = data[0];
        setUploadedData({
          projectId: dbData.project_id,
          businessUnitId: dbData.business_unit_id,
          calculatedData: dbData.calculated_data,
          uploadedBy: dbData.uploaded_by,
          timestamp: dbData.created_at
        });
      } else {
        // Fallback to mock data if no data in Supabase
        const mockSubmission = mockSubmissions.find(sub => sub.projectId === bcaProjectId && sub.businessUnitId === businessUnitId);
        if (mockSubmission) {
          setUploadedData({
            projectId: mockSubmission.projectId,
            businessUnitId: mockSubmission.businessUnitId,
            calculatedData: mockSubmission.calculatedData,
            uploadedBy: mockSubmission.uploadedBy,
            timestamp: mockSubmission.uploadedAt
          });
          toast.info('Using sample data', {
            description: 'No database records found, showing mock data instead.'
          });
        } else {
          setUploadedData(null);
          toast.info('No data uploaded yet', {
            description: 'Customer user has not uploaded data for this business unit'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching uploaded data:', error);
      // Fallback to mock data on error
      const mockSubmission = mockSubmissions.find(sub => sub.projectId === bcaProjectId && sub.businessUnitId === businessUnitId);
      if (mockSubmission) {
        setUploadedData({
          projectId: mockSubmission.projectId,
          businessUnitId: mockSubmission.businessUnitId,
          calculatedData: mockSubmission.calculatedData,
          uploadedBy: mockSubmission.uploadedBy,
          timestamp: mockSubmission.uploadedAt
        });
        toast.info('Using sample data', {
          description: 'Database connection failed, showing mock data instead.'
        });
      } else {
        setUploadedData(null);
        toast.error('Failed to load uploaded data', {
          description: 'Unable to retrieve data from local cache or database.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (type: 'GRI' | 'ISO') => {
    if (!uploadedData) {
      toast.error('No data to generate report');
      return;
    }
    const args = {
      projectName,
      reportingYear: 2025,
      singleBUName: businessUnitName,
      buData: [{
        businessUnitId,
        businessUnitName,
        calculatedData: uploadedData.calculatedData,
      }],
    };
    if (type === 'GRI') generateGRIPdf(args);
    else generateISOPdf(args);
    toast.success(`${type} Report downloaded successfully!`);
  };

  // Group activities by GRI category
  const groupedByGRI = uploadedData?.calculatedData.reduce((acc, activity) => {
    const category = activity.griCategory;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(activity);
    return acc;
  }, {} as Record<string, CalculatedActivityData[]>) || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading uploaded data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{businessUnitName}</h2>
            <p className="text-sm text-gray-600">{projectName}</p>
          </div>
        </div>
      </div>

      {!uploadedData ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="pt-12 pb-12 text-center">
            <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Uploaded Yet</h3>
            <p className="text-gray-600">
              Customer user has not uploaded activity data for this business unit.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-emerald-100/50">
            <TabsTrigger value="uploaded" className="data-[state=active]:bg-white">
              <FileText className="h-4 w-4 mr-2" />
              Uploaded Data
            </TabsTrigger>
            <TabsTrigger value="report" className="data-[state=active]:bg-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Report
            </TabsTrigger>
          </TabsList>

          {/* Uploaded Data Tab */}
          <TabsContent value="uploaded" className="space-y-6">
            <Card className="border-2 border-emerald-100">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-900">Uploaded Activity Data</CardTitle>
                    <CardDescription>
                      View variable parameters submitted by customer user
                    </CardDescription>
                  </div>

                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Metadata */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-600">Uploaded By</p>
                      <p className="font-medium text-gray-900">{uploadedData.uploadedBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-600">Upload Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(uploadedData.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Layers className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-600">Total Activities</p>
                      <p className="font-medium text-gray-900">{uploadedData.calculatedData.length}</p>
                    </div>
                  </div>
                </div>

                {/* Parameters Table */}
                <UploadedDataTableWithRemarks
                  calculatedData={uploadedData.calculatedData}
                  bcaProjectId={bcaProjectId}
                  businessUnitId={businessUnitId}
                  onDataUpdate={fetchUploadedData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Tab — single-BU view, dropdown to switch report type */}
          <TabsContent value="report" className="space-y-6">
            <BUReportPreview
              projectName={projectName}
              businessUnitId={businessUnitId}
              businessUnitName={businessUnitName}
              projectId={bcaProjectId}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//                  BUReportPreview  (single-BU report viewer)
// ────────────────────────────────────────────────────────────────────────────
function BUReportPreview({
  projectName, businessUnitId, businessUnitName, projectId,
}: {
  projectName: string;
  businessUnitId: string;
  businessUnitName: string;
  projectId: string;
}) {
  const [reportType, setReportType] = React.useState<string>('GRI');
  const [customTemplates, setCustomTemplates] = React.useState<any[]>([]);

  React.useEffect(() => {
    supabase
      .from('report_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setCustomTemplates(data); });
  }, []);

  const customTpl = customTemplates.find((t) => t.id === reportType);

  return (
    <div className="space-y-4">
      <Card className="border-2 border-emerald-100">
        <CardContent className="p-4 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Report type:</span>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GRI">GRI Report</SelectItem>
              <SelectItem value="ISO">ISO Report</SelectItem>
              {customTemplates.length > 0 && (
                <div className="border-t my-1" />
              )}
              {customTemplates.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {reportType === 'GRI' ? (
        <GRIReportTable
          projectName={projectName}
          assignedBUs={[businessUnitId]}
          reportingYear={2025}
          projectId={projectId}
          singleBUName={businessUnitName}
        />
      ) : reportType === 'ISO' ? (
        <ISOReportTable
          projectName={projectName}
          assignedBUs={[businessUnitId]}
          reportingYear={2025}
          projectId={projectId}
          singleBUName={businessUnitName}
        />
      ) : customTpl ? (
        // Custom template — render with its base type, passing customTemplate
        customTpl.base_type === 'GRI' ? (
          <GRIReportTable
            projectName={projectName}
            assignedBUs={[businessUnitId]}
            reportingYear={customTpl.reporting_year || 2025}
            projectId={projectId}
            singleBUName={businessUnitName}
            customTemplate={customTpl.template_structure}
            customTitle={customTpl.name}
          />
        ) : (
          <ISOReportTable
            projectName={projectName}
            assignedBUs={[businessUnitId]}
            reportingYear={customTpl.reporting_year || 2025}
            projectId={projectId}
            singleBUName={businessUnitName}
            customTemplate={customTpl.template_structure}
            customTitle={customTpl.name}
          />
        )
      ) : null}
    </div>
  );
}
