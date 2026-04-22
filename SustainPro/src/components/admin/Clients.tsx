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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { Client } from '../../types';
import { Plus, Users, Settings, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const mockClients: Client[] = [
  {
    id: '1',
    customerAccountId: 'CA-2024-001',
    companyName: 'Green Manufacturing Inc.',
    region: 'North America',
    adminName: 'Sarah Johnson',
    adminEmail: 'sarah.johnson@greenmanufacturing.com',
    status: 'active',
    createdAt: '2024-01-15',
    quotas: {
      subProducts: 100,
      products: 50,
      businessUnits: 25,
      activitiesPerBU: 20,
      reportsPerMonth: 100,
      customerAccounts: 10
    },
    usage: {
      subProducts: 45,
      products: 12,
      businessUnits: 8,
      customerAccounts: 4,
      reportsThisMonth: 15
    }
  },
  {
    id: '2',
    customerAccountId: 'CA-2024-002',
    companyName: 'Sustainable Tech Solutions',
    region: 'Europe',
    adminName: 'Marcus Weber',
    adminEmail: 'marcus.weber@sustainabletech.eu',
    status: 'active',
    createdAt: '2024-01-10',
    quotas: {
      subProducts: 75,
      products: 30,
      businessUnits: 15,
      activitiesPerBU: 15,
      reportsPerMonth: 50,
      customerAccounts: 5
    },
    usage: {
      subProducts: 23,
      products: 8,
      businessUnits: 3,
      customerAccounts: 2,
      reportsThisMonth: 8
    }
  }
];

const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'];

export function Clients() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isQuotaDialogOpen, setIsQuotaDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    region: '',
    adminName: '',
    adminEmail: '',
    enableApiAccess: false,
    autoGeneratePassword: true,
    initialPassword: ''
  });

  const [quotaData, setQuotaData] = useState({
    subProducts: 100,
    products: 50,
    businessUnits: 25,
    activitiesPerBU: 20,
    reportsPerMonth: 100,
    customerAccounts: 10
  });

  const generateCustomerAccountId = () => {
    const year = new Date().getFullYear();
    const nextNumber = clients.length + 1;
    return `CA-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const handleCreate = () => {
    const newClient: Client = {
      id: Date.now().toString(),
      customerAccountId: generateCustomerAccountId(),
      companyName: formData.companyName,
      region: formData.region,
      adminName: formData.adminName,
      adminEmail: formData.adminEmail,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      quotas: quotaData,
      usage: {
        subProducts: 0,
        products: 0,
        businessUnits: 0,
        customerAccounts: 0,
        reportsThisMonth: 0
      }
    };
    
    setClients([...clients, newClient]);
    setIsCreateDialogOpen(false);
    setFormData({
      companyName: '',
      region: '',
      adminName: '',
      adminEmail: '',
      enableApiAccess: false,
      autoGeneratePassword: true,
      initialPassword: ''
    });
    
    toast.success(`Client created and invitation sent to ${formData.adminEmail}`);
  };

  const handleResetPassword = (client: Client) => {
    toast.success(`Password reset email sent to ${client.adminEmail}`);
  };

  const handleDisableClient = (client: Client) => {
    const updatedClients = clients.map(c => 
      c.id === client.id ? {...c, status: c.status === 'active' ? 'inactive' : 'active'} : c
    );
    setClients(updatedClients);
    toast.success(`Client ${client.status === 'active' ? 'disabled' : 'enabled'} successfully`);
  };

  const handleDeleteClient = (client: Client) => {
    setClients(clients.filter(c => c.id !== client.id));
    toast.success(`Client ${client.companyName} deleted permanently`);
  };

  const openQuotaDialog = (client: Client) => {
    setSelectedClient(client);
    setQuotaData(client.quotas);
    setIsQuotaDialogOpen(true);
  };

  const handleUpdateQuotas = () => {
    if (!selectedClient) return;
    
    const updatedClients = clients.map(c => 
      c.id === selectedClient.id ? {...c, quotas: quotaData} : c
    );
    setClients(updatedClients);
    setIsQuotaDialogOpen(false);
    toast.success(`Quotas updated for ${selectedClient.companyName}`);
  };

  const getUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage client onboarding and accounts</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Client Onboarding</DialogTitle>
              <DialogDescription>
                Create a new client account and Admin user
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="company" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="company">Company Info</TabsTrigger>
                <TabsTrigger value="admin">Admin Contact</TabsTrigger>
                <TabsTrigger value="quotas">Quotas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="company" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    placeholder="e.g. Green Manufacturing Inc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Admin Name *</Label>
                  <Input
                    id="admin-name"
                    value={formData.adminName}
                    onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                    placeholder="e.g. Sarah Johnson"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email *</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                    placeholder="e.g. sarah.johnson@company.com"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-password"
                    checked={formData.autoGeneratePassword}
                    onCheckedChange={(checked) => setFormData({...formData, autoGeneratePassword: checked})}
                  />
                  <Label htmlFor="auto-password">Auto-generate password</Label>
                </div>
                
                {!formData.autoGeneratePassword && (
                  <div className="space-y-2">
                    <Label htmlFor="initial-password">Initial Password</Label>
                    <Input
                      id="initial-password"
                      type="password"
                      value={formData.initialPassword}
                      onChange={(e) => setFormData({...formData, initialPassword: e.target.value})}
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="api-access"
                    checked={formData.enableApiAccess}
                    onCheckedChange={(checked) => setFormData({...formData, enableApiAccess: checked})}
                  />
                  <Label htmlFor="api-access">Enable API access</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="quotas" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sub-products">Sub-products</Label>
                    <Input
                      id="sub-products"
                      type="number"
                      value={quotaData.subProducts}
                      onChange={(e) => setQuotaData({...quotaData, subProducts: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="products">Products</Label>
                    <Input
                      id="products"
                      type="number"
                      value={quotaData.products}
                      onChange={(e) => setQuotaData({...quotaData, products: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business-units">Business Units</Label>
                    <Input
                      id="business-units"
                      type="number"
                      value={quotaData.businessUnits}
                      onChange={(e) => setQuotaData({...quotaData, businessUnits: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="activities-per-bu">Activities per BU</Label>
                    <Input
                      id="activities-per-bu"
                      type="number"
                      value={quotaData.activitiesPerBU}
                      onChange={(e) => setQuotaData({...quotaData, activitiesPerBU: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reports-per-month">Reports per Month</Label>
                    <Input
                      id="reports-per-month"
                      type="number"
                      value={quotaData.reportsPerMonth}
                      onChange={(e) => setQuotaData({...quotaData, reportsPerMonth: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customer-accounts">Customer Accounts</Label>
                    <Input
                      id="customer-accounts"
                      type="number"
                      value={quotaData.customerAccounts}
                      onChange={(e) => setQuotaData({...quotaData, customerAccounts: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                Create & Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company / Account ID</TableHead>
              <TableHead>Admin Contact</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{client.companyName}</div>
                    <div className="text-sm text-gray-500">{client.customerAccountId}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{client.adminName}</div>
                    <div className="text-sm text-gray-500">{client.adminEmail}</div>
                  </div>
                </TableCell>
                <TableCell>{client.region}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      client.status === 'active' ? 'default' : 
                      client.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 w-32">
                    <div className="flex justify-between text-xs">
                      <span>Products</span>
                      <span>{client.usage.products}/{client.quotas.products}</span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(client.usage.products, client.quotas.products)} 
                      className="h-1"
                    />
                    <div className="flex justify-between text-xs">
                      <span>BUs</span>
                      <span>{client.usage.businessUnits}/{client.quotas.businessUnits}</span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(client.usage.businessUnits, client.quotas.businessUnits)} 
                      className="h-1"
                    />
                  </div>
                </TableCell>
                <TableCell>{client.createdAt}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openQuotaDialog(client)}
                      title="Quota Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleResetPassword(client)}
                      title="Reset Password"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDisableClient(client)}
                      title={client.status === 'active' ? 'Disable' : 'Enable'}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteClient(client)}
                      title="Delete"
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

      {/* Quota Dialog */}
      <Dialog open={isQuotaDialogOpen} onOpenChange={setIsQuotaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quota Settings</DialogTitle>
            <DialogDescription>
              Configure usage quotas for {selectedClient?.companyName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quota-sub-products">Sub-products</Label>
              <Input
                id="quota-sub-products"
                type="number"
                value={quotaData.subProducts}
                onChange={(e) => setQuotaData({...quotaData, subProducts: parseInt(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quota-products">Products</Label>
              <Input
                id="quota-products"
                type="number"
                value={quotaData.products}
                onChange={(e) => setQuotaData({...quotaData, products: parseInt(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quota-business-units">Business Units</Label>
              <Input
                id="quota-business-units"
                type="number"
                value={quotaData.businessUnits}
                onChange={(e) => setQuotaData({...quotaData, businessUnits: parseInt(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quota-activities">Activities per BU</Label>
              <Input
                id="quota-activities"
                type="number"
                value={quotaData.activitiesPerBU}
                onChange={(e) => setQuotaData({...quotaData, activitiesPerBU: parseInt(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quota-reports">Reports per Month</Label>
              <Input
                id="quota-reports"
                type="number"
                value={quotaData.reportsPerMonth}
                onChange={(e) => setQuotaData({...quotaData, reportsPerMonth: parseInt(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quota-customers">Customer Accounts</Label>
              <Input
                id="quota-customers"
                type="number"
                value={quotaData.customerAccounts}
                onChange={(e) => setQuotaData({...quotaData, customerAccounts: parseInt(e.target.value)})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuotaDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateQuotas}>
              Update Quotas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}