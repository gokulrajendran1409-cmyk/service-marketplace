import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Hammer,
  Home,
  Link,
  MapPin,
  Monitor,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Tags,
  Wrench
} from 'lucide-react';
import { categoryColors, categoryIcons, API } from '../constants';
import { BookingModal } from '../components/BookingModal';
import { useToast, Toast } from '../components/Toast';
import { useTranslation } from 'react-i18next';
import ServiceDetail from './ServiceDetail';
import SubcategorySlideshow from '../components/SubcategorySlideshow';
import userAvatarImg from '../assets/category-icons/user_avatar.png';

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

const PROFESSION_LABELS = {
  'Plumbing': 'Plumber',
  'AC & Appliances': 'AC & Appliance Tech',
  'Cleaning': 'Cleaner',
  'Pest Control': 'Pest Control Expert',
  'Home Improvement': 'Renovation Specialist',
  'Vehicle': 'Mechanic',
  'Personal & Daily Help': 'Assistant / Specialist',
  'Electrical': 'Electrician',
  'CCTV & Security': 'Security Tech',
  'Gardening & Landscaping': 'Gardener',
  'Computer & Mobile Repair': 'IT Tech',
  'Photography & Videography': 'Photographer',
  'Personal Care': 'Beauty Professional',
};

const getProfessionLabel = (category) => PROFESSION_LABELS[category] || category || 'Professional';
const scrollAppToTop = (behavior = 'smooth') => {
  document.querySelector('.app-content')?.scrollTo({ top: 0, behavior });
};

const categoryImages = {
  'Plumbing': keralaPlumbing,
  'AC & Appliances': keralaAcRepair,
  'Cleaning': keralaCleaning,
  'Pest Control': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
  'Home Improvement': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  'Vehicle': keralaVehicle,
  'Personal & Daily Help': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'Electrical': keralaElectrical,
  'CCTV & Security': keralaCctv,
  'Gardening & Landscaping': keralaGardening,
  'Computer & Mobile Repair': keralaComputerRepair,
  'Photography & Videography': keralaPhotography,
  'Personal Care': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
};

const localCategoryFallbacks = {
  'Plumbing': plumbingFallback,
  'AC & Appliances': acRepairFallback,
  'Cleaning': cleaningFallback,
  'Pest Control': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
  'Home Improvement': paintingFallback,
  'Vehicle': keralaVehicle,
  'Personal & Daily Help': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'Electrical': electricalFallback,
  'CCTV & Security': cctvSecurityFallback,
  'Gardening & Landscaping': gardeningFallback,
  'Computer & Mobile Repair': computerRepairFallback,
  'Photography & Videography': keralaPhotography,
  'Personal Care': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
};

