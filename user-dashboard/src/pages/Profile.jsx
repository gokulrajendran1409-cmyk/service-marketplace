import React, { useEffect, useState } from 'react';
import {
  Bell, ChevronRight, HelpCircle, LogOut, MapPin, Settings,
  ShieldCheck, WalletCards, CalendarDays, Clock3, LockKeyhole, User, Phone, Mail, CheckCircle2
} from 'lucide-react';
import { API } from '../constants';

const settingsMenu = [
  [WalletCards, 'Payment Methods', 'Manage your UPI, cards, and wallets'],
  [MapPin, 'Saved Addresses', 'Home, Office, and other locations'],
  [Bell, 'Notifications', 'Control your alerts and reminders'],
  [LockKeyhole, 'Security', 'Passwords and account safety'],
  [HelpCircle, 'Help Center', 'FAQs and troubleshooting'],
  [HelpCircle, 'Contact Support', 'Chat with our 24/7 experts'],
  [ShieldCheck, 'Privacy Policy', ''],
];

const STATUS_CHIP = {
  pending:     { label: 'Pending',     bg: '#FEF3C7', color: '#B45309' },
  accepted:    { label: 'Accepted',    bg: '#DBEAFE', color: '#1D4ED8' },
  in_progress: { label: 'In Progress', bg: '#EDE9FE', color: '#7C3AED' },
  completed:   { label: 'Completed',   bg: '#D1FAE5', color: '#065F46' },
  cancelled:   { label: 'Cancelled',   bg: '#FEE2E2', color: '#991B1B' },
};

