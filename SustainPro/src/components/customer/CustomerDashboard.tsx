import React, { useState } from 'react';
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
  Download, 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
  BarChart3,
  AlertCircle,
  MessageSquare,
  Package,
  Building2,
  Edit,
  FileSpreadsheet,
  Link2,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { CustomerDataUpload } from './CustomerDataUpload';
import { CustomerAnalytics } from './CustomerAnalytics';
import { CustomerReportGeneration } from './CustomerReportGeneration';

interface Assignment {
  id: string;
  projectId: string;
  projectName: string;
  projectType: 'LCA' | 'BCA';
  itemId: string;
  itemName: string;
  itemType: 'product' | 'sub-product' | 'business-unit';
  status: 'assigned' | 'in-progress' | 'pending-review' | 'approved' | 'needs-revision';
  dueDate: string;
  lastUpdated?: string;
  dataStatus: 'no-data' | 'partial' | 'complete';
  comments?: string;
  assignedBy: string;
}

const mockAssignments: Assignment[] = [
  {
    id: 'assign-1',
    projectId: 'proj-lca-1',
    projectName: 'Product LCA - Steel Production',
    projectType: 'LCA',
    itemId: 'prod-1',
    itemName: 'Steel Production - Basic',
    itemType: 'product',
    status: 'in-progress',
    dueDate: '2025-02-15',
    lastUpdated: '2025-01-10',
    dataStatus: 'partial',
    assignedBy: 'SA Team Lead'
  },
  {
    id: 'assign-2',
    projectId: 'proj-lca-2',
    projectName: 'Product LCA - Plastic Packaging',
    projectType: 'LCA',
    itemId: 'prod-2',
    itemName: 'Plastic Packaging - PET',
    itemType: 'product',
    status: 'needs-revision',
    dueDate: '2025-02-20',
    lastUpdated: '2025-01-12',
    dataStatus: 'complete',
    comments: 'Please clarify the recycled content percentage',
    assignedBy: 'SA Team Lead'
  },
  {
    id: 'assign-3',
    projectId: 'proj-bca-1',
    projectName: 'Q1 2025 Carbon Assessment',
    projectType: 'BCA',
    itemId: 'bu-1',
    itemName: 'Manufacturing Plant - North America',
    itemType: 'business-unit',
    status: 'pending-review',
    dueDate: '2025-02-10',
    lastUpdated: '2025-01-15',
    dataStatus: 'complete',
    comments: 'Data submitted for SA review',
    assignedBy: 'SA Team Lead'
  },
  {
    id: 'assign-4',
    projectId: 'proj-bca-1',
    projectName: 'Q1 2025 Carbon Assessment',
    projectType: 'BCA',
    itemId: 'bu-2',
    itemName: 'Corporate Office - Europe',
    itemType: 'business-unit',
    status: 'approved',
    dueDate: '2025-02-05',
    lastUpdated: '2025-01-08',
    dataStatus: 'complete',
    comments: 'Data approved - excellent work!',
    assignedBy: 'SA Team Lead'
  },
  {
    id: 'assign-5',
    projectId: 'proj-bca-2',
    projectName: 'Annual Sustainability Report 2024',
    projectType: 'BCA',
    itemId: 'bu-3',
    itemName: 'Distribution Center - East Coast',
    itemType: 'business-unit',
    status: 'assigned',
    dueDate: '2025-02-28',
    dataStatus: 'no-data',
    assignedBy: 'SA Team Lead'
  }
];

