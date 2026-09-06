import { Outlet, NavLink } from "react-router-dom";
import { useEffect, useState } from 'react';
import { 
  Home, 
  Briefcase, 
  Wallet,
  UserRound,
  Clock,
  MapPin,
  User,
  Navigation,
  Loader2
} from 'lucide-react';
import { MapContainer, CircleMarker, Polyline, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API = import.meta.env.DEV ? 'http://localhost:5000' : 'https://service-marketplace-af7p.onrender.com';

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home, end: true },
  { path: "/requests", label: "My Works", icon: Briefcase },
  { path: "/wallet", label: "My Wallet", icon: Wallet },
  { path: "/profile", label: "My Profile", icon: UserRound }
];

function IncomingRequestPanel() {
  const [request, setRequest] = useState(null);
  const [responding, setResponding] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [professionalPoint, setProfessionalPoint] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);

  const fetchPendingRequest = async () => {
    try {
      const response = await fetch(`${API}/api/professionals/requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('professionalToken')}` }
      });
      if (!response.ok) return;
      const requests = await response.json();
      setRequest(requests.find(item => item.status === 'pending' && item.offer_status === 'pending') || null);
    } catch {
      // The page-specific request list handles its own errors.
    }
  };

  useEffect(() => {
    fetchPendingRequest();
    const professional = JSON.parse(localStorage.getItem('professional') || '{}');
    const token = localStorage.getItem('professionalToken');
    if (!professional.id || !token) return undefined;

    const stream = new EventSource(`${API}/api/professionals/notifications/stream/${professional.id}?token=${token}`);
    stream.addEventListener('new_service_request', fetchPendingRequest);
    stream.addEventListener('request_taken', fetchPendingRequest);
    stream.addEventListener('service_request_updated', fetchPendingRequest);
    const pollTimer = window.setInterval(fetchPendingRequest, 5000);
    return () => {
      stream.close();
      window.clearInterval(pollTimer);
    };
  }, []);

  useEffect(() => {
    setShowLocationMap(false);
    setProfessionalPoint(null);
    setDistanceKm(null);
  }, [request?.id]);

  const viewCustomerLocation = () => {
    if (!request?.latitude || !request?.longitude) return;
    const professional = JSON.parse(localStorage.getItem('professional') || '{}');
    const customerLatitude = Number(request.latitude);
    const customerLongitude = Number(request.longitude);
    const calculateDistance = (latitude, longitude) => {
      const firstLatitude = Number(latitude) * Math.PI / 180;
      const secondLatitude = customerLatitude * Math.PI / 180;
      const latitudeDelta = (customerLatitude - Number(latitude)) * Math.PI / 180;
      const longitudeDelta = (customerLongitude - Number(longitude)) * Math.PI / 180;
      const haversine = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
      setProfessionalPoint([Number(latitude), Number(longitude)]);
      setDistanceKm(6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
      setShowLocationMap(true);
    };

    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          calculateDistance(position.coords.latitude, position.coords.longitude);
          setLocationLoading(false);
        },
        () => {
          if (professional.work_lat && professional.work_lng) calculateDistance(professional.work_lat, professional.work_lng);
          setLocationLoading(false);
        },
        { maximumAge: 60000, timeout: 5000 }
      );
    } else {
      if (professional.work_lat && professional.work_lng) calculateDistance(professional.work_lat, professional.work_lng);
      setLocationLoading(false);
    }
  };

  const respond = async (decision) => {
    if (!request) return;
    setResponding(true);
    try {
      const response = await fetch(`${API}/api/professionals/requests/${request.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('professionalToken')}`
        },
        body: JSON.stringify({ decision })
      });
      if (!response.ok) return;
      setRequest(null);
      window.dispatchEvent(new CustomEvent('professional-request-updated', {
        detail: { requestId: request.id, decision }
      }));
    } finally {
      setResponding(false);
    }
  };

  if (!request) return null;

  return (
    <aside className="incoming-request-panel" aria-label="Incoming service request">
      <div className="incoming-request-panel-header">
        <div>
          <span className="incoming-request-eyebrow">New service request</span>
          <h2>Review before accepting</h2>
        </div>
        <span className="incoming-request-pulse" aria-hidden="true" />
      </div>
      <div className="incoming-request-body">
        <div className="incoming-request-customer">
          <div className="incoming-request-avatar"><User size={20} /></div>
          <div><strong>{request.customer_name}</strong><span>{request.customer_phone || 'Phone hidden until accepted'}</span></div>
        </div>
        <h3>{request.title || 'Service request'}</h3>
        {request.description && <p className="incoming-request-description">{request.description}</p>}
        <div className="incoming-request-details">
          {request.requested_at && <div><Clock size={16} /><span><b>Requested for</b>{new Date(request.requested_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>}
          {request.location && <div><MapPin size={16} /><span><b>Service location</b>{request.location}</span></div>}
        </div>
            <button className="incoming-request-location-button" onClick={viewCustomerLocation} disabled={locationLoading || !request.latitude || !request.longitude}>
              {locationLoading ? <Loader2 size={15} className="spin" /> : <MapPin size={15} />}
              {locationLoading ? 'Getting your location...' : showLocationMap ? 'Hide customer location' : 'View customer location and distance'}
            </button>
            {showLocationMap && professionalPoint && distanceKm != null && (
              <div className="incoming-request-map-wrap">
                <MapContainer center={professionalPoint} zoom={12} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <CircleMarker center={professionalPoint} radius={8} pathOptions={{ color: '#F8FAFC', weight: 3, fillColor: '#0F172A', fillOpacity: 1 }} />
                  <CircleMarker center={[Number(request.latitude), Number(request.longitude)]} radius={8} pathOptions={{ color: '#F8FAFC', weight: 3, fillColor: '#DC2626', fillOpacity: 1 }} />
                  <Polyline positions={[professionalPoint, [Number(request.latitude), Number(request.longitude)] ]} pathOptions={{ color: 'var(--accent-primary)', weight: 4, dashArray: '8 8' }} />
                </MapContainer>
                <div className="incoming-request-map-distance"><Navigation size={14} /> {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m direct distance` : `${distanceKm.toFixed(2)} km direct distance`}</div>
              </div>
            )}
      </div>
      <div className="incoming-request-actions">
        <button className="incoming-request-reject" disabled={responding} onClick={() => respond('rejected')}>Reject</button>
        <button className="incoming-request-accept" disabled={responding} onClick={() => respond('accepted')}>{responding ? 'Updating...' : 'Accept request'}</button>
      </div>
    </aside>
  );
}

function ProfessionalLayout() {
  return (
    <div className="app-layout">
      <div className="app-content">
        <Outlet />
      </div>

      <IncomingRequestPanel />

      <nav className="bottom-nav">
        {NAV_ITEMS.map(({ path, label, icon: Icon, end }) => (
          <NavLink 
            key={path}
            to={path} 
            className={({isActive}) => isActive ? "bottom-nav-item active" : "bottom-nav-item"} 
            end={end}
          >
            <span className="bottom-nav-pill">
              <Icon size={20} className="bottom-nav-icon" />
              <span className="bottom-nav-label">{label}</span>
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default ProfessionalLayout;
