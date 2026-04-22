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
} from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { User } from '../../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Power, 
  PowerOff, 
  KeyRound,
  Users,
  UserCheck,
  UserX,
  Shield,
  User as UserIcon,
  Filter,
  Download,
  Mail
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@greenmanufacturing.com',
    role: 'SA',
    status: 'Active',
    createdAt: '2024-01-15',
    createdBy: 'Admin User',
    lastLogin: '2024-11-10',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@greenmanufacturing.com',
    role: 'SA',
    status: 'Active',
    createdAt: '2024-02-01',
    createdBy: 'Admin User',
    lastLogin: '2024-11-11',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-03-10',
    createdBy: 'Sarah Johnson',
    lastLogin: '2024-11-09',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-11-01',
    createdBy: 'Sarah Johnson',
    lastLogin: '2024-11-12',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Thompson',
    email: 'lisa.thompson@greenmanufacturing.com',
    role: 'SA',
    status: 'Disabled',
    createdAt: '2024-01-20',
    createdBy: 'Admin User',
    lastLogin: '2024-09-15',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '6',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jennifer.martinez@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-03-15',
    createdBy: 'Sarah Johnson',
    lastLogin: '2024-11-13',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '7',
    firstName: 'Robert',
    lastName: 'Brown',
    email: 'robert.brown@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-03-20',
    createdBy: 'Sarah Johnson',
    lastLogin: '2024-11-11',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '8',
    firstName: 'Sophia',
    lastName: 'Lee',
    email: 'sophia.lee@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-04-05',
    createdBy: 'Michael Chen',
    lastLogin: '2024-11-12',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '9',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-04-12',
    createdBy: 'Sarah Johnson',
    lastLogin: '2024-11-14',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '10',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-04-18',
    createdBy: 'Michael Chen',
    lastLogin: '2024-11-10',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '11',
    firstName: 'Thomas',
    lastName: 'Anderson',
    email: 'thomas.anderson@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-05-02',
    createdBy: 'Sarah Johnson',
    lastLogin: '2024-11-13',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '12',
    firstName: 'Yuki',
    lastName: 'Tanaka',
    email: 'yuki.tanaka@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-05-10',
    createdBy: 'Michael Chen',
    lastLogin: '2024-11-09',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '13',
    firstName: 'Oliver',
    lastName: 'Schmidt',
    email: 'oliver.schmidt@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-05-15',
    createdBy: 'Sarah Johnson',
    lastLogin: '2024-11-12',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '14',
    firstName: 'Isabella',
    lastName: 'Santos',
    email: 'isabella.santos@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-05-22',
    createdBy: 'Michael Chen',
    lastLogin: '2024-11-11',
    clientAccountId: 'CA-2024-001'
  },
  {
    id: '15',
    firstName: 'Lucas',
    lastName: 'Moreau',
    email: 'lucas.moreau@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-06-01',
    createdBy: 'Sarah Johnson',
    lastLogin: '2024-11-10',
    clientAccountId: 'CA-2024-001'
  }
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'SA' | 'Customer User'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Disabled'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Customer User' as 'SA' | 'Customer User'
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    disabled: users.filter(u => u.status === 'Disabled').length,
    sa: users.filter(u => u.role === 'SA').length,
    customer: users.filter(u => u.role === 'Customer User').length
  };

  const handleCreateUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const user: User = {
      id: String(users.length + 1),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Current Admin User',
      clientAccountId: 'CA-2024-001'
    };

    setUsers([...users, user]);
    setIsCreateDialogOpen(false);
    setNewUser({ firstName: '', lastName: '', email: '', role: 'Customer User' });
    
    toast.success('User created successfully', {
      description: `An activation email has been sent to ${user.email}`
    });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    
    toast.success('User updated successfully');
  };

  const handleDisableUser = (user: User) => {
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, status: 'Disabled' as const } : u
    ));
    toast.success(`User ${user.email} has been disabled`);
  };

  const handleActivateUser = (user: User) => {
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, status: 'Active' as const } : u
    ));
    toast.success(`User ${user.email} has been activated`);
  };

  const handleResetPassword = (user: User) => {
    toast.success('Password reset email sent', {
      description: `A temporary password has been sent to ${user.email}`
    });
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'Disabled':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Disabled</Badge>;
      case 'Pending Activation':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Pending</Badge>;
    }
  };

  const getRoleBadge = (role: User['role']) => {
    return role === 'SA' ? (
      <Badge className="bg-teal-100 text-teal-800 border-teal-300">
        <Shield className="h-3 w-3 mr-1" />
        SA
      </Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
        <UserIcon className="h-3 w-3 mr-1" />
        Customer User
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-emerald-900 mb-2">User Management</h1>
          <p className="text-emerald-700">Manage Sustainability Architects and Customer Users in your organization</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-emerald-700">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-emerald-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-green-700">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-900">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-red-700">Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-900">{stats.disabled}</div>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-teal-700">SA Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-teal-900">{stats.sa}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-blue-700">Customer Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{stats.customer}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-emerald-200 bg-white/80 backdrop-blur">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-emerald-200 focus:border-emerald-500"
                />
              </div>
            </div>

            <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
              <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="SA">Sustainability Architect</SelectItem>
                <SelectItem value="Customer User">Customer User</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-emerald-200 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-emerald-900">Users</CardTitle>
              <CardDescription className="text-emerald-700">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-emerald-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-50 hover:to-green-50">
                  <TableHead className="text-emerald-900">Name</TableHead>
                  <TableHead className="text-emerald-900">Email</TableHead>
                  <TableHead className="text-emerald-900">Role</TableHead>
                  <TableHead className="text-emerald-900">Status</TableHead>
                  <TableHead className="text-emerald-900">Created</TableHead>
                  <TableHead className="text-emerald-900">Last Login</TableHead>
                  <TableHead className="text-emerald-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-emerald-50/50">
                    <TableCell className="text-emerald-900">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="text-emerald-700">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-emerald-700">{user.createdAt}</TableCell>
                    <TableCell className="text-emerald-700">{user.lastLogin || 'Never'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                          className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        {user.status === 'Active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisableUser(user)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <PowerOff className="h-4 w-4" />
                          </Button>
                        ) : user.status === 'Disabled' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivateUser(user)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        ) : null}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(user)}
                          className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="border-emerald-200">
          <DialogHeader>
            <DialogTitle className="text-emerald-900">Create New User</DialogTitle>
            <DialogDescription className="text-emerald-700">
              Add a new Sustainability Architect or Customer User to your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-emerald-900">First Name *</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  className="border-emerald-200 focus:border-emerald-500"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-emerald-900">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  className="border-emerald-200 focus:border-emerald-500"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-emerald-900">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="border-emerald-200 focus:border-emerald-500"
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-emerald-900">Role *</Label>
              <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SA">Sustainability Architect</SelectItem>
                  <SelectItem value="Customer User">Customer User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-emerald-600 mt-0.5" />
                <p className="text-xs text-emerald-800">
                  An account activation email will be automatically sent to the user's email address.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-emerald-200">
          <DialogHeader>
            <DialogTitle className="text-emerald-900">Edit User</DialogTitle>
            <DialogDescription className="text-emerald-700">
              Update user information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName" className="text-emerald-900">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName" className="text-emerald-900">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail" className="text-emerald-900">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole" className="text-emerald-900">Role</Label>
                <Select value={selectedUser.role} onValueChange={(value: any) => setSelectedUser({ ...selectedUser, role: value })}>
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SA">Sustainability Architect</SelectItem>
                    <SelectItem value="Customer User">Customer User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
              }}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditUser}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}