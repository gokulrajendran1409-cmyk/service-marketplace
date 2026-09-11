import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Bell, CheckCircle2, ChevronRight, MapPin, Palette, Search, Sparkles, Star, UserRoundCheck, Wrench, Zap, Wind, Hammer, Leaf, Shield, SlidersHorizontal } from 'lucide-react';
import { API } from '../constants';
import { useToast, Toast } from '../components/Toast';
import keralaAcRepair from '../assets/kerala/ac_repair.jpg';
import keralaCleaning from '../assets/kerala/cleaning.jpg';
import keralaPainting from '../assets/kerala/painting.jpg';
import keralaPlumbing from '../assets/kerala/plumbing.jpg';

// Category icon images (circular, from Services page)
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

function Home({ navigate, unreadCount = 0 }) {
  const [locationName, setLocationName] = useState('Detecting location...');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('there');
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [dbCategories, setDbCategories] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const { toast, showToast } = useToast();

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentDrag = useRef(0);
  const isHorizontalSwipe = useRef(null);
  const isPointerDown = useRef(false);

  // All 20 categories for the icon strip in Browse by Category
  const browseCategories = [
    { id: 'plumbing',       label: 'Plumbing',          icon: plumbingIcon,       group: 'Home Repairs',   category: 'Plumbing' },
    { id: 'electrical',     label: 'Electrical',         icon: electricalIcon,     group: 'Home Repairs',   category: 'Electrical' },
    { id: 'ac_repair',      label: 'AC Repair',          icon: acRepairIcon,       group: 'Home Repairs',   category: 'AC & Appliance Repair' },
    { id: 'carpentry',      label: 'Carpentry',          icon: carpentryIcon,      group: 'Home Repairs',   category: 'Carpentry' },
    { id: 'cleaning',       label: 'Cleaning',           icon: cleaningIcon,       group: 'Personal Care',  category: 'Cleaning' },
    { id: 'painting',       label: 'Painting',           icon: paintingIcon,       group: 'Home Repairs',   category: 'Painting' },
    { id: 'mechanic',       label: 'Mechanic',           icon: mechanicIcon,       group: 'Vehicle Services', category: 'Vehicle Services' },
    { id: 'cctv',           label: 'CCTV',               icon: cctvIcon,           group: 'Home Services',  category: 'CCTV & Security' },
    { id: 'appliance',      label: 'Appliance',          icon: applianceRepairIcon, group: 'Home Repairs',  category: 'AC & Appliance Repair' },
    { id: 'beauty',         label: 'Beauty',             icon: beautyWellnessIcon, group: 'Personal Care',  category: 'Personal Care' },
    { id: 'tutoring',       label: 'Tutoring',           icon: tutoringIcon,       group: 'Education',      category: 'Computer & Mobile Repair' },
    { id: 'photography',    label: 'Photography',        icon: photographyIcon,    group: 'Home Services',  category: 'Photography & Videography' },
    { id: 'event_planning', label: 'Events',             icon: eventPlanningIcon,  group: 'Personal Care',  category: 'Personal Care' },
    { id: 'landscaping',    label: 'Landscaping',        icon: landscapingIcon,    group: 'Personal Care',  category: 'Gardening & Landscaping' },
    { id: 'moving',         label: 'Moving',             icon: movingPackingIcon,  group: 'Home Repairs',   category: 'Home Repair & Maintenance' },
    { id: 'renovation',     label: 'Renovation',         icon: homeRenovationIcon, group: 'Home Repairs',   category: 'Home Repair & Maintenance' },
    { id: 'it_support',     label: 'IT Support',         icon: itSupportIcon,      group: 'Education',      category: 'Computer & Mobile Repair' },
    { id: 'language',       label: 'Language',           icon: languageClassesIcon, group: 'Education',     category: 'Computer & Mobile Repair' },
    { id: 'pet_care',       label: 'Pet Care',           icon: petCareIcon,        group: 'Personal Care',  category: 'Personal Care' },
    { id: 'other',          label: 'Other',              icon: otherServicesIcon,  group: 'Home Repairs',   category: 'Home Repair & Maintenance' },
  ];

  const serviceCategoryItems = browseCategories; // keep backward compat

  const popularServices = [
    {
      id: 'ac-1',
      title: 'AC Repair & Service',
      category: 'AC & Appliance Repair',
      group: 'Home Repairs',
      image: keralaAcRepair,
      rating: 4.9,
      reviews: 165,
      price: 'From $35',
      provider: 'CoolTech Solutions',
      avatarBg: '#06b6d4',
      initials: 'CT',
    },
    {
      id: 'clean-1',
      title: 'Home Cleaning',
      category: 'Cleaning',
      group: 'Personal Care',
      image: keralaCleaning,
      rating: 4.8,
      reviews: 128,
      price: '$25 - $30',
      provider: 'Sparkle Cleaners',
      avatarBg: '#6366F1',
      initials: 'SC',
    },
    {
      id: 'cook-1',
      title: 'Cooking & Meal Prep',
      category: 'Cooking',
      group: 'Personal Care',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviews: 95,
      price: '$25 - $30',
      provider: 'Stella Kitchen',
      avatarBg: '#6366F1',
      initials: 'SK',
    },
    {
      id: 'paint-1',
      title: 'Interior Painting',
      category: 'Painting',
      group: 'Home Repairs',
      image: keralaPainting,
      rating: 4.7,
      reviews: 84,
      price: '$40 - $60',
      provider: 'Apex Home Finish',
      avatarBg: '#8B5CF6',
      initials: 'AP',
    },
    {
      id: 'plumb-1',
      title: 'Plumbing & Repairs',
      category: 'Plumbing',
      group: 'Home Repairs',
      image: keralaPlumbing,
      rating: 4.9,
      reviews: 152,
      price: '$30 - $45',
      provider: 'QuickFix Plumbers',
      avatarBg: '#6366F1',
      initials: 'QF',
    },
  ];

  const topProfessionals = [
    {
      id: 'pro-1',
      name: 'Sarah Jenkins',
      title: 'Hair & Styling Specialist',
      category: 'Hairdresser',
      group: 'Personal Care',
      rating: 4.9,
      reviews: 184,
      hourlyRate: '$35/hr',
      distance: '2.1 km',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'pro-2',
      name: 'Marcus Vance',
      title: 'Master Electrician',
      category: 'Electrical',
      group: 'Home Repairs',
      rating: 5.0,
      reviews: 210,
      hourlyRate: '$45/hr',
      distance: '3.5 km',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'pro-3',
      name: 'Elena Gomez',
      title: 'Deep Cleaning Expert',
      category: 'Cleaning',
      group: 'Personal Care',
      rating: 4.9,
      reviews: 160,
      hourlyRate: '$30/hr',
      distance: '1.8 km',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'pro-4',
      name: 'David Chen',
      title: 'Plumbing Specialist',
      category: 'Plumbing',
      group: 'Home Repairs',
      rating: 4.8,
      reviews: 145,
      hourlyRate: '$40/hr',
      distance: '4.2 km',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const promoSlides = [
    {
      title: 'Solution, One Tap!',
      description: 'Verified professionals ready to help.',
      buttonText: 'Explore',
      color: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      emoji: '✨',
    },
    {
      title: 'Trusted & Verified!',
      description: 'Real reviews from real customers.',
      buttonText: 'See More',
      color: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
      emoji: '⭐',
    },
    {
      title: 'Fast Bookings!',
      description: 'Connected in minutes, not days.',
      buttonText: 'Book Now',
      color: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
      emoji: '⚡',
    },
  ];

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('userData') || '{}');
      setUserName(savedUser.name?.split(' ')[0] || 'there');
    } catch {
      setUserName('there');
    }
  }, []);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(data => setDbCategories(data))
      .catch(() => console.error('Failed to load categories'));
  }, []);

  useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isDragging, promoSlides.length]);

  const handlePointerDown = (e) => {
    isPointerDown.current = true;
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    currentDrag.current = 0;
    isHorizontalSwipe.current = null;
  };

  const handlePointerMove = (e) => {
    if (!isPointerDown.current) return;
    const diffX = e.clientX - touchStartX.current;
    const diffY = e.clientY - touchStartY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipe.current) {
      setIsDragging(true);
      currentDrag.current = diffX;
      setDragOffset(diffX);
    }
  };

  const handlePointerUp = () => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;

    if (isHorizontalSwipe.current) {
      if (currentDrag.current < -40) {
        setCurrentPromoIndex((prev) => (prev + 1) % promoSlides.length);
      } else if (currentDrag.current > 40) {
        setCurrentPromoIndex((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    currentDrag.current = 0;
    isHorizontalSwipe.current = null;
  };

  useEffect(() => {
    // Detect location name
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`)
            .then(r => r.json())
            .then(data => {
              const addr = data.address || {};
              const place = addr.city || addr.town || addr.village || addr.county || 'Your location';
              const state = addr.state || '';
              setLocationName(state ? `${place}, ${state}` : place);
            })
            .catch(() => setLocationName('Location found'));
        },
        () => setLocationName('Location unavailable')
      );
    } else {
      setLocationName('Location unavailable');
    }
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    navigate('services');
  };

  return (
    <div className="home-app-root">
      <div className="home-topbar home-order-topbar">
        <div className="home-location-pill">
          <MapPin size={15} className="home-location-icon" />
          <span className="home-location-text">{locationName}</span>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)', marginLeft: 2 }} />
        </div>
        <button className="home-bell-btn" onClick={() => navigate('notifications')} title="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="home-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>

      <form className="home-search-wrap home-order-search" onSubmit={submitSearch}>
        <div className="home-search-bar">
          <Search size={16} className="home-search-icon" />
          <input
            className="home-search-input"
            placeholder="Search for services..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="home-search-submit" aria-label="Search services">
            <ArrowRight size={17} />
          </button>
        </div>
      </form>

      <section 
        className="home-promo-carousel home-order-promo"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: 'pan-y', userSelect: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className="home-promo-slides" 
          style={{ 
            transform: isDragging 
              ? `translateX(calc(-${currentPromoIndex * 100}% + ${dragOffset}px))` 
              : `translateX(-${currentPromoIndex * 100}%)`,
            transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          {promoSlides.map((slide, index) => (
            <div key={index} className="home-promo-card" style={{ background: slide.color }}>
              <div className="home-promo-content">
                <h2 className="home-promo-title">{slide.title}</h2>
                <p className="home-promo-description">{slide.description}</p>
                <button 
                  className="home-promo-btn" 
                  onClick={(e) => {
                    if (Math.abs(currentDrag.current) > 10) return;
                    navigate('services');
                  }}
                >
                  {slide.buttonText}
                </button>
              </div>
              <div className="home-promo-visual">
                <div className="home-promo-placeholder">{slide.emoji}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="home-promo-controls">
          <div className="home-promo-dots">
            {promoSlides.map((_, index) => (
              <button
                key={index}
                className={`home-promo-dot ${index === currentPromoIndex ? 'active' : ''}`}
                onClick={() => setCurrentPromoIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category — Horizontal Icon Strip */}
      <section className="home-featured-section home-order-categories">
        <div className="home-section-head">
          <h2>Browse by Category</h2>
          <button className="home-view-all" onClick={() => navigate('services')}>
            View all <ChevronRight size={15} />
          </button>
        </div>
        <div className="home-cat-icon-grid">
          {browseCategories.slice(0, 8).map(item => (
            <button
              key={item.id}
              className="home-cat-icon-btn"
              onClick={() => navigate('services', item.group, item.category)}
            >
              <div className="home-cat-icon-circle">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="home-cat-icon-img"
                  loading="lazy"
                />
              </div>
              <span className="home-cat-icon-label">{item.label}</span>
            </button>
          ))}
        </div>
      </section>


      {/* Top Professionals Section */}
      <section className="home-featured-section home-order-pros">
        <div className="home-section-head">
          <h2>Top Professionals</h2>
          <button className="home-view-all" onClick={() => navigate('professionals')}>
            View all <ChevronRight size={15} />
          </button>
        </div>
        <div className="home-pros-scroll">
          {topProfessionals.map(pro => (
            <div
              key={pro.id}
              className="home-pro-card"
              onClick={() => navigate('services', pro.group, pro.category)}
            >
              <div className="home-pro-header">
                <div className="home-pro-avatar-wrap">
                  <img src={pro.image} alt={pro.name} className="home-pro-avatar" />
                  <span className="home-pro-verified-badge" title="Verified Professional">
                    <CheckCircle2 size={12} />
                  </span>
                </div>
                <div className="home-pro-info">
                  <h3 className="home-pro-name">{pro.name}</h3>
                  <span className="home-pro-title-label">{pro.title}</span>
                  <div className="home-pro-distance">
                    <MapPin size={11} />
                    <span>{pro.distance}</span>
                  </div>
                </div>
              </div>

              <div className="home-pro-stats-row">
                <div className="home-pro-rating">
                  <Star size={13} className="home-pro-star" />
                  <strong>{pro.rating}</strong>
                  <span>({pro.reviews})</span>
                </div>
                <div className="home-pro-rate">{pro.hourlyRate}</div>
              </div>

              <button
                type="button"
                className="home-pro-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('services', pro.group, pro.category);
                }}
              >
                <span>Book Service</span>
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Need a Service Today? — CTA Banner */}
      <section className="home-cta-banner-wrap home-order-cta">
        <div className="home-cta-banner">
          <div className="home-cta-banner-icon-wrap">
            {/* Calendar with check icon */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="home-cta-calendar-svg">
              <rect x="6" y="10" width="32" height="30" rx="4" fill="#b2dfdb" />
              <rect x="6" y="10" width="32" height="10" rx="4" fill="#0d9488" />
              <rect x="15" y="6" width="4" height="8" rx="2" fill="#0d9488" />
              <rect x="29" y="6" width="4" height="8" rx="2" fill="#0d9488" />
              <circle cx="33" cy="33" r="8" fill="#0d9488" />
              <path d="M29.5 33l2.5 2.5 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="home-cta-banner-text">
            <h3 className="home-cta-banner-title">Need a Service Today?</h3>
            <p className="home-cta-banner-sub">Book in just a few taps and get your work done without any hassle.</p>
          </div>
          <button
            className="home-cta-banner-btn"
            onClick={() => navigate('services')}
          >
            Book Now <span className="home-cta-arrow">→</span>
          </button>
        </div>
      </section>

      <Toast toast={toast} />
    </div>
  );
}

export default Home;
