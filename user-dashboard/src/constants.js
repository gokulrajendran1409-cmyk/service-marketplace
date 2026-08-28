import {
  Camera,
  Car,
  Hammer,
  Home,
  Leaf,
  Monitor,
  Paintbrush,
  Shield,
  Sparkles,
  Tags,
  Wrench,
  Wind,
  Zap,
} from 'lucide-react';

// Maps category names to the same Lucide icons used by the admin dashboard.
export const categoryIcons = {
  'Plumbing': Wrench,
  'Electrical': Zap,
  'AC & Appliance Repair': Wind,
  'Carpentry': Hammer,
  'Painting': Paintbrush,
  'Cleaning': Sparkles,
  'Home Repair & Maintenance': Home,
  'CCTV & Security': Shield,
  'Vehicle Services': Car,
  'Gardening & Landscaping': Leaf,
  'Computer & Mobile Repair': Monitor,
  'Photography & Videography': Camera,
};

export const categoryColors = {
  'Plumbing': '#3b82f6',
  'Electrical': '#f59e0b',
  'AC & Appliance Repair': '#06b6d4',
  'Carpentry': '#a16207',
  'Painting': '#ec4899',
  'Cleaning': '#8b5cf6',
  'Home Repair & Maintenance': '#f97316',
  'CCTV & Security': '#6366f1',
  'Vehicle Services': '#64748b',
  'Gardening & Landscaping': '#10b981',
  'Computer & Mobile Repair': '#0ea5e9',
  'Photography & Videography': '#d946ef',
};

export const serviceGroups = [
  {
    name: 'Personal Care',
    icon: Sparkles,
    color: '#8b5cf6',
    categories: ['Cleaning', 'Gardening & Landscaping'],
  },
  {
    name: 'Education',
    icon: Monitor,
    color: '#0ea5e9',
    categories: ['Computer & Mobile Repair'],
  },
  {
    name: 'Vehicle Services',
    icon: Car,
    color: '#64748b',
    categories: ['Vehicle Services'],
  },
  {
    name: 'Home Services',
    icon: Home,
    color: '#f97316',
    categories: ['CCTV & Security', 'Photography & Videography'],
  },
  {
    name: 'Home Repairs',
    icon: Tags,
    color: '#f97316',
    categories: ['Plumbing', 'Electrical', 'AC & Appliance Repair', 'Carpentry', 'Painting', 'Home Repair & Maintenance'],
  },
];

export const API = `${import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://service-marketplace-af7p.onrender.com'}/api/user`;

