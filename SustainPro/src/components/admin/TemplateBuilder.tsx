import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Edit, Trash2, Layout, Package, Building, Lock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TemplateStage {
  id: string;
  name: string;
  formulaId?: string;
  emissionFactorIds: string[];
  defaultValues: Record<string, number>;
}

interface Template {
  uid: string;
  name: string;
  type: 'sub-product' | 'business-unit';
  functionalUnit?: string;
  defaultImpactCategory?: string;
  defaultCountry?: string;
  defaultYear?: number;
  tags: string[];
  description: string;
  stages: TemplateStage[];
  lastEdited: string;
  locked: boolean;
}

const mockTemplates: Template[] = [
  {
    uid: 'TMPL-001',
    name: 'Generic Manufacturing Product',
    type: 'sub-product',
    functionalUnit: 'kg',
    defaultImpactCategory: 'Climate Change',
    defaultCountry: 'Global',
    defaultYear: 2024,
    tags: ['manufacturing', 'generic'],
    description: 'Template for basic manufacturing processes',
    stages: [
      { 
        id: 'stage-1', 
        name: 'Raw Material Extraction', 
        formulaId: 'FORM-001',
        emissionFactorIds: ['EF-000123'],
        defaultValues: { consumption: 100 }
      },
      { 
        id: 'stage-2', 
        name: 'Manufacturing', 
        formulaId: 'FORM-002',
        emissionFactorIds: ['EF-000124'],
        defaultValues: { energy: 50 }
      },
      { 
        id: 'stage-3', 
        name: 'Transportation', 
        formulaId: 'FORM-002',
        emissionFactorIds: ['EF-000125'],
        defaultValues: { distance: 500 }
      }
    ],
    lastEdited: '2024-01-15',
    locked: true
  },
  {
    uid: 'TMPL-002',
    name: 'Office Operations BU',
    type: 'business-unit',
    defaultImpactCategory: 'Climate Change',
    defaultCountry: 'United States',
    defaultYear: 2024,
    tags: ['office', 'operations', 'scope2'],
    description: 'Template for office-based business unit operations',
    stages: [
      { 
        id: 'activity-1', 
        name: 'Electricity Consumption', 
        formulaId: 'FORM-001',
        emissionFactorIds: ['EF-000123'],
        defaultValues: { consumption: 1000 }
      },
      { 
        id: 'activity-2', 
        name: 'Heating & Cooling', 
        formulaId: 'FORM-003',
        emissionFactorIds: ['EF-000124'],
        defaultValues: { volume: 200 }
      }
    ],
    lastEdited: '2024-01-10',
    locked: true
  }
];

