import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MasterDBProvider } from './contexts/MasterDBContext';
import { Login } from './components/Login';
import { AdminLandingDashboard } from './components/admin/AdminLandingDashboard';
import { SALandingDashboard } from './components/sa/SALandingDashboard';
import { CustomerLandingDashboard } from './components/customer/CustomerLandingDashboard';
import { ClientAdminLandingDashboard } from './components/client-admin/ClientAdminLandingDashboard';
import { UserManagement } from './components/client-admin/UserManagement';
import { AuditLogs } from './components/client-admin/AuditLogs';
import { Settings as ClientAdminSettings } from './components/client-admin/Settings';
import { EmissionFactors } from './components/admin/EmissionFactorsComplete';
import { EmissionFactorsBulkUpload } from './components/admin/EmissionFactorsBulkUpload';
import { FormulasHierarchical as Formulas } from './components/admin/FormulasHierarchicalImproved';
import { SubProducts } from './components/admin/SubProducts';
import { Templates } from './components/admin/Templates';
import { ReportTemplates } from './components/admin/ReportTemplates';
import { Clients } from './components/admin/Clients';
import { SystemConfiguration } from './components/admin/SystemConfiguration';
import { SystemLogs } from './components/admin/SystemLogs';
import { CDB } from './components/sa/CDB';
import { CDBEmissionFactors } from './components/sa/CDBEmissionFactors';
import { CDBFormulas } from './components/sa/CDBFormulas';
import { CDBSubProducts } from './components/sa/CDBSubProducts';
import { CDBProducts } from './components/sa/CDBProducts';
import { CDBBusinessUnits } from './components/sa/CDBBusinessUnits';
import { CDBActivities } from './components/sa/CDBActivities';
import { Projects } from './components/sa/Projects';
import { BCAProjects } from './components/sa/BCAProjects';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { DataUploads } from './components/customer/DataUploads';
import { CustomerUserComplete } from './components/customer/CustomerUserComplete';
import { ProductDataUpload } from './components/customer/ProductDataUpload';
import { ActivityDataUpload } from './components/customer/ActivityDataUpload';
import { ActivityData } from './components/customer/ActivityData';
import { UserRole, AppView } from './types';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { MimosaIcon } from './components/icons/MimosaIcon';
import { CloverIcon } from './components/icons/CloverIcon';
import { SustainabilityIcon } from './components/icons/SustainabilityIcon';
import { 
  Menu, 
  Bell, 
  Settings, 
  User, 
  ChevronDown,
  Search,
  Users,
  Database,
  Activity,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  Home,
  TreePine,
  Leaf,
  Droplets,
  Wind,
  Globe,
  Sun,
  TrendingUp,
  Zap,
  Sparkles,
  Shield
} from 'lucide-react';

