import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface ProjectsProps {
  projectType?: 'BCA' | 'LCA';
}
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
import { Project } from '../../types';
import { 
  Plus, 
  BarChart3, 
  Users, 
  Search, 
  Play, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Download
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Q1 2024 Carbon Assessment',
    type: 'BCA',
    scope: 'Office operations and manufacturing',
    status: 'in-progress',
    assignedProducts: ['Steel Widget A', 'Plastic Component B'],
    assignedBUs: ['Manufacturing Plant', 'Distribution Center'],
    assignedCustomers: ['John Smith', 'Mary Johnson'],
    createdAt: '2024-01-15',
    lastCalculated: '2024-01-20'
  },
  {
    id: '2',
    name: 'Product LCA - New Widget Line',
    type: 'LCA',
    scope: 'Full lifecycle assessment of new product line',
    status: 'draft',
    assignedProducts: ['Widget Pro', 'Widget Lite'],
    assignedBUs: [],
    assignedCustomers: ['David Wilson'],
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Annual Sustainability Report',
    type: 'BCA',
    scope: 'Company-wide carbon footprint assessment',
    status: 'completed',
    assignedProducts: [],
    assignedBUs: ['HQ Office', 'Warehouse A', 'Warehouse B'],
    assignedCustomers: ['Lisa Chen', 'Mike Brown'],
    createdAt: '2023-12-01',
    lastCalculated: '2024-01-05'
  }
];

const mockProducts = ['Steel Widget A', 'Plastic Component B', 'Widget Pro', 'Widget Lite', 'Component X'];
const mockBUs = ['Manufacturing Plant', 'Distribution Center', 'HQ Office', 'Warehouse A', 'Warehouse B'];
const mockCustomers = ['John Smith', 'Mary Johnson', 'David Wilson', 'Lisa Chen', 'Mike Brown'];

export function Projects({ projectType }: ProjectsProps = {}) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: (projectType || 'LCA') as 'LCA' | 'BCA',
    scope: '',
    assignedProducts: [] as string[],
    assignedBUs: [] as string[],
    assignedCustomers: [] as string[]
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.scope.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = projectType ? project.type === projectType : true;
    return matchesSearch && matchesType;
  });

  const handleCreate = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      scope: formData.scope,
      status: 'draft',
      assignedProducts: formData.assignedProducts,
      assignedBUs: formData.assignedBUs,
      assignedCustomers: formData.assignedCustomers,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setProjects([...projects, newProject]);
    setIsCreateDialogOpen(false);
    setFormData({
      name: '',
      type: 'LCA',
      scope: '',
      assignedProducts: [],
      assignedBUs: [],
      assignedCustomers: []
    });
    
    toast.success(`Project "${newProject.name}" created successfully`);
  };

  const handleRunCalculation = (project: Project) => {
    const updatedProjects = projects.map(p => 
      p.id === project.id 
        ? {...p, status: 'in-progress' as const, lastCalculated: new Date().toISOString().split('T')[0]}
        : p
    );
    setProjects(updatedProjects);
    toast.success('Calculation started - results will be available in Analytics tab');
  };

  const handleApproveData = (project: Project) => {
    toast.success('Customer data approved - calculation enabled');
  };

  const handleRejectData = (project: Project) => {
    toast.info('Data sent back to customer with revision notes');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'draft': return <XCircle className="h-4 w-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage LCA and BCA projects with your customers</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up a new LCA or BCA project and assign team members
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Project Type Selection */}
              <div className="space-y-2">
                <Label>Project Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.type === 'LCA' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setFormData({...formData, type: 'LCA'})}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium">LCA Project</h3>
                        <p className="text-sm text-gray-600">Product lifecycle assessment</p>
                      </div>
                    </div>
                  </div>
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.type === 'BCA' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                    onClick={() => setFormData({...formData, type: 'BCA'})}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-green-600" />
                      <div>
                        <h3 className="font-medium">BCA Project</h3>
                        <p className="text-sm text-gray-600">Business carbon assessment</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Q1 2024 Carbon Assessment"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scope">Scope Description</Label>
                  <Textarea
                    id="scope"
                    value={formData.scope}
                    onChange={(e) => setFormData({...formData, scope: e.target.value})}
                    placeholder="Describe the scope and objectives of this project..."
                  />
                </div>
              </div>
              
              {/* Assignment Sections */}
              <div className="space-y-4">
                {formData.type === 'LCA' && (
                  <div className="space-y-2">
                    <Label>Assign Products</Label>
                    <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                      {mockProducts.map(product => (
                        <div key={product} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`product-${product}`}
                            checked={formData.assignedProducts.includes(product)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  assignedProducts: [...formData.assignedProducts, product]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedProducts: formData.assignedProducts.filter(p => p !== product)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`product-${product}`} className="text-sm">{product}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.type === 'BCA' && (
                  <div className="space-y-2">
                    <Label>Assign Business Units</Label>
                    <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                      {mockBUs.map(bu => (
                        <div key={bu} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`bu-${bu}`}
                            checked={formData.assignedBUs.includes(bu)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  assignedBUs: [...formData.assignedBUs, bu]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedBUs: formData.assignedBUs.filter(b => b !== bu)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`bu-${bu}`} className="text-sm">{bu}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Assign Customer Team Members</Label>
                  <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                    {mockCustomers.map(customer => (
                      <div key={customer} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`customer-${customer}`}
                          checked={formData.assignedCustomers.includes(customer)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                assignedCustomers: [...formData.assignedCustomers, customer]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                assignedCustomers: formData.assignedCustomers.filter(c => c !== customer)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`customer-${customer}`} className="text-sm">{customer}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Items</TableHead>
              <TableHead>Team Members</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-gray-500">{project.scope}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={project.type === 'LCA' ? 'default' : 'secondary'}>
                    {project.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(project.status)}
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {project.assignedProducts.length > 0 && (
                      <div>{project.assignedProducts.length} products</div>
                    )}
                    {project.assignedBUs.length > 0 && (
                      <div>{project.assignedBUs.length} business units</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {project.assignedCustomers.length} members
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {project.lastCalculated || project.createdAt}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRunCalculation(project)}
                      disabled={project.status === 'in-progress'}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Data Review Section */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">Data Review Queue</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium">Q1 2024 Carbon Assessment</div>
                <div className="text-sm text-gray-600">John Smith uploaded data for Manufacturing Plant</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRejectData(projects[0])}
              >
                Request Changes
              </Button>
              <Button 
                size="sm"
                onClick={() => handleApproveData(projects[0])}
              >
                Approve
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium">Product LCA - New Widget Line</div>
                <div className="text-sm text-gray-600">David Wilson uploaded product data for Widget Pro</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Request Changes
              </Button>
              <Button size="sm">
                Approve
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}