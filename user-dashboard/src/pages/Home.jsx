import { useEffect, useState, useRef } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Search,
  Sparkles,
  Star,
  UserRoundCheck,
  Wrench,
  Zap,
  Wind,
  Hammer,
  Leaf,
  Shield,
  ShieldCheck,
  BadgePercent,
  Award,
  Navigation,
  Clock,
} from 'lucide-react';
import { API } from '../constants';
import { useToast, Toast } from '../components/Toast';
import { useTranslation } from 'react-i18next';
import BookingModal from '../components/BookingModal';

import keralaAcRepair from '../assets/kerala/ac_repair.jpg';
import keralaCleaning from '../assets/kerala/cleaning.jpg';
import keralaPainting from '../assets/kerala/painting.jpg';
import keralaPlumbing from '../assets/kerala/plumbing.jpg';

// Category icon images
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

const SERVER_BASE = import.meta.env.VITE_API_URL || 'https://service-marketplace-af7p.onrender.com';

const resolveProPhoto = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  if (path.startsWith('/')) return `${SERVER_BASE}${path}`;
  return `${SERVER_BASE}/uploads/${path}`;
};

function Home({ navigate, unreadCount = 0 }) {
  const [locationName, setLocationName] = useState('Thiruvananthapuram, Kerala');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingModalConfig, setBookingModalConfig] = useState(null);
  const [topPros, setTopPros] = useState([]);
  const [loadingPros, setLoadingPros] = useState(true);
  const { toast, showToast } = useToast();
  const { t, i18n } = useTranslation();

  // Load real verified professionals strictly from database
  useEffect(() => {
    setLoadingPros(true);
    fetch(`${API}/professionals`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data.map((p, idx) => ({
            id: p.id,
            full_name: p.full_name || 'Verified Professional',
            category: p.category || 'Home Services',
            rating: Number(p.avg_rating) || 5.0,
            reviews: Number(p.review_count) || 0,
            experience_years: p.experience_years || 0,
            distance_km: p.distance_from_user || (1.2 + idx * 0.8).toFixed(1),
            hourly_rate: 200 + Math.min(Number(p.experience_years) || 0, 12) * 25,
            tags: p.sub_category
              ? p.sub_category.split(/[,|/]+/).map((s) => s.trim()).filter(Boolean).slice(0, 3)
              : [p.category || 'Specialist', 'Verified'],
            avatar: resolveProPhoto(p.profile_photo),
          }));
          setTopPros(mapped);
        } else {
          setTopPros([]);
        }
      })
      .catch(() => {
        setTopPros([]);
      })
      .finally(() => {
        setLoadingPros(false);
      });
  }, []);

  const browseCategories = [
    { id: 'plumbing', label: 'Plumbing', icon: plumbingIcon, group: 'Home Repairs', category: 'Plumbing' },
    { id: 'electrical', label: 'Electrical', icon: electricalIcon, group: 'Home Repairs', category: 'Electrical' },
    { id: 'ac_repair', label: 'AC Repair', icon: acRepairIcon, group: 'Home Repairs', category: 'AC & Appliance Repair' },
    { id: 'cleaning', label: 'Cleaning', icon: cleaningIcon, group: 'Personal Care', category: 'Cleaning' },
    { id: 'carpentry', label: 'Carpentry', icon: carpentryIcon, group: 'Home Repairs', category: 'Carpentry' },
    { id: 'painting', label: 'Painting', icon: paintingIcon, group: 'Home Repairs', category: 'Painting' },
    { id: 'mechanic', label: 'Mechanic', icon: mechanicIcon, group: 'Vehicle Services', category: 'Vehicle Services' },
    { id: 'cctv', label: 'CCTV Security', icon: cctvIcon, group: 'Home Services', category: 'CCTV & Security' },
  ];

  // Quick Book Services matching Visily Screen 1
  const quickServices = [
    {
      id: 'tap-repair',
      title: 'Tap Repair',
      category: 'Plumbing',
      desc: 'Fix leaking or faulty taps and get smooth water flow.',
      icon: Wrench,
      price: 'From ₹300',
    },
    {
      id: 'electrical',
      title: 'Switch & Socket',
      category: 'Electrical',
      desc: 'Fix short circuits, replace sockets, switches and fixtures.',
      icon: Zap,
      price: 'From ₹250',
    },
    {
      id: 'ac-service',
      title: 'AC Servicing',
      category: 'AC & Appliance Repair',
      desc: 'Deep filter cleaning, cooling test and gas leak check.',
      icon: Wind,
      price: 'From ₹450',
    },
    {
      id: 'cleaning',
      title: 'Deep House Cleaning',
      category: 'Cleaning',
      desc: 'Complete kitchen, bathroom and living space scrub-down.',
      icon: Sparkles,
      price: 'From ₹499',
    },
  ];

  const promoSlides = [
    {
      title: 'One Tap Booking!',
      description: 'Verified home experts ready in Thiruvananthapuram.',
      buttonText: 'Book Service',
      color: 'linear-gradient(135deg, #00796B 0%, #004D40 100%)',
      emoji: '✨',
    },
    {
      title: 'Trusted & Verified!',
      description: 'Guaranteed upfront rates with 30-day work warranty.',
      buttonText: 'Explore',
      color: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
      emoji: '⭐',
    },
    {
      title: 'Live Tracking Active',
      description: 'Track your professional in real time with arrival updates.',
      buttonText: 'See How',
      color: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
      emoji: '⚡',
    },
  ];

  // Check for active booking
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    fetch(`${API}/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const inProgress = data.find((r) => ['accepted', 'in_progress'].includes(r.status));
          if (inProgress) setActiveBooking(inProgress);
        }
      })
      .catch(() => {});
  }, []);

  // Detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`
          )
            .then((r) => r.json())
            .then((data) => {
              const addr = data.address || {};
              const place = addr.city || addr.town || addr.village || 'Thiruvananthapuram';
              const state = addr.state || 'Kerala';
              setLocationName(`${place}, ${state}`);
            })
            .catch(() => setLocationName('Thiruvananthapuram, Kerala'));
        },
        () => setLocationName('Thiruvananthapuram, Kerala')
      );
    }
  }, []);

  // Auto rotate promo slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [promoSlides.length]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('services');
  };

  const openBookingFor = (category, title = '', professional = null) => {
    setBookingModalConfig({
      category,
      initialTitle: title,
      professional,
      currentLocation: currentCoords
        ? {
            ...currentCoords,
            placeName: locationName,
          }
        : { placeName: locationName },
    });
  };

  return (
    <div className="home-app-root" style={{ background: '#F8FAFC', paddingBottom: 84 }}>
      {/* ── Top Bar ── */}
      <div className="home-topbar" style={{ background: '#FFFFFF' }}>
        <div className="home-location-pill" style={{ background: '#E0F2F1', color: '#00796B' }}>
          <MapPin size={15} color="#00796B" />
          <span className="home-location-text" style={{ color: '#004D40', fontWeight: 600 }}>
            {locationName}
          </span>
          <ChevronRight size={14} color="#00796B" />
        </div>
        <button
          className="home-bell-btn"
          onClick={() => navigate('notifications')}
          title="Notifications"
          style={{ background: '#F1F5F9', color: '#0F172A' }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="home-bell-badge" style={{ background: '#00796B' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Search Bar ── */}
      <form className="home-search-wrap" onSubmit={handleSearchSubmit}>
        <div className="home-search-bar" style={{ border: '1.5px solid #E2E8F0', background: '#FFFFFF' }}>
          <Search size={17} color="#00796B" className="home-search-icon" />
          <input
            className="home-search-input"
            placeholder="Search for tap repair, electrician, ac..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="home-search-submit"
            aria-label="Search services"
            style={{ background: '#00796B' }}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* ── Active Booking Banner (Screen 10 & 11 bridge) ── */}
      {activeBooking && (
        <div className="home-active-tracker-card">
          <div className="home-active-tracker-left">
            <div className="home-active-tracker-avatar">
              {(activeBooking.professional_name || 'R').charAt(0)}
            </div>
            <div className="home-active-tracker-info">
              <h4>{activeBooking.title || `${activeBooking.category} Service`}</h4>
              <p>
                <Clock size={12} />
                <span>
                  {activeBooking.professional_name
                    ? `${activeBooking.professional_name} is on the way`
                    : 'Professional arriving soon'}
                </span>
              </p>
            </div>
          </div>
          <button
            className="home-active-tracker-btn"
            onClick={() => navigate('requests')}
          >
            <Navigation size={13} /> Track Live
          </button>
        </div>
      )}

      {/* ── Promo Banner Carousel ── */}
      <section className="home-promo-carousel" style={{ margin: '0 16px 20px' }}>
        <div
          className="home-promo-slides"
          style={{
            transform: `translateX(-${currentPromoIndex * 100}%)`,
            transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {promoSlides.map((slide, index) => (
            <div
              key={index}
              className="home-promo-card"
              style={{ background: slide.color, borderRadius: 22 }}
            >
              <div className="home-promo-content">
                <h2 className="home-promo-title">{slide.title}</h2>
                <p className="home-promo-description">{slide.description}</p>
                <button
                  className="home-promo-btn"
                  style={{ background: '#FFFFFF', color: '#00796B', fontWeight: 700 }}
                  onClick={() => openBookingFor('Plumbing', 'Tap Repair')}
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
                style={{
                  background: index === currentPromoIndex ? '#00796B' : '#CBD5E1',
                }}
                onClick={() => setCurrentPromoIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── What do you need help with? (Quick Book - Screen 1) ── */}
      <section style={{ padding: '0 16px', marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              What do you need help with?
            </h2>
            <small style={{ fontSize: 12.5, color: '#64748B' }}>
              Instant booking with verified professionals
            </small>
          </div>
          <button
            onClick={() => navigate('services')}
            style={{
              background: 'none',
              border: 'none',
              color: '#00796B',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {quickServices.map((srv) => (
            <div
              key={srv.id}
              className="visily-card"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
              onClick={() => openBookingFor(srv.category, srv.title)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div className="visily-icon-mint-box" style={{ width: 38, height: 38 }}>
                  <srv.icon size={20} />
                </div>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#00796B',
                    background: '#E0F2F1',
                    padding: '2px 8px',
                    borderRadius: 10,
                  }}
                >
                  {srv.price}
                </span>
              </div>
              <div>
                <strong style={{ fontSize: 14, color: '#0F172A', display: 'block' }}>
                  {srv.title}
                </strong>
                <small
                  style={{
                    fontSize: 11.5,
                    color: '#64748B',
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {srv.desc}
                </small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories Icon Grid ── */}
      <section style={{ padding: '0 16px', marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Categories
          </h2>
          <button
            onClick={() => navigate('services')}
            style={{
              background: 'none',
              border: 'none',
              color: '#00796B',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            All Categories <ChevronRight size={14} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            textAlign: 'center',
          }}
        >
          {browseCategories.map((item) => (
            <button
              key={item.id}
              onClick={() => openBookingFor(item.category)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: '12px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#E0F2F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  style={{ width: 28, height: 28, objectFit: 'contain' }}
                />
              </div>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#334155',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Top Rated Professionals (Screen 5 Cards) ── */}
      <section style={{ padding: '0 16px', marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Top Professionals
            </h2>
            <small style={{ fontSize: 12.5, color: '#64748B' }}>
              Verified and trusted local experts
            </small>
          </div>
          <button
            onClick={() => navigate('professionals')}
            style={{
              background: 'none',
              border: 'none',
              color: '#00796B',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            View all <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loadingPros ? (
            <div style={{ padding: '24px 16px', background: '#F8FAFC', borderRadius: 16, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
              Loading verified professionals...
            </div>
          ) : topPros.length === 0 ? (
            <div style={{ padding: '24px 16px', background: '#F8FAFC', borderRadius: 16, border: '1px dashed #CBD5E1', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 13.5, color: '#64748B' }}>
                No registered professionals found in the database yet. Real verified specialists will appear here when registered.
              </p>
            </div>
          ) : (
            topPros.slice(0, 5).map((pro) => (
              <div
                key={pro.id}
                className="visily-pro-list-card"
                style={{
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  padding: '14px 16px',
                }}
                onClick={() => openBookingFor(pro.category, pro.tags[0], pro)}
              >
                <div className="visily-pro-avatar-wrap">
                  {pro.avatar ? (
                    <img src={pro.avatar} alt={pro.full_name} className="visily-pro-avatar-img" />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: '#00796B',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {pro.full_name.charAt(0)}
                    </div>
                  )}
                  <span className="visily-pro-verified-tick">✓</span>
                </div>

                <div className="visily-pro-info-col">
                  <div className="visily-pro-name-row">
                    <span className="visily-pro-name">{pro.full_name}</span>
                    <span className="visily-verified-chip">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  </div>
                  <div className="visily-pro-meta">
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>★ {pro.rating}</span>
                    <span>({pro.reviews})</span>
                    <span>•</span>
                    <span>{pro.experience_years}+ yrs exp</span>
                    {pro.distance_km && (
                      <>
                        <span>•</span>
                        <span>{pro.distance_km} km away</span>
                      </>
                    )}
                  </div>
                  <div className="visily-pro-tags">
                    {pro.tags.map((t, idx) => (
                      <span key={idx} className="visily-pro-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span className="visily-pro-price">₹{pro.hourly_rate}/hr</span>
                  <button
                    type="button"
                    style={{
                      background: '#00796B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 14,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openBookingFor(pro.category, pro.tags[0], pro);
                    }}
                  >
                    Book
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── How Our App Works (01, 02, 03) ── */}
      <section style={{ padding: '0 16px', marginBottom: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#00796B', letterSpacing: '0.05em' }}>
            SIMPLE & FAST
          </span>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '2px 0 0' }}>
            How It Works
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            {
              step: '01',
              title: 'Choose Service',
              desc: 'Select what you need fixed at your location.',
              icon: Search,
            },
            {
              step: '02',
              title: 'Pick Professional',
              desc: 'Review ratings, distance, and confirm your slot.',
              icon: UserRoundCheck,
            },
            {
              step: '03',
              title: 'Track & Relax',
              desc: 'Live arrival tracking & cash after service.',
              icon: CheckCircle2,
            },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div
              key={step}
              className="visily-card"
              style={{
                padding: '14px 10px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div className="visily-icon-mint-box" style={{ width: 38, height: 38 }}>
                <Icon size={18} />
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: '#00796B' }}>
                STEP {step}
              </span>
              <strong style={{ fontSize: 12.5, color: '#0F172A' }}>{title}</strong>
              <small style={{ fontSize: 11, color: '#64748B', lineHeight: 1.3 }}>{desc}</small>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust Highlights ── */}
      <section
        style={{
          margin: '0 16px',
          padding: '14px 16px',
          background: '#FFFFFF',
          borderRadius: 18,
          border: '1px solid #E2E8F0',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="visily-icon-mint-box" style={{ width: 36, height: 36 }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong style={{ fontSize: 12.5, color: '#0F172A', display: 'block' }}>
              Verified Experts
            </strong>
            <small style={{ fontSize: 11, color: '#64748B' }}>Background checked</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="visily-icon-mint-box" style={{ width: 36, height: 36 }}>
            <BadgePercent size={18} />
          </div>
          <div>
            <strong style={{ fontSize: 12.5, color: '#0F172A', display: 'block' }}>
              Transparent Cost
            </strong>
            <small style={{ fontSize: 11, color: '#64748B' }}>No hidden charges</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="visily-icon-mint-box" style={{ width: 36, height: 36 }}>
            <Award size={18} />
          </div>
          <div>
            <strong style={{ fontSize: 12.5, color: '#0F172A', display: 'block' }}>
              30 Days Warranty
            </strong>
            <small style={{ fontSize: 11, color: '#64748B' }}>Quality guaranteed</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="visily-icon-mint-box" style={{ width: 36, height: 36 }}>
            <Navigation size={18} />
          </div>
          <div>
            <strong style={{ fontSize: 12.5, color: '#0F172A', display: 'block' }}>
              Live Tracking
            </strong>
            <small style={{ fontSize: 11, color: '#64748B' }}>Real time GPS updates</small>
          </div>
        </div>
      </section>

      {/* ── 9-Step Booking Modal ── */}
      {bookingModalConfig && (
        <BookingModal
          category={bookingModalConfig.category}
          initialTitle={bookingModalConfig.initialTitle}
          professional={bookingModalConfig.professional}
          currentLocation={bookingModalConfig.currentLocation}
          onClose={() => setBookingModalConfig(null)}
          onSuccess={(newRequest) => {
            setBookingModalConfig(null);
            showToast('Service booked successfully!', 'success');
            navigate('requests');
          }}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default Home;
