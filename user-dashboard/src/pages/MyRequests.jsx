import { useEffect, useState } from 'react';
import { MapPin, Calendar, RefreshCw, Plus, Navigation } from 'lucide-react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API } from '../constants';
import { useToast, Toast } from '../components/Toast';

// Demo customer ID — in a real app this comes from auth
const CUSTOMER_ID = 1;

const JOURNEY_STEPS = [
  { key: 'start_navigation', label: 'Start navigation', detail: 'The professional has started travelling to your location.' },
  { key: 'on_the_way', label: 'On the way', detail: 'The professional is travelling to you now.' },
  { key: 'arrived', label: 'Arrived', detail: 'The professional has arrived at your service location.' },
  { key: 'working', label: 'Working', detail: 'The professional is working on your service request.' },
  { key: 'completed', label: 'Completed', detail: 'The professional has completed the requested work.' },
];

function CustomerRouteMap({ request, onRouteDistance }) {
  const customerPoint = [Number(request.latitude), Number(request.longitude)];
  const professionalPoint = [Number(request.professional_latitude), Number(request.professional_longitude)];
  const [route, setRoute] = useState([customerPoint, professionalPoint]);
  const customerIcon = L.divIcon({ className: 'map-person-marker', html: '👤', iconSize: [32, 32], iconAnchor: [16, 16] });
  const professionalIcon = L.divIcon({ className: 'map-professional-marker', html: '🛠️', iconSize: [32, 32], iconAnchor: [16, 16] });

  useEffect(() => {
    let active = true;
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${professionalPoint[1]},${professionalPoint[0]};${customerPoint[1]},${customerPoint[0]}?overview=full&geometries=geojson`;
    fetch(routeUrl)
      .then(response => {
        if (!response.ok) throw new Error('Route lookup failed');
        return response.json();
      })
      .then(data => {
        if (!active || data.code !== 'Ok' || !data.routes?.[0]) return;
        setRoute(data.routes[0].geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]));
        onRouteDistance(data.routes[0].distance / 1000);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [customerPoint[0], customerPoint[1], professionalPoint[0], professionalPoint[1]]);

  function FitRouteBounds() {
    const map = useMap();
    useEffect(() => {
      map.fitBounds([customerPoint, professionalPoint], { padding: [32, 32] });
    }, [map]);
    return null;
  }

  return (
    <MapContainer className="customer-request-map" center={customerPoint} zoom={13} scrollWheelZoom>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitRouteBounds />
      <Marker position={customerPoint} icon={customerIcon}><Popup>Your location</Popup></Marker>
      <Marker position={professionalPoint} icon={professionalIcon}><Popup>Professional location</Popup></Marker>
      <Polyline positions={route} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.9, dashArray: route.length === 2 ? '10 8' : undefined }} />
    </MapContainer>
  );
}

function MyRequests({ navigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingLocationId, setViewingLocationId] = useState(null);
  const { toast, showToast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API}/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRequests(data);
    } catch {
      showToast('Failed to load your requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const confirmPayment = async (requestId) => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API}/requests/${requestId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to confirm payment');
      setRequests(current => current.map(r => r.id === requestId ? {
        ...r,
        status: data.request.status,
        journey_status: data.request.journey_status,
        payment_status: data.request.payment_status
      } : r));
      showToast('Payment confirmed! Thank you.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const statusLabel = {
    pending: 'Pending',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">My Requests</h1>
          <p className="page-subtitle">Track the status of all your service requests.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchRequests}
            style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            className="btn-hire"
            style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => navigate('services')}
          >
            <Plus size={15} /> New Request
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw className="spin" size={32} color="var(--text-muted)" />
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>📋</div>
          <h3>No requests yet</h3>
          <p>Browse services and book your first professional!</p>
          <button className="btn-hire" style={{ width: 'auto', padding: '12px 28px', marginTop: 20 }} onClick={() => navigate('services')}>
            Browse Services
          </button>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map(req => (
            <div key={req.id} className="request-item fade-up">
              <div style={{ flex: 1 }}>
                <div className="request-title">{req.title}</div>
                <div className="request-location">
                  <MapPin size={13} /> {req.location}
                </div>
                {req.description && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {req.description}
                  </div>
                )}
                <div className="request-date">
                  <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                {req.status === 'pending' && (
                  <p className="request-broadcast-note">
                    {req.offer_count > 1
                      ? 'Request sent to nearby professionals. Waiting for someone to accept.'
                      : `Request sent to ${req.professional_name || 'the selected professional'}. Waiting for them to accept.`}
                  </p>
                )}
                {(req.status === 'accepted' || req.status === 'in_progress' || req.status === 'completed') && req.professional_name && <p className="request-accepted-note">Professional: {req.professional_name}</p>}
                {(req.status === 'accepted' || req.status === 'in_progress' || req.status === 'completed') && req.journey_status && (
                  (() => {
                    const currentStatus = req.journey_status || 'accepted';
                    const currentIndex = ['accepted', ...JOURNEY_STEPS.map(item => item.key)].indexOf(currentStatus);
                    const currentStep = JOURNEY_STEPS[currentIndex - 1];
                    return <>
                      <div className="journey-progress-detail">
                        <div className="journey-progress-kicker">Live service progress</div>
                        <strong>{currentStep ? currentStep.label : 'Accepted'}</strong>
                        <p>{currentStep?.detail || 'The professional has accepted your request and is preparing to travel.'}</p>
                        {req.journey_updated_at && <small>Updated {new Date(req.journey_updated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small>}
                        {(currentStatus === 'start_navigation' || currentStatus === 'on_the_way') && req.otp && (
                          <div style={{ marginTop: '12px', padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', border: '1px dashed #60a5fa', display: 'inline-block' }}>
                            <span style={{ fontSize: '12px', color: '#3b82f6', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Share this OTP with professional on arrival</span>
                            <strong style={{ fontSize: '24px', letterSpacing: '8px', color: '#1d4ed8' }}>{req.otp}</strong>
                          </div>
                        )}
                      </div>
                      <div className="journey-timeline">
                      {JOURNEY_STEPS.map(step => {
                      const stepIndex = JOURNEY_STEPS.findIndex(item => item.key === step.key);
                      return <div key={step.key} className={`journey-timeline-step ${stepIndex < currentIndex ? 'done' : stepIndex === currentIndex ? 'current' : ''}`}><span>{stepIndex < currentIndex ? '✓' : stepIndex + 1}</span>{step.label}</div>;
                      })}
                      </div>
                    </>;
                  })()
                )}
                {(req.status === 'accepted' || req.status === 'in_progress' || req.status === 'completed') && (
                  req.latitude != null && req.longitude != null && req.professional_latitude != null && req.professional_longitude != null ? (
                    <div className="customer-location-view">
                      <button className="view-customer-route-btn" onClick={() => setViewingLocationId(viewingLocationId === req.id ? null : req.id)}>
                        <MapPin size={14} /> {viewingLocationId === req.id ? 'Hide route' : 'View professional distance'}
                      </button>
                      {viewingLocationId === req.id && (
                        <CustomerRouteMap
                          request={req}
                          onRouteDistance={(distance) => setRequests(current => current.map(item => item.id === req.id ? { ...item, route_distance_km: distance } : item))}
                        />
                      )}
                      {viewingLocationId === req.id && req.route_distance_km != null && (
                        <div className="customer-distance"><Navigation size={14} /> {req.route_distance_km < 1 ? `${Math.round(req.route_distance_km * 1000)} m` : `${req.route_distance_km.toFixed(2)} km`} travel distance</div>
                      )}
                    </div>
                  ) : <p className="customer-location-unavailable">Professional location is not available for this request yet.</p>
                )}
              </div>
              <div>
                <span className={`status-badge ${req.status}`}>
                  {req.journey_status && req.journey_status !== 'accepted'
                    ? JOURNEY_STEPS.find(step => step.key === req.journey_status)?.label || statusLabel[req.status]
                    : statusLabel[req.status] || req.status}
                </span>
                {req.payment_status === 'paid' && (
                  <span style={{ display: 'inline-block', marginTop: '6px', padding: '4px 10px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>✓ Paid</span>
                )}
              </div>
              {req.payment_status === 'awaiting_payment' && (
                <div style={{ marginTop: '16px', padding: '16px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fbbf24' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px', color: '#92400e' }}>💼 Payment Due</strong>
                    <strong style={{ fontSize: '22px', color: '#b45309' }}>₹{Number(req.wage).toLocaleString('en-IN')}</strong>
                  </div>
                  {req.wage_description && (
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#78350f' }}>{req.wage_description}</p>
                  )}
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#92400e' }}>Charged by <strong>{req.professional_name}</strong> for completing the service.</p>
                  <button
                    onClick={() => confirmPayment(req.id)}
                    style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
                    ✓ Confirm Payment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default MyRequests;