export default function Profile({ user, onUserUpdate, onLogout, navigate }) {
  const [profile, setProfile] = useState(user || {});
  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [reqTab, setReqTab] = useState('upcoming');

  // ── Fetch real profile from backend ──────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) { setProfile(data); onUserUpdate(data); } })
      .catch(() => {});
  }, []);

  // ── Fetch real bookings from backend ──────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setLoadingReqs(true);
    fetch(`${API}/requests`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoadingReqs(false));
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────
  const upcoming = requests.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status));
  const history  = requests.filter(r => ['completed', 'cancelled'].includes(r.status));
  const shown    = reqTab === 'upcoming' ? upcoming : history;

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#FFFBF0] px-5 pt-8 pb-[110px] font-['Inter',sans-serif]">

      {/* ── Header ── */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-[26px] font-bold text-[#0A3D0A] tracking-[-0.02em]">Account</h1>
        <button className="w-10 h-10 rounded-[14px] bg-white shadow-sm flex items-center justify-center text-[#2E7D32] border border-gray-100 active:scale-95 transition-transform">
          <Settings size={20} strokeWidth={2.5} />
        </button>
      </header>

      {/* ── Profile Card ── */}
      <section className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm mb-6 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#2E7D32] to-[#FF7A00] flex items-center justify-center text-white text-[26px] font-bold">
            {initials(profile.name)}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#FF7A00] text-white p-1 rounded-full border-2 border-white">
            <ShieldCheck size={11} strokeWidth={3} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold text-[#0A3D0A] tracking-[-0.01em] truncate">
            {profile.name || '—'}
          </h2>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 mt-0.5 mb-2 truncate">
            <Mail size={12} className="text-[#2E7D32] shrink-0" />
            {profile.email || '—'}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 truncate">
            <Phone size={12} className="text-[#2E7D32] shrink-0" />
            {profile.phone || '—'}
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Bookings', value: requests.length },
          { label: 'Active',         value: upcoming.length },
          { label: 'Completed',      value: history.filter(r => r.status === 'completed').length },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-[20px] p-4 flex flex-col items-center shadow-sm">
            <span className="text-[22px] font-bold text-[#0A3D0A]">{stat.value}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 text-center">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── My Bookings ── */}
      <section className="mb-7">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[18px] font-bold text-[#0A3D0A] tracking-[-0.01em]">My Bookings</h2>
          <button onClick={() => navigate('requests')}
            className="text-[#2E7D32] text-[12px] font-bold flex items-center gap-1 active:opacity-70">
            View All <ChevronRight size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-4 px-1">
          {[['upcoming', 'Upcoming'], ['history', 'History']].map(([key, label]) => (
            <button key={key} onClick={() => setReqTab(key)}
              className={`text-[13px] font-bold pb-2 px-1 border-b-2 transition-colors ${
                reqTab === key ? 'text-[#2E7D32] border-[#2E7D32]' : 'text-gray-400 border-transparent'
              }`}>
              {label}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                reqTab === key ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-gray-100 text-gray-400'
              }`}>
                {key === 'upcoming' ? upcoming.length : history.length}
              </span>
            </button>
          ))}
        </div>

        {loadingReqs ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-[2.5px] border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-[13px] font-medium text-gray-500">
              {reqTab === 'upcoming' ? 'No upcoming bookings' : 'No booking history yet'}
            </p>
            {reqTab === 'upcoming' && (
              <button onClick={() => navigate('services')}
                className="mt-4 bg-[#FF7A00] text-white px-5 py-2.5 rounded-[12px] text-[13px] font-bold active:scale-95 transition-transform">
                Book a Service
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.slice(0, 3).map(req => {
              const chip = STATUS_CHIP[req.status] || STATUS_CHIP.pending;
              return (
                <button key={req.id} onClick={() => navigate('requests')}
                  className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex items-center gap-3 text-left active:scale-[0.98] transition-transform w-full">
                  <div className="w-11 h-11 bg-[#E8F5E9] text-[#2E7D32] rounded-[14px] flex items-center justify-center shrink-0">
                    <CalendarDays size={20} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <b className="text-[14px] text-[#0A3D0A] font-bold truncate pr-2">{req.title}</b>
                      <span style={{ background: chip.bg, color: chip.color }}
                        className="text-[9px] font-bold px-2 py-1 rounded-md shrink-0">
                        {chip.label}
                      </span>
                    </div>
                    {req.professional_name && (
                      <p className="text-[11px] text-gray-500 mb-1">
                        with <strong className="text-gray-700">{req.professional_name}</strong>
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      {req.requested_at && (
                        <>
                          <span className="flex items-center gap-1">
                            <CalendarDays size={11} />
                            {new Date(req.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock3 size={11} />
                            {new Date(req.requested_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </button>
              );
            })}
            {shown.length > 3 && (
              <button onClick={() => navigate('requests')}
                className="text-center text-[13px] font-bold text-[#2E7D32] py-3 active:opacity-70">
                View {shown.length - 3} more →
              </button>
            )}
          </div>
        )}
      </section>

      {/* ── Settings Menu ── */}
      <section className="mb-8">
        <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Account Settings</h2>
        <div className="flex flex-col gap-2.5">
          {settingsMenu.map(([Icon, label, subtitle], i) => (
            <button key={label}
              className="flex items-center bg-white p-3.5 rounded-[16px] shadow-sm border border-gray-100 text-left active:scale-[0.98] transition-transform">
              <div className="w-10 h-10 bg-[#E8F5E9] text-[#2E7D32] rounded-[12px] flex items-center justify-center shrink-0 mr-3">
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <b className="text-[14px] text-[#0A3D0A] flex items-center gap-2">
                  {label}
                  {i === 3 && <em className="bg-[#FF7A00] text-white text-[8px] px-1.5 py-0.5 rounded font-bold not-italic">NEW</em>}
                </b>
                {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>
      </section>

      {/* ── Logout ── */}
      <button
        onClick={onLogout}
        className="w-full h-[52px] bg-white text-red-500 border-2 border-red-100 rounded-[16px] text-[14px] font-bold flex items-center justify-center gap-2 mb-6 active:scale-[0.98] transition-transform">
        <LogOut size={18} /> Sign Out
      </button>

      <p className="text-center text-[9px] font-bold text-gray-400 tracking-[0.15em] uppercase">
        SEVA V2.4.0 • POWERED BY REAL-TIME DATA
      </p>
    </div>
  );
}
