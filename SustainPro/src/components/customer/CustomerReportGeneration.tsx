import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  ArrowLeft,
  FileText,
  Download,
  CheckCircle,
  FileSpreadsheet,
  File,
  Globe,
  Calendar,
  BarChart3,
  Layers,
  Award,
  Settings
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Assignment {
  id: string;
  projectId: string;
  projectName: string;
  projectType: 'LCA' | 'BCA';
  itemId: string;
  itemName: string;
  itemType: string;
}

interface CustomerReportGenerationProps {
  assignment: Assignment;
  onBack: () => void;
}

const reportingStandards = [
  { 
    id: 'gri', 
    name: 'GRI Standards', 
    versions: ['GRI 2021', 'GRI 2016'], 
    description: 'Global Reporting Initiative standards for sustainability reporting',
    type: 'BCA'
  },
  { 
    id: 'iso14040', 
    name: 'ISO 14040/14044', 
    versions: ['ISO 14040:2006', 'ISO 14044:2006'], 
    description: 'International standards for Life Cycle Assessment',
    type: 'LCA'
  },
  { 
    id: 'ghg', 
    name: 'GHG Protocol', 
    versions: ['Corporate Standard', 'Product Standard'], 
    description: 'Greenhouse Gas Protocol accounting and reporting standards',
    type: 'BCA'
  },
  { 
    id: 'cdp', 
    name: 'CDP', 
    versions: ['CDP 2024', 'CDP 2023'], 
    description: 'Carbon Disclosure Project reporting framework',
    type: 'BCA'
  },
  { 
    id: 'pef', 
    name: 'PEF', 
    versions: ['PEF 3.0', 'PEF 2.0'], 
    description: 'Product Environmental Footprint methodology',
    type: 'LCA'
  },
  { 
    id: 'tcfd', 
    name: 'TCFD', 
    versions: ['TCFD 2021'], 
    description: 'Task Force on Climate-related Financial Disclosures',
    type: 'BCA'
  }
];

