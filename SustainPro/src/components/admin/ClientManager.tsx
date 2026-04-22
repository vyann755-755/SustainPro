import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Plus, Users, Settings, Key, Database, Ban, UserX, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Client {
  id: string;
  companyName: string;
  region: string;
  saName: string;
  saEmail: string;
  status: 'active' | 'disabled';
  createdDate: string;
  quotas: {
    subProducts: { used: number; limit: number };
    products: { used: number; limit: number };
    businessUnits: { used: number; limit: number };
    reports: { used: number; limit: number };
    customerAccounts: { used: number; limit: number };
  };
}

const mockClients: Client[] = [
  {
    id: 'CLIENT-001',
    companyName: 'GreenTech Manufacturing',
    region: 'North America',
    saName: 'Sarah Johnson',
    saEmail: 'sarah.johnson@greentech.com',
    status: 'active',
    createdDate: '2024-01-15',
    quotas: {
      subProducts: { used: 45, limit: 100 },
      products: { used: 12, limit: 50 },
      businessUnits: { used: 8, limit: 20 },
      reports: { used: 23, limit: 100 },
      customerAccounts: { used: 5, limit: 10 }
    }
  },
  {
    id: 'CLIENT-002',
    companyName: 'Sustainable Solutions Inc',
    region: 'Europe',
    saName: 'Marco Rossi',
    saEmail: 'marco.rossi@sustain-solutions.eu',
    status: 'active',
    createdDate: '2024-01-10',
    quotas: {
      subProducts: { used: 78, limit: 150 },
      products: { used: 31, limit: 75 },
      businessUnits: { used: 15, limit: 30 },
      reports: { used: 67, limit: 200 },
      customerAccounts: { used: 12, limit: 25 }
    }
  },
  {
    id: 'CLIENT-003',
    companyName: 'EcoFriendly Corp',
    region: 'Asia Pacific',
    saName: 'Yuki Tanaka',
    saEmail: 'yuki.tanaka@ecofriendly.jp',
    status: 'disabled',
    createdDate: '2023-12-20',
    quotas: {
      subProducts: { used: 22, limit: 50 },
      products: { used: 8, limit: 25 },
      businessUnits: { used: 4, limit: 10 },
      reports: { used: 15, limit: 50 },
      customerAccounts: { used: 3, limit: 5 }
    }
  }
];