// Role configuration for sidebar
const roleConfig = {
  admin: {
    name: 'Platform Admin',
    icon: Shield,
    color: 'bg-emerald-600 hover:bg-emerald-700',
    views: [
      { id: 'emission-factors', label: 'Master DB - Emission Factors' },
      { id: 'formulas', label: 'Master DB - Formulas' },
      { id: 'sub-products', label: 'Master DB - Sub-Products' },
      { id: 'activity-templates', label: 'Master DB - Activity Templates' },
      { id: 'report-templates', label: 'Master DB - Report Templates' },
      { id: 'clients', label: 'Client Onboarding' },
      { id: 'system-config', label: 'System Config' },
      { id: 'system-logs', label: 'System Logs' }
    ]
  },
  sa: {
    name: 'Sustainability Architect',
    icon: Leaf,
    color: 'bg-emerald-600 hover:bg-emerald-700',
    views: [
      { id: 'home', label: 'Dashboard' },
      { 
        id: 'cdb', 
        label: 'Client Database',
        subItems: [
          { id: 'cdb-emission-factors', label: 'Emission Factors' },
          { id: 'cdb-formulas', label: 'Formulas' },
          { id: 'cdb-sub-products', label: 'Sub-Products' },
          { id: 'cdb-products', label: 'Products' },
          { id: 'activities', label: 'Activities' },
          { id: 'business-units', label: 'Business Units' }
        ]
      },
      { id: 'projects', label: 'GHG Projects' },
      { id: 'bca-projects', label: 'BCA Projects' }
    ]
  },
  'client-admin': {
    name: 'Client Admin',
    icon: Users,
    color: 'bg-emerald-600 hover:bg-emerald-700',
    views: [
      { id: 'home', label: 'Dashboard' },
      { id: 'user-management', label: 'User Management' },
      { id: 'audit-logs', label: 'Audit Logs' },
      { id: 'settings', label: 'Settings' }
    ]
  },
  customer: {
    name: 'Customer User',
    icon: User,
    color: 'bg-emerald-600 hover:bg-emerald-700',
    views: [
      { id: 'home', label: 'Dashboard' },
      { id: 'dashboard', label: 'Product Data' },
      { id: 'uploads', label: 'Activity Data' }
    ]
  }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [currentView, setCurrentView] = useState<AppView>('home');
  
  // State for pre-selected filters (e.g., from dashboard navigation)
  const [preSelectedProjectId, setPreSelectedProjectId] = useState<string>('');
  const [preSelectedBUId, setPreSelectedBUId] = useState<string>('');

  const handleLogin = (role: UserRole, user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    setCurrentRole(role);
    setCurrentView(role === 'admin' ? 'emission-factors' : 'home');
    toast.success(`Welcome, ${user}!`, {
      description: `Logged in as ${role === 'admin' ? 'Platform Admin' : role === 'sa' ? 'Sustainability Architect' : role === 'client-admin' ? 'Client Admin' : 'Customer User'}`,
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setCurrentView('home');
    // Clear pre-selected filters on logout
    setPreSelectedProjectId('');
    setPreSelectedBUId('');
    toast.info('Logged out successfully', {
      description: 'Come back soon!',
    });
  };

  const handleNavigateFromDashboard = (view: string, params?: { projectId?: string; buId?: string }) => {
    setCurrentView(view as AppView);
    
    // Set pre-selected filters if provided
    if (params?.projectId) {
      setPreSelectedProjectId(params.projectId);
    }
    if (params?.buId) {
      setPreSelectedBUId(params.buId);
    }
  };

  const renderMainContent = () => {
    if (currentView === 'home') {
      if (currentRole === 'admin') {
        return <AdminLandingDashboard username={username} onNavigate={handleNavigateFromDashboard} />;
      } else if (currentRole === 'sa') {
        return <SALandingDashboard username={username} onNavigate={handleNavigateFromDashboard} />;
      } else if (currentRole === 'client-admin') {
        return <ClientAdminLandingDashboard username={username} onNavigate={handleNavigateFromDashboard} />;
      } else {
        return <CustomerLandingDashboard username={username} onNavigate={handleNavigateFromDashboard} />;
      }
    }

    if (currentRole === 'admin') {
      switch (currentView) {
        case 'emission-factors':
          return <EmissionFactors onNavigateToBulkUpload={() => setCurrentView('emission-factors-bulk-upload')} />;
        case 'emission-factors-bulk-upload':
          return <EmissionFactorsBulkUpload onBack={() => setCurrentView('emission-factors')} />;
        case 'formulas':
          return <Formulas />;
        case 'sub-products':
          return <SubProducts />;
        case 'activity-templates':
          return <Templates />;
        case 'report-templates':
          return <ReportTemplates />;
        case 'clients':
          return <Clients />;
        case 'system-config':
          return <SystemConfiguration />;
        case 'system-logs':
          return <SystemLogs />;
        default:
          return <EmissionFactors onNavigateToBulkUpload={() => setCurrentView('emission-factors-bulk-upload')} />;
      }
    } else if (currentRole === 'sa') {
      switch (currentView) {
        case 'cdb':
          return <CDB />;
        case 'cdb-emission-factors':
          return <CDBEmissionFactors />;
        case 'cdb-formulas':
          return <CDBFormulas />;
        case 'cdb-sub-products':
          return <CDBSubProducts />;
        case 'cdb-products':
          return <CDBProducts />;
        case 'business-units':
          return <CDBBusinessUnits />;
        case 'activities':
          return <CDBActivities />;
        case 'bca-projects':
          return <BCAProjects />;
        case 'lca-projects':
          return <Projects projectType="LCA" />;
        default:
          return <CDB />;
      }
    } else if (currentRole === 'client-admin') {
      switch (currentView) {
        case 'user-management':
          return <UserManagement />;
        case 'audit-logs':
          return <AuditLogs />;
        case 'settings':
          return <ClientAdminSettings />;
        default:
          return <UserManagement />;
      }
    } else {
      switch (currentView) {
        case 'dashboard':
          return <ProductDataUpload />;
        case 'uploads':
          return <ActivityData 
            initialProjectId={preSelectedProjectId} 
            initialBUId={preSelectedBUId}
            onClearSelection={() => {
              setPreSelectedProjectId('');
              setPreSelectedBUId('');
            }}
          />;
        default:
          return <CustomerUserComplete />;
      }
    }
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <MasterDBProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar - Fixed width and always visible */}
      <div className="flex-shrink-0">
        <Sidebar 
          currentRole={currentRole}
          currentView={currentView}
          onViewChange={setCurrentView}
          roleConfig={roleConfig}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        {/* Professional Enterprise Header */}
        <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden border-b border-slate-700/50">
          {/* Sophisticated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-teal-900/20"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-500/10 to-transparent"></div>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
              <defs>
                <pattern id="hexagons" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <polygon points="20,5 35,15 35,25 20,35 5,25 5,15" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons)" />
            </svg>
          </div>
          
          {/* Subtle Professional Icons */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-20 animate-bounce">
              <CloverIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="absolute top-6 right-32">
              <Wind className="h-6 w-6 text-teal-400" />
            </div>
            <div className="absolute bottom-4 left-1/3">
              <MimosaIcon className="h-10 w-10 text-green-400" />
            </div>
            <div className="absolute top-8 right-1/4">
              <Globe className="h-7 w-7 text-cyan-400" />
            </div>
            <div className="absolute bottom-5 right-20">
              <Sun className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          
          {/* Main Header Content */}
          <div className="relative px-8 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                {/* Left: Brand and Title */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-2xl border border-emerald-400/20 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-transparent to-teal-400/20 animate-pulse"></div>
                      <SustainabilityIcon className="h-9 w-9 text-white relative z-10 drop-shadow-sm" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      SustainaPlatform
                      <span className="text-emerald-400 ml-2">Pro</span>
                    </h1>
                    <p className="text-slate-300 font-medium text-lg">
                      Enterprise Carbon Intelligence & Lifecycle Analytics
                    </p>
                  </div>
                </div>

                {/* Right: User Info and Actions */}
                <div className="flex items-center gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700/50">
                    <User className="h-5 w-5 text-emerald-400" />
                    <div className="text-left">
                      <p className="text-sm text-white">{username}</p>
                      <p className="text-xs text-slate-400">{roleConfig[currentRole].name}</p>
                    </div>
                  </div>

                  {/* Live Status Indicator */}
                  <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-300">Live</span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-slate-300 hover:bg-red-900/30 hover:text-white hover:border-red-500/50 transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>

              {/* Bottom: Mission Statement */}
              <div className="mt-6 pt-4 border-t border-slate-700/30">
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Droplets className="h-5 w-5 text-cyan-400" />
                    <span className="text-sm font-medium">
                      Driving measurable environmental impact through data-driven sustainability solutions
                    </span>
                    <MimosaIcon className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
        </header>

        {/* Main Content with Modern Background */}
        <main className="flex-1 p-8 relative">
          {/* Subtle 3D Background Elements */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-20 left-32 w-64 h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-3xl"></div>
            <div className="absolute top-60 right-40 w-48 h-48 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-2xl"></div>
            <div className="absolute bottom-32 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full blur-3xl"></div>
          </div>
          
          {/* Quick Actions Bar */}
          <div className="relative mb-6">
            <div className="flex items-center gap-4">
              {/* Home Button - Only show for SA and Customer roles */}
              {(currentRole === 'sa' || currentRole === 'customer') && (
                <Button
                  variant={currentView === 'home' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView('home')}
                  className={`flex items-center gap-2 transition-all duration-200 ${
                    currentView === 'home'
                      ? `${roleConfig[currentRole].color} text-white hover:opacity-90 shadow-lg`
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span className="font-medium">Dashboard Home</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="relative">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
    <Toaster position="top-right" />
    </MasterDBProvider>
  );
}