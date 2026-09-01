import { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock3, MapPin, Navigation, Plus, RefreshCw, Search, ShieldCheck } from 'lucide-react';
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
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [requestFilter, setRequestFilter] = useState('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestSort, setRequestSort] = useState('newest');
  const [reviewingRequestId, setReviewingRequestId] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
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
      setViewingLocationId(current => current || data.find(request => (
        ['accepted', 'in_progress'].includes(request.status)
        && request.latitude != null
        && request.longitude != null
        && request.professional_latitude != null
        && request.professional_longitude != null
      ))?.id || null);
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

  const submitReview = async (requestId) => {
    if (!reviewRating) {
      showToast('Please select a rating.', 'error');
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API}/requests/${requestId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('userToken')}` },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      setRequests(current => current.map(request => request.id === requestId
        ? { ...request, review_id: data.review.id, review_rating: data.review.rating, review_comment: data.review.comment }
        : request));
      setReviewingRequestId(null);
      setReviewRating(0);
      setReviewComment('');
      showToast('Review submitted. Thank you!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const statusLabel = {
    pending: 'Pending',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const selectedRequest = requests.find(request => request.id === selectedRequestId);
  const filterOptions = [
    { key: 'active', label: 'Active', matches: request => ['accepted', 'in_progress'].includes(request.status) },
    { key: 'pending', label: 'Pending', matches: request => request.status === 'pending' },
    { key: 'completed', label: 'Completed', matches: request => request.status === 'completed' },
    { key: 'all', label: 'All bookings', matches: () => true },
  ];
  const currentFilter = filterOptions.find(option => option.key === requestFilter) || filterOptions[0];
  const filteredRequests = requests
    .filter(currentFilter.matches)
    .filter(request => [request.title, request.description, request.location, request.professional_name, request.category]
      .filter(Boolean)
      .some(value => value.toLowerCase().includes(requestSearch.toLowerCase().trim())))
    .sort((first, second) => {
      const difference = new Date(second.created_at) - new Date(first.created_at);
      return requestSort === 'newest' ? difference : -difference;
    });
  const formatDuration = (request) => {
    if (!request?.journey_updated_at || request.journey_status !== 'completed') return 'In progress';
    const minutes = Math.max(0, Math.round((new Date(request.journey_updated_at) - new Date(request.created_at)) / 60000));
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const activeCount = requests.filter(r => ['accepted', 'in_progress'].includes(r.status)).length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="page-container bookings-page-container">
      {/* ====== MOBILE-OPTIMIZED HERO HEADER ====== */}
      <div className="bookings-hero-banner">
        <div className="bookings-hero-top">
          <div className="bookings-hero-text">
            <span className="bookings-hero-kicker">ACTIVITY & STATUS</span>
            <h1 className="bookings-hero-title">My Bookings</h1>
            <p className="bookings-hero-subtitle">Track and manage all your service requests</p>
          </div>
          <div className="bookings-hero-actions">
            <button
              onClick={fetchRequests}
              className="bookings-hero-icon-btn"
              title="Refresh bookings"
              aria-label="Refresh bookings"
            >
              <RefreshCw size={16} />
            </button>
            <button
              className="bookings-hero-new-btn"
              onClick={() => navigate('services')}
            >
              <Plus size={16} />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* ====== QUICK STATS ROW ====== */}
        <div className="bookings-stats-strip">
          <button 
            className={`bookings-stat-card ${requestFilter === 'active' ? 'active' : ''}`}
            onClick={() => setRequestFilter('active')}
          >
            <div className="bookings-stat-header">
              <span className="bookings-stat-dot active-dot"></span>
              <span className="bookings-stat-label">Active</span>
            </div>
            <strong className="bookings-stat-num">{activeCount}</strong>
          </button>

          <div className="bookings-stat-sep" />

          <button 
            className={`bookings-stat-card ${requestFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setRequestFilter('pending')}
          >
            <div className="bookings-stat-header">
              <span className="bookings-stat-dot pending-dot"></span>
              <span className="bookings-stat-label">Pending</span>
            </div>
            <strong className="bookings-stat-num">{pendingCount}</strong>
          </button>

          <div className="bookings-stat-sep" />

          <button 
            className={`bookings-stat-card ${requestFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setRequestFilter('completed')}
          >
            <div className="bookings-stat-header">
              <span className="bookings-stat-dot completed-dot"></span>
              <span className="bookings-stat-label">Completed</span>
            </div>
            <strong className="bookings-stat-num">{completedCount}</strong>
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
          <h3>No bookings yet</h3>
          <p>Browse services and book your first professional!</p>
          <button className="btn-hire" style={{ width: 'auto', padding: '12px 28px', marginTop: 20 }} onClick={() => navigate('services')}>
            Browse Services
          </button>
        </div>
      ) : (
        <>
        <div className="request-tools">
          <label className="request-search-box">
            <Search size={16} />
            <input value={requestSearch} onChange={event => setRequestSearch(event.target.value)} placeholder="Search bookings..." aria-label="Search bookings" />
          </label>
          <label className="request-sort-box">
            <span>Sort by</span>
            <select value={requestSort} onChange={event => setRequestSort(event.target.value)} aria-label="Sort bookings by date">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
        <div className="request-filter-bar" role="tablist" aria-label="Filter bookings">
          {filterOptions.map(option => {
            const count = requests.filter(option.matches).length;
            return (
              <button 
                key={option.key} 
                className={`filter-btn-${option.key} ${requestFilter === option.key ? 'active' : ''}`} 
                onClick={() => setRequestFilter(option.key)} 
                role="tab" 
                aria-selected={requestFilter === option.key}
              >
                {option.label}
                <span>{count}</span>
              </button>
            );
          })}
        </div>
        {filteredRequests.length === 0 ? (
          <div className="request-filter-empty"><h3>No {currentFilter.label.toLowerCase()} bookings</h3><p>Your bookings will appear here as their status changes.</p></div>
        ) : (
        <div className="requests-list">
          <div className="requests-list-heading"><div><span>BOOKINGS</span><h2>{currentFilter.label}</h2></div><strong>{filteredRequests.length} {filteredRequests.length === 1 ? 'booking' : 'bookings'}</strong></div>
          {filteredRequests.map(req => (
            <div key={req.id} className={`request-item fade-up request-card-clickable ${['accepted', 'in_progress'].includes(req.status) ? 'live-request-item' : ''}`} onClick={(event) => {
              if (!event.target.closest('button')) setSelectedRequestId(req.id);
            }}>
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
                {(req.status === 'accepted' || req.status === 'in_progress' || req.status === 'completed') && req.professional_name && (
                  <div className="request-provider-summary">
                    <div className="request-provider-avatar">{req.professional_name.charAt(0).toUpperCase()}</div>
                    <div><strong>{req.professional_name}</strong><span><ShieldCheck size={13} /> Verified provider · {req.category || 'Service professional'}</span></div>
                    <div className="request-provider-state"><CheckCircle2 size={15} /> {req.status === 'completed' ? 'Completed' : 'On the way'}</div>
                  </div>
                )}
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
                <div style={{ marginTop: '12px', padding: '14px 16px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fbbf24', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <strong style={{ fontSize: '14px', color: '#92400e' }}>💼 Payment Due</strong>
                    <strong style={{ fontSize: '20px', color: '#b45309' }}>₹{Number(req.wage).toLocaleString('en-IN')}</strong>
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
              {req.payment_status === 'paid' && (
                <div style={{ marginTop: '12px', padding: '14px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-light)', width: '100%' }}>
                  {req.review_id ? (
                    <div style={{ color: '#b45309', fontWeight: 700, fontSize: '13px' }}>Your rating: {'★'.repeat(Number(req.review_rating))}{'☆'.repeat(5 - Number(req.review_rating))}</div>
                  ) : reviewingRequestId === req.id ? (
                    <>
                      <strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>Rate this professional</strong>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" aria-label={`${star} star${star > 1 ? 's' : ''}`} onClick={() => setReviewRating(star)} style={{ border: 'none', background: 'transparent', padding: '2px', cursor: 'pointer', color: star <= reviewRating ? '#f59e0b' : '#cbd5e1', fontSize: '24px' }}>★</button>
                        ))}
                      </div>
                      <textarea value={reviewComment} onChange={event => setReviewComment(event.target.value)} placeholder="Share your experience (optional)" rows={3} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', border: '1px solid var(--border-light)', borderRadius: '8px', resize: 'vertical', fontSize: '13px' }} />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button type="button" onClick={() => setReviewingRequestId(null)} style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Cancel</button>
                        <button type="button" onClick={() => submitReview(req.id)} disabled={reviewSubmitting} style={{ flex: 1, padding: '8px 12px', border: 'none', borderRadius: '6px', background: '#16a34a', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>{reviewSubmitting ? 'Submitting...' : 'Submit Review'}</button>
                      </div>
                    </>
                  ) : (
                    <button type="button" onClick={() => { setReviewingRequestId(req.id); setReviewRating(0); setReviewComment(''); }} style={{ padding: '8px 12px', border: '1px solid #f59e0b', borderRadius: '7px', background: '#fff7ed', color: '#b45309', cursor: 'pointer', fontWeight: 700, fontSize: '12px', width: '100%' }}>Rate Professional</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        )}
        </>
      )}

      {selectedRequest && (
        <div className="request-detail-overlay">
          <div className="request-detail-page">
            <div className="request-detail-topbar">
              <button onClick={() => setSelectedRequestId(null)}><span>←</span> Back to bookings</button>
              <span className={`status-badge ${selectedRequest.status}`}>{statusLabel[selectedRequest.status] || selectedRequest.status}</span>
            </div>
            <div className="request-detail-heading">
              <div><span className="request-detail-kicker">REQUEST DETAILS</span><h2>{selectedRequest.title}</h2><p>{selectedRequest.location}</p></div>
              <div className="request-detail-date"><Calendar size={15} />{new Date(selectedRequest.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
            {selectedRequest.professional_name && (
              <div className="request-detail-provider">
                <div className="request-provider-avatar">{selectedRequest.professional_name.charAt(0).toUpperCase()}</div>
                <div><span className="request-detail-kicker">YOUR PROVIDER</span><h3>{selectedRequest.professional_name}</h3><p><ShieldCheck size={13} /> Verified professional</p></div>
                <span className="request-provider-state"><CheckCircle2 size={16} /> {selectedRequest.status === 'completed' ? 'Work completed' : 'Assigned to you'}</span>
              </div>
            )}
            <div className="request-detail-grid">
              <div className="request-detail-main">
                {selectedRequest.description && <div className="request-detail-section"><span className="request-detail-kicker">JOB DESCRIPTION</span><p>{selectedRequest.description}</p></div>}
                <div className="request-detail-stats">
                  <div><Clock3 size={18} /><span>Time taken</span><strong>{formatDuration(selectedRequest)}</strong></div>
                  <div><Calendar size={18} /><span>Requested on</span><strong>{new Date(selectedRequest.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
                </div>
              </div>
              <aside className="request-detail-side">
                <div className="request-payment-card"><span className="request-detail-kicker">ESTIMATED BILL</span><strong>{selectedRequest.wage != null ? `₹${Number(selectedRequest.wage).toLocaleString('en-IN')}` : 'Not set yet'}</strong><p>{selectedRequest.wage_description || (selectedRequest.payment_status === 'paid' ? 'Payment confirmed for this service.' : 'The provider will share the final amount after reviewing the work.')}</p>{selectedRequest.payment_status === 'awaiting_payment' && <button className="btn-submit" onClick={() => confirmPayment(selectedRequest.id)}>Confirm payment</button>}{selectedRequest.payment_status === 'paid' && <span className="request-paid-label">Payment confirmed</span>}</div>
                {selectedRequest.review_id ? <div className="request-detail-review">Your rating: {'★'.repeat(Number(selectedRequest.review_rating))}{'☆'.repeat(5 - Number(selectedRequest.review_rating))}</div> : selectedRequest.payment_status === 'paid' && <button className="request-detail-review-btn" onClick={() => { setSelectedRequestId(null); setReviewingRequestId(selectedRequest.id); }}>Rate this professional</button>}
              </aside>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default MyRequests;