export function CustomerDashboard() {
  const [assignments] = useState<Assignment[]>(mockAssignments);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [currentView, setCurrentView] = useState<'assignments' | 'upload' | 'analytics' | 'reports'>('assignments');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Assigned</Badge>;
      case 'in-progress':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>;
      case 'pending-review':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'needs-revision':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Revision</Badge>;
      default:
        return null;
    }
  };

  const getDataStatusBadge = (status: string) => {
    switch (status) {
      case 'no-data':
        return <Badge variant="outline" className="text-gray-600 border-gray-300">No Data</Badge>;
      case 'partial':
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Partial</Badge>;
      case 'complete':
        return <Badge variant="outline" className="text-green-600 border-green-300">Complete</Badge>;
      default:
        return null;
    }
  };

  const handleUploadData = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCurrentView('upload');
  };

  const handleViewAnalytics = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCurrentView('analytics');
  };

  const handleGenerateReport = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCurrentView('reports');
  };

  const handleDownloadTemplate = (assignment: Assignment) => {
    const templateType = assignment.projectType === 'LCA' ? 'Product Quantity Template' : 'Activity Data Template';
    toast.success(`Downloading ${templateType} for ${assignment.itemName}`);
  };

  // Summary statistics
  const totalAssignments = assignments.length;
  const pendingAssignments = assignments.filter(a => a.status === 'assigned' || a.status === 'in-progress').length;
  const approvedAssignments = assignments.filter(a => a.status === 'approved').length;
  const needsRevision = assignments.filter(a => a.status === 'needs-revision').length;

  if (currentView === 'upload' && selectedAssignment) {
    return <CustomerDataUpload assignment={selectedAssignment} onBack={() => setCurrentView('assignments')} />;
  }

  if (currentView === 'analytics' && selectedAssignment) {
    return <CustomerAnalytics assignment={selectedAssignment} onBack={() => setCurrentView('assignments')} />;
  }

  if (currentView === 'reports' && selectedAssignment) {
    return <CustomerReportGeneration assignment={selectedAssignment} onBack={() => setCurrentView('assignments')} />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-2 border-emerald-100 bg-emerald-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Target className="h-8 w-8 text-emerald-600" />
              <p className="text-3xl text-emerald-900">{totalAssignments}</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-emerald-700">Total Assignments</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-100 bg-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Clock className="h-8 w-8 text-amber-600" />
              <p className="text-3xl text-amber-900">{pendingAssignments}</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700">Pending Action</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <p className="text-3xl text-green-900">{approvedAssignments}</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">Approved</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-100 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <p className="text-3xl text-red-900">{needsRevision}</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700">Needs Revision</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card className="border-2 border-emerald-100">
        <CardHeader>
          <CardTitle className="text-emerald-900">My Assignments</CardTitle>
          <CardDescription>Products and Business Units assigned to you for data submission</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({assignments.length})</TabsTrigger>
              <TabsTrigger value="lca">
                <Package className="h-4 w-4 mr-2" />
                LCA Projects ({assignments.filter(a => a.projectType === 'LCA').length})
              </TabsTrigger>
              <TabsTrigger value="bca">
                <Building2 className="h-4 w-4 mr-2" />
                BCA Projects ({assignments.filter(a => a.projectType === 'BCA').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Assigned Item</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.projectName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                          {assignment.projectType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {assignment.itemType === 'business-unit' ? (
                            <Building2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Package className="h-4 w-4 text-emerald-600" />
                          )}
                          {assignment.itemName}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell>{getDataStatusBadge(assignment.dataStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {assignment.dueDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadTemplate(assignment)}
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Template
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadData(assignment)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                          {assignment.dataStatus !== 'no-data' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewAnalytics(assignment)}
                                className="text-purple-600 border-purple-300 hover:bg-purple-50"
                              >
                                <BarChart3 className="h-4 w-4 mr-1" />
                                Analytics
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateReport(assignment)}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Report
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="lca">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Product/Sub-Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.filter(a => a.projectType === 'LCA').map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.projectName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-emerald-600" />
                          {assignment.itemName}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell>{getDataStatusBadge(assignment.dataStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {assignment.dueDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadTemplate(assignment)}
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Template
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadData(assignment)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                          {assignment.dataStatus !== 'no-data' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewAnalytics(assignment)}
                                className="text-purple-600 border-purple-300 hover:bg-purple-50"
                              >
                                <BarChart3 className="h-4 w-4 mr-1" />
                                Analytics
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateReport(assignment)}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Report
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="bca">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Business Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.filter(a => a.projectType === 'BCA').map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.projectName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-emerald-600" />
                          {assignment.itemName}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell>{getDataStatusBadge(assignment.dataStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {assignment.dueDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadTemplate(assignment)}
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Template
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadData(assignment)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                          {assignment.dataStatus !== 'no-data' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewAnalytics(assignment)}
                                className="text-purple-600 border-purple-300 hover:bg-purple-50"
                              >
                                <BarChart3 className="h-4 w-4 mr-1" />
                                Analytics
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateReport(assignment)}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Report
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
