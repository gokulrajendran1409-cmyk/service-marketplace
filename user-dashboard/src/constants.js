// Maps category names to emoji icons
export const categoryIcons = {
  'Plumbing': '🔧',
  'Electrical': '⚡',
  'AC & Appliance Repair': '❄️',
  'Carpentry': '🪚',
  'Painting': '🎨',
  'Cleaning': '🧹',
  'Home Repair & Maintenance': '🔨',
  'CCTV & Security': '📹',
  'Vehicle Services': '🚗',
  'Gardening & Landscaping': '🌳',
  'Computer & Mobile Repair': '💻',
  'Photography & Videography': '📸',
};

export const API = `${import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://service-marketplace-af7p.onrender.com'}/api/user`;

