import { useEffect, useState } from "react";
import { Clock, CheckCircle, Ban, RefreshCw, XCircle, User, MapPin, Navigation, Loader2 } from 'lucide-react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function calculateDistanceInKm(firstLatitude, firstLongitude, secondLatitude, secondLongitude) {
  const earthRadiusKm = 6371;
  const latitudeDelta = (secondLatitude - firstLatitude) * Math.PI / 180;
  const longitudeDelta = (secondLongitude - firstLongitude) * Math.PI / 180;
  const latitude1 = firstLatitude * Math.PI / 180;
  const latitude2 = secondLatitude * Math.PI / 180;
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function RouteBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(points, { padding: [32, 32] });
  }, [map, points]);

  return null;
}

function RequestRouteMap({ request, onRouteDistance }) {
  const customerPoint = [Number(request.latitude), Number(request.longitude)];
  const professionalPoint = [Number(request.professional_latitude), Number(request.professional_longitude)];
  const [route, setRoute] = useState([professionalPoint, customerPoint]);
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
        const routeCoordinates = data.routes[0].geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]);
        setRoute(routeCoordinates);
        onRouteDistance(data.routes[0].distance / 1000);
      })
      .catch(() => {
        if (active) setRoute([professionalPoint, customerPoint]);
      });

    return () => { active = false; };
  }, [customerPoint[0], customerPoint[1], professionalPoint[0], professionalPoint[1]]);

  return (
    <MapContainer className="request-map" center={professionalPoint} zoom={13} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RouteBounds points={[professionalPoint, customerPoint]} />
      <Marker position={professionalPoint} icon={professionalIcon}>
        <Popup>Your current location</Popup>
      </Marker>
      <Marker position={customerPoint} icon={customerIcon}>
        <Popup>Customer location</Popup>
      </Marker>
      <Polyline positions={route} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.9, dashArray: route.length === 2 ? '10 8' : undefined }} />
    </MapContainer>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <Clock size={14} />, label: 'Pending' },
    accepted: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', icon: <CheckCircle size={14} />, label: 'Accepted' },
    in_progress: { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', icon: <Navigation size={14} />, label: 'In Progress' },
    completed: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: <CheckCircle size={14} />, label: 'Completed' },
    rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: <XCircle size={14} />, label: 'Rejected' },
    cancelled: { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', icon: <Ban size={14} />, label: 'Cancelled' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
      {s.icon} {s.label}
    </span>
  );
}

