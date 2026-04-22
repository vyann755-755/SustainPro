import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
  BarChart3,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Eye,
  Edit,
  Save
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DataUpload {
  id: string;
  projectName: string;
  itemName: string;
  itemType: 'product' | 'business-unit';
  uploadDate: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'needs-revision';
  version: number;
  fileSize?: string;
  fileName?: string;
  reviewComments?: string;
  dataFields: Record<string, any>;
}

const mockUploads: DataUpload[] = [
  {
    id: '1',
    projectName: 'Q1 2024 Carbon Assessment',
    itemName: 'Manufacturing Plant',
    itemType: 'business-unit',
    uploadDate: '2024-01-20',
    status: 'under-review',
    version: 2,
    fileName: 'manufacturing_plant_data_v2.xlsx',
    fileSize: '245 KB',
    reviewComments: 'Data looks comprehensive. Please verify energy consumption figures for December.',
    dataFields: {
      energyConsumption: 45600,
      fuelUsage: 2300,
      scope1Emissions: 1250,
      scope2Emissions: 890
    }
  },
  {
    id: '2',
    projectName: 'Product LCA - New Widget Line',
    itemName: 'Widget Pro',
    itemType: 'product',
    uploadDate: '2024-01-18',
    status: 'needs-revision',
    version: 1,
    fileName: 'widget_pro_materials.xlsx',
    fileSize: '156 KB',
    reviewComments: 'Need clarification on material composition percentages. Some values don\'t add up to 100%.',
    dataFields: {
      steelWeight: 2.5,
      plasticWeight: 0.8,
      aluminumWeight: 0.3,
      manufacturingEnergy: 120
    }
  },
  {
    id: '3',
    projectName: 'Annual Sustainability Report',
    itemName: 'Distribution Center',
    itemType: 'business-unit',
    uploadDate: '2024-01-15',
    status: 'approved',
    version: 1,
    fileName: 'distribution_center_annual.xlsx',
    fileSize: '189 KB',
    reviewComments: 'Data approved. Well documented and complete.',
    dataFields: {
      energyConsumption: 23400,
      transportFuel: 5600,
      scope3Emissions: 3400
    }
  },
  {
    id: '4',
    projectName: 'Q1 2024 Carbon Assessment',
    itemName: 'Office Operations',
    itemType: 'business-unit',
    uploadDate: '2024-01-22',
    status: 'draft',
    version: 1,
    dataFields: {
      electricityUsage: '',
      heatingGas: '',
      officeSupplies: ''
    }
  }
];

