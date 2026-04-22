import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { EmissionFactorManager } from './admin/EmissionFactorManager';
import { FormulaManager } from './admin/FormulaManager';
import { SubProductManager } from './admin/SubProductManager';
import { TemplateBuilder } from './admin/TemplateBuilder';
import { ClientManager } from './admin/ClientManager';
import { SystemLogs } from './admin/SystemLogs';
import { Database, Calculator, Package, Layout, Users, FileText } from 'lucide-react';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emission Factors</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+12 this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formulas</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+8 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+2 this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Navigation */}
      <Tabs defaultValue="emission-factors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="emission-factors" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Emission Factors
          </TabsTrigger>
          <TabsTrigger value="formulas" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Formulas
          </TabsTrigger>
          <TabsTrigger value="sub-products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Sub-products
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            System Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emission-factors">
          <EmissionFactorManager />
        </TabsContent>

        <TabsContent value="formulas">
          <FormulaManager />
        </TabsContent>

        <TabsContent value="sub-products">
          <SubProductManager />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateBuilder />
        </TabsContent>

        <TabsContent value="clients">
          <ClientManager />
        </TabsContent>

        <TabsContent value="logs">
          <SystemLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}