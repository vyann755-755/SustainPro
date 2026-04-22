import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
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
  Save,
  Plus,
  Building2,
  Package,
  TrendingUp,
  Database,
  Filter,
  Search,
  Calendar,
  PieChart,
  LineChart,
  ExternalLink,
  Users,
  Factory,
  Zap,
  Leaf,
  Globe,
  TreePine,
  Droplets,
  Shield,
  Archive,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Assignment {
  id: string;
  projectId: string;
  projectName: string;
  projectType: 'LCA' | 'BCA';
  itemId: string;
  itemName: string;
  itemType: 'product' | 'business-unit';
  status: 'assigned' | 'in-progress' | 'pending-review' | 'approved' | 'needs-revision';
  dueDate: string;
  assignedDate: string;
  lastUpdated: string;
  saName: string;
  priority: 'low' | 'medium' | 'high';
  completionPercentage: number;
  comments?: string;
  dataType: string[];
}

interface Project {
  id: string;
  name: string;
  type: 'LCA' | 'BCA';
  status: 'active' | 'planning' | 'completed' | 'on-hold';
  assignedProducts: number;
  assignedBUs: number;
  createdProducts: number;
  createdBUs: number;
  deadline: string;
  saName: string;
  description: string;
}

interface DatabaseItem {
  id: string;
  name: string;
  type: 'emission-factor' | 'sub-product' | 'formula';
  category: string;
  source: 'assigned' | 'sa-created' | 'master-db';
  accessLevel: 'read' | 'read-write';
  lastUpdated: string;
  description: string;
}

interface Report {
  id: string;
  name: string;
  type: 'impact-summary' | 'detailed-analysis' | 'compliance' | 'custom';
  projectId: string;
  projectName: string;
  generatedDate: string;
  format: 'PDF' | 'Excel' | 'CSV';
  status: 'generating' | 'ready' | 'error';
  fileSize?: string;
}

// Mock data
const mockAssignments: Assignment[] = [
  {
    id: '1',
    projectId: 'proj-1',
    projectName: 'Q1 2024 Carbon Assessment',
    projectType: 'BCA',
    itemId: 'bu-1',
    itemName: 'Manufacturing Plant A',
    itemType: 'business-unit',
    status: 'pending-review',
    dueDate: '2024-02-15',
    assignedDate: '2024-01-10',
    lastUpdated: '2024-01-20',
    saName: 'Sarah Chen',
    priority: 'high',
    completionPercentage: 85,
    dataType: ['Energy Consumption', 'Fuel Usage', 'Scope 1 Emissions'],
    comments: 'Data uploaded and submitted for SA review'
  },
  {
    id: '2',
    projectId: 'proj-2',
    projectName: 'Product LCA - Widget Series',
    projectType: 'LCA',
    itemId: 'prod-1',
    itemName: 'Widget Pro v2',
    itemType: 'product',
    status: 'needs-revision',
    dueDate: '2024-02-01',
    assignedDate: '2024-01-05',
    lastUpdated: '2024-01-18',
    saName: 'Mike Rodriguez',
    priority: 'medium',
    completionPercentage: 60,
    dataType: ['Material Composition', 'Manufacturing Energy', 'Transport'],
    comments: 'SA requested clarification on material composition percentages'
  },
  {
    id: '3',
    projectId: 'proj-1',
    projectName: 'Q1 2024 Carbon Assessment',
    projectType: 'BCA',
    itemId: 'bu-2',
    itemName: 'Distribution Center East',
    itemType: 'business-unit',
    status: 'assigned',
    dueDate: '2024-02-20',
    assignedDate: '2024-01-15',
    lastUpdated: '2024-01-15',
    saName: 'Sarah Chen',
    priority: 'medium',
    completionPercentage: 0,
    dataType: ['Electricity Usage', 'Transport Fuel', 'Scope 3 Emissions']
  }
];

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Q1 2024 Carbon Assessment',
    type: 'BCA',
    status: 'active',
    assignedProducts: 2,
    assignedBUs: 3,
    createdProducts: 0,
    createdBUs: 1,
    deadline: '2024-03-31',
    saName: 'Sarah Chen',
    description: 'Quarterly business carbon assessment for all operational units'
  },
  {
    id: 'proj-2',
    name: 'Product LCA - Widget Series',
    type: 'LCA',
    status: 'active',
    assignedProducts: 4,
    assignedBUs: 0,
    createdProducts: 2,
    createdBUs: 0,
    deadline: '2024-04-15',
    saName: 'Mike Rodriguez',
    description: 'Comprehensive lifecycle assessment for new widget product line'
  }
];