export function TemplateBuilder() {
  const [templates, setTemplates] = useState(mockTemplates);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [templateType, setTemplateType] = useState<'sub-product' | 'business-unit'>('sub-product');
  const [stages, setStages] = useState<TemplateStage[]>([]);

  const addStage = () => {
    const newStage: TemplateStage = {
      id: `stage-${Date.now()}`,
      name: templateType === 'sub-product' ? 'New Stage' : 'New Activity',
      emissionFactorIds: [],
      defaultValues: {}
    };
    setStages(prev => [...prev, newStage]);
  };

  const removeStage = (id: string) => {
    setStages(prev => prev.filter(stage => stage.id !== id));
  };

  const updateStage = (id: string, field: keyof TemplateStage, value: any) => {
    setStages(prev => prev.map(stage => 
      stage.id === id ? { ...stage, [field]: value } : stage
    ));
  };

  const handleCreateTemplate = (formData: FormData) => {
    const newTemplate: Template = {
      uid: `TMPL-${String(Date.now()).slice(-3).padStart(3, '0')}`,
      name: formData.get('name') as string,
      type: templateType,
      functionalUnit: templateType === 'sub-product' ? formData.get('functionalUnit') as string : undefined,
      defaultImpactCategory: formData.get('defaultImpactCategory') as string,
      defaultCountry: formData.get('defaultCountry') as string,
      defaultYear: parseInt(formData.get('defaultYear') as string),
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
      description: formData.get('description') as string,
      stages: stages,
      lastEdited: new Date().toISOString().split('T')[0],
      locked: true
    };

    setTemplates(prev => [...prev, newTemplate]);
    setIsCreateDialogOpen(false);
    setStages([]);
    toast(`Template created — UID ${newTemplate.uid}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Template Builder</h2>
          <p className="text-gray-600">Create reusable templates for sub-products and business units</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            
            <Tabs value={templateType} onValueChange={(value) => setTemplateType(value as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sub-product">Sub-product Template</TabsTrigger>
                <TabsTrigger value="business-unit">Business Unit Template</TabsTrigger>
              </TabsList>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateTemplate(new FormData(e.currentTarget));
              }} className="space-y-6 mt-4">
                
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name *</Label>
                    <Input id="name" name="name" required placeholder="e.g., Generic Manufacturing Product" />
                  </div>
                  {templateType === 'sub-product' && (
                    <div>
                      <Label htmlFor="functionalUnit">Functional Unit *</Label>
                      <Select name="functionalUnit" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="m2">m2</SelectItem>
                          <SelectItem value="m3">m3</SelectItem>
                          <SelectItem value="piece">piece</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="defaultImpactCategory">Default Impact Category</Label>
                    <Select name="defaultImpactCategory">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Climate Change">Climate Change</SelectItem>
                        <SelectItem value="Ozone Depletion">Ozone Depletion</SelectItem>
                        <SelectItem value="Water Use">Water Use</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="defaultCountry">Default Country</Label>
                    <Select name="defaultCountry">
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Global">Global</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="European Union">European Union</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="defaultYear">Default Year</Label>
                    <Input id="defaultYear" name="defaultYear" type="number" placeholder="2024" defaultValue="2024" />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" name="tags" placeholder="manufacturing, generic" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Describe this template..." />
                </div>

                {/* Stages/Activities Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>
                      {templateType === 'sub-product' ? 'Stages' : 'Activities'}
                    </Label>
                    <Button type="button" onClick={addStage} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add {templateType === 'sub-product' ? 'Stage' : 'Activity'}
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {stages.map((stage, index) => (
                      <Card key={stage.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">
                              {templateType === 'sub-product' ? 'Stage' : 'Activity'} {index + 1}
                            </CardTitle>
                            <Button
                              type="button"
                              onClick={() => removeStage(stage.id)}
                              size="sm"
                              variant="outline"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={stage.name}
                                onChange={(e) => updateStage(stage.id, 'name', e.target.value)}
                                placeholder="e.g., Raw Material Extraction"
                              />
                            </div>
                            {templateType === 'business-unit' && (
                              <div>
                                <Label>Scope</Label>
                                <Select onValueChange={(value) => updateStage(stage.id, 'scope', value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select scope" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Scope 1">Scope 1</SelectItem>
                                    <SelectItem value="Scope 2">Scope 2</SelectItem>
                                    <SelectItem value="Scope 3">Scope 3</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            <div>
                              <Label>Assign Formula</Label>
                              <Select onValueChange={(value) => updateStage(stage.id, 'formulaId', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select formula" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="FORM-001">Electricity Consumption Impact</SelectItem>
                                  <SelectItem value="FORM-002">Transportation Distance Impact</SelectItem>
                                  <SelectItem value="FORM-003">Natural Gas Combustion</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Emission Factors</Label>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => toast('EF selector modal would open')}
                              >
                                Select EFs ({stage.emissionFactorIds.length})
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {stages.length === 0 && (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                        No {templateType === 'sub-product' ? 'stages' : 'activities'} defined yet.
                        <br />
                        Click "Add {templateType === 'sub-product' ? 'Stage' : 'Activity'}" to get started.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Template</Button>
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Templates ({templates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>UID</TableHead>
                <TableHead>Template Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stages/Activities</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Last Edited</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.uid}>
                  <TableCell className="font-mono text-sm">{template.uid}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {template.locked && <Lock className="h-3 w-3 text-gray-400" />}
                      {template.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.type === 'sub-product' ? 'default' : 'secondary'}>
                      {template.type === 'sub-product' ? (
                        <Package className="h-3 w-3 mr-1" />
                      ) : (
                        <Building className="h-3 w-3 mr-1" />
                      )}
                      {template.type === 'sub-product' ? 'Sub-product' : 'Business Unit'}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.stages.length}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {template.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{template.lastEdited}</TableCell>
                  <TableCell>
                    <Badge variant={template.locked ? 'secondary' : 'default'}>
                      {template.locked ? 'Locked' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => toast('Template detail view would open')}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toast('Delete confirmation required')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}