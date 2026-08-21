import { useEffect, useState } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { categoryIcons, API } from '../constants';
import { BookingModal } from '../components/BookingModal';
import { useToast, Toast } from '../components/Toast';

function Services({ navigate }) {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingPros, setLoadingPros] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');
  const [booking, setBooking] = useState(null); // { professional, category }
  const { toast, showToast } = useToast();

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(data => setCategories(data))
      .catch(() => showToast('Failed to load categories', 'error'))
      .finally(() => setLoadingCats(false));
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
        };
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${current.latitude}&lon=${current.longitude}&zoom=18&addressdetails=1`)
          .then(response => {
            if (!response.ok) throw new Error('Reverse geocoding failed');
            return response.json();
          })
          .then(data => {
            const resolvedLocation = { ...current, placeName: data.display_name || '' };
            setLocation(resolvedLocation);
            setLocationStatus('ready');
            resolve(resolvedLocation);
          })
          .catch(() => {
            const fallbackLocation = { ...current, placeName: '' };
            setLocation(fallbackLocation);
            setLocationStatus('ready');
            resolve(fallbackLocation);
          });
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Please allow location access in your browser to find professionals near you.'
          : 'We could not retrieve your current location. Please try again.';
        setLocationStatus('denied');
        setLocationError(message);
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });

  const selectCategory = async (cat) => {
    setSelected(cat);
    setProfessionals([]);
    setLoadingPros(true);
    try {
      const currentLocation = location || await requestLocation();
      const res = await fetch(`${API}/professionals?category=${encodeURIComponent(cat.name)}`);
      const data = await res.json();
      setProfessionals(data.map(professional => ({ ...professional, distance_from_user: currentLocation ? null : undefined })));
    } catch {
      if (locationStatus !== 'denied') showToast('Failed to load professionals', 'error');
    } finally {
      setLoadingPros(false);
    }
  };

  const mapUrl = location ? (() => {
    const delta = 0.01;
    const { latitude, longitude } = location;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  })() : '';

  const handleRequestSuccess = (req) => {
    setBooking(null);
    showToast('Your service request was submitted successfully! 🎉');
    navigate && navigate('requests');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Find a Service</h1>
        <p className="page-subtitle">Choose a category to browse verified professionals near you.</p>
      </div>

      <div className="location-panel">
        <div className="location-panel-copy">
          <div className="location-icon"><MapPin size={20} /></div>
          <div>
            <h2>Your current location</h2>
            <p>{locationStatus === 'ready'
              ? `${location.placeName || 'Location found'} (accuracy about ${location.accuracy}m). Professionals can be selected from your area.`
              : 'Turn on location before selecting a professional so we can show where you are on the map.'}</p>
          </div>
        </div>
        {locationStatus !== 'ready' && (
          <button className="btn-location" onClick={() => requestLocation().catch(() => {})} disabled={locationStatus === 'requesting'}>
            {locationStatus === 'requesting' ? <RefreshCw size={16} className="spin" /> : <MapPin size={16} />}
            {locationStatus === 'requesting' ? 'Finding you...' : 'Enable location'}
          </button>
        )}
        {locationError && <p className="location-error">{locationError}</p>}
      </div>

      {location && (
        <div className="location-map-wrap">
          <iframe
            title="Your current location"
            className="location-map"
            src={mapUrl}
            loading="lazy"
          />
          <p className="map-caption"><strong>{location.placeName || 'Your current location'}</strong> is shown on the map. It is used to help you choose a nearby professional.</p>
        </div>
      )}

      {/* Category grid */}
      {loadingCats ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw className="spin" size={32} color="var(--text-muted)" />
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={`category-card fade-up ${selected?.id === cat.id ? 'selected' : ''}`}
              onClick={() => selectCategory(cat)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && selectCategory(cat)}
            >
              <div className="category-icon">{categoryIcons[cat.name] || '🛠️'}</div>
              <div className="category-name">{cat.name}</div>
              <div className="category-desc">{cat.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Professionals section */}
      {selected && (
        <div style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>
              {categoryIcons[selected.name]} {selected.name} Professionals
            </h2>
          </div>

          {loadingPros ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <RefreshCw className="spin" size={28} color="var(--text-muted)" />
            </div>
          ) : professionals.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40 }}>🔍</div>
              <h3>No professionals found</h3>
              <p>No verified professionals in this category yet.</p>
            </div>
          ) : (
            <div className="professionals-grid">
              {professionals.map(pro => (
                <div key={pro.id} className="pro-card fade-up">
                  <div className="pro-header">
                    <div className="pro-avatar">{pro.full_name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="pro-name">{pro.full_name}</div>
                      <span className="pro-category">{pro.category}</span>
                    </div>
                  </div>
                  <div className="pro-meta">
                    <span>📍 {pro.city || 'N/A'}{pro.state ? `, ${pro.state}` : ''}</span>
                    <span>⭐ {pro.experience_years}y exp</span>
                  </div>
                  {pro.bio && <div className="pro-bio">{pro.bio}</div>}
                  <button
                    className="btn-hire"
                    onClick={() => setBooking({ professional: pro, category: selected.name, location })}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking modal */}
      {booking && (
        <BookingModal
          professional={booking.professional}
          category={booking.category}
          currentLocation={booking.location}
          onClose={() => setBooking(null)}
          onSuccess={handleRequestSuccess}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default Services;
