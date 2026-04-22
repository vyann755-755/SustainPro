import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Lock,
  Server,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Settings() {
  const [authenticationType, setAuthenticationType] = useState<'local' | 'ldap'>('local');
  const [ldapSettings, setLdapSettings] = useState({
    serverUrl: '',
    port: '389',
    baseDN: '',
    bindDN: '',
    bindPassword: '',
    searchFilter: '(uid={username})',
    useSSL: false,
    testConnection: false
  });

  const handleSaveSettings = () => {
    if (authenticationType === 'ldap') {
      if (!ldapSettings.serverUrl || !ldapSettings.baseDN) {
        toast.error('Please fill in required LDAP fields');
        return;
      }
    }

    toast.success('Settings saved successfully', {
      description: `Authentication method set to ${authenticationType === 'local' ? 'Local Authentication' : 'LDAP Integration'}`
    });
  };

  const handleTestConnection = () => {
    if (!ldapSettings.serverUrl || !ldapSettings.baseDN) {
      toast.error('Please fill in LDAP server details');
      return;
    }

    // Simulate connection test
    setTimeout(() => {
      toast.success('LDAP connection successful', {
        description: 'Successfully connected to LDAP server'
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-emerald-900 mb-2">Settings</h1>
          <p className="text-emerald-700">Configure authentication and system preferences</p>
        </div>
      </div>

      {/* Authentication Settings */}
      <Card className="border-emerald-200 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-emerald-900">Authentication Method</CardTitle>
              <CardDescription className="text-emerald-700">
                Choose how users authenticate to the platform
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={authenticationType} onValueChange={(value: any) => setAuthenticationType(value)}>
            <div className="space-y-4">
              {/* Local Authentication Option */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 hover:border-emerald-400 transition-colors cursor-pointer">
                <RadioGroupItem value="local" id="local" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="local" className="cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-5 w-5 text-emerald-600" />
                      <span className="text-emerald-900">Local Authentication</span>
                    </div>
                    <p className="text-sm text-emerald-700">
                      Users authenticate with username and password managed within the platform. 
                      Ideal for smaller organizations or when external directory services are not available.
                    </p>
                  </Label>
                </div>
              </div>

              {/* LDAP Integration Option */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 hover:border-teal-400 transition-colors cursor-pointer">
                <RadioGroupItem value="ldap" id="ldap" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="ldap" className="cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="h-5 w-5 text-teal-600" />
                      <span className="text-teal-900">LDAP Integration</span>
                    </div>
                    <p className="text-sm text-teal-700">
                      Integrate with your organization's LDAP/Active Directory server for centralized 
                      authentication and user management. Recommended for enterprise environments.
                    </p>
                  </Label>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* LDAP Configuration (shown only when LDAP is selected) */}
      {authenticationType === 'ldap' && (
        <Card className="border-teal-200 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Server className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-teal-900">LDAP Configuration</CardTitle>
                <CardDescription className="text-teal-700">
                  Configure your LDAP server connection settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info Banner */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-900 mb-1">LDAP Configuration Requirements</p>
                  <p className="text-xs text-blue-700">
                    Ensure you have the correct LDAP server details from your IT department. 
                    Test the connection before saving to verify the configuration is correct.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Server URL */}
              <div className="space-y-2">
                <Label htmlFor="serverUrl" className="text-teal-900">
                  LDAP Server URL *
                </Label>
                <Input
                  id="serverUrl"
                  value={ldapSettings.serverUrl}
                  onChange={(e) => setLdapSettings({ ...ldapSettings, serverUrl: e.target.value })}
                  placeholder="ldap://ldap.example.com"
                  className="border-teal-200 focus:border-teal-500"
                />
                <p className="text-xs text-teal-600">Example: ldap://ldap.example.com or ldaps://ldap.example.com</p>
              </div>

              {/* Port */}
              <div className="space-y-2">
                <Label htmlFor="port" className="text-teal-900">
                  Port *
                </Label>
                <Input
                  id="port"
                  value={ldapSettings.port}
                  onChange={(e) => setLdapSettings({ ...ldapSettings, port: e.target.value })}
                  placeholder="389"
                  className="border-teal-200 focus:border-teal-500"
                />
                <p className="text-xs text-teal-600">Default: 389 (LDAP) or 636 (LDAPS)</p>
              </div>

              {/* Base DN */}
              <div className="space-y-2">
                <Label htmlFor="baseDN" className="text-teal-900">
                  Base DN *
                </Label>
                <Input
                  id="baseDN"
                  value={ldapSettings.baseDN}
                  onChange={(e) => setLdapSettings({ ...ldapSettings, baseDN: e.target.value })}
                  placeholder="dc=example,dc=com"
                  className="border-teal-200 focus:border-teal-500"
                />
                <p className="text-xs text-teal-600">The base distinguished name for searches</p>
              </div>

              {/* Bind DN */}
              <div className="space-y-2">
                <Label htmlFor="bindDN" className="text-teal-900">
                  Bind DN
                </Label>
                <Input
                  id="bindDN"
                  value={ldapSettings.bindDN}
                  onChange={(e) => setLdapSettings({ ...ldapSettings, bindDN: e.target.value })}
                  placeholder="cn=admin,dc=example,dc=com"
                  className="border-teal-200 focus:border-teal-500"
                />
                <p className="text-xs text-teal-600">Optional: User DN for binding to the server</p>
              </div>

              {/* Bind Password */}
              <div className="space-y-2">
                <Label htmlFor="bindPassword" className="text-teal-900">
                  Bind Password
                </Label>
                <Input
                  id="bindPassword"
                  type="password"
                  value={ldapSettings.bindPassword}
                  onChange={(e) => setLdapSettings({ ...ldapSettings, bindPassword: e.target.value })}
                  placeholder="••••••••"
                  className="border-teal-200 focus:border-teal-500"
                />
                <p className="text-xs text-teal-600">Password for the bind DN user</p>
              </div>

              {/* Search Filter */}
              <div className="space-y-2">
                <Label htmlFor="searchFilter" className="text-teal-900">
                  Search Filter
                </Label>
                <Input
                  id="searchFilter"
                  value={ldapSettings.searchFilter}
                  onChange={(e) => setLdapSettings({ ...ldapSettings, searchFilter: e.target.value })}
                  placeholder="(uid={username})"
                  className="border-teal-200 focus:border-teal-500"
                />
                <p className="text-xs text-teal-600">LDAP search filter for user authentication</p>
              </div>
            </div>

            {/* SSL/TLS Option */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <Label htmlFor="useSSL" className="text-teal-900">Use SSL/TLS</Label>
                  <p className="text-sm text-teal-700">Enable secure connection to LDAP server</p>
                </div>
              </div>
              <Switch
                id="useSSL"
                checked={ldapSettings.useSSL}
                onCheckedChange={(checked) => setLdapSettings({ ...ldapSettings, useSSL: checked })}
              />
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleTestConnection}
                variant="outline"
                className="border-teal-300 text-teal-700 hover:bg-teal-50"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
              <p className="text-sm text-teal-600">
                Test the LDAP connection before saving
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm text-emerald-900 mb-1">Important</p>
            <p className="text-xs text-emerald-700">
              Changing authentication settings will affect all users. Ensure the configuration 
              is correct before saving to prevent login issues.
            </p>
          </div>
        </div>
        <Button
          onClick={handleSaveSettings}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-lg"
        >
          <SettingsIcon className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
