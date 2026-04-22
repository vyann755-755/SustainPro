import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Leaf, AlertCircle, Package, Building2, Calendar, MapPin, ChevronRight, TrendingUp } from 'lucide-react';
import { 
  productsWithProjects, 
  businessUnitsWithProjects, 
  getStatusLabel,
  getStatusColor 
} from '../../data/sharedProjectData';

interface CustomerLandingDashboardProps {
  username: string;
  onNavigate: (view: string, params?: { projectId?: string; buId?: string }) => void;
}

export function CustomerLandingDashboard({ username, onNavigate }: CustomerLandingDashboardProps) {
  // Calculate statistics
  const totalProducts = productsWithProjects.length;
  const totalBusinessUnits = businessUnitsWithProjects.length;
  const totalProjects = [...productsWithProjects, ...businessUnitsWithProjects].reduce(
    (acc, item) => acc + item.projects.length, 0
  );
  const pendingItems = [...productsWithProjects, ...businessUnitsWithProjects].reduce(
    (acc, item) => acc + item.projects.filter(p => p.alert).length, 0
  );

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'in_progress':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'pending_approval':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'pending_upload':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'requires_review':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProjectCardColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:from-emerald-100 hover:to-teal-100';
      case 'in_progress':
        return 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 hover:from-teal-100 hover:to-cyan-100';
      case 'pending_approval':
        return 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 hover:from-amber-100 hover:to-yellow-100';
      case 'pending_upload':
        return 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 hover:from-rose-100 hover:to-pink-100';
      case 'requires_review':
        return 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:from-orange-100 hover:to-amber-100';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:from-gray-100 hover:to-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="absolute top-0 right-0 opacity-10">
          <Leaf className="h-64 w-64 -mr-20 -mt-20" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Leaf className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Welcome back, {username}!</h1>
              <p className="text-emerald-50 mt-1">
                Track your sustainability assignments and data submissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 mb-1">Products</p>
                <p className="text-3xl font-bold text-emerald-900">{totalProducts}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-700 mb-1">Business Units</p>
                <p className="text-3xl font-bold text-teal-900">{totalBusinessUnits}</p>
              </div>
              <div className="p-3 bg-teal-100 rounded-xl">
                <Building2 className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-700 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-cyan-900">{totalProjects}</p>
              </div>
              <div className="p-3 bg-cyan-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-700 mb-1">Needs Attention</p>
                <p className="text-3xl font-bold text-rose-900">{pendingItems}</p>
              </div>
              <div className="p-3 bg-rose-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="business-units" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-emerald-50/50 p-1 h-auto border border-emerald-200">
          <TabsTrigger 
            value="business-units" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-900 data-[state=active]:shadow-sm py-3 text-base rounded-lg transition-all"
          >
            <Building2 className="h-5 w-5" />
            Business Units
            <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700 border-0">
              {totalBusinessUnits}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-900 data-[state=active]:shadow-sm py-3 text-base rounded-lg transition-all"
          >
            <Package className="h-5 w-5" />
            Products
            <Badge variant="secondary" className="ml-2 bg-teal-100 text-teal-700 border-0">
              {totalProducts}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Business Units Tab Content */}
        <TabsContent value="business-units" className="mt-6 space-y-4">
          {businessUnitsWithProjects.map((bu) => (
            <Card key={bu.id} className="border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-emerald-900 mb-2 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                      {bu.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-emerald-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{bu.country}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-xs bg-white border-emerald-300 text-emerald-700">
                          {bu.uid}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {bu.projects.map((project) => (
                    <div 
                      key={project.id}
                      className={`${getProjectCardColor(project.status)} border-2 rounded-xl p-4 cursor-pointer transition-all group`}
                      onClick={() => onNavigate('uploads', { projectId: project.id, buId: bu.id })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{project.name}</h4>
                            {project.alert && (
                              <div className="bg-rose-500 rounded-full p-1 animate-pulse">
                                <AlertCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${getStatusBadgeColor(project.status)} border`}>
                              {getStatusLabel(project.status)}
                            </Badge>
                            {project.dueDate && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Products Tab Content */}
        <TabsContent value="products" className="mt-6 space-y-4">
          {productsWithProjects.map((product) => (
            <Card key={product.id} className="border-teal-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-teal-900 mb-2 flex items-center gap-2">
                      <Package className="h-5 w-5 text-teal-600" />
                      {product.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-white border-teal-300 text-teal-700">
                        {product.referenceName}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {product.projects.map((project) => (
                    <div 
                      key={project.id}
                      className={`${getProjectCardColor(project.status)} border-2 rounded-xl p-4 cursor-pointer transition-all group`}
                      onClick={() => onNavigate('dashboard', { projectId: project.id })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{project.name}</h4>
                            {project.alert && (
                              <div className="bg-rose-500 rounded-full p-1 animate-pulse">
                                <AlertCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${getStatusBadgeColor(project.status)} border`}>
                              {getStatusLabel(project.status)}
                            </Badge>
                            {project.dueDate && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}