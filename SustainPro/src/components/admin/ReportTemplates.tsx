import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
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
import { Checkbox } from '../ui/checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { allActivities, type ActivityDefinition } from '../sa/activitiesData';

const impactCategories = [
  'Climate Change - total (GWP)',
  'Climate Change - CO2 (CO2)',
  'Climate Change - CH4 (CH4)',
  'Climate Change - N2O (N2O)',
  'Energy (ENERGY)',
  'Water (WATER)',
  'Waste (WASTE)'
];

interface ReportTemplate {
  id: string;
  name: string;
  impactCategory: string;
  selectedActivities: string[]; // Activity UIDs
  createdAt: string;
  createdBy: string;
  status: 'active' | 'draft';
}

export function ReportTemplates() {
  // Filter to show only Master DB activities (source: 'master')
  const masterActivities = useMemo(() => allActivities.filter(a => a.source === 'master'), []);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    {
      id: 'RT001',
      name: 'Scope 1 GHG Inventory Report',
      impactCategory: 'Climate Change - total (GWP)',
      selectedActivities: ['ACT_001', 'ACT_002', 'ACT_003'],
      createdAt: '2024-03-15',
      createdBy: 'admin@sustainaplatform.com',
      status: 'active'
    },
    {
      id: 'RT002',
      name: 'Water Usage Assessment Report',
      impactCategory: 'Water (WATER)',
      selectedActivities: ['ACT_010', 'ACT_011'],
      createdAt: '2024-03-10',
      createdBy: 'admin@sustainaplatform.com',
      status: 'active'
    }
  ]);

  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    impactCategory: '',
    selectedActivities: [] as string[]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      impactCategory: '',
      selectedActivities: []
    });
    setCurrentStep(1);
    setActivitySearchQuery('');
  };

  const handleCreateTemplate = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a report template name');
      return;
    }

    if (!formData.impactCategory) {
      toast.error('Please select an impact category');
      return;
    }

    if (formData.selectedActivities.length === 0) {
      toast.error('Please select at least one activity');
      return;
    }

    const newTemplate: ReportTemplate = {
      id: `RT${String(reportTemplates.length + 1).padStart(3, '0')}`,
      name: formData.name,
      impactCategory: formData.impactCategory,
      selectedActivities: formData.selectedActivities,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'admin@sustainaplatform.com',
      status: 'active'
    };

    setReportTemplates([...reportTemplates, newTemplate]);
    toast.success('Report template created successfully!');
    setIsCreateWizardOpen(false);
    resetForm();
  };

  const handleDeleteTemplate = (id: string) => {
    setReportTemplates(reportTemplates.filter(t => t.id !== id));
    toast.success('Report template deleted successfully');
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      toast.error('Please enter a report template name');
      return;
    }
    if (currentStep === 2 && !formData.impactCategory) {
      toast.error('Please select an impact category');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const toggleActivitySelection = (activityUID: string) => {
    if (formData.selectedActivities.includes(activityUID)) {
      setFormData({
        ...formData,
        selectedActivities: formData.selectedActivities.filter(id => id !== activityUID)
      });
    } else {
      setFormData({
        ...formData,
        selectedActivities: [...formData.selectedActivities, activityUID]
      });
    }
  };

  // Filter activities based on search
  const filteredActivities = useMemo(() => {
    return masterActivities.filter(activity => 
      activity.name.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
      activity.uid.toLowerCase().includes(activitySearchQuery.toLowerCase())
    );
  }, [masterActivities, activitySearchQuery]);

  const getActivityCount = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId);
    return template?.selectedActivities.length || 0;
  };

  const renderWizardStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Step 1: Basic Information</h3>
              <p className="text-sm text-gray-600 mb-6">Enter the report template name and view template definition</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Report Template Name *</Label>
                <Input
                  id="templateName"
                  placeholder="e.g., Annual GHG Emissions Report"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Report Template Definition</h4>
                <Card className="border-emerald-100 bg-emerald-50/30">
                  <CardContent className="p-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-emerald-100/50">
                          <TableHead className="font-semibold text-emerald-900">Field</TableHead>
                          <TableHead className="font-semibold text-emerald-900">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700">Template Name</TableCell>
                          <TableCell className="text-gray-900">{formData.name || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700">Created At</TableCell>
                          <TableCell className="text-gray-900">{new Date().toLocaleDateString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700">Created By</TableCell>
                          <TableCell className="text-gray-900">admin@sustainaplatform.com</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700">Status</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              Draft
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Step 2: Select Impact Category</h3>
              <p className="text-sm text-gray-600 mb-6">Choose the impact category for this report template</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="impactCategory">Impact Category *</Label>
                <Select 
                  value={formData.impactCategory}
                  onValueChange={(value) => setFormData({ ...formData, impactCategory: value })}
                >
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                    <SelectValue placeholder="Select impact category" />
                  </SelectTrigger>
                  <SelectContent>
                    {impactCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.impactCategory && (
                <Card className="border-emerald-200 bg-emerald-50/30 mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-emerald-900 mb-1">Selected Impact Category</p>
                        <p className="text-sm text-gray-700">{formData.impactCategory}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-blue-200 bg-blue-50/30 mt-4">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Note</p>
                      <p className="text-sm text-gray-700">
                        The selected impact category will be used to filter and calculate emissions data in the report.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Step 3: Select Activity Templates</h3>
              <p className="text-sm text-gray-600 mb-6">Choose activities to include in this report template</p>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities by name or UID..."
                value={activitySearchQuery}
                onChange={(e) => setActivitySearchQuery(e.target.value)}
                className="pl-10 border-emerald-200 focus:border-emerald-500"
              />
              {activitySearchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setActivitySearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Selected count */}
            <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <span className="text-sm font-medium text-gray-700">Selected Activities:</span>
              <Badge variant="outline" className="bg-emerald-600 text-white border-emerald-600">
                {formData.selectedActivities.length}
              </Badge>
            </div>

            {/* Activities list */}
            <ScrollArea className="h-[400px] border border-emerald-100 rounded-lg">
              <div className="p-4 space-y-2">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No activities found</p>
                  </div>
                ) : (
                  filteredActivities.map((activity) => (
                    <Card
                      key={activity.uid}
                      className={`cursor-pointer transition-all duration-200 ${
                        formData.selectedActivities.includes(activity.uid)
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                      }`}
                      onClick={() => toggleActivitySelection(activity.uid)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={formData.selectedActivities.includes(activity.uid)}
                            onCheckedChange={(checked) => {
                              // Handler will be managed by Card onClick to avoid double-triggering
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs font-mono bg-gray-50">
                                {activity.uid}
                              </Badge>
                              {activity.grpCategories && activity.grpCategories.length > 0 && activity.grpCategories[0].startsWith('305.1') && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                  Scope 1
                                </Badge>
                              )}
                              {activity.grpCategories && activity.grpCategories.length > 0 && activity.grpCategories[0].startsWith('305.2') && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                  Scope 2
                                </Badge>
                              )}
                              {activity.grpCategories && activity.grpCategories.length > 0 && activity.grpCategories[0].startsWith('305.3') && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                  Scope 3
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium text-gray-900 text-sm mb-1">{activity.name}</p>
                            {activity.impactCategories && activity.impactCategories.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {activity.impactCategories.slice(0, 2).map((cat, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                    {cat}
                                  </Badge>
                                ))}
                                {activity.impactCategories.length > 2 && (
                                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                                    +{activity.impactCategories.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>

            {formData.selectedActivities.length > 0 && (
              <Card className="border-emerald-200 bg-emerald-50/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900 mb-1">
                        {formData.selectedActivities.length} {formData.selectedActivities.length === 1 ? 'Activity' : 'Activities'} Selected
                      </p>
                      <p className="text-sm text-gray-700">
                        These activities will be included in the report template
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8 text-emerald-600" />
            Master DB - Report Templates
          </h1>
          <p className="text-gray-600">
            Create and manage report templates with predefined impact categories and activities
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateWizardOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Report Template
        </Button>
      </div>

      {/* Templates Table */}
      <Card className="border-2 border-emerald-100">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
          <CardTitle className="text-emerald-900">Report Templates</CardTitle>
          <CardDescription>
            Manage report templates for sustainability reporting
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50/50 hover:bg-emerald-50/50">
                <TableHead className="font-semibold text-emerald-900">Template ID</TableHead>
                <TableHead className="font-semibold text-emerald-900">Template Name</TableHead>
                <TableHead className="font-semibold text-emerald-900">Impact Category</TableHead>
                <TableHead className="font-semibold text-emerald-900">Activities</TableHead>
                <TableHead className="font-semibold text-emerald-900">Created At</TableHead>
                <TableHead className="font-semibold text-emerald-900">Created By</TableHead>
                <TableHead className="font-semibold text-emerald-900">Status</TableHead>
                <TableHead className="font-semibold text-emerald-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No report templates created yet</p>
                    <p className="text-sm">Click "Create Report Template" to get started</p>
                  </TableCell>
                </TableRow>
              ) : (
                reportTemplates.map((template) => (
                  <TableRow key={template.id} className="hover:bg-emerald-50/30">
                    <TableCell className="font-mono text-sm text-gray-700">{template.id}</TableCell>
                    <TableCell className="font-medium text-gray-900">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                        {template.impactCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                        {getActivityCount(template.id)} activities
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {template.createdAt}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {template.createdBy}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          template.status === 'active' 
                            ? 'bg-green-50 text-green-700 border-green-300'
                            : 'bg-gray-50 text-gray-700 border-gray-300'
                        }
                      >
                        {template.status === 'active' ? 'Active' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Wizard Dialog */}
      <Dialog open={isCreateWizardOpen} onOpenChange={(open) => {
        setIsCreateWizardOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-emerald-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-600" />
              Create Report Template
            </DialogTitle>
            <DialogDescription>
              Follow the steps to create a new report template
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6 px-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step < currentStep
                          ? 'bg-emerald-600 text-white'
                          : step === currentStep
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step < currentStep ? <CheckCircle2 className="h-5 w-5" /> : step}
                    </div>
                    <span className="text-xs mt-2 font-medium text-gray-600">
                      {step === 1 ? 'Basic Info' : step === 2 ? 'Impact Category' : 'Activities'}
                    </span>
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        step < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          {renderWizardStep()}

          <DialogFooter className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateWizardOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateTemplate}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}