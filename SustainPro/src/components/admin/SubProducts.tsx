import React, { useState } from 'react';
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
import { SubProduct } from '../../types';
import { Plus, Upload, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const mockSubProducts: SubProduct[] = [
  {
    id: '1',
    name: 'Steel Production - Basic',
    impactCategory: 'GWP-100',
    functionalUnit: 'kg steel',
    value: 2.1,
    referenceName: 'SP-Steel-001',
    tags: ['steel', 'materials', 'primary'],
    description: 'Basic steel production from iron ore',
    country: 'Global',
    region: 'Global',
    year: 2024,
    status: 'active'
  },
  {
    id: '2',
    name: 'Plastic Packaging - PET',
    impactCategory: 'GWP-100',
    functionalUnit: 'kg PET',
    value: 3.4,
    referenceName: 'SP-PET-001',
    tags: ['plastic', 'packaging', 'petroleum'],
    description: 'PET plastic production for packaging applications',
    country: 'United States',
    region: 'North America',
    year: 2024,
    status: 'active'
  }
];

const countries = ['Global', 'United States', 'United Kingdom', 'Germany', 'France', 'Canada'];
const categories = ['GWP-100', 'GWP-20', 'AP', 'EP', 'ODP', 'POCP'];
const functionalUnits = ['kg', 'L', 'm²', 'm³', 'MJ', 'tkm', 'piece'];

export function SubProducts() {
  const [subProducts, setSubProducts] = useState<SubProduct[]>(mockSubProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    impactCategory: '',
    functionalUnit: '',
    value: '',
    referenceName: '',
    tags: [] as string[],
    description: '',
    country: '',
    year: new Date().getFullYear()
  });

  const filteredSubProducts = subProducts.filter(sp => {
    const matchesSearch = sp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sp.referenceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || !selectedCountry || sp.country === selectedCountry;
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || sp.impactCategory === selectedCategory;
    
    return matchesSearch && matchesCountry && matchesCategory;
  });

  const handleCreate = () => {
    const newSubProduct: SubProduct = {
      id: Date.now().toString(),
      name: formData.name,
      impactCategory: formData.impactCategory,
      functionalUnit: formData.functionalUnit,
      value: parseFloat(formData.value),
      referenceName: formData.referenceName || `SP-${Date.now().toString().slice(-6)}`,
      tags: formData.tags,
      description: formData.description,
      country: formData.country,
      region: formData.country === 'Global' ? 'Global' : 'Regional',
      year: formData.year,
      status: 'active'
    };
    
    setSubProducts([...subProducts, newSubProduct]);
    setIsCreateDialogOpen(false);
    setFormData({
      name: '',
      impactCategory: '',
      functionalUnit: '',
      value: '',
      referenceName: '',
      tags: [],
      description: '',
      country: '',
      year: new Date().getFullYear()
    });
    
    toast.success(`Sub-product created: ${newSubProduct.referenceName}`);
  };

  const handleDelete = (subProduct: SubProduct) => {
    const hasDependencies = Math.random() > 0.6;
    
    if (hasDependencies) {
      toast.error(`Cannot delete ${subProduct.referenceName} — used in 3 products and 1 template`);
      return;
    }
    
    setSubProducts(subProducts.filter(sp => sp.id !== subProduct.id));
    toast.success(`Sub-product ${subProduct.referenceName} deleted successfully`);
  };

  const handleBulkUpload = () => {
    toast.success('Bulk upload completed: 12 inserted, 2 updated, 1 skipped');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Sub-products</h1>
          <p className="text-gray-600">Manage sub-product master database</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBulkUpload}>
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
                <DialogTitle>Create Sub-product</DialogTitle>
                <DialogDescription>
                  Add a new sub-product to the master database
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Object Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Steel Production - Basic"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Name</Label>
                  <Input
                    id="reference"
                    value={formData.referenceName}
                    onChange={(e) => setFormData({...formData, referenceName: e.target.value})}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="impact-category">Impact Category *</Label>
                  <Select value={formData.impactCategory} onValueChange={(value) => setFormData({...formData, impactCategory: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="functional-unit">Functional Unit *</Label>
                  <Select value={formData.functionalUnit} onValueChange={(value) => setFormData({...formData, functionalUnit: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {functionalUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    })}
                    placeholder="e.g. steel, materials, primary"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed description of the sub-product..."
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>
                  Save Sub-product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map(country => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Impact Category</TableHead>
              <TableHead>Functional Unit</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubProducts.map((sp) => (
              <TableRow key={sp.id}>
                <TableCell className="font-mono text-sm">{sp.referenceName}</TableCell>
                <TableCell className="font-medium">{sp.name}</TableCell>
                <TableCell>{sp.impactCategory}</TableCell>
                <TableCell>{sp.functionalUnit}</TableCell>
                <TableCell>{sp.value}</TableCell>
                <TableCell>{sp.country}</TableCell>
                <TableCell>{sp.year}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {sp.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {sp.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{sp.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={sp.status === 'active' ? 'default' : 'secondary'}
                  >
                    {sp.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(sp)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}