const mockDatabaseItems: DatabaseItem[] = [
  {
    id: 'ef-1',
    name: 'Electricity Grid Mix - Regional',
    type: 'emission-factor',
    category: 'Energy',
    source: 'assigned',
    accessLevel: 'read',
    lastUpdated: '2024-01-15',
    description: 'Regional electricity emission factors for Scope 2 calculations'
  },
  {
    id: 'sp-1',
    name: 'Steel Production - Hot Rolled',
    type: 'sub-product',
    category: 'Materials',
    source: 'sa-created',
    accessLevel: 'read',
    lastUpdated: '2024-01-10',
    description: 'Sub-product definition for hot rolled steel manufacturing'
  },
  {
    id: 'fm-1',
    name: 'Transport Carbon Calculation',
    type: 'formula',
    category: 'Transport',
    source: 'assigned',
    accessLevel: 'read',
    lastUpdated: '2024-01-12',
    description: 'Formula for calculating transport-related carbon emissions'
  }
];

const mockReports: Report[] = [
  {
    id: 'rep-1',
    name: 'Q1 Carbon Impact Summary',
    type: 'impact-summary',
    projectId: 'proj-1',
    projectName: 'Q1 2024 Carbon Assessment',
    generatedDate: '2024-01-20',
    format: 'PDF',
    status: 'ready',
    fileSize: '2.3 MB'
  },
  {
    id: 'rep-2',
    name: 'Widget Series LCA Report',
    type: 'detailed-analysis',
    projectId: 'proj-2',
    projectName: 'Product LCA - Widget Series',
    generatedDate: '2024-01-18',
    format: 'Excel',
    status: 'ready',
    fileSize: '8.7 MB'
  }
];

// Mock available emission factors and formulas for assignment
const mockAvailableEmissionFactors = [
  {
    id: 'ef-1',
    name: 'Electricity Grid Factor - US',
    category: 'Energy',
    source: 'Master DB',
    value: '0.456 kg CO2/kWh',
    unit: 'kg CO2/kWh',
    region: 'United States',
    year: '2024',
    isAssigned: false
  },
  {
    id: 'ef-2',
    name: 'Natural Gas Combustion',
    category: 'Energy',
    source: 'Master DB',
    value: '2.03 kg CO2/m³',
    unit: 'kg CO2/m³',
    region: 'Global',
    year: '2024',
    isAssigned: true
  },
  {
    id: 'ef-3',
    name: 'Steel Production - Client Specific',
    category: 'Materials',
    source: 'CDB',
    value: '1.85 kg CO2/kg',
    unit: 'kg CO2/kg',
    region: 'Europe',
    year: '2024',
    isAssigned: false
  },
  {
    id: 'ef-4',
    name: 'Road Transport - Diesel',
    category: 'Transport',
    source: 'Master DB',
    value: '2.68 kg CO2/L',
    unit: 'kg CO2/L',
    region: 'Global',
    year: '2024',
    isAssigned: false
  }
];

