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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { UserAuditLog } from '../../types';
import { 
  Search, 
  FileText, 
  Download,
  Filter,
  Calendar,
  User,
  Activity,
  Shield,
  AlertCircle
} from 'lucide-react';

const mockAuditLogs: UserAuditLog[] = [
  {
    id: '1',
    timestamp: '2024-11-12 14:30:45',
    performedBy: 'admin@greenmanufacturing.com',
    action: 'User Created',
    userId: '12',
    userEmail: 'john.doe@greenmanufacturing.com',
    details: 'Created new SA user account with email john.doe@greenmanufacturing.com'
  },
  {
    id: '2',
    timestamp: '2024-11-12 10:15:22',
    performedBy: 'admin@greenmanufacturing.com',
    action: 'Password Reset',
    userId: '8',
    userEmail: 'jane.smith@greenmanufacturing.com',
    details: 'Reset password for user jane.smith@greenmanufacturing.com - temporary password sent via email'
  },
  {
    id: '3',
    timestamp: '2024-11-11 16:45:10',
    performedBy: 'admin@greenmanufacturing.com',
    action: 'User Disabled',
    userId: '5',
    userEmail: 'old.user@greenmanufacturing.com',
    details: 'Disabled user account old.user@greenmanufacturing.com - employee left organization'
  },
  {
    id: '4',
    timestamp: '2024-11-11 09:20:33',
    performedBy: 'admin@greenmanufacturing.com',
    action: 'User Activated',
    userId: '11',
    userEmail: 'new.user@greenmanufacturing.com',
    details: 'Activated previously disabled user account new.user@greenmanufacturing.com'
  },
  {
    id: '5',
    timestamp: '2024-11-10 13:55:17',
    performedBy: 'admin@greenmanufacturing.com',
    action: 'User Updated',
    userId: '3',
    userEmail: 'emily.rodriguez@greenmanufacturing.com',
    details: 'Updated user details - changed email from e.rodriguez@greenmanufacturing.com to emily.rodriguez@greenmanufacturing.com'
  },
  {
    id: '6',
    timestamp: '2024-11-10 11:30:50',
    performedBy: 'admin@greenmanufacturing.com',
    action: 'User Created',
    userId: '10',
    userEmail: 'david.kim@greenmanufacturing.com',
    details: 'Created new Customer User account with email david.kim@greenmanufacturing.com'
  },
  {
    id: '7',
    timestamp: '2024-11-09 15:22:41',
    performedBy: 'admin@greenmanufacturing.com',
    action: 'Password Reset',
    userId: '7',
    userEmail: 'michael.chen@greenmanufacturing.com',
    details: 'Reset password for user michael.chen@greenmanufacturing.com at user request'
  },
  {
    id: '8',
    timestamp: '2024-11-09 08:45:12',
    performedBy: 'admin@greenmanufacturing.com',
    action: 'User Created',
    userId: '9',
    userEmail: 'sarah.johnson@greenmanufacturing.com',
    details: 'Created new SA user account with email sarah.johnson@greenmanufacturing.com'
  },
  {
    id: '9',
    timestamp: '2024-11-08 14:10:28',
    performedBy: 'admin@greenmanufacturing.com',
    action: 'User Disabled',
    userId: '4',
    userEmail: 'temp.contractor@greenmanufacturing.com',
    details: 'Disabled temporary contractor account temp.contractor@greenmanufacturing.com - contract ended'
  },
  {
    id: '10',
    timestamp: '2024-11-08 10:05:55',
    performedBy: 'admin@greenmanufacturing.com',
    action: 'User Updated',
    userId: '6',
    userEmail: 'lisa.thompson@greenmanufacturing.com',
    details: 'Updated user role from Customer User to SA'
  }
];

export function AuditLogs() {
  const [logs, setLogs] = useState<UserAuditLog[]>(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | UserAuditLog['action']>('all');

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  // Statistics
  const stats = {
    total: logs.length,
    created: logs.filter(l => l.action === 'User Created').length,
    disabled: logs.filter(l => l.action === 'User Disabled').length,
    activated: logs.filter(l => l.action === 'User Activated').length,
    updated: logs.filter(l => l.action === 'User Updated').length,
    passwordReset: logs.filter(l => l.action === 'Password Reset').length
  };

  const getActionBadge = (action: UserAuditLog['action']) => {
    switch (action) {
      case 'User Created':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Created</Badge>;
      case 'User Disabled':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Disabled</Badge>;
      case 'User Activated':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Activated</Badge>;
      case 'User Updated':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Updated</Badge>;
      case 'Password Reset':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Password Reset</Badge>;
    }
  };

  const getActionIcon = (action: UserAuditLog['action']) => {
    switch (action) {
      case 'User Created':
        return <User className="h-4 w-4 text-green-600" />;
      case 'User Disabled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'User Activated':
        return <Shield className="h-4 w-4 text-emerald-600" />;
      case 'User Updated':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'Password Reset':
        return <FileText className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-emerald-900 mb-2">Audit Logs</h1>
          <p className="text-emerald-700">Track all administrative actions and user account changes</p>
        </div>
        <Button
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-emerald-700">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-emerald-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-green-700">Users Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-900">{stats.created}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-red-700">Users Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-900">{stats.disabled}</div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-emerald-700">Users Activated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-emerald-900">{stats.activated}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-blue-700">Users Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{stats.updated}</div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-amber-700">Password Resets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-amber-900">{stats.passwordReset}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-emerald-200 bg-white/80 backdrop-blur">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                <Input
                  placeholder="Search by email, user, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-emerald-200 focus:border-emerald-500"
                />
              </div>
            </div>

            <Select value={actionFilter} onValueChange={(value: any) => setActionFilter(value)}>
              <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="User Created">User Created</SelectItem>
                <SelectItem value="User Disabled">User Disabled</SelectItem>
                <SelectItem value="User Activated">User Activated</SelectItem>
                <SelectItem value="User Updated">User Updated</SelectItem>
                <SelectItem value="Password Reset">Password Reset</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="border-emerald-200 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-emerald-900">Activity Log</CardTitle>
              <CardDescription className="text-emerald-700">
                {filteredLogs.length} log entr{filteredLogs.length !== 1 ? 'ies' : 'y'} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-emerald-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-50 hover:to-green-50">
                  <TableHead className="text-emerald-900 w-[180px]">Timestamp</TableHead>
                  <TableHead className="text-emerald-900">Action</TableHead>
                  <TableHead className="text-emerald-900">User Email</TableHead>
                  <TableHead className="text-emerald-900">Performed By</TableHead>
                  <TableHead className="text-emerald-900">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-emerald-50/50">
                    <TableCell className="text-emerald-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-emerald-500" />
                        {log.timestamp}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        {getActionBadge(log.action)}
                      </div>
                    </TableCell>
                    <TableCell className="text-emerald-700">{log.userEmail}</TableCell>
                    <TableCell className="text-emerald-700">{log.performedBy}</TableCell>
                    <TableCell className="text-emerald-600 text-sm">{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 mb-1">Audit Log Retention</p>
              <p className="text-xs text-blue-700">
                All administrative actions are automatically logged and retained for compliance purposes. 
                Logs are stored securely and can be exported at any time for reporting or auditing requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
