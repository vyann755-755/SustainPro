import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
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
  Activity, 
  Package, 
  Building, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Calendar,
  BarChart3,
  ArrowRight,
  Plus,
  Upload,
  Download
} from 'lucide-react';
import { useMasterDB } from '../../contexts/MasterDBContext';

interface CDBProps {
  initialTab?: string;
}

export function CDB({ initialTab = 'emission-factors' }: CDBProps) {
  const { getMasterEFsForAssignment } = useMasterDB();

  // Mock stats for CDB
  const cdbStats = {
    emissionFactors: { assigned: 45, custom: 12, total: 57 },
    formulas: { assigned: 23, custom: 8, total: 31 },
    subProducts: { assigned: 15, custom: 5, total: 20 },
    products: { total: 12, active: 10, draft: 2 },
    businessUnits: { total: 8, active: 6, inactive: 2 }
  };

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'emission-factor',
      action: 'Created',
      item: 'Custom EF: Transportation - Electric Vehicle',
      user: 'Sarah Johnson',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'formula',
      action: 'Assigned',
      item: 'Formula: Scope 2 Electricity Calculation',
      user: 'Mike Chen',
      time: '4 hours ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'product',
      action: 'Updated',
      item: 'Product: Widget Pro - Material Composition',
      user: 'Lisa Brown',
      time: '5 hours ago',
      status: 'warning'
    },
    {
      id: 4,
      type: 'business-unit',
      action: 'Created',
      item: 'Business Unit: Distribution Center - East',
      user: 'David Wilson',
      time: '1 day ago',
      status: 'success'
    },
    {
      id: 5,
      type: 'sub-product',
      action: 'Assigned',
      item: 'Sub-product: Steel Component A to Widget Pro',
      user: 'Sarah Johnson',
      time: '1 day ago',
      status: 'success'
    }
  ];

  // Data quality metrics
  const dataQualityMetrics = [
    { category: 'Emission Factors', completeness: 92, accuracy: 95, status: 'excellent' },
    { category: 'Formulas', completeness: 88, accuracy: 98, status: 'excellent' },
    { category: 'Products', completeness: 75, accuracy: 85, status: 'good' },
    { category: 'Business Units', completeness: 95, accuracy: 90, status: 'excellent' },
  ];

  // Usage statistics
  const usageStats = [
    { month: 'Oct 2024', assignments: 45, creations: 12, updates: 23 },
    { month: 'Sep 2024', assignments: 38, creations: 15, updates: 19 },
    { month: 'Aug 2024', assignments: 42, creations: 10, updates: 21 },
    { month: 'Jul 2024', assignments: 35, creations: 8, updates: 17 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'emission-factor':
        return <Database className="h-4 w-4 text-blue-600" />;
      case 'formula':
        return <Activity className="h-4 w-4 text-green-600" />;
      case 'product':
        return <Package className="h-4 w-4 text-orange-600" />;
      case 'business-unit':
        return <Building className="h-4 w-4 text-indigo-600" />;
      case 'sub-product':
        return <Package className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Client Database Overview</h1>
              <p className="text-gray-600">Monitor and manage your client-specific sustainability data</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-200">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getMasterEFsForAssignment().length} Master Resources Available
            </span>
          </div>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Database className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                +{cdbStats.emissionFactors.custom} Custom
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Emission Factors</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-blue-600">{cdbStats.emissionFactors.total}</p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{cdbStats.emissionFactors.assigned} from Master DB</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                +{cdbStats.formulas.custom} Custom
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Formulas</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-green-600">{cdbStats.formulas.total}</p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{cdbStats.formulas.assigned} from Master DB</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Package className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                +{cdbStats.subProducts.custom} Custom
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Sub-products</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-purple-600">{cdbStats.subProducts.total}</p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{cdbStats.subProducts.assigned} from Master DB</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <Package className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {cdbStats.products.active} Active
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Products</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-orange-600">{cdbStats.products.total}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{cdbStats.products.draft} in draft</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Building className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                {cdbStats.businessUnits.active} Active
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Business Units</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-indigo-600">{cdbStats.businessUnits.total}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{cdbStats.businessUnits.inactive} inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="border-2 border-teal-100">
          <CardHeader>
            <CardTitle className="text-teal-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest changes and updates to your client database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.type.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{activity.item}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{activity.user}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Quality Metrics */}
        <Card className="border-2 border-teal-100">
          <CardHeader>
            <CardTitle className="text-teal-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Data Quality Metrics
            </CardTitle>
            <CardDescription>Completeness and accuracy of your client data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataQualityMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{metric.category}</span>
                    <Badge 
                      className={
                        metric.status === 'excellent' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                      }
                    >
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Completeness</span>
                      <span className="font-medium text-gray-900">{metric.completeness}%</span>
                    </div>
                    <Progress value={metric.completeness} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Accuracy</span>
                      <span className="font-medium text-gray-900">{metric.accuracy}%</span>
                    </div>
                    <Progress value={metric.accuracy} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <Card className="border-2 border-teal-100">
        <CardHeader>
          <CardTitle className="text-teal-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            Monthly Usage Statistics
          </CardTitle>
          <CardDescription>Database activity trends over the past 4 months</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Assignments from Master DB</TableHead>
                <TableHead>Custom Creations</TableHead>
                <TableHead>Updates/Edits</TableHead>
                <TableHead>Total Activity</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageStats.map((stat, index) => {
                const total = stat.assignments + stat.creations + stat.updates;
                const prevTotal = index < usageStats.length - 1 
                  ? usageStats[index + 1].assignments + usageStats[index + 1].creations + usageStats[index + 1].updates 
                  : total;
                const isIncreasing = total > prevTotal;
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{stat.month}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {stat.assignments}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {stat.creations}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {stat.updates}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900">{total}</span>
                    </TableCell>
                    <TableCell>
                      {index > 0 && (
                        isIncreasing ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
