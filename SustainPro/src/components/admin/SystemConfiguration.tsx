import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Settings, 
  Database, 
  Bell, 
  Shield, 
  Mail, 
  Clock, 
  Users, 
  FileText,
  Server,
  Key,
  Globe,
  Zap,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Activity,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Upload,
  HardDrive,
  Wifi,
  Cloud
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function SystemConfiguration() {
  const [hasChanges, setHasChanges] = useState(false);
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    systemName: 'GreenTrack Sustainability Platform',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
    sessionTimeout: '30',
    maxFileSize: '100',
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    systemAlerts: true,
    userActivity: false,
    dataUpload: true,
    weeklyReports: true,
  });

  // Security Settings State
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    passwordExpiry: '90',
    minPasswordLength: '8',
    loginAttempts: '5',
    sessionManagement: true,
  });

  // Database Settings State
  const [database, setDatabase] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: '30',
    compression: true,
  });

  const handleSaveChanges = () => {
    toast.success('Configuration saved successfully', {
      description: 'All system settings have been updated.',
    });
    setHasChanges(false);
  };

  const handleResetChanges = () => {
    toast.info('Changes discarded', {
      description: 'Settings have been reset to previous values.',
    });
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              System Configuration
            </h1>
            <p className="text-gray-600 text-lg">
              Manage platform-wide settings, security, and preferences
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleResetChanges}
              disabled={!hasChanges}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button 
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Change Indicator */}
      {hasChanges && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <p className="text-amber-800 font-medium">
            You have unsaved changes. Click "Save Changes" to apply your modifications.
          </p>
        </div>
      )}

      {/* Main Configuration Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border border-gray-200 shadow-sm p-1">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="integration" className="gap-2">
            <Zap className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-2 border-emerald-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600" />
                General System Settings
              </CardTitle>
              <CardDescription>
                Configure basic platform settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={systemSettings.systemName}
                    onChange={(e) => {
                      setSystemSettings({ ...systemSettings, systemName: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={systemSettings.timezone}
                    onValueChange={(value) => {
                      setSystemSettings({ ...systemSettings, timezone: value });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                      <SelectItem value="GMT">GMT (Greenwich Mean Time)</SelectItem>
                      <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select 
                    value={systemSettings.language}
                    onValueChange={(value) => {
                      setSystemSettings({ ...systemSettings, language: value });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select 
                    value={systemSettings.dateFormat}
                    onValueChange={(value) => {
                      setSystemSettings({ ...systemSettings, dateFormat: value });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => {
                      setSystemSettings({ ...systemSettings, sessionTimeout: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max Upload File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={systemSettings.maxFileSize}
                    onChange={(e) => {
                      setSystemSettings({ ...systemSettings, maxFileSize: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                System Status
              </CardTitle>
              <CardDescription>
                Current system health and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Server className="h-5 w-5 text-green-600" />
                    <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Server Status</p>
                  <p className="text-2xl font-bold text-green-900">Online</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <HardDrive className="h-5 w-5 text-blue-600" />
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">Good</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Storage Used</p>
                  <p className="text-2xl font-bold text-blue-900">45%</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Wifi className="h-5 w-5 text-purple-600" />
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300">Stable</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Network</p>
                  <p className="text-2xl font-bold text-purple-900">98ms</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Cloud className="h-5 w-5 text-amber-600" />
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">Synced</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Last Backup</p>
                  <p className="text-2xl font-bold text-amber-900">2h ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-2 border-red-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Security & Access Control
              </CardTitle>
              <CardDescription>
                Configure authentication, authorization, and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="h-4 w-4 text-gray-600" />
                      <Label htmlFor="twoFactor" className="text-base font-semibold">Two-Factor Authentication</Label>
                    </div>
                    <p className="text-sm text-gray-600">Require 2FA for all admin users</p>
                  </div>
                  <Switch
                    id="twoFactor"
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) => {
                      setSecurity({ ...security, twoFactorAuth: checked });
                      setHasChanges(true);
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Key className="h-4 w-4 text-gray-600" />
                      <Label htmlFor="sessionMgmt" className="text-base font-semibold">Session Management</Label>
                    </div>
                    <p className="text-sm text-gray-600">Enable active session monitoring</p>
                  </div>
                  <Switch
                    id="sessionMgmt"
                    checked={security.sessionManagement}
                    onCheckedChange={(checked) => {
                      setSecurity({ ...security, sessionManagement: checked });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={security.passwordExpiry}
                    onChange={(e) => {
                      setSecurity({ ...security, passwordExpiry: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minPassword">Minimum Password Length</Label>
                  <Input
                    id="minPassword"
                    type="number"
                    value={security.minPasswordLength}
                    onChange={(e) => {
                      setSecurity({ ...security, minPasswordLength: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={security.loginAttempts}
                    onChange={(e) => {
                      setSecurity({ ...security, loginAttempts: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-2 border-amber-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Manage system-wide notification settings and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <Label htmlFor="emailEnabled" className="text-base font-semibold">Email Notifications</Label>
                  </div>
                  <p className="text-sm text-gray-600">Send email notifications for critical events</p>
                </div>
                <Switch
                  id="emailEnabled"
                  checked={notifications.emailEnabled}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, emailEnabled: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-gray-600" />
                    <Label htmlFor="systemAlerts" className="text-base font-semibold">System Alerts</Label>
                  </div>
                  <p className="text-sm text-gray-600">Receive alerts for system errors and warnings</p>
                </div>
                <Switch
                  id="systemAlerts"
                  checked={notifications.systemAlerts}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, systemAlerts: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-gray-600" />
                    <Label htmlFor="userActivity" className="text-base font-semibold">User Activity</Label>
                  </div>
                  <p className="text-sm text-gray-600">Track and notify on user activities</p>
                </div>
                <Switch
                  id="userActivity"
                  checked={notifications.userActivity}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, userActivity: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="h-4 w-4 text-gray-600" />
                    <Label htmlFor="dataUpload" className="text-base font-semibold">Data Upload Notifications</Label>
                  </div>
                  <p className="text-sm text-gray-600">Notify when bulk data uploads complete</p>
                </div>
                <Switch
                  id="dataUpload"
                  checked={notifications.dataUpload}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, dataUpload: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <Label htmlFor="weeklyReports" className="text-base font-semibold">Weekly Reports</Label>
                  </div>
                  <p className="text-sm text-gray-600">Receive weekly summary reports</p>
                </div>
                <Switch
                  id="weeklyReports"
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, weeklyReports: checked });
                    setHasChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database" className="space-y-6">
          <Card className="border-2 border-indigo-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600" />
                Database & Backup Configuration
              </CardTitle>
              <CardDescription>
                Configure database settings, backups, and data retention
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <RefreshCw className="h-4 w-4 text-gray-600" />
                      <Label htmlFor="autoBackup" className="text-base font-semibold">Automatic Backups</Label>
                    </div>
                    <p className="text-sm text-gray-600">Enable scheduled automatic backups</p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={database.autoBackup}
                    onCheckedChange={(checked) => {
                      setDatabase({ ...database, autoBackup: checked });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Download className="h-4 w-4 text-gray-600" />
                      <Label htmlFor="compression" className="text-base font-semibold">Backup Compression</Label>
                    </div>
                    <p className="text-sm text-gray-600">Compress backup files to save space</p>
                  </div>
                  <Switch
                    id="compression"
                    checked={database.compression}
                    onCheckedChange={(checked) => {
                      setDatabase({ ...database, compression: checked });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select 
                    value={database.backupFrequency}
                    onValueChange={(value) => {
                      setDatabase({ ...database, backupFrequency: value });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Data Retention (days)</Label>
                  <Input
                    id="retentionPeriod"
                    type="number"
                    value={database.retentionPeriod}
                    onChange={(e) => {
                      setDatabase({ ...database, retentionPeriod: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Create Manual Backup
                </Button>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Restore from Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integration" className="space-y-6">
          <Card className="border-2 border-teal-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-teal-600" />
                API & Integration Settings
              </CardTitle>
              <CardDescription>
                Manage third-party integrations and API configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* API Keys Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Key className="h-4 w-4 text-teal-600" />
                    API Keys
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-base font-semibold">Production API Key</Label>
                        <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Input 
                          type="password" 
                          value="sk_prod_••••••••••••••••" 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="sm">
                          Regenerate
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Last rotated: 2024-10-15</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-base font-semibold">Development API Key</Label>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">Active</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Input 
                          type="password" 
                          value="sk_dev_••••••••••••••••" 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="sm">
                          Regenerate
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Last rotated: 2024-10-20</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Webhook Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-teal-600" />
                    Webhook Endpoints
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      type="url"
                      placeholder="https://your-domain.com/webhook"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Test Connection
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      View Logs
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
