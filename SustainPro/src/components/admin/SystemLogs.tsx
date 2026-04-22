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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { AuditLog } from '../../types';
import { Search, Download, Eye, Calendar, Filter } from 'lucide-react';

const mockLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-01-15T14:30:00Z',
    user: 'admin@platform.com',
    client: 'Green Manufacturing Inc.',
    action: 'create',
    entityType: 'emission-factor',
    entityId: 'EF-000123',
    beforeValues: null,
    afterValues: { name: 'Electricity Grid Mix - US', value: 0.4207 },
    traceId: 'trace-abc123'
  },
  {
    id: '2',
    timestamp: '2024-01-15T14:25:00Z',
    user: 'sarah.johnson@greenmanufacturing.com',
    action: 'update',
    entityType: 'sub-product',
    entityId: 'SP-Steel-001',
    beforeValues: { value: 2.0 },
    afterValues: { value: 2.1 },
    traceId: 'trace-def456'
  },
  {
    id: '3',
    timestamp: '2024-01-15T14:20:00Z',
    user: 'admin@platform.com',
    action: 'assign',
    entityType: 'emission-factor',
    entityId: 'EF-000124',
    client: 'Sustainable Tech Solutions',
    afterValues: { assigned: true },
    traceId: 'trace-ghi789'
  },
  {
    id: '4',
    timestamp: '2024-01-15T14:15:00Z',
    user: 'marcus.weber@sustainabletech.eu',
    action: 'create',
    entityType: 'project',
    entityId: 'PRJ-001',
    afterValues: { name: 'Q1 Carbon Assessment', type: 'BCA' },
    traceId: 'trace-jkl012'
  },
  {
    id: '5',
    timestamp: '2024-01-15T14:10:00Z',
    user: 'admin@platform.com',
    action: 'delete',
    entityType: 'template',
    entityId: 'TPL-OLD-001',
    beforeValues: { name: 'Deprecated Template', type: 'sub-product' },
    afterValues: null,
    traceId: 'trace-mno345'
  }
];

const actionTypes = ['create', 'update', 'delete', 'assign', 'sync'];
const entityTypes = ['emission-factor', 'formula', 'sub-product', 'template', 'client', 'project'];

export function SystemLogs() {
  const [logs, setLogs] = useState<AuditLog[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.traceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'all' || !selectedAction || log.action === selectedAction;
    const matchesEntity = selectedEntity === 'all' || !selectedEntity || log.entityType === selectedEntity;
    const matchesUser = !selectedUser || log.user.toLowerCase().includes(selectedUser.toLowerCase());
    
    return matchesSearch && matchesAction && matchesEntity && matchesUser;
  });

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  const handleExportCSV = () => {
    const csvContent = [
      'Timestamp,User,Client,Action,Entity Type,Entity ID,Trace ID',
      ...filteredLogs.map(log => 
        `${log.timestamp},${log.user},${log.client || ''},${log.action},${log.entityType},${log.entityId},${log.traceId}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'assign': return 'bg-purple-100 text-purple-800';
      case 'sync': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">System Logs</h1>
          <p className="text-gray-600">Monitor all system activities and changes</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by trace ID, entity ID, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actionTypes.map(action => (
                <SelectItem key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Entity Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entity Types</SelectItem>
              {entityTypes.map(entity => (
                <SelectItem key={entity} value={entity}>
                  {entity.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="user-filter">User:</Label>
            <Input
              id="user-filter"
              placeholder="Filter by user email..."
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-64"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="date-from">From:</Label>
            <Input
              id="date-from"
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              className="w-40"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="date-to">To:</Label>
            <Input
              id="date-to"
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              className="w-40"
            />
          </div>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredLogs.length} of {logs.length} log entries
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>Trace ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">
                  {formatTimestamp(log.timestamp)}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {log.user}
                </TableCell>
                <TableCell className="text-sm">
                  {log.client || '-'}
                </TableCell>
                <TableCell>
                  <Badge className={getActionColor(log.action)}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {log.entityType.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {log.entityId}
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500">
                  {log.traceId}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(log)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Entry Details</DialogTitle>
            <DialogDescription>
              Detailed information for trace ID: {selectedLog?.traceId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <div className="text-sm text-gray-600">{formatTimestamp(selectedLog.timestamp)}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <div className="text-sm text-gray-600 font-mono">{selectedLog.user}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Action</Label>
                  <Badge className={getActionColor(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Entity</Label>
                  <div className="text-sm text-gray-600">
                    {selectedLog.entityType} ({selectedLog.entityId})
                  </div>
                </div>
                
                {selectedLog.client && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Client</Label>
                    <div className="text-sm text-gray-600">{selectedLog.client}</div>
                  </div>
                )}
              </div>
              
              {selectedLog.beforeValues && (
                <div>
                  <Label className="text-sm font-medium">Before Values</Label>
                  <pre className="mt-1 p-3 bg-red-50 rounded-lg text-xs font-mono overflow-x-auto">
                    {JSON.stringify(selectedLog.beforeValues, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.afterValues && (
                <div>
                  <Label className="text-sm font-medium">After Values</Label>
                  <pre className="mt-1 p-3 bg-green-50 rounded-lg text-xs font-mono overflow-x-auto">
                    {JSON.stringify(selectedLog.afterValues, null, 2)}
                  </pre>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Trace ID</Label>
                <div className="text-sm text-gray-600 font-mono">{selectedLog.traceId}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}