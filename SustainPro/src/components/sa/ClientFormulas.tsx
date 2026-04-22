import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
import { Separator } from '../ui/separator';
import { 
  Plus, 
  Upload, 
  Search, 
  Edit, 
  Trash2,
  Copy,
  Eye,
  Lock,
  Star,
  X,
  Activity,
  Calculator,
  Sparkles,
  CheckCircle,
  Hash,
  Type
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Formula interfaces
interface FormulaParameter {
  id: string;
  name: string; // A, B, C, etc.
  type: 'Variable' | 'Coefficient' | 'Constant';
  unit?: string; // For Variables and Constants
  value?: number; // For Constants only
}

interface Formula {
  id: string;
  uid: string;
  name: string;
  description: string;
  version: string;
  expression: string; // e.g., "A * B / C"
  parameters: FormulaParameter[];
  status: 'active' | 'draft' | 'deprecated';
  database: 'master' | 'client';
  clientId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// Mock data for client-specific formulas
const mockClientFormulas: Formula[] = [
  {
    id: 'cf1',
    uid: 'CF-CLI-CALC-001',
    name: 'Custom Energy Calculation',
    description: 'Client-specific energy consumption calculation for manufacturing',
    version: 'v1.2',
    expression: 'A * B + C',
    parameters: [
      { id: 'p1', name: 'A', type: 'Variable', unit: 'kWh' },
      { id: 'p2', name: 'B', type: 'Coefficient' },
      { id: 'p3', name: 'C', type: 'Constant', value: 10.5, unit: 'kg CO2e' }
    ],
    status: 'active',
    database: 'client',
    clientId: 'client-001',
    createdBy: 'sa_user',
    createdAt: '2024-01-20T14:30:00Z'
  }
];

// Mock data for master formulas available for assignment
const mockMasterFormulas: Formula[] = [
  {
    id: 'mf1',
    uid: 'MF-CALC-ENERGY-001',
    name: 'Standard Energy Calculation',
    description: 'Standard calculation for energy-based emissions',
    version: 'v2.0',
    expression: 'A * B',
    parameters: [
      { id: 'mp1', name: 'A', type: 'Variable', unit: 'kWh' },
      { id: 'mp2', name: 'B', type: 'Variable', unit: 'kg CO2e/kWh' }
    ],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'mf2',
    uid: 'MF-CALC-FUEL-001',
    name: 'Fuel Combustion Calculation',
    description: 'Standard calculation for fuel combustion emissions',
    version: 'v1.5',
    expression: 'A * B * C',
    parameters: [
      { id: 'mp3', name: 'A', type: 'Variable', unit: 'L' },
      { id: 'mp4', name: 'B', type: 'Variable', unit: 'kg CO2e/L' },
      { id: 'mp5', name: 'C', type: 'Coefficient' }
    ],
    status: 'active',
    database: 'master',
    createdBy: 'admin',
    createdAt: '2024-01-10T08:30:00Z'
  }
];

const units = ['kg', 'L', 'kWh', 'kg CO2e', 'kg CO2e/kWh', 'kg CO2e/L', 'kg CO2e/kg', 't', 'MJ', 'm³', 'km'];
const parameterTypes = ['Variable', 'Coefficient', 'Constant'];

// UID Generation Helper for Client Formulas
const generateClientFormulaUID = (sequence: number, clientId: string): string => {
  const clientCode = clientId.substring(0, 3).toUpperCase();
  return `CF-${clientCode}-CALC-${sequence.toString().padStart(3, '0')}`;
};

export function ClientFormulas() {
  const [clientFormulas, setClientFormulas] = useState<Formula[]>(mockClientFormulas);
  const [masterFormulas] = useState<Formula[]>(mockMasterFormulas);
  const [assignedMasterFormulas, setAssignedMasterFormulas] = useState<string[]>(['mf1']); // IDs of assigned master formulas
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFormulaSelectionDialogOpen, setIsFormulaSelectionDialogOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
    expression: '',
    parameters: [
      { id: '1', name: 'A', type: 'Variable' as const, unit: '', value: undefined },
      { id: '2', name: 'B', type: 'Variable' as const, unit: '', value: undefined },
      { id: '3', name: 'C', type: 'Variable' as const, unit: '', value: undefined }
    ] as Array<{
      id: string;
      name: string;
      type: 'Variable' | 'Coefficient' | 'Constant';
      unit: string;
      value?: number;
    }>
  });

  // Listen for create formula dialog event from CDB
  React.useEffect(() => {
    const handleOpenCreateFormula = () => {
      setIsCreateDialogOpen(true);
    };

    window.addEventListener('openCreateFormulaDialog', handleOpenCreateFormula);
    return () => {
      window.removeEventListener('openCreateFormulaDialog', handleOpenCreateFormula);
    };
  }, []);

  // Available master formulas that haven't been assigned yet
  const availableMasterFormulas = masterFormulas.filter(formula => !assignedMasterFormulas.includes(formula.id));

  // Combine all formulas for display - only show client formulas and assigned master formulas
  const allFormulas = [
    ...clientFormulas,
    ...masterFormulas.filter(formula => assignedMasterFormulas.includes(formula.id))
  ];

  const filteredFormulas = allFormulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || !selectedStatus || formula.status === selectedStatus;
    const matchesDatabase = selectedDatabase === 'all' || !selectedDatabase || formula.database === selectedDatabase;
    
    return matchesSearch && matchesStatus && matchesDatabase;
  });

  const handleCreate = () => {
    if (!formData.name || !formData.description || !formData.version || !formData.expression) {
      toast.error('Please fill in all required fields');
      return;
    }

    const sequence = clientFormulas.length + 1;
    const newUID = generateClientFormulaUID(sequence, 'client-001');

    const newFormula: Formula = {
      id: Date.now().toString(),
      uid: newUID,
      name: formData.name,
      description: formData.description,
      version: formData.version,
      expression: formData.expression,
      parameters: formData.parameters.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        unit: p.unit || undefined,
        value: p.value
      })),
      status: 'draft',
      database: 'client',
      clientId: 'client-001',
      createdBy: 'sa_user',
      createdAt: new Date().toISOString()
    };
    
    setClientFormulas([...clientFormulas, newFormula]);
    setIsCreateDialogOpen(false);
    
    setFormData({
      name: '',
      description: '',
      version: '',
      expression: '',
      parameters: [
        { id: '1', name: 'A', type: 'Variable', unit: '', value: undefined },
        { id: '2', name: 'B', type: 'Variable', unit: '', value: undefined },
        { id: '3', name: 'C', type: 'Variable', unit: '', value: undefined }
      ]
    });
    
    toast.success(`Client Formula created — UID ${newUID}`);
  };

  const handleDelete = (formula: Formula) => {
    if (formula.database === 'master') {
      toast.error(`Cannot delete master formula ${formula.uid} — Remove assignment instead`);
      return;
    }

    const hasDependencies = Math.random() > 0.7;
    
    if (hasDependencies) {
      toast.error(`Cannot delete ${formula.uid} — in use by 2 products`);
      return;
    }
    
    setClientFormulas(clientFormulas.filter(item => item.id !== formula.id));
    toast.success(`Client Formula ${formula.uid} deleted successfully`);
  };

  const handleAssignMasterFormula = (formulaIds: string[]) => {
    setAssignedMasterFormulas([...assignedMasterFormulas, ...formulaIds]);
    toast.success(`${formulaIds.length} formula(s) assigned from Master DB`);
  };

  const handleUnassignMasterFormula = (formulaId: string) => {
    setAssignedMasterFormulas(assignedMasterFormulas.filter(id => id !== formulaId));
    toast.success('Master Formula unassigned from client database');
  };

  const copyUID = (uid: string) => {
    navigator.clipboard.writeText(uid);
    toast.success('UID copied to clipboard');
  };

  const addParameter = () => {
    const nextLetter = String.fromCharCode(65 + formData.parameters.length); // A, B, C, D, etc.
    setFormData({
      ...formData,
      parameters: [
        ...formData.parameters,
        { id: Date.now().toString(), name: nextLetter, type: 'Variable', unit: '', value: undefined }
      ]
    });
  };

  const removeParameter = (id: string) => {
    setFormData({
      ...formData,
      parameters: formData.parameters.filter(p => p.id !== id)
    });
  };

  const updateParameter = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      parameters: formData.parameters.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  return (
    <div className="space-y-6">
      {/* Client Formula Management Section */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Client Formulas</h2>
                <p className="text-gray-600">Manage client-specific and assigned master calculation formulas</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => {}}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            
            {/* Add Formulas from Master DB Dialog */}
            <Dialog open={isFormulaSelectionDialogOpen} onOpenChange={setIsFormulaSelectionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Formulas from Master DB
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    Select Formulas from Master Database
                  </DialogTitle>
                  <DialogDescription>
                    Choose formulas from the Master DB to assign to this client
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {availableMasterFormulas.map((formula) => (
                    <Card key={formula.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Checkbox
                              id={`select-${formula.id}`}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleAssignMasterFormula([formula.id]);
                                  setIsFormulaSelectionDialogOpen(false);
                                }
                              }}
                            />
                            <div>
                              <div className="font-medium">{formula.name}</div>
                              <div className="text-sm text-gray-500">{formula.description}</div>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline">{formula.expression}</Badge>
                                <Badge variant="secondary">{formula.version}</Badge>
                                <span className="text-sm text-gray-600">
                                  {formula.parameters.length} parameters
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm text-gray-500">{formula.uid}</div>
                            <div className="text-sm text-gray-400">{formula.version}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {availableMasterFormulas.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">All Master Formulas Assigned</h3>
                      <p className="text-gray-500">All available Master DB formulas have been assigned to this client.</p>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsFormulaSelectionDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by UID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="master">Master DB</SelectItem>
              <SelectItem value="client">Client Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Formulas Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead>Formula Name</TableHead>
                  <TableHead>Expression</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Parameters</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormulas.map((formula) => {
                  const isMaster = formula.database === 'master';
                  const isAvailable = availableMasterFormulas.some(f => f.id === formula.id);
                  return (
                    <TableRow key={formula.id} className={isMaster ? 'bg-blue-50/30' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isMaster ? (
                            <>
                              <Lock className="h-4 w-4 text-blue-500" />
                              <Badge variant="outline" className="text-blue-700 border-blue-200">
                                {isAvailable ? 'Available from Master' : 'Master DB'}
                              </Badge>
                            </>
                          ) : (
                            <>
                              <Edit className="h-4 w-4 text-green-500" />
                              <Badge className="bg-green-500 hover:bg-green-600">
                                Client Custom
                              </Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{formula.uid}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyUID(formula.uid)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formula.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {formula.expression}
                        </Badge>
                      </TableCell>
                      <TableCell>{formula.version}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {formula.parameters.slice(0, 3).map(param => (
                            <Badge key={param.id} variant="secondary" className="text-xs">
                              {param.name}:{param.type.charAt(0)}
                            </Badge>
                          ))}
                          {formula.parameters.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{formula.parameters.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={formula.status === 'active' ? 'default' : formula.status === 'draft' ? 'secondary' : 'destructive'}
                          className={formula.status === 'active' ? (isMaster ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600') : ''}
                        >
                          {formula.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedFormula(formula);
                              setIsViewDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!isMaster && !isAvailable && (
                            <>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(formula)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {isMaster && !isAvailable && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUnassignMasterFormula(formula.id)}
                              className="h-8 w-8 p-0 text-orange-500 hover:text-orange-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {isAvailable && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleAssignMasterFormula([formula.id])}
                              className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Custom Formula Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              Create Client-Specific Formula
            </DialogTitle>
            <DialogDescription>
              Create a custom calculation formula for this client with structured parameters
            </DialogDescription>
          </DialogHeader>
          
          {/* Formula Creation Form */}
          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="p-6">
              {/* Metadata Section - Two Column Layout */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="formula-name">Formula Name *</Label>
                  <Input
                    id="formula-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter formula name"
                    className="bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="formula-version">Formula Version *</Label>
                  <Input
                    id="formula-version"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    placeholder="Enter version, e.g., v1.0"
                    className="bg-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <Label htmlFor="formula-description">Description *</Label>
                <Textarea
                  id="formula-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the purpose of this formula"
                  rows={3}
                  className="bg-white"
                />
              </div>
              
              {/* Formula Expression - Single Row */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="formula-expression">Formula Expression *</Label>
                <Input
                  id="formula-expression"
                  value={formData.expression}
                  onChange={(e) => setFormData({...formData, expression: e.target.value})}
                  placeholder="e.g., A * B / C"
                  className="bg-white font-mono text-lg"
                />
              </div>
              
              {/* Parameters Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">Parameters</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addParameter}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Parameter
                  </Button>
                </div>
                
                {/* Parameters Table */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-5 gap-4 mb-3">
                    <Label className="text-sm font-medium text-gray-600">Parameter</Label>
                    <Label className="text-sm font-medium text-gray-600">Type</Label>
                    <Label className="text-sm font-medium text-gray-600">Unit</Label>
                    <Label className="text-sm font-medium text-gray-600">Value</Label>
                    <Label className="text-sm font-medium text-gray-600">Action</Label>
                  </div>
                  
                  {formData.parameters.map((param, index) => (
                    <div key={param.id} className="grid grid-cols-5 gap-4 mb-3 items-end">
                      <div>
                        <Input
                          value={param.name}
                          onChange={(e) => updateParameter(param.id, 'name', e.target.value)}
                          className="bg-white text-center font-mono font-bold"
                          placeholder="A"
                        />
                      </div>
                      
                      <div>
                        <Select 
                          value={param.type} 
                          onValueChange={(value) => updateParameter(param.id, 'type', value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {parameterTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        {(param.type === 'Variable' || param.type === 'Constant') && (
                          <Select 
                            value={param.unit} 
                            onValueChange={(value) => updateParameter(param.id, 'unit', value)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map(unit => (
                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      
                      <div>
                        {param.type === 'Constant' && (
                          <Input
                            type="number"
                            value={param.value || ''}
                            onChange={(e) => updateParameter(param.id, 'value', parseFloat(e.target.value) || undefined)}
                            placeholder="0.0"
                            className="bg-white"
                          />
                        )}
                      </div>
                      
                      <div>
                        {formData.parameters.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeParameter(param.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              Save Formula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Formula Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Formula Details - {selectedFormula?.name}
            </DialogTitle>
            <DialogDescription>
              View formula structure and parameter configuration
            </DialogDescription>
          </DialogHeader>
          
          {selectedFormula && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Formula Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Name</Label>
                      <p className="font-medium">{selectedFormula.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Version</Label>
                      <p className="font-medium">{selectedFormula.version}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm text-gray-500">Description</Label>
                      <p className="font-medium">{selectedFormula.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Expression</Label>
                      <p className="font-mono text-lg bg-gray-100 p-2 rounded">{selectedFormula.expression}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">UID</Label>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">{selectedFormula.uid}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyUID(selectedFormula.uid)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedFormula.parameters.map((param) => (
                      <div key={param.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-mono font-bold text-blue-700">{param.name}</span>
                          </div>
                          <div>
                            <p className="font-medium">{param.type}</p>
                            {param.unit && <p className="text-sm text-gray-500">Unit: {param.unit}</p>}
                            {param.value !== undefined && <p className="text-sm text-gray-500">Value: {param.value}</p>}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {param.type === 'Variable' ? 'Var' : param.type === 'Constant' ? 'Const' : 'Coeff'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}