const mockAvailableFormulas = [
  {
    id: 'form-1',
    name: 'Scope 1 Direct Emissions',
    category: 'GHG Calculation',
    source: 'Master DB',
    expression: 'fuel_consumption * emission_factor',
    variables: ['fuel_consumption', 'emission_factor'],
    isAssigned: false
  },
  {
    id: 'form-2',
    name: 'Material Carbon Footprint',
    category: 'LCA',
    source: 'CDB',
    expression: 'material_weight * ef_material + transport_distance * ef_transport',
    variables: ['material_weight', 'ef_material', 'transport_distance', 'ef_transport'],
    isAssigned: true
  },
  {
    id: 'form-3',
    name: 'Energy Consumption Formula',
    category: 'Energy',
    source: 'Master DB',
    expression: 'power_rating * operating_hours * efficiency_factor',
    variables: ['power_rating', 'operating_hours', 'efficiency_factor'],
    isAssigned: false
  },
  {
    id: 'form-4',
    name: 'Waste Processing Emissions',
    category: 'Waste',
    source: 'CDB',
    expression: 'waste_volume * density * processing_ef',
    variables: ['waste_volume', 'density', 'processing_ef'],
    isAssigned: false
  }
];

// Mock created Business Units for assignment
const mockCreatedBUs = [
  {
    id: 'bu-1',
    name: 'Manufacturing Unit A',
    projectId: 'proj-1',
    projectName: 'Q1 2024 Carbon Assessment',
    description: 'Primary manufacturing facility',
    createdDate: '2024-01-15',
    status: 'approved',
    assignedEFs: 2,
    assignedFormulas: 1
  },
  {
    id: 'bu-2',
    name: 'Distribution Center',
    projectId: 'proj-2',
    projectName: 'Product LCA - Widget Series',
    description: 'Main distribution and logistics hub',
    createdDate: '2024-01-18',
    status: 'pending',
    assignedEFs: 0,
    assignedFormulas: 0
  },
  {
    id: 'bu-3',
    name: 'R&D Laboratory',
    projectId: 'proj-1',
    projectName: 'Q1 2024 Carbon Assessment',
    description: 'Research and development facility',
    createdDate: '2024-01-20',
    status: 'approved',
    assignedEFs: 1,
    assignedFormulas: 2
  }
];

