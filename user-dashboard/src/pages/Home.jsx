import { useEffect, useState } from 'react';
import { MapPin, Bell, Search, ChevronRight, RefreshCw } from 'lucide-react';
import { categoryIcons, API } from '../constants';
import cleanerImg from '../assets/cleaner.jpg';

const features = [
  { icon: '🛡️', title: 'Verified Professionals', desc: 'Background-checked & admin-verified' },
  { icon: '⚡', title: 'Fast Response', desc: 'Get quotes within minutes' },
  { icon: '📋', title: 'Track Everything', desc: 'Monitor requests in real time' },
  { icon: '⭐', title: 'Rated & Reviewed', desc: 'Genuine reviews from customers' },
];

function Home({ navigate }) {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load categories from backend (same as Services.jsx)
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(data => setCategories(data))
      .catch(() => {})
      .finally(() => setLoadingCats(false));

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

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-app-root">

      {/* ── Top Bar ── */}
      <div className="home-topbar">
        <div className="home-location-pill">
          <MapPin size={15} className="home-location-icon" />
          <span className="home-location-text">{locationName}</span>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)', marginLeft: 2 }} />
        </div>
        <button className="home-bell-btn" onClick={() => navigate('notifications')} title="Notifications">
          <Bell size={18} />
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="home-search-wrap">
        <div className="home-search-bar">
          <Search size={16} className="home-search-icon" />
          <input
            className="home-search-input"
            placeholder="Search for services..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Promo Banner ── */}
      <div className="home-promo-banner">
        <div className="home-promo-text">
          <div className="home-promo-title">Get 25% OFF</div>
          <div className="home-promo-sub">Enjoy your first booking</div>
          <button className="home-promo-btn" onClick={() => navigate('services')}>
            Book now
          </button>
        </div>
        <div className="home-promo-badge">%</div>
      </div>

      {/* ── Popular Services ── */}
      <div className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Popular Services</h2>
          <button className="home-view-all" onClick={() => navigate('services')}>View All</button>
        </div>

        {loadingCats ? (
          <div className="home-loading">
            <RefreshCw size={24} className="spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : (
          <div className="home-categories-grid">
            {filteredCategories.slice(0, 6).map(cat => (
              <div
                key={cat.id}
                className="home-category-card"
                onClick={() => navigate('services')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate('services')}
              >
                <div className="home-category-icon-wrap">
                  <span className="home-category-emoji">{categoryIcons[cat.name] || '🛠️'}</span>
                </div>
                <div className="home-category-label">{cat.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Our Best Cleaners ── */}
      <div className="home-section">
        <div className="home-section-header" style={{ marginBottom: 12 }}>
          <h2 className="home-section-title">Our best cleaners</h2>
        </div>
        <div className="home-cleaners-card" onClick={() => navigate('services')}>
          <img src={cleanerImg} alt="Our best cleaners" className="home-cleaners-img" />
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="home-cta-section">
        <div className="home-cta-card">
          <div className="home-cta-text">
            <div className="home-cta-title">Ready to book?</div>
            <div className="home-cta-sub">Browse verified professionals near you</div>
          </div>
          <button className="home-cta-btn" onClick={() => navigate('services')}>
            Get Started →
          </button>
        </div>
      </div>

    </div>
  );
}

export default Home;
