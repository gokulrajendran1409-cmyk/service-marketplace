import { useEffect, useState } from 'react';
import { ArrowRight, Bell, CalendarCheck, CheckCircle2, ChevronRight, ClipboardList, MapPin, RefreshCw, Search, ShieldCheck, Sparkles, UserRoundCheck, Wrench } from 'lucide-react';
import { serviceGroups, API } from '../constants';
import workflowImage from '../assets/hero_home.png';

function Home({ navigate }) {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('there');

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('userData') || '{}');
      setUserName(savedUser.name?.split(' ')[0] || 'there');
    } catch {
      setUserName('there');
    }
  }, []);

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

  const filteredGroups = serviceGroups.filter(group => {
    const query = searchQuery.toLowerCase();
    return group.name.toLowerCase().includes(query)
      || group.categories.some(category => category.toLowerCase().includes(query));
  });

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

      <section className="home-welcome home-order-welcome">
        <div>
          <p className="home-eyebrow">SERVICEHUB <span>•</span> YOUR LOCAL HELP</p>
          <h1>What can we<br /><em>fix</em> for you, {userName}?</h1>
          <p className="home-welcome-sub">Book trusted professionals for the jobs that keep your day moving.</p>
        </div>
        <div className="home-welcome-mark"><Sparkles size={22} /></div>
      </section>

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

      <section className="home-quick-actions home-order-actions">
        <button className="home-quick-action" onClick={() => navigate('services')}>
          <span className="home-quick-icon quick-orange"><CalendarCheck size={20} /></span>
          <span><strong>Book a service</strong><small>Find your expert</small></span>
          <ChevronRight size={16} />
        </button>
        <button className="home-quick-action" onClick={() => navigate('requests')}>
          <span className="home-quick-icon quick-blue"><ClipboardList size={20} /></span>
          <span><strong>Track a request</strong><small>See your bookings</small></span>
          <ChevronRight size={16} />
        </button>
      </section>

      <section className="home-how-it-works home-order-workflow">
        <div className="home-section-header">
          <div><p className="home-section-kicker">SIMPLE FROM START TO FINISH</p><h2 className="home-section-title">How ServiceHub works</h2></div>
          <div className="home-workflow-visual"><img src={workflowImage} alt="Home service workflow" /></div>
        </div>
        <div className="home-workflow-steps">
          <div className="home-workflow-step">
            <span className="home-workflow-number">01</span>
            <div className="home-workflow-icon workflow-orange"><CalendarCheck size={19} /></div>
            <strong>Book a service</strong>
            <p>Choose what you need and send your request in a few taps.</p>
          </div>
          <div className="home-workflow-line" />
          <div className="home-workflow-step">
            <span className="home-workflow-number">02</span>
            <div className="home-workflow-icon workflow-teal"><UserRoundCheck size={19} /></div>
            <strong>Get a provider</strong>
            <p>A verified professional reviews your request and reaches out.</p>
          </div>
          <div className="home-workflow-line" />
          <div className="home-workflow-step">
            <span className="home-workflow-number">03</span>
            <div className="home-workflow-icon workflow-blue"><CheckCircle2 size={19} /></div>
            <strong>Track the work</strong>
            <p>Stay updated from assignment to completion, all in one place.</p>
          </div>
        </div>
      </section>

      <div className="home-section home-services-section home-order-services">
        <div className="home-section-header">
          <div><p className="home-section-kicker">EXPLORE</p><h2 className="home-section-title">Services for every job</h2></div>
          <button className="home-view-all" onClick={() => navigate('services')}>See all <ArrowRight size={14} /></button>
        </div>

        {loadingCats ? (
          <div className="home-loading">
            <RefreshCw size={24} className="spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : (
          <div className="home-categories-grid">
            {filteredGroups.map(group => (
              <button
                key={group.name}
                className="home-category-card"
                onClick={() => navigate('services', group.name)}
                aria-label={`Open ${group.name} services`}
              >
                <div className="home-category-icon-wrap">
                  <group.icon className="home-category-icon" size={28} strokeWidth={2} style={{ color: group.color }} />
                </div>
                <div className="home-category-label">{group.name}</div>
                <span className="home-category-count">{group.categories.length} services</span>
              </button>
            ))}
          </div>
        )}

        {!loadingCats && filteredGroups.length > 0 && (
          <div className="home-service-directory">
            <div className="home-directory-heading">
              <div>
                <p className="home-section-kicker">QUICK BROWSE</p>
                <h3>What do you need help with?</h3>
              </div>
              <span>{filteredGroups.reduce((count, group) => count + group.categories.length, 0)} services</span>
            </div>
            {filteredGroups.map(group => (
              <section className="home-directory-group" key={`directory-${group.name}`}>
                <button className="home-directory-title" onClick={() => navigate('services', group.name)}>
                  <span className="home-directory-icon" style={{ color: group.color }}><group.icon size={17} /></span>
                  <strong>{group.name}</strong>
                  <ChevronRight size={15} />
                </button>
                <div className="home-directory-items">
                  {group.categories.map(category => (
                    <button key={category} onClick={() => navigate('services', group.name, category)}>
                      <span>{category}</span><ArrowRight size={13} />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

      </div>

      <section className="home-provider-card home-order-provider">
        <div className="home-provider-badge"><ShieldCheck size={24} /></div>
        <div className="home-provider-copy">
          <span className="home-section-kicker">BOOK WITH CONFIDENCE</span>
          <h2>Trusted, verified providers.</h2>
          <p>Every professional is reviewed and verified so you can choose help with peace of mind.</p>
          <div className="home-provider-points"><span>✓ Verified profiles</span><span>✓ Real customer reviews</span></div>
        </div>
        <div className="home-provider-pattern" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <div className="home-all-services">
        <button onClick={() => navigate('services')}>
          <span className="home-all-services-icon"><Wrench size={19} /></span>
          <span><strong>Show all services</strong><small>Browse every service category</small></span>
          <ArrowRight size={17} />
        </button>
      </div>

    </div>
  );
}

export default Home;