export function ClientManager() {
  const [clients, setClients] = useState(mockClients);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isQuotaDialogOpen, setIsQuotaDialogOpen] = useState(false);

  const handleCreateClient = (formData: FormData) => {
    const newClient: Client = {
      id: `CLIENT-${String(Date.now()).slice(-3).padStart(3, '0')}`,
      companyName: formData.get('companyName') as string,
      region: formData.get('region') as string,
      saName: formData.get('saName') as string,
      saEmail: formData.get('saEmail') as string,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      quotas: {
        subProducts: { used: 0, limit: 50 },
        products: { used: 0, limit: 25 },
        businessUnits: { used: 0, limit: 10 },
        reports: { used: 0, limit: 50 },
        customerAccounts: { used: 0, limit: 5 }
      }
    };

    setClients(prev => [...prev, newClient]);
    setIsCreateDialogOpen(false);
    toast(`Client created and invitation sent to ${newClient.saEmail}`);
  };

  const toggleClientStatus = (clientId: string) => {
    setClients(prev => prev.map(client => 
      client.id === clientId 
        ? { ...client, status: client.status === 'active' ? 'disabled' : 'active' }
        : client
    ));
    toast('Client status updated');
  };

  const openQuotaDialog = (client: Client) => {
    setSelectedClient(client);
    setIsQuotaDialogOpen(true);
  };

  const handleQuotaUpdate = (formData: FormData) => {
    if (!selectedClient) return;

    const updatedQuotas = {
      subProducts: { ...selectedClient.quotas.subProducts, limit: parseInt(formData.get('subProductsLimit') as string) },
      products: { ...selectedClient.quotas.products, limit: parseInt(formData.get('productsLimit') as string) },
      businessUnits: { ...selectedClient.quotas.businessUnits, limit: parseInt(formData.get('businessUnitsLimit') as string) },
      reports: { ...selectedClient.quotas.reports, limit: parseInt(formData.get('reportsLimit') as string) },
      customerAccounts: { ...selectedClient.quotas.customerAccounts, limit: parseInt(formData.get('customerAccountsLimit') as string) }
    };

    setClients(prev => prev.map(client => 
      client.id === selectedClient.id 
        ? { ...client, quotas: updatedQuotas }
        : client
    ));

    setIsQuotaDialogOpen(false);
    setSelectedClient(null);
    toast('Quotas updated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Client Management</h2>
          <p className="text-gray-600">Onboard clients, manage accounts, and configure quotas</p>
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
              <DialogTitle>Create New Client Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateClient(new FormData(e.currentTarget));
            }} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input id="companyName" name="companyName" required placeholder="e.g., GreenTech Manufacturing" />
                  </div>
                  <div>
                    <Label htmlFor="region">Region *</Label>
                    <Select name="region" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North America">North America</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                        <SelectItem value="Latin America">Latin America</SelectItem>
                        <SelectItem value="Africa">Africa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sustainability Architect Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="saName">SA Name *</Label>
                    <Input id="saName" name="saName" required placeholder="e.g., Sarah Johnson" />
                  </div>
                  <div>
                    <Label htmlFor="saEmail">SA Email *</Label>
                    <Input id="saEmail" name="saEmail" type="email" required placeholder="sarah.johnson@company.com" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="apiAccess" defaultChecked />
                  <Label htmlFor="apiAccess">Enable API access</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create & Send Invitation</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clients ({clients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>SA Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-mono text-sm">{client.id}</TableCell>
                  <TableCell className="font-medium">{client.companyName}</TableCell>
                  <TableCell>{client.region}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{client.saName}</div>
                      <div className="text-sm text-gray-500">{client.saEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div>Products: {client.quotas.products.used}/{client.quotas.products.limit}</div>
                      <div>BUs: {client.quotas.businessUnits.used}/{client.quotas.businessUnits.limit}</div>
                      <div>Users: {client.quotas.customerAccounts.used}/{client.quotas.customerAccounts.limit}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => openQuotaDialog(client)}
                        title="Manage Quotas"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => toast('Database assignment panel would open')}
                        title="Database Assignment"
                      >
                        <Database className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => toast('Reset password confirmation would appear')}
                        title="Reset Password"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => toast('Login as SA (requires admin confirmation)')}
                        title="Login as SA"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => toggleClientStatus(client.id)}
                        title={client.status === 'active' ? 'Disable' : 'Enable'}
                      >
                        {client.status === 'active' ? <Ban className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quota Management Dialog */}
      <Dialog open={isQuotaDialogOpen} onOpenChange={setIsQuotaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Manage Quotas - {selectedClient?.companyName}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleQuotaUpdate(new FormData(e.currentTarget));
            }} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subProductsLimit">Sub-products Limit</Label>
                    <Input 
                      id="subProductsLimit" 
                      name="subProductsLimit" 
                      type="number" 
                      defaultValue={selectedClient.quotas.subProducts.limit}
                    />
                    <p className="text-sm text-gray-500">
                      Current usage: {selectedClient.quotas.subProducts.used}
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="productsLimit">Products Limit</Label>
                    <Input 
                      id="productsLimit" 
                      name="productsLimit" 
                      type="number" 
                      defaultValue={selectedClient.quotas.products.limit}
                    />
                    <p className="text-sm text-gray-500">
                      Current usage: {selectedClient.quotas.products.used}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="businessUnitsLimit">Business Units Limit</Label>
                    <Input 
                      id="businessUnitsLimit" 
                      name="businessUnitsLimit" 
                      type="number" 
                      defaultValue={selectedClient.quotas.businessUnits.limit}
                    />
                    <p className="text-sm text-gray-500">
                      Current usage: {selectedClient.quotas.businessUnits.used}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reportsLimit">Reports per Month</Label>
                    <Input 
                      id="reportsLimit" 
                      name="reportsLimit" 
                      type="number" 
                      defaultValue={selectedClient.quotas.reports.limit}
                    />
                    <p className="text-sm text-gray-500">
                      Current usage: {selectedClient.quotas.reports.used}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="customerAccountsLimit">Customer Accounts</Label>
                    <Input 
                      id="customerAccountsLimit" 
                      name="customerAccountsLimit" 
                      type="number" 
                      defaultValue={selectedClient.quotas.customerAccounts.limit}
                    />
                    <p className="text-sm text-gray-500">
                      Current usage: {selectedClient.quotas.customerAccounts.used}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsQuotaDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Quotas</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}