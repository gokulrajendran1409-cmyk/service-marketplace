import { useEffect, useState } from 'react';
import {
  Calendar, CheckCircle2, MapPin, Navigation, Plus,
  RefreshCw, Search, ShieldCheck, Star, X, ChevronRight,
  Phone, Sparkles, AlertCircle, Clock3
} from 'lucide-react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API } from '../constants';
import { useToast, Toast } from '../components/Toast';

// ── Journey Steps (matches backend keys exactly) ──────────────────────────────
const JOURNEY_STEPS = [
  { key: 'start_navigation', label: 'Heading to you', icon: '🚗', detail: 'The professional has started travelling to your location.' },
  { key: 'on_the_way',       label: 'On the way',     icon: '📍', detail: 'The professional is travelling to you now.' },
  { key: 'arrived',          label: 'Arrived',        icon: '🏠', detail: 'The professional has arrived at your service location.' },
  { key: 'working',          label: 'Working',        icon: '🔧', detail: 'The professional is working on your service request.' },
  { key: 'completed',        label: 'Completed',      icon: '✅', detail: 'The professional has completed the requested work.' },
];

// ── Status styles ─────────────────────────────────────────────────────────────
const STATUS = {
  pending:     { label: 'Pending',     bg: '#FEF3C7', color: '#B45309', dot: '#F59E0B' },
  accepted:    { label: 'Accepted',    bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
  in_progress: { label: 'In Progress', bg: '#EDE9FE', color: '#7C3AED', dot: '#8B5CF6' },
  completed:   { label: 'Completed',   bg: '#E8F5E9', color: '#2E7D32', dot: '#2E7D32' },
  cancelled:   { label: 'Cancelled',   bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444' },
};

// ── Leaflet: fit bounds helper ────────────────────────────────────────────────
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    try { map.fitBounds(points, { padding: [40, 40] }); } catch {}
  }, []);
  return null;
}