// Clean, non-duplicated active service categories with real-time professional counts & icons
const BROWSE_CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', count: '110+ Professionals', icon: plumbingIcon, dbCategory: 'Plumbing', group: 'Home & Improvement', keywords: ['plumbing', 'plumber', 'pipe', 'leak', 'burst', 'tap', 'faucet', 'drain', 'toilet', 'cistern', 'geyser', 'water tank', 'motor', 'pump'] },
  { id: 'ac_appliances', name: 'AC & Appliances', count: '85+ Professionals', icon: applianceRepairIcon, dbCategory: 'AC & Appliances', group: 'AC & Appliances', keywords: ['ac & appliances', 'ac service', 'ac repair', 'refrigerator', 'washing machine', 'microwave', 'geyser', 'tv', 'ro', 'water purifier'] },
  { id: 'cleaning', name: 'Cleaning', count: '142 Professionals', icon: cleaningIcon, dbCategory: 'Cleaning', group: 'Cleaning & Pest', keywords: ['cleaning', 'full house cleaning', 'bathroom cleaning', 'kitchen cleaning', 'sofa cleaning', 'carpet cleaning', 'move-in', 'move-out cleaning', 'maid'] },
  { id: 'pest_control', name: 'Pest Control', count: '45+ Professionals', icon: petCareIcon, dbCategory: 'Pest Control', group: 'Cleaning & Pest', keywords: ['pest control', 'cockroach', 'termite', 'mosquito', 'rodent', 'general pest control', 'bugs', 'insects'] },
  { id: 'home_improvement', name: 'Home Improvement', count: '60+ Professionals', icon: paintingIcon, dbCategory: 'Home Improvement', group: 'Home & Improvement', keywords: ['home improvement', 'painting', 'wall repair', 'tile work', 'waterproofing', 'wallpaper', 'false ceiling'] },
  { id: 'vehicle', name: 'Vehicle', count: '75+ Professionals', icon: mechanicIcon, dbCategory: 'Vehicle', group: 'Vehicle Care', keywords: ['vehicle', 'bike mechanic', 'car mechanic', 'car wash', 'detailing', 'battery', 'jump-start', 'tyre', 'puncture service', 'vehicle recovery', 'recovery', 'towing', 'breakdown'] },
  { id: 'personal_daily_help', name: 'Personal & Daily Help', count: '65+ Professionals', icon: beautyWellnessIcon, dbCategory: 'Personal & Daily Help', group: 'Personal & Daily Help', keywords: ['personal & daily help', 'barber', 'beauty services', 'home tutor', 'cook', 'elder care', 'babysitter', 'driver'] },
  { id: 'electrical', name: 'Electrical', count: '98 Professionals', icon: electricalIcon, dbCategory: 'Electrical', group: 'Home & Improvement', keywords: ['electrician', 'wiring', 'switch', 'light', 'fan', 'fuse', 'power', 'socket'] },
  { id: 'cctv', name: 'CCTV & Security', count: '46 Professionals', icon: cctvIcon, dbCategory: 'CCTV & Security', group: 'Home & Improvement', keywords: ['cctv', 'camera', 'security', 'surveillance', 'monitoring', 'alarm'] },
  { id: 'gardening', name: 'Gardening & Landscaping', count: '34 Professionals', icon: landscapingIcon, dbCategory: 'Gardening & Landscaping', group: 'Personal & Daily Help', keywords: ['garden', 'lawn', 'plants', 'trees', 'grass', 'irrigation', 'landscaping'] },
  { id: 'computer_repair', name: 'Computer & Mobile Repair', count: '42 Professionals', icon: itSupportIcon, dbCategory: 'Computer & Mobile Repair', group: 'Digital & Media', keywords: ['computer', 'laptop', 'mobile', 'wifi', 'networking', 'windows', 'mac', 'printer', 'it'] },
  { id: 'photography', name: 'Photography & Videography', count: '29 Professionals', icon: photographyIcon, dbCategory: 'Photography & Videography', group: 'Digital & Media', keywords: ['photo', 'video', 'photographer', 'candid', 'wedding', 'event', 'shoot'] },
  { id: 'personal_care', name: 'Personal Care', count: '52 Professionals', icon: beautyWellnessIcon, dbCategory: 'Personal Care', group: 'Personal & Daily Help', keywords: ['salon', 'spa', 'massage', 'haircut', 'facial', 'grooming', 'makeup', 'barber'] },
];

const DISTRICT_CENTERS = {
  Ernakulam: { latitude: 9.9816, longitude: 76.2999 },
  Thiruvananthapuram: { latitude: 8.5241, longitude: 76.9366 },
  Kozhikode: { latitude: 11.2588, longitude: 75.7804 },
  Thrissur: { latitude: 10.5276, longitude: 76.2144 },
  Kollam: { latitude: 8.8932, longitude: 76.6141 },
  Alappuzha: { latitude: 9.4981, longitude: 76.3388 },
  Kottayam: { latitude: 9.5916, longitude: 76.5222 },
  Malappuram: { latitude: 11.0510, longitude: 76.0711 },
  Kasaragod: { latitude: 12.4996, longitude: 74.9869 },
  Pathanamthitta: { latitude: 9.2648, longitude: 76.7870 },
  Idukki: { latitude: 9.8494, longitude: 76.9804 },
  Wayanad: { latitude: 11.6854, longitude: 76.1320 },
  Kannur: { latitude: 11.8745, longitude: 75.3704 },
  Palakkad: { latitude: 10.7867, longitude: 76.6548 },
};

