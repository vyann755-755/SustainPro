import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  TreePine,
  Factory,
  Package,
  TrendingUp,
  Target,
  Leaf,
  Upload,
  CheckCircle,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

interface SALandingDashboardProps {
  username: string;
  onNavigate: (view: string) => void;
}

// Mock data for LCA/BCA projects
const mockProjectData = {
  totalImpact: {
    gwp: 15847.3,
    ap: 234.5,
    ep: 45.2,
    odp: 0,
    pocp: 12.4,
    adp: 0.45
  },
  totalProducts: 12,
  maxProducts: 50,
  totalBusinessUnits: 5,
  maxBusinessUnits: 25,
  lcaProjects: {
    total: 8,
    max: 20,
    pendingUpload: 3,
    pendingApproval: 2,
    readyForReport: 3
  },
  bcaProjects: {
    total: 15,
    max: 30,
    pendingUpload: 5,
    pendingApproval: 4,
    readyForReport: 6
  }
};

export function SALandingDashboard({ username, onNavigate }: SALandingDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
        <div className="absolute top-0 right-0 opacity-20">
          <TreePine className="h-64 w-64 -mr-20 -mt-20" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <TreePine className="h-10 w-10" />
            <h1 className="text-4xl">Welcome back, {username}!</h1>
          </div>
          <p className="text-cyan-100 text-lg mb-6">
            Sustainability Architect Dashboard - LCA & BCA Project Impact Analytics
          </p>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5" />
                <p className="text-sm opacity-90">Total Impact (GWP)</p>
              </div>
              <p className="text-3xl">{mockProjectData.totalImpact.gwp.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-1">kg CO₂e</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5" />
                <p className="text-sm opacity-90">Products</p>
              </div>
              <p className="text-3xl">{mockProjectData.totalProducts} <span className="text-xl opacity-75">/max</span></p>
              <p className="text-xs opacity-75 mt-1">of {mockProjectData.maxProducts} available</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Factory className="h-5 w-5" />
                <p className="text-sm opacity-90">Business Units</p>
              </div>
              <p className="text-3xl">{mockProjectData.totalBusinessUnits} <span className="text-xl opacity-75">/max</span></p>
              <p className="text-xs opacity-75 mt-1">of {mockProjectData.maxBusinessUnits} available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Impact Across All Categories */}
      <Card className="border-2 border-teal-100">
        <CardHeader>
          <CardTitle className="text-teal-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-teal-600" />
            Total Impact Across All Categories
          </CardTitle>
          <CardDescription>
            Comprehensive environmental impact assessment for all products and business units
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Total Carbon Emissions (CO2e) */}
            <Card className="bg-gradient-to-br from-white to-red-50 border-2 border-red-100">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <p className="text-xs text-gray-600">Total Carbon Emissions (CO2e)</p>
                </div>
                <p className="text-2xl text-gray-900 mb-1">{mockProjectData.totalImpact.gwp.toLocaleString()}</p>
                <p className="text-xs text-gray-500">kg CO₂e</p>
              </CardContent>
            </Card>

            {/* Acidification Potential (AP) */}
            <Card className="bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <p className="text-xs text-gray-600">Acidification Potential (AP)</p>
                </div>
                <p className="text-2xl text-gray-900 mb-1">{mockProjectData.totalImpact.ap.toLocaleString()}</p>
                <p className="text-xs text-gray-500">kg SO₂e</p>
              </CardContent>
            </Card>

            {/* Eutrophication Potential (EP) */}
            <Card className="bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-100">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <p className="text-xs text-gray-600">Eutrophication Potential (EP)</p>
                </div>
                <p className="text-2xl text-gray-900 mb-1">{mockProjectData.totalImpact.ep.toLocaleString()}</p>
                <p className="text-xs text-gray-500">kg PO₄e</p>
              </CardContent>
            </Card>

            {/* Ozone Depletion Impact (ODP) */}
            <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-xs text-gray-600">Ozone Depletion Impact (ODP)</p>
                </div>
                <p className="text-2xl text-gray-900 mb-1">{mockProjectData.totalImpact.odp}</p>
                <p className="text-xs text-gray-500">kg CFC-11e</p>
              </CardContent>
            </Card>

            {/* Photochemical Ozone Creation (POCP) */}
            <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-xs text-gray-600">Photochemical Ozone Creation (POCP)</p>
                </div>
                <p className="text-2xl text-gray-900 mb-1">{mockProjectData.totalImpact.pocp.toLocaleString()}</p>
                <p className="text-xs text-gray-500">kg C₂H₄e</p>
              </CardContent>
            </Card>

            {/* Abiotic Depletion Potential (ADP) */}
            <Card className="bg-gradient-to-br from-white to-teal-50 border-2 border-teal-100">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                  <p className="text-xs text-gray-600">Abiotic Depletion Potential (ADP)</p>
                </div>
                <p className="text-2xl text-gray-900 mb-1">{mockProjectData.totalImpact.adp.toLocaleString()}</p>
                <p className="text-xs text-gray-500">kg Sbe</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Module Shortcuts - LCA and BCA */}
      <div className="grid grid-cols-2 gap-6">
        {/* LCA Module */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => onNavigate('lca-projects')}>
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 opacity-10">
              <Leaf className="h-32 w-32 -mr-8 -mt-8" />
            </div>
            <div className="relative z-10">
              <div className="mb-4">
                <h3 className="text-2xl mb-2">LCA Module</h3>
                <p className="text-blue-100 text-lg">
                  {mockProjectData.lcaProjects.total}/{mockProjectData.lcaProjects.max} active projects
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="h-4 w-4" />
                    <p className="text-xs opacity-90">{mockProjectData.lcaProjects.pendingUpload}</p>
                  </div>
                  <p className="text-xs opacity-75">pending data upload</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-center gap-2 mb-1">
                    <FileCheck className="h-4 w-4" />
                    <p className="text-xs opacity-90">{mockProjectData.lcaProjects.readyForReport}</p>
                  </div>
                  <p className="text-xs opacity-75">ready to generate report</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BCA Module */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => onNavigate('bca-projects')}>
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 opacity-10">
              <Factory className="h-32 w-32 -mr-8 -mt-8" />
            </div>
            <div className="relative z-10">
              <div className="mb-4">
                <h3 className="text-2xl mb-2">BCA Module</h3>
                <p className="text-blue-100 text-lg">
                  {mockProjectData.bcaProjects.total}/{mockProjectData.bcaProjects.max} active projects
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="h-4 w-4" />
                    <p className="text-xs opacity-90">{mockProjectData.bcaProjects.pendingUpload}</p>
                  </div>
                  <p className="text-xs opacity-75">pending data upload</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-center gap-2 mb-1">
                    <FileCheck className="h-4 w-4" />
                    <p className="text-xs opacity-90">{mockProjectData.bcaProjects.readyForReport}</p>
                  </div>
                  <p className="text-xs opacity-75">ready to generate report</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}