// ── Live route map ────────────────────────────────────────────────────────────
function RouteMap({ request, onDistance }) {
  const cust = [Number(request.latitude), Number(request.longitude)];
  const prof = [Number(request.professional_latitude), Number(request.professional_longitude)];
  const [route, setRoute] = useState([cust, prof]);

  const makeIcon = (emoji, bg, size) =>
    L.divIcon({
      className: '',
      html: `<div style="width:${size}px;height:${size}px;background:${bg};border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.45}px;box-shadow:0 4px 14px rgba(0,0,0,0.25)">${emoji}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });

  useEffect(() => {
    let alive = true;
    const url = `https://router.project-osrm.org/route/v1/driving/${prof[1]},${prof[0]};${cust[1]},${cust[0]}?overview=full&geometries=geojson`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (!alive || d.code !== 'Ok' || !d.routes?.[0]) return;
        setRoute(d.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]));
        onDistance(d.routes[0].distance / 1000);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [cust[0], cust[1], prof[0], prof[1]]);

  return (
    <MapContainer center={cust} zoom={13} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
      <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds points={[cust, prof]} />
      <Marker position={cust} icon={makeIcon('🏠', '#FF7A00', 38)}><Popup>Your location</Popup></Marker>
      <Marker position={prof} icon={makeIcon('⚡', '#2E7D32', 42)}><Popup>Expert location</Popup></Marker>
      <Polyline positions={route} pathOptions={{ color: '#2E7D32', weight: 5, opacity: 0.9 }} />
    </MapContainer>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS[status] || STATUS.pending;
  return (
    <span style={{ background: cfg.bg, color: cfg.color }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shrink-0">
      <span style={{ background: cfg.dot }} className="w-1.5 h-1.5 rounded-full" />
      {cfg.label}
    </span>
  );
}

// ── Horizontal journey timeline ───────────────────────────────────────────────
function Timeline({ journeyStatus }) {
  const keys = ['accepted', ...JOURNEY_STEPS.map(s => s.key)];
  const cur = keys.indexOf(journeyStatus);
  return (
    <div className="flex items-start mt-4 gap-0">
      {JOURNEY_STEPS.map((step, i) => {
        const done = i < cur - 1;
        const active = i === cur - 1;
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[12px] mb-1 transition-all
              ${done   ? 'bg-[#2E7D32] border-[#2E7D32] text-white'
              : active ? 'bg-white border-[#2E7D32] shadow-[0_0_0_4px_rgba(46,125,50,0.12)]'
              :          'bg-white border-gray-200 text-gray-300'}`}>
              {done ? '✓' : step.icon}
            </div>
            <span className={`text-[9px] font-bold text-center leading-tight
              ${done ? 'text-[#2E7D32]' : active ? 'text-[#0A3D0A]' : 'text-gray-300'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Review panel ──────────────────────────────────────────────────────────────
function ReviewPanel({ requestId, reviewed, savedRating, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  if (reviewed) {
    return (
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={15}
              fill={s <= savedRating ? '#F59E0B' : 'none'}
              color={s <= savedRating ? '#F59E0B' : '#E5E7EB'} />
          ))}
        </div>
        <span className="text-[12px] font-medium text-gray-500">Your review</span>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[13px] font-bold px-4 py-2.5 rounded-[12px] active:scale-95 transition-transform">
          <Star size={14} fill="#D97706" color="#D97706" /> Rate this Professional
        </button>
      </div>
    );
  }

  const submit = async () => {
    if (!rating) return;
    setBusy(true);
    await onSubmit(requestId, rating, comment);
    setBusy(false);
    setOpen(false);
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-[13px] font-bold text-[#0A3D0A] mb-3">Rate your experience</p>
      <div className="flex gap-2 mb-3">
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={() => setRating(s)}
            className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all active:scale-95
              ${s <= rating ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-300'}`}>
            ★
          </button>
        ))}
      </div>
      <textarea rows={2} value={comment} onChange={e => setComment(e.target.value)}
        placeholder="Share your experience (optional)..."
        className="w-full p-3 border border-gray-200 rounded-[12px] text-[13px] resize-none outline-none focus:border-[#2E7D32] mb-3" />
      <div className="flex gap-2">
        <button onClick={() => setOpen(false)}
          className="flex-1 py-3 border border-gray-200 rounded-[12px] text-[13px] font-bold text-gray-500">
          Cancel
        </button>
        <button onClick={submit} disabled={!rating || busy}
          className="flex-1 py-3 bg-[#2E7D32] text-white rounded-[12px] text-[13px] font-bold disabled:opacity-40 active:scale-95 transition-transform">
          {busy ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}

// ── Individual booking card ───────────────────────────────────────────────────
function BookingCard({ req, onPayConfirm, onReview }) {
  const [showMap, setShowMap] = useState(false);
  const [routeKm, setRouteKm] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const isLive = ['accepted', 'in_progress'].includes(req.status);
  const hasGeo = req.latitude && req.longitude && req.professional_latitude && req.professional_longitude;
  const journeyKeys = ['accepted', ...JOURNEY_STEPS.map(s => s.key)];
  const curIdx = journeyKeys.indexOf(req.journey_status);
  const curStep = JOURNEY_STEPS[curIdx - 1];

  return (
    <div className={`bg-white rounded-[24px] overflow-hidden shadow-sm border transition-all
      ${isLive ? 'border-[#2E7D32] shadow-[0_0_0_1.5px_#2E7D32]' : 'border-gray-100'}`}>

      {/* Live indicator strip */}
      {isLive && (
        <div className="h-1 bg-gradient-to-r from-[#2E7D32] via-[#4CAF50] to-[#2E7D32]" style={{ backgroundSize: '200% 100%' }} />
      )}

      {/* Main header */}
      <div className="p-5 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{req.category || 'Service'}</span>
            <h3 className="text-[16px] font-bold text-[#0A3D0A] tracking-[-0.01em] mt-0.5 leading-tight">{req.title}</h3>
          </div>
          <StatusBadge status={req.status} />
        </div>

        <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 mb-1.5">
          <MapPin size={13} className="text-[#2E7D32] shrink-0" />
          <span className="truncate">{req.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Calendar size={12} />
          {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          {req.requested_at && (
            <span className="flex items-center gap-1 ml-2">
              <Clock3 size={12} />
              {new Date(req.requested_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Professional profile chip */}
      {req.professional_name && ['accepted', 'in_progress', 'completed'].includes(req.status) && (
        <div className="mx-5 mb-4 flex items-center gap-3 bg-[#F4FBF4] border border-[#C8E6C9] rounded-[18px] p-3.5">
          <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-[18px] font-bold shrink-0">
            {req.professional_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[14px] font-bold text-[#0A3D0A] truncate">{req.professional_name}</span>
              <span className="shrink-0 bg-[#2E7D32] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">PRO</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#4A6B4A]">
              <ShieldCheck size={12} className="text-[#2E7D32] shrink-0" />
              <span>Verified</span>
              <Star size={11} fill="#F59E0B" color="#F59E0B" />
              <span className="font-bold text-amber-600">4.9</span>
            </div>
          </div>
          {isLive && (
            <button className="w-11 h-11 bg-[#FF7A00] rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform shrink-0">
              <Phone size={18} color="white" strokeWidth={2.5} />
            </button>
          )}
        </div>
      )}

      {/* Pending broadcast alert */}
      {req.status === 'pending' && (
        <div className="mx-5 mb-4 flex gap-3 items-start bg-amber-50 border border-amber-200 rounded-[16px] p-4">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-bold text-amber-800 mb-0.5">Waiting for acceptance</p>
            <p className="text-[11px] font-medium text-amber-700 leading-snug">
              {req.offer_count > 1
                ? `Request sent to ${req.offer_count} nearby professionals in your area.`
                : `Request sent to ${req.professional_name || 'your selected professional'}.`}
            </p>
          </div>
        </div>
      )}

      {/* Live journey tracker */}
      {isLive && req.journey_status && (
        <div className="mx-5 mb-4 bg-[#FFFBF0] border border-[#C8E6C9] rounded-[20px] p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Live Status</p>
              <p className="text-[14px] font-bold text-[#0A3D0A]">{curStep?.label || 'Accepted'}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#E8F5E9] border border-[#C8E6C9] px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
              <span className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-wide">Live</span>
            </div>
          </div>
          <p className="text-[12px] text-[#4A6B4A] leading-snug mb-1">
            {curStep?.detail || 'Professional has accepted your request and is preparing.'}
          </p>
          <Timeline journeyStatus={req.journey_status} />

          {/* OTP */}
          {req.otp && ['start_navigation', 'on_the_way'].includes(req.journey_status) && (
            <div className="mt-4 bg-blue-50 border border-dashed border-blue-300 rounded-[16px] p-4 text-center">
              <p className="text-[11px] font-bold text-blue-500 tracking-widest uppercase mb-2">
                Share this OTP with professional on arrival
              </p>
              <div className="text-[34px] font-bold tracking-[10px] text-blue-700">{req.otp}</div>
            </div>
          )}
        </div>
      )}

      {/* Map tracking panel */}
      {isLive && hasGeo && (
        <div className="mx-5 mb-4">
          <button
            onClick={() => setShowMap(v => !v)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[16px] font-bold text-[13px] transition-all active:scale-[0.98]
              ${showMap
                ? 'bg-[#2E7D32] text-white shadow-[0_4px_12px_rgba(46,125,50,0.3)]'
                : 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'}`}>
            <span className="flex items-center gap-2.5">
              <Navigation size={17} strokeWidth={2.5} />
              {showMap ? 'Hide Map' : 'Track Live Location'}
            </span>
            {routeKm != null && !showMap && (
              <span className="bg-white text-[#2E7D32] text-[11px] px-2.5 py-1 rounded-full font-bold border border-[#C8E6C9]">
                {routeKm < 1 ? `${Math.round(routeKm * 1000)} m` : `${routeKm.toFixed(1)} km`} away
              </span>
            )}
          </button>

          {showMap && (
            <>
              {/* ETA bar */}
              <div className="mt-3 bg-white border border-[#C8E6C9] rounded-[16px] px-4 py-3 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Estimated Arrival</p>
                  <p className="text-[16px] font-bold text-[#0A3D0A]">
                    {routeKm != null ? `${Math.max(5, Math.round(routeKm * 3))}–${Math.max(8, Math.round(routeKm * 4))} Mins` : '—'}
                  </p>
                </div>
                <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold px-2.5 py-1.5 rounded-full border border-[#C8E6C9]">FASTEST</span>
              </div>
              {/* Map */}
              <div className="mt-3 rounded-[20px] overflow-hidden border border-[#C8E6C9] shadow-sm" style={{ height: 240 }}>
                <RouteMap request={req} onDistance={km => setRouteKm(km)} />
              </div>
              {routeKm != null && (
                <p className="mt-2 text-center text-[12px] font-bold text-[#2E7D32] flex items-center justify-center gap-1.5">
                  <Navigation size={13} />
                  {routeKm < 1
                    ? `${Math.round(routeKm * 1000)} m travel distance`
                    : `${routeKm.toFixed(2)} km · ~${Math.round(routeKm * 3)} min ETA`}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Payment due */}
      {req.payment_status === 'awaiting_payment' && (
        <div className="px-5 mb-5">
          <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[14px] font-bold text-amber-800">💼 Payment Due</span>
              <span className="text-[22px] font-bold text-amber-700">₹{Number(req.wage).toLocaleString('en-IN')}</span>
            </div>
            {req.wage_description && (
              <p className="text-[12px] text-amber-700 mb-2 leading-snug">{req.wage_description}</p>
            )}
            <p className="text-[12px] text-amber-700 mb-4">
              Charged by <strong>{req.professional_name}</strong> for completing the service.
            </p>
            <button
              onClick={() => onPayConfirm(req.id)}
              className="w-full py-3.5 bg-[#2E7D32] text-white rounded-[14px] text-[14px] font-bold active:scale-95 transition-transform shadow-md">
              ✓ Confirm Payment
            </button>
          </div>
        </div>
      )}

      {/* Paid confirmed */}
      {req.payment_status === 'paid' && (
        <div className="px-5 mb-4">
          <div className="flex items-center gap-2 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[14px] px-4 py-3">
            <CheckCircle2 size={17} className="text-[#2E7D32] shrink-0" />
            <span className="text-[12px] font-bold text-[#2E7D32]">
              Payment Confirmed · ₹{Number(req.wage || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* Review */}
      {req.payment_status === 'paid' && (
        <div className="px-5 pb-5">
          <ReviewPanel
            requestId={req.id}
            reviewed={!!req.review_id}
            savedRating={req.review_rating}
            onSubmit={onReview}
          />
        </div>
      )}

      {/* Description expand */}
      {req.description && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 border-t border-gray-100 text-[12px] font-medium text-gray-500 active:bg-gray-50">
          <span>{expanded ? 'Less details' : 'View job details'}</span>
          <ChevronRight size={15} className={`transition-transform text-gray-400 ${expanded ? 'rotate-90' : ''}`} />
        </button>
      )}
      {expanded && req.description && (
        <div className="px-5 pb-5">
          <p className="text-[13px] font-medium text-gray-600 leading-relaxed">{req.description}</p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function MyRequests({ navigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [sort, setSort]         = useState('newest');
  const { toast, showToast }    = useToast();

  /* ── fetch (UNCHANGED API) ── */
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      setRequests(await res.json());
    } catch {
      showToast('Failed to load your requests', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchRequests(); }, []);

  /* ── confirm payment (UNCHANGED API) ── */
  const confirmPayment = async (requestId) => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API}/requests/${requestId}/confirm-payment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setRequests(curr => curr.map(r => r.id === requestId ? { ...r, ...data.request } : r));
      showToast('Payment confirmed! Thank you.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  /* ── submit review (UNCHANGED API) ── */
  const submitReview = async (requestId, rating, comment) => {
    try {
      const res = await fetch(`${API}/requests/${requestId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setRequests(curr => curr.map(r =>
        r.id === requestId
          ? { ...r, review_id: data.review.id, review_rating: data.review.rating, review_comment: data.review.comment }
          : r
      ));
      showToast('Review submitted. Thank you!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  /* ── filter / search / sort ── */
  const FILTERS = [
    { key: 'all',       label: 'All',       fn: () => true },
    { key: 'active',    label: 'Active',    fn: r => ['accepted', 'in_progress'].includes(r.status) },
    { key: 'pending',   label: 'Pending',   fn: r => r.status === 'pending' },
    { key: 'completed', label: 'Done',      fn: r => r.status === 'completed' },
  ];
  const cur = FILTERS.find(f => f.key === filter);
  const shown = requests
    .filter(cur.fn)
    .filter(r =>
      [r.title, r.description, r.location, r.professional_name, r.category]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(search.toLowerCase().trim()))
    )
    .sort((a, b) => {
      const d = new Date(b.created_at) - new Date(a.created_at);
      return sort === 'newest' ? d : -d;
    });

  /* ── render ── */
  return (
    <div className="min-h-screen bg-[#FFFBF0] px-5 pt-8 pb-32 font-['Inter',sans-serif]">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#0A3D0A] tracking-[-0.02em]">My Bookings</h1>
          <p className="text-[13px] font-medium text-gray-500 mt-0.5">Track and manage all your services</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRequests}
            className="w-10 h-10 bg-white rounded-[14px] shadow-sm border border-gray-100 flex items-center justify-center text-[#2E7D32] active:scale-95 transition-transform">
            <RefreshCw size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => navigate('services')}
            className="h-10 px-4 bg-[#2E7D32] text-white rounded-[14px] text-[13px] font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform">
            <Plus size={16} strokeWidth={2.5} /> Book
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-[20px] shadow-sm mb-5 border border-gray-100">
        <Search size={19} className="text-gray-400 shrink-0" strokeWidth={2.5} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search bookings, professionals, locations…"
          className="bg-transparent border-none outline-none text-[14px] font-medium w-full text-gray-800 placeholder-gray-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 shrink-0">
            <X size={17} />
          </button>
        )}
      </div>

      {/* Filter pills + sort */}
      <div className="flex gap-2 mb-6" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        {FILTERS.map(f => {
          const count = requests.filter(f.fn).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold shrink-0 transition-all
                ${filter === f.key
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600'}`}>
              {f.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold
                ${filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
        <div className="ml-auto shrink-0">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="h-9 px-3 bg-white border border-gray-200 rounded-full text-[12px] font-bold text-gray-600 outline-none">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* ── Content states ── */}
      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <div className="w-12 h-12 border-[3px] border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
          <p className="text-[14px] font-medium text-gray-500">Loading bookings…</p>
        </div>
      ) : requests.length === 0 ? (

        /* Empty – no bookings at all */
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center mb-5 text-4xl">📋</div>
          <h3 className="text-[20px] font-bold text-[#0A3D0A] mb-2">No bookings yet</h3>
          <p className="text-[14px] font-medium text-gray-500 mb-8 max-w-[240px] leading-relaxed">
            Browse our services and book your first professional today!
          </p>
          <button
            onClick={() => navigate('services')}
            className="bg-[#FF7A00] text-white px-8 py-4 rounded-[16px] text-[15px] font-bold flex items-center gap-2 shadow-[0_8px_16px_rgba(255,111,0,0.25)] active:scale-95 transition-transform">
            <Sparkles size={18} strokeWidth={2.5} /> Browse Services
          </button>
        </div>
      ) : shown.length === 0 ? (

        /* Filtered empty */
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">🔍</div>
          <h3 className="text-[16px] font-bold text-[#0A3D0A] mb-1">No {cur.label.toLowerCase()} bookings</h3>
          <p className="text-[13px] text-gray-400">Try adjusting your search or filter</p>
        </div>
      ) : (

        /* Booking cards list */
        <>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] font-bold text-[#0A3D0A]">{cur.label} Bookings</span>
            <span className="text-[12px] font-medium text-gray-500">{shown.length} {shown.length === 1 ? 'booking' : 'bookings'}</span>
          </div>
          <div className="flex flex-col gap-4">
            {shown.map(req => (
              <BookingCard
                key={req.id}
                req={req}
                onPayConfirm={confirmPayment}
                onReview={submitReview}
              />
            ))}
          </div>
        </>
      )}

      {/* FAB – new booking */}
      {requests.length > 0 && (
        <button
          onClick={() => navigate('services')}
          className="fixed bottom-28 right-5 z-20 w-14 h-14 bg-[#FF7A00] text-white rounded-full shadow-[0_8px_20px_rgba(255,111,0,0.45)] flex items-center justify-center active:scale-95 transition-transform">
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default MyRequests;
