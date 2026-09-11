import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Link,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Tags
} from 'lucide-react';
import { categoryColors, categoryIcons, API } from '../constants';
import { BookingModal } from '../components/BookingModal';
import { useToast, Toast } from '../components/Toast';
import ServiceDetail from './ServiceDetail';

// Imported 20 exact category icons matching design
import plumbingIcon from '../assets/category-icons/plumbing.png';
import electricalIcon from '../assets/category-icons/electrical.png';
import acRepairIcon from '../assets/category-icons/ac_repair.png';
import carpentryIcon from '../assets/category-icons/carpentry.png';
import cleaningIcon from '../assets/category-icons/cleaning.png';
import paintingIcon from '../assets/category-icons/painting.png';
import mechanicIcon from '../assets/category-icons/mechanic.png';
import cctvIcon from '../assets/category-icons/cctv.png';
import applianceRepairIcon from '../assets/category-icons/appliance_repair.png';
import beautyWellnessIcon from '../assets/category-icons/beauty_wellness.png';
import tutoringIcon from '../assets/category-icons/tutoring.png';
import photographyIcon from '../assets/category-icons/photography.png';
import eventPlanningIcon from '../assets/category-icons/event_planning.png';
import landscapingIcon from '../assets/category-icons/landscaping.png';
import movingPackingIcon from '../assets/category-icons/moving_packing.png';
import homeRenovationIcon from '../assets/category-icons/home_renovation.png';
import itSupportIcon from '../assets/category-icons/it_support.png';
import languageClassesIcon from '../assets/category-icons/language_classes.png';
import petCareIcon from '../assets/category-icons/pet_care.png';
import otherServicesIcon from '../assets/category-icons/other_services.png';
import bannerWorkerImg from '../assets/category-icons/banner_worker.png';
import userAvatarImg from '../assets/category-icons/user_avatar.png';

// Fallback photographic assets for category detail showcases
import keralaCarpentry from '../assets/kerala/carpentry.jpg';
import keralaGardening from '../assets/kerala/gardening.jpg';
import keralaPlumbing from '../assets/kerala/plumbing.jpg';
import keralaElectrical from '../assets/kerala/electrical.jpg';
import keralaCleaning from '../assets/kerala/cleaning.jpg';
import keralaAcRepair from '../assets/kerala/ac_repair.jpg';
import keralaPainting from '../assets/kerala/painting.jpg';
import keralaCctv from '../assets/kerala/cctv.jpg';
import keralaHomeRepair from '../assets/kerala/home_repair.jpg';
import keralaComputerRepair from '../assets/kerala/computer_repair.jpg';
import keralaPhotography from '../assets/kerala/photography.jpg';
import keralaVehicle from '../assets/kerala/vehicle.jpg';

import gardeningFallback from '../assets/service-icons/gardening.jpg';
import acRepairFallback from '../assets/service-icons/ac-appliance-repair.jpg';
import cctvSecurityFallback from '../assets/service-icons/cctv-security.jpg';
import appliancesFallback from '../assets/service-icons/appliances.jpg';
import computerRepairFallback from '../assets/service-icons/computer-repair.jpg';
import carpentryFallback from '../assets/service-icons/carpentry.jpg';
import cleaningFallback from '../assets/service-icons/cleaning.jpg';
import electricalFallback from '../assets/service-icons/electrical.jpg';
import paintingFallback from '../assets/service-icons/painting.jpg';
import plumbingFallback from '../assets/service-icons/plumbing.jpg';

const scrollAppToTop = (behavior = 'smooth') => {
  document.querySelector('.app-content')?.scrollTo({ top: 0, behavior });
};

const categoryImages = {
  'Gardening & Landscaping': keralaGardening,
  'Gardening': keralaGardening,
  'AC & Appliance Repair': keralaAcRepair,
  'AC Repair': keralaAcRepair,
  'Appliances': keralaAcRepair,
  'CCTV & Security': keralaCctv,
  'Security': keralaCctv,
  'Computer & Mobile Repair': keralaComputerRepair,
  'Computer Repair': keralaComputerRepair,
  'Computer Repairing': keralaComputerRepair,
  'Carpentry': keralaCarpentry,
  'Cleaning': keralaCleaning,
  'Electrical': keralaElectrical,
  'Painting': keralaPainting,
  'Plumbing': keralaPlumbing,
  'Home Repair & Maintenance': keralaHomeRepair,
  'Photography & Videography': keralaPhotography,
  'Vehicle Services': keralaVehicle,
  'Vehicle Servicing': keralaVehicle,
  'Personal Care': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'Barber and Beautician Services': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
};

