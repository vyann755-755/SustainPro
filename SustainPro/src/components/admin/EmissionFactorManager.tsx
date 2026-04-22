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
import { Plus, Upload, Download, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EmissionFactor {
  uid: string;
  name: string;
  category: string;
  country: string;
  latestVersion: string;
  tags: string[];
  status: 'active' | 'draft' | 'deprecated';
  value: number;
  unit: string;
  year: number;
}

const mockEmissionFactors: EmissionFactor[] = [
  {
    uid: 'EF-000123',
    name: 'Electricity Grid Mix - US',
    category: 'Energy',
    country: 'United States',
    latestVersion: '2024.1',
    tags: ['electricity', 'grid', 'scope2'],
    status: 'active',
    value: 0.386,
    unit: 'kg CO2e/kWh',
    year: 2024
  },
  {
    uid: 'EF-000124',
    name: 'Natural Gas Combustion',
    category: 'Energy',
    country: 'Global',
    latestVersion: '2024.1',
    tags: ['natural-gas', 'combustion', 'scope1'],
    status: 'active',
    value: 0.202,
    unit: 'kg CO2e/kWh',
    year: 2024
  },
  {
    uid: 'EF-000125',
    name: 'Road Transport - Diesel',
    category: 'Transportation',
    country: 'European Union',
    latestVersion: '2023.2',
    tags: ['transport', 'diesel', 'scope1'],
    status: 'active',
    value: 0.267,
    unit: 'kg CO2e/km',
    year: 2023
  }
];

export function EmissionFactorManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [emissionFactors, setEmissionFactors] = useState(mockEmissionFactors);

  const filteredFactors = emissionFactors.filter(ef => {
    const matchesSearch = ef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ef.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || ef.country === selectedCountry;
    const matchesCategory = selectedCategory === 'all' || ef.category === selectedCategory;
    
    return matchesSearch && matchesCountry && matchesCategory;
  });

  const handleCreateEF = (formData: FormData) => {
    const newEF: EmissionFactor = {
      uid: `EF-${String(Date.now()).slice(-6).padStart(6, '0')}`,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      country: formData.get('country') as string,
      latestVersion: '1.0',
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
      status: 'active',
      value: parseFloat(formData.get('value') as string),
      unit: formData.get('unit') as string,
      year: parseInt(formData.get('year') as string)
    };

    setEmissionFactors(prev => [...prev, newEF]);
    setIsCreateDialogOpen(false);
    toast(`EF created — UID ${newEF.uid}`);
  };

  const handleBulkUpload = () => {
    toast('Bulk upload template downloaded');
  };

  const handleIntegrations = () => {
    toast('Opening integrations connector...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Emission Factors Master Database</h2>
          <p className="text-gray-600">Manage emission factors, versions, and integrations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleIntegrations} variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Integrations
          </Button>
          <Button onClick={handleBulkUpload} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add EF
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Emission Factor</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateEF(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">EF Name *</Label>
                    <Input id="name" name="name" required placeholder="e.g., Electricity Grid Mix - US" />
                  </div>
                  <div>
                    <Label htmlFor="category">Primary Category *</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Energy">Energy</SelectItem>
                        <SelectItem value="Transportation">Transportation</SelectItem>
                        <SelectItem value="Materials">Materials</SelectItem>
                        <SelectItem value="Waste">Waste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select name="country" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Global">Global</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="European Union">European Union</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" name="year" type="number" placeholder="2024" defaultValue="2024" />
                  </div>
                  <div>
                    <Label htmlFor="value">Value *</Label>
                    <Input id="value" name="value" type="number" step="0.001" required placeholder="0.386" />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit *</Label>
                    <Select name="unit" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg CO2e/kWh">kg CO2e/kWh</SelectItem>
                        <SelectItem value="kg CO2e/km">kg CO2e/km</SelectItem>
                        <SelectItem value="kg CO2e/kg">kg CO2e/kg</SelectItem>
                        <SelectItem value="kg CO2e/m3">kg CO2e/m3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" name="tags" placeholder="electricity, grid, scope2" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Detailed description of the emission factor..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create EF</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or UID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="Global">Global</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="European Union">European Union</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Materials">Materials</SelectItem>
                <SelectItem value="Waste">Waste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Emission Factors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Emission Factors ({filteredFactors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>UID</TableHead>
                <TableHead>EF Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Latest Version</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFactors.map((ef) => (
                <TableRow key={ef.uid}>
                  <TableCell className="font-mono text-sm">{ef.uid}</TableCell>
                  <TableCell className="font-medium">{ef.name}</TableCell>
                  <TableCell>{ef.category}</TableCell>
                  <TableCell>{ef.country}</TableCell>
                  <TableCell>{ef.latestVersion}</TableCell>
                  <TableCell>{ef.value} {ef.unit}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {ef.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ef.status === 'active' ? 'default' : 'secondary'}>
                      {ef.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => toast('Edit EF modal would open')}>
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