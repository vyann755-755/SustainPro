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
import { Plus, Upload, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SubProduct {
  uid: string;
  name: string;
  impactCategory: string;
  functionalUnit: string;
  value: number;
  referenceName: string;
  tags: string[];
  country: string;
  region: string;
  year: number;
  description: string;
}

const mockSubProducts: SubProduct[] = [
  {
    uid: 'SP-001',
    name: 'Recycled Aluminum Sheet',
    impactCategory: 'Climate Change',
    functionalUnit: 'kg',
    value: 1.81,
    referenceName: 'IDEMAT-2023',
    tags: ['aluminum', 'recycled', 'materials'],
    country: 'Global',
    region: 'Global',
    year: 2023,
    description: 'Impact assessment for recycled aluminum sheet production'
  },
  {
    uid: 'SP-002',
    name: 'Cotton Fabric Production',
    impactCategory: 'Climate Change',
    functionalUnit: 'm2',
    value: 5.89,
    referenceName: 'Ecoinvent-v3.9',
    tags: ['cotton', 'textile', 'organic'],
    country: 'India',
    region: 'Asia',
    year: 2023,
    description: 'Life cycle assessment of organic cotton fabric production'
  },
  {
    uid: 'SP-003',
    name: 'Ocean Freight Transport',
    impactCategory: 'Climate Change',
    functionalUnit: 'tkm',
    value: 0.0103,
    referenceName: 'IMO-2022',
    tags: ['transport', 'ocean', 'freight'],
    country: 'Global',
    region: 'Global',
    year: 2022,
    description: 'CO2 emissions from ocean freight transportation per tonne-kilometer'
  }
];

export function SubProductManager() {
  const [subProducts, setSubProducts] = useState(mockSubProducts);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');

  const filteredSubProducts = subProducts.filter(sp => {
    const matchesSearch = sp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sp.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || sp.country === selectedCountry;
    
    return matchesSearch && matchesCountry;
  });

  const handleCreateSubProduct = (formData: FormData) => {
    const newSubProduct: SubProduct = {
      uid: `SP-${String(Date.now()).slice(-3).padStart(3, '0')}`,
      name: formData.get('name') as string,
      impactCategory: formData.get('impactCategory') as string,
      functionalUnit: formData.get('functionalUnit') as string,
      value: parseFloat(formData.get('value') as string),
      referenceName: formData.get('referenceName') as string,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
      country: formData.get('country') as string,
      region: formData.get('region') as string,
      year: parseInt(formData.get('year') as string),
      description: formData.get('description') as string
    };

    setSubProducts(prev => [...prev, newSubProduct]);
    setIsCreateDialogOpen(false);
    toast(`Sub-product created — UID ${newSubProduct.uid}`);
  };

  const handleBulkUpload = () => {
    toast('Bulk upload template downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sub-products Master Database</h2>
          <p className="text-gray-600">Manage sub-products and their environmental impact data</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleBulkUpload} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Sub-product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Sub-product</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateSubProduct(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Object Name *</Label>
                    <Input id="name" name="name" required placeholder="e.g., Recycled Aluminum Sheet" />
                  </div>
                  <div>
                    <Label htmlFor="impactCategory">Impact Category *</Label>
                    <Select name="impactCategory" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Climate Change">Climate Change</SelectItem>
                        <SelectItem value="Ozone Depletion">Ozone Depletion</SelectItem>
                        <SelectItem value="Acidification">Acidification</SelectItem>
                        <SelectItem value="Eutrophication">Eutrophication</SelectItem>
                        <SelectItem value="Water Use">Water Use</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                        <SelectItem value="tkm">tkm</SelectItem>
                        <SelectItem value="piece">piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">Value *</Label>
                    <Input id="value" name="value" type="number" step="0.001" required placeholder="1.81" />
                  </div>
                  <div>
                    <Label htmlFor="referenceName">Reference Name</Label>
                    <Input id="referenceName" name="referenceName" placeholder="e.g., IDEMAT-2023" />
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
                        <SelectItem value="China">China</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input id="region" name="region" placeholder="Auto-filled based on country" />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" name="year" type="number" placeholder="2024" defaultValue="2024" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" name="tags" placeholder="aluminum, recycled, materials" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Detailed description of the sub-product..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Sub-product</Button>
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
              <Input
                placeholder="Search by name or UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="Global">Global</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="China">China</SelectItem>
                <SelectItem value="India">India</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sub-products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sub-products ({filteredSubProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>UID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Impact Category</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubProducts.map((sp) => (
                <TableRow key={sp.uid}>
                  <TableCell className="font-mono text-sm">{sp.uid}</TableCell>
                  <TableCell className="font-medium">{sp.name}</TableCell>
                  <TableCell>{sp.impactCategory}</TableCell>
                  <TableCell>
                    {sp.value} <span className="text-gray-500">{sp.functionalUnit}</span>
                  </TableCell>
                  <TableCell>{sp.country}</TableCell>
                  <TableCell>{sp.year}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {sp.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => toast('Edit sub-product modal would open')}>
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