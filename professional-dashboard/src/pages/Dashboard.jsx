import { useEffect, useState, useRef } from "react";
import { 
  ClipboardList, CheckCheck, RefreshCw, XCircle, 
  DollarSign, Clock, Bell, Power, ChevronRight, 
  Star, TrendingUp, Zap, ShieldCheck, ArrowUpRight,
  User, MapPin, Calendar
} from 'lucide-react';
import { useProfessionalNotifications } from "../hooks/useProfessionalNotifications";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Circle, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://service-marketplace-af7p.onrender.com';

// Fix leaflet default marker icon issue (optional for Circle, but good practice)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
}

function Dashboard() {
  const navigate = useNavigate();
  const professional = JSON.parse(localStorage.getItem("professional") || "{}");
  const professionalId = professional.id;
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const { notifications, unreadCount, markAllRead } = useProfessionalNotifications(professionalId);
  const dropdownRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [ongoingRequests, setOngoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentLocation, setCurrentLocation] = useState(
    professional.location && professional.location !== professional.city
      ? professional.location
      : ""
  );
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Map Modal State
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState(professional.work_lat && professional.work_lng ? [parseFloat(professional.work_lat), parseFloat(professional.work_lng)] : [19.0760, 72.8777]);
  const [mapRadius, setMapRadius] = useState(professional.work_radius ? parseInt(professional.work_radius) : 10);

  const updateLocationFromCoordinates = async (latitude, longitude) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
    const data = await res.json();
          
    const address = data.address || {};
          const localPlace = address.neighbourhood || address.suburb || address.residential || address.road || address.hamlet || "";
          const city = address.city || address.town || address.village || address.state_district || "";
          const addressParts = [
            address.house_number,
            address.road,
            address.neighbourhood || address.suburb,
            city,
            address.state,
            address.postcode,
          ].filter(Boolean);
          const accurateLocation = data.display_name || [...new Set(addressParts)].join(', ') || localPlace || "Location Found";
          
          setCurrentLocation(accurateLocation);
          
          const updatedProf = {
            ...professional,
            location: accurateLocation,
            address: addressParts.join(', '),
            city: city || accurateLocation,
            pincode: address.postcode || professional.pincode,
            work_lat: latitude,
            work_lng: longitude,
          };
          localStorage.setItem("professional", JSON.stringify(updatedProf));
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await updateLocationFromCoordinates(position.coords.latitude, position.coords.longitude);
        } catch (err) {
          setCurrentLocation("Accurate Location Found");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        console.error(error);
        setIsFetchingLocation(false);
        alert("Unable to retrieve your location. Please check your browser permissions.");
      }
    );
  };

  useEffect(() => {
    const latitude = Number(professional.work_lat);
    const longitude = Number(professional.work_lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || currentLocation) return;

    updateLocationFromCoordinates(latitude, longitude).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("professionalToken");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [statsRes, requestsRes] = await Promise.all([
        fetch(`${API}/api/professionals/dashboard`, { headers }),
        fetch(`${API}/api/professionals/requests`, { headers }),
      ]);
      if (statsRes.status === 401 || requestsRes.status === 401) {
        localStorage.removeItem("professionalToken");
        localStorage.removeItem("professional");
        navigate("/login");
        return;
      }
      if (statsRes.ok) setStats(await statsRes.json());
      if (requestsRes.ok) {
        const allRequests = await requestsRes.json();
        // Sort by newest first
        const sorted = [...allRequests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentRequests(sorted.slice(0, 3));
        
        // Ongoing contains only jobs accepted by this professional until completion.
        const ACTIVE_STATUSES = new Set(['accepted', 'in_progress']);
        const ongoing = sorted.filter(req =>
          req.offer_status === 'accepted'
          && (ACTIVE_STATUSES.has(req.status) || req.payment_status === 'awaiting_payment')
        );
        setOngoingRequests(ongoing);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleRequestUpdated = () => fetchData();
    window.addEventListener('professional-request-updated', handleRequestUpdated);
    return () => window.removeEventListener('professional-request-updated', handleRequestUpdated);
  }, []);

  const getInitials = (name) => {
    if (!name) return "P";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const completionRate = stats && stats.total_requests > 0
    ? Math.round((stats.completed_requests / stats.total_requests) * 100)
    : 0;

  const getStatusStyle = (status) => {
    const map = {
      pending:    { bg: '#FFFBEB', color: '#B45309', label: 'Pending' },
      accepted:   { bg: '#EFF6FF', color: '#1D4ED8', label: 'Accepted' },
      in_progress:{ bg: '#F0F9FF', color: '#0369A1', label: 'In Progress' },
      completed:  { bg: '#ECFDF5', color: '#065F46', label: 'Done' },
      rejected:   { bg: '#FEF2F2', color: '#991B1B', label: 'Rejected' },
      cancelled:  { bg: '#F9FAFB', color: '#4B5563', label: 'Cancelled' },
    };
    return map[status] || map.pending;
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: 16 }}>
      <RefreshCw className="spin" size={28} color="var(--accent-primary)" />
      <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>Loading dashboard...</span>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: 12, padding: '0 32px', textAlign: 'center' }}>
      <XCircle size={36} color="var(--error)" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{error}</p>
      <button onClick={fetchData} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
    </div>
  );

  return (
    <div className="pro-dashboard-root">

      {/* ── HERO HEADER ── */}
      <div className="pro-hero-header">
        <div className="pro-hero-bg" />
        
        <div className="pro-hero-content" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          {/* Top Bar with Location & Notifications */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div className="pro-location-control" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.9)', padding: '6px 14px', borderRadius: '14px', backdropFilter: 'blur(8px)', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', maxWidth: 'calc(100% - 48px)' }}>
              <MapPin size={16} color="var(--accent-primary)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1 }}>Current Location</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 800, lineHeight: 1.2, marginTop: '2px', maxWidth: 'min(62vw, 360px)', whiteSpace: 'normal' }}>
                  {currentLocation ? (
                    currentLocation
                  ) : isFetchingLocation ? (
                    "Fetching..."
                  ) : (
                    <span onClick={fetchLocation} style={{ color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'underline' }}>Enable Location</span>
                  )}
                </span>
              </div>
            </div>

            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                className="pro-bell-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (unreadCount > 0 && !showNotifications) markAllRead();
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="pro-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {notifications.length > 0 && <button onClick={markAllRead}>Mark all read</button>}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">No new notifications</div>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                        <div className="notification-title">{n.title}</div>
                        <div className="notification-message">{n.message}</div>
                        <div className="notification-time">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pro-hero-left" style={{ width: '100%' }}>
            <div className="pro-hero-avatar">{getInitials(professional.full_name)}</div>
            <div>
              <div className="pro-hero-greeting">Welcome back 👋</div>
              <h1 className="pro-hero-name">{professional.full_name?.split(' ')[0] || "Professional"}</h1>
              <button
                className={`pro-online-pill ${isOnline ? 'online' : 'offline'}`}
                onClick={() => setIsOnline(!isOnline)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: '4px' }}
              >
                <span className="pro-online-dot" />
                {isOnline ? "Online · Tap to go offline" : "Offline · Tap to go online"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '0 24px 20px' }}>
        {[
          {
            label: 'Total',
            value: stats?.total_requests ?? '—',
            icon: '📋',
            bg: 'var(--stat-total-bg)',
            color: 'var(--text-primary)'
          },
          {
            label: 'Pending',
            value: stats?.pending_requests ?? '—',
            icon: '⏳',
            bg: 'var(--stat-pending-bg)',
            color: 'var(--stat-pending-text)'
          },
          {
            label: 'Done',
            value: stats?.completed_requests ?? '—',
            icon: '✅',
            bg: 'var(--stat-done-bg)',
            color: 'var(--stat-done-text)'
          },
          {
            label: 'Rating',
            value: stats?.avg_rating > 0 ? stats.avg_rating.toFixed(1) : '—',
            icon: '⭐',
            bg: 'var(--stat-rating-bg)',
            color: 'var(--stat-rating-text)',
            sub: stats?.review_count > 0 ? `${stats.review_count} review${stats.review_count !== 1 ? 's' : ''}` : 'No reviews'
          }
        ].map(({ label, value, icon, bg, color, sub }) => (
          <div 
            key={label} 
            style={{ 
              background: bg, 
              borderRadius: 14, 
              padding: '12px 10px', 
              textAlign: 'center', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              cursor: 'default'
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
            {sub && <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* ── TOTAL EARNINGS HERO CARD ── */}
      <div
        style={{
          margin: '0 24px 20px',
          borderRadius: 20,
          background: 'var(--earnings-bg)',
          padding: '22px 24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--earnings-shadow)',
        }}
      >
        {/* Decorative glows */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div onClick={() => navigate('/wallet')} style={{ cursor: 'pointer', flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              💰 Total Earnings
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
              ₹{(stats?.total_earnings || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontWeight: 500 }}>
              from {stats?.completed_requests || 0} completed job{stats?.completed_requests !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div 
              onClick={() => navigate('/reviews')}
              style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '8px 12px', backdropFilter: 'blur(8px)', cursor: 'pointer' }}
            >
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textAlign: 'center', marginBottom: 2 }}>RATING</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#FCD34D', textAlign: 'center' }}>
                {stats?.avg_rating > 0 ? `${stats.avg_rating.toFixed(1)} ⭐` : '— ⭐'}
              </div>
            </div>
            <div onClick={() => navigate('/wallet')} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, cursor: 'pointer' }}>
              View Wallet →
            </div>
          </div>
        </div>
      </div>

      {/* ── PROFILE SETUP BANNER ── */}
      {stats?.profile_setup_completed === false && (
        <div style={{ margin: '0 24px 24px', padding: '16px 20px', background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '1px solid #FDE68A', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#F59E0B', color: 'white', padding: '8px', borderRadius: '12px' }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#92400E', margin: 0 }}>Set up your profile</h3>
              <p style={{ fontSize: '12.5px', color: '#B45309', margin: '2px 0 0', fontWeight: 500 }}>Complete your profile to start getting work.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/setup-profile')}
            style={{ background: '#D97706', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Set Up
          </button>
        </div>
      )}

      {/* ── WORK AREA PREFERENCE ── */}
      <div style={{ margin: '0 24px 24px', padding: '16px 20px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'var(--bg-light-green)', color: 'var(--accent-primary)', padding: '10px', borderRadius: '14px', flexShrink: 0 }}>
            <MapPin size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>Service Area</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '3px 0 0', fontWeight: 500, lineHeight: 1.4 }}>
              {professional.work_radius ? `Available for jobs within ${professional.work_radius} km` : 'Set your preferred working radius'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            setShowMapModal(true);
            if (!professional.work_lat || !professional.work_lng) {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
                  (err) => console.log("Location access denied, falling back to default.", err)
                );
              }
            }
          }}
          style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', padding: '8px 14px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '10px' }}
        >
          {professional.work_radius ? 'Edit' : 'Set Area'}
        </button>
      </div>

      {/* ── ONGOING JOBS SECTION ── */}
      {ongoingRequests.length > 0 && (
        <div className="pro-section pro-ongoing-section" style={{ marginBottom: 24 }}>
          <div className="pro-section-head">
            <h2>Ongoing Jobs</h2>
          </div>
          <div className="pro-jobs-list" style={{ padding: '0 24px' }}>
            {ongoingRequests.map(req => {
              const statusStyle = getStatusStyle(req.status);
              const initials = (req.customer_name || 'C').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              const isPaid = req.payment_status === 'paid';
              return (
                <div key={req.id} className={`pro-job-card ${req.status}`} onClick={() => navigate('/requests')} style={{ cursor: 'pointer', marginBottom: '12px' }}>
                  <div className="pro-job-left">
                    <div className="pro-job-avatar" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                      {initials}
                    </div>
                    <div>
                      <div className="pro-job-title">{req.title || req.customer_name}</div>
                      <div className="pro-job-meta">
                        {req.customer_name}
                        {req.requested_at && ` · ${new Date(req.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                      </div>
                    </div>
                  </div>
                  <div className="pro-job-right">
                    {isPaid ? (
                      <span className="pro-job-status" style={{ background: '#D1FAE5', color: '#065F46' }}>Paid</span>
                    ) : (
                      <span className="pro-job-status" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                        {statusStyle.label}
                      </span>
                    )}
                    {req.wage && (
                      <div className="pro-job-earnings">₹{Number(req.wage).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* ── MAP MODAL ── */}
      {showMapModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', borderRadius: '24px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Select Work Area</h2>
              <button onClick={() => setShowMapModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <XCircle size={24} color="var(--text-secondary)" />
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px', fontWeight: 500 }}>Tap on the map to set your center point, then adjust the radius.</p>
              
              <div style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-light)', marginBottom: '16px', position: 'relative', zIndex: 0 }}>
                <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker onSelect={setMapCenter} />
                  <Circle center={mapCenter} radius={mapRadius * 1000} pathOptions={{ color: 'var(--accent-primary)', fillColor: 'var(--accent-primary)', fillOpacity: 0.2 }} />
                  <CircleMarker
                    center={mapCenter}
                    radius={7}
                    pathOptions={{ color: '#F8FAFC', weight: 3, fillColor: '#0F172A', fillOpacity: 1 }}
                  />
                </MapContainer>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-light)' }}>
                <MapPin size={15} color="var(--accent-primary)" />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Center point: {mapCenter[0].toFixed(5)}, {mapCenter[1].toFixed(5)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Working Radius</label>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-primary)' }}>{mapRadius} km</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={mapRadius} 
                  onChange={(e) => setMapRadius(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <button 
                onClick={() => {
                  const updated = { ...professional, work_radius: mapRadius, work_lat: mapCenter[0], work_lng: mapCenter[1] };
                  localStorage.setItem("professional", JSON.stringify(updated));
                  setShowMapModal(false);
                  window.location.reload();
                }}
                style={{ width: '100%', background: 'var(--accent-gradient)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', marginTop: '24px', cursor: 'pointer', transition: 'all 0.15s ease' }}
              >
                Save Area
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
