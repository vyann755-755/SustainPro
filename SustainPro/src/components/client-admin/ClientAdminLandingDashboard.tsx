import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Users, 
  UserCheck, 
  Shield,
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface ClientAdminLandingDashboardProps {
  username: string;
}

const allUsers = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@greenmanufacturing.com',
    role: 'SA',
    status: 'Active',
    createdAt: '2024-01-15',
    modifiedAt: '2024-10-20'
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@greenmanufacturing.com',
    role: 'SA',
    status: 'Active',
    createdAt: '2024-02-01',
    modifiedAt: '2024-11-05'
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-03-10',
    modifiedAt: '2024-11-08'
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-11-01',
    modifiedAt: '2024-11-01'
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Thompson',
    email: 'lisa.thompson@greenmanufacturing.com',
    role: 'SA',
    status: 'Disabled',
    createdAt: '2024-01-20',
    modifiedAt: '2024-10-15'
  },
  {
    id: '6',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-04-15',
    modifiedAt: '2024-11-10'
  },
  {
    id: '7',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@greenmanufacturing.com',
    role: 'SA',
    status: 'Active',
    createdAt: '2024-05-20',
    modifiedAt: '2024-11-11'
  },
  {
    id: '8',
    firstName: 'Robert',
    lastName: 'Brown',
    email: 'robert.brown@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-06-10',
    modifiedAt: '2024-11-09'
  },
  {
    id: '9',
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'jennifer.davis@greenmanufacturing.com',
    role: 'Customer User',
    status: 'Active',
    createdAt: '2024-11-05',
    modifiedAt: '2024-11-05'
  },
  {
    id: '10',
    firstName: 'William',
    lastName: 'Martinez',
    email: 'william.martinez@greenmanufacturing.com',
    role: 'SA',
    status: 'Disabled',
    createdAt: '2024-03-01',
    modifiedAt: '2024-09-20'
  }
];

export function ClientAdminLandingDashboard({ username }: ClientAdminLandingDashboardProps) {
  const stats = {
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter(u => u.status === 'Active').length,
    sustainabilityArchitects: allUsers.filter(u => u.role === 'SA').length,
    customerUsers: allUsers.filter(u => u.role === 'Customer User').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'Disabled':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Disabled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
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
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 opacity-20">
          <Shield className="h-48 w-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-3xl">
              Welcome back, {username}!
            </h1>
          </div>
          <p className="text-emerald-50 text-lg">
            Client Admin Dashboard - Manage your organization's user accounts and access
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-emerald-800">Total Users</CardTitle>
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-emerald-900">{stats.totalUsers}</div>
            <p className="text-xs text-emerald-600 mt-1">All users in organization</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-green-800">Active Users</CardTitle>
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-900">{stats.activeUsers}</div>
            <p className="text-xs text-green-600 mt-1">Currently active accounts</p>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-teal-800">Sustainability Architects</CardTitle>
              <Shield className="h-5 w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-teal-900">{stats.sustainabilityArchitects}</div>
            <p className="text-xs text-teal-600 mt-1">SA role users</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-cyan-800">Customer Users</CardTitle>
              <Users className="h-5 w-5 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-cyan-900">{stats.customerUsers}</div>
            <p className="text-xs text-cyan-600 mt-1">Customer role users</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Summary Table */}
      <Card className="border-emerald-200 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-emerald-900">All Users Summary</CardTitle>
              <p className="text-sm text-emerald-700 mt-1">
                Complete overview of all user accounts in your organization
              </p>
            </div>
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
                  <TableHead className="text-emerald-900">Created Date</TableHead>
                  <TableHead className="text-emerald-900">Modified Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-emerald-50/50">
                    <TableCell className="text-emerald-900">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="text-emerald-700">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-emerald-700">{user.createdAt}</TableCell>
                    <TableCell className="text-emerald-700">{user.modifiedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}