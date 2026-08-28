import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, MapPin, RefreshCw, Tags } from 'lucide-react';
import { categoryColors, categoryIcons, serviceGroups, API } from '../constants';
import { BookingModal } from '../components/BookingModal';
import { useToast, Toast } from '../components/Toast';

function Services({ navigate, initialGroup = null }) {
  const [categories, setCategories] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(initialGroup);
  const [selected, setSelected] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingPros, setLoadingPros] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');
  const [booking, setBooking] = useState(null); // { professional, category }
  const [profileProfessional, setProfileProfessional] = useState(null);
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
          placeName: ''
        };
        // Resolve immediately with coordinates, don't wait for reverse geocoding
        setLocation(current);
        setLocationStatus('ready');
        resolve(current);

        // Fetch place name in the background
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${current.latitude}&lon=${current.longitude}&zoom=18&addressdetails=1`)
          .then(response => {
            if (!response.ok) throw new Error('Reverse geocoding failed');
            return response.json();
          })
          .then(data => {
            setLocation(prev => prev ? { ...prev, placeName: data.display_name || '' } : prev);
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
    
    // Request location in the background if not available
    if (!location && locationStatus !== 'requesting' && locationStatus !== 'denied') {
      requestLocation().catch(() => {});
    }

    try {
      const query = new URLSearchParams({
        category: cat.name
      });
      const res = await fetch(`${API}/professionals?${query}`);
      const data = await res.json();
      setProfessionals(data.map(professional => ({
        ...professional,
        distance_from_user: location ? calculateDistanceInKm(
          location.latitude,
          location.longitude,
          Number(professional.registered_latitude),
          Number(professional.registered_longitude)
        ) : null,
      })));
    } catch {
      showToast('Failed to load professionals', 'error');
    } finally {
      setLoadingPros(false);
    }
  };

  // Update distances when location becomes available
  useEffect(() => {
    if (location && professionals.length > 0 && professionals.some(p => p.distance_from_user == null)) {
      setProfessionals(prev => prev.map(pro => ({
        ...pro,
        distance_from_user: calculateDistanceInKm(
          location.latitude,
          location.longitude,
          Number(pro.registered_latitude),
          Number(pro.registered_longitude)
        )
      })));
    }
  }, [location]);

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

  const nearbyProfessionals = professionals.filter(professional => professional.distance_from_user != null && professional.distance_from_user <= nearbyLimitKm);

  const categoriesByName = new Map(categories.map(category => [category.name, category]));

  const renderProfessionalCard = (pro, allowDirectBooking = false) => (
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
      {pro.distance_from_user != null && (
        <div className="pro-distance"><MapPin size={14} /> {pro.distance_from_user < 1 ? `${Math.round(pro.distance_from_user * 1000)} m away` : `${pro.distance_from_user.toFixed(2)} km away`}</div>
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
      <div className="page-header">
        <h1 className="page-title">Find a Service</h1>
        <p className="page-subtitle">Choose a category and send one request to nearby professionals.</p>
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

      {/* Main categories expand into the leaf categories returned by the API. */}
      {loadingCats ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw className="spin" size={32} color="var(--text-muted)" />
        </div>
      ) : (
        <div className="service-groups">
          {serviceGroups.map(group => {
            const isExpanded = expandedGroup === group.name;
            const GroupIcon = group.icon;
            const groupCategories = group.categories.map(name => categoriesByName.get(name) || {
              id: name,
              name,
              description: 'Browse available professionals',
            });

            return (
              <section key={group.name} className={`service-group fade-up ${isExpanded ? 'expanded' : ''}`}>
                <button
                  className="service-group-toggle"
                  onClick={() => setExpandedGroup(isExpanded ? null : group.name)}
                  aria-expanded={isExpanded}
                >
                  <span className="service-group-icon" style={{ color: group.color }}><GroupIcon size={22} strokeWidth={2} /></span>
                  <span className="service-group-name">{group.name}</span>
                  <span className="service-group-count">{groupCategories.length} services</span>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                {isExpanded && (
                  <div className="subcategory-list">
                    {groupCategories.map(cat => (
                      (() => {
                        const CategoryIcon = categoryIcons[cat.name] || Tags;
                        return (
                      <button
                        key={cat.id}
                        className={`subcategory-item ${selected?.id === cat.id ? 'selected' : ''}`}
                        onClick={() => selectCategory(cat)}
                      >
                        <span className="subcategory-icon" style={{ color: categoryColors[cat.name] || 'var(--accent-primary)' }}><CategoryIcon size={19} strokeWidth={2} /></span>
                        <span>
                          <strong>{cat.name}</strong>
                          <small>{cat.description}</small>
                        </span>
                        <ChevronRight size={17} />
                      </button>
                        );
                      })()
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Professionals section */}
      {selected && (
        <div style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>
              {(() => {
                const CategoryIcon = categoryIcons[selected.name] || Tags;
                return <CategoryIcon size={20} style={{ color: categoryColors[selected.name] || 'var(--accent-primary)', verticalAlign: 'middle', marginRight: 6 }} />;
              })()}
              {selected.name} Professionals
            </h2>
            <button
              className="broadcast-request-btn"
              onClick={() => setBooking({ professional: null, category: selected.name, location })}
            >
              Send request nearby
            </button>
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
            <>
              <section className="professional-section">
                <div className="professional-section-heading">
                  <div>
                    <h3>Nearby Professionals</h3>
                    <p>Registered within {nearbyLimitKm} km of your current location.</p>
                  </div>
                  <span className="section-count">{nearbyProfessionals.length}</span>
                </div>
                {nearbyProfessionals.length > 0 ? (
                  <div className="professionals-grid">{nearbyProfessionals.map(professional => renderProfessionalCard(professional))}</div>
                ) : (
                  <div className="nearby-empty">No professionals were found within {nearbyLimitKm} km.</div>
                )}
              </section>
              <section className="professional-section">
                <div className="professional-section-heading">
                  <div>
                    <h3>Available Professionals</h3>
                    <p>All verified professionals in this category.</p>
                  </div>
                  <span className="section-count">{professionals.length}</span>
                </div>
                <div className="professionals-grid">{professionals.map(professional => renderProfessionalCard(professional, true))}</div>
              </section>
            </>
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

      {profileProfessional && (
        <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && setProfileProfessional(null)}>
          <div className="modal profile-modal fade-up">
            <div className="profile-modal-header">
              <div className="pro-avatar">{profileProfessional.full_name.charAt(0).toUpperCase()}</div>
              <div>
                <h2 className="modal-title">{profileProfessional.full_name}</h2>
                <span className="pro-category">{profileProfessional.category}</span>
              </div>
              <button className="profile-close-btn" onClick={() => setProfileProfessional(null)} aria-label="Close profile">×</button>
            </div>
            <div className="profile-details">
              <div><strong>Experience</strong><span>{profileProfessional.experience_years || 0} years</span></div>
              <div><strong>Location</strong><span>{[profileProfessional.city, profileProfessional.state].filter(Boolean).join(', ') || 'Not provided'}</span></div>
              {profileProfessional.distance_from_user != null && <div><strong>Distance</strong><span>{profileProfessional.distance_from_user.toFixed(2)} km away</span></div>}
            </div>
            <div className="profile-bio-block">
              <strong>About this professional</strong>
              <p>{profileProfessional.bio || 'No professional bio provided.'}</p>
            </div>
            <button className="btn-hire" onClick={() => { setProfileProfessional(null); setBooking({ professional: profileProfessional, category: selected.name, location }); }}>Book this professional</button>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default Services;