export function CustomerUserComplete() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'product' | 'business-unit'>('product');
  const [selectedProjectForCreation, setSelectedProjectForCreation] = useState<string | null>(null);
  const [createProjectId, setCreateProjectId] = useState<string>('');
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedBU, setSelectedBU] = useState<string | null>(null);
  const [assignmentType, setAssignmentType] = useState<'emission-factors' | 'formulas'>('emission-factors');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    overview: true,
    assignments: true,
    projects: false,
    database: false,
    reports: false
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'pending-review': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'needs-revision': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'assigned': return <FileText className="h-4 w-4 text-slate-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending-review': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'needs-revision': return 'bg-red-50 text-red-700 border-red-200';
      case 'in-progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'assigned': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleCreateItem = () => {
    toast.success(`${createType === 'product' ? 'Product' : 'Business Unit'} created and submitted for SA approval`);
    setIsCreateDialogOpen(false);
    setSelectedProjectForCreation(null);
    setCreateProjectId('');
  };

  const handleAssignment = (itemId: string, action: 'assign' | 'remove') => {
    const itemType = assignmentType === 'emission-factors' ? 'emission factor' : 'formula';
    if (action === 'assign') {
      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} assigned to business unit successfully`);
    } else {
      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} removed from business unit successfully`);
    }
    // Here you would update the state to reflect the assignment change
  };

  const handleGenerateReport = (projectId: string, type: string) => {
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      name: `${type} Report - ${new Date().toLocaleDateString()}`,
      type: type as any,
      projectId,
      projectName: projects.find(p => p.id === projectId)?.name || '',
      generatedDate: new Date().toISOString().split('T')[0],
      format: 'PDF',
      status: 'generating'
    };
    
    setReports([...reports, newReport]);
    
    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === newReport.id 
          ? { ...r, status: 'ready', fileSize: '1.2 MB' }
          : r
      ));
      toast.success('Report generated successfully!');
    }, 3000);
    
    toast.info('Report generation started...');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate statistics
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'approved').length;
  const pendingAssignments = assignments.filter(a => a.status === 'assigned' || a.status === 'in-progress').length;
  const needsAttentionAssignments = assignments.filter(a => a.status === 'needs-revision' || a.status === 'pending-review').length;
  const overallProgress = assignments.reduce((sum, a) => sum + a.completionPercentage, 0) / assignments.length;

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesProject = !selectedProject || assignment.projectId === selectedProject;
    return matchesSearch && matchesStatus && matchesProject;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-emerald-100">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5"></div>
        <div className="absolute top-4 right-4 opacity-10">
          <Leaf className="h-32 w-32 text-emerald-600" />
        </div>
        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-emerald-900">Customer Dashboard</h1>
                  <p className="text-emerald-700">Data contributor for BU-level access</p>
                </div>
              </div>
              <p className="text-emerald-800 max-w-2xl leading-relaxed">
                Upload activity data, manage assigned products and business units, generate reports, 
                and collaborate with your Sustainability Architect team.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-900">{overallProgress.toFixed(0)}%</div>
              <div className="text-sm text-emerald-600">Overall Progress</div>
              <Progress value={overallProgress} className="w-24 mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-emerald-100 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Total Assignments</p>
                <p className="text-3xl font-bold text-emerald-900">{totalAssignments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Completed</p>
                <p className="text-3xl font-bold text-emerald-700">{completedAssignments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(completedAssignments / totalAssignments) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{pendingAssignments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Needs Attention</p>
                <p className="text-3xl font-bold text-red-600">{needsAttentionAssignments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-emerald-50 border border-emerald-200">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            My Assignments
          </TabsTrigger>
          <TabsTrigger value="business-units" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <Building2 className="h-4 w-4 mr-2" />
            Business Units
          </TabsTrigger>
          <TabsTrigger value="database" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <Database className="h-4 w-4 mr-2" />
            Client Database
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Recent Activity */}
          <Card className="border-emerald-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Data approved for Manufacturing Plant A</p>
                  <p className="text-sm text-green-700">Your Q1 BCA data was approved by Sarah Chen • 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Revision requested for Widget Pro v2</p>
                  <p className="text-sm text-red-700">Mike Rodriguez requested material data clarification • 1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <Upload className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">New assignment received</p>
                  <p className="text-sm text-blue-700">Distribution Center East data collection assigned • 3 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-emerald-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Button 
                  className="h-20 flex-col gap-2 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                  onClick={() => setActiveTab('assignments')}
                >
                  <Upload className="h-6 w-6" />
                  Upload Data
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => {
                    setCreateType('product');
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <Package className="h-6 w-6" />
                  Create Product
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => setActiveTab('business-units')}
                >
                  <Building2 className="h-6 w-6" />
                  Business Units
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => setActiveTab('reports')}
                >
                  <TrendingUp className="h-6 w-6" />
                  Generate Report
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => setActiveTab('database')}
                >
                  <Database className="h-6 w-6" />
                  View Database
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          {/* Filters */}
          <Card className="border-emerald-100">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 border-emerald-200">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="pending-review">Pending Review</SelectItem>
                    <SelectItem value="needs-revision">Needs Revision</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedProject || 'all'} onValueChange={(value) => setSelectedProject(value === 'all' ? null : value)}>
                  <SelectTrigger className="w-64 border-emerald-200">
                    <SelectValue placeholder="Filter by project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Assignments Table */}
          <Card className="border-emerald-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <FileText className="h-5 w-5" />
                My Assignments ({filteredAssignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50">
                    <TableHead>Assignment</TableHead>
                    <TableHead>Project & Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>SA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id} className="hover:bg-emerald-25">
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            assignment.itemType === 'product' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {assignment.itemType === 'product' ? 
                              <Package className="h-5 w-5" /> : 
                              <Building2 className="h-5 w-5" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{assignment.itemName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getPriorityColor(assignment.priority)} size="sm">
                                {assignment.priority}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {assignment.dataType.join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{assignment.projectName}</p>
                          <Badge variant="outline" className="mt-1" size="sm">
                            {assignment.projectType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(assignment.status)}
                          <Badge className={getStatusColor(assignment.status)} size="sm">
                            {assignment.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-20">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{assignment.completionPercentage}%</span>
                          </div>
                          <Progress value={assignment.completionPercentage} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className={`${new Date(assignment.dueDate) < new Date() ? 'text-red-600' : 'text-slate-600'}`}>
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-emerald-700">
                              {assignment.saName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="font-medium">{assignment.saName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Units Tab */}
        <TabsContent value="business-units" className="space-y-6">
          {/* Create New BU Section */}
          <Card className="border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Plus className="h-5 w-5" />
                Create New Business Unit
              </CardTitle>
              <CardDescription>
                Create business units for your projects. They will be submitted for SA approval before becoming active.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Create Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Business Unit Name</Label>
                    <Input placeholder="Enter BU name..." className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label>Assign to Project</Label>
                    <Select>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name} ({project.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Brief description of the business unit..." className="bg-white" />
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                    onClick={() => {
                      toast.success('Business Unit created and submitted for SA approval');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Business Unit
                  </Button>
                </div>

                {/* Creation Guidelines */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-emerald-200">
                    <h4 className="font-medium text-emerald-900 mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Creation Guidelines
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Choose descriptive, unique names</li>
                      <li>• Select the appropriate project context</li>
                      <li>• Provide clear operational descriptions</li>
                      <li>• Consider data collection requirements</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">Approval Process</p>
                        <p className="text-sm text-amber-800">
                          New business units require SA team approval before you can assign emission factors and formulas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Business Units Management */}
          <Card className="border-emerald-100">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-emerald-900">
                    <Building2 className="h-5 w-5" />
                    My Business Units ({mockCreatedBUs.length})
                  </CardTitle>
                  <CardDescription>
                    Manage your created business units and assign emission factors and formulas
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                  {mockCreatedBUs.filter(bu => bu.status === 'approved').length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mockCreatedBUs.map((bu) => (
                  <Card key={bu.id} className="border border-emerald-100 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-emerald-900 text-lg">{bu.name}</h3>
                              <p className="text-sm text-emerald-600">{bu.projectName}</p>
                            </div>
                            <Badge 
                              variant={bu.status === 'approved' ? 'default' : 'secondary'}
                              className={bu.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                            >
                              {bu.status === 'approved' ? 'Approved' : 'Pending Approval'}
                            </Badge>
                          </div>
                          
                          <p className="text-slate-600 mb-4">{bu.description}</p>
                          
                          {/* Status and Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-emerald-600 font-medium">Assigned EFs</span>
                                <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                                  {bu.assignedEFs}
                                </Badge>
                              </div>
                            </div>
                            <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-cyan-600 font-medium">Assigned Formulas</span>
                                <Badge variant="outline" className="text-cyan-700 border-cyan-200">
                                  {bu.assignedFormulas}
                                </Badge>
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 font-medium">Created</span>
                                <span className="text-sm font-medium text-slate-800">
                                  {new Date(bu.createdDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-600 font-medium">Project Type</span>
                                <Badge variant="outline" className="text-blue-700 border-blue-200">
                                  {projects.find(p => p.id === bu.projectId)?.type || 'LCA'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 ml-6">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedBU(bu.id);
                              setAssignmentType('emission-factors');
                              setIsAssignmentDialogOpen(true);
                            }}
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 min-w-[120px]"
                            disabled={bu.status !== 'approved'}
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Assign EFs
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedBU(bu.id);
                              setAssignmentType('formulas');
                              setIsAssignmentDialogOpen(true);
                            }}
                            className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 min-w-[120px]"
                            disabled={bu.status !== 'approved'}
                          >
                            <Calculator className="h-4 w-4 mr-1" />
                            Assign Formulas
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 min-w-[120px]"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                      
                      {bu.status === 'pending' && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-amber-800">
                              Awaiting SA approval. Assignment functions will be available once approved.
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {mockCreatedBUs.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-medium text-slate-900 mb-2">No Business Units Yet</h3>
                  <p className="text-slate-600 mb-4">Create your first business unit to get started with data collection and analysis.</p>
                  <Button 
                    className="bg-gradient-to-r from-emerald-500 to-green-600"
                    onClick={() => {
                      // Scroll to create section
                      document.querySelector('[data-section="create-bu"]')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First BU
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <Card className="border-emerald-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Database className="h-5 w-5" />
                Client-Specific Database Access
              </CardTitle>
              <CardDescription>
                View assigned database entries and custom items created by your SA team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="emission-factors">
                <TabsList className="grid w-full grid-cols-3 bg-emerald-50">
                  <TabsTrigger value="emission-factors">Emission Factors</TabsTrigger>
                  <TabsTrigger value="sub-products">Sub-products</TabsTrigger>
                  <TabsTrigger value="formulas">Formulas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="emission-factors" className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDatabaseItems.filter(item => item.type === 'emission-factor').map((item) => (
                        <TableRow key={item.id} className="hover:bg-emerald-25">
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-slate-500">{item.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={item.source === 'assigned' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}>
                              {item.source === 'assigned' ? 'Assigned' : 'SA Created'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-slate-600">
                              {item.accessLevel === 'read' ? 'Read Only' : 'Read/Write'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="sub-products" className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDatabaseItems.filter(item => item.type === 'sub-product').map((item) => (
                        <TableRow key={item.id} className="hover:bg-emerald-25">
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-slate-500">{item.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={item.source === 'assigned' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}>
                              {item.source === 'assigned' ? 'Assigned' : 'SA Created'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-slate-600">
                              {item.accessLevel === 'read' ? 'Read Only' : 'Read/Write'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="formulas" className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDatabaseItems.filter(item => item.type === 'formula').map((item) => (
                        <TableRow key={item.id} className="hover:bg-emerald-25">
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-slate-500">{item.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={item.source === 'assigned' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}>
                              {item.source === 'assigned' ? 'Assigned' : 'SA Created'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-slate-600">
                              {item.accessLevel === 'read' ? 'Read Only' : 'Read/Write'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Report Generation */}
          <Card className="border-emerald-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <TrendingUp className="h-5 w-5" />
                Generate Reports & Analytics
              </CardTitle>
              <CardDescription>
                Create reports for your assigned projects and export analytics data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => handleGenerateReport('proj-1', 'impact-summary')}
                >
                  <PieChart className="h-6 w-6" />
                  Impact Summary
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => handleGenerateReport('proj-1', 'detailed-analysis')}
                >
                  <LineChart className="h-6 w-6" />
                  Detailed Analysis
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => handleGenerateReport('proj-1', 'compliance')}
                >
                  <Shield className="h-6 w-6" />
                  Compliance Report
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => handleGenerateReport('proj-1', 'custom')}
                >
                  <Settings className="h-6 w-6" />
                  Custom Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Reports */}
          <Card className="border-emerald-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Archive className="h-5 w-5" />
                My Reports ({reports.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50">
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-emerald-25">
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          {report.fileSize && (
                            <p className="text-sm text-slate-500">{report.fileSize}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {report.type.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {report.projectName}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(report.generatedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            report.format === 'PDF' ? 'border-red-200 text-red-700' :
                            report.format === 'Excel' ? 'border-green-200 text-green-700' :
                            'border-blue-200 text-blue-700'
                          }
                        >
                          {report.format}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {report.status === 'ready' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {report.status === 'generating' && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
                          {report.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                          <Badge className={
                            report.status === 'ready' ? 'bg-green-100 text-green-800' :
                            report.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {report.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {report.status === 'ready' && (
                            <>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>

      {/* Create Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) {
          setSelectedProjectForCreation(null);
          setCreateProjectId('');
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New {createType === 'product' ? 'Product' : 'Business Unit'}</DialogTitle>
            <DialogDescription>
              Create a new {createType === 'product' ? 'product' : 'business unit'} that will be submitted for SA approval
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={createType === 'product' ? 'default' : 'outline'}
                onClick={() => setCreateType('product')}
                className="h-24 flex-col gap-2"
              >
                <Package className="h-8 w-8" />
                Product
              </Button>
              <Button
                variant={createType === 'business-unit' ? 'default' : 'outline'}
                onClick={() => setCreateType('business-unit')}
                className="h-24 flex-col gap-2"
              >
                <Building2 className="h-8 w-8" />
                Business Unit
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">{createType === 'product' ? 'Product' : 'Business Unit'} Name</Label>
                <Input id="item-name" placeholder="Enter name..." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-select">Assign to Project</Label>
                <Select 
                  value={createProjectId || selectedProjectForCreation || ''} 
                  onValueChange={setCreateProjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide details about this item..."
                  rows={3}
                />
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Approval Required</p>
                    <p className="text-sm text-amber-800">
                      This {createType === 'product' ? 'product' : 'business unit'} will be submitted to your SA team for approval 
                      before it can be included in the project.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
               setIsCreateDialogOpen(false);
               setSelectedProjectForCreation(null);
               setCreateProjectId('');
             }}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem} className="bg-gradient-to-r from-emerald-500 to-green-600">
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={(open) => {
        setIsAssignmentDialogOpen(open);
        if (!open) {
          setSelectedBU(null);
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Assign {assignmentType === 'emission-factors' ? 'Emission Factors' : 'Formulas'} to Business Unit
            </DialogTitle>
            <DialogDescription>
              Select {assignmentType === 'emission-factors' ? 'emission factors' : 'formulas'} from Master DB and CDB to assign to this business unit
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Assignment Type Toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              <Button
                variant={assignmentType === 'emission-factors' ? 'default' : 'ghost'}
                onClick={() => setAssignmentType('emission-factors')}
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                Emission Factors
              </Button>
              <Button
                variant={assignmentType === 'formulas' ? 'default' : 'ghost'}
                onClick={() => setAssignmentType('formulas')}
                className="flex-1"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Formulas
              </Button>
            </div>

            {/* Available Items for Assignment */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">
                Available {assignmentType === 'emission-factors' ? 'Emission Factors' : 'Formulas'}
              </h4>
              
              <div className="max-h-96 overflow-y-auto space-y-3">
                {(assignmentType === 'emission-factors' ? mockAvailableEmissionFactors : mockAvailableFormulas).map((item) => (
                  <Card key={item.id} className={`border ${item.isAssigned ? 'border-green-200 bg-green-50' : 'border-slate-200'} transition-all duration-200 hover:shadow-md`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              item.source === 'Master DB' 
                                ? 'bg-emerald-100 text-emerald-600' 
                                : 'bg-cyan-100 text-cyan-600'
                            }`}>
                              {assignmentType === 'emission-factors' ? (
                                <Zap className="h-4 w-4" />
                              ) : (
                                <Calculator className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <h5 className="font-medium text-slate-900">{item.name}</h5>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    item.source === 'Master DB' 
                                      ? 'border-emerald-200 text-emerald-700' 
                                      : 'border-cyan-200 text-cyan-700'
                                  }`}
                                >
                                  {item.source}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {assignmentType === 'emission-factors' ? (
                            <div className="text-sm text-slate-600 space-y-1">
                              <p><span className="font-medium">Value:</span> {(item as any).value}</p>
                              <p><span className="font-medium">Region:</span> {(item as any).region}</p>
                            </div>
                          ) : (
                            <div className="text-sm text-slate-600 space-y-1">
                              <p><span className="font-medium">Expression:</span> <code className="bg-slate-100 px-1 rounded text-xs">{(item as any).expression}</code></p>
                              <p><span className="font-medium">Variables:</span> {(item as any).variables.join(', ')}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          {item.isAssigned ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => handleAssignment(item.id, 'remove')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                              onClick={() => handleAssignment(item.id, 'assign')}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                toast.success(`${assignmentType === 'emission-factors' ? 'Emission factors' : 'Formulas'} assigned successfully`);
                setIsAssignmentDialogOpen(false);
              }}
              className="bg-gradient-to-r from-emerald-500 to-green-600"
            >
              Save Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}