const JOURNEY_STEPS = [
  { key: 'start_navigation', label: 'Start navigation' },
  { key: 'on_the_way', label: 'On the way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'working', label: 'Working' },
  { key: 'completed', label: 'Completed' },
];

function LiveNavigationMap({ request, professionalLocation, onClose }) {
  const customerPoint = [Number(request.latitude), Number(request.longitude)];
  const currentLoc = professionalLocation || { latitude: request.professional_latitude, longitude: request.professional_longitude };
  const professionalPoint = [Number(currentLoc.latitude), Number(currentLoc.longitude)];
  const [route, setRoute] = useState([professionalPoint, customerPoint]);

  const customerIcon = L.divIcon({ className: 'map-person-marker', html: '👤', iconSize: [32, 32], iconAnchor: [16, 16] });
  const professionalIcon = L.divIcon({ className: 'map-professional-marker', html: '🛠️', iconSize: [32, 32], iconAnchor: [16, 16] });

  useEffect(() => {
    let active = true;
    if (!professionalPoint[0] || !professionalPoint[1]) return;

    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${professionalPoint[1]},${professionalPoint[0]};${customerPoint[1]},${customerPoint[0]}?overview=full&geometries=geojson`;
    fetch(routeUrl)
      .then(response => response.json())
      .then(data => {
        if (!active || data.code !== 'Ok' || !data.routes?.[0]) return;
        const routeCoordinates = data.routes[0].geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]);
        setRoute(routeCoordinates);
      })
      .catch(() => { });
    return () => { active = false; };
  }, [professionalPoint[0], professionalPoint[1]]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 24px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}><Navigation size={20} color="var(--accent-primary)" /> Live Navigation</h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Heading to {request.customer_name}</p>
        </div>
        <button onClick={onClose} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-light)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Close Map</button>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={professionalPoint} zoom={16} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {professionalPoint[0] ? <Marker position={professionalPoint} icon={professionalIcon}><Popup>You are here</Popup></Marker> : null}
          <Marker position={customerPoint} icon={customerIcon}><Popup>Customer</Popup></Marker>
          <Polyline positions={route} pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.8 }} />
          <RouteBounds points={[professionalPoint, customerPoint]} />
        </MapContainer>
      </div>
    </div>
  );
}

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);
  const [viewingLocationId, setViewingLocationId] = useState(null);
  const [locationLoadingId, setLocationLoadingId] = useState(null);
  const [professionalLocation, setProfessionalLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [showLiveMap, setShowLiveMap] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch("service-marketplace-af7p.onrender.com/api/professionals/requests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("professionalToken")}` }
      });
      if (!response.ok) throw new Error("Failed to load requests");
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const professional = JSON.parse(localStorage.getItem('professional') || '{}');
    if (!professional.id) return undefined;
    const stream = new EventSource(`service-marketplace-af7p.onrender.com/api/professionals/notifications/stream/${professional.id}`);
    stream.addEventListener('new_service_request', fetchRequests);
    stream.addEventListener('request_taken', fetchRequests);
    return () => stream.close();
  }, []);

  const activeNavigationRequest = requests.find(r => r.journey_status === 'start_navigation' || r.journey_status === 'on_the_way');

  useEffect(() => {
    if (!activeNavigationRequest) return;
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setProfessionalLocation({ latitude: lat, longitude: lng, accuracy: position.coords.accuracy });
          try {
            await fetch(`service-marketplace-af7p.onrender.com/api/professionals/requests/${activeNavigationRequest.id}/location`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("professionalToken")}`
              },
              body: JSON.stringify({ latitude: lat, longitude: lng })
            });
          } catch (err) {
            console.error("Failed to sync live location", err);
          }
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }
    return () => {
      if (watchId != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [activeNavigationRequest?.id]);

  const respondToRequest = async (requestId, decision) => {
    setRespondingId(requestId);
    try {
      const response = await fetch(`service-marketplace-af7p.onrender.com/api/professionals/requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("professionalToken")}`
        },
        body: JSON.stringify({
          decision,
          professional_latitude: professionalLocation?.latitude,
          professional_longitude: professionalLocation?.longitude,
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to update request');
      setRequests((current) => current.map((request) => request.id === requestId ? {
        ...request,
        status: data.request?.status || decision,
        offer_status: decision
      } : request));
    } catch (err) {
      setError(err.message);
    } finally {
      setRespondingId(null);
    }
  };

  const updateJourney = async (requestId, journeyStatus) => {
    setRespondingId(requestId);
    try {
      const response = await fetch(`service-marketplace-af7p.onrender.com/api/professionals/requests/${requestId}/journey`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("professionalToken")}`
        },
        body: JSON.stringify({ journey_status: journeyStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to update journey');
      setRequests(current => current.map(request => request.id === requestId
        ? { ...request, status: data.request.status, journey_status: data.request.journey_status, journey_updated_at: data.request.journey_updated_at }
        : request));
    } catch (err) {
      setError(err.message);
    } finally {
      setRespondingId(null);
    }
  };

  const requestProfessionalLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const locationError = new Error('Location services are not supported by this browser.');
      setError(locationError.message);
      reject(locationError);
      return;
    }

    setLocationStatus('requesting');
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        };
        setProfessionalLocation(currentLocation);
        setLocationStatus('ready');
        resolve(currentLocation);
      },
      (locationError) => {
        const message = locationError.code === locationError.PERMISSION_DENIED
          ? 'Please allow location access to view the distance to customers.'
          : 'We could not retrieve your location. Please try again.';
        setLocationStatus('denied');
        setError(message);
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });

  const viewRequestLocation = async (request) => {
    if (request.latitude == null || request.longitude == null) {
      setError('This older request has no shared customer coordinates. Ask the customer to create a new request with location enabled.');
      return;
    }

    setError('');
    setLocationLoadingId(request.id);
    try {
      const currentLocation = professionalLocation || await requestProfessionalLocation();
      const professionalLatitude = currentLocation.latitude;
      const professionalLongitude = currentLocation.longitude;
      const distance = calculateDistanceInKm(
        professionalLatitude,
        professionalLongitude,
        Number(request.latitude),
        Number(request.longitude)
      );
      setRequests(current => current.map(item => item.id === request.id ? {
        ...item,
        professional_latitude: professionalLatitude,
        professional_longitude: professionalLongitude,
        distance_km: distance,
      } : item));
      setViewingLocationId(request.id);
    } catch {
      // The location helper already displays the permission or retrieval error.
    } finally {
      setLocationLoadingId(null);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}><RefreshCw className="spin" size={32} color="var(--text-muted)" /></div>;
  return (
    <div>
      {showLiveMap && activeNavigationRequest && (
        <LiveNavigationMap
          request={activeNavigationRequest}
          professionalLocation={professionalLocation}
          onClose={() => setShowLiveMap(false)}
        />
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">My Service Requests</h1>
          <p className="page-subtitle">View and manage the jobs assigned to you.</p>
        </div>
        <button onClick={fetchRequests} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="request-error"><XCircle size={16} /> {error}</div>}

      <div className="professional-location-panel">
        <div>
          <strong>Professional location</strong>
          <p>{locationStatus === 'ready'
            ? `Location enabled (accuracy about ${professionalLocation.accuracy}m).`
            : 'Enable your location to view the distance to each customer before deciding.'}</p>
        </div>
        <button className="enable-location-btn" onClick={() => requestProfessionalLocation().catch(() => { })} disabled={locationStatus === 'requesting'}>
          {locationStatus === 'requesting' ? <Loader2 size={15} className="spin" /> : <MapPin size={15} />}
          {locationStatus === 'requesting' ? 'Finding your location...' : locationStatus === 'ready' ? 'Refresh location' : 'Enable my location'}
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="section-container" style={{ textAlign: "center", padding: "60px 40px" }}>
          <h3 style={{ marginBottom: "8px" }}>No requests yet</h3>
          <p style={{ color: "var(--text-muted)" }}>When customers book your service, they will appear here.</p>
        </div>
      ) : (
        <div className="section-container" style={{ padding: 0, overflow: 'hidden' }}>
          {requests.map((req, idx) => {
            const isRestricted = req.status === 'completed'
              || req.journey_status === 'completed'
              || (req.status === 'accepted' && req.offer_status !== 'accepted');

            return (
              <div key={req.id} style={{ padding: '20px 24px', borderBottom: idx !== requests.length - 1 ? '1px solid var(--border-light)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px' }}>{req.customer_name}</h4>
                      {!isRestricted && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{req.customer_phone || 'No phone'}</span>}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{req.title}</p>
                  {req.requested_at && <p className="request-schedule">Customer expects you: {new Date(req.requested_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                  {!isRestricted && <>
                    {req.description && <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{req.description}</p>}
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{req.location}</p>
                    {(req.photo_urls?.length > 0 || req.video_url || req.voice_url) && (
                      <div className="request-evidence">
                        <strong>Customer evidence</strong>
                        <div className="request-evidence-links">
                          {req.photo_urls?.map((url, photoIndex) => <a key={url} href={`service-marketplace-af7p.onrender.com${url}`} target="_blank" rel="noreferrer">Photo {photoIndex + 1}</a>)}
                          {req.video_url && <a href={`service-marketplace-af7p.onrender.com${req.video_url}`} target="_blank" rel="noreferrer">Watch video</a>}
                          {req.voice_url && <a href={`service-marketplace-af7p.onrender.com${req.voice_url}`} target="_blank" rel="noreferrer">Play voice note</a>}
                        </div>
                      </div>
                    )}
                  </>}
                  {req.offer_status === 'accepted' && req.journey_status !== 'completed' && (
                    <div className="journey-controls">
                      <strong>Update customer</strong>
                      <div className="journey-step-buttons">
                        {JOURNEY_STEPS.map((step, index) => {
                          const currentIndex = ['accepted', ...JOURNEY_STEPS.map(item => item.key)].indexOf(req.journey_status || 'accepted');
                          return index === currentIndex && (
                            <button key={step.key} disabled={respondingId === req.id} onClick={() => {
                              updateJourney(req.id, step.key);
                              if (step.key === 'start_navigation') setShowLiveMap(true);
                            }}>
                              {respondingId === req.id ? 'Updating...' : step.label}
                            </button>
                          );
                        })}
                        {(req.journey_status === 'start_navigation' || req.journey_status === 'on_the_way') && (
                          <button onClick={() => setShowLiveMap(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Navigation size={14} /> View Live Map
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {!isRestricted && (req.offer_status === 'accepted' || req.offer_status === 'pending') && (
                    <div className="request-location-tools">
                      <button className="view-location-btn" onClick={() => viewingLocationId === req.id ? setViewingLocationId(null) : viewRequestLocation(req)} disabled={locationLoadingId === req.id}>
                        {locationLoadingId === req.id ? <Loader2 size={14} className="spin" /> : <MapPin size={14} />}
                        {locationLoadingId === req.id ? 'Getting your location...' : viewingLocationId === req.id ? 'Hide route' : 'View customer location and distance'}
                      </button>
                      {viewingLocationId === req.id && req.distance_km != null && (
                        <div className="request-distance"><Navigation size={14} /> {req.route_distance_km != null
                          ? `${req.route_distance_km < 1 ? `${Math.round(req.route_distance_km * 1000)} m` : `${req.route_distance_km.toFixed(2)} km`} travel distance`
                          : `${req.distance_km < 1 ? `${Math.round(req.distance_km * 1000)} m` : `${req.distance_km.toFixed(2)} km`} direct distance`}</div>
                      )}
                      {viewingLocationId === req.id && req.professional_latitude != null && (
                        <>
                          <RequestRouteMap
                            request={req}
                            onRouteDistance={(distance) => setRequests(current => current.map(item => item.id === req.id ? { ...item, route_distance_km: distance } : item))}
                          />
                          <div className="map-route-legend"><span>🛠️ Professional</span><span className="route-line-key" /> <span>👤 Customer</span></div>
                        </>
                      )}
                    </div>
                  )}
                  {!isRestricted && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Created: {new Date(req.created_at).toLocaleDateString()}
                  </div>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={req.status} />
                  {req.offer_status === 'rejected' && req.status === 'accepted' && <span className="request-taken-label">Accepted by another professional</span>}
                  {req.offer_status === 'pending' && (
                    <>
                      <button disabled={respondingId === req.id} onClick={() => respondToRequest(req.id, 'accepted')} style={{ border: 'none', background: 'var(--success)', color: 'white', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>Accept</button>
                      <button disabled={respondingId === req.id} onClick={() => respondToRequest(req.id, 'rejected')} style={{ border: 'none', background: 'var(--error)', color: 'white', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>Reject</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyRequests;

