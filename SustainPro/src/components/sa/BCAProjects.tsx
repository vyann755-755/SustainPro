import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Download } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { 
  Plus, 
  BarChart3, 
  Building, 
  Search,
  FileText,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  Activity,
  Package,
  Globe,
  Filter,
  ChevronDown,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  BarChart, 
  Bar, 
  LineChart as ReLineChart,
  Line, 
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { mockBusinessUnits } from './CDBBusinessUnits';
import { PROJ_1_UUID, PROJ_2_UUID } from '../../data/businessUnitsData';
import { PROJ_ISO_UUID } from '../../data/isoBusinessUnits';
import { supabase } from '../../utils/supabase/client';
import { generateGRIPdf, generateISOPdf, type BUData } from './reportPDF';
import { validateTemplateAgainstProject, type TemplateValidation } from '../../data/templateValidation';
import { TemplateValidationDialog } from './TemplateValidationDialog';
import { BusinessUnitDataView } from './BusinessUnitDataView';

interface BCAProject {
  id: string;
  name: string;
  description: string;
  year: number;
  assignedBUs: string[];
  status: 'draft' | 'in-progress' | 'completed';
  createdAt: string;
  lastCalculated?: string;
  totalEmissions?: number;
  scope1?: number;
  scope2?: number;
  scope3?: number;
  /** Reporting standard this project generates against. */
  reportType?: 'GRI' | 'ISO';
  /** Saved custom template id, when the project reports from one. */
  templateId?: string | null;
}

// Business units come from the single source of truth (businessUnitsData),
// which now includes the ISO 14064-1 inventory BUs alongside the GRI BUs.
const mockBUs = mockBusinessUnits;

const mockCustomers = [
  { id: 'c1', name: 'John Smith', email: 'john@example.com' },
  { id: 'c2', name: 'Mary Johnson', email: 'mary@example.com' },
  { id: 'c3', name: 'David Wilson', email: 'david@example.com' },
  { id: 'c4', name: 'Lisa Chen', email: 'lisa@example.com' },
  { id: 'c5', name: 'Mike Brown', email: 'mike@example.com' }
];

// Mock analytics data
const monthlyData = [
  { month: 'Jan', scope1: 45, scope2: 32, scope3: 78, total: 155 },
  { month: 'Feb', scope1: 42, scope2: 35, scope3: 72, total: 149 },
  { month: 'Mar', scope1: 48, scope2: 30, scope3: 80, total: 158 },
  { month: 'Apr', scope1: 44, scope2: 33, scope3: 75, total: 152 },
  { month: 'May', scope1: 40, scope2: 31, scope3: 70, total: 141 },
  { month: 'Jun', scope1: 38, scope2: 29, scope3: 68, total: 135 }
];

const activityBreakdown = [
  { name: 'Electricity', value: 145, percentage: 32 },
  { name: 'Transportation', value: 98, percentage: 22 },
  { name: 'Manufacturing', value: 87, percentage: 19 },
  { name: 'Waste', value: 56, percentage: 12 },
  { name: 'Water', value: 42, percentage: 9 },
  { name: 'Other', value: 27, percentage: 6 }
];

const buBreakdown = [
  { name: 'Manufacturing Plant - North', value: 185 },
  { name: 'Distribution Center - East', value: 123 },
  { name: 'HQ Office', value: 78 },
  { name: 'Warehouse A', value: 65 },
  { name: 'Warehouse B', value: 47 },
  { name: 'Manufacturing Plant - South', value: 92 }
];

const impactCategories = [
  { category: 'Global Warming', value: 455, unit: 'kg CO2e', trend: 'down', change: -5.2 },
  { category: 'Acidification', value: 12.3, unit: 'mol H+ eq', trend: 'down', change: -3.1 },
  { category: 'Eutrophication', value: 8.7, unit: 'kg N eq', trend: 'up', change: 2.4 },
  { category: 'Ozone Depletion', value: 0.045, unit: 'kg CFC11 eq', trend: 'down', change: -1.8 },
  { category: 'Water Use', value: 234, unit: 'm³', trend: 'down', change: -4.5 }
];

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

export function BCAProjects() {
  const [projects, setProjects] = useState<BCAProject[]>([
    {
      id: PROJ_1_UUID, // UUID from businessUnitsData — matches Supabase activity_submissions.project_id
      name: 'Q1 2025 Carbon Assessment',
      description: 'Office operations and manufacturing carbon footprint for FY2025',
      year: 2025,
      assignedBUs: ['bu-1', 'bu-2', 'bu-3'],
      status: 'in-progress',
      createdAt: '2024-01-15',
      lastCalculated: '2024-01-20',
      totalEmissions: 455,
      scope1: 125,
      scope2: 98,
      scope3: 232
    },
    {
      id: PROJ_2_UUID, // UUID from businessUnitsData — matches Supabase activity_submissions.project_id
      name: 'Annual Sustainability Report 2025',
      description: 'Company-wide carbon footprint assessment for FY2025',
      year: 2025,
      assignedBUs: ['bu-4', 'bu-5', 'bu-6'],
      status: 'completed',
      createdAt: '2023-12-01',
      lastCalculated: '2024-01-05',
      totalEmissions: 782,
      scope1: 215,
      scope2: 167,
      scope3: 400
    },
    {
      id: PROJ_ISO_UUID, // ISO 14064-1 inventory — matches seed-supabase-iso.sql
      name: 'FY2025 ISO 14064-1 Inventory',
      description: 'Organizational GHG inventory under ISO 14064-1:2018 (Categories 1–6)',
      year: 2025,
      assignedBUs: ['iso-bu-1', 'iso-bu-2', 'iso-bu-3'],
      status: 'in-progress',
      createdAt: '2025-01-06',
      lastCalculated: '2025-02-08',
      reportType: 'ISO',
      templateId: null,
      totalEmissions: 7224,
      scope1: 2084,
      scope2: 3935,
      scope3: 1204
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<BCAProject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [pendingReport, setPendingReport] = useState<{
    project: BCAProject;
    type: 'GRI' | 'ISO';
    template: any;
    validation: TemplateValidation;
  } | null>(null);

  // Load saved report templates from Supabase
  useEffect(() => {
    supabase
      .from('report_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setCustomTemplates(data); });
  }, []);

  // Load SA-created projects from Supabase and merge with the seed list, so
  // projects persist across reloads AND are visible to Customer users.
  useEffect(() => {
    (async () => {
      const { data: projRows } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (!projRows || projRows.length === 0) return;
      const { data: links } = await supabase.from('project_business_units').select('*');
      setProjects((prev) => {
        const byId = new Map(prev.map((p) => [p.id, p]));
        projRows.forEach((row: any) => {
          if (byId.has(row.id)) return; // keep the rich seed entry
          const assignedBUs = (links || [])
            .filter((l: any) => l.project_id === row.id)
            .map((l: any) => l.business_unit_id);
          byId.set(row.id, {
            id: row.id,
            name: row.name,
            description: row.description || '',
            year: row.year,
            assignedBUs,
            status: (row.status === 'in_progress' ? 'in-progress' : row.status) as BCAProject['status'] || 'draft',
            createdAt: (row.created_at || '').split('T')[0],
          });
        });
        return Array.from(byId.values());
      });
    })();
  }, []);
  const [selectedBUView, setSelectedBUView] = useState<{
    projectId: string;
    projectName: string;
    businessUnitId: string;
    businessUnitName: string;
    assignedBUs: string[]; // Add this to pass all BUs in the project
  } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    year: new Date().getFullYear(),
    assignedBUs: [] as string[],
    reportType: 'GRI' as 'GRI' | 'ISO',
    templateId: null as string | null,
  });

  // Public entry — runs validation first when a custom template is involved
  const generateProjectReport = async (project: BCAProject, type: 'GRI' | 'ISO', customTemplate?: any) => {
    // Built-in GRI/ISO have no template-side activity binding to validate
    if (customTemplate?.template_structure) {
      const v = validateTemplateAgainstProject(customTemplate.template_structure, project.assignedBUs);
      if (!v.canGenerate || v.partialCoverage.length > 0) {
        setPendingReport({ project, type, template: customTemplate, validation: v });
        return;
      }
    }
    return runProjectReport(project, type, customTemplate);
  };

  // Actually fetches data + generates the PDF
  const runProjectReport = async (project: BCAProject, type: 'GRI' | 'ISO', customTemplate?: any) => {
    try {
      toast.info(`Generating ${type} report for ${project.name}…`);

      // Fetch latest activity_submission for every assigned BU in parallel
      const buData: BUData[] = await Promise.all(
        project.assignedBUs.map(async (buId) => {
          const { data, error } = await supabase
            .from('activity_submissions')
            .select('*')
            .eq('project_id', project.id)
            .eq('business_unit_id', buId)
            .order('created_at', { ascending: false })
            .limit(1);

          if (error) console.error(`BU ${buId} fetch error:`, error);

          const buMeta = mockBusinessUnits.find((b) => b.id === buId);
          return {
            businessUnitId: buId,
            businessUnitName: buMeta?.name || buId,
            calculatedData: data && data.length > 0 ? data[0].calculated_data || [] : [],
          };
        })
      );

      // Log to report_generations so future templates can use this as a source
      await supabase.from('report_generations').insert({
        project_id: project.id,
        business_unit_id: null,
        report_type: customTemplate ? customTemplate.id : type,
        template_id: customTemplate ? customTemplate.id : null,
        generated_by: 'Sustainability Architect',
      });

      if (type === 'GRI') {
        generateGRIPdf({
          projectName: project.name,
          reportingYear: project.year,
          buData,
          customTemplate: customTemplate ? customTemplate.template_structure : null,
          customTitle: customTemplate ? customTemplate.name : undefined,
        });
      } else {
        generateISOPdf({
          projectName: project.name,
          reportingYear: project.year,
          buData,
          customTemplate: customTemplate ? customTemplate.template_structure : null,
          customTitle: customTemplate ? customTemplate.name : undefined,
        });
      }

      toast.success(`${type} Report for ${project.name} downloaded successfully!`);
    } catch (err) {
      console.error('Error generating project report:', err);
      toast.error(`Failed to generate ${type} report`, {
        description: 'Please try again or check the console for details.',
      });
    }
  };



  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Please provide a project name');
      return;
    }
    if (formData.assignedBUs.length === 0) {
      toast.error('Select at least one business unit for this report');
      return;
    }

    // Real UUID so it is a valid projects.id and activity_submissions.project_id FK.
    const newId = (globalThis.crypto?.randomUUID?.() ||
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }));

    const newProject: BCAProject = {
      id: newId,
      name: formData.name,
      description: formData.description,
      year: formData.year,
      assignedBUs: formData.assignedBUs,
      reportType: formData.reportType,
      templateId: formData.templateId,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Persist to Supabase so Customer users (and reloads) can see the project.
    try {
      const { error: pErr } = await supabase.from('projects').insert({
        id: newId,
        name: newProject.name,
        description: newProject.description,
        year: newProject.year,
        status: 'in_progress',
      });
      if (pErr) throw pErr;
      if (formData.assignedBUs.length > 0) {
        const { error: bErr } = await supabase.from('project_business_units').insert(
          formData.assignedBUs.map((buId) => ({ project_id: newId, business_unit_id: buId }))
        );
        if (bErr) throw bErr;
      }
    } catch (e: any) {
      console.error('Project create failed:', e);
      toast.error('Failed to save project to Supabase', { description: e.message });
      return;
    }

    setProjects([...projects, newProject]);
    setIsCreateDialogOpen(false);
    resetForm();

    toast.success(`Project "${newProject.name}" created successfully`, {
      description: `${newProject.assignedBUs.length} business ${newProject.assignedBUs.length === 1 ? 'unit' : 'units'} assigned — Customer users can now upload data for it`
    });
  };

  const handleEdit = async () => {
    if (!selectedProject || !formData.name.trim()) {
      toast.error('Please provide a project name');
      return;
    }
    if (formData.assignedBUs.length === 0) {
      toast.error('Select at least one business unit for this report');
      return;
    }

    const updatedProjects = projects.map(p => 
      p.id === selectedProject.id 
        ? {
            ...p,
            name: formData.name,
            description: formData.description,
            assignedBUs: formData.assignedBUs,
            reportType: formData.reportType,
            templateId: formData.templateId
          }
        : p
    );

    // Persist edits (name/description + BU assignments) to Supabase.
    try {
      await supabase.from('projects').update({
        name: formData.name,
        description: formData.description,
        updated_at: new Date().toISOString(),
      }).eq('id', selectedProject.id);
      await supabase.from('project_business_units').delete().eq('project_id', selectedProject.id);
      if (formData.assignedBUs.length > 0) {
        await supabase.from('project_business_units').insert(
          formData.assignedBUs.map((buId) => ({ project_id: selectedProject.id, business_unit_id: buId }))
        );
      }
    } catch (e: any) {
      console.error('Project update failed:', e);
      // Non-fatal for the seed projects that may not exist in Supabase yet.
    }

    setProjects(updatedProjects);
    setIsEditDialogOpen(false);
    setSelectedProject(null);
    resetForm();
    
    toast.success('BCA Project updated successfully', {
      description: 'Business unit assignments have been updated'
    });
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    try {
      await supabase.from('projects').delete().eq('id', selectedProject.id);
    } catch (e) {
      console.error('Project delete failed:', e);
    }

    setProjects(projects.filter(p => p.id !== selectedProject.id));
    setIsDeleteDialogOpen(false);
    setSelectedProject(null);
    
    toast.success('Project deleted successfully', {
      description: 'Project removed from all company accounts'
    });
  };

  const handleRunCalculation = (project: BCAProject) => {
    const updatedProjects = projects.map(p => 
      p.id === project.id 
        ? {
            ...p, 
            status: 'in-progress' as const, 
            lastCalculated: new Date().toISOString().split('T')[0]
          }
        : p
    );
    setProjects(updatedProjects);
    toast.success('Calculation started', {
      description: 'Results will be available in Analytics dashboard'
    });
  };

  const openEditDialog = (project: BCAProject) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      year: project.year,
      assignedBUs: project.assignedBUs,
      reportType: project.reportType ?? 'GRI',
      templateId: project.templateId ?? null
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (project: BCAProject) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const openAnalyticsDialog = (project: BCAProject) => {
    setSelectedProject(project);
    setIsAnalyticsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      year: new Date().getFullYear(),
      assignedBUs: [],
      reportType: 'GRI',
      templateId: null
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBUName = (id: string) => mockBUs.find(bu => bu.id === id)?.name || id;
  const getBU = (id: string) => mockBUs.find(bu => bu.id === id);
  const getCustomerName = (id: string) => mockCustomers.find(c => c.id === id)?.name || id;
  const getCustomer = (id: string) => mockCustomers.find(c => c.id === id);

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // Prepare trajectory data combining targets and actuals
  const trajectoryData = [
    { year: '2023', actual: 782, target: null },
    { year: '2024', actual: 455, target: null },
    { year: '2025', actual: null, target: 430 },
    { year: '2030', actual: null, target: 300 },
    { year: '2035', actual: null, target: 150 },
    { year: '2040', actual: null, target: 50 }
  ];

  const handleBUClick = (project: BCAProject, buId: string) => {
    const bu = getBU(buId);
    if (bu) {
      setSelectedBUView({
        projectId: project.id,
        projectName: project.name,
        businessUnitId: bu.id,
        businessUnitName: bu.name,
        assignedBUs: project.assignedBUs // Pass all assigned BUs
      });
    }
  };

  // If viewing a specific business unit's uploaded data
  if (selectedBUView) {
    return (
      <BusinessUnitDataView
        projectId={selectedBUView.projectId}
        businessUnitId={selectedBUView.businessUnitId}
        businessUnitName={selectedBUView.businessUnitName}
        projectName={selectedBUView.projectName}
        assignedBUs={selectedBUView.assignedBUs}
        onBack={() => setSelectedBUView(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">BCA Projects</h1>
            <p className="text-gray-600">Manage business carbon assessment projects</p>
          </div>
        </div>
        
        <Button onClick={() => {
          resetForm();
          setIsCreateDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create BCA Project
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-2 border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search projects by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card className="border-2 border-emerald-100">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
          <CardTitle className="text-emerald-900">Active BCA Projects</CardTitle>
          <CardDescription>Create, edit, and manage carbon assessment projects with business units - click to expand and view all assigned business units</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Business Units</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Total Emissions</TableHead>
                <TableHead>Last Calculated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Building className="h-12 w-12 text-gray-300" />
                      <p>No BCA projects found</p>
                      <p className="text-sm">Create your first project to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => {
                  const isExpanded = expandedProjects.has(project.id);
                  return (
                    <React.Fragment key={project.id}>
                      <TableRow className="hover:bg-emerald-50/50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleProjectExpansion(project.id)}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">{project.description}</div>
                          </div>
                        </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {project.assignedBUs.length}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {project.createdAt}
                    </TableCell>
                    <TableCell>
                      {project.totalEmissions ? (
                        <div className="font-medium text-emerald-700">
                          {project.totalEmissions} tCOe
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not calculated</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {project.lastCalculated || <span className="text-gray-400">Never</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-emerald-700 border-emerald-200 hover:text-emerald-800 hover:bg-emerald-50 mr-2"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Generate Report
                              <ChevronDown className="h-3 w-3 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => generateProjectReport(project, 'GRI')} className="cursor-pointer">
                              Generate GRI Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generateProjectReport(project, 'ISO')} className="cursor-pointer">
                              Generate ISO Report
                            </DropdownMenuItem>
                            {customTemplates.length > 0 && (
                              <div className="border-t my-1" />
                            )}
                            {customTemplates.map((tpl) => (
                              <DropdownMenuItem
                                key={tpl.id}
                                onClick={() => generateProjectReport(project, tpl.base_type, tpl)}
                                className="cursor-pointer"
                              >
                                Generate "{tpl.name}"
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openAnalyticsDialog(project)}
                          title="View KPI Summary"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(project)}
                          title="Edit project"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDeleteDialog(project)}
                          title="Delete project"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Content Row */}
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-emerald-50/30 p-0">
                        <div className="p-6 space-y-4">
                          {/* Business Units List */}
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <Building className="h-4 w-4 text-emerald-600" />
                              Assigned Business Units ({project.assignedBUs.length})
                            </h4>
                          </div>
                          
                          {project.assignedBUs.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                              {project.assignedBUs.map((buId) => {
                                const bu = getBU(buId);
                                return bu ? (
                                  <button
                                    key={buId}
                                    onClick={() => handleBUClick(project, buId)}
                                    className="flex items-center gap-3 p-4 bg-white border border-emerald-200 rounded-lg hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer text-left w-full"
                                  >
                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                      <Building className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-900 text-sm">{bu.name}</div>
                                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {bu.defaultCountry}
                                      </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  </button>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed">
                              <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No business units assigned to this project</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Project Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedProject(null);
          resetForm();
        }
      }}>
        <DialogContent className="!max-w-[1600px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? 'Edit BCA Project' : 'Create New BCA Project'}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen 
                ? 'Update project details and manage business unit assignments'
                : 'Create a BCA project and select which business units to include'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="project-name">Project Name *</Label>
                <Input
                  id="project-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Q1 2024 Carbon Assessment"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-year">Year *</Label>
                <Select
                  value={String(formData.year)}
                  onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}
                >
                  <SelectTrigger id="project-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the scope and objectives of this project..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-template">Report to Generate *</Label>
              <p className="text-sm text-gray-600">Choose the reporting standard or a saved template this project will produce.</p>
              <Select
                value={formData.templateId ? `tpl:${formData.templateId}` : formData.reportType}
                onValueChange={(value) => {
                  if (value.startsWith('tpl:')) {
                    const id = value.slice(4);
                    const tpl = customTemplates.find((t) => t.id === id);
                    setFormData({ ...formData, templateId: id, reportType: tpl?.base_type === 'ISO' ? 'ISO' : 'GRI' });
                  } else {
                    setFormData({ ...formData, reportType: value as 'GRI' | 'ISO', templateId: null });
                  }
                }}
              >
                <SelectTrigger id="report-template">
                  <SelectValue placeholder="Select a report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GRI">GRI Report (305 / 302 / 303 / 306)</SelectItem>
                  <SelectItem value="ISO">ISO 14064-1 Report (Categories 1–6)</SelectItem>
                  {customTemplates.length > 0 && customTemplates.map((tpl) => (
                    <SelectItem key={tpl.id} value={`tpl:${tpl.id}`}>
                      {tpl.name} ({tpl.base_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Assign Business Units for this Report *</Label>
                <p className="text-sm text-gray-600">
                  Select the business units that will work on this project. Customer users under each
                  selected unit upload their data against the {formData.reportType === 'ISO' ? 'ISO 14064-1' : 'GRI'} activities.
                </p>
              </div>
              
              {/* List of Business Units */}
              <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {mockBUs.map(bu => {
                  const isSelected = formData.assignedBUs.includes(bu.id);
                  
                  return (
                    <div 
                      key={bu.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isSelected ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Checkbox
                        id={`bu-${bu.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              assignedBUs: [...formData.assignedBUs, bu.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assignedBUs: formData.assignedBUs.filter(id => id !== bu.id)
                            });
                          }
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`bu-${bu.id}`} className="cursor-pointer font-medium flex items-center gap-2">
                          <Building className="h-4 w-4 text-emerald-600" />
                          <span>{bu.name}</span>
                        </Label>
                        <div className="text-sm text-gray-500 flex items-center gap-1 ml-6">
                          <MapPin className="h-3 w-3" />
                          {bu.defaultCountry}
                        </div>
                      </div>
                      {isSelected && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          Selected
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {formData.assignedBUs.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-emerald-700 font-medium">
                    ✓ {formData.assignedBUs.length} business {formData.assignedBUs.length === 1 ? 'unit' : 'units'} selected
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedProject(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={isEditDialogOpen ? handleEdit : handleCreate}>
              {isEditDialogOpen ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The project "{selectedProject?.name}" will be permanently 
              removed from all company accounts. All associated data and calculations will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Analytics Dashboard Dialog */}
      <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              KPI Summary - {selectedProject?.name}
            </DialogTitle>
            <DialogDescription>
              View key performance indicators and emission analysis for this project
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="breakdown">Time Period</TabsTrigger>
              <TabsTrigger value="scope">By Scope</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="impact">Impact Categories</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <Card className="border-2 border-emerald-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Total Emissions</p>
                      <BarChart3 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">{selectedProject?.totalEmissions || 455}</p>
                    <p className="text-sm text-gray-500">tCO₂e</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-blue-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Scope 1</p>
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-700">{selectedProject?.scope1 || 125}</p>
                    <p className="text-sm text-gray-500">tCO₂e</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Scope 2</p>
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-purple-700">{selectedProject?.scope2 || 98}</p>
                    <p className="text-sm text-gray-500">tCO₂e</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-orange-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Scope 3</p>
                      <Package className="h-4 w-4 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-orange-700">{selectedProject?.scope3 || 232}</p>
                    <p className="text-sm text-gray-500">tCO₂e</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-emerald-100">
                <CardHeader>
                  <CardTitle>Emissions by Business Unit</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={buBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Time Period Tab */}
            <TabsContent value="breakdown" className="space-y-6">
              <Card className="border-2 border-emerald-100">
                <CardHeader>
                  <CardTitle>Emissions by Month</CardTitle>
                  <CardDescription>Monthly breakdown of emissions by scope</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="scope1" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Scope 1" />
                      <Area type="monotone" dataKey="scope2" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Scope 2" />
                      <Area type="monotone" dataKey="scope3" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Scope 3" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scope Tab */}
            <TabsContent value="scope" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card className="border-2 border-emerald-100">
                  <CardHeader>
                    <CardTitle>Emissions Distribution by Scope</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RePieChart>
                        <Pie
                          data={[
                            { name: 'Scope 1', value: selectedProject?.scope1 || 125 },
                            { name: 'Scope 2', value: selectedProject?.scope2 || 98 },
                            { name: 'Scope 3', value: selectedProject?.scope3 || 232 }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value} tCO₂e`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#8b5cf6" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-2 border-emerald-100">
                  <CardHeader>
                    <CardTitle>Scope Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Scope 1 - Direct Emissions</span>
                          <span className="text-sm font-bold text-blue-700">{selectedProject?.scope1 || 125} tCO₂e</span>
                        </div>
                        <Progress value={27} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Scope 2 - Indirect (Energy)</span>
                          <span className="text-sm font-bold text-purple-700">{selectedProject?.scope2 || 98} tCO₂e</span>
                        </div>
                        <Progress value={22} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Scope 3 - Value Chain</span>
                          <span className="text-sm font-bold text-orange-700">{selectedProject?.scope3 || 232} tCO₂e</span>
                        </div>
                        <Progress value={51} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-6">
              <Card className="border-2 border-emerald-100">
                <CardHeader>
                  <CardTitle>Breakdown by Activities</CardTitle>
                  <CardDescription>Emissions categorized by activity type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <RePieChart>
                        <Pie
                          data={activityBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.percentage}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {activityBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>

                    <div className="space-y-3">
                      {activityBreakdown.map((activity, index) => (
                        <div key={activity.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{activity.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{activity.value} tCO₂e</div>
                            <div className="text-sm text-gray-500">{activity.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Impact Categories Tab */}
            <TabsContent value="impact" className="space-y-6">
              <Card className="border-2 border-emerald-100">
                <CardHeader>
                  <CardTitle>Environmental Impact Categories</CardTitle>
                  <CardDescription>Comprehensive environmental impact assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {impactCategories.map((impact) => (
                      <div key={impact.category} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-emerald-600" />
                            <div>
                              <h4 className="font-medium">{impact.category}</h4>
                              <p className="text-sm text-gray-500">{impact.unit}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">{impact.value}</p>
                              <div className={`flex items-center gap-1 text-sm ${
                                impact.trend === 'down' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {impact.trend === 'down' ? (
                                  <ArrowDownRight className="h-4 w-4" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4" />
                                )}
                                <span className="font-medium">{Math.abs(impact.change)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}