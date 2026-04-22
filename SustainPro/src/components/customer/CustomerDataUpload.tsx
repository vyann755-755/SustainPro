import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
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
  Upload, 
  Edit,
  FileSpreadsheet,
  Link2,
  CheckCircle,
  AlertCircle,
  Download,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Assignment {
  id: string;
  projectId: string;
  projectName: string;
  projectType: 'LCA' | 'BCA';
  itemId: string;
  itemName: string;
  itemType: 'product' | 'sub-product' | 'business-unit';
  status: string;
  dueDate: string;
}

interface CustomerDataUploadProps {
  assignment: Assignment;
  onBack: () => void;
}

// Mock data for product quantity input (LCA)
const mockProductQuantityFields = [
  { id: 'q1', label: 'Product Quantity Manufactured', unit: 'units', value: '10000', period: 'Q1 2025' },
  { id: 'q2', label: 'Sub-product A Sourced', unit: 'kg', value: '5000', period: 'Q1 2025' },
  { id: 'q3', label: 'Sub-product B Manufactured', unit: 'kg', value: '3500', period: 'Q1 2025' }
];

// Mock data for activity input (BCA)
const mockActivities = [
  { id: 'act1', name: 'Office Electricity Consumption', scope: 'Scope 2', variables: [
    { name: 'Electricity Consumed', value: '15000', unit: 'kWh' },
    { name: 'Grid Emission Factor', value: '0.45', unit: 'kg CO2e/kWh' }
  ]},
  { id: 'act2', name: 'Natural Gas Heating', scope: 'Scope 1', variables: [
    { name: 'Natural Gas Consumed', value: '2500', unit: 'm³' },
    { name: 'Gas Emission Factor', value: '2.02', unit: 'kg CO2e/m³' }
  ]},
  { id: 'act3', name: 'Employee Commuting', scope: 'Scope 3', variables: [
    { name: 'Distance Traveled', value: '50000', unit: 'km' },
    { name: 'Average Emission Factor', value: '0.12', unit: 'kg CO2e/km' }
  ]}
];

