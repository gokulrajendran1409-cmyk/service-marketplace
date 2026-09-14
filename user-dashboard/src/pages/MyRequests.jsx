import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Clock3,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  XCircle,
  Wrench,
  Zap,
  Snowflake,
  Paintbrush,
  Monitor,
  FileText,
  Repeat,
  ArrowLeft,
  Phone,
  Share2,
  Check,
  Star,
  Download,
  CheckCircle,
  Plus,
  Minus,
  LocateFixed,
  Compass,
  Radio,
  Activity,
  X,
  Receipt,
  Copy,
  CreditCard,
  Printer,
  User,
  ExternalLink,
  Sparkles,
  CheckCheck,
  Info,
} from 'lucide-react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API } from '../constants';
import { useToast, Toast } from '../components/Toast';

const JOURNEY_STEPS = [
  { key: 'accepted', label: 'Professional accepted the job', time: '09:45 AM' },
  { key: 'on_the_way', label: 'On the way', time: '10:20 AM' },
  { key: 'arrived', label: 'Arrived at location', time: 'Pending' },
  { key: 'working', label: 'Service in progress', time: 'Pending' },
  { key: 'completed', label: 'Completed', time: 'Pending' },
];

// Interactive on-map zoom and recenter controls
function MapControls({ customerPoint, professionalPoint }) {
  const map = useMap();

  return (
    <div className="map-custom-floating-controls">
      <button
        type="button"
        className="map-float-btn"
        onClick={() => map.zoomIn()}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Plus size={18} />
      </button>
      <button
        type="button"
        className="map-float-btn"
        onClick={() => map.zoomOut()}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Minus size={18} />
      </button>
      <button
        type="button"
        className="map-float-btn recenter"
        onClick={() => map.fitBounds([customerPoint, professionalPoint], { padding: [48, 48] })}
        title="Recenter Route"
        aria-label="Recenter"
      >
        <LocateFixed size={18} />
      </button>
    </div>
  );
}

function FitRouteBounds({ customerPoint, proCoords }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([customerPoint, proCoords], { padding: [48, 48] });
  }, [map, customerPoint[0], customerPoint[1]]);
  return null;
}

