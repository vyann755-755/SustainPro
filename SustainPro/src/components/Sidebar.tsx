import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { UserRole, AppView } from '../types';
import { CloverIcon } from './icons/CloverIcon';
import { 
  Database, 
  Calculator, 
  Package, 
  Layout, 
  Users, 
  FileText,
  BarChart3,
  FolderOpen,
  Upload,
  Home,
  TreePine,
  Leaf,
  Sprout,
  Recycle,
  Wind,
  Zap,
  Globe,
  Building,
  UserCheck,
  Sparkles,
  TrendingUp,
  Target,
  Activity,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  roleConfig: any;
}

const iconMap = {
  'emission-factors': Database,
  'formulas': Calculator,
  'sub-products': Package,
  'templates': Layout,
  'clients': Users,
  'system-config': Activity,
  'system-logs': FileText,
  'cdb': Sprout,
  'cdb-emission-factors': Database,
  'cdb-formulas': Calculator,
  'cdb-sub-products': Package,
  'cdb-products': Package,
  'projects': BarChart3,
  'bca-projects': BarChart3,
  'lca-projects': Target,
  'customers': UserCheck,
  'dashboard': Home,
  'uploads': Upload,
  'products': Package,
  'business-units': Building,
  'activities': Activity
};

export function Sidebar({ currentRole, currentView, onViewChange, roleConfig }: SidebarProps) {
  const config = roleConfig[currentRole];
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ cdb: true });

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };
  
  return (
    <div className="w-80 bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 text-gray-800 flex flex-col relative overflow-hidden shadow-xl border-r border-green-100">
      {/* Light Nature Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 left-6 w-24 h-24 bg-gradient-to-br from-emerald-200/60 to-green-300/40 rounded-full blur-xl"></div>
        <div className="absolute top-48 right-8 w-32 h-32 bg-gradient-to-br from-teal-200/50 to-cyan-300/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-10 w-28 h-28 bg-gradient-to-br from-blue-200/40 to-emerald-300/50 rounded-full blur-xl"></div>
        <div className="absolute bottom-64 right-6 w-20 h-20 bg-gradient-to-br from-green-300/60 to-teal-200/40 rounded-full blur-lg"></div>
      </div>
      
      {/* Floating Nature Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-12 left-8 animate-bounce delay-150">
          <CloverIcon className="h-8 w-8 text-emerald-600" />
        </div>
        <div className="absolute top-40 right-12 animate-bounce delay-100">
          <CloverIcon className="h-6 w-6 text-emerald-500" />
        </div>
        <div className="absolute bottom-48 left-12 text-3xl animate-pulse delay-200">🌿</div>
        <div className="absolute bottom-80 right-8 animate-bounce delay-300">
          <CloverIcon className="h-6 w-6 text-emerald-500" />
        </div>
      </div>
      
      {/* Header Section */}
      <div className="relative p-8 border-b border-emerald-100">
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 bg-gradient-to-br from-white/80 to-emerald-100/60 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-emerald-200 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-2xl"></div>
            <config.icon className="h-8 w-8 text-emerald-700 relative z-10 drop-shadow-sm" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 drop-shadow-sm">{config.name}</h2>
            <p className="text-emerald-700 font-medium">
              {currentRole === 'admin' ? 'Platform Management' : 
               currentRole === 'sa' ? 'Sustainability Hub' : 'Impact Tracking'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="relative flex-1 p-6 overflow-y-auto">
        <div className="space-y-2">
          {config.views.map((view: any) => {
            const hasSubItems = view.subItems && view.subItems.length > 0;
            const isExpanded = expandedMenus[view.id];
            const Icon = iconMap[view.id as keyof typeof iconMap] || FolderOpen;
            const isActive = currentView === view.id || (hasSubItems && view.subItems.some((sub: any) => sub.id === currentView));
            
            return (
              <div key={view.id}>
                {/* Main Menu Item */}
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-12 text-left transition-all duration-300 group relative overflow-hidden rounded-xl px-3",
                    isActive
                      ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200 backdrop-blur-sm shadow-lg"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200"
                  )}
                  onClick={() => {
                    if (hasSubItems) {
                      toggleMenu(view.id);
                      // If clicking on parent with subitems, navigate to first subitem
                      if (!isExpanded) {
                        onViewChange(view.subItems[0].id);
                      }
                    } else {
                      onViewChange(view.id);
                    }
                  }}
                >
                  {/* Subtle gradient overlay for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/30 to-green-200/20 rounded-xl"></div>
                  )}
                  
                  {/* Icon Container */}
                  <div className={cn(
                    "relative w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-sm",
                    isActive 
                      ? "bg-gradient-to-br from-emerald-500 to-green-600 shadow-md text-white scale-105" 
                      : "bg-gradient-to-br from-white/90 to-emerald-50/80 group-hover:from-emerald-100 group-hover:to-green-100 text-emerald-600 group-hover:scale-105 group-hover:shadow-md"
                  )}>
                    <Icon className="h-4 w-4 relative z-10" strokeWidth={2.5} />
                  </div>
                  
                  {/* Label */}
                  <span className="font-medium relative z-10 flex-1 leading-tight">{view.label}</span>
                  
                  {/* Expand/Collapse Icon for items with subitems */}
                  {hasSubItems && (
                    <div className="relative z-10">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                  
                  {/* Nature sparkle effect for active item */}
                  {isActive && !hasSubItems && (
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 animate-pulse relative z-10" />
                  )}
                </Button>

                {/* Submenu Items */}
                {hasSubItems && isExpanded && (
                  <div className="mt-1 ml-6 space-y-1">
                    {view.subItems.map((subItem: any) => {
                      const SubIcon = iconMap[subItem.id as keyof typeof iconMap] || FolderOpen;
                      const isSubActive = currentView === subItem.id;
                      
                      return (
                        <Button
                          key={subItem.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-3 h-10 text-left transition-all duration-300 group relative overflow-hidden rounded-lg px-3",
                            isSubActive
                              ? "bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border border-teal-200 backdrop-blur-sm shadow-md"
                              : "text-gray-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 border border-transparent hover:border-teal-200"
                          )}
                          onClick={() => onViewChange(subItem.id)}
                        >
                          {/* Icon */}
                          <div className={cn(
                            "relative w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-300",
                            isSubActive 
                              ? "bg-gradient-to-br from-teal-400 to-cyan-500 text-white scale-105" 
                              : "bg-gradient-to-br from-white/90 to-teal-50/80 group-hover:from-teal-100 group-hover:to-cyan-100 text-teal-600 group-hover:scale-105"
                          )}>
                            <SubIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </div>
                          
                          {/* Label */}
                          <span className="text-sm font-medium flex-1">{subItem.label}</span>
                          
                          {/* Sparkle for active subitem */}
                          {isSubActive && (
                            <Sparkles className="h-3 w-3 text-teal-600 flex-shrink-0 animate-pulse" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
      
      {/* Role-specific Light Footer */}
      {currentRole === 'sa' && (
        <div className="relative p-6 border-t border-emerald-100">
          <div className="bg-gradient-to-r from-teal-50/90 to-cyan-50/80 backdrop-blur-sm p-6 rounded-2xl border border-teal-200 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                <CloverIcon className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-800">Client Resources</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Products</span>
                  <span className="text-teal-600 font-bold">12/50</span>
                </div>
                <div className="w-full bg-teal-100 rounded-full h-2 shadow-inner">
                  <div className="bg-gradient-to-r from-teal-400 to-cyan-400 h-2 rounded-full shadow-sm transition-all duration-1000" style={{ width: '24%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Business Units</span>
                  <span className="text-blue-600 font-bold">8/25</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2 shadow-inner">
                  <div className="bg-gradient-to-r from-blue-400 to-sky-400 h-2 rounded-full shadow-sm transition-all duration-1000" style={{ width: '32%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Reports</span>
                  <span className="text-purple-600 font-bold">15/100</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2 shadow-inner">
                  <div className="bg-gradient-to-r from-purple-400 to-violet-400 h-2 rounded-full shadow-sm transition-all duration-1000" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {currentRole === 'customer' && (
        <div className="relative p-6 border-t border-emerald-100">
          <div className="bg-gradient-to-r from-emerald-50/90 to-green-50/80 backdrop-blur-sm p-6 rounded-2xl border border-emerald-200 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-md">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-800">Your Impact</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-white/60 rounded-xl border border-emerald-200">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                  <Recycle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-800 font-semibold">3.2 tons CO₂</p>
                  <p className="text-emerald-600 text-sm">Tracked & Reduced</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-white/60 rounded-xl border border-blue-200">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                  <Wind className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-800 font-semibold">78%</p>
                  <p className="text-blue-600 text-sm">Efficiency Gain</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-white/60 rounded-xl border border-amber-200">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-800 font-semibold">12%</p>
                  <p className="text-amber-600 text-sm">Energy Savings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {currentRole === 'admin' && (
        <div className="relative p-6 border-t border-emerald-100">
          <div className="bg-gradient-to-r from-indigo-50/90 to-purple-50/80 backdrop-blur-sm p-6 rounded-2xl border border-indigo-200 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-800">Platform Health</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700 font-medium">Active Clients</span>
                <span className="text-indigo-600 font-bold text-lg">24</span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700 font-medium">Data Processed</span>
                <span className="text-purple-600 font-bold text-lg">1.2k</span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700 font-medium">System Load</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold text-lg">23%</span>
                  <Target className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
