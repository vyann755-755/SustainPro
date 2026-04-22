export type UserRole = 'admin' | 'sa' | 'customer' | 'client-admin';

export type AppView = 
  | 'home'
  | 'emission-factors'
  | 'emission-factors-bulk-upload'
  | 'formulas' 
  | 'sub-products' 
  | 'templates' 
  | 'clients'
  | 'system-config'
  | 'system-logs'
  | 'cdb'
  | 'projects'
  | 'customers'
  | 'dashboard'
  | 'uploads'
  | 'products'
  | 'business-units'
  | 'user-management'
  | 'audit-logs'
  | 'settings';

export interface EmissionFactor {
  id: string;
  uid: string; // Parent UID for the EF family
  name: string;
  category: string;
  country: string;
  latestVersion: string;
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  description?: string;
  impactCategories: string[];
  versions: EmissionFactorVersion[];
  database: 'master' | 'client'; // Indicates if it's in master or client database
  clientId?: string; // Only for client-specific EFs
  createdBy: string; // User who created it
  createdAt: string;
  customAttributes?: Record<string, any>; // For custom fields
}

export interface EmissionFactorVersion {
  id: string;
  versionUID: string; // Structured UID for this specific version
  parentUID: string; // Reference to parent EF UID
  version: string; // Version number like "1.0", "1.1", etc.
  year: number;
  country: string;
  region?: string;
  sector?: string;
  subSector?: string;
  value: number;
  unit: string;
  uncertainty?: number; // Percentage uncertainty
  dataQualityRating?: 'A' | 'B' | 'C' | 'D' | 'E'; // Data quality rating
  geographicScope: 'global' | 'national' | 'regional' | 'local';
  technologyScope: 'average' | 'best' | 'worst' | 'specific';
  timeScope: 'current' | 'historical' | 'forecast';
  
  // Reference data
  sourceName: string; // Name of the data source
  sourceURL?: string; // URL to the source
  methodology?: string; // Methodology used
  sourceType: 'primary' | 'secondary' | 'tertiary';
  
  // Metadata
  notes?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  
  // Calculation context
  functionalUnit?: string;
  systemBoundary?: string;
  allocationMethod?: string;
  
  // Version relationships
  parentVersionId?: string; // If this is derived from another version
  derivationReason?: string; // Why this version was created
}

export interface Formula {
  id: string;
  uid: string; // Parent UID for the Formula family
  name: string;
  description: string;
  category?: string; // Optional categorization
  latestVersion: string;
  parameters: FormulaParameter[];
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  versions: FormulaVersion[];
  database: 'master' | 'client'; // Indicates if it's in master or client database
  clientId?: string; // Only for client-specific formulas
  createdBy: string; // User who created it
  createdAt: string;
  customAttributes?: Record<string, any>; // For custom fields
}

export interface FormulaParameter {
  id: string;
  name: string;
  type: 'number' | 'string' | 'enum' | 'boolean';
  unit?: string;
  defaultValue?: string | number | boolean;
  required: boolean;
  enumValues?: string[];
  description?: string;
  minValue?: number;
  maxValue?: number;
}

export interface FormulaVersion {
  id: string;
  versionUID: string; // Structured UID for this specific version
  parentUID: string; // Reference to parent Formula UID
  version: string; // Version number like "1.0", "1.1", etc.
  expression: string; // The mathematical algorithm/expression
  parameters: FormulaParameter[];
  
  // Reference data
  sourceName: string; // Name of the data source
  sourceURL?: string; // URL to the source
  supportingDocs?: string[]; // Optional supporting documents URLs/names
  methodology?: string; // Methodology description
  sourceType: 'primary' | 'secondary' | 'tertiary';
  
  // Metadata
  notes?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  
  // Algorithm context
  algorithmType?: 'linear' | 'logarithmic' | 'polynomial' | 'custom';
  applicationScope?: string; // Where this formula applies
  validationStatus?: 'pending' | 'validated' | 'rejected';
  
  // Version relationships
  parentVersionId?: string; // If this is derived from another version
  derivationReason?: string; // Why this version was created
}

export interface SubProduct {
  id: string;
  name: string;
  impactCategory: string;
  functionalUnit: string;
  value: number;
  referenceName: string;
  tags: string[];
  description: string;
  country: string;
  region: string;
  year: number;
  status: 'active' | 'inactive';
}

export interface Template {
  id: string;
  name: string;
  type: 'sub-product' | 'business-unit';
  description: string;
  functionalUnit?: string;
  defaultCategory?: string;
  defaultCountry?: string;
  defaultYear?: number;
  tags: string[];
  stages: TemplateStage[];
  lastEdited: string;
}

export interface TemplateStage {
  id: string;
  name: string;
  order: number;
  assignedFormula?: Formula;
  assignedEFs: EmissionFactor[];
  defaultValues: { [key: string]: number };
  scope?: '1' | '2' | '3'; // For BU templates
}

export interface Client {
  id: string;
  customerAccountId: string; // Unique auto-generated customer account ID
  companyName: string;
  region: string;
  adminName: string;
  adminEmail: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  quotas: ClientQuotas;
  usage: ClientUsage;
}

export interface ClientQuotas {
  subProducts: number;
  products: number;
  businessUnits: number;
  activitiesPerBU: number;
  reportsPerMonth: number;
  customerAccounts: number;
}

export interface ClientUsage {
  subProducts: number;
  products: number;
  businessUnits: number;
  customerAccounts: number;
  reportsThisMonth: number;
}

export interface Project {
  id: string;
  name: string;
  type: 'LCA' | 'BCA';
  scope: string;
  status: 'draft' | 'in-progress' | 'completed';
  assignedProducts: string[];
  assignedBUs: string[];
  assignedCustomers: string[];
  createdAt: string;
  lastCalculated?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  client?: string;
  action: 'create' | 'update' | 'delete' | 'assign' | 'sync';
  entityType: 'emission-factor' | 'formula' | 'sub-product' | 'template' | 'client' | 'project';
  entityId: string;
  beforeValues?: any;
  afterValues?: any;
  traceId: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'SA' | 'Customer User';
  status: 'Active' | 'Disabled' | 'Pending Activation';
  createdAt: string;
  createdBy: string;
  lastLogin?: string;
  clientAccountId: string;
}

export interface UserAuditLog {
  id: string;
  timestamp: string;
  performedBy: string;
  action: 'User Created' | 'User Disabled' | 'User Activated' | 'Password Reset' | 'User Updated';
  userId: string;
  userEmail: string;
  details: string;
}