export function CustomerReportGeneration({ assignment, onBack }: CustomerReportGenerationProps) {
  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'xlsx'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [includeComparison, setIncludeComparison] = useState(true);

  const isLCA = assignment.projectType === 'LCA';
  const isBCA = assignment.projectType === 'BCA';

  // Filter standards based on project type
  const availableStandards = reportingStandards.filter(s => 
    s.type === assignment.projectType || s.type === 'Both'
  );

  const selectedStandardObj = reportingStandards.find(s => s.id === selectedStandard);

  const handleGenerateReport = () => {
    if (!selectedStandard || !selectedVersion) {
      toast.error('Please select a reporting standard and version');
      return;
    }

    toast.success('Generating report...');
    
    setTimeout(() => {
      const fileName = `${assignment.itemName}_${selectedStandard}_Report.${exportFormat}`;
      toast.success(`Report generated successfully: ${fileName}`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="border-emerald-300 hover:bg-emerald-50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>
        <div>
          <h2 className="text-2xl text-emerald-900">Generate Report: {assignment.itemName}</h2>
          <p className="text-emerald-600">{assignment.projectName} • {assignment.projectType} Project</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="col-span-2 space-y-6">
          {/* Standard Selection */}
          <Card className="border-2 border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Select Reporting Standard
              </CardTitle>
              <CardDescription>
                Choose the international standard framework for your report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="standard">Reporting Standard</Label>
                <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                  <SelectTrigger id="standard" className="mt-2">
                    <SelectValue placeholder="Select a standard..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStandards.map((standard) => (
                      <SelectItem key={standard.id} value={standard.id}>
                        {standard.name} - {standard.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStandardObj && (
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                    <SelectTrigger id="version" className="mt-2">
                      <SelectValue placeholder="Select version..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedStandardObj.versions.map((version) => (
                        <SelectItem key={version} value={version}>
                          {version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedStandard && selectedVersion && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Standard Selected</h4>
                      <p className="text-sm text-green-800 mt-1">
                        Report will be generated according to {selectedStandardObj?.name} ({selectedVersion}) requirements
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Format */}
          <Card className="border-2 border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Format
              </CardTitle>
              <CardDescription>
                Choose the file format for your report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    exportFormat === 'pdf' 
                      ? 'border-2 border-green-500 bg-green-50' 
                      : 'border border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setExportFormat('pdf')}
                >
                  <CardContent className="pt-6 text-center">
                    <File className={`h-8 w-8 mx-auto mb-2 ${exportFormat === 'pdf' ? 'text-green-600' : 'text-gray-600'}`} />
                    <p className="font-medium">PDF</p>
                    <p className="text-xs text-gray-600 mt-1">Portable Document</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    exportFormat === 'docx' 
                      ? 'border-2 border-blue-500 bg-blue-50' 
                      : 'border border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setExportFormat('docx')}
                >
                  <CardContent className="pt-6 text-center">
                    <FileText className={`h-8 w-8 mx-auto mb-2 ${exportFormat === 'docx' ? 'text-blue-600' : 'text-gray-600'}`} />
                    <p className="font-medium">Word</p>
                    <p className="text-xs text-gray-600 mt-1">Editable Document</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    exportFormat === 'xlsx' 
                      ? 'border-2 border-emerald-500 bg-emerald-50' 
                      : 'border border-gray-200 hover:border-emerald-300'
                  }`}
                  onClick={() => setExportFormat('xlsx')}
                >
                  <CardContent className="pt-6 text-center">
                    <FileSpreadsheet className={`h-8 w-8 mx-auto mb-2 ${exportFormat === 'xlsx' ? 'text-emerald-600' : 'text-gray-600'}`} />
                    <p className="font-medium">Excel</p>
                    <p className="text-xs text-gray-600 mt-1">Data Spreadsheet</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Report Options */}
          <Card className="border-2 border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Options
              </CardTitle>
              <CardDescription>
                Customize what to include in your report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox 
                  id="charts" 
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label htmlFor="charts" className="cursor-pointer flex-1">
                  <div>
                    <p className="font-medium">Include Charts & Visualizations</p>
                    <p className="text-sm text-gray-600">Add graphs, pie charts, and visual analytics</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox 
                  id="rawdata" 
                  checked={includeRawData}
                  onCheckedChange={(checked) => setIncludeRawData(checked as boolean)}
                />
                <Label htmlFor="rawdata" className="cursor-pointer flex-1">
                  <div>
                    <p className="font-medium">Include Raw Data Tables</p>
                    <p className="text-sm text-gray-600">Add detailed data tables and calculations</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox 
                  id="comparison" 
                  checked={includeComparison}
                  onCheckedChange={(checked) => setIncludeComparison(checked as boolean)}
                />
                <Label htmlFor="comparison" className="cursor-pointer flex-1">
                  <div>
                    <p className="font-medium">Include Period Comparisons</p>
                    <p className="text-sm text-gray-600">Compare with previous reporting periods</p>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerateReport}
            disabled={!selectedStandard || !selectedVersion}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 text-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Generate & Download Report
          </Button>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card className="border-2 border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900">Report Preview</CardTitle>
              <CardDescription>What will be included</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div>
                  <p className="text-sm font-medium">Executive Summary</p>
                  <p className="text-xs text-gray-600">Overview of key findings</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div>
                  <p className="text-sm font-medium">Impact Results</p>
                  <p className="text-xs text-gray-600">Total calculated impacts by category</p>
                </div>
              </div>

              {isBCA && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Scope Breakdown</p>
                    <p className="text-xs text-gray-600">Emissions by Scope 1, 2, and 3</p>
                  </div>
                </div>
              )}

              {isLCA && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Life Cycle Stages</p>
                    <p className="text-xs text-gray-600">Impact by life cycle phase</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div>
                  <p className="text-sm font-medium">Time Period Analysis</p>
                  <p className="text-xs text-gray-600">Monthly/quarterly trends</p>
                </div>
              </div>

              {includeCharts && (
                <div className="flex items-start gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Visual Analytics</p>
                    <p className="text-xs text-gray-600">Charts and graphs</p>
                  </div>
                </div>
              )}

              {includeRawData && (
                <div className="flex items-start gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Data Tables</p>
                    <p className="text-xs text-gray-600">Detailed raw data</p>
                  </div>
                </div>
              )}

              {includeComparison && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-amber-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Comparisons</p>
                    <p className="text-xs text-gray-600">Period-over-period analysis</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-sm text-blue-900">Partial Report Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-blue-800">
                This report will only include data for your assigned {assignment.itemType === 'business-unit' ? 'business unit' : 'product'}: <strong>{assignment.itemName}</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-100 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="text-sm text-amber-900">Report Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-amber-800">
                • Internal reporting<br />
                • Stakeholder communication<br />
                • Compliance documentation<br />
                • Performance tracking
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