export function DataUploads() {
  const [uploads, setUploads] = useState<DataUpload[]>(mockUploads);
  const [selectedUpload, setSelectedUpload] = useState<DataUpload | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadComments, setUploadComments] = useState('');
  const [editData, setEditData] = useState<Record<string, any>>({});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'under-review': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'needs-revision': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'submitted': return <Upload className="h-4 w-4 text-purple-500" />;
      case 'draft': return <Edit className="h-4 w-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'under-review': return 'bg-blue-100 text-blue-800';
      case 'needs-revision': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUploadData = () => {
    if (!selectedUpload) return;
    
    const updatedUploads = uploads.map(upload => 
      upload.id === selectedUpload.id 
        ? {
            ...upload, 
            status: 'submitted' as const,
            uploadDate: new Date().toISOString().split('T')[0],
            version: upload.version + 1,
            fileName: uploadFile?.name || upload.fileName,
            fileSize: uploadFile ? `${Math.round(uploadFile.size / 1024)} KB` : upload.fileSize
          }
        : upload
    );
    
    setUploads(updatedUploads);
    setIsUploadDialogOpen(false);
    setUploadFile(null);
    setUploadComments('');
    setSelectedUpload(null);
    
    toast.success('Data uploaded successfully and submitted for SA review');
  };

  const handleSaveDraft = () => {
    if (!selectedUpload) return;
    
    const updatedUploads = uploads.map(upload => 
      upload.id === selectedUpload.id 
        ? {
            ...upload, 
            dataFields: editData,
            uploadDate: new Date().toISOString().split('T')[0]
          }
        : upload
    );
    
    setUploads(updatedUploads);
    setIsEditDialogOpen(false);
    setEditData({});
    setSelectedUpload(null);
    
    toast.success('Draft saved successfully');
  };

  const handleSubmitForReview = () => {
    if (!selectedUpload) return;
    
    const updatedUploads = uploads.map(upload => 
      upload.id === selectedUpload.id 
        ? {
            ...upload, 
            status: 'submitted' as const,
            dataFields: editData,
            uploadDate: new Date().toISOString().split('T')[0],
            version: upload.version + 1
          }
        : upload
    );
    
    setUploads(updatedUploads);
    setIsEditDialogOpen(false);
    setEditData({});
    setSelectedUpload(null);
    
    toast.success('Data submitted for SA review');
  };

  const openUploadDialog = (upload: DataUpload) => {
    setSelectedUpload(upload);
    setIsUploadDialogOpen(true);
  };

  const openViewDialog = (upload: DataUpload) => {
    setSelectedUpload(upload);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (upload: DataUpload) => {
    setSelectedUpload(upload);
    setEditData(upload.dataFields);
    setIsEditDialogOpen(true);
  };

  const handleDownloadTemplate = (upload: DataUpload) => {
    toast.success(`Template downloaded for ${upload.itemName}`);
  };

  // Calculate stats
  const totalUploads = uploads.length;
  const approvedUploads = uploads.filter(u => u.status === 'approved').length;
  const pendingUploads = uploads.filter(u => u.status === 'under-review' || u.status === 'submitted').length;
  const needsRevisionUploads = uploads.filter(u => u.status === 'needs-revision').length;
  const draftUploads = uploads.filter(u => u.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Data Upload & Review</h1>
        <p className="text-gray-600">Upload and manage your data submissions for sustainability projects</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Uploads</p>
                <p className="text-2xl font-semibold text-gray-900">{totalUploads}</p>
              </div>
              <FileText className="h-6 w-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-semibold text-green-600">{approvedUploads}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-semibold text-blue-600">{pendingUploads}</p>
              </div>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Revision</p>
                <p className="text-2xl font-semibold text-red-600">{needsRevisionUploads}</p>
              </div>
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-semibold text-gray-600">{draftUploads}</p>
              </div>
              <Edit className="h-6 w-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Uploads Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">My Data Uploads</h2>
          <p className="text-sm text-gray-600">Track your data submissions and review feedback</p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project & Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>File Info</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploads.map((upload) => (
              <TableRow key={upload.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{upload.projectName}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      {upload.itemType === 'product' ? (
                        <BarChart3 className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {upload.itemName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={upload.itemType === 'product' ? 'default' : 'secondary'}>
                    {upload.itemType === 'product' ? 'Product' : 'Business Unit'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(upload.status)}
                    <Badge className={getStatusColor(upload.status)}>
                      {upload.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>v{upload.version}</TableCell>
                <TableCell className="text-sm">
                  {new Date(upload.uploadDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm">
                  {upload.fileName ? (
                    <div>
                      <div className="font-medium">{upload.fileName}</div>
                      <div className="text-gray-500">{upload.fileSize}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">No file</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadTemplate(upload)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openViewDialog(upload)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(upload.status === 'draft' || upload.status === 'needs-revision') && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(upload)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {upload.status !== 'approved' && upload.status !== 'under-review' && upload.status !== 'submitted' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openUploadDialog(upload)}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                    {upload.reviewComments && (
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Review Comments Section */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">Recent SA Feedback</h3>
        <div className="space-y-4">
          {uploads.filter(u => u.reviewComments).map(upload => (
            <div key={upload.id} className={`p-4 rounded-lg border-l-4 ${
              upload.status === 'needs-revision' ? 'bg-red-50 border-red-400' : 
              upload.status === 'under-review' ? 'bg-blue-50 border-blue-400' :
              'bg-green-50 border-green-400'
            }`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(upload.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{upload.itemName}</span>
                    <Badge className={getStatusColor(upload.status)} size="sm">
                      {upload.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{upload.reviewComments}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Version {upload.version} • {new Date(upload.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Data</DialogTitle>
            <DialogDescription>
              Upload data for {selectedUpload?.itemName} in {selectedUpload?.projectName}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="excel" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="excel">Excel Upload</TabsTrigger>
              <TabsTrigger value="api">API Integration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="excel" className="space-y-4">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Drop your Excel file here or click to browse
                      </span>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {uploadFile && (
                    <div className="mt-2 text-sm text-green-600">
                      File selected: {uploadFile.name} ({Math.round(uploadFile.size / 1024)} KB)
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comments">Comments (optional)</Label>
                  <Textarea
                    id="comments"
                    value={uploadComments}
                    onChange={(e) => setUploadComments(e.target.value)}
                    placeholder="Add any notes about your data submission..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Configure API integration for automated data upload:
              </div>
              
              <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">API Endpoint</Label>
                  <Input 
                    id="api-endpoint" 
                    placeholder="https://api.yourcompany.com/data" 
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input 
                    id="api-key" 
                    type="password" 
                    placeholder="Enter your API key..." 
                    disabled
                  />
                </div>
                <div className="text-sm text-gray-500">
                  API integration is configured by your SA team. Contact them to set up automated data uploads.
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadData} disabled={!uploadFile}>
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Upload Details</DialogTitle>
            <DialogDescription>
              Details for {selectedUpload?.itemName} (Version {selectedUpload?.version})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project</Label>
                <p className="text-sm font-medium">{selectedUpload?.projectName}</p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  {selectedUpload && getStatusIcon(selectedUpload.status)}
                  <Badge className={selectedUpload ? getStatusColor(selectedUpload.status) : ''}>
                    {selectedUpload?.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
            
            {selectedUpload?.reviewComments && (
              <div>
                <Label>SA Feedback</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedUpload.reviewComments}</p>
                </div>
              </div>
            )}
            
            <div>
              <Label>Data Summary</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedUpload && Object.entries(selectedUpload.dataFields).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-medium">{value || 'Not provided'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Data</DialogTitle>
            <DialogDescription>
              Edit data for {selectedUpload?.itemName} in {selectedUpload?.projectName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedUpload && Object.entries(editData).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Input
                  id={key}
                  type="number"
                  value={value}
                  onChange={(e) => setEditData({
                    ...editData,
                    [key]: e.target.value
                  })}
                  placeholder="Enter value..."
                />
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleSubmitForReview}>
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}