function CustomerRouteMap({ request, onRouteDistance, onGeologicalInfo }) {
  const customerPoint = useMemo(() => [
    Number(request.latitude) || 8.5241,
    Number(request.longitude) || 76.9366,
  ], [request.latitude, request.longitude]);

  // Precise professional position state with live progress
  const [proCoords, setProCoords] = useState([
    Number(request.professional_latitude) || customerPoint[0] + 0.0125,
    Number(request.professional_longitude) || customerPoint[1] + 0.0142,
  ]);
  const [route, setRoute] = useState([customerPoint, proCoords]);
  const [geoLandmark, setGeoLandmark] = useState('Detecting current whereabouts...');

  // Customer destination marker
  const customerIcon = useMemo(() => L.divIcon({
    className: 'map-person-marker',
    html: '<div style="background:#0F172A;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.35);font-size:16px;">🏠</div>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  }), []);

  // Professional live marker with pulsing radar effect
  const professionalIcon = useMemo(() => L.divIcon({
    className: 'map-professional-marker-wrapper',
    html: `
      <div class="map-pro-pulse-container">
        <div class="map-pro-pulse-ring"></div>
        <div class="map-pro-pin">
          <span>🛠️</span>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  }), []);

  // Reverse geocoding for precise geological whereabouts
  useEffect(() => {
    let active = true;
    const [lat, lon] = proCoords;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=17`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const a = data.address || {};
        const parts = [a.road || a.pedestrian, a.suburb || a.neighbourhood, a.city || 'Thiruvananthapuram'].filter(Boolean);
        const resolved = parts.join(', ') || data.display_name?.slice(0, 48) || 'Palayam, Thiruvananthapuram';
        setGeoLandmark(resolved);
        onGeologicalInfo && onGeologicalInfo({ landmark: resolved, lat, lon });
      })
      .catch(() => {
        if (active) {
          const fallback = `Palayam Corridor (${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E)`;
          setGeoLandmark(fallback);
          onGeologicalInfo && onGeologicalInfo({ landmark: fallback, lat, lon });
        }
      });

    return () => {
      active = false;
    };
  }, [proCoords[0], proCoords[1]]);

  // Fetch actual driving route from OSRM
  useEffect(() => {
    let active = true;
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${proCoords[1]},${proCoords[0]};${customerPoint[1]},${customerPoint[0]}?overview=full&geometries=geojson`;
    fetch(routeUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Route lookup failed');
        return response.json();
      })
      .then((data) => {
        if (!active || data.code !== 'Ok' || !data.routes?.[0]) return;
        const coords = data.routes[0].geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]);
        setRoute(coords);
        onRouteDistance && onRouteDistance(data.routes[0].distance / 1000);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [customerPoint, proCoords]);

  // Live GPS movement animation towards customer location
  useEffect(() => {
    const interval = setInterval(() => {
      setProCoords((prev) => {
        const target = customerPoint;
        const step = 0.00018; // smooth GPS tick
        const dLat = target[0] - prev[0];
        const dLon = target[1] - prev[1];
        const dist = Math.sqrt(dLat * dLat + dLon * dLon);
        if (dist < 0.0006) return prev; // arrived
        return [prev[0] + (dLat / dist) * step, prev[1] + (dLon / dist) * step];
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [customerPoint]);

  return (
    <div className="visily-half-map-wrapper">
      <MapContainer
        className="customer-request-map-half"
        center={proCoords}
        zoom={14}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        zoomControl={false}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitRouteBounds customerPoint={customerPoint} proCoords={proCoords} />
        <MapControls customerPoint={customerPoint} professionalPoint={proCoords} />

        <Marker position={customerPoint} icon={customerIcon}>
          <Popup>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>🏠 Your Service Address</div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 3 }}>{request.location || 'Selected Delivery Location'}</div>
          </Popup>
        </Marker>

        <Marker position={proCoords} icon={professionalIcon}>
          <Popup>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#00796B' }}>🛠️ {request.professional_name || 'Assigned Professional'}</div>
            <div style={{ fontSize: 11.5, color: '#0F172A', marginTop: 3 }}>📍 {geoLandmark}</div>
            <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 2 }}>GPS: {proCoords[0].toFixed(5)}°, {proCoords[1].toFixed(5)}°</div>
          </Popup>
        </Marker>

        <Polyline
          positions={route}
          pathOptions={{
            color: '#00796B',
            weight: 5.5,
            opacity: 0.92,
            dashArray: route.length === 2 ? '8 8' : undefined,
          }}
        />
      </MapContainer>

      {/* Floating Geological GPS Pill on Map */}
      <div className="map-geo-floating-pill">
        <span className="live-gps-dot"></span>
        <span className="geo-text">
          GPS: {proCoords[0].toFixed(5)}° N, {proCoords[1].toFixed(5)}° E
        </span>
      </div>
    </div>
  );
}

function MyRequests({ navigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestFilter, setRequestFilter] = useState('upcoming'); // 'upcoming' | 'past' | 'cancelled'
  const [requestSearch, setRequestSearch] = useState('');

  // Modals / Overlays matching Visily reference screens:
  const [trackingRequest, setTrackingRequest] = useState(null); // Screen 11: Track Professional
  const [ratingRequest, setRatingRequest] = useState(null); // Screen 12: Rate Your Professional
  const [detailsRequest, setDetailsRequest] = useState(null); // Full Detail Modal
  const [geoInfo, setGeoInfo] = useState({ landmark: 'MG Road Corridor, Thiruvananthapuram', lat: 8.5241, lon: 76.9366 });
  const [routeDistanceKm, setRouteDistanceKm] = useState(1.2);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const handleCopyOtp = (otpText) => {
    if (!otpText) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(String(otpText));
      }
      setCopiedOtp(true);
      showToast('Arrival OTP copied to clipboard!', 'success');
      setTimeout(() => setCopiedOtp(false), 2500);
    } catch {
      showToast(`Arrival OTP: ${otpText}`, 'info');
    }
  };

  // Live real-time polling for professional location updates when tracking is active
  useEffect(() => {
    if (!trackingRequest) return;
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) return;
        const res = await fetch(`${API}/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            const updated = list.find((r) => r.id === trackingRequest.id);
            if (updated) {
              setTrackingRequest((prev) => ({
                ...prev,
                ...updated,
                professional_latitude: updated.professional_latitude || prev?.professional_latitude,
                professional_longitude: updated.professional_longitude || prev?.professional_longitude,
                journey_status: updated.journey_status || prev?.journey_status,
              }));
            }
          }
        }
      } catch (pollErr) {
        console.warn('Live tracking polling error:', pollErr);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [trackingRequest?.id]);

  const { toast, showToast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load requests');
      const data = await res.json();
      setRequests(data);
    } catch {
      showToast('Failed to load your requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Real-time updates via SSE with fallback polling
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    let eventSource = null;
    let pollInterval = null;

    try {
      eventSource = new EventSource(`${API}/notifications/stream?token=${token}`);

      eventSource.addEventListener('requestUpdate', (event) => {
        try {
          const data = JSON.parse(event.data);
          const { requestId, newStatus, journeyStatus, professionalName } = data;

          setRequests((current) =>
            current.map((r) =>
              r.id === requestId
                ? {
                    ...r,
                    status: newStatus,
                    journey_status: journeyStatus,
                    has_update: true,
                    update_received_at: new Date(),
                  }
                : r
            )
          );

          showToast(`${professionalName || 'Professional'} updated status to ${newStatus}`, 'info');
        } catch (e) {
          console.error('Error parsing SSE update:', e);
        }
      });

      eventSource.onerror = () => {
        eventSource?.close();
        if (!pollInterval) {
          pollInterval = setInterval(fetchRequests, 12000);
        }
      };
    } catch {
      pollInterval = setInterval(fetchRequests, 12000);
    }

    return () => {
      eventSource?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Submit Review to existing backend API
  const submitReview = async () => {
    if (!ratingRequest?.id || !reviewRating) {
      showToast('Please select a rating.', 'error');
      return;
    }

    setReviewSubmitting(true);
    try {
      const fullComment = [
        reviewTags.length > 0 ? `[${reviewTags.join(', ')}]` : '',
        reviewComment,
      ]
        .filter(Boolean)
        .join(' ');

      const res = await fetch(`${API}/requests/${ratingRequest.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify({ rating: reviewRating, comment: fullComment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');

      setRequests((current) =>
        current.map((req) =>
          req.id === ratingRequest.id
            ? {
                ...req,
                review_id: data.review?.id || 1,
                review_rating: reviewRating,
                review_comment: fullComment,
              }
            : req
        )
      );

      setRatingRequest(null);
      setReviewComment('');
      showToast('Review submitted. Thank you!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const toggleTag = (tag) => {
    setReviewTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Filter requests matching tabs
  const upcomingRequests = requests.filter((r) =>
    ['pending', 'accepted', 'in_progress'].includes(r.status)
  );
  const pastRequests = requests.filter((r) => r.status === 'completed');
  const cancelledRequests = requests.filter((r) => r.status === 'cancelled');

  let displayedRequests =
    requestFilter === 'upcoming'
      ? upcomingRequests
      : requestFilter === 'past'
      ? pastRequests
      : cancelledRequests;

  if (requestSearch.trim()) {
    const q = requestSearch.toLowerCase().trim();
    displayedRequests = displayedRequests.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.professional_name?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q)
    );
  }

  // Get status pill color styling matching Screen 10
  const getStatusBadge = (status) => {
    if (status === 'in_progress') {
      return {
        label: 'In Progress',
        bg: '#FEF3C7',
        color: '#B45309',
      };
    }
    if (status === 'accepted') {
      return {
        label: 'Confirmed',
        bg: '#E0F2F1',
        color: '#00796B',
      };
    }
    if (status === 'completed') {
      return {
        label: 'Completed',
        bg: '#DCFCE7',
        color: '#15803D',
      };
    }
    if (status === 'cancelled') {
      return {
        label: 'Cancelled',
        bg: '#FEE2E2',
        color: '#B91C1C',
      };
    }
    return {
      label: 'Upcoming',
      bg: '#E0F2FE',
      color: '#0369A1',
    };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '90px' }}>
      {/* ──────── Screen 10 Header: My Bookings ──────── */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '20px 20px 14px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => navigate('home')}
          style={{
            background: 'none',
            border: 'none',
            color: '#00796B',
            cursor: 'pointer',
            padding: 4,
          }}
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>
          My Bookings
        </h1>
        <div style={{ width: 24 }} />
      </div>

      {/* Tabs Container matching Screen 10 */}
      <div
        style={{
          display: 'flex',
          padding: '16px 20px 12px',
          gap: 10,
          background: '#FFFFFF',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        {[
          { id: 'upcoming', label: 'Upcoming', count: upcomingRequests.length },
          { id: 'past', label: 'Past', count: pastRequests.length },
          { id: 'cancelled', label: 'Cancelled', count: cancelledRequests.length },
        ].map(({ id, label, count }) => {
          const isActive = requestFilter === id;
          return (
            <button
              key={id}
              onClick={() => setRequestFilter(id)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 24,
                border: 'none',
                background: isActive ? '#00796B' : '#F1F5F9',
                color: isActive ? '#FFFFFF' : '#64748B',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
            >
              <span>{label}</span>
              {count > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 7px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div style={{ padding: '14px 20px 6px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#FFFFFF',
            borderRadius: 14,
            border: '1.5px solid #E2E8F0',
            padding: '0 14px',
            height: 44,
          }}
        >
          <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <input
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: 13.5,
              color: '#0F172A',
            }}
            placeholder="Search by service, provider or location..."
            value={requestSearch}
            onChange={(e) => setRequestSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings List */}
      <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <RefreshCw size={28} color="#00796B" className="spin" />
            <p style={{ marginTop: 12, color: '#64748B', fontSize: 13.5 }}>
              Loading your bookings...
            </p>
          </div>
        ) : displayedRequests.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #E2E8F0',
              marginTop: 10,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#E0F2F1',
                color: '#00796B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <Wrench size={26} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
              No {requestFilter} bookings
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 18 }}>
              When you book a service, it will appear right here.
            </p>
            <button
              className="visily-pill-btn"
              style={{ maxWidth: 200, margin: '0 auto', height: 44, fontSize: 14 }}
              onClick={() => navigate('home')}
            >
              Explore Services
            </button>
          </div>
        ) : (
          displayedRequests.map((req) => {
            const badge = getStatusBadge(req.status);
            const proName = req.professional_name || (req.status === 'pending' ? 'Auto-Matching Specialist' : 'Assigned Professional');
            const priceEst = req.wage ? `₹${Number(req.wage).toLocaleString('en-IN')}` : '₹470 - ₹620';
            const reqDate = req.requested_at || req.created_at;
            const dateStr = new Date(reqDate).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
            });
            const timeStr = new Date(reqDate).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={req.id}
                className="visily-card"
                style={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                }}
              >
                {/* Top Row: Provider Avatar + Service & Pro Name + Status Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: '#E0F2F1',
                      color: '#00796B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {proName.charAt(0)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#0F172A',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {req.title || `${req.category} Service`}
                      </h3>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 12,
                          background: badge.bg,
                          color: badge.color,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
                        {proName}
                      </span>
                      <span className="visily-verified-chip">
                        <ShieldCheck size={12} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date & Time Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#475569',
                  }}
                >
                  <Calendar size={15} color="#00796B" />
                  <span>
                    {dateStr} • {timeStr}
                  </span>
                </div>

                {/* Address Row */}
                {req.location && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 13,
                      color: '#475569',
                    }}
                  >
                    <MapPin size={15} color="#00796B" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.3,
                      }}
                    >
                      {req.location}
                    </span>
                  </div>
                )}

                {/* Price Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    borderTop: '1px solid #F1F5F9',
                  }}
                >
                  <span style={{ fontSize: 13, color: '#64748B' }}>Estimated Total</span>
                  <strong style={{ fontSize: 16, color: '#00796B' }}>{priceEst}</strong>
                </div>

                {/* Bottom Action Buttons (Matching Screen 10) */}
                <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                  {['accepted', 'in_progress'].includes(req.status) ? (
                    <>
                      <button
                        className="visily-pill-btn"
                        style={{ flex: 1, height: 42, fontSize: 13.5 }}
                        onClick={() => setTrackingRequest(req)}
                      >
                        <Navigation size={15} /> Track Professional
                      </button>
                      <button
                        className="visily-pill-btn-outline"
                        style={{ flex: 1, height: 42, fontSize: 13.5 }}
                        onClick={() => setDetailsRequest(req)}
                      >
                        View Details
                      </button>
                    </>
                  ) : req.status === 'completed' ? (
                    <>
                      <button
                        className="visily-pill-btn"
                        style={{ flex: 1, height: 42, fontSize: 13.5 }}
                        onClick={() => setRatingRequest(req)}
                      >
                        <Star size={15} /> Rate Professional
                      </button>
                      <button
                        className="visily-pill-btn-outline"
                        style={{ flex: 1, height: 42, fontSize: 13.5 }}
                        onClick={() => setDetailsRequest(req)}
                      >
                        View Invoice
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="visily-pill-btn-outline"
                        style={{ flex: 1, height: 42, fontSize: 13.5 }}
                        onClick={() => setDetailsRequest(req)}
                      >
                        View Details
                      </button>
                      <button
                        className="visily-pill-btn"
                        style={{ flex: 1, height: 42, fontSize: 13.5 }}
                        onClick={() => navigate('home')}
                      >
                        Book Another
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ──────── SCREEN 11: Track Professional Overlay (Half-Page Map Split View) ──────── */}
      {trackingRequest && (
        <div
          className="visily-modal-overlay visily-tracking-overlay"
          onClick={(e) => e.target === e.currentTarget && setTrackingRequest(null)}
        >
          <div className="visily-modal-container visily-tracking-half-modal">
            {/* Header */}
            <header className="visily-header visily-tracking-header">
              <button
                className="visily-header-btn"
                onClick={() => setTrackingRequest(null)}
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 className="visily-header-title">Track Professional</h2>
                <span className="live-pulse-badge">
                  <span className="live-dot"></span> LIVE GPS
                </span>
              </div>
              <button
                className="visily-header-btn"
                onClick={() => showToast('Tracking link copied!', 'success')}
                aria-label="Share"
              >
                <Share2 size={16} />
              </button>
            </header>

            {/* TOP 50%: Interactive Leaflet Map occupying half the viewport */}
            <div className="visily-tracking-map-section">
              <CustomerRouteMap
                request={trackingRequest}
                onRouteDistance={setRouteDistanceKm}
                onGeologicalInfo={setGeoInfo}
              />
            </div>

            {/* BOTTOM 50%: Live Arrival Info, Geological Whereabouts, and Service Journey */}
            <div className="visily-tracking-details-section">
              {/* ETA Banner */}
              <div className="visily-track-eta-banner">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <Clock3 size={16} /> Arriving in ~{Math.max(2, Math.round(routeDistanceKm * 4))} mins
                </span>
                <span style={{ fontSize: 13, color: '#00796B', fontWeight: 600 }}>
                  • {routeDistanceKm.toFixed(1)} km away • ~24 km/h
                </span>
              </div>

              {/* Precise Geological Whereabouts Card */}
              <div className="visily-card geo-whereabouts-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div className="geo-icon-box">
                    <Compass size={18} color="#00796B" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: '#00796B', textTransform: 'uppercase' }}>
                        Geological Whereabouts
                      </span>
                      <span className="geo-status-indicator">
                        <span className="geo-status-dot"></span> Signal Locked
                      </span>
                    </div>
                    <strong style={{ fontSize: 13.5, color: '#0F172A', display: 'block', marginTop: 2 }}>
                      {geoInfo.landmark || 'En route via Palayam Corridor'}
                    </strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11.5, color: '#475569', fontFamily: 'monospace', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>
                        GPS: {geoInfo.lat?.toFixed(5)}° N, {geoInfo.lon?.toFixed(5)}° E
                      </span>
                      <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Activity size={13} /> High-Precision Live Fix
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Card */}
              <div
                className="visily-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  border: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    background: '#00796B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 17,
                    flexShrink: 0,
                  }}
                >
                  {(trackingRequest.professional_name || 'Assigned Professional').charAt(0)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 14, color: '#0F172A', display: 'block' }}>
                    {trackingRequest.professional_name || 'Assigned Professional'}
                  </strong>
                  <small style={{ fontSize: 12, color: '#64748B', display: 'block' }}>
                    {trackingRequest.category || 'Specialist'} • Verified Professional
                  </small>
                </div>

                {/* Call & Chat Buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="visily-action-circle-btn"
                    onClick={() => {
                      if (trackingRequest.professional_phone) {
                        window.location.href = `tel:${trackingRequest.professional_phone}`;
                      } else {
                        alert('Calling professional: +91 98765 43210');
                      }
                    }}
                    title="Call Professional"
                  >
                    <Phone size={17} />
                  </button>
                  <button
                    className="visily-action-circle-btn"
                    onClick={() => {
                      showToast('Opening chat with professional...', 'info');
                    }}
                    title="Message"
                  >
                    <MessageSquare size={17} />
                  </button>
                </div>
              </div>

              {/* Live Tracking Timeline Steps matching Screen 11 */}
              <div>
                <h4 style={{ fontSize: 12.5, fontWeight: 700, color: '#64748B', marginBottom: 10, letterSpacing: '0.02em' }}>
                  SERVICE JOURNEY PROGRESS
                </h4>
                <div className="visily-timeline-container">
                  {JOURNEY_STEPS.map((stepItem, idx) => {
                    const currentStatus = trackingRequest.journey_status || 'on_the_way';
                    const activeIdx = JOURNEY_STEPS.findIndex((s) => s.key === currentStatus);
                    const isDone = idx < (activeIdx === -1 ? 1 : activeIdx);
                    const isCurrent = idx === (activeIdx === -1 ? 1 : activeIdx);

                    return (
                      <div
                        key={stepItem.key}
                        className={`visily-timeline-item ${isDone ? 'done' : ''}`}
                      >
                        <div
                          className={`visily-timeline-dot ${
                            isDone ? 'done' : isCurrent ? 'current' : ''
                          }`}
                        >
                          {isDone ? <Check size={13} strokeWidth={3} /> : idx + 1}
                        </div>
                        <div className="visily-timeline-content">
                          <span
                            className="visily-timeline-title"
                            style={{
                              color: isCurrent ? '#00796B' : isDone ? '#0F172A' : '#94A3B8',
                              fontWeight: isCurrent ? 700 : 600,
                            }}
                          >
                            {stepItem.label}
                          </span>
                          <span className="visily-timeline-time">
                            {isDone ? stepItem.time : isCurrent ? 'In progress' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <div style={{ marginTop: 4, paddingBottom: 16 }}>
                <button
                  className="visily-pill-btn"
                  onClick={() => setTrackingRequest(null)}
                >
                  Done Tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────── SCREEN 12: Rate Your Professional Overlay ──────── */}
      {ratingRequest && (
        <div
          className="visily-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setRatingRequest(null)}
        >
          <div className="visily-modal-container">
            {/* Header */}
            <header className="visily-header">
              <button
                className="visily-header-btn"
                onClick={() => setRatingRequest(null)}
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="visily-header-title">Rate Your Professional</h2>
              <button
                className="visily-header-btn"
                onClick={() => setRatingRequest(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            <div className="visily-body">
              {/* Professional info banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: '#F8FAFC',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
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
                  {(ratingRequest.professional_name || 'Assigned Professional').charAt(0)}
                </div>
                <div>
                  <strong style={{ fontSize: 14.5, color: '#0F172A', display: 'block' }}>
                    {ratingRequest.professional_name || 'Assigned Professional'}
                  </strong>
                  <small style={{ fontSize: 12, color: '#64748B' }}>
                    {ratingRequest.category || 'Specialist'} • Verified
                  </small>
                </div>
              </div>

              {/* Experience Question */}
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                  How was your experience?
                </h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                  Your feedback helps maintain quality on the platform.
                </p>

                {/* 5 Big Stars */}
                <div className="visily-star-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`visily-star-picker-btn ${
                        star <= reviewRating ? 'active' : ''
                      }`}
                      onClick={() => setReviewRating(star)}
                      aria-label={`${star} star`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Attribute Chips matching Screen 12 */}
              <div className="visily-tags-wrap">
                {[
                  'Punctual',
                  'Professional',
                  'Clean Work',
                  'Good Communication',
                  'Value for Money',
                ].map((tag) => {
                  const isChecked = reviewTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`visily-tag-chip ${isChecked ? 'active' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Review Textarea */}
              <div className="visily-form-group">
                <label className="visily-label">Write a review (optional)</label>
                <div className="visily-textarea-wrap">
                  <textarea
                    className="visily-textarea"
                    placeholder="Share your experience with others..."
                    value={reviewComment}
                    maxLength={300}
                    onChange={(e) => setReviewComment(e.target.value)}
                    style={{ minHeight: 90 }}
                  />
                  <span className="visily-char-counter">{reviewComment.length}/300</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                <button
                  className="visily-pill-btn"
                  onClick={submitReview}
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────── Full Details & Invoice Modal ──────── */}
      {detailsRequest && (() => {
        const badge = getStatusBadge(detailsRequest.status);
        const baseWage = Number(detailsRequest.wage) || 450;
        const isFinalWage = Boolean(detailsRequest.wage);
        const platformFee = 49;
        const gstRate = 0.05;
        const gstAmount = Math.round((baseWage + platformFee) * gstRate);
        const totalAmount = baseWage + platformFee + gstAmount;

        const bookingRef = `#SM-${detailsRequest.id}`;
        const invoiceNumber = `INV-${new Date(detailsRequest.created_at || Date.now()).getFullYear()}-${String(detailsRequest.id).padStart(5, '0')}`;
        const reqDate = detailsRequest.requested_at || detailsRequest.created_at;
        const dateStr = new Date(reqDate).toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const timeStr = new Date(reqDate).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const proName = detailsRequest.professional_name || (detailsRequest.status === 'pending' ? null : 'Assigned Specialist');
        const proCategory = detailsRequest.professional_category || detailsRequest.category || 'Certified Expert';
        const proRating = detailsRequest.professional_avg_rating ? Number(detailsRequest.professional_avg_rating).toFixed(1) : '4.9';
        const proReviewsCount = detailsRequest.professional_review_count || 18;
        const proPhone = detailsRequest.professional_phone;
        const proPhoto = detailsRequest.professional_profile_photo;

        return (
          <div
            className="visily-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setDetailsRequest(null)}
          >
            <div className="visily-modal-container visily-details-modal">
              {/* Modal Header */}
              <header className="visily-header">
                <button
                  className="visily-header-btn"
                  onClick={() => setDetailsRequest(null)}
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
                <div style={{ textAlign: 'center' }}>
                  <h2 className="visily-header-title">Booking Details & Invoice</h2>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{bookingRef}</span>
                </div>
                <button
                  className="visily-header-btn"
                  onClick={() => setDetailsRequest(null)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="visily-body details-modal-scroll">
                {/* 1. Service Status & Summary Card */}
                <div className="details-overview-card">
                  <div className="details-overview-top">
                    <span
                      className="details-status-pill"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                    <span className="details-date-pill">
                      <Clock size={12} /> {timeStr}
                    </span>
                  </div>

                  <h3 className="details-service-title">
                    {detailsRequest.title || `${detailsRequest.category || 'Home'} Service`}
                  </h3>

                  <div className="details-meta-list">
                    <div className="details-meta-item">
                      <Calendar size={15} color="#00796B" style={{ flexShrink: 0 }} />
                      <span>{dateStr} at {timeStr}</span>
                    </div>
                    {detailsRequest.location && (
                      <div className="details-meta-item">
                        <MapPin size={15} color="#00796B" style={{ flexShrink: 0 }} />
                        <span>{detailsRequest.location}</span>
                      </div>
                    )}
                  </div>

                  {detailsRequest.description && (
                    <div className="details-notes-box">
                      <span className="details-notes-label">Customer Instructions / Issue:</span>
                      <p className="details-notes-text">{detailsRequest.description}</p>
                    </div>
                  )}
                </div>

                {/* 2. Professional Details Card */}
                <div className="details-section-wrapper">
                  <div className="details-section-heading">
                    <User size={15} color="#00796B" />
                    <span>Professional Assigned</span>
                  </div>

                  {proName ? (
                    <div className="details-pro-card">
                      <div className="details-pro-header">
                        <div className="details-pro-avatar-wrap">
                          {proPhoto ? (
                            <img
                              src={proPhoto.startsWith('http') ? proPhoto : `${API.replace('/api/user', '')}/${proPhoto}`}
                              alt={proName}
                              className="details-pro-avatar-img"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="details-pro-avatar-fallback"
                            style={{ display: proPhoto ? 'none' : 'flex' }}
                          >
                            {proName.charAt(0)}
                          </div>
                          <span className="details-pro-online-badge" />
                        </div>

                        <div className="details-pro-info">
                          <div className="details-pro-name-row">
                            <h4 className="details-pro-name">{proName}</h4>
                            <span className="visily-verified-chip">
                              <ShieldCheck size={12} /> Verified
                            </span>
                          </div>
                          <p className="details-pro-category">{proCategory}</p>
                          <div className="details-pro-rating">
                            <Star size={13} fill="#F59E0B" color="#F59E0B" />
                            <strong>{proRating}</strong>
                            <span>({proReviewsCount} reviews)</span>
                          </div>
                        </div>
                      </div>

                      {/* Professional Quick Action CTAs */}
                      <div className="details-pro-actions">
                        <a
                          href={proPhone ? `tel:${proPhone}` : 'tel:+919876543210'}
                          className="details-action-btn pro-call"
                          onClick={(e) => {
                            if (!proPhone) {
                              e.preventDefault();
                              showToast('Connecting via secure masked call line (+91 98765 43210)...', 'info');
                              window.location.href = 'tel:+919876543210';
                            }
                          }}
                        >
                          <Phone size={14} />
                          <span>{proPhone ? `Call (${proPhone})` : 'Call Specialist'}</span>
                        </a>

                        {['accepted', 'in_progress'].includes(detailsRequest.status) && (
                          <button
                            type="button"
                            className="details-action-btn pro-track"
                            onClick={() => {
                              const target = detailsRequest;
                              setDetailsRequest(null);
                              setTrackingRequest(target);
                            }}
                          >
                            <Navigation size={14} />
                            <span>Live Map Track</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="details-pending-pro-card">
                      <div className="details-pending-icon-box">
                        <Clock3 size={20} color="#00796B" />
                      </div>
                      <div className="details-pending-text">
                        <strong>Auto-Dispatching Certified Specialist</strong>
                        <p>
                          We are matching the top-rated verified professional for {detailsRequest.category || 'your service'}. You will receive their contact details as soon as accepted.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Security Arrival OTP Box */}
                {detailsRequest.otp && (
                  <div className="details-otp-card">
                    <div className="details-otp-left">
                      <div className="details-otp-header">
                        <ShieldCheck size={16} color="#00796B" />
                        <strong>Arrival Security OTP</strong>
                      </div>
                      <p className="details-otp-instruction">
                        Share this 4-digit code with the professional only upon arrival at your doorstep.
                      </p>
                    </div>

                    <div className="details-otp-right">
                      <div className="details-otp-digits">{detailsRequest.otp}</div>
                      <button
                        type="button"
                        className="details-otp-copy-btn"
                        onClick={() => handleCopyOtp(detailsRequest.otp)}
                        title="Copy OTP"
                      >
                        {copiedOtp ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                        <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Itemized Tax Invoice Details */}
                <div className="details-invoice-card">
                  <div className="details-invoice-top">
                    <div className="details-invoice-brand">
                      <div className="details-invoice-icon-box">
                        <Receipt size={18} color="#00796B" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h4 className="details-invoice-title">Tax Invoice</h4>
                          <span
                            className="details-payment-status-badge"
                            style={{
                              background:
                                detailsRequest.payment_status === 'paid'
                                  ? '#DCFCE7'
                                  : detailsRequest.payment_status === 'awaiting_payment'
                                  ? '#FEF3C7'
                                  : '#F1F5F9',
                              color:
                                detailsRequest.payment_status === 'paid'
                                  ? '#166534'
                                  : detailsRequest.payment_status === 'awaiting_payment'
                                  ? '#92400E'
                                  : '#475569',
                            }}
                          >
                            {detailsRequest.payment_status === 'paid'
                              ? 'PAID'
                              : detailsRequest.payment_status === 'awaiting_payment'
                              ? 'PAYMENT DUE'
                              : isFinalWage
                              ? 'BILLED'
                              : 'ESTIMATE'}
                          </span>
                        </div>
                        <span className="details-invoice-ref">
                          {invoiceNumber} • {dateStr}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="details-print-btn"
                      onClick={() => window.print()}
                      title="Print / Save Tax Invoice as PDF"
                    >
                      <Printer size={14} />
                      <span>Print</span>
                    </button>
                  </div>

                  <div className="details-invoice-body">
                    {/* Item 1: Base Labor */}
                    <div className="details-invoice-line">
                      <div>
                        <span className="details-line-title">Labor & Service Wage</span>
                        <span className="details-line-subtitle">
                          {detailsRequest.wage_description || `${detailsRequest.title || 'Service'} execution and expert labor`}
                        </span>
                      </div>
                      <span className="details-line-amount">
                        ₹{baseWage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Item 2: Platform Fee */}
                    <div className="details-invoice-line">
                      <div>
                        <span className="details-line-title">Platform & Trust Fee</span>
                        <span className="details-line-subtitle">
                          Includes verified professional insurance & 24/7 support
                        </span>
                      </div>
                      <span className="details-line-amount">
                        ₹{platformFee.toFixed(2)}
                      </span>
                    </div>

                    {/* Item 3: GST */}
                    <div className="details-invoice-line">
                      <div>
                        <span className="details-line-title">Applicable Taxes (GST 5%)</span>
                        <span className="details-line-subtitle">CGST (2.5%) + SGST (2.5%)</span>
                      </div>
                      <span className="details-line-amount">
                        ₹{gstAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="details-invoice-separator" />

                    {/* Total Row */}
                    <div className="details-invoice-total-row">
                      <div>
                        <strong className="details-total-title">
                          {isFinalWage ? 'Total Amount Payable' : 'Estimated Total Amount'}
                        </strong>
                        <span className="details-total-tax-note">Inclusive of all taxes</span>
                      </div>
                      <strong className="details-total-figure">
                        ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>

                    {/* Payment Status Notification Banner */}
                    {detailsRequest.payment_status === 'paid' ? (
                      <div className="details-payment-confirmed-strip">
                        <CheckCheck size={16} color="#059669" />
                        <span>Paid in Full • Digital Payment Verified</span>
                      </div>
                    ) : (
                      <div className="details-payment-pending-strip">
                        <Clock size={14} color="#D97706" />
                        <span>Payment due upon job completion via UPI, Card, or Cash</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Customer Review Info if exists */}
                {detailsRequest.review_rating && (
                  <div className="details-review-box">
                    <div className="details-review-header">
                      <Star size={15} fill="#F59E0B" color="#F59E0B" />
                      <strong>Your Review ({detailsRequest.review_rating} / 5 Stars)</strong>
                    </div>
                    {detailsRequest.review_comment && (
                      <p className="details-review-text">"{detailsRequest.review_comment}"</p>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="visily-modal-footer">
                {['accepted', 'in_progress'].includes(detailsRequest.status) ? (
                  <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                    <button
                      type="button"
                      className="visily-pill-btn"
                      style={{ flex: 1 }}
                      onClick={() => {
                        const target = detailsRequest;
                        setDetailsRequest(null);
                        setTrackingRequest(target);
                      }}
                    >
                      <Navigation size={16} /> Track on Live Map
                    </button>
                    <button
                      type="button"
                      className="visily-pill-btn-outline"
                      style={{ flex: 1 }}
                      onClick={() => setDetailsRequest(null)}
                    >
                      Close
                    </button>
                  </div>
                ) : detailsRequest.status === 'completed' && !detailsRequest.review_rating ? (
                  <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                    <button
                      type="button"
                      className="visily-pill-btn"
                      style={{ flex: 1 }}
                      onClick={() => {
                        const target = detailsRequest;
                        setDetailsRequest(null);
                        setRatingRequest(target);
                      }}
                    >
                      <Star size={16} /> Rate Professional
                    </button>
                    <button
                      type="button"
                      className="visily-pill-btn-outline"
                      style={{ flex: 1 }}
                      onClick={() => setDetailsRequest(null)}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="visily-pill-btn"
                    onClick={() => setDetailsRequest(null)}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <Toast toast={toast} />
    </div>
  );
}

export default MyRequests;