export function CustomerDataUpload({ assignment, onBack }: CustomerDataUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'excel' | 'api'>('manual');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  // State for manual input
  const [quantityData, setQuantityData] = useState(mockProductQuantityFields);
  const [activityData, setActivityData] = useState(mockActivities);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleExcelUpload = () => {
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }
    toast.success('Excel file uploaded successfully. Data will be processed and validated.');
    // Simulate processing
    setTimeout(() => {
      toast.success('Data validation complete: 15 records imported, 0 errors');
    }, 2000);
  };

  const handleApiConnect = () => {
    if (!apiEndpoint || !apiKey) {
      toast.error('Please provide API endpoint and key');
      return;
    }
    toast.success('Connecting to external platform...');
    setTimeout(() => {
      toast.success('API connection established. Data sync in progress.');
    }, 1500);
  };

  const handleManualSave = () => {
    toast.success('Data saved successfully. Your submission has been recorded.');
  };

  const handleSubmitForReview = () => {
    toast.success('Data submitted for SA review. You will be notified once reviewed.');
  };

  const handleDownloadTemplate = () => {
    const templateName = assignment.projectType === 'LCA' 
      ? 'Product_Quantity_Template.xlsx' 
      : 'Activity_Data_Template.xlsx';
    toast.success(`Downloading ${templateName}`);
  };

  const isLCA = assignment.projectType === 'LCA';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="border-emerald-300 hover:bg-emerald-50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>
        <div>
          <h2 className="text-2xl text-emerald-900">Data Upload: {assignment.itemName}</h2>
          <p className="text-emerald-600">{assignment.projectName} • {assignment.projectType} Project</p>
        </div>
      </div>

      {/* Upload Method Selection */}
      <Card className="border-2 border-emerald-100">
        <CardHeader>
          <CardTitle className="text-emerald-900">Select Upload Method</CardTitle>
          <CardDescription>
            {isLCA 
              ? 'Provide product quantity data for the reporting period' 
              : 'Provide activity data for all variables in your business unit'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">
                <Edit className="h-4 w-4 mr-2" />
                Manual Input
              </TabsTrigger>
              <TabsTrigger value="excel">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel Upload
              </TabsTrigger>
              <TabsTrigger value="api">
                <Link2 className="h-4 w-4 mr-2" />
                API Integration
              </TabsTrigger>
            </TabsList>

            {/* Manual Input Tab */}
            <TabsContent value="manual" className="space-y-6 mt-6">
              {isLCA ? (
                // LCA Product Quantity Input
                <Card className="border border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Product Quantity Data</CardTitle>
                    <CardDescription>Enter quantity data for products and sub-products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quantityData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.label}</TableCell>
                            <TableCell>{item.period}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.value}
                                onChange={(e) => {
                                  const updated = quantityData.map(q => 
                                    q.id === item.id ? { ...q, value: e.target.value } : q
                                  );
                                  setQuantityData(updated);
                                }}
                                className="w-32"
                              />
                            </TableCell>
                            <TableCell>{item.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                // BCA Activity Data Input
                <div className="space-y-4">
                  {activityData.map((activity) => (
                    <Card key={activity.id} className="border border-emerald-200">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>{activity.name}</span>
                          <span className="text-sm font-normal text-emerald-600">{activity.scope}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {activity.variables.map((variable, idx) => (
                            <div key={idx} className="grid grid-cols-3 gap-4 items-center">
                              <Label>{variable.name}</Label>
                              <Input
                                type="number"
                                value={variable.value}
                                onChange={(e) => {
                                  const updated = activityData.map(act => 
                                    act.id === activity.id 
                                      ? {
                                          ...act,
                                          variables: act.variables.map((v, i) => 
                                            i === idx ? { ...v, value: e.target.value } : v
                                          )
                                        }
                                      : act
                                  );
                                  setActivityData(updated);
                                }}
                              />
                              <span className="text-sm text-gray-600">{variable.unit}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Comments */}
              <Card className="border border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-lg">Comments (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Add any notes or comments about this data submission..."
                    className="min-h-24"
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={handleManualSave} className="border-emerald-300 hover:bg-emerald-50">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handleSubmitForReview} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit for Review
                </Button>
              </div>
            </TabsContent>

            {/* Excel Upload Tab */}
            <TabsContent value="excel" className="space-y-6 mt-6">
              <Card className="border border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                    Bulk Excel Upload
                  </CardTitle>
                  <CardDescription>
                    Upload data using our standardized Excel template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Step 1: Download Template</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Download the pre-formatted Excel template for {isLCA ? 'product quantities' : 'activity data'}
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadTemplate}
                      className="border-blue-300 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Step 2: Fill in Data</h4>
                    <p className="text-sm text-gray-600">
                      Complete the template with your {isLCA ? 'quantity' : 'activity'} data. Do not modify column headers or formatting.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Step 3: Upload Completed File</h4>
                    <div className="space-y-3">
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                      />
                      {uploadFile && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          {uploadFile.name} selected
                        </div>
                      )}
                      <Button 
                        onClick={handleExcelUpload}
                        disabled={!uploadFile}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload and Process
                      </Button>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-900">Important Notes</h4>
                        <ul className="text-sm text-amber-800 mt-2 space-y-1 list-disc list-inside">
                          <li>New data will overwrite existing data</li>
                          <li>All fields in the template must be completed</li>
                          <li>Data will be validated upon upload</li>
                          <li>You will receive a summary of imported records</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Integration Tab */}
            <TabsContent value="api" className="space-y-6 mt-6">
              <Card className="border border-purple-200 bg-purple-50/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-purple-600" />
                    API Integration
                  </CardTitle>
                  <CardDescription>
                    Connect to external platforms to sync data automatically
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-200 space-y-4">
                    <div>
                      <Label htmlFor="api-endpoint">API Endpoint URL</Label>
                      <Input
                        id="api-endpoint"
                        placeholder="https://api.example.com/data"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="api-key">API Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="Enter your API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <Button 
                      onClick={handleApiConnect}
                      className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Connect and Sync Data
                    </Button>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Supported Platforms</h4>
                        <ul className="text-sm text-blue-800 mt-2 space-y-1">
                          <li>• ERP Systems (SAP, Oracle, Microsoft Dynamics)</li>
                          <li>• IoT Platforms (Azure IoT, AWS IoT)</li>
                          <li>• Energy Management Systems</li>
                          <li>• Custom REST APIs (JSON format)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-900">Security Notice</h4>
                        <p className="text-sm text-amber-800 mt-1">
                          API credentials are encrypted and securely stored. Data transfers use SSL/TLS encryption. 
                          Contact your SA team for API integration setup assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
