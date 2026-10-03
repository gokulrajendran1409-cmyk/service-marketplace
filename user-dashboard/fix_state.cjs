const fs = require('fs');
const file = 'd:/service-marketplace/user-dashboard/src/pages/Services.jsx';
let content = fs.readFileSync(file, 'utf8').split('\n');

content.splice(174, 9,
  '  const [location, setLocation] = useState(() => { try { return JSON.parse(sessionStorage.getItem("servicesLocation")) || null; } catch { return null; } });',
  '  const [locationName, setLocationName] = useState(() => sessionStorage.getItem("servicesLocationName") || "Thiruvananthapuram");',
  '  const [selectedDistrict, setSelectedDistrict] = useState("Thiruvananthapuram");',
  '  const [districtPricingTiers, setDistrictPricingTiers] = useState(DEFAULT_DISTRICT_TIERS);',
  '  const [locationStatus, setLocationStatus] = useState(() => sessionStorage.getItem("servicesLocationStatus") || "idle");',
  '  const [locationError, setLocationError] = useState("");',
  '  const [booking, setBooking] = useState(null);',
  '  const [profileProfessional, setProfileProfessional] = useState(null);',
  '  const [showLocationModal, setShowLocationModal] = useState(false);',
  '',
  '  useEffect(() => {',
  '    if (location) {',
  '      sessionStorage.setItem("servicesLocation", JSON.stringify(location));',
  '      sessionStorage.setItem("servicesLocationStatus", "ready");',
  '    }',
  '  }, [location]);',
  '',
  '  useEffect(() => {',
  '    if (locationName) sessionStorage.setItem("servicesLocationName", locationName);',
  '  }, [locationName]);',
  '',
  '  useEffect(() => {',
  '    if (locationStatus) sessionStorage.setItem("servicesLocationStatus", locationStatus);',
  '  }, [locationStatus]);'
);

fs.writeFileSync(file, content.join('\n'));
