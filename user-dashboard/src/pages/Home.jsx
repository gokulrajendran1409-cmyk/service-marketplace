import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Award, BadgePercent, Bell, CheckCircle2, ChefHat, ChevronRight, MapPin, Navigation, Palette, Scissors, Search, ShieldCheck, Sparkles, Star, UserRoundCheck, Wrench, Zap } from 'lucide-react';
import { API } from '../constants';

function Home({ navigate }) {
  const [locationName, setLocationName] = useState('Detecting location...');
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('there');
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [dbCategories, setDbCategories] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentDrag = useRef(0);
  const isHorizontalSwipe = useRef(null);
  const isPointerDown = useRef(false);

  const serviceCategoryItems = [
    {
      id: 'hairdresser',
      title: 'Hairdresser',
      icon: Scissors,
      group: 'Personal Care',
      category: 'Hairdresser',
    },
    {
      id: 'cleaning',
      title: 'Cleaning',
      icon: Sparkles,
      group: 'Personal Care',
      category: 'Cleaning',
    },
    {
      id: 'painting',
      title: 'Painting',
      icon: Palette,
      group: 'Home Repairs',
      category: 'Painting',
    },
    {
      id: 'cooking',
      title: 'Cooking',
      icon: ChefHat,
      group: 'Personal Care',
      category: 'Cooking',
    },
    {
      id: 'plumbing',
      title: 'Plumbing',
      icon: Wrench,
      group: 'Home Repairs',
      category: 'Plumbing',
    },
    {
      id: 'electrician',
      title: 'Electrician',
      icon: Zap,
      group: 'Home Repairs',
      category: 'Electrical',
    },
  ];

  const popularServices = [
    {
      id: 'clean-1',
      title: 'Home Cleaning',
      category: 'Cleaning',
      group: 'Personal Care',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
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
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80',
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
      image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format&fit=crop&q=80',
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

      {/* Service Categories Section */}
      <section className="home-featured-section home-order-categories">
        <div className="home-section-head">
          <h2>Service Categories</h2>
          <button className="home-view-all" onClick={() => navigate('services')}>
            View all <ChevronRight size={15} />
          </button>
        </div>
        <div className="home-categories-grid-row">
          {serviceCategoryItems
            .filter(item => dbCategories.some(dbCat => dbCat.name === item.category))
            .slice(0, 4)
            .map(item => (
            <button
              key={item.id}
              className="home-cat-item-card"
              onClick={() => navigate('services', item.group, item.category)}
            >
              <div className="home-cat-item-left">
                <div className="home-cat-icon-box">
                  <item.icon size={22} strokeWidth={2.2} />
                </div>
                <span className="home-cat-title">{item.title}</span>
              </div>
              <ChevronRight size={15} className="home-cat-arrow" />
            </button>
          ))}
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="home-featured-section home-order-popular">
        <div className="home-section-head">
          <h2>Popular Services</h2>
          <button className="home-view-all" onClick={() => navigate('services')}>
            View all <ChevronRight size={15} />
          </button>
        </div>
        <div className="home-popular-scroll">
          {popularServices.map(service => (
            <div
              key={service.id}
              className="home-popular-card"
              onClick={() => navigate('services', service.group, service.category)}
            >
              <div className="home-popular-img-wrap">
                <img src={service.image} alt={service.title} className="home-popular-img" />
              </div>
              <div className="home-popular-body">
                <div className="home-popular-rating">
                  <Star size={13} className="home-popular-rating-star" />
                  <span className="home-popular-rating-score">{service.rating}</span>
                  <span className="home-popular-rating-count">({service.reviews} Reviews)</span>
                </div>
                <h3 className="home-popular-title">{service.title}</h3>
                <div className="home-popular-price">{service.price}</div>
                <div className="home-popular-footer">
                  <div className="home-popular-avatar" style={{ background: service.avatarBg }}>
                    {service.initials}
                  </div>
                  <span className="home-popular-provider-name">{service.provider}</span>
                  <span className="home-popular-verified" title="Verified Provider">
                    <CheckCircle2 size={15} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Professionals Section */}
      <section className="home-featured-section home-order-pros">
        <div className="home-section-head">
          <h2>Top Professionals</h2>
          <button className="home-view-all" onClick={() => navigate('services')}>
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

      {/* How Our App Works Section */}
      <section className="home-how-it-works-section home-order-workflow">
        <div className="home-section-head" style={{ padding: 0 }}>
          <div>
            <span className="home-section-kicker">SIMPLE & FAST</span>
            <h2>How Our App Works</h2>
          </div>
        </div>

        <div className="home-steps-container">
          <div className="home-step-card">
            <div className="home-step-top">
              <div className="home-step-icon-wrap step-violet">
                <Search size={22} />
              </div>
              <span className="home-step-number">01</span>
            </div>
            <h3 className="home-step-title">Choose a Service</h3>
            <p className="home-step-desc">
              Browse categories or search for the exact service you need in seconds.
            </p>
          </div>

          <div className="home-step-card">
            <div className="home-step-top">
              <div className="home-step-icon-wrap step-indigo">
                <UserRoundCheck size={22} />
              </div>
              <span className="home-step-number">02</span>
            </div>
            <h3 className="home-step-title">Book a Verified Pro</h3>
            <p className="home-step-desc">
              Connect with background-checked, top-rated local professionals.
            </p>
          </div>

          <div className="home-step-card">
            <div className="home-step-top">
              <div className="home-step-icon-wrap step-blue">
                <CheckCircle2 size={22} />
              </div>
              <span className="home-step-number">03</span>
            </div>
            <h3 className="home-step-title">Track & Enjoy</h3>
            <p className="home-step-desc">
              Track work status in real time and enjoy guaranteed satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Highlights Section */}
      <section className="home-trust-banner home-order-trust">
        <div className="home-trust-item">
          <div className="home-trust-icon-box">
            <ShieldCheck size={26} strokeWidth={1.9} />
          </div>
          <span className="home-trust-label">Verified Professionals</span>
        </div>

        <div className="home-trust-divider" />

        <div className="home-trust-item">
          <div className="home-trust-icon-box">
            <BadgePercent size={26} strokeWidth={1.9} />
          </div>
          <span className="home-trust-label">Transparent Pricing</span>
        </div>

        <div className="home-trust-divider" />

        <div className="home-trust-item">
          <div className="home-trust-icon-box">
            <Award size={26} strokeWidth={1.9} />
          </div>
          <span className="home-trust-label">Up to 30 Days Warranty</span>
        </div>

        <div className="home-trust-divider" />

        <div className="home-trust-item">
          <div className="home-trust-icon-box">
            <Navigation size={26} strokeWidth={1.9} />
          </div>
          <span className="home-trust-label">Live Tracking</span>
        </div>
      </section>
    </div>
  );
}

export default Home;
