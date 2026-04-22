import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { SustainabilityIcon } from './icons/SustainabilityIcon';
import { MimosaIcon } from './icons/MimosaIcon';
import { CloverIcon } from './icons/CloverIcon';
import { 
  Shield, 
  TreePine, 
  Leaf, 
  ArrowRight,
  Droplets,
  Wind,
  Globe,
  Sun,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole, username: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const roles = [
    {
      id: 'admin' as UserRole,
      name: 'Platform Admin',
      icon: Shield,
      description: 'Manage Master Database, Templates, and Client Onboarding',
      gradient: 'from-emerald-500 via-green-600 to-teal-600',
      bgGradient: 'from-emerald-50 to-green-50',
      features: ['Master DB Management', 'Template Creation', 'Client Onboarding', 'System Monitoring']
    },
    {
      id: 'client-admin' as UserRole,
      name: 'Client Admin',
      icon: Shield,
      description: 'Manage User Accounts and Organization Settings',
      gradient: 'from-violet-500 via-purple-600 to-indigo-600',
      bgGradient: 'from-violet-50 to-purple-50',
      features: ['User Management', 'Create SA & Customer Users', 'Password Resets', 'Audit Logs']
    },
    {
      id: 'sa' as UserRole,
      name: 'Sustainability Architect',
      icon: TreePine,
      description: 'Manage Client Databases, Projects, and Customer Accounts',
      gradient: 'from-teal-500 via-cyan-500 to-blue-500',
      bgGradient: 'from-teal-50 to-cyan-50',
      features: ['Client Database (CDB)', 'LCA & BCA Projects', 'Customer Management', 'Data Review']
    },
    {
      id: 'customer' as UserRole,
      name: 'Customer User',
      icon: Leaf,
      description: 'Upload Data and Manage Business Unit Assignments',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bgGradient: 'from-green-50 to-emerald-50',
      features: ['Business Units', 'Data Upload', 'Assignments', 'Review Status']
    }
  ];

  const handleRoleSelect = (role: UserRole) => {
    setIsAnimating(true);
    
    // Pre-fill credentials based on role
    let defaultUsername = '';
    let defaultPassword = 'demo';
    
    if (role === 'admin') {
      defaultUsername = 'admin';
    } else if (role === 'client-admin') {
      defaultUsername = 'clientadmin';
    } else if (role === 'sa') {
      defaultUsername = 'architect';
    } else if (role === 'customer') {
      defaultUsername = 'customer';
    }
    
    setTimeout(() => {
      setSelectedRole(role);
      setUsername(defaultUsername);
      setPassword(defaultPassword);
      setIsAnimating(false);
    }, 300);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && username) {
      onLogin(selectedRole, username);
    }
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedRole(null);
      setUsername('');
      setPassword('');
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 animate-bounce" style={{ animationDuration: '3s' }}>
          <CloverIcon className="h-16 w-16 text-emerald-400" />
        </div>
        <div className="absolute top-40 right-32 animate-pulse" style={{ animationDuration: '4s' }}>
          <Wind className="h-12 w-12 text-teal-400" />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-bounce" style={{ animationDuration: '3.5s' }}>
          <MimosaIcon className="h-20 w-20 text-green-400" />
        </div>
        <div className="absolute top-32 right-1/4 animate-pulse" style={{ animationDuration: '5s' }}>
          <Globe className="h-14 w-14 text-cyan-400" />
        </div>
        <div className="absolute bottom-40 right-40 animate-bounce" style={{ animationDuration: '4s' }}>
          <Sun className="h-10 w-10 text-yellow-400" />
        </div>
        <div className="absolute top-1/3 left-1/3 animate-pulse" style={{ animationDuration: '6s' }}>
          <Droplets className="h-12 w-12 text-blue-400" />
        </div>
      </div>

      {/* Gradient Blobs */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-emerald-400/20">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                <SustainabilityIcon className="h-14 w-14 text-white relative z-10 drop-shadow-lg" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl mb-3">
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              SustainaPlatform
            </span>
            <span className="text-emerald-500 ml-3">Pro</span>
          </h1>
          <p className="text-emerald-700 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5" />
            Enterprise Carbon Intelligence & Lifecycle Analytics
            <Sparkles className="h-5 w-5" />
          </p>
        </div>

        {/* Role Selection or Login Form */}
        {!selectedRole ? (
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-2 text-emerald-900">Welcome Back</h2>
              <p className="text-emerald-700">Select your role to continue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Card
                    key={role.id}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 bg-gradient-to-br ${role.bgGradient} border-emerald-200 hover:border-emerald-400 group relative overflow-hidden`}
                    onClick={() => handleRoleSelect(role.id)}
                  >
                    {/* Hover Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    <CardHeader className="relative z-10">
                      <div className={`w-16 h-16 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        <Icon className="h-9 w-9 text-white" />
                      </div>
                      <CardTitle className="text-emerald-900 group-hover:text-emerald-700 transition-colors">
                        {role.name}
                      </CardTitle>
                      <CardDescription className="text-emerald-700">
                        {role.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <ul className="space-y-2 mb-4">
                        {role.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-emerald-800">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full bg-gradient-to-r ${role.gradient} text-white hover:opacity-90 shadow-md group-hover:shadow-lg transition-all duration-300`}
                      >
                        Continue as {role.name}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="max-w-md mx-auto">
              <Card className="border-2 border-emerald-200 shadow-2xl bg-white/95 backdrop-blur">
                <CardHeader className="text-center pb-6">
                  {(() => {
                    const selectedRoleData = roles.find(r => r.id === selectedRole);
                    const Icon = selectedRoleData?.icon || Shield;
                    return (
                      <>
                        <div className={`w-20 h-20 bg-gradient-to-br ${selectedRoleData?.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                          <Icon className="h-11 w-11 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-emerald-900">
                          {selectedRoleData?.name}
                        </CardTitle>
                        <CardDescription className="text-emerald-700">
                          Enter your credentials to continue
                        </CardDescription>
                      </>
                    );
                  })()}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-emerald-900">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-emerald-900">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 text-emerald-700 cursor-pointer">
                        <input type="checkbox" className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
                        Remember me
                      </label>
                      <a href="#" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className={`flex-1 bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.gradient} text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all`}
                      >
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Demo Login */}
              <div className="mt-6 p-4 bg-white/80 backdrop-blur rounded-lg border border-emerald-200 shadow-md">
                <p className="text-sm text-emerald-800 text-center mb-3">
                  <Sparkles className="inline h-4 w-4 mr-1" />
                  Quick Demo Access
                </p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                    <p className="text-emerald-900">Admin</p>
                    <p className="text-emerald-600">admin / demo</p>
                  </div>
                  <div className="p-2 bg-violet-50 rounded border border-violet-200">
                    <p className="text-violet-900">Client Admin</p>
                    <p className="text-violet-600">clientadmin / demo</p>
                  </div>
                  <div className="p-2 bg-teal-50 rounded border border-teal-200">
                    <p className="text-teal-900">SA</p>
                    <p className="text-teal-600">architect / demo</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-green-900">Customer</p>
                    <p className="text-green-600">customer / demo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-3 text-emerald-700 mb-4">
            <Droplets className="h-5 w-5 text-cyan-500" />
            <span className="text-sm">
              Driving measurable environmental impact through data-driven sustainability solutions
            </span>
            <MimosaIcon className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-xs text-emerald-600">
            © 2024 SustainaPlatform Pro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}