const localCategoryFallbacks = {
  'Gardening & Landscaping': gardeningFallback,
  'Gardening': gardeningFallback,
  'AC & Appliance Repair': acRepairFallback,
  'AC Repair': acRepairFallback,
  'CCTV & Security': cctvSecurityFallback,
  'Security': cctvSecurityFallback,
  'Appliances': appliancesFallback,
  'Computer & Mobile Repair': computerRepairFallback,
  'Computer Repair': computerRepairFallback,
  'Carpentry': carpentryFallback,
  'Cleaning': cleaningFallback,
  'Electrical': electricalFallback,
  'Painting': paintingFallback,
  'Plumbing': plumbingFallback,
  'Home Repair & Maintenance': keralaHomeRepair,
  'Photography & Videography': keralaPhotography,
  'Vehicle Services': keralaVehicle,
  'Personal Care': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'Barber and Beautician Services': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
};

// 20 Exact Categories from design image with respective professional counts & icons
const BROWSE_CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', count: '124 Professionals', icon: plumbingIcon, dbCategory: 'Plumbing', keywords: ['plumber', 'pipe', 'leak', 'drain', 'water', 'tap', 'sink', 'toilet'] },
  { id: 'electrical', name: 'Electrical', count: '98 Professionals', icon: electricalIcon, dbCategory: 'Electrical', keywords: ['electrician', 'wiring', 'switch', 'light', 'fan', 'fuse', 'power', 'socket'] },
  { id: 'ac_repair', name: 'AC Repair', count: '76 Professionals', icon: acRepairIcon, dbCategory: 'AC & Appliance Repair', keywords: ['ac', 'air conditioner', 'cooling', 'hvac', 'gas refill', 'servicing'] },
  { id: 'carpentry', name: 'Carpentry', count: '68 Professionals', icon: carpentryIcon, dbCategory: 'Carpentry', keywords: ['carpenter', 'wood', 'furniture', 'door', 'table', 'chair', 'cabinet'] },
  { id: 'cleaning', name: 'Cleaning', count: '142 Professionals', icon: cleaningIcon, dbCategory: 'Cleaning', keywords: ['maid', 'cleaner', 'deep clean', 'sanitize', 'mop', 'housekeeping', 'dusting'] },
  { id: 'painting', name: 'Painting', count: '58 Professionals', icon: paintingIcon, dbCategory: 'Painting', keywords: ['painter', 'wall', 'paint', 'whitewash', 'texture', 'interior', 'exterior'] },
  { id: 'mechanic', name: 'Mechanic', count: '71 Professionals', icon: mechanicIcon, dbCategory: 'Vehicle Services', keywords: ['car', 'bike', 'motor', 'vehicle', 'repair', 'auto', 'breakdown', 'garage'] },
  { id: 'cctv', name: 'CCTV Installation', count: '46 Professionals', icon: cctvIcon, dbCategory: 'CCTV & Security', keywords: ['cctv', 'camera', 'security', 'surveillance', 'monitoring', 'alarm'] },
  { id: 'appliance_repair', name: 'Appliance Repair', count: '63 Professionals', icon: applianceRepairIcon, dbCategory: 'AC & Appliance Repair', keywords: ['fridge', 'refrigerator', 'washing machine', 'microwave', 'oven', 'tv', 'appliance'] },
  { id: 'beauty_wellness', name: 'Beauty & Wellness', count: '52 Professionals', icon: beautyWellnessIcon, dbCategory: 'Personal Care', keywords: ['salon', 'spa', 'massage', 'haircut', 'facial', 'grooming', 'makeup', 'barber'] },
  { id: 'tutoring', name: 'Tutoring', count: '38 Professionals', icon: tutoringIcon, dbCategory: 'Computer & Mobile Repair', keywords: ['tutor', 'teacher', 'maths', 'science', 'tuition', 'coaching', 'study'] },
  { id: 'photography', name: 'Photography', count: '29 Professionals', icon: photographyIcon, dbCategory: 'Photography & Videography', keywords: ['photo', 'video', 'photographer', 'candid', 'wedding', 'event', 'shoot'] },
  { id: 'event_planning', name: 'Event Planning', count: '21 Professionals', icon: eventPlanningIcon, dbCategory: 'Personal Care', keywords: ['event', 'party', 'birthday', 'wedding', 'planner', 'stage', 'catering'] },
  { id: 'landscaping', name: 'Landscaping', count: '34 Professionals', icon: landscapingIcon, dbCategory: 'Gardening & Landscaping', keywords: ['garden', 'lawn', 'plants', 'trees', 'grass', 'irrigation', 'landscaping'] },
  { id: 'moving_packing', name: 'Moving & Packing', count: '27 Professionals', icon: movingPackingIcon, dbCategory: 'Home Repair & Maintenance', keywords: ['packers', 'movers', 'shifting', 'relocation', 'transport', 'cargo'] },
  { id: 'home_renovation', name: 'Home Renovation', count: '19 Professionals', icon: homeRenovationIcon, dbCategory: 'Home Repair & Maintenance', keywords: ['renovation', 'remodeling', 'tiles', 'masonry', 'contractor', 'upgrade'] },
  { id: 'it_support', name: 'IT & Computer Support', count: '42 Professionals', icon: itSupportIcon, dbCategory: 'Computer & Mobile Repair', keywords: ['computer', 'laptop', 'wifi', 'networking', 'windows', 'mac', 'printer', 'it'] },
  { id: 'language_classes', name: 'Language Classes', count: '16 Professionals', icon: languageClassesIcon, dbCategory: 'Computer & Mobile Repair', keywords: ['english', 'malayalam', 'hindi', 'french', 'german', 'ielts', 'learning'] },
  { id: 'pet_care', name: 'Pet Care', count: '24 Professionals', icon: petCareIcon, dbCategory: 'Personal Care', keywords: ['dog', 'cat', 'pet', 'grooming', 'vet', 'walking', 'boarding'] },
  { id: 'other_services', name: 'Other Services', count: '33 Professionals', icon: otherServicesIcon, dbCategory: 'Home Repair & Maintenance', keywords: ['other', 'misc', 'custom', 'handyman', 'general'] }
];

