const fs = require('fs');
const file = 'd:/service-marketplace/user-dashboard/src/pages/Services.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldStr = `  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('Thiruvananthapuram');
  const [selectedDistrict, setSelectedDistrict] = useState('Thiruvananthapuram');
  const [districtPricingTiers, setDistrictPricingTiers] = useState(DEFAULT_DISTRICT_TIERS);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');
  const [booking, setBooking] = useState(null);
  const [profileProfessional, setProfileProfessional] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);`;

const newStr = `  const [location, setLocation] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('servicesLocation')) || null; } catch { return null; }
  });
  const [locationName, setLocationName] = useState(() => sessionStorage.getItem('servicesLocationName') || 'Thiruvananthapuram');
  const [selectedDistrict, setSelectedDistrict] = useState('Thiruvananthapuram');
  const [districtPricingTiers, setDistrictPricingTiers] = useState(DEFAULT_DISTRICT_TIERS);
  const [locationStatus, setLocationStatus] = useState(() => sessionStorage.getItem('servicesLocationStatus') || 'idle');
  const [locationError, setLocationError] = useState('');
  const [booking, setBooking] = useState(null);
  const [profileProfessional, setProfileProfessional] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (location) {
      sessionStorage.setItem('servicesLocation', JSON.stringify(location));
      sessionStorage.setItem('servicesLocationStatus', 'ready');
    }
  }, [location]);

  useEffect(() => {
    if (locationName) sessionStorage.setItem('servicesLocationName', locationName);
  }, [locationName]);

  useEffect(() => {
    if (locationStatus) sessionStorage.setItem('servicesLocationStatus', locationStatus);
  }, [locationStatus]);`;

// Regex exact match with line endings
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
const regex = new RegExp(escapeRegex(oldStr).replace(/\\r?\\n/g, '\\r?\\n'), 'g');
content = content.replace(regex, newStr);

fs.writeFileSync(file, content);
