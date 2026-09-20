import {
  Bug,
  Camera,
  Car,
  Hammer,
  Home,
  Leaf,
  Monitor,
  Paintbrush,
  Scissors,
  Shield,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Tags,
  Users,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';

// Maps category names to the same Lucide icons used by the admin dashboard.
export const categoryIcons = {
  'Plumbing': Wrench,
  'AC & Appliances': Snowflake,
  'Cleaning': Sparkles,
  'Pest Control': Bug,
  'Home Improvement': Paintbrush,
  'Vehicle': Car,
  'Personal & Daily Help': Users,
  'Electrical': Zap,
  'CCTV & Security': Shield,
  'Gardening & Landscaping': Leaf,
  'Computer & Mobile Repair': Monitor,
  'Photography & Videography': Camera,
  'Personal Care': Scissors,
  'Barber and Beautician Services': Scissors,
};

export const categoryColors = {
  'Plumbing': '#3b82f6',
  'AC & Appliances': '#06b6d4',
  'Cleaning': '#8b5cf6',
  'Pest Control': '#ef4444',
  'Home Improvement': '#ec4899',
  'Vehicle': '#f97316',
  'Personal & Daily Help': '#8b5cf6',
  'Electrical': '#f59e0b',
  'CCTV & Security': '#6366f1',
  'Gardening & Landscaping': '#10b981',
  'Computer & Mobile Repair': '#0ea5e9',
  'Photography & Videography': '#d946ef',
  'Personal Care': '#ec4899',
};

export const serviceGroups = [
  {
    name: 'Home & Improvement',
    icon: Home,
    color: '#ec4899',
    categories: ['Plumbing', 'Home Improvement', 'Electrical', 'CCTV & Security'],
  },
  {
    name: 'AC & Appliances',
    icon: Snowflake,
    color: '#06b6d4',
    categories: ['AC & Appliances'],
  },
  {
    name: 'Cleaning & Pest',
    icon: Sparkles,
    color: '#8b5cf6',
    categories: ['Cleaning', 'Pest Control'],
  },
  {
    name: 'Vehicle Care',
    icon: Car,
    color: '#f97316',
    categories: ['Vehicle'],
  },
  {
    name: 'Personal & Daily Help',
    icon: Users,
    color: '#8b5cf6',
    categories: ['Personal & Daily Help', 'Personal Care', 'Gardening & Landscaping'],
  },
  {
    name: 'Digital & Media',
    icon: Monitor,
    color: '#0ea5e9',
    categories: ['Computer & Mobile Repair', 'Photography & Videography'],
  },
];

export const VEHICLE_SUBCATEGORIES = [
  'Periodic Car & Bike Maintenance',
  'Car Spa, Snow Foam Wash & Detailing',
  '24/7 Breakdown SOS, Jumpstart & Towing',
  '3D Laser Wheel Alignment & Balancing',
  'Car AC Gas Recharge & Cooling Repair',
  'Battery Health Test & Jumpstart Service',
];

export const CLEANING_SUBCATEGORIES = [
  {
    id: 'basic-cleaning',
    name: 'Basic cleaning',
    tag: 'Quick & Routine',
    tagline: 'Routine Dusting, Mopping & Tidying',
    desc: 'Dusting surfaces, sweeping, wet mopping floors & emptying trash bins for everyday household freshness.',
    price: 'From $25',
    badgeColor: '#6366f1',
    features: [
      'Living room, bedroom & hallway dusting',
      'Floor sweeping & scented wet mopping',
      'Kitchen countertop & surface wiping',
      'Trash removal & linen straightening'
    ]
  },
  {
    id: 'deep-cleaning',
    name: 'Deep cleaning',
    tag: 'Most Popular',
    tagline: 'Intensive Scrub & Grime Removal',
    desc: 'Targeted heavy scrub-down for stubborn kitchen grease, bathroom limescale, behind appliances & grout.',
    price: 'From $45',
    badgeColor: '#8b5cf6',
    features: [
      'Kitchen stove, tiles, chimney & cabinet degrease',
      'Bathroom descaling, tile grout & tap polish',
      'Behind & under large furniture vacuuming',
      'Door frames, baseboards & switchboard sanitize'
    ]
  },
  {
    id: 'premium-cleaning',
    name: 'Premium cleaning',
    tag: 'Hospital-Grade',
    tagline: 'High-Heat Steam & Sanitization',
    desc: '140°C pressurized steam sterilization, sofa & upholstery shampooing, eco-friendly agents & crystal window buffing.',
    price: 'From $70',
    badgeColor: '#059669',
    features: [
      '140°C high-pressure steam sanitization',
      'Fabric sofa & mattress vacuum shampooing',
      'Streak-free interior window & mirror buffing',
      'Anti-allergen organic disinfecting spray'
    ]
  },
  {
    id: 'custom-cleaning',
    name: 'Custom cleaning',
    tag: 'Personalized',
    tagline: 'Tailored Checklist by Room & Hours',
    desc: 'Build your own cleaning priority checklist. Focus on specific rooms, balconies, post-party or tenant move-in/out.',
    price: 'Flexible Rate',
    badgeColor: '#d97706',
    features: [
      'Pick specific rooms, balconies or appliances',
      'Book dedicated cleaners by flexible hourly slots',
      'Tenant move-in / move-out customized prep',
      'Bring your own or request specialized supplies'
    ]
  }
];

export const SERVER_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://service-marketplace-af7p.onrender.com');
export const API = `${SERVER_BASE}/api/user`;
export const AUTH_API = `${SERVER_BASE}/api/auth`;


