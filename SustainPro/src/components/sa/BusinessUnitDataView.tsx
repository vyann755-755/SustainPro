import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
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
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { GRIReportTable } from './GRIReportTable';
import { UploadedDataTableWithRemarks } from './UploadedDataTableWithRemarks';

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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4f35b1fc/activity-data/${bcaProjectId}/${businessUnitId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setUploadedData(result.data);
      } else if (response.status === 404) {
        setUploadedData(null);
        toast.info('No data uploaded yet', {
          description: 'Customer user has not uploaded data for this business unit'
        });
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching uploaded data:', error);
      console.error('Request details:', {
        projectId,
        bcaProjectId,
        businessUnitId,
        url: `https://${projectId}.supabase.co/functions/v1/make-server-4f35b1fc/activity-data/${bcaProjectId}/${businessUnitId}`
      });
      toast.error('Failed to load uploaded data', {
        description: 'Unable to connect to server. Please ensure the backend is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    setActiveTab('report');
    toast.success('Report generated successfully!');
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
              GRI Report
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
                  <Button onClick={generateReport} className="bg-emerald-600 hover:bg-emerald-700">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
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

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-6">
            <GRIReportTable 
              projectName={projectName}
              assignedBUs={assignedBUs}
              reportingYear={2024}
              projectId={bcaProjectId}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}