const DEFAULT_DISTRICT_TIERS = {
  Kasaragod: { markup: 0, tier: 'Current Pricing (0%)' },
  Pathanamthitta: { markup: 0, tier: 'Current Pricing (0%)' },
  Idukki: { markup: 0, tier: 'Current Pricing (0%)' },
  Wayanad: { markup: 0, tier: 'Current Pricing (0%)' },
  Kannur: { markup: 0, tier: 'Current Pricing (0%)' },
  Palakkad: { markup: 0, tier: 'Current Pricing (0%)' },
  Thrissur: { markup: 20, tier: '20% Increased Price' },
  Kollam: { markup: 20, tier: '20% Increased Price' },
  Alappuzha: { markup: 20, tier: '20% Increased Price' },
  Kottayam: { markup: 20, tier: '20% Increased Price' },
  Malappuram: { markup: 20, tier: '20% Increased Price' },
  Ernakulam: { markup: 30, tier: '30% Increased Price' },
  Thiruvananthapuram: { markup: 30, tier: '30% Increased Price' },
  Kozhikode: { markup: 30, tier: '30% Increased Price' },
};

function Services({ navigate, initialGroup = null, initialCategory = null, user = null, unreadCount = 0 }) {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingSubcats, setLoadingSubcats] = useState(true);
  const [loadingPros, setLoadingPros] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('Thiruvananthapuram');
  const [selectedDistrict, setSelectedDistrict] = useState('Thiruvananthapuram');
  const [districtPricingTiers, setDistrictPricingTiers] = useState(DEFAULT_DISTRICT_TIERS);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');
  const [booking, setBooking] = useState(null);
  const [profileProfessional, setProfileProfessional] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcat, setSelectedSubcat] = useState(null);
  const [subcatProTab, setSubcatProTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState(initialGroup || 'all');
  const { toast, showToast } = useToast();
  const { t, i18n } = useTranslation();
  const nearbyLimitKm = 15;

  useEffect(() => {
    fetch(`${API}/district-pricing`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const map = {};
          data.forEach(item => {
            map[item.district] = {
              markup: Number(item.markup_percentage) || 0,
              tier: item.tier_name,
            };
          });
          setDistrictPricingTiers(prev => ({ ...prev, ...map }));
        }
      })
      .catch(err => console.error('Failed to load district pricing in Services:', err));
  }, []);

  const handleSelectDistrict = (dist) => {
    setSelectedDistrict(dist);
    setLocationName(dist);
    const center = DISTRICT_CENTERS[dist];
    const newLoc = center
      ? { latitude: center.latitude, longitude: center.longitude, placeName: dist, district: dist }
      : { placeName: dist, district: dist };
    setLocation(newLoc);
    setLocationStatus('ready');
    if (selected) {
      selectCategory(selected, dist, newLoc);
    }
  };

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

  const loadCategoriesAndSubcategories = () => {
    fetch(`${API}/categories?lang=${i18n.language}`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => showToast('Failed to load categories', 'error'))
      .finally(() => setLoadingCats(false));

    fetch(`${API}/subcategories?lang=${i18n.language}`)
      .then(r => r.json())
      .then(data => setSubcategories(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load subcategories:', err))
      .finally(() => setLoadingSubcats(false));
  };

  useEffect(() => {
    loadCategoriesAndSubcategories();

    const handleFocus = () => {
      loadCategoriesAndSubcategories();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [i18n.language]);

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

        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${current.latitude}&longitude=${current.longitude}&localityLanguage=en`)
          .then(response => {
            if (!response.ok) throw new Error('Reverse geocoding failed');
            return response.json();
          })
          .then(data => {
            const place = data.locality || data.city || data.principalSubdivision || 'Thiruvananthapuram';
            setLocationName(place);
            setLocation(prev => prev ? { ...prev, placeName: place } : prev);
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

  const selectCategory = async (cat, targetDistrict = selectedDistrict, targetLoc = location) => {
    setSelected(cat);
    setProfessionals([]);
    setLoadingPros(true);
    
    if (!targetLoc && locationStatus !== 'requesting' && locationStatus !== 'denied') {
      requestLocation().catch(() => {});
    }

    try {
      const query = new URLSearchParams({ category: cat.name });
      if (targetDistrict) query.set('district', targetDistrict);
      if (targetLoc?.latitude && targetLoc?.longitude) {
        query.set('latitude', targetLoc.latitude);
        query.set('longitude', targetLoc.longitude);
      }
      const res = await fetch(`${API}/professionals?${query}`);
      const data = await res.json();
      setProfessionals(Array.isArray(data) ? data.map(professional => ({
        ...professional,
        distance_from_user: targetLoc ? calculateDistanceInKm(
          targetLoc.latitude,
          targetLoc.longitude,
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

  // Filter cards based on activeGroup and search query
  const filteredBrowseCategories = BROWSE_CATEGORIES.filter(item => {
    // 1. Filter by Active Group
    if (activeGroup !== 'all' && item.group !== activeGroup) {
      return false;
    }
    // 2. Filter by Search Query
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
          {pro.profile_photo ? (
            <img 
              src={pro.profile_photo} 
              alt={pro.full_name} 
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }}
            />
          ) : null}
          <span style={{ display: pro.profile_photo ? 'none' : 'inline' }}>
            {pro.full_name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="pro-name">{pro.full_name}</div>
          <span className="pro-category">{getProfessionLabel(pro.category)}</span>
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
    <div className="page-container">
      {/* Location Status Badge */}
      <div className="location-badge-container">
        <button 
          className={`location-badge ${locationStatus === 'ready' ? 'ready' : 'pending'}`}
          onClick={() => setShowLocationModal(true)}
        >
          <MapPin size={16} />
          <span>
            {location?.placeName || locationName}
            {districtPricingTiers[selectedDistrict]?.markup > 0
              ? ` (+${districtPricingTiers[selectedDistrict].markup}% Surge)`
              : ''}
          </span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="page-header" style={{ padding: '16px 16px 8px' }}>
        <div className="services-heading-row" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '10px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-title" style={{ fontSize: 'clamp(18px, 5vw, 20px)', fontWeight: '800', color: '#1e293b', margin: '0 0 4px', lineHeight: 1.2 }}>
              {t('services.browse_by_category')}
            </h1>
            <p className="page-subtitle" style={{ fontSize: 'clamp(11px, 3.5vw, 13px)', color: '#64748b', margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('services.choose_wide_range')}
            </p>
          </div>
          
          <button 
            onClick={() => navigate && navigate('home')} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#0F9D95',
              fontWeight: '700',
              fontSize: '14px',
              padding: '0',
              flexShrink: 0,
              marginTop: '2px'
            }}
            title="Back to Home"
          >
            <ArrowLeft size={16} /> {t('services.back')}
          </button>
        </div>
      </div>

      {/* Top Search Bar */}
      {!selected && (
        <div className="hn-search-wrap" style={{ margin: '0 16px 16px', padding: '0', borderBottom: 'none', background: 'transparent' }}>
          <div className="hn-search-bar" style={{ background: '#ffffff' }}>
            <Search size={17} className="hn-search-icon" />
            <input
              type="text"
              className="hn-search-input"
              placeholder={t('services.search_subcat')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: '#AEAEC0', fontSize: '20px', cursor: 'pointer', padding: '0 4px' }}
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Categories Showcase */}
      {!selected && (
        <div className="services-main-browse-wrap">

          {/* Categories Grid */}
          <div className="browse-category-grid">
            {filteredBrowseCategories.length > 0 ? (
              filteredBrowseCategories.map((item, idx) => {
                const dbCat = categories.find(c => c.original_name === item.dbCategory || c.name === item.dbCategory);
                const actualCount = dbCat?.professional_count || 0;
                const displayName = dbCat?.name || item.name;
                
                return (
                  <div key={idx} className="browse-category-card fade-up" onClick={() => handleCategoryCardClick(item)}>
                    <div className="browse-card-icon-wrap" style={{ color: categoryColors[item.name] || 'var(--accent-primary)' }}>
                      {typeof item.icon === 'string' ? (
                        <img src={item.icon} alt={displayName} className="browse-card-icon-img" />
                      ) : (
                        item.icon ? React.createElement(item.icon, { size: 24 }) : <Tags size={24} />
                      )}
                    </div>
                    <div className="browse-card-text">
                      <h3 className="browse-card-title">{displayName}</h3>
                      <p className="browse-card-count">{actualCount} {actualCount === 1 ? t('services.professional') : t('services.professionals_plural')}</p>
                    </div>
                    <ChevronRight size={16} className="browse-card-chevron" />
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 40 }}>🔍</div>
                <h3>No categories found</h3>
                <p>Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: Service Detail Page (category selected)
          ========================================================================= */}
      {selected && !selectedSubcat && (() => {
        const browseItem = BROWSE_CATEGORIES.find(
          item => item.dbCategory.toLowerCase() === selected.name?.toLowerCase() || item.name.toLowerCase() === selected.name?.toLowerCase()
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
          <div className="subcat-pros-page fade-up" style={accentStyle}>
            {/* Top Navigation Bar */}
            <div className="subcat-pros-nav-bar">
              <button className="subcat-pros-back-btn" onClick={() => setSelectedSubcat(null)}>
                <ArrowLeft size={16} /> {t('services.back_to')} {selected.name}
              </button>
              <div className="subcat-pros-breadcrumb">
                <span style={{ cursor: 'pointer' }} onClick={() => { setSelected(null); setSelectedSubcat(null); }}>Services</span>
                <span>/</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setSelectedSubcat(null)}>{selected.name}</span>
                <span>/</span>
                <span className="active">{selectedSubcat.name}</span>
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

              {/* District Selection Section */}
              <div style={{ marginTop: 16, padding: '14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
                  Choose Kerala District
                </label>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748B' }}>
                  Select your service district to see available professionals and district pricing.
                </p>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleSelectDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#0F172A',
                    background: '#FFFFFF',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <optgroup label="Tier 1: Current Pricing (0% Surge)">
                    <option value="Kasaragod">Kasaragod (Current Pricing)</option>
                    <option value="Pathanamthitta">Pathanamthitta (Current Pricing)</option>
                    <option value="Idukki">Idukki (Current Pricing)</option>
                    <option value="Wayanad">Wayanad (Current Pricing)</option>
                    <option value="Kannur">Kannur (Current Pricing)</option>
                    <option value="Palakkad">Palakkad (Current Pricing)</option>
                  </optgroup>
                  <optgroup label="Tier 2: 20% Increased Price">
                    <option value="Thrissur">Thrissur (+20% Surge)</option>
                    <option value="Kollam">Kollam (+20% Surge)</option>
                    <option value="Alappuzha">Alappuzha (+20% Surge)</option>
                    <option value="Kottayam">Kottayam (+20% Surge)</option>
                    <option value="Malappuram">Malappuram (+20% Surge)</option>
                  </optgroup>
                  <optgroup label="Tier 3: 30% Increased Price">
                    <option value="Ernakulam">Ernakulam (+30% Surge)</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram (+30% Surge)</option>
                    <option value="Kozhikode">Kozhikode (+30% Surge)</option>
                  </optgroup>
                </select>

                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#475569' }}>Active Pricing Tier:</span>
                  <span
                    style={{
                      background: districtPricingTiers[selectedDistrict]?.markup === 30 ? '#FEE2E2' : districtPricingTiers[selectedDistrict]?.markup === 20 ? '#FEF3C7' : '#E0F2FE',
                      color: districtPricingTiers[selectedDistrict]?.markup === 30 ? '#991B1B' : districtPricingTiers[selectedDistrict]?.markup === 20 ? '#92400E' : '#0369A1',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {districtPricingTiers[selectedDistrict]?.markup > 0
                      ? `+${districtPricingTiers[selectedDistrict]?.markup}% Surge`
                      : 'Current Pricing (0%)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking modal */}
      {booking && (
        <BookingModal
          professional={booking.professional}
          category={booking.category}
          currentLocation={booking.location || { ...(location || {}), placeName: selectedDistrict, district: selectedDistrict, ...(DISTRICT_CENTERS[selectedDistrict] || {}) }}
          initialTitle={booking.initialTitle || ''}
          initialDescription={booking.initialDescription || ''}
          subcategories={subcategories}
          categories={categories}
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