function Services({ navigate, initialGroup = null, initialCategory = null, user = null, unreadCount = 0 }) {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingPros, setLoadingPros] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('Thiruvananthapuram');
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');
  const [booking, setBooking] = useState(null);
  const [profileProfessional, setProfileProfessional] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcat, setSelectedSubcat] = useState(null);
  const [subcatProTab, setSubcatProTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast, showToast } = useToast();
  const nearbyLimitKm = 15;

  const calculateDistanceInKm = (firstLatitude, firstLongitude, secondLatitude, secondLongitude) => {
    if (![firstLatitude, firstLongitude, secondLatitude, secondLongitude].every(Number.isFinite)) return null;
    const earthRadiusKm = 6371;
    const latitudeDelta = (secondLatitude - firstLatitude) * Math.PI / 180;
    const longitudeDelta = (secondLongitude - firstLongitude) * Math.PI / 180;
    const latitude1 = firstLatitude * Math.PI / 180;
    const latitude2 = secondLatitude * Math.PI / 180;
    const haversine = Math.sin(latitudeDelta / 2) ** 2
      + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  };

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => showToast('Failed to load categories', 'error'))
      .finally(() => setLoadingCats(false));

    fetch(`${API}/subcategories`)
      .then(r => r.json())
      .then(data => setSubcategories(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load subcategories:', err));
  }, []);

  // Detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const current = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            placeName: ''
          };
          setLocation(current);
          setLocationStatus('ready');

          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${current.latitude}&lon=${current.longitude}&zoom=12`)
            .then(res => res.json())
            .then(data => {
              const addr = data.address || {};
              const place = addr.city || addr.town || addr.village || addr.county || addr.state_district || 'Thiruvananthapuram';
              setLocationName(place);
              setLocation(prev => prev ? { ...prev, placeName: data.display_name || place } : prev);
            })
            .catch(() => {});
        },
        () => {
          setLocationStatus('denied');
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    }
  }, []);

  const requestLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location services are not supported by this browser.'));
      return;
    }

    setLocationStatus('requesting');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          placeName: ''
        };
        setLocation(current);
        setLocationStatus('ready');
        resolve(current);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${current.latitude}&lon=${current.longitude}&zoom=18&addressdetails=1`)
          .then(response => {
            if (!response.ok) throw new Error('Reverse geocoding failed');
            return response.json();
          })
          .then(data => {
            const addr = data.address || {};
            const place = addr.city || addr.town || addr.village || addr.county || addr.state_district || 'Thiruvananthapuram';
            setLocationName(place);
            setLocation(prev => prev ? { ...prev, placeName: data.display_name || place } : prev);
          })
          .catch(() => {});
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Please allow location access in your browser to find professionals near you.'
          : 'We could not retrieve your current location. Please try again.';
        setLocationStatus('denied');
        setLocationError(message);
        reject(new Error(message));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });

  const selectCategory = async (cat) => {
    setSelected(cat);
    setProfessionals([]);
    setLoadingPros(true);
    
    if (!location && locationStatus !== 'requesting' && locationStatus !== 'denied') {
      requestLocation().catch(() => {});
    }

    try {
      const query = new URLSearchParams({ category: cat.name });
      const res = await fetch(`${API}/professionals?${query}`);
      const data = await res.json();
      setProfessionals(Array.isArray(data) ? data.map(professional => ({
        ...professional,
        distance_from_user: location ? calculateDistanceInKm(
          location.latitude,
          location.longitude,
          Number(professional.effective_latitude || professional.current_latitude || professional.registered_latitude),
          Number(professional.effective_longitude || professional.current_longitude || professional.registered_longitude)
        ) : null,
      })) : []);
    } catch {
      showToast('Failed to load professionals', 'error');
    } finally {
      setLoadingPros(false);
    }
  };

  const handleCategoryCardClick = (item) => {
    setSelectedSubcat(null);
    const matched = categories.find(
      c => c.name.toLowerCase() === item.dbCategory.toLowerCase()
    );
    selectCategory(matched || { id: item.dbCategory, name: item.dbCategory });
    scrollAppToTop();
  };

  const handleOpenSubcatPros = (subcat) => {
    const targetCat = categories.find(c => c.name.toLowerCase() === subcat.category_name?.toLowerCase()) || {
      id: subcat.category_name,
      name: subcat.category_name
    };
    if (!selected || selected.name?.toLowerCase() !== subcat.category_name?.toLowerCase()) {
      selectCategory(targetCat);
    }
    setSelectedSubcat(subcat);
    setSubcatProTab('all');
    scrollAppToTop();
  };

  useEffect(() => {
    if (!initialCategory || categories.length === 0 || selected?.name === initialCategory) return;
    const category = categories.find(item => item.name === initialCategory);
    if (category) {
      selectCategory(category);
    }
  }, [categories, initialCategory]);

  useEffect(() => {
    if (location && professionals.length > 0 && professionals.some(p => p.distance_from_user == null)) {
      setProfessionals(prev => prev.map(pro => ({
        ...pro,
        distance_from_user: calculateDistanceInKm(
          location.latitude,
          location.longitude,
          Number(pro.effective_latitude || pro.current_latitude || pro.registered_latitude),
          Number(pro.effective_longitude || pro.current_longitude || pro.registered_longitude)
        )
      })));
    }
  }, [location]);

  const mapUrl = location ? (() => {
    const delta = 0.01;
    const { latitude, longitude } = location;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  })() : '';

  const handleRequestSuccess = () => {
    setBooking(null);
    showToast('Your service request was submitted successfully! 🎉');
    navigate && navigate('requests');
  };

  const nearbyProfessionals = professionals.filter(
    professional => professional.distance_from_user != null && professional.distance_from_user <= nearbyLimitKm
  );

  // Filter 20 cards based on user search query
  const filteredBrowseCategories = BROWSE_CATEGORIES.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(q) ||
      item.dbCategory.toLowerCase().includes(q) ||
      (item.keywords && item.keywords.some(k => k.toLowerCase().includes(q)))
    );
  });

  const renderProfessionalCard = (pro, allowDirectBooking = false) => (
    <div key={pro.id} className="pro-card fade-up">
      <div className="pro-header">
        <div className="pro-avatar">
          {pro.profile_photo ? <img src={pro.profile_photo} alt={pro.full_name} /> : pro.full_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="pro-name">{pro.full_name}</div>
          <span className="pro-category">{pro.category}</span>
        </div>
      </div>
      <div className="pro-meta">
        <span>📍 {pro.city || 'Kerala'}{pro.state ? `, ${pro.state}` : ''}</span>
        <span>⭐ {pro.experience_years || 1}y exp</span>
      </div>
      {pro.distance_from_user != null && (
        <div className="pro-distance">
          <MapPin size={14} /> {pro.distance_from_user < 1 ? `${Math.round(pro.distance_from_user * 1000)} m away` : `${pro.distance_from_user.toFixed(2)} km away`}
        </div>
      )}
      {pro.bio && <div className="pro-bio">{pro.bio}</div>}
      {allowDirectBooking && (
        <div className="professional-card-actions">
          <button className="btn-profile" onClick={() => setProfileProfessional(pro)}>View profile</button>
          <button className="btn-hire" onClick={() => setBooking({ professional: pro, category: selected.name, location })}>Book this professional</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container" style={{ padding: 0 }}>
      {/* =========================================================================
          VIEW 1: Browse by Category Screen (Matching User's Attached Design)
          ========================================================================= */}
      {!selected && (
        <div className="services-browse-page">
          {/* Top Location & User Bar */}
          <div className="browse-topbar">
            <button
              type="button"
              className="browse-location-box"
              onClick={() => setShowLocationModal(true)}
              title="Click to view or change location"
            >
              <div className="browse-location-icon-wrap">
                <MapPin size={18} />
              </div>
              <div className="browse-location-info">
                <h4 className="browse-location-title">
                  <span>{locationName}</span>
                  <ChevronDown size={14} />
                </h4>
                <p className="browse-location-sub">Find trusted professionals near you</p>
              </div>
            </button>

            <div className="browse-topbar-actions">
              <button
                type="button"
                className="browse-bell-btn"
                onClick={() => navigate('notifications')}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="browse-bell-badge" />}
              </button>

              <button
                type="button"
                className="browse-user-avatar-btn"
                onClick={() => navigate('profile')}
                title="My Profile"
              >
                <img
                  src={user?.profile_photo || userAvatarImg}
                  alt={user?.full_name || 'User Profile'}
                  className="browse-user-avatar-img"
                />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="browse-search-wrap">
            <div className="browse-search-bar">
              <Search size={17} className="browse-search-icon" />
              <input
                type="text"
                className="browse-search-input"
                placeholder="Search for services (e.g. plumber, electrician, cleaning...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="browse-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Section Heading Row with Back Button */}
          <div className="browse-heading-row">
            <div>
              <h2 className="browse-heading-title">Browse by Category</h2>
              <p className="browse-heading-subtitle">Choose from a wide range of services</p>
            </div>
            <button
              type="button"
              className="browse-back-btn"
              onClick={() => navigate('home')}
              title="Back to Home"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </div>

          {/* 2-Column Category Cards Grid */}
          <div className="browse-category-grid">
            {filteredBrowseCategories.map((item) => (
              <div
                key={item.id}
                className="browse-category-card"
                onClick={() => handleCategoryCardClick(item)}
              >
                <div className="browse-card-icon-wrap">
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="browse-card-icon-img"
                    loading="lazy"
                  />
                </div>
                <div className="browse-card-text">
                  <h3 className="browse-card-title">{item.name}</h3>
                  <p className="browse-card-count">{item.count}</p>
                </div>
                <ChevronRight size={16} className="browse-card-chevron" />
              </div>
            ))}

            {filteredBrowseCategories.length === 0 && (
              <div className="browse-search-empty">
                <h4>No services matching &ldquo;{searchQuery}&rdquo;</h4>
                <p>Try searching for other terms like plumbing, AC, electrician, or cleaning.</p>
                <button
                  type="button"
                  className="browse-search-empty-btn"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Bottom Promo Banner */}
          <div className="browse-promo-banner">
            <div className="browse-promo-left">
              <div className="browse-promo-worker-wrap">
                <img
                  src={bannerWorkerImg}
                  alt="Service Professional"
                  className="browse-promo-worker-img"
                />
              </div>
              <div className="browse-promo-text">
                <h4 className="browse-promo-title">Need a Service Today?</h4>
                <p className="browse-promo-subtitle">
                  Book in just a few taps and get your work done without any hassle.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="browse-promo-btn"
              onClick={() => {
                const defaultCat = categories[0]?.name || 'Plumbing';
                setBooking({ professional: null, category: defaultCat, location });
              }}
            >
              <span>Book Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: Service Detail Page (category selected)
          ========================================================================= */}
      {selected && !selectedSubcat && (() => {
        const browseItem = BROWSE_CATEGORIES.find(
          item => item.dbCategory.toLowerCase() === selected.name?.toLowerCase()
        );
        const catSubcats = subcategories.filter(
          s => s.category_name?.toLowerCase() === selected.name?.toLowerCase()
        );
        const heroImage = categoryImages[selected.name]
          || localCategoryFallbacks[selected.name]
          || catSubcats[0]?.image_url;

        return (
          <ServiceDetail
            category={selected}
            categoryIcon={browseItem?.icon}
            heroImage={heroImage}
            subcategories={catSubcats}
            professionals={professionals}
            loadingPros={loadingPros}
            location={location}
            onBack={() => { setSelectedSubcat(null); setSelected(null); scrollAppToTop(); }}
            onBookService={() => setBooking({ professional: null, category: selected.name, location })}
            onBookProfessional={(pro) => setBooking({ professional: pro, category: selected.name, location })}
            onViewProfile={(pro) => setProfileProfessional(pro)}
            onSeeAllProfessionals={() => navigate?.('professionals', null, selected.name)}
            onSubcategoryClick={(sub) => setBooking({
              professional: null,
              category: selected.name,
              location,
              initialTitle: sub.name,
              initialDescription: `I need assistance with ${sub.name} (${sub.price_estimate || 'Standard rate'}).`,
            })}
          />
        );
      })()}

      {/* =========================================================================
          VIEW 3: Dedicated Sub-Category Pros Page
          ========================================================================= */}
      {selected && selectedSubcat && (() => {
        const catColor = categoryColors[selected.name] || 'var(--accent-primary)';
        const accentStyle = {
          '--subcat-accent-color': catColor,
          '--subcat-accent-bg': `${catColor}15`,
          '--subcat-accent-border': `${catColor}35`,
          '--subcat-accent-glow': `${catColor}20`,
          '--subcat-accent-shadow': `${catColor}40`,
        };
        const displayedPros = subcatProTab === 'nearby' ? nearbyProfessionals : professionals;

        return (
          <div style={{ padding: '16px 16px 36px', maxWidth: 1080, margin: '0 auto' }}>
            <div className="subcat-pros-page fade-up" style={accentStyle}>
              {/* Top Navigation Bar */}
              <div className="subcat-pros-nav-bar">
                <button className="subcat-pros-back-btn" onClick={() => setSelectedSubcat(null)}>
                  <ArrowLeft size={16} /> Back to {selected.name}
                </button>
                <div className="subcat-pros-breadcrumb">
                  <span style={{ cursor: 'pointer' }} onClick={() => { setSelected(null); setSelectedSubcat(null); }}>Services</span>
                  <span>/</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => setSelectedSubcat(null)}>{selected.name}</span>
                  <span>/</span>
                  <span className="active">{selectedSubcat.name}</span>
                </div>
              </div>

              {/* Hero Showcase Card */}
              <div className="subcat-pros-hero">
                <div className="subcat-pros-hero-image-wrap">
                  <img
                    src={selectedSubcat.image_url}
                    alt={selectedSubcat.name}
                    className="subcat-pros-hero-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = categoryImages[selected.name] || localCategoryFallbacks[selected.name];
                    }}
                  />
                  {selectedSubcat.price_estimate && (
                    <span className="subcat-pros-hero-badge">{selectedSubcat.price_estimate}</span>
                  )}
                </div>
                <div className="subcat-pros-hero-body">
                  <div className="subcat-pros-hero-eyebrow">
                    <Sparkles size={13} /> {selected.name} SPECIALIST DIRECTORY
                  </div>
                  <h2 className="subcat-pros-hero-title">{selectedSubcat.name}</h2>
                  <p className="subcat-pros-hero-desc">
                    Showing verified professionals equipped for <strong>{selectedSubcat.name}</strong>.
                  </p>
                  <div className="subcat-pros-hero-actions">
                    <button
                      className="btn-subcat-hero-book"
                      onClick={() => setBooking({
                        professional: null,
                        category: selected.name,
                        location,
                        initialTitle: selectedSubcat.name,
                        initialDescription: `I need assistance with ${selectedSubcat.name} (${selectedSubcat.price_estimate || 'Standard rate'}).`
                      })}
                    >
                      <Sparkles size={14} /> Direct Book This Service
                    </button>
                  </div>
                </div>
              </div>

              {/* Specialists Section */}
              <div className="subcat-pros-section-header">
                <div className="subcat-pros-header-title">
                  <h3>Verified Specialists for {selectedSubcat.name}</h3>
                  <p>Licensed & certified professionals ready to assist you.</p>
                </div>
                <div className="subcat-pros-tabs">
                  <button
                    className={`subcat-pros-tab-btn ${subcatProTab === 'all' ? 'active' : ''}`}
                    onClick={() => setSubcatProTab('all')}
                  >
                    All Specialists ({professionals.length})
                  </button>
                  <button
                    className={`subcat-pros-tab-btn ${subcatProTab === 'nearby' ? 'active' : ''}`}
                    onClick={() => setSubcatProTab('nearby')}
                  >
                    Nearby &le; {nearbyLimitKm}km ({nearbyProfessionals.length})
                  </button>
                </div>
              </div>

              {loadingPros ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <RefreshCw className="spin" size={32} color={catColor} />
                </div>
              ) : displayedPros.length === 0 ? (
                <div className="subcat-pros-empty fade-up">
                  <div className="subcat-pros-empty-icon">🔍</div>
                  <h4>No verified specialists found {subcatProTab === 'nearby' ? `within ${nearbyLimitKm} km` : 'in this category yet'}</h4>
                  <p>
                    {subcatProTab === 'nearby'
                      ? `No registered specialists were detected within ${nearbyLimitKm} km of your location.`
                      : `No registered professionals are currently listed for this category.`}
                  </p>
                  <button
                    className="btn-subcat-hero-book"
                    onClick={() => setBooking({
                      professional: null,
                      category: selected.name,
                      location,
                      initialTitle: selectedSubcat.name,
                      initialDescription: `I need assistance with ${selectedSubcat.name} (${selectedSubcat.price_estimate || 'Standard rate'}).`
                    })}
                  >
                    <Sparkles size={14} /> Post Request For This Service
                  </button>
                </div>
              ) : (
                <div className="subcat-pros-grid">
                  {displayedPros.map((pro) => (
                    <div key={pro.id} className="subcat-pro-card fade-up">
                      <div className="subcat-pro-card-accent-bar" />
                      <div className="subcat-pro-card-header">
                        <div className="subcat-pro-avatar">
                          {pro.profile_photo ? (
                            <img src={pro.profile_photo} alt={pro.full_name} />
                          ) : (
                            pro.full_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="subcat-pro-info">
                          <div className="subcat-pro-name">{pro.full_name}</div>
                          <span className="subcat-pro-specialty-badge">
                            <CheckCircle2 size={11} /> {selectedSubcat.name} Pro
                          </span>
                        </div>
                      </div>

                      <div className="subcat-pro-meta-row">
                        <div className="subcat-pro-meta-item">
                          <span>⭐ {pro.experience_years || 1}y experience</span>
                        </div>
                        {pro.distance_from_user != null && (
                          <div className="subcat-pro-distance-badge">
                            <MapPin size={13} />
                            <span>
                              {pro.distance_from_user < 1
                                ? `${Math.round(pro.distance_from_user * 1000)}m away`
                                : `${pro.distance_from_user.toFixed(1)} km away`}
                            </span>
                          </div>
                        )}
                      </div>

                      {pro.bio && <div className="subcat-pro-bio">{pro.bio}</div>}

                      <div className="subcat-pro-card-actions">
                        <button
                          type="button"
                          className="btn-subcat-pro-profile"
                          onClick={() => setProfileProfessional(pro)}
                        >
                          Profile
                        </button>
                        <button
                          type="button"
                          className="btn-subcat-pro-book"
                          onClick={() => setBooking({
                            professional: pro,
                            category: selected.name,
                            location,
                            initialTitle: selectedSubcat.name,
                            initialDescription: `Booking ${pro.full_name} for ${selectedSubcat.name} (${selectedSubcat.price_estimate || 'Standard rate'}).`
                          })}
                        >
                          <Sparkles size={13} /> Book Specialist
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="location-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Your Location</h2>
              <button
                className="modal-close"
                onClick={() => setShowLocationModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="location-info-card">
                <div className="location-info-icon">
                  <MapPin size={24} />
                </div>
                <div className="location-info-text">
                  <h3>Current Location</h3>
                  <p>{locationStatus === 'ready'
                    ? `${location?.placeName || locationName} (accuracy ~${location?.accuracy || 10}m)`
                    : 'Enable location to see nearby professionals'}</p>
                </div>
              </div>

              {locationStatus !== 'ready' && (
                <button
                  className="btn-enable-location"
                  onClick={() => {
                    requestLocation().catch(() => {});
                  }}
                  disabled={locationStatus === 'requesting'}
                >
                  {locationStatus === 'requesting' ? <RefreshCw size={16} className="spin" /> : <MapPin size={16} />}
                  {locationStatus === 'requesting' ? 'Finding your location...' : 'Enable Location Access'}
                </button>
              )}

              {locationError && <p className="location-modal-error">{locationError}</p>}

              {location && (
                <div className="location-map-container">
                  <iframe
                    title="Your current location"
                    className="location-map-modal"
                    src={mapUrl}
                    loading="lazy"
                  />
                  <p className="map-info"><strong>{location.placeName || locationName}</strong> is shown on the map.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking modal */}
      {booking && (
        <BookingModal
          professional={booking.professional}
          category={booking.category}
          currentLocation={booking.location}
          initialTitle={booking.initialTitle || ''}
          initialDescription={booking.initialDescription || ''}
          onClose={() => setBooking(null)}
          onSuccess={handleRequestSuccess}
        />
      )}

      {/* Professional Profile Modal */}
      {profileProfessional && (
        <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && setProfileProfessional(null)}>
          <div className="modal profile-modal fade-up">
            <div className="profile-modal-header">
              <div className="profile-modal-avatar">
                {profileProfessional.profile_photo ? (
                  <img src={profileProfessional.profile_photo} alt={profileProfessional.full_name} />
                ) : (
                  profileProfessional.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="modal-title">{profileProfessional.full_name}</h2>
                <span className="pro-category">{profileProfessional.category}</span>
              </div>
              <button className="profile-close-btn" onClick={() => setProfileProfessional(null)} aria-label="Close profile">&times;</button>
            </div>
            <div className="profile-details">
              <div><BriefcaseBusiness size={16} /><strong>Experience</strong><span>{profileProfessional.experience_years || 0} years</span></div>
              <div><CheckCircle2 size={16} /><strong>Completed work</strong><span>{profileProfessional.completed_requests || 0} jobs</span></div>
              <div><MapPin size={16} /><strong>Location</strong><span>{[profileProfessional.city, profileProfessional.state].filter(Boolean).join(', ') || 'Kerala'}</span></div>
              {profileProfessional.distance_from_user != null && <div><MapPin size={16} /><strong>Distance</strong><span>{profileProfessional.distance_from_user.toFixed(2)} km away</span></div>}
            </div>
            <div className="profile-social-row">
              <span><Star size={16} fill="currentColor" /> Verified professional</span>
              {profileProfessional.instagram_url && <a href={profileProfessional.instagram_url} target="_blank" rel="noreferrer"><Link size={16} /> Instagram</a>}
            </div>
            <div className="profile-bio-block">
              <strong>About this professional</strong>
              <p>{profileProfessional.bio || 'No professional bio provided.'}</p>
            </div>
            <button className="btn-hire" onClick={() => { setProfileProfessional(null); setBooking({ professional: profileProfessional, category: selected?.name || profileProfessional.category, location }); }}>Book this professional</button>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default Services;
