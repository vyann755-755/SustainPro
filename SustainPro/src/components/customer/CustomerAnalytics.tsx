import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Tag,
  Globe,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface Assignment {
  id: string;
  projectId: string;
  projectName: string;
  projectType: 'LCA' | 'BCA';
  itemId: string;
  itemName: string;
  itemType: string;
}

interface CustomerAnalyticsProps {
  assignment: Assignment;
  onBack: () => void;
}

// Mock analytics data
const impactCategories = [
  { category: 'GWP-100', value: 12500, unit: 'kg CO2e', trend: 'down', change: -5.2 },
  { category: 'Acidification', value: 45.3, unit: 'mol H+ eq', trend: 'down', change: -3.1 },
  { category: 'Eutrophication', value: 28.7, unit: 'kg N eq', trend: 'up', change: 2.4 },
  { category: 'Ozone Depletion', value: 0.012, unit: 'kg CFC-11 eq', trend: 'down', change: -1.8 }
];

const monthlyData = [
  { month: 'Jan', scope1: 450, scope2: 320, scope3: 780, total: 1550 },
  { month: 'Feb', scope1: 420, scope2: 350, scope3: 720, total: 1490 },
  { month: 'Mar', scope1: 480, scope2: 300, scope3: 800, total: 1580 },
  { month: 'Apr', scope1: 440, scope2: 330, scope3: 750, total: 1520 },
  { month: 'May', scope1: 400, scope2: 310, scope3: 700, total: 1410 },
  { month: 'Jun', scope1: 380, scope2: 290, scope3: 680, total: 1350 }
];

const scopeBreakdown = [
  { name: 'Scope 1', value: 2570, percentage: 30 },
  { name: 'Scope 2', value: 1900, percentage: 22 },
  { name: 'Scope 3', value: 4230, percentage: 48 }
];

const activityBreakdown = [
  { name: 'Electricity', value: 1450, percentage: 32 },
  { name: 'Transportation', value: 980, percentage: 22 },
  { name: 'Heating/Cooling', value: 870, percentage: 19 },
  { name: 'Manufacturing', value: 560, percentage: 12 },
  { name: 'Waste', value: 420, percentage: 9 },
  { name: 'Other', value: 270, percentage: 6 }
];

const stageBreakdown = [
  { name: 'Raw Material', value: 3200, percentage: 40 },
  { name: 'Manufacturing', value: 2400, percentage: 30 },
  { name: 'Distribution', value: 1600, percentage: 20 },
  { name: 'Use Phase', value: 800, percentage: 10 }
];

const countryBreakdown = [
  { country: 'United States', value: 4500 },
  { country: 'United Kingdom', value: 2100 },
  { country: 'Germany', value: 1200 }
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function CustomerAnalytics({ assignment, onBack }: CustomerAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const isLCA = assignment.projectType === 'LCA';
  const isBCA = assignment.projectType === 'BCA';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="border-emerald-300 hover:bg-emerald-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
          <div>
            <h2 className="text-2xl text-emerald-900">Analytics: {assignment.itemName}</h2>
            <p className="text-emerald-600">{assignment.projectName} • {assignment.projectType} Project</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Total Impact Summary */}
      <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Total Calculated Impact
          </CardTitle>
          <CardDescription>Environmental impact across all categories for {assignment.itemName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {impactCategories.map((impact, idx) => (
              <Card key={idx} className="border border-emerald-200">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm text-emerald-700">{impact.category}</span>
                    {impact.trend === 'down' ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-xs">{Math.abs(impact.change)}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">{impact.change}%</span>
                      </div>
                    )}
                  </div>
                  <p className="text-2xl text-emerald-900 mb-1">{impact.value.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600">{impact.unit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Period Breakdown */}
      <Card className="border-2 border-emerald-100">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Breakdown by Time Period
          </CardTitle>
          <CardDescription>Monthly emissions trends (kg CO2e)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="scope1" stackId="1" stroke="#10b981" fill="#10b981" name="Scope 1" />
              <Area type="monotone" dataKey="scope2" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Scope 2" />
              <Area type="monotone" dataKey="scope3" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Scope 3" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scope and Activity/Stage Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        {/* Scope Breakdown (BCA only) */}
        {isBCA && (
          <Card className="border-2 border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Breakdown by Scope
              </CardTitle>
              <CardDescription>Emissions distribution across scopes (kg CO2e)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={scopeBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {scopeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Activity Breakdown (BCA) */}
        {isBCA && (
          <Card className="border-2 border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Breakdown by Activities
              </CardTitle>
              <CardDescription>Emissions by activity type (kg CO2e)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Stage Breakdown (LCA) */}
        {isLCA && (
          <>
            <Card className="border-2 border-emerald-100">
              <CardHeader>
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Breakdown by Life Cycle Stages
                </CardTitle>
                <CardDescription>Impact distribution across stages (kg CO2e)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stageBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stageBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-100">
              <CardHeader>
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Breakdown by Stages
                </CardTitle>
                <CardDescription>Detailed stage analysis (kg CO2e)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stageBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Impact Categories Breakdown */}
      <Card className="border-2 border-emerald-100">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Breakdown by Impact Categories
          </CardTitle>
          <CardDescription>Comparative analysis across environmental impact categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={impactCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#10b981" name="Impact Value" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Country/Regional Breakdown */}
      <Card className="border-2 border-emerald-100">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Breakdown by Country/Region
          </CardTitle>
          <CardDescription>Geographic distribution of emissions (kg CO2e)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={countryBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="country" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card className="border-2 border-emerald-100 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-emerald-900">Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl text-emerald-900 mb-2">8,700</p>
              <p className="text-sm text-emerald-700">Total kg CO2e</p>
              <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                <TrendingDown className="h-3 w-3 mr-1" />
                5.2% vs last period
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-3xl text-emerald-900 mb-2">{isLCA ? '4' : '3'}</p>
              <p className="text-sm text-emerald-700">{isLCA ? 'Life Cycle Stages' : 'Emission Scopes'}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl text-emerald-900 mb-2">6</p>
              <p className="text-sm text-emerald-700">Months Analyzed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
