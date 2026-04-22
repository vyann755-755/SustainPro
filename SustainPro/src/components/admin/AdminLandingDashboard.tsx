import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Database,
  Calculator,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  FileText,
  Edit,
  Trash2,
  Plus,
  User,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface AdminLandingDashboardProps {
  username: string;
  onNavigate: (view: string) => void;
}

// Mock system log data
const mockSystemLogs = [
  {
    id: 1,
    timestamp: '2025-10-31 14:32:15',
    action: 'created',
    entity: 'Emission Factor',
    entityName: 'Electricity Grid - US Average',
    entityUID: 'EF-2025-1891',
    performedBy: 'admin@platform.com',
    details: 'Added new emission factor for US electricity grid',
    status: 'success',
    category: 'Master DB - EF'
  },
  {
    id: 2,
    timestamp: '2025-10-31 13:45:22',
    action: 'edited',
    entity: 'Formula',
    entityName: 'Vehicle Emissions Calculator',
    entityUID: 'FM-2024-0156',
    performedBy: 'admin@platform.com',
    details: 'Updated expression parameters for diesel fuel',
    status: 'success',
    category: 'Master DB - Formula'
  },
  {
    id: 3,
    timestamp: '2025-10-31 12:18:09',
    action: 'assigned',
    entity: 'Emission Factor',
    entityName: 'Natural Gas Combustion',
    entityUID: 'EF-2025-1753',
    performedBy: 'admin@platform.com',
    details: 'Assigned to client: Acme Manufacturing Corp',
    status: 'success',
    category: 'Master DB - EF'
  },
  {
    id: 4,
    timestamp: '2025-10-31 11:22:33',
    action: 'deleted',
    entity: 'Formula',
    entityName: 'Legacy Fuel Calculator v1.0',
    entityUID: 'FM-2023-0089',
    performedBy: 'admin@platform.com',
    details: 'Removed deprecated formula version',
    status: 'warning',
    category: 'Master DB - Formula'
  },
  {
    id: 5,
    timestamp: '2025-10-31 10:55:47',
    action: 'created',
    entity: 'Emission Factor',
    entityName: 'Renewable Energy - Solar PV',
    entityUID: 'EF-2025-1892',
    performedBy: 'admin@platform.com',
    details: 'Bulk upload: 15 regional solar EF values',
    status: 'success',
    category: 'Master DB - EF'
  },
  {
    id: 6,
    timestamp: '2025-10-31 09:33:12',
    action: 'edited',
    entity: 'Emission Factor',
    entityName: 'Aviation Fuel - Jet A1',
    entityUID: 'EF-2024-1205',
    performedBy: 'admin@platform.com',
    details: 'Updated GWP values based on IPCC AR6',
    status: 'success',
    category: 'Master DB - EF'
  },
  {
    id: 7,
    timestamp: '2025-10-31 08:47:25',
    action: 'created',
    entity: 'Formula',
    entityName: 'Scope 3 Employee Commute',
    entityUID: 'FM-2025-0214',
    performedBy: 'admin@platform.com',
    details: 'Created new formula with 3 expressions',
    status: 'success',
    category: 'Master DB - Formula'
  },
  {
    id: 8,
    timestamp: '2025-10-30 16:12:08',
    action: 'assigned',
    entity: 'Formula',
    entityName: 'Building Energy Consumption',
    entityUID: 'FM-2024-0178',
    performedBy: 'admin@platform.com',
    details: 'Assigned to 5 client organizations',
    status: 'success',
    category: 'Master DB - Formula'
  }
];

export function AdminLandingDashboard({ username, onNavigate }: AdminLandingDashboardProps) {
  // Calculate statistics
  const todayLogs = mockSystemLogs.filter(log => log.timestamp.startsWith('2025-10-31')).length;
  const efActions = mockSystemLogs.filter(log => log.entity === 'Emission Factor').length;
  const formulaActions = mockSystemLogs.filter(log => log.entity === 'Formula').length;
  
  const activitySummary = {
    created: mockSystemLogs.filter(log => log.action === 'created').length,
    edited: mockSystemLogs.filter(log => log.action === 'edited').length,
    assigned: mockSystemLogs.filter(log => log.action === 'assigned').length,
    deleted: mockSystemLogs.filter(log => log.action === 'deleted').length
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'edited':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'assigned':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'edited':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'assigned':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'deleted':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getEntityIcon = (entity: string) => {
    return entity === 'Emission Factor' 
      ? <Database className="h-4 w-4 text-emerald-600" /> 
      : <Calculator className="h-4 w-4 text-teal-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
        <div className="absolute top-0 right-0 opacity-20">
          <Shield className="h-64 w-64 -mr-20 -mt-20" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-10 w-10" />
            <h1 className="text-4xl">Welcome back, {username}!</h1>
          </div>
          <p className="text-emerald-100 text-lg mb-6">
            Platform Admin Dashboard - System Activity & Logs Overview
          </p>
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                <p className="text-sm opacity-90">Total Logs</p>
              </div>
              <p className="text-3xl">{mockSystemLogs.length}</p>
              <p className="text-xs opacity-75 mt-1">All time records</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5" />
                <p className="text-sm opacity-90">Today's Activity</p>
              </div>
              <p className="text-3xl">{todayLogs}</p>
              <p className="text-xs opacity-75 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +12% from yesterday
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5" />
                <p className="text-sm opacity-90">EF Actions</p>
              </div>
              <p className="text-3xl">{efActions}</p>
              <p className="text-xs opacity-75 mt-1">Recent modifications</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-5 w-5" />
                <p className="text-sm opacity-90">Formula Actions</p>
              </div>
              <p className="text-3xl">{formulaActions}</p>
              <p className="text-xs opacity-75 mt-1">Recent modifications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-900">
              <Plus className="h-5 w-5 text-green-600" />
              Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600 mb-1">{activitySummary.created}</div>
            <p className="text-xs text-green-700">New EFs & Formulas</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-blue-900">
              <Edit className="h-5 w-5 text-blue-600" />
              Edited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-blue-600 mb-1">{activitySummary.edited}</div>
            <p className="text-xs text-blue-700">Modified records</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-900">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-emerald-600 mb-1">{activitySummary.assigned}</div>
            <p className="text-xs text-emerald-700">To clients</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-900">
              <Trash2 className="h-5 w-5 text-red-600" />
              Deleted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-red-600 mb-1">{activitySummary.deleted}</div>
            <p className="text-xs text-red-700">Removed records</p>
          </CardContent>
        </Card>
      </div>

      {/* System Logs Table */}
      <Card className="border-2 border-emerald-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                System Activity Logs
              </CardTitle>
              <CardDescription className="mt-1">
                Platform admin activities for Master DB - Emission Factors & Formulas
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                onClick={() => onNavigate('system-logs')}
              >
                View All Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity Name</TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSystemLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {log.timestamp}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <Badge variant="outline" className={`text-xs ${getActionBadgeColor(log.action)}`}>
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entity)}
                        <span className="text-sm">{log.entity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        {log.entityName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-300 inline-block">
                        {log.entityUID}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        {log.performedBy}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {log.details}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.status === 'success' ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Warning
                        </Badge>
                      )}
                    </TableCell>
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
