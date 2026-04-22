// Shared project data for Products and Business Units across all roles

export interface ProjectData {
  id: string;
  name: string;
  status: 'pending_upload' | 'pending_approval' | 'requires_review' | 'approved' | 'in_progress';
  alert: boolean;
  dueDate?: string;
  assignedTo?: string;
}

export interface ProductWithProjects {
  id: string;
  name: string;
  type: 'product';
  referenceName: string;
  projects: ProjectData[];
}

export interface BusinessUnitWithProjects {
  id: string;
  uid: string;
  name: string;
  type: 'business_unit';
  country: string;
  projects: ProjectData[];
}

// Products data (aligned with Sub-Products in Master DB)
export const productsWithProjects: ProductWithProjects[] = [
  {
    id: 'prod-1',
    name: 'Steel Production - Basic',
    type: 'product',
    referenceName: 'SP-Steel-001',
    projects: [
      { id: 'proj-steel-1', name: 'Project X', status: 'pending_upload', alert: true },
      { id: 'proj-steel-2', name: 'Project Y', status: 'pending_approval', alert: false },
      { id: 'proj-steel-3', name: 'Project Z', status: 'requires_review', alert: true }
    ]
  },
  {
    id: 'prod-2',
    name: 'Plastic Packaging - PET',
    type: 'product',
    referenceName: 'SP-PET-001',
    projects: [
      { id: 'proj-pet-1', name: 'Project X', status: 'pending_upload', alert: true },
      { id: 'proj-pet-2', name: 'Project Y', status: 'pending_approval', alert: false },
      { id: 'proj-pet-3', name: 'Project Z', status: 'approved', alert: false }
    ]
  }
];

// Business Units data (aligned with Business Units in SA role)
export const businessUnitsWithProjects: BusinessUnitWithProjects[] = [
  {
    id: 'bu-1',
    uid: 'BU-MFG-2025-001',
    name: 'Manufacturing Plant - North America',
    type: 'business_unit',
    country: 'United States',
    projects: [
      { id: 'proj-1', name: 'Q1 2025 Carbon Assessment', status: 'pending_upload', alert: true, dueDate: '2025-03-31' },
    ]
  },
  {
    id: 'bu-2',
    uid: 'BU-WHS-2025-002',
    name: 'Distribution Warehouse - East Coast',
    type: 'business_unit',
    country: 'United States',
    projects: [
      { id: 'proj-1', name: 'Q1 2025 Carbon Assessment', status: 'pending_approval', alert: false, dueDate: '2025-03-31' },
    ]
  },
  {
    id: 'bu-3',
    uid: 'BU-OFF-2025-003',
    name: 'Corporate Office - HQ',
    type: 'business_unit',
    country: 'United States',
    projects: [
      { id: 'proj-1', name: 'Q1 2025 Carbon Assessment', status: 'in_progress', alert: false, dueDate: '2025-03-31' },
    ]
  },
  {
    id: 'bu-4',
    uid: 'BU-RET-2025-004',
    name: 'Retail Operations - Southwest',
    type: 'business_unit',
    country: 'United States',
    projects: [
      { id: 'proj-2', name: 'Annual Sustainability Report 2025', status: 'approved', alert: false, dueDate: '2025-12-31' },
    ]
  }
];

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending_upload':
      return 'Pending data upload';
    case 'pending_approval':
      return 'Pending SA approval';
    case 'requires_review':
      return 'Requires review';
    case 'approved':
      return 'Approved';
    case 'in_progress':
      return 'In progress';
    default:
      return status;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'bg-green-700/80';
    case 'in_progress':
      return 'bg-green-700/70';
    default:
      return 'bg-green-800/70';
  }
};