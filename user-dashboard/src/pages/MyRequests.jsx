import { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock3, MapPin, Navigation, Plus, RefreshCw, Search, ShieldCheck, MessageSquare, ChevronRight, XCircle, Clock, Wrench, Zap, Snowflake, Paintbrush, Monitor, FileText, Repeat } from 'lucide-react';
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

  // Real-time updates via SSE with fallback polling
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    let eventSource = null;
    let sseConnected = false;
    let pollInterval = null;

    // Try to establish SSE connection
    try {
      // JWT tokens are already URL-safe, don't need encodeURIComponent
      eventSource = new EventSource(`${API}/notifications/stream?token=${token}`);

      eventSource.addEventListener('requestUpdate', (event) => {
        try {
          const data = JSON.parse(event.data);
          const { requestId, newStatus, journeyStatus, updateType, professionalName } = data;

          setRequests(current => current.map(r => 
            r.id === requestId 
              ? {
                  ...r,
                  status: newStatus,
                  journey_status: journeyStatus,
                  has_update: true,
                  update_received_at: new Date()
                }
              : r
          ));

          // Show user-friendly notification
          const updateMessages = {
            'status_change': `${professionalName} updated your request status`,
            'journey_update': `${professionalName} ${journeyStatus === 'on_the_way' ? 'is on the way' : journeyStatus === 'arrived' ? 'has arrived' : journeyStatus === 'working' ? 'is working on your request' : 'completed your request'}`,
            'payment_ready': `${professionalName} marked payment as ready`,
            'journey_started': `${professionalName} started navigation to your location`,
            'provider_accepted': `🎉 ${professionalName} has accepted your service request!`
          };

          const message = updateMessages[updateType] || `New update from ${professionalName}`;
          showToast(message, 'info');
        } catch (e) {
          console.error('Error parsing update:', e);
        }
      });

      eventSource.addEventListener('open', () => {
        console.log('✅ SSE connection established');
        sseConnected = true;
        // Clear polling if SSE is working
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      });

      eventSource.addEventListener('error', (error) => {
        console.error('❌ SSE connection error:', error);
        sseConnected = false;
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('SSE connection closed, enabling fallback polling...');
          eventSource.close();
          eventSource = null;
          // Start polling as fallback
          startPolling();
        }
      });
    } catch (e) {
      console.error('Failed to create EventSource:', e);
      startPolling();
    }

    // Fallback: Poll for updates every 10 seconds if SSE fails
    function startPolling() {
      if (pollInterval) return; // Already polling
      console.log('Starting fallback polling for updates...');
      pollInterval = setInterval(() => {
        fetchRequests();
      }, 10000);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

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
      showToast('Payment successful! Thank you.', 'success');
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
    { key: 'upcoming', label: 'Upcoming', icon: <Calendar size={14} />, matches: request => ['pending', 'accepted', 'in_progress'].includes(request.status) },
    { key: 'past', label: 'Past', icon: <Clock size={14} />, matches: request => request.status === 'completed' },
    { key: 'cancelled', label: 'Cancelled', icon: <XCircle size={14} />, matches: request => request.status === 'cancelled' },
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

  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'plumbing': return <Wrench className="service-icon plumbing" />;
      case 'electrical': return <Zap className="service-icon electrical" />;
      case 'ac repair': return <Snowflake className="service-icon ac-repair" />;
      case 'painting': return <Paintbrush className="service-icon painting" />;
      case 'electronics': return <Monitor className="service-icon electronics" />;
      default: return <Wrench className="service-icon default" />;
    }
  };

  const upcomingCount = requests.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status)).length;
  const pastCount = requests.filter(r => r.status === 'completed').length;
  const cancelledCount = requests.filter(r => r.status === 'cancelled').length;

  return (
    <div className="page-container bookings-new-page-container">
      <div className="bookings-header-area">
        <div className="bookings-header-content">
          <h1>My Bookings</h1>
          <p>Track your service bookings and stay updated.</p>
        </div>
        <div className="bookings-header-illustration">
          <div className="calendar-illustration">
            <Calendar size={48} className="cal-icon" />
            <div className="check-badge"><CheckCircle2 size={16} /></div>
          </div>
        </div>
      </div>

      <div className="bookings-tabs-container">
        <button 
          className={`booking-tab ${requestFilter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setRequestFilter('upcoming')}
        >
          <Calendar size={16} /> Upcoming <span className="tab-badge">{upcomingCount}</span>
        </button>
        <button 
          className={`booking-tab ${requestFilter === 'past' ? 'active' : ''}`}
          onClick={() => setRequestFilter('past')}
        >
          <Clock size={16} /> Past <span className="tab-badge past-badge">{pastCount}</span>
        </button>
        <button 
          className={`booking-tab ${requestFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setRequestFilter('cancelled')}
        >
          <XCircle size={16} /> Cancelled <span className="tab-badge cancelled-badge">{cancelledCount}</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw className="spin" size={32} color="var(--primary-color)" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-bookings">
          <h3>No {currentFilter.label.toLowerCase()} bookings</h3>
          <p>Your bookings will appear here.</p>
        </div>
      ) : (
        <div className="bookings-cards-list">
          {filteredRequests.map(req => {
            const isLive = ['accepted', 'in_progress'].includes(req.status);
            
            return (
            <div key={req.id} className="booking-card">
              {/* Top row: image | info + price/status */}
              <div className="booking-card-top">
                <div className="booking-card-thumb">
                  <div className="booking-thumb-bg"></div>
                </div>

                <div className="booking-card-body">
                  {/* Title + Status on the same line */}
                  <div className="booking-title-row">
                    <div className="booking-title-group">
                      {getCategoryIcon(req.professional_category || req.category)}
                      <h3 className="booking-title">{req.title}</h3>
                    </div>
                    <span className={`booking-status-badge ${req.status}`}>
                      {req.status === 'completed' ? 'Completed' : 
                       req.status === 'cancelled' ? 'Cancelled' : 
                       req.status === 'pending' ? 'Upcoming' : 
                       req.status === 'accepted' ? 'Confirmed' : 'In Progress'}
                    </span>
                  </div>

                  {/* Professional info */}
                  {req.professional_name && (
                    <div className="booking-pro-row">
                      <span className="booking-pro-name">{req.professional_name}</span>
                      <span className="booking-verified"><ShieldCheck size={11} /> Verified</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="booking-rating-row">
                    <span className="rating-star">★</span>
                    <strong>{req.professional_avg_rating || '4.5'}</strong>
                    <span className="rating-count">({req.professional_review_count || 0} reviews)</span>
                  </div>

                  {/* Date & Location */}
                  <div className="booking-meta-row">
                    <div className="booking-meta-item">
                      <Calendar size={13} />
                      <span>{new Date(req.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}, {new Date(req.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {req.location && (
                      <div className="booking-meta-item">
                        <MapPin size={13} />
                        <span className="meta-location-text">{req.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Price row */}
                  <div className="booking-price-row">
                    {req.wage ? (
                      <>
                        <span className="booking-price">₹{Number(req.wage).toLocaleString('en-IN')}</span>
                        <span className="booking-price-sub">(Estimated)</span>
                      </>
                    ) : (
                      <span className="booking-price-sub">Price TBD</span>
                    )}
                    <ChevronRight className="booking-price-arrow" size={14} />
                  </div>
                </div>
              </div>

              {/* Bottom action buttons */}
              <div className="booking-card-btns">
                {req.status === 'completed' && (
                  <>
                    <button className="bk-btn bk-btn-outline"><FileText size={15} /> View Invoice</button>
                    <button className="bk-btn bk-btn-outline"><Repeat size={15} /> Book Again</button>
                  </>
                )}
                {req.status === 'cancelled' && (
                  <>
                    <button className="bk-btn bk-btn-outline" onClick={() => setSelectedRequestId(req.id)}>View Details</button>
                    <button className="bk-btn bk-btn-outline"><Repeat size={15} /> Rebook</button>
                  </>
                )}
                {req.status === 'pending' && (
                  <>
                    <button className="bk-btn bk-btn-outline" onClick={() => setSelectedRequestId(req.id)}>View Details</button>
                    <button className="bk-btn bk-btn-primary"><Calendar size={15} /> Reschedule</button>
                  </>
                )}
                {(req.status === 'accepted' || req.status === 'in_progress') && (
                  <>
                    <button className="bk-btn bk-btn-outline"><MessageSquare size={15} /> Chat with Professional</button>
                    <button className="bk-btn bk-btn-primary" onClick={() => setSelectedRequestId(req.id)}><Navigation size={15} /> Track Live</button>
                  </>
                )}
              </div>
            </div>
            );
          })}
        </div>
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
            
            {/* Journey Status Section */}
            {(selectedRequest.status === 'accepted' || selectedRequest.status === 'in_progress' || selectedRequest.status === 'completed') && selectedRequest.journey_status && (
              (() => {
                const currentStatus = selectedRequest.status === 'completed' ? 'completed' : (selectedRequest.journey_status || 'accepted');
                const currentIndex = ['accepted', ...JOURNEY_STEPS.map(item => item.key)].indexOf(currentStatus);
                const currentStep = JOURNEY_STEPS[currentIndex - 1];
                return (
                  <div className="request-journey-section">
                    <span className="request-detail-kicker">Live Service Progress</span>
                    <div className="journey-progress-card">
                      <div className="journey-status-label">{currentStep ? currentStep.label : 'Accepted'}</div>
                      <p>{currentStep?.detail || 'The professional has accepted your request and is preparing to travel.'}</p>
                      {selectedRequest.journey_updated_at && <small className="journey-updated-time">Updated {new Date(selectedRequest.journey_updated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small>}
                      {(currentStatus === 'start_navigation' || currentStatus === 'on_the_way') && selectedRequest.otp && (
                        <div className="otp-box">
                          <span className="otp-label">Share this OTP with professional on arrival</span>
                          <strong className="otp-code">{selectedRequest.otp}</strong>
                        </div>
                      )}
                    </div>
                    <div className="journey-timeline-large">
                      {JOURNEY_STEPS.map(step => {
                        const stepIndex = JOURNEY_STEPS.findIndex(item => item.key === step.key);
                        return <div key={step.key} className={`journey-timeline-step ${stepIndex < currentIndex ? 'done' : stepIndex === currentIndex ? 'current' : ''}`}><span>{stepIndex < currentIndex ? '✓' : stepIndex + 1}</span><span className="step-label">{step.label}</span></div>;
                      })}
                    </div>
                  </div>
                );
              })()
            )}
            
            <div className="request-detail-grid">
              <div className="request-detail-main">
                {selectedRequest.description && <div className="request-detail-section"><span className="request-detail-kicker">JOB DESCRIPTION</span><p>{selectedRequest.description}</p></div>}
                
                {/* Distance/Route Section */}
                {(selectedRequest.status === 'accepted' || selectedRequest.status === 'in_progress' || selectedRequest.status === 'completed') && 
                  selectedRequest.latitude != null && selectedRequest.longitude != null && selectedRequest.professional_latitude != null && selectedRequest.professional_longitude != null && (
                  <div className="request-detail-section">
                    <span className="request-detail-kicker">Professional Location</span>
                    <button className="view-customer-route-btn" onClick={() => setViewingLocationId(viewingLocationId === selectedRequest.id ? null : selectedRequest.id)}>
                      <MapPin size={14} /> {viewingLocationId === selectedRequest.id ? 'Hide route' : 'View professional distance'}
                    </button>
                    {viewingLocationId === selectedRequest.id && (
                      <CustomerRouteMap
                        request={selectedRequest}
                        onRouteDistance={(distance) => setRequests(current => current.map(item => item.id === selectedRequest.id ? { ...item, route_distance_km: distance } : item))}
                      />
                    )}
                    {viewingLocationId === selectedRequest.id && selectedRequest.route_distance_km != null && (
                      <div className="customer-distance"><Navigation size={14} /> {selectedRequest.route_distance_km < 1 ? `${Math.round(selectedRequest.route_distance_km * 1000)} m` : `${selectedRequest.route_distance_km.toFixed(2)} km`} travel distance</div>
                    )}
                  </div>
                )}
                
                <div className="request-detail-stats">
                  <div><Clock3 size={18} /><span>Time taken</span><strong>{formatDuration(selectedRequest)}</strong></div>
                  <div><Calendar size={18} /><span>Requested on</span><strong>{new Date(selectedRequest.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
                </div>
              </div>
              <aside className="request-detail-side">
                <div className="request-payment-card"><span className="request-detail-kicker">ESTIMATED BILL</span><strong>{selectedRequest.wage != null ? `₹${Number(selectedRequest.wage).toLocaleString('en-IN')}` : 'Not set yet'}</strong><p>{selectedRequest.wage_description || (selectedRequest.payment_status === 'paid' ? 'Payment successful for this service.' : 'The provider will share the final amount after reviewing the work.')}</p>{selectedRequest.payment_status === 'awaiting_payment' && <button className="btn-submit" onClick={() => confirmPayment(selectedRequest.id)}>Confirm payment</button>}{selectedRequest.payment_status === 'paid' && <span className="request-paid-label">Payment successful</span>}</div>
                {selectedRequest.review_id ? (
                  <div className="request-detail-review">
                    <span className="review-label">Your rating</span>
                    <span className="review-stars">
                      {'★'.repeat(Number(selectedRequest.review_rating))}
                      {'☆'.repeat(5 - Number(selectedRequest.review_rating))}
                    </span>
                  </div>
                ) : selectedRequest.payment_status === 'paid' && <button className="request-detail-review-btn" onClick={() => { setSelectedRequestId(null); setReviewingRequestId(selectedRequest.id); }}>Rate this professional</button>}
              </aside>
            </div>
          </div>
        </div>
      )}

      {reviewingRequestId && (
        <div className="request-detail-overlay">
          <div className="request-detail-page">
            <div className="request-detail-topbar">
              <div className="request-detail-heading">
                <h2>Rate the Professional</h2>
              </div>
              <button onClick={() => setReviewingRequestId(null)} className="request-detail-close-btn" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="review-form-container">
              <div className="review-form-section">
                <label className="review-form-label">Select your rating</label>
                <div className="review-stars-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`review-star-btn ${star <= reviewRating ? 'active' : ''}`}
                      onClick={() => setReviewRating(star)}
                      aria-label={`Rate ${star} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="review-rating-display">
                  {reviewRating > 0 && (
                    <span className="review-rating-text">{reviewRating} out of 5 stars</span>
                  )}
                </div>
              </div>

              <div className="review-form-section">
                <label className="review-form-label">Add a comment (optional)</label>
                <textarea
                  className="review-comment-input"
                  placeholder="Share your experience with this professional..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>

              <button
                className="btn-submit"
                onClick={() => submitReview(reviewingRequestId)}
                disabled={reviewSubmitting || !reviewRating}
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